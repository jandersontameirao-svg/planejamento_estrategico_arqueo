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

});

export type AppRouter = typeof appRouter;
