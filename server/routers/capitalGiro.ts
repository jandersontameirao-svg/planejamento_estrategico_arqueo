import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { capitalGiroDados, empresas } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// ─── Lógica de cálculo ────────────────────────────────────────────────────────

/**
 * Calcula os indicadores de Capital de Giro a partir dos dados brutos.
 * - PMR  = (Contas a Receber / Faturamento) × 30
 * - PME  = (Estoques / CMV) × 30   (se CMV > 0)
 * - PMPF = (Contas a Pagar / CMV) × 30  (se CMV > 0)
 * - CCC  = PMR + PME - PMPF
 */
function calcularIndicadores(dados: {
  faturamento: number;
  cmv: number;
  contasReceber: number;
  estoques: number;
  contasPagar: number;
}) {
  const { faturamento, cmv, contasReceber, estoques, contasPagar } = dados;
  const pmr = faturamento > 0 ? (contasReceber / faturamento) * 30 : 0;
  const pme = cmv > 0 ? (estoques / cmv) * 30 : 0;
  const pmpf = cmv > 0 ? (contasPagar / cmv) * 30 : 0;
  const ccc = pmr + pme - pmpf;
  return {
    pmr: Math.round(pmr * 100) / 100,
    pme: Math.round(pme * 100) / 100,
    pmpf: Math.round(pmpf * 100) / 100,
    ccc: Math.round(ccc * 100) / 100,
  };
}

