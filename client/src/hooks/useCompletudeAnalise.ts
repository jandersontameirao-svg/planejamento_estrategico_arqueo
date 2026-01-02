import { useMemo } from "react";

export interface AnaliseData {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Calcula o percentual de completude de uma análise
 * baseado nos campos preenchidos
 */
export function useCompletudeAnalise(data: AnaliseData, camposObrigatorios?: string[]): number {
  return useMemo(() => {
    if (!data) return 0;

    const campos = camposObrigatorios || Object.keys(data);
    if (campos.length === 0) return 0;

    const preenchidos = campos.filter((campo) => {
      const valor = data[campo];
      // Considera preenchido se não é vazio, undefined ou 0
      return valor !== undefined && valor !== null && valor !== "" && valor !== 0;
    }).length;

    return Math.round((preenchidos / campos.length) * 100);
  }, [data, camposObrigatorios]);
}

/**
 * Hook para gerenciar estado de completude de múltiplas análises
 */
export function useCompletudeMultipla(analises: Record<string, AnaliseData>) {
  return useMemo(() => {
    const completude: Record<string, number> = {};

    Object.entries(analises).forEach(([id, data]) => {
      const campos = Object.keys(data);
      const preenchidos = campos.filter((campo) => {
        const valor = data[campo];
        return valor !== undefined && valor !== null && valor !== "" && valor !== 0;
      }).length;

      completude[id] = campos.length > 0 ? Math.round((preenchidos / campos.length) * 100) : 0;
    });

    return completude;
  }, [analises]);
}
