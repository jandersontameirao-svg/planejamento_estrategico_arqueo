/**
 * Contracts Gateway - Camada de abstração para consumir dados contratuais do SGC
 *
 * Endpoints disponíveis no SGC (validados em produção):
 *   GET /companies/:sgcId/summary  → KPIs consolidados da empresa
 *   GET /companies/:sgcId/clients  → Lista de clientes com contratos
 *   GET /companies/:sgcId/risks    → Dados de riscos por severidade
 *
 * Todos os outros endpoints retornam 404 ENDPOINT_NOT_FOUND.
 */

import { getSGCClient } from "./sgcClient";
import {
  StrategicClientSummaryDTO,
  StrategicContractSummaryDTO,
  StrategicMilestoneSummaryDTO,
  StrategicRiskSummaryDTO,
  StrategicBulletinSummaryDTO,
  StrategicContractAggregateDTO,
  StrategicContractGroupAggregateDTO,
  StrategicAlertDTO,
  StrategicContractContextDTO,
} from "./sgcDtos";

// ─── Tipos dos payloads reais do SGC ─────────────────────────────────────────

interface SGCSummaryPayload {
  empresaId: number;
  empresaNome: string;
  contratosTotal: number;
  contratosVigentes: number;
  contratosEncerrados: number;
  valorTotalContratado: number;
  valorTotalPrevisto: number;
  valorTotalFaturado: number;
  clientesAtivos: number;
  marcosVencidos: number;
  marcosAVencer: number;
  boletinsPendentes: number;
  riscosPorSeveridade: {
    baixa: number;
    media: number;
    alta: number;
    critica: number;
  };
}

interface SGCClientPayload {
  clienteId: number;
  clienteNome: string;
  clienteLink: string;
  quantidadeContratos: number;
  valorAgregado: number;
  statusConsolidados: {
    ativos: number;
    concluidos: number;
    cancelados: number;
  };
  ultimoMovimento: string;
}

interface SGCRisksPayload {
  totalRiscos: number;
  riscosPorSeveridade: {
    baixa: number;
    media: number;
    alta: number;
    critica: number;
  };
  riscosPorStatus: {
    aberto: number;
    mitigado: number;
    aceito: number;
  };
  riscosCriticosAbertos: number;
  riscosSemPlanoDeAcao: number;
  riscosPorContrato: Array<{
    contractId: number;
    contractTitle: string;
    total: number;
    criticos: number;
  }>;
}

// ─── Gateway ─────────────────────────────────────────────────────────────────

export class ContractsGateway {
  private sgcClient = getSGCClient();
  private cacheMap = new Map<string, { data: any; timestamp: number }>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutos

  // ─── Métodos principais ─────────────────────────────────────────────────

  /**
   * Obter KPIs consolidados de uma empresa (summary)
   * Endpoint: GET /companies/:sgcId/summary
   */
  async getCompanySummary(sgcEmpresaId: number): Promise<SGCSummaryPayload | null> {
    const cacheKey = `summary:${sgcEmpresaId}`;
    if (this.isCacheValid(cacheKey)) return this.cacheMap.get(cacheKey)!.data;

    const response = await this.sgcClient.get<{ success: boolean; data: SGCSummaryPayload }>(
      `/companies/${sgcEmpresaId}/summary`
    );

    if (!response.success || !response.data) {
      console.warn(`[ContractsGateway] Failed to fetch summary for sgcEmpresaId ${sgcEmpresaId}`);
      return null;
    }

    // O SGC retorna { success, data, meta } — extrair .data
    const payload = (response.data as any).data ?? response.data;
    this.setCache(cacheKey, payload);
    return payload;
  }

  /**
   * Obter lista de clientes de uma empresa
   * Endpoint: GET /companies/:sgcId/clients
   */
  async getClientsByEmpresa(sgcEmpresaId: number): Promise<StrategicClientSummaryDTO[]> {
    const cacheKey = `clients:${sgcEmpresaId}`;
    if (this.isCacheValid(cacheKey)) return this.cacheMap.get(cacheKey)!.data;

    const response = await this.sgcClient.get<{ success: boolean; data: SGCClientPayload[] }>(
      `/companies/${sgcEmpresaId}/clients`
    );

    if (!response.success || !response.data) {
      console.warn(`[ContractsGateway] Failed to fetch clients for sgcEmpresaId ${sgcEmpresaId}`);
      return [];
    }

    const rawList: SGCClientPayload[] = (response.data as any).data ?? response.data;
    const clients = rawList.map(this.mapSGCClientToDTO);
    this.setCache(cacheKey, clients);
    return clients;
  }

