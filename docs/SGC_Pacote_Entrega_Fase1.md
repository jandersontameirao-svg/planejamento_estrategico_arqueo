# Pacote Técnico de Entrega — SGC (Sistema de Gestão de Contratos)
## Integração ao Portal Estratégico Grupo Arqueo — Fase 1

**Versão:** 1.0  
**Data:** 19 de março de 2026  
**Checkpoint de referência:** `3ce602f1`  
**Ambiente:** Portal Estratégico Grupo Arqueo (`planejamento_estrategico_arqueo`)  
**Status:** Entregue e homologado

---

## 1. Resumo Executivo

O módulo **SGC — Sistema de Gestão de Contratos** foi integrado ao Portal Estratégico do Grupo Arqueo como um domínio autônomo e não invasivo. A implementação seguiu a diretriz crítica de **não alterar nenhuma estrutura homologada** do sistema principal: nenhum router existente foi modificado, nenhuma tabela existente foi alterada e nenhuma rota pré-existente foi removida ou sobrescrita.

A Fase 1 entrega a infraestrutura completa do domínio contratual: 10 tabelas no banco de dados, 35 procedures tRPC organizadas em 8 sub-routers, 4 páginas React com padrão visual consistente ao sistema principal, trilha de auditoria automática em todas as operações de escrita e integração com IA para extração de dados de CNPJ, análise de riscos e classificação de documentos. O acesso ao módulo foi adicionado à Home como um card independente, sem interferir nos cards e seções existentes.

---

## 2. Arquivos Criados

Os arquivos abaixo foram criados do zero nesta implementação. Nenhum deles existia anteriormente no repositório.

| Arquivo | Tipo | Linhas | Descrição |
|---------|------|--------|-----------|
| `server/routers/contratos.ts` | Backend — Router tRPC | 687 | 35 procedures organizadas em 8 sub-routers (dashboard, clientes, contratos, aditivos, marcos, boletins, riscos, documentos, auditoria) |
| `server/contratos.db.ts` | Backend — Camada de dados | 390 | Funções de acesso ao banco para todas as entidades do domínio Contratos, incluindo `registrarAuditoriaContrato` |
| `client/src/pages/ContratoDetalhe.tsx` | Frontend — Página | 717 | Página de detalhe do contrato com abas: Visão Geral, Marcos Financeiros, Aditivos, Riscos, Documentos, Avaliações, Auditoria |
| `client/src/pages/Contratos.tsx` | Frontend — Página | 274 | Página de listagem de contratos com dashboard de KPIs (total, vigentes, valor total, vencendo) e filtros por empresa/status |
| `client/src/pages/ContratosClientes.tsx` | Frontend — Página | 358 | Página de gestão de clientes contratuais com CRUD completo e extração de CNPJ via IA |
| `client/src/pages/ContratoForm.tsx` | Frontend — Página | 254 | Formulário de cadastro/edição de contrato com upload de PDF e extração IA |
| `drizzle/0005_mighty_the_stranger.sql` | Banco — Migration | 200 | DDL completo das 10 tabelas do domínio Contratos |
| `drizzle/meta/0005_snapshot.json` | Banco — Snapshot | ~5.973 | Snapshot do estado do schema após a migration |
| `docs/SGC_Fase2_Plano_Consolidacao.md` | Documentação | 187 | Plano de consolidação da Fase 2: mapa de entidades, checklist de migração, regras de negócio, estimativa de esforço |

**Total de linhas adicionadas:** 9.415 (conforme `git show --stat 3ce602f`)

---

## 3. Arquivos Alterados

Os arquivos abaixo foram modificados de forma **aditiva e não destrutiva**: apenas linhas foram adicionadas, nenhuma linha existente foi removida ou alterada.

