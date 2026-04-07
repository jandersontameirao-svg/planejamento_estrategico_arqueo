/**
 * SGC Deep Links - Gerador de links profundos para abrir itens no SGC
 * 
 * Todos os links são construídos a partir de SGC_PUBLIC_APP_URL (env),
 * garantindo que nenhum domínio é hardcoded.
 */

function getSGCPublicUrl(): string {
  const url = process.env.SGC_PUBLIC_APP_URL || "";
  // Remove trailing slash
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Gerar link para visualizar um cliente no SGC
 */
export function sgcClienteLink(clienteId: number): string {
  return `${getSGCPublicUrl()}/clientes/${clienteId}`;
}

/**
 * Gerar link para visualizar um contrato no SGC
 */
export function sgcContratoLink(empresaId: number, contratoId: number): string {
  return `${getSGCPublicUrl()}/empresa/${empresaId}/contratos/${contratoId}`;
}

/**
 * Gerar link para visualizar detalhes de um contrato no SGC
 */
export function sgcContratoDetalheLink(empresaId: number, contratoId: number): string {
  return `${getSGCPublicUrl()}/empresa/${empresaId}/contratos/${contratoId}`;
}

/**
 * Gerar link para a lista de contratos de uma empresa no SGC
 */
export function sgcContratosListLink(empresaId: number): string {
  return `${getSGCPublicUrl()}/empresa/${empresaId}/contratos`;
}

/**
 * Gerar link para a gestão de clientes de uma empresa no SGC
 */
export function sgcClientesListLink(empresaId: number): string {
  return `${getSGCPublicUrl()}/empresa/${empresaId}/clientes`;
}

/**
 * Gerar link para um marco específico no SGC
 */
export function sgcMarcoLink(empresaId: number, contratoId: number, marcoId: number): string {
  return `${getSGCPublicUrl()}/empresa/${empresaId}/contratos/${contratoId}#marco-${marcoId}`;
}

/**
 * Gerar link para um risco específico no SGC
 */
export function sgcRiscoLink(empresaId: number, contratoId: number, riscoId: number): string {
  return `${getSGCPublicUrl()}/empresa/${empresaId}/contratos/${contratoId}#risco-${riscoId}`;
}

/**
 * Gerar link para um boletim específico no SGC
 */
export function sgcBoletimLink(empresaId: number, contratoId: number, boletimId: number): string {
  return `${getSGCPublicUrl()}/empresa/${empresaId}/contratos/${contratoId}/boletins/${boletimId}`;
}

/**
 * Gerar link para a página inicial do SGC
 */
export function sgcHomeLink(): string {
  return getSGCPublicUrl();
}

/**
 * Verificar se deep links estão configurados
 */
export function isSGCDeepLinksEnabled(): boolean {
  return !!process.env.SGC_PUBLIC_APP_URL;
}
