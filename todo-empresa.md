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
