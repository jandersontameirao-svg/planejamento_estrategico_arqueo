import { describe as baseDescribe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const describe = process.env.DATABASE_URL ? baseDescribe : baseDescribe.skip;

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("orcamento.getRelatorioDetalhado", () => {
  it("returns structured report data for a valid empresa/ano", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Arqueoproject (empresaId=1) has budget data for 2026
    const result = await caller.orcamento.getRelatorioDetalhado({
      empresaId: 1,
      ano: 2026,
    });

    // Should return a valid report structure
    expect(result).toHaveProperty("versaoId");
    expect(result).toHaveProperty("versaoNome");
    expect(result).toHaveProperty("categorias");
    expect(result).toHaveProperty("totais");

    // versaoId should exist since we have budget data
    expect(result.versaoId).toBeTruthy();

    // categorias should be an array
    expect(Array.isArray(result.categorias)).toBe(true);
    expect(result.categorias.length).toBeGreaterThan(0);

    // Each category should have the expected structure
    const firstCat = result.categorias[0];
    expect(firstCat).toHaveProperty("categoriaId");
    expect(firstCat).toHaveProperty("categoriaNome");
    expect(firstCat).toHaveProperty("subcategorias");
    expect(firstCat).toHaveProperty("meses");
    expect(firstCat).toHaveProperty("totalPlanejado");
    expect(firstCat).toHaveProperty("totalExecutado");
    expect(firstCat).toHaveProperty("totalVariacao");
    expect(firstCat).toHaveProperty("totalPercentual");

    // Meses should have 12 entries
    expect(firstCat.meses).toHaveLength(12);
    expect(firstCat.meses[0]).toHaveProperty("mes");
    expect(firstCat.meses[0]).toHaveProperty("planejado");
    expect(firstCat.meses[0]).toHaveProperty("executado");
    expect(firstCat.meses[0]).toHaveProperty("variacao");
    expect(firstCat.meses[0]).toHaveProperty("percentual");

    // Totais should have the expected structure
    expect(result.totais).toHaveProperty("meses");
    expect(result.totais!.meses).toHaveLength(12);
    expect(result.totais).toHaveProperty("totalPlanejado");
    expect(result.totais).toHaveProperty("totalExecutado");
    expect(result.totais).toHaveProperty("totalVariacao");
    expect(result.totais).toHaveProperty("totalPercentual");

    // totalPlanejado should be > 0 since we imported budget data
    expect(result.totais!.totalPlanejado).toBeGreaterThan(0);
  });

  it("returns empty report for empresa with no budget", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Use a non-existent empresa
    const result = await caller.orcamento.getRelatorioDetalhado({
      empresaId: 999999,
      ano: 2026,
    });

    expect(result.versaoId).toBeNull();
    expect(result.categorias).toEqual([]);
    expect(result.totais).toBeNull();
  });

  it("supports filtering by categoriaId", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First get full report to find a valid categoriaId
    const fullReport = await caller.orcamento.getRelatorioDetalhado({
      empresaId: 1,
      ano: 2026,
    });

    if (fullReport.categorias.length > 1) {
      const catId = fullReport.categorias[0].categoriaId;

      // Filter by that category
      const filtered = await caller.orcamento.getRelatorioDetalhado({
        empresaId: 1,
        ano: 2026,
        categoriaId: catId,
      });

      // Should have fewer or equal categories
      expect(filtered.categorias.length).toBeLessThanOrEqual(fullReport.categorias.length);
      // All returned categories should match the filter
      for (const cat of filtered.categorias) {
        expect(cat.categoriaId).toBe(catId);
      }
    }
  });

  it("calculates variacao correctly (executado - planejado)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orcamento.getRelatorioDetalhado({
      empresaId: 1,
      ano: 2026,
    });

    if (result.totais) {
      // Variacao should be executado - planejado
      const expectedVariacao = result.totais.totalExecutado - result.totais.totalPlanejado;
      expect(result.totais.totalVariacao).toBeCloseTo(expectedVariacao, 2);

      // Percentual should be (executado / planejado) * 100
      if (result.totais.totalPlanejado > 0) {
        const expectedPct = (result.totais.totalExecutado / result.totais.totalPlanejado) * 100;
        expect(result.totais.totalPercentual).toBeCloseTo(expectedPct, 2);
      }
    }
  });
});
