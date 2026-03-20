/**
 * boletins.db.ts — DB helpers para Boletins de Medição
 * Usa a tabela contratos_boletins
 * Padrão: await getDb() com null-check em cada função
 */
import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  contratosBoletins,
  contratosMarcos,
  InsertContratosBoletim,
  ContratosBoletim,
} from "../drizzle/schema";
import crypto from "crypto";

// ─── Helpers de numeração ─────────────────────────────────────────────────────

export async function getNextBoletimSeq(contratoId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 1;
  const rows = await db
    .select()
    .from(contratosBoletins)
    .where(eq(contratosBoletins.contratoId, contratoId));
  return rows.length + 1;
}

export function buildBoletimNumber(contratoId: number, seq: number): string {
  return `BM-${contratoId}-${String(seq).padStart(3, "0")}`;
}

// ─── CRUD de Boletins ─────────────────────────────────────────────────────────

export async function getBoletinsByContrato(contratoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(contratosBoletins)
    .where(eq(contratosBoletins.contratoId, contratoId))
    .orderBy(desc(contratosBoletins.createdAt));
}

export async function getBoletimById(id: number): Promise<ContratosBoletim | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(contratosBoletins)
    .where(eq(contratosBoletins.id, id));
  return rows[0] ?? null;
}

export async function getBoletimByMarcoId(marcoId: number): Promise<ContratosBoletim | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(contratosBoletins)
    .where(eq(contratosBoletins.marcoId, marcoId));
  return rows[0] ?? null;
}

export async function getBoletimByToken(token: string): Promise<ContratosBoletim | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(contratosBoletins)
    .where(eq(contratosBoletins.aprovadorToken, token));
  return rows[0] ?? null;
}

export async function createBoletim(data: InsertContratosBoletim) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(contratosBoletins).values(data);
  return result;
}

export async function updateBoletim(id: number, data: Partial<InsertContratosBoletim>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(contratosBoletins).set(data).where(eq(contratosBoletins.id, id));
  return getBoletimById(id);
}

/**
 * Cria automaticamente um boletim de medição a partir de um marco financeiro.
 * Regra: 1 marco → 1 boletim. Se já existir, retorna o existente.
 */
export async function createBoletimFromMarco(
  marcoId: number,
  contratoId: number,
  userId: number,
  aprovadorNome?: string,
  aprovadorEmail?: string
): Promise<ContratosBoletim | null> {
  const db = await getDb();
  if (!db) return null;

  // Verificar se já existe boletim para este marco
  const existing = await getBoletimByMarcoId(marcoId);
  if (existing) return existing;

  // Buscar dados do marco
  const marcos = await db
    .select()
    .from(contratosMarcos)
    .where(eq(contratosMarcos.id, marcoId));
  const marco = marcos[0];
  if (!marco) return null;

  // Gerar token único para aprovação externa
  const token = crypto.randomBytes(32).toString("hex");

  // Gerar número do boletim
  const seq = await getNextBoletimSeq(contratoId);
  const numero = buildBoletimNumber(contratoId, seq);

  const [result] = await db.insert(contratosBoletins).values({
    contratoId,
    marcoId,
    numero,
    titulo: `Boletim de Medição — ${marco.titulo}`,
    descricao: marco.descricao || undefined,
    valorMedicao: marco.valorPrevisto,
    percentualMedicao: null,
    periodo: null,
    status: "rascunho",
    aprovadorNome: aprovadorNome || null,
    aprovadorEmail: aprovadorEmail || null,
    aprovadorToken: token,
    createdByUserId: userId,
  });

  return getBoletimById((result as any).insertId);
}

/**
 * Envia o boletim para aprovação (muda status para "em_aprovacao").
 */
export async function enviarBoletimParaAprovacao(id: number): Promise<ContratosBoletim | null> {
  const db = await getDb();
  if (!db) return null;
  await db.update(contratosBoletins).set({
    status: "em_aprovacao",
    dataEnvio: new Date(),
  }).where(eq(contratosBoletins.id, id));
  return getBoletimById(id);
}

/**
 * Aprova um boletim via token externo (link enviado por e-mail ao aprovador).
 */
export async function aprovarBoletimViaToken(
  token: string,
  observacoes?: string
): Promise<ContratosBoletim | null> {
  const db = await getDb();
  if (!db) return null;

  const boletim = await getBoletimByToken(token);
  if (!boletim) return null;
  if (boletim.status !== "em_aprovacao") return null;

  await db.update(contratosBoletins).set({
    status: "aprovado",
    dataAprovacao: new Date(),
    observacoesAprovador: observacoes || null,
  }).where(eq(contratosBoletins.id, boletim.id));

  // Atualizar o marco para "aprovado"
  if (boletim.marcoId) {
    await db.update(contratosMarcos).set({ status: "aprovado" }).where(eq(contratosMarcos.id, boletim.marcoId));
  }

  return getBoletimById(boletim.id);
}

/**
 * Rejeita um boletim via token externo.
 */
export async function rejeitarBoletimViaToken(
  token: string,
  observacoes: string
): Promise<ContratosBoletim | null> {
  const db = await getDb();
  if (!db) return null;

  const boletim = await getBoletimByToken(token);
  if (!boletim) return null;
  if (boletim.status !== "em_aprovacao") return null;

  await db.update(contratosBoletins).set({
    status: "rejeitado",
    observacoesAprovador: observacoes,
  }).where(eq(contratosBoletins.id, boletim.id));

  return getBoletimById(boletim.id);
}

/**
 * Marca boletim como pago e atualiza o marco correspondente.
 */
export async function marcarBoletimComoPago(
  id: number,
  valorPago?: string
): Promise<ContratosBoletim | null> {
  const db = await getDb();
  if (!db) return null;

  const boletim = await getBoletimById(id);
  if (!boletim) return null;

  await db.update(contratosBoletins).set({ status: "pago" }).where(eq(contratosBoletins.id, id));

  // Atualizar o marco com valor pago e status
  if (boletim.marcoId) {
    await db.update(contratosMarcos).set({
      status: "pago",
      valorPago: valorPago || boletim.valorMedicao,
      dataPagamento: new Date() as unknown as Date,
    }).where(eq(contratosMarcos.id, boletim.marcoId));
  }

  return getBoletimById(id);
}

/**
 * Salva URL do PDF gerado para o boletim.
 */
export async function salvarPdfBoletim(
  id: number,
  pdfUrl: string,
  pdfKey: string
): Promise<ContratosBoletim | null> {
  const db = await getDb();
  if (!db) return null;
  await db.update(contratosBoletins).set({ pdfUrl, pdfKey }).where(eq(contratosBoletins.id, id));
  return getBoletimById(id);
}
