import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

function createAuthContext() {
  return {
    user: {
      id: 1,
      openId: "test-open-id",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "google" as const,
      role: "admin" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  };
}

describe("orcamento.getAnaliseCustos", () => {
  it("returns structured analysis data for a valid empresa/ano", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Arqueoproject (empresaId=1) has budget data for 2026
    const result = await caller.orcamento.getAnaliseCustos({
      empresaId: 1,
      ano: 2026,
    });

    // Should return a valid analysis structure
    expect(result).toBeDefined();
    expect(result.versaoId).toBeTruthy();
    expect(Array.isArray(result.itens)).toBe(true);
    expect(result.classificacaoABC).toBeDefined();
    expect(result.classificacaoABC.A).toBeDefined();
    expect(result.classificacaoABC.B).toBeDefined();
    expect(result.classificacaoABC.C).toBeDefined();
    expect(Array.isArray(result.alertas)).toBe(true);
    expect(result.resumo).toBeDefined();
  });

  it("returns ABC classification with correct distribution", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orcamento.getAnaliseCustos({
      empresaId: 1,
      ano: 2026,
    });

    // ABC should cover all items
    const totalABC = result.classificacaoABC.A.length + result.classificacaoABC.B.length + result.classificacaoABC.C.length;
    expect(totalABC).toBe(result.itens.length);

    // Class A items should have the highest individual values
    if (result.classificacaoABC.A.length > 0 && result.classificacaoABC.C.length > 0) {
      const minA = Math.min(...result.classificacaoABC.A.map((i: any) => i.valor));
      const maxC = Math.max(...result.classificacaoABC.C.map((i: any) => i.valor));
      expect(minA).toBeGreaterThanOrEqual(maxC);
    }
  });

  it("returns empty data for non-existent empresa", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orcamento.getAnaliseCustos({
      empresaId: 999999,
      ano: 2026,
    });

    expect(result.versaoId).toBeNull();
    expect(result.itens).toHaveLength(0);
    expect(result.resumo).toBeNull();
  });

  it("returns resumo with correct totals", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orcamento.getAnaliseCustos({
      empresaId: 1,
      ano: 2026,
    });

    if (result.resumo) {
      // Total fixo + variavel should equal total executado
      expect(result.resumo.totalFixo + result.resumo.totalVariavel).toBeCloseTo(result.resumo.totalExecutado, 0);

      // Percentual should be consistent
      if (result.resumo.totalPlanejado > 0) {
        const expectedPercent = (result.resumo.totalExecutado / result.resumo.totalPlanejado) * 100;
        expect(result.resumo.percentualExecucao).toBeCloseTo(expectedPercent, 1);
      }

      // ABC counts should match
      expect(result.resumo.totalItensA + result.resumo.totalItensB + result.resumo.totalItensC).toBe(result.itens.length);
    }
  });

  it("returns items with valid tendencia values", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orcamento.getAnaliseCustos({
      empresaId: 1,
      ano: 2026,
    });

    const validTendencias = ["crescente", "estavel", "decrescente", "sem_dados"];
    for (const item of result.itens) {
      expect(validTendencias).toContain(item.tendencia);
      expect(["fixo", "variavel"]).toContain(item.natureza);
      expect(["A", "B", "C"]).toContain(item.classificacaoABC);
      expect(["alta", "media", "baixa"]).toContain(item.prioridade);
    }
  });
});
