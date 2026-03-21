/**
 * MÓDULO CONTRATOS — Funções de Banco de Dados
 * Camada de integração SGC → App Principal
 *
 * PRINCÍPIO: O app principal é fonte mestra de users e companies.
 * Este módulo opera sobre o mesmo banco, isolado por prefixo "contratos_".
 */

import { eq, and, desc, sql, lt, isNull } from "drizzle-orm";
import { getDb } from "./db";
import {
  contratosClientes,
  contratos,
  contratosAditivos,
  contratosMarcos,
  contratosBoletins,
  contratosAprovacoes,
  contratosRiscos,
  contratosDocumentos,
  contratosAuditoria,
  contratosSincronizacao,
  empresas,
  empresaCliente,
  type ContratosCliente,
  type InsertContratosCliente,
  type Contrato,
  type InsertContrato,
  type InsertContratosAditivo,
  type InsertContratosMarco,
  type InsertContratosBoletim,
  type InsertContratosAprovacao,
  type InsertContratosRisco,
  type InsertContratosDocumento,
} from "../drizzle/schema";

// ─── AUDITORIA INTERNA ───────────────────────────────────────────────────────

export async function registrarAuditoriaContrato(params: {
  entidade: string;
  entidadeId: number;
  acao: string;
  usuarioId?: number;
  payloadAnterior?: unknown;
  payloadNovo?: unknown;
  observacoes?: string;
  contratoId?: number;
}) {
  const db = await getDb();
  if (!db) return;
  // O banco usa contrato_id NOT NULL — para entidades sem contrato direto, usamos entidadeId
  const contratoId = params.contratoId ?? (params.entidade === "contrato" ? params.entidadeId : 0);
  const descricao = `${params.entidade}:${params.entidadeId} — ${params.acao}${params.observacoes ? " — " + params.observacoes : ""}`;
  await db.insert(contratosAuditoria).values({
    contratoId,
    usuarioId: params.usuarioId,
    acao: params.acao,
    descricao,
    dadosAntes: params.payloadAnterior ? JSON.stringify(params.payloadAnterior) : null,
    dadosDepois: params.payloadNovo ? JSON.stringify(params.payloadNovo) : null,
  });
}

// ─── CLIENTES ────────────────────────────────────────────────────────────────

export async function getAllContratosClientes(empresaId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (empresaId) {
    // Filtra via tabela de junção N:N
    return await db
      .select({ cliente: contratosClientes })
      .from(contratosClientes)
      .innerJoin(empresaCliente, eq(empresaCliente.clienteId, contratosClientes.id))
      .where(eq(empresaCliente.empresaId, empresaId))
      .orderBy(desc(contratosClientes.createdAt))
      .then((rows) => rows.map((r) => r.cliente));
  }
  return await db.select().from(contratosClientes).orderBy(desc(contratosClientes.createdAt));
}

// Vincula um cliente a uma empresa via tabela de junção N:N
export async function vincularClienteEmpresa(clienteId: number, empId: number, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(empresaCliente)
    .values({ clienteId, empresaId: empId, createdAt: Date.now() })
    .onDuplicateKeyUpdate({ set: { clienteId, empresaId: empId } });
  await registrarAuditoriaContrato({ entidade: "cliente", entidadeId: clienteId, acao: "edicao", usuarioId: userId, payloadNovo: { vincularEmpresaId: empId } });
}

// Desvincula um cliente de uma empresa específica via tabela de junção N:N
export async function desvincularClienteEmpresa(clienteId: number, empId: number, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(empresaCliente)
    .where(and(eq(empresaCliente.clienteId, clienteId), eq(empresaCliente.empresaId, empId)));
  await registrarAuditoriaContrato({ entidade: "cliente", entidadeId: clienteId, acao: "edicao", usuarioId: userId, payloadNovo: { desvincularEmpresaId: empId } });
}

export async function getContratosClienteById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(contratosClientes).where(eq(contratosClientes.id, id));
  return row ?? null;
}

export async function createContratosCliente(data: InsertContratosCliente, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(contratosClientes).values(data);
  const id = (result as any).insertId as number;
  await registrarAuditoriaContrato({ entidade: "cliente", entidadeId: id, acao: "criacao", usuarioId: userId, payloadNovo: data });
  return id;
}

