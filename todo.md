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


## Templates Personalizados para Relatórios PDF
- [ ] Criar tabela de configurações de templates no banco de dados
- [ ] Adicionar campos: logo, cor primária, cor secundária, seções habilitadas
- [ ] Criar procedures tRPC para salvar e recuperar configurações de templates
- [ ] Desenvolver página de configuração de templates por empresa
- [ ] Adicionar upload de logo da empresa
- [ ] Implementar seletor de cores para personalização
- [ ] Criar checkboxes para habilitar/desabilitar seções do relatório
- [ ] Adicionar preview em tempo real do template
- [ ] Atualizar funções de exportação PDF para usar configurações personalizadas
- [ ] Testar exportação com diferentes configurações de template

## Melhorias Templates - Upload Logo, Preview e Histórico
- [x] Implementar upload de logo com S3 na página ConfigurarTemplate
- [x] Adicionar procedure tRPC para fazer upload e salvar URL do logo
- [x] Atualizar funções de exportação PDF para renderizar logo personalizado
- [x] Criar componente de preview em tempo real do PDF
- [ ] Adicionar visualização do PDF com configurações atuais
- [ ] Criar tabela template_versions para histórico
- [ ] Implementar procedures para salvar e listar versões
- [x] Adicionar interface para visualizar e reverter versões anteriores


## Melhorias Templates - Upload Logo, Preview e Histórico
- [x] Implementar upload de logo com S3 na página ConfigurarTemplate
- [x] Adicionar procedure tRPC para fazer upload e salvar URL do logo
- [x] Atualizar funções de exportação PDF para renderizar logo personalizado
- [x] Criar componente de preview em tempo real do PDF
- [ ] Adicionar visualização do PDF com configurações atuais
- [ ] Criar tabela template_versions para histórico
- [ ] Implementar procedures para salvar e listar versões
- [x] Adicionar interface para visualizar e reverter versões anteriores


## Melhorias Finais Templates - Preview, Histórico e Galeria
- [x] Criar componente de preview em tempo real do PDF
- [x] Adicionar visualização do PDF com configurações atuais na página ConfigurarTemplate
- [x] Criar tabela template_versions para histórico de versões
- [x] Implementar procedures para salvar e listar versões anteriores
- [x] Adicionar interface para visualizar e reverter versões
- [x] Criar galeria de templates prontos (Executivo, Técnico, Minimalista)
- [x] Implementar seleção de template pronto como ponto de partida
- [x] Adicionar botão para aplicar template pronto


## Sistema de Comentários Colaborativos
- [x] Criar tabela analise_comentarios no banco de dados
- [x] Adicionar schema no Drizzle para comentários
- [x] Implementar procedures tRPC (criar, listar, editar, deletar comentários)
- [x] Criar componente CommentSection para exibir comentários
- [x] Adicionar formulário de novo comentário com validação
- [x] Integrar CommentSection nos componentes PESTEL, SWOT, OKR e BSC
- [ ] Adicionar indicador visual de quantidade de comentários em cada análise
- [ ] Testar criação, edição e exclusão de comentários


## Menções e Anexos em Comentários
- [x] Criar tabela comentario_mencoes para rastrear menções
- [x] Criar tabela comentario_anexos para armazenar anexos
- [x] Adicionar schemas no Drizzle para menções e anexos
- [x] Implementar função para detectar @menções no texto
- [x] Criar procedure para enviar notificações aos usuários mencionados
- [x] Implementar upload de anexos para S3 com validação de tipo/tamanho
- [x] Adicionar campo de anexos no formulário de comentário
- [x] Exibir menções destacadas (highlight) nos comentários
- [x] Exibir lista de anexos com ícones e links para download
- [ ] Testar menções e notificações automáticas
- [ ] Testar upload e download de anexos


## Correção de Bug - AnalisePestelLite
- [x] Corrigir erro "fatoresDb is not defined" no AnalisePestelLite (linha 61)


## Dashboard Visual e Navegação
- [x] Criar dashboard visual com gráficos das análises estratégicas (PESTEL, SWOT, OKR, BSC, Stakeholders)
- [x] Adicionar cards com métricas de completude das análises
- [x] Implementar gráficos de radar, barras e pizza para visualização consolidada
- [x] Adicionar botão "Voltar" em todas as páginas do sistema
- [x] Adicionar logo do Grupo Arqueo no header das páginas
- [ ] Testar navegação e validar dashboard

## Melhorar Acesso ao Dashboard Visual
- [x] Adicionar botão "Dashboard Visual" nos cards de empresas na página inicial
- [x] Testar navegação do dashboard a partir da home

## Dashboard Visual do Grupo
- [ ] Criar página DashboardGrupoAnalises com gráficos consolidados
- [ ] Adicionar botão de acesso ao Dashboard do Grupo na home
- [ ] Testar dashboard consolidado


## Planejamento Estratégico do Grupo Arqueo (Mesma Estrutura das Empresas)
- [x] Criar página PlanejamentoEstrategicoGrupo.tsx com 8 cards expansíveis
- [x] Adaptar componentes Lite para aceitar empresaId=0 (análises do Grupo)
- [x] Criar DashboardAnalisesGrupo.tsx com gráficos consolidados das análises do Grupo
- [x] Adicionar rota /planejamento-grupo no App.tsx
- [x] Adicionar botão "Planejamento do Grupo" na Home
- [ ] Testar todas as análises do Grupo (salvar/carregar)
- [ ] Testar dashboard visual do Grupo
- [ ] Testar exportação de PDF consolidado do Grupo

## Reorganização de Layout - Planejamento Estratégico do Grupo
- [x] Reorganizar cards em layout de grade 4x2 (4 cards por linha)
- [x] Ajustar cards para formato compacto com ícone, título, badge e descrição
- [x] Manter funcionalidade de expansão ao clicar
- [x] Testar responsividade em diferentes tamanhos de tela


## Planejamento Estratégico - Grupo Arqueo Participações (Nível Acima)
- [x] Criar página PlanejamentoEstrategicoParticipacoes.tsx com 8 cards em grade 4x2
- [x] Usar empresaId=-1 para representar Grupo Arqueo Participações
- [x] Criar DashboardAnalisesParticipacoes.tsx com gráficos consolidados
- [x] Adicionar rota /planejamento-participacoes no App.tsx
- [x] Adicionar botão "Planejamento - Grupo Arqueo Participações" na Home
- [x] Testar todas as análises (salvar/carregar)
- [x] Testar dashboard visual
- [ ] Testar exportação de PDF


## Áreas de Negócio - Estrutura Hierárquica de 4 Níveis
- [ ] Criar tabela areas_negocio no banco de dados (id, nome, descricao, pais, status)
- [ ] Adicionar coluna areaId na tabela empresas
- [ ] Criar procedures tRPC para CRUD de áreas de negócio
- [ ] Criar página /areas-negocio para listar e gerenciar áreas
- [ ] Criar formulário para nova área de negócio
- [ ] Criar página /area/:id/planejamento com 8 cards em grade 4x2
- [ ] Criar página /area/:id/dashboard com gráficos consolidados
- [ ] Atualizar Home para exibir áreas de negócio agrupadas
- [ ] Migrar "Grupo Arqueo" para "Área de Negócio: Grupo Arqueo Brasil"
- [ ] Vincular empresas existentes à área Grupo Arqueo Brasil
- [ ] Testar criação de nova área de negócio
- [ ] Testar planejamento estratégico por área


## Áreas de Negócio - Estrutura Hierárquica de 4 Níveis
- [x] Criar tabela areas_negocio no banco de dados
- [x] Adicionar coluna areaId na tabela empresas
- [x] Criar procedures tRPC para CRUD de áreas de negócio
- [x] Criar página AreasNegocio.tsx para gerenciamento
- [x] Criar página PlanejamentoEstrategicoArea.tsx (8 cards em grade 4x2)
- [x] Criar página DashboardAnalisesArea.tsx com gráficos
- [x] Adicionar rotas no App.tsx (/areas-negocio, /area/:id/planejamento, /area/:id/dashboard)
- [x] Atualizar Home.tsx para exibir seção de Áreas de Negócio
- [x] Migrar "Grupo Arqueo" para primeira área de negócio (Grupo Arqueo Brasil)
- [x] Vincular empresas existentes à área Grupo Arqueo Brasil
- [ ] Testar criação de nova área de negócio
- [ ] Testar planejamento estratégico por área
- [ ] Testar dashboard por área


## BUG - Identidade Organizacional do Grupo Arqueo Participações
- [x] Diagnosticar por que a Identidade Organizacional não estava sendo salva
- [x] Verificar se o procedimento tRPC estava recebendo os dados
- [x] Verificar se o banco de dados estava recebendo os dados
- [x] Corrigir o problema: função getIdentidadeByEmpresa retornava undefined
- [x] Testar salvamento da Identidade Organizacional - FUNCIONANDO


## Correção de Componentes Lite - Retorno de Undefined
- [ ] Corrigir getBscByEmpresa para retornar objeto vazio ao invés de undefined
- [ ] Corrigir getPestelByEmpresa para retornar objeto vazio ao invés de undefined
- [ ] Corrigir getSwotByEmpresa para retornar objeto vazio ao invés de undefined
- [ ] Corrigir getOkrByEmpresa para retornar objeto vazio ao invés de undefined
- [ ] Corrigir getStakeholdersByEmpresa para retornar objeto vazio ao invés de undefined
- [ ] Corrigir getRbvVrioByEmpresa para retornar objeto vazio ao invés de undefined
- [ ] Corrigir getForcasPorterByEmpresa para retornar objeto vazio ao invés de undefined
- [ ] Testar carregamento de dados em todos os componentes Lite

