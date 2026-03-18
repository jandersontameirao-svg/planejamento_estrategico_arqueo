import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import * as XLSX from "xlsx";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  getSubcategorias,
  createSubcategoria,
  updateSubcategoria,
  deleteSubcategoria,
  getVersoesByEmpresa,
  getVersaoById,
  createVersao,
  updateVersaoStatus,
  duplicarVersao,
  getLinhasPlanejadas,
  upsertLinhaPlanejada,
  deleteLinhaPlanejada,
  getExecutadoByEmpresa,
  getImportacoesByEmpresa,
  criarImportacao,
  inserirLinhasExecutado,
  getRevisoesByVersao,
  getDashboardOrcamento,
} from "../orcamento";

export const orcamentoRouter = router({
  // ── CATEGORIAS ──────────────────────────────────────────────────────────────
  getCategorias: protectedProcedure.query(async () => {
    return getCategorias();
  }),

  createCategoria: protectedProcedure
    .input(z.object({
      nome: z.string().min(1),
      descricao: z.string().optional(),
      tipo: z.enum(["receita", "custo", "despesa", "investimento", "outro"]),
      escopoTipo: z.enum(["global", "empresa"]).optional(),
      observacao: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return createCategoria(input);
    }),

  updateCategoria: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      descricao: z.string().optional(),
      tipo: z.enum(["receita", "custo", "despesa", "investimento", "outro"]).optional(),
      observacao: z.string().optional(),
      ativo: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateCategoria(id, data);
    }),

  deleteCategoria: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return deleteCategoria(input.id);
    }),

  // ── SUBCATEGORIAS ────────────────────────────────────────────────────────────
  getSubcategorias: protectedProcedure
    .input(z.object({ categoriaId: z.number().optional() }))
    .query(async ({ input }) => {
      return getSubcategorias(input.categoriaId);
    }),

  createSubcategoria: protectedProcedure
    .input(z.object({
      categoriaId: z.number(),
      nome: z.string().min(1),
      descricao: z.string().optional(),
      observacao: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return createSubcategoria(input);
    }),

  updateSubcategoria: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      descricao: z.string().optional(),
      observacao: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return updateSubcategoria(id, data);
    }),

  deleteSubcategoria: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return deleteSubcategoria(input.id);
    }),

  // ── VERSÕES ──────────────────────────────────────────────────────────────────
  getVersoesByEmpresa: protectedProcedure
    .input(z.object({ empresaId: z.number() }))
    .query(async ({ input }) => {
      return getVersoesByEmpresa(input.empresaId);
    }),

  getVersaoById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getVersaoById(input.id);
    }),

  createVersao: protectedProcedure
    .input(z.object({
      empresaId: z.number(),
      ano: z.number(),
      nomeVersao: z.string().min(1),
      moedaBase: z.string().optional(),
      observacoes: z.string().optional(),
      versaoOrigemId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return createVersao({ ...input, criadoPor: ctx.user.id });
    }),

  updateVersaoStatus: protectedProcedure
    .input(z.object({
      versaoId: z.number(),
      status: z.enum(["rascunho", "em_revisao", "aprovado", "congelado"]),
      motivo: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return updateVersaoStatus(input.versaoId, input.status, ctx.user.id, input.motivo);
    }),

  duplicarVersao: protectedProcedure
    .input(z.object({
      versaoOrigemId: z.number(),
      nomeVersao: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      return duplicarVersao(input.versaoOrigemId, input.nomeVersao, ctx.user.id);
    }),

  // ── LINHAS PLANEJADAS ────────────────────────────────────────────────────────
  getLinhasPlanejadas: protectedProcedure
    .input(z.object({ versaoId: z.number() }))
    .query(async ({ input }) => {
      return getLinhasPlanejadas(input.versaoId);
    }),

  upsertLinhaPlanejada: protectedProcedure
    .input(z.object({
      id: z.number().optional(),
      versaoId: z.number(),
      categoriaId: z.number(),
      subcategoriaId: z.number().optional(),
      descricao: z.string().optional(),
      janeiro: z.number().optional(),
      fevereiro: z.number().optional(),
      marco: z.number().optional(),
      abril: z.number().optional(),
      maio: z.number().optional(),
      junho: z.number().optional(),
      julho: z.number().optional(),
      agosto: z.number().optional(),
      setembro: z.number().optional(),
      outubro: z.number().optional(),
      novembro: z.number().optional(),
      dezembro: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      return upsertLinhaPlanejada(input);
    }),

  deleteLinhaPlanejada: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return deleteLinhaPlanejada(input.id);
    }),

  // ── EXECUTADO ────────────────────────────────────────────────────────────────
  getExecutadoByEmpresa: protectedProcedure
    .input(z.object({ empresaId: z.number(), ano: z.number() }))
    .query(async ({ input }) => {
      return getExecutadoByEmpresa(input.empresaId, input.ano);
    }),

  getImportacoesByEmpresa: protectedProcedure
    .input(z.object({ empresaId: z.number() }))
    .query(async ({ input }) => {
      return getImportacoesByEmpresa(input.empresaId);
    }),

  importarExecutado: protectedProcedure
    .input(z.object({
      empresaId: z.number(),
      ano: z.number(),
      mesReferencia: z.number().optional(),
      arquivoNome: z.string().optional(),
      moedaLote: z.string().optional(),
      linhas: z.array(z.object({
        categoriaId: z.number().optional(),
        subcategoriaId: z.number().optional(),
        dataLancamento: z.string().optional(),
        competencia: z.string().optional(),
        descricao: z.string().optional(),
        valorOriginal: z.number(),
        moedaOriginal: z.string().optional(),
        taxaCambio: z.number().optional(),
        referenciaExterna: z.string().optional(),
        documentoReferencia: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id: importacaoId } = await criarImportacao({
        empresaId: input.empresaId,
        ano: input.ano,
        mesReferencia: input.mesReferencia,
        arquivoNome: input.arquivoNome,
        moedaLote: input.moedaLote,
        importadoPor: ctx.user.id,
      });
      return inserirLinhasExecutado(importacaoId, input.empresaId, input.linhas);
    }),

  // ── REVISÕES ─────────────────────────────────────────────────────────────────
  getRevisoesByVersao: protectedProcedure
    .input(z.object({ versaoId: z.number() }))
    .query(async ({ input }) => {
      return getRevisoesByVersao(input.versaoId);
    }),

  // ── DASHBOARD ────────────────────────────────────────────────────────────────
  getDashboard: protectedProcedure
    .input(z.object({ empresaId: z.number(), ano: z.number() }))
    .query(async ({ input }) => {
      return getDashboardOrcamento(input.empresaId, input.ano);
    }),

  // ── IA: IMPORTAÇÃO INTELIGENTE ───────────────────────────────────────────────
  importarOrcamentoIA: protectedProcedure
    .input(z.object({
      empresaId: z.number(),
      ano: z.number(),
      arquivoBase64: z.string(),
      arquivoNome: z.string(),
      arquivoTipo: z.string(), // 'pdf' | 'xlsx' | 'xls' | 'csv'
    }))
    .mutation(async ({ input }) => {
      const { arquivoBase64, arquivoNome, arquivoTipo } = input;
      const buffer = Buffer.from(arquivoBase64, "base64");
      let textoExtraido = "";

      try {
        if (arquivoTipo === "pdf") {
          const parsed = await pdfParse(buffer);
          textoExtraido = parsed.text;
        } else if (arquivoTipo === "xlsx" || arquivoTipo === "xls") {
          const wb = XLSX.read(buffer, { type: "buffer" });
          const sheets = wb.SheetNames.map((name) => {
            const ws = wb.Sheets[name];
            return `=== Aba: ${name} ===\n` + XLSX.utils.sheet_to_csv(ws);
          });
          textoExtraido = sheets.join("\n\n");
        } else {
          // CSV ou texto
          textoExtraido = buffer.toString("utf-8");
        }
      } catch (e: any) {
        throw new Error("Erro ao ler arquivo: " + e.message);
      }

      if (!textoExtraido.trim()) {
        throw new Error("Não foi possível extrair texto do arquivo.");
      }

      // Buscar categorias e subcategorias existentes
      const cats = await getCategorias();
      const subcats = await getSubcategorias(undefined);
      const catsList = (cats as any[]).map((c: any) => `${c.id}:${c.nome}(${c.tipo})`).join(", ");
      const subcatsList = (subcats as any[]).map((s: any) => `${s.id}:${s.nome}(cat:${s.categoriaId})`).join(", ");

      const prompt = `Você é um especialista em análise orçamentária empresarial.

Analise o seguinte conteúdo extraído de um arquivo financeiro e identifique todos os lançamentos orçamentários.

Categorias disponíveis: ${catsList || "nenhuma cadastrada"}
Subcategorias disponíveis: ${subcatsList || "nenhuma cadastrada"}

Conteudo do arquivo (arquivo: ${arquivoNome}):
${textoExtraido.slice(0, 8000)}

Retorne um JSON com a seguinte estrutura (sem markdown, apenas JSON puro):
{
  "lancamentos": [
    {
      "descricao": "string - descrição do lançamento",
      "valor": 0,
      "competencia": "YYYY-MM",
      "tipo": "receita|custo|despesa|investimento|outro",
      "categoriaId": null,
      "categoriaNome": "string - nome da categoria sugerida",
      "subcategoriaId": null,
      "subcategoriaNome": "string - nome da subcategoria sugerida",
      "confianca": "alta|media|baixa",
      "observacao": "string - justificativa"
    }
  ],
  "resumo": "string - resumo do que foi encontrado",
  "totalItens": 0,
  "totalValor": 0
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Você é um especialista em finanças corporativas e orçamentos empresariais. Responda APENAS com JSON válido, sem markdown, sem blocos de código." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" } as any,
      });

      const rawContent = response.choices?.[0]?.message?.content ?? "{}";
      const content = typeof rawContent === "string" ? rawContent : "{}";
      let resultado: any;
      try {
        resultado = JSON.parse(content);
      } catch {
        throw new Error("IA retornou resposta inválida.");
      }

      return {
        lancamentos: resultado.lancamentos ?? [],
        resumo: resultado.resumo ?? "",
        totalItens: resultado.totalItens ?? 0,
        totalValor: resultado.totalValor ?? 0,
      };
    }),

  // ── IA: ANÁLISE DE RISCOS E PROJEÇÕES ────────────────────────────────────────
  analisarOrcamentoIA: protectedProcedure
    .input(z.object({ empresaId: z.number(), ano: z.number() }))
    .mutation(async ({ input }) => {
      const dashboard = await getDashboardOrcamento(input.empresaId, input.ano);
      const linhasPlanejadas = (dashboard as any).versaoId
        ? await getLinhasPlanejadas((dashboard as any).versaoId)
        : [];
      const linhasExecutadas = await getExecutadoByEmpresa(input.empresaId, input.ano);

      const dadosResumo = {
        totalPlanejado: (dashboard as any).totalPlanejado,
        totalExecutado: (dashboard as any).totalExecutado,
        variacao: (dashboard as any).variacao,
        percentualExecucao: (dashboard as any).percentualExecucao,
        planejadoPorMes: (dashboard as any).planejadoPorMes,
        executadoPorMes: (dashboard as any).executadoPorMes,
        totalLinhasPlanejadas: (linhasPlanejadas as any[]).length,
        totalLancamentosExecutados: (linhasExecutadas as any[]).length,
      };

      const prompt = `Você é um especialista em gestão orçamentária e finanças corporativas.

Analise os seguintes dados orçamentários do ano ${input.ano} e gere uma análise completa:

${JSON.stringify(dadosResumo, null, 2)}

Retorne um JSON com a estrutura (sem markdown, apenas JSON puro):
{
  "diagnostico": "string - diagnóstico geral em 2-3 parágrafos",
  "scoreGeral": 75,
  "riscos": [
    {
      "titulo": "string",
      "descricao": "string",
      "severidade": "alto|medio|baixo",
      "impactoEstimado": 0
    }
  ],
  "projecoes": [
    {
      "mes": "string - nome do mês",
      "valorProjetado": 0,
      "confianca": "alta|media|baixa",
      "observacao": "string"
    }
  ],
  "recomendacoes": [
    {
      "titulo": "string",
      "descricao": "string",
      "prioridade": "urgente|alta|media|baixa",
      "economiaEstimada": 0
    }
  ],
  "alertas": [
    {
      "indicador": "string",
      "valor": "string",
      "status": "critico|atencao|ok"
    }
  ]
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Você é um especialista em gestão financeira e orçamentária corporativa. Responda APENAS com JSON válido, sem markdown, sem blocos de código." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" } as any,
      });

      const rawContent2 = response.choices?.[0]?.message?.content ?? "{}";
      const content = typeof rawContent2 === "string" ? rawContent2 : "{}";
      let resultado: any;
      try {
        resultado = JSON.parse(content);
      } catch {
        throw new Error("IA retornou resposta inválida.");
      }

      return {
        diagnostico: resultado.diagnostico ?? "",
        scoreGeral: resultado.scoreGeral ?? 0,
        riscos: resultado.riscos ?? [],
        projecoes: resultado.projecoes ?? [],
        recomendacoes: resultado.recomendacoes ?? [],
        alertas: resultado.alertas ?? [],
        geradoEm: new Date().toISOString(),
      };
    }),
});
