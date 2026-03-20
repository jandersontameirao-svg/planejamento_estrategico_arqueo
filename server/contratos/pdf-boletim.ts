/**
 * Serviço de Geração de PDF para Boletins de Medição
 * Usa a tabela contratos_boletins (SGC consolidado)
 * Inclui logo da empresa no cabeçalho quando disponível
 */
import PDFDocument from "pdfkit";
import { getDb } from "../db";
import {
  contratosBoletins,
  contratos,
  contratosClientes,
  contratosMarcos,
  empresas,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "../storage";
import https from "https";
import http from "http";

interface BoletimPDFData {
  boletim: {
    numero: string;
    titulo: string | null;
    descricao: string | null;
    valorMedicao: number;
    periodo: string | null;
    status: string;
    observacoesAprovador: string | null;
    aprovadorNome: string | null;
    dataAprovacao: Date | null;
  };
  contrato: { numero: string; objeto: string; valorTotal: number };
  cliente: { razaoSocial: string; cnpj: string; email?: string | null };
  empresa: { nomeFantasia: string; cnpj: string; logoUrl?: string | null };
  marco: { descricao: string; valor: number; dataVencimento: Date | null };
}

async function fetchBoletimData(boletimId: number): Promise<BoletimPDFData | null> {
  const db = await getDb();
  if (!db) return null;

  const [boletim] = await db.select().from(contratosBoletins).where(eq(contratosBoletins.id, boletimId));
  if (!boletim) return null;

  const [contrato] = await db.select().from(contratos).where(eq(contratos.id, boletim.contratoId));
  if (!contrato) return null;

  const [marco] = await db.select().from(contratosMarcos).where(eq(contratosMarcos.id, boletim.marcoId));

  const clienteRows = contrato.clienteId
    ? await db.select().from(contratosClientes).where(eq(contratosClientes.id, contrato.clienteId))
    : [];
  const cliente = clienteRows[0] ?? null;

  const [empresa] = await db.select().from(empresas).where(eq(empresas.id, contrato.empresaId));

  return {
    boletim: {
      numero: boletim.numero,
      titulo: boletim.titulo,
      descricao: boletim.descricao,
      valorMedicao: Number(boletim.valorMedicao),
      periodo: boletim.periodo,
      status: boletim.status,
      observacoesAprovador: boletim.observacoesAprovador,
      aprovadorNome: boletim.aprovadorNome,
      dataAprovacao: boletim.dataAprovacao,
    },
    contrato: {
      numero: contrato.numero ?? "",
      objeto: contrato.descricao ?? contrato.titulo ?? "",
      valorTotal: Number(contrato.valorTotal ?? 0),
    },
    cliente: {
      razaoSocial: cliente?.razaoSocial ?? "Não informado",
      cnpj: cliente?.cnpj ?? "",
      email: cliente?.email,
    },
    empresa: {
      nomeFantasia: empresa?.nome ?? "Não informado",
      cnpj: "",
      logoUrl: (empresa as any)?.logoUrl ?? null,
    },
    marco: {
      descricao: marco?.titulo ?? marco?.descricao ?? "",
      valor: Number(marco?.valorPrevisto ?? 0),
      dataVencimento: marco?.dataPrevista ?? null,
    },
  };
}

async function downloadLogoBuffer(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode !== 200) { resolve(null); return; }
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", () => resolve(null));
    });
    req.on("error", () => resolve(null));
    req.setTimeout(5000, () => { req.destroy(); resolve(null); });
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export async function generateBoletimPDF(boletimId: number): Promise<{ url: string; key: string }> {
  const data = await fetchBoletimData(boletimId);
  if (!data) throw new Error(`Boletim ${boletimId} não encontrado`);

  // Baixar logo antes de criar o PDF (fora da Promise do PDFDocument)
  let logoBuffer: Buffer | null = null;
  if (data.empresa.logoUrl) {
    logoBuffer = await downloadLogoBuffer(data.empresa.logoUrl);
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);
        const fileKey = `contratos/boletins/${data.boletim.numero}-${Date.now()}.pdf`;
        const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");
        resolve({ url, key: fileKey });
      } catch (err) { reject(err); }
    });
    doc.on("error", reject);

    // ── Cabeçalho com logo ──────────────────────────────────────────────────
    const headerY = doc.y;
    if (logoBuffer) {
      try {
        doc.image(logoBuffer, 50, headerY, { height: 50, fit: [130, 50] });
        doc.fontSize(18).font("Helvetica-Bold")
          .text("BOLETIM DE MEDIÇÃO", 190, headerY + 6, { align: "right", width: 355 });
        doc.fontSize(12).font("Helvetica")
          .text(`Nº: ${data.boletim.numero}`, 190, headerY + 30, { align: "right", width: 355 });
        doc.y = headerY + 60;
      } catch {
        // fallback sem logo
        doc.fontSize(18).font("Helvetica-Bold").text("BOLETIM DE MEDIÇÃO", { align: "center" });
        doc.fontSize(12).font("Helvetica").text(`Nº: ${data.boletim.numero}`, { align: "center" });
      }
    } else {
      doc.fontSize(18).font("Helvetica-Bold").text("BOLETIM DE MEDIÇÃO", { align: "center" });
      doc.fontSize(12).font("Helvetica").text(`Nº: ${data.boletim.numero}`, { align: "center" });
    }

    if (data.boletim.titulo) doc.fontSize(11).font("Helvetica").text(data.boletim.titulo, { align: "center" });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // ── Dados do Contrato ───────────────────────────────────────────────────
    doc.fontSize(11).font("Helvetica-Bold").text("DADOS DO CONTRATO");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Empresa: ${data.empresa.nomeFantasia}  |  CNPJ: ${data.empresa.cnpj}`);
    doc.text(`Cliente: ${data.cliente.razaoSocial}  |  CNPJ: ${data.cliente.cnpj}`);
    doc.text(`Contrato Nº: ${data.contrato.numero}`);
    doc.text(`Objeto: ${data.contrato.objeto}`);
    doc.text(`Valor Total do Contrato: ${formatCurrency(data.contrato.valorTotal)}`);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // ── Marco Financeiro ────────────────────────────────────────────────────
    doc.fontSize(11).font("Helvetica-Bold").text("MARCO FINANCEIRO");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Descrição: ${data.marco.descricao}`);
    doc.text(`Valor do Marco: ${formatCurrency(data.marco.valor)}`);
    if (data.marco.dataVencimento) doc.text(`Vencimento: ${formatDate(data.marco.dataVencimento)}`);
    if (data.boletim.periodo) doc.text(`Período: ${data.boletim.periodo}`);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fontSize(12).font("Helvetica-Bold");
    doc.text(`VALOR DA MEDIÇÃO: ${formatCurrency(data.boletim.valorMedicao)}`, { align: "right" });
    doc.moveDown(0.5);

    if (data.boletim.descricao) {
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);
      doc.fontSize(11).font("Helvetica-Bold").text("DESCRIÇÃO");
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica").text(data.boletim.descricao);
      doc.moveDown(0.5);
    }

    // ── Resultado da Aprovação ──────────────────────────────────────────────
    if (data.boletim.status === "aprovado" || data.boletim.status === "rejeitado") {
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);
      doc.fontSize(11).font("Helvetica-Bold").text("RESULTADO DA APROVAÇÃO");
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica");
      doc.text(`Decisão: ${data.boletim.status === "aprovado" ? "✓ APROVADO" : "✗ REJEITADO"}`);
      if (data.boletim.aprovadorNome) doc.text(`Aprovador: ${data.boletim.aprovadorNome}`);
      if (data.boletim.dataAprovacao) doc.text(`Data: ${formatDate(data.boletim.dataAprovacao)}`);
      if (data.boletim.observacoesAprovador) doc.text(`Obs: ${data.boletim.observacoesAprovador}`);
      doc.moveDown(0.5);
    }

    // ── Assinaturas ─────────────────────────────────────────────────────────
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text("_______________________________", 50, doc.y);
    doc.text("_______________________________", 320, doc.y - 12);
    doc.moveDown(0.3);
    doc.text("Responsável pela Medição", 50);
    doc.text("Aprovador", 320, doc.y - 12);
    doc.moveDown(2);
    doc.fontSize(8).font("Helvetica").fillColor("gray")
      .text(`Gerado em ${new Date().toLocaleString("pt-BR")} — Grupo Arqueo`, { align: "center" });
    doc.end();
  });
}