export async function updateContratosCliente(id: number, data: Partial<InsertContratosCliente>, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [anterior] = await db.select().from(contratosClientes).where(eq(contratosClientes.id, id));
  await db.update(contratosClientes).set(data).where(eq(contratosClientes.id, id));
  await registrarAuditoriaContrato({ entidade: "cliente", entidadeId: id, acao: "edicao", usuarioId: userId, payloadAnterior: anterior, payloadNovo: data });
}

export async function deleteContratosCliente(id: number, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contratosClientes).set({ status: "inativo" }).where(eq(contratosClientes.id, id));
  await registrarAuditoriaContrato({ entidade: "cliente", entidadeId: id, acao: "exclusao_logica", usuarioId: userId });
}

// ─── CONTRATOS ───────────────────────────────────────────────────────────────

export async function getAllContratos(empresaId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (empresaId) {
    return await db.select().from(contratos)
      .where(eq(contratos.empresaId, empresaId))
      .orderBy(desc(contratos.createdAt));
  }
  return await db.select().from(contratos).orderBy(desc(contratos.createdAt));
}

export async function getContratosByClienteId(clienteId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contratos)
    .where(eq(contratos.clienteId, clienteId))
    .orderBy(desc(contratos.createdAt));
}

export async function getContratoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.select().from(contratos).where(eq(contratos.id, id));
  if (!row) return null;
  // Enrich with client and company names
  let nomeCliente: string | null = null;
  let nomeEmpresa: string | null = null;
  if (row.clienteId) {
    const [cliente] = await db.select({ razaoSocial: contratosClientes.razaoSocial, nomeFantasia: contratosClientes.nomeFantasia })
      .from(contratosClientes).where(eq(contratosClientes.id, row.clienteId));
    if (cliente) nomeCliente = cliente.nomeFantasia || cliente.razaoSocial;
  }
  if (row.empresaId) {
    const [empresa] = await db.select({ nome: empresas.nome })
      .from(empresas).where(eq(empresas.id, row.empresaId));
    if (empresa) nomeEmpresa = empresa.nome;
  }
  return { ...row, nomeCliente, nomeEmpresa };
}

export async function createContrato(data: InsertContrato, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(contratos).values({ ...data, createdByUserId: userId });
  const id = (result as any).insertId as number;
  await registrarAuditoriaContrato({ entidade: "contrato", entidadeId: id, acao: "criacao", usuarioId: userId, payloadNovo: data });
  return id;
}

export async function updateContrato(id: number, data: Partial<InsertContrato>, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [anterior] = await db.select().from(contratos).where(eq(contratos.id, id));
  await db.update(contratos).set(data).where(eq(contratos.id, id));
  await registrarAuditoriaContrato({ entidade: "contrato", entidadeId: id, acao: "edicao", usuarioId: userId, payloadAnterior: anterior, payloadNovo: data });
}

export async function deleteContrato(id: number, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contratos).set({ status: "rescindido" }).where(eq(contratos.id, id));
  await registrarAuditoriaContrato({ entidade: "contrato", entidadeId: id, acao: "exclusao_logica", usuarioId: userId });
}

// ─── ADITIVOS ────────────────────────────────────────────────────────────────

export async function getAditivosByContrato(contratoId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contratosAditivos)
    .where(eq(contratosAditivos.contratoId, contratoId))
    .orderBy(desc(contratosAditivos.createdAt));
}

export async function createAditivo(data: InsertContratosAditivo, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(contratosAditivos).values({ ...data, createdByUserId: userId });
  const id = (result as any).insertId as number;
  await registrarAuditoriaContrato({ entidade: "aditivo", entidadeId: id, acao: "criacao", usuarioId: userId, payloadNovo: data });
  return id;
}

export async function updateAditivo(id: number, data: Partial<InsertContratosAditivo>, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contratosAditivos).set(data).where(eq(contratosAditivos.id, id));
  await registrarAuditoriaContrato({ entidade: "aditivo", entidadeId: id, acao: "edicao", usuarioId: userId, payloadNovo: data });
}

// ─── MARCOS FINANCEIROS ──────────────────────────────────────────────────────

