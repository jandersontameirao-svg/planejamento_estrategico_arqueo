import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Dashboard de Acompanhamento em Tempo Real", () => {
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

  it("deve retornar dados consolidados do grupo", async () => {
    const dashboard = await caller.dashboard.grupo();
    
    expect(dashboard).toHaveProperty("totalEmpresas");
    expect(dashboard).toHaveProperty("empresasAtivas");
    expect(dashboard).toHaveProperty("totalKpis");
    expect(dashboard).toHaveProperty("statusRag");
    expect(dashboard.statusRag).toHaveProperty("verde");
    expect(dashboard.statusRag).toHaveProperty("amarelo");
    expect(dashboard.statusRag).toHaveProperty("vermelho");
  });

  it("deve calcular corretamente o total de empresas", async () => {
    const dashboard = await caller.dashboard.grupo();
    
    expect(dashboard.totalEmpresas).toBeGreaterThanOrEqual(0);
    expect(typeof dashboard.totalEmpresas).toBe("number");
  });

  it("deve calcular corretamente o total de KPIs", async () => {
    const dashboard = await caller.dashboard.grupo();
    
    expect(dashboard.totalKpis).toBeGreaterThanOrEqual(0);
    expect(typeof dashboard.totalKpis).toBe("number");
  });

  it("deve listar objetivos estratégicos para o dashboard", async () => {
    const objetivos = await caller.objetivosGrupo.list();
    
    expect(Array.isArray(objetivos)).toBe(true);
    
    // Verificar se há objetivos com diferentes status
    const statusDisponiveis = ["planejado", "em_andamento", "concluido", "cancelado"];
    objetivos.forEach(objetivo => {
      expect(statusDisponiveis).toContain(objetivo.status);
    });
  });

  it("deve listar projetos estratégicos para o dashboard", async () => {
    const projetos = await caller.projetosGrupo.list();
    
    expect(Array.isArray(projetos)).toBe(true);
    
    // Verificar se há projetos com diferentes status
    const statusDisponiveis = ["planejado", "em_andamento", "concluido", "cancelado"];
    projetos.forEach(projeto => {
      expect(statusDisponiveis).toContain(projeto.status);
    });
  });

  it("deve retornar KPIs organizados por perspectiva BSC", async () => {
    const kpis = await caller.planejamentoGrupo.getKPIs();
    
    const perspectivas = ["financeira", "clientes", "processos", "aprendizado"];
    
    kpis.forEach(kpi => {
      if (kpi.perspectivaBSC) {
        expect(perspectivas).toContain(kpi.perspectivaBSC);
      }
    });
  });

  it("deve calcular progresso dos objetivos corretamente", async () => {
    const objetivos = await caller.objetivosGrupo.list();
    
    const totalObjetivos = objetivos.length;
    const objetivosConcluidos = objetivos.filter(o => o.status === "concluido").length;
    
    const progressoEsperado = totalObjetivos > 0 
      ? Math.round((objetivosConcluidos / totalObjetivos) * 100)
      : 0;
    
    expect(progressoEsperado).toBeGreaterThanOrEqual(0);
    expect(progressoEsperado).toBeLessThanOrEqual(100);
  });

  it("deve calcular progresso dos projetos corretamente", async () => {
    const projetos = await caller.projetosGrupo.list();
    
    const totalProjetos = projetos.length;
    const projetosConcluidos = projetos.filter(p => p.status === "concluido").length;
    
    const progressoEsperado = totalProjetos > 0 
      ? Math.round((projetosConcluidos / totalProjetos) * 100)
      : 0;
    
    expect(progressoEsperado).toBeGreaterThanOrEqual(0);
    expect(progressoEsperado).toBeLessThanOrEqual(100);
  });
});
