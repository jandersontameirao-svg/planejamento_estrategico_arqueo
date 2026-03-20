/**
 * Contract Analysis Service
 * Analisa PDFs de contratos usando IA para extrair valores, marcos e riscos
 * Adaptado do módulo ZIP v1.0.0 para o projeto Arqueo
 */
import { invokeLLM } from "../_core/llm";

export interface ContractAnalysisResult {
  informacoesBasicas: {
    titulo: string;
    dataInicio: string;
    dataTermino: string;
  };
  valores: {
    valorTotal: number;
    parcelas: number;
    formaPagamento: string;
  };
  marcosFinanceiros: Array<{
    descricao: string;
    valor: number;
    dataVencimento: string;
    percentual?: number;
  }>;
  riscos: Array<{
    tipo: "financeiro" | "legal" | "operacional" | "prazo";
    descricao: string;
    severidade: "baixa" | "media" | "alta" | "critica";
  }>;
}

export async function analyzeContract(pdfUrl: string): Promise<ContractAnalysisResult> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é um especialista em análise de contratos empresariais. Analise o contrato e extraia informações estruturadas.

Extraia:
1. Informações básicas (título, data início, data término)
2. Valores (total, parcelas, forma de pagamento)
3. Marcos financeiros (todas as etapas de pagamento com descrição, valor, data vencimento)
4. Riscos identificados (tipo, descrição, severidade)

Retorne APENAS um JSON válido sem markdown.`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Analise este contrato e extraia valores, marcos financeiros e riscos." },
          { type: "file_url" as const, file_url: { url: pdfUrl, mime_type: "application/pdf" as const } },
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "contract_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            informacoesBasicas: {
              type: "object",
              properties: {
                titulo: { type: "string" },
                dataInicio: { type: "string" },
                dataTermino: { type: "string" },
              },
              required: ["titulo", "dataInicio", "dataTermino"],
              additionalProperties: false,
            },
            valores: {
              type: "object",
              properties: {
                valorTotal: { type: "number" },
                parcelas: { type: "integer" },
                formaPagamento: { type: "string" },
              },
              required: ["valorTotal", "parcelas", "formaPagamento"],
              additionalProperties: false,
            },
            marcosFinanceiros: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  descricao: { type: "string" },
                  valor: { type: "number" },
                  dataVencimento: { type: "string" },
                  percentual: { type: "number" },
                },
                required: ["descricao", "valor", "dataVencimento"],
                additionalProperties: false,
              },
            },
            riscos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tipo: { type: "string", enum: ["financeiro", "legal", "operacional", "prazo"] },
                  descricao: { type: "string" },
                  severidade: { type: "string", enum: ["baixa", "media", "alta", "critica"] },
                },
                required: ["tipo", "descricao", "severidade"],
                additionalProperties: false,
              },
            },
          },
          required: ["informacoesBasicas", "valores", "marcosFinanceiros", "riscos"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("IA não retornou conteúdo");

  const contentString = typeof content === "string" ? content : JSON.stringify(content);
  return JSON.parse(contentString) as ContractAnalysisResult;
}

export interface RiskMitigationActions {
  evitar: string;
  proteger: string;
  mitigar: string;
}

export async function generateRiskMitigationActions(
  riskType: string,
  riskDescription: string,
  riskSeverity: string
): Promise<RiskMitigationActions> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em gestão de riscos contratuais. Gere 3 ações específicas para lidar com riscos em contratos:
1. EVITAR: ação preventiva antes do problema
2. PROTEGER: redução de impacto caso ocorra
3. MITIGAR: resposta e recuperação após ocorrência

Retorne APENAS JSON válido.`,
        },
        {
          role: "user",
          content: `Tipo: ${riskType}\nSeveridade: ${riskSeverity}\nDescrição: ${riskDescription}\n\nGere as 3 ações.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "risk_mitigation_actions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              evitar: { type: "string" },
              proteger: { type: "string" },
              mitigar: { type: "string" },
            },
            required: ["evitar", "proteger", "mitigar"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("IA não retornou conteúdo");
    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    return JSON.parse(contentStr) as RiskMitigationActions;
  } catch {
    return {
      evitar: `Revisar cláusulas relacionadas a ${riskType} e incluir proteções contratuais específicas.`,
      proteger: `Estabelecer monitoramento contínuo e alertas para ${riskType} com revisões periódicas.`,
      mitigar: `Criar plano de contingência e comitê de resposta rápida para ${riskType}.`,
    };
  }
}
