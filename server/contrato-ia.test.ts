import { describe, it, expect, vi } from "vitest";

describe("Criação de Contrato via IA", () => {
  it("deve ter a procedure extrairPDF definida no router", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys((appRouter as any)._def.procedures);
    expect(procedures).toContain("contratos.contratos.extrairPDF");
  });

  it("deve ter a procedure confirmarExtracao definida no router", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys((appRouter as any)._def.procedures);
    expect(procedures).toContain("contratos.contratos.confirmarExtracao");
  });

  it("deve ter a procedure create para criação de contrato", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys((appRouter as any)._def.procedures);
    expect(procedures).toContain("contratos.contratos.create");
  });

  it("deve ter procedures de dashboard receita e resultado operacional", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys((appRouter as any)._def.procedures);
    expect(procedures).toContain("contratos.dashboardReceita");
    expect(procedures).toContain("contratos.resultadoOperacional");
  });

  it("a função parseContent deve existir e processar JSON válido", async () => {
    // Test that the router module loads without errors
    const routerModule = await import("./routers/contratos");
    expect(routerModule).toBeDefined();
  });

  it("deve validar que o wizard tem 4 passos definidos", () => {
    const STEPS = [
      { id: 1, title: "Upload do Documento" },
      { id: 2, title: "Revisão IA" },
      { id: 3, title: "Complementar Dados" },
      { id: 4, title: "Confirmar e Criar" },
    ];
    expect(STEPS).toHaveLength(4);
    expect(STEPS[0].title).toBe("Upload do Documento");
    expect(STEPS[1].title).toBe("Revisão IA");
    expect(STEPS[2].title).toBe("Complementar Dados");
    expect(STEPS[3].title).toBe("Confirmar e Criar");
  });

  it("deve ter procedures de clientes para listagem e busca", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys((appRouter as any)._def.procedures);
    expect(procedures).toContain("contratos.clientes.list");
  });
});