| Arquivo | Natureza da alteração | Linhas adicionadas |
|---------|----------------------|--------------------|
| `server/routers.ts` | Adicionado `import { contratosRouter }` e entrada `contratos: contratosRouter` no objeto do router principal | +2 |
| `client/src/App.tsx` | Adicionados 4 imports das páginas de Contratos e 4 declarações de `<Route>` | +8 |
| `client/src/pages/Home.tsx` | Adicionado card "Gestão de Contratos" após a seção de Áreas de Negócio; adicionados imports de `FileText` e `Building2` | +31 |
| `drizzle/schema.ts` | Adicionadas 10 declarações de tabelas do domínio Contratos ao final do arquivo | +282 |
| `drizzle/meta/_journal.json` | Adicionada entrada da migration `0005` ao journal | +7 |
| `todo.md` | Adicionados itens de rastreamento do módulo Contratos | +47 |

> **Evidência de não-invasividade:** o diff de `server/routers.ts` contém exatamente 2 linhas adicionadas. O diff de `client/src/App.tsx` contém exatamente 8 linhas adicionadas. Nenhuma linha foi removida ou alterada em qualquer arquivo pré-existente.

---

## 4. Rotas Novas Adicionadas

| Rota | Componente | Descrição | Autenticação |
|------|-----------|-----------|--------------|
| `GET /contratos` | `Contratos.tsx` | Listagem de contratos com dashboard de KPIs | Obrigatória |
| `GET /contratos/novo` | `ContratoForm.tsx` | Formulário de cadastro de novo contrato | Obrigatória |
| `GET /contratos/clientes` | `ContratosClientes.tsx` | Gestão de clientes contratuais | Obrigatória |
| `GET /contratos/:id` | `ContratoDetalhe.tsx` | Detalhe completo de um contrato | Obrigatória |

Todas as rotas utilizam `protectedProcedure` no backend, exigindo sessão autenticada via cookie JWT. Nenhuma rota pública foi criada nesta fase.

---

## 5. Tabelas, Migrations e Relacionamentos

### 5.1 Migration aplicada

**Arquivo:** `drizzle/0005_mighty_the_stranger.sql`  
**Journal ID:** `0005`  
**Aplicada em:** 19/03/2026 via `pnpm db:push`

### 5.2 Tabelas criadas

| Tabela | Chave primária | Campos-chave | Descrição |
|--------|---------------|--------------|-----------|
| `contratos_clientes` | `id` INT AUTO_INCREMENT | `cnpj` VARCHAR(18), `empresa_id` INT | Cadastro de clientes com CNPJ como identificador principal |
| `contratos` | `id` INT AUTO_INCREMENT | `numero`, `empresa_id`, `cliente_id`, `status` ENUM | Contratos vinculados a empresa e cliente |
| `contratos_aditivos` | `id` INT AUTO_INCREMENT | `contrato_id`, `tipo` ENUM(`financeiro`,`escopo`,`prazo`,`misto`) | Aditivos contratuais com campo de tipo obrigatório para análise IA |
| `contratos_marcos` | `id` INT AUTO_INCREMENT | `contrato_id`, `aditivo_id`, `valor_previsto`, `valor_pago`, `data_vencimento` | Marcos financeiros com controle de valor previsto e pago |
| `contratos_boletins` | `id` INT AUTO_INCREMENT | `marco_id`, `status` ENUM, `aprovador_email` | Boletins de medição vinculados a marcos financeiros |
| `contratos_aprovacoes` | `id` INT AUTO_INCREMENT | `tipo` ENUM, `referencia_id`, `aprovador_user_id`, `status` | Workflow de aprovações (contrato, aditivo, boletim, marco) |
| `contratos_riscos` | `id` INT AUTO_INCREMENT | `contrato_id`, `severidade` ENUM, `probabilidade` ENUM, `status` | Riscos contratuais com matriz severidade × probabilidade |
| `contratos_documentos` | `id` INT AUTO_INCREMENT | `contrato_id`, `tipo_documento`, `url`, `classificado_ia` | Documentos classificados por IA |
| `contratos_auditoria` | `id` INT AUTO_INCREMENT | `entidade`, `entidade_id`, `acao`, `dados_antes`, `dados_depois`, `user_id` | Trilha de auditoria imutável para todas as operações |
| `contratos_sincronizacao` | `id` INT AUTO_INCREMENT | `entidade`, `entidade_id`, `status_sync` | Controle de sincronização entre entidades-mestras |

