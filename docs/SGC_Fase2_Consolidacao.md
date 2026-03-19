# SGC — Fase 2: Plano de Consolidação e Funcionalidades Avançadas

**Projeto:** Portal Estratégico Grupo Arqueo  
**Módulo:** Sistema de Gestão de Contratos (SGC)  
**Versão:** Fase 2 — Pós-integração Fase 1  
**Data:** Março 2026  
**Checkpoint Fase 1:** `4e96e131`

---

## 1. Resumo do Estado Atual (Fase 1 Entregue)

A Fase 1 integrou o SGC ao portal principal com as seguintes entregas verificadas:

| Componente | Status | Observação |
|---|---|---|
| 13 tabelas contratuais avançadas | ✅ Criadas no banco | Incluindo `contratosBoletins`, `boletinsAprovacaoTokens`, `contratosAditivos`, `contratosRiscos`, `contratosDocumentos`, `contratosAuditoria`, `contratosExtracao`, `contratosAvaliacao`, `avaliacaoCriterios`, `avaliacaoRespostas`, `contratosPlanoAcao`, `contratosSequencias`, `contratosChangeRequests` |
| Router tRPC completo | ✅ 8 sub-routers | contratos, clientes, marcos, boletins, aprovações, riscos, documentos, auditoria |
| Serviços adaptados | ✅ 3 serviços | ai-analyzer, pdf-boletim, approval-service |
| Páginas do módulo | ✅ 4 páginas | Contratos, ContratoDetalhe (6 abas), ContratoForm, ContratosClientes |
| Rotas registradas | ✅ 4 rotas | `/empresa/:id/contratos/*` |
| Card no hub da empresa | ✅ Integrado | PlanejamentoEstrategicoEmpresa |
| TypeScript | ✅ 0 erros | Verificado em 19/03/2026 |
| Testes Vitest | ✅ 52/52 PASS | 9 suítes, 5.13s |

---

## 2. Funcionalidades Pendentes para Fase 2

### 2.1 Extração IA de PDF com Revisão Obrigatória (CRÍTICO)

**Requisito:** O fluxo de cadastro de contrato via upload de PDF deve incluir uma tela de revisão obrigatória antes de salvar. O usuário não pode prosseguir sem revisar e confirmar os dados extraídos pela IA.

**O que já existe:**
- Procedure `contratos.contratos.extrairPDF` no router (recebe base64 do PDF, chama IA, retorna dados estruturados)
- Tabela `contratosExtracao` para armazenar extrações pendentes de revisão
- Serviço `ai-analyzer.ts` com lógica de extração

**O que falta:**
- Tela de revisão no `ContratoForm.tsx`: após upload do PDF, exibir os dados extraídos em campos editáveis, com botão "Confirmar e Salvar" que chama `contratos.contratos.confirmarExtracao`
- Bloqueio do botão "Salvar" enquanto a extração não for revisada
- Indicador visual de confiança por campo (Alta/Média/Baixa)

**Estimativa:** 1 dia de desenvolvimento

---

### 2.2 Cadastro de Clientes via CNPJ Card (IMPORTANTE)

**Requisito:** Upload de cartão CNPJ (PDF/imagem) com extração automática de dados para preencher o formulário de cliente.

**O que já existe:**
- Página `ContratosClientes.tsx` com formulário manual de cadastro
- Serviço `ai-analyzer.ts` que pode ser estendido para leitura de CNPJ

**O que falta:**
- Campo de upload de CNPJ card no formulário de cliente
- Procedure `contratos.clientes.extrairCNPJ` que recebe base64 e retorna campos preenchidos
- Validação dos dígitos verificadores do CNPJ no frontend

**Estimativa:** 0,5 dia de desenvolvimento

---

### 2.3 Workflow de Aprovação de Boletim por E-mail (IMPORTANTE)

**Requisito:** O aprovador deve receber um link por e-mail para aprovar/rejeitar o boletim de medição, com geração de PDF após a decisão.

**O que já existe:**
- Tabela `boletinsAprovacaoTokens` com campos `token`, `aprovadorEmail`, `aprovadorNome`, `expiresAt`, `usedAt`
- Procedure `contratos.boletins.enviarAprovacao` que cria o token
- Procedure `contratos.boletins.aprovarPorToken` para processar a decisão
- Serviço `approval-service.ts` com lógica de token e geração de PDF
- Serviço `pdf-boletim.ts` para geração do PDF do boletim

**O que falta:**
- Configuração de serviço SMTP (variável de ambiente `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`)
- Rota pública `/aprovacao/:token` no App.tsx para a página de aprovação
- Página `AprovacaoBoletim.tsx` com layout público (sem autenticação) mostrando o boletim e botões Aprovar/Rejeitar
- Envio real do e-mail no `approval-service.ts` (atualmente registra o token mas não envia o e-mail)

**Estimativa:** 1 dia de desenvolvimento + configuração SMTP

---

### 2.4 Módulo de Avaliação de Contratos (IMPORTANTE)

**Requisito:** Sistema de avaliação de desempenho contratual com critérios customizáveis, múltiplos avaliadores, aprovação pelo gestor e plano de ação automático para notas abaixo de 7.

**O que já existe:**
- Tabelas `contratosAvaliacao`, `avaliacaoCriterios`, `avaliacaoRespostas`
- Tabela `contratosPlanoAcao` para planos de ação automáticos

**O que falta:**
- Sub-router `contratos.avaliacoes` com procedures CRUD
- Página `ContratoAvaliacao.tsx` com formulário de avaliação
- Lógica de trigger automático de plano de ação quando nota < 7
- Aba "Avaliação" no `ContratoDetalhe.tsx`

