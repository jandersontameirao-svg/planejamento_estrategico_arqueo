import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface EmpresaInfo {
  nome: string;
  logo?: string;
}

interface TemplateConfig {
  corPrimaria: string;
  corSecundaria: string;
  incluirPestel?: boolean;
  incluirSwot?: boolean;
  incluirOkr?: boolean;
  incluirBsc?: boolean;
  incluirGraficos?: boolean;
  incluirRecomendacoes?: boolean;
  rodapePersonalizado?: string;
}

// Cores padrão do tema (usadas se não houver configuração personalizada)
const DEFAULT_COLORS = {
  primary: "#8B1538", // Bordo
  secondary: "#FF6B35", // Laranja
  accent: "#F7B801", // Amarelo
  blue: "#4A90E2", // Azul
  text: "#333333",
  lightGray: "#F5F5F5",
};

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

function addHeader(doc: jsPDF, empresa: EmpresaInfo, titulo: string, config?: TemplateConfig) {
  const primaryColor = config?.corPrimaria || DEFAULT_COLORS.primary;
  const [r, g, b] = hexToRgb(primaryColor);
  
  // Retângulo de cabeçalho
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, 210, 40, "F");

  // Logo (se disponível)
  if (empresa.logo) {
    try {
      // Adicionar logo no canto esquerdo do cabeçalho
      doc.addImage(empresa.logo, "PNG", 10, 8, 25, 25);
    } catch (error) {
      console.warn("Erro ao adicionar logo:", error);
    }
  }

  // Título (ajustar posição se houver logo)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  const titleX = empresa.logo ? 120 : 105;
  doc.text(titulo, titleX, 15, { align: empresa.logo ? "left" : "center" });

  // Nome da empresa
  doc.setFontSize(14);
  doc.text(empresa.nome, titleX, 28, { align: empresa.logo ? "left" : "center" });

  // Data de geração
  doc.setFontSize(10);
  const dataAtual = new Date().toLocaleDateString("pt-BR");
  doc.text(`Gerado em: ${dataAtual}`, titleX, 35, { align: empresa.logo ? "left" : "center" });

  // Reset cor do texto
  const [tr, tg, tb] = hexToRgb(DEFAULT_COLORS.text);
  doc.setTextColor(tr, tg, tb);
}

function addFooter(doc: jsPDF, pageNumber: number, config?: TemplateConfig) {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  
  const footerText = config?.rodapePersonalizado 
    ? `Página ${pageNumber} | ${config.rodapePersonalizado}`
    : `Página ${pageNumber} | Sistema de Gestão Estratégica - Grupo Arqueo`;
  
  doc.text(
    footerText,
    105,
    pageHeight - 10,
    { align: "center" }
  );
}

