/**
 * MÓDULO CONTRATOS — Router tRPC (SUBSTITUIÇÃO FUNCIONAL)
 *
 * Este router foi reescrito para consumir dados do SGC como fonte oficial.
 * - Todas as queries de leitura agora consultam o SGC via ContractsGateway.
 * - Todas as mutations de escrita estão bloqueadas com mensagem de redirecionamento ao SGC.
 * - As assinaturas das procedures são preservadas para compatibilidade com o frontend existente.
 * - O domínio contratual local NÃO é mais a fonte mestra.
 *
 * Montado em routers.ts como `contratos: contratosRouter`.
 */

import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getContractsGateway } from "../integrations/contractsGateway";
import { getDb } from "../db";
import { empresas } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  sgcContratoLink,
  sgcContratosListLink,
  sgcClientesListLink,
  sgcHomeLink,
  isSGCDeepLinksEnabled,
} from "../integrations/sgcDeepLinks";

const gateway = getContractsGateway();

/**
 * Resolve o sgcEmpresaId a partir do empresaId local.
 * Retorna null se a empresa não tiver mapeamento SGC configurado.
 */
async function resolveSgcEmpresaId(localEmpresaId: number): Promise<number | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select({ sgcEmpresaId: empresas.sgcEmpresaId }).from(empresas).where(eq(empresas.id, localEmpresaId)).limit(1);
    return rows[0]?.sgcEmpresaId ?? null;
  } catch {
    return null;
  }
}

/**
 * Helper: gera mensagem de bloqueio com deep link para o SGC
 */
function blockedMessage(action: string, sgcLink?: string): string {
  const base = `Esta operação (${action}) agora é gerenciada pelo SGC.`;
  if (sgcLink && isSGCDeepLinksEnabled()) {
    return `${base} Acesse: ${sgcLink}`;
  }
  return `${base} Acesse o SGC para realizar esta ação.`;
}

/**
 * Helper: lança erro FORBIDDEN para mutations bloqueadas
 */
function throwBlocked(action: string, sgcLink?: string): never {
  throw new TRPCError({
    code: "FORBIDDEN",
    message: blockedMessage(action, sgcLink),
  });
}

// ─── ROUTER ──────────────────────────────────────────────────────────────────

