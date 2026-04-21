import { describe, it, expect } from "vitest";

// Test the LINHAS_DRE constant structure
describe("DRE Module", () => {
  it("should export LINHAS_DRE with correct structure", async () => {
    const { LINHAS_DRE } = await import("./routers/dre");
    expect(LINHAS_DRE).toBeDefined();
    expect(Array.isArray(LINHAS_DRE)).toBe(true);
    expect(LINHAS_DRE.length).toBeGreaterThan(10);

    // Verify each line has required fields
    for (const linha of LINHAS_DRE) {
      expect(linha).toHaveProperty("id");
      expect(linha).toHaveProperty("nome");
      expect(linha).toHaveProperty("ordem");
      expect(typeof linha.id).toBe("string");
      expect(typeof linha.nome).toBe("string");
      expect(typeof linha.ordem).toBe("number");
    }
  });

  it("should have unique IDs for all DRE lines", async () => {
    const { LINHAS_DRE } = await import("./routers/dre");
    const ids = LINHAS_DRE.map((l: any) => l.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have correct order sequence", async () => {
    const { LINHAS_DRE } = await import("./routers/dre");
    const ordens = LINHAS_DRE.map((l: any) => l.ordem);
    for (let i = 1; i < ordens.length; i++) {
      expect(ordens[i]).toBeGreaterThanOrEqual(ordens[i - 1]);
    }
  });

  it("should include essential DRE lines", async () => {
    const { LINHAS_DRE } = await import("./routers/dre");
    const ids = LINHAS_DRE.map((l: any) => l.id);
    
    // Essential lines that must exist
    expect(ids).toContain("receita_bruta");
    expect(ids).toContain("deducoes_receita");
    expect(ids).toContain("receita_liquida");
    expect(ids).toContain("lucro_bruto");
    expect(ids).toContain("ebitda");
    expect(ids).toContain("ebit");
    expect(ids).toContain("lucro_liquido");
  });

  it("should have calculated lines marked correctly", async () => {
    const { LINHAS_DRE } = await import("./routers/dre");
    
    // receita_liquida should be calculated
    const receitaLiquida = LINHAS_DRE.find((l: any) => l.id === "receita_liquida");
    expect(receitaLiquida).toBeDefined();
    expect("calculada" in receitaLiquida!).toBe(true);
    
    // ebitda should be calculated
    const ebitda = LINHAS_DRE.find((l: any) => l.id === "ebitda");
    expect(ebitda).toBeDefined();
    expect("calculada" in ebitda!).toBe(true);
    
    // receita_bruta should NOT be calculated (it's an input)
    const receitaBruta = LINHAS_DRE.find((l: any) => l.id === "receita_bruta");
    expect(receitaBruta).toBeDefined();
    expect("calculada" in receitaBruta!).toBe(false);
  });

  it("should distinguish between produto and servico lines", async () => {
    const { LINHAS_DRE } = await import("./routers/dre");
    
    const cmv = LINHAS_DRE.find((l: any) => l.id === "cmv");
    const csp = LINHAS_DRE.find((l: any) => l.id === "csp");
    
    expect(cmv).toBeDefined();
    expect(csp).toBeDefined();
    expect((cmv as any).natureza).toBe("produto");
    expect((csp as any).natureza).toBe("servico");
  });
});