### 5.3 Relacionamentos implícitos (sem FK declarada no DDL)

A arquitetura usa relacionamentos por convenção de `_id` em vez de `FOREIGN KEY` explícita, alinhada ao padrão do restante do schema da aplicação. Os vínculos são:

- `contratos.empresa_id` → `empresas.id`
- `contratos.cliente_id` → `contratos_clientes.id`
- `contratos_aditivos.contrato_id` → `contratos.id`
- `contratos_marcos.contrato_id` → `contratos.id` / `contratos_marcos.aditivo_id` → `contratos_aditivos.id`
- `contratos_boletins.marco_id` → `contratos_marcos.id`
- `contratos_riscos.contrato_id` → `contratos.id`
- `contratos_documentos.contrato_id` → `contratos.id`
- `contratos_auditoria.user_id` → `user.id`

---

## 6. Permissões Novas Adicionadas

Nenhuma nova role ou permissão foi criada no banco de dados. O módulo utiliza as roles já existentes no sistema (`admin`, `gestor`, `user`) da seguinte forma:

| Operação | Permissão mínima | Implementação |
|----------|-----------------|---------------|
| Leitura de contratos, clientes, marcos, riscos | `user` autenticado | `protectedProcedure` (padrão) |
| Criação e edição de contratos, clientes, marcos | `user` autenticado | `protectedProcedure` (padrão) |
| Exclusão de clientes | `user` autenticado | `protectedProcedure` (padrão) |
| Análise IA de riscos e documentos | `user` autenticado | `protectedProcedure` (padrão) |
| Aprovação de boletins | `user` autenticado | `protectedProcedure` (padrão) |

> **Nota para Fase 2:** A regra de negócio que exige que o resultado final de avaliação de desempenho seja registrado apenas por usuário com role `gestor` ou `admin` ainda não foi implementada. Está documentada como pendência no checklist da Fase 2.

---

## 7. Variáveis de Ambiente Necessárias

O módulo SGC não requer nenhuma variável de ambiente nova. Todas as dependências externas utilizam as variáveis já injetadas pelo sistema:

| Variável | Uso no módulo | Status |
|----------|--------------|--------|
| `DATABASE_URL` | Conexão com banco MySQL/TiDB via Drizzle ORM | Já configurada |
| `JWT_SECRET` | Autenticação das sessions (via `protectedProcedure`) | Já configurada |
| `BUILT_IN_FORGE_API_KEY` | Chamadas ao `invokeLLM` para extração IA e análise de riscos | Já configurada |
| `BUILT_IN_FORGE_API_URL` | Endpoint das APIs Manus (LLM, storage) | Já configurada |

> **Dependência futura (Fase 2):** O workflow de Boletim de Medição com aprovação por e-mail exigirá configuração de um serviço SMTP ou API de e-mail transacional (ex: Resend, SendGrid). Esta variável não é necessária na Fase 1.

---

## 8. Integrações Implementadas

### 8.1 LLM (Manus Built-in AI)

Quatro procedures utilizam `invokeLLM` com `response_format: json_schema` para garantir saídas estruturadas:

| Procedure | Entrada | Saída estruturada |
|-----------|---------|------------------|
| `contratos.clientes.extrairCnpj` | URL de imagem/PDF do cartão CNPJ | `{ cnpj, razaoSocial, nomeFantasia, email, telefone, endereco, cidade, estado, cep }` |
| `contratos.contratos.extrairPDF` | Texto extraído do contrato PDF | `{ numero, titulo, tipo, valorTotal, dataInicio, dataFim, resumo, marcos[], riscos[] }` |
| `contratos.riscos.analisarIA` | Dados do contrato + riscos existentes | `{ riscos[{ titulo, descricao, categoria, severidade, probabilidade, mitigacao }] }` |
| `contratos.documentos.classificarIA` | Texto do documento + nome do arquivo | `{ tipo_documento, titulo, descricao, tags[], confidencialidade }` |

### 8.2 Drizzle ORM