export const contratosRouter = router({

  // ── DASHBOARD (LEITURA VIA SGC) ──────────────────────────────────────────
  dashboard: protectedProcedure
    .input(z.object({ empresaId: z.number().optional() }))
    .query(async ({ input }) => {
      const emptyGroup = {
        totalContratos: 0,
        contratosAtivos: 0,
        valorTotalContratos: 0,
        valorRecebido: 0,
        valorPendente: 0,
        marcosAtrasados: 0,
        riscosAltos: 0,
        boletinsPendentes: 0,
        contratosPorStatus: {},
        contratosRecentes: [],
        marcosProximos: [],
      };

      if (!input.empresaId) {
        // Dashboard geral do grupo
        const agg = await gateway.getContractAggregateForGroup();
        if (!agg) return emptyGroup;
        return {
          ...emptyGroup,
          totalContratos: agg.totalContratos,
          contratosAtivos: (agg.contratosPorStatus as any).vigente ?? 0,
          valorTotalContratos: agg.valorTotalContratos,
          marcosAtrasados: agg.marcosAtrasados,
          riscosAltos: agg.riscosAltosAbertos,
          boletinsPendentes: agg.boletinsPendentes,
          contratosPorStatus: agg.contratosPorStatus,
          totalClientes: agg.totalClientes,
        };
      }

      // Resolver o ID do SGC a partir do ID local
      const sgcId = await resolveSgcEmpresaId(input.empresaId);
      if (!sgcId) {
        // Empresa não tem mapeamento SGC — retorna zeros
        return { ...emptyGroup, empresaId: input.empresaId, totalClientes: 0 };
      }

      const agg = await gateway.getContractAggregateByEmpresa(sgcId);
      if (!agg) return { ...emptyGroup, empresaId: input.empresaId, totalClientes: 0 };

      return {
        ...emptyGroup,
        empresaId: input.empresaId,
        totalContratos: agg.totalContratos,
        contratosAtivos: (agg.contratosPorStatus as any).vigente ?? 0,
        ativos: (agg.contratosPorStatus as any).vigente ?? 0,
        vigentes: (agg.contratosPorStatus as any).vigente ?? 0,
        totalClientes: agg.totalClientes,
        valorTotalContratos: agg.valorTotalContratos,
        valorTotal: agg.valorTotalContratos,
        marcosAtrasados: agg.marcosAtrasados,
        riscosAltos: agg.riscosAltosAbertos,
        boletinsPendentes: agg.boletinsPendentes,
        contratosPorStatus: agg.contratosPorStatus,
      };
    }),

  // ── CLIENTES (LEITURA VIA SGC, ESCRITA BLOQUEADA) ────────────────────────
  clientes: router({
    list: protectedProcedure
      .input(z.object({ empresaId: z.number().optional() }))
      .query(async ({ input }) => {
        if (!input.empresaId) {
          // Sem empresa, usa empresa principal (930003)
          return await gateway.getClientsByEmpresa(930003);
        }
        const sgcId = await resolveSgcEmpresaId(input.empresaId);
        if (!sgcId) return [];
        return await gateway.getClientsByEmpresa(sgcId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const sgcClient = (await import("../integrations/sgcClient")).getSGCClient();
        const resp = await sgcClient.get<any>(`/api/clientes/${input.id}`);
        if (resp.success && resp.data) return resp.data;
        return null;
      }),

    listGlobal: protectedProcedure
      .query(async () => {
        const sgcClient = (await import("../integrations/sgcClient")).getSGCClient();
        const resp = await sgcClient.get<any[]>("/api/clientes");
        return resp.success && resp.data ? resp.data : [];
      }),

    // ── ESCRITA BLOQUEADA ──
    create: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Criar cliente", sgcHomeLink());
      }),

    update: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Atualizar cliente", sgcHomeLink());
      }),

    delete: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Excluir cliente", sgcHomeLink());
      }),

    buscarCNPJ: protectedProcedure
      .input(z.object({ cnpj: z.string() }))
      .mutation(async () => {
        throwBlocked("Buscar CNPJ", sgcHomeLink());
      }),

    verificarCNPJ: protectedProcedure
      .input(z.object({ cnpj: z.string() }))
      .query(async ({ input }) => {
        // Formata o CNPJ e retorna que não existe localmente — o SGC é a fonte
        const digits = input.cnpj.replace(/\D/g, "").padStart(14, "0");
        const formatted = digits.replace(
          /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
          "$1.$2.$3/$4-$5"
        );
        return { existe: false, cliente: null, cnpjFormatado: formatted };
      }),

    extrairCartaoCNPJ: protectedProcedure
      .input(z.object({ imageUrl: z.string() }))
      .mutation(async () => {
        throwBlocked("Extrair cartão CNPJ", sgcHomeLink());
      }),

    vincularEmpresa: protectedProcedure
      .input(z.object({ clienteId: z.number(), empresaId: z.number() }))
      .mutation(async () => {
        throwBlocked("Vincular cliente a empresa", sgcHomeLink());
      }),

    desvincularEmpresa: protectedProcedure
      .input(z.object({ clienteId: z.number(), empresaId: z.number() }))
      .mutation(async () => {
        throwBlocked("Desvincular cliente de empresa", sgcHomeLink());
      }),
  }),

  // ── CONTRATOS (LEITURA VIA SGC, ESCRITA BLOQUEADA) ───────────────────────
  contratos: router({
    list: protectedProcedure
      .input(z.object({ empresaId: z.number().optional() }))
      .query(async ({ input }) => {
        if (!input.empresaId) return [];
        return await gateway.getContratosByEmpresa(input.empresaId);
      }),

    listByCliente: protectedProcedure
      .input(z.object({ clienteId: z.number() }))
      .query(async ({ input }) => {
        // Busca contratos do cliente via SGC
        const sgcClient = (await import("../integrations/sgcClient")).getSGCClient();
        const resp = await sgcClient.get<any[]>("/api/contratos", { clienteId: input.clienteId });
        return resp.success && resp.data ? resp.data : [];
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const contrato = await gateway.getContratoById(input.id);
        return contrato || null;
      }),

    // ── ESCRITA BLOQUEADA ──
    create: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async ({ input }) => {
        const empresaId = (input as any).empresaId;
        throwBlocked("Criar contrato", empresaId ? sgcContratosListLink(empresaId) : sgcHomeLink());
      }),

    update: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async ({ input }) => {
        const id = (input as any).id;
        const empresaId = (input as any).empresaId;
        throwBlocked("Atualizar contrato", empresaId && id ? sgcContratoLink(empresaId, id) : sgcHomeLink());
      }),

    delete: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Excluir contrato", sgcHomeLink());
      }),

    extrairPDF: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Extrair PDF de contrato", sgcHomeLink());
      }),

    confirmarExtracao: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Confirmar extração IA", sgcHomeLink());
      }),
  }),

  // ── ADITIVOS (LEITURA VIA SGC, ESCRITA BLOQUEADA) ────────────────────────
  aditivos: router({
    list: protectedProcedure
      .input(z.object({ contratoId: z.number() }))
      .query(async ({ input }) => {
        // Busca aditivos via SGC
        const sgcClient = (await import("../integrations/sgcClient")).getSGCClient();
        const resp = await sgcClient.get<any[]>(`/api/contratos/${input.contratoId}/aditivos`);
        return resp.success && resp.data ? resp.data : [];
      }),

    // ── ESCRITA BLOQUEADA ──
    create: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Criar aditivo", sgcHomeLink());
      }),

    update: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Atualizar aditivo", sgcHomeLink());
      }),
  }),

  // ── MARCOS FINANCEIROS (LEITURA VIA SGC, ESCRITA BLOQUEADA) ──────────────
  marcos: router({
    list: protectedProcedure
      .input(z.object({ contratoId: z.number() }))
      .query(async ({ input }) => {
        return await gateway.getMarcosByContrato(input.contratoId);
      }),

    // ── ESCRITA BLOQUEADA ──
    create: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Criar marco financeiro", sgcHomeLink());
      }),

    update: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Atualizar marco financeiro", sgcHomeLink());
      }),
  }),

  // ── BOLETINS DE MEDIÇÃO (LEITURA VIA SGC, ESCRITA BLOQUEADA) ─────────────
  boletins: router({
    list: protectedProcedure
      .input(z.object({ contratoId: z.number() }))
      .query(async ({ input }) => {
        return await gateway.getBoletinsByContrato(input.contratoId);
      }),

    // ── ESCRITA BLOQUEADA ──
    update: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Atualizar boletim", sgcHomeLink());
      }),

    enviarAprovacao: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Enviar boletim para aprovação", sgcHomeLink());
      }),

    aprovar: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Aprovar boletim", sgcHomeLink());
      }),
  }),

  // ── RISCOS (LEITURA VIA SGC, ESCRITA BLOQUEADA) ──────────────────────────
  riscos: router({
    list: protectedProcedure
      .input(z.object({ contratoId: z.number() }))
      .query(async ({ input }) => {
        return await gateway.getRiscosByContrato(input.contratoId);
      }),

    // ── ESCRITA BLOQUEADA ──
    create: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Criar risco", sgcHomeLink());
      }),

    update: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Atualizar risco", sgcHomeLink());
      }),

    analisarIA: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Analisar riscos via IA", sgcHomeLink());
      }),
  }),

  // ── DOCUMENTOS (LEITURA VIA SGC, ESCRITA BLOQUEADA) ──────────────────────
  documentos: router({
    list: protectedProcedure
      .input(z.object({ contratoId: z.number() }))
      .query(async ({ input }) => {
        const sgcClient = (await import("../integrations/sgcClient")).getSGCClient();
        const resp = await sgcClient.get<any[]>(`/api/contratos/${input.contratoId}/documentos`);
        return resp.success && resp.data ? resp.data : [];
      }),

    // ── ESCRITA BLOQUEADA ──
    create: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Criar documento", sgcHomeLink());
      }),

    classificarIA: protectedProcedure
      .input(z.object({}).passthrough())
      .mutation(async () => {
        throwBlocked("Classificar documento via IA", sgcHomeLink());
      }),
  }),

  // ── APROVAÇÃO PÚBLICA (LEITURA VIA SGC) ──────────────────────────────────
  aprovacaoPublica: router({
    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const sgcClient = (await import("../integrations/sgcClient")).getSGCClient();
        const resp = await sgcClient.get<any>(`/api/aprovacao/${input.token}`);
        return resp.success && resp.data ? resp.data : null;
      }),

    aprovarPorToken: publicProcedure
      .input(z.object({
        token: z.string(),
        aprovado: z.boolean(),
        observacoes: z.string().default(""),
      }))
      .mutation(async ({ input }) => {
        // Delega aprovação ao SGC
        const sgcClient = (await import("../integrations/sgcClient")).getSGCClient();
        const resp = await sgcClient.post<any>(`/api/aprovacao/${input.token}`, {
          aprovado: input.aprovado,
          observacoes: input.observacoes,
        });
        if (resp.success && resp.data) return resp.data;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao processar aprovação no SGC",
        });
      }),
  }),

  // ── RECEITA & RESULTADO (LEITURA VIA SGC) ────────────────────────────────
  dashboardReceita: protectedProcedure
    .input(z.object({ empresaId: z.number().optional(), ano: z.number().optional() }))
    .query(async ({ input }) => {
      const sgcClient = (await import("../integrations/sgcClient")).getSGCClient();
      const resp = await sgcClient.get<any>("/api/dashboard/receita", {
        empresaId: input.empresaId,
        ano: input.ano,
      });
      return resp.success && resp.data ? resp.data : {
        receitaTotal: 0,
        receitaMensal: [],
        receitaPorEmpresa: [],
        receitaPorCliente: [],
      };
    }),

  resultadoOperacional: protectedProcedure
    .input(z.object({ empresaId: z.number(), ano: z.number().optional() }))
    .query(async ({ input }) => {
      const sgcClient = (await import("../integrations/sgcClient")).getSGCClient();
      const resp = await sgcClient.get<any>("/api/dashboard/resultado-operacional", {
        empresaId: input.empresaId,
        ano: input.ano,
      });
      return resp.success && resp.data ? resp.data : {
        receita: 0,
        custos: 0,
        resultado: 0,
        margem: 0,
      };
    }),

  // ── AUDITORIA (LEITURA VIA SGC) ──────────────────────────────────────────
  auditoria: router({
    porContrato: protectedProcedure
      .input(z.object({ contratoId: z.number() }))
      .query(async ({ input }) => {
        const sgcClient = (await import("../integrations/sgcClient")).getSGCClient();
        const resp = await sgcClient.get<any[]>(`/api/contratos/${input.contratoId}/auditoria`);
        return resp.success && resp.data ? resp.data : [];
      }),

    geral: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        const sgcClient = (await import("../integrations/sgcClient")).getSGCClient();
        const resp = await sgcClient.get<any[]>("/api/auditoria", { limit: input.limit });
        return resp.success && resp.data ? resp.data : [];
      }),
  }),

  // ── PAINEL DE RISCOS E CLÁUSULAS (LEITURA VIA SGC) ──────────────────────
  painelRiscos: protectedProcedure
    .input(z.object({ empresaId: z.number().optional() }))
    .query(async ({ input }) => {
      const sgcClient = (await import("../integrations/sgcClient")).getSGCClient();
      const resp = await sgcClient.get<any>("/api/painel/riscos", {
        empresaId: input.empresaId,
      });
      return resp.success && resp.data ? resp.data : {
        totalRiscos: 0,
        riscosPorCategoria: {},
        riscosPorSeveridade: {},
        riscosAbertos: 0,
      };
    }),

  painelClausulas: protectedProcedure
    .input(z.object({ empresaId: z.number().optional() }))
    .query(async ({ input }) => {
      const sgcClient = (await import("../integrations/sgcClient")).getSGCClient();
      const resp = await sgcClient.get<any>("/api/painel/clausulas", {
        empresaId: input.empresaId,
      });
      return resp.success && resp.data ? resp.data : {
        totalClausulas: 0,
        clausulasPorTipo: {},
      };
    }),
});
