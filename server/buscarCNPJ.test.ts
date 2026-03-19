import { describe, expect, it, vi, beforeEach } from "vitest";
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

describe("contratos.clientes.buscarCNPJ", () => {
  it("rejeita CNPJ com menos de 14 dígitos", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.contratos.clientes.buscarCNPJ({ cnpj: "123" })
    ).rejects.toThrow("CNPJ inválido");
  });

  it("rejeita CNPJ com mais de 14 dígitos", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.contratos.clientes.buscarCNPJ({ cnpj: "123456789012345" })
    ).rejects.toThrow("CNPJ inválido");
  });

  it("aceita CNPJ formatado (com pontuação) e normaliza para 14 dígitos", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    // CNPJ da Receita Federal (válido para teste de formato)
    // Não vamos testar a chamada real à API, apenas que o CNPJ formatado é aceito
    // O teste pode falhar se a API externa estiver indisponível, por isso mockamos o fetch
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        cnpj: "00000000000191",
        razao_social: "BANCO DO BRASIL SA",
        nome_fantasia: "BANCO DO BRASIL",
        email: "",
        ddd_telefone_1: "61",
        telefone_1: "34934000",
        logradouro: "SAUN QUADRA 5 LOTE B TORRES I, II E III",
        numero: "S/N",
        complemento: "ANDAR 1 A 16 SALA 101 A 1601 ANDAR 1 A 16 SALA 101 A 1601",
        bairro: "ASA NORTE",
        municipio: "BRASILIA",
        uf: "DF",
        cep: "70040912",
        porte: "DEMAIS",
        natureza_juridica: "2038 - Sociedade Anônima Aberta",
        cnae_fiscal: 6422100,
        cnae_fiscal_descricao: "Bancos múltiplos, com carteira comercial",
        descricao_situacao_cadastral: "ATIVA",
        data_inicio_atividade: "1966-08-01",
        capital_social: 120000000000,
        qsa: [{ nome_socio: "JOAO SILVA", qualificacao_socio: "Diretor", cnpj_cpf_do_socio: "***123456**" }],
      }),
    } as any);

    try {
      const result = await caller.contratos.clientes.buscarCNPJ({ cnpj: "00.000.000/0001-91" });
      expect(result).toBeTruthy();
      expect((result as any).razaoSocial).toBe("BANCO DO BRASIL SA");
      expect((result as any).fonte).toBe("brasilapi");
      expect((result as any).cidade).toBe("BRASILIA");
      expect((result as any).estado).toBe("DF");
      expect((result as any).porte).toBe("DEMAIS");
      expect((result as any).situacaoCadastral).toBe("ATIVA");
      const socios = JSON.parse((result as any).socios);
      expect(socios).toHaveLength(1);
      expect(socios[0].nome).toBe("JOAO SILVA");
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("usa ReceitaWS como fallback quando BrasilAPI falha", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const originalFetch = global.fetch;
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      callCount++;
      if (url.includes("brasilapi")) {
        throw new Error("BrasilAPI indisponível");
      }
      // ReceitaWS responde
      return {
        ok: true,
        json: async () => ({
          status: "OK",
          cnpj: "00.000.000/0001-91",
          nome: "BANCO DO BRASIL SA",
          fantasia: "BANCO DO BRASIL",
          email: "",
          telefone: "(61) 3493-4000",
          logradouro: "SAUN QUADRA 5",
          numero: "S/N",
          complemento: "",
          bairro: "ASA NORTE",
          municipio: "BRASILIA",
          uf: "DF",
          cep: "70.040-912",
          porte: "DEMAIS",
          natureza_juridica: "2038 - Sociedade Anônima Aberta",
          atividade_principal: [{ code: "6422-1/00", text: "Bancos múltiplos, com carteira comercial" }],
          situacao: "ATIVA",
          abertura: "01/08/1966",
          capital_social: "R$ 120.000.000.000,00",
          qsa: [{ nome: "JOAO SILVA", qual: "Diretor" }],
        }),
      } as any;
    });

    try {
      const result = await caller.contratos.clientes.buscarCNPJ({ cnpj: "00000000000191" });
      expect(result).toBeTruthy();
      expect((result as any).fonte).toBe("receitaws");
      expect((result as any).razaoSocial).toBe("BANCO DO BRASIL SA");
    } finally {
      global.fetch = originalFetch;
    }
  });
});

describe("contratos.clientes.verificarCNPJ", () => {
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
