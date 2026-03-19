# Roteiro de Homologação Funcional — SGC (Sistema de Gestão de Contratos)
## Portal Estratégico Grupo Arqueo — Fase 1

**Versão:** 1.0  
**Data:** 19 de março de 2026  
**Checkpoint de referência:** `3ce602f1`  
**URL de homologação:** `https://3000-illjhkfdy82g8b9pfpy7c-9f16bfa1.us1.manus.computer`  
**Responsável pelo teste:** ___________________________  
**Data de execução:** ___________________________

---

## Instruções Gerais

Cada cenário deve ser executado na ordem apresentada dentro de sua prioridade. Para cada item, registre o resultado observado e marque o status:

- **[PASS]** — comportamento conforme esperado
- **[FAIL]** — comportamento divergente do esperado (registrar evidência)
- **[N/A]** — não aplicável neste ambiente de homologação
- **[BLOQ]** — bloqueado por dependência de outro cenário

Ao identificar um **[FAIL]**, registre: URL exata, mensagem de erro, screenshot (se possível) e hora da ocorrência. Não prossiga para o próximo cenário crítico sem resolver o bloqueio.

---

## Pré-requisitos de Ambiente

Antes de iniciar a homologação, confirme:

| Pré-requisito | Verificação |
|---------------|-------------|
| Usuário autenticado com role `admin` disponível | Conta `jandersontameirao@gmail.com` (role: admin) |
| Banco de dados com as 10 tabelas `contratos_*` criadas | Verificar via painel Database do projeto |
| Servidor respondendo na URL de homologação | Acessar a URL e confirmar que a Home carrega |
| Resultado dos testes automatizados: 52 passed | Executar `pnpm test` e confirmar saída |

---

## BLOCO 1 — CRÍTICO

> Cenários que, se falharem, bloqueiam a entrega. Devem ser 100% aprovados antes de qualquer homologação de itens de menor prioridade.

---

### CT-001 — Acesso ao Módulo via Home

**Objetivo:** Confirmar que o card de Gestão de Contratos está visível na Home e navega corretamente.

**Perfil:** Qualquer usuário autenticado.

**Passos:**

1. Acessar a URL raiz `/`.
2. Rolar a página até o final da seção de Áreas de Negócio.
3. Localizar o card **"Gestão de Contratos"** com ícone azul e descrição "SGC — Contratos, marcos financeiros, riscos contratuais e análise IA".
4. Clicar no botão **"Acessar Gestão de Contratos"**.

**Resultado esperado:** O sistema navega para `/contratos` e exibe a página de listagem de contratos com o dashboard de KPIs (Total de Contratos, Contratos Vigentes, Valor Total, Vencendo em 30 dias).

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOQ

**Evidência / Observação:** ___________________________

---

### CT-002 — Acesso Direto por URL sem Autenticação

**Objetivo:** Confirmar que o módulo exige autenticação e redireciona usuários não autenticados.

**Perfil:** Usuário não autenticado (sessão encerrada ou aba anônima).

**Passos:**

1. Abrir aba anônima no navegador.
2. Acessar diretamente `/contratos`.

**Resultado esperado:** O sistema redireciona para a tela de login OAuth. A URL `/contratos` não é acessível sem sessão válida.

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOQ

**Evidência / Observação:** ___________________________

---

### CT-003 — Cadastro de Cliente Contratual (Fluxo Completo)

**Objetivo:** Confirmar o fluxo completo de cadastro de um cliente, que é pré-requisito para criar contratos.

**Perfil:** Usuário autenticado (qualquer role).

**Passos:**

1. Acessar `/contratos/clientes`.
2. Clicar em **"Novo Cliente"**.
3. Preencher os campos obrigatórios:
   - **CNPJ:** `11.222.333/0001-44` (formato com máscara)
   - **Razão Social:** `Empresa Teste Homologação LTDA`
   - **Status:** `Ativo`
4. Preencher campos opcionais:
   - **Nome Fantasia:** `Teste Homologação`
   - **E-mail:** `contato@testehomologacao.com.br`
   - **Cidade:** `Brasília` / **Estado:** `DF`
5. Clicar em **"Salvar"**.

