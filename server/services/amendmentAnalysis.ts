/**
 * Amendment Analysis Service
 * Analisa PDFs de aditivos contratuais usando IA
 * Adaptado do módulo ZIP v1.0.0 para o projeto Arqueo
 */
import { invokeLLM } from "../_core/llm";

export interface AmendmentAnalysisResult {
  title: string;
  description: string;
  tipo: "financeiro" | "escopo";
  additionalValue: number;
  effectiveDate: string;
  justification?: string;
  newEndDate?: string;
}

const AMENDMENT_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Título ou número do aditivo" },
    description: { type: "string", description: "Descrição resumida do objeto do aditivo" },
    tipo: {
      type: "string",
      enum: ["financeiro", "escopo"],
      description: "Tipo do aditivo: financeiro (altera valores) ou escopo (altera prazo/especificações)",
    },
    additionalValue: {
      type: "number",
      description: "Valor adicional em reais (positivo para acréscimo, negativo para supressão, 0 se não houver)",
    },
    effectiveDate: {
      type: "string",
      description: "Data de início de vigência do aditivo no formato DD/MM/AAAA",
    },
    justification: {
      type: "string",
      description: "Justificativa ou motivo do aditivo (opcional)",
    },
    newEndDate: {
      type: "string",
      description: "Nova data de término do contrato após o aditivo, se aplicável, no formato DD/MM/AAAA (opcional)",
    },
  },
  required: ["title", "description", "tipo", "additionalValue", "effectiveDate"],
  additionalProperties: false,
};

export async function analyzeAmendmentPdf(pdfUrl: string): Promise<AmendmentAnalysisResult> {
  const prompt = `Você é um especialista em análise de aditivos contratuais. Analise o documento de aditivo contratual fornecido e extraia as informações solicitadas.

**INSTRUÇÕES IMPORTANTES:**
1. **CLASSIFICAÇÃO DO TIPO** (CAMPO MAIS CRÍTICO):
   - "financeiro": Qualquer alteração que impacte valores (acréscimo, supressão, reajuste)
   - "escopo": Alterações de prazo, cronograma ou especificações SEM impacto financeiro
   - Se houver DÚVIDA, analise o objeto principal do aditivo
2. **VALOR ADICIONAL**:
   - Extraia o valor TOTAL do acréscimo ou supressão
   - Use valor POSITIVO para acréscimos, NEGATIVO para supressões, 0 se não houver
3. **DATAS**: Formato obrigatório: DD/MM/AAAA
4. **TÍTULO E DESCRIÇÃO**: Título é o número/identificação; Descrição é o resumo objetivo

Retorne APENAS o JSON estruturado conforme o schema, sem texto adicional.`;

  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(pdfUrl) || pdfUrl.startsWith("data:image/");

  const response = await invokeLLM({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          isImage
            ? { type: "image_url" as const, image_url: { url: pdfUrl } }
            : { type: "file_url" as const, file_url: { url: pdfUrl, mime_type: "application/pdf" as const } },
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "amendment_analysis",
        strict: true,
        schema: AMENDMENT_ANALYSIS_SCHEMA,
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Nenhum conteúdo retornado pela IA");

  const contentStr = typeof content === "string" ? content : JSON.stringify(content);
  return JSON.parse(contentStr) as AmendmentAnalysisResult;
}
