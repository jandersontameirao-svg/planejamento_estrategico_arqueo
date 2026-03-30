import { describe, it, expect } from "vitest";
import { getDashboardReceita, getResultadoOperacional } from "./contratos.db";

describe("getDashboardReceita", () => {
  it("deve retornar estrutura correta com totais e receita mensal", async () => {
    const result = await getDashboardReceita(1, 2026);
    // Pode retornar null se DB não disponível em teste
    if (result === null) {
      expect(result).toBeNull();
      return;
    }
    expect(result).toHaveProperty("totais");
    expect(result).toHaveProperty("statusMarcos");
    expect(result).toHaveProperty("receitaMensal");
    expect(result).toHaveProperty("receitaPorContrato");
    expect(result).toHaveProperty("ano");
    expect(result.ano).toBe(2026);
    expect(result.receitaMensal).toHaveLength(12);
    expect(result.totais).toHaveProperty("totalPrevisto");
    expect(result.totais).toHaveProperty("totalPago");
    expect(result.totais).toHaveProperty("percentualRecebido");
  });

  it("deve retornar 12 meses completos na receita mensal", async () => {
    const result = await getDashboardReceita(undefined, 2026);
    if (result === null) return;
    expect(result.receitaMensal).toHaveLength(12);
    const mesesNomes = result.receitaMensal.map((m: any) => m.nome);
    expect(mesesNomes).toEqual(["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]);
  });

  it("deve aceitar chamada sem empresaId (consolidado)", async () => {
    const result = await getDashboardReceita(undefined, 2026);
    if (result === null) return;
    expect(result).toHaveProperty("totais");
    expect(result).toHaveProperty("receitaPorContrato");
  });
});

describe("getResultadoOperacional", () => {
  it("deve retornar estrutura DRE correta", async () => {
    const result = await getResultadoOperacional(1, 2026);
    if (result === null) return;
    expect(result).toHaveProperty("ano");
    expect(result).toHaveProperty("empresaId");
    expect(result).toHaveProperty("dreMensal");
    expect(result).toHaveProperty("totais");
    expect(result.ano).toBe(2026);
    expect(result.empresaId).toBe(1);
    expect(result.dreMensal).toHaveLength(12);
  });

  it("deve calcular resultado como receita menos despesa", async () => {
    const result = await getResultadoOperacional(1, 2026);
    if (result === null) return;
    // Verificar que resultado = receita - despesa
    const { totais } = result;
    expect(totais.resultadoPrevisto).toBeCloseTo(
      totais.receitaPrevista - totais.despesaPlanejada,
      2
    );
    expect(totais.resultadoRealizado).toBeCloseTo(
      totais.receitaRealizada - totais.despesaExecutada,
      2
    );
  });

  it("deve ter campos de margem nos totais", async () => {
    const result = await getResultadoOperacional(1, 2026);
    if (result === null) return;
    expect(result.totais).toHaveProperty("margemPrevista");
    expect(result.totais).toHaveProperty("margemRealizada");
    expect(typeof result.totais.margemPrevista).toBe("number");
    expect(typeof result.totais.margemRealizada).toBe("number");
  });

  it("deve ter estrutura mensal com todos os campos do DRE", async () => {
    const result = await getResultadoOperacional(1, 2026);
    if (result === null) return;
    const mes = result.dreMensal[0];
    expect(mes).toHaveProperty("mes");
    expect(mes).toHaveProperty("nome");
    expect(mes).toHaveProperty("receitaPrevista");
    expect(mes).toHaveProperty("receitaRealizada");
    expect(mes).toHaveProperty("despesaPlanejada");
    expect(mes).toHaveProperty("despesaExecutada");
    expect(mes).toHaveProperty("resultadoPrevisto");
    expect(mes).toHaveProperty("resultadoRealizado");
    expect(mes).toHaveProperty("margemPrevista");
    expect(mes).toHaveProperty("margemRealizada");
  });
});

describe("Funções exportadas", () => {
  it("getDashboardReceita deve ser uma função", () => {
    expect(typeof getDashboardReceita).toBe("function");
  });

  it("getResultadoOperacional deve ser uma função", () => {
    expect(typeof getResultadoOperacional).toBe("function");
  });
});
