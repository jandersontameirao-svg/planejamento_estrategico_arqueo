# Integração com SGC (Sistema de Gestão de Contratos)

## Visão Geral

Este documento descreve como o sistema de Planejamento Estratégico Grupo Arqueo integra-se com o SGC para consumir dados contratuais como fonte oficial, mantendo a separação de responsabilidades e permitindo que cada sistema evolua independentemente.

## Objetivo

Transformar este sistema em consumidor dos dados contratuais do SGC, eliminando a duplicação de dados e permitindo que o SGC seja o dono único do domínio contratual.

## Arquitetura

### Componentes Principais

#### 1. **SGC Client** (`server/integrations/sgcClient.ts`)
- Cliente HTTP centralizado para comunicação com o SGC
- Gerencia autenticação via token técnico
- Trata timeouts, erros e indisponibilidade
- Implementa retry logic e logging

**Responsabilidades:**
- Fazer requisições GET/POST para o SGC
- Gerenciar headers de autenticação
- Tratar erros de conexão
- Registrar logs de integração

**Uso:**
```typescript
import { getSGCClient } from "./integrations/sgcClient";

const sgcClient = getSGCClient();
const response = await sgcClient.get<any[]>("/contratos", { empresaId: 1 });
```

#### 2. **Contracts Gateway** (`server/integrations/contractsGateway.ts`)
- Orquestra chamadas ao SGC Client
- Mapeia payloads brutos para DTOs internos
- Implementa cache local (TTL: 5 minutos)
- Trata fallback para dados legados

**Responsabilidades:**
- Agregar dados de múltiplas chamadas ao SGC
- Normalizar payloads para DTOs internos
- Gerenciar cache local
- Implementar resiliência

**Uso:**
```typescript
import { getContractsGateway } from "./integrations/contractsGateway";

const gateway = getContractsGateway();
const contratos = await gateway.getContratosByEmpresa(empresaId);
```

#### 3. **DTOs Internos** (`server/integrations/sgcDtos.ts`)
- Modelos de dados para leitura estratégica
- Desacoplam este sistema do formato bruto do SGC
- Permitem evolução independente

**DTOs Principais:**
- `StrategicClientSummaryDTO` - Resumo de cliente
- `StrategicContractSummaryDTO` - Resumo de contrato
- `StrategicMilestoneSummaryDTO` - Resumo de marco
- `StrategicRiskSummaryDTO` - Resumo de risco
- `StrategicContractContextDTO` - Contexto completo

#### 4. **Router de Contratos com Gateway** (`server/routers/contratosGateway.ts`)
- Adapta procedures de leitura para consumir do SGC
- Bloqueia operações de escrita local
- Mantém compatibilidade com assinaturas do frontend

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `SGC_API_BASE_URL` | URL base da API do SGC | `https://arqueomanage-c7undxdh.manus.space/api/integration/v1` |
| `SGC_INTERNAL_TOKEN` | Token técnico de autenticação | `71e7a78c77a2b8e1257ff6a86c5887ebb7fb7441c29c5f9a83cdc6a9459772a4` |
| `SGC_TIMEOUT_MS` | Timeout para requisições (ms) | `10000` |
| `SGC_ENABLED` | Habilita/desabilita integração | `true` |
| `SGC_PUBLIC_APP_URL` | URL pública do SGC para deep-links | `https://arqueomanage-c7undxdh.manus.space` |

## Fluxo de Dados

```
Frontend (React)
    ↓
tRPC Procedures (contratosGateway router)
    ↓
Contracts Gateway (orquestra e cache)
    ↓
SGC Client (HTTP + autenticação)
    ↓
SGC API (https://arqueomanage-c7undxdh.manus.space/api/integration/v1)
```

## Procedures Adaptadas

### Leitura (Consumem do SGC)

| Procedure | Endpoint SGC | Retorno |
|-----------|-------------|---------|
| `contratos.list` | `GET /contratos` | `StrategicContractSummaryDTO[]` |
| `contratos.get` | `GET /contratos/:id` | `StrategicContractSummaryDTO` |
| `contratos.marcos` | `GET /contratos/:id/marcos` | `StrategicMilestoneSummaryDTO[]` |
| `contratos.riscos` | `GET /contratos/:id/riscos` | `StrategicRiskSummaryDTO[]` |
| `contratos.boletins` | `GET /contratos/:id/boletins` | `StrategicBulletinSummaryDTO[]` |
| `contratos.aggregate` | `GET /contratos/aggregate` | `StrategicContractAggregateDTO` |
| `contratos.alerts` | `GET /alertas` | `StrategicAlertDTO[]` |

