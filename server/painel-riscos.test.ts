import { describe, it, expect } from "vitest";
import { getPainelRiscos, getPainelClausulas } from "./contratos.db";

describe("Painel de Riscos e Cláusulas", () => {
  describe("getPainelRiscos", () => {
    it("deve retornar a estrutura correta do painel de riscos", async () => {
      const result = await getPainelRiscos();
      
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("porSeveridade");
      expect(result).toHaveProperty("porCategoria");
      expect(result).toHaveProperty("porStatus");
      expect(result).toHaveProperty("porEmpresa");
      expect(result).toHaveProperty("mapaCalor");
      expect(result).toHaveProperty("riscosCriticos");
      expect(result).toHaveProperty("riscosSemMitigacao");
      expect(result).toHaveProperty("geradosIA");
      expect(result).toHaveProperty("geradosManuais");
      
      expect(typeof result.total).toBe("number");
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it("deve ter as severidades corretas no porSeveridade", async () => {
      const result = await getPainelRiscos();
      
      expect(result.porSeveridade).toHaveProperty("critica");
      expect(result.porSeveridade).toHaveProperty("alta");
      expect(result.porSeveridade).toHaveProperty("media");
      expect(result.porSeveridade).toHaveProperty("baixa");
    });

    it("deve ter o mapa de calor como objeto", async () => {
      const result = await getPainelRiscos();
      
      expect(typeof result.mapaCalor).toBe("object");
      // Quando há riscos, as chaves são combinações prob_impacto
      // Quando não há riscos, o mapa pode estar vazio
      if (result.total > 0) {
        const keys = Object.keys(result.mapaCalor);
        expect(keys.length).toBeGreaterThan(0);
        for (const key of keys) {
          expect(typeof result.mapaCalor[key]).toBe("number");
        }
      }
    });

    it("deve aceitar filtro por empresaId", async () => {
      const result = await getPainelRiscos(1);
      
      expect(result).toHaveProperty("total");
      expect(typeof result.total).toBe("number");
    });

    it("soma das severidades deve ser igual ao total", async () => {
      const result = await getPainelRiscos();
      
      const somaSeveridades = result.porSeveridade.critica + result.porSeveridade.alta + result.porSeveridade.media + result.porSeveridade.baixa;
      expect(somaSeveridades).toBe(result.total);
    });

    it("soma de geradosIA + geradosManuais deve ser igual ao total", async () => {
      const result = await getPainelRiscos();
      
      expect(result.geradosIA + result.geradosManuais).toBe(result.total);
    });
  });

  describe("getPainelClausulas", () => {
    it("deve retornar a estrutura correta do painel de cláusulas", async () => {
      const result = await getPainelClausulas();
      
      expect(result).toHaveProperty("totalContratos");
      expect(result).toHaveProperty("totalContratosAnalisados");
      expect(result).toHaveProperty("totalClausulas");
      expect(result).toHaveProperty("porTipo");
      expect(result).toHaveProperty("clausulas");
      
      expect(typeof result.totalContratos).toBe("number");
      expect(typeof result.totalContratosAnalisados).toBe("number");
      expect(typeof result.totalClausulas).toBe("number");
    });

    it("deve aceitar filtro por empresaId", async () => {
      const result = await getPainelClausulas(1);
      
      expect(result).toHaveProperty("totalContratos");
      expect(typeof result.totalContratos).toBe("number");
    });

    it("totalContratosAnalisados deve ser <= totalContratos", async () => {
      const result = await getPainelClausulas();
      
      expect(result.totalContratosAnalisados).toBeLessThanOrEqual(result.totalContratos);
    });

    it("clausulas deve ser um array", async () => {
      const result = await getPainelClausulas();
      
      expect(Array.isArray(result.clausulas)).toBe(true);
    });
  });
});
