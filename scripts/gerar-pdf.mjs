import PDFDocument from "pdfkit";
import fs from "fs";

const ORANGE = "#e8731c", AMBER = "#f5a623", BLUE = "#2b7cb3", MAROON = "#9b1c1c", GOLD = "#c9a24b";

const doc = new PDFDocument({ size: "A4", margin: 50 });
doc.pipe(fs.createWriteStream("Grupo_Arqueo_Como_Funciona.pdf"));

const W = doc.page.width, M = 50, CW = W - M * 2;

// faixa tri-cor no topo
const sw = W / 3;
doc.rect(0, 0, sw, 9).fill(AMBER);
doc.rect(sw, 0, sw, 9).fill(ORANGE);
doc.rect(sw * 2, 0, sw, 9).fill(MAROON);

// logo "A" vetorial da marca
function drawA(x, y, s) {
  doc.lineCap("round").lineWidth(0.18 * s);
  doc.moveTo(x + 0.15 * s, y + s).lineTo(x + 0.5 * s, y).stroke(AMBER);
  doc.moveTo(x + 0.5 * s, y).lineTo(x + 0.85 * s, y + s).stroke(ORANGE);
  doc.circle(x + 0.5 * s, y + 0.72 * s, 0.12 * s).fill(BLUE);
}
drawA(M, 38, 58);

doc.fillColor(MAROON).font("Helvetica-Bold").fontSize(20).text("GRUPO ARQUEO", M + 78, 46);
doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(14).text("10 anos", M + 78, 70);

doc.fillColor("#222").font("Helvetica-Bold").fontSize(22).text("Planejamento Estratégico", M, 128);
doc.fillColor("#555").font("Helvetica").fontSize(11).text("Como funciona o sistema e para que serve", M, 157);
doc.moveTo(M, 180).lineTo(W - M, 180).lineWidth(2).stroke(GOLD);

let y = 200;
function section(title, body) {
  doc.fillColor(ORANGE).font("Helvetica-Bold").fontSize(13).text(title, M, y);
  y = doc.y + 2;
  doc.fillColor("#333").font("Helvetica").fontSize(10.5).text(body, M, y, { width: CW });
  y = doc.y + 14;
}
function bullets(title, items) {
  doc.fillColor(ORANGE).font("Helvetica-Bold").fontSize(13).text(title, M, y);
  y = doc.y + 6;
  for (const it of items) {
    doc.circle(M + 4, y + 5, 2).fill(MAROON);
    doc.fillColor("#333").font("Helvetica").fontSize(10.5).text(it, M + 14, y, { width: CW - 14 });
    y = doc.y + 6;
  }
  y += 10;
}

section("O que é", "Plataforma interna de gestão estratégica do Grupo Arqueo e de suas empresas.");
section("Para que serve", "Reúne num só lugar o planejamento, as finanças, os riscos e as análises de cada empresa do grupo — com apoio de inteligência artificial.");
bullets("Principais módulos", [
  "Empresas e Áreas de Negócio — cadastro e visão consolidada do grupo.",
  "Identidade Organizacional — missão, visão, valores e política.",
  "KPIs e BSC — metas, indicadores e painéis de desempenho.",
  "Análises Estratégicas — PESTEL, SWOT, 5 Forças, OKR, VRIO e Stakeholders.",
  "Financeiro — DRE, Orçamento, Balanço Patrimonial e Capital de Giro.",
  "Gestão de Riscos — matriz de riscos e planos de mitigação.",
  "Contratos e Organograma — acompanhamento de cláusulas e estrutura da equipe.",
]);
section("Inteligência Artificial", "Lê PDFs e planilhas, extrai dados financeiros e gera análises estratégicas automaticamente.");
section("Acesso", "Login próprio e seguro (HTTPS), disponível em arqueotech.com.br.");

doc.fillColor("#999").font("Helvetica").fontSize(8)
  .text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}  ·  arqueotech.com.br`, M, 790, { width: CW, align: "center" });

doc.end();
console.log("PDF gerado: Grupo_Arqueo_Como_Funciona.pdf");
