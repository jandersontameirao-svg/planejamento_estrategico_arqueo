import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, date, tinyint, bigint, json, index, unique } from "drizzle-orm/mysql-core";

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
 * Áreas de Negócio (ex: Grupo Arqueo Brasil, Grupo Arqueo LATAM)
 */
export const areasNegocio = mysqlTable("areas_negocio", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  pais: varchar("pais", { length: 100 }),
  status: mysqlEnum("status", ["ativa", "inativa"]).default("ativa").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AreaNegocio = typeof areasNegocio.$inferSelect;
export type InsertAreaNegocio = typeof areasNegocio.$inferInsert;

/**
 * Empresas do grupo (vinculadas a uma área de negócio)
 */
export const empresas = mysqlTable("empresas", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipoAtuacao: mysqlEnum("tipoAtuacao", ["servicos", "produtos", "servicos_produtos"]).notNull(),
  status: mysqlEnum("status", ["ativa", "inativa"]).default("ativa").notNull(),
  areaId: int("areaId"),
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
  perspectivaBSC: mysqlEnum("perspectivaBSC", ["financeira", "clientes", "processos", "aprendizado"]),
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
  empresaId: int("empresaId"), // null = KPI do Grupo
  objetivoId: int("objetivoId"),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  area: varchar("area", { length: 100 }),
  responsavelId: int("responsavelId"),
  responsavel: varchar("responsavel", { length: 255 }),
  unidadeMedida: varchar("unidadeMedida", { length: 50 }),
  tipo: mysqlEnum("tipo", ["financeiro", "operacional", "cliente", "processo"]).default("financeiro"),
  frequencia: mysqlEnum("frequencia", ["mensal", "trimestral", "anual"]).default("mensal"),
  perspectivaBSC: mysqlEnum("perspectivaBSC", ["financeira", "clientes", "processos", "aprendizado"]),
  ativo: boolean("ativo").default(true),
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

/**
 * Identidade Organizacional do Grupo Arqueo
 */
export const identidadeGrupo = mysqlTable("identidade_grupo", {
  id: int("id").autoincrement().primaryKey(),
  missao: text("missao"),
  visao: text("visao"),
  valores: text("valores"),
  politica: text("politica"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IdentidadeGrupo = typeof identidadeGrupo.$inferSelect;
export type InsertIdentidadeGrupo = typeof identidadeGrupo.$inferInsert;

/**
 * Objetivos Estratégicos do Grupo
 */
export const objetivosGrupo = mysqlTable("objetivos_grupo", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId"), // NULL = grupo, NOT NULL = empresa específica
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  perspectivaBSC: mysqlEnum("perspectivaBSC", ["financeira", "clientes", "processos", "aprendizado"]),
  prazo: date("prazo"),
  status: mysqlEnum("status", ["planejado", "em_andamento", "concluido", "cancelado"]).default("planejado"),
  impacto: mysqlEnum("impacto", ["baixo", "medio", "alto"]).default("medio"),
  probabilidade: mysqlEnum("probabilidade", ["baixa", "media", "alta"]).default("media"),
  metodologia: varchar("metodologia", { length: 100 }).default("matriz_risco_padrao"), // matriz_risco_padrao, iso31000, coso, etc
  observacoes: text("observacoes"), // Observações sobre como deve ser utilizado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ObjetivoGrupo = typeof objetivosGrupo.$inferSelect;
export type InsertObjetivoGrupo = typeof objetivosGrupo.$inferInsert;

/**
 * Projetos Estratégicos do Grupo
 */
export const projetosGrupo = mysqlTable("projetos_grupo", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId"), // NULL = grupo, NOT NULL = empresa específica
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  objetivoId: int("objetivoId"), // vinculado a objetivos_grupo
  area: varchar("area", { length: 100 }),
  responsavel: varchar("responsavel", { length: 255 }),
  dataInicio: date("dataInicio"),
  dataFim: date("dataFim"),
  status: mysqlEnum("status", ["planejado", "em_andamento", "concluido", "cancelado"]).default("planejado").notNull(),
  impacto: mysqlEnum("impacto", ["baixo", "medio", "alto"]).default("medio"),
  probabilidade: mysqlEnum("probabilidade", ["baixa", "media", "alta"]).default("media"),
  metodologia: varchar("metodologia", { length: 100 }).default("matriz_risco_padrao"), // matriz_risco_padrao, iso31000, coso, etc
  observacoes: text("observacoes"), // Observações sobre como deve ser utilizado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjetoGrupo = typeof projetosGrupo.$inferSelect;
export type InsertProjetoGrupo = typeof projetosGrupo.$inferInsert;

/**
 * Vinculação de Projetos do Grupo a KPIs
 */
export const projetoGrupoKpis = mysqlTable("projeto_grupo_kpis", {
  id: int("id").autoincrement().primaryKey(),
  projetoId: int("projetoId").notNull(),
  kpiId: int("kpiId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjetoGrupoKpi = typeof projetoGrupoKpis.$inferSelect;
export type InsertProjetoGrupoKpi = typeof projetoGrupoKpis.$inferInsert;

/**
 * Vinculação de Objetivos do Grupo a KPIs
 */
export const objetivoGrupoKpis = mysqlTable("objetivo_grupo_kpis", {
  id: int("id").autoincrement().primaryKey(),
  objetivoId: int("objetivoId").notNull(),
  kpiId: int("kpiId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ObjetivoGrupoKpi = typeof objetivoGrupoKpis.$inferSelect;
export type InsertObjetivoGrupoKpi = typeof objetivoGrupoKpis.$inferInsert;


/**
 * Plano de Ação - Ações vinculadas a Objetivos e Projetos
 */
export const acoesGrupo = mysqlTable("acoes_grupo", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(), // Cada ação pertence a uma empresa
  descricao: text("descricao").notNull(),
  responsavel: varchar("responsavel", { length: 255 }),
  prazo: date("prazo"),
  custo: decimal("custo", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["pendente", "em_andamento", "concluida", "cancelada"]).default("pendente"),
  objetivoId: int("objetivoId"), // Vinculação opcional a objetivo
  projetoId: int("projetoId"), // Vinculação opcional a projeto
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AcaoGrupo = typeof acoesGrupo.$inferSelect;
export type InsertAcaoGrupo = typeof acoesGrupo.$inferInsert;


/**
 * Análise PESTEL - Fatores Externos
 */
export const analisePestel = mysqlTable("analise_pestel", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  // Político
  politico: text("politico"),
  // Econômico
  economico: text("economico"),
  // Social
  social: text("social"),
  // Tecnológico
  tecnologico: text("tecnologico"),
  // Ambiental
  ambiental: text("ambiental"),
  // Legal
  legal: text("legal"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnalisePestel = typeof analisePestel.$inferSelect;
export type InsertAnalisePestel = typeof analisePestel.$inferInsert;

/**
 * PESTEL Fatores (nova estrutura)
 */
export const pestelFatores = mysqlTable("pestel_fatores", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  categoria: mysqlEnum("categoria", ["politico", "economico", "social", "tecnologico", "ambiental", "legal"]).notNull(),
  descricao: text("descricao").notNull(),
  impacto: int("impacto").notNull(), // 1-5
  probabilidade: int("probabilidade").notNull(), // 1-5
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PestelFator = typeof pestelFatores.$inferSelect;
export type InsertPestelFator = typeof pestelFatores.$inferInsert;

/**
 * 5 Forças de Porter
 */
export const cincoForcasPorter = mysqlTable("cinco_forcas_porter", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  // Ameaça de Novos Entrantes
  ameacaNovoEntrantes: text("ameaca_novo_entrantes"),
  intensidadeNovoEntrantes: mysqlEnum("intensidade_novo_entrantes", ["baixa", "media", "alta"]).default("media"),
  // Poder de Barganha dos Fornecedores
  poderFornecedores: text("poder_fornecedores"),
  intensidadeFornecedores: mysqlEnum("intensidade_fornecedores", ["baixa", "media", "alta"]).default("media"),
  // Poder de Barganha dos Clientes
  poderClientes: text("poder_clientes"),
  intensidadeClientes: mysqlEnum("intensidade_clientes", ["baixa", "media", "alta"]).default("media"),
  // Ameaça de Produtos Substitutos
  ameacaSubstitutos: text("ameaca_substitutos"),
  intensidadeSubstitutos: mysqlEnum("intensidade_substitutos", ["baixa", "media", "alta"]).default("media"),
  // Rivalidade entre Competidores
  rivalidadeCompetidores: text("rivalidade_competidores"),
  intensidadeRivalidade: mysqlEnum("intensidade_rivalidade", ["baixa", "media", "alta"]).default("media"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CincoForcasPorter = typeof cincoForcasPorter.$inferSelect;
export type InsertCincoForcasPorter = typeof cincoForcasPorter.$inferInsert;

/**
 * Análise de Stakeholders
 */
export const analiseStakeholders = mysqlTable("analise_stakeholders", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  poder: mysqlEnum("poder", ["baixo", "medio", "alto"]).default("medio"),
  interesse: mysqlEnum("interesse", ["baixo", "medio", "alto"]).default("medio"),
  estrategia: text("estrategia"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnaliseStakeholders = typeof analiseStakeholders.$inferSelect;
export type InsertAnaliseStakeholders = typeof analiseStakeholders.$inferInsert;

/**
 * RBV/VRIO - Análise de Recursos e Capacidades
 */
export const analiseRbvVrio = mysqlTable("analise_rbv_vrio", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  recurso: varchar("recurso", { length: 255 }).notNull(),
  descricao: text("descricao"),
  // VRIO: Valioso, Raro, Inimitável, Organizado
  valioso: boolean("valioso").default(false),
  raro: boolean("raro").default(false),
  inimitavel: boolean("inimitavel").default(false),
  organizado: boolean("organizado").default(false),
  vantagem: mysqlEnum("vantagem", ["desvantagem", "paridade", "vantagem_temporaria", "vantagem_sustentavel"]).default("paridade"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnaliseRbvVrio = typeof analiseRbvVrio.$inferSelect;
export type InsertAnaliseRbvVrio = typeof analiseRbvVrio.$inferInsert;

/**
 * SWOT/TOWS - Análise de Forças, Fraquezas, Oportunidades e Ameaças
 */
export const analiseSwoTtows = mysqlTable("analise_swot_tows", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  tipo: mysqlEnum("tipo", ["forca", "fraqueza", "oportunidade", "ameaca"]).notNull(),
  descricao: text("descricao").notNull(),
  impacto: mysqlEnum("impacto", ["baixo", "medio", "alto"]).default("medio"),
  estrategia: text("estrategia"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnaliseSwoTtows = typeof analiseSwoTtows.$inferSelect;
export type InsertAnaliseSwoTtows = typeof analiseSwoTtows.$inferInsert;

/**
 * OKR - Objetivos e Resultados-Chave
 */
export const analiseOkr = mysqlTable("analise_okr", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  objetivo: varchar("objetivo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  // Resultados-Chave
  resultadoChave1: text("resultado_chave_1"),
  metaResultado1: varchar("meta_resultado_1", { length: 255 }),
  statusResultado1: mysqlEnum("status_resultado_1", ["nao_iniciado", "em_progresso", "concluido", "cancelado"]).default("nao_iniciado"),
  
  resultadoChave2: text("resultado_chave_2"),
  metaResultado2: varchar("meta_resultado_2", { length: 255 }),
  statusResultado2: mysqlEnum("status_resultado_2", ["nao_iniciado", "em_progresso", "concluido", "cancelado"]).default("nao_iniciado"),
  
  resultadoChave3: text("resultado_chave_3"),
  metaResultado3: varchar("meta_resultado_3", { length: 255 }),
  statusResultado3: mysqlEnum("status_resultado_3", ["nao_iniciado", "em_progresso", "concluido", "cancelado"]).default("nao_iniciado"),
  
  periodo: varchar("periodo", { length: 100 }),
  progresso: int("progresso").default(0),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnaliseOkr = typeof analiseOkr.$inferSelect;
export type InsertAnaliseOkr = typeof analiseOkr.$inferInsert;


/**
 * VRIO - Análise Detalhada de Recursos (Valor, Raridade, Imitabilidade, Organização)
 */
export const analiseVrio = mysqlTable("analise_vrio", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  recursoNome: varchar("recurso_nome", { length: 255 }).notNull(),
  valor: int("valor").notNull(), // 0-5
  raridade: int("raridade").notNull(), // 0-5
  imitabilidade: int("imitabilidade").notNull(), // 0-5
  organizacao: int("organizacao").notNull(), // 0-5
  media: decimal("media", { precision: 3, scale: 2 }).notNull(),
  classificacao: mysqlEnum("classificacao", [
    "vantagem_sustentavel",
    "vantagem_temporaria",
    "paridade_competitiva",
    "desvantagem"
  ]).notNull(),
  recomendacoes: text("recomendacoes"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnaliseVrio = typeof analiseVrio.$inferSelect;
export type InsertAnaliseVrio = typeof analiseVrio.$inferInsert;

/**
 * Indicadores do Balanced Scorecard por empresa
 */
export const bscIndicadores = mysqlTable("bsc_indicadores", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  perspectiva: mysqlEnum("perspectiva", ["financeira", "cliente", "processos", "aprendizado"]).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  meta: decimal("meta", { precision: 15, scale: 2 }).notNull(),
  valorAtual: decimal("valorAtual", { precision: 15, scale: 2 }).default("0"),
  unidade: varchar("unidade", { length: 50 }), // %, R$, unidades, etc
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BscIndicador = typeof bscIndicadores.$inferSelect;
export type InsertBscIndicador = typeof bscIndicadores.$inferInsert;

/**
 * Configurações de templates personalizados para relatórios PDF
 */
export const templateConfigs = mysqlTable("template_configs", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  logoUrl: text("logoUrl"),
  logoKey: text("logoKey"),
  corPrimaria: varchar("corPrimaria", { length: 7 }).default("#8B1538").notNull(), // Bordo
  corSecundaria: varchar("corSecundaria", { length: 7 }).default("#FF6B35").notNull(), // Laranja
  incluirPestel: tinyint("incluirPestel").default(1).notNull(),
  incluirSwot: tinyint("incluirSwot").default(1).notNull(),
  incluirOkr: tinyint("incluirOkr").default(1).notNull(),
  incluirBsc: tinyint("incluirBsc").default(1).notNull(),
  incluirGraficos: tinyint("incluirGraficos").default(1).notNull(),
  incluirRecomendacoes: tinyint("incluirRecomendacoes").default(1).notNull(),
  rodapePersonalizado: text("rodapePersonalizado"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TemplateConfig = typeof templateConfigs.$inferSelect;
export type InsertTemplateConfig = typeof templateConfigs.$inferInsert;

/**
 * Histórico de versões de configurações de templates
 */
export const templateVersions = mysqlTable("template_versions", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  versionNumber: int("versionNumber").notNull(),
  logoUrl: text("logoUrl"),
  logoKey: text("logoKey"),
  corPrimaria: varchar("corPrimaria", { length: 7 }).notNull(),
  corSecundaria: varchar("corSecundaria", { length: 7 }).notNull(),
  incluirPestel: tinyint("incluirPestel").default(1).notNull(),
  incluirSwot: tinyint("incluirSwot").default(1).notNull(),
  incluirOkr: tinyint("incluirOkr").default(1).notNull(),
  incluirBsc: tinyint("incluirBsc").default(1).notNull(),
  incluirGraficos: tinyint("incluirGraficos").default(1).notNull(),
  incluirRecomendacoes: tinyint("incluirRecomendacoes").default(1).notNull(),
  rodapePersonalizado: text("rodapePersonalizado"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: varchar("createdBy", { length: 255 }),
});

export type TemplateVersion = typeof templateVersions.$inferSelect;
export type InsertTemplateVersion = typeof templateVersions.$inferInsert;

/**
 * Comentários colaborativos em análises estratégicas
 */
export const analiseComentarios = mysqlTable("analise_comentarios", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  tipoAnalise: mysqlEnum("tipoAnalise", ["pestel", "swot", "okr", "bsc"]).notNull(),
  autorId: varchar("autorId", { length: 64 }).notNull(),
  autorNome: varchar("autorNome", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnaliseComentario = typeof analiseComentarios.$inferSelect;
export type InsertAnaliseComentario = typeof analiseComentarios.$inferInsert;

/**
 * Menções em comentários (@usuário)
 */
export const comentarioMencoes = mysqlTable("comentario_mencoes", {
  id: int("id").autoincrement().primaryKey(),
  comentarioId: int("comentarioId").notNull(),
  usuarioMencionadoId: varchar("usuarioMencionadoId", { length: 64 }).notNull(),
  usuarioMencionadoNome: varchar("usuarioMencionadoNome", { length: 255 }).notNull(),
  notificado: tinyint("notificado").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ComentarioMencao = typeof comentarioMencoes.$inferSelect;
export type InsertComentarioMencao = typeof comentarioMencoes.$inferInsert;

/**
 * Anexos em comentários (arquivos no S3)
 */
export const comentarioAnexos = mysqlTable("comentario_anexos", {
  id: int("id").autoincrement().primaryKey(),
  comentarioId: int("comentarioId").notNull(),
  nomeArquivo: varchar("nomeArquivo", { length: 255 }).notNull(),
  tipoArquivo: varchar("tipoArquivo", { length: 100 }).notNull(),
  tamanhoBytes: int("tamanhoBytes").notNull(),
  urlS3: text("urlS3").notNull(),
  s3Key: text("s3Key").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ComentarioAnexo = typeof comentarioAnexos.$inferSelect;
export type InsertComentarioAnexo = typeof comentarioAnexos.$inferInsert;

/**
 * Plano de Ação para PESTEL - Prevenção, Proteção e Mitigação de Riscos
 */
export const pestelPlanoAcao = mysqlTable("pestel_plano_acao", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  fatorId: int("fatorId").notNull(), // Referência ao fator PESTEL
  categoria: mysqlEnum("categoria", ["politico", "economico", "social", "tecnologico", "ambiental", "legal"]).notNull(),
  
  // Estratégia de resposta
  estrategia: mysqlEnum("estrategia", ["prevencao", "protecao", "mitigacao"]).notNull(),
  descricaoEstrategia: text("descricaoEstrategia").notNull(),
  
  // Priorização
  urgencia: int("urgencia").notNull(), // 1-5
  importancia: int("importancia").notNull(), // 1-5
  
  // Responsável e Cronograma
  responsavel: varchar("responsavel", { length: 255 }),
  dataInicio: date("dataInicio"),
  dataFim: date("dataFim"),
  
  // Status
  status: mysqlEnum("status", ["planejado", "em_progresso", "concluido", "cancelado"]).default("planejado").notNull(),
  percentualConclusao: int("percentualConclusao").default(0).notNull(),
  
  // Observações
  observacoes: text("observacoes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PestelPlanoAcao = typeof pestelPlanoAcao.$inferSelect;
export type InsertPestelPlanoAcao = typeof pestelPlanoAcao.$inferInsert;


/**
 * Vinculação de Empresas às Áreas de Negócio (muitos-para-muitos)
 * Permite que empresas do repositório sejam vinculadas a múltiplas áreas de negócio
 */
export const empresaAreaVinculo = mysqlTable("empresa_area_vinculo", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  areaId: int("areaId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmpresaAreaVinculo = typeof empresaAreaVinculo.$inferSelect;
export type InsertEmpresaAreaVinculo = typeof empresaAreaVinculo.$inferInsert;

// ============================================================
// MÓDULO DE GESTÃO ORÇAMENTÁRIA EMPRESARIAL
// ============================================================

/**
 * Configurações globais do módulo orçamentário
 */
export const orcamentoConfiguracoes = mysqlTable("orcamento_configuracoes", {
  id: int("id").autoincrement().primaryKey(),
  moedaConsolidacaoGlobal: varchar("moedaConsolidacaoGlobal", { length: 10 }).default("BRL").notNull(),
  permitirEdicaoPosCongelamento: tinyint("permitirEdicaoPosCongelamento").default(0).notNull(),
  toleranciaAlertaPercentual: decimal("toleranciaAlertaPercentual", { precision: 5, scale: 2 }).default("10.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type OrcamentoConfiguracao = typeof orcamentoConfiguracoes.$inferSelect;
export type InsertOrcamentoConfiguracao = typeof orcamentoConfiguracoes.$inferInsert;

/**
 * Categorias orçamentárias (ex: Receita Operacional, Custos Diretos)
 */
export const orcamentoCategorias = mysqlTable("orcamento_categorias", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipo: mysqlEnum("tipo", ["receita", "custo", "despesa", "investimento", "outro"]).default("outro").notNull(),
  ativo: tinyint("ativo").default(1).notNull(),
  ordem: int("ordem").default(0).notNull(),
  escopoTipo: mysqlEnum("escopoTipo", ["global", "empresa"]).default("global").notNull(),
  observacao: text("observacao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type OrcamentoCategoria = typeof orcamentoCategorias.$inferSelect;
export type InsertOrcamentoCategoria = typeof orcamentoCategorias.$inferInsert;

/**
 * Subcategorias orçamentárias vinculadas a categorias
 */
export const orcamentoSubcategorias = mysqlTable("orcamento_subcategorias", {
  id: int("id").autoincrement().primaryKey(),
  categoriaId: int("categoriaId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  ativo: tinyint("ativo").default(1).notNull(),
  ordem: int("ordem").default(0).notNull(),
  observacao: text("observacao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type OrcamentoSubcategoria = typeof orcamentoSubcategorias.$inferSelect;
export type InsertOrcamentoSubcategoria = typeof orcamentoSubcategorias.$inferInsert;

/**
 * Versões orçamentárias por empresa e ano
 */
export const orcamentoVersoes = mysqlTable("orcamento_versoes", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  ano: int("ano").notNull(),
  nomeVersao: varchar("nomeVersao", { length: 255 }).notNull(),
  numeroVersao: int("numeroVersao").default(1).notNull(),
  status: mysqlEnum("status", ["rascunho", "em_revisao", "aprovado", "congelado"]).default("rascunho").notNull(),
  moedaBase: varchar("moedaBase", { length: 10 }).default("BRL").notNull(),
  observacoes: text("observacoes"),
  criadoPor: int("criadoPor"),
  aprovadoPor: int("aprovadoPor"),
  dataAprovacao: timestamp("dataAprovacao"),
  versaoOrigemId: int("versaoOrigemId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type OrcamentoVersao = typeof orcamentoVersoes.$inferSelect;
export type InsertOrcamentoVersao = typeof orcamentoVersoes.$inferInsert;

/**
 * Linhas do orçamento planejado (grade mensal por categoria/subcategoria)
 */
export const orcamentoPlanejadoLinhas = mysqlTable("orcamento_planejado_linhas", {
  id: int("id").autoincrement().primaryKey(),
  versaoId: int("versaoId").notNull(),
  categoriaId: int("categoriaId").notNull(),
  subcategoriaId: int("subcategoriaId"),
  descricao: text("descricao"),
  janeiro: decimal("janeiro", { precision: 18, scale: 2 }).default("0.00").notNull(),
  fevereiro: decimal("fevereiro", { precision: 18, scale: 2 }).default("0.00").notNull(),
  marco: decimal("marco", { precision: 18, scale: 2 }).default("0.00").notNull(),
  abril: decimal("abril", { precision: 18, scale: 2 }).default("0.00").notNull(),
  maio: decimal("maio", { precision: 18, scale: 2 }).default("0.00").notNull(),
  junho: decimal("junho", { precision: 18, scale: 2 }).default("0.00").notNull(),
  julho: decimal("julho", { precision: 18, scale: 2 }).default("0.00").notNull(),
  agosto: decimal("agosto", { precision: 18, scale: 2 }).default("0.00").notNull(),
  setembro: decimal("setembro", { precision: 18, scale: 2 }).default("0.00").notNull(),
  outubro: decimal("outubro", { precision: 18, scale: 2 }).default("0.00").notNull(),
  novembro: decimal("novembro", { precision: 18, scale: 2 }).default("0.00").notNull(),
  dezembro: decimal("dezembro", { precision: 18, scale: 2 }).default("0.00").notNull(),
  totalAnual: decimal("totalAnual", { precision: 18, scale: 2 }).default("0.00").notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type OrcamentoPlanejadoLinha = typeof orcamentoPlanejadoLinhas.$inferSelect;
export type InsertOrcamentoPlanejadoLinha = typeof orcamentoPlanejadoLinhas.$inferInsert;

/**
 * Lotes de importação do executado (via planilha ERP)
 */
export const orcamentoImportacoes = mysqlTable("orcamento_importacoes", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresaId").notNull(),
  ano: int("ano").notNull(),
  mesReferencia: int("mesReferencia"),
  arquivoNome: varchar("arquivoNome", { length: 500 }),
  arquivoKey: text("arquivoKey"),
  status: mysqlEnum("status", ["processando", "concluido", "erro", "revertido"]).default("processando").notNull(),
  totalLinhas: int("totalLinhas").default(0).notNull(),
  totalImportado: int("totalImportado").default(0).notNull(),
  totalErros: int("totalErros").default(0).notNull(),
  moedaLote: varchar("moedaLote", { length: 10 }).default("BRL").notNull(),
  taxaCambioPadrao: decimal("taxaCambioPadrao", { precision: 18, scale: 6 }).default("1.000000").notNull(),
  importadoPor: int("importadoPor"),
  observacoes: text("observacoes"),
  errosDetalhes: text("errosDetalhes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type OrcamentoImportacao = typeof orcamentoImportacoes.$inferSelect;
export type InsertOrcamentoImportacao = typeof orcamentoImportacoes.$inferInsert;

/**
 * Linhas do executado importadas do ERP
 */
export const orcamentoExecutadoLinhas = mysqlTable("orcamento_executado_linhas", {
  id: int("id").autoincrement().primaryKey(),
  importacaoId: int("importacaoId").notNull(),
  empresaId: int("empresaId").notNull(),
  categoriaId: int("categoriaId"),
  subcategoriaId: int("subcategoriaId"),
  dataLancamento: date("dataLancamento"),
  competencia: varchar("competencia", { length: 7 }),
  descricao: text("descricao"),
  valorOriginal: decimal("valorOriginal", { precision: 18, scale: 2 }).default("0.00").notNull(),
  moedaOriginal: varchar("moedaOriginal", { length: 10 }).default("BRL").notNull(),
  taxaCambio: decimal("taxaCambio", { precision: 18, scale: 6 }).default("1.000000").notNull(),
  dataTaxaCambio: date("dataTaxaCambio"),
  valorConvertidoBase: decimal("valorConvertidoBase", { precision: 18, scale: 2 }).default("0.00").notNull(),
  referenciaExterna: varchar("referenciaExterna", { length: 500 }),
  documentoReferencia: varchar("documentoReferencia", { length: 500 }),
  hashLinha: varchar("hashLinha", { length: 64 }),
  ativo: tinyint("ativo").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type OrcamentoExecutadoLinha = typeof orcamentoExecutadoLinhas.$inferSelect;
export type InsertOrcamentoExecutadoLinha = typeof orcamentoExecutadoLinhas.$inferInsert;

/**
 * Histórico de revisões e aprovações orçamentárias
 */
export const orcamentoRevisoes = mysqlTable("orcamento_revisoes", {
  id: int("id").autoincrement().primaryKey(),
  versaoId: int("versaoId").notNull(),
  acao: mysqlEnum("acao", ["criacao", "edicao", "envio_revisao", "aprovacao", "rejeicao", "congelamento", "duplicacao"]).notNull(),
  motivo: text("motivo"),
  usuarioId: int("usuarioId"),
  payloadAnterior: text("payloadAnterior"),
  payloadNovo: text("payloadNovo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OrcamentoRevisao = typeof orcamentoRevisoes.$inferSelect;
export type InsertOrcamentoRevisao = typeof orcamentoRevisoes.$inferInsert;

// ============================================================
// MÓDULO: Configuração de Metodologias por Empresa
// ============================================================

export const empresaMetodologias = mysqlTable("empresa_metodologias", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresa_id").notNull(),
  metodologia: varchar("metodologia", { length: 50 }).notNull(),
  ativa: boolean("ativa").default(true),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});


// ============================================================
// MÓDULO: GESTÃO DE CONTRATOS (SGC) — FASE 1
// Integração controlada ao app principal de Gestão Estratégica
// Fonte mestra de users e companies: app principal
// ============================================================

/**
 * Clientes contratuais (CNPJ como identificador principal)
 * Vinculados ao contexto corporativo via empresaId (fonte mestra: app principal)
 */
export const contratosClientes = mysqlTable("contratos_clientes", {
  id: int("id").autoincrement().primaryKey(),
  cnpj: varchar("cnpj", { length: 18 }).notNull(),
  razaoSocial: varchar("razao_social", { length: 255 }).notNull(),
  nomeFantasia: varchar("nome_fantasia", { length: 255 }),
  email: varchar("email", { length: 255 }),
  telefone: varchar("telefone", { length: 30 }),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  cep: varchar("cep", { length: 9 }),
  contatoNome: varchar("contato_nome", { length: 255 }),
  contatoEmail: varchar("contato_email", { length: 255 }),
  contatoTelefone: varchar("contato_telefone", { length: 30 }),
  status: mysqlEnum("status", ["ativo", "inativo", "prospecto"]).default("ativo").notNull(),
  observacoes: text("observacoes"),
  logoUrl: text("logo_url"),
  // Dados enriquecidos da Receita Federal / BrasilAPI
  porte: varchar("porte", { length: 50 }),
  naturezaJuridica: varchar("natureza_juridica", { length: 100 }),
  cnaePrincipal: varchar("cnae_principal", { length: 10 }),
  cnaeDescricao: varchar("cnae_descricao", { length: 255 }),
  situacaoCadastral: varchar("situacao_cadastral", { length: 20 }),
  dataAbertura: varchar("data_abertura", { length: 10 }),
  capitalSocial: varchar("capital_social", { length: 30 }),
  socios: text("socios"), // JSON array de sócios
  dadosReceita: text("dados_receita"), // JSON completo da API
  // Vínculo com empresa do app principal (fonte mestra)
  empresaId: int("empresa_id"),
  createdByUserId: int("created_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type ContratosCliente = typeof contratosClientes.$inferSelect;
export type InsertContratosCliente = typeof contratosClientes.$inferInsert;

/**
 * Tabela de junção N:N entre clientes e empresas
 * Permite que um cliente seja vinculado a múltiplas empresas do grupo
 */
export const empresaCliente = mysqlTable("empresa_cliente", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresa_id").notNull(),
  clienteId: int("cliente_id").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).$defaultFn(() => Date.now()),
});
export type EmpresaCliente = typeof empresaCliente.$inferSelect;
export type InsertEmpresaCliente = typeof empresaCliente.$inferInsert;

/**
 * Contratos principais
 * Vinculados a empresa (app principal), cliente e usuário responsável
 */
export const contratos = mysqlTable("contratos", {
  id: int("id").autoincrement().primaryKey(),
  // Vínculos com entidades mestras
  empresaId: int("empresa_id").notNull(),
  clienteId: int("cliente_id"),
  // Dados básicos
  numero: varchar("numero", { length: 100 }),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  // Enums alinhados com o banco real
  tipo: mysqlEnum("tipo", ["servico", "produto", "misto", "consultoria", "manutencao", "outros"]).default("servico").notNull(),
  status: mysqlEnum("status", [
    "rascunho", "ativo", "suspenso", "encerrado", "rescindido"
  ]).default("rascunho").notNull(),
  // Valores
  valorTotal: decimal("valor_total", { precision: 15, scale: 2 }),
  // Datas
  dataInicio: date("data_inicio"),
  dataFim: date("data_fim"),
  dataAssinatura: date("data_assinatura"),
  // Responsável (coluna original do banco)
  responsavelId: int("responsavel_id"),
  // Documentos
  pdfUrl: text("pdf_url"),
  // Dados extraídos por IA do PDF
  resumoIA: text("resumo_ia"),
  iaRevisado: boolean("ia_revisado").default(false),
  createdByUserId: int("created_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  // Colunas adicionadas via ALTER TABLE
  responsavelUserId: int("responsavel_user_id"),
  aprovadorUserId: int("aprovador_user_id"),
  projetoId: int("projeto_id"),
  areaId: int("area_id"),
  moeda: varchar("moeda", { length: 3 }).default("BRL"),
  pdfKey: text("pdf_key"),
  dadosExtradosIA: text("dados_extraidos_ia"),
  assinaturaStatus: mysqlEnum("assinatura_status", ["pendente", "parcial", "assinado", "rejeitado"]).default("pendente"),
  assinaturaUrl: text("assinatura_url"),
  observacoes: text("observacoes"),
});
export type Contrato = typeof contratos.$inferSelect;
export type InsertContrato = typeof contratos.$inferInsert;

/**
 * Aditivos contratuais (alterações de escopo ou valor)
 * Tipo: financeiro ou escopo (necessário para análise IA)
 */
export const contratosAditivos = mysqlTable("contratos_aditivos", {
  id: int("id").autoincrement().primaryKey(),
  contratoId: int("contrato_id").notNull(),
  numero: varchar("numero", { length: 100 }).notNull(),
  tipo: mysqlEnum("tipo", ["financeiro", "escopo", "prazo", "misto"]).notNull(),
  descricao: text("descricao"),
  valorAditivo: decimal("valor_aditivo", { precision: 15, scale: 2 }),
  novaDataFim: date("nova_data_fim"),
  pdfUrl: text("pdf_url"),
  pdfKey: text("pdf_key"),
  resumoIA: text("resumo_ia"),
  dadosExtradosIA: text("dados_extraidos_ia"), // JSON
  iaRevisado: boolean("ia_revisado").default(false),
  status: mysqlEnum("status", ["rascunho", "aprovado", "vigente", "cancelado"]).default("rascunho").notNull(),
  createdByUserId: int("created_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type ContratosAditivo = typeof contratosAditivos.$inferSelect;
export type InsertContratosAditivo = typeof contratosAditivos.$inferInsert;

/**
 * Marcos financeiros
 * Vinculados a contrato ou aditivo; status automático de atraso
 */
export const contratosMarcos = mysqlTable("contratos_marcos", {
  id: int("id").autoincrement().primaryKey(),
  contratoId: int("contrato_id").notNull(),
  aditivoId: int("aditivo_id"),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  valorPrevisto: decimal("valor_previsto", { precision: 15, scale: 2 }).notNull(),
  valorPago: decimal("valor_pago", { precision: 15, scale: 2 }),
  dataPrevista: date("data_prevista").notNull(),
  dataPagamento: date("data_pagamento"),
  prazoPagemento: int("prazo_pagamento"), // dias após aprovação do boletim
  status: mysqlEnum("status", ["pendente", "em_medicao", "aprovado", "pago", "atrasado", "cancelado"]).default("pendente").notNull(),
  ordem: int("ordem").default(1),
  createdByUserId: int("created_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type ContratosMarco = typeof contratosMarcos.$inferSelect;
export type InsertContratosMarco = typeof contratosMarcos.$inferInsert;

/**
 * Boletins de medição
 * Criados automaticamente a partir de marcos financeiros
 * Um marco → um boletim
 */
export const contratosBoletins = mysqlTable("contratos_boletins", {
  id: int("id").autoincrement().primaryKey(),
  contratoId: int("contrato_id").notNull(),
  marcoId: int("marco_id").notNull(),
  numero: varchar("numero", { length: 50 }).notNull(),
  titulo: varchar("titulo", { length: 255 }),
  descricao: text("descricao"),
  valorMedicao: decimal("valor_medicao", { precision: 15, scale: 2 }).notNull(),
  percentualMedicao: decimal("percentual_medicao", { precision: 5, scale: 2 }),
  periodo: varchar("periodo", { length: 50 }),
  status: mysqlEnum("status", ["rascunho", "enviado", "em_aprovacao", "aprovado", "rejeitado", "pago"]).default("rascunho").notNull(),
  // Responsável pela aprovação
  aprovadorNome: varchar("aprovador_nome", { length: 255 }),
  aprovadorEmail: varchar("aprovador_email", { length: 255 }),
  aprovadorToken: varchar("aprovador_token", { length: 100 }), // token para link de aprovação externo
  // Resultado da aprovação
  dataEnvio: timestamp("data_envio"),
  dataAprovacao: timestamp("data_aprovacao"),
  observacoesAprovador: text("observacoes_aprovador"),
  // PDF gerado
  pdfUrl: text("pdf_url"),
  pdfKey: text("pdf_key"),
  createdByUserId: int("created_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type ContratosBoletim = typeof contratosBoletins.$inferSelect;
export type InsertContratosBoletim = typeof contratosBoletins.$inferInsert;

/**
 * Fluxo de aprovação interna de contratos e boletins
 */
export const contratosAprovacoes = mysqlTable("contratos_aprovacoes", {
  id: int("id").autoincrement().primaryKey(),
  tipo: mysqlEnum("tipo", ["contrato", "aditivo", "boletim", "marco"]).notNull(),
  referenciaId: int("referencia_id").notNull(), // ID do contrato/aditivo/boletim/marco
  aprovadorUserId: int("aprovador_user_id").notNull(),
  status: mysqlEnum("status", ["pendente", "aprovado", "rejeitado", "cancelado"]).default("pendente").notNull(),
  observacoes: text("observacoes"),
  dataDecisao: timestamp("data_decisao"),
  createdByUserId: int("created_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type ContratosAprovacao = typeof contratosAprovacoes.$inferSelect;
export type InsertContratosAprovacao = typeof contratosAprovacoes.$inferInsert;

/**
 * Riscos contratuais
 * Análise de riscos por contrato com suporte a IA
 */
export const contratosRiscos = mysqlTable("contratos_riscos", {
  id: int("id").autoincrement().primaryKey(),
  contratoId: int("contrato_id").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  categoria: mysqlEnum("categoria", [
    "financeiro", "juridico", "operacional", "prazo", "escopo", "reputacional", "regulatorio", "outro"
  ]).default("outro").notNull(),
  probabilidade: mysqlEnum("probabilidade", ["baixa", "media", "alta"]).default("media").notNull(),
  impacto: mysqlEnum("impacto", ["baixo", "medio", "alto"]).default("medio").notNull(),
  severidade: mysqlEnum("severidade", ["baixa", "media", "alta", "critica"]).default("media").notNull(),
  status: mysqlEnum("status", ["identificado", "em_mitigacao", "mitigado", "materializado", "aceito"]).default("identificado").notNull(),
  planoMitigacao: text("plano_mitigacao"),
  responsavelUserId: int("responsavel_user_id"),
  dataIdentificacao: date("data_identificacao"),
  dataRevisao: date("data_revisao"),
  geradoPorIA: boolean("gerado_por_ia").default(false),
  createdByUserId: int("created_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type ContratosRisco = typeof contratosRiscos.$inferSelect;
export type InsertContratosRisco = typeof contratosRiscos.$inferInsert;

/**
 * Documentos vinculados a contratos
 * Classificados automaticamente por IA
 */
export const contratosDocumentos = mysqlTable("contratos_documentos", {
  id: int("id").autoincrement().primaryKey(),
  contratoId: int("contrato_id").notNull(),
  aditivoId: int("aditivo_id"),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", [
    "contrato_principal", "aditivo", "boletim", "nota_fiscal", "comprovante_pagamento",
    "proposta", "ata", "laudo", "certificado", "outro"
  ]).default("outro").notNull(),
  url: text("url").notNull(),
  fileKey: text("file_key").notNull(),
  mimeType: varchar("mime_type", { length: 100 }),
  tamanhoBytes: int("tamanho_bytes"),
  classificadoPorIA: boolean("classificado_por_ia").default(false),
  observacoes: text("observacoes"),
  createdByUserId: int("created_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type ContratosDocumento = typeof contratosDocumentos.$inferSelect;
export type InsertContratosDocumento = typeof contratosDocumentos.$inferInsert;

/**
 * Trilha de auditoria específica do módulo Contratos
 * Toda operação crítica gera registro auditável
 */
export const contratosAuditoria = mysqlTable("contratos_auditoria", {
  id: int("id").autoincrement().primaryKey(),
  contratoId: int("contrato_id").notNull(),
  usuarioId: int("usuario_id"),
  acao: varchar("acao", { length: 100 }).notNull(),
  descricao: text("descricao"),
  dadosAntes: text("dados_antes"),   // JSON
  dadosDepois: text("dados_depois"), // JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type ContratosAuditoriaRecord = typeof contratosAuditoria.$inferSelect;
export type InsertContratosAuditoriaRecord = typeof contratosAuditoria.$inferInsert;

/**
 * Sincronização de entidades-mestras entre sistemas
 * Registra o estado da sincronização de users e companies
 * Fonte mestra: app principal
 */
export const contratosSincronizacao = mysqlTable("contratos_sincronizacao", {
  id: int("id").autoincrement().primaryKey(),
  entidade: mysqlEnum("entidade", ["user", "empresa", "cliente"]).notNull(),
  entidadeId: int("entidade_id").notNull(),
  status: mysqlEnum("status", ["sincronizado", "pendente", "erro", "conflito"]).default("pendente").notNull(),
  ultimaSincronizacao: timestamp("ultima_sincronizacao"),
  hashDados: varchar("hash_dados", { length: 64 }),
  erroDetalhes: text("erro_detalhes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type ContratosSincronizacao = typeof contratosSincronizacao.$inferSelect;
export type InsertContratosSincronizacao = typeof contratosSincronizacao.$inferInsert;

// =============================================================================
// MÓDULO CONTRATOS - TABELAS AVANÇADAS (SGC Fase 1 - Integração)
// Mapeamento: contracts→contratos, financial_milestones→contratosMarcos,
//             companies→empresas, users→users
// =============================================================================

/**
 * Boletins de Medição Avançados
 * Registros de medições de serviços/entregas para fins de pagamento
 */
export const boletinsMedicao = mysqlTable("boletins_medicao", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // BM-XXXX
  contratoId: int("contrato_id").notNull(),
  marcoId: int("marco_id"), // Marco financeiro associado (opcional)
  scopeMarcoId: int("scope_marco_id"), // Marco de escopo exclusivo (Modelo A)

  // Período de medição
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),

  // Referência e identificação
  referenceCode: varchar("reference_code", { length: 100 }),

  // Status
  status: mysqlEnum("status_boletim", [
    "DRAFT", "SUBMITTED", "IN_REVIEW", "CHANGES_REQUESTED",
    "APPROVED", "REJECTED", "EXPORTED_MANUAL", "APPROVED_MANUAL",
    "SIGNED", "PAID", "CANCELLED"
  ]).default("DRAFT").notNull(),

  paymentStatus: mysqlEnum("payment_status_boletim", ["UNPAID", "PAID"]).default("UNPAID").notNull(),

  total: decimal("total", { precision: 15, scale: 2 }).default("0").notNull(),

  origin: mysqlEnum("origin_boletim", ["MANUAL", "AUTO_FROM_AI_MILESTONES"]).default("MANUAL").notNull(),
  sourceRunId: varchar("source_run_id", { length: 255 }),

  // Responsável pela aprovação
  currentApproverId: int("current_approver_id"),
  approverName: varchar("approver_name", { length: 255 }),
  approverEmail: varchar("approver_email", { length: 255 }),

  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  observations: text("observations"),
  approvalObservations: text("approval_observations"),

  createdBy: int("created_by").notNull(),
  updatedBy: int("updated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  uniqueSourceRun: unique("unique_source_run_boletim").on(table.contratoId, table.sourceRunId),
}));

export type BoletimMedicao = typeof boletinsMedicao.$inferSelect;
export type InsertBoletimMedicao = typeof boletinsMedicao.$inferInsert;

/**
 * Itens de Boletim de Medição
 */
export const boletinsMedicaoItens = mysqlTable("boletins_medicao_itens", {
  id: int("id").autoincrement().primaryKey(),
  boletimId: int("boletim_id").notNull(),
  descricao: text("descricao").notNull(),
  quantidade: decimal("quantidade", { precision: 15, scale: 2 }).notNull(),
  unidade: varchar("unidade", { length: 50 }).notNull(),
  precoUnitario: decimal("preco_unitario", { precision: 15, scale: 2 }).notNull(),
  total: decimal("total", { precision: 15, scale: 2 }).notNull(),
  marcoId: int("marco_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type BoletimMedicaoItem = typeof boletinsMedicaoItens.$inferSelect;
export type InsertBoletimMedicaoItem = typeof boletinsMedicaoItens.$inferInsert;

/**
 * Aprovadores de Boletins (contatos do cliente)
 */
export const boletinsAprovadores = mysqlTable("boletins_aprovadores", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  contratoId: int("contrato_id").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: mysqlEnum("role_aprovador", ["project_manager", "financial", "technical", "other"]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type BoletimAprovador = typeof boletinsAprovadores.$inferSelect;
export type InsertBoletimAprovador = typeof boletinsAprovadores.$inferInsert;

/**
 * Histórico de Aprovações de Boletins
 */
export const boletinsAprovacaoHistorico = mysqlTable("boletins_aprovacao_historico", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  boletimId: int("boletim_id").notNull(),
  aprovadorId: int("aprovador_id"),
  action: mysqlEnum("action_aprovacao", ["submitted", "approved", "rejected", "returned", "paid"]).notNull(),
  status: mysqlEnum("status_aprovacao", ["pending", "approved", "rejected", "returned"]).notNull(),
  observations: text("observations"),
  pdfUrl: varchar("pdf_url", { length: 500 }),
  pdfFileKey: varchar("pdf_file_key", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BoletimAprovacaoHistorico = typeof boletinsAprovacaoHistorico.$inferSelect;

/**
 * Links de Aprovação por Email
 */
export const boletinsAprovacaoLinks = mysqlTable("boletins_aprovacao_links", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  boletimId: int("boletim_id").notNull(),
  aprovadorId: int("aprovador_id").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at"),
  accessedAt: timestamp("accessed_at"),
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BoletimAprovacaoLink = typeof boletinsAprovacaoLinks.$inferSelect;

/**
 * Tokens de Aprovação Pública (sem login)
 */
export const boletinsAprovacaoTokens = mysqlTable("boletins_aprovacao_tokens", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  boletimId: int("boletim_id").notNull(),
  aprovadorEmail: varchar("aprovador_email", { length: 320 }).notNull(),
  status: mysqlEnum("status_token", ["PENDING", "USED", "EXPIRED"]).default("PENDING").notNull(),
  action: mysqlEnum("action_token", ["APPROVED", "REJECTED"]),
  observations: text("observations"),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type BoletimAprovacaoToken = typeof boletinsAprovacaoTokens.$inferSelect;

/**
 * Aprovações dos Clientes (resposta ao link de aprovação)
 */
export const boletinsClienteAprovacoes = mysqlTable("boletins_cliente_aprovacoes", {
  id: int("id").autoincrement().primaryKey(),
  boletimId: int("boletim_id").notNull(),
  aprovadorId: int("aprovador_id").notNull(),
  approvalStatus: mysqlEnum("approval_status_cliente", ["pending", "approved", "rejected"]).default("pending").notNull(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  observations: text("observations"),
  rejectionReason: text("rejection_reason"),
  clientContactName: varchar("client_contact_name", { length: 255 }),
  clientContactEmail: varchar("client_contact_email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type BoletimClienteAprovacao = typeof boletinsClienteAprovacoes.$inferSelect;

/**
 * Ações de Aprovação (histórico completo de workflow)
 */
export const aprovacaoAcoes = mysqlTable("aprovacao_acoes", {
  id: int("id").primaryKey().autoincrement(),
  boletimId: int("boletim_id").notNull(),
  userId: int("user_id").notNull(),
  action: mysqlEnum("action_aprovacao_acao", [
    "SUBMITTED", "APPROVED", "REJECTED", "CHANGES_REQUESTED", "SIGNED", "APPROVED_MANUAL"
  ]).notNull(),
  observations: text("observations"),
  approvalMethod: mysqlEnum("approval_method", [
    "EMAIL", "PDF_ASSINADO", "SEI", "PORTAL_CLIENTE", "OUTRO"
  ]),
  approverName: varchar("approver_name", { length: 255 }),
  approverEmail: varchar("approver_email", { length: 255 }),
  approvedAt: timestamp("approved_at"),
  attachmentFileKey: varchar("attachment_file_key", { length: 500 }),
  attachmentFileUrl: varchar("attachment_file_url", { length: 1000 }),
  attachmentFileName: varchar("attachment_file_name", { length: 255 }),
  metadata: json("metadata"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: int("created_by"),
}, (table) => ({
  boletimIdIdx: index("aprovacao_acoes_boletim_id_idx").on(table.boletimId),
}));

export type AprovacaoAcao = typeof aprovacaoAcoes.$inferSelect;

/**
 * Responsáveis Internos por Contrato
 */
export const contratosResponsaveis = mysqlTable("contratos_responsaveis", {
  id: int("id").autoincrement().primaryKey(),
  contratoId: int("contrato_id").notNull(),
  responsibleName: varchar("responsible_name", { length: 255 }).notNull(),
  responsibleEmail: varchar("responsible_email", { length: 255 }).notNull(),
  financialEmail: varchar("financial_email", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ContratoResponsavel = typeof contratosResponsaveis.$inferSelect;

/**
 * Alertas de Vencimento de Marcos
 */
export const marcosAlertas = mysqlTable("marcos_alertas", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  marcoId: int("marco_id").notNull(),
  contratoId: int("contrato_id").notNull(),
  empresaId: int("empresa_id").notNull(),
  alertType: mysqlEnum("alert_type_marco", [
    "approaching_due", "due_today", "overdue", "overdue_critical"
  ]).notNull(),
  status: mysqlEnum("status_alerta_marco", [
    "active", "acknowledged", "resolved", "dismissed"
  ]).default("active").notNull(),
  notificationSent: boolean("notification_sent").default(false).notNull(),
  notificationSentAt: timestamp("notification_sent_at"),
  acknowledgedAt: timestamp("acknowledged_at"),
  daysBeforeDue: int("days_before_due"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type MarcoAlerta = typeof marcosAlertas.$inferSelect;

/**
 * Recomendações IA para Contratos
 */
export const contratosRecomendacoes = mysqlTable("contratos_recomendacoes", {
  id: int("id").autoincrement().primaryKey(),
  contratoId: int("contrato_id").notNull(),
  empresaId: int("empresa_id").notNull(),
  type: mysqlEnum("type_recomendacao", [
    "clause", "process", "monitoring", "documentation", "financial"
  ]).notNull(),
  priority: mysqlEnum("priority_recomendacao", ["high", "medium", "low"]).default("medium").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  reasoning: text("reasoning"),
  relatedRisks: json("related_risks"),
  basedOnContracts: json("based_on_contracts"),
  wasHelpful: boolean("was_helpful"),
  feedbackNotes: text("feedback_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ContratoRecomendacao = typeof contratosRecomendacoes.$inferSelect;

/**
 * Histórico de Análises IA
 */
export const iaAnaliseHistorico = mysqlTable("ia_analise_historico", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  contratoId: int("contrato_id"),
  aditivoId: int("aditivo_id"),
  userId: int("user_id").notNull(),
  analysisType: mysqlEnum("analysis_type_ia", ["contract", "amendment"]).notNull(),
  extractedData: json("extracted_data").$type<Record<string, unknown>>().notNull(),
  fileName: varchar("file_name", { length: 255 }),
  fileUrl: varchar("file_url", { length: 500 }),
  fileKey: varchar("file_key", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type IaAnaliseHistorico = typeof iaAnaliseHistorico.$inferSelect;

/**
 * Sequências para geração de códigos únicos
 */
export const sequencias = mysqlTable("sequencias", {
  key: varchar("key", { length: 100 }).primaryKey(),
  currentValue: int("current_value").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Sequencia = typeof sequencias.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════
// MÓDULO DE AVALIAÇÃO DE CONTRATOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Metodologias de avaliação (360°, NPS, CSAT, customizada)
 */
export const avaliacaoMetodologias = mysqlTable("avaliacao_metodologias", {
  id: int("id").autoincrement().primaryKey(),
  empresaId: int("empresa_id").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo_metodologia", ["360", "nps", "csat", "customizada"]).default("customizada").notNull(),
  descricao: text("descricao"),
  escalaMin: int("escala_min").default(0).notNull(),
  escalaMax: int("escala_max").default(10).notNull(),
  notaMinima: decimal("nota_minima", { precision: 5, scale: 2 }).default("7.00").notNull(),
  ativa: boolean("ativa").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type AvaliacaoMetodologia = typeof avaliacaoMetodologias.$inferSelect;
export type InsertAvaliacaoMetodologia = typeof avaliacaoMetodologias.$inferInsert;

/**
 * Grupos (nuvens) de critérios dentro de uma metodologia
 */
export const avaliacaoCriteriosGrupos = mysqlTable("avaliacao_criterios_grupos", {
  id: int("id").autoincrement().primaryKey(),
  metodologiaId: int("metodologia_id").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  peso: decimal("peso", { precision: 5, scale: 2 }).default("1.00").notNull(),
  cor: varchar("cor", { length: 20 }).default("#3B82F6"),
  ordem: int("ordem").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type AvaliacaoCriteriosGrupo = typeof avaliacaoCriteriosGrupos.$inferSelect;
export type InsertAvaliacaoCriteriosGrupo = typeof avaliacaoCriteriosGrupos.$inferInsert;

/**
 * Critérios individuais dentro de um grupo
 */
export const avaliacaoCriterios = mysqlTable("avaliacao_criterios", {
  id: int("id").autoincrement().primaryKey(),
  metodologiaId: int("metodologia_id").notNull(),
  grupoId: int("grupo_id").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  peso: decimal("peso", { precision: 5, scale: 2 }).default("1.00").notNull(),
  ordem: int("ordem").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type AvaliacaoCriterio = typeof avaliacaoCriterios.$inferSelect;
export type InsertAvaliacaoCriterio = typeof avaliacaoCriterios.$inferInsert;

/**
 * Avaliações de Contratos (instância de avaliação)
 */
export const contratosAvaliacoes = mysqlTable("contratos_avaliacoes", {
  id: int("id").autoincrement().primaryKey(),
  contratoId: int("contrato_id").notNull(),
  empresaId: int("empresa_id").notNull(),
  metodologiaId: int("metodologia_id").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  periodo: varchar("periodo", { length: 50 }),
  status: mysqlEnum("status_avaliacao", ["rascunho", "em_andamento", "finalizada", "cancelada"]).default("rascunho").notNull(),
  notaFinal: decimal("nota_final", { precision: 5, scale: 2 }),
  planoAcaoTriggered: boolean("plano_acao_triggered").default(false).notNull(),
  planoAcaoId: int("plano_acao_id"),
  gestorUserId: int("gestor_user_id"),
  observacoes: text("observacoes"),
  createdByUserId: int("created_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type ContratoAvaliacao = typeof contratosAvaliacoes.$inferSelect;
export type InsertContratoAvaliacao = typeof contratosAvaliacoes.$inferInsert;

/**
 * Avaliadores (múltiplos por avaliação)
 */
export const avaliacaoAvaliadores = mysqlTable("avaliacao_avaliadores", {
  id: int("id").autoincrement().primaryKey(),
  avaliacaoId: int("avaliacao_id").notNull(),
  userId: int("user_id"),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  cargo: varchar("cargo", { length: 255 }),
  tipo: mysqlEnum("tipo_avaliador", ["interno", "externo", "gestor", "cliente"]).default("interno").notNull(),
  status: mysqlEnum("status_avaliador", ["pendente", "em_andamento", "concluido"]).default("pendente").notNull(),
  notaCalculada: decimal("nota_calculada", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type AvaliacaoAvaliador = typeof avaliacaoAvaliadores.$inferSelect;
export type InsertAvaliacaoAvaliador = typeof avaliacaoAvaliadores.$inferInsert;

/**
 * Respostas dos avaliadores por critério
 */
export const avaliacaoRespostas = mysqlTable("avaliacao_respostas", {
  id: int("id").autoincrement().primaryKey(),
  avaliacaoId: int("avaliacao_id").notNull(),
  avaliadorId: int("avaliador_id").notNull(),
  criterioId: int("criterio_id").notNull(),
  nota: decimal("nota", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type AvaliacaoResposta = typeof avaliacaoRespostas.$inferSelect;
export type InsertAvaliacaoResposta = typeof avaliacaoRespostas.$inferInsert;

/**
 * Planos de Ação gerados automaticamente por avaliação < 7
 */
export const avaliacaoPlanos = mysqlTable("avaliacao_planos", {
  id: int("id").autoincrement().primaryKey(),
  avaliacaoId: int("avaliacao_id").notNull(),
  contratoId: int("contrato_id").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  status: mysqlEnum("status_plano", ["aberto", "em_andamento", "concluido", "cancelado"]).default("aberto").notNull(),
  prazo: date("prazo"),
  responsavel: varchar("responsavel", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type AvaliacaoPlano = typeof avaliacaoPlanos.$inferSelect;
export type InsertAvaliacaoPlano = typeof avaliacaoPlanos.$inferInsert;

/**
 * Itens do Plano de Ação
 */
export const avaliacaoPlanoItens = mysqlTable("avaliacao_plano_itens", {
  id: int("id").autoincrement().primaryKey(),
  planoId: int("plano_id").notNull(),
  acao: varchar("acao", { length: 500 }).notNull(),
  responsavel: varchar("responsavel", { length: 255 }),
  prazo: date("prazo"),
  status: mysqlEnum("status_item_plano", ["pendente", "em_andamento", "concluido"]).default("pendente").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
export type AvaliacaoPlanoItem = typeof avaliacaoPlanoItens.$inferSelect;
export type InsertAvaliacaoPlanoItem = typeof avaliacaoPlanoItens.$inferInsert;
