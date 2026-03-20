/**
 * Sequences Service - Controle transacional de sequências para geração de códigos únicos
 * Adaptado do módulo ZIP v1.0.0 para o projeto Arqueo
 */
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { sequences } from "../../drizzle/schema";

/**
 * Obter próximo valor da sequência com lock transacional
 * @param key - Chave da sequência (ex: "CONTRACT:2026", "ADDENDUM:2026-000128")
 * @returns Próximo valor da sequência (1, 2, 3...)
 */
export async function nextSequence(key: string): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(sequences)
      .where(eq(sequences.key, key))
      .for("update");

    let currentValue = 0;
    if (rows.length === 0) {
      await tx.insert(sequences).values({ key, currentValue: 1 });
      currentValue = 1;
    } else {
      const newValue = rows[0].currentValue + 1;
      await tx
        .update(sequences)
        .set({ currentValue: newValue })
        .where(eq(sequences.key, key));
      currentValue = newValue;
    }
    return currentValue;
  });
}

export async function resetSequence(key: string, value = 0): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(sequences).where(eq(sequences.key, key));
  if (existing.length === 0) {
    await db.insert(sequences).values({ key, currentValue: value });
  } else {
    await db.update(sequences).set({ currentValue: value }).where(eq(sequences.key, key));
  }
}

export async function getCurrentSequence(key: string): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(sequences).where(eq(sequences.key, key));
  return rows.length > 0 ? rows[0].currentValue : 0;
}
