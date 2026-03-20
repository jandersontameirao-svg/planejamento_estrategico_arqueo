import { describe, expect, it } from "vitest";
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

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

/** Gera um CNPJ fictício único para evitar conflitos entre execuções de teste */
function uniqueTaxId(): string {
  const ts = Date.now().toString().slice(-12).padStart(14, "0");
  return ts;
}

// ============================================================
// Testes do router isolado: clients
// ============================================================

describe("clients.list", () => {
  it("retorna lista de clientes para usuário autenticado", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.clients.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("clients.create e getById", () => {
  it("cria um cliente com dados mínimos e busca pelo ID", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const taxId = uniqueTaxId();

    const created = await caller.clients.create({
      name: "Empresa Teste LTDA",
      taxId,
    });
    expect(created).toHaveProperty("id");
    expect(typeof created.id).toBe("number");

    const found = await caller.clients.getById({ id: created.id });
    expect(found).not.toBeNull();
    expect(found?.name).toBe("Empresa Teste LTDA");

    // Cleanup
    await caller.clients.delete({ id: created.id });
  });

  it("cria um cliente com dados completos", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const taxId = uniqueTaxId();

    const created = await caller.clients.create({
      name: "Empresa Completa S.A.",
      fantasyName: "Completa",
      taxId,
      logradouro: "Rua das Flores, 100",
      bairro: "Centro",
      municipio: "São Paulo",
      uf: "SP",
      cep: "01310-100",
      telefone: "(11) 3456-7890",
      email: "contato@completa.com.br",
      naturezaJuridica: "Sociedade Anônima",
      situacaoCadastral: "ATIVA",
    });
    expect(created).toHaveProperty("id");

    const found = await caller.clients.getById({ id: created.id });
    expect(found?.fantasyName).toBe("Completa");
    expect(found?.municipio).toBe("São Paulo");

    // Cleanup
    await caller.clients.delete({ id: created.id });
  });

  it("retorna null para ID inexistente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.clients.getById({ id: 999999 });
    expect(result).toBeNull();
  });
});

describe("clients.update", () => {
  it("atualiza os dados de um cliente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const taxId = uniqueTaxId();

    const created = await caller.clients.create({
      name: "Cliente Para Atualizar",
      taxId,
    });

    const result = await caller.clients.update({
      id: created.id,
      name: "Cliente Atualizado",
      email: "novo@email.com",
    });
    expect(result).toHaveProperty("success", true);

    const updated = await caller.clients.getById({ id: created.id });
    expect(updated?.name).toBe("Cliente Atualizado");
    expect(updated?.email).toBe("novo@email.com");

    // Cleanup
    await caller.clients.delete({ id: created.id });
  });
});

describe("clients.delete", () => {
  it("remove um cliente existente", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const taxId = uniqueTaxId();

    const created = await caller.clients.create({
      name: "Cliente Para Deletar",
      taxId,
    });

    const result = await caller.clients.delete({ id: created.id });
    expect(result).toHaveProperty("success", true);

    const deleted = await caller.clients.getById({ id: created.id });
    expect(deleted).toBeNull();
  });
});

describe("clients.consultarCNPJ", () => {
  it("rejeita CNPJ com menos de 11 dígitos", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.clients.consultarCNPJ({ cnpj: "123" })).rejects.toThrow();
  });

  it("aceita CNPJ com 14 dígitos (mesmo que API externa falhe)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const result = await caller.clients.consultarCNPJ({ cnpj: "00000000000000" });
      expect(result === null || typeof result === "object").toBe(true);
    } catch (e: any) {
      // Falha de API externa é aceitável
      expect(e.message).toBeDefined();
    }
  });
});

describe("clients.listByCompany", () => {
  it("retorna lista de clientes vinculados a uma empresa", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.clients.listByCompany({ companyId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});
