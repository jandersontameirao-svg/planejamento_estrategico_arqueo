import { useState, useCallback, useEffect } from "react";

type StatusSalvamento = "salvando" | "salvo" | "erro" | "inativo";

interface UseSalvamentoOptions {
  delayMostraSalvo?: number; // ms para manter "Salvo" visível (default: 2000)
  delayOcultaErro?: number; // ms para ocultar "Erro" (default: 5000)
}

/**
 * Hook para gerenciar estado de salvamento com feedback visual
 */
export function useSalvamento(opcoes: UseSalvamentoOptions = {}) {
  const { delayMostraSalvo = 2000, delayOcultaErro = 5000 } = opcoes;
  const [status, setStatus] = useState<StatusSalvamento>("inativo");
  const [mensagem, setMensagem] = useState<string>("");

  // Timer para auto-reset
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (status === "salvo") {
      timer = setTimeout(() => setStatus("inativo"), delayMostraSalvo);
    } else if (status === "erro") {
      timer = setTimeout(() => setStatus("inativo"), delayOcultaErro);
    }

    return () => clearTimeout(timer);
  }, [status, delayMostraSalvo, delayOcultaErro]);

  const iniciarSalvamento = useCallback((msg?: string) => {
    setStatus("salvando");
    setMensagem(msg || "");
  }, []);

  const marcarSalvo = useCallback((msg?: string) => {
    setStatus("salvo");
    setMensagem(msg || "Salvo com sucesso");
  }, []);

  const marcarErro = useCallback((msg?: string) => {
    setStatus("erro");
    setMensagem(msg || "Erro ao salvar");
  }, []);

  const resetar = useCallback(() => {
    setStatus("inativo");
    setMensagem("");
  }, []);

  return {
    status,
    mensagem,
    iniciarSalvamento,
    marcarSalvo,
    marcarErro,
    resetar,
  };
}

/**
 * Hook para gerenciar salvamento com debounce
 */
export function useSalvamentoComDebounce(
  onSalvar: (dados: any) => Promise<void>,
  opcoes: UseSalvamentoOptions & { delay?: number } = {}
) {
  const { delay = 1000, ...salvoOpcoes } = opcoes;
  const salvamento = useSalvamento(salvoOpcoes);
  const [dados, setDados] = useState<any>(null);

  useEffect(() => {
    if (!dados) return;

    const timer = setTimeout(async () => {
      try {
        salvamento.iniciarSalvamento("Salvando alterações...");
        await onSalvar(dados);
        salvamento.marcarSalvo("Alterações salvas");
      } catch (error) {
        console.error("Erro ao salvar:", error);
        salvamento.marcarErro("Falha ao salvar alterações");
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [dados, delay, onSalvar, salvamento]);

  const atualizarDados = useCallback((novosDados: any) => {
    setDados(novosDados);
  }, []);

  return {
    ...salvamento,
    atualizarDados,
  };
}

/**
 * Hook para múltiplas análises com salvamento independente
 */
export function useSalvamentoMultiplo(opcoes: UseSalvamentoOptions = {}) {
  const [statusPorAnalise, setStatusPorAnalise] = useState<Record<string, StatusSalvamento>>({});
  const [mensagensPorAnalise, setMensagensPorAnalise] = useState<Record<string, string>>({});

  const iniciarSalvamento = useCallback((analiseId: string, msg?: string) => {
    setStatusPorAnalise((prev) => ({ ...prev, [analiseId]: "salvando" }));
    setMensagensPorAnalise((prev) => ({ ...prev, [analiseId]: msg || "" }));
  }, []);

  const marcarSalvo = useCallback((analiseId: string, msg?: string) => {
    setStatusPorAnalise((prev) => ({ ...prev, [analiseId]: "salvo" }));
    setMensagensPorAnalise((prev) => ({ ...prev, [analiseId]: msg || "Salvo" }));

    const timer = setTimeout(() => {
      setStatusPorAnalise((prev) => ({ ...prev, [analiseId]: "inativo" }));
    }, opcoes.delayMostraSalvo || 2000);

    return () => clearTimeout(timer);
  }, [opcoes.delayMostraSalvo]);

  const marcarErro = useCallback((analiseId: string, msg?: string) => {
    setStatusPorAnalise((prev) => ({ ...prev, [analiseId]: "erro" }));
    setMensagensPorAnalise((prev) => ({ ...prev, [analiseId]: msg || "Erro ao salvar" }));

    const timer = setTimeout(() => {
      setStatusPorAnalise((prev) => ({ ...prev, [analiseId]: "inativo" }));
    }, opcoes.delayOcultaErro || 5000);

    return () => clearTimeout(timer);
  }, [opcoes.delayOcultaErro]);

  return {
    statusPorAnalise,
    mensagensPorAnalise,
    iniciarSalvamento,
    marcarSalvo,
    marcarErro,
  };
}
