import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, type InsertEmpresa, kpiValores, kpis, objetivosGrupo, type InsertObjetivoGrupo, objetivoGrupoKpis, projetosGrupo, type InsertProjetoGrupo, projetoGrupoKpis, acoesGrupo, type InsertAcaoGrupo } from "../drizzle/schema";
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
  if (!db) return undefined;
  const { empresas } = await import("../drizzle/schema");
  const result = await db.select().from(empresas).where(eq(empresas.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
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

// Identidade Organizacional
export async function getIdentidadeByEmpresa(empresaId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { identidadeOrganizacional } = await import("../drizzle/schema");
  const result = await db.select().from(identidadeOrganizacional).where(eq(identidadeOrganizacional.empresaId, empresaId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
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
  if (!db) return null;
  
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
  if (!db) return undefined;
  
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
  
  return result.length > 0 ? result[0] : undefined;
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