### Escrita (Bloqueadas)

As seguintes procedures foram bloqueadas e retornam erro `FORBIDDEN`:
- `contratos.create` - Use o SGC para criar contratos
- `contratos.update` - Use o SGC para atualizar contratos
- `contratos.delete` - Use o SGC para deletar contratos

**Razão:** O SGC é agora o dono único do domínio contratual. Toda escrita deve ocorrer lá.

## Cache Local

O `ContractsGateway` implementa cache com TTL de 5 minutos para otimizar performance:

```typescript
// Cache é automaticamente gerenciado
const contratos = await gateway.getContratosByEmpresa(empresaId); // Consulta SGC na 1ª vez
const contratos2 = await gateway.getContratosByEmpresa(empresaId); // Retorna cache

// Limpar cache manualmente
gateway.clearCache(); // Limpa tudo
gateway.clearCacheKey("contratos:1"); // Limpa chave específica
```

## Tratamento de Erros

### Quando o SGC está indisponível

1. **Timeout:** Retorna erro com mensagem clara
2. **Erro HTTP:** Registra log e retorna erro
3. **Token inválido:** Retorna erro `UNAUTHORIZED`

### Fallback

Se o SGC estiver indisponível:
- Retorna array vazio ou null (conforme o tipo)
- Registra log de erro
- Frontend exibe mensagem de indisponibilidade

## Deep Links para o SGC

Para gerar links que abrem itens no SGC:

```typescript
const sgcPublicUrl = process.env.SGC_PUBLIC_APP_URL;
const clienteLink = `${sgcPublicUrl}/clientes/${clienteId}`;
const contratoLink = `${sgcPublicUrl}/contratos/${contratoId}`;
```

## Testes

Testes de integração estão em `server/sgc-integration.test.ts`:

```bash
pnpm test server/sgc-integration.test.ts
```

**Cobertura:**
- ✅ Variáveis de ambiente configuradas
- ✅ SGC Client inicializa corretamente
- ✅ Contracts Gateway inicializa corretamente
- ✅ Cache management funciona
- ✅ DTOs são mapeados corretamente

## Pontos de Integração no Frontend

O frontend não precisa ser alterado. As procedures mantêm as mesmas assinaturas:

```typescript
// Antes (dados locais)
const { data: contratos } = trpc.contratos.list.useQuery({ empresaId: 1 });

// Depois (dados do SGC)
const { data: contratos } = trpc.contratos.list.useQuery({ empresaId: 1 });
// Mesma assinatura, origem diferente
```

## Migração de Dados

### Fase 1: Leitura (Atual)
- ✅ Todas as leituras vêm do SGC
- ✅ Dados locais são apenas para histórico/compatibilidade

### Fase 2: Escrita (Futura)
- Bloqueadas no backend
- Usuários redirecionados para o SGC

### Fase 3: Limpeza (Futura)
- Remover tabelas locais de contratos após período de transição
- Manter apenas tabelas de análise estratégica

## Troubleshooting

### "SGC integration is disabled"
- Verificar `SGC_ENABLED=true`
- Verificar `SGC_API_BASE_URL` e `SGC_INTERNAL_TOKEN`

### "Request timeout"
- Aumentar `SGC_TIMEOUT_MS`
- Verificar conectividade com SGC
- Verificar logs do SGC

### "Token invalid"
- Verificar `SGC_INTERNAL_TOKEN` está correto
- Sincronizar token com configuração do SGC

## Próximos Passos

1. **Sincronização em tempo real:** Implementar webhooks do SGC para invalidar cache
2. **Sincronização de escrita:** Redirecionar mutations para o SGC
3. **Limpeza de dados:** Remover tabelas locais após período de transição
4. **Auditoria:** Registrar todas as leituras do SGC para compliance

## Referências

- [SGC API Documentation](https://arqueomanage-c7undxdh.manus.space/docs)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
