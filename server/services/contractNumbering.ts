/**
 * Contract Numbering Service
 * Gera business_number para contratos e aditivos
 * Adaptado do módulo ZIP v1.0.0 para o projeto Arqueo
 *
 * Formato contrato: AAAA-NNNNNN (ex: 2026-000128)
 * Formato aditivo:  AAAA-NNNNNN-ADNN (ex: 2026-000128-AD01)
 */
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { contracts, contractAmendments } from "../../drizzle/schema";
import { nextSequence } from "./sequences";

export async function generateContractBusinessNumber(
  contractId: number,
  signedDate: Date
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, contractId))
    .limit(1);

  if (!contract) throw new Error("Contrato não encontrado");
  if (contract.isSigned) {
    throw new Error(`Contrato já assinado. Número: ${contract.businessNumber}`);
  }

  const signedYear = signedDate.getFullYear();
  const sequenceKey = `CONTRACT:${signedYear}`;
  const seq = await nextSequence(sequenceKey);
  const seq6 = seq.toString().padStart(6, "0");
  const businessNumber = `${signedYear}-${seq6}`;

  await db
    .update(contracts)
    .set({
      businessNumber,
      signedDate: signedDate as unknown as Date,
      signedYear,
      signedSeq: seq,
      isSigned: 1,
    })
    .where(eq(contracts.id, contractId));

  return businessNumber;
}

export async function generateAmendmentBusinessNumber(
  contractId: number,
  amendmentId: number
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, contractId))
    .limit(1);

  if (!contract) throw new Error("Contrato não encontrado");
  if (!contract.businessNumber) {
    throw new Error("Contrato não possui número de negócio. Assine o contrato primeiro.");
  }

  const contractBusinessNumber = contract.businessNumber;
  const sequenceKey = `ADDENDUM:${contractBusinessNumber}`;
  const seq = await nextSequence(sequenceKey);
  const seq2 = seq.toString().padStart(2, "0");
  const businessNumber = `${contractBusinessNumber}-AD${seq2}`;

  await db
    .update(contractAmendments)
    .set({ businessNumber, seq })
    .where(eq(contractAmendments.id, amendmentId));

  return businessNumber;
}

export async function validateContractNotSigned(contractId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, contractId))
    .limit(1);

  if (!contract) throw new Error("Contrato não encontrado");
  if (contract.isSigned) {
    throw new Error(
      `Contrato assinado não pode ser modificado. Número: ${contract.businessNumber}`
    );
  }
}
