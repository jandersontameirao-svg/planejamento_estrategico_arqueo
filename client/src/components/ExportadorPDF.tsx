import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import html2pdf from "html2pdf.js";

interface ExportadorPDFProps {
  tipo: "pestel" | "cinco_forcas" | "stakeholders" | "swot" | "okr" | "bsc" | "vrio" | "identidade";
  titulo: string;
  conteudo: React.ReactNode;
  dados?: Record<string, any>;
}

export function ExportadorPDF({ tipo, titulo, conteudo, dados }: ExportadorPDFProps) {
  const exportarIndividual = async () => {
    const elemento = document.createElement("div");
    elemento.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #333; border-bottom: 3px solid #f97316; padding-bottom: 10px;">${titulo}</h1>
        <p style="color: #666; margin-top: 10px;">Gerado em: ${new Date().toLocaleString("pt-BR")}</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <div style="margin-top: 20px;">
          ${JSON.stringify(dados, null, 2).replace(/\n/g, "<br>").replace(/ /g, "&nbsp;")}
        </div>
      </div>
    `;

    const opcoes: any = {
      margin: 10,
      filename: `${tipo}-${new Date().getTime()}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    html2pdf().set(opcoes).from(elemento).save();
  };

  return (
    <Button
      onClick={exportarIndividual}
      size="sm"
      variant="outline"
      className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
    >
      <Download className="h-4 w-4" />
      Exportar PDF
    </Button>
  );
}

interface ExportadorConsolidadoProps {
  analises: Array<{
    tipo: string;
    titulo: string;
    dados: Record<string, any>;
  }>;
}

export function ExportadorConsolidado({ analises }: ExportadorConsolidadoProps) {
  const exportarConsolidado = async () => {
    const elemento = document.createElement("div");
    
    let conteudoHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #333; text-align: center; border-bottom: 3px solid #f97316; padding-bottom: 10px;">
          Relatório Consolidado de Planejamento Estratégico
        </h1>
        <p style="color: #666; text-align: center; margin-top: 10px;">
          Gerado em: ${new Date().toLocaleString("pt-BR")}
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 2px solid #ddd;">
    `;

    analises.forEach((analise, index) => {
      conteudoHTML += `
        <div style="page-break-inside: avoid; margin-bottom: 30px;">
          <h2 style="color: #f97316; border-left: 4px solid #f97316; padding-left: 10px; margin-top: ${index > 0 ? '40px' : '0'};">
            ${analise.titulo}
          </h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
            <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 12px; color: #333;">
${JSON.stringify(analise.dados, null, 2)}
            </pre>
          </div>
        </div>
      `;
    });

    conteudoHTML += `
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
        <p style="color: #999; text-align: center; font-size: 12px; margin-top: 20px;">
          Documento gerado automaticamente pelo Sistema de Gestão Estratégica
        </p>
      </div>
    `;

    elemento.innerHTML = conteudoHTML;

    const opcoes: any = {
      margin: 10,
      filename: `relatorio-consolidado-${new Date().getTime()}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    html2pdf().set(opcoes).from(elemento).save();
  };

  return (
    <Button
      onClick={exportarConsolidado}
      className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
    >
      <FileText className="h-4 w-4" />
      Gerar Relatório Consolidado
    </Button>
  );
}