function cccColor(ccc: number) {
  if (ccc <= 15) return "green";
  if (ccc <= 30) return "yellow";
  return "red";
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const capitalGiroRouter = router({
  /**
   * Retorna o CCC consolidado de todas as empresas (média ponderada pelo faturamento)
   * e a lista de empresas com seus últimos indicadores.
   */
  getGeral: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");

    // Busca o registro mais recente de cada empresa
    const rows = await db
      .select({
        empresaId: capitalGiroDados.empresaId,
        empresaNome: empresas.nome,
        mes: capitalGiroDados.mes,
        ano: capitalGiroDados.ano,
        faturamento: capitalGiroDados.faturamento,
        cmv: capitalGiroDados.cmv,
        contasReceber: capitalGiroDados.contasReceber,
        estoques: capitalGiroDados.estoques,
        contasPagar: capitalGiroDados.contasPagar,
        ccc: capitalGiroDados.ccc,
        pmr: capitalGiroDados.pmr,
        pme: capitalGiroDados.pme,
        pmpf: capitalGiroDados.pmpf,
      })
      .from(capitalGiroDados)
      .innerJoin(empresas, eq(capitalGiroDados.empresaId, empresas.id))
      .orderBy(desc(capitalGiroDados.ano), desc(capitalGiroDados.mes));

    // Agrupa por empresa, pega o mais recente
    const porEmpresa = new Map<number, typeof rows[0]>();
    for (const row of rows) {
      if (!porEmpresa.has(row.empresaId)) {
        porEmpresa.set(row.empresaId, row);
      }
    }

    const lista = Array.from(porEmpresa.values()).map((r) => {
      const fat = Number(r.faturamento) || 0;
      const cccVal = Number(r.ccc) ?? calcularIndicadores({
        faturamento: fat,
        cmv: Number(r.cmv) || 0,
        contasReceber: Number(r.contasReceber) || 0,
        estoques: Number(r.estoques) || 0,
        contasPagar: Number(r.contasPagar) || 0,
      }).ccc;
      return {
        empresaId: r.empresaId,
        empresaNome: r.empresaNome,
        mes: r.mes,
        ano: r.ano,
        faturamento: fat,
        ccc: cccVal,
        pmr: Number(r.pmr) || 0,
        pme: Number(r.pme) || 0,
        pmpf: Number(r.pmpf) || 0,
        cor: cccColor(cccVal),
      };
    });

    // CCC consolidado = média ponderada pelo faturamento
    const totalFat = lista.reduce((s, e) => s + e.faturamento, 0);
    const cccConsolidado = totalFat > 0
      ? lista.reduce((s, e) => s + e.ccc * e.faturamento, 0) / totalFat
      : 0;

    return {
      cccConsolidado: Math.round(cccConsolidado * 100) / 100,
      corConsolidado: cccColor(cccConsolidado),
      empresas: lista,
    };
  }),

  /**
   * Retorna todos os dados mensais de uma empresa específica,
   * com indicadores calculados.
   */
  getPorEmpresa: protectedProcedure
    .input(z.object({ empresaId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const rows = await db
        .select()
        .from(capitalGiroDados)
        .where(eq(capitalGiroDados.empresaId, input.empresaId))
        .orderBy(desc(capitalGiroDados.ano), desc(capitalGiroDados.mes));

      const empresa = await db
        .select({ id: empresas.id, nome: empresas.nome, tipoAtuacao: empresas.tipoAtuacao })
        .from(empresas)
        .where(eq(empresas.id, input.empresaId))
        .then((r) => r[0] ?? null);

      const historico = rows.map((r) => {
        const fat = Number(r.faturamento) || 0;
        const cmvVal = Number(r.cmv) || 0;
        const cr = Number(r.contasReceber) || 0;
        const est = Number(r.estoques) || 0;
        const cp = Number(r.contasPagar) || 0;
        const ind = calcularIndicadores({ faturamento: fat, cmv: cmvVal, contasReceber: cr, estoques: est, contasPagar: cp });
        return {
          id: r.id,
          mes: r.mes,
          ano: r.ano,
          faturamento: fat,
          cmv: cmvVal,
          contasReceber: cr,
          estoques: est,
          contasPagar: cp,
          pmr: Number(r.pmr) ?? ind.pmr,
          pme: Number(r.pme) ?? ind.pme,
          pmpf: Number(r.pmpf) ?? ind.pmpf,
          ccc: Number(r.ccc) ?? ind.ccc,
          cor: cccColor(Number(r.ccc) ?? ind.ccc),
          observacoes: r.observacoes,
        };
      });

      // Último registro para KPIs do topo
      const ultimo = historico[0] ?? null;

      return { empresa, historico, ultimo };
    }),

  /**
   * Insere ou atualiza os dados mensais de uma empresa.
   * Recalcula e persiste os indicadores automaticamente.
   */
  salvarDadosMensais: protectedProcedure
    .input(z.object({
      empresaId: z.number(),
      mes: z.number().min(1).max(12),
      ano: z.number().min(2000).max(2100),
      faturamento: z.number().min(0),
      cmv: z.number().min(0),
      contasReceber: z.number().min(0),
      estoques: z.number().min(0),
      contasPagar: z.number().min(0),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      const ind = calcularIndicadores({
        faturamento: input.faturamento,
        cmv: input.cmv,
        contasReceber: input.contasReceber,
        estoques: input.estoques,
        contasPagar: input.contasPagar,
      });

      // Upsert: tenta inserir, se já existe atualiza
      await db
        .insert(capitalGiroDados)
        .values({
          empresaId: input.empresaId,
          mes: input.mes,
          ano: input.ano,
          faturamento: String(input.faturamento),
          cmv: String(input.cmv),
          contasReceber: String(input.contasReceber),
          estoques: String(input.estoques),
          contasPagar: String(input.contasPagar),
          pmr: String(ind.pmr),
          pme: String(ind.pme),
          pmpf: String(ind.pmpf),
          ccc: String(ind.ccc),
          observacoes: input.observacoes,
        })
        .onDuplicateKeyUpdate({
          set: {
            faturamento: String(input.faturamento),
            cmv: String(input.cmv),
            contasReceber: String(input.contasReceber),
            estoques: String(input.estoques),
            contasPagar: String(input.contasPagar),
            pmr: String(ind.pmr),
            pme: String(ind.pme),
            pmpf: String(ind.pmpf),
            ccc: String(ind.ccc),
            observacoes: input.observacoes,
          },
        });

      return { success: true, indicadores: ind };
    }),

  /**
   * Exclui um registro mensal de capital de giro.
   */
  excluirDadosMensais: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(capitalGiroDados).where(eq(capitalGiroDados.id, input.id));
      return { success: true };
    }),
});
