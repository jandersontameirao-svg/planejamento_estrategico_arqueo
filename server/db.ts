import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, type InsertEmpresa, kpiValores, kpis, objetivosGrupo, type InsertObjetivoGrupo, objetivoGrupoKpis, projetosGrupo, type InsertProjetoGrupo, projetoGrupoKpis, acoesGrupo, type InsertAcaoGrupo, pestelPlanoAcao, type InsertPestelPlanoAcao, type PestelPlanoAcao } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Empresas
export async function getAllEmpresas() {
  const db = await getDb();
  if (!db) return [];
  const { empresas } = await import("../drizzle/schema");
  return await db.select().from(empresas);
}

export async function getEmpresaById(id: number) {
  const db = await getDb();
  if (!db) return { id, nome: "", descricao: "", areaId: null };
  const { empresas } = await import("../drizzle/schema");
  const result = await db.select().from(empresas).where(eq(empresas.id, id)).limit(1);
  return result.length > 0 ? result[0] : { id, nome: "", descricao: "", areaId: null };
}

export async function createEmpresa(data: InsertEmpresa) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { empresas } = await import("../drizzle/schema");
  const result = await db.insert(empresas).values(data);
  return Number(result[0].insertId);
}

export async function updateEmpresa(id: number, data: Partial<InsertEmpresa>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { empresas } = await import("../drizzle/schema");
  await db.update(empresas).set(data).where(eq(empresas.id, id));
}

export async function deleteEmpresa(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { empresas } = await import("../drizzle/schema");
  await db.delete(empresas).where(eq(empresas.id, id));
}

// Vinculação usuário-empresa
export async function getEmpresasByUsuario(usuarioId: number) {
  const db = await getDb();
  if (!db) return [];
  const { usuarioEmpresas, empresas } = await import("../drizzle/schema");
  const result = await db
    .select({ empresa: empresas })
    .from(usuarioEmpresas)
    .innerJoin(empresas, eq(usuarioEmpresas.empresaId, empresas.id))
    .where(eq(usuarioEmpresas.usuarioId, usuarioId));
  return result.map(r => r.empresa);
}

export async function vincularUsuarioEmpresa(usuarioId: number, empresaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { usuarioEmpresas } = await import("../drizzle/schema");
  await db.insert(usuarioEmpresas).values({ usuarioId, empresaId });
}

export async function desvincularUsuarioEmpresa(usuarioId: number, empresaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { usuarioEmpresas } = await import("../drizzle/schema");
  await db.delete(usuarioEmpresas)
    .where(and(
      eq(usuarioEmpresas.usuarioId, usuarioId),
      eq(usuarioEmpresas.empresaId, empresaId)
    ));
}

// Usuários
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users);
}

export async function updateUserRole(userId: number, role: "user" | "admin" | "gestor") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export function hashPassword(senha: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(senha: string, stored: string): boolean {
  const [salt, hash] = (stored || "").split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const test = crypto.scryptSync(senha, salt, 64);
  return hashBuf.length === test.length && crypto.timingSafeEqual(hashBuf, test);
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase()));
  return rows[0] ?? null;
}

