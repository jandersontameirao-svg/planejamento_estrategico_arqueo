# Plano de Reorganização do Sistema de Gestão Estratégica

## Objetivo
Reorganizar o sistema para que cada empresa tenha suas análises estratégicas completas (PESTEL, 5 Forças, Stakeholders, VRIO, SWOT, OKR, BSC, Identidade), enquanto o Planejamento Macro consolida apenas o BSC agregado de todas as empresas para atingir objetivos macro do grupo.

---

## Estrutura Atual vs. Estrutura Desejada

### ❌ Estrutura Atual (Incorreta)
```
📁 Sistema
├── 🏠 Home (/)
│   └── Lista de empresas
│
├── 📊 Planejamento Macro (/planejamento-estrategico)
│   ├── Identidade Organizacional
│   ├── BSC
│   ├── PESTEL
│   ├── 5 Forças
│   ├── Stakeholders
│   ├── VRIO
│   ├── SWOT
│   └── OKR
│
└── 🏢 Página da Empresa (/empresa/:id/planejamento)
    └── KPIs (estrutura antiga/incompleta)
```

### ✅ Estrutura Desejada (Correta)
```
📁 Sistema
├── 🏠 Home (/)
│   └── Lista de empresas do grupo
│
├── 📊 Planejamento Macro - Grupo Arqueo (/planejamento-macro)
│   └── BSC Consolidado (agregando dados de todas as empresas)
│       ├── Perspectiva Financeira (soma de todas as empresas)
│       ├── Perspectiva Cliente (média/soma de todas as empresas)
│       ├── Perspectiva Processos (média/soma de todas as empresas)
│       └── Perspectiva Aprendizado (média/soma de todas as empresas)
│
└── 🏢 Página da Empresa (/empresa/:id/planejamento)
    ├── Identidade Organizacional (Missão, Visão, Valores)
    ├── BSC (4 perspectivas com indicadores)
    ├── PESTEL (6 categorias com fatores)
    ├── 5 Forças de Porter (5 forças competitivas)
    ├── Stakeholders (Matriz Poder × Interesse)
    ├── VRIO (Recursos e Capacidades)
    ├── SWOT/TOWS (4 quadrantes)
    └── OKR (Objetivos e Key Results)
```

---

## Mudanças Necessárias

### 1. **Página das Empresas** (/empresa/:id/planejamento)
**Ação**: Mover TODOS os componentes de análise melhorados para as páginas individuais das empresas

**Componentes a incluir**:
- ✅ Identidade Organizacional (Missão, Visão, Valores)
- ✅ BSC (Balanced Scorecard com 4 perspectivas)
- ✅ PESTEL (6 cards coloridos, matriz de risco, filtros)
- ✅ 5 Forças (5 cards por tipo, gráfico radar, classificação)
- ✅ Stakeholders (4 quadrantes, matriz poder×interesse)
- ✅ VRIO (4 sliders V-R-I-O, classificação de vantagem)
- ✅ SWOT (4 quadrantes coloridos, seleção visual)
- ✅ OKR (cards de progresso, gráficos barras e pizza)

**Layout**: Mesmo layout atual com cards expansíveis + botão "Gerar Relatório Consolidado em PDF"

**Persistência**: Dados salvos por empresa (cada empresa tem suas próprias análises)

---

### 2. **Planejamento Macro** (/planejamento-macro)
**Ação**: Criar página nova com BSC Consolidado que agrega dados de todas as empresas

**Componente único**: BSC Consolidado

**Funcionalidades**:
- Mostrar indicadores agregados de todas as empresas
- 4 perspectivas (Financeira, Cliente, Processos, Aprendizado)
- Gráficos comparativos entre empresas
- Visão geral do desempenho do grupo
- Objetivos macro do grupo Arqueo

**Cálculos**:
- Financeira: Soma dos indicadores financeiros de todas as empresas
- Cliente: Média dos indicadores de satisfação
- Processos: Média dos indicadores de eficiência
- Aprendizado: Média dos indicadores de crescimento

**Layout**:
- Card de resumo com métricas gerais do grupo
- Gráfico radar comparando as 4 perspectivas
- Tabela/cards mostrando desempenho por empresa
- Gráficos de tendência temporal (se houver histórico)

---

### 3. **Rotas e Navegação**
**Mudanças**:
- `/planejamento-estrategico` → `/planejamento-macro` (renomear rota)
- `/empresa/:id/planejamento` → Adicionar todos os componentes de análise
- Home: Ajustar botão "Acessar Planejamento Macro" para nova rota

---

### 4. **Banco de Dados**
**Estrutura**:
```
empresas
├── id
├── nome
├── setor
└── status

planejamento_empresa (tabela principal)
├── id
├── empresa_id (FK)
├── tipo_analise (pestel, 5forcas, stakeholders, vrio, swot, okr, bsc, identidade)
├── dados (JSON com dados da análise)
└── updated_at

bsc_macro (agregação)
├── id
├── perspectiva (financeira, cliente, processos, aprendizado)
├── indicador
├── meta_grupo
├── valor_atual
└── empresas_contribuintes (JSON com dados por empresa)
```

---

## Cronograma de Implementação

### Fase 1: Preparação (10 min)
- [x] Criar este documento de planejamento
- [ ] Obter aprovação do usuário
- [ ] Atualizar todo.md com tarefas

### Fase 2: Reestruturação das Páginas (30 min)
- [ ] Criar nova página `/planejamento-macro` com BSC Consolidado
- [ ] Mover componentes de análise para página da empresa
- [ ] Remover componentes antigos da página atual `/planejamento-estrategico`
- [ ] Ajustar rotas no App.tsx

### Fase 3: Implementação do BSC Consolidado (20 min)
- [ ] Criar componente `BscConsolidado.tsx`
- [ ] Implementar lógica de agregação de dados
- [ ] Adicionar gráficos comparativos
- [ ] Adicionar tabela de desempenho por empresa

### Fase 4: Ajustes e Testes (20 min)
- [ ] Testar navegação entre páginas
- [ ] Validar persistência de dados por empresa
- [ ] Testar BSC consolidado com dados mock
- [ ] Ajustar estilos e responsividade

### Fase 5: Finalização (10 min)
- [ ] Criar checkpoint
- [ ] Documentar mudanças
- [ ] Entregar ao usuário

**Tempo total estimado**: ~90 minutos

---

## Benefícios da Nova Estrutura

1. **Clareza organizacional**: Cada empresa tem seu planejamento estratégico completo e independente
2. **Visão macro**: O grupo tem uma visão consolidada através do BSC agregado
3. **Escalabilidade**: Fácil adicionar novas empresas ao grupo
4. **Rastreabilidade**: Cada empresa pode acompanhar seu próprio progresso
5. **Alinhamento estratégico**: BSC macro garante que todas as empresas trabalhem para objetivos comuns do grupo

---

## Próximos Passos

1. **Aguardar aprovação** deste plano
2. **Iniciar implementação** seguindo as fases descritas
3. **Testar** com dados reais das empresas
4. **Ajustar** conforme feedback do usuário
5. **Publicar** versão final

---

**Status**: ⏳ Aguardando aprovação do usuário
