import { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";

interface TemplatePreviewProps {
  corPrimaria: string;
  corSecundaria: string;
  logoUrl?: string | null;
  rodapePersonalizado?: string;
  empresaNome: string;
}

export default function TemplatePreview({
  corPrimaria,
  corSecundaria,
  logoUrl,
  rodapePersonalizado,
  empresaNome,
}: TemplatePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generatePreview();
  }, [corPrimaria, corSecundaria, logoUrl, rodapePersonalizado, empresaNome]);

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [139, 21, 56]; // Bordo padrão
  };

  const generatePreview = async () => {
    if (!canvasRef.current) return;

    const doc = new jsPDF();
    const [r, g, b] = hexToRgb(corPrimaria);
    const [r2, g2, b2] = hexToRgb(corSecundaria);

    // Cabeçalho com cor primária
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, 210, 40, "F");

    // Logo (se disponível)
    if (logoUrl) {
      try {
        doc.addImage(logoUrl, "PNG", 10, 8, 25, 25);
      } catch (error) {
        console.warn("Erro ao adicionar logo no preview:", error);
      }
    }

    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    const titleX = logoUrl ? 120 : 105;
    doc.text("Análise Estratégica", titleX, 15, { align: logoUrl ? "left" : "center" });

    // Nome da empresa
    doc.setFontSize(14);
    doc.text(empresaNome || "Nome da Empresa", titleX, 28, { align: logoUrl ? "left" : "center" });

    // Data
    doc.setFontSize(10);
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    doc.text(`Gerado em: ${dataAtual}`, titleX, 35, { align: logoUrl ? "left" : "center" });

    // Conteúdo de exemplo
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(16);
    doc.text("Resumo Executivo", 20, 55);

    doc.setFontSize(11);
    doc.text("Este é um exemplo de como seu relatório ficará com as configurações atuais.", 20, 65);

    // Seção com cor secundária
    doc.setFillColor(r2, g2, b2);
    doc.rect(20, 75, 170, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text("Seção de Destaque", 22, 80);

    // Texto de exemplo
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(10);
    doc.text("Os destaques e elementos importantes utilizarão a cor secundária escolhida.", 20, 90);
    doc.text("Esta visualização permite que você veja como as cores se combinam antes de salvar.", 20, 97);

    // Rodapé
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    const rodapeTexto = rodapePersonalizado || `${empresaNome} - Planejamento Estratégico`;
    doc.text(rodapeTexto, 105, 285, { align: "center" });
    doc.text("Página 1", 105, 290, { align: "center" });

    // Renderizar no canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Obter imagem do PDF
    const imgData = doc.output("dataurlstring");
    const img = new Image();
    img.onload = () => {
      // Ajustar tamanho do canvas
      const scale = canvas.width / img.width;
      canvas.height = img.height * scale;
      
      // Desenhar imagem
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = imgData;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Preview do Relatório
        </CardTitle>
        <CardDescription>
          Visualização em tempo real de como seu relatório ficará com as configurações atuais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center p-4">
          <canvas
            ref={canvasRef}
            width={400}
            className="max-w-full shadow-lg"
            style={{ backgroundColor: "white" }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          O preview é atualizado automaticamente quando você altera as configurações
        </p>
      </CardContent>
    </Card>
  );
}
