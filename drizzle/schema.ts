import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "gestor"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Empresas do grupo
 */
export const empresas = mysqlTable("empresas", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipoAtuacao: mysqlEnum("tipoAtuacao", ["servicos", "produtos", "servicos_produtos"]).notNull(),
  status: mysqlEnum("status", ["ativa", "inativa"]).default("ativa").notNull(),
  observacoes: text("observacoes"),
  logoUrl: text("logoUrl"),
  logoKey: text("logoKey"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Empresa = typeof empresas.$inferSelect;
export type InsertEmpresa = typeof empresas.$inferInsert;

/**
 * Vinculação de usuários a empresas
 */
export const usuarioEmpresas = mysqlTable("usuario_empresas", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull(),
  empresaId: int("empresaId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UsuarioEmpresa = typeof usuarioEmpresas.$inferSelect;
export type InsertUsuarioEmpresa = typeof usuarioEmpresas.$inferInsert;

/**
 * Identidade Organizacional por empresa
 */
export const identidadeOrganizacional = mysqlTable("identidade_organizacional", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull().unique(),
  missao: text("missao"),
  visao: text("visao"),
  valores: text("valores"),
  politica: text("politica"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IdentidadeOrganizacional = typeof identidadeOrganizacional.$inferSelect;
export type InsertIdentidadeOrganizacional = typeof identidadeOrganizacional.$inferInsert;

/**
 * Histórico de faturamento para análise de cenário
 */
export const historicoFaturamento = mysqlTable("historico_faturamento", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  ano: int("ano").notNull(),
  mes: int("mes").notNull(),
  faturamento: decimal("faturamento", { precision: 15, scale: 2 }).notNull(),
  numeroClientes: int("numeroClientes"),
  ticketMedio: decimal("ticketMedio", { precision: 15, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HistoricoFaturamento = typeof historicoFaturamento.$inferSelect;
export type InsertHistoricoFaturamento = typeof historicoFaturamento.$inferInsert;

/**
 * Produtos/Serviços da empresa
 */
export const produtos = mysqlTable("produtos", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", ["produto", "servico"]).notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Produto = typeof produtos.$inferSelect;
export type InsertProduto = typeof produtos.$inferInsert;

/**
 * Canais de venda
 */
export const canais = mysqlTable("canais", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 100 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Canal = typeof canais.$inferSelect;
export type InsertCanal = typeof canais.$inferInsert;

/**
 * Objetivos estratégicos
 */
export const objetivos = mysqlTable("objetivos", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  ano: int("ano").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Objetivo = typeof objetivos.$inferSelect;
export type InsertObjetivo = typeof objetivos.$inferInsert;

/**
 * Metas estratégicas
 */
export const metas = mysqlTable("metas", {
  id: int("id").autoincrement().primaryKey(),
  objetivoId: int("objetivoId").notNull(),
  ano: int("ano").notNull(),
  metaAnual: decimal("metaAnual", { precision: 15, scale: 2 }).notNull(),
  tipo: mysqlEnum("tipo", ["faturamento", "clientes", "producao", "outros"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Meta = typeof metas.$inferSelect;
export type InsertMeta = typeof metas.$inferInsert;

/**
 * Desdobramento de metas por produto/canal
 */
export const desdobramentoMetas = mysqlTable("desdobramento_metas", {
  id: int("id").autoincrement().primaryKey(),
  metaId: int("metaId").notNull(),
  produtoId: int("produtoId"),
  canalId: int("canalId"),
  percentual: decimal("percentual", { precision: 5, scale: 2 }),
  valorMeta: decimal("valorMeta", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DesdobramentoMeta = typeof desdobramentoMetas.$inferSelect;
export type InsertDesdobramentoMeta = typeof desdobramentoMetas.$inferInsert;

/**
 * KPIs estratégicos
 */
export const kpis = mysqlTable("kpis", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  objetivoId: int("objetivoId"),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  area: varchar("area", { length: 100 }),
  responsavelId: int("responsavelId"),
  unidadeMedida: varchar("unidadeMedida", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Kpi = typeof kpis.$inferSelect;
export type InsertKpi = typeof kpis.$inferInsert;

/**
 * Valores mensais de KPIs
 */
export const kpiValores = mysqlTable("kpi_valores", {
  id: int("id").autoincrement().primaryKey(),
  kpiId: int("kpiId").notNull(),
  ano: int("ano").notNull(),
  mes: int("mes").notNull(),
  meta: decimal("meta", { precision: 15, scale: 2 }),
  realizado: decimal("realizado", { precision: 15, scale: 2 }),
  percentualAtingimento: decimal("percentualAtingimento", { precision: 5, scale: 2 }),
  statusRag: mysqlEnum("statusRag", ["verde", "amarelo", "vermelho"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KpiValor = typeof kpiValores.$inferSelect;
export type InsertKpiValor = typeof kpiValores.$inferInsert;

/**
 * Projetos estratégicos
 */
export const projetos = mysqlTable("projetos", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  objetivoId: int("objetivoId"),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  area: varchar("area", { length: 100 }),
  responsavelId: int("responsavelId"),
  dataInicio: date("dataInicio"),
  dataFim: date("dataFim"),
  status: mysqlEnum("status", ["planejado", "em_andamento", "concluido", "cancelado"]).default("planejado").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Projeto = typeof projetos.$inferSelect;
export type InsertProjeto = typeof projetos.$inferInsert;

/**
 * Iniciativas estratégicas
 */
export const iniciativas = mysqlTable("iniciativas", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  projetoId: int("projetoId"),
  objetivoId: int("objetivoId"),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  area: varchar("area", { length: 100 }),
  responsavelId: int("responsavelId"),
  dataInicio: date("dataInicio"),
  dataFim: date("dataFim"),
  status: mysqlEnum("status", ["planejado", "em_andamento", "concluido", "cancelado"]).default("planejado").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Iniciativa = typeof iniciativas.$inferSelect;
export type InsertIniciativa = typeof iniciativas.$inferInsert;

/**
 * Plano de ação
 */
export const acoes = mysqlTable("acoes", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  projetoId: int("projetoId"),
  kpiId: int("kpiId"),
  descricao: text("descricao").notNull(),
  responsavelId: int("responsavelId"),
  prazo: date("prazo"),
  status: mysqlEnum("status", ["a_iniciar", "em_andamento", "concluida", "atrasada", "cancelada"]).default("a_iniciar").notNull(),
  custo: decimal("custo", { precision: 15, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Acao = typeof acoes.$inferSelect;
export type InsertAcao = typeof acoes.$inferInsert;

/**
 * Ciclos de gestão (períodos)
 */
export const ciclos = mysqlTable("ciclos", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId"),
  tipo: mysqlEnum("tipo", ["mensal", "anual"]).notNull(),
  ano: int("ano").notNull(),
  mes: int("mes"),
  fechado: boolean("fechado").default(false).notNull(),
  dataFechamento: timestamp("dataFechamento"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ciclo = typeof ciclos.$inferSelect;
export type InsertCiclo = typeof ciclos.$inferInsert;

/**
 * Trilha de auditoria
 */
export const auditoria = mysqlTable("auditoria", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull(),
  tabela: varchar("tabela", { length: 100 }).notNull(),
  registroId: int("registroId").notNull(),
  acao: mysqlEnum("acao", ["criar", "atualizar", "deletar"]).notNull(),
  valorAnterior: text("valorAnterior"),
  valorNovo: text("valorNovo"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type Auditoria = typeof auditoria.$inferSelect;
export type InsertAuditoria = typeof auditoria.$inferInsert;
