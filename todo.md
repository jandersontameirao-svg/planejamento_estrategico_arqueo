# Project TODO

## Infraestrutura e Configuração
- [x] Configurar schema do banco de dados completo
- [x] Configurar identidade visual (cores Bordo, Laranja, Amarelo, Azul)
- [x] Configurar tema e design system

## Gestão de Empresas
- [x] Cadastro de empresas do grupo
- [x] Campo de nome da empresa
- [x] Campo de tipo de atuação (Serviços/Produtos/Serviços+Produtos)
- [x] Campo de status (Ativa/Inativa)
- [x] Campo de observações estratégicas
- [ ] Upload de logo da empresa
- [x] Listagem de empresas
- [x] Edição de empresas
- [x] Exclusão de empresas

## Controle de Acesso e Usuários
- [x] Sistema de 3 perfis (Administrador, Gestor, Usuário)
- [x] Vinculação de usuários a empresas específicas
- [x] Vinculação de usuários ao nível do Grupo
- [x] Permissões por perfil
- [ ] Gestão de usuários (CRUD)

## Identidade Organizacional
- [ ] Módulo de Identidade Organizacional por empresa
- [ ] Campo Missão
- [ ] Campo Visão
- [ ] Campo Valores
- [ ] Campo Política
- [ ] Formulário de edição
- [ ] Visualização

## Análise de Cenário (Raio X)
- [ ] Módulo de Análise de Cenário
- [ ] Histórico de faturamento
- [ ] Histórico de clientes
- [ ] Cálculo de ticket médio
- [ ] Desdobramento por produto
- [ ] Desdobramento por canal
- [ ] Gráficos e visualizações

## Objetivos e Metas
- [ ] Cadastro de objetivos estratégicos
- [ ] Cadastro de metas
- [ ] Desdobramento de metas por produto
- [ ] Desdobramento de metas por serviço
- [ ] Desdobramento de metas por canal
- [ ] Cálculos automáticos de metas
- [ ] Acompanhamento mensal

## KPIs Estratégicos
- [ ] Cadastro de KPIs
- [ ] Campo Meta
- [ ] Campo Realizado
- [ ] Cálculo de percentual de atingimento
- [ ] Cálculo de acumulado
- [ ] Status RAG (semáforo: Vermelho, Amarelo, Verde)
- [ ] Visão mensal
- [ ] Visão anual
- [ ] Visão histórica
- [ ] Consolidação por empresa
- [ ] Consolidação no nível do Grupo

## Projetos e Iniciativas
- [ ] Cadastro de projetos
- [ ] Cadastro de iniciativas
- [ ] Calendário Gantt
- [ ] Vinculação a objetivos
- [ ] Vinculação a KPIs
- [ ] Campo de datas (início e fim)
- [ ] Campo de status
- [ ] Campo de responsável
- [ ] Consolidação automática no Grupo

## Plano de Ação
- [ ] Cadastro de ações
- [ ] Campo descrição
- [ ] Campo responsável
- [ ] Campo prazo
- [ ] Campo status
- [ ] Campo custo (opcional)
- [ ] Vínculo com projetos
- [ ] Vínculo com KPIs
- [ ] Listagem e filtros

## Dashboards Executivos
- [ ] Dashboard de Planejamento Macro do Grupo
- [ ] Dashboard de desempenho por empresa
- [ ] Dashboard de KPIs estratégicos
- [ ] Dashboard de projetos e iniciativas
- [ ] Dashboard de plano de ação
- [ ] Filtro por empresa
- [ ] Filtro por área
- [ ] Filtro por período
- [ ] Filtro por responsável
- [ ] Gráficos e visualizações

## Governança e Auditoria
- [ ] Sistema de ciclos mensais
- [ ] Sistema de ciclos anuais
- [ ] Fechamento de período
- [ ] Trilha de auditoria (quem alterou)
- [ ] Trilha de auditoria (quando alterou)
- [ ] Trilha de auditoria (valores antes/depois)
- [ ] Histórico imutável
- [ ] Consulta de histórico

## Página Inicial
- [x] Card de Planejamento Macro do Grupo
- [x] Cards de empresas individuais
- [x] Exibição de status RAG por empresa
- [x] Navegação condicional por perfil de usuário