export async function createUser(data: { name: string; email: string; role: "user" | "admin" | "gestor"; senha: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Gerar um openId único para usuários criados manualmente
  const openId = `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const result = await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email.trim().toLowerCase(),
    role: data.role,
    loginMethod: "manual",
    passwordHash: hashPassword(data.senha),
  });

  return { id: result[0].insertId };
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(users).where(eq(users.id, userId));
}

// Identidade Organizacional
export async function getIdentidadeByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) return { empresaId, missao: "", visao: "", valores: "", politica: "" };
  const { identidadeOrganizacional } = await import("../drizzle/schema");
  const result = await db.select().from(identidadeOrganizacional).where(eq(identidadeOrganizacional.empresaId, empresaId)).limit(1);
  return result.length > 0 ? result[0] : { empresaId, missao: "", visao: "", valores: "", politica: "" };
}

export async function upsertIdentidade(empresaId: number, data: { missao?: string; visao?: string; valores?: string; politica?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { identidadeOrganizacional } = await import("../drizzle/schema");
  
  const existing = await getIdentidadeByEmpresa(empresaId);
  
  if (existing) {
    await db.update(identidadeOrganizacional).set(data).where(eq(identidadeOrganizacional.empresaId, empresaId));
  } else {
    await db.insert(identidadeOrganizacional).values({ empresaId, ...data });
  }
}

// Histórico de Faturamento
export async function getHistoricoFaturamento(empresaId: number, ano?: number) {
  const db = await getDb();
  if (!db) return [];
  const { historicoFaturamento } = await import("../drizzle/schema");
  
  if (ano) {
    return await db.select().from(historicoFaturamento)
      .where(and(
        eq(historicoFaturamento.empresaId, empresaId),
        eq(historicoFaturamento.ano, ano)
      ));
  }
  
  return await db.select().from(historicoFaturamento).where(eq(historicoFaturamento.empresaId, empresaId));
}

export async function createHistoricoFaturamento(data: {
  empresaId: number;
  ano: number;
  mes: number;
  faturamento: number;
  numeroClientes?: number;
  ticketMedio?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { historicoFaturamento } = await import("../drizzle/schema");
  const values = {
    ...data,
    faturamento: data.faturamento.toString(),
    ticketMedio: data.ticketMedio?.toString(),
  };
  await db.insert(historicoFaturamento).values(values);
}

// Produtos e Serviços
export async function getProdutosByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) return [];
  const { produtos } = await import("../drizzle/schema");
  return await db.select().from(produtos).where(eq(produtos.empresaId, empresaId));
}

export async function createProduto(data: {
  empresaId: number;
  nome: string;
  tipo: "produto" | "servico";
  ativo?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { produtos } = await import("../drizzle/schema");
  const result = await db.insert(produtos).values(data);
  return Number(result[0].insertId);
}

export async function updateProduto(id: number, data: { nome?: string; tipo?: "produto" | "servico"; ativo?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { produtos } = await import("../drizzle/schema");
  await db.update(produtos).set(data).where(eq(produtos.id, id));
}

export async function deleteProduto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { produtos } = await import("../drizzle/schema");
  await db.delete(produtos).where(eq(produtos.id, id));
}

// Canais
export async function getCanaisByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) return [];
  const { canais } = await import("../drizzle/schema");
  return await db.select().from(canais).where(eq(canais.empresaId, empresaId));
}

export async function createCanal(data: {
  empresaId: number;
  nome: string;
  tipo?: string;
  ativo?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { canais } = await import("../drizzle/schema");
  const result = await db.insert(canais).values(data);
  return Number(result[0].insertId);
}

export async function updateCanal(id: number, data: { nome?: string; tipo?: string; ativo?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { canais } = await import("../drizzle/schema");
  await db.update(canais).set(data).where(eq(canais.id, id));
}

export async function deleteCanal(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { canais } = await import("../drizzle/schema");
  await db.delete(canais).where(eq(canais.id, id));
}

// KPIs
export async function getKPIsByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) return [];
  const { kpis } = await import("../drizzle/schema");
  return await db.select().from(kpis).where(eq(kpis.empresaId, empresaId));
}

export async function createKPI(data: {
  empresaId: number;
  nome: string;
  unidadeMedida: string;
  tipo: "financeiro" | "operacional" | "cliente" | "processo";
  frequencia: "mensal" | "trimestral" | "anual";
  responsavel?: string;
  ativo?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { kpis } = await import("../drizzle/schema");
  const result = await db.insert(kpis).values(data);
  return Number(result[0].insertId);
}

export async function updateKPI(id: number, data: Partial<{
  nome: string;
  unidadeMedida: string;
  tipo: "financeiro" | "operacional" | "cliente" | "processo";
  frequencia: "mensal" | "trimestral" | "anual";
  responsavel: string;
  ativo: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { kpis } = await import("../drizzle/schema");
  await db.update(kpis).set(data).where(eq(kpis.id, id));
}

export async function deleteKPI(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { kpis } = await import("../drizzle/schema");
  await db.delete(kpis).where(eq(kpis.id, id));
}

// KPI Valores
export async function getKPIValores(kpiId: number, ano?: number, mes?: number) {
  const db = await getDb();
  if (!db) return [];
  const { kpiValores } = await import("../drizzle/schema");
  
  let conditions = [eq(kpiValores.kpiId, kpiId)];
  if (ano) conditions.push(eq(kpiValores.ano, ano));
  if (mes) conditions.push(eq(kpiValores.mes, mes));
  
  return await db.select().from(kpiValores).where(and(...conditions));
}

export async function upsertKPIValor(data: {
  kpiId: number;
  ano: number;
  mes: number;
  meta: number;
  realizado?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { kpiValores } = await import("../drizzle/schema");
  
  // Calcular percentual e status RAG
  const percentual = data.realizado && data.meta > 0 
    ? (data.realizado / data.meta) * 100 
    : null;
  
  let statusRag: "verde" | "amarelo" | "vermelho" | null = null;
  if (percentual !== null) {
    if (percentual >= 90) statusRag = "verde";
    else if (percentual >= 70) statusRag = "amarelo";
    else statusRag = "vermelho";
  }
  
  const values = {
    ...data,
    meta: data.meta.toString(),
    realizado: data.realizado?.toString(),
    percentualAtingimento: percentual?.toString(),
    statusRag,
  };
  
  // Verificar se já existe
  const existing = await db.select().from(kpiValores)
    .where(and(
      eq(kpiValores.kpiId, data.kpiId),
      eq(kpiValores.ano, data.ano),
      eq(kpiValores.mes, data.mes)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(kpiValores)
      .set(values)
      .where(and(
        eq(kpiValores.kpiId, data.kpiId),
        eq(kpiValores.ano, data.ano),
        eq(kpiValores.mes, data.mes)
      ));
  } else {
    await db.insert(kpiValores).values(values);
  }
}


// Dashboard - Estatísticas consolidadas
export async function getDashboardGrupo() {
  const db = await getDb();
  if (!db) {
    return {
      totalEmpresas: 0,
      empresasAtivas: 0,
      totalKpis: 0,
      statusRag: {
        verde: 0,
        amarelo: 0,
        vermelho: 0,
      },
    };
  }
  
  const { empresas, kpis, kpiValores } = await import("../drizzle/schema");
  
  // Total de empresas
  const totalEmpresas = await db.select().from(empresas);
  const empresasAtivas = totalEmpresas.filter(e => e.status === "ativa");
  
  // Total de KPIs
  const totalKpis = await db.select().from(kpis);
  
  // KPIs por status RAG (último mês)
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;
  
  const valoresRecentes = await db.select()
    .from(kpiValores)
    .where(and(
      eq(kpiValores.ano, anoAtual),
      eq(kpiValores.mes, mesAtual)
    ));
  
  const statusRag = {
    verde: valoresRecentes.filter(v => v.statusRag === "verde").length,
    amarelo: valoresRecentes.filter(v => v.statusRag === "amarelo").length,
    vermelho: valoresRecentes.filter(v => v.statusRag === "vermelho").length,
  };
  
  return {
    totalEmpresas: totalEmpresas.length,
    empresasAtivas: empresasAtivas.length,
    totalKpis: totalKpis.length,
    statusRag,
  };
}

export async function getDashboardEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { kpis, kpiValores } = await import("../drizzle/schema");
  
  // KPIs da empresa
  const kpisEmpresa = await db.select().from(kpis).where(eq(kpis.empresaId, empresaId));
  
  // Valores do ano atual
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;
  
  const valoresAno = await db.select()
    .from(kpiValores)
    .where(eq(kpiValores.ano, anoAtual));
  
  const valoresMesAtual = valoresAno.filter(v => v.mes === mesAtual);
  
  const statusRag = {
    verde: valoresMesAtual.filter(v => v.statusRag === "verde").length,
    amarelo: valoresMesAtual.filter(v => v.statusRag === "amarelo").length,
    vermelho: valoresMesAtual.filter(v => v.statusRag === "vermelho").length,
  };
  
  return {
    totalKpis: kpisEmpresa.length,
    statusRag,
    valoresAno,
  };
}


// Identidade do Grupo
export async function getIdentidadeGrupo() {
  const db = await getDb();
  if (!db) return null;
  const { identidadeGrupo } = await import("../drizzle/schema");
  const result = await db.select().from(identidadeGrupo).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertIdentidadeGrupo(data: {
  missao?: string;
  visao?: string;
  valores?: string;
  politica?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { identidadeGrupo } = await import("../drizzle/schema");
  
  const existing = await db.select().from(identidadeGrupo).limit(1);
  
  if (existing.length > 0) {
    await db.update(identidadeGrupo).set(data).where(eq(identidadeGrupo.id, existing[0].id));
  } else {
    await db.insert(identidadeGrupo).values(data);
  }
}

// Objetivos do Grupo
export async function getObjetivosGrupo() {
  const db = await getDb();
  if (!db) return [];
  const { objetivosGrupo } = await import("../drizzle/schema");
  return await db.select().from(objetivosGrupo);
}

export async function createObjetivoGrupo(data: {
  titulo: string;
  descricao?: string;
  prazo?: Date;
  status?: "planejado" | "em_andamento" | "concluido" | "cancelado";
  impacto?: "baixo" | "medio" | "alto";
  probabilidade?: "baixa" | "media" | "alta";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { objetivosGrupo } = await import("../drizzle/schema");
  const result = await db.insert(objetivosGrupo).values(data);
  return Number(result[0].insertId);
}

export async function updateObjetivoGrupo(id: number, data: Partial<{
  titulo: string;
  descricao: string;
  prazo: Date;
  status: "planejado" | "em_andamento" | "concluido" | "cancelado";
  impacto: "baixo" | "medio" | "alto";
  probabilidade: "baixa" | "media" | "alta";
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { objetivosGrupo } = await import("../drizzle/schema");
  await db.update(objetivosGrupo).set(data).where(eq(objetivosGrupo.id, id));
}

export async function deleteObjetivoGrupo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { objetivosGrupo } = await import("../drizzle/schema");
  await db.delete(objetivosGrupo).where(eq(objetivosGrupo.id, id));
}

// KPIs do Grupo (empresaId = null)
export async function getKPIsGrupo() {
  const db = await getDb();
  if (!db) return [];
  const { kpis } = await import("../drizzle/schema");
  const { isNull } = await import("drizzle-orm");
  return await db.select().from(kpis).where(isNull(kpis.empresaId));
}

export async function createKPIGrupo(data: {
  nome: string;
  unidadeMedida: string;
  tipo: "financeiro" | "operacional" | "cliente" | "processo";
  frequencia: "mensal" | "trimestral" | "anual";
  responsavel?: string;
  ativo?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { kpis } = await import("../drizzle/schema");
  const result = await db.insert(kpis).values({ ...data, empresaId: null });
  return Number(result[0].insertId);
}


// ============================================
// KPI Valores Mensais
// ============================================

export async function getKpiValoresByKpi(kpiId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(kpiValores)
    .where(eq(kpiValores.kpiId, kpiId))
    .orderBy(desc(kpiValores.ano), desc(kpiValores.mes));
  
  return result;
}

export async function getKpiValorByKpiAndPeriodo(kpiId: number, ano: number, mes: number) {
  const db = await getDb();
  if (!db) return { kpiId, ano, mes, valor: 0, meta: 0 };
  
  const result = await db
    .select()
    .from(kpiValores)
    .where(
      and(
        eq(kpiValores.kpiId, kpiId),
        eq(kpiValores.ano, ano),
        eq(kpiValores.mes, mes)
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : { kpiId, ano, mes, valor: 0, meta: 0 };
}

export async function upsertKpiValor(data: {
  kpiId: number;
  ano: number;
  mes: number;
  meta?: number;
  realizado?: number;
}) {
  const db = await getDb();
  if (!db) return;

  // Calcular percentual de atingimento e status RAG
  let percentualAtingimento: number | null = null;
  let statusRag: "verde" | "amarelo" | "vermelho" | null = null;

  if (data.meta && data.realizado) {
    percentualAtingimento = (data.realizado / data.meta) * 100;
    
    if (percentualAtingimento >= 90) {
      statusRag = "verde";
    } else if (percentualAtingimento >= 70) {
      statusRag = "amarelo";
    } else {
      statusRag = "vermelho";
    }
  }

  const values = {
    kpiId: data.kpiId,
    ano: data.ano,
    mes: data.mes,
    meta: data.meta?.toString(),
    realizado: data.realizado?.toString(),
    percentualAtingimento: percentualAtingimento?.toFixed(2),
    statusRag,
  };

  await db
    .insert(kpiValores)
    .values(values)
    .onDuplicateKeyUpdate({
      set: {
        meta: values.meta,
        realizado: values.realizado,
        percentualAtingimento: values.percentualAtingimento,
        statusRag: values.statusRag,
        updatedAt: new Date(),
      },
    });
}



// Vinculação de Objetivos a KPIs
export async function vincularObjetivoKPI(objetivoId: number, kpiId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(objetivoGrupoKpis).values({ objetivoId, kpiId });
}

export async function desvincularObjetivoKPI(objetivoId: number, kpiId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(objetivoGrupoKpis)
    .where(and(
      eq(objetivoGrupoKpis.objetivoId, objetivoId),
      eq(objetivoGrupoKpis.kpiId, kpiId)
    ));
}

export async function getKPIsVinculadosObjetivo(objetivoId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      kpi: kpis,
    })
    .from(objetivoGrupoKpis)
    .innerJoin(kpis, eq(objetivoGrupoKpis.kpiId, kpis.id))
    .where(eq(objetivoGrupoKpis.objetivoId, objetivoId));
  
  return result.map(r => r.kpi);
}

// ==================== Projetos do Grupo ====================

export async function getProjetosGrupo() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(projetosGrupo);
  return result;
}

export async function createProjetoGrupo(data: InsertProjetoGrupo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(projetosGrupo).values(data);
}

export async function updateProjetoGrupo(id: number, data: Partial<InsertProjetoGrupo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(projetosGrupo).set(data).where(eq(projetosGrupo.id, id));
}

export async function deleteProjetoGrupo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(projetosGrupo).where(eq(projetosGrupo.id, id));
}

// Vinculação de Projetos a KPIs
export async function vincularProjetoKPI(projetoId: number, kpiId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(projetoGrupoKpis).values({ projetoId, kpiId });
}

export async function desvincularProjetoKPI(projetoId: number, kpiId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(projetoGrupoKpis)
    .where(and(
      eq(projetoGrupoKpis.projetoId, projetoId),
      eq(projetoGrupoKpis.kpiId, kpiId)
    ));
}

export async function getKPIsVinculadosProjeto(projetoId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      kpi: kpis,
    })
    .from(projetoGrupoKpis)
    .innerJoin(kpis, eq(projetoGrupoKpis.kpiId, kpis.id))
    .where(eq(projetoGrupoKpis.projetoId, projetoId));
  
  return result.map(r => r.kpi);
}


// ============================================
// Ações do Plano de Ação
// ============================================

export async function getAcoesGrupo() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(acoesGrupo).orderBy(acoesGrupo.prazo);
}

export async function getAcaoById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(acoesGrupo).where(eq(acoesGrupo.id, id));
  return result[0];
}

export async function getAcoesByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(acoesGrupo).where(eq(acoesGrupo.empresaId, empresaId));
}

export async function getAcoesByObjetivo(objetivoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(acoesGrupo).where(eq(acoesGrupo.objetivoId, objetivoId));
}

export async function getAcoesByProjeto(projetoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(acoesGrupo).where(eq(acoesGrupo.projetoId, projetoId));
}

export async function getAcoesByStatus(status: "pendente" | "em_andamento" | "concluida" | "cancelada") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(acoesGrupo).where(eq(acoesGrupo.status, status));
}

export async function getAcoesByResponsavel(responsavel: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(acoesGrupo).where(eq(acoesGrupo.responsavel, responsavel));
}

export async function createAcaoGrupo(data: InsertAcaoGrupo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(acoesGrupo).values(data);
}

export async function updateAcaoGrupo(id: number, data: Partial<InsertAcaoGrupo>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(acoesGrupo).set(data).where(eq(acoesGrupo.id, id));
}

export async function deleteAcaoGrupo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(acoesGrupo).where(eq(acoesGrupo.id, id));
}


// ============================================
// Funções para Objetivos e Projetos por Empresa
// ============================================

export async function getObjetivosByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(objetivosGrupo).where(eq(objetivosGrupo.empresaId, empresaId));
}

export async function getProjetosByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(projetosGrupo).where(eq(projetosGrupo.empresaId, empresaId));
}


// ============================================
// Gestão de Usuários - Funções Adicionais
// ============================================

export async function getUsersWithEmpresa() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { usuarioEmpresas } = await import("../drizzle/schema");
  
  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      empresaId: usuarioEmpresas.empresaId,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(usuarioEmpresas, eq(users.id, usuarioEmpresas.usuarioId));
}

export async function getUsersByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { usuarioEmpresas } = await import("../drizzle/schema");
  
  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .innerJoin(usuarioEmpresas, eq(users.id, usuarioEmpresas.usuarioId))
    .where(eq(usuarioEmpresas.empresaId, empresaId));
}

export async function vincularUsuarioEmpresaDb(usuarioId: number, empresaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { usuarioEmpresas } = await import("../drizzle/schema");
  
  return await db.insert(usuarioEmpresas).values({
    usuarioId,
    empresaId,
  });
}

export async function desvincularUsuarioEmpresaDb(usuarioId: number, empresaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { usuarioEmpresas } = await import("../drizzle/schema");
  
  return await db
    .delete(usuarioEmpresas)
    .where(
      and(
        eq(usuarioEmpresas.usuarioId, usuarioId),
        eq(usuarioEmpresas.empresaId, empresaId)
      )
    );
}


// Atualizar dados de risco de objetivo
export async function updateObjetivoRisco(
  objetivoId: number,
  impacto: "baixo" | "medio" | "alto",
  probabilidade: "baixa" | "media" | "alta",
  metodologia?: string,
  observacoes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { objetivosGrupo } = await import("../drizzle/schema");
  
  return await db.update(objetivosGrupo)
    .set({
      impacto,
      probabilidade,
      metodologia: metodologia || "matriz_risco_padrao",
      observacoes: observacoes || null,
    })
    .where(eq(objetivosGrupo.id, objetivoId));
}

// Atualizar dados de risco de projeto
export async function updateProjetoRisco(
  projetoId: number,
  impacto: "baixo" | "medio" | "alto",
  probabilidade: "baixa" | "media" | "alta",
  metodologia?: string,
  observacoes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { projetosGrupo } = await import("../drizzle/schema");
  
  return await db.update(projetosGrupo)
    .set({
      impacto,
      probabilidade,
      metodologia: metodologia || "matriz_risco_padrao",
      observacoes: observacoes || null,
    })
    .where(eq(projetosGrupo.id, projetoId));
}


// ==================== BSC Indicadores ====================

export async function saveBscIndicadores(
  empresaId: number,
  indicadores: Array<{
    perspectiva: "financeira" | "cliente" | "processos" | "aprendizado";
    nome: string;
    meta: number;
    valorAtual?: number;
    unidade?: string;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { bscIndicadores } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  // Deletar indicadores existentes da empresa
  await db.delete(bscIndicadores).where(eq(bscIndicadores.empresaId, empresaId));

  // Inserir novos indicadores
  if (indicadores.length > 0) {
    await db.insert(bscIndicadores).values(
      indicadores.map(ind => ({
        empresaId,
        perspectiva: ind.perspectiva,
        nome: ind.nome,
        meta: ind.meta.toString(),
        valorAtual: (ind.valorAtual ?? 0).toString(),
        unidade: ind.unidade,
      }))
    );
  }

  return { success: true };
}

export async function getBscIndicadoresByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) return [];

  const { bscIndicadores } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  return await db.select().from(bscIndicadores).where(eq(bscIndicadores.empresaId, empresaId));
}

export async function getAllBscIndicadores() {
  const db = await getDb();
  if (!db) return [];

  const { bscIndicadores } = await import("../drizzle/schema");

  return await db.select().from(bscIndicadores);
}


// ========== PESTEL ==========
export async function savePestelFatores(empresaId: number, fatores: Array<{
  categoria: "politico" | "economico" | "social" | "tecnologico" | "ambiental" | "legal";
  descricao: string;
  impacto: number;
  probabilidade: number;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { pestelFatores } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  try {
    // Validar que temos fatores antes de deletar
    if (fatores.length === 0) {
      throw new Error("Nenhum fator fornecido para salvar");
    }
    
    // Validar cada fator
    for (const fator of fatores) {
      if (!fator.descricao || fator.descricao.trim().length === 0) {
        throw new Error("Descrição do fator não pode estar vazia");
      }
      if (fator.impacto < 1 || fator.impacto > 5) {
        throw new Error("Impacto deve estar entre 1 e 5");
      }
      if (fator.probabilidade < 1 || fator.probabilidade > 5) {
        throw new Error("Probabilidade deve estar entre 1 e 5");
      }
    }
    
    // Deletar fatores existentes
    await db.delete(pestelFatores).where(eq(pestelFatores.empresaId, empresaId));
    
    // Inserir novos fatores
    const result = await db.insert(pestelFatores).values(
      fatores.map(fator => ({
        empresaId,
        categoria: fator.categoria,
        descricao: fator.descricao,
        impacto: fator.impacto,
        probabilidade: fator.probabilidade,
      }))
    );
    
    if (!result) {
      throw new Error("Falha ao inserir fatores no banco de dados");
    }
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar fatores PESTEL:", error);
    throw error;
  }
}

export async function getPestelFatoresByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { pestelFatores } = await import("../drizzle/schema");
  const { eq, asc } = await import("drizzle-orm");
  
  return await db.select().from(pestelFatores).where(eq(pestelFatores.empresaId, empresaId)).orderBy(asc(pestelFatores.createdAt));
}

export async function savePestelFatorIndividual(
  empresaId: number,
  fatorId: string,
  fator: {
    categoria: "politico" | "economico" | "social" | "tecnologico" | "ambiental" | "legal";
    descricao: string;
    impacto: number;
    probabilidade: number;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { pestelFatores } = await import("../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");
  
  try {
    // Validar fator
    if (!fator.descricao || fator.descricao.trim().length === 0) {
      throw new Error("Descrição do fator não pode estar vazia");
    }
    if (fator.impacto < 1 || fator.impacto > 5) {
      throw new Error("Impacto deve estar entre 1 e 5");
    }
    if (fator.probabilidade < 1 || fator.probabilidade > 5) {
      throw new Error("Probabilidade deve estar entre 1 e 5");
    }
    
    // Verificar se fator já existe (por id numérico)
    const fatorIdNumerico = parseInt(fatorId);
    
    // Se ID é numérico e maior que 0, tentar atualizar
    if (!isNaN(fatorIdNumerico) && fatorIdNumerico > 0) {
      const fatorExistente = await db.select().from(pestelFatores)
        .where(and(
          eq(pestelFatores.id, fatorIdNumerico),
          eq(pestelFatores.empresaId, empresaId)
        ))
        .limit(1);
      
      if (fatorExistente.length > 0) {
        // Atualizar fator existente
        await db.update(pestelFatores)
          .set({
            categoria: fator.categoria,
            descricao: fator.descricao,
            impacto: fator.impacto,
            probabilidade: fator.probabilidade,
          })
          .where(and(
            eq(pestelFatores.id, fatorIdNumerico),
            eq(pestelFatores.empresaId, empresaId)
          ));
        
        return { success: true, action: "updated" };
      }
    }
    
    // Inserir novo fator (ID é string ou fator não existe)
    await db.insert(pestelFatores).values({
      empresaId,
      categoria: fator.categoria,
      descricao: fator.descricao,
      impacto: fator.impacto,
      probabilidade: fator.probabilidade,
    });
    
    return { success: true, action: "created" };
  } catch (error) {
    console.error("Erro ao salvar fator PESTEL individual:", error);
    throw error;
  }
}


// ========== SWOT ==========
export async function saveSwotItems(empresaId: number, items: Array<{
  tipo: "forca" | "fraqueza" | "oportunidade" | "ameaca";
  descricao: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { analiseSwoTtows } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  // Deletar itens existentes
  await db.delete(analiseSwoTtows).where(eq(analiseSwoTtows.empresaId, empresaId));
  
  // Inserir novos itens
  if (items.length > 0) {
    await db.insert(analiseSwoTtows).values(
      items.map(item => ({
        empresaId,
        tipo: item.tipo,
        descricao: item.descricao,
      }))
    );
  }
  
  return { success: true };
}

export async function getSwotItemsByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { analiseSwoTtows } = await import("../drizzle/schema");
  const { eq, asc } = await import("drizzle-orm");
  
  return await db.select().from(analiseSwoTtows).where(eq(analiseSwoTtows.empresaId, empresaId)).orderBy(asc(analiseSwoTtows.createdAt));
}


// ========== OKR ==========
export async function saveOkrObjectives(empresaId: number, objectives: Array<{
  objetivo: string;
  descricao: string;
  resultadoChave1?: string;
  metaResultado1?: string;
  resultadoChave2?: string;
  metaResultado2?: string;
  resultadoChave3?: string;
  metaResultado3?: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { analiseOkr } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  // Deletar objetivos existentes
  await db.delete(analiseOkr).where(eq(analiseOkr.empresaId, empresaId));
  
  // Inserir novos objetivos
  if (objectives.length > 0) {
    await db.insert(analiseOkr).values(
      objectives.map(obj => ({
        empresaId,
        objetivo: obj.objetivo,
        descricao: obj.descricao,
        resultadoChave1: obj.resultadoChave1 || null,
        metaResultado1: obj.metaResultado1 || null,
        resultadoChave2: obj.resultadoChave2 || null,
        metaResultado2: obj.metaResultado2 || null,
        resultadoChave3: obj.resultadoChave3 || null,
        metaResultado3: obj.metaResultado3 || null,
      }))
    );
  }
  
  return { success: true };
}

export async function getOkrObjectivesByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { analiseOkr } = await import("../drizzle/schema");
  const { eq, asc } = await import("drizzle-orm");
  
  return await db.select().from(analiseOkr).where(eq(analiseOkr.empresaId, empresaId)).orderBy(asc(analiseOkr.createdAt));
}


// ============= TEMPLATE CONFIGS =============

export async function getTemplateConfig(empresaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { templateConfigs } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const result = await db.select().from(templateConfigs).where(eq(templateConfigs.empresaId, empresaId)).limit(1);
  return result[0] || null;
}

export async function saveTemplateConfig(config: {
  empresaId: number;
  logoUrl?: string;
  logoKey?: string;
  corPrimaria: string;
  corSecundaria: string;
  incluirPestel: boolean;
  incluirSwot: boolean;
  incluirOkr: boolean;
  incluirBsc: boolean;
  incluirGraficos: boolean;
  incluirRecomendacoes: boolean;
  rodapePersonalizado?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { templateConfigs } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  // Verificar se já existe configuração
  const existing = await getTemplateConfig(config.empresaId);

  if (existing) {
    // Atualizar
    await db.update(templateConfigs)
      .set({
        logoUrl: config.logoUrl,
        logoKey: config.logoKey,
        corPrimaria: config.corPrimaria,
        corSecundaria: config.corSecundaria,
        incluirPestel: config.incluirPestel ? 1 : 0,
        incluirSwot: config.incluirSwot ? 1 : 0,
        incluirOkr: config.incluirOkr ? 1 : 0,
        incluirBsc: config.incluirBsc ? 1 : 0,
        incluirGraficos: config.incluirGraficos ? 1 : 0,
        incluirRecomendacoes: config.incluirRecomendacoes ? 1 : 0,
        rodapePersonalizado: config.rodapePersonalizado,
      })
      .where(eq(templateConfigs.empresaId, config.empresaId));
  } else {
    // Inserir
    await db.insert(templateConfigs).values({
      empresaId: config.empresaId,
      logoUrl: config.logoUrl,
      logoKey: config.logoKey,
      corPrimaria: config.corPrimaria,
      corSecundaria: config.corSecundaria,
      incluirPestel: config.incluirPestel ? 1 : 0,
      incluirSwot: config.incluirSwot ? 1 : 0,
      incluirOkr: config.incluirOkr ? 1 : 0,
      incluirBsc: config.incluirBsc ? 1 : 0,
      incluirGraficos: config.incluirGraficos ? 1 : 0,
      incluirRecomendacoes: config.incluirRecomendacoes ? 1 : 0,
      rodapePersonalizado: config.rodapePersonalizado,
    });
  }

  // Salvar versão no histórico
  await saveTemplateVersion(config.empresaId, config);

  return await getTemplateConfig(config.empresaId);
}


// Atualizar URL do logo no template
export async function updateTemplateLogoUrl(empresaId: number, logoUrl: string, logoKey: string) {
  const { templateConfigs } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { eq } = await import("drizzle-orm");
  
  // Verificar se já existe configuração
  const existing = await db.select().from(templateConfigs).where(eq(templateConfigs.empresaId, empresaId)).limit(1);
  
  if (existing.length > 0) {
    // Atualizar existente
    await db.update(templateConfigs)
      .set({ logoUrl, logoKey, updatedAt: new Date() })
      .where(eq(templateConfigs.empresaId, empresaId));
  } else {
    // Criar nova configuração com valores padrão
    await db.insert(templateConfigs).values({
      empresaId,
      logoUrl,
      logoKey,
      corPrimaria: "#8B1538",
      corSecundaria: "#FF6B35",
      incluirPestel: 1,
      incluirSwot: 1,
      incluirOkr: 1,
      incluirBsc: 1,
      incluirGraficos: 1,
      incluirRecomendacoes: 1,
      rodapePersonalizado: null,
    });
  }
  
  return { success: true };
}


// Salvar versão no histórico
export async function saveTemplateVersion(empresaId: number, config: any, userId?: string) {
  const { templateVersions } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { eq, desc } = await import("drizzle-orm");
  
  // Buscar último número de versão
  const lastVersion = await db.select()
    .from(templateVersions)
    .where(eq(templateVersions.empresaId, empresaId))
    .orderBy(desc(templateVersions.versionNumber))
    .limit(1);
  
  const nextVersion = lastVersion.length > 0 ? (lastVersion[0].versionNumber || 0) + 1 : 1;
  
  // Inserir nova versão
  await db.insert(templateVersions).values({
    empresaId,
    versionNumber: nextVersion,
    logoUrl: config.logoUrl || null,
    logoKey: config.logoKey || null,
    corPrimaria: config.corPrimaria,
    corSecundaria: config.corSecundaria,
    incluirPestel: config.incluirPestel ? 1 : 0,
    incluirSwot: config.incluirSwot ? 1 : 0,
    incluirOkr: config.incluirOkr ? 1 : 0,
    incluirBsc: config.incluirBsc ? 1 : 0,
    incluirGraficos: config.incluirGraficos ? 1 : 0,
    incluirRecomendacoes: config.incluirRecomendacoes ? 1 : 0,
    rodapePersonalizado: config.rodapePersonalizado || null,
    createdBy: userId || null,
  });
  
  return nextVersion;
}

// Listar versões de uma empresa
export async function listTemplateVersions(empresaId: number) {
  const { templateVersions } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) return [];
  const { eq, desc } = await import("drizzle-orm");
  
  return await db.select()
    .from(templateVersions)
    .where(eq(templateVersions.empresaId, empresaId))
    .orderBy(desc(templateVersions.versionNumber));
}

// Reverter para uma versão específica
export async function revertToTemplateVersion(empresaId: number, versionNumber: number) {
  const { templateVersions, templateConfigs } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { eq, and } = await import("drizzle-orm");
  
  // Buscar versão específica
  const version = await db.select()
    .from(templateVersions)
    .where(and(
      eq(templateVersions.empresaId, empresaId),
      eq(templateVersions.versionNumber, versionNumber)
    ))
    .limit(1);
  
  if (version.length === 0) {
    throw new Error("Versão não encontrada");
  }
  
  const v = version[0];
  
  // Atualizar configuração atual
  await db.update(templateConfigs)
    .set({
      logoUrl: v.logoUrl,
      logoKey: v.logoKey,
      corPrimaria: v.corPrimaria,
      corSecundaria: v.corSecundaria,
      incluirPestel: v.incluirPestel,
      incluirSwot: v.incluirSwot,
      incluirOkr: v.incluirOkr,
      incluirBsc: v.incluirBsc,
      incluirGraficos: v.incluirGraficos,
      incluirRecomendacoes: v.incluirRecomendacoes,
      rodapePersonalizado: v.rodapePersonalizado,
      updatedAt: new Date(),
    })
    .where(eq(templateConfigs.empresaId, empresaId));
  
  return v;
}


// ===== COMENTÁRIOS EM ANÁLISES =====

// Criar comentário
export async function createComentario(data: {
  empresaId: number;
  tipoAnalise: "pestel" | "swot" | "okr" | "bsc";
  autorId: string;
  autorNome: string;
  conteudo: string;
}) {
  const { analiseComentarios } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(analiseComentarios).values({
    empresaId: data.empresaId,
    tipoAnalise: data.tipoAnalise,
    autorId: data.autorId,
    autorNome: data.autorNome,
    conteudo: data.conteudo,
  });
  
  // Buscar o ID inserido
  const { desc } = await import("drizzle-orm");
  const inserted = await db.select().from(analiseComentarios)
    .where(eq(analiseComentarios.autorId, data.autorId))
    .orderBy(desc(analiseComentarios.createdAt))
    .limit(1);
  
  return { insertId: inserted[0]?.id || 0, ...result };
}

// Listar comentários de uma análise
export async function listComentarios(empresaId: number, tipoAnalise: "pestel" | "swot" | "okr" | "bsc") {
  const { analiseComentarios } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) return [];
  const { eq, and, desc } = await import("drizzle-orm");
  
  return await db.select()
    .from(analiseComentarios)
    .where(and(
      eq(analiseComentarios.empresaId, empresaId),
      eq(analiseComentarios.tipoAnalise, tipoAnalise)
    ))
    .orderBy(desc(analiseComentarios.createdAt));
}

// Atualizar comentário
export async function updateComentario(id: number, conteudo: string, autorId: string) {
  const { analiseComentarios } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { eq, and } = await import("drizzle-orm");
  
  // Verificar se o autor é o dono do comentário
  const comentario = await db.select()
    .from(analiseComentarios)
    .where(eq(analiseComentarios.id, id))
    .limit(1);
  
  if (comentario.length === 0) {
    throw new Error("Comentário não encontrado");
  }
  
  if (comentario[0].autorId !== autorId) {
    throw new Error("Você não tem permissão para editar este comentário");
  }
  
  await db.update(analiseComentarios)
    .set({ conteudo, updatedAt: new Date() })
    .where(eq(analiseComentarios.id, id));
  
  return { success: true };
}

// Deletar comentário
export async function deleteComentario(id: number, autorId: string) {
  const { analiseComentarios } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { eq } = await import("drizzle-orm");
  
  // Verificar se o autor é o dono do comentário
  const comentario = await db.select()
    .from(analiseComentarios)
    .where(eq(analiseComentarios.id, id))
    .limit(1);
  
  if (comentario.length === 0) {
    throw new Error("Comentário não encontrado");
  }
  
  if (comentario[0].autorId !== autorId) {
    throw new Error("Você não tem permissão para deletar este comentário");
  }
  
  await db.delete(analiseComentarios)
    .where(eq(analiseComentarios.id, id));
  
  return { success: true };
}

// Contar comentários por tipo de análise
export async function countComentarios(empresaId: number, tipoAnalise: "pestel" | "swot" | "okr" | "bsc") {
  const { analiseComentarios } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) return 0;
  const { eq, and, count } = await import("drizzle-orm");
  
  const result = await db.select({ count: count() })
    .from(analiseComentarios)
    .where(and(
      eq(analiseComentarios.empresaId, empresaId),
      eq(analiseComentarios.tipoAnalise, tipoAnalise)
    ));
  
  return result[0]?.count || 0;
}


// ============================================================================
// Usuários
// ============================================================================

/**
 * Listar todos os usuários
 */
export async function listUsers() {
  const { users } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(users);
}

// ============================================================================
// Menções em Comentários
// ============================================================================

/**
 * Extrair menções (@usuario) do texto
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return Array.from(new Set(mentions)); // Remove duplicatas
}

/**
 * Salvar menções de um comentário
 */
export async function saveMencoes(comentarioId: number, usuariosMencionados: Array<{ id: string; nome: string }>) {
  const { comentarioMencoes } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (usuariosMencionados.length === 0) return [];
  
  const mencoes = usuariosMencionados.map(u => ({
    comentarioId,
    usuarioMencionadoId: u.id,
    usuarioMencionadoNome: u.nome,
    notificado: 0,
  }));
  
  return await db.insert(comentarioMencoes).values(mencoes);
}

/**
 * Listar menções de um comentário
 */
export async function listMencoes(comentarioId: number) {
  const { comentarioMencoes } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(comentarioMencoes).where(eq(comentarioMencoes.comentarioId, comentarioId));
}

/**
 * Marcar menção como notificada
 */
export async function markMencaoNotificada(mencaoId: number) {
  const { comentarioMencoes } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(comentarioMencoes)
    .set({ notificado: 1 })
    .where(eq(comentarioMencoes.id, mencaoId));
}

// ============================================================================
// Anexos em Comentários
// ============================================================================

/**
 * Salvar anexo de um comentário
 */
export async function saveAnexo(comentarioId: number, anexo: {
  nomeArquivo: string;
  tipoArquivo: string;
  tamanhoBytes: number;
  urlS3: string;
  s3Key: string;
}) {
  const { comentarioAnexos } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(comentarioAnexos).values({
    comentarioId,
    ...anexo,
  });
  
  return result;
}

/**
 * Listar anexos de um comentário
 */
export async function listAnexos(comentarioId: number) {
  const { comentarioAnexos } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(comentarioAnexos).where(eq(comentarioAnexos.comentarioId, comentarioId));
}

/**
 * Deletar anexo
 */
export async function deleteAnexo(anexoId: number, autorId: string) {
  const { comentarioAnexos, analiseComentarios } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verificar se o usuário é o autor do comentário
  const anexo = await db.select().from(comentarioAnexos).where(eq(comentarioAnexos.id, anexoId)).limit(1);
  if (anexo.length === 0) return false;
  
  const comentario = await db.select().from(analiseComentarios).where(eq(analiseComentarios.id, anexo[0].comentarioId)).limit(1);
  if (comentario.length === 0 || comentario[0].autorId !== autorId) return false;
  
  await db.delete(comentarioAnexos).where(eq(comentarioAnexos.id, anexoId));
  return true;
}


// ========================================
// ÁREAS DE NEGÓCIO
// ========================================

export async function getAllAreasNegocio() {
  const db = await getDb();
  if (!db) return [];
  const { areasNegocio } = await import("../drizzle/schema");
  return await db.select().from(areasNegocio);
}

export async function getAreaNegocioById(id: number) {
  const db = await getDb();
  if (!db) return { id, nome: "", descricao: "", pais: "" };
  const { areasNegocio } = await import("../drizzle/schema");
  const result = await db.select().from(areasNegocio).where(eq(areasNegocio.id, id)).limit(1);
  return result.length > 0 ? result[0] : { id, nome: "", descricao: "", pais: "" };
}

export async function createAreaNegocio(data: { nome: string; descricao?: string; pais?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { areasNegocio } = await import("../drizzle/schema");
  const result = await db.insert(areasNegocio).values(data);
  return Number(result[0].insertId);
}

export async function updateAreaNegocio(id: number, data: { nome?: string; descricao?: string; pais?: string; status?: "ativa" | "inativa" }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { areasNegocio } = await import("../drizzle/schema");
  await db.update(areasNegocio).set(data).where(eq(areasNegocio.id, id));
}

export async function deleteAreaNegocio(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { areasNegocio } = await import("../drizzle/schema");
  await db.delete(areasNegocio).where(eq(areasNegocio.id, id));
}

export async function getEmpresasByAreaNegocio(areaId: number) {
  const db = await getDb();
  if (!db) return [];
  const { empresas } = await import("../drizzle/schema");
  return await db.select().from(empresas).where(eq(empresas.areaId, areaId));
}

export async function vincularEmpresaArea(empresaId: number, areaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { empresas } = await import("../drizzle/schema");
  await db.update(empresas).set({ areaId }).where(eq(empresas.id, empresaId));
}

export async function desvincularEmpresaArea(empresaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { empresas } = await import("../drizzle/schema");
  await db.update(empresas).set({ areaId: null }).where(eq(empresas.id, empresaId));
}


// ============================================
// Plano de Ação PESTEL
// ============================================

export async function savePestelPlanoAcao(data: InsertPestelPlanoAcao): Promise<PestelPlanoAcao> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(pestelPlanoAcao).values(data);
  const id = (result as any).insertId;
  
  const saved = await db.select().from(pestelPlanoAcao).where(eq(pestelPlanoAcao.id, id));
  return saved[0];
}

export async function updatePestelPlanoAcao(id: number, data: Partial<InsertPestelPlanoAcao>): Promise<PestelPlanoAcao> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(pestelPlanoAcao).set(data).where(eq(pestelPlanoAcao.id, id));
  
  const updated = await db.select().from(pestelPlanoAcao).where(eq(pestelPlanoAcao.id, id));
  return updated[0];
}

export async function deletePestelPlanoAcao(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(pestelPlanoAcao).where(eq(pestelPlanoAcao.id, id));
}

export async function getPestelPlanoAcaoByEmpresa(empresaId: number): Promise<PestelPlanoAcao[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(pestelPlanoAcao).where(eq(pestelPlanoAcao.empresaId, empresaId));
}

export async function getPestelPlanoAcaoByFator(fatorId: number): Promise<PestelPlanoAcao[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(pestelPlanoAcao).where(eq(pestelPlanoAcao.fatorId, fatorId));
}

export async function getPestelPlanoAcaoByCategoria(empresaId: number, categoria: string): Promise<PestelPlanoAcao[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(pestelPlanoAcao).where(
    and(
      eq(pestelPlanoAcao.empresaId, empresaId),
      eq(pestelPlanoAcao.categoria, categoria as any)
    )
  );
}

export async function getPestelPlanoAcaoById(id: number): Promise<PestelPlanoAcao | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(pestelPlanoAcao).where(eq(pestelPlanoAcao.id, id));
  return result[0];
}


// ============================================
// Vinculação Empresa-Área de Negócio (muitos-para-muitos)
// ============================================

export async function getEmpresasVinculadasArea(areaId: number) {
  const db = await getDb();
  if (!db) return [];
  const { empresaAreaVinculo, empresas } = await import("../drizzle/schema");
  
  const result = await db
    .select({ empresa: empresas })
    .from(empresaAreaVinculo)
    .innerJoin(empresas, eq(empresaAreaVinculo.empresaId, empresas.id))
    .where(eq(empresaAreaVinculo.areaId, areaId));
  
  return result.map(r => r.empresa);
}

export async function getAreasVinculadasEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) return [];
  const { empresaAreaVinculo, areasNegocio } = await import("../drizzle/schema");
  
  const result = await db
    .select({ area: areasNegocio })
    .from(empresaAreaVinculo)
    .innerJoin(areasNegocio, eq(empresaAreaVinculo.areaId, areasNegocio.id))
    .where(eq(empresaAreaVinculo.empresaId, empresaId));
  
  return result.map(r => r.area);
}

export async function vincularEmpresaAreaNegocio(empresaId: number, areaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { empresaAreaVinculo } = await import("../drizzle/schema");
  
  // Verificar se já existe vinculação
  const existing = await db.select().from(empresaAreaVinculo)
    .where(and(
      eq(empresaAreaVinculo.empresaId, empresaId),
      eq(empresaAreaVinculo.areaId, areaId)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0].id; // Já vinculado
  }
  
  const result = await db.insert(empresaAreaVinculo).values({ empresaId, areaId });
  return Number(result[0].insertId);
}

export async function desvincularEmpresaAreaNegocio(empresaId: number, areaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { empresaAreaVinculo } = await import("../drizzle/schema");
  
  await db.delete(empresaAreaVinculo)
    .where(and(
      eq(empresaAreaVinculo.empresaId, empresaId),
      eq(empresaAreaVinculo.areaId, areaId)
    ));
}

export async function getEmpresasNaoVinculadasArea(areaId: number) {
  const db = await getDb();
  if (!db) return [];
  const { empresas, empresaAreaVinculo } = await import("../drizzle/schema");
  const { notInArray } = await import("drizzle-orm");
  
  // Buscar IDs de empresas já vinculadas a esta área
  const vinculadas = await db.select({ empresaId: empresaAreaVinculo.empresaId })
    .from(empresaAreaVinculo)
    .where(eq(empresaAreaVinculo.areaId, areaId));
  
  const idsVinculados = vinculadas.map(v => v.empresaId);
  
  // Buscar todas as empresas que NÃO estão vinculadas
  if (idsVinculados.length > 0) {
    return await db.select().from(empresas).where(notInArray(empresas.id, idsVinculados));
  }
  
  return await db.select().from(empresas);
}

// ─── Analises estrategicas genericas (5 Forcas, Stakeholders, VRIO) ───
export async function saveAnaliseGenerica(empresaId: number, tipo: string, dados: unknown) {
  const db = await getDb();
  if (!db) return;
  const { analisesEstrategicas } = await import("../drizzle/schema");
  await db
    .insert(analisesEstrategicas)
    .values({ empresaId, tipo, dados: dados as any })
    .onDuplicateKeyUpdate({ set: { dados: dados as any } });
}

export async function getAnaliseGenerica(empresaId: number, tipo: string) {
  const db = await getDb();
  if (!db) return null;
  const { analisesEstrategicas } = await import("../drizzle/schema");
  const { and, eq } = await import("drizzle-orm");
  const rows = await db
    .select()
    .from(analisesEstrategicas)
    .where(and(eq(analisesEstrategicas.empresaId, empresaId), eq(analisesEstrategicas.tipo, tipo)));
  return (rows[0]?.dados as Record<string, unknown> | undefined) ?? null;
}
