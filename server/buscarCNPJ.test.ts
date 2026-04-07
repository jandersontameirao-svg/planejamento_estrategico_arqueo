/**
 * Testes de busca CNPJ — Integração SGC
 * Após a substituição funcional, buscarCNPJ é bloqueado (delegado ao SGC).
 * verificarCNPJ continua funcionando localmente para consulta somente leitura.
 */
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
    res: {} as TrpcContext["res"],
  };
}

describe("contratos.clientes.buscarCNPJ — bloqueado pelo SGC", () => {
  it("lança FORBIDDEN com mensagem de redirecionamento ao SGC", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.contratos.clientes.buscarCNPJ({ cnpj: "00000000000191" })
    ).rejects.toThrow(/SGC/);
  });

  it("lança FORBIDDEN mesmo com CNPJ curto (validação Zod antes do bloqueio)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.contratos.clientes.buscarCNPJ({ cnpj: "123" })
    ).rejects.toThrow(); // Pode ser Zod validation ou FORBIDDEN
  });
});

describe("contratos.clientes.verificarCNPJ — leitura local mantida", () => {
  it("formata o CNPJ corretamente", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.contratos.clientes.verificarCNPJ({ cnpj: "00000000000191" });
    expect(result).toHaveProperty("existe");
    expect(result).toHaveProperty("cnpjFormatado");
    expect(result.cnpjFormatado).toBe("00.000.000/0001-91");
  });

  it("retorna existe=false para CNPJ não cadastrado", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.contratos.clientes.verificarCNPJ({ cnpj: "99999999999999" });
    expect(result.existe).toBe(false);
    expect(result.cliente).toBeNull();
  });
});
