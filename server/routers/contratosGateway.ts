/**
 * Router de Contratos com Integração SGC
 * 
 * Este router adapta as procedures de leitura contratual para consumir do SGC,
 * preservando as assinaturas compatíveis com o frontend existente.
 * 
 * Procedures de leitura agora consultam o SGC como fonte oficial.
 * Procedures de escrita são marcadas como legado e bloqueadas.
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getContractsGateway } from "../integrations/contractsGateway";
import { TRPCError } from "@trpc/server";

const contractsGateway = getContractsGateway();

export const contratosGatewayRouter = router({
  /**
   * ─── PROCEDURES DE LEITURA (CONSUMEM DO SGC) ──────────────────────────
   */

  /**
   * Listar todos os contratos de uma empresa
   * Fonte: SGC
   */
  list: protectedProcedure
    .input(z.object({ empresaId: z.number().optional() }))
    .query(async ({ input }) => {
      if (!input.empresaId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "empresaId is required",
        });
      }

      const contratos = await contractsGateway.getContratosByEmpresa(input.empresaId);
      return contratos;
    }),

  /**
   * Obter contrato por ID
   * Fonte: SGC
   */
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const contrato = await contractsGateway.getContratoById(input.id);
      if (!contrato) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Contract ${input.id} not found in SGC`,
        });
      }
      return contrato;
    }),

  /**
   * Listar contratos por cliente
   * Fonte: SGC (via gateway)
   */
  listByCliente: protectedProcedure
    .input(z.object({ clienteId: z.number() }))
    .query(async ({ input }) => {
      // Gateway não tem método direto, mas pode ser adicionado
      // Por enquanto, retorna array vazio como fallback
      console.warn(
        `[ContratosGateway] listByCliente not yet implemented for clienteId ${input.clienteId}`
      );
      return [];
    }),

  /**
   * Obter marcos de um contrato
   * Fonte: SGC
   */
  marcos: protectedProcedure
    .input(z.object({ contratoId: z.number() }))
    .query(async ({ input }) => {
      const marcos = await contractsGateway.getMarcosByContrato(input.contratoId);
      return marcos;
    }),

  /**
   * Obter riscos de um contrato
   * Fonte: SGC
   */
  riscos: protectedProcedure
    .input(z.object({ contratoId: z.number() }))
    .query(async ({ input }) => {
      const riscos = await contractsGateway.getRiscosByContrato(input.contratoId);
      return riscos;
    }),

  /**
   * Obter boletins de um contrato
   * Fonte: SGC
   */
  boletins: protectedProcedure
    .input(z.object({ contratoId: z.number() }))
    .query(async ({ input }) => {
      const boletins = await contractsGateway.getBoletinsByContrato(input.contratoId);
      return boletins;
    }),

  /**
   * Obter agregação de contratos por empresa
   * Fonte: SGC
   */
  aggregate: protectedProcedure
    .input(z.object({ empresaId: z.number() }))
    .query(async ({ input }) => {
      const aggregate = await contractsGateway.getContractAggregateByEmpresa(
        input.empresaId
      );
      if (!aggregate) {
        return {
          empresaId: input.empresaId,
          totalContratos: 0,
          totalClientes: 0,
          valorTotalContratos: 0,
          contratosPorStatus: {},
          marcosPendentes: 0,
          marcosAtrasados: 0,
          riscosAbertos: 0,
          riscosAltosAbertos: 0,
          boletinsPendentes: 0,
        };
      }
      return aggregate;
    }),

  /**
   * Obter agregação de contratos para o grupo
   * Fonte: SGC
   */
  aggregateGroup: protectedProcedure.query(async () => {
    const aggregate = await contractsGateway.getContractAggregateForGroup();
    if (!aggregate) {
      return {
        totalContratos: 0,
        totalClientes: 0,
        valorTotalContratos: 0,
        empresas: [],
        marcosPendentes: 0,
        marcosAtrasados: 0,
        riscosAbertos: 0,
        riscosAltosAbertos: 0,
        boletinsPendentes: 0,
      };
    }
    return aggregate;
  }),

  /**
   * Obter alertas estratégicos
   * Fonte: SGC
   */
  alerts: protectedProcedure
    .input(z.object({ empresaId: z.number().optional() }))
    .query(async ({ input }) => {
      const alerts = await contractsGateway.getStrategicAlerts(input.empresaId);
      return alerts;
    }),

  /**
   * Obter contexto contratual completo
   * Fonte: SGC
   */
  context: protectedProcedure
    .input(z.object({ empresaId: z.number() }))
    .query(async ({ input }) => {
      const context = await contractsGateway.getContractContext(input.empresaId);
      if (!context) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch contract context for empresa ${input.empresaId}`,
        });
      }
      return context;
    }),

  /**
   * ─── PROCEDURES DE ESCRITA (BLOQUEADAS/LEGADO) ──────────────────────────
   * 
   * Estas procedures são mantidas para compatibilidade com o frontend,
   * mas não realizam operações. Toda escrita contratual deve ocorrer no SGC.
   */

  /**
   * Criar contrato - BLOQUEADO
   * Use o SGC para criar contratos
   */
  create: protectedProcedure
    .input(z.object({}).passthrough())
    .mutation(async () => {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Contract creation is now managed by SGC. Please use the SGC interface to create contracts.",
      });
    }),

  /**
   * Atualizar contrato - BLOQUEADO
   * Use o SGC para atualizar contratos
   */
  update: protectedProcedure
    .input(z.object({}).passthrough())
    .mutation(async () => {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Contract updates are now managed by SGC. Please use the SGC interface to update contracts.",
      });
    }),

  /**
   * Deletar contrato - BLOQUEADO
   * Use o SGC para deletar contratos
   */
  delete: protectedProcedure
    .input(z.object({}).passthrough())
    .mutation(async () => {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Contract deletion is now managed by SGC. Please use the SGC interface to delete contracts.",
      });
    }),

  /**
   * Limpar cache de contratos
   * Útil para sincronização manual com SGC
   */
  clearCache: protectedProcedure.mutation(async () => {
    contractsGateway.clearCache();
    return { success: true, message: "Contract cache cleared" };
  }),

  /**
   * Limpar cache de uma chave específica
   */
  clearCacheKey: protectedProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      contractsGateway.clearCacheKey(input.key);
      return { success: true, message: `Cache key '${input.key}' cleared` };
    }),
});
