import { describe as baseDescribe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const describe = process.env.DATABASE_URL ? baseDescribe : baseDescribe.skip;

describe("Objetivos Estratégicos do Grupo", () => {
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

  it("deve criar um objetivo estratégico", async () => {
    const objetivo = await caller.objetivosGrupo.create({
      titulo: "Aumentar rentabilidade",
      descricao: "Aumentar a rentabilidade do grupo em 20%",
      perspectivaBSC: "financeira",
      prazo: "2025-12-31",
      status: "planejado",
    });

    expect(objetivo).toHaveProperty("success", true);
  });

  it("deve listar objetivos estratégicos", async () => {
    const objetivos = await caller.objetivosGrupo.list();
    expect(Array.isArray(objetivos)).toBe(true);
  });

  it("deve atualizar um objetivo estratégico", async () => {
    // Primeiro criar um objetivo
    await caller.objetivosGrupo.create({
      titulo: "Objetivo para atualizar",
      descricao: "Descrição original",
      perspectivaBSC: "clientes",
      status: "planejado",
    });

    // Listar para pegar o ID
    const objetivos = await caller.objetivosGrupo.list();
    const objetivo = objetivos.find(o => o.titulo === "Objetivo para atualizar");
    
    if (objetivo) {
      const resultado = await caller.objetivosGrupo.update({
        id: objetivo.id,
        titulo: "Objetivo atualizado",
        status: "em_andamento",
      });

      expect(resultado).toHaveProperty("success", true);
    }
  });

  it("deve vincular e desvincular KPI a objetivo", async () => {
    // Criar um KPI
    await caller.planejamentoGrupo.createKPI({
      nome: "KPI Teste Vinculação",
      unidadeMedida: "R$",
      tipo: "financeiro",
      frequencia: "mensal",
      perspectivaBSC: "financeira",
    });

    // Criar um objetivo
    await caller.objetivosGrupo.create({
      titulo: "Objetivo para vincular KPI",
      perspectivaBSC: "financeira",
      status: "planejado",
    });

    // Buscar IDs
    const kpis = await caller.planejamentoGrupo.getKPIs();
    const kpi = kpis.find(k => k.nome === "KPI Teste Vinculação");

    const objetivos = await caller.objetivosGrupo.list();
    const objetivo = objetivos.find(o => o.titulo === "Objetivo para vincular KPI");

    if (kpi && objetivo) {
      // Vincular
      const vinculacao = await caller.objetivosGrupo.vincularKPI({
        objetivoId: objetivo.id,
        kpiId: kpi.id,
      });
      expect(vinculacao).toHaveProperty("success", true);

      // Verificar vinculação
      const kpisVinculados = await caller.objetivosGrupo.getKPIsVinculados({
        objetivoId: objetivo.id,
      });
      expect(kpisVinculados.length).toBeGreaterThan(0);

      // Desvincular
      const desvinculacao = await caller.objetivosGrupo.desvincularKPI({
        objetivoId: objetivo.id,
        kpiId: kpi.id,
      });
      expect(desvinculacao).toHaveProperty("success", true);
    }
  });
});