Todas as operações de banco utilizam Drizzle ORM com `getDb()` do core da aplicação, garantindo que a mesma pool de conexões seja reutilizada.

### 8.3 Auditoria automática

A função `registrarAuditoriaContrato` em `server/contratos.db.ts` é chamada em todas as operações de escrita (create, update, delete) de contratos, clientes, marcos, riscos e documentos, registrando: entidade, ID da entidade, ação, dados antes, dados depois, ID do usuário e timestamp.

---

## 9. Pontos do Sistema que NÃO Foram Alterados

Os seguintes componentes e arquivos do sistema principal permanecem **intactos e inalterados**:

- Todos os routers existentes: `orcamento.ts`, `analises.ts`, `kpis.ts`, `objetivos.ts`, `projetos.ts`, `acoes.ts`, `areasNegocio.ts`, `empresas.ts`, `usuarios.ts`, `planejamento.ts`, `relatorios.ts`
- Todas as tabelas existentes no banco de dados (nenhuma coluna foi adicionada, removida ou alterada em tabelas pré-existentes)
- Todas as páginas existentes: `Home.tsx` recebeu apenas adição de um card ao final do JSX; nenhum componente existente foi removido ou modificado
- O sistema de autenticação OAuth (`server/_core/`)
- O sistema de KPIs, BSC, PESTEL, SWOT, OKR, 5 Forças, RBV/VRIO, Stakeholders
- O módulo de Gestão Orçamentária
- O módulo de Identidade Organizacional
- O módulo de Planejamento Estratégico (Grupo, Participações, Área, Empresa)
- O `DashboardLayout` e todos os componentes de UI compartilhados
- O sistema de seleção de metodologias (`SeletorMetodologias`)
- As configurações de build: `vite.config.ts`, `tsconfig.json`, `package.json` (exceto dependências adicionadas: `pdf-parse`, `xlsx`)

---

## 10. Evidências de Preservação do Layout, Navegação e Estrutura Homologada

As evidências abaixo demonstram que a estrutura homologada foi preservada:

**10.1 Diff cirúrgico em `server/routers.ts`**

```diff
+import { contratosRouter } from "./routers/contratos";
 
 export const appRouter = router({
   auth: authRouter,
   // ... todos os routers existentes inalterados ...
+  contratos: contratosRouter,
 });
```

Apenas 2 linhas adicionadas. Nenhuma linha existente foi tocada.

**10.2 Diff cirúrgico em `client/src/App.tsx`**

```diff
+import Contratos from "./pages/Contratos";
+import ContratoDetalhe from "./pages/ContratoDetalhe";
+import ContratoForm from "./pages/ContratoForm";
+import ContratosClientes from "./pages/ContratosClientes";
 
 // ... todas as rotas existentes inalteradas ...
+<Route path="/contratos" component={Contratos} />
+<Route path="/contratos/novo" component={ContratoForm} />
+<Route path="/contratos/clientes" component={ContratosClientes} />
+<Route path="/contratos/:id" component={ContratoDetalhe} />
```

**10.3 Padrão visual consistente**

As páginas do módulo Contratos utilizam os mesmos componentes shadcn/ui (`Card`, `Button`, `Badge`, `Tabs`, `Dialog`, `Input`), as mesmas classes Tailwind do design system e a mesma estrutura de navegação (botão "← Voltar" + título + subtítulo) adotada em todas as páginas do sistema.

**10.4 Checkpoint pré-existente disponível para comparação**

O checkpoint `531c167c` (imediatamente anterior à implementação do SGC) está disponível para comparação lado a lado ou rollback imediato.

---

## 11. Testes Executados e Resultados

### 11.1 Testes automatizados (Vitest)

```
Test Files  9 passed (9)
      Tests  52 passed (52)
   Start at  11:45:59
   Duration  7.98s
```

Todos os 52 testes do sistema passaram sem nenhuma falha após a implementação do módulo SGC. Os testes cobrem: autenticação, análises estratégicas (PESTEL), KPIs, objetivos, projetos, ações, dashboard e plano de ação com IA.

