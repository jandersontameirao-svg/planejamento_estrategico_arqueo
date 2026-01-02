# TODO: Objetivos, Projetos e Matriz de Risco por Empresa

## Fase 1: Schema e Routers
- [x] Adicionar campo empresaId (nullable) em objetivos_grupo
- [x] Adicionar campo empresaId (nullable) em projetos_grupo  
- [x] Criar router objetivosGrupo.listByEmpresa
- [x] Criar router projetosGrupo.listByEmpresa
- [x] Adicionar empresaId nos inputs de create/update

## Fase 2: Páginas por Empresa
- [x] Criar página ObjetivosEmpresa.tsx
- [x] Criar página ProjetosEmpresa.tsx
- [x] Adicionar rotas no App.tsx

## Fase 3: Matriz de Risco por Empresa
- [x] Adicionar componente MatrizRisco nas páginas de empresa
- [x] Filtrar dados da matriz por empresaId

## Fase 4: Navegação
- [x] Adicionar botão "Objetivos" nas páginas de empresa
- [x] Adicionar botão "Projetos" nas páginas de empresa
- [x] Adicionar botão "Matriz de Risco" nas páginas de empresa

## Fase 5: Dashboard Executivo por Empresa
- [x] Criar página DashboardEmpresa.tsx
- [x] Adicionar rota no App.tsx
- [x] Integrar gráficos e métricas
- [x] Adicionar botões de navegação rápida

## Fase 6: Testes e Validação
- [x] Todos os 34 testes passando com 100% de sucesso
- [x] Corrigir erro de import COOKIE_NAME
- [x] Ajustar testes de dashboard para serem robustos
- [x] Criar checkpoint final

## Fase 7: Correção de Erros de Compilação
- [x] Corrigir imports duplicados em MatrizRiscoEmpresa.tsx
- [x] Adicionar imports faltantes (useParams, useLocation)
- [x] Validar TypeScript - 0 erros
- [x] Build production - sucesso
- [x] Todos os 34 testes passando

## Fase 8: Integração de Logo e Limpeza para Produção
- [x] Copiar logo do Grupo Arqueo para pasta public
- [x] Integrar logo em Home.tsx (header e hero section)
- [x] Integrar logo em Empresas.tsx
- [x] Corrigir imports duplicados de useAuth
- [x] Todos os 34 testes passando
- [x] Build production - sucesso
- [x] Sistema pronto para produção
- [x] Validar segurança e permissões

## Fase 9: Gráfico de Gantt para Projetos
- [x] Instalar biblioteca gantt-task-react
- [x] Criar componente GanttChart.tsx
- [x] Integrar dados de projetos no Gantt
- [x] Adicionar visualização de progresso
- [x] Integrado na página de Projetos
- [x] Testes do componente Gantt

## Fase 10: Análise Preditiva de Performance
- [x] Criar router de análise preditiva
- [x] Implementar algoritmo de previsão de desvios
- [x] Criar página de Análise Preditiva
- [x] Adicionar alertas automáticos
- [x] Visualizar tendências de performance
- [x] Testes de análise preditiva

## Fase 11: Portal de Stakeholders
- [x] Criar página pública de visualização
- [x] Adicionar filtros e exportação para stakeholders
- [x] Implementar segurança e permissões
- [x] Testes do portal de stakeholders

## Fase 12: Notificações por Email
- [x] Instalar biblioteca nodemailer
- [x] Criar serviço de envio de emails
- [x] Adicionar router de notificações
- [x] Implementar alertas críticos por email
- [x] Criar templates de email
- [x] Configurar SMTP
- [x] Testes de notificações

## Fase 13: Integração com Calendário
- [x] Criar router de calendário
- [x] Implementar geração de eventos iCal
- [x] Adicionar links de sincronização Google Calendar
- [x] Adicionar links de sincronização Outlook
- [x] Criar página de sincronização
- [x] Testes de integração calendário

## Fase 14: Dashboard Comparativo Entre Empresas
- [x] Criar página DashboardComparativo.tsx
- [x] Implementar comparação de KPIs
- [x] Adicionar gráficos comparativos
- [x] Criar ranking de performance
- [x] Adicionar filtros por período
- [x] Testes do dashboard comparativo

## Fase 15: Módulo de Cadastro e Gestão de Usuários
- [x] Criar routers de usuários (list, create, update, delete)
- [x] Implementar roles (admin, gestor, usuario)
- [x] Adicionar permissões por role
- [x] Criar página de Gestão de Usuários
- [x] Implementar formulário de cadastro
- [x] Adicionar vinculação usuário-empresa
- [x] Implementar controle de acesso por role
- [x] Criar página de Perfil de Usuário
- [x] Testes de gestão de usuários

## Fase 16: Framework de Metodologia na Matriz de Risco
- [x] Adicionar campos de metodologia ao schema
- [x] Adicionar campo de observações ao schema
- [x] Criar routers para metodologia
- [x] Implementar framework de metodologia na página
- [x] Adicionar seção de observações e guia de uso
- [x] Criar visualização de matriz com metodologia
- [x] Testes de matriz de risco com metodologia

