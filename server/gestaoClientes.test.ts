/**
 * Testes do módulo de Gestão de Clientes — Integração SGC
 * Após a substituição funcional, operações de escrita são bloqueadas (FORBIDDEN)
 * e leituras são delegadas ao SGC via gateway.
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

describe("contratos.clientes.list (leitura via SGC)", () => {
  it("retorna array (vazio se SGC indisponível, dados se disponível)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.contratos.clientes.list({});
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("contratos.clientes.get (leitura via SGC)", () => {
  it("retorna null para ID inexistente sem lançar erro", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.contratos.clientes.get({ id: 999999 });
    expect(result).toBeNull();
  });
});

describe("contratos.clientes — operações de escrita bloqueadas pelo SGC", () => {
  it("create lança FORBIDDEN com mensagem de redirecionamento ao SGC", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.contratos.clientes.create({
        razaoSocial: "Empresa Teste LTDA",
        cnpj: "00000000000000",
      })
    ).rejects.toThrow(/SGC/);
  });

  it("update lança FORBIDDEN com mensagem de redirecionamento ao SGC", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.contratos.clientes.update({
        id: 1,
        data: { razaoSocial: "Novo Nome" },
      })
    ).rejects.toThrow(/SGC/);
  });

  it("delete lança FORBIDDEN com mensagem de redirecionamento ao SGC", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.contratos.clientes.delete({ id: 1 })
    ).rejects.toThrow(/SGC/);
  });

  it("vincularEmpresa lança FORBIDDEN", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.contratos.clientes.vincularEmpresa({ clienteId: 1, empresaId: 1 })
    ).rejects.toThrow(/SGC/);
  });

  it("desvincularEmpresa lança FORBIDDEN", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.contratos.clientes.desvincularEmpresa({ clienteId: 1, empresaId: 1 })
    ).rejects.toThrow(/SGC/);
  });
});

describe("contratos.clientes.buscarCNPJ — bloqueado pelo SGC", () => {
  it("lança FORBIDDEN com mensagem de redirecionamento ao SGC", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.contratos.clientes.buscarCNPJ({ cnpj: "00000000000000" })
    ).rejects.toThrow(/SGC/);
  });
});
