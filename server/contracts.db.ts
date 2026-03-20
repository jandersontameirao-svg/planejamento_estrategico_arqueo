/**
 * contracts.db.ts
 * Helpers de banco de dados para o módulo de Gestão de Contratos (ZIP v1.0.0)
 * Isolado do SGC existente — usa tabelas: contracts, financial_milestones,
 * contract_amendments, contract_risks, contract_documents, contract_approvers,
 * contract_responsible, audit_logs
 */
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  contracts,
  financialMilestones,
  contractAmendments,
  contractRisks,
  contractDocuments,
  contractApprovers,
  contractResponsible,
  auditLogs,
  clients,
  companyClients,
  empresas,
  type InsertContract,
  type InsertFinancialMilestone,
  type InsertContractAmendment,
  type InsertContractRisk,
  type InsertContractDocument,
  type InsertContractApprover,
  type InsertContractResponsible,
  type InsertAuditLog,
} from "../drizzle/schema";

// ─── Companies helper ─────────────────────────────────────────────────────────
export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(empresas).where(eq(empresas.id, id));
  return row ?? null;
}

// ─── Clients helpers ──────────────────────────────────────────────────────────
export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(clients).where(eq(clients.id, id));
  return row ?? null;
}

export async function isClientLinkedToCompany(clientId: number, companyId: number) {
  const db = await getDb();
  if (!db) return false;
  const [row] = await db
    .select()
    .from(companyClients)
    .where(and(eq(companyClients.clientId, clientId), eq(companyClients.companyId, companyId)));
  return !!row;
}

// ─── Contracts ────────────────────────────────────────────────────────────────
export async function getAllContracts(companyId?: number) {
  const db = await getDb();
  if (!db) return [];
  const baseQuery = db
    .select({
      id: contracts.id,
      code: contracts.code,
      businessNumber: contracts.businessNumber,
      title: contracts.title,
      description: contracts.description,
      totalValue: contracts.totalValue,
      startDate: contracts.startDate,
      endDate: contracts.endDate,
      status: contracts.status,
      companyId: contracts.companyId,
      clientId: contracts.clientId,
      isSigned: contracts.isSigned,
      signedDate: contracts.signedDate,
      managerName: contracts.managerName,
      managerEmail: contracts.managerEmail,
      pdfUrl: contracts.pdfUrl,
      createdAt: contracts.createdAt,
      updatedAt: contracts.updatedAt,
      clientName: clients.name,
      clientTaxId: clients.taxId,
      clientFantasyName: clients.fantasyName,
    })
    .from(contracts)
    .leftJoin(clients, eq(contracts.clientId, clients.id))
    .orderBy(desc(contracts.createdAt));

  if (companyId !== undefined) {
    return baseQuery.where(eq(contracts.companyId, companyId));
  }
  return baseQuery;
}

export async function getContractById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select({
      id: contracts.id,
      code: contracts.code,
      businessNumber: contracts.businessNumber,
      title: contracts.title,
      description: contracts.description,
      totalValue: contracts.totalValue,
      startDate: contracts.startDate,
      endDate: contracts.endDate,
      status: contracts.status,
      companyId: contracts.companyId,
      clientId: contracts.clientId,
      isSigned: contracts.isSigned,
      signedDate: contracts.signedDate,
      signedYear: contracts.signedYear,
      signedSeq: contracts.signedSeq,
      contractSeq: contracts.contractSeq,
      managerUserId: contracts.managerUserId,
      managerName: contracts.managerName,
      managerEmail: contracts.managerEmail,
      approverName: contracts.approverName,
      approverEmail: contracts.approverEmail,
      pdfUrl: contracts.pdfUrl,
      pdfFileKey: contracts.pdfFileKey,
      observations: contracts.observations,
      createdAt: contracts.createdAt,
      updatedAt: contracts.updatedAt,
      clientName: clients.name,
      clientTaxId: clients.taxId,
      clientFantasyName: clients.fantasyName,
      clientEmail: clients.email,
      clientTelefone: clients.telefone,
      clientMunicipio: clients.municipio,
      clientUf: clients.uf,
    })
    .from(contracts)
    .leftJoin(clients, eq(contracts.clientId, clients.id))
    .where(eq(contracts.id, id));
  return row ?? null;
}

export async function createContract(data: InsertContract) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(contracts).values(data);
  const id = (result as { insertId: number }).insertId;
  return getContractById(id);
}

export async function updateContract(id: number, data: Partial<InsertContract>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contracts).set(data).where(eq(contracts.id, id));
  return getContractById(id);
}

export async function deleteContract(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contracts).where(eq(contracts.id, id));
  return { success: true };
}