## Novos Itens - Implementação Atual
- [x] Módulo de Identidade Organizacional completo
- [x] Formulário de edição de Missão, Visão, Valores e Política
- [x] Página de visualização da Identidade Organizaci- [x] Módulo de KPIs Estratégicos completo
- [x] Cadastro de KPIs com metas mensais
- [x] Registro de valores realizados
- [x] Cálculo automático de percentual de atingimento
- [x] Sistema de status RAG (Verde/Amarelo/Vermelho)ático
- [- [ ] Visão mensal e anual de KPIs
- [x] Dashboard Executivo do Grupo
- [x] Dashboard por Empresa
- [x] Estatísticas consolidadas
- [ ] Gráficos de desempenho avançados
- [ ] Filtros por período/área/responsável


## Nova Implementação - Planejamento Macro do Grupo
- [x] Criar tabela de Planejamento Macro do Grupo no banco
- [x] Implementar Identidade Organizacional do Grupo (MVV + Política)
- [x] Criar página de Planejamento Macro do Grupo
- [x] Implementar Objetivos Estratégicos do Grupo
- [x] Criar KPIs Consolidados do Grupo (mínimo 5)
- [x] Adicionar validação de mínimo 5 KPIs para o Grupo (alerta visual)
- [x] Criar link de acesso ao Planejamento Macro na Home
- [ ] Adicionar validação de mínimo 5 KPIs por empresa
- [ ] Implementar consolidação automática de KPIs das empresas
- [ ] Atualizar Dashboard com seção de Planejamento Macro


## Implementação BSC (Balanced Scorecard)
- [x] Adicionar campo perspectivaBSC aos KPIs (financeira, clientes, processos, aprendizado)
- [x] Adicionar campo perspectivaBSC aos Objetivos
- [x] Migrar banco de dados com novas colunas
- [x] Atualizar interface de criação/edição de KPIs com perspectiva BSC
- [x] Atualizar interface de criação/edição de KPIs do Grupo com perspectiva BSC
- [ ] Atualizar interface de criação/edição de Objetivos com perspectiva BSC
- [x] Criar Dashboard BSC com 4 perspectivas
- [x] Implementar visualização por perspectiva nos KPIs
- [ ] Implementar visualização por perspectiva nos Objetivos
- [ ] Adicionar validação de balanceamento entre perspectivas
- [ ] Criar Mapa Estratégico BSC visual
- [ ] Implementar relações de causa e efeito entre objetivos


## Reorganização BSC - Integração com Planejamento Macro e Empresas
- [x] Adicionar aba "BSC" no Planejamento Macro do Grupo
- [x] Criar visualização BSC com 4 perspectivas no Planejamento Macro
- [x] Adicionar aba "BSC" na página de Identidade Organizacional de cada empresa
- [x] Criar visualização BSC com 4 perspectivas para cada empresa
- [x] Remover Dashboard BSC separado (/dashboard-bsc)
- [x] Remover botão "BSC" do header da Home
- [x] Ajustar rotas e navegação


## Ajustes e Novas Implementações
- [x] Remover aba "KPIs Consolidados" do Planejamento Macro do Grupo
- [x] Manter apenas abas "Identidade" e "BSC" no Planejamento Macro
- [x] Implementar lançamento de valores mensais nos KPIs
- [x] Adicionar campos de meta mensal e valor realizado mensal
- [x] Criar interface de registro de valores por mês/ano
- [x] Calcular automaticamente percentual de atingimento e status RAG
- [x] Histórico de valores com status RAG visual
- [ ] Implementar gráficos de evolução temporal dos KPIs
- [ ] Criar módulo de Objetivos Estratégicos
- [ ] Vincular objetivos às perspectivas BSC
- [ ] Permitir desdobramento de objetivos do Grupo para empresas
- [ ] Vincular objetivos com KPIs
- [ ] Implementar módulo de Análise de Cenário (Raio-X)
- [ ] Registrar histórico de faturamento
- [ ] Registrar base de clientes
- [ ] Registrar ticket médio
- [ ] Desdobramento por produto/canal


## Nova Implementação - Continuação
- [x] Implementar gráficos de evolução temporal dos KPIs (linha/barra)
- [x] Adicionar visualização meta vs realizado ao longo dos meses
- [x] Implementar visualização de valores consolidados do Grupo nas empresas
- [x] Empresas visualizam valores do Grupo (não têm valores próprios)
- [x] Remover lançamento de valores individuais por empresa
- [x] Adicionar nota explicativa na aba BSC das empresas
- [ ] Criar módulo de Objetivos Estratégicos
- [ ] Vincular objetivos às perspectivas BSC
- [ ] Permitir desdobramento de objetivos do Grupo para empresas
- [ ] Vincular objetivos com KPIs
- [ ] Criar módulo de Análise de Cenário (Raio-X)
- [ ] Registrar histórico de faturamento
- [ ] Registrar base de clientes
- [ ] Registrar ticket médio
- [ ] Desdobramento por produto/canal


## Correção Urgente
- [x] Adicionar botão "Criar KPI" na aba BSC do Planejamento Macro
- [x] Adicionar formulário de criação de KPI na aba BSC
- [ ] Permitir edição e exclusão de KPIs na aba BSC do Planejamento Macro


## Módulo de Objetivos Estratégicos
- [x] Criar tabela de objetivos estratégicos no banco
- [x] Vincular objetivos a perspectivas BSC
- [x] Vincular KPIs a objetivos estratégicos (tabela de vinculação)
- [ ] Criar interface de gestão de objetivos
- [ ] Adicionar aba "Objetivos" no Planejamento Macro
- [ ] Implementar CRUD completo de objetivos
- [ ] Permitir desdobramento de objetivos do Grupo para empresas
- [ ] Adicionar aba "Objetivos" nas empresas

## Módulo de Projetos e Iniciativas
- [x] Criar tabela de projetos/iniciativas no banco
- [x] Vincular projetos a objetivos estratégicos
- [x] Vincular projetos a KPIs (tabela de vinculação)
- [x] Adicionar campos de status, prazos, responsáveis
- [ ] Criar interface de gestão de projetos
- [ ] Implementar calendário Gantt visual
- [ ] Adicionar aba "Projetos" no Planejamento Macro
- [ ] Adicionar aba "Projetos" nas empresas
- [ ] Implementar CRUD completo de projetos

## Módulo de Relatórios
- [ ] Criar página de relatórios consolidados
- [ ] Implementar exportação em PDF
- [ ] Incluir gráficos de KPIs no relatório
- [ ] Incluir objetivos e projetos no relatório
- [ ] Permitir filtros por período e empresa


## Interface de Objetivos Estratégicos - Nova Implementação
- [x] Adicionar aba "Objetivos" no Planejamento Macro
- [ ] Criar formulário de cadastro de objetivos (placeholder criado)
- [ ] Implementar listagem de objetivos por perspectiva BSC
- [ ] Adicionar interface de vinculação de KPIs aos objetivos
- [ ] Implementar edição e exclusão de objetivos

## Interface de Projetos e Iniciativas - Nova Implementação
- [x] Adicionar aba "Projetos" no Planejamento Macro
- [ ] Criar formulário de cadastro de projetos (placeholder criado)
- [ ] Implementar listagem de projetos
- [ ] Adicionar calendário Gantt visual
- [ ] Implementar vinculação de projetos a objetivos/KPIs
- [ ] Adicionar controle de status, prazos e responsáveis


## Implementação Final - Formulários, Gantt e Relatórios
- [x] Implementar formulário completo de Objetivos Estratégicos
- [x] Adicionar listagem de objetivos por perspectiva BSC
- [x] Implementar vinculação visual de KPIs aos objetivos
- [x] Implementar edição e exclusão de objetivos
- [x] Implementar formulário completo de Projetos/Iniciativas
- [x] Adicionar listagem de projetos com filtros
- [x] Implementar vinculação de projetos a objetivos/KPIs
- [x] Desenvolver calendário Gantt visual interativo
- [x] Criar página de relatórios consolidados
- [x] Implementar exportação de relatórios em PDF
- [x] Incluir gráficos de KPIs nos relatórios
- [x] Incluir objetivos e projetos nos relatórios


## Dashboard de Acompanhamento em Tempo Real
- [x] Criar cards de progresso dos objetivos estratégicos
- [x] Implementar visualização de status dos projetos
- [x] Desenvolver gráficos de tendência dos KPIs consolidados
- [x] Adicionar métricas-chave executivas
- [x] Implementar indicadores visuais de performance
- [x] Integrar todos os componentes no Dashboard
- [x] Criar testes para o dashboard


## Módulo de Plano de Ação
- [x] Criar tabela de ações no banco de dados
- [x] Adicionar campos: descrição, responsável, prazo, custo, status
- [x] Criar routers de CRUD para ações
- [x] Vincular ações a objetivos estratégicos
- [x] Vincular ações a projetos/iniciativas
- [x] Implementar interface de cadastro de ações
- [x] Implementar listagem de ações com filtros
- [x] Adicionar visualização por status
- [x] Adicionar visualização por responsável
- [x] Criar página dedicada de Plano de Ação
- [x] Implementar testes unitários


## Visualização Kanban do Plano de Ação
- [x] Instalar biblioteca de drag and drop (@dnd-kit)
- [x] Criar componente KanbanBoard
- [x] Implementar colunas por status (Pendente, Em Andamento, Concluída, Cancelada)
- [x] Implementar drag and drop entre colunas
- [x] Atualizar status automaticamente ao mover cards
- [x] Adicionar botão de alternância Lista/Kanban
- [x] Estilizar cards do Kanban
- [x] Adicionar animações de transição
- [x] Criar testes para o Kanban


## Matriz de Risco (Impacto vs Probabilidade)
- [x] Adicionar campos impacto e probabilidade em objetivos_grupo (schema)
- [x] Adicionar campos impacto e probabilidade em projetos_grupo (schema)
- [x] Atualizar routers de objetivos para aceitar impacto/probabilidade
- [x] Atualizar routers de projetos para aceitar impacto/probabilidade
- [x] Adicionar campos de risco no formulário de Objetivos
- [x] Adicionar campos de risco no formulário de Projetos
- [x] Criar componente MatrizRisco visual
- [x] Implementar gráfico 2D com eixos Impacto (x) e Probabilidade (y)
- [x] Plotar objetivos e projetos como pontos na matriz
- [x] Adicionar cores por quadrante de risco
- [x] Adicionar tooltips com detalhes ao hover
- [x] Integrar Matriz de Risco no Dashboard
- [x] Criar testes para Matriz de Risco


## Correções e Melhorias Solicitadas
- [x] Verificar visualização da Matriz de Risco no Dashboard
- [x] Corrigir exibição da Matriz de Risco se necessário
- [x] Adicionar campo empresaId na tabela acoes_grupo
- [x] Criar routers de Plano de Ação filtrados por empresa
- [x] Adicionar aba "Plano de Ação" nas páginas de empresa
- [x] Implementar interface de Plano de Ação por empresa
- [x] Permitir visualização consolidada no nível do grupo
- [x] Criar testes para Plano de Ação por empresa


## Componentes Lite - Reformulação Visual
- [x] Reformular VrioLite com sliders, gráficos e classificação de vantagem competitiva
- [x] Reformular SwotLite com seletor de tipo, gráfico de distribuição e matriz visual
- [x] Reformular OkrLite com Key Results, gráficos de progresso e métricas
- [x] Reformular BscLite com indicadores por perspectiva, radar e barras
- [x] Testar integração de todos os componentes Lite na página de Planejamento Estratégico


## Melhorias de Interface - PESTEL
- [x] Melhorar visual da análise PESTEL para ficar mais prática e amigável
- [x] Adicionar cards coloridos por categoria (Político, Econômico, Social, Tecnológico, Ambiental, Legal)
- [x] Melhorar formulário de adição de fatores com seleção visual de categoria
- [x] Adicionar matriz de risco (scatter plot) e gráfico de barras por categoria
- [x] Adicionar filtro por categoria clicável
- [x] Melhorar visualização de fatores com barras de progresso


## Melhorias de Interface - Stakeholders e 5 Forças
- [x] Melhorar componente Stakeholders com matriz poder×interesse visual
- [x] Adicionar 4 cards coloridos por quadrante (Gerenciar de Perto, Manter Satisfeito, Manter Informado, Monitorar)
- [x] Implementar scatter plot interativo com quadrantes coloridos de fundo
- [x] Adicionar filtro clicável por quadrante
- [x] Melhorar componente 5 Forças de Porter
- [x] Adicionar 5 cards coloridos por tipo de força (Rivalidade, Fornecedores, Clientes, Novos Entrantes, Substitutos)
- [x] Adicionar gráfico radar das 5 forças e gráfico de barras por tipo
- [x] Adicionar classificação de atratividade do setor (Muito Atrativo, Atrativo, Pouco Atrativo, Não Atrativo)
- [x] Melhorar formulário com seleção visual de tipo de força


## Melhorias Visuais - OKR, BSC e SWOT
- [x] Melhorar visual do componente OKR com cards coloridos (Objetivos, Key Results, Progresso Geral, No Alvo)
- [x] Adicionar gráficos de progresso (barras horizontais por objetivo, pizza para progresso geral)
- [x] Adicionar sliders para definir metas e progresso dos Key Results
- [x] Melhorar visual do componente BSC com cards por perspectiva (Financeira, Cliente, Processos, Aprendizado)
- [x] Adicionar gráficos de desempenho por perspectiva (radar e barras)
- [x] Melhorar visual do componente SWOT com matriz colorida (4 quadrantes)
- [x] Adicionar seleção visual de tipo (Forças, Fraquezas, Oportunidades, Ameaças)


## Bug Report - Componentes não mostrando melhorias
- [ ] Verificar cada componente no navegador (PESTEL, 5 Forças, Stakeholders, VRIO, SWOT, OKR, BSC)
- [ ] Identificar quais componentes estão mostrando versão antiga
- [ ] Verificar se os arquivos Lite corretos estão sendo importados
- [ ] Corrigir imports ou componentes problemáticos
- [ ] Validar que todas as melhorias estão visíveis


## Reorganização do Sistema - Empresas vs Planejamento Macro
- [x] Criar página /planejamento-macro com BSC Consolidado
- [x] Criar página /empresa/:id/planejamento com todos os componentes de análise
- [x] Ajustar rotas no App.tsx
- [x] Implementar BSC Consolidado com 4 perspectivas, gráfico radar e comparativo por empresa
- [x] Ajustar links na Home para nova estrutura
- [x] Testar navegação e validar estrutura completa


## Agregação Real do BSC Macro
- [x] Criar tabela bsc_indicadores no schema do banco de dados
- [x] Criar procedures tRPC (saveIndicadores, getByEmpresa, getAll)
- [x] Criar funções no db.ts (saveBscIndicadores, getBscIndicadoresByEmpresa, getAllBscIndicadores)
- [x] Atualizar PlanejamentoMacro para agregar dados reais de todas as empresas
- [x] Implementar cálculo de médias por perspectiva e por empresa
- [x] Testar agregação com dados de múltiplas empresas (Arqueoproject: 83%, 81%, 74%, 66% | Arqueogis: 78%, 76%, 71%, 64%)


## Análises Estratégicas do Grupo no Planejamento Macro
- [x] Adicionar componente Identidade do Grupo no Planejamento Macro
- [x] Adicionar componente BSC do Grupo
- [x] Adicionar componente PESTEL do Grupo
- [x] Adicionar componente Stakeholders do Grupo
- [x] Adicionar componente SWOT do Grupo
- [x] Adicionar componente OKR do Grupo
- [x] Criar interface com cards expansíveis para cada análise
- [x] Adicionar botão de gerar relatório consolidado em PDF


## Dashboard do Grupo Arqueo
- [x] Criar componente DashboardGrupo com visão consolidada
- [x] Adicionar cards de métricas principais (Total Empresas: 2, Desempenho Médio: 76%, Indicadores BSC: 16, Alertas: 0)
- [x] Adicionar gráficos de desempenho BSC consolidado (barras por perspectiva e por empresa)
- [x] Adicionar lista de empresas com status, indicadores e badges de desempenho
- [x] Adicionar rota /dashboard-grupo
- [x] Integrar com header da página Home (botão Dashboard)


## Implementação das Recomendações

### 1. Persistência de Análises do Grupo
- [ ] Criar tabelas no banco para análises do grupo (identidade, pestel, stakeholders, swot, okr)
- [ ] Criar procedures tRPC para salvar e buscar análises do grupo
- [ ] Conectar IdentidadeOrganizacionalLite ao banco (empresaId=0 para grupo)
- [ ] Conectar AnalisePestelLite ao banco
- [ ] Conectar StakeholdersLite ao banco
- [ ] Conectar SwotLite ao banco
- [ ] Conectar OkrLite ao banco

### 2. Filtro Temporal no Dashboard
- [ ] Adicionar seletor de período no DashboardGrupo (Mensal, Trimestral, Anual, Tudo)
- [ ] Filtrar dados BSC por período selecionado
- [ ] Adicionar gráfico de linha mostrando evolução temporal do desempenho
- [ ] Adicionar comparação período atual vs período anterior

### 3. Geração de PDF dos Relatórios
- [ ] Criar função de geração de PDF no backend
- [ ] Implementar template de relatório consolidado do grupo
- [ ] Implementar template de relatório individual da empresa
- [ ] Conectar botões "Gerar Relatório em PDF" aos endpoints
- [ ] Adicionar download automático do PDF gerado


## Melhorias de Layout e Navegação
- [x] Criar componente PageHeader reutilizável com botões Voltar e Home
- [x] Melhorar espaçamento e tipografia das páginas
- [x] Adicionar gradientes de fundo (from-background via-background to-accent/10)
- [x] Melhorar cards com bordas coloridas e espaçamento consistente
- [x] Adicionar navegação em PlanejamentoEstrategicoEmpresa
- [x] Adicionar navegação em PlanejamentoMacro
- [x] Adicionar navegação em DashboardGrupo
- [x] Padronizar header sticky com backdrop blur em todas as páginas


## Padronização de Matriz de Risco
- [ ] Verificar classificação de risco atual no componente PESTEL
- [ ] Padronizar classificação de risco (Crítico, Alto, Médio, Baixo) em todas as análises
- [ ] Garantir que empresas e grupo usem a mesma matriz de risco
- [ ] Testar e validar classificação consistente


## Modernização Completa do Layout
- [x] Sistema usa autenticação OAuth do Manus (sem página de login personalizada)
- [x] Modernizar página Home com gradientes vibrantes e hero section
- [x] Adicionar animações de entrada (fade-in, slide-in-from-bottom com delays)
- [x] Implementar hover effects nos cards (elevação, scale, shadow-xl)
- [x] Adicionar transições suaves (duration-300, duration-700)
- [x] Melhorar tipografia com gradientes de texto e hierarquia clara
- [x] Implementar cards com glassmorphism (backdrop-blur-sm, gradientes)


## Bug - Loop de Redirecionamento após Login
- [x] Verificar callback OAuth e redirecionamento
- [x] Verificar se session cookie está sendo salvo corretamente (cookie vazio)
- [x] Verificar lógica de configuração de domínio do cookie
- [x] Corrigir: Descomentada configuração de domínio em cookies.ts para funcionar com proxy Manus


## Persistência de Análises no Banco de Dados
- [x] Schemas já existem para todas as análises (PESTEL, SWOT, OKR, Stakeholders, 5 Forças, VRIO, Identidade, BSC)
- [x] Procedures tRPC criadas para BSC (saveIndicadores, getByEmpresa, getAll)
- [x] Componente BscLite conectado ao banco de dados via tRPC
- [x] Sistema carrega dados do banco automaticamente ao abrir BSC
- [x] Botão "Salvar Balanced Scorecard" persiste dados no banco
- [ ] Verificar procedures tRPC existentes para cada componente
- [ ] Criar procedures faltantes (save, getByEmpresa para cada análise)
- [ ] Conectar AnalisePestelLite ao banco de dados
- [ ] Conectar SwotLite ao banco de dados
- [ ] Conectar OkrLite ao banco de dados
- [ ] Conectar StakeholdersLite ao banco de dados
- [ ] Conectar CincoForcasLite ao banco de dados
- [ ] Conectar VrioLite ao banco de dados
- [ ] Conectar IdentidadeOrganizacionalLite ao banco de dados
- [ ] Testar persistência de todos os componentes
- [ ] Adicionar indicadores de progresso (0-100%) em cada análise


## Novas Funcionalidades - Exportação, Notificações e Dashboard Comparativo
- [x] Implementar exportação de relatórios em PDF para análise PESTEL
- [x] Implementar exportação de relatórios em PDF para análise SWOT
- [x] Implementar exportação de relatórios em PDF para análise OKR
- [x] Implementar exportação de relatórios em PDF para análise BSC
- [x] Criar sistema de notificações automáticas para análises incompletas (<50%)
- [x] Criar sistema de notificações para OKRs próximos do prazo sem progresso
- [x] Desenvolver dashboard comparativo entre empresas do grupo
- [x] Adicionar gráficos de radar no dashboard comparativo
- [x] Adicionar gráficos de barras no dashboard comparativo
- [x] Testar todas as novas funcionalidades