export async function getMarcosByContrato(contratoId: number) {
  const db = await getDb();
  if (!db) return [];
  // Atualiza status de atrasados automaticamente
  const hoje = new Date().toISOString().split("T")[0];
  await db.update(contratosMarcos)
    .set({ status: "atrasado" })
    .where(
      and(
        eq(contratosMarcos.contratoId, contratoId),
        sql`${contratosMarcos.dataPrevista} < ${hoje}`,
        sql`${contratosMarcos.status} IN ('pendente', 'em_medicao')`
      )
    );
  return await db.select().from(contratosMarcos)
    .where(eq(contratosMarcos.contratoId, contratoId))
    .orderBy(contratosMarcos.ordem);
}

export async function createMarco(data: InsertContratosMarco, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(contratosMarcos).values({ ...data, createdByUserId: userId });
  const id = (result as any).insertId as number;
  await registrarAuditoriaContrato({ entidade: "marco", entidadeId: id, acao: "criacao", usuarioId: userId, payloadNovo: data });
  // Cria boletim automaticamente ao criar marco
  await createBoletimFromMarco(id, data.contratoId, userId);
  return id;
}

export async function updateMarco(id: number, data: Partial<InsertContratosMarco>, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [anterior] = await db.select().from(contratosMarcos).where(eq(contratosMarcos.id, id));
  await db.update(contratosMarcos).set(data).where(eq(contratosMarcos.id, id));
  await registrarAuditoriaContrato({ entidade: "marco", entidadeId: id, acao: "edicao", usuarioId: userId, payloadAnterior: anterior, payloadNovo: data });
}

// ─── BOLETINS DE MEDIÇÃO ─────────────────────────────────────────────────────

async function createBoletimFromMarco(marcoId: number, contratoId: number, userId?: number) {
  const db = await getDb();
  if (!db) return;
  const [marco] = await db.select().from(contratosMarcos).where(eq(contratosMarcos.id, marcoId));
  if (!marco) return;
  // Conta boletins existentes para gerar número sequencial
  const [{ count }] = await db.select({ count: sql<number>`count(*)` })
    .from(contratosBoletins).where(eq(contratosBoletins.contratoId, contratoId));
  const numero = `BM-${contratoId.toString().padStart(4, "0")}-${(Number(count) + 1).toString().padStart(3, "0")}`;
  const [result] = await db.insert(contratosBoletins).values({
    contratoId,
    marcoId,
    numero,
    titulo: `Boletim de Medição — ${marco.titulo}`,
    valorMedicao: marco.valorPrevisto,
    status: "rascunho",
    createdByUserId: userId,
  });
  const id = (result as any).insertId as number;
  await registrarAuditoriaContrato({ entidade: "boletim", entidadeId: id, acao: "criacao", usuarioId: userId });
  return id;
}

export async function getBoletinsByContrato(contratoId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contratosBoletins)
    .where(eq(contratosBoletins.contratoId, contratoId))
    .orderBy(desc(contratosBoletins.createdAt));
}

export async function updateBoletim(id: number, data: Partial<InsertContratosBoletim>, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [anterior] = await db.select().from(contratosBoletins).where(eq(contratosBoletins.id, id));
  await db.update(contratosBoletins).set(data).where(eq(contratosBoletins.id, id));
  await registrarAuditoriaContrato({ entidade: "boletim", entidadeId: id, acao: "edicao", usuarioId: userId, payloadAnterior: anterior, payloadNovo: data });
}

export async function enviarBoletimAprovacao(id: number, aprovadorNome: string, aprovadorEmail: string, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  await db.update(contratosBoletins).set({
    status: "enviado",
    aprovadorNome,
    aprovadorEmail,
    aprovadorToken: token,
    dataEnvio: new Date(),
  }).where(eq(contratosBoletins.id, id));
  await registrarAuditoriaContrato({ entidade: "boletim", entidadeId: id, acao: "envio_aprovacao", usuarioId: userId });
  return token;
}

export async function aprovarBoletim(id: number, aprovado: boolean, observacoes: string, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const novoStatus = aprovado ? "aprovado" : "rejeitado";
  await db.update(contratosBoletins).set({
    status: novoStatus,
    dataAprovacao: new Date(),
    observacoesAprovador: observacoes,
  }).where(eq(contratosBoletins.id, id));
  // Se aprovado, atualiza status do marco
  const [boletim] = await db.select().from(contratosBoletins).where(eq(contratosBoletins.id, id));
  if (aprovado && boletim?.marcoId) {
    await db.update(contratosMarcos).set({ status: "aprovado" }).where(eq(contratosMarcos.id, boletim.marcoId));
  }
  await registrarAuditoriaContrato({ entidade: "boletim", entidadeId: id, acao: aprovado ? "aprovacao" : "rejeicao", usuarioId: userId, observacoes });
}

