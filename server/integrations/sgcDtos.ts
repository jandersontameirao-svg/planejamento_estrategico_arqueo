/**
 * DTOs (Data Transfer Objects) para dados consumidos do SGC
 * 
 * Estes modelos desacoplam este sistema do formato bruto do SGC,
 * permitindo que mudanças no SGC não impactem diretamente o código estratégico.
 */

/**
 * Resumo estratégico de um cliente
 */
export interface StrategicClientSummaryDTO {
  id: number;
  cnpj: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  email?: string;
  telefone?: string;
  status: "ativo" | "inativo" | "prospecto";
  empresaId: number;
  totalContratos: number;
  valorTotalContratos: number;
  ultimoContratoData?: string;
}

/**
 * Resumo estratégico de um contrato
 */
export interface StrategicContractSummaryDTO {
  id: number;
  numero?: string;
  titulo: string;
  clienteId: number;
  clienteNome: string;
  empresaId: number;
  status: "rascunho" | "ativo" | "suspenso" | "encerrado" | "rescindido";
  valorTotal?: number;
  dataInicio?: string;
  dataFim?: string;
  dataAssinatura?: string;
  totalMarcos: number;
  marcosAtrasados: number;
  totalRiscos: number;
  riscosAltosAbertos: number;
}

/**
 * Resumo de um marco financeiro
 */
export interface StrategicMilestoneSummaryDTO {
  id: number;
  contratoId: number;
  titulo: string;
  valorPrevisto?: number;
  valorPago?: number;
  dataPrevista?: string;
  dataPagamento?: string;
  status: "pendente" | "em_medicao" | "aprovado" | "pago" | "atrasado" | "cancelado";
  diasAtrasado?: number;
  ordem: number;
}

/**
 * Resumo de um risco contratual
 */
export interface StrategicRiskSummaryDTO {
  id: number;
  contratoId: number;
  titulo: string;
  categoria:
    | "financeiro"
    | "juridico"
    | "operacional"
    | "prazo"
    | "escopo"
    | "reputacional"
    | "regulatorio"
    | "outro";
  probabilidade: "baixa" | "media" | "alta";
  impacto: "baixo" | "medio" | "alto";
  status: "identificado" | "em_mitigacao" | "mitigado" | "materializado" | "aceito";
  severidade: "baixa" | "media" | "alta" | "critica";
}

/**
 * Resumo de um boletim de medição
 */
export interface StrategicBulletinSummaryDTO {
  id: number;
  contratoId: number;
  marcoId: number;
  status: "rascunho" | "enviado" | "em_aprovacao" | "aprovado" | "rejeitado" | "pago";
  valorMedicao?: number;
  percentualMedicao?: number;
  periodo?: string;
  dataCriacao: string;
}

/**
 * Resumo agregado de contratos por empresa
 */
export interface StrategicContractAggregateDTO {
  empresaId: number;
  totalContratos: number;
  totalClientes: number;
  valorTotalContratos: number;
  contratosPorStatus: Record<string, number>;
  marcosPendentes: number;
  marcosAtrasados: number;
  riscosAbertos: number;
  riscosAltosAbertos: number;
  boletinsPendentes: number;
}

/**
 * Resumo agregado de contratos para o grupo
 */
export interface StrategicContractGroupAggregateDTO {
  totalContratos: number;
  totalClientes: number;
  valorTotalContratos: number;
  empresas: StrategicContractAggregateDTO[];
  marcosPendentes: number;
  marcosAtrasados: number;
  riscosAbertos: number;
  riscosAltosAbertos: number;
  boletinsPendentes: number;
}

/**
 * Alertas estratégicos baseados em dados contratuais
 */
export interface StrategicAlertDTO {
  id: string;
  tipo: "marco_atrasado" | "risco_alto" | "boletim_pendente" | "contrato_vencendo";
  severidade: "info" | "aviso" | "critico";
  titulo: string;
  descricao: string;
  empresaId: number;
  contratoId?: number;
  marcoId?: number;
  dataCriacao: string;
  dataVencimento?: string;
  acao?: {
    tipo: "link" | "abrir_sgc";
    label: string;
    url?: string;
  };
}

/**
 * Contexto contratual para planejamento estratégico
 */
export interface StrategicContractContextDTO {
  empresaId: number;
  periodo: {
    inicio: string;
    fim: string;
  };
  contratos: StrategicContractSummaryDTO[];
  clientes: StrategicClientSummaryDTO[];
  marcos: StrategicMilestoneSummaryDTO[];
  riscos: StrategicRiskSummaryDTO[];
  alertas: StrategicAlertDTO[];
  metricas: {
    totalValor: number;
    totalMarcos: number;
    marcosAtrasados: number;
    riscosAltos: number;
    boletinsPendentes: number;
  };
}
