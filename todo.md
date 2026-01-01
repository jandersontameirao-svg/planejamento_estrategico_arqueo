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
