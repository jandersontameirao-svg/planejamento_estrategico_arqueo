# SGC — Plano de Consolidação: Fase 2

**Sistema de Gestão de Contratos integrado ao Portal Estratégico Grupo Arqueo**
Versão 1.0 · Março 2026

---

## 1. Contexto e Objetivo

A **Fase 1** do SGC entregou a estrutura funcional mínima do módulo de Gestão de Contratos integrado ao portal estratégico do Grupo Arqueo. O banco de dados foi provisionado com 10 tabelas dedicadas, o backend tRPC foi implementado com 30+ procedures e as páginas principais foram criadas no padrão visual do portal.

A **Fase 2** tem como objetivo consolidar o módulo com as funcionalidades avançadas identificadas nos requisitos de negócio, especialmente:

- Extração de dados de contratos via IA (PDF drag-and-drop)
- Workflow de Boletim de Medição com aprovação por e-mail
- Avaliação de desempenho contratual com metodologias customizáveis
- Cadastro centralizado de clientes por CNPJ com leitura de cartão via IA
- Registro de currículos de usuários internos com extração IA

---

## 2. Mapa de Entidades — Domínio Contratos

```
Grupo Arqueo
└── Empresa (empresaId)
    └── Cliente (CNPJ obrigatório)
        └── Contrato
            ├── Aditivo (tipo: financeiro | escopo)
            │   └── Marco Financeiro
            │       └── Boletim de Medição
            ├── Risco Contratual
            ├── Documento (classificado por IA)
            └── Avaliação de Desempenho
                └── Plano de Ação (se score < 7)
```

### 2.1 Tabelas já implementadas (Fase 1)

| Tabela | Descrição | Status |
|--------|-----------|--------|
| `contratos_clientes` | Cadastro de clientes com CNPJ | ✅ Criada |
| `contratos` | Contratos vinculados a empresa + cliente | ✅ Criada |
| `contratos_aditivos` | Aditivos (financeiro/escopo) | ✅ Criada |
| `contratos_marcos` | Marcos financeiros com valor previsto/pago | ✅ Criada |
| `contratos_boletins` | Boletins de medição por marco | ✅ Criada |
| `contratos_riscos` | Riscos contratuais com severidade | ✅ Criada |
| `contratos_documentos` | Documentos classificados por IA | ✅ Criada |
| `contratos_avaliacoes` | Avaliações de desempenho | ✅ Criada |
| `contratos_avaliacoes_itens` | Itens de avaliação por critério | ✅ Criada |
| `contratos_auditoria` | Trilha de auditoria completa | ✅ Criada |

### 2.2 Tabelas a criar na Fase 2

| Tabela | Descrição | Prioridade |
|--------|-----------|------------|
| `contratos_metodologias_avaliacao` | Metodologias customizáveis de avaliação | Alta |
| `contratos_criterios_avaliacao` | Critérios e pesos por metodologia/cargo | Alta |
| `contratos_aprovadores_boletim` | Responsáveis por aprovar boletins | Alta |
| `usuarios_curriculos` | Currículos de usuários internos | Média |
| `contratos_notificacoes` | Histórico de notificações enviadas | Média |

---

## 3. Checklist de Migração — Fase 2

### 3.1 Extração IA de Contratos (PDF)

- [ ] Implementar upload de PDF no `ContratoForm` com drag-and-drop
- [ ] Procedure `contratos.extrairDadosPDF` — recebe URL do S3, chama LLM com schema estruturado
- [ ] Campos extraídos: número do contrato, valor total, data de início/fim, partes, marcos financeiros, riscos identificados
- [ ] Tela de revisão obrigatória antes de salvar (nenhum dado é persistido sem aprovação do usuário)
- [ ] Replicar o mesmo fluxo para Aditivos (`contratos.extrairDadosAditivoPDF`)
- [ ] Campo `tipoAditivo` (financeiro | escopo) obrigatório para análise correta pela IA

### 3.2 Cadastro de Clientes via CNPJ + IA

- [ ] Campo CNPJ como identificador principal no formulário de cliente
- [ ] Upload de cartão CNPJ (PDF/imagem) com extração automática de campos via LLM
- [ ] Campos extraídos: razão social, nome fantasia, endereço, sócios, CNAE
- [ ] Validação de formato CNPJ (14 dígitos, dígitos verificadores)
- [ ] Cadastro centralizado: cliente registrado uma vez, vinculável a múltiplas empresas do grupo

### 3.3 Workflow de Boletim de Medição