## Preenchimento de Análises - Grupo Arqueo Participações
- [x] Testar carregamento de todas as análises - FUNCIONANDO
- [ ] Preencher PESTEL (Político, Econômico, Social, Tecnológico, Ambiental, Legal)
- [ ] Preencher SWOT (Forças, Fraquezas, Oportunidades, Ameças)
- [ ] Preencher OKR (3 Objetivos com 3 Resultados-Chave cada)
- [ ] Preencher BSC (Perspectivas Financeira, Cliente, Processos, Aprendizado)
- [ ] Preencher 5 Forças de Porter (Concorrência, Fornecedores, Clientes, Substitutos, Entrantes)
- [ ] Preencher Stakeholders (Poder x Interesse)
- [ ] Preencher RBV/VRIO (Recursos e Capacidades)
- [x] Testar salvamento de todas as análises - FUNCIONANDO


## BUG - Botões de Adicionar Indicador (BSC)
- [x] Investigar por que os botões de "+" não estão funcionando no BSC
- [x] Verificar se há erro no console do navegador
- [x] Corrigir funcionalidade dos botões de adicionar indicador
- [x] Testar adição de indicadores em todas as perspectivas (Financeira, Cliente, Processos, Aprendizado) - FUNCIONANDO


## BUG - Botões Desabilitados em Processos e Aprendizado
- [ ] Investigar por que botões de Processos Internos e Aprendizado estão desabilitados (cinza)
- [ ] Corrigir lógica de validação que está bloqueando os botões
- [ ] Testar adição de indicadores em Processos Internos
- [ ] Testar adição de indicadores em Aprendizado e Crescimento

## FEATURE - Criar Perspectivas Dinamicamente
- [ ] Adicionar botão "Adicionar Perspectiva" no BSC
- [ ] Criar formulário para definir nome, cor e ícone da nova perspectiva
- [ ] Salvar novas perspectivas no banco de dados
- [ ] Permitir editar/deletar perspectivas customizadas
- [ ] Testar criação de múltiplas perspectivas


## BUGS RESOLVIDOS - Botões e Perspectivas Customizadas
- [x] Bot\u00f5es de Processos Internos e Aprendizado desabilitados - CORRIGIDO
- [x] L\u00f3gica de valida\u00e7\u00e3o dos bot\u00f5es simplificada
- [x] Todos os bot\u00f5es de adicionar indicador funcionando
- [x] Criar novas perspectivas dinamicamente - IMPLEMENTADO
- [x] Perspectiva "Inova\u00e7\u00e3o e Tecnologia" criada com sucesso
- [x] \u00cdcone padr\u00e3o para perspectivas customizadas


## BUG - PESTEL não permite preencher informações
- [x] Investigar por que não consegue adicionar fatores PESTEL - CORRIGIDO
- [x] Verificar se há erro no console do navegador - import de useState faltava
- [x] Corrigir funcionalidade de preenchimento do PESTEL - CORRIGIDO
- [x] Testar adição de fatores em todas as categorias (Político, Econômico, Social, Tecnológico, Ambiental, Legal) - FUNCIONANDO


## FEATURE - Modal de Edição de Fatores PESTEL
- [ ] Criar componente Modal para editar fator
- [ ] Implementar sliders de impacto e probabilidade no modal
- [ ] Adicionar campo de descrição editável
- [ ] Implementar botão de Salvar alterações
- [ ] Implementar botão de Deletar fator
- [ ] Testar modal ao clicar em fator existente
- [ ] Testar atualização de valores após edição


## FEATURE CONCLUÍDA - Modal de Edição de Fatores PESTEL
- [x] Adicionar estado de fator em edição
- [x] Criar modal com sliders de impacto e probabilidade
- [x] Implementar função de salvar alterações
- [x] Implementar função de deletar fator
- [x] Testar modal de edição completo - FUNCIONANDO PERFEITAMENTE

## Correção de Banco de Dados e Novas Funcionalidades
- [x] Fazer backup completo do banco de dados
- [x] Remover todas as tabelas do banco
- [x] Limpar histórico de migrações do Drizzle
- [x] Regenerar e executar migrações do zero
- [x] Restaurar dados do backup
- [x] Testar persistência de configurações de template
- [x] Implementar botão para excluir empresas do grupo

## Correção de Erros TypeScript e Salvamento Automático
- [ ] Corrigir erros TypeScript em PlanejamentoEstrategico.tsx
- [ ] Corrigir erros TypeScript em OkrLite.tsx
- [ ] Corrigir erros TypeScript em componentes Lite
- [ ] Implementar salvamento automático nas análises PESTEL
- [ ] Implementar salvamento automático nas análises SWOT
- [ ] Implementar salvamento automático nas análises OKR
- [ ] Testar funcionalidades de auto-save


## Correção de Erros TypeScript e Auto-Save (Jan 2026)
- [x] Corrigir erros TypeScript principais (81 -> 8 erros)
- [x] Corrigir pdfExport.ts - COLORS não definido
- [x] Corrigir BscLite.tsx - template vs templates
- [x] Corrigir DashboardGrupoAnalises.tsx - propriedades incorretas
- [x] Corrigir KpiValoresDialog.tsx - tipos de união
- [x] Implementar salvamento automático em PESTEL (debounce 2s)
- [x] Implementar salvamento automático em SWOT (debounce 2s)
- [x] Implementar salvamento automático em OKR (debounce 2s)
- [x] Adicionar indicador visual de auto-save (salvando/salvo/erro)


## Auto-Save Componentes Restantes e Correção TypeScript (Jan 2026)
- [ ] Implementar auto-save em BSC
- [ ] Implementar auto-save em 5 Forças
- [ ] Implementar auto-save em Stakeholders
- [ ] Implementar auto-save em RBV/VRIO
- [ ] Corrigir IdentidadeOrganizacional.tsx (8 erros TypeScript)


## Auto-Save Componentes e Correção TypeScript (Concluído)
- [x] Implementar auto-save em PESTEL (debounce 2s)
- [x] Implementar auto-save em SWOT (debounce 2s)
- [x] Implementar auto-save em OKR (debounce 2s)
- [x] Implementar auto-save em BSC (debounce 2s)
- [x] Implementar auto-save em 5 Forças (debounce 2s)
- [x] Implementar auto-save em Stakeholders (debounce 2s)
- [x] Implementar auto-save em RBV/VRIO (debounce 2s)
- [x] Adicionar indicador visual de status (salvando/salvo/erro)
- [x] Corrigir erros TypeScript (81 -> 0 erros)
- [x] Corrigir IdentidadeOrganizacional.tsx
- [x] Corrigir DashboardAnalises.tsx (getBsc)
- [x] Corrigir BscLite.tsx (tipos de perspectiva)
- [x] Corrigir AnalisePestelLite.tsx (tipos de categoria e CommentSection)


## Bug Report - Botão Novo Usuário
- [ ] Corrigir botão "Novo Usuário" que não está funcionando


## Botão Novo Usuário - Corrigido
- [x] Corrigir botão "Novo Usuário" que não estava funcionando
- [x] Implementar modal de criação de usuário com campos Nome, Email, Perfil
- [x] Adicionar procedure usuarios.create no backend
- [x] Adicionar procedure usuarios.delete no backend
- [x] Testar criação de usuário com sucesso


## Correções TypeScript e Funcionalidades de Usuário - 16/01/2026
- [x] Corrigir erros TypeScript relacionados a createUser e deleteUser
- [x] Implementar import dinâmico para funções de usuário no routers.ts
- [x] Testar criação de usuário via modal - funcionando
- [x] Verificar que todos os erros TypeScript foram resolvidos (0 erros)


## Bug Fix - Loop de Notificações em PESTEL - 16/01/2026
- [x] Corrigir loop infinito de toasts de sucesso em PESTEL
- [x] Verificar lógica de auto-save e debounce
- [x] Remover notificações duplicadas ou redundantes


## Substituição de Alerts por Toast - 16/01/2026
- [x] Identificar todos os arquivos com alerts (22 alerts em 9 arquivos)
- [x] Criar hook customizado useNotification para padronizar notificações
- [x] Substituir alerts em AnalisePestelLite.tsx (2 alerts)
- [x] Substituir alerts em CommentSection.tsx (6 alerts)
- [x] Substituir alerts em ExportarPDF.tsx (2 alerts)
- [x] Substituir alerts em NotificationButton.tsx (3 alerts)
- [x] Substituir alerts em VersionHistory.tsx (2 alerts)
- [x] Substituir alerts em AnalisePestelCompleta.tsx (1 alert)
- [x] Substituir alerts em AnalisesRestantes.tsx (4 alerts)
- [x] Substituir alerts em BscLite.tsx (1 alert)
- [x] Substituir alerts em CincoForcasCompleta.tsx (1 alert)
- [x] Testar todas as notificações Toast


## Remoção de Notificações de Salvamento - 16/01/2026
- [x] Remover notificações de salvamento em AnalisePestelCompleta.tsx
- [x] Remover notificações de salvamento em AnalisesRestantes.tsx (4 notificações)
- [x] Remover notificações de salvamento em CincoForcasCompleta.tsx
- [x] Testar sistema sem notificações de salvamento


## Sistema de Desfazer/Refazer (Undo/Redo) - 16/01/2026
- [x] Criar hook customizado useUndoRedo para gerenciar histórico de estados
- [x] Integrar Undo/Redo em AnalisePestelLite.tsx
- [x] Integrar Undo/Redo em AnalisePestelCompleta.tsx
- [x] Integrar Undo/Redo em CincoForcasCompleta.tsx
- [x] Integrar Undo/Redo em AnalisesRestantes.tsx (Stakeholders, SWOT, OKR, BSC)
- [x] Criar componente UndoRedoToolbar com botões Desfazer/Refazer
- [x] Adicionar atalhos de teclado (Ctrl+Z, Ctrl+Y) no hook
- [x] Testar funcionalidade Undo/Redo em todos os componentes (Testado em PESTEL)


## Plano de Ação com Matriz de Priorização para PESTEL - 16/01/2026
- [x] Criar schema de banco de dados para planos de ação (pestel_plano_acao)
- [x] Criar componente PlanoDeAcaoPestel com matriz de priorização
- [x] Implementar estratégias de prevenção, proteção e mitigação
- [x] Integrar em AnalisePestelLite.tsx
- [x] Integrar em AnalisePestelCompleta.tsx
- [ ] Integrar em todos os modais PESTEL do sistema (AnalisesRestantes.tsx)
- [x] Testar funcionalidade de plano de ação (Testado com sucesso)
- [x] Testar matriz de priorização (Testado com sucesso)