  /**
   * Obter dados de riscos de uma empresa
   * Endpoint: GET /companies/:sgcId/risks
   */
  async getRisksByEmpresa(sgcEmpresaId: number): Promise<SGCRisksPayload | null> {
    const cacheKey = `risks:${sgcEmpresaId}`;
    if (this.isCacheValid(cacheKey)) return this.cacheMap.get(cacheKey)!.data;

    const response = await this.sgcClient.get<{ success: boolean; data: SGCRisksPayload }>(
      `/companies/${sgcEmpresaId}/risks`
    );

    if (!response.success || !response.data) {
      console.warn(`[ContractsGateway] Failed to fetch risks for sgcEmpresaId ${sgcEmpresaId}`);
      return null;
    }

    const payload = (response.data as any).data ?? response.data;
    this.setCache(cacheKey, payload);
    return payload;
  }

  /**
   * Obter agregação de contratos por empresa (usando summary como fonte)
   * Mapeia os dados do summary para o formato StrategicContractAggregateDTO
   */
  async getContractAggregateByEmpresa(
    sgcEmpresaId: number
  ): Promise<StrategicContractAggregateDTO | null> {
    const summary = await this.getCompanySummary(sgcEmpresaId);
    if (!summary) return null;

    return {
      empresaId: summary.empresaId,
      totalContratos: summary.contratosTotal,
      totalClientes: summary.clientesAtivos,
      valorTotalContratos: summary.valorTotalContratado,
      contratosPorStatus: {
        vigente: summary.contratosVigentes,
        encerrado: summary.contratosEncerrados,
      },
      marcosPendentes: summary.marcosAVencer,
      marcosAtrasados: summary.marcosVencidos,
      riscosAbertos:
        (summary.riscosPorSeveridade?.baixa ?? 0) +
        (summary.riscosPorSeveridade?.media ?? 0) +
        (summary.riscosPorSeveridade?.alta ?? 0) +
        (summary.riscosPorSeveridade?.critica ?? 0),
      riscosAltosAbertos:
        (summary.riscosPorSeveridade?.alta ?? 0) +
        (summary.riscosPorSeveridade?.critica ?? 0),
      boletinsPendentes: summary.boletinsPendentes,
    };
  }

  /**
   * Obter agregação consolidada do grupo
   * Agrega summaries de todas as empresas com sgcEmpresaId mapeado
   */
  async getContractAggregateForGroup(): Promise<StrategicContractGroupAggregateDTO | null> {
    // Por enquanto, retorna apenas a empresa principal (930003)
    // Futuramente, iterar sobre todas as empresas com sgcEmpresaId
    const aggregate = await this.getContractAggregateByEmpresa(930003);
    if (!aggregate) return null;

    return {
      totalContratos: aggregate.totalContratos,
      totalClientes: aggregate.totalClientes,
      valorTotalContratos: aggregate.valorTotalContratos,
      empresas: [aggregate],
      marcosPendentes: aggregate.marcosPendentes,
      marcosAtrasados: aggregate.marcosAtrasados,
      riscosAbertos: aggregate.riscosAbertos,
      riscosAltosAbertos: aggregate.riscosAltosAbertos,
      boletinsPendentes: aggregate.boletinsPendentes,
    };
  }

  /**
   * Obter contratos por empresa (não disponível no SGC atual — retorna lista vazia)
   */
  async getContratosByEmpresa(_sgcEmpresaId: number): Promise<StrategicContractSummaryDTO[]> {
    console.warn("[ContractsGateway] getContratosByEmpresa: endpoint not available in SGC v1");
    return [];
  }

  /**
   * Obter contrato por ID (não disponível no SGC atual)
   */
  async getContratoById(_contratoId: number): Promise<StrategicContractSummaryDTO | null> {
    console.warn("[ContractsGateway] getContratoById: endpoint not available in SGC v1");
    return null;
  }

  /**
   * Obter marcos por contrato (não disponível no SGC atual)
   */
  async getMarcosByContrato(_contratoId: number): Promise<StrategicMilestoneSummaryDTO[]> {
    console.warn("[ContractsGateway] getMarcosByContrato: endpoint not available in SGC v1");
    return [];
  }

  /**
   * Obter riscos por contrato (não disponível no SGC atual — use getRisksByEmpresa)
   */
  async getRiscosByContrato(_contratoId: number): Promise<StrategicRiskSummaryDTO[]> {
    console.warn("[ContractsGateway] getRiscosByContrato: endpoint not available in SGC v1");
    return [];
  }

