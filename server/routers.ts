import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  empresas: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getAllEmpresas, getEmpresasByUsuario } = await import("./db");
      // Admin vê todas, gestor e usuário veem apenas suas empresas
      if (ctx.user.role === "admin") {
        return await getAllEmpresas();
      }
      return await getEmpresasByUsuario(ctx.user.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getEmpresaById } = await import("./db");
        return await getEmpresaById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        nome: z.string().min(1),
        tipoAtuacao: z.enum(["servicos", "produtos", "servicos_produtos"]),
        status: z.enum(["ativa", "inativa"]).default("ativa"),
        observacoes: z.string().optional(),
        logoUrl: z.string().optional(),
        logoKey: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Apenas administradores podem criar empresas");
        }
        const { createEmpresa } = await import("./db");
        const id = await createEmpresa(input);
        return { id };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        tipoAtuacao: z.enum(["servicos", "produtos", "servicos_produtos"]).optional(),
        status: z.enum(["ativa", "inativa"]).optional(),
        observacoes: z.string().optional(),
        logoUrl: z.string().optional(),
        logoKey: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Apenas administradores podem editar empresas");
        }
        const { id, ...data } = input;
        const { updateEmpresa } = await import("./db");
        await updateEmpresa(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Apenas administradores podem deletar empresas");
        }
        const { deleteEmpresa } = await import("./db");
        await deleteEmpresa(input.id);
        return { success: true };
      }),
  }),

  usuarios: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Apenas administradores podem listar usuários");
      }
      const { getAllUsers } = await import("./db");
      return await getAllUsers();
    }),
    updateRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin", "gestor"]),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Apenas administradores podem alterar perfis");
        }
        const { updateUserRole } = await import("./db");
        await updateUserRole(input.userId, input.role);
        return { success: true };
      }),
    vincularEmpresa: protectedProcedure
      .input(z.object({
        usuarioId: z.number(),
        empresaId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Apenas administradores podem vincular usuários");
        }
        const { vincularUsuarioEmpresa } = await import("./db");
        await vincularUsuarioEmpresa(input.usuarioId, input.empresaId);
        return { success: true };
      }),
    desvincularEmpresa: protectedProcedure
      .input(z.object({
        usuarioId: z.number(),
        empresaId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Apenas administradores podem desvincular usuários");
        }
        const { desvincularUsuarioEmpresa } = await import("./db");
        await desvincularUsuarioEmpresa(input.usuarioId, input.empresaId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