**Resultado esperado:** O cliente aparece na lista de clientes com CNPJ, Razão Social e badge de status "Ativo". Nenhum erro de console é exibido.

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOQ

**Evidência / Observação:** ___________________________

---

### CT-004 — Validação de Campos Obrigatórios no Cadastro de Cliente

**Objetivo:** Confirmar que o sistema rejeita submissão sem os campos mínimos obrigatórios.

**Perfil:** Usuário autenticado.

**Passos:**

1. Acessar `/contratos/clientes` → **"Novo Cliente"**.
2. Deixar o campo **CNPJ** em branco.
3. Preencher apenas a **Razão Social**.
4. Clicar em **"Salvar"**.

**Resultado esperado:** O sistema exibe mensagem de validação indicando que o CNPJ é obrigatório e tem mínimo de 14 caracteres. O formulário não é submetido.

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOQ

**Evidência / Observação:** ___________________________

---

### CT-005 — Cadastro de Contrato (Fluxo Completo)

**Objetivo:** Confirmar o fluxo completo de cadastro de um contrato vinculado a uma empresa e cliente.

**Perfil:** Usuário autenticado.

**Pré-requisito:** CT-003 executado com sucesso (cliente cadastrado).

**Passos:**

1. Acessar `/contratos/novo`.
2. Preencher os campos obrigatórios:
   - **Número:** `CONT-2026-001`
   - **Título:** `Contrato de Prestação de Serviços de Geoprocessamento`
   - **Tipo:** `Serviços`
   - **Empresa:** selecionar uma empresa do grupo (ex: `Arqueogis Geoprocessamento`)
   - **Cliente:** selecionar o cliente cadastrado em CT-003
3. Preencher campos opcionais:
   - **Valor Total:** `150000,00`
   - **Data de Início:** data atual
   - **Data de Término:** data atual + 12 meses
   - **Status:** `Vigente`
4. Clicar em **"Salvar Contrato"**.

**Resultado esperado:** O sistema cria o contrato, exibe toast de sucesso e redireciona para `/contratos/:id` (página de detalhe do contrato recém-criado).

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOQ

**Evidência / Observação:** ___________________________

---

### CT-006 — Visualização do Detalhe do Contrato

**Objetivo:** Confirmar que a página de detalhe exibe todas as abas e informações do contrato.

**Perfil:** Usuário autenticado.

**Pré-requisito:** CT-005 executado com sucesso.

**Passos:**

1. Acessar `/contratos/:id` do contrato criado em CT-005.
2. Verificar a presença das abas: **Visão Geral**, **Marcos Financeiros**, **Aditivos**, **Riscos**, **Documentos**, **Avaliações**, **Auditoria**.
3. Clicar em cada aba e confirmar que carrega sem erro.
4. Na aba **Visão Geral**, confirmar que os dados cadastrados em CT-005 estão exibidos corretamente (número, título, empresa, cliente, valor, datas, status).

**Resultado esperado:** Todas as 7 abas carregam sem erro. Os dados do contrato são exibidos corretamente na aba Visão Geral.

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOQ

**Evidência / Observação:** ___________________________

---

### CT-007 — Criação de Marco Financeiro

**Objetivo:** Confirmar o cadastro de um marco financeiro dentro de um contrato.

**Perfil:** Usuário autenticado.

**Pré-requisito:** CT-005 executado com sucesso.

**Passos:**

1. Acessar `/contratos/:id` → aba **Marcos Financeiros**.
2. Clicar em **"Novo Marco"**.
3. Preencher:
   - **Título:** `Parcela 1 — Mobilização`
   - **Valor Previsto:** `50000,00`
   - **Data de Vencimento:** data atual + 30 dias
4. Clicar em **"Salvar"**.

**Resultado esperado:** O marco aparece na lista com status `Pendente`, valor previsto R$ 50.000,00 e data de vencimento correta. Nenhum erro de console.

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOQ

**Evidência / Observação:** ___________________________

---

### CT-008 — Detecção Automática de Marco Vencido

**Objetivo:** Confirmar que o sistema sinaliza automaticamente marcos com data de vencimento passada.

**Perfil:** Usuário autenticado.

**Passos:**

