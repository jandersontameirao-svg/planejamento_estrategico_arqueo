import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { balanco_patrimonial_dados, balanco_patrimonial_uploads } from "../../drizzle/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// Indicadores financeiros
interface IndicadoresFinanceiros {
  ativoTotal: number;
  passivoTotal: number;
  patrimonioLiquido: number;
  liquidezCorrente: number;
  solvencia: number;
  endividamento: number;
  roa: number;
  roe: number;
}

function toNum(val: any): number {
  if (typeof val === "string") return parseFloat(val) || 0;
  return val || 0;
}

function calcularIndicadores(dados: any): IndicadoresFinanceiros {
  const ativoTotal =
    toNum(dados.ativoTangivel) +
    toNum(dados.ativoIntangivel) -
    toNum(dados.amortizacao) +
    toNum(dados.clientes) +
    toNum(dados.outrosAtivosFinanceiros) +
    toNum(dados.outrosAtivosCorrentes) +
    toNum(dados.caixaBancos);

  const passivoTotal =
    toNum(dados.emprestimosObtidos) +
    toNum(dados.provisoes) +
    toNum(dados.fornecedores) +
    toNum(dados.outrosPassivosFinanceiros) +
    toNum(dados.impostosAPagar) +
    toNum(dados.outrasContasAPagar) +
    toNum(dados.outrosPassivosCorrentes);

  const patrimonioLiquido =
    toNum(dados.capitalSocial) +
    toNum(dados.reservas) +
    toNum(dados.prestacoesSupplementares) +
    toNum(dados.resultadosTransitados) +
    toNum(dados.resultadoLiquidoExercicio);

  const ativosCorrentes = toNum(dados.clientes) + toNum(dados.outrosAtivosCorrentes) + toNum(dados.caixaBancos);
  const passivosCorrentes =
    toNum(dados.fornecedores) +
    toNum(dados.outrosPassivosFinanceiros) +
    toNum(dados.impostosAPagar) +
    toNum(dados.outrasContasAPagar) +
    toNum(dados.outrosPassivosCorrentes);

  const liquidezCorrente = passivosCorrentes > 0 ? ativosCorrentes / passivosCorrentes : 0;
  const solvencia = ativoTotal > 0 ? patrimonioLiquido / ativoTotal : 0;
  const endividamento = patrimonioLiquido > 0 ? passivoTotal / patrimonioLiquido : 0;
  const roa = ativoTotal > 0 ? toNum(dados.resultadoLiquidoExercicio) / ativoTotal : 0;
  const roe = patrimonioLiquido > 0 ? toNum(dados.resultadoLiquidoExercicio) / patrimonioLiquido : 0;

  return { ativoTotal, passivoTotal, patrimonioLiquido, liquidezCorrente, solvencia, endividamento, roa, roe };
}

