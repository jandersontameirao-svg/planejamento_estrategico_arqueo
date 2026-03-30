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


// ─── DASHBOARD DE RECEITA ────────────────────────────────────────────────────

/**
 * Dashboard de Receita Prevista vs Realizada
 * Agrega marcos financeiros por mês e compara previsto vs pago
 */
export async function getDashboardReceita(empresaId?: number, ano?: number) {
  const db = await getDb();
  if (!db) return null;

  const anoFiltro = ano ?? new Date().getFullYear();

  // Receita por contrato (previsto vs pago)
  const receitaPorContrato = await db.select({
    contratoId: contratos.id,
    titulo: contratos.titulo,
    numero: contratos.numero,
    status: contratos.status,
    empresaId: contratos.empresaId,
    valorContrato: contratos.valorTotal,
    totalPrevisto: sql<number>`COALESCE(SUM(${contratosMarcos.valorPrevisto}), 0)`,
    totalPago: sql<number>`COALESCE(SUM(${contratosMarcos.valorPago}), 0)`,
    totalMarcos: sql<number>`COUNT(${contratosMarcos.id})`,
    marcosPagos: sql<number>`SUM(CASE WHEN ${contratosMarcos.status} = 'pago' THEN 1 ELSE 0 END)`,
    marcosAtrasados: sql<number>`SUM(CASE WHEN ${contratosMarcos.status} = 'atrasado' THEN 1 ELSE 0 END)`,
  })
    .from(contratos)
    .leftJoin(contratosMarcos, eq(contratos.id, contratosMarcos.contratoId))
    .where(empresaId ? eq(contratos.empresaId, empresaId) : sql`1=1`)
    .groupBy(contratos.id);

  // Receita mensal (baseada em data_prevista dos marcos)
  const receitaMensal = await db.select({
    mes: sql<number>`MONTH(${contratosMarcos.dataPrevista})`,
    previsto: sql<number>`COALESCE(SUM(${contratosMarcos.valorPrevisto}), 0)`,
    pago: sql<number>`COALESCE(SUM(${contratosMarcos.valorPago}), 0)`,
  })
    .from(contratosMarcos)
    .innerJoin(contratos, eq(contratosMarcos.contratoId, contratos.id))
    .where(
      and(
        sql`YEAR(${contratosMarcos.dataPrevista}) = ${anoFiltro}`,
        empresaId ? eq(contratos.empresaId, empresaId) : sql`1=1`
      )
    )
    .groupBy(sql`MONTH(${contratosMarcos.dataPrevista})`)
    .orderBy(sql`MONTH(${contratosMarcos.dataPrevista})`);

  // Preencher todos os 12 meses
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const receitaMensalCompleta = meses.map((nome, i) => {
    const found = receitaMensal.find((r: any) => Number(r.mes) === i + 1);
    return {
      mes: i + 1,
      nome,
      previsto: found ? Number(found.previsto) : 0,
      pago: found ? Number(found.pago) : 0,
    };
  });

  // Totais gerais
  const totalPrevisto = receitaPorContrato.reduce((s, c) => s + Number(c.totalPrevisto), 0);
  const totalPago = receitaPorContrato.reduce((s, c) => s + Number(c.totalPago), 0);
  const totalContratos = receitaPorContrato.length;
  const contratosAtivos = receitaPorContrato.filter(c => c.status === "ativo").length;

  // Receita por status de marco
  const [statusMarcos] = await db.select({
    pendentes: sql<number>`SUM(CASE WHEN ${contratosMarcos.status} IN ('pendente', 'em_medicao') THEN ${contratosMarcos.valorPrevisto} ELSE 0 END)`,
    aprovados: sql<number>`SUM(CASE WHEN ${contratosMarcos.status} = 'aprovado' THEN ${contratosMarcos.valorPrevisto} ELSE 0 END)`,
    pagos: sql<number>`SUM(CASE WHEN ${contratosMarcos.status} = 'pago' THEN ${contratosMarcos.valorPago} ELSE 0 END)`,
    atrasados: sql<number>`SUM(CASE WHEN ${contratosMarcos.status} = 'atrasado' THEN ${contratosMarcos.valorPrevisto} ELSE 0 END)`,
  })
    .from(contratosMarcos)
    .innerJoin(contratos, eq(contratosMarcos.contratoId, contratos.id))
    .where(empresaId ? eq(contratos.empresaId, empresaId) : sql`1=1`);

  return {
    totais: {
      totalPrevisto,
      totalPago,
      totalContratos,
      contratosAtivos,
      percentualRecebido: totalPrevisto > 0 ? (totalPago / totalPrevisto) * 100 : 0,
    },
    statusMarcos: {
      pendentes: Number(statusMarcos?.pendentes ?? 0),
      aprovados: Number(statusMarcos?.aprovados ?? 0),
      pagos: Number(statusMarcos?.pagos ?? 0),
      atrasados: Number(statusMarcos?.atrasados ?? 0),
    },
    receitaMensal: receitaMensalCompleta,
    receitaPorContrato: receitaPorContrato.map(c => ({
      ...c,
      valorContrato: Number(c.valorContrato ?? 0),
      totalPrevisto: Number(c.totalPrevisto),
      totalPago: Number(c.totalPago),
      totalMarcos: Number(c.totalMarcos),
      marcosPagos: Number(c.marcosPagos),
      marcosAtrasados: Number(c.marcosAtrasados),
      percentual: Number(c.totalPrevisto) > 0 ? (Number(c.totalPago) / Number(c.totalPrevisto)) * 100 : 0,
    })),
    ano: anoFiltro,
  };
}