## Bugs Encontrados - 16/01/2026
- [x] Corrigir modal de sucesso em SWOT (remover alert/notificação) - Resolvido com remoção de alerts anteriores

## Recomendações em Progresso - 16/01/2026
- [x] Integrar Plano de Ação em AnalisesRestantes.tsx (Stakeholders, SWOT, OKR, BSC)
- [ ] Implementar persistência em banco de dados para PlanoDeAcaoPestel
- [x] Criar dashboard de acompanhamento de ações (consolidado por status e estratégia) - DashboardAcoes.tsx criado


## Remoção de Mensagens de Salvamento - 16/01/2026
- [x] Remover toasts "Salvo com sucesso" de todos os componentes (5 toasts removidos)
- [x] Remover toasts "Salvo automaticamente" de AnalisePestelLite
- [x] Testar sistema sem mensagens de salvamento (Testado com sucesso em PESTEL)


## Correção - Plano de Ação Integrado em PESTEL - 16/01/2026
- [x] Refazer PlanoDeAcaoPestel para aparecer DENTRO do modal de PESTEL (após fatores identificados)
- [x] Implementar matriz de priorização com estratégias (Prevenção, Proteção, Mitigação) para cada fator
- [x] Integrar em AnalisePestelLite.tsx corretamente
- [x] Integrar em AnalisePestelCompleta.tsx corretamente
- [ ] Integrar em todos os modais PESTEL de AnalisesRestantes.tsx
- [ ] Testar funcionalidade completa em todos os modais


## Integração de Plano de Ação em Outros Modais - 16/01/2026
- [x] Integrar PlanoDeAcaoPestelIntegrado em Stakeholders
- [x] Integrar PlanoDeAcaoPestelIntegrado em SWOT
- [x] Integrar PlanoDeAcaoPestelIntegrado em OKR
- [x] Integrar PlanoDeAcaoPestelIntegrado em BSC (4 perspectivas)
- [x] Corrigir erro de JSX em AnalisePestelLite.tsx
- [ ] Testar funcionalidade em todos os modais


## Persistência do Plano de Ação - 16/01/2026
- [x] Criar procedures tRPC para salvar ações do Plano
- [x] Criar procedures tRPC para atualizar ações do Plano
- [x] Criar procedures tRPC para deletar ações do Plano
- [x] Criar procedures tRPC para recuperar ações do Plano
- [x] Conectar PlanoDeAcaoPestelIntegrado com tRPC (imports adicionados)
- [ ] Testar persistência de ações em banco de dados
- [ ] Validar dados salvos entre sessões


## Remoção de Análises - Grupo Arqueo Participações - 16/01/2026
- [x] Remover análise de 5 Forças do Planejamento
- [x] Remover análise de Stakeholders do Planejamento
- [x] Remover análise de VRIO do Planejamento
- [x] Remover análise de OKRs do Planejamento
- [x] Atualizar navegação para mostrar apenas PESTEL, SWOT e BSC
- [x] Testar remoção das análises (Confirmado - apenas PESTEL, SWOT e BSC aparecem)


## Plano de Ação em SwotLite - 16/01/2026
- [x] Adicionar PlanoDeAcaoPestelIntegrado em SwotLite.tsx
- [x] Testar Plano de Ação em SWOT expandida (Confirmado - Plano de Ação aparece com 3 estratégias)


## Plano de Ação em Todas as Empresas - 16/01/2026
- [x] Verificar estrutura de dados para Grupo Arqueo Brasil
- [x] Implementar Plano de Ação em BscLite.tsx
- [x] Garantir inclusão automática em futuras áreas de negócios (Componente PlanoDeAcaoPestelIntegrado reusável)
- [x] Testar Planos de Ação em Grupo Arqueo Brasil (Confirmado - Plano de Ação aparece em BSC com 3 estratégias)


## Melhorias de Navegação - 16/01/2026
- [x] Adicionar botão de voltar em Gestão de Empresas
- [x] Testar navegação de volta


## Plano de Ação em Áreas de Negócio - 16/01/2026
- [x] Adicionar PlanoDeAcaoPestelIntegrado em PlanejamentoEstrategicoArea.tsx (PESTEL) - Já integrado automaticamente
- [x] Adicionar PlanoDeAcaoPestelIntegrado em DashboardAnalisesArea.tsx se necessário - Não necessário
- [x] Testar Plano de Ação em Áreas de Negócio - CONFIRMADO em PESTEL, SWOT e BSC
- [x] Validar persistência de ações em banco de dados por área - Testado com sucesso
- [x] Implementar Plano de Ação do PESTEL do Arqueo Participações nas Áreas de Negócio - CONFIRMADO FUNCIONANDO


## Plano de Ação em Empresas do Grupo - 16/01/2026
- [x] Identificar páginas de planejamento de empresas (PlanejamentoEstrategicoEmpresa.tsx)
- [x] Verificar se PlanoDeAcaoPestelIntegrado já está integrado nas análises de empresas - JÁ INTEGRADO
- [x] Adicionar PlanoDeAcaoPestelIntegrado se necessário - Não necessário, já integrado
- [x] Testar Plano de Ação em empresas do grupo - Testado em PESTEL, SWOT e BSC
- [x] Validar funcionamento em todas as empresas cadastradas - Testado em Arqueoproject e arqueogis


## Vinculação Empresas às Áreas de Negócio - 16/01/2026
- [x] Analisar estrutura atual de empresas e áreas de negócio
- [x] Criar tabela de vinculação empresa_area_vinculo no banco de dados
- [x] Implementar procedures tRPC para vincular/desvincular empresas (getEmpresasVinculadas, getEmpresasDisponiveis, vincularEmpresaArea, desvincularEmpresaArea)
- [x] Adicionar botão "Vincular Empresas" na página de Área de Negócio
- [x] Criar modal para selecionar empresas do repositório
- [x] Exibir empresas vinculadas na área de negócio (card com badges)
- [x] Testar funcionalidade completa (Testado - Vinculou Arqueoproject e arqueogis ao Grupo Arqueo Brasil)


## Bug Fix - Botões Desvincular Empresas - 16/01/2026
- [x] Corrigir botões de desvincular (X) que não funcionam no modal de vinculação - FUNCIONANDO CORRETAMENTE
- [x] Testar desvinculação de empresas - Testado com sucesso (desvinculou e revinculou Arqueoproject)


## Plano de Ação no PESTEL das Empresas - 16/01/2026
- [x] Verificar PESTEL das empresas - Testado em Arqueoproject
- [x] Testar Plano de Ação no PESTEL das empresas - CONFIRMADO FUNCIONANDO com 3 estratégias
- [x] Validar funcionamento em todas as empresas do grupo - Plano de Ação integrado automaticamente


## Bug Fix - Mensagem de Erro "Uma página incorporada em 3000-..." - 16/01/2026
- [ ] Localizar origem da mensagem de erro
- [ ] Remover mensagem de erro do app
- [ ] Testar remoção


## Melhoria de Layout e Design - 16/01/2026
- [x] Preparar logo do Grupo Arqueo - Logo PNG adicionada
- [x] Definir paleta de cores (bordo, laranja, azul, amarelo) - Cores OKLCH configuradas
- [x] Atualizar tema global e CSS - index.css atualizado com cores do Grupo Arqueo
- [x] Melhorar layout da página inicial - Home.tsx com gradientes e efeitos modernos
- [x] Melhorar layout dos cards e componentes - Cards com hover effects e gradientes
- [x] Testar layout e fazer ajustes finais - Testado e funcionando


## MODO RELEASE - IA Generativa em PESTEL
- [x] Criar procedure tRPC planoAcao.gerarComIA - server/routers.ts linha 1714-1741
- [x] Adicionar botão "Gerar com IA" com Sparkles icon - PlanoDeAcaoPestelIntegrado.tsx linha 160-224
- [x] Implementar loading state e notificações - setCarregandoIA + notification.success/error
- [x] Criar testes vitest - server/planoAcao.test.ts (2 testes passando)
- [x] Botão visível e funcional na UI - Testado em empresa Arqueoproject


## IA Generativa - Plano de Ação PESTEL - Modo Release
- [ ] Criar procedure tRPC para gerar plano de ação com IA (Prevenção, Proteção, Mitigação)
- [ ] Adicionar botão "Gerar com IA" no PlanoDeAcaoPestelIntegrado
- [ ] Implementar loading e exibição das ações geradas
- [ ] Testar geração de plano de ação com IA
- [ ] Criar testes vitest para procedure de IA


## BUG - Riscos PESTEL Sumiram - Modo Release
- [x] Investigar causa do desaparecimento de riscos/fatores PESTEL - CAUSA RAIZ ENCONTRADA
- [x] Verificar se é problema de persistência no banco de dados - SIM, problema em savePestelFatores
- [x] Verificar se é problema de estado local (useState) - NÃO, era problema de validação no banco
- [x] Corrigir bug - CORRIGIDO em server/db.ts linhas 1080-1121
- [x] Testar e validar - TESTES PASSARAM, fatores persistem corretamente


## BUG - Botões e IA PESTEL Não Funcionam - Modo Release
- [x] Diagnosticar por que botões não estão funcionando - CAUSA: evento borbulhando do div pai
- [x] Diagnosticar por que IA não está funcionando - RESOLVIDO com stopPropagation
- [x] Corrigir botões e IA - CORRIGIDO em AnalisePestelLite.tsx e PlanoDeAcaoPestelIntegrado.tsx
- [x] Testar e validar - BOTÕES FUNCIONANDO PERFEITAMENTE

## Nova Feature - Botão Salvar Individual PESTEL
- [x] Corrigir salvamento de fatores PESTEL (problema de acentos resolvido)

## Bugs Reportados pelo Usuário
- [ ] Deletar 6 fatores sociais duplicados (testes)
- [x] Botão de edição adicionado com modal contendo sliders funcionais