export async function signContractInDb(
  contractId: number,
  businessNumber: string,
  signedDate: Date,
  signedYear: number,
  signedSeq: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(contracts)
    .set({
      businessNumber,
      signedDate: signedDate as unknown as Date,
      signedYear,
      signedSeq,
      isSigned: 1,
    })
    .where(eq(contracts.id, contractId));
  return getContractById(contractId);
}

export async function getContractsByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(contracts)
    .where(eq(contracts.clientId, clientId))
    .orderBy(desc(contracts.createdAt));
}

// ─── Financial Milestones ─────────────────────────────────────────────────────
export async function getMilestonesByContract(contractId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(financialMilestones)
    .where(eq(financialMilestones.contractId, contractId))
    .orderBy(asc(financialMilestones.dueDate));
}

export async function getMilestoneById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(financialMilestones)
    .where(eq(financialMilestones.id, id));
  return row ?? null;
}

export async function createMilestone(data: InsertFinancialMilestone) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(financialMilestones).values(data);
  const id = (result as { insertId: number }).insertId;
  return getMilestoneById(id);
}

export async function updateMilestone(id: number, data: Partial<InsertFinancialMilestone>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(financialMilestones).set(data).where(eq(financialMilestones.id, id));
  return getMilestoneById(id);
}

export async function deleteMilestone(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(financialMilestones).where(eq(financialMilestones.id, id));
  return { success: true };
}

export async function getOverdueMilestones(companyId?: number) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const baseQuery = db
    .select({
      id: financialMilestones.id,
      contractId: financialMilestones.contractId,
      description: financialMilestones.description,
      valorPrevisto: financialMilestones.valorPrevisto,
      valorPago: financialMilestones.valorPago,
      dueDate: financialMilestones.dueDate,
      status: financialMilestones.status,
      contractTitle: contracts.title,
      contractBusinessNumber: contracts.businessNumber,
      clientName: clients.name,
    })
    .from(financialMilestones)
    .innerJoin(contracts, eq(financialMilestones.contractId, contracts.id))
    .leftJoin(clients, eq(contracts.clientId, clients.id))
    .orderBy(asc(financialMilestones.dueDate));

  if (companyId !== undefined) {
    return baseQuery.where(
      and(
        eq(contracts.companyId, companyId),
        eq(financialMilestones.status, "pending"),
        sql`${financialMilestones.dueDate} < ${now}`
      )
    );
  }
  return baseQuery.where(
    and(
      eq(financialMilestones.status, "pending"),
      sql`${financialMilestones.dueDate} < ${now}`
    )
  );
}

// ─── Contract Amendments ──────────────────────────────────────────────────────
export async function getAmendmentsByContract(contractId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(contractAmendments)
    .where(eq(contractAmendments.contractId, contractId))
    .orderBy(asc(contractAmendments.seq));
}

export async function getAmendmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(contractAmendments)
    .where(eq(contractAmendments.id, id));
  return row ?? null;
}

export async function getNextAmendmentSeq(contractId: number): Promise<number> {
  const amendments = await getAmendmentsByContract(contractId);
  return amendments.length + 1;
}

export async function createAmendment(data: InsertContractAmendment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(contractAmendments).values(data);
  const id = (result as { insertId: number }).insertId;
  return getAmendmentById(id);
}

export async function updateAmendment(id: number, data: Partial<InsertContractAmendment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contractAmendments).set(data).where(eq(contractAmendments.id, id));
  return getAmendmentById(id);
}

export async function deleteAmendment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contractAmendments).where(eq(contractAmendments.id, id));
  return { success: true };
}

// ─── Contract Risks ───────────────────────────────────────────────────────────
export async function getRisksByContract(contractId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(contractRisks)
    .where(eq(contractRisks.contractId, contractId))
    .orderBy(desc(contractRisks.createdAt));
}

export async function getContractRiskById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(contractRisks)
    .where(eq(contractRisks.id, id));
  return row ?? null;
}

export async function createContractRisk(data: InsertContractRisk) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(contractRisks).values(data);
  const id = (result as { insertId: number }).insertId;
  return getContractRiskById(id);
}

export async function updateContractRisk(id: number, data: Partial<InsertContractRisk>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contractRisks).set(data).where(eq(contractRisks.id, id));
  return getContractRiskById(id);
}

export async function deleteContractRisk(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contractRisks).where(eq(contractRisks.id, id));
  return { success: true };
}

// ─── Contract Documents ───────────────────────────────────────────────────────
export async function listContractDocuments(contractId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(contractDocuments)
    .where(eq(contractDocuments.contractId, contractId))
    .orderBy(desc(contractDocuments.createdAt));
}

