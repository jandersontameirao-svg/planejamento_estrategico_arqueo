import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { orcamentoRouter } from "./routers/orcamento";
import { contratosRouter } from "./routers/contratos";
import { contratosGatewayRouter } from "./routers/contratosGateway";
import { avaliacaoContratosRouter } from "./routers/avaliacaoContratos";
import { gestaoRiscosRouter } from "./routers/gestaoRiscos";
import { organogramaRouter } from "./routers/organograma";
import { capitalGiroRouter } from "./routers/capitalGiro";
import { dreRouter } from "./routers/dre";
import { balanceRouter } from "./routers/balanco";
import { getMetodologiasEmpresa, saveMetodologiasEmpresa, METODOLOGIAS_DISPONIVEIS } from "./metodologias";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  contratos: contratosRouter, // LEGADO: mantido para compatibilidade, será removido após transição completa
  contratosGateway: contratosGatewayRouter, // NOVA FONTE: consome dados do SGC
  avaliacaoContratos: avaliacaoContratosRouter,
  gestaoRiscos: gestaoRiscosRouter,
  organograma: organogramaRouter,
  capitalGiro: capitalGiroRouter,
  dre: dreRouter,
  balanco: balanceRouter,

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

  areasNegocio: router({
    list: protectedProcedure.query(async () => {
      const { getAllAreasNegocio } = await import("./db");
      return await getAllAreasNegocio();
    }),
    listWithEmpresas: protectedProcedure.query(async () => {
      const { getAllAreasNegocio, getEmpresasVinculadasArea } = await import("./db");
      const areas = await getAllAreasNegocio();
      const areasComEmpresas = await Promise.all(
        areas.map(async (area) => {
          const empresas = await getEmpresasVinculadasArea(area.id);
          return { ...area, empresas };
        })
      );
      return areasComEmpresas;
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getAreaNegocioById } = await import("./db");
        return await getAreaNegocioById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        nome: z.string().min(1),
        descricao: z.string().optional(),
        pais: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem criar áreas de negócio" });
        }
        const { createAreaNegocio } = await import("./db");
        const id = await createAreaNegocio(input);
        return { id };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        descricao: z.string().optional(),
        pais: z.string().optional(),
        status: z.enum(["ativa", "inativa"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem editar áreas de negócio" });
        }
        const { id, ...data } = input;
        const { updateAreaNegocio } = await import("./db");
        await updateAreaNegocio(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem deletar áreas de negócio" });
        }
        const { deleteAreaNegocio } = await import("./db");
        await deleteAreaNegocio(input.id);
        return { success: true };
      }),
    getEmpresas: protectedProcedure
      .input(z.object({ areaId: z.number() }))
      .query(async ({ input }) => {
        const { getEmpresasByAreaNegocio } = await import("./db");
        return await getEmpresasByAreaNegocio(input.areaId);
      }),
    vincularEmpresa: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        areaId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem vincular empresas" });
        }
        const { vincularEmpresaArea } = await import("./db");
        await vincularEmpresaArea(input.empresaId, input.areaId);
        return { success: true };
      }),
    desvincularEmpresa: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem desvincular empresas" });
        }
        const { desvincularEmpresaArea } = await import("./db");
        await desvincularEmpresaArea(input.empresaId);
        return { success: true };
      }),
    // Vinculação muitos-para-muitos (empresa pode estar em múltiplas áreas)
    getEmpresasVinculadas: protectedProcedure
      .input(z.object({ areaId: z.number() }))
      .query(async ({ input }) => {
        const { getEmpresasVinculadasArea } = await import("./db");
        return await getEmpresasVinculadasArea(input.areaId);
      }),
    getEmpresasDisponiveis: protectedProcedure
      .input(z.object({ areaId: z.number() }))
      .query(async ({ input }) => {
        const { getEmpresasNaoVinculadasArea } = await import("./db");
        return await getEmpresasNaoVinculadasArea(input.areaId);
      }),
    vincularEmpresaArea: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        areaId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem vincular empresas" });
        }
        const { vincularEmpresaAreaNegocio } = await import("./db");
        const id = await vincularEmpresaAreaNegocio(input.empresaId, input.areaId);
        return { success: true, id };
      }),
    desvincularEmpresaArea: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        areaId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem desvincular empresas" });
        }
        const { desvincularEmpresaAreaNegocio } = await import("./db");
        await desvincularEmpresaAreaNegocio(input.empresaId, input.areaId);
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
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        email: z.string().email("Email inválido"),
        role: z.enum(["user", "admin", "gestor"]),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Apenas administradores podem criar usuários");
        }
        const dbModule = await import("./db") as any;
        const result = await dbModule.createUser(input);
        return result;
      }),
    delete: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Apenas administradores podem deletar usuários");
        }
        const dbModule = await import("./db") as any;
        await dbModule.deleteUser(input.userId);
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

  // ============================================
  // KPI Valores Mensais
  // ============================================
  kpiValores: router({
    listByKpi: protectedProcedure
      .input(z.object({ kpiId: z.number() }))
      .query(async ({ input }) => {
        const { getKpiValoresByKpi } = await import("./db");
        return await getKpiValoresByKpi(input.kpiId);
      }),

    getByPeriodo: protectedProcedure
      .input(z.object({ 
        kpiId: z.number(),
        ano: z.number(),
        mes: z.number()
      }))
      .query(async ({ input }) => {
        const { getKpiValorByKpiAndPeriodo } = await import("./db");
        return await getKpiValorByKpiAndPeriodo(input.kpiId, input.ano, input.mes);
      }),

    upsert: protectedProcedure
      .input(z.object({
        kpiId: z.number(),
        ano: z.number(),
        mes: z.number(),
        meta: z.number().optional(),
        realizado: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { upsertKpiValor } = await import("./db");
        await upsertKpiValor(input);
        return { success: true };
      }),
  }),

  // Objetivos Estratégicos do Grupo
  objetivosGrupo: router({
    list: publicProcedure.query(async () => {
      const { getObjetivosGrupo } = await import("./db");
      return await getObjetivosGrupo();
    }),

    listByEmpresa: publicProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const { getObjetivosByEmpresa } = await import("./db");
        return await getObjetivosByEmpresa(input.empresaId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        empresaId: z.number().optional(),
        titulo: z.string(),
        descricao: z.string().optional(),
        perspectivaBSC: z.enum(["financeira", "clientes", "processos", "aprendizado"]).optional(),
        prazo: z.string().optional(),
        status: z.enum(["planejado", "em_andamento", "concluido", "cancelado"]).optional(),
        impacto: z.enum(["baixo", "medio", "alto"]).optional(),
        probabilidade: z.enum(["baixa", "media", "alta"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { createObjetivoGrupo } = await import("./db");
        await createObjetivoGrupo(input as any);
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        empresaId: z.number().optional(),
        titulo: z.string().optional(),
        descricao: z.string().optional(),
        perspectivaBSC: z.enum(["financeira", "clientes", "processos", "aprendizado"]).optional(),
        prazo: z.string().optional(),
        status: z.enum(["planejado", "em_andamento", "concluido", "cancelado"]).optional(),
        impacto: z.enum(["baixo", "medio", "alto"]).optional(),
        probabilidade: z.enum(["baixa", "media", "alta"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateObjetivoGrupo } = await import("./db");
        const { id, ...data } = input;
        await updateObjetivoGrupo(id, data as any);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteObjetivoGrupo } = await import("./db");
        await deleteObjetivoGrupo(input.id);
        return { success: true };
      }),
    
    vincularKPI: protectedProcedure
      .input(z.object({
        objetivoId: z.number(),
        kpiId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { vincularObjetivoKPI } = await import("./db");
        await vincularObjetivoKPI(input.objetivoId, input.kpiId);
        return { success: true };
      }),
    
    desvincularKPI: protectedProcedure
      .input(z.object({
        objetivoId: z.number(),
        kpiId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { desvincularObjetivoKPI } = await import("./db");
        await desvincularObjetivoKPI(input.objetivoId, input.kpiId);
        return { success: true };
      }),
    
    getKPIsVinculados: publicProcedure
      .input(z.object({ objetivoId: z.number() }))
      .query(async ({ input }) => {
        const { getKPIsVinculadosObjetivo } = await import("./db");
        return await getKPIsVinculadosObjetivo(input.objetivoId);
      }),

    // Vinculação de líder do OrganoArq a objetivo do Grupo
    vincularLider: protectedProcedure
      .input(z.object({
        objetivoId: z.number(),
        responsavelOrganoId: z.string().nullable(),
        responsavelOrganoNome: z.string().nullable(),
        responsavelOrganoCargo: z.string().nullable(),
      }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("../server/db");
        const db = (await getDb())!;
        const { objetivosGrupo } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db.update(objetivosGrupo)
          .set({
            responsavelOrganoId: input.responsavelOrganoId,
            responsavelOrganoNome: input.responsavelOrganoNome,
            responsavelOrganoCargo: input.responsavelOrganoCargo,
          })
          .where(eq(objetivosGrupo.id, input.objetivoId));
        return { success: true };
      }),

    // Retorna todos os objetivos do grupo com dados de líder enriquecidos
    listComLideres: publicProcedure.query(async () => {
      const { getObjetivosGrupo } = await import("./db");
      return await getObjetivosGrupo();
    }),

    // Retorna objetivos agrupados por líder (para a visão cruzada no organograma)
    porLider: publicProcedure.query(async () => {
      const { getDb } = await import("../server/db");
      const db = (await getDb())!;
      const { objetivosGrupo } = await import("../drizzle/schema");
      const { isNotNull } = await import("drizzle-orm");
      const rows = await db.select().from(objetivosGrupo)
        .where(isNotNull(objetivosGrupo.responsavelOrganoId));
      // Agrupar por líder
      const mapa: Record<string, { id: string; nome: string; cargo: string; objetivos: typeof rows }> = {};
      for (const obj of rows) {
        const key = obj.responsavelOrganoId!;
        if (!mapa[key]) {
          mapa[key] = {
            id: key,
            nome: obj.responsavelOrganoNome ?? "",
            cargo: obj.responsavelOrganoCargo ?? "",
            objetivos: [],
          };
        }
        mapa[key].objetivos.push(obj);
      }
      return Object.values(mapa);
    }),
  }),

  // Projetos Estratégicos do Grupo
  projetosGrupo: router({
    list: publicProcedure.query(async () => {
      const { getProjetosGrupo } = await import("./db");
      return await getProjetosGrupo();
    }),

    listByEmpresa: publicProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const { getProjetosByEmpresa } = await import("./db");
        return await getProjetosByEmpresa(input.empresaId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        empresaId: z.number().optional(),
        nome: z.string(),
        descricao: z.string().optional(),
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
        status: z.enum(["planejado", "em_andamento", "concluido", "cancelado"]).optional(),
        responsavel: z.string().optional(),
        impacto: z.enum(["baixo", "medio", "alto"]).optional(),
        probabilidade: z.enum(["baixa", "media", "alta"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { createProjetoGrupo } = await import("./db");
        await createProjetoGrupo(input as any);
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        empresaId: z.number().optional(),
        nome: z.string().optional(),
        descricao: z.string().optional(),
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
        status: z.enum(["planejado", "em_andamento", "concluido", "cancelado"]).optional(),
        responsavel: z.string().optional(),
        impacto: z.enum(["baixo", "medio", "alto"]).optional(),
        probabilidade: z.enum(["baixa", "media", "alta"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateProjetoGrupo } = await import("./db");
        const { id, ...data } = input;
        await updateProjetoGrupo(id, data as any);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteProjetoGrupo } = await import("./db");
        await deleteProjetoGrupo(input.id);
        return { success: true };
      }),
    
    vincularKPI: protectedProcedure
      .input(z.object({
        projetoId: z.number(),
        kpiId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { vincularProjetoKPI } = await import("./db");
        await vincularProjetoKPI(input.projetoId, input.kpiId);
        return { success: true };
      }),
    
    desvincularKPI: protectedProcedure
      .input(z.object({
        projetoId: z.number(),
        kpiId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { desvincularProjetoKPI } = await import("./db");
        await desvincularProjetoKPI(input.projetoId, input.kpiId);
        return { success: true };
      }),
    
    getKPIsVinculados: publicProcedure
      .input(z.object({ projetoId: z.number() }))
      .query(async ({ input }) => {
        const { getKPIsVinculadosProjeto } = await import("./db");
        return await getKPIsVinculadosProjeto(input.projetoId);
      }),
  }),

  /**
   * Plano de Ação - Ações vinculadas a Objetivos e Projetos
   */
  acoesGrupo: router({
    list: publicProcedure.query(async () => {
      const { getAcoesGrupo } = await import("./db");
      return await getAcoesGrupo();
    }),
    
    listByEmpresa: publicProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const { getAcoesByEmpresa } = await import("./db");
        return await getAcoesByEmpresa(input.empresaId);
      }),
    
    listByObjetivo: publicProcedure
      .input(z.object({ objetivoId: z.number() }))
      .query(async ({ input }) => {
        const { getAcoesByObjetivo } = await import("./db");
        return await getAcoesByObjetivo(input.objetivoId);
      }),
    
    listByProjeto: publicProcedure
      .input(z.object({ projetoId: z.number() }))
      .query(async ({ input }) => {
        const { getAcoesByProjeto } = await import("./db");
        return await getAcoesByProjeto(input.projetoId);
      }),
    
    listByStatus: publicProcedure
      .input(z.object({ status: z.enum(["pendente", "em_andamento", "concluida", "cancelada"]) }))
      .query(async ({ input }) => {
        const { getAcoesByStatus } = await import("./db");
        return await getAcoesByStatus(input.status);
      }),
    
    listByResponsavel: publicProcedure
      .input(z.object({ responsavel: z.string() }))
      .query(async ({ input }) => {
        const { getAcoesByResponsavel } = await import("./db");
        return await getAcoesByResponsavel(input.responsavel);
      }),
    
    create: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        descricao: z.string(),
        responsavel: z.string().optional(),
        prazo: z.string().optional(),
        custo: z.string().optional(),
        status: z.enum(["pendente", "em_andamento", "concluida", "cancelada"]).optional(),
        objetivoId: z.number().optional(),
        projetoId: z.number().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { prazo, ...rest } = input;
        const { createAcaoGrupo } = await import("./db");
        const data = {
          ...rest,
          ...(prazo ? { prazo: new Date(prazo) } : {}),
        };
        await createAcaoGrupo(data);
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        descricao: z.string().optional(),
        responsavel: z.string().optional(),
        prazo: z.string().optional(),
        custo: z.string().optional(),
        status: z.enum(["pendente", "em_andamento", "concluida", "cancelada"]).optional(),
        objetivoId: z.number().optional(),
        projetoId: z.number().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, prazo, ...rest } = input;
        const { updateAcaoGrupo } = await import("./db");
        const data = {
          ...rest,
          ...(prazo ? { prazo: new Date(prazo) } : {}),
        };
        await updateAcaoGrupo(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteAcaoGrupo } = await import("./db");
        await deleteAcaoGrupo(input.id);
        return { success: true };
      }),
  }),

  // Analise Preditiva
  analisePreditiva: router({
    getAlertas: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input, ctx }) => {
        const { getObjetivosByEmpresa, getProjetosByEmpresa } = await import("./db");
        
        const objetivos = await getObjetivosByEmpresa(input.empresaId);
        const projetos = await getProjetosByEmpresa(input.empresaId);
        
        const alertas = [];
        
        // Analise de objetivos
        for (const obj of objetivos) {
          const diasRestantes = obj.prazo ? 
            Math.ceil((new Date(obj.prazo).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
            null;
          
          // Alerta se faltam menos de 30 dias
          if (diasRestantes && diasRestantes < 30 && diasRestantes > 0) {
            alertas.push({
              tipo: "objetivo",
              severidade: diasRestantes < 7 ? "critico" : "aviso",
              titulo: `Objetivo "${obj.titulo}" vence em ${diasRestantes} dias`,
              mensagem: `O objetivo estrategico vence em ${diasRestantes} dias. Verifique o progresso.`,
              dataAlerta: new Date(),
              diasRestantes,
            });
          }
        }
        
        // Analise de projetos
        for (const proj of projetos) {
          const diasRestantes = proj.dataFim ? 
            Math.ceil((new Date(proj.dataFim).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
            null;
          
          if (diasRestantes && diasRestantes < 30 && diasRestantes > 0) {
            alertas.push({
              tipo: "projeto",
              severidade: diasRestantes < 7 ? "critico" : "aviso",
              titulo: `Projeto "${proj.nome}" vence em ${diasRestantes} dias`,
              mensagem: `O projeto vence em ${diasRestantes} dias.`,
              dataAlerta: new Date(),
              diasRestantes,
            });
          }
        }
        
        return alertas.sort((a, b) => a.diasRestantes - b.diasRestantes);
      }),
    
    getTendencias: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const { getProjetosByEmpresa } = await import("./db");
        
        const projetos = await getProjetosByEmpresa(input.empresaId);
        
        // Agrupar por status e calcular tendencias
        const statusCount = {
          planejado: 0,
          em_andamento: 0,
          concluido: 0,
          cancelado: 0,
        };
        
        let totalProgresso = 0;
        let projetosComProgresso = 0;
        
        for (const proj of projetos) {
          statusCount[proj.status as keyof typeof statusCount]++;
          // Calcular progresso baseado em datas
          if (proj.dataInicio && proj.dataFim) {
            const now = new Date().getTime();
            const start = new Date(proj.dataInicio).getTime();
            const end = new Date(proj.dataFim).getTime();
            
            if (now >= end) {
              totalProgresso += 100;
            } else if (now <= start) {
              totalProgresso += 0;
            } else {
              totalProgresso += Math.round(((now - start) / (end - start)) * 100);
            }
            projetosComProgresso++;
          }
        }
        
        const progressoMedio = projetosComProgresso > 0 ? Math.round(totalProgresso / projetosComProgresso) : 0;
        
        return {
          statusCount,
          progressoMedio,
          totalProjetos: projetos.length,
          previsaoDesvios: progressoMedio < 50 ? "alto" : progressoMedio < 75 ? "medio" : "baixo",
        };
      }),
  }),

  // Email e Notificacoes
  email: router({
    enviarAlerta: protectedProcedure
      .input(z.object({
        destinatario: z.string().email(),
        tipo: z.enum(["objetivo", "projeto"]),
        titulo: z.string(),
        mensagem: z.string(),
        severidade: z.enum(["critico", "aviso"]),
        diasRestantes: z.number(),
        empresa: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { enviarAlertaCritico } = await import("./email");
        return await enviarAlertaCritico(input.destinatario, {
          tipo: input.tipo,
          titulo: input.titulo,
          mensagem: input.mensagem,
          severidade: input.severidade,
          diasRestantes: input.diasRestantes,
          empresa: input.empresa,
        });
      }),
  }),

  // Calendario
  calendario: router({
    gerarICS: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
      }))
      .query(async ({ input }) => {
        const { getObjetivosByEmpresa, getProjetosByEmpresa } = await import("./db");
        const { criarEventoCalendario, gerarDownloadICS } = await import("./calendar");
        
        const objetivos = await getObjetivosByEmpresa(input.empresaId);
        const projetos = await getProjetosByEmpresa(input.empresaId);
        
        const eventos = [];
        
        // Converter objetivos para eventos
        for (const obj of objetivos) {
          if (obj.prazo) {
            eventos.push(
              criarEventoCalendario(
                `obj-${obj.id}`,
                obj.titulo || "Objetivo sem título",
                new Date(),
                new Date(obj.prazo),
                "objetivo",
                obj.status || "planejado"
              )
            );
          }
        }
        
        // Converter projetos para eventos
        for (const proj of projetos) {
          if (proj.dataInicio && proj.dataFim) {
            eventos.push(
              criarEventoCalendario(
                `proj-${proj.id}`,
                proj.nome || "Projeto sem nome",
                new Date(proj.dataInicio),
                new Date(proj.dataFim),
                "projeto",
                proj.status,
                proj.descricao || undefined,
                proj.area || undefined,
                proj.responsavel || undefined
              )
            );
          }
        }
        
        const icsBuffer = gerarDownloadICS(eventos);
        return {
          success: true,
          data: icsBuffer.toString("base64"),
          filename: `planejamento-${input.empresaId}-${new Date().toISOString().split("T")[0]}.ics`,
        };
      }),
    
    gerarURLGoogleCalendar: publicProcedure
      .input(z.object({
        titulo: z.string(),
        dataInicio: z.date(),
        dataFim: z.date(),
        descricao: z.string().optional(),
        local: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { gerarURLGoogleCalendar } = await import("./calendar");
        const url = gerarURLGoogleCalendar({
          id: `evt-${Date.now()}`,
          titulo: input.titulo,
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
          descricao: input.descricao,
          local: input.local,
          tipo: "projeto",
          status: "em_andamento",
        });
        return { url };
      }),
    
    gerarURLOutlook: publicProcedure
      .input(z.object({
        titulo: z.string(),
        dataInicio: z.date(),
        dataFim: z.date(),
        descricao: z.string().optional(),
        local: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { gerarURLOutlook } = await import("./calendar");
        const url = gerarURLOutlook({
          id: `evt-${Date.now()}`,
          titulo: input.titulo,
          dataInicio: input.dataInicio,
          dataFim: input.dataFim,
          descricao: input.descricao,
          local: input.local,
          tipo: "projeto",
          status: "em_andamento",
        });
        return { url };
      }),
  }),

  // Gestao de Usuarios - Funcoes Adicionais
  // (router usuarios ja existe com funcionalidades basicas)

  riscos: router({
    updateObjetivoRisco: protectedProcedure
      .input(z.object({
        objetivoId: z.number(),
        impacto: z.enum(["baixo", "medio", "alto"]),
        probabilidade: z.enum(["baixa", "media", "alta"]),
        metodologia: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateObjetivoRisco } = await import("./db");
        await updateObjetivoRisco(input.objetivoId, input.impacto, input.probabilidade, input.metodologia, input.observacoes);
        return { success: true };
      }),
    
    updateProjetoRisco: protectedProcedure
      .input(z.object({
        projetoId: z.number(),
        impacto: z.enum(["baixo", "medio", "alto"]),
        probabilidade: z.enum(["baixa", "media", "alta"]),
        metodologia: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateProjetoRisco } = await import("./db");
        await updateProjetoRisco(input.projetoId, input.impacto, input.probabilidade, input.metodologia, input.observacoes);
        return { success: true };
      }),
  }),

  analises: router({
    savePestel: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        fatores: z.array(z.object({
          categoria: z.enum(["politico", "economico", "social", "tecnologico", "ambiental", "legal"]),
          descricao: z.string(),
          impacto: z.number().min(1).max(5),
          probabilidade: z.number().min(1).max(5),
        })),
      }))
      .mutation(async ({ input }) => {
        console.log("[savePestel] Recebido:", input);
        const { savePestelFatores } = await import("./db");
        const result = await savePestelFatores(input.empresaId, input.fatores);
        console.log("[savePestel] Resultado:", result);
        return result;
      }),

    getPestel: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const { getPestelFatoresByEmpresa } = await import("./db");
        return await getPestelFatoresByEmpresa(input.empresaId);
      }),

    savePestelFatorIndividual: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        fatorId: z.string(),
        categoria: z.enum(["politico", "economico", "social", "tecnologico", "ambiental", "legal"]),
        descricao: z.string(),
        impacto: z.number().min(1).max(5),
        probabilidade: z.number().min(1).max(5),
      }))
      .mutation(async ({ input }) => {
        console.log("[savePestelFatorIndividual] Recebido:", input);
        const { savePestelFatorIndividual } = await import("./db");
        const result = await savePestelFatorIndividual(input.empresaId, input.fatorId, {
          categoria: input.categoria,
          descricao: input.descricao,
          impacto: input.impacto,
          probabilidade: input.probabilidade,
        });
        console.log("[savePestelFatorIndividual] Resultado:", result);
        return result;
      }),

    saveForcas: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        rivalidade: z.string().optional(),
        fornecedores: z.string().optional(),
        clientes: z.string().optional(),
        substitutos: z.string().optional(),
        novosEntrantes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return { success: true, message: "5 Forcas salvo" };
      }),

    saveStakeholders: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        altoPoder: z.string().optional(),
        altoInteresse: z.string().optional(),
        baixoPoder: z.string().optional(),
        baixoInteresse: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return { success: true, message: "Stakeholders salvo" };
      }),

    saveRbvVrio: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        valioso: z.string().optional(),
        raro: z.string().optional(),
        inimitavel: z.string().optional(),
        organizado: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return { success: true, message: "RBV/VRIO salvo" };
      }),

    saveSwot: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        items: z.array(z.object({
          tipo: z.enum(["forca", "fraqueza", "oportunidade", "ameaca"]),
          descricao: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        const { saveSwotItems } = await import("./db");
        return await saveSwotItems(input.empresaId, input.items);
      }),

    getSwot: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const { getSwotItemsByEmpresa } = await import("./db");
        return await getSwotItemsByEmpresa(input.empresaId);
      }),

    saveOkr: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        objectives: z.array(z.object({
          objetivo: z.string(),
          descricao: z.string(),
          resultadoChave1: z.string().optional(),
          metaResultado1: z.string().optional(),
          resultadoChave2: z.string().optional(),
          metaResultado2: z.string().optional(),
          resultadoChave3: z.string().optional(),
          metaResultado3: z.string().optional(),
        })),
      }))
      .mutation(async ({ input }) => {
        const { saveOkrObjectives } = await import("./db");
        return await saveOkrObjectives(input.empresaId, input.objectives);
      }),

    getOkr: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const { getOkrObjectivesByEmpresa } = await import("./db");
        return await getOkrObjectivesByEmpresa(input.empresaId);
      }),

    // Buscar progresso de todas as empresas para dashboard comparativo
    getProgressoTodasEmpresas: protectedProcedure
      .query(async () => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { empresas } = await import("../drizzle/schema");
        const { sql } = await import("drizzle-orm");

        const allEmpresas = await db.select().from(empresas);

        const resultado = [];

        for (const empresa of allEmpresas) {
          const empresaId = empresa.id;

          // PESTEL: 6 fatores esperados (1 por categoria)
          const pestelCount: any = await db.execute(sql`
            SELECT COUNT(*) as count FROM pestel_fatores WHERE empresaId = ${empresaId}
          `);
          const pestelTotal = pestelCount.rows?.[0]?.count || pestelCount[0]?.count || 0;
          const progressoPestel = Math.min((pestelTotal / 6) * 100, 100);

          // SWOT: 8 itens esperados (2 por quadrante)
          const swotCount: any = await db.execute(sql`
            SELECT COUNT(*) as count FROM analise_swot_tows WHERE empresaId = ${empresaId}
          `);
          const swotTotal = swotCount.rows?.[0]?.count || swotCount[0]?.count || 0;
          const progressoSwot = Math.min((swotTotal / 8) * 100, 100);

          // OKR: 3 objetivos esperados
          const okrCount: any = await db.execute(sql`
            SELECT COUNT(*) as count FROM analise_okr WHERE empresaId = ${empresaId}
          `);
          const okrTotal = okrCount.rows?.[0]?.count || okrCount[0]?.count || 0;
          const progressoOkr = Math.min((okrTotal / 3) * 100, 100);

          // BSC: 8 indicadores esperados (2 por perspectiva)
          const bscCount: any = await db.execute(sql`
            SELECT COUNT(*) as count FROM bsc_indicadores WHERE empresaId = ${empresaId}
          `);
          const bscTotal = bscCount.rows?.[0]?.count || bscCount[0]?.count || 0;
          const progressoBsc = Math.min((bscTotal / 8) * 100, 100);

          resultado.push({
            empresaId,
            nomeEmpresa: empresa.nome,
            progressoPestel,
            progressoSwot,
            progressoOkr,
            progressoBsc,
          });
        }

        return resultado;
      }),
  }),

  bsc: router({
    // Salvar indicadores BSC de uma empresa
    saveIndicadores: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        indicadores: z.array(z.object({
          perspectiva: z.enum(["financeira", "cliente", "processos", "aprendizado"]),
          nome: z.string(),
          meta: z.number(),
          valorAtual: z.number().optional(),
          unidade: z.string().optional(),
        })),
      }))
      .mutation(async ({ input }) => {
        const { saveBscIndicadores } = await import("./db");
        return await saveBscIndicadores(input.empresaId, input.indicadores);
      }),

    // Buscar indicadores BSC de uma empresa
    getByEmpresa: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const { getBscIndicadoresByEmpresa } = await import("./db");
        return await getBscIndicadoresByEmpresa(input.empresaId);
      }),

    // Buscar indicadores BSC de todas as empresas (para agregação)
    getAll: protectedProcedure
      .query(async () => {
        const { getAllBscIndicadores } = await import("./db");
        return await getAllBscIndicadores();
      }),
  }),

  templates: router({
    // Buscar configuração de template de uma empresa
    getConfig: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const { getTemplateConfig } = await import("./db");
        return await getTemplateConfig(input.empresaId);
      }),

    // Salvar configuração de template
    saveConfig: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        logoUrl: z.string().optional(),
        logoKey: z.string().optional(),
        corPrimaria: z.string(),
        corSecundaria: z.string(),
        incluirPestel: z.boolean(),
        incluirSwot: z.boolean(),
        incluirOkr: z.boolean(),
        incluirBsc: z.boolean(),
        incluirGraficos: z.boolean(),
        incluirRecomendacoes: z.boolean(),
        rodapePersonalizado: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { saveTemplateConfig } = await import("./db");
        return await saveTemplateConfig(input);
      }),

    // Upload de logo para template
    uploadLogo: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        fileData: z.string(), // base64
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { storagePut } = await import("./storage");
        
        // Converter base64 para Buffer
        const base64Data = input.fileData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        
        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const fileKey = `logos/empresa-${input.empresaId}-${timestamp}-${input.fileName}`;
        
        // Upload para S3
        const { url, key } = await storagePut(fileKey, buffer, input.mimeType);
        
        // Atualizar configuração do template com URL do logo
        const { updateTemplateLogoUrl } = await import("./db");
        await updateTemplateLogoUrl(input.empresaId, url, key);
        
        return { url, key };
      }),

    // Listar versões anteriores
    listVersions: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const { listTemplateVersions } = await import("./db");
        return await listTemplateVersions(input.empresaId);
      }),

    // Reverter para versão específica
    revertToVersion: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        versionNumber: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { revertToTemplateVersion } = await import("./db");
        return await revertToTemplateVersion(input.empresaId, input.versionNumber);
      }),
  }),

  comentarios: router({
    // Criar comentário
    create: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        tipoAnalise: z.enum(["pestel", "swot", "okr", "bsc"]),
        conteudo: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createComentario, extractMentions, saveMencoes, listUsers } = await import("./db");
        const { notifyOwner } = await import("./_core/notification");
        
        // Criar comentário
        const comentario = await createComentario({
          empresaId: input.empresaId,
          tipoAnalise: input.tipoAnalise,
          autorId: ctx.user.openId,
          autorNome: ctx.user.name || "Usuário",
          conteudo: input.conteudo,
        });
        
        // Detectar menções (@usuario)
        const mentions = extractMentions(input.conteudo);
        if (mentions.length > 0) {
          // Buscar usuários mencionados
          const allUsers = await listUsers();
          const mentionedUsers = allUsers.filter((u: any) => 
            mentions.some((m: string) => u.name.toLowerCase().includes(m.toLowerCase()))
          );
          
          if (mentionedUsers.length > 0) {
            // Salvar menções
            await saveMencoes(
              comentario.insertId,
              mentionedUsers.map((u: any) => ({ id: u.openId, nome: u.name }))
            );
            
            // Notificar usuários mencionados (apenas o proprietário por enquanto)
            await notifyOwner({
              title: `Nova menção em comentário`,
              content: `${ctx.user.name} mencionou você em um comentário: "${input.conteudo.substring(0, 100)}..."`
            });
          }
        }
        
        return comentario;
      }),

    // Listar comentários
    list: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        tipoAnalise: z.enum(["pestel", "swot", "okr", "bsc"]),
      }))
      .query(async ({ input }) => {
        const { listComentarios } = await import("./db");
        return await listComentarios(input.empresaId, input.tipoAnalise);
      }),

    // Atualizar comentário
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        conteudo: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const { updateComentario } = await import("./db");
        return await updateComentario(input.id, input.conteudo, ctx.user.openId);
      }),

    // Deletar comentário
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { deleteComentario } = await import("./db");
        return await deleteComentario(input.id, ctx.user.openId);
      }),

    // Contar comentários
    count: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        tipoAnalise: z.enum(["pestel", "swot", "okr", "bsc"]),
      }))
      .query(async ({ input }) => {
        const { countComentarios } = await import("./db");
        return await countComentarios(input.empresaId, input.tipoAnalise);
      }),

    // Upload de anexo
    uploadAnexo: protectedProcedure
      .input(z.object({
        comentarioId: z.number(),
        nomeArquivo: z.string(),
        tipoArquivo: z.string(),
        tamanhoBytes: z.number(),
        base64Data: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { saveAnexo } = await import("./db");
        const { storagePut } = await import("./storage");
        
        // Validar tamanho (máximo 10MB)
        if (input.tamanhoBytes > 10 * 1024 * 1024) {
          throw new Error("Arquivo muito grande. Tamanho máximo: 10MB");
        }
        
        // Converter base64 para buffer
        const buffer = Buffer.from(input.base64Data, "base64");
        
        // Upload para S3
        const s3Key = `comentarios/${input.comentarioId}/${Date.now()}-${input.nomeArquivo}`;
        const { url } = await storagePut(s3Key, buffer, input.tipoArquivo);
        
        // Salvar no banco
        return await saveAnexo(input.comentarioId, {
          nomeArquivo: input.nomeArquivo,
          tipoArquivo: input.tipoArquivo,
          tamanhoBytes: input.tamanhoBytes,
          urlS3: url,
          s3Key,
        });
      }),

    // Listar anexos
    listAnexos: protectedProcedure
      .input(z.object({ comentarioId: z.number() }))
      .query(async ({ input }) => {
        const { listAnexos } = await import("./db");
        return await listAnexos(input.comentarioId);
      }),

    // Deletar anexo
    deleteAnexo: protectedProcedure
      .input(z.object({ anexoId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { deleteAnexo } = await import("./db");
        return await deleteAnexo(input.anexoId, ctx.user.openId);
      }),
  }),

  notifications: router({
    // Verificar e notificar análises incompletas
    checkIncompleteAnalyses: protectedProcedure
      .mutation(async () => {
        const { checkAndNotifyIncompleteAnalyses } = await import("./notifications");
        return await checkAndNotifyIncompleteAnalyses();
      }),

    // Verificar e notificar OKRs em risco
    checkOkrsAtRisk: protectedProcedure
      .mutation(async () => {
        const { checkAndNotifyOkrsAtRisk } = await import("./notifications");
        return await checkAndNotifyOkrsAtRisk();
      }),

    // Executar todas as verificações
    checkAll: protectedProcedure
      .mutation(async () => {
        const { checkAndNotifyIncompleteAnalyses, checkAndNotifyOkrsAtRisk } = await import("./notifications");
        const result1 = await checkAndNotifyIncompleteAnalyses();
        const result2 = await checkAndNotifyOkrsAtRisk();
        return {
          success: true,
          incompleteAnalyses: result1.count,
          okrsAtRisk: result2.count,
          total: result1.count + result2.count,
        };
      }),
  }),

  planoAcao: router({
    save: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        fatorId: z.number(),
        categoria: z.enum(["politico", "economico", "social", "tecnologico", "ambiental", "legal"]),
        estrategia: z.enum(["prevencao", "protecao", "mitigacao"]),
        descricaoEstrategia: z.string().min(1),
        urgencia: z.number().min(1).max(5),
        importancia: z.number().min(1).max(5),
        responsavel: z.string().optional(),
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
        status: z.enum(["planejado", "em_progresso", "concluido", "cancelado"]).default("planejado"),
        percentualConclusao: z.number().min(0).max(100).default(0),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { savePestelPlanoAcao } = await import("./db");
        const dataToSave = {
          ...input,
          dataInicio: input.dataInicio ? new Date(input.dataInicio) : null,
          dataFim: input.dataFim ? new Date(input.dataFim) : null,
        };
        return await savePestelPlanoAcao(dataToSave as any);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          estrategia: z.enum(["prevencao", "protecao", "mitigacao"]).optional(),
          descricaoEstrategia: z.string().optional(),
          urgencia: z.number().min(1).max(5).optional(),
          importancia: z.number().min(1).max(5).optional(),
          responsavel: z.string().optional(),
          dataInicio: z.string().optional(),
          dataFim: z.string().optional(),
          status: z.enum(["planejado", "em_progresso", "concluido", "cancelado"]).optional(),
          percentualConclusao: z.number().min(0).max(100).optional(),
          observacoes: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const { updatePestelPlanoAcao } = await import("./db");
        const dataToUpdate = {
          ...input.data,
          dataInicio: input.data.dataInicio ? new Date(input.data.dataInicio) : undefined,
          dataFim: input.data.dataFim ? new Date(input.data.dataFim) : undefined,
        };
        return await updatePestelPlanoAcao(input.id, dataToUpdate as any);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deletePestelPlanoAcao } = await import("./db");
        await deletePestelPlanoAcao(input.id);
        return { success: true };
      }),

    getByEmpresa: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        const { getPestelPlanoAcaoByEmpresa } = await import("./db");
        return await getPestelPlanoAcaoByEmpresa(input.empresaId);
      }),

    getByFator: protectedProcedure
      .input(z.object({ fatorId: z.number() }))
      .query(async ({ input }) => {
        const { getPestelPlanoAcaoByFator } = await import("./db");
        return await getPestelPlanoAcaoByFator(input.fatorId);
      }),

    getByCategoria: protectedProcedure
      .input(z.object({ empresaId: z.number(), categoria: z.string() }))
      .query(async ({ input }) => {
        const { getPestelPlanoAcaoByCategoria } = await import("./db");
        return await getPestelPlanoAcaoByCategoria(input.empresaId, input.categoria);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getPestelPlanoAcaoById } = await import("./db");
        return await getPestelPlanoAcaoById(input.id);
      }),

    gerarComIA: protectedProcedure
      .input(z.object({
        fator: z.string().min(1),
        categoria: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        const prompt = `Especialista em planejamento estrategico e gestao de riscos. Para o fator PESTEL (${input.categoria}: ${input.fator}), gere um plano de acao com 3 estrategias: Prevencao (evitar), Protecao (reduzir impacto), Mitigacao (minimizar efeitos). Para cada estrategia, 2-3 acoes especificas, mensuraveis e realistas. Retorne JSON com estrutura: {prevencao: [{titulo, descricao, responsavel, prazo}], protecao: [...], mitigacao: [...]}`;
        
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Voce eh um especialista em planejamento estrategico. Responda sempre em JSON valido."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        });

        try {
          let content = response.choices[0].message.content;
          if (typeof content !== "string") {
            throw new Error("Resposta da IA nao eh string");
          }
          
          // Remover markdown code blocks se existirem
          content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          
          // Tentar extrair JSON se estiver envolvido em texto
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            content = jsonMatch[0];
          }
          
          const planoAcao = JSON.parse(content);
          
          // Validar estrutura
          if (!planoAcao.prevencao || !planoAcao.protecao || !planoAcao.mitigacao) {
            throw new Error("Estrutura JSON invalida");
          }
          
          return planoAcao;
        } catch (error) {
          console.error("Erro ao gerar plano com IA:", error);
          throw new Error("Falha ao gerar plano com IA: " + (error instanceof Error ? error.message : "Erro desconhecido"));
        }
      }),
  }),

  orcamento: orcamentoRouter,
  metodologias: router({
    listar: publicProcedure.query(() => METODOLOGIAS_DISPONIVEIS),
    getByEmpresa: protectedProcedure
      .input(z.object({ empresaId: z.number() }))
      .query(async ({ input }) => {
        return getMetodologiasEmpresa(input.empresaId);
      }),
    salvar: protectedProcedure
      .input(z.object({
        empresaId: z.number(),
        metodologias: z.array(z.string()),
      }))
      .mutation(async ({ input }) => {
        return saveMetodologiasEmpresa(input.empresaId, input.metodologias);
      }),
  }),
});
export type AppRouter = typeof appRouter;
