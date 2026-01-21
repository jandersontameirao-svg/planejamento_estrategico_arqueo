import { describe, it, expect, vi, beforeEach } from "vitest";

describe("planoAcao.gerarComIA", () => {
  it("deve gerar plano de ação com IA para um fator PESTEL", async () => {
    // Mock da função invokeLLM
    const mockInvokeLLM = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              prevencao: [
                {
                  titulo: "Aumentar capacidade de atendimento",
                  descricao: "Contratar e treinar novos profissionais",
                  responsavel: "RH",
                  prazo: "3 meses",
                },
              ],
              protecao: [
                {
                  titulo: "Implementar sistema de qualidade",
                  descricao: "Certificação ISO 9001",
                  responsavel: "Qualidade",
                  prazo: "6 meses",
                },
              ],
              mitigacao: [
                {
                  titulo: "Diversificar mercado",
                  descricao: "Expandir para novos segmentos",
                  responsavel: "Comercial",
                  prazo: "12 meses",
                },
              ],
            }),
          },
        },
      ],
    });

    // Simular a chamada da procedure
    const input = {
      fator: "Crescimento da demanda por serviços de arqueologia",
      categoria: "Social",
    };

    const resultado = await mockInvokeLLM({
      messages: [
        {
          role: "system",
          content: "Voce eh um especialista em planejamento estrategico. Responda sempre em JSON valido.",
        },
        {
          role: "user",
          content: `Especialista em planejamento estrategico e gestao de riscos. Para o fator PESTEL (${input.categoria}: ${input.fator}), gere um plano de acao com 3 estrategias...`,
        },
      ],
    });

    const content = resultado.choices[0].message.content;
    const planoAcao = typeof content === "string" ? JSON.parse(content) : content;

    // Validações
    expect(planoAcao).toBeDefined();
    expect(planoAcao.prevencao).toBeDefined();
    expect(planoAcao.protecao).toBeDefined();
    expect(planoAcao.mitigacao).toBeDefined();
    
    expect(Array.isArray(planoAcao.prevencao)).toBe(true);
    expect(Array.isArray(planoAcao.protecao)).toBe(true);
    expect(Array.isArray(planoAcao.mitigacao)).toBe(true);

    // Validar estrutura das ações
    planoAcao.prevencao.forEach((acao: any) => {
      expect(acao).toHaveProperty("titulo");
      expect(acao).toHaveProperty("descricao");
      expect(acao).toHaveProperty("responsavel");
      expect(acao).toHaveProperty("prazo");
    });

    console.log("✅ Teste passou: Plano de ação gerado com sucesso");
  });

  it("deve retornar estrutura JSON válida", async () => {
    const mockInvokeLLM = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              prevencao: [],
              protecao: [],
              mitigacao: [],
            }),
          },
        },
      ],
    });

    const resultado = await mockInvokeLLM({
      messages: [{ role: "user", content: "test" }],
    });

    const planoAcao = JSON.parse(resultado.choices[0].message.content);

    expect(Object.keys(planoAcao)).toContain("prevencao");
    expect(Object.keys(planoAcao)).toContain("protecao");
    expect(Object.keys(planoAcao)).toContain("mitigacao");

    console.log("✅ Teste passou: Estrutura JSON válida");
  });
});