export async function getContractDocumentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(contractDocuments)
    .where(eq(contractDocuments.id, id));
  return row ?? null;
}

export async function addContractDocument(data: InsertContractDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(contractDocuments).values(data);
  const id = (result as { insertId: number }).insertId;
  return getContractDocumentById(id);
}

export async function deleteContractDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contractDocuments).where(eq(contractDocuments.id, id));
  return { success: true };
}

// ─── Contract Approvers ───────────────────────────────────────────────────────
export async function getContractApprovers(contractId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(contractApprovers)
    .where(eq(contractApprovers.contractId, contractId))
    .orderBy(asc(contractApprovers.order));
}

export async function getContractApproverById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(contractApprovers)
    .where(eq(contractApprovers.id, id));
  return row ?? null;
}

export async function createContractApprover(data: {
  contractId: number;
  clientContactName: string;
  clientContactEmail: string;
  clientContactPhone?: string;
  role?: string;
}) {
  const existing = await getContractApprovers(data.contractId);
  const nextOrder = existing.length + 1;
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(contractApprovers).values({
    contractId: data.contractId,
    name: data.clientContactName,
    email: data.clientContactEmail,
    role: data.role,
    order: nextOrder,
    status: "pending",
  });
  const id = (result as { insertId: number }).insertId;
  return getContractApproverById(id);
}

export async function updateContractApprover(
  id: number,
  data: {
    clientContactName?: string;
    clientContactEmail?: string;
    clientContactPhone?: string;
    role?: string;
    isActive?: boolean;
  }
) {
  const updateData: Partial<InsertContractApprover> = {};
  if (data.clientContactName !== undefined) updateData.name = data.clientContactName;
  if (data.clientContactEmail !== undefined) updateData.email = data.clientContactEmail;
  if (data.role !== undefined) updateData.role = data.role;
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contractApprovers).set(updateData).where(eq(contractApprovers.id, id));
  return getContractApproverById(id);
}

export async function deleteContractApprover(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contractApprovers).where(eq(contractApprovers.id, id));
  return { success: true };
}

// ─── Contract Responsible ─────────────────────────────────────────────────────
export async function getContractResponsibles(contractId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(contractResponsible)
    .where(eq(contractResponsible.contractId, contractId))
    .orderBy(asc(contractResponsible.createdAt));
}

export async function getContractResponsibleById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(contractResponsible)
    .where(eq(contractResponsible.id, id));
  return row ?? null;
}

export async function createContractResponsible(data: {
  contractId: number;
  responsibleName: string;
  responsibleEmail: string;
  financialEmail: string;
  role?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(contractResponsible).values({
    contractId: data.contractId,
    name: data.responsibleName,
    email: data.responsibleEmail,
    role: data.role,
    type: "executor",
  });
  const id = (result as { insertId: number }).insertId;
  return getContractResponsibleById(id);
}

export async function updateContractResponsible(
  id: number,
  data: {
    responsibleName?: string;
    responsibleEmail?: string;
    financialEmail?: string;
    role?: string;
    isActive?: boolean;
  }
) {
  const updateData: Partial<InsertContractResponsible> = {};
  if (data.responsibleName !== undefined) updateData.name = data.responsibleName;
  if (data.responsibleEmail !== undefined) updateData.email = data.responsibleEmail;
  if (data.role !== undefined) updateData.role = data.role;
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contractResponsible).set(updateData).where(eq(contractResponsible.id, id));
  return getContractResponsibleById(id);
}

export async function deleteContractResponsible(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contractResponsible).where(eq(contractResponsible.id, id));
  return { success: true };
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export async function createAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(auditLogs).values(data);
  const id = (result as { insertId: number }).insertId;
  const [row] = await db.select().from(auditLogs).where(eq(auditLogs.id, id));
  return row;
}

export async function getAuditLogsByEntity(entityType: string, entityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(auditLogs)
    .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
    .orderBy(desc(auditLogs.createdAt));
}

export async function getAuditLogsByContract(contractId: number) {
  return getAuditLogsByEntity("contract", contractId);
}

// ─── Dashboard / Stats ────────────────────────────────────────────────────────
export async function getContractStats(companyId?: number) {
  const allContracts = await getAllContracts(companyId);
  const total = allContracts.length;
  const active = allContracts.filter((c) => c.status === "active").length;
  const completed = allContracts.filter((c) => c.status === "completed").length;
  const cancelled = allContracts.filter((c) => c.status === "cancelled").length;
  const totalValue = allContracts.reduce(
    (sum: number, c: { totalValue: string | number | null }) =>
      sum + parseFloat(String(c.totalValue ?? "0")),
    0
  );

  return { total, active, completed, cancelled, totalValue };
}