## Problemas Reais Reportados
- [x] Botão de edição adicionado com modal contendo sliders funcionais
- [x] Botão de edição (ícone lápis) adicionado em cada card de fator
- [x] Implementar módulo de Gestão Orçamentária Empresarial (8 tabelas, 5 abas, dashboard, importação CSV/ERP, categorias, 14 categorias padrão, 52 testes passando)
- [x] Seleção de metodologias por empresa com filtro no Hub de Planejamento
- [ ] Redesenhar dialog de Configurar Metodologias: mais amplo, cards horizontais, texto completo
- [x] Redesenhar dialog de Configurar Metodologias: mais amplo, cards horizontais, texto completo (já feito)
- [x] Integrar SeletorMetodologias no Hub de Área de Negócio (empresaId = -100 - areaId)
- [x] Integrar SeletorMetodologias no Hub do Grupo (empresaId = 0)
- [x] Integrar SeletorMetodologias no Hub de Participações (empresaId = -1)
- [x] Corrigir segundo analises.map para usar analisesFiltradas em todos os hubs

## Área de Negócio - Ajustes de Feature
- [x] Adicionar card de Gestão Orçamentária na lista de análises da Área de Negócio
- [x] Confirmar que botão Configurar Metodologias já está presente na Área de Negócio
- [x] Adicionar card de Gestão Orçamentária no hub do Grupo (empresaId=0)
- [x] Adicionar card de Gestão Orçamentária no hub de Participações (empresaId=-1)

## Gestão Orçamentária - Categorias e Subcategorias
- [x] Criar tabelas no banco: orcamento_categorias e orcamento_subcategorias (já existiam)
- [x] Implementar procedures tRPC CRUD para categorias e subcategorias (adicionado updateSubcategoria)
- [x] Implementar UI na aba Categorias com árvore hierárquica, edição inline e filtros
- [x] Suporte a tipos: Custo, Despesa, Receita, Investimento e Outro
- [x] Integrar categorias/subcategorias no lançamento orçamentário (já integrado)

## Gestão Orçamentária - Subcategorias inline
- [x] Adicionar formulário inline de nova subcategoria diretamente dentro do card da categoria (sem modal separado)

## Gestão Orçamentária - IA + Dashboard
- [ ] Backend: procedure importarOrcamentoIA (upload PDF/planilha → extração e categorização automática via IA)
- [ ] Backend: procedure analisarOrcamentoIA (riscos, projeções, recomendações via IA)
- [ ] Aba Importação: upload drag-and-drop PDF/XLSX, preview dos itens extraídos, confirmação e importação
- [ ] Dashboard orçamentário: gráficos planejado vs executado, breakdown por categoria, tendência mensal
- [ ] Painel Análise IA: riscos identificados, projeções de desvio, recomendações de otimização

## Gestão Orçamentária - IA + Dashboard + Análise
- [x] Importação inteligente com IA (PDF/XLSX/CSV) com categorização automática
- [x] Dashboard orçamentário com gráficos de planejado vs executado e evolução acumulada
- [x] Painel de Análise IA com riscos, projeções e recomendações (aba Análise IA)
- [x] Procedure analisarOrcamentoIA no backend (riscos + projeções + recomendações + score)
- [x] Procedure importarOrcamentoIA no backend (extração de dados de PDF/XLSX/CSV via IA)
- [x] Componente OrcamentoAnaliseIA com ScoreGauge, alertas, riscos, projeções e recomendações
- [x] Componente OrcamentoImportacao reescrito com upload drag-and-drop e preview de lançamentos IA

## Home - Reorganização Hierárquica
- [x] Exibir empresas dentro de sua respectiva área de negócio na Home (não listadas separadamente)

## Módulo Contratos (SGC) - Fase 1

### Backend
- [ ] Schema: tabelas contratos, clientes, marcos_financeiros, boletins_medicao, aprovacoes, riscos_contratuais, auditoria_contratos
- [ ] Router tRPC: contratos (CRUD completo)
- [ ] Router tRPC: clientes (CRUD completo)
- [ ] Router tRPC: marcos_financeiros (CRUD + status automático)
- [ ] Router tRPC: boletins_medicao (CRUD + fluxo de aprovação)
- [ ] Router tRPC: aprovacoes (workflow de aprovação)
- [ ] Router tRPC: riscos_contratuais (CRUD + análise IA)
- [ ] Router tRPC: relatorios_contratos (dashboard + relatórios)
- [ ] Auditoria: trilha de auditoria para todas operações críticas
- [ ] Sincronização: vínculo contratos ↔ empresas do app principal

### Frontend
- [ ] Página /contratos (hub de contratos)
- [ ] Página /contratos/dashboard
- [ ] Página /contratos/clientes
- [ ] Página /contratos/contratos
- [ ] Página /contratos/marcos-financeiros
- [ ] Página /contratos/boletins
- [ ] Página /contratos/aprovacoes
- [ ] Página /contratos/riscos
- [ ] Página /contratos/relatorios
- [ ] Página /contratos/configuracoes
- [ ] Entrada de navegação no app principal (sem alterar estrutura existente)
- [ ] Upload de PDF com extração IA de dados do contrato

### Fase 2 - Preparação Arquitetural
- [ ] Documento de plano de consolidação futura (mapa de entidades, checklist de migração)

## Módulo Contratos (SGC) - Fase 1 Concluída
- [x] Criar schema do banco: 10 tabelas do domínio Contratos (clientes, contratos, aditivos, marcos, boletins, riscos, documentos, avaliações, itens de avaliação, auditoria)
- [x] Implementar routers tRPC: procedures CRUD + IA para contratos (30+ procedures)
- [x] Criar contratos.db.ts com funções de banco incluindo auditoria automática
- [x] Criar páginas: Contratos (lista + dashboard), ContratoDetalhe, ContratoForm, ContratosClientes
- [x] Registrar rotas no App.tsx (/contratos, /contratos/novo, /contratos/clientes, /contratos/:id)
- [x] Adicionar card de acesso ao módulo Contratos na Home
- [x] Implementar auditoria e logs de contratos (registrarAuditoriaContrato em todas as operações)
- [x] Gerar documentação da Fase 2 (docs/SGC_Fase2_Plano_Consolidacao.md)
- [x] Fase 2: Extração IA de PDF (contratos + aditivos) com revisão obrigatória
- [x] Fase 2: Cadastro de clientes via CNPJ + leitura de cartão CNPJ com IA
- [x] Fase 2: Workflow de Boletim de Medição com aprovação por e-mail
- [x] Fase 2: Metodologias de avaliação customizáveis (clouds + critérios + pesos)
- [x] Fase 2: Avaliação de desempenho contratual com trigger de Plano de Ação (score < 7)
- [ ] Fase 2: Currículos de usuários internos com extração IA

## Contratos - Reorganização por Empresa
- [ ] Criar rotas /empresa/:id/contratos, /empresa/:id/contratos/novo, /empresa/:id/contratos/:contratoId
- [ ] Adaptar páginas Contratos, ContratoDetalhe, ContratoForm para receber empresaId via parâmetro de rota
- [ ] Adicionar card de Contratos no hub de planejamento de cada empresa
- [ ] Remover card global de Contratos da Home
- [ ] Remover rotas globais /contratos do App.tsx

## Contratos - Reorganização por Empresa
- [x] Mover Gestão de Contratos para dentro de cada empresa (rota /empresa/:id/contratos)
- [x] Adaptar Contratos.tsx para receber empresaId como prop
- [x] Adaptar ContratoDetalhe.tsx para receber empresaId e contratoId como props
- [x] Adaptar ContratosClientes.tsx para receber empresaId como prop
- [x] Adaptar ContratoForm.tsx para receber empresaId como prop
- [x] Adicionar card de Gestão de Contratos no hub de planejamento da empresa
- [x] Remover card global de Contratos da Home
- [x] Remover rotas globais de contratos do App.tsx

## Cadastro de Clientes via CNPJ com IA
- [x] Enriquecer tabela contratos_clientes com campos de endereço, contatos e dados da Receita Federal
- [x] Criar procedure tRPC buscarCNPJ que consulta API pública (ReceitaWS/BrasilAPI) e retorna dados
- [x] Criar procedure tRPC de busca de cliente por CNPJ no banco (evitar duplicatas)
- [x] Implementar UI de busca CNPJ com preenchimento automático no formulário de clientes
- [x] Adicionar upload de cartão CNPJ (PDF/imagem) com extração IA via LLM
- [x] Integrar busca CNPJ no ContratoForm (campo cliente com autocomplete por CNPJ)
- [x] Exibir dados completos do cliente (endereço, sócios, atividade) na página ContratosClientes

## Correção - Card de Gestão de Contratos
- [x] Card de Gestão de Contratos não aparece quando empresa tem metodologias configuradas (ID "contratos" não está na lista METODOLOGIAS_DISPONIVEIS)

## Módulo de Gestão de Clientes (Centralizado)
- [ ] Tabela centralizada de clientes (independente de empresa/contrato)
- [ ] Upload de cartão CNPJ (imagem/PDF) com extração automática via IA
- [ ] Busca automática por CNPJ na BrasilAPI/ReceitaWS com fallback IA
- [ ] Campos completos: razão social, nome fantasia, CPF/CNPJ, endereço, contato, natureza jurídica, data abertura, situação cadastral, atividade econômica
- [ ] Listagem de clientes com busca por nome/CNPJ e filtros
- [ ] Visualização detalhada do cliente com contratos vinculados
- [ ] Rota /clientes e entrada no menu de navegação
- [ ] Vinculação de clientes existentes a empresas do grupo

## Módulo de Gestão de Clientes (ZIP v1.0.0) — Implantação Isolada
- [x] Criar tabelas `clients` e `company_clients` no banco e no schema.ts
- [x] Implantar services: cnpjConsulta.ts e cnpjOcr.ts em server/services/
- [x] Criar router tRPC isolado: server/routers/clients.router.ts
- [x] Registrar router `clients` no server/routers.ts (sem remover nada)
- [x] Implantar componentes: CNPJCardUpload.tsx, ClientLogo.tsx, StatusBadge.tsx
- [x] Implantar páginas: Clients.tsx e ClientDetails.tsx adaptadas ao projeto
- [x] Registrar rotas /clients e /clients/:id no App.tsx
- [x] Adicionar botão "Clientes" no menu principal do Home.tsx
- [x] Escrever testes para o router de clientes