1. Criar um marco financeiro (conforme CT-007) com **Data de Vencimento** igual a uma data passada (ex: 01/01/2025).
2. Salvar e verificar o status exibido na lista de marcos.

**Resultado esperado:** O marco exibe badge ou indicador visual de **"Atrasado"** (status `atrasado`), diferenciando-o dos marcos pendentes dentro do prazo.

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOQ

**Evidência / Observação:** ___________________________

---

### CT-009 — Registro de Risco Contratual

**Objetivo:** Confirmar o cadastro de um risco contratual com classificação por severidade e probabilidade.

**Perfil:** Usuário autenticado.

**Pré-requisito:** CT-005 executado com sucesso.

**Passos:**

1. Acessar `/contratos/:id` → aba **Riscos**.
2. Clicar em **"Novo Risco"**.
3. Preencher:
   - **Título:** `Risco de Atraso na Entrega de Dados`
   - **Categoria:** `Operacional`
   - **Probabilidade:** `Alta`
   - **Impacto:** `Alto`
   - **Severidade:** `Crítica`
   - **Status:** `Identificado`
   - **Mitigação:** `Estabelecer cronograma semanal de acompanhamento`
4. Clicar em **"Salvar"**.

**Resultado esperado:** O risco aparece na lista com badge de severidade `Crítica` (vermelho), probabilidade `Alta` e status `Identificado`. Nenhum erro de console.

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOQ

**Evidência / Observação:** ___________________________

---

### CT-010 — Trilha de Auditoria Automática

**Objetivo:** Confirmar que todas as operações de escrita geram registros automáticos na trilha de auditoria.

**Perfil:** Usuário autenticado.

**Pré-requisito:** CT-005, CT-007 e CT-009 executados com sucesso.

**Passos:**

1. Acessar `/contratos/:id` → aba **Auditoria**.
2. Verificar a presença de registros para cada operação realizada:
   - Criação do contrato (ação: `criacao`, entidade: `contrato`)
   - Criação do marco financeiro (ação: `criacao`, entidade: `marco`)
   - Criação do risco (ação: `criacao`, entidade: `risco`)
3. Para cada registro, confirmar: entidade, ID da entidade, ação, usuário responsável e timestamp.

**Resultado esperado:** A aba Auditoria exibe ao menos 3 registros correspondentes às operações realizadas, com dados corretos de entidade, ação e usuário.

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOQ

**Evidência / Observação:** ___________________________

---

### CT-011 — Dashboard de KPIs do Módulo

**Objetivo:** Confirmar que o dashboard de KPIs reflete os dados cadastrados.

**Perfil:** Usuário autenticado.

**Pré-requisito:** CT-005 executado com sucesso (ao menos 1 contrato cadastrado).

**Passos:**

1. Acessar `/contratos`.
2. Verificar os 4 cards de KPI no topo: **Total de Contratos**, **Contratos Vigentes**, **Valor Total**, **Vencendo em 30 dias**.
3. Confirmar que o contador "Total de Contratos" é ≥ 1.
4. Confirmar que o valor total reflete o valor cadastrado em CT-005 (R$ 150.000,00).

**Resultado esperado:** Os KPIs exibem valores numéricos corretos e consistentes com os dados cadastrados. Nenhum valor exibe `NaN`, `undefined` ou `R$ 0,00` quando há dados.

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOQ

**Evidência / Observação:** ___________________________

---

### CT-012 — Edição de Contrato

**Objetivo:** Confirmar que os dados de um contrato podem ser editados e persistidos.

**Perfil:** Usuário autenticado.

**Pré-requisito:** CT-005 executado com sucesso.

**Passos:**

1. Acessar `/contratos/:id` → aba **Visão Geral**.
2. Clicar em **"Editar"** (ou botão equivalente de edição).
3. Alterar o campo **Status** de `Vigente` para `Em Análise`.
4. Alterar o campo **Valor Total** para `175000,00`.
5. Salvar as alterações.
6. Recarregar a página (`F5`).

**Resultado esperado:** Após recarregar, os campos exibem os novos valores (`Em Análise`, R$ 175.000,00). A trilha de auditoria registra a operação de `edicao` com os dados antes e depois.

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOQ

**Evidência / Observação:** ___________________________

---

### CT-013 — Não-Regressão: Home e Navegação Principal

**Objetivo:** Confirmar que a adição do card de Contratos não quebrou nenhum elemento pré-existente da Home.

**Perfil:** Usuário autenticado.

**Passos:**

1. Acessar `/`.
2. Confirmar que a seção **"Grupo Arqueo Brasil"** com o card de Planejamento Estratégico está visível.
3. Confirmar que as **Áreas de Negócio** estão listadas com suas empresas vinculadas dentro de cada área.
4. Clicar no botão **"Planejamento"** de uma empresa dentro de uma área e confirmar navegação para `/empresa/:id/planejamento`.
5. Retornar à Home e confirmar que o card de **"Gestão de Contratos"** está posicionado após as áreas de negócio, sem sobrepor nenhum elemento existente.

**Resultado esperado:** Todos os elementos pré-existentes da Home estão visíveis, funcionais e sem sobreposição. O card de Contratos aparece como um novo elemento independente ao final da página.

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOQ

**Evidência / Observação:** ___________________________

---

### CT-014 — Não-Regressão: Planejamento Estratégico de Empresa

**Objetivo:** Confirmar que o módulo de Planejamento Estratégico de uma empresa continua funcionando após a implementação do SGC.

**Perfil:** Usuário autenticado.

**Passos:**

1. Acessar `/empresa/1/planejamento` (ou qualquer empresa disponível).
2. Confirmar que os cards de análise (PESTEL, SWOT, BSC, OKR, 5 Forças, RBV/VRIO, Stakeholders, Identidade Organizacional, Gestão Orçamentária) estão visíveis.
3. Clicar no card **PESTEL** para expandir.
4. Confirmar que o card expande e exibe os fatores PESTEL cadastrados.
5. Clicar em **"Configurar Metodologias"** e confirmar que o dialog abre com as metodologias disponíveis.

**Resultado esperado:** O hub de planejamento funciona normalmente. Cards expandem, dados são exibidos e o seletor de metodologias abre sem erros.

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOQ

**Evidência / Observação:** ___________________________

---

### CT-015 — Não-Regressão: Gestão Orçamentária

**Objetivo:** Confirmar que o módulo de Gestão Orçamentária continua funcionando.

**Perfil:** Usuário autenticado.

**Passos:**

1. Acessar `/empresa/1/orcamento` (ou via hub de planejamento → card Gestão Orçamentária).
2. Confirmar que as abas **Dashboard**, **Planejado**, **Executado**, **Importação**, **Categorias** e **Análise IA** estão visíveis.
3. Acessar a aba **Categorias** e confirmar que as categorias pré-cadastradas estão listadas.
4. Expandir uma categoria e confirmar que as subcategorias são exibidas.

**Resultado esperado:** O módulo de Orçamento carrega sem erros. Todas as abas são acessíveis. Categorias e subcategorias estão visíveis.

**Status:** [ ] PASS  [ ] FAIL  [ ] BLOQ

**Evidência / Observação:** ___________________________

---

## BLOCO 2 — IMPORTANTE

> Cenários que validam funcionalidades relevantes do módulo. Falhas neste bloco devem ser documentadas e avaliadas para decisão de aceite condicionado.

---

### CT-016 — Filtro de Contratos por Empresa

**Objetivo:** Confirmar que o filtro de empresa na listagem de contratos funciona corretamente.

**Perfil:** Usuário autenticado.

**Pré-requisito:** Ao menos 2 contratos cadastrados em empresas diferentes.

**Passos:**

1. Acessar `/contratos`.
2. Localizar o seletor de filtro por empresa.
3. Selecionar uma empresa específica.
4. Confirmar que apenas os contratos dessa empresa são exibidos na lista.
5. Selecionar "Todas as empresas" e confirmar que todos os contratos voltam a ser exibidos.

**Resultado esperado:** O filtro por empresa funciona corretamente, exibindo apenas os contratos da empresa selecionada.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-017 — Filtro de Contratos por Status

**Objetivo:** Confirmar que o filtro de status na listagem de contratos funciona corretamente.

**Perfil:** Usuário autenticado.