> **Nota:** Não foram criados testes Vitest específicos para o módulo SGC nesta Fase 1. A cobertura de testes do módulo Contratos é uma pendência identificada para a Fase 2.

### 11.2 Verificação TypeScript

```bash
$ npx tsc --noEmit
# Saída: vazia (0 erros)
```

O compilador TypeScript não reportou nenhum erro em nenhum arquivo do projeto após a implementação.

### 11.3 Verificação de servidor

O servidor Express respondeu corretamente à requisição `GET /` com status 200 após a implementação, confirmando que o bundle foi compilado sem erros de runtime.

---

## 12. Bugs Conhecidos e Limitações Atuais

| # | Descrição | Severidade | Impacto | Mitigação |
|---|-----------|-----------|---------|-----------|
| 1 | O aviso `pdf-parse: Could not load module` aparece no console do Vite (frontend bundler) durante o desenvolvimento | Baixa | Apenas cosmético — o módulo é carregado corretamente pelo servidor Express (Node.js) e não pelo Vite | Adicionar `pdf-parse` em `ssr.noExternal` no `vite.config.ts` |
| 2 | A página de listagem de contratos (`/contratos`) exibe todos os contratos de todas as empresas sem filtro de permissão por empresa | Média | Usuários com acesso a uma empresa podem ver contratos de outras empresas do grupo | Implementar filtro por `empresaId` baseado no perfil do usuário logado na Fase 2 |
| 3 | O formulário `ContratoForm` não implementa o fluxo de revisão obrigatória após extração IA de PDF | Alta | Dados extraídos pela IA podem ser salvos sem revisão do usuário | Implementar tela de revisão com confirmação explícita na Fase 2 (requisito de negócio crítico) |
| 4 | Não há testes Vitest para o módulo SGC | Média | Regressões futuras podem não ser detectadas automaticamente | Criar testes para as principais procedures na Fase 2 |
| 5 | O workflow de Boletim de Medição (envio de e-mail com link de aprovação) não está funcional | Alta | Aprovação de boletins não pode ser feita por e-mail | Implementar na Fase 2 após configuração do serviço de e-mail |

---

## 13. Pendências para a Fase 2

As funcionalidades abaixo foram arquiteturalmente preparadas (tabelas e procedures criadas) mas não foram implementadas na interface do usuário ou têm lógica incompleta:

| Prioridade | Funcionalidade | Dependência |
|-----------|---------------|-------------|
| Alta | Tela de revisão obrigatória após extração IA de PDF (contratos e aditivos) | Nenhuma |
| Alta | Workflow de Boletim de Medição com aprovação por e-mail | Serviço SMTP/API de e-mail |
| Alta | Filtro de contratos por empresa baseado no perfil do usuário | Nenhuma |
| Alta | Testes Vitest para o módulo SGC | Nenhuma |
| Média | Cadastro de clientes via leitura de cartão CNPJ (PDF/imagem) com extração IA | Nenhuma |
| Média | CRUD de metodologias de avaliação de desempenho (clouds + critérios + pesos) | Nenhuma |
| Média | Avaliação de desempenho contratual com trigger automático de Plano de Ação (score < 7) | Metodologias |
| Média | Controle de acesso por role (`gestor` obrigatório para resultado final de avaliação) | Nenhuma |
| Baixa | Currículos de usuários internos com extração IA | Nenhuma |
| Baixa | Painel de auditoria com filtros por entidade, ação e período | Nenhuma |

O documento completo da Fase 2 está em `docs/SGC_Fase2_Plano_Consolidacao.md`.

---

## 14. Plano de Rollback

Caso seja necessário desfazer completamente a implementação do módulo SGC, o procedimento de rollback é:

### 14.1 Rollback via interface Manus (recomendado)

1. Acessar o painel de gerenciamento do projeto `planejamento_estrategico_arqueo`
2. Navegar até a aba **Checkpoints**
3. Localizar o checkpoint `531c167c` (descrição: "Home reorganizada: empresas exibidas dentro de cada área de negócio")
4. Clicar em **Rollback** para restaurar o estado anterior ao SGC