## Módulo de Gestão de Contratos (ZIP v1.0.0) — Implantação Isolada
- [x] Adicionar tabelas contracts, financial_milestones, contract_amendments, contract_risks, contract_documents, contract_approvers, contract_responsible, audit_logs ao schema.ts
- [x] Adicionar tabela sequences ao schema.ts e criar via SQL
- [x] Criar server/contracts.db.ts com todos os helpers de banco
- [x] Criar server/services/sequences.ts (geração de sequências)
- [x] Criar server/services/contractNumbering.ts (numeração de contratos)
- [x] Criar server/services/amendmentAnalysis.ts (análise de aditivos por IA)
- [x] Criar server/services/contractAnalysis.ts (análise de contratos por IA)
- [x] Criar server/routers/contracts.ts com todas as procedures do módulo
- [x] Registrar todos os routers do módulo no server/routers.ts
- [x] Criar página ContratosZip.tsx (listagem com filtros e stats)
- [x] Criar página ContratoZipForm.tsx (formulário com upload PDF + análise IA + revisão obrigatória)
- [x] Criar página ContratoZipDetalhe.tsx (detalhe com 6 abas: visão geral, marcos, aditivos, riscos, documentos, responsáveis)
- [x] Registrar rotas /gestao-contratos, /gestao-contratos/novo, /gestao-contratos/:id no App.tsx
- [x] Adicionar botão "Contratos" no menu principal do Home.tsx
- [x] Escrever testes do módulo de contratos (89 testes passando)

## Integração Fluxo Gestão de Clientes → Contratos
- [x] Adicionar aba "Contratos" na página GestaoClienteDetalhe com listagem dos contratos do cliente
- [x] Adicionar botão "Novo Contrato" na aba de contratos do cliente
- [x] Adaptar ContratoZipForm para receber clientId via query string e pré-preencher o cliente
- [x] Garantir que ao criar contrato a partir do cliente, o retorno volta para a página do cliente

## Boletim de Medição Automático e Aditivos com IA
- [x] Criar DB helpers para boletins (boletins.db.ts)
- [x] Criar router tRPC de boletins (boletins.ts)
- [x] Criar página de listagem de boletins por contrato (aba Boletins em ContratoZipDetalhe)
- [x] Criar página pública de aprovação de boletim via token (BoletimAprovacao.tsx)
- [x] Integrar boletim automático via botão Gerar Boletim em cada marco financeiro
- [x] Adicionar aba "Boletins" na página ContratoZipDetalhe
- [x] Adicionar botão "Gerar Boletim" em cada marco financeiro
- [x] Implementar aditivo com análise IA (upload PDF + extração + revisão obrigatória)
- [x] Adicionar página AditivoZipForm.tsx com fluxo IA idêntico ao ContratoZipForm
- [x] Integrar AditivoZipForm na aba de Aditivos do ContratoZipDetalhe

## Consolidação Arquitetural (2026-03-20)
- [ ] Remover tabelas ZIP duplicadas do schema (clients, company_clients, contracts, financial_milestones, contract_amendments, contract_risks, contract_documents, contract_approvers, contract_responsible, audit_logs, sequences)
- [ ] Consolidar router contratos.ts como único router de clientes e contratos
- [ ] Remover routers ZIP duplicados do routers.ts
- [ ] Remover páginas ZIP duplicadas (ContratosZip, ContratoZipDetalhe, ContratoZipForm, AditivoZipForm, BoletimAprovacao)
- [ ] Atualizar GestaoClientes para usar trpc.contratos.clientes (SGC base)
- [ ] Atualizar GestaoClienteDetalhe para mostrar contratos SGC
- [ ] Atualizar ContratoDetalhe (SGC) com abas completas
- [ ] Garantir que /empresa/:id/contratos seja o ponto de entrada operacional
- [ ] Atualizar App.tsx: remover rotas ZIP, manter rotas SGC
- [ ] Atualizar Home.tsx: remover card Contratos ZIP concorrente
- [ ] Verificar TypeScript 0 erros após consolidação
- [ ] Rodar testes após consolidação

## Homologação — Correções Necessárias (Checklist pasted_content_2.txt)

### Seção 2 — Arquitetura e Navegação
- [ ] Corrigir link /gestao-contratos na Home — rota não existe, deve redirecionar para /empresa/:id/contratos ou criar visão global read-only
- [ ] Adicionar entrada de Contratos no hub da empresa (Empresas.tsx)
- [ ] Verificar que a visão global não concorre com a operação por empresa

### Seção 3 — CRUD de Clientes
- [ ] Verificar busca por CNPJ na GestaoClientes (buscarCNPJ mutation)
- [ ] Verificar upload de cartão CNPJ e extração IA (CNPJCardUpload)
- [ ] Verificar que nenhum dado é salvo sem confirmação do usuário

### Seção 4-5 — Contratos
- [ ] Verificar que contrato exige vínculo com cliente (ContratoForm — clienteId obrigatório)
- [ ] Verificar filtro por empresa e status na listagem
- [ ] Verificar KPIs e valores totais na listagem

### Seção 7 — Marcos Financeiros
- [ ] Verificar status automático de marco vencido
- [ ] Verificar edição de marco sem quebrar boletins vinculados

### Seção 8 — Boletins
- [ ] Verificar geração automática de boletim ao criar marco
- [ ] Verificar que PDF do boletim é gerado após aprovação/rejeição

### Seção 9 — Riscos
- [ ] Verificar aba de riscos com filtros e badges

### Seção 10 — Documentos
- [ ] Adicionar botão de upload de documento na aba Documentos do ContratoDetalhe
- [ ] Adicionar classificação IA ao fazer upload de documento

### Seção 11 — Auditoria
- [ ] Adicionar filtros por ação, período e entidade na aba Auditoria

### Seção 12 — Avaliações
- [ ] Verificar que AvaliacaoContratos tem CRUD completo, critérios, score e plano de ação

### Seção 16 — UX
- [ ] Verificar empty states em todas as abas
- [ ] Verificar feedback visual em formulários

## Correção de Navegação / Frontend (pasted_content_3)
- [x] Remover botões "Clientes" (/gestao-clientes) e "Contratos" (/gestao-contratos) do header da Home.tsx
- [ ] Manter acesso a Clientes apenas como cadastro mestre (link discreto)
- [x] Converter /gestao-contratos, /gestao-contratos/novo e /gestao-contratos/:id em redirects no App.tsx
- [x] Validar que hub da empresa mostra card Gestão de Contratos destacado
- [x] Validar que ContratoDetalhe.tsx mostra todas as 8 abas visíveis

## Menu Admin - Cadastro Mestre de Clientes
- [x] Adicionar link "Cadastro de Clientes" no bloco admin da Home.tsx (visível apenas para admin)
- [x] Link aponta para /gestao-clientes (cadastro mestre global)

## Checklist Visual Frontend (Pasted_content_17.txt)
- [x] Home: sem atalhos para fluxo antigo, orienta para empresas
- [x] Hub da empresa: card Gestão de Contratos visível e navegável
- [x] Listagem de contratos: título, empresa, KPIs, filtros, botão Novo Contrato, empty state
- [x] Formulário Novo Contrato: campos obrigatórios, cliente centralizado, upload PDF, botões salvar/cancelar
- [x] Extração IA: upload visível, feedback de loading, resultado editável, revisão antes de salvar
- [x] Detalhe do contrato: cabeçalho completo (nome, cliente, empresa, status, valor, datas)
- [x] Aba Visão Geral: informações principais carregam
- [x] Aba Aditivos: lista, botão novo aditivo, upload PDF
- [x] Aba Marcos Financeiros: lista, valores, vencimentos, status, botão criar
- [x] Aba Boletins: lista, status, aprovação/reprovação, PDF
- [x] Aba Riscos: lista, severidade, probabilidade, responsável, mitigação, botão criar
- [x] Aba Documentos: upload, lista, classificação, download
- [x] Aba Avaliações: estrutura, score, plano de ação
- [x] Aba Auditoria: logs, filtros, tabela legível
- [x] Clientes: listagem, busca, botão novo, detalhe com contratos vinculados
- [x] Rotas antigas: /gestao-contratos redireciona, sem duplicidade de módulo
- [x] Navegação: breadcrumbs, botão voltar, sem navegação circular
- [x] Estados visuais: loading, empty state, erro, sucesso, modais

## Card Gestão de Clientes no Hub da Empresa
- [x] Adicionar card "Gestão de Clientes" no hub da empresa (PlanejamentoEstrategicoEmpresa.tsx)
- [x] Criar rota /empresa/:id/clientes no App.tsx apontando para GestaoClientes filtrado por empresa
- [x] Adaptar GestaoClientes para aceitar empresaId como prop/param e filtrar clientes por empresa

## Vínculo Automático de Clientes à Empresa
- [x] Verificar schema e backend: empresaId salvo na criação do cliente
- [x] GestaoClientes: passar empresaId automaticamente no payload de criação quando acessado via /empresa/:id/clientes
- [x] Garantir que invalidate() da query usa o empresaId correto após criação/edição/exclusão

## Vincular Clientes Existentes à Empresa
- [x] Backend: procedure vincularClienteEmpresa (atualiza empresaId de cliente existente)
- [x] Backend: procedure desvincularClienteEmpresa (remove empresaId do cliente)
- [x] Frontend: modal seletor com busca de clientes globais não vinculados à empresa
- [x] Frontend: botão "Vincular Cliente Existente" visível apenas na view por empresa
- [x] Frontend: botão "Desvincular" em cada cliente na view por empresa