**Pré-requisito:** Contratos com diferentes status cadastrados.

**Passos:**

1. Acessar `/contratos`.
2. Localizar o seletor de filtro por status.
3. Selecionar o status `Vigente`.
4. Confirmar que apenas contratos com status `Vigente` são exibidos.
5. Selecionar `Rascunho` e confirmar a filtragem.

**Resultado esperado:** O filtro por status exibe corretamente apenas os contratos no status selecionado.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-018 — Cadastro de Aditivo Contratual

**Objetivo:** Confirmar o cadastro de um aditivo ao contrato com campo de tipo obrigatório.

**Perfil:** Usuário autenticado.

**Pré-requisito:** CT-005 executado com sucesso.

**Passos:**

1. Acessar `/contratos/:id` → aba **Aditivos**.
2. Clicar em **"Novo Aditivo"**.
3. Preencher:
   - **Número:** `ADIT-2026-001`
   - **Tipo:** `Financeiro`
   - **Valor do Aditivo:** `25000,00`
   - **Descrição:** `Aditivo de reequilíbrio financeiro`
4. Clicar em **"Salvar"**.

**Resultado esperado:** O aditivo aparece na lista com tipo `Financeiro`, valor R$ 25.000,00 e status `Rascunho`. O campo **Tipo** (financeiro/escopo/prazo/misto) é exibido e obrigatório.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-019 — Edição de Marco Financeiro

**Objetivo:** Confirmar que marcos financeiros podem ser editados após criação.

**Perfil:** Usuário autenticado.

**Pré-requisito:** CT-007 executado com sucesso.

**Passos:**

1. Acessar `/contratos/:id` → aba **Marcos Financeiros**.
2. Localizar o marco criado em CT-007.
3. Clicar no botão de edição do marco.
4. Alterar o **Valor Previsto** para `55000,00`.
5. Registrar um **Valor Pago** de `55000,00`.
6. Alterar o **Status** para `Pago`.
7. Salvar.

**Resultado esperado:** O marco exibe os novos valores (R$ 55.000,00 previsto, R$ 55.000,00 pago, status `Pago`). A trilha de auditoria registra a edição.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-020 — Upload e Vinculação de Documento

**Objetivo:** Confirmar o cadastro de um documento vinculado ao contrato.

**Perfil:** Usuário autenticado.

**Pré-requisito:** CT-005 executado com sucesso.

**Passos:**

1. Acessar `/contratos/:id` → aba **Documentos**.
2. Clicar em **"Novo Documento"**.
3. Preencher:
   - **Título:** `Contrato Assinado`
   - **Tipo:** `Contrato Principal`
   - **URL do Documento:** `https://exemplo.com/contrato.pdf`
4. Clicar em **"Salvar"**.

**Resultado esperado:** O documento aparece na lista com tipo `Contrato Principal` e link para a URL informada.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-021 — Análise IA de Riscos

**Objetivo:** Confirmar que a análise IA de riscos contratuais retorna resultado estruturado.

**Perfil:** Usuário autenticado.

**Pré-requisito:** CT-005 executado com sucesso.

**Passos:**

1. Acessar `/contratos/:id` → aba **Riscos**.
2. Clicar em **"Analisar Riscos com IA"** (ou botão equivalente).
3. Aguardar o processamento (pode levar 5–15 segundos).
4. Verificar se a IA retornou ao menos 1 risco sugerido com: título, categoria, severidade, probabilidade e sugestão de mitigação.

**Resultado esperado:** A IA retorna uma lista de riscos sugeridos com campos preenchidos. Nenhum erro de timeout ou falha de API é exibido.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-022 — Classificação IA de Documento

**Objetivo:** Confirmar que a IA classifica automaticamente um documento por tipo e nome.

**Perfil:** Usuário autenticado.

**Pré-requisito:** CT-020 executado com sucesso.

**Passos:**

1. Acessar `/contratos/:id` → aba **Documentos**.
2. Localizar o documento criado em CT-020.
3. Clicar em **"Classificar com IA"** (ou botão equivalente).
4. Aguardar o processamento.
5. Verificar se o documento recebeu classificação automática de tipo e tags.

