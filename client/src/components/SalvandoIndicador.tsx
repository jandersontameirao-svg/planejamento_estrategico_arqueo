import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusSalvamento = "salvando" | "salvo" | "erro" | "inativo";

interface SalvandoIndicadorProps {
  status: StatusSalvamento;
  mensagem?: string;
  className?: string;
}

export function SalvandoIndicador({ status, mensagem, className }: SalvandoIndicadorProps) {
  if (status === "inativo") return null;

  const statusConfig = {
    salvando: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      text: mensagem || "Salvando...",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    salvo: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      text: mensagem || "Salvo",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    erro: {
      icon: <AlertCircle className="h-4 w-4" />,
      text: mensagem || "Erro ao salvar",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300",
        config.bg,
        config.border,
        config.color,
        className
      )}
    >
      {config.icon}
      <span className="text-sm font-medium">{config.text}</span>
    </div>
  );
}

/**
 * Badge compacto para indicador de salvamento
 */
interface SalvandoBadgeProps {
  status: StatusSalvamento;
  className?: string;
}

export function SalvandoBadge({ status, className }: SalvandoBadgeProps) {
  if (status === "inativo") return null;

  const statusConfig = {
    salvando: {
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      bg: "bg-blue-100",
      text: "text-blue-700",
    },
    salvo: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      bg: "bg-green-100",
      text: "text-green-700",
    },
    erro: {
      icon: <AlertCircle className="h-3 w-3" />,
      bg: "bg-red-100",
      text: "text-red-700",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        config.bg,
        config.text,
        className
      )}
    >
      {config.icon}
    </div>
  );
}

/**
 * Indicador de salvamento em linha (para headers)
 */
interface SalvandoInlineProps {
  status: StatusSalvamento;
  className?: string;
}

export function SalvandoInline({ status, className }: SalvandoInlineProps) {
  if (status === "inativo") return null;

  const statusConfig = {
    salvando: {
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      text: "Salvando...",
      color: "text-blue-600",
    },
    salvo: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      text: "Salvo",
      color: "text-green-600",
    },
    erro: {
      icon: <AlertCircle className="h-3 w-3" />,
      text: "Erro",
      color: "text-red-600",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-1 text-xs font-medium", config.color, className)}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}