## Relacionamento N:N Clientes-Empresas
- [x] Criar tabela empresa_cliente no banco (clienteId, empresaId, createdAt)
- [x] Atualizar schema Drizzle com tabela empresaCliente
- [x] Atualizar helpers: listagem por empresa via JOIN, vincular/desvincular via tabela de junção
- [x] Atualizar procedures: vincularEmpresa e desvincularEmpresa usam tabela de junção
- [x] Atualizar frontend: modal seletor sem aviso de "já vinculado a outra empresa"
- [x] Atualizar frontend: botão desvincular remove da tabela de junção
- [x] Migrar dados existentes de empresa_id para a tabela de junção

## Upload de Arquivo + Extração IA na Gestão Orçamentária
- [x] Analisar estrutura atual do módulo (schema, routers, aba Importação)
- [x] Backend: procedure de upload de arquivo orçamentário (PDF/Excel/CSV)
- [x] Backend: procedure de extração por IA (LLM analisa arquivo e retorna categorias/itens/valores)
- [x] Frontend: interface de upload na aba Importação com drag-and-drop
- [x] Frontend: feedback de loading durante extração por IA
- [x] Frontend: tela de revisão dos dados extraídos (categorias, itens, valores mensais)
- [x] Frontend: botão de confirmação para salvar dados extraídos no banco
- [x] Persistência: salvar categorias/itens/valores extraídos nas tabelas existentes

## Criação de Empresas e Lançamento de Orçamento (Planilha)
- [x] Analisar planilha Excel: mapear plano de contas e valores por empresa
- [x] Criar empresa Arqueogis Preventiva na Área Arqueo Brasil
- [x] Criar empresa Arqueocean na Área Arqueo Brasil
- [x] Criar 16 categorias orçamentárias conforme plano de contas da planilha
- [x] Criar 48 subcategorias vinculadas às categorias
- [x] Criar versões orçamentárias 2026 para as 4 empresas (status aprovado)
- [x] Lançar orçamento Arqueoproject conforme planilha (44 linhas, R$ 3.297.931,94)
- [x] Lançar orçamento Arqueogis Geoprocessamento conforme planilha (15 linhas, R$ 201.311,32)
- [x] Lançar orçamento Arqueogis Preventiva conforme planilha (4 linhas, R$ 91.813,46)
- [x] Lançar orçamento Arqueocean conforme planilha (11 linhas, R$ 135.410,53)
- [x] Validar dados no banco: totais conferem com planilha original

## Correção: Empresas não aparecem na área Grupo Arqueo Brasil
- [x] Verificar areaId das empresas Arqueogis Preventiva (660003) e Arqueocean (660004)
- [x] Vincular empresas à área de negócio Grupo Arqueo Brasil (tabela empresa_area_vinculo)

## Importação Executado 1º Trimestre - Arqueocean
- [x] Extrair dados do PDF Gastos1TrimestreArqueocean (16 itens, total R$ 26.454,15)
- [x] Verificar estrutura de tabelas de executado no banco
- [x] Mapear itens do PDF para linhas planejadas e subcategorias existentes (12 itens mapeados)
- [x] Inserir valores executados no banco (Jan-Mar 2026) - 36 linhas, R$ 26.454,15 total
- [x] Validar dados importados: 3 meses x 12 itens = 36 linhas, total confere

## Importação Executado 1º Trimestre - Arqueoproject
- [x] Extrair dados do PDF Entrar-Zenply (80 itens, total R$ 1.067.154,75)
- [x] Mapear 80 itens do PDF para 48 subcategorias existentes no plano de contas
- [x] Inserir valores executados no banco (Jan-Mar 2026) - 240 linhas, R$ 1.067.154,75 total
- [x] Validar dados importados: 3 meses x 80 itens = 240 linhas, total confere

## Expansão Plano de Contas - Custos Operacionais de Projeto (Arqueoproject)
- [x] Criar 7 novas categorias: Custos Diretos de Projeto, Custos com Materiais e Serviços, Custos Trabalhistas Eventuais, Movimentações Financeiras, Tributos Operacionais, Investimentos e Melhorias, Despesas Não Classificadas
- [x] Criar 32 subcategorias para as novas categorias + 4 subcategorias extras em categorias existentes (Veículos)
- [x] Lançar planejado Jan-Mar com valores reais do executado (1/3 do trimestral por mês)
- [x] Projetar planejado Abr-Dez com média mensal do 1º trimestre (9 meses)
- [x] Validar totais: 80 linhas planejadas, R$ 4.984.894,42 total anual (antes: 44 linhas, R$ 3.297.931,94)

## Expansão Plano de Contas - Custos Operacionais de Projeto (Arqueocean)
- [x] Comparar executado vs planejado: 8 itens sem correspondência identificados
- [x] Reutilizar categorias existentes (Custos Diretos de Projeto, Movimentações Financeiras) + criar 2 novas subcategorias (Simples Nacional DAS, Taxas Diversas)
- [x] Lançar planejado Jan-Mar com valores reais do executado (8 novas linhas)
- [x] Projetar planejado Abr-Dez com média mensal do 1º trimestre
- [x] Validar totais: 19 linhas planejadas, R$ 179.869,46 total anual (antes: 11 linhas, R$ 135.410,53)

## Módulo de Relatórios Detalhados - Planejado vs Executado
- [x] Criar procedure tRPC getRelatorioDetalhado (planejado vs executado por categoria/subcategoria/mês)
- [x] Criar página RelatorioOrcamentario com tabela detalhada e filtros (categoria, mês, visão resumida/mensal)
- [x] Exibir variação absoluta (R$) e percentual (%) com componentes VariacaoIndicator
- [x] Incluir totalizadores por categoria e geral (cards + linha de total na tabela)
- [x] Adicionar indicadores visuais (badges: Abaixo/No alvo/Atenção/Acima) com cores
- [x] Permitir impressão do relatório (botão Imprimir com window.print)
- [x] Integrar como aba "Relatório" na GestaoOrcamentaria (7 abas)
- [x] Gráfico comparativo horizontal por categoria
- [x] Testes vitest: 4 testes passando (estrutura, filtro, empresa vazia, cálculo variação)

## Melhoria Relatório - Detalhamento Mensal Previsto vs Executado
- [x] Redesenhar visão mensal com tabela detalhada por mês selecionado + visão anual + evolução
- [x] Mostrar cada subcategoria com previsto, executado, variação, % e barra de progresso
- [x] Adicionar navegação entre meses (anterior/próximo + seleção rápida)
- [x] Incluir gráfico mensal comparativo por categoria
- [x] Cards de totais do mês + acumulado até o mês
- [x] 3 visões: Detalhamento Mensal, Resumo Anual, Evolução Mensal

## Módulo de Análise de Custos
- [x] Procedure tRPC getAnaliseCustos com classificação ABC, desvios e tendências
- [x] Classificação ABC automática dos gastos (A=80%, B=95%, C=100%)
- [x] Identificação dos maiores desvios (executado vs previsto) com alertas
- [x] Ranking de itens com maior potencial de economia (aba Economia)
- [x] Indicadores de tendência (crescente/estável/decrescente) via regressão linear
- [x] Separação Fixo vs Variável com gráfico de pizza
- [x] Alertas automáticos: acima_orcamento, tendencia_alta, gasto_nao_previsto, economia_possivel
- [x] Gráficos: Pareto ABC, treemap de gastos, pizza fixo/variável
- [x] 5 sub-abas: Resumo, Curva ABC, Alertas, Detalhado, Economia
- [x] Integrar como nova aba "Análise" na GestaoOrcamentaria (8 abas)
- [x] Testes vitest: 5 testes passando (estrutura, ABC, empresa vazia, totais, tendências)

## Controle de Revisões Orçamentárias
- [x] Adicionar campo "motivo_revisao" e "congelarOrigem" na duplicação de versão orçamentária
- [x] Procedure compararVersoes + listarVersoes no backend
- [x] Componente ComparativoVersoes: seletores, cards resumo, tabela expansível com status, detalhamento mensal
- [x] Seletor de versão no relatório Previsto vs Executado (aparece quando há múltiplas versões)
- [x] Congelamento automático da versão original ao criar revisão (checkbox no dialog)
- [x] Dialog "Criar Revisão" com motivo, nome sugerido e checkbox de congelar
- [x] Nova aba "Versões" na GestaoOrcamentaria (9 abas)
- [x] Testes vitest: 6 testes passando (listar, comparar, estrutura, erro, tipo função)

## Módulo de Gestão de Contratos (Receitas)
- [x] Schema: tabelas contratos, marcos_financeiros, boletins, aditivos, riscos, documentos, auditoria (já existiam)
- [x] Backend: CRUD de contratos com upload de PDF e extração por IA (já existia)
- [x] Backend: CRUD de marcos financeiros (já existia)
- [x] Backend: Boletins de medição com fluxo de aprovação (já existia)
- [x] Backend: CRUD de aditivos (financeiro/escopo) (já existia)
- [x] Frontend: Página de listagem de contratos por empresa (já existia)
- [x] Frontend: Formulário de cadastro de contrato com upload PDF (já existia)
- [x] Frontend: Página de detalhes do contrato com 7 abas (já existia)
- [x] Rotas no App.tsx (já existiam)
- [x] Backend: Procedure getDashboardReceita (receita prevista vs realizada por empresa/mês)
- [x] Backend: Procedure getResultadoOperacional (receita - custos = margem)
- [x] Frontend: Dashboard de Receita com 3 sub-abas (Receita, DRE, Por Contrato)
- [x] Frontend: DRE simplificado mensal com receita, despesa, resultado e margem
- [x] Frontend: KPIs de receita prevista, recebida, a receber e atrasados
- [x] Frontend: Pipeline de marcos por status (pendentes, aprovados, pagos, atrasados)
- [x] Frontend: Gráfico receita mensal prevista vs recebida
- [x] Frontend: Evolução do resultado operacional mensal
- [x] Frontend: Detalhamento por contrato com progresso
- [x] Integrado como aba "Financeiro" na GestaoOrcamentaria (10 abas)
- [x] Testes vitest: 9 testes passando (estrutura, meses, consolidado, DRE, margem, campos)

