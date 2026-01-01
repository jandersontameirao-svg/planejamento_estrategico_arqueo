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

  identidade: router({
    getByEmpresa: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const { getIdentidadeByEmpresa } = await import("./db");
        return await getIdentidadeByEmpresa(input.empresaId);
      }),
    upsert: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        missao: z.string().optional(),
        visao: z.string().optional(),
        valores: z.string().optional(),
        politica: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "gestor") {
          throw new Error("Apenas administradores e gestores podem editar a identidade organizacional");
        }
        const { empresaId, ...data } = input;
        const { upsertIdentidade } = await import("./db");
        await upsertIdentidade(empresaId, data);
        return { success: true };
      }),
  }),

  produtos: router({
    listByEmpresa: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const { getProdutosByEmpresa } = await import("./db");
        return await getProdutosByEmpresa(input.empresaId);
      }),
    create: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        nome: z.string().min(1),
        tipo: z.enum(["produto", "servico"]),
        ativo: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "gestor") {
          throw new Error("Apenas administradores e gestores podem criar produtos/serviços");
        }
        const { createProduto } = await import("./db");
        const id = await createProduto(input);
        return { id };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        tipo: z.enum(["produto", "servico"]).optional(),
        ativo: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "gestor") {
          throw new Error("Apenas administradores e gestores podem editar produtos/serviços");
        }
        const { id, ...data } = input;
        const { updateProduto } = await import("./db");
        await updateProduto(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "gestor") {
          throw new Error("Apenas administradores e gestores podem deletar produtos/serviços");
        }
        const { deleteProduto } = await import("./db");
        await deleteProduto(input.id);
        return { success: true };
      }),
  }),

  canais: router({
    listByEmpresa: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const { getCanaisByEmpresa } = await import("./db");
        return await getCanaisByEmpresa(input.empresaId);
      }),
    create: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        nome: z.string().min(1),
        tipo: z.string().optional(),
        ativo: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "gestor") {
          throw new Error("Apenas administradores e gestores podem criar canais");
        }
        const { createCanal } = await import("./db");
        const id = await createCanal(input);
        return { id };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        tipo: z.string().optional(),
        ativo: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "gestor") {
          throw new Error("Apenas administradores e gestores podem editar canais");
        }
        const { id, ...data } = input;
        const { updateCanal } = await import("./db");
        await updateCanal(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "gestor") {
          throw new Error("Apenas administradores e gestores podem deletar canais");
        }
        const { deleteCanal } = await import("./db");
        await deleteCanal(input.id);
        return { success: true };
      }),
  }),

  kpis: router({
    listByEmpresa: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const { getKPIsByEmpresa } = await import("./db");
        return await getKPIsByEmpresa(input.empresaId);
      }),
    create: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        nome: z.string().min(1),
        unidadeMedida: z.string(),
        tipo: z.enum(["financeiro", "operacional", "cliente", "processo"]),
        frequencia: z.enum(["mensal", "trimestral", "anual"]),
        responsavel: z.string().optional(),
        ativo: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "gestor") {
          throw new Error("Apenas administradores e gestores podem criar KPIs");
        }
        const { createKPI } = await import("./db");
        const id = await createKPI(input);
        return { id };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        unidadeMedida: z.string().optional(),
        tipo: z.enum(["financeiro", "operacional", "cliente", "processo"]).optional(),
        frequencia: z.enum(["mensal", "trimestral", "anual"]).optional(),
        responsavel: z.string().optional(),
        ativo: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "gestor") {
          throw new Error("Apenas administradores e gestores podem editar KPIs");
        }
        const { id, ...data } = input;
        const { updateKPI } = await import("./db");
        await updateKPI(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "gestor") {
          throw new Error("Apenas administradores e gestores podem deletar KPIs");
        }
        const { deleteKPI } = await import("./db");
        await deleteKPI(input.id);
        return { success: true };
      }),
    getValores: protectedProcedure
      .input(z.object({ 
        kpiId: z.number(),
        ano: z.number().optional(),
        mes: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const { getKPIValores } = await import("./db");
        return await getKPIValores(input.kpiId, input.ano, input.mes);
      }),
    upsertValor: protectedProcedure
      .input(z.object({
        kpiId: z.number(),
        ano: z.number(),
        mes: z.number(),
        meta: z.number(),
        realizado: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "gestor") {
          throw new Error("Apenas administradores e gestores podem registrar valores de KPIs");
        }
        const { upsertKPIValor } = await import("./db");
        await upsertKPIValor(input);
        return { success: true };
      }),
  }),
  dashboard: router({
    grupo: protectedProcedure
      .query(async () => {
        const { getDashboardGrupo } = await import("./db");
        return await getDashboardGrupo();
      }),
    empresa: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const { getDashboardEmpresa } = await import("./db");
        return await getDashboardEmpresa(input.empresaId);
      }),
  }),

  planejamentoGrupo: router({
    // Identidade do Grupo
    getIdentidade: protectedProcedure
      .query(async () => {
        const { getIdentidadeGrupo } = await import("./db");
        return await getIdentidadeGrupo();
      }),
    upsertIdentidade: protectedProcedure
      .input(z.object({
        missao: z.string().optional(),
        visao: z.string().optional(),
        valores: z.string().optional(),
        politica: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Apenas administradores podem editar o planejamento do Grupo");
        }
        const { upsertIdentidadeGrupo } = await import("./db");
        await upsertIdentidadeGrupo(input);
        return { success: true };
      }),
    
    // Objetivos do Grupo
    getObjetivos: protectedProcedure
      .query(async () => {
        const { getObjetivosGrupo } = await import("./db");
        return await getObjetivosGrupo();
      }),
    createObjetivo: protectedProcedure
      .input(z.object({
        titulo: z.string().min(1),
        descricao: z.string().optional(),
        prazo: z.date().optional(),
        status: z.enum(["planejado", "em_andamento", "concluido", "cancelado"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "gestor") {
          throw new Error("Apenas administradores e gestores podem criar objetivos do Grupo");
        }
        const { createObjetivoGrupo } = await import("./db");
        const id = await createObjetivoGrupo(input);
        return { id };
      }),
    updateObjetivo: protectedProcedure
      .input(z.object({
        id: z.number(),
        titulo: z.string().min(1).optional(),
        descricao: z.string().optional(),
        prazo: z.date().optional(),
        status: z.enum(["planejado", "em_andamento", "concluido", "cancelado"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "gestor") {
          throw new Error("Apenas administradores e gestores podem editar objetivos do Grupo");
        }
        const { id, ...data } = input;
        const { updateObjetivoGrupo } = await import("./db");
        await updateObjetivoGrupo(id, data);
        return { success: true };
      }),
    deleteObjetivo: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Apenas administradores podem deletar objetivos do Grupo");
        }
        const { deleteObjetivoGrupo } = await import("./db");
        await deleteObjetivoGrupo(input.id);
        return { success: true };
      }),
    
    // KPIs do Grupo
    getKPIs: protectedProcedure
      .query(async () => {
        const { getKPIsGrupo } = await import("./db");
        return await getKPIsGrupo();
      }),
    createKPI: protectedProcedure
      .input(z.object({
        nome: z.string().min(1),
        unidadeMedida: z.string(),
        tipo: z.enum(["financeiro", "operacional", "cliente", "processo"]),
        frequencia: z.enum(["mensal", "trimestral", "anual"]),
        perspectivaBSC: z.enum(["financeira", "clientes", "processos", "aprendizado"]).optional(),
        responsavel: z.string().optional(),
        ativo: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "gestor") {
          throw new Error("Apenas administradores e gestores podem criar KPIs do Grupo");
        }
        const { createKPIGrupo } = await import("./db");
        const id = await createKPIGrupo(input);
        return { id };
      }),
  }),
});

export type AppRouter = typeof appRouter;
