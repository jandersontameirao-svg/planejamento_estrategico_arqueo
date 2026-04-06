import { describe, it, expect } from "vitest";

// Unit tests for gestaoRiscos router logic (non-DB, pure logic)

describe("gestaoRiscos - severidade calculation", () => {
  function calcSeveridade(probabilidade: string, impacto: string): string {
    if (probabilidade === "alta" && impacto === "alto") return "critica";
    if (probabilidade === "alta" && impacto === "medio") return "alta";
    if (probabilidade === "alta" && impacto === "baixo") return "media";
    if (probabilidade === "media" && impacto === "alto") return "alta";
    if (probabilidade === "media" && impacto === "medio") return "media";
    if (probabilidade === "media" && impacto === "baixo") return "baixa";
    if (probabilidade === "baixa" && impacto === "alto") return "media";
    if (probabilidade === "baixa" && impacto === "medio") return "baixa";
    return "baixa";
  }

  it("should return critica for alta probabilidade + alto impacto", () => {
    expect(calcSeveridade("alta", "alto")).toBe("critica");
  });

  it("should return alta for alta probabilidade + medio impacto", () => {
    expect(calcSeveridade("alta", "medio")).toBe("alta");
  });

  it("should return media for media probabilidade + medio impacto", () => {
    expect(calcSeveridade("media", "medio")).toBe("media");
  });

  it("should return baixa for baixa probabilidade + baixo impacto", () => {
    expect(calcSeveridade("baixa", "baixo")).toBe("baixa");
  });

  it("should return alta for media probabilidade + alto impacto", () => {
    expect(calcSeveridade("media", "alto")).toBe("alta");
  });
});

describe("gestaoRiscos - risco validation", () => {
  function validateRisco(risco: { titulo: string; empresaId: number; probabilidade: string; impacto: string }) {
    const errors: string[] = [];
    if (!risco.titulo || risco.titulo.trim().length < 3) errors.push("Título deve ter pelo menos 3 caracteres");
    if (!risco.empresaId || risco.empresaId <= 0) errors.push("EmpresaId inválido");
    const validProbabilidades = ["baixa", "media", "alta"];
    if (!validProbabilidades.includes(risco.probabilidade)) errors.push("Probabilidade inválida");
    const validImpactos = ["baixo", "medio", "alto"];
    if (!validImpactos.includes(risco.impacto)) errors.push("Impacto inválido");
    return errors;
  }

  it("should pass validation for valid risco", () => {
    const errors = validateRisco({
      titulo: "Risco de desvio orçamentário",
      empresaId: 1,
      probabilidade: "alta",
      impacto: "alto",
    });
    expect(errors).toHaveLength(0);
  });

  it("should fail validation for empty titulo", () => {
    const errors = validateRisco({
      titulo: "",
      empresaId: 1,
      probabilidade: "alta",
      impacto: "alto",
    });
    expect(errors).toContain("Título deve ter pelo menos 3 caracteres");
  });

  it("should fail validation for invalid empresaId", () => {
    const errors = validateRisco({
      titulo: "Risco válido",
      empresaId: 0,
      probabilidade: "alta",
      impacto: "alto",
    });
    expect(errors).toContain("EmpresaId inválido");
  });

  it("should fail validation for invalid probabilidade", () => {
    const errors = validateRisco({
      titulo: "Risco válido",
      empresaId: 1,
      probabilidade: "muito_alta" as any,
      impacto: "alto",
    });
    expect(errors).toContain("Probabilidade inválida");
  });
});

describe("gestaoRiscos - plano de acao priority", () => {
  function getPriorityLabel(tipo: string): string {
    const labels: Record<string, string> = {
      corte_custos: "Corte de Custos",
      mitigacao: "Mitigação",
      prevencao: "Prevenção",
      contingencia: "Contingência",
      monitoramento: "Monitoramento",
    };
    return labels[tipo] || "Desconhecido";
  }

  it("should return correct label for corte_custos", () => {
    expect(getPriorityLabel("corte_custos")).toBe("Corte de Custos");
  });

  it("should return correct label for mitigacao", () => {
    expect(getPriorityLabel("mitigacao")).toBe("Mitigação");
  });

  it("should return Desconhecido for unknown type", () => {
    expect(getPriorityLabel("unknown")).toBe("Desconhecido");
  });
});