**Resultado esperado:** O documento exibe o tipo classificado pela IA e ao menos 1 tag descritiva. O campo `classificado_ia` é marcado como verdadeiro.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-023 — Extração de CNPJ via IA

**Objetivo:** Confirmar que a extração de dados de CNPJ via IA retorna estrutura válida.

**Perfil:** Usuário autenticado.

**Passos:**

1. Acessar `/contratos/clientes` → **"Novo Cliente"**.
2. Localizar o botão **"Extrair via IA"** ou campo de upload de cartão CNPJ.
3. Informar um CNPJ manualmente: `11.222.333/0001-44`.
4. Clicar em **"Buscar dados"** ou equivalente.
5. Verificar se os campos do formulário são preenchidos automaticamente.

**Resultado esperado:** O formulário é preenchido com os dados retornados pela IA (razão social, endereço, contato). Se a IA não encontrar dados para o CNPJ de teste, o sistema exibe mensagem informativa sem travar.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-024 — Auditoria Geral do Módulo

**Objetivo:** Confirmar que a procedure de auditoria geral retorna registros de todas as entidades.

**Perfil:** Usuário autenticado.

**Pré-requisito:** CT-010 executado com sucesso.

**Passos:**

1. Acessar `/contratos/:id` → aba **Auditoria**.
2. Verificar se os registros exibem: entidade, ação, usuário, dados antes/depois e timestamp.
3. Confirmar que registros de diferentes entidades (contrato, marco, risco) aparecem na mesma trilha.
4. Confirmar que os registros estão em ordem cronológica decrescente (mais recente primeiro).

**Resultado esperado:** A trilha de auditoria exibe registros completos de todas as operações realizadas, com dados antes/depois e identificação do usuário responsável.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-025 — Não-Regressão: KPIs e Dashboard do Grupo

**Objetivo:** Confirmar que o dashboard do grupo continua funcionando após a implementação do SGC.

**Perfil:** Usuário autenticado.

**Passos:**

1. Acessar `/dashboard-grupo`.
2. Confirmar que os KPIs do grupo são exibidos (total de empresas, objetivos, projetos, etc.).
3. Acessar `/dashboard` e confirmar que os gráficos carregam sem erro.

**Resultado esperado:** Ambos os dashboards carregam sem erros. Os dados exibidos são consistentes com o estado anterior à implementação do SGC.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-026 — Não-Regressão: Análise PESTEL

**Objetivo:** Confirmar que a análise PESTEL de uma empresa continua funcionando.

**Perfil:** Usuário autenticado.

**Passos:**

1. Acessar `/analise-pestel/1` (ou qualquer empresa com PESTEL cadastrado).
2. Confirmar que os fatores PESTEL são exibidos nas 6 categorias (Político, Econômico, Social, Tecnológico, Ambiental, Legal).
3. Clicar em **"Editar"** em um fator e confirmar que o modal de edição abre.
4. Confirmar que o botão **"Gerar Plano de Ação com IA"** está visível e clicável.

**Resultado esperado:** A análise PESTEL carrega, exibe os fatores, permite edição e o botão de IA está funcional.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-027 — Não-Regressão: Testes Automatizados

**Objetivo:** Confirmar que todos os testes automatizados continuam passando após a implementação do SGC.

**Perfil:** Acesso ao terminal do servidor.

**Passos:**

1. Executar `pnpm test` no diretório do projeto.
2. Aguardar a conclusão de todos os 9 arquivos de teste.
3. Verificar o resultado final.

**Resultado esperado:**
```
Test Files  9 passed (9)
      Tests  52 passed (52)
```
Nenhum teste com status `FAIL` ou `ERROR`.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

## BLOCO 3 — COMPLEMENTAR

> Cenários que validam comportamentos de borda, tratamento de erros e funcionalidades secundárias. Falhas neste bloco são documentadas mas não bloqueiam a entrega.

---

### CT-028 — Tratamento de Erro: Contrato sem Cliente

**Objetivo:** Confirmar que o sistema rejeita a criação de contrato sem cliente vinculado.

**Perfil:** Usuário autenticado.

**Passos:**

