import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import html2pdf from "html2pdf.js";
import { useNotification } from "@/hooks/useNotification";

interface ExportarPDFProps {
  titulo: string;
  conteudoRef: React.RefObject<HTMLDivElement>;
  nomeArquivo?: string;
}

export function ExportarPDF({ titulo, conteudoRef, nomeArquivo = "analise" }: ExportarPDFProps) {
  const notification = useNotification();
  const handleExport = () => {
    if (!conteudoRef.current) {
      notification.error("Conteúdo não encontrado para exportação");
      return;
    }

    const element = conteudoRef.current;
    const opt: any = {
      margin: 10,
      filename: `${nomeArquivo}-${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <Button onClick={handleExport} size="sm" variant="outline">
      <FileDown className="mr-2 h-4 w-4" />
      Exportar PDF
    </Button>
  );
}

/**
 * Exporta múltiplas análises em um único PDF consolidado
 */
export function ExportarPDFConsolidado(analises: Record<string, React.RefObject<HTMLDivElement>>) {
  const notification = useNotification();
  const handleExport = () => {
    const conteudosCombinados = Object.entries(analises)
      .map(([nome, ref]) => ref.current?.innerHTML || "")
      .join("<div style='page-break-after: always;'></div>");

    if (!conteudosCombinados) {
      notification.error("Nenhuma análise para exportar");
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.innerHTML = conteudosCombinados;

    const opt: any = {
      margin: 10,
      filename: `planejamento-estrategico-${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    html2pdf().set(opt).from(wrapper).save();
  };

  return (
    <Button onClick={handleExport} size="lg" className="w-full">
      <FileDown className="mr-2 h-4 w-4" />
      Gerar Relatório Consolidado em PDF
    </Button>
  );
}
