import { ExternalLink, Info } from "lucide-react";

interface SGCBannerProps {
  message?: string;
  sgcUrl?: string;
  variant?: "info" | "warning";
}

/**
 * Banner informativo indicando que o módulo é gerenciado pelo SGC.
 * Exibe link para abrir o item diretamente no SGC quando disponível.
 */
export function SGCBanner({
  message = "Este módulo é gerenciado pelo Sistema de Gestão de Contratos (SGC).",
  sgcUrl,
  variant = "info",
}: SGCBannerProps) {
  const bgColor = variant === "warning"
    ? "bg-amber-50 border-amber-200 text-amber-800"
    : "bg-blue-50 border-blue-200 text-blue-800";

  const iconColor = variant === "warning" ? "text-amber-500" : "text-blue-500";

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 ${bgColor}`}>
      <Info className={`h-5 w-5 mt-0.5 shrink-0 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>
        <p className="text-xs mt-1 opacity-75">
          Criação, edição e gestão oficial de contratos e clientes devem ser realizadas no SGC.
        </p>
      </div>
      {sgcUrl && (
        <a
          href={sgcUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md bg-white/80 px-3 py-1.5 text-xs font-medium shadow-sm border border-current/20 hover:bg-white transition-colors shrink-0"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Abrir no SGC
        </a>
      )}
    </div>
  );
}

/**
 * Banner compacto para uso inline em formulários/cards
 */
export function SGCReadOnlyBadge({ sgcUrl }: { sgcUrl?: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-medium">
      <Info className="h-3 w-3" />
      <span>Somente leitura — Gerenciado pelo SGC</span>
      {sgcUrl && (
        <a
          href={sgcUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 underline hover:no-underline"
        >
          Abrir
        </a>
      )}
    </div>
  );
}