export function exportPestelPDF(
  empresa: EmpresaInfo,
  fatores: Array<{
    categoria: string;
    descricao: string;
    impacto: number;
    probabilidade: number;
  }>,
  config?: TemplateConfig
) {
  const doc = new jsPDF();

  addHeader(doc, empresa, "Análise PESTEL", config);

  // Introdução
  doc.setFontSize(12);
  doc.text("Fatores Macro-Ambientais", 14, 50);

  let yPos = 60;

  // Agrupar por categoria
  const categorias = [
    "politico",
    "economico",
    "social",
    "tecnologico",
    "ambiental",
    "legal",
  ];
  const nomesCategorias: Record<string, string> = {
    politico: "Político",
    economico: "Econômico",
    social: "Social",
    tecnologico: "Tecnológico",
    ambiental: "Ambiental",
    legal: "Legal",
  };

  categorias.forEach((cat) => {
    const fatoresCategoria = fatores.filter((f) => f.categoria === cat);

    if (fatoresCategoria.length > 0) {
      // Título da categoria
      doc.setFillColor(DEFAULT_COLORS.secondary);
      doc.rect(14, yPos - 5, 182, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.text(nomesCategorias[cat], 16, yPos);
      yPos += 10;

      doc.setTextColor(DEFAULT_COLORS.text);
      doc.setFontSize(10);

      // Tabela de fatores
      const tableData = fatoresCategoria.map((f) => [
        f.descricao,
        f.impacto.toString(),
        f.probabilidade.toString(),
        (f.impacto * f.probabilidade).toString(),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Descrição", "Impacto", "Probabilidade", "Criticidade"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [139, 21, 56] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 9 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;

      // Nova página se necessário
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    }
  });

  addFooter(doc, 1, config);

  // Download
  doc.save(`PESTEL_${empresa.nome}_${new Date().toISOString().split("T")[0]}.pdf`);
}

export function exportSwotPDF(
  empresa: EmpresaInfo,
  items: Array<{
    tipo: string;
    descricao: string;
  }>,
  config?: TemplateConfig
) {
  const doc = new jsPDF();

  addHeader(doc, empresa, "Análise SWOT", config);

  let yPos = 50;

  // Matriz SWOT 2x2
  const forcas = items.filter((i) => i.tipo === "forca");
  const fraquezas = items.filter((i) => i.tipo === "fraqueza");
  const oportunidades = items.filter((i) => i.tipo === "oportunidade");
  const ameacas = items.filter((i) => i.tipo === "ameaca");

  const quadrantes = [
    { titulo: "Forças", items: forcas, cor: [76, 175, 80] as [number, number, number] },
    { titulo: "Fraquezas", items: fraquezas, cor: [244, 67, 54] as [number, number, number] },
    { titulo: "Oportunidades", items: oportunidades, cor: [33, 150, 243] as [number, number, number] },
    { titulo: "Ameaças", items: ameacas, cor: [255, 152, 0] as [number, number, number] },
  ];

  quadrantes.forEach((quadrante, index) => {
    // Título do quadrante
    doc.setFillColor(...quadrante.cor);
    doc.rect(14, yPos - 5, 182, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(quadrante.titulo, 16, yPos);
    yPos += 10;

    doc.setTextColor(DEFAULT_COLORS.text);
    doc.setFontSize(10);

    // Lista de itens
    if (quadrante.items.length > 0) {
      quadrante.items.forEach((item, i) => {
        doc.text(`${i + 1}. ${item.descricao}`, 16, yPos);
        yPos += 7;

        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
    } else {
      doc.setTextColor(128, 128, 128);
      doc.text("Nenhum item cadastrado", 16, yPos);
      yPos += 7;
      doc.setTextColor(DEFAULT_COLORS.text);
    }

    yPos += 5;
  });

  addFooter(doc, 1, config);

  doc.save(`SWOT_${empresa.nome}_${new Date().toISOString().split("T")[0]}.pdf`);
}

export function exportOkrPDF(
  empresa: EmpresaInfo,
  objectives: Array<{
    objetivo: string;
    descricao: string;
    resultadoChave1?: string;
    metaResultado1?: string;
    resultadoChave2?: string;
    metaResultado2?: string;
    resultadoChave3?: string;
    metaResultado3?: string;
  }>,
  config?: TemplateConfig
) {
  const doc = new jsPDF();

  addHeader(doc, empresa, "Objetivos e Key Results (OKR)", config);

  let yPos = 50;

  objectives.forEach((obj, index) => {
    // Objetivo
    doc.setFillColor(DEFAULT_COLORS.blue);
    doc.rect(14, yPos - 5, 182, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`Objetivo ${index + 1}: ${obj.objetivo}`, 16, yPos);
    yPos += 10;

    doc.setTextColor(DEFAULT_COLORS.text);
    doc.setFontSize(10);

    if (obj.descricao) {
      doc.text(`Descrição: ${obj.descricao}`, 16, yPos);
      yPos += 7;
    }

    // Key Results
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Key Results:", 16, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const keyResults = [
      { kr: obj.resultadoChave1, meta: obj.metaResultado1 },
      { kr: obj.resultadoChave2, meta: obj.metaResultado2 },
      { kr: obj.resultadoChave3, meta: obj.metaResultado3 },
    ];

    keyResults.forEach((kr, i) => {
      if (kr.kr) {
        doc.text(`  ${i + 1}. ${kr.kr}`, 18, yPos);
        yPos += 6;
        if (kr.meta) {
          doc.setTextColor(128, 128, 128);
          doc.text(`     Meta: ${kr.meta}`, 18, yPos);
          yPos += 6;
          doc.setTextColor(DEFAULT_COLORS.text);
        }
      }
    });

    yPos += 10;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
  });

  addFooter(doc, 1, config);

  doc.save(`OKR_${empresa.nome}_${new Date().toISOString().split("T")[0]}.pdf`);
}

export function exportBscPDF(
  empresa: EmpresaInfo,
  indicadores: Array<{
    nome: string;
    perspectiva: string;
    meta: number;
    realizado?: number;
    unidade: string;
  }>,
  config?: TemplateConfig
) {
  const doc = new jsPDF();

  addHeader(doc, empresa, "Balanced Scorecard (BSC)", config);

  let yPos = 50;

  const perspectivas = [
    { id: "financeira", nome: "Financeira", cor: [76, 175, 80] as [number, number, number] },
    { id: "clientes", nome: "Clientes", cor: [33, 150, 243] as [number, number, number] },
    { id: "processos", nome: "Processos Internos", cor: [255, 152, 0] as [number, number, number] },
    { id: "aprendizado", nome: "Aprendizado e Crescimento", cor: [156, 39, 176] as [number, number, number] },
  ];

  perspectivas.forEach((persp) => {
    const indsPerspectiva = indicadores.filter((i) => i.perspectiva === persp.id);

    if (indsPerspectiva.length > 0) {
      // Título da perspectiva
      doc.setFillColor(...persp.cor);
      doc.rect(14, yPos - 5, 182, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(persp.nome, 16, yPos);
      yPos += 10;

      doc.setTextColor(DEFAULT_COLORS.text);

      // Tabela de indicadores
      const tableData = indsPerspectiva.map((ind) => {
        const realizado = ind.realizado ?? 0;
        const percentual = ind.meta > 0 ? ((realizado / ind.meta) * 100).toFixed(1) : "0.0";
        return [
          ind.nome,
          `${ind.meta} ${ind.unidade}`,
          `${realizado} ${ind.unidade}`,
          `${percentual}%`,
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [["Indicador", "Meta", "Realizado", "Atingimento"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: persp.cor },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 9 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    }
  });

  addFooter(doc, 1, config);

  doc.save(`BSC_${empresa.nome}_${new Date().toISOString().split("T")[0]}.pdf`);
}
