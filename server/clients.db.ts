/**
 * MÓDULO CLIENTES — Funções de Banco de Dados
 * Módulo isolado — não interfere com o SGC existente.
 * Opera sobre as tabelas `clients` e `company_clients`.
 */
import { eq, desc, and } from "drizzle-orm";
import { getDb } from "./db";
import { clients, companyClients, type InsertClient } from "../drizzle/schema";

// ─── Clients ─────────────────────────────────────────────────────────────────

export async function getAllClients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function getClientsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({ client: clients })
    .from(clients)
    .innerJoin(companyClients, eq(clients.id, companyClients.clientId))
    .where(eq(companyClients.companyId, companyId))
    .orderBy(desc(clients.createdAt));
  return rows.map((r) => r.client);
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(clients).where(eq(clients.id, id));
  return row ?? null;
}

export async function getClientByTaxId(taxId: string) {
  const db = await getDb();
  if (!db) return null;
  const clean = taxId.replace(/[^\d]/g, "");
  const [row] = await db.select().from(clients).where(eq(clients.taxId, clean));
  return row ?? null;
}

export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(clients).values(data);
  const insertId = (result as any).insertId as number;
  return { id: insertId };
}

export async function updateClient(id: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) return;
  await db.update(clients).set(data).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) return;
  // Remove vínculos com empresas primeiro
  await db.delete(companyClients).where(eq(companyClients.clientId, id));
  await db.delete(clients).where(eq(clients.id, id));
}

// ─── Company ↔ Client Links ───────────────────────────────────────────────────

export async function linkClientToCompany(clientId: number, companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [existing] = await db
    .select()
    .from(companyClients)
    .where(and(eq(companyClients.clientId, clientId), eq(companyClients.companyId, companyId)));
  if (existing) return existing;
  const [result] = await db.insert(companyClients).values({ clientId, companyId });
  return { id: (result as any).insertId as number, clientId, companyId };
}

export async function unlinkClientFromCompany(clientId: number, companyId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(companyClients)
    .where(and(eq(companyClients.clientId, clientId), eq(companyClients.companyId, companyId)));
}

export async function getCompaniesLinkedToClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companyClients).where(eq(companyClients.clientId, clientId));
}

// ─── Code Generator ──────────────────────────────────────────────────────────

export function generateClientCode(taxId: string): string {
  const clean = taxId.replace(/[^\d]/g, "");
  const suffix = clean.slice(-4);
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `CLI-${suffix}-${timestamp}`;
}