// ─── RISCOS CONTRATUAIS ──────────────────────────────────────────────────────

export async function getRiscosByContrato(contratoId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contratosRiscos)
    .where(eq(contratosRiscos.contratoId, contratoId))
    .orderBy(desc(contratosRiscos.createdAt));
}

export async function createRisco(data: InsertContratosRisco, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(contratosRiscos).values({ ...data, createdByUserId: userId });
  const id = (result as any).insertId as number;
  await registrarAuditoriaContrato({ entidade: "risco", entidadeId: id, acao: "criacao", usuarioId: userId, payloadNovo: data });
  return id;
}

export async function updateRisco(id: number, data: Partial<InsertContratosRisco>, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contratosRiscos).set(data).where(eq(contratosRiscos.id, id));
  await registrarAuditoriaContrato({ entidade: "risco", entidadeId: id, acao: "edicao", usuarioId: userId, payloadNovo: data });
}

// ─── DOCUMENTOS ──────────────────────────────────────────────────────────────

export async function getDocumentosByContrato(contratoId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contratosDocumentos)
    .where(eq(contratosDocumentos.contratoId, contratoId))
    .orderBy(desc(contratosDocumentos.createdAt));
}

export async function createDocumento(data: InsertContratosDocumento, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(contratosDocumentos).values({ ...data, createdByUserId: userId });
  const id = (result as any).insertId as number;
  await registrarAuditoriaContrato({ entidade: "documento", entidadeId: id, acao: "criacao", usuarioId: userId, payloadNovo: data });
  return id;
}

// ─── AUDITORIA (leitura) ─────────────────────────────────────────────────────

export async function getAuditoriaContrato(contratoId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contratosAuditoria)
    .where(eq(contratosAuditoria.contratoId, contratoId))
    .orderBy(desc(contratosAuditoria.createdAt));
}

export async function getAuditoriaGeral(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contratosAuditoria)
    .orderBy(desc(contratosAuditoria.createdAt))
    .limit(limit);
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

export async function getDashboardContratos(empresaId?: number) {
  const db = await getDb();
  if (!db) return null;

  const whereClause = empresaId ? eq(contratos.empresaId, empresaId) : undefined;

  const [totais] = await db.select({
    total: sql<number>`count(*)`,
    ativos: sql<number>`sum(case when ${contratos.status} = 'ativo' then 1 else 0 end)`,
    encerrados: sql<number>`sum(case when ${contratos.status} = 'encerrado' then 1 else 0 end)`,
    valorTotal: sql<number>`sum(${contratos.valorTotal})`,
  }).from(contratos).where(whereClause ?? sql`1=1`);

  const [marcosStats] = await db.select({
    total: sql<number>`count(*)`,
    atrasados: sql<number>`sum(case when ${contratosMarcos.status} = 'atrasado' then 1 else 0 end)`,
    pagos: sql<number>`sum(case when ${contratosMarcos.status} = 'pago' then 1 else 0 end)`,
    valorPrevisto: sql<number>`sum(${contratosMarcos.valorPrevisto})`,
    valorPago: sql<number>`sum(${contratosMarcos.valorPago})`,
  }).from(contratosMarcos);

  const [riscosStats] = await db.select({
    total: sql<number>`count(*)`,
    criticos: sql<number>`sum(case when ${contratosRiscos.severidade} = 'critica' then 1 else 0 end)`,
    altos: sql<number>`sum(case when ${contratosRiscos.severidade} = 'alta' then 1 else 0 end)`,
  }).from(contratosRiscos);

  const [boletinsStats] = await db.select({
    total: sql<number>`count(*)`,
    emAprovacao: sql<number>`sum(case when ${contratosBoletins.status} = 'em_aprovacao' then 1 else 0 end)`,
    aprovados: sql<number>`sum(case when ${contratosBoletins.status} = 'aprovado' then 1 else 0 end)`,
  }).from(contratosBoletins);

  return { totais, marcosStats, riscosStats, boletinsStats };
}