  /**
   * Obter boletins por contrato (não disponível no SGC atual)
   */
  async getBoletinsByContrato(_contratoId: number): Promise<StrategicBulletinSummaryDTO[]> {
    console.warn("[ContractsGateway] getBoletinsByContrato: endpoint not available in SGC v1");
    return [];
  }

  /**
   * Obter alertas estratégicos (derivados do summary)
   */
  async getStrategicAlerts(sgcEmpresaId?: number): Promise<StrategicAlertDTO[]> {
    const id = sgcEmpresaId ?? 930003;
    const summary = await this.getCompanySummary(id);
    if (!summary) return [];

    const alerts: StrategicAlertDTO[] = [];
    const now = new Date().toISOString();

    if (summary.marcosVencidos > 0) {
      alerts.push({
        id: "1",
        tipo: "marco_atrasado" as const,
        severidade: "critico" as const,
        titulo: `${summary.marcosVencidos} marco(s) vencido(s)`,
        descricao: `Existem ${summary.marcosVencidos} marcos financeiros com prazo vencido.`,
        empresaId: id,
        dataCriacao: now,
      });
    }

    if ((summary.riscosPorSeveridade?.critica ?? 0) > 0) {
      alerts.push({
        id: "2",
        tipo: "risco_alto" as const,
        severidade: "critico" as const,
        titulo: `${summary.riscosPorSeveridade.critica} risco(s) crítico(s)`,
        descricao: `Existem ${summary.riscosPorSeveridade.critica} riscos de severidade crítica identificados.`,
        empresaId: id,
        dataCriacao: now,
      });
    }

    return alerts;
  }

  /**
   * Obter contexto contratual completo
   */
  async getContractContext(sgcEmpresaId: number): Promise<StrategicContractContextDTO | null> {
    const cacheKey = `context:${sgcEmpresaId}`;
    if (this.isCacheValid(cacheKey)) return this.cacheMap.get(cacheKey)!.data;

    try {
      const [summary, clients, alerts] = await Promise.all([
        this.getCompanySummary(sgcEmpresaId),
        this.getClientsByEmpresa(sgcEmpresaId),
        this.getStrategicAlerts(sgcEmpresaId),
      ]);

      if (!summary) return null;

      const context: StrategicContractContextDTO = {
        empresaId: sgcEmpresaId,
        periodo: {
          inicio: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          fim: new Date().toISOString().split("T")[0],
        },
        contratos: [],
        clientes: clients,
        marcos: [],
        riscos: [],
        alertas: alerts,
        metricas: {
          totalValor: summary.valorTotalContratado,
          totalMarcos: summary.marcosAVencer + summary.marcosVencidos,
          marcosAtrasados: summary.marcosVencidos,
          riscosAltos:
            (summary.riscosPorSeveridade?.alta ?? 0) +
            (summary.riscosPorSeveridade?.critica ?? 0),
          boletinsPendentes: summary.boletinsPendentes,
        },
      };

      this.setCache(cacheKey, context);
      return context;
    } catch (error) {
      console.error(
        `[ContractsGateway] Failed to fetch contract context for sgcEmpresaId ${sgcEmpresaId}:`,
        error
      );
      return null;
    }
  }

  // ─── Cache ───────────────────────────────────────────────────────────────

  clearCache(): void {
    this.cacheMap.clear();
  }

  clearCacheKey(key: string): void {
    this.cacheMap.delete(key);
  }

  // ─── Mapeamentos ─────────────────────────────────────────────────────────

  private mapSGCClientToDTO(raw: SGCClientPayload): StrategicClientSummaryDTO {
    return {
      id: raw.clienteId,
      cnpj: "",
      razaoSocial: raw.clienteNome,
      nomeFantasia: raw.clienteNome,
      email: "",
      telefone: "",
      status: "ativo",
      empresaId: 0,
      totalContratos: raw.quantidadeContratos,
      valorTotalContratos: raw.valorAgregado,
      ultimoContratoData: raw.ultimoMovimento,
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private isCacheValid(key: string): boolean {
    const cached = this.cacheMap.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTTL;
  }

  private setCache(key: string, data: any): void {
    this.cacheMap.set(key, { data, timestamp: Date.now() });
  }
}

// Singleton
let contractsGatewayInstance: ContractsGateway | null = null;

export function getContractsGateway(): ContractsGateway {
  if (!contractsGatewayInstance) {
    contractsGatewayInstance = new ContractsGateway();
  }
  return contractsGatewayInstance;
}