## Criação de Contrato via IA
- [x] Analisar funcionalidade existente de extração de PDF por IA
- [x] Aprimorar backend: extração com CNPJ, partes, cláusulas-chave, resumo executivo
- [x] Redesenhar frontend: Wizard de 4 passos (Upload → Revisão IA → Complementar → Confirmar)
- [x] Suporte a drag-and-drop de PDF
- [x] Preenchimento automático do formulário com dados extraídos
- [x] Edição inline de marcos financeiros na tela de revisão
- [x] Edição inline de riscos (categoria/probabilidade/impacto)
- [x] Auto-match de cliente por CNPJ extraído pela IA
- [x] Criação automática de marcos e riscos ao confirmar (via confirmarExtracao)
- [x] Modo manual disponível (pular IA)
- [x] Visualização de cláusulas-chave extraídas
- [x] Revisão obrigatória antes de salvar
- [x] Testes vitest: 7 testes passando

## Painel de Visualização de Riscos e Cláusulas-Chave
- [x] Backend: getPainelRiscos (por severidade, categoria, status, empresa, mapa de calor)
- [x] Backend: getPainelClausulas (por tipo, contrato, empresa)
- [x] Frontend: Dashboard de riscos com gráficos (pizza severidade, barras categoria)
- [x] Frontend: Mapa de calor de riscos (probabilidade x impacto) com 9 células
- [x] Frontend: Listagem de cláusulas-chave agrupadas por tipo com badges
- [x] Frontend: Filtros por empresa e status
- [x] Frontend: KPIs de risco (total, críticos, sem mitigação, gerados por IA)
- [x] Frontend: Tabela detalhada de riscos com contrato, severidade, status e ações
- [x] Frontend: 2 sub-abas (Riscos e Cláusulas)
- [x] Integrado como aba "Riscos" na GestaoOrcamentaria (11 abas)
- [x] Testes vitest: 10 testes passando

## Bug Fix: Alerta SWOT repetido
- [x] Investigar causa do alerta "Análise SWOT salva com sucesso!" aparecendo automaticamente ao entrar na SWOT
- [x] Corrigir o bug para que o alerta só apareça após ação explícita do usuário (SwotLite, OkrLite, AnalisePestelLite)
- [x] Testar a correção (128 testes passando)

## Integração de Gastos Arqueogis Preventiva 1º Trimestre
- [x] Extrair dados do PDF de gastos (30/03/2026, R$ 235.487,74 total)
- [x] Estruturar dados em JSON com categorias de despesas
- [x] Inserir 27 linhas de executado no banco (empresaId 660003)
- [x] Integrar com análises orçamentárias existentes

## Orçamento Planejado Arqueogis Preventiva
- [x] Analisar como foi feito o orçamento planejado da Arqueoproject (padrão a seguir)
- [x] Versão orçamentária já existia (versaoId=4, aprovada)
- [x] Distribuir gastos no orçamento planejado (17 linhas não-campo)
- [x] Incluir média de gastos com campo no orçamento (10 linhas de campo)
- [x] Criar projeção anual (R$ 941.951,16 total)
- [x] Verificar dados no sistema (27 linhas, total conferido)

## Bug Fix: Executado multiplicado no relatório Previsto vs Executado
- [x] Investigar causa do R$ 6.358.168,98 (27x R$ 235.487,74)
- [x] Corrigir mapeamento de categoriaId dos executados (7→30006, 60004→30013, etc.)
- [x] Corrigir bug de multiplicação em getRelatorioDetalhadoPvsE (subcategoriaId NULL causava duplicação)
- [x] Corrigir mesmo bug em getAnaliseCustos
- [x] getDashboardOrcamento já calculava corretamente (soma direta das linhas)
- [x] 128 testes passando

## Subcategorias Detalhadas - Arqueogis Preventiva
- [x] Mapear despesas executadas e subcategorias existentes no banco
- [x] Criar 9 novas subcategorias detalhadas (IDs 60001-60009)
- [x] Vincular 27 linhas de executado às subcategorias (27/27)
- [x] Vincular 27 linhas de planejado às mesmas subcategorias (27/27)
- [x] Verificar: 0 linhas sem subcategoria em executado e planejado

## Renomear Unidade e Vincular Empresa
- [x] Renomear unidade "Vinhos 24 horas BSB" para "Foods and Drinks" (areaId=30003)
- [x] Criar empresa "Vinho 24 Horas BSB" (id=780003) e vincular à unidade "Foods and Drinks"

## Identidade Organizacional - Arqueoproject
- [x] Extrair dados do site arqueoproject.com.br
- [x] Estruturar missão, visão, valores e política organizacional
- [x] Preencher identidade organizacional no banco de dados (empresaId=1)

## Bug Fix: React key prop no RelatorioOrcamentario
- [x] Localizar o componente RelatorioOrcamentario que estava gerando o erro
- [x] Adicionar key prop única nos 4 Fragments (linhas 418, 555, 672, 717)
- [x] Importar React e testar - 0 erros TypeScript

## Riscos e Plano de Ação - Arqueoproject
- [ ] Investigar por que a área de Riscos da Arqueoproject está vazia
- [ ] Popular riscos da Arqueoproject no banco de dados
- [ ] Criar funcionalidade de Plano de Ação para cada risco identificado
- [ ] Plano de Ação deve incluir: corte de custos, boas práticas e benchmarking

## Módulo Centralizado de Gestão de Riscos
- [ ] Criar tabela `riscos_empresa` no schema (riscos estratégicos/orçamentários por empresa)
- [ ] Criar tabela `planos_acao_risco` no schema (plano de ação vinculado a cada risco)
- [ ] Executar migração do banco (pnpm db:push)
- [ ] Criar procedures tRPC: listar, criar, editar, excluir riscos e planos de ação
- [ ] Criar procedure para consolidar riscos de todas as fontes (orçamento, contratos, estratégico)
- [ ] Criar página GestaoRiscos.tsx com matriz de calor e lista consolidada
- [ ] Adicionar card "Gestão de Riscos" na tela inicial de cada empresa
- [ ] Implementar Plano de Ação por risco com sugestão de IA (corte de custos + benchmarking)
- [ ] Mover riscos da aba Riscos do orçamento para o módulo centralizado
- [ ] Testar e salvar checkpoint

## Módulo Centralizado de Gestão de Riscos (Concluído)
- [x] Criar tabelas riscos_empresa e planos_acao_risco no banco de dados
- [x] Criar router gestaoRiscos com procedures: list, create, delete, listPlanos, gerarPlanoIA, resumo
- [x] Criar página GestaoRiscos.tsx com dashboard, matriz de riscos, lista e planos de ação
- [x] Adicionar botão "Riscos" nos cards das empresas (Empresas.tsx)
- [x] Registrar rota /empresa/:id/gestao-riscos no App.tsx
- [x] Plano de Ação com IA: prompt especializado em PMEs de arqueologia, benchmarking, corte de custos
- [x] 140 testes passando (12 novos testes em gestaoRiscos.test.ts)

## Histórico de Alterações de Riscos
- [ ] Criar tabela riscos_historico no banco de dados
- [ ] Criar procedure tRPC para registrar e listar histórico
- [ ] Disparar registro automático ao criar/editar/excluir risco
- [ ] Implementar visualização de histórico na página GestaoRiscos (timeline)
- [ ] Testar e verificar

## Histórico de Alterações de Riscos
- [x] Criar tabela riscos_historico no banco de dados
- [x] Criar procedures tRPC: listHistorico, listHistoricoEmpresa, adicionarComentario
- [x] Registrar histórico automático em create, update, delete, plano_criado, plano_ia
- [x] Implementar timeline de histórico por risco (modal com ícones por tipo de evento)
- [x] Implementar aba "Histórico" geral com últimas 50 alterações de todos os riscos
- [x] Adicionar caixa de comentários com Ctrl+Enter para enviar
- [x] 140 testes passando, 0 erros TypeScript

## Painel de Controle de Indicadores de Risco
- [ ] Criar procedure tRPC getDashboardRiscos com indicadores consolidados
- [ ] Implementar cards de KPIs: total de riscos, riscos críticos, riscos em monitoramento, planos ativos
- [ ] Implementar gráfico de distribuição por nível (Crítico/Alto/Médio/Baixo)
- [ ] Implementar gráfico de distribuição por categoria (Orçamentário/Operacional/Legal/etc.)
- [ ] Implementar gráfico de evolução temporal (riscos abertos por mês)
- [ ] Implementar ranking dos 5 riscos mais críticos
- [ ] Implementar indicador de cobertura (% riscos com plano de ação)
- [ ] Implementar indicador de tendência (riscos novos vs. resolvidos)
- [ ] Testar e verificar


## Integração com SGC (Sistema de Gestão de Contratos)
- [x] Criar sgcClient.ts - Cliente HTTP centralizado para SGC
- [x] Criar sgcDtos.ts - DTOs internos desacoplados do payload SGC
- [x] Criar contractsGateway.ts - Gateway com cache e fallback
- [x] Criar sgcDeepLinks.ts - Helper de deep links para SGC
- [x] Criar contratosGateway.ts - Router adaptado para SGC
- [x] Registrar contratosGatewayRouter no appRouter principal
- [x] Marcar router local de contratos como LEGADO
- [x] Configurar SGC_API_BASE_URL via webdev_request_secrets
- [x] Configurar SGC_INTERNAL_TOKEN via webdev_request_secrets
- [x] Configurar SGC_TIMEOUT_MS via webdev_request_secrets
- [x] Configurar SGC_ENABLED via webdev_request_secrets
- [x] Configurar SGC_PUBLIC_APP_URL via webdev_request_secrets
- [x] Bloquear mutations de escrita no gateway (create/update/delete)
- [x] Implementar cache com TTL de 5 minutos
- [x] Implementar fallback para indisponibilidade do SGC
- [x] Criar 37 testes de homologação da integração
- [x] Criar SGC_INTEGRATION.md - Documentação técnica completa
- [x] Gerar relatório de homologação final


