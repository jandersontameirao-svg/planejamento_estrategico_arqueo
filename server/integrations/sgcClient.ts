/**
 * SGC Client - Cliente HTTP para integração com Sistema de Gestão de Contratos (SGC)
 * 
 * Responsabilidades:
 * - Centralizar chamadas HTTP para o SGC
 * - Gerenciar autenticação via token técnico
 * - Tratar timeouts, erros e indisponibilidade
 * - Serializar/desserializar payloads
 * - Registrar logs de integração
 */

export interface SGCClientConfig {
  baseUrl: string;
  token: string;
  timeoutMs: number;
  enabled: boolean;
}

export interface SGCResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Classe para gerenciar requisições ao SGC
 */
export class SGCClient {
  private baseUrl: string;
  private token: string;
  private timeoutMs: number;
  private enabled: boolean;

  constructor(config: SGCClientConfig) {
    this.baseUrl = config.baseUrl;
    this.token = config.token;
    this.timeoutMs = config.timeoutMs;
    this.enabled = config.enabled;
  }

  /**
   * Fazer requisição GET para o SGC
   */
  async get<T>(path: string, params?: Record<string, any>): Promise<SGCResponse<T>> {
    if (!this.enabled) {
      return {
        success: false,
        error: "SGC integration is disabled",
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const url = new URL(`${this.baseUrl}${path}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
          "X-Request-ID": this.generateRequestId(),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[SGC] GET ${path} failed:`, {
          status: response.status,
          error: errorText,
        });

        return {
          success: false,
          error: `SGC returned ${response.status}: ${errorText}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SGC] GET ${path} error:`, errorMessage);

      return {
        success: false,
        error: `Request failed: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Fazer requisição POST para o SGC
   */
  async post<T>(path: string, body?: any): Promise<SGCResponse<T>> {
    if (!this.enabled) {
      return {
        success: false,
        error: "SGC integration is disabled",
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
          "X-Request-ID": this.generateRequestId(),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[SGC] POST ${path} failed:`, {
          status: response.status,
          error: errorText,
        });

        return {
          success: false,
          error: `SGC returned ${response.status}: ${errorText}`,
          timestamp: new Date().toISOString(),
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SGC] POST ${path} error:`, errorMessage);

      return {
        success: false,
        error: `Request failed: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Gerar ID único para rastreamento de requisições
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verificar se a integração está habilitada
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Obter configuração atual
   */
  getConfig(): SGCClientConfig {
    return {
      baseUrl: this.baseUrl,
      token: this.token,
      timeoutMs: this.timeoutMs,
      enabled: this.enabled,
    };
  }
}

/**
 * Factory para criar instância do SGC Client com env vars
 */
export function createSGCClient(): SGCClient {
  const baseUrl = process.env.SGC_API_BASE_URL || "";
  const token = process.env.SGC_INTERNAL_TOKEN || "";
  const timeoutMs = parseInt(process.env.SGC_TIMEOUT_MS || "30000", 10);
  const enabled = process.env.SGC_ENABLED === "true";

  if (enabled && (!baseUrl || !token)) {
    console.warn("[SGC] Integration enabled but missing baseUrl or token");
  }

  return new SGCClient({
    baseUrl,
    token,
    timeoutMs,
    enabled,
  });
}

// Instância global (singleton)
let sgcClientInstance: SGCClient | null = null;

export function getSGCClient(): SGCClient {
  if (!sgcClientInstance) {
    sgcClientInstance = createSGCClient();
  }
  return sgcClientInstance;
}
