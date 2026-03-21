/**
 * Serviço de Análise de Contratos por IA
 * Adaptado do SGC para o app principal do Grupo Arqueo
 * Referências: contracts→contratos, clients→contratosClientes, companies→empresas
 */
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { contratos, contratosClientes, empresas } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface ContractAnalysisResult {
  riskScore: number; // 0-100
  identifiedRisks: Array<{
    tipo: "financeiro" | "legal" | "operacional" | "prazo";
    descricao: string;
    severidade: "baixa" | "media" | "alta" | "critica";
    probabilidade: number; // 0-100
    acoesMitigacao: string;
  }>;
  criticalClauses: Array<{
    clause: string;
    risk: string;
    recommendation: string;
  }>;
  recommendations: string[];
  summary: string;
}

export interface ExtractedContractData {
  titulo?: string;
  numero?: string;
  objeto?: string;
  valorTotal?: number;
  dataInicio?: string;
  dataFim?: string;
  prazoMeses?: number;
  tipoContrato?: string;
  modalidadeLicitacao?: string;
  clienteNome?: string;
  clienteCnpj?: string;
  marcos?: Array<{
    descricao: string;
    valor: number;
    prazo: string;
    percentual?: number;
  }>;
  riscos?: Array<{
    tipo: string;
    descricao: string;
    severidade: string;
  }>;
}

/**
 * Analisa um contrato usando IA e retorna riscos, cláusulas críticas e recomendações
 */
export async function analyzeContractWithAI(
  contractText: string,
  empresaId: number,
  tipoContrato?: string
): Promise<ContractAnalysisResult> {
  const db = await getDb();

  // Buscar histórico de contratos da empresa para contexto
  let historicalContext = "";
  if (db) {
    try {
      const contratosEmpresa = await db
        .select({ id: contratos.id, status: contratos.status, valorTotal: contratos.valorTotal })
        .from(contratos)
        .where(eq(contratos.empresaId, empresaId))
        .limit(20);

      const total = contratosEmpresa.length;
      const encerrados = contratosEmpresa.filter(c => c.status === "encerrado").length;
      const cancelados = contratosEmpresa.filter(c => c.status === "rescindido").length;

      historicalContext = `
**Histórico da Empresa:**
- Total de contratos: ${total}
- Contratos encerrados com sucesso: ${encerrados}
- Contratos cancelados: ${cancelados}
- Taxa de sucesso: ${total > 0 ? ((encerrados / total) * 100).toFixed(1) : "N/A"}%
`;
    } catch {
      historicalContext = "";
    }
  }

  const prompt = `
Você é um especialista em análise de riscos contratuais para empresas de arqueologia e geoprocessamento.
Analise o seguinte contrato e identifique riscos potenciais, cláusulas críticas e recomendações.

${historicalContext}

**Tipo de Contrato:** ${tipoContrato || "Não especificado"}

**Texto do Contrato:**
${contractText.substring(0, 10000)}${contractText.length > 10000 ? "\n...(texto truncado)" : ""}

**Instruções:**
1. Identifique TODOS os riscos potenciais (financeiro, legal, operacional, prazo)
2. Para cada risco, classifique a severidade (baixa, media, alta, critica)
3. Estime a probabilidade de ocorrência (0-100)
4. Sugira ações de mitigação específicas
5. Identifique cláusulas críticas que requerem atenção especial
6. Calcule um score geral de risco (0-100, onde 100 é altíssimo risco)
7. Forneça um resumo executivo em português

Retorne APENAS um JSON válido no seguinte formato exato.
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em análise de riscos contratuais. Retorne APENAS JSON válido, sem texto adicional.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "contract_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            riskScore: { type: "number", description: "Score geral de risco de 0 a 100" },
            summary: { type: "string", description: "Resumo executivo da análise" },
            identifiedRisks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tipo: { type: "string", enum: ["financeiro", "legal", "operacional", "prazo"] },
                  descricao: { type: "string" },
                  severidade: { type: "string", enum: ["baixa", "media", "alta", "critica"] },
                  probabilidade: { type: "number" },
                  acoesMitigacao: { type: "string" },
                },
                required: ["tipo", "descricao", "severidade", "probabilidade", "acoesMitigacao"],
                additionalProperties: false,
              },
            },
            criticalClauses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  clause: { type: "string" },
                  risk: { type: "string" },
                  recommendation: { type: "string" },
                },
                required: ["clause", "risk", "recommendation"],
                additionalProperties: false,
              },
            },
            recommendations: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["riskScore", "summary", "identifiedRisks", "criticalClauses", "recommendations"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  const analysis = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
  return analysis;
}

/**
 * Extrai dados estruturados de um PDF de contrato usando IA
 */
export async function extractContractDataFromText(
  contractText: string
): Promise<ExtractedContractData> {
  const prompt = `
Você é um especialista em extração de dados de contratos administrativos brasileiros.
Extraia as informações estruturadas do seguinte texto de contrato.

**Texto do Contrato:**
${contractText.substring(0, 12000)}${contractText.length > 12000 ? "\n...(texto truncado)" : ""}

Extraia TODAS as informações disponíveis. Para campos não encontrados, use null.
Para marcos financeiros, extraia TODOS os marcos/parcelas/etapas encontrados.
Retorne APENAS um JSON válido.
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Você é um especialista em extração de dados de contratos. Retorne APENAS JSON válido.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "extracted_contract_data",
        strict: true,
        schema: {
          type: "object",
          properties: {
            titulo: { type: ["string", "null"] },
            numero: { type: ["string", "null"] },
            objeto: { type: ["string", "null"] },
            valorTotal: { type: ["number", "null"] },
            dataInicio: { type: ["string", "null"] },
            dataFim: { type: ["string", "null"] },
            prazoMeses: { type: ["number", "null"] },
            tipoContrato: { type: ["string", "null"] },
            modalidadeLicitacao: { type: ["string", "null"] },
            clienteNome: { type: ["string", "null"] },
            clienteCnpj: { type: ["string", "null"] },
            marcos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  descricao: { type: "string" },
                  valor: { type: "number" },
                  prazo: { type: "string" },
                  percentual: { type: ["number", "null"] },
                },
                required: ["descricao", "valor", "prazo", "percentual"],
                additionalProperties: false,
              },
            },
            riscos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tipo: { type: "string" },
                  descricao: { type: "string" },
                  severidade: { type: "string" },
                },
                required: ["tipo", "descricao", "severidade"],
                additionalProperties: false,
              },
            },
          },
          required: [
            "titulo", "numero", "objeto", "valorTotal", "dataInicio", "dataFim",
            "prazoMeses", "tipoContrato", "modalidadeLicitacao", "clienteNome",
            "clienteCnpj", "marcos", "riscos",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
}