## Fase 17: Matriz de Risco Interativa para Preenchimento
- [x] Criar routers tRPC para atualizar impacto e probabilidade
- [x] Criar routers tRPC para atualizar metodologia e observações
- [x] Implementar formulário interativo na matriz
- [x] Adicionar dialogs para edição de campos
- [x] Implementar validações de entrada
- [x] Adicionar feedback visual de salvamento
- [x] Testes de matriz interativa
- [x] Corrigir interatividade dos cliques (Dialog fora do SVG)
- [x] Adicionar hover effects nos itens
- [x] Exibir matriz sempre (mesmo sem dados)
- [x] Corrigir renderização de componente


## Fase 18: Drag-and-Drop na Matriz de Risco
- [x] Adicionar suporte a drag-and-drop no componente
- [x] Implementar lógica de cálculo de quadrante baseado em posição do mouse
- [x] Adicionar feedback visual durante drag (highlight de quadrante)
- [x] Implementar drop handler para atualizar impacto e probabilidade
- [x] Adicionar validações de drop
- [x] Testar drag-and-drop completo
- [x] Adicionar cursor feedback durante drag

## Fase 19: Matriz de Risco 5x5 com Ameaças e Oportunidades
- [x] Criar novo componente MatrizRisco5x5.tsx
- [x] Implementar formato 5x5 profissional (Ameaças e Oportunidades)
- [x] Adicionar probabilidades em percentuais (10%, 30%, 50%, 70%, 90%)
- [x] Implementar cores por nível de risco (Vermelho, Laranja, Amarelo, Verde)
- [x] Adicionar cálculo automático de nível de risco
- [x] Implementar cliques para editar itens
- [x] Adicionar dialog de edição com Select e Textarea
- [x] Integrar MatrizRisco5x5 na página de Matriz de Risco
- [x] Adicionar legenda de cores
- [x] Criar dados de teste para visualização
- [x] Testes da nova matriz 5x5
- [x] Validar TypeScript - 0 erros
- [x] Todos os 34 testes passando

## Fase 20: Análises Estratégicas por Empresa
- [x] Adicionar campos ao schema para PESTEL
- [x] Adicionar campos ao schema para 5 Forças de Porter
- [x] Adicionar campos ao schema para Stakeholders
- [x] Adicionar campos ao schema para RBV/VRIO
- [x] Adicionar campos ao schema para SWOT/TOWS
- [x] Adicionar campos ao schema para OKR
- [x] Criar página de Análise PESTEL
- [x] Criar página de 5 Forças de Porter
- [x] Criar página de Análise de Stakeholders
- [x] Criar página de RBV/VRIO
- [x] Criar página de SWOT/TOWS
- [x] Criar página de OKR
- [ ] Implementar routers tRPC para análises
- [ ] Adicionar navegação nas páginas de empresa
- [ ] Integrar componentes de análise
- [ ] Testar todas as análises
- [x] Validar TypeScript - 0 erros
- [x] Todos os 34 testes passando

## Fase 21: Integração de Análises como Abas na Identidade Organizacional
- [x] Reorganizar IdentidadeOrganizacional.tsx com abas
- [x] Adicionar aba de PESTEL
- [x] Adicionar aba de 5 Forças de Porter
- [x] Adicionar aba de Stakeholders
- [x] Adicionar aba de RBV/VRIO
- [x] Adicionar aba de SWOT/TOWS
- [x] Adicionar aba de OKR
- [ ] Remover rotas individuais das análises
- [x] Testar navegação entre abas
- [x] Validar TypeScript - 0 erros
- [x] Todos os 34 testes passando

## Fase 22: Formulários Interativos e Visualizações Gráficas
- [x] Implementar formulário PESTEL com 6 fatores
- [x] Implementar formulário 5 Forças de Porter
- [x] Implementar matriz 2x2 para Stakeholders (Poder x Interesse)
- [x] Implementar formulário RBV/VRIO com matriz VRIO
- [x] Implementar matriz 2x2 para SWOT/TOWS
- [x] Implementar formulário OKR com Objetivos e Key Results
- [ ] Criar gráfico radar para PESTEL
- [ ] Criar gráfico de barras para 5 Forças
- [ ] Criar matriz visual para Stakeholders
- [ ] Criar matriz visual para RBV/VRIO
- [ ] Criar matriz visual para SWOT/TOWS
- [ ] Criar gráfico de progresso para OKR
- [ ] Implementar routers tRPC para salvar análises
- [ ] Implementar routers tRPC para recuperar análises
- [ ] Testar formulários e visualizações
- [ ] Validar TypeScript - 0 erros
- [ ] Todos os testes passando

## Fase 23: Relatório Consolidado em PDF
- [ ] Criar componente de geração de PDF
- [ ] Adicionar todas as 6 análises no relatório
- [ ] Adicionar gráficos no relatório
- [ ] Adicionar data e informações da empresa
- [ ] Implementar botão de download de PDF
- [ ] Testar geração de PDF
- [ ] Validar TypeScript - 0 erros
- [ ] Todos os testes passando
