/**
 * Consulta dados de CNPJ na BrasilAPI (Receita Federal)
 * Documentação: https://brasilapi.com.br/docs#tag/CNPJ
 * Módulo isolado — não interfere com o SGC existente
 */

interface BrasilAPICNPJResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cnae_fiscal: string;
  cnae_fiscal_descricao: string;
  data_inicio_atividade: string;
  natureza_juridica: string;
  descricao_situacao_cadastral: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  uf: string;
  municipio: string;
  ddd_telefone_1: string;
  ddd_telefone_2?: string;
  email?: string;
}

export interface CNPJData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  atividadeEconomica: string;
  dataAbertura: string;
  naturezaJuridica: string;
  situacaoCadastral: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cep: string;
  uf: string;
  municipio: string;
  telefone: string;
  email: string;
}

/**
 * Consulta CNPJ na BrasilAPI e retorna dados formatados
 */
export async function consultarCNPJ(cnpj: string): Promise<CNPJData> {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, "");

  if (cnpjLimpo.length !== 14) {
    throw new Error("CNPJ inválido. Deve conter 14 dígitos.");
  }

  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("CNPJ não encontrado na base da Receita Federal.");
    }
    if (response.status === 403) {
      throw new Error("Acesso negado à BrasilAPI. Tente novamente em alguns momentos.");
    }
    throw new Error(`Erro ao consultar CNPJ: ${response.statusText}`);
  }

  const data: BrasilAPICNPJResponse = await response.json();

  const telefone = data.ddd_telefone_1
    ? `(${data.ddd_telefone_1.slice(0, 2)}) ${data.ddd_telefone_1.slice(2)}`
    : "";

  const cnpjFormatado = cnpjLimpo.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );

  const cepFormatado = data.cep ? data.cep.replace(/^(\d{5})(\d{3})$/, "$1-$2") : "";

  return {
    cnpj: cnpjFormatado,
    razaoSocial: data.razao_social,
    nomeFantasia: data.nome_fantasia || "",
    atividadeEconomica: data.cnae_fiscal
      ? `${data.cnae_fiscal} - ${data.cnae_fiscal_descricao}`
      : "",
    dataAbertura: data.data_inicio_atividade,
    naturezaJuridica: data.natureza_juridica || "",
    situacaoCadastral: data.descricao_situacao_cadastral,
    logradouro: `${data.logradouro}${data.numero ? `, ${data.numero}` : ""}`,
    complemento: data.complemento || "",
    bairro: data.bairro,
    cep: cepFormatado,
    uf: data.uf,
    municipio: data.municipio,
    telefone,
    email: data.email || "",
  };
}
