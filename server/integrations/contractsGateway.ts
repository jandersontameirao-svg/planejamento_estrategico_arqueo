/**
 * Contracts Gateway - Camada de abstração para consumir dados contratuais do SGC
 * 
 * Responsabilidades:
 * - Orquestrar chamadas ao SGC Client
 * - Mapear payloads brutos para DTOs internos
 * - Implementar cache local (opcional)
 * - Tratar fallback para dados legados
 * - Agregar dados para dashboards e análises
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

export class ContractsGateway {
  private sgcClient = getSGCClient();
  private cacheMap = new Map<string, { data: any; timestamp: number }>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutos

  /**
   * Obter lista de clientes por empresa
   */
  async getClientsByEmpresa(empresaId: number): Promise<StrategicClientSummaryDTO[]> {
    const cacheKey = `clients:${empresaId}`;

    if (this.isCacheValid(cacheKey)) {
      return this.cacheMap.get(cacheKey)!.data;
    }

    const response = await this.sgcClient.get<any[]>("/api/clientes", {
      empresaId,
    });

    if (!response.success || !response.data) {
      console.warn(`[ContractsGateway] Failed to fetch clients for empresa ${empresaId}`);
      return [];
    }

    const clients = response.data.map(this.mapToClientDTO);
    this.setCache(cacheKey, clients);

    return clients;
  }

  /**
   * Obter contrato por ID
   */
  async getContratoById(contratoId: number): Promise<StrategicContractSummaryDTO | null> {
    const cacheKey = `contrato:${contratoId}`;

    if (this.isCacheValid(cacheKey)) {
      return this.cacheMap.get(cacheKey)!.data;
    }

    const response = await this.sgcClient.get<any>(`/api/contratos/${contratoId}`);

    if (!response.success || !response.data) {
      console.warn(`[ContractsGateway] Failed to fetch contrato ${contratoId}`);
      return null;
    }

    const contrato = this.mapToContratoDTO(response.data);
    this.setCache(cacheKey, contrato);

    return contrato;
  }

  /**
   * Obter contratos por empresa
   */
  async getContratosByEmpresa(empresaId: number): Promise<StrategicContractSummaryDTO[]> {
    const cacheKey = `contratos:${empresaId}`;

    if (this.isCacheValid(cacheKey)) {
      return this.cacheMap.get(cacheKey)!.data;
    }

    const response = await this.sgcClient.get<any[]>("/api/contratos", {
      empresaId,
    });

    if (!response.success || !response.data) {
      console.warn(`[ContractsGateway] Failed to fetch contratos for empresa ${empresaId}`);
      return [];
    }

    const contratos = response.data.map(this.mapToContratoDTO);
    this.setCache(cacheKey, contratos);

    return contratos;
  }

  /**
   * Obter marcos por contrato
   */
  async getMarcosByContrato(contratoId: number): Promise<StrategicMilestoneSummaryDTO[]> {
    const cacheKey = `marcos:${contratoId}`;

    if (this.isCacheValid(cacheKey)) {
      return this.cacheMap.get(cacheKey)!.data;
    }

    const response = await this.sgcClient.get<any[]>(`/api/contratos/${contratoId}/marcos`);

    if (!response.success || !response.data) {
      console.warn(`[ContractsGateway] Failed to fetch marcos for contrato ${contratoId}`);
      return [];
    }

    const marcos = response.data.map(this.mapToMilestoneDTO);
    this.setCache(cacheKey, marcos);

    return marcos;
  }

  /**
   * Obter riscos por contrato
   */
  async getRiscosByContrato(contratoId: number): Promise<StrategicRiskSummaryDTO[]> {
    const cacheKey = `riscos:${contratoId}`;

    if (this.isCacheValid(cacheKey)) {
      return this.cacheMap.get(cacheKey)!.data;
    }

    const response = await this.sgcClient.get<any[]>(`/api/contratos/${contratoId}/riscos`);

    if (!response.success || !response.data) {
      console.warn(`[ContractsGateway] Failed to fetch riscos for contrato ${contratoId}`);
      return [];
    }

    const riscos = response.data.map(this.mapToRiskDTO);
    this.setCache(cacheKey, riscos);

    return riscos;
  }

  /**
   * Obter boletins por contrato
   */
  async getBoletinsByContrato(contratoId: number): Promise<StrategicBulletinSummaryDTO[]> {
    const cacheKey = `boletins:${contratoId}`;

    if (this.isCacheValid(cacheKey)) {
      return this.cacheMap.get(cacheKey)!.data;
    }

    const response = await this.sgcClient.get<any[]>(`/api/contratos/${contratoId}/boletins`);

    if (!response.success || !response.data) {
      console.warn(`[ContractsGateway] Failed to fetch boletins for contrato ${contratoId}`);
      return [];
    }

    const boletins = response.data.map(this.mapToBulletinDTO);
    this.setCache(cacheKey, boletins);

    return boletins;
  }

  /**
   * Obter agregação de contratos por empresa
   */
  async getContractAggregateByEmpresa(
    empresaId: number
  ): Promise<StrategicContractAggregateDTO | null> {
    const cacheKey = `aggregate:${empresaId}`;

    if (this.isCacheValid(cacheKey)) {
      return this.cacheMap.get(cacheKey)!.data;
    }

    const response = await this.sgcClient.get<any>("/api/contratos/aggregate", {
      empresaId,
    });

    if (!response.success || !response.data) {
      console.warn(
        `[ContractsGateway] Failed to fetch contract aggregate for empresa ${empresaId}`
      );
      return null;
    }

    const aggregate = this.mapToAggregateDTO(response.data);
    this.setCache(cacheKey, aggregate);

    return aggregate;
  }

  /**
   * Obter agregação de contratos para o grupo
   */
  async getContractAggregateForGroup(): Promise<StrategicContractGroupAggregateDTO | null> {
    const cacheKey = "aggregate:group";

    if (this.isCacheValid(cacheKey)) {
      return this.cacheMap.get(cacheKey)!.data;
    }

    const response = await this.sgcClient.get<any>("/api/contratos/aggregate/group");

    if (!response.success || !response.data) {
      console.warn(`[ContractsGateway] Failed to fetch contract aggregate for group`);
      return null;
    }

    const aggregate = this.mapToGroupAggregateDTO(response.data);
    this.setCache(cacheKey, aggregate);

    return aggregate;
  }

  /**
   * Obter alertas estratégicos
   */
  async getStrategicAlerts(empresaId?: number): Promise<StrategicAlertDTO[]> {
    const cacheKey = `alerts:${empresaId || "group"}`;

    if (this.isCacheValid(cacheKey)) {
      return this.cacheMap.get(cacheKey)!.data;
    }

    const response = await this.sgcClient.get<any[]>("/api/alertas", empresaId ? { empresaId } : {});

    if (!response.success || !response.data) {
      console.warn(`[ContractsGateway] Failed to fetch strategic alerts`);
      return [];
    }

    const alerts = response.data.map(this.mapToAlertDTO);
    this.setCache(cacheKey, alerts);

    return alerts;
  }

  /**
   * Obter contexto contratual completo para uma empresa
   */
  async getContractContext(empresaId: number): Promise<StrategicContractContextDTO | null> {
    const cacheKey = `context:${empresaId}`;

    if (this.isCacheValid(cacheKey)) {
      return this.cacheMap.get(cacheKey)!.data;
    }

    try {
      const [contratos, clientes, marcos, riscos, alertas] = await Promise.all([
        this.getContratosByEmpresa(empresaId),
        this.getClientsByEmpresa(empresaId),
        this.getMarcosByEmpresa(empresaId),
        this.getRiscosByEmpresa(empresaId),
        this.getStrategicAlerts(empresaId),
      ]);

      const totalValor = contratos.reduce((sum, c) => sum + (c.valorTotal || 0), 0);
      const totalMarcos = marcos.length;
      const marcosAtrasados = marcos.filter((m) => m.status === "atrasado").length;
      const riscosAltos = riscos.filter((r) => r.severidade === "critica").length;
      const boletinsPendentes = 0; // TODO: calcular

      const context: StrategicContractContextDTO = {
        empresaId,
        periodo: {
          inicio: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          fim: new Date().toISOString().split("T")[0],
        },
        contratos,
        clientes,
        marcos,
        riscos,
        alertas,
        metricas: {
          totalValor,
          totalMarcos,
          marcosAtrasados,
          riscosAltos,
          boletinsPendentes,
        },
      };

      this.setCache(cacheKey, context);
      return context;
    } catch (error) {
      console.error(`[ContractsGateway] Failed to fetch contract context for empresa ${empresaId}:`, error);
      return null;
    }
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.cacheMap.clear();
  }

  /**
   * Limpar cache de uma chave específica
   */
  clearCacheKey(key: string): void {
    this.cacheMap.delete(key);
  }

  // ─── Métodos privados de mapeamento ──────────────────────────────────────

  private mapToClientDTO(raw: any): StrategicClientSummaryDTO {
    return {
      id: raw.id,
      cnpj: raw.cnpj,
      razaoSocial: raw.razaoSocial,
      nomeFantasia: raw.nomeFantasia,
      email: raw.email,
      telefone: raw.telefone,
      status: raw.status || "ativo",
      empresaId: raw.empresaId,
      totalContratos: raw.totalContratos || 0,
      valorTotalContratos: raw.valorTotalContratos || 0,
      ultimoContratoData: raw.ultimoContratoData,
    };
  }

  private mapToContratoDTO(raw: any): StrategicContractSummaryDTO {
    return {
      id: raw.id,
      numero: raw.numero,
      titulo: raw.titulo,
      clienteId: raw.clienteId,
      clienteNome: raw.clienteNome || raw.cliente?.nomeFantasia || raw.cliente?.razaoSocial,
      empresaId: raw.empresaId,
      status: raw.status || "rascunho",
      valorTotal: raw.valorTotal,
      dataInicio: raw.dataInicio,
      dataFim: raw.dataFim,
      dataAssinatura: raw.dataAssinatura,
      totalMarcos: raw.totalMarcos || 0,
      marcosAtrasados: raw.marcosAtrasados || 0,
      totalRiscos: raw.totalRiscos || 0,
      riscosAltosAbertos: raw.riscosAltosAbertos || 0,
    };
  }

  private mapToMilestoneDTO(raw: any): StrategicMilestoneSummaryDTO {
    return {
      id: raw.id,
      contratoId: raw.contratoId,
      titulo: raw.titulo,
      valorPrevisto: raw.valorPrevisto,
      valorPago: raw.valorPago,
      dataPrevista: raw.dataPrevista,
      dataPagamento: raw.dataPagamento,
      status: raw.status || "pendente",
      diasAtrasado: raw.diasAtrasado,
      ordem: raw.ordem || 0,
    };
  }

  private mapToRiskDTO(raw: any): StrategicRiskSummaryDTO {
    return {
      id: raw.id,
      contratoId: raw.contratoId,
      titulo: raw.titulo,
      categoria: raw.categoria || "outro",
      probabilidade: raw.probabilidade || "media",
      impacto: raw.impacto || "medio",
      status: raw.status || "identificado",
      severidade: raw.severidade || "media",
    };
  }

  private mapToBulletinDTO(raw: any): StrategicBulletinSummaryDTO {
    return {
      id: raw.id,
      contratoId: raw.contratoId,
      marcoId: raw.marcoId,
      status: raw.status || "rascunho",
      valorMedicao: raw.valorMedicao,
      percentualMedicao: raw.percentualMedicao,
      periodo: raw.periodo,
      dataCriacao: raw.dataCriacao || new Date().toISOString(),
    };
  }

  private mapToAggregateDTO(raw: any): StrategicContractAggregateDTO {
    return {
      empresaId: raw.empresaId,
      totalContratos: raw.totalContratos || 0,
      totalClientes: raw.totalClientes || 0,
      valorTotalContratos: raw.valorTotalContratos || 0,
      contratosPorStatus: raw.contratosPorStatus || {},
      marcosPendentes: raw.marcosPendentes || 0,
      marcosAtrasados: raw.marcosAtrasados || 0,
      riscosAbertos: raw.riscosAbertos || 0,
      riscosAltosAbertos: raw.riscosAltosAbertos || 0,
      boletinsPendentes: raw.boletinsPendentes || 0,
    };
  }

  private mapToGroupAggregateDTO(raw: any): StrategicContractGroupAggregateDTO {
    return {
      totalContratos: raw.totalContratos || 0,
      totalClientes: raw.totalClientes || 0,
      valorTotalContratos: raw.valorTotalContratos || 0,
      empresas: (raw.empresas || []).map(this.mapToAggregateDTO.bind(this)),
      marcosPendentes: raw.marcosPendentes || 0,
      marcosAtrasados: raw.marcosAtrasados || 0,
      riscosAbertos: raw.riscosAbertos || 0,
      riscosAltosAbertos: raw.riscosAltosAbertos || 0,
      boletinsPendentes: raw.boletinsPendentes || 0,
    };
  }

  private mapToAlertDTO(raw: any): StrategicAlertDTO {
    return {
      id: raw.id,
      tipo: raw.tipo,
      severidade: raw.severidade || "aviso",
      titulo: raw.titulo,
      descricao: raw.descricao,
      empresaId: raw.empresaId,
      contratoId: raw.contratoId,
      marcoId: raw.marcoId,
      dataCriacao: raw.dataCriacao || new Date().toISOString(),
      dataVencimento: raw.dataVencimento,
      acao: raw.acao,
    };
  }

  // ─── Métodos auxiliares ──────────────────────────────────────────────────

  private async getMarcosByEmpresa(empresaId: number): Promise<StrategicMilestoneSummaryDTO[]> {
    const contratos = await this.getContratosByEmpresa(empresaId);
    const allMarcos: StrategicMilestoneSummaryDTO[] = [];

    for (const contrato of contratos) {
      const marcos = await this.getMarcosByContrato(contrato.id);
      allMarcos.push(...marcos);
    }

    return allMarcos;
  }

  private async getRiscosByEmpresa(empresaId: number): Promise<StrategicRiskSummaryDTO[]> {
    const contratos = await this.getContratosByEmpresa(empresaId);
    const allRiscos: StrategicRiskSummaryDTO[] = [];

    for (const contrato of contratos) {
      const riscos = await this.getRiscosByContrato(contrato.id);
      allRiscos.push(...riscos);
    }

    return allRiscos;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cacheMap.get(key);
    if (!cached) return false;

    const age = Date.now() - cached.timestamp;
    return age < this.cacheTTL;
  }

  private setCache(key: string, data: any): void {
    this.cacheMap.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}

// Instância global (singleton)
let contractsGatewayInstance: ContractsGateway | null = null;

export function getContractsGateway(): ContractsGateway {
  if (!contractsGatewayInstance) {
    contractsGatewayInstance = new ContractsGateway();
  }
  return contractsGatewayInstance;
}
