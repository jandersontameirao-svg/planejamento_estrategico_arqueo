import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  getSubcategorias,
  createSubcategoria,
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
});