1. Acessar `/contratos/novo`.
2. Preencher todos os campos exceto o campo **Cliente**.
3. Clicar em **"Salvar Contrato"**.

**Resultado esperado:** O sistema exibe mensagem de validação indicando que o campo Cliente é obrigatório. O formulário não é submetido.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-029 — Tratamento de Erro: Contrato sem Empresa

**Objetivo:** Confirmar que o sistema rejeita a criação de contrato sem empresa vinculada.

**Perfil:** Usuário autenticado.

**Passos:**

1. Acessar `/contratos/novo`.
2. Preencher todos os campos exceto o campo **Empresa**.
3. Clicar em **"Salvar Contrato"**.

**Resultado esperado:** O sistema exibe mensagem de validação indicando que o campo Empresa é obrigatório. O formulário não é submetido.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-030 — Tratamento de Erro: Acesso a Contrato Inexistente

**Objetivo:** Confirmar que o sistema trata graciosamente o acesso a um ID de contrato que não existe.

**Perfil:** Usuário autenticado.

**Passos:**

1. Acessar `/contratos/99999` (ID inexistente).
2. Observar o comportamento da página.

**Resultado esperado:** O sistema exibe mensagem de "Contrato não encontrado" ou redireciona para `/contratos`, sem travar ou exibir erro de JavaScript não tratado no console.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-031 — Tratamento de Erro: Falha de Conectividade com IA

**Objetivo:** Confirmar que o sistema trata graciosamente falhas na chamada à IA.

**Perfil:** Usuário autenticado.

**Passos:**

1. Acessar `/contratos/:id` → aba **Riscos**.
2. Clicar em **"Analisar Riscos com IA"** em um contrato com dados mínimos (sem descrição, sem valor).
3. Observar o comportamento quando a IA retorna resposta vazia ou inconclusiva.

**Resultado esperado:** O sistema exibe mensagem informativa ("Não foi possível gerar análise" ou similar) sem travar a interface. O usuário consegue continuar usando o módulo normalmente.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-032 — Persistência após Reload

**Objetivo:** Confirmar que todos os dados cadastrados persistem após recarregar a página.

**Perfil:** Usuário autenticado.

**Pré-requisito:** CT-005, CT-007, CT-009 executados com sucesso.

**Passos:**

1. Acessar `/contratos/:id`.
2. Anotar os dados exibidos (número, título, valor, marcos, riscos).
3. Pressionar `F5` para recarregar a página.
4. Comparar os dados exibidos após o reload com os anotados.

**Resultado esperado:** Todos os dados (contrato, marcos, riscos) persistem após reload. Nenhum dado é perdido ou zerado.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-033 — Responsividade em Tela Menor

**Objetivo:** Confirmar que o módulo é utilizável em resoluções menores (tablet/mobile).

**Perfil:** Usuário autenticado.

**Passos:**

1. Abrir as ferramentas de desenvolvedor do navegador (`F12`).
2. Ativar o modo responsivo e selecionar resolução `768×1024` (iPad).
3. Acessar `/contratos` e confirmar que a lista de contratos é legível.
4. Acessar `/contratos/:id` e confirmar que as abas são acessíveis.

**Resultado esperado:** O layout se adapta à resolução menor sem sobreposição de elementos ou texto ilegível. As abas são acessíveis por scroll horizontal se necessário.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-034 — Rollback de Implementação (Procedimento de Emergência)

**Objetivo:** Confirmar que o procedimento de rollback restaura o sistema ao estado anterior ao SGC.

**Perfil:** Administrador do projeto com acesso ao painel de gerenciamento.

> **Atenção:** Este cenário deve ser executado apenas se houver decisão formal de reverter a implementação. Não execute em ambiente de produção sem autorização.

**Passos:**

1. Acessar o painel de gerenciamento do projeto `planejamento_estrategico_arqueo`.
2. Navegar até a aba **Checkpoints**.
3. Localizar o checkpoint `531c167c` (descrição: "Home reorganizada: empresas exibidas dentro de cada área de negócio").
4. Clicar em **"Rollback"** e confirmar a operação.
5. Aguardar a conclusão do rollback.
6. Acessar `/` e confirmar que o card de Gestão de Contratos não está mais presente.
7. Acessar `/contratos` e confirmar que a rota retorna 404 ou redireciona.

