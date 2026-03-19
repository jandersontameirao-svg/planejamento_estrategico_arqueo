/**
 * Serviço de Geração de PDF para Boletins de Medição
 * Adaptado do SGC para o app principal do Grupo Arqueo
 */
import PDFDocument from "pdfkit";
import { getDb } from "../db";
import {
  boletinsMedicao,
  boletinsMedicaoItens,
  contratos,
  contratosClientes,
  empresas,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "../storage";

interface BoletimPDFData {
  boletim: {
    code: string;
    periodStart: Date;
    periodEnd: Date;
    status: string;
    total: number;
    observations?: string | null;
  };
  contrato: {
    numero: string;
    objeto: string;
    valorTotal: number;
  };
  cliente: {
    razaoSocial: string;
    cnpj: string;
    email?: string | null;
  };
  empresa: {
    nomeFantasia: string;
    cnpj: string;
  };
  itens: Array<{
    descricao: string;
    quantidade: number;
    unidade: string;
    precoUnitario: number;
    total: number;
  }>;
}

/**
 * Busca dados do boletim para geração de PDF
 */
export async function fetchBoletimData(boletimId: number): Promise<BoletimPDFData | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const boletimResult = await db
    .select()
    .from(boletinsMedicao)
    .where(eq(boletinsMedicao.id, boletimId))
    .limit(1);

  if (!boletimResult.length) return null;
  const boletim = boletimResult[0];

  const contratoResult = await db
    .select()
    .from(contratos)
    .where(eq(contratos.id, boletim.contratoId))
    .limit(1);

  if (!contratoResult.length) return null;
  const contrato = contratoResult[0];

  const clienteResult = await db
    .select()
    .from(contratosClientes)
    .where(eq(contratosClientes.id, contrato.clienteId!))
    .limit(1);

  const cliente = clienteResult[0] || { razaoSocial: "N/A", cnpj: "N/A", email: null };

  const empresaResult = await db
    .select()
    .from(empresas)
    .where(eq(empresas.id, contrato.empresaId!))
    .limit(1);

  const empresa = empresaResult[0] || { nomeFantasia: "N/A", cnpj: "N/A" };

  const itensResult = await db
    .select()
    .from(boletinsMedicaoItens)
    .where(eq(boletinsMedicaoItens.boletimId, boletimId));

  return {
    boletim: {
      code: boletim.code,
      periodStart: boletim.periodStart,
      periodEnd: boletim.periodEnd,
      status: boletim.status,
      total: parseFloat(boletim.total),
      observations: boletim.observations,
    },
    contrato: {
      numero: contrato.numero || contrato.id.toString(),
      objeto: contrato.descricao || contrato.titulo || "Não especificado",
      valorTotal: parseFloat(contrato.valorTotal || "0"),
    },
    cliente: {
      razaoSocial: cliente.razaoSocial,
      cnpj: cliente.cnpj,
      email: cliente.email,
    },
    empresa: {
      nomeFantasia: empresa.nome || "N/A",
      cnpj: "N/A",
    },
    itens: itensResult.map((item) => ({
      descricao: item.descricao,
      quantidade: parseFloat(item.quantidade),
      unidade: item.unidade,
      precoUnitario: parseFloat(item.precoUnitario),
      total: parseFloat(item.total),
    })),
  };
}

/**
 * Formata valor em reais
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formata data em português
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

/**
 * Gera PDF do boletim de medição e salva no S3
 */
export async function generateBoletimPDF(boletimId: number): Promise<{ url: string; key: string }> {
  const data = await fetchBoletimData(boletimId);
  if (!data) throw new Error(`Boletim ${boletimId} não encontrado`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);
        const fileKey = `contratos/boletins/${data.boletim.code}-${Date.now()}.pdf`;
        const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");
        resolve({ url, key: fileKey });
      } catch (err) {
        reject(err);
      }
    });
    doc.on("error", reject);

    // ── Cabeçalho ──────────────────────────────────────────────────────────
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("BOLETIM DE MEDIÇÃO", { align: "center" });

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Código: ${data.boletim.code}`, { align: "center" });

    doc.moveDown(0.5);
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();
    doc.moveDown(0.5);

    // ── Dados do Contrato ──────────────────────────────────────────────────
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

    // ── Período de Medição ─────────────────────────────────────────────────
    doc.fontSize(11).font("Helvetica-Bold").text("PERÍODO DE MEDIÇÃO");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(
      `De ${formatDate(data.boletim.periodStart)} a ${formatDate(data.boletim.periodEnd)}`
    );

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // ── Itens de Medição ───────────────────────────────────────────────────
    if (data.itens.length > 0) {
      doc.fontSize(11).font("Helvetica-Bold").text("ITENS DE MEDIÇÃO");
      doc.moveDown(0.3);

      // Cabeçalho da tabela
      const colX = [50, 220, 280, 330, 400, 470];
      doc.fontSize(9).font("Helvetica-Bold");
      doc.text("Descrição", colX[0], doc.y, { width: 165, continued: false });
      const headerY = doc.y - 12;
      doc.text("Qtd", colX[1], headerY, { width: 55 });
      doc.text("Un", colX[2], headerY, { width: 45 });
      doc.text("P. Unit.", colX[3], headerY, { width: 65 });
      doc.text("Total", colX[4], headerY, { width: 70 });
      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.2);

      // Linhas da tabela
      doc.fontSize(9).font("Helvetica");
      for (const item of data.itens) {
        const rowY = doc.y;
        doc.text(item.descricao, colX[0], rowY, { width: 165 });
        doc.text(item.quantidade.toString(), colX[1], rowY, { width: 55 });
        doc.text(item.unidade, colX[2], rowY, { width: 45 });
        doc.text(formatCurrency(item.precoUnitario), colX[3], rowY, { width: 65 });
        doc.text(formatCurrency(item.total), colX[4], rowY, { width: 70 });
        doc.moveDown(0.5);
      }

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);
    }

    // ── Total ──────────────────────────────────────────────────────────────
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text(`TOTAL DO BOLETIM: ${formatCurrency(data.boletim.total)}`, { align: "right" });

    // ── Observações ────────────────────────────────────────────────────────
    if (data.boletim.observations) {
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.3);
      doc.fontSize(11).font("Helvetica-Bold").text("OBSERVAÇÕES");
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica").text(data.boletim.observations);
    }

    // ── Assinaturas ────────────────────────────────────────────────────────
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text("_______________________________", 50, doc.y);
    doc.text("_______________________________", 320, doc.y - 12);
    doc.moveDown(0.3);
    doc.text("Responsável pela Medição", 50);
    doc.text("Aprovador", 320, doc.y - 12);

    doc.end();
  });
}
