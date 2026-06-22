import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  dreDados, dreUploads, dreForecast, dreNaturezaOperacional,
  drePlanoContas, dreAuditLog, empresas,
} from "../../drizzle/schema";
import { eq, and, desc, asc, sql, inArray, between, gte, lte } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { extractWorkbookText } from "../utils/excel";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// ─── Constantes: Linhas da DRE ────────────────────────────────────────────────
export const LINHAS_DRE = [
  { id: "receita_bruta", nome: "Receita Bruta", ordem: 1, sinal: 1 },
  { id: "deducoes_receita", nome: "(-) Deduções da Receita", ordem: 2, sinal: -1 },
  { id: "receita_liquida", nome: "= Receita Líquida", ordem: 3, sinal: 1, calculada: true },
  { id: "cmv", nome: "(-) Custo das Mercadorias Vendidas", ordem: 4, sinal: -1, natureza: "produto" },
  { id: "csp", nome: "(-) Custos dos Serviços Prestados", ordem: 5, sinal: -1, natureza: "servico" },
  { id: "custos_diretos", nome: "(-) Custos Diretos", ordem: 6, sinal: -1 },
  { id: "lucro_bruto", nome: "= Lucro Bruto", ordem: 7, sinal: 1, calculada: true },
  { id: "despesas_comerciais", nome: "(-) Despesas Comerciais", ordem: 8, sinal: -1 },
  { id: "despesas_administrativas", nome: "(-) Despesas Administrativas", ordem: 9, sinal: -1 },
  { id: "despesas_pessoal", nome: "(-) Despesas com Pessoal", ordem: 10, sinal: -1 },
  { id: "outras_despesas_operacionais", nome: "(-) Outras Despesas Operacionais", ordem: 11, sinal: -1 },
  { id: "ebitda", nome: "= EBITDA", ordem: 12, sinal: 1, calculada: true },
  { id: "depreciacao_amortizacao", nome: "(-) Depreciação e Amortização", ordem: 13, sinal: -1 },
  { id: "ebit", nome: "= EBIT", ordem: 14, sinal: 1, calculada: true },
  { id: "resultado_financeiro", nome: "(+/-) Resultado Financeiro", ordem: 15, sinal: 1 },
  { id: "lucro_antes_ir", nome: "= Lucro Antes do IR/CSLL", ordem: 16, sinal: 1, calculada: true },
  { id: "impostos_lucro", nome: "(-) Impostos sobre o Lucro", ordem: 17, sinal: -1 },
  { id: "lucro_liquido", nome: "= Lucro Líquido", ordem: 18, sinal: 1, calculada: true },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcularLinhasDerivadas(dados: Record<string, number>, natureza: "produto" | "servico" | "ambos" = "ambos") {
  const r = { ...dados };
  r.receita_liquida = (r.receita_bruta || 0) - Math.abs(r.deducoes_receita || 0);
  const custoVar = natureza === "produto" ? (r.cmv || 0) : (r.csp || 0);
  r.lucro_bruto = r.receita_liquida - Math.abs(custoVar) - Math.abs(r.custos_diretos || 0);
  const despOp = Math.abs(r.despesas_comerciais || 0) + Math.abs(r.despesas_administrativas || 0)
    + Math.abs(r.despesas_pessoal || 0) + Math.abs(r.outras_despesas_operacionais || 0);
  r.ebitda = r.lucro_bruto - despOp;
  r.ebit = r.ebitda - Math.abs(r.depreciacao_amortizacao || 0);
  r.lucro_antes_ir = r.ebit + (r.resultado_financeiro || 0);
  r.lucro_liquido = r.lucro_antes_ir - Math.abs(r.impostos_lucro || 0);
  return r;
}

function calcularIndicadores(dados: Record<string, number>) {
  const rl = dados.receita_liquida || 0;
  const safe = (n: number, d: number) => d !== 0 ? (n / d) * 100 : 0;
  return {
    margemBruta: safe(dados.lucro_bruto || 0, rl),
    margemEbitda: safe(dados.ebitda || 0, rl),
    margemOperacional: safe(dados.ebit || 0, rl),
    margemLiquida: safe(dados.lucro_liquido || 0, rl),
    custosPercentual: safe(Math.abs(dados.custos_diretos || 0) + Math.abs(dados.cmv || 0) + Math.abs(dados.csp || 0), rl),
    despesasPercentual: safe(
      Math.abs(dados.despesas_comerciais || 0) + Math.abs(dados.despesas_administrativas || 0)
      + Math.abs(dados.despesas_pessoal || 0) + Math.abs(dados.outras_despesas_operacionais || 0), rl
    ),
    resultadoFinanceiroPercentual: safe(dados.resultado_financeiro || 0, rl),
  };
}

async function registrarAudit(db: any, params: {
  entidade: string; entidadeId?: number; acao: string; descricao: string;
  dadosAnteriores?: any; dadosNovos?: any; usuarioId: number; usuarioNome?: string;
}) {
  await db.insert(dreAuditLog).values({
    entidade: params.entidade,
    entidadeId: params.entidadeId,
    acao: params.acao as any,
    descricao: params.descricao,
    dadosAnteriores: params.dadosAnteriores,
    dadosNovos: params.dadosNovos,
    usuarioId: params.usuarioId,
    usuarioNome: params.usuarioNome || "",
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const dreRouter = router({

  // ── Linhas DRE (constantes) ──────────────────────────────────────────────
  getLinhasDre: protectedProcedure.query(() => LINHAS_DRE),

  // ── Natureza operacional ─────────────────────────────────────────────────
  getNatureza: protectedProcedure
    .input(z.object({ empresaId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const rows = await db.select().from(dreNaturezaOperacional)
        .where(eq(dreNaturezaOperacional.empresaId, input.empresaId));
      if (rows.length > 0) return rows[0];
      // Default: busca empresa para determinar
      const emp = await db.select().from(empresas).where(eq(empresas.id, input.empresaId));
      const nome = emp[0]?.nome?.toLowerCase() || "";
      const natureza = nome.includes("vinho") ? "produto" : "servico";
      return { empresaId: input.empresaId, natureza, definidoPor: "sistema" };
    }),

  getNaturezaTodas: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    const rows = await db.select({
      empresaId: empresas.id,
      empresaNome: empresas.nome,
      natureza: dreNaturezaOperacional.natureza,
    }).from(empresas)
      .leftJoin(dreNaturezaOperacional, eq(empresas.id, dreNaturezaOperacional.empresaId));
    return rows.map(r => ({
      ...r,
      natureza: r.natureza || (r.empresaNome?.toLowerCase().includes("vinho") ? "produto" : "servico"),
    }));
  }),

  setNatureza: protectedProcedure
    .input(z.object({ empresaId: z.number(), natureza: z.enum(["produto", "servico"]) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      if (ctx.user.role !== "admin") throw new Error("Apenas administradores podem alterar a natureza operacional");
      const existing = await db.select().from(dreNaturezaOperacional)
        .where(eq(dreNaturezaOperacional.empresaId, input.empresaId));
      if (existing.length > 0) {
        await db.update(dreNaturezaOperacional)
          .set({ natureza: input.natureza, definidoPor: ctx.user.name || "admin" })
          .where(eq(dreNaturezaOperacional.empresaId, input.empresaId));
      } else {
        await db.insert(dreNaturezaOperacional).values({
          empresaId: input.empresaId, natureza: input.natureza, definidoPor: ctx.user.name || "admin",
        });
      }
      await registrarAudit(db, {
        entidade: "dre_natureza", entidadeId: input.empresaId, acao: "editar",
        descricao: `Natureza alterada para ${input.natureza}`,
        dadosAnteriores: existing[0] || null,
        dadosNovos: { natureza: input.natureza },
        usuarioId: ctx.user.id, usuarioNome: ctx.user.name || "",
      });
      return { success: true };
    }),

  // ── Dados DRE (CRUD) ────────────────────────────────────────────────────
  getDados: protectedProcedure
    .input(z.object({
      empresaId: z.number().optional(),
      ano: z.number(),
      mes: z.number().optional(),
      tipoLancamento: z.enum(["realizado", "orcado", "projetado", "forecast"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const conditions: any[] = [eq(dreDados.ano, input.ano)];
      if (input.empresaId) conditions.push(eq(dreDados.empresaId, input.empresaId));
      if (input.mes) conditions.push(eq(dreDados.mes, input.mes));
      if (input.tipoLancamento) conditions.push(eq(dreDados.tipoLancamento, input.tipoLancamento));
      return await db.select().from(dreDados).where(and(...conditions)).orderBy(asc(dreDados.mes));
    }),

  getDadosConsolidados: protectedProcedure
    .input(z.object({
      empresaId: z.number().optional(),
      ano: z.number(),
      tipoLancamento: z.enum(["realizado", "orcado", "projetado", "forecast"]).default("realizado"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const conditions: any[] = [
        eq(dreDados.ano, input.ano),
        eq(dreDados.tipoLancamento, input.tipoLancamento),
      ];
      if (input.empresaId) conditions.push(eq(dreDados.empresaId, input.empresaId));
      const rows = await db.select({
        linhaDre: dreDados.linhaDre,
        mes: dreDados.mes,
        total: sql<string>`SUM(${dreDados.valor})`,
      }).from(dreDados)
        .where(and(...conditions))
        .groupBy(dreDados.linhaDre, dreDados.mes)
        .orderBy(asc(dreDados.mes));
      // Organizar por mês
      const porMes: Record<number, Record<string, number>> = {};
      for (const row of rows) {
        if (!porMes[row.mes]) porMes[row.mes] = {};
        porMes[row.mes][row.linhaDre] = parseFloat(row.total || "0");
      }
      // Calcular linhas derivadas por mês
      const resultado: Record<number, Record<string, number>> = {};
      for (const [mes, dados] of Object.entries(porMes)) {
        resultado[Number(mes)] = calcularLinhasDerivadas(dados);
      }
      // Acumulado anual
      const acumulado: Record<string, number> = {};
      for (const dados of Object.values(resultado)) {
        for (const [key, val] of Object.entries(dados)) {
          acumulado[key] = (acumulado[key] || 0) + val;
        }
      }
      const acumuladoCalc = calcularLinhasDerivadas(acumulado);
      return { porMes: resultado, acumulado: acumuladoCalc, indicadores: calcularIndicadores(acumuladoCalc) };
    }),

  salvarDados: protectedProcedure
    .input(z.object({
      empresaId: z.number(),
      ano: z.number(),
      mes: z.number(),
      tipoLancamento: z.enum(["realizado", "orcado", "projetado", "forecast"]),
      linhas: z.array(z.object({
        linhaDre: z.string(),
        valor: z.number(),
        descricao: z.string().optional(),
        contaId: z.number().optional(),
        centroCusto: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      // Remove dados anteriores do mesmo período/tipo
      await db.delete(dreDados).where(and(
        eq(dreDados.empresaId, input.empresaId),
        eq(dreDados.ano, input.ano),
        eq(dreDados.mes, input.mes),
        eq(dreDados.tipoLancamento, input.tipoLancamento),
      ));
      // Insere novos
      if (input.linhas.length > 0) {
        await db.insert(dreDados).values(input.linhas.map(l => ({
          empresaId: input.empresaId,
          ano: input.ano,
          mes: input.mes,
          tipoLancamento: input.tipoLancamento,
          linhaDre: l.linhaDre,
          valor: String(l.valor),
          descricao: l.descricao,
          contaId: l.contaId,
          centroCusto: l.centroCusto,
        })));
      }
      await registrarAudit(db, {
        entidade: "dre_dados", acao: "editar",
        descricao: `Dados ${input.tipoLancamento} salvos para ${input.mes}/${input.ano}`,
        dadosNovos: { linhas: input.linhas.length },
        usuarioId: ctx.user.id, usuarioNome: ctx.user.name || "",
      });
      return { success: true, linhas: input.linhas.length };
    }),

  // ── Upload e processamento ──────────────────────────────────────────────
  registrarUpload: protectedProcedure
    .input(z.object({
      empresaId: z.number(),
      nomeArquivo: z.string(),
      tipoArquivo: z.string(),
      tamanhoBytes: z.number().optional(),
      urlArquivo: z.string(),
      s3Key: z.string().optional(),
      periodo: z.string().optional(),
      ano: z.number().optional(),
      mes: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [result] = await db.insert(dreUploads).values({
        empresaId: input.empresaId,
        nomeArquivo: input.nomeArquivo,
        tipoArquivo: input.tipoArquivo,
        tamanhoBytes: input.tamanhoBytes,
        urlArquivo: input.urlArquivo,
        s3Key: input.s3Key,
        periodo: input.periodo,
        ano: input.ano,
        mes: input.mes,
        status: "pendente",
        usuarioId: ctx.user.id,
        usuarioNome: ctx.user.name || "",
      });
      await registrarAudit(db, {
        entidade: "dre_uploads", entidadeId: result.insertId, acao: "importar",
        descricao: `Upload: ${input.nomeArquivo}`,
        usuarioId: ctx.user.id, usuarioNome: ctx.user.name || "",
      });
      return { id: result.insertId, success: true };
    }),

  getUploads: protectedProcedure
    .input(z.object({ empresaId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      return await db.select().from(dreUploads)
        .where(eq(dreUploads.empresaId, input.empresaId))
        .orderBy(desc(dreUploads.createdAt));
    }),

  processarArquivo: protectedProcedure
    .input(z.object({
      uploadId: z.number(),
      arquivoBase64: z.string(),
      arquivoTipo: z.string(),
      empresaId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      // Atualizar status
      await db.update(dreUploads).set({ status: "processando" }).where(eq(dreUploads.id, input.uploadId));
      const buffer = Buffer.from(input.arquivoBase64, "base64");
      let textoExtraido = "";
      try {
        if (input.arquivoTipo === "pdf") {
          const parsed = await pdfParse(buffer);
          textoExtraido = parsed.text;
        } else if (input.arquivoTipo === "xlsx" || input.arquivoTipo === "xls") {
          textoExtraido = extractWorkbookText(buffer);
        } else {
          textoExtraido = buffer.toString("utf-8");
        }
      } catch (e: any) {
        await db.update(dreUploads).set({ status: "erro", erroMensagem: "Erro ao ler arquivo: " + e.message })
          .where(eq(dreUploads.id, input.uploadId));
        throw new Error("Erro ao ler arquivo: " + e.message);
      }
      if (!textoExtraido.trim()) {
        await db.update(dreUploads).set({ status: "erro", erroMensagem: "Não foi possível extrair texto do arquivo." })
          .where(eq(dreUploads.id, input.uploadId));
        throw new Error("Não foi possível extrair texto do arquivo.");
      }
      // Buscar natureza da empresa
      const natRows = await db.select().from(dreNaturezaOperacional)
        .where(eq(dreNaturezaOperacional.empresaId, input.empresaId));
      const empRows = await db.select().from(empresas).where(eq(empresas.id, input.empresaId));
      const empNome = empRows[0]?.nome || "";
      const natureza = natRows[0]?.natureza || (empNome.toLowerCase().includes("vinho") ? "produto" : "servico");

      const linhasRef = LINHAS_DRE.filter(l => !("calculada" in l)).map(l => `${l.id}: ${l.nome}`).join("\n");
      const prompt = `Você é um especialista em contabilidade e finanças corporativas.
Analise o conteúdo extraído de um arquivo financeiro e identifique os valores da DRE (Demonstração do Resultado do Exercício).

A empresa "${empNome}" é classificada como "${natureza}" (${natureza === "produto" ? "usa CMV - Custo das Mercadorias Vendidas" : "usa CSP - Custos dos Serviços Prestados"}).

Linhas da DRE esperadas:
${linhasRef}

Conteúdo do arquivo:
${textoExtraido.slice(0, 12000)}

Retorne APENAS um JSON válido (sem markdown) com a seguinte estrutura:
{
  "periodo": { "ano": 2025, "mes": 1 },
  "linhas": [
    { "linhaDre": "receita_bruta", "valor": 100000.00, "descricao": "Receita total de vendas" },
    { "linhaDre": "deducoes_receita", "valor": -5000.00, "descricao": "Impostos sobre vendas" }
  ],
  "resumo": "Resumo do que foi encontrado no arquivo",
  "confianca": "alta|media|baixa",
  "observacoes": "Notas sobre dados ambíguos ou faltantes"
}
Valores de custos e despesas devem ser NEGATIVOS. Receitas devem ser POSITIVAS.
Se não encontrar um valor para alguma linha, omita-a do array.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um especialista em contabilidade. Responda APENAS com JSON válido, sem markdown." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" } as any,
        });
        const rawContent = response.choices?.[0]?.message?.content ?? "{}";
        const content = typeof rawContent === "string" ? rawContent : "{}";
        const resultado = JSON.parse(content);
        await db.update(dreUploads).set({
          status: "processado",
          dadosExtraidos: resultado,
          processadoEm: new Date(),
        }).where(eq(dreUploads.id, input.uploadId));
        await registrarAudit(db, {
          entidade: "dre_uploads", entidadeId: input.uploadId, acao: "importar",
          descricao: `Arquivo processado com IA. Confiança: ${resultado.confianca || "N/A"}`,
          dadosNovos: { linhas: resultado.linhas?.length || 0 },
          usuarioId: ctx.user.id, usuarioNome: ctx.user.name || "",
        });
        return resultado;
      } catch (e: any) {
        await db.update(dreUploads).set({ status: "erro", erroMensagem: "Erro no processamento IA: " + e.message })
          .where(eq(dreUploads.id, input.uploadId));
        throw new Error("Erro no processamento: " + e.message);
      }
    }),

  confirmarImportacao: protectedProcedure
    .input(z.object({
      uploadId: z.number(),
      empresaId: z.number(),
      ano: z.number(),
      mes: z.number(),
      tipoLancamento: z.enum(["realizado", "orcado", "projetado", "forecast"]).default("realizado"),
      linhas: z.array(z.object({
        linhaDre: z.string(),
        valor: z.number(),
        descricao: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      // Verificar duplicidade
      const existing = await db.select({ count: sql<number>`COUNT(*)` }).from(dreDados)
        .where(and(
          eq(dreDados.empresaId, input.empresaId),
          eq(dreDados.ano, input.ano),
          eq(dreDados.mes, input.mes),
          eq(dreDados.tipoLancamento, input.tipoLancamento),
          eq(dreDados.uploadId, input.uploadId),
        ));
      if (Number(existing[0]?.count) > 0) {
        throw new Error("Dados deste upload já foram consolidados para este período.");
      }
      // Inserir dados
      if (input.linhas.length > 0) {
        await db.insert(dreDados).values(input.linhas.map(l => ({
          empresaId: input.empresaId,
          ano: input.ano,
          mes: input.mes,
          tipoLancamento: input.tipoLancamento,
          linhaDre: l.linhaDre,
          valor: String(l.valor),
          descricao: l.descricao,
          uploadId: input.uploadId,
        })));
      }
      // Atualizar upload
      await db.update(dreUploads).set({
        status: "consolidado",
        dadosRevisados: { linhas: input.linhas },
        revisadoEm: new Date(),
        consolidadoEm: new Date(),
        ano: input.ano,
        mes: input.mes,
      }).where(eq(dreUploads.id, input.uploadId));
      await registrarAudit(db, {
        entidade: "dre_dados", acao: "consolidar",
        descricao: `Importação consolidada: ${input.linhas.length} linhas para ${input.mes}/${input.ano}`,
        dadosNovos: { uploadId: input.uploadId, linhas: input.linhas.length },
        usuarioId: ctx.user.id, usuarioNome: ctx.user.name || "",
      });
      return { success: true, linhas: input.linhas.length };
    }),

  // ── Forecast ────────────────────────────────────────────────────────────
  getForecast: protectedProcedure
    .input(z.object({
      empresaId: z.number(),
      ano: z.number(),
      cenario: z.enum(["conservador", "base", "otimista"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const conditions: any[] = [
        eq(dreForecast.empresaId, input.empresaId),
        eq(dreForecast.ano, input.ano),
      ];
      if (input.cenario) conditions.push(eq(dreForecast.cenario, input.cenario));
      return await db.select().from(dreForecast)
        .where(and(...conditions))
        .orderBy(asc(dreForecast.mes), asc(dreForecast.cenario));
    }),

  salvarForecast: protectedProcedure
    .input(z.object({
      empresaId: z.number(),
      ano: z.number(),
      cenario: z.enum(["conservador", "base", "otimista"]),
      linhas: z.array(z.object({
        mes: z.number(),
        linhaDre: z.string(),
        valor: z.number(),
        premissa: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      // Buscar versão atual
      const versaoRows = await db.select({ maxVer: sql<number>`MAX(${dreForecast.versao})` })
        .from(dreForecast)
        .where(and(
          eq(dreForecast.empresaId, input.empresaId),
          eq(dreForecast.ano, input.ano),
          eq(dreForecast.cenario, input.cenario),
        ));
      const novaVersao = (Number(versaoRows[0]?.maxVer) || 0) + 1;
      // NÃO apaga versões anteriores (mantém histórico)
      if (input.linhas.length > 0) {
        await db.insert(dreForecast).values(input.linhas.map(l => ({
          empresaId: input.empresaId,
          ano: input.ano,
          mes: l.mes,
          cenario: input.cenario,
          linhaDre: l.linhaDre,
          valor: String(l.valor),
          premissa: l.premissa,
          versao: novaVersao,
          criadoPor: ctx.user.id,
          criadoPorNome: ctx.user.name || "",
        })));
      }
      await registrarAudit(db, {
        entidade: "dre_forecast", acao: "forecast",
        descricao: `Forecast ${input.cenario} v${novaVersao} salvo para ${input.ano}`,
        dadosNovos: { cenario: input.cenario, versao: novaVersao, linhas: input.linhas.length },
        usuarioId: ctx.user.id, usuarioNome: ctx.user.name || "",
      });
      return { success: true, versao: novaVersao };
    }),

  // ── Comparativo ─────────────────────────────────────────────────────────
  getComparativo: protectedProcedure
    .input(z.object({
      empresaId: z.number().optional(),
      ano: z.number(),
      anoAnterior: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const buscar = async (ano: number, tipo: string) => {
        const conditions: any[] = [eq(dreDados.ano, ano), eq(dreDados.tipoLancamento, tipo as any)];
        if (input.empresaId) conditions.push(eq(dreDados.empresaId, input.empresaId));
        const rows = await db.select({
          linhaDre: dreDados.linhaDre,
          total: sql<string>`SUM(${dreDados.valor})`,
        }).from(dreDados).where(and(...conditions)).groupBy(dreDados.linhaDre);
        const map: Record<string, number> = {};
        for (const r of rows) map[r.linhaDre] = parseFloat(r.total || "0");
        return calcularLinhasDerivadas(map);
      };
      const realizado = await buscar(input.ano, "realizado");
      const orcado = await buscar(input.ano, "orcado");
      const projetado = await buscar(input.ano, "projetado");
      const anterior = input.anoAnterior ? await buscar(input.anoAnterior, "realizado") : {};
      return {
        realizado, orcado, projetado, anterior,
        indicadoresRealizado: calcularIndicadores(realizado),
        indicadoresOrcado: calcularIndicadores(orcado),
      };
    }),

  // ── Consolidado do Grupo ────────────────────────────────────────────────
  getConsolidadoGrupo: protectedProcedure
    .input(z.object({ ano: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      // Buscar todas as empresas com seus dados
      const allEmpresas = await db.select().from(empresas);
      const rows = await db.select({
        empresaId: dreDados.empresaId,
        linhaDre: dreDados.linhaDre,
        total: sql<string>`SUM(${dreDados.valor})`,
      }).from(dreDados)
        .where(and(eq(dreDados.ano, input.ano), eq(dreDados.tipoLancamento, "realizado")))
        .groupBy(dreDados.empresaId, dreDados.linhaDre);
      // Agrupar por empresa
      const porEmpresa: Record<number, Record<string, number>> = {};
      for (const r of rows) {
        if (!porEmpresa[r.empresaId]) porEmpresa[r.empresaId] = {};
        porEmpresa[r.empresaId][r.linhaDre] = parseFloat(r.total || "0");
      }
      // Calcular por empresa
      const empresasResult = allEmpresas.map(emp => {
        const dados = porEmpresa[emp.id] || {};
        const calc = calcularLinhasDerivadas(dados);
        return {
          empresaId: emp.id,
          empresaNome: emp.nome,
          dados: calc,
          indicadores: calcularIndicadores(calc),
        };
      }).filter(e => Object.keys(e.dados).some(k => e.dados[k] !== 0));
      // Consolidado total
      const totalMap: Record<string, number> = {};
      for (const e of empresasResult) {
        for (const [k, v] of Object.entries(e.dados)) {
          totalMap[k] = (totalMap[k] || 0) + v;
        }
      }
      const totalCalc = calcularLinhasDerivadas(totalMap);
      return {
        empresas: empresasResult,
        consolidado: totalCalc,
        indicadores: calcularIndicadores(totalCalc),
      };
    }),

  // ── Análise Estratégica (IA) ────────────────────────────────────────────
  gerarAnaliseEstrategica: protectedProcedure
    .input(z.object({
      empresaId: z.number().optional(),
      ano: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      // Buscar dados
      const conditions: any[] = [eq(dreDados.ano, input.ano), eq(dreDados.tipoLancamento, "realizado")];
      if (input.empresaId) conditions.push(eq(dreDados.empresaId, input.empresaId));
      const rows = await db.select({
        empresaId: dreDados.empresaId,
        linhaDre: dreDados.linhaDre,
        mes: dreDados.mes,
        total: sql<string>`SUM(${dreDados.valor})`,
      }).from(dreDados).where(and(...conditions)).groupBy(dreDados.empresaId, dreDados.linhaDre, dreDados.mes);
      if (rows.length === 0) return { analise: "Sem dados disponíveis para análise." };
      const dadosStr = JSON.stringify(rows.slice(0, 200));
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Você é um consultor financeiro estratégico do Grupo Arqueo. Analise os dados da DRE e forneça insights acionáveis em português. Seja direto e objetivo." },
          { role: "user", content: `Analise os dados da DRE do ano ${input.ano}${input.empresaId ? ` (empresa ${input.empresaId})` : " (consolidado do grupo)"}:
${dadosStr}

Responda de forma estruturada:
1. ONDE a margem está sendo criada
2. ONDE a margem está sendo destruída
3. Quais empresas/linhas são mais rentáveis
4. Quais contas estão pressionando o lucro
5. Tendências que exigem atenção
6. Recomendações estratégicas` },
        ],
      });
      return { analise: response.choices?.[0]?.message?.content || "Análise indisponível." };
    }),

  // ── Plano de Contas ─────────────────────────────────────────────────────
  getPlanoContas: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    return await db.select().from(drePlanoContas).orderBy(asc(drePlanoContas.ordem));
  }),

  salvarConta: protectedProcedure
    .input(z.object({
      id: z.number().optional(),
      codigo: z.string(),
      nome: z.string(),
      linhaDre: z.string(),
      tipo: z.enum(["receita", "deducao", "custo", "despesa", "depreciacao", "resultado_financeiro", "imposto"]),
      naturezaAplicavel: z.enum(["produto", "servico", "ambos"]).default("ambos"),
      ordem: z.number().default(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      if (input.id) {
        await db.update(drePlanoContas).set({
          codigo: input.codigo, nome: input.nome, linhaDre: input.linhaDre,
          tipo: input.tipo, naturezaAplicavel: input.naturezaAplicavel, ordem: input.ordem,
        }).where(eq(drePlanoContas.id, input.id));
        return { id: input.id };
      } else {
        const [result] = await db.insert(drePlanoContas).values({
          codigo: input.codigo, nome: input.nome, linhaDre: input.linhaDre,
          tipo: input.tipo, naturezaAplicavel: input.naturezaAplicavel, ordem: input.ordem,
        });
        return { id: result.insertId };
      }
    }),

  // ── Audit Log ───────────────────────────────────────────────────────────
  getAuditLog: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      return await db.select().from(dreAuditLog)
        .orderBy(desc(dreAuditLog.createdAt))
        .limit(input.limit);
    }),
});