- [ ] Criação automática do boletim ao criar um marco financeiro
- [ ] Campos: responsável aprovador (nome + e-mail), prazo de aprovação
- [ ] Envio de e-mail com link de aprovação (token único, sem necessidade de login)
- [ ] Página pública `/boletim/:token` — exibe boletim com botões Aprovar / Reprovar + campo de observações
- [ ] Geração de PDF após aprovação/reprovação
- [ ] Notificação ao gestor do projeto e ao financeiro após decisão
- [ ] Boletim aparece na aba Relatórios imediatamente após criação

### 3.4 Avaliação de Desempenho Contratual

- [ ] CRUD de metodologias de avaliação (grupos/clouds + critérios + pesos)
- [ ] Pesos customizáveis por cargo/função do avaliado
- [ ] Suporte a múltiplos avaliadores por contrato
- [ ] Resultado final registrado apenas pelo perfil `gestor`
- [ ] Trigger automático de Plano de Ação quando score final < 7
- [ ] Plano de Ação vinculado ao contrato e editável

### 3.5 Currículos de Usuários Internos

- [ ] Tabela `usuarios_curriculos` com campos: formação, experiências, habilidades, certificações
- [ ] Upload de arquivo de currículo (PDF/DOCX) com extração IA de campos
- [ ] Página de perfil do usuário com aba "Currículo"
- [ ] Acesso restrito: usuário edita o próprio, gestor/admin visualiza todos

### 3.6 Auditoria e Notificações

- [ ] Auditoria já implementada na Fase 1 ✅
- [ ] Tabela `contratos_notificacoes` para histórico de e-mails enviados
- [ ] Painel de auditoria acessível na aba "Auditoria" do módulo Contratos
- [ ] Filtros por entidade, ação e período

---

## 4. Regras de Negócio Críticas

As seguintes regras devem ser implementadas e testadas antes do go-live da Fase 2:

**Marcos Financeiros:**
- Marco com `dataVencimento < hoje` e `status != pago` → flag automática como "Atrasado"
- Marco deve ter tanto `valorPrevisto` quanto `valorPago` (pode ser zero)
- Prazo de pagamento customizável por contrato

**Avaliação de Desempenho:**
- Score final < 7 → criação automática de Plano de Ação vinculado ao contrato
- Pesos dos critérios variam por cargo do avaliado
- Resultado final só pode ser registrado por usuário com role `gestor` ou `admin`

**Contratos Ativos:**
- Listagem de contratos ativos agrupada por empresa do grupo
- Filtros: empresa, status, cliente, período de vigência

**Extração IA:**
- Nenhum dado extraído é persistido sem revisão e aprovação explícita do usuário
- Indicador de confiança por campo extraído (Alta / Média / Baixa)

---

## 5. Dependências Técnicas

| Dependência | Uso | Status |
|-------------|-----|--------|
| `pdf-parse` | Extração de texto de PDFs | ✅ Instalado |
| `xlsx` | Leitura de planilhas | ✅ Instalado |
| `invokeLLM` | Análise IA (extração + riscos) | ✅ Disponível |
| `storagePut` | Upload de PDFs para S3 | ✅ Disponível |
| `notifyOwner` | Notificações ao gestor | ✅ Disponível |
| Serviço de e-mail externo | Envio de links de aprovação de boletins | ⚠️ A configurar |

> **Nota:** O envio de e-mails para aprovação de boletins requer integração com um serviço SMTP ou API de e-mail transacional (ex: SendGrid, Resend). Esta configuração deve ser realizada antes da implementação do workflow de boletins.

---

## 6. Estimativa de Esforço

| Funcionalidade | Complexidade | Estimativa |
|----------------|-------------|------------|
| Extração IA de PDF (contratos + aditivos) | Alta | 2–3 dias |
| Cadastro de clientes via CNPJ + IA | Média | 1–2 dias |
| Workflow de Boletim de Medição | Alta | 2–3 dias |
| Avaliação de desempenho + metodologias | Alta | 3–4 dias |
| Currículos de usuários internos | Média | 1–2 dias |
| Notificações e auditoria avançada | Baixa | 1 dia |
| **Total estimado** | | **10–15 dias** |

---

## 7. Ordem de Implementação Recomendada

A ordem abaixo minimiza dependências entre funcionalidades e entrega valor incremental a cada sprint:

1. **Cadastro de Clientes via CNPJ + IA** — base para todos os contratos
2. **Extração IA de PDF (Contratos)** — fluxo principal de cadastro de contratos
3. **Extração IA de PDF (Aditivos)** — extensão natural do item anterior
4. **Workflow de Boletim de Medição** — depende de marcos financeiros (já implementados)
5. **Metodologias de Avaliação + CRUD** — base para avaliação de desempenho
6. **Avaliação de Desempenho + Plano de Ação** — depende de metodologias
7. **Currículos de Usuários Internos** — funcionalidade independente

---

*Documento gerado automaticamente pelo sistema de planejamento estratégico do Grupo Arqueo.*
*Última atualização: Março 2026*
