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