## Tarefa Corretiva - Substituição Funcional Backend Clientes/Contratos
- [x] Mapear todos os pontos locais de clientes/contratos (páginas, rotas, procedures, db helpers, navegação)
- [x] Substituir procedures de leitura de contratos para consumir do SGC via gateway
- [x] Substituir procedures de leitura de clientes para consumir do SGC via gateway
- [x] Neutralizar/bloquear todas as mutations locais de escrita contratual
- [x] Neutralizar/bloquear todas as mutations locais de escrita de clientes
- [x] Adaptar frontend para exibir dados do SGC e incluir deep links para SGC
- [x] Executar testes de regressão e checkup final (183/183 testes passando)
- [x] Gerar evidência técnica obrigatória (lista de páginas, procedures, rotas afetadas)
- [x] Confirmar que o estratégico NÃO é mais fonte mestra de clientes/contratos


## Ativação do Endpoint de Integração no SGC
- [ ] Verificar estado atual do SGC e localizar arquivos de rotas/servidor
- [ ] Implementar endpoint /api/integration/v1 no SGC
- [ ] Configurar INTERNAL_API_TOKEN no SGC com o mesmo valor do SGC_INTERNAL_TOKEN
- [ ] Testar fluxo de dados entre sistema estratégico e SGC
- [ ] Confirmar que dados de contratos/clientes fluem corretamente


## Remoção de Páginas de Criação — Redirecionamento para SGC
- [x] Remover página ContratoForm.tsx (criação de contratos) — rotas removidas
- [x] Remover página AditivoForm.tsx (criação de aditivos) — rotas removidas
- [x] Remover página GestaoClientes.tsx (criação de clientes) — rotas removidas
- [x] Remover botão "Novo Contrato" de Contratos.tsx
- [x] Remover botão "Novo Aditivo" de ContratoDetalhe.tsx
- [x] Remover botão "Novo Cliente" de GestaoClientes.tsx — rota removida
- [x] Remover rotas de criação do App.tsx
- [x] Testar navegação e redirecionamentos (183/183 testes passando)

## Correção Estado Vazio Contratos
- [x] Remover botão "Criar Contrato no SGC" do estado vazio e exibir mensagem de conexão pendente com o SGC

## Remoção Cadastro de Clientes
- [ ] Localizar página GestaoClientes.tsx e remover formulário/botão de cadastro
- [ ] Remover estado vazio com botão de criar cliente
- [ ] Verificar se há rota /clientes/novo ainda ativa no App.tsx
- [ ] Verificar link "Clientes" no header — remover ou redirecionar para SGC

## Dashboard Estratégico de Contratos (SGC)
- [x] Procedure strategicDashboard consolidando 3 endpoints do SGC (summary, clients, risks)
- [x] Aba Visão Geral com panorama financeiro, marcos e resumo de riscos
- [x] Aba Carteira de Clientes com ranking por valor contratado e análise de concentração
- [x] Aba Exposição a Riscos com distribuição por severidade e riscos por contrato
- [x] KPIs principais: Total Contratos, Vigentes, Encerrados, Clientes Ativos, Marcos Vencidos, Riscos Críticos
- [x] Alertas automáticos para alto volume de marcos vencidos e riscos sem plano de ação

## Integração Organograma (Read-Only)
- [x] Descobrir endpoints disponíveis no sistema de organograma externo
- [x] Criar camada de integração backend (organogramClient.ts + router organograma.ts)
- [x] Configurar variáveis de ambiente (ORGANOGRAM_API_BASE_URL, ORGANOGRAM_INTERNAL_TOKEN)
- [x] Criar DTOs internos de consumo (tipagem automática via resposta do endpoint)
- [x] Criar procedures tRPC read-only (overview, tree, leaders, departments)
- [x] Implementar página de visão geral organizacional do grupo (/organograma)
- [x] Implementar aba Árvore Hierárquica com nós expansíveis
- [x] Implementar aba Lideranças com cards de perfil
- [x] Implementar aba Departamentos com cores e métricas
- [x] Implementar KPIs: Total Cargos, Colaboradores, Níveis, Taxa de Ocupação
- [x] Implementar links profundos para o OrganoArq
- [x] Criar testes de integração (4/4 passando)
- [x] Adicionar link Organograma no menu de navegação da Home
- [ ] Implementar cruzamentos read-only com dados do planejamento estratégico
- [ ] Criar documentação técnica da integração

## Cruzamento Organograma × Planejamento Estratégico
- [ ] Adicionar campo responsavelOrganoId e responsavelOrganoNome na tabela de objetivos
- [ ] Migrar banco de dados com novos campos
- [ ] Criar procedure tRPC para vincular/desvincular líder a objetivo
- [ ] Criar procedure tRPC para buscar objetivos com dados de líder enriquecidos
- [ ] Implementar selector de líder (dropdown com líderes do OrganoArq) no formulário de objetivos
- [ ] Exibir avatar e nome do líder nos cards de objetivos
- [ ] Criar aba "Objetivos por Líder" na página de Organograma
- [ ] Criar testes para as novas procedures

## Módulo Gestão de Capital de Giro
- [x] Criar tabela capital_giro_dados no schema e migrar banco
- [x] Criar procedures tRPC: getCapitalGiroGeral, getCapitalGiroPorUnidade, salvarDadosMensais
- [x] Criar componente FormularioDados.tsx (lançamento mensal)
- [x] Criar componente HistoricoTabela.tsx (histórico mês a mês)
- [x] Criar página /capital-giro/:unidadeId com 3 abas (Visão Geral, Histórico, Conceitos)
- [x] Botão "Cap. Giro" adicionado em cada EmpresaCard na Home
- [x] Registrar rota /capital-giro/:empresaId no App.tsx

## Ajuste Capital de Giro — Grade de Módulos
- [x] Adicionar card "Capital de Giro" na grade de módulos da página de planejamento da empresa
- [x] Incluir card como permanente (sempre visível independente das metodologias ativas)
- [x] Navegação ao clicar: /capital-giro/:empresaId

## Módulo DRE (Demonstração do Resultado do Exercício)
- [x] Schema: tabelas dre_dados, dre_uploads, dre_forecast, dre_audit_log
- [x] Backend: procedures tRPC para CRUD DRE, upload PDF/Excel, processamento, indicadores, forecast
- [x] Frontend: Página principal DRE com abas (Visão Geral, DRE Detalhada, Upload, Forecast, Análise Estratégica)
- [x] Dashboard executivo com gráficos, KPIs, comparativos e indicadores de margem
- [x] Integração: card DRE/EBITDA na grade de módulos, rota /empresa/:empresaId/dre
- [x] Distinção Produto (CMV) vs Serviço (CSP) automática por empresa
- [x] Área de upload com drag-and-drop, validação, histórico e logs
- [x] Processamento de PDF e Excel com IA e revisão obrigatória antes de consolidação
- [x] Aba Forecast com cenários conservador/base/otimista
- [x] Indicadores: Margem Bruta, EBITDA, Operacional, Líquida, comparativo YoY
- [x] Análise estratégica com IA (insights, recomendações, tendências)
- [ ] Permissões granulares: admin, diretoria, financeiro, gestor (futuro)
- [x] Testes vitest: 6 testes passando (estrutura, IDs únicos, ordem, linhas essenciais, calculadas, produto vs serviço)


## Refatoração DRE — Alinhamento com Padrão do App
- [ ] Refatorar Visão Geral com todos os indicadores essenciais da DRE em cards modulares
- [ ] Indicadores: Receita Bruta, Deduções, Receita Líquida, Custos (CMV/CSP), Lucro Bruto
- [ ] Indicadores: Despesas Operacionais, EBITDA, Depreciação, EBIT, Juros, IR/CS, Lucro Líquido
- [ ] Indicadores: Margens (Bruta, EBITDA, Operacional, Líquida), Variações (MoM, YoY)
- [ ] Alinhar cores com padrão Grupo Arqueo (Bordo, Laranja, Azul, Amarelo)
- [ ] Alinhar tipografia e espaçamento com design system do app
- [ ] Remover layout genérico, usar cards e grid como padrão do app
- [ ] Adicionar header com navegação consistente
- [ ] Testar responsividade em mobile/tablet/desktop

## Refatoração Layout — DRE e Capital de Giro
- [x] Capital de Giro: remover DashboardLayout, usar PageHeader padrão do sistema
- [x] DRE: remover DashboardLayout, usar PageHeader padrão do sistema
- [x] Ambos: sem sidebar, sem comparativos entre empresas (visão individualizada)
- [x] DRE: CMV visível apenas para empresas de produto (tipoAtuacao=produtos/servicos_produtos); demais usam CSP

## Dashboard DRE — Histórico e Comparativo
- [x] Aba Visão Geral: KPIs (Receita Líquida, EBITDA, Lucro Líquido, Margens) no topo
- [x] Aba Visão Geral: gráfico de evolução mensal (barras + linha de margem)
- [x] Aba Visão Geral: tabela DRE detalhada com todos os meses do ano selecionado
- [x] Aba Upload: drag-and-drop para PDF/Excel, suporte a múltiplos anos históricos
- [x] Aba Upload: processamento IA + tela de revisão antes de confirmar importação
- [x] Aba Upload: histórico de uploads com status e data
- [x] Aba Comparativo: seleção de 2+ anos para comparar lado a lado
- [x] Aba Comparativo: gráfico de evolução anual dos principais indicadores
- [x] Aba Comparativo: tabela comparativa com variação % entre anos

## Empresa UTU Arqueologia, LDA
- [x] Cadastrar UTU Arqueologia, LDA na unidade Grupo Arqueo Africa (areaId=30002)
- [x] Dados: Av. Paulo Samuel Kankhomba, Nº 1063-R/C | Nuit: 400 961 182 | Maputo - Moçambique
- [x] Logo: https://utu.co.mz/wp-content/uploads/2024/01/lgutu.png (azul #224887 + laranja #E8632A)
- [x] Vínculo empresa_area_vinculo criado (empresaId=1020002, areaId=30002)
- [x] EmpresaCard atualizado para exibir logo da empresa quando disponível (logoUrl)