export const balanceRouter = router({
  // Obter dados de um período
  getDados: protectedProcedure
    .input(z.object({ empresaId: z.number(), ano: z.number(), mes: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const dados = await db
        .select()
        .from(balanco_patrimonial_dados)
        .where(
          and(
            eq(balanco_patrimonial_dados.empresaId, input.empresaId),
            eq(balanco_patrimonial_dados.ano, input.ano),
            eq(balanco_patrimonial_dados.mes, input.mes)
          )
        )
        .limit(1);
      if (!dados || dados.length === 0) return null;
      return { ...dados[0], indicadores: calcularIndicadores(dados[0]) };
    }),

  // Obter dados consolidados de um ano
  getDadosConsolidados: protectedProcedure
    .input(z.object({ empresaId: z.number(), ano: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const dados = await db
        .select()
        .from(balanco_patrimonial_dados)
        .where(and(eq(balanco_patrimonial_dados.empresaId, input.empresaId), eq(balanco_patrimonial_dados.ano, input.ano)))
        .orderBy(balanco_patrimonial_dados.mes);
      return dados.map((d: any) => ({ ...d, indicadores: calcularIndicadores(d) }));
    }),

  // Comparativo entre anos
  getComparativo: protectedProcedure
    .input(z.object({ empresaId: z.number(), anos: z.array(z.number()), mes: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const dados = await db
        .select()
        .from(balanco_patrimonial_dados)
        .where(
          and(
            eq(balanco_patrimonial_dados.empresaId, input.empresaId),
            input.anos.length > 0 ? inArray(balanco_patrimonial_dados.ano, input.anos) : undefined,
            input.mes ? eq(balanco_patrimonial_dados.mes, input.mes) : undefined
          )
        )
        .orderBy(balanco_patrimonial_dados.ano, balanco_patrimonial_dados.mes);
      return dados.map((d: any) => ({ ...d, indicadores: calcularIndicadores(d) }));
    }),

  // Salvar/atualizar dados
  salvarDados: protectedProcedure
    .input(
      z.object({
        empresaId: z.number(),
        ano: z.number(),
        mes: z.number(),
        ativoTangivel: z.number().default(0),
        ativoIntangivel: z.number().default(0),
        amortizacao: z.number().default(0),
        clientes: z.number().default(0),
        outrosAtivosFinanceiros: z.number().default(0),
        outrosAtivosCorrentes: z.number().default(0),
        caixaBancos: z.number().default(0),
        emprestimosObtidos: z.number().default(0),
        provisoes: z.number().default(0),
        fornecedores: z.number().default(0),
        outrosPassivosFinanceiros: z.number().default(0),
        impostosAPagar: z.number().default(0),
        outrasContasAPagar: z.number().default(0),
        outrosPassivosCorrentes: z.number().default(0),
        capitalSocial: z.number().default(0),
        reservas: z.number().default(0),
        prestacoesSupplementares: z.number().default(0),
        resultadosTransitados: z.number().default(0),
        resultadoLiquidoExercicio: z.number().default(0),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const existing = await db
        .select()
        .from(balanco_patrimonial_dados)
        .where(
          and(
            eq(balanco_patrimonial_dados.empresaId, input.empresaId),
            eq(balanco_patrimonial_dados.ano, input.ano),
            eq(balanco_patrimonial_dados.mes, input.mes)
          )
        )
        .limit(1);

      if (existing && existing.length > 0) {
        await db
          .update(balanco_patrimonial_dados)
          .set({
            ativoTangivel: input.ativoTangivel,
            ativoIntangivel: input.ativoIntangivel,
            amortizacao: input.amortizacao,
            clientes: input.clientes,
            outrosAtivosFinanceiros: input.outrosAtivosFinanceiros,
            outrosAtivosCorrentes: input.outrosAtivosCorrentes,
            caixaBancos: input.caixaBancos,
            emprestimosObtidos: input.emprestimosObtidos,
            provisoes: input.provisoes,
            fornecedores: input.fornecedores,
            outrosPassivosFinanceiros: input.outrosPassivosFinanceiros,
            impostosAPagar: input.impostosAPagar,
            outrasContasAPagar: input.outrasContasAPagar,
            outrosPassivosCorrentes: input.outrosPassivosCorrentes,
            capitalSocial: input.capitalSocial,
            reservas: input.reservas,
            prestacoesSupplementares: input.prestacoesSupplementares,
            resultadosTransitados: input.resultadosTransitados,
            resultadoLiquidoExercicio: input.resultadoLiquidoExercicio,
            observacoes: input.observacoes,
            atualizadoPor: ctx.user?.id,
            atualizadoPorNome: ctx.user?.name,
            updatedAt: new Date(),
          })
          .where(eq(balanco_patrimonial_dados.id, existing[0].id));
      } else {
        await db.insert(balanco_patrimonial_dados).values({
          empresaId: input.empresaId,
          ano: input.ano,
          mes: input.mes,
          ativoTangivel: input.ativoTangivel,
          ativoIntangivel: input.ativoIntangivel,
          amortizacao: input.amortizacao,
          clientes: input.clientes,
          outrosAtivosFinanceiros: input.outrosAtivosFinanceiros,
          outrosAtivosCorrentes: input.outrosAtivosCorrentes,
          caixaBancos: input.caixaBancos,
          emprestimosObtidos: input.emprestimosObtidos,
          provisoes: input.provisoes,
          fornecedores: input.fornecedores,
          outrosPassivosFinanceiros: input.outrosPassivosFinanceiros,
          impostosAPagar: input.impostosAPagar,
          outrasContasAPagar: input.outrasContasAPagar,
          outrosPassivosCorrentes: input.outrosPassivosCorrentes,
          capitalSocial: input.capitalSocial,
          reservas: input.reservas,
          prestacoesSupplementares: input.prestacoesSupplementares,
          resultadosTransitados: input.resultadosTransitados,
          resultadoLiquidoExercicio: input.resultadoLiquidoExercicio,
          observacoes: input.observacoes,
          criadoPor: ctx.user?.id,
          criadoPorNome: ctx.user?.name,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
      }

      return { success: true };
    }),

  // Registrar upload
  registrarUpload: protectedProcedure
    .input(z.object({ empresaId: z.number(), ano: z.number(), nomeArquivo: z.string(), tipoArquivo: z.enum(["pdf", "xlsx", "xls"]), urlArquivo: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const result = await db.insert(balanco_patrimonial_uploads).values({
        empresaId: input.empresaId,
        ano: input.ano,
        nomeArquivo: input.nomeArquivo,
        tipoArquivo: input.tipoArquivo,
        urlArquivo: input.urlArquivo,
        status: "processando",
        criadoPor: ctx.user?.id,
        criadoPorNome: ctx.user?.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      return { uploadId: (result as any).insertId, status: "processando" };
    }),

  // Processar arquivo com IA
  processarArquivo: protectedProcedure
    .input(z.object({ uploadId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const uploads = await db.select().from(balanco_patrimonial_uploads).where(eq(balanco_patrimonial_uploads.id, input.uploadId)).limit(1);
      if (!uploads || uploads.length === 0) throw new Error("Upload não encontrado");
      const upload = uploads[0];

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "Você é um especialista em análise de balanços patrimoniais. Extraia os dados do balanço patrimonial fornecido e retorne um JSON com os campos: ativoTangivel, ativoIntangivel, amortizacao, clientes, outrosAtivosFinanceiros, outrosAtivosCorrentes, caixaBancos, emprestimosObtidos, provisoes, fornecedores, outrosPassivosFinanceiros, impostosAPagar, outrasContasAPagar, outrosPassivosCorrentes, capitalSocial, reservas, prestacoesSupplementares, resultadosTransitados, resultadoLiquidoExercicio.",
            },
            { role: "user", content: `Extraia os dados do balanço patrimonial do arquivo: ${upload.urlArquivo}` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "balanco_patrimonial",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  ativoTangivel: { type: "number" },
                  ativoIntangivel: { type: "number" },
                  amortizacao: { type: "number" },
                  clientes: { type: "number" },
                  outrosAtivosFinanceiros: { type: "number" },
                  outrosAtivosCorrentes: { type: "number" },
                  caixaBancos: { type: "number" },
                  emprestimosObtidos: { type: "number" },
                  provisoes: { type: "number" },
                  fornecedores: { type: "number" },
                  outrosPassivosFinanceiros: { type: "number" },
                  impostosAPagar: { type: "number" },
                  outrasContasAPagar: { type: "number" },
                  outrosPassivosCorrentes: { type: "number" },
                  capitalSocial: { type: "number" },
                  reservas: { type: "number" },
                  prestacoesSupplementares: { type: "number" },
                  resultadosTransitados: { type: "number" },
                  resultadoLiquidoExercicio: { type: "number" },
                },
                required: [
                  "ativoTangivel",
                  "ativoIntangivel",
                  "amortizacao",
                  "clientes",
                  "outrosAtivosFinanceiros",
                  "outrosAtivosCorrentes",
                  "caixaBancos",
                  "emprestimosObtidos",
                  "provisoes",
                  "fornecedores",
                  "outrosPassivosFinanceiros",
                  "impostosAPagar",
                  "outrasContasAPagar",
                  "outrosPassivosCorrentes",
                  "capitalSocial",
                  "reservas",
                  "prestacoesSupplementares",
                  "resultadosTransitados",
                  "resultadoLiquidoExercicio",
                ],
                additionalProperties: false,
              },
            },
          },
        });

        const msgContent = response.choices[0].message.content;
        const contentStr = typeof msgContent === "string" ? msgContent : JSON.stringify(msgContent);
        const dadosExtraidos = JSON.parse(contentStr || "{}");

        await db
          .update(balanco_patrimonial_uploads)
          .set({ dadosExtraidos: dadosExtraidos, status: "revisao", atualizadoPor: ctx.user?.id, atualizadoPorNome: ctx.user?.name, updatedAt: new Date() } as any)
          .where(eq(balanco_patrimonial_uploads.id, input.uploadId));

        return { status: "revisao", dadosExtraidos };
      } catch (error) {
        await db
          .update(balanco_patrimonial_uploads)
          .set({ status: "erro", mensagemErro: String(error), atualizadoPor: ctx.user?.id, atualizadoPorNome: ctx.user?.name, updatedAt: new Date() } as any)
          .where(eq(balanco_patrimonial_uploads.id, input.uploadId));
        throw error;
      }
    }),

  // Confirmar importação
  confirmarImportacao: protectedProcedure
    .input(z.object({ uploadId: z.number(), mes: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const uploads = await db.select().from(balanco_patrimonial_uploads).where(eq(balanco_patrimonial_uploads.id, input.uploadId)).limit(1);
      if (!uploads || uploads.length === 0 || !uploads[0].dadosExtraidos) throw new Error("Upload ou dados não encontrados");

      const upload = uploads[0];
      const dados = upload.dadosExtraidos as Record<string, number>;

      await db.insert(balanco_patrimonial_dados).values({
        empresaId: upload.empresaId,
        ano: upload.ano,
        mes: input.mes,
        ativoTangivel: dados.ativoTangivel || 0,
        ativoIntangivel: dados.ativoIntangivel || 0,
        amortizacao: dados.amortizacao || 0,
        clientes: dados.clientes || 0,
        outrosAtivosFinanceiros: dados.outrosAtivosFinanceiros || 0,
        outrosAtivosCorrentes: dados.outrosAtivosCorrentes || 0,
        caixaBancos: dados.caixaBancos || 0,
        emprestimosObtidos: dados.emprestimosObtidos || 0,
        provisoes: dados.provisoes || 0,
        fornecedores: dados.fornecedores || 0,
        outrosPassivosFinanceiros: dados.outrosPassivosFinanceiros || 0,
        impostosAPagar: dados.impostosAPagar || 0,
        outrasContasAPagar: dados.outrasContasAPagar || 0,
        outrosPassivosCorrentes: dados.outrosPassivosCorrentes || 0,
        capitalSocial: dados.capitalSocial || 0,
        reservas: dados.reservas || 0,
        prestacoesSupplementares: dados.prestacoesSupplementares || 0,
        resultadosTransitados: dados.resultadosTransitados || 0,
        resultadoLiquidoExercicio: dados.resultadoLiquidoExercicio || 0,
        status: "consolidado",
        criadoPor: ctx.user?.id,
        criadoPorNome: ctx.user?.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await db
        .update(balanco_patrimonial_uploads)
        .set({ status: "consolidado", confirmado: true, atualizadoPor: ctx.user?.id, atualizadoPorNome: ctx.user?.name, updatedAt: new Date() } as any)
        .where(eq(balanco_patrimonial_uploads.id, input.uploadId));

      return { success: true };
    }),

  // Obter histórico de uploads
  getUploads: protectedProcedure
    .input(z.object({ empresaId: z.number(), ano: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const uploads = await db
        .select()
        .from(balanco_patrimonial_uploads)
        .where(input.ano ? and(eq(balanco_patrimonial_uploads.empresaId, input.empresaId), eq(balanco_patrimonial_uploads.ano, input.ano)) : eq(balanco_patrimonial_uploads.empresaId, input.empresaId))
        .orderBy(desc(balanco_patrimonial_uploads.createdAt));
      return uploads;
    }),
});
