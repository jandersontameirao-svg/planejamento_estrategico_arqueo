/**
 * Router de Avaliação de Contratos
 * Metodologias customizáveis, grupos (nuvens), critérios, avaliações, avaliadores e planos de ação
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { eq, and, desc, inArray } from "drizzle-orm";
import {
  avaliacaoMetodologias,
  avaliacaoCriteriosGrupos,
  avaliacaoCriterios,
  contratosAvaliacoes,
  avaliacaoAvaliadores,
  avaliacaoRespostas,
  avaliacaoPlanos,
  avaliacaoPlanoItens,
} from "../../drizzle/schema";

const metodologiaSchema = z.object({
  empresaId: z.number(),
  nome: z.string().min(1),
  tipo: z.enum(["360", "nps", "csat", "customizada"]).optional(),
  descricao: z.string().optional(),
  escalaMin: z.number().optional(),
  escalaMax: z.number().optional(),
  notaMinima: z.string().optional(),
});

const grupoSchema = z.object({
  metodologiaId: z.number(),
  nome: z.string().min(1),
  peso: z.string().optional(),
  cor: z.string().optional(),
  ordem: z.number().optional(),
});

const criterioSchema = z.object({
  metodologiaId: z.number(),
  grupoId: z.number(),
  titulo: z.string().min(1),
  descricao: z.string().optional(),
  peso: z.string().optional(),
  ordem: z.number().optional(),
});

const avaliacaoSchema = z.object({
  contratoId: z.number(),
  empresaId: z.number(),
  metodologiaId: z.number(),
  titulo: z.string().min(1),
  descricao: z.string().optional(),
  periodo: z.string().optional(),
  observacoes: z.string().optional(),
});

const avaliadorSchema = z.object({
  avaliacaoId: z.number(),
  nome: z.string().min(1),
  email: z.string().optional(),
  cargo: z.string().optional(),
  tipo: z.enum(["interno", "externo", "gestor", "cliente"]).optional(),
});

export const avaliacaoContratosRouter = router({

  metodologias: router({
    list: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(avaliacaoMetodologias)
          .where(and(eq(avaliacaoMetodologias.empresaId, input.empresaId), eq(avaliacaoMetodologias.ativa, true)))
          .orderBy(avaliacaoMetodologias.nome);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [row] = await db.select().from(avaliacaoMetodologias).where(eq(avaliacaoMetodologias.id, input.id));
        return row ?? null;
      }),

    getCompleta: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [metodologia] = await db.select().from(avaliacaoMetodologias)
          .where(eq(avaliacaoMetodologias.id, input.id));
        if (!metodologia) return null;

        const grupos = await db.select().from(avaliacaoCriteriosGrupos)
          .where(eq(avaliacaoCriteriosGrupos.metodologiaId, input.id))
          .orderBy(avaliacaoCriteriosGrupos.ordem);

        const grupoIds = grupos.map(g => g.id);
        const criterios = grupoIds.length > 0
          ? await db.select().from(avaliacaoCriterios)
              .where(inArray(avaliacaoCriterios.grupoId, grupoIds))
              .orderBy(avaliacaoCriterios.ordem)
          : [];

        return {
          ...metodologia,
          grupos: grupos.map(g => ({
            ...g,
            criterios: criterios.filter(c => c.grupoId === g.id),
          })),
        };
      }),

    create: protectedProcedure
      .input(metodologiaSchema)
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [result] = await db.insert(avaliacaoMetodologias).values({
          empresaId: input.empresaId,
          nome: input.nome,
          tipo: (input.tipo ?? "customizada") as any,
          descricao: input.descricao ?? null,
          escalaMin: input.escalaMin ?? 0,
          escalaMax: input.escalaMax ?? 10,
          notaMinima: input.notaMinima ?? "7.00",
          ativa: true,
        });
        return { id: (result as any).insertId };
      }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), data: metodologiaSchema.partial() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(avaliacaoMetodologias).set(input.data as any).where(eq(avaliacaoMetodologias.id, input.id));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(avaliacaoMetodologias).set({ ativa: false }).where(eq(avaliacaoMetodologias.id, input.id));
        return { success: true };
      }),
  }),

  grupos: router({
    list: protectedProcedure
      .input(z.object({ metodologiaId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(avaliacaoCriteriosGrupos)
          .where(eq(avaliacaoCriteriosGrupos.metodologiaId, input.metodologiaId))
          .orderBy(avaliacaoCriteriosGrupos.ordem);
      }),

    create: protectedProcedure
      .input(grupoSchema)
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [result] = await db.insert(avaliacaoCriteriosGrupos).values({
          metodologiaId: input.metodologiaId,
          nome: input.nome,
          peso: input.peso ?? "1.00",
          cor: input.cor ?? "#3B82F6",
          ordem: input.ordem ?? 0,
        });
        return { id: (result as any).insertId };
      }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), data: grupoSchema.partial() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(avaliacaoCriteriosGrupos).set(input.data as any).where(eq(avaliacaoCriteriosGrupos.id, input.id));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(avaliacaoCriteriosGrupos).where(eq(avaliacaoCriteriosGrupos.id, input.id));
        return { success: true };
      }),
  }),

  criterios: router({
    list: protectedProcedure
      .input(z.object({ grupoId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(avaliacaoCriterios)
          .where(eq(avaliacaoCriterios.grupoId, input.grupoId))
          .orderBy(avaliacaoCriterios.ordem);
      }),

    create: protectedProcedure
      .input(criterioSchema)
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [result] = await db.insert(avaliacaoCriterios).values({
          metodologiaId: input.metodologiaId,
          grupoId: input.grupoId,
          titulo: input.titulo,
          descricao: input.descricao ?? null,
          peso: input.peso ?? "1.00",
          ordem: input.ordem ?? 0,
        });
        return { id: (result as any).insertId };
      }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), data: criterioSchema.partial() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(avaliacaoCriterios).set(input.data as any).where(eq(avaliacaoCriterios.id, input.id));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(avaliacaoCriterios).where(eq(avaliacaoCriterios.id, input.id));
        return { success: true };
      }),
  }),

  avaliacoes: router({
    list: protectedProcedure
      .input(z.object({ contratoId: z.number().optional(), empresaId: z.number().optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        if (input.contratoId) {
          return await db.select().from(contratosAvaliacoes)
            .where(eq(contratosAvaliacoes.contratoId, input.contratoId))
            .orderBy(desc(contratosAvaliacoes.createdAt));
        }
        if (input.empresaId) {
          return await db.select().from(contratosAvaliacoes)
            .where(eq(contratosAvaliacoes.empresaId, input.empresaId))
            .orderBy(desc(contratosAvaliacoes.createdAt));
        }
        return [];
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [row] = await db.select().from(contratosAvaliacoes).where(eq(contratosAvaliacoes.id, input.id));
        return row ?? null;
      }),

    create: protectedProcedure
      .input(avaliacaoSchema)
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [result] = await db.insert(contratosAvaliacoes).values({
          contratoId: input.contratoId,
          empresaId: input.empresaId,
          metodologiaId: input.metodologiaId,
          titulo: input.titulo,
          descricao: input.descricao ?? null,
          periodo: input.periodo ?? null,
          observacoes: input.observacoes ?? null,
          status: "rascunho" as const,
          planoAcaoTriggered: false,
          createdByUserId: ctx.user?.id ?? null,
        });
        const id = (result as any).insertId;
        const [row] = await db.select().from(contratosAvaliacoes).where(eq(contratosAvaliacoes.id, id));
        return row!;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: avaliacaoSchema.partial().extend({
          status: z.enum(["rascunho", "em_andamento", "finalizada", "cancelada"]).optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(contratosAvaliacoes).set(input.data as any).where(eq(contratosAvaliacoes.id, input.id));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(contratosAvaliacoes)
          .set({ status: "cancelada" as const })
          .where(eq(contratosAvaliacoes.id, input.id));
        return { success: true };
      }),

    finalizar: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const [avaliacao] = await db.select().from(contratosAvaliacoes)
          .where(eq(contratosAvaliacoes.id, input.id));
        if (!avaliacao) throw new Error("Avaliação não encontrada");

        const [metodologia] = await db.select().from(avaliacaoMetodologias)
          .where(eq(avaliacaoMetodologias.id, avaliacao.metodologiaId));
        const notaMinima = parseFloat(metodologia?.notaMinima ?? "7.00");

        const respostas = await db.select().from(avaliacaoRespostas)
          .where(eq(avaliacaoRespostas.avaliacaoId, input.id));

        let notaFinal = 0;
        if (respostas.length > 0) {
          const soma = respostas.reduce((acc, r) => acc + parseFloat(r.nota ?? "0"), 0);
          notaFinal = soma / respostas.length;
        }

        const planoAcaoTriggered = notaFinal < notaMinima;
        let planoAcaoId: number | null = null;

        if (planoAcaoTriggered) {
          const [planoResult] = await db.insert(avaliacaoPlanos).values({
            avaliacaoId: input.id,
            contratoId: avaliacao.contratoId,
            titulo: `Plano de Ação — ${avaliacao.titulo}`,
            descricao: `Plano de ação gerado automaticamente. Nota obtida: ${notaFinal.toFixed(2)} (mínimo: ${notaMinima})`,
            status: "aberto" as const,
          });
          planoAcaoId = (planoResult as any).insertId;
        }

        await db.update(contratosAvaliacoes).set({
          status: "finalizada" as const,
          notaFinal: notaFinal.toFixed(2),
          planoAcaoTriggered,
          planoAcaoId,
        }).where(eq(contratosAvaliacoes.id, input.id));

        return { notaFinal, planoAcaoTriggered, planoAcaoId };
      }),
  }),

  avaliadores: router({
    list: protectedProcedure
      .input(z.object({ avaliacaoId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(avaliacaoAvaliadores)
          .where(eq(avaliacaoAvaliadores.avaliacaoId, input.avaliacaoId))
          .orderBy(avaliacaoAvaliadores.nome);
      }),

    create: protectedProcedure
      .input(avaliadorSchema)
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [result] = await db.insert(avaliacaoAvaliadores).values({
          avaliacaoId: input.avaliacaoId,
          nome: input.nome,
          email: input.email || null,
          cargo: input.cargo ?? null,
          tipo: (input.tipo ?? "interno") as any,
          status: "pendente" as any,
        });
        return { id: (result as any).insertId };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: avaliadorSchema.partial().extend({
          status: z.enum(["pendente", "em_andamento", "concluido"]).optional(),
          notaCalculada: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(avaliacaoAvaliadores).set(input.data as any).where(eq(avaliacaoAvaliadores.id, input.id));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(avaliacaoAvaliadores).where(eq(avaliacaoAvaliadores.id, input.id));
        return { success: true };
      }),
  }),

  respostas: router({
    list: protectedProcedure
      .input(z.object({ avaliacaoId: z.number(), avaliadorId: z.number().optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        if (input.avaliadorId) {
          return await db.select().from(avaliacaoRespostas)
            .where(and(
              eq(avaliacaoRespostas.avaliacaoId, input.avaliacaoId),
              eq(avaliacaoRespostas.avaliadorId, input.avaliadorId),
            ));
        }
        return await db.select().from(avaliacaoRespostas)
          .where(eq(avaliacaoRespostas.avaliacaoId, input.avaliacaoId));
      }),

    upsert: protectedProcedure
      .input(z.object({
        avaliacaoId: z.number(),
        avaliadorId: z.number(),
        criterioId: z.number(),
        nota: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [existing] = await db.select().from(avaliacaoRespostas)
          .where(and(
            eq(avaliacaoRespostas.avaliacaoId, input.avaliacaoId),
            eq(avaliacaoRespostas.avaliadorId, input.avaliadorId),
            eq(avaliacaoRespostas.criterioId, input.criterioId),
          ));
        if (existing) {
          await db.update(avaliacaoRespostas).set({ nota: input.nota })
            .where(eq(avaliacaoRespostas.id, existing.id));
          return { id: existing.id };
        }
        const [result] = await db.insert(avaliacaoRespostas).values({
          avaliacaoId: input.avaliacaoId,
          avaliadorId: input.avaliadorId,
          criterioId: input.criterioId,
          nota: input.nota,
        });
        return { id: (result as any).insertId };
      }),
  }),

  planos: router({
    list: protectedProcedure
      .input(z.object({ avaliacaoId: z.number().optional(), contratoId: z.number().optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        if (input.avaliacaoId) {
          return await db.select().from(avaliacaoPlanos)
            .where(eq(avaliacaoPlanos.avaliacaoId, input.avaliacaoId))
            .orderBy(desc(avaliacaoPlanos.createdAt));
        }
        if (input.contratoId) {
          return await db.select().from(avaliacaoPlanos)
            .where(eq(avaliacaoPlanos.contratoId, input.contratoId))
            .orderBy(desc(avaliacaoPlanos.createdAt));
        }
        return [];
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [plano] = await db.select().from(avaliacaoPlanos).where(eq(avaliacaoPlanos.id, input.id));
        if (!plano) return null;
        const itens = await db.select().from(avaliacaoPlanoItens)
          .where(eq(avaliacaoPlanoItens.planoId, input.id))
          .orderBy(avaliacaoPlanoItens.createdAt);
        return { ...plano, itens };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          titulo: z.string().optional(),
          descricao: z.string().optional(),
          status: z.enum(["aberto", "em_andamento", "concluido", "cancelado"]).optional(),
          prazo: z.string().optional(),
          responsavel: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(avaliacaoPlanos).set(input.data as any).where(eq(avaliacaoPlanos.id, input.id));
        return { success: true };
      }),

    addItem: protectedProcedure
      .input(z.object({
        planoId: z.number(),
        acao: z.string().min(1),
        responsavel: z.string().optional(),
        prazo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [result] = await db.insert(avaliacaoPlanoItens).values({
          planoId: input.planoId,
          acao: input.acao,
          responsavel: input.responsavel ?? null,
          prazo: input.prazo ? new Date(input.prazo) : null,
          status: "pendente" as any,
        });
        return { id: (result as any).insertId };
      }),

    updateItem: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          acao: z.string().optional(),
          responsavel: z.string().optional(),
          prazo: z.string().optional(),
          status: z.enum(["pendente", "em_andamento", "concluido"]).optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(avaliacaoPlanoItens).set(input.data as any).where(eq(avaliacaoPlanoItens.id, input.id));
        return { success: true };
      }),

    deleteItem: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(avaliacaoPlanoItens).where(eq(avaliacaoPlanoItens.id, input.id));
        return { success: true };
      }),
  }),
});