**Resultado esperado:** O sistema retorna ao estado do checkpoint `531c167c`. O módulo SGC não está mais acessível. As funcionalidades pré-existentes continuam funcionando normalmente.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-035 — Não-Regressão: Relatórios e Exportação PDF

**Objetivo:** Confirmar que o módulo de relatórios continua funcionando após a implementação do SGC.

**Perfil:** Usuário autenticado.

**Passos:**

1. Acessar `/relatorios`.
2. Confirmar que a página carrega sem erros.
3. Selecionar uma empresa e clicar em **"Gerar PDF"**.
4. Confirmar que o PDF é gerado e disponibilizado para download.

**Resultado esperado:** O módulo de relatórios carrega e gera PDF sem erros. O conteúdo do PDF reflete os dados estratégicos da empresa selecionada.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

### CT-036 — Não-Regressão: Gestão de Usuários

**Objetivo:** Confirmar que o módulo de gestão de usuários continua funcionando.

**Perfil:** Usuário com role `admin`.

**Passos:**

1. Acessar `/gestao-usuarios`.
2. Confirmar que a lista de usuários é exibida.
3. Confirmar que o campo `role` (admin/user) está visível para cada usuário.

**Resultado esperado:** A página de gestão de usuários carrega sem erros e exibe a lista de usuários com seus respectivos roles.

**Status:** [ ] PASS  [ ] FAIL  [ ] N/A

**Evidência / Observação:** ___________________________

---

## Consolidação dos Resultados

Ao finalizar todos os cenários, preencha a tabela de consolidação:

| Bloco | Total de Cenários | PASS | FAIL | N/A | BLOQ |
|-------|------------------|------|------|-----|------|
| Crítico (CT-001 a CT-015) | 15 | | | | |
| Importante (CT-016 a CT-027) | 12 | | | | |
| Complementar (CT-028 a CT-036) | 9 | | | | |
| **Total** | **36** | | | | |

---

## Critérios de Aceite

| Critério | Condição de Aprovação |
|----------|----------------------|
| Bloco Crítico | 100% PASS (15/15). Qualquer FAIL bloqueia a entrega. |
| Bloco Importante | Mínimo 80% PASS (10/12). FAILs devem ser documentados com plano de correção. |
| Bloco Complementar | Mínimo 60% PASS (6/9). FAILs são registrados como dívida técnica para Fase 2. |
| Testes automatizados | 52/52 testes passando (`pnpm test`). |
| TypeScript | 0 erros (`npx tsc --noEmit`). |

---

## Bugs Conhecidos (Limitações da Fase 1)

Os itens abaixo são **limitações conhecidas e documentadas** da Fase 1. Não devem ser considerados falha de homologação, mas devem ser registrados como pendências para a Fase 2:

| ID | Descrição | Impacto | Fase de Correção |
|----|-----------|---------|-----------------|
| BUG-001 | Formulário de contrato não implementa tela de revisão obrigatória após extração IA de PDF | Alto — dados podem ser salvos sem revisão | Fase 2 |
| BUG-002 | Workflow de Boletim de Medição por e-mail não funcional (sem serviço SMTP configurado) | Alto — aprovação por e-mail indisponível | Fase 2 |
| BUG-003 | Listagem de contratos não filtra por empresa do usuário logado | Médio — todos os contratos são visíveis para qualquer usuário autenticado | Fase 2 |
| BUG-004 | Aviso `pdf-parse: Could not load module` no console do Vite (apenas em desenvolvimento) | Baixo — cosmético, sem impacto funcional | Fase 2 |
| BUG-005 | Ausência de testes Vitest específicos para o módulo SGC | Médio — regressões futuras não detectadas automaticamente | Fase 2 |

---

## Assinaturas

| Papel | Nome | Data | Assinatura |
|-------|------|------|-----------|
| Responsável pelo Teste | | | |
| Gestor do Projeto | | | |
| Aprovador Técnico | | | |

---

*Documento gerado pelo sistema de planejamento estratégico do Grupo Arqueo.*  
*Checkpoint de referência: `3ce602f1` — 19 de março de 2026.*
