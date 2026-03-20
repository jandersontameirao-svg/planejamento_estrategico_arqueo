/**
 * boletins.ts — Router tRPC para Boletins de Medição
 * Procedimentos: list, getById, getByToken, create, createFromMarco,
 *                enviarParaAprovacao, aprovarViaToken, rejeitarViaToken, marcarComoPago
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import * as db from "../boletins.db";
import { notifyOwner } from "../_core/notification";

export const boletinsRouter = router({
  // ─── Listagem ──────────────────────────────────────────────────────────────
  list: protectedProcedure
    .input(z.object({ contratoId: z.number() }))
    .query(async ({ input }) => {
      return db.getBoletinsByContrato(input.contratoId);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const boletim = await db.getBoletimById(input.id);
      if (!boletim) throw new TRPCError({ code: "NOT_FOUND", message: "Boletim não encontrado" });
      return boletim;
    }),

  getByMarco: protectedProcedure
    .input(z.object({ marcoId: z.number() }))
    .query(async ({ input }) => {
      return db.getBoletimByMarcoId(input.marcoId);
    }),

  // ─── Aprovação pública via token (sem login) ───────────────────────────────
  getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const boletim = await db.getBoletimByToken(input.token);
      if (!boletim) throw new TRPCError({ code: "NOT_FOUND", message: "Boletim não encontrado ou link inválido" });
      return boletim;
    }),

  aprovarViaToken: publicProcedure
    .input(z.object({
      token: z.string(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const boletim = await db.aprovarBoletimViaToken(input.token, input.observacoes);
      if (!boletim) throw new TRPCError({ code: "BAD_REQUEST", message: "Não foi possível aprovar. O boletim pode não estar em aprovação." });
      // Notificar o gestor do projeto
      await notifyOwner({
        title: `✅ Boletim ${boletim.numero} aprovado`,
        content: `O boletim "${boletim.titulo || boletim.numero}" foi aprovado por ${boletim.aprovadorNome || "aprovador externo"}.${input.observacoes ? `\n\nObservações: ${input.observacoes}` : ""}`,
      }).catch(() => {});
      return boletim;
    }),

  rejeitarViaToken: publicProcedure
    .input(z.object({
      token: z.string(),
      observacoes: z.string().min(1, "Informe o motivo da rejeição"),
    }))
    .mutation(async ({ input }) => {
      const boletim = await db.rejeitarBoletimViaToken(input.token, input.observacoes);
      if (!boletim) throw new TRPCError({ code: "BAD_REQUEST", message: "Não foi possível rejeitar. O boletim pode não estar em aprovação." });
      // Notificar o gestor do projeto
      await notifyOwner({
        title: `❌ Boletim ${boletim.numero} rejeitado`,
        content: `O boletim "${boletim.titulo || boletim.numero}" foi rejeitado por ${boletim.aprovadorNome || "aprovador externo"}.\n\nMotivo: ${input.observacoes}`,
      }).catch(() => {});
      return boletim;
    }),

  // ─── Criação ───────────────────────────────────────────────────────────────
  createFromMarco: protectedProcedure
    .input(z.object({
      marcoId: z.number(),
      contratoId: z.number(),
      aprovadorNome: z.string().optional(),
      aprovadorEmail: z.string().email().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const boletim = await db.createBoletimFromMarco(
        input.marcoId,
        input.contratoId,
        ctx.user.id,
        input.aprovadorNome,
        input.aprovadorEmail
      );
      if (!boletim) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar boletim" });
      return boletim;
    }),

  // ─── Workflow de aprovação ─────────────────────────────────────────────────
  enviarParaAprovacao: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const boletim = await db.enviarBoletimParaAprovacao(input.id);
      if (!boletim) throw new TRPCError({ code: "NOT_FOUND" });
      return boletim;
    }),

  marcarComoPago: protectedProcedure
    .input(z.object({
      id: z.number(),
      valorPago: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const boletim = await db.marcarBoletimComoPago(input.id, input.valorPago);
      if (!boletim) throw new TRPCError({ code: "NOT_FOUND" });
      return boletim;
    }),

  // ─── Atualizar aprovador ───────────────────────────────────────────────────
  updateAprovador: protectedProcedure
    .input(z.object({
      id: z.number(),
      aprovadorNome: z.string(),
      aprovadorEmail: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateBoletim(id, data);
    }),
});