**Estimativa:** 2 dias de desenvolvimento

---

### 2.5 Contratos Ativos Agrupados por Empresa na Home (COMPLEMENTAR)

**Requisito:** Card "Contratos Ativos" na Home exibindo contratos separados e agrupados por empresa do grupo.

**O que já existe:**
- Procedure `contratos.contratos.list` que aceita `empresaId`
- Card de Contratos no hub de planejamento de cada empresa

**O que falta:**
- Procedure `contratos.contratos.listGrupo` que retorna contratos de todas as empresas agrupados
- Card "Contratos Ativos do Grupo" na Home com breakdown por empresa

**Estimativa:** 0,5 dia de desenvolvimento

---

### 2.6 Geração Automática de Boletim ao Criar Marco (COMPLEMENTAR)

**Requisito:** Ao criar um marco financeiro, o sistema deve criar automaticamente o boletim de medição vinculado, que já aparece na aba Boletins pronto para o fluxo de aprovação.

**O que já existe:**
- Procedure `contratos.marcos.create` que cria o marco
- Procedure `contratos.boletins.create` que cria o boletim

**O que falta:**
- Chamar `createBoletimMedicao` automaticamente dentro de `createMarco` no `contratos.db.ts`
- Garantir que o boletim criado automaticamente apareça na aba Boletins do ContratoDetalhe

**Estimativa:** 0,5 dia de desenvolvimento

---

## 3. Mapa de Entidades e Relacionamentos

```
empresas (1)
  └── contratosClientes (N) — empresaId FK
        └── contratos (N) — clienteId FK, empresaId FK
              ├── contratosMarcos (N) — contratoId FK
              │     └── contratosBoletins (1) — marcoId FK
              │           ├── boletinsAprovacaoTokens (N) — boletimId FK
              │           └── boletinsAprovacaoHistorico (N) — boletimId FK
              ├── contratosAditivos (N) — contratoId FK
              │     └── contratosMarcos (N) — aditivoId FK (aditivos têm próprios marcos)
              ├── contratosRiscos (N) — contratoId FK
              ├── contratosDocumentos (N) — contratoId FK
              ├── contratosAuditoria (N) — contratoId FK
              ├── contratosExtracao (N) — contratoId FK
              ├── contratosAvaliacao (N) — contratoId FK
              │     ├── avaliacaoCriterios (N) — avaliacaoId FK
              │     └── avaliacaoRespostas (N) — avaliacaoId FK
              └── contratosPlanoAcao (N) — contratoId FK
```

---

## 4. Checklist de Migração para Produção

### Pré-requisitos Técnicos

- [ ] Configurar variáveis de ambiente SMTP para envio de e-mail de aprovação
- [ ] Verificar limite de upload de PDF no servidor (atualmente 50MB via `express.json`)
- [ ] Configurar bucket S3 para armazenamento de PDFs de contratos e boletins
- [ ] Revisar índices das tabelas contratuais para performance em produção

### Validações de Negócio

- [ ] Homologar fluxo completo: Cliente → Contrato → Marco → Boletim → Aprovação
- [ ] Validar extração IA com PDFs reais de contratos do grupo
- [ ] Testar workflow de aprovação com e-mail real do aprovador
- [ ] Validar geração de PDF do boletim com dados reais

### Segurança

- [ ] Verificar que tokens de aprovação expiram em 7 dias (campo `expiresAt`)
- [ ] Garantir que a rota pública `/aprovacao/:token` não expõe dados sensíveis além do boletim
- [ ] Auditar que todas as mutations de contratos registram na tabela `contratosAuditoria`

---

## 5. Estimativa de Esforço Fase 2

| Funcionalidade | Prioridade | Estimativa |
|---|---|---|
| Extração IA de PDF com revisão obrigatória | Crítico | 1 dia |
| Workflow de aprovação por e-mail | Importante | 1 dia |
| Módulo de avaliação de contratos | Importante | 2 dias |
| Cadastro via CNPJ card | Importante | 0,5 dia |
| Geração automática de boletim | Complementar | 0,5 dia |
| Contratos ativos na Home | Complementar | 0,5 dia |
| **Total estimado** | | **5,5 dias** |

---

## 6. Rollback

Para reverter a integração do SGC e retornar ao estado anterior à Fase 1, utilize o checkpoint `531c167c` disponível na interface de gerenciamento do projeto. Este checkpoint contém o estado do portal imediatamente antes da integração do módulo de contratos.

**Atenção:** O rollback do código não reverte as tabelas criadas no banco de dados. Para reverter o banco, execute manualmente:

```sql
DROP TABLE IF EXISTS contratos_plano_acao;
DROP TABLE IF EXISTS contratos_change_requests;
DROP TABLE IF EXISTS contratos_sequencias;
DROP TABLE IF EXISTS contratos_avaliacao_respostas;
DROP TABLE IF EXISTS contratos_avaliacao_criterios;
DROP TABLE IF EXISTS contratos_avaliacao;
DROP TABLE IF EXISTS contratos_extracao;
DROP TABLE IF EXISTS contratos_auditoria;
DROP TABLE IF EXISTS contratos_documentos;
DROP TABLE IF EXISTS contratos_riscos;
DROP TABLE IF EXISTS boletins_aprovacao_historico;
DROP TABLE IF EXISTS boletins_aprovacao_tokens;
DROP TABLE IF EXISTS contratos_boletins;
```

---

*Documento gerado em 19/03/2026 — Portal Estratégico Grupo Arqueo*
