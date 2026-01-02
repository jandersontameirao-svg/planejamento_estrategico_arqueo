import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Projetos Estratégicos do Grupo", () => {
  const mockContext: TrpcContext = {
    user: {
      id: "test-user-id",
      openId: "test-open-id",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
    },
  };

  const caller = appRouter.createCaller(mockContext);

  it("deve criar um projeto estratégico", async () => {
    const projeto = await caller.projetosGrupo.create({
      nome: "Implementação de ERP",
      descricao: "Implementar novo sistema ERP para todas as empresas",
      dataInicio: "2025-01-01",
      dataFim: "2025-12-31",
      status: "planejado",
      responsavel: "João Silva",
    });

    expect(projeto).toHaveProperty("success", true);
  });

  it("deve listar projetos estratégicos", async () => {
    const projetos = await caller.projetosGrupo.list();
    expect(Array.isArray(projetos)).toBe(true);
  });

  it("deve atualizar um projeto estratégico", async () => {
    // Criar projeto
    await caller.projetosGrupo.create({
      nome: "Projeto para atualizar",
      descricao: "Descrição original",
      status: "planejado",
    });

    // Listar para pegar o ID
    const projetos = await caller.projetosGrupo.list();
    const projeto = projetos.find(p => p.nome === "Projeto para atualizar");
    
    if (projeto) {
      const resultado = await caller.projetosGrupo.update({
        id: projeto.id,
        nome: "Projeto atualizado",
        status: "em_andamento",
      });

      expect(resultado).toHaveProperty("success", true);
    }
  });

  it("deve vincular e desvincular KPI a projeto", async () => {
    // Criar um KPI
    await caller.planejamentoGrupo.createKPI({
      nome: "KPI Teste Projeto",
      unidadeMedida: "%",
      tipo: "processo",
      frequencia: "mensal",
      perspectivaBSC: "processos",
    });

    // Criar um projeto
    await caller.projetosGrupo.create({
      nome: "Projeto para vincular KPI",
      status: "planejado",
    });

    // Buscar IDs
    const kpis = await caller.planejamentoGrupo.getKPIs();
    const kpi = kpis.find(k => k.nome === "KPI Teste Projeto");

    const projetos = await caller.projetosGrupo.list();
    const projeto = projetos.find(p => p.nome === "Projeto para vincular KPI");

    if (kpi && projeto) {
      // Vincular
      const vinculacao = await caller.projetosGrupo.vincularKPI({
        projetoId: projeto.id,
        kpiId: kpi.id,
      });
      expect(vinculacao).toHaveProperty("success", true);

      // Verificar vinculação
      const kpisVinculados = await caller.projetosGrupo.getKPIsVinculados({
        projetoId: projeto.id,
      });
      expect(kpisVinculados.length).toBeGreaterThan(0);

      // Desvincular
      const desvinculacao = await caller.projetosGrupo.desvincularKPI({
        projetoId: projeto.id,
        kpiId: kpi.id,
      });
      expect(desvinculacao).toHaveProperty("success", true);
    }
  });

  it("deve deletar um projeto estratégico", async () => {
    // Criar projeto
    await caller.projetosGrupo.create({
      nome: "Projeto para deletar",
      status: "cancelado",
    });

    // Listar para pegar o ID
    const projetos = await caller.projetosGrupo.list();
    const projeto = projetos.find(p => p.nome === "Projeto para deletar");
    
    if (projeto) {
      const resultado = await caller.projetosGrupo.delete({
        id: projeto.id,
      });

      expect(resultado).toHaveProperty("success", true);

      // Verificar se foi deletado
      const projetosAposDelete = await caller.projetosGrupo.list();
      const projetoDeletado = projetosAposDelete.find(p => p.id === projeto.id);
      expect(projetoDeletado).toBeUndefined();
    }
  });
});
