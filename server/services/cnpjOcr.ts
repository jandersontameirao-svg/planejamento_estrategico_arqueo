/**
 * Extração de dados de Cartão CNPJ via IA (LLM com visão)
 * Módulo isolado — não interfere com o SGC existente
 */
import { invokeLLM } from "../_core/llm";

export interface CNPJCardData {
  cnpj?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  dataAbertura?: string;
  naturezaJuridica?: string;
  atividadeEconomica?: string;
  situacaoCadastral?: string;
}

export async function extractDataFromCNPJCard(imageBase64: string): Promise<CNPJCardData> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "Você é um assistente especializado em extrair dados de Cartões CNPJ brasileiros. Extraia todas as informações visíveis e retorne em formato JSON estruturado.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extraia TODOS os dados deste Cartão CNPJ brasileiro (Comprovante de Inscrição e de Situação Cadastral) e retorne em formato JSON. Campos esperados: cnpj (formatado XX.XXX.XXX/XXXX-XX), razaoSocial (NOME EMPRESARIAL), nomeFantasia (TÍTULO DO ESTABELECIMENTO), logradouro (ex: Q SIG QUADRA 4), complemento (ex: LOTE 75 EDIF...), bairro (ex: ZONA INDUSTRIAL), municipio (ex: BRASILIA), uf (sigla com 2 letras), cep (formatado XXXXX-XXX), telefone (formatado), email (ENDEREÇO ELETRÔNICO), dataAbertura (DATA DE ABERTURA), naturezaJuridica (CÓDIGO E DESCRIÇÃO DA NATUREZA JURÍDICA), atividadeEconomica (CÓDIGO E DESCRIÇÃO DA ATIVIDADE ECONÔMICA PRINCIPAL), situacaoCadastral (SITUAÇÃO CADASTRAL). Se algum campo não estiver visível, omita-o do JSON.",
          },
          {
            type: "image_url",
            image_url: {
              url: imageBase64,
              detail: "high",
            },
          },
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "cnpj_card_data",
        strict: true,
        schema: {
          type: "object",
          properties: {
            cnpj: { type: "string", description: "CNPJ formatado (XX.XXX.XXX/XXXX-XX)" },
            razaoSocial: { type: "string", description: "Razão social / Nome empresarial" },
            nomeFantasia: { type: "string", description: "Nome fantasia / Título do estabelecimento" },
            logradouro: { type: "string", description: "Logradouro (rua, avenida, quadra, etc)" },
            complemento: { type: "string", description: "Complemento do endereço (lote, sala, andar, etc)" },
            bairro: { type: "string", description: "Bairro/Distrito" },
            municipio: { type: "string", description: "Município" },
            uf: { type: "string", description: "UF - Estado (sigla com 2 letras maiúsculas)" },
            cep: { type: "string", description: "CEP formatado (XXXXX-XXX)" },
            telefone: { type: "string", description: "Telefone com DDD" },
            email: { type: "string", description: "Endereço eletrônico / Email" },
            dataAbertura: { type: "string", description: "Data de abertura (DD/MM/AAAA)" },
            naturezaJuridica: { type: "string", description: "Código e descrição da natureza jurídica" },
            atividadeEconomica: { type: "string", description: "Código e descrição da atividade econômica principal" },
            situacaoCadastral: { type: "string", description: "Situação cadastral (ATIVA, SUSPENSA, etc)" },
          },
          required: [],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Nenhum dado extraído da imagem");
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new Error("Erro ao processar resposta da IA");
  }
}
