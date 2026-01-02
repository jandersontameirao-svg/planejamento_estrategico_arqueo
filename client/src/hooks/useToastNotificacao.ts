import { useCallback } from "react";

// Fallback para useToast se não estiver disponível
const useToastFallback = () => {
  return {
    toast: (config: any) => {
      console.log("Toast:", config);
    },
  };
};

let useToast: any;
try {
  useToast = require("@/components/ui/use-toast").useToast;
} catch {
  useToast = useToastFallback;
}

type ToastType = "sucesso" | "erro" | "info" | "aviso";

interface ToastOpcoes {
  duracao?: number;
  descricao?: string;
}

/**
 * Hook para mostrar notificações toast com ícones e cores específicas
 */
export function useToastNotificacao() {
  const { toast } = useToast();

  const mostrarSucesso = useCallback(
    (titulo: string, opcoes: ToastOpcoes = {}) => {
      toast({
        title: titulo,
        description: opcoes.descricao,
        duration: opcoes.duracao || 3000,
        variant: "default",
      });
    },
    [toast]
  );

  const mostrarErro = useCallback(
    (titulo: string, opcoes: ToastOpcoes = {}) => {
      toast({
        title: titulo,
        description: opcoes.descricao,
        duration: opcoes.duracao || 5000,
        variant: "destructive",
      });
    },
    [toast]
  );

  const mostrarInfo = useCallback(
    (titulo: string, opcoes: ToastOpcoes = {}) => {
      toast({
        title: titulo,
        description: opcoes.descricao,
        duration: opcoes.duracao || 3000,
        variant: "default",
      });
    },
    [toast]
  );

  const mostrarAviso = useCallback(
    (titulo: string, opcoes: ToastOpcoes = {}) => {
      toast({
        title: titulo,
        description: opcoes.descricao,
        duration: opcoes.duracao || 4000,
        variant: "default",
      });
    },
    [toast]
  );

  return {
    mostrarSucesso,
    mostrarErro,
    mostrarInfo,
    mostrarAviso,
  };
}

/**
 * Hook para notificações de salvamento
 */
export function useToastSalvamento() {
  const { mostrarSucesso, mostrarErro } = useToastNotificacao();

  const notificarSalvo = useCallback(
    (analise: string) => {
      mostrarSucesso(`${analise} salvo com sucesso`, {
        descricao: "Suas alterações foram persistidas",
        duracao: 2000,
      });
    },
    [mostrarSucesso]
  );

  const notificarErroSalvamento = useCallback(
    (analise: string, erro?: string) => {
      mostrarErro(`Erro ao salvar ${analise}`, {
        descricao: erro || "Tente novamente mais tarde",
        duracao: 5000,
      });
    },
    [mostrarErro]
  );

  const notificarExportacao = useCallback(
    (nomeArquivo: string) => {
      mostrarSucesso("PDF exportado com sucesso", {
        descricao: `Arquivo: ${nomeArquivo}`,
        duracao: 3000,
      });
    },
    [mostrarSucesso]
  );

  return {
    notificarSalvo,
    notificarErroSalvamento,
    notificarExportacao,
  };
}