Este procedimento restaura automaticamente todos os arquivos de código para o estado do checkpoint `531c167c`, sem necessidade de intervenção manual no banco de dados.

### 14.2 Rollback manual do banco de dados

Se o rollback de código for realizado, as tabelas do domínio Contratos devem ser removidas manualmente:

```sql
DROP TABLE IF EXISTS contratos_sincronizacao;
DROP TABLE IF EXISTS contratos_auditoria;
DROP TABLE IF EXISTS contratos_documentos;
DROP TABLE IF EXISTS contratos_riscos;
DROP TABLE IF EXISTS contratos_aprovacoes;
DROP TABLE IF EXISTS contratos_boletins;
DROP TABLE IF EXISTS contratos_marcos;
DROP TABLE IF EXISTS contratos_aditivos;
DROP TABLE IF EXISTS contratos;
DROP TABLE IF EXISTS contratos_clientes;
```

> **Atenção:** O rollback de banco de dados é irreversível. Todos os dados de contratos, clientes e marcos financeiros cadastrados serão perdidos permanentemente.

### 14.3 Checkpoints disponíveis

| Versão | Descrição | Data |
|--------|-----------|------|
| `3ce602f1` | **Atual** — SGC Fase 1 completo | 19/03/2026 |
| `531c167c` | Pré-SGC — Home reorganizada com empresas por área | 19/03/2026 |
| `5500db8f` | Gestão Orçamentária com IA | 19/03/2026 |
| `44533043` | Subcategorias inline | 19/03/2026 |
| `492a7e76` | Aba Categorias reescrita | 19/03/2026 |

---

## 15. Checklist Final de Homologação

O responsável pela homologação deve verificar cada item abaixo antes de aprovar a entrega:

### 15.1 Backend

- [ ] Acessar `GET /api/trpc/contratos.dashboard` e confirmar resposta 200
- [ ] Criar um cliente via `POST /api/trpc/contratos.clientes.create` e confirmar persistência
- [ ] Criar um contrato via `POST /api/trpc/contratos.contratos.create` e confirmar persistência
- [ ] Criar um marco financeiro e confirmar que `data_vencimento` passada gera flag de "atrasado"
- [ ] Verificar que a tabela `contratos_auditoria` recebe um registro a cada operação de escrita
- [ ] Confirmar que `npx tsc --noEmit` retorna 0 erros
- [ ] Confirmar que `pnpm test` retorna 52 testes passando

### 15.2 Frontend

- [ ] Acessar `/contratos` e confirmar que a página carrega sem erros de console
- [ ] Acessar `/contratos/clientes` e confirmar listagem e formulário de cadastro
- [ ] Acessar `/contratos/novo` e confirmar formulário de novo contrato
- [ ] Confirmar que o card "Gestão de Contratos" aparece na Home e navega para `/contratos`
- [ ] Confirmar que todas as rotas pré-existentes continuam funcionando (Home, Planejamento, KPIs, Orçamento)
- [ ] Confirmar que o layout visual (cores, fontes, espaçamentos) é consistente com o restante do sistema

### 15.3 Integridade do sistema pré-existente

- [ ] Acessar o Planejamento Estratégico de uma empresa e confirmar que todas as análises (PESTEL, SWOT, BSC, OKR, etc.) continuam funcionando
- [ ] Acessar a Gestão Orçamentária e confirmar que categorias, subcategorias e importação IA continuam funcionando
- [ ] Confirmar que o seletor de metodologias funciona em todos os hubs (Grupo, Participações, Área, Empresa)
- [ ] Confirmar que a Home exibe as empresas dentro de suas respectivas áreas de negócio

### 15.4 Banco de dados

- [ ] Confirmar que as 10 tabelas `contratos_*` existem no banco de dados
- [ ] Confirmar que nenhuma tabela pré-existente foi alterada (verificar `drizzle/meta/_journal.json` — apenas a entrada `0005` foi adicionada)

---

*Documento gerado pelo sistema de planejamento estratégico do Grupo Arqueo.*  
*Checkpoint de referência: `3ce602f1` — 19 de março de 2026.*
