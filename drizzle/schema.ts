import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, date, tinyint } from "drizzle-orm/mysql-core";

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
