/**
 * Serviço de Aprovação de Boletins de Medição
 * Adaptado do SGC para o app principal do Grupo Arqueo
 * Fluxo: Gerar token → Enviar e-mail → Aprovar/Rejeitar → Notificar gestor
 */
import { randomBytes } from "crypto";
import { getDb } from "../db";
import {
  boletinsMedicao,
  boletinsAprovacaoTokens,
  boletinsAprovacaoHistorico,
  contratos,
  contratosClientes,
  empresas,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

/**
 * Gera um token de aprovação para o boletim e salva no banco
 */
export async function generateApprovalToken(
  boletimId: number,
  approverEmail: string,
  approverName: string,
  expiresInHours = 72
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  await db.insert(boletinsAprovacaoTokens).values({
    boletimId,
    token,
    aprovadorEmail: approverEmail,
    expiresAt,
    status: "PENDING",
  });

  return token;
}

/**
 * Valida e processa a aprovação/rejeição de um boletim via token
 */
export async function processApprovalByToken(
  token: string,
  action: "approved" | "rejected",
  observations?: string
): Promise<{ success: boolean; message: string; boletimId?: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar token
  const tokenResult = await db
    .select()
    .from(boletinsAprovacaoTokens)
    .where(eq(boletinsAprovacaoTokens.token, token))
    .limit(1);

  if (!tokenResult.length) {
    return { success: false, message: "Token inválido ou não encontrado." };
  }

  const tokenData = tokenResult[0];

  if (tokenData.status === "USED") {
    return { success: false, message: "Este token já foi utilizado." };
  }

  if (new Date() > tokenData.expiresAt) {
    return { success: false, message: "Token expirado. Solicite um novo link de aprovação." };
  }

  // Marcar token como usado
  await db
    .update(boletinsAprovacaoTokens)
    .set({ status: "USED", usedAt: new Date(), action: action === "approved" ? "APPROVED" : "REJECTED", observations })
    .where(eq(boletinsAprovacaoTokens.id, tokenData.id));

  // Atualizar status do boletim
  const newStatus = action === "approved" ? "APPROVED" : "REJECTED";
  await db
    .update(boletinsMedicao)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(boletinsMedicao.id, tokenData.boletimId));

  // Registrar no histórico
  const histCode = `HIST-${Date.now()}`;
  await db.insert(boletinsAprovacaoHistorico).values({
    code: histCode,
    boletimId: tokenData.boletimId,
    action: action === "approved" ? "approved" : "rejected",
    status: action === "approved" ? "approved" : "rejected",
    observations: observations || null,
  });

  // Notificar o dono do projeto
  const statusLabel = action === "approved" ? "APROVADO" : "REJEITADO";
  await notifyOwner({
    title: `Boletim de Medição ${statusLabel}`,
    content: `O boletim de medição foi ${statusLabel.toLowerCase()} por ${tokenData.aprovadorEmail}.${observations ? `\n\nObservações: ${observations}` : ""}`,
  });

  return {
    success: true,
    message: `Boletim ${statusLabel.toLowerCase()} com sucesso.`,
    boletimId: tokenData.boletimId,
  };
}

/**
 * Busca o histórico de aprovações de um boletim
 */
export async function getApprovalHistory(boletimId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(boletinsAprovacaoHistorico)
    .where(eq(boletinsAprovacaoHistorico.boletimId, boletimId))
    .orderBy(boletinsAprovacaoHistorico.createdAt);
}