/**
 * Resultado Operacional (DRE Simplificado)
 * Cruza receita dos contratos com custos/despesas do orçamento
 */
export async function getResultadoOperacional(empresaId: number, ano?: number) {
  const db = await getDb();
  if (!db) return null;

  const anoFiltro = ano ?? new Date().getFullYear();

  // 1. RECEITA: soma dos marcos pagos por mês
  const receitaMensal = await db.select({
    mes: sql<number>`MONTH(${contratosMarcos.dataPagamento})`,
    valor: sql<number>`COALESCE(SUM(${contratosMarcos.valorPago}), 0)`,
  })
    .from(contratosMarcos)
    .innerJoin(contratos, eq(contratosMarcos.contratoId, contratos.id))
    .where(
      and(
        eq(contratos.empresaId, empresaId),
        eq(contratosMarcos.status, "pago"),
        sql`YEAR(${contratosMarcos.dataPagamento}) = ${anoFiltro}`
      )
    )
    .groupBy(sql`MONTH(${contratosMarcos.dataPagamento})`);

  // Receita prevista (marcos com data prevista no ano)
  const receitaPrevistaMensal = await db.select({
    mes: sql<number>`MONTH(${contratosMarcos.dataPrevista})`,
    valor: sql<number>`COALESCE(SUM(${contratosMarcos.valorPrevisto}), 0)`,
  })
    .from(contratosMarcos)
    .innerJoin(contratos, eq(contratosMarcos.contratoId, contratos.id))
    .where(
      and(
        eq(contratos.empresaId, empresaId),
        sql`YEAR(${contratosMarcos.dataPrevista}) = ${anoFiltro}`
      )
    )
    .groupBy(sql`MONTH(${contratosMarcos.dataPrevista})`);

  // 2. CUSTOS/DESPESAS EXECUTADOS: do módulo orçamentário
  const { orcamentoExecutadoLinhas, orcamentoPlanejadoLinhas, orcamentoVersoes } = await import("../drizzle/schema");
  
  const custosExecutados = await db.select({
    competencia: orcamentoExecutadoLinhas.competencia,
    valor: sql<number>`COALESCE(SUM(${orcamentoExecutadoLinhas.valorOriginal}), 0)`,
  })
    .from(orcamentoExecutadoLinhas)
    .where(
      and(
        eq(orcamentoExecutadoLinhas.empresaId, empresaId),
        sql`${orcamentoExecutadoLinhas.competencia} LIKE '${sql.raw(String(anoFiltro))}%'`,
        eq(orcamentoExecutadoLinhas.ativo, 1)
      )
    )
    .groupBy(orcamentoExecutadoLinhas.competencia);

  // 3. CUSTOS/DESPESAS PLANEJADOS: do módulo orçamentário (versão aprovada)
  const [versaoAprovada] = await db.select()
    .from(orcamentoVersoes)
    .where(
      and(
        eq(orcamentoVersoes.empresaId, empresaId),
        eq(orcamentoVersoes.ano, anoFiltro),
        eq(orcamentoVersoes.status, "aprovado")
      )
    )
    .limit(1);

  let custosPlanjMensal: { mes: number; valor: number }[] = [];
  if (versaoAprovada) {
    const mesesCols = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const linhasPlanejadas = await db.select()
      .from(orcamentoPlanejadoLinhas)
      .where(eq(orcamentoPlanejadoLinhas.versaoId, versaoAprovada.id));

    custosPlanjMensal = mesesCols.map((col, i) => ({
      mes: i + 1,
      valor: linhasPlanejadas.reduce((sum, l) => sum + Number((l as any)[col] ?? 0), 0),
    }));
  }

  // Montar DRE mensal
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const dreMensal = meses.map((nome, i) => {
    const mesNum = i + 1;
    const comp = `${anoFiltro}-${String(mesNum).padStart(2, "0")}`;

    const recPrev = receitaPrevistaMensal.find((r: any) => Number(r.mes) === mesNum);
    const recReal = receitaMensal.find((r: any) => Number(r.mes) === mesNum);
    const custoExec = custosExecutados.find((c: any) => c.competencia === comp);
    const custoPlan = custosPlanjMensal.find(c => c.mes === mesNum);

    const receitaPrevista = recPrev ? Number(recPrev.valor) : 0;
    const receitaRealizada = recReal ? Number(recReal.valor) : 0;
    const despesaPlanejada = custoPlan ? custoPlan.valor : 0;
    const despesaExecutada = custoExec ? Number(custoExec.valor) : 0;

    return {
      mes: mesNum,
      nome,
      receitaPrevista,
      receitaRealizada,
      despesaPlanejada,
      despesaExecutada,
      resultadoPrevisto: receitaPrevista - despesaPlanejada,
      resultadoRealizado: receitaRealizada - despesaExecutada,
      margemPrevista: receitaPrevista > 0 ? ((receitaPrevista - despesaPlanejada) / receitaPrevista) * 100 : 0,
      margemRealizada: receitaRealizada > 0 ? ((receitaRealizada - despesaExecutada) / receitaRealizada) * 100 : 0,
    };
  });

  // Acumulados
  const totalReceitaPrevista = dreMensal.reduce((s, m) => s + m.receitaPrevista, 0);
  const totalReceitaRealizada = dreMensal.reduce((s, m) => s + m.receitaRealizada, 0);
  const totalDespesaPlanejada = dreMensal.reduce((s, m) => s + m.despesaPlanejada, 0);
  const totalDespesaExecutada = dreMensal.reduce((s, m) => s + m.despesaExecutada, 0);

  return {
    ano: anoFiltro,
    empresaId,
    dreMensal,
    totais: {
      receitaPrevista: totalReceitaPrevista,
      receitaRealizada: totalReceitaRealizada,
      despesaPlanejada: totalDespesaPlanejada,
      despesaExecutada: totalDespesaExecutada,
      resultadoPrevisto: totalReceitaPrevista - totalDespesaPlanejada,
      resultadoRealizado: totalReceitaRealizada - totalDespesaExecutada,
      margemPrevista: totalReceitaPrevista > 0 ? ((totalReceitaPrevista - totalDespesaPlanejada) / totalReceitaPrevista) * 100 : 0,
      margemRealizada: totalReceitaRealizada > 0 ? ((totalReceitaRealizada - totalDespesaExecutada) / totalReceitaRealizada) * 100 : 0,
    },
  };
}
