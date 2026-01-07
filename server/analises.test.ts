import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { savePestelFatores, getPestelFatoresByEmpresa, saveSwotItems, getSwotItemsByEmpresa, saveOkrObjectives, getOkrObjectivesByEmpresa } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("analises.savePestel & analises.getPestel", () => {
  it("deve salvar e recuperar fatores PESTEL corretamente", async () => {
    const empresaId = Math.floor(Math.random() * 1000000) + 1000; // ID único
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const fatores = [
      {
        categoria: "politico" as const,
        descricao: "Mudanças na legislação trabalhista",
        impacto: 4,
        probabilidade: 3,
      },
      {
        categoria: "economico" as const,
        descricao: "Inflação crescente no setor",
        impacto: 5,
        probabilidade: 4,
      },
      {
        categoria: "social" as const,
        descricao: "Mudança no comportamento do consumidor",
        impacto: 3,
        probabilidade: 5,
      },
    ];

    // Salvar fatores
    const saveResult = await caller.analises.savePestel({
      empresaId,
      fatores,
    });

    expect(saveResult).toHaveProperty("success", true);

    // Recuperar fatores
    const retrievedFatores = await caller.analises.getPestel({ empresaId });

    expect(Array.isArray(retrievedFatores)).toBe(true);
    expect(retrievedFatores.length).toBe(3);
    
    // Verificar se os fatores salvos estão presentes
    const politicoFator = retrievedFatores.find((f: any) => f.categoria === "politico");
    expect(politicoFator).toBeDefined();
    expect(politicoFator?.descricao).toBe("Mudanças na legislação trabalhista");
    expect(politicoFator?.impacto).toBe(4);
    expect(politicoFator?.probabilidade).toBe(3);
  });

  it("deve substituir fatores existentes ao salvar novamente", async () => {
    const empresaId = Math.floor(Math.random() * 1000000) + 1000; // ID único
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Primeira salvada
    await caller.analises.savePestel({
      empresaId,
      fatores: [
        {
          categoria: "tecnologico" as const,
          descricao: "Fator antigo",
          impacto: 2,
          probabilidade: 2,
        },
      ],
    });

    // Segunda salvada (deve substituir)
    await caller.analises.savePestel({
      empresaId,
      fatores: [
        {
          categoria: "ambiental" as const,
          descricao: "Fator novo",
          impacto: 5,
          probabilidade: 5,
        },
      ],
    });

    const fatores = await caller.analises.getPestel({ empresaId });
    
    // Deve ter apenas 1 fator (o novo)
    expect(fatores.length).toBe(1);
    expect(fatores[0]?.categoria).toBe("ambiental");
    expect(fatores[0]?.descricao).toBe("Fator novo");
  });
});

describe("analises.saveSwot & analises.getSwot", () => {
  it("deve salvar e recuperar itens SWOT corretamente", async () => {
    const empresaId = Math.floor(Math.random() * 1000000) + 1000; // ID único
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const items = [
      { tipo: "forca" as const, descricao: "Equipe qualificada" },
      { tipo: "fraqueza" as const, descricao: "Falta de capital" },
      { tipo: "oportunidade" as const, descricao: "Mercado em expansão" },
      { tipo: "ameaca" as const, descricao: "Concorrência forte" },
    ];

    // Salvar itens
    const saveResult = await caller.analises.saveSwot({
      empresaId,
      items,
    });

    expect(saveResult).toHaveProperty("success", true);

    // Recuperar itens
    const retrievedItems = await caller.analises.getSwot({ empresaId });

    expect(Array.isArray(retrievedItems)).toBe(true);
    expect(retrievedItems.length).toBe(4);

    // Verificar tipos
    const forcas = retrievedItems.filter((i: any) => i.tipo === "forca");
    const fraquezas = retrievedItems.filter((i: any) => i.tipo === "fraqueza");
    const oportunidades = retrievedItems.filter((i: any) => i.tipo === "oportunidade");
    const ameacas = retrievedItems.filter((i: any) => i.tipo === "ameaca");

    expect(forcas.length).toBe(1);
    expect(fraquezas.length).toBe(1);
    expect(oportunidades.length).toBe(1);
    expect(ameacas.length).toBe(1);

    expect(forcas[0]?.descricao).toBe("Equipe qualificada");
  });
});

describe("analises.saveOkr & analises.getOkr", () => {
  it("deve salvar e recuperar objetivos OKR corretamente", async () => {
    const empresaId = Math.floor(Math.random() * 1000000) + 1000; // ID único
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const objectives = [
      {
        objetivo: "Aumentar receita em 30%",
        descricao: "Foco em novos clientes",
        resultadoChave1: "Fechar 50 novos contratos",
        metaResultado1: "50",
        resultadoChave2: "Aumentar ticket médio em 20%",
        metaResultado2: "20%",
        resultadoChave3: "Reduzir churn para 5%",
        metaResultado3: "5%",
      },
      {
        objetivo: "Melhorar satisfação do cliente",
        descricao: "Aumentar NPS",
        resultadoChave1: "NPS acima de 70",
        metaResultado1: "70",
      },
    ];

    // Salvar objetivos
    const saveResult = await caller.analises.saveOkr({
      empresaId,
      objectives,
    });

    expect(saveResult).toHaveProperty("success", true);

    // Recuperar objetivos
    const retrievedObjectives = await caller.analises.getOkr({ empresaId });

    expect(Array.isArray(retrievedObjectives)).toBe(true);
    expect(retrievedObjectives.length).toBe(2);

    // Verificar primeiro objetivo
    const primeiroObjetivo = retrievedObjectives.find((o: any) => o.objetivo === "Aumentar receita em 30%");
    expect(primeiroObjetivo).toBeDefined();
    expect(primeiroObjetivo?.resultadoChave1).toBe("Fechar 50 novos contratos");
    expect(primeiroObjetivo?.metaResultado1).toBe("50");
    expect(primeiroObjetivo?.resultadoChave2).toBe("Aumentar ticket médio em 20%");
  });

  it("deve lidar com objetivos sem todos os key results", async () => {
    const empresaId = Math.floor(Math.random() * 1000000) + 1000; // ID único
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const objectives = [
      {
        objetivo: "Objetivo simples",
        descricao: "Apenas um KR",
        resultadoChave1: "KR único",
        metaResultado1: "100",
      },
    ];

    await caller.analises.saveOkr({
      empresaId,
      objectives,
    });

    const retrieved = await caller.analises.getOkr({ empresaId });
    
    expect(retrieved.length).toBe(1);
    expect(retrieved[0]?.resultadoChave1).toBe("KR único");
    expect(retrieved[0]?.resultadoChave2).toBeNull();
    expect(retrieved[0]?.resultadoChave3).toBeNull();
  });
});
