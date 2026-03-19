import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("avaliacaoContratos.metodologias", () => {
  it("cria uma metodologia e retorna o id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.avaliacaoContratos.metodologias.create({
      empresaId: 9999,
      nome: "Metodologia Teste Vitest",
      tipo: "customizada",
      descricao: "Teste automatizado",
      escalaMin: 0,
      escalaMax: 10,
      notaMinima: "7.00",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
    expect(result.id).toBeGreaterThan(0);
  });

  it("lista metodologias de uma empresa", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.avaliacaoContratos.metodologias.list({ empresaId: 9999 });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});

describe("avaliacaoContratos.grupos", () => {
  it("cria um grupo em uma metodologia existente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const met = await caller.avaliacaoContratos.metodologias.create({
      empresaId: 9998,
      nome: "Metodologia para Grupos",
      tipo: "customizada",
      escalaMin: 0,
      escalaMax: 10,
      notaMinima: "7.00",
    });

    const grupo = await caller.avaliacaoContratos.grupos.create({
      metodologiaId: met.id,
      nome: "Grupo Qualidade",
      peso: "1.50",
      cor: "#3B82F6",
    });

    expect(grupo).toHaveProperty("id");
    expect(grupo.id).toBeGreaterThan(0);
  });
});

describe("avaliacaoContratos.criterios", () => {
  it("cria um criterio em um grupo existente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const met = await caller.avaliacaoContratos.metodologias.create({
      empresaId: 9997,
      nome: "Metodologia para Criterios",
      tipo: "customizada",
      escalaMin: 0,
      escalaMax: 10,
      notaMinima: "7.00",
    });

    const grupo = await caller.avaliacaoContratos.grupos.create({
      metodologiaId: met.id,
      nome: "Grupo Tecnico",
      peso: "1.00",
    });

    const criterio = await caller.avaliacaoContratos.criterios.create({
      metodologiaId: met.id,
      grupoId: grupo.id,
      titulo: "Qualidade das Entregas",
      descricao: "Avalia a qualidade dos artefatos entregues",
      peso: "2.00",
    });

    expect(criterio).toHaveProperty("id");
    expect(criterio.id).toBeGreaterThan(0);
  });
});

describe("avaliacaoContratos.avaliacoes", () => {
  it("cria uma avaliacao e retorna o id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const met = await caller.avaliacaoContratos.metodologias.create({
      empresaId: 9996,
      nome: "Metodologia Avaliacao",
      tipo: "customizada",
      escalaMin: 0,
      escalaMax: 10,
      notaMinima: "7.00",
    });

    const avaliacao = await caller.avaliacaoContratos.avaliacoes.create({
      contratoId: 9999,
      empresaId: 9996,
      metodologiaId: met.id,
      titulo: "Avaliacao Q1 2025",
      descricao: "Avaliacao trimestral",
      periodo: "Q1 2025",
    });

    expect(avaliacao).toHaveProperty("id");
    expect(avaliacao.id).toBeGreaterThan(0);
  });

  it("lista avaliacoes de um contrato", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.avaliacaoContratos.avaliacoes.list({ contratoId: 9999 });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});

describe("avaliacaoContratos.avaliadores", () => {
  it("adiciona um avaliador a uma avaliacao", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const met = await caller.avaliacaoContratos.metodologias.create({
      empresaId: 9995,
      nome: "Metodologia Avaliadores",
      tipo: "customizada",
      escalaMin: 0,
      escalaMax: 10,
      notaMinima: "7.00",
    });

    const avaliacao = await caller.avaliacaoContratos.avaliacoes.create({
      contratoId: 9998,
      empresaId: 9995,
      metodologiaId: met.id,
      titulo: "Avaliacao com Avaliadores",
    });

    const avaliador = await caller.avaliacaoContratos.avaliadores.create({
      avaliacaoId: avaliacao.id,
      nome: "Joao Silva",
      email: "joao@example.com",
      cargo: "Gerente",
      tipo: "interno",
    });

    expect(avaliador).toHaveProperty("id");
    expect(avaliador.id).toBeGreaterThan(0);
  });
});
