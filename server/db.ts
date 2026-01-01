import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, type InsertEmpresa } from "../drizzle/schema";
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
