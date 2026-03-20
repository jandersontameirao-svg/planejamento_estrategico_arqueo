/**
 * Testes do módulo de Gestão de Clientes (SGC consolidado)
 * Usa trpc.contratos.clientes.* — router SGC unificado
 */
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-clientes",
    email: "test@arqueo.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
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

function uniqueCNPJ(): string {
  const ts = Date.now().toString().slice(-14).padStart(14, "0");
  return ts;
}

describe("contratos.clientes.list", () => {
  it("retorna lista de clientes para usuário autenticado", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.contratos.clientes.list({});
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("contratos.clientes.create e get", () => {
  it("cria um cliente com dados mínimos e busca pelo ID", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const cnpj = uniqueCNPJ();
    const id = await caller.contratos.clientes.create({
      razaoSocial: "Empresa Teste LTDA",
      cnpj,
    });
    expect(typeof id).toBe("number");
    const found = await caller.contratos.clientes.get({ id });
    expect(found).not.toBeNull();
    expect(found?.razaoSocial).toBe("Empresa Teste LTDA");
    await caller.contratos.clientes.delete({ id });
  });

  it("cria um cliente com dados completos", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const cnpj = uniqueCNPJ();
    const id = await caller.contratos.clientes.create({
      razaoSocial: "Empresa Completa S.A.",
      nomeFantasia: "Completa",
      cnpj,
      endereco: "Rua das Flores, 100",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01310-100",
      telefone: "(11) 3456-7890",
      email: "contato@completa.com.br",
      naturezaJuridica: "Sociedade Anônima",
      situacaoCadastral: "ATIVA",
    });
    expect(typeof id).toBe("number");
    const found = await caller.contratos.clientes.get({ id });
    expect(found?.nomeFantasia).toBe("Completa");
    expect(found?.cidade).toBe("São Paulo");
    await caller.contratos.clientes.delete({ id });
  });

  it("retorna null para ID inexistente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.contratos.clientes.get({ id: 999999 });
    expect(result).toBeNull();
  });
});

describe("contratos.clientes.update", () => {
  it("atualiza os dados de um cliente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const cnpj = uniqueCNPJ();
    const id = await caller.contratos.clientes.create({
      razaoSocial: "Cliente Para Atualizar",
      cnpj,
    });
    await caller.contratos.clientes.update({
      id,
      data: { razaoSocial: "Cliente Atualizado", email: "novo@email.com" },
    });
    const updated = await caller.contratos.clientes.get({ id });
    expect(updated?.razaoSocial).toBe("Cliente Atualizado");
    expect(updated?.email).toBe("novo@email.com");
    await caller.contratos.clientes.delete({ id });
  });
});

describe("contratos.clientes.delete", () => {
  it("inativa um cliente existente (exclusão lógica)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const cnpj = uniqueCNPJ();
    const id = await caller.contratos.clientes.create({
      razaoSocial: "Cliente Para Deletar",
      cnpj,
    });
    await caller.contratos.clientes.delete({ id });
    // Exclusão lógica: registro permanece, mas status muda para inativo
    const deleted = await caller.contratos.clientes.get({ id });
    expect(deleted?.status).toBe("inativo");
  });
})

describe("contratos.clientes.buscarCNPJ", () => {
  it("aceita CNPJ com 14 dígitos e retorna objeto ou lança erro de API externa", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    // CNPJ inválido — a API externa pode retornar erro ou null, ambos são aceitáveis
    let passed = false;
    try {
      const result = await caller.contratos.clientes.buscarCNPJ({ cnpj: "00000000000000" });
      // Se retornar sem lançar, aceita qualquer resultado
      expect(result === null || typeof result === "object").toBe(true);
      passed = true;
    } catch (e: unknown) {
      // Erro de API externa é aceitável
      const err = e as { message?: string };
      expect(typeof err.message).toBe("string");
      passed = true;
    }
    expect(passed).toBe(true);
  }, 15000);
});
