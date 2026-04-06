/**
 * MÓDULO CONTRATOS (SGC) — Router tRPC
 *
 * Integração controlada: não altera routers existentes do app principal.
 * Montado em routers.ts como `contratos: contratosRouter`.
 */

import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { invokeLLM, type MessageContent } from "../_core/llm";
import {
  getAllContratosClientes,
  getContratosClienteById,
  createContratosCliente,
  updateContratosCliente,
  deleteContratosCliente,
  getAllContratos,
  getContratosByClienteId,
  getContratoById,
  createContrato,
  updateContrato,
  deleteContrato,
  getAditivosByContrato,
  createAditivo,
  updateAditivo,
  getMarcosByContrato,
  createMarco,
  updateMarco,
  getBoletinsByContrato,
  updateBoletim,
  enviarBoletimAprovacao,
  aprovarBoletim,
  getRiscosByContrato,
  createRisco,
  updateRisco,
  getDocumentosByContrato,
  createDocumento,
  getAuditoriaContrato,
  getAuditoriaGeral,
  getDashboardContratos,
  vincularClienteEmpresa,
  desvincularClienteEmpresa,
  getDashboardReceita,
  getResultadoOperacional,
  getPainelRiscos,
  getPainelClausulas,
} from "../contratos.db";

function parseContent(content: string | unknown): unknown {
  const str = typeof content === "string" ? content : JSON.stringify(content);
  return JSON.parse(str);
}

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────

const clienteSchema = z.object({
  cnpj: z.string().min(14),
  razaoSocial: z.string().optional().default(""),
  nomeFantasia: z.string().optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().max(2).optional(),
  cep: z.string().optional(),
  contatoNome: z.string().optional(),
  contatoEmail: z.string().optional(),
  contatoTelefone: z.string().optional(),
  status: z.enum(["ativo", "inativo", "prospecto"]).default("ativo"),
  observacoes: z.string().optional(),
  logoUrl: z.string().optional(),
  empresaId: z.number().optional(),
  // Campos enriquecidos da Receita Federal
  porte: z.string().optional(),
  naturezaJuridica: z.string().optional(),
  cnaePrincipal: z.string().optional(),
  cnaeDescricao: z.string().optional(),
  situacaoCadastral: z.string().optional(),
  dataAbertura: z.string().optional(),
  capitalSocial: z.string().optional(),
  socios: z.string().optional(), // JSON string
  dadosReceita: z.string().optional(), // JSON string completo
});

const contratoSchema = z.object({
  numero: z.string().min(1),
  titulo: z.string().min(2),
  descricao: z.string().optional(),
  tipo: z.enum(["servico", "produto", "misto", "consultoria", "manutencao", "outros"]).default("servico"),
  status: z.enum(["rascunho", "ativo", "suspenso", "encerrado", "rescindido"]).default("rascunho"),
  empresaId: z.number(),
  clienteId: z.number(),
  responsavelUserId: z.number().optional(),
  aprovadorUserId: z.number().optional(),
  projetoId: z.number().optional(),
  areaId: z.number().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  dataAssinatura: z.string().optional(),
  valorTotal: z.string().optional(),
  moeda: z.string().default("BRL"),
  pdfUrl: z.string().optional(),
  pdfKey: z.string().optional(),
  resumoIA: z.string().optional(),
  dadosExtradosIA: z.string().optional(),
  iaRevisado: z.boolean().default(false),
  observacoes: z.string().optional(),
});

const marcoSchema = z.object({
  contratoId: z.number(),
  aditivoId: z.number().optional(),
  titulo: z.string().min(2),
  descricao: z.string().optional(),
  valorPrevisto: z.string(),
  valorPago: z.string().optional(),
  dataPrevista: z.string(),
  dataPagamento: z.string().optional(),
  prazoPagemento: z.number().optional(),
  status: z.enum(["pendente", "em_medicao", "aprovado", "pago", "atrasado", "cancelado"]).default("pendente"),
  ordem: z.number().default(1),
});

const riscoSchema = z.object({
  contratoId: z.number(),
  titulo: z.string().min(2),
  descricao: z.string().optional(),
  categoria: z.enum(["financeiro", "juridico", "operacional", "prazo", "escopo", "reputacional", "regulatorio", "outro"]).default("outro"),
  probabilidade: z.enum(["baixa", "media", "alta"]).default("media"),
  impacto: z.enum(["baixo", "medio", "alto"]).default("medio"),
  severidade: z.enum(["baixa", "media", "alta", "critica"]).default("media"),
  status: z.enum(["identificado", "em_mitigacao", "mitigado", "materializado", "aceito"]).default("identificado"),
  planoMitigacao: z.string().optional(),
  responsavelUserId: z.number().optional(),
  dataIdentificacao: z.string().optional(),
  dataRevisao: z.string().optional(),
  geradoPorIA: z.boolean().default(false),
});

// ─── ROUTER ──────────────────────────────────────────────────────────────────

export const contratosRouter = router({

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  dashboard: protectedProcedure
    .input(z.object({ empresaId: z.number().optional() }))
    .query(async ({ input }) => {
      return await getDashboardContratos(input.empresaId);
    }),

  // ── CLIENTES ───────────────────────────────────────────────────────────────
  clientes: router({
    list: protectedProcedure
      .input(z.object({ empresaId: z.number().optional() }))
      .query(async ({ input }) => {
        return await getAllContratosClientes(input.empresaId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getContratosClienteById(input.id);
      }),

    create: protectedProcedure
      .input(clienteSchema)
      .mutation(async ({ input, ctx }) => {
        const { empresaId, ...clienteData } = input;
        const id = await createContratosCliente(clienteData as any, ctx.user.id);
        // Se empresaId foi fornecido, vincula via tabela de junção N:N
        if (empresaId) {
          await vincularClienteEmpresa(id, empresaId, ctx.user.id);
        }
        return id;
      }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), data: clienteSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        await updateContratosCliente(input.id, input.data as any, ctx.user.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deleteContratosCliente(input.id, ctx.user.id);
      }),

    // Busca CNPJ via BrasilAPI (API pública) com fallback para IA
    buscarCNPJ: protectedProcedure
      .input(z.object({ cnpj: z.string() }))
      .mutation(async ({ input }) => {
        // Limpa o CNPJ para apenas dígitos
        const cnpjLimpo = input.cnpj.replace(/\D/g, "");
        if (cnpjLimpo.length !== 14) throw new Error("CNPJ inválido");

        // 1º Tentativa: BrasilAPI (gratuita, sem chave)
        try {
          const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
            headers: { "Accept": "application/json" },
            signal: AbortSignal.timeout(8000),
          });
          if (resp.ok) {
            const data = await resp.json() as any;
            const socios = (data.qsa ?? []).map((s: any) => ({
              nome: s.nome_socio,
              qualificacao: s.qualificacao_socio,
              cpfCnpj: s.cnpj_cpf_do_socio,
            }));
            return {
              fonte: "brasilapi" as const,
              cnpj: data.cnpj,
              razaoSocial: data.razao_social,
              nomeFantasia: data.nome_fantasia || "",
              email: data.email || "",
              telefone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1}) ${data.telefone_1 ?? ""}`.trim() : "",
              endereco: [
                data.logradouro,
                data.numero,
                data.complemento,
                data.bairro,
              ].filter(Boolean).join(", "),
              cidade: data.municipio || "",
              estado: data.uf || "",
              cep: data.cep ? data.cep.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2") : "",
              porte: data.porte || "",
              naturezaJuridica: data.natureza_juridica || "",
              cnaePrincipal: data.cnae_fiscal ? String(data.cnae_fiscal) : "",
              cnaeDescricao: data.cnae_fiscal_descricao || "",
              situacaoCadastral: data.descricao_situacao_cadastral || "",
              dataAbertura: data.data_inicio_atividade || "",
              capitalSocial: data.capital_social ? `R$ ${Number(data.capital_social).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "",
              socios: JSON.stringify(socios),
              dadosReceita: JSON.stringify(data),
            };
          }
        } catch {
          // Falhou na BrasilAPI, tenta ReceitaWS
        }

        // 2º Tentativa: ReceitaWS (gratuita, sem chave)
        try {
          const resp2 = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpjLimpo}`, {
            headers: { "Accept": "application/json" },
            signal: AbortSignal.timeout(8000),
          });
          if (resp2.ok) {
            const data = await resp2.json() as any;
            if (data.status !== "ERROR") {
              const socios = (data.qsa ?? []).map((s: any) => ({
                nome: s.nome,
                qualificacao: s.qual,
              }));
              return {
                fonte: "receitaws" as const,
                cnpj: data.cnpj,
                razaoSocial: data.nome,
                nomeFantasia: data.fantasia || "",
                email: data.email || "",
                telefone: data.telefone || "",
                endereco: [
                  data.logradouro,
                  data.numero,
                  data.complemento,
                  data.bairro,
                ].filter(Boolean).join(", "),
                cidade: data.municipio || "",
                estado: data.uf || "",
                cep: data.cep || "",
                porte: data.porte || "",
                naturezaJuridica: data.natureza_juridica || "",
                cnaePrincipal: data.atividade_principal?.[0]?.code || "",
                cnaeDescricao: data.atividade_principal?.[0]?.text || "",
                situacaoCadastral: data.situacao || "",
                dataAbertura: data.abertura || "",
                capitalSocial: data.capital_social || "",
                socios: JSON.stringify(socios),
                dadosReceita: JSON.stringify(data),
              };
            }
          }
        } catch {
          // Falhou na ReceitaWS, usa IA como último recurso
        }

        // 3º Fallback: IA (LLM) para formatar dados mínimos
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é um assistente especializado em dados empresariais brasileiros. Retorne apenas JSON válido com os dados que conhece sobre o CNPJ informado.",
            },
            {
              role: "user",
              content: `Formate os dados da empresa com CNPJ ${cnpjLimpo} em JSON com os campos: cnpj, razaoSocial, nomeFantasia, email, telefone, endereco, cidade, estado, cep, porte, naturezaJuridica, cnaePrincipal, cnaeDescricao, situacaoCadastral, dataAbertura, capitalSocial.`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "dados_cnpj",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  cnpj: { type: "string" },
                  razaoSocial: { type: "string" },
                  nomeFantasia: { type: "string" },
                  email: { type: "string" },
                  telefone: { type: "string" },
                  endereco: { type: "string" },
                  cidade: { type: "string" },
                  estado: { type: "string" },
                  cep: { type: "string" },
                  porte: { type: "string" },
                  naturezaJuridica: { type: "string" },
                  cnaePrincipal: { type: "string" },
                  cnaeDescricao: { type: "string" },
                  situacaoCadastral: { type: "string" },
                  dataAbertura: { type: "string" },
                  capitalSocial: { type: "string" },
                },
                required: ["cnpj", "razaoSocial"],
                additionalProperties: false,
              },
            },
          },
        });
        const content = response.choices?.[0]?.message?.content;
        const parsed = content ? parseContent(content) as any : null;
        if (parsed) return { ...parsed, fonte: "ia" as const, socios: "[]", dadosReceita: JSON.stringify(parsed) };
        return null;
      }),

    // Verifica se CNPJ já está cadastrado (evita duplicatas)
    verificarCNPJ: protectedProcedure
      .input(z.object({ cnpj: z.string() }))
      .query(async ({ input }) => {
        const cnpjLimpo = input.cnpj.replace(/\D/g, "");
        const cnpjFormatado = cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
        const clientes = await getAllContratosClientes();
        const existente = clientes.find((c: any) =>
          c.cnpj?.replace(/\D/g, "") === cnpjLimpo
        );
        return { existe: !!existente, cliente: existente ?? null, cnpjFormatado };
      }),

    // Extração de dados do cartão CNPJ via IA (imagem/PDF)
    extrairCartaoCNPJ: protectedProcedure
      .input(z.object({ imageUrl: z.string() }))
      .mutation(async ({ input }) => {
        const userContent: MessageContent[] = [
          { type: "text" as const, text: "Analise este cartão CNPJ e extraia todos os dados da empresa: CNPJ, Razão Social, Nome Fantasia, Endereço completo (logradouro, número, complemento, bairro), Cidade, Estado, CEP, Telefone, Email, Porte, Natureza Jurídica, CNAE principal e descrição. Retorne em JSON." },
          { type: "image_url" as const, image_url: { url: input.imageUrl } },
        ];
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um especialista em extração de dados de documentos empresariais brasileiros. Retorne apenas JSON válido." },
            { role: "user", content: userContent },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "dados_cnpj",
              strict: false,
              schema: {
                type: "object",
                properties: {
                  cnpj: { type: "string" },
                  razaoSocial: { type: "string" },
                  nomeFantasia: { type: "string" },
                  email: { type: "string" },
                  telefone: { type: "string" },
                  endereco: { type: "string" },
                  cidade: { type: "string" },
                  estado: { type: "string" },
                  cep: { type: "string" },
                  porte: { type: "string" },
                  naturezaJuridica: { type: "string" },
                  cnaePrincipal: { type: "string" },
                  cnaeDescricao: { type: "string" },
                  situacaoCadastral: { type: "string" },
                  dataAbertura: { type: "string" },
                  capitalSocial: { type: "string" },
                },
                required: ["cnpj", "razaoSocial"],
                additionalProperties: false,
              },
            },
          },
        });
        const content = response.choices?.[0]?.message?.content;
        const parsed = content ? parseContent(content) as any : null;
        if (parsed) {
          // Remover campos com valor literal "null" ou "undefined" retornados pelo modelo
          const cleaned: Record<string, string> = {};
          for (const [k, v] of Object.entries(parsed)) {
            if (v !== null && v !== undefined && v !== "null" && v !== "undefined" && String(v).trim() !== "") {
              cleaned[k] = String(v);
            }
          }
          return { ...cleaned, fonte: "cartao_ia" as const, socios: "[]", dadosReceita: JSON.stringify(cleaned) };
        }
        return null;
      }),

    // Lista todos os clientes globais (sem filtro de empresa) — para o seletor de vínculo
    listGlobal: protectedProcedure
      .query(async () => {
        return await getAllContratosClientes();
      }),

    // Vincula um cliente existente a uma empresa via tabela de junção N:N
    vincularEmpresa: protectedProcedure
      .input(z.object({ clienteId: z.number(), empresaId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await vincularClienteEmpresa(input.clienteId, input.empresaId, ctx.user.id);
        return { ok: true };
      }),

    // Desvincula um cliente de uma empresa específica via tabela de junção N:N
    desvincularEmpresa: protectedProcedure
      .input(z.object({ clienteId: z.number(), empresaId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await desvincularClienteEmpresa(input.clienteId, input.empresaId, ctx.user.id);
        return { ok: true };
      }),
  }),
  // ── CONTRATOS ──────────────────────────────────────────────────────────────
  contratos: router({
    list: protectedProcedure
      .input(z.object({ empresaId: z.number().optional() }))
      .query(async ({ input }) => {
        return await getAllContratos(input.empresaId);
      }),
    listByCliente: protectedProcedure
      .input(z.object({ clienteId: z.number() }))
      .query(async ({ input }) => {
        return await getContratosByClienteId(input.clienteId);
      }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getContratoById(input.id);
      }),

    create: protectedProcedure
      .input(contratoSchema)
      .mutation(async ({ input, ctx }) => {
        return await createContrato(input as any, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), data: contratoSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        await updateContrato(input.id, input.data as any, ctx.user.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deleteContrato(input.id, ctx.user.id);
      }),

    // Extração de dados do PDF do contrato via IA (obrigatória revisão antes de salvar)
    extrairPDF: protectedProcedure
      .input(z.object({
        pdfUrl: z.string(),
        contratoId: z.number().optional(),
        tipo: z.enum(["contrato", "aditivo"]).default("contrato"),
        tipoAditivo: z.enum(["financeiro", "escopo", "prazo", "misto"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const tipoLabel = input.tipo === "aditivo"
          ? `aditivo (tipo: ${input.tipoAditivo ?? "a identificar"})`
          : "contrato";

        const userContent: MessageContent[] = [
          { type: "text" as const, text: `Analise este ${tipoLabel} e extraia TODOS os dados estruturados do documento:` },
          { type: "file_url" as const, file_url: { url: input.pdfUrl, mime_type: "application/pdf" as const } },
        ];

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um especialista em análise de contratos brasileiros, especialmente contratos de serviços de arqueologia, geoprocessamento e meio ambiente.

Extraia TODAS as informações estruturadas do documento PDF:

1. DADOS GERAIS: número, título/objeto, tipo de contrato, modalidade de licitação (se houver)
2. PARTES ENVOLVIDAS: identifique contratante e contratado com CNPJ, razão social e representantes
3. VALORES: valor total, forma de pagamento, reajuste
4. DATAS: assinatura, início, término, prazo em meses
5. MARCOS FINANCEIROS: todas as parcelas, medições ou etapas de pagamento com valores e datas previstas
6. RISCOS: identifique riscos financeiros, legais, operacionais e de prazo
7. CLÁUSULAS-CHAVE: multas, garantias, rescisão, reajuste, subcontratação
8. RESUMO EXECUTIVO: síntese do contrato em 3-5 frases

Para cada marco financeiro, calcule o percentual em relação ao valor total.
Para cada risco, classifique severidade e probabilidade.
Retorne APENAS JSON válido.`,
            },
            { role: "user", content: userContent },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "extracao_contrato_completa",
              strict: false,
              schema: {
                type: "object",
                properties: {
                  numero: { type: "string", description: "Número do contrato" },
                  titulo: { type: "string", description: "Título ou objeto do contrato" },
                  tipo: { type: "string", description: "Tipo: servico, produto, misto, consultoria" },
                  modalidadeLicitacao: { type: "string", description: "Modalidade de licitação se houver" },
                  valorTotal: { type: "string", description: "Valor total do contrato (apenas número)" },
                  valorAditivo: { type: "string", description: "Valor do aditivo se for aditivo" },
                  dataAssinatura: { type: "string", description: "Data de assinatura (YYYY-MM-DD)" },
                  dataInicio: { type: "string", description: "Data de início (YYYY-MM-DD)" },
                  dataFim: { type: "string", description: "Data de término (YYYY-MM-DD)" },
                  prazoMeses: { type: "number", description: "Prazo em meses" },
                  resumo: { type: "string", description: "Resumo executivo em 3-5 frases" },
                  contratante: {
                    type: "object",
                    properties: {
                      razaoSocial: { type: "string" },
                      cnpj: { type: "string", description: "CNPJ formatado ou apenas números" },
                      representante: { type: "string" },
                    },
                  },
                  contratado: {
                    type: "object",
                    properties: {
                      razaoSocial: { type: "string" },
                      cnpj: { type: "string", description: "CNPJ formatado ou apenas números" },
                      representante: { type: "string" },
                    },
                  },
                  marcos: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        titulo: { type: "string" },
                        valor: { type: "string", description: "Valor numérico" },
                        dataPrevista: { type: "string", description: "Data prevista (YYYY-MM-DD)" },
                        descricao: { type: "string" },
                        percentual: { type: "number", description: "Percentual do valor total" },
                      },
                    },
                  },
                  riscos: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        titulo: { type: "string" },
                        descricao: { type: "string" },
                        categoria: { type: "string", description: "financeiro, juridico, operacional, prazo, escopo" },
                        probabilidade: { type: "string", description: "baixa, media, alta" },
                        impacto: { type: "string", description: "baixo, medio, alto" },
                        acaoMitigacao: { type: "string" },
                      },
                    },
                  },
                  clausulasChave: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        titulo: { type: "string" },
                        descricao: { type: "string" },
                        tipo: { type: "string", description: "multa, garantia, rescisao, reajuste, subcontratacao, outro" },
                      },
                    },
                  },
                },
              },
            },
          },
        });
        const content = response.choices?.[0]?.message?.content;
        return content ? parseContent(content) : null;
      }),

    // Confirmar dados extraídos pela IA e salvar (fluxo obrigatório de revisão)
    confirmarExtracao: protectedProcedure
      .input(z.object({
        contratoId: z.number(),
        dadosRevisados: z.object({
          resumoIA: z.string().optional(),
          dadosExtradosIA: z.string().optional(),
          marcos: z.array(z.object({
            titulo: z.string(),
            valorPrevisto: z.string(),
            dataPrevista: z.string(),
            descricao: z.string().optional(),
            ordem: z.number().optional(),
          })).optional(),
          riscos: z.array(z.object({
            titulo: z.string(),
            descricao: z.string().optional(),
            categoria: z.enum(["financeiro", "juridico", "operacional", "prazo", "escopo", "reputacional", "regulatorio", "outro"]).optional(),
            probabilidade: z.enum(["baixa", "media", "alta"]).optional(),
            impacto: z.enum(["baixo", "medio", "alto"]).optional(),
          })).optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        await updateContrato(input.contratoId, {
          resumoIA: input.dadosRevisados.resumoIA,
          dadosExtradosIA: input.dadosRevisados.dadosExtradosIA,
          iaRevisado: true,
        }, ctx.user.id);

        if (input.dadosRevisados.marcos?.length) {
          for (let i = 0; i < input.dadosRevisados.marcos.length; i++) {
            const m = input.dadosRevisados.marcos[i];
            await createMarco({
              contratoId: input.contratoId,
              titulo: m.titulo,
              valorPrevisto: m.valorPrevisto,
              dataPrevista: m.dataPrevista as unknown as Date,
              descricao: m.descricao,
              ordem: m.ordem ?? i + 1,
              status: "pendente",
            }, ctx.user.id);
          }
        }

        if (input.dadosRevisados.riscos?.length) {
          for (const r of input.dadosRevisados.riscos) {
            await createRisco({
              contratoId: input.contratoId,
              titulo: r.titulo,
              descricao: r.descricao,
              categoria: r.categoria ?? "outro",
              probabilidade: r.probabilidade ?? "media",
              impacto: r.impacto ?? "medio",
              severidade: "media",
              status: "identificado",
              geradoPorIA: true,
            }, ctx.user.id);
          }
        }

        return { ok: true };
      }),
  }),

  // ── ADITIVOS ───────────────────────────────────────────────────────────────
  aditivos: router({
    list: protectedProcedure
      .input(z.object({ contratoId: z.number() }))
      .query(async ({ input }) => {
        return await getAditivosByContrato(input.contratoId);
      }),

    create: protectedProcedure
      .input(z.object({
        contratoId: z.number(),
        numero: z.string(),
        tipo: z.enum(["financeiro", "escopo", "prazo", "misto"]),
        descricao: z.string().optional(),
        valorAditivo: z.string().optional(),
        novaDataFim: z.string().optional(),
        pdfUrl: z.string().optional(),
        pdfKey: z.string().optional(),
        resumoIA: z.string().optional(),
        dadosExtradosIA: z.string().optional(),
        iaRevisado: z.boolean().default(false),
        status: z.enum(["rascunho", "aprovado", "vigente", "cancelado"]).default("rascunho"),
      }))
      .mutation(async ({ input, ctx }) => {
        return await createAditivo(input as any, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          tipo: z.enum(["financeiro", "escopo", "prazo", "misto"]).optional(),
          descricao: z.string().optional(),
          valorAditivo: z.string().optional(),
          novaDataFim: z.string().optional(),
          resumoIA: z.string().optional(),
          dadosExtradosIA: z.string().optional(),
          iaRevisado: z.boolean().optional(),
          status: z.enum(["rascunho", "aprovado", "vigente", "cancelado"]).optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        await updateAditivo(input.id, input.data as any, ctx.user.id);
      }),
  }),

  // ── MARCOS FINANCEIROS ─────────────────────────────────────────────────────
  marcos: router({
    list: protectedProcedure
      .input(z.object({ contratoId: z.number() }))
      .query(async ({ input }) => {
        return await getMarcosByContrato(input.contratoId);
      }),

    create: protectedProcedure
      .input(marcoSchema)
      .mutation(async ({ input, ctx }) => {
        return await createMarco(input as any, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), data: marcoSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        await updateMarco(input.id, input.data as any, ctx.user.id);
      }),
  }),

  // ── BOLETINS DE MEDIÇÃO ────────────────────────────────────────────────────
  boletins: router({
    list: protectedProcedure
      .input(z.object({ contratoId: z.number() }))
      .query(async ({ input }) => {
        return await getBoletinsByContrato(input.contratoId);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          titulo: z.string().optional(),
          descricao: z.string().optional(),
          valorMedicao: z.string().optional(),
          percentualMedicao: z.string().optional(),
          periodo: z.string().optional(),
          status: z.enum(["rascunho", "enviado", "em_aprovacao", "aprovado", "rejeitado", "pago"]).optional(),
          aprovadorNome: z.string().optional(),
          aprovadorEmail: z.string().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        await updateBoletim(input.id, input.data as any, ctx.user.id);
      }),

    enviarAprovacao: protectedProcedure
      .input(z.object({
        id: z.number(),
        aprovadorNome: z.string(),
        aprovadorEmail: z.string().email(),
      }))
      .mutation(async ({ input, ctx }) => {
        const token = await enviarBoletimAprovacao(input.id, input.aprovadorNome, input.aprovadorEmail, ctx.user.id);
        return { token };
      }),

    aprovar: protectedProcedure
      .input(z.object({
        id: z.number(),
        aprovado: z.boolean(),
        observacoes: z.string().default(""),
      }))
      .mutation(async ({ input, ctx }) => {
        await aprovarBoletim(input.id, input.aprovado, input.observacoes, ctx.user.id);
      }),
  }),

  // ── RISCOS ─────────────────────────────────────────────────────────────────
  riscos: router({
    list: protectedProcedure
      .input(z.object({ contratoId: z.number() }))
      .query(async ({ input }) => {
        return await getRiscosByContrato(input.contratoId);
      }),

    create: protectedProcedure
      .input(riscoSchema)
      .mutation(async ({ input, ctx }) => {
        return await createRisco(input as any, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), data: riscoSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        await updateRisco(input.id, input.data as any, ctx.user.id);
      }),

    // Análise de riscos via IA para um contrato
    analisarIA: protectedProcedure
      .input(z.object({ contratoId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const contrato = await getContratoById(input.contratoId);
        if (!contrato) throw new Error("Contrato não encontrado");

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é um especialista em gestão de riscos contratuais. Analise o contrato e identifique riscos relevantes.",
            },
            {
              role: "user",
              content: `Analise o contrato "${contrato.titulo}" (${contrato.tipo}), valor: ${contrato.valorTotal}, período: ${contrato.dataInicio} a ${contrato.dataFim}.
              Resumo: ${contrato.resumoIA ?? "Não disponível"}
              Identifique até 8 riscos contratuais relevantes e retorne em JSON.`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "riscos_contratuais",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  riscos: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        titulo: { type: "string" },
                        descricao: { type: "string" },
                        categoria: { type: "string" },
                        probabilidade: { type: "string", enum: ["baixa", "media", "alta"] },
                        impacto: { type: "string", enum: ["baixo", "medio", "alto"] },
                        severidade: { type: "string", enum: ["baixa", "media", "alta", "critica"] },
                        planoMitigacao: { type: "string" },
                      },
                      required: ["titulo", "descricao", "categoria", "probabilidade", "impacto", "severidade", "planoMitigacao"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["riscos"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices?.[0]?.message?.content;
        if (!content) return { criados: 0 };
        const parsed = parseContent(content) as { riscos: any[] };
        const riscos = parsed.riscos ?? [];

        let criados = 0;
        for (const r of riscos) {
          await createRisco({
            contratoId: input.contratoId,
            titulo: r.titulo,
            descricao: r.descricao,
            categoria: r.categoria ?? "outro",
            probabilidade: r.probabilidade ?? "media",
            impacto: r.impacto ?? "medio",
            severidade: r.severidade ?? "media",
            status: "identificado",
            planoMitigacao: r.planoMitigacao,
            geradoPorIA: true,
          }, ctx.user.id);
          criados++;
        }
        return { criados };
      }),
  }),

  // ── DOCUMENTOS ─────────────────────────────────────────────────────────────
  documentos: router({
    list: protectedProcedure
      .input(z.object({ contratoId: z.number() }))
      .query(async ({ input }) => {
        return await getDocumentosByContrato(input.contratoId);
      }),

    create: protectedProcedure
      .input(z.object({
        contratoId: z.number(),
        aditivoId: z.number().optional(),
        nome: z.string(),
        tipo: z.enum(["contrato_principal", "aditivo", "boletim", "nota_fiscal", "comprovante_pagamento", "proposta", "ata", "laudo", "certificado", "outro"]).default("outro"),
        url: z.string(),
        fileKey: z.string(),
        mimeType: z.string().optional(),
        tamanhoBytes: z.number().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await createDocumento(input as any, ctx.user.id);
      }),

    // Classificação automática de documentos via IA
    classificarIA: protectedProcedure
      .input(z.object({
        contratoId: z.number(),
        documentoUrl: z.string(),
        nomeArquivo: z.string(),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é um especialista em classificação de documentos contratuais. Identifique o tipo e nome do documento.",
            },
            {
              role: "user",
              content: `Classifique o documento "${input.nomeArquivo}". Tipos possíveis: contrato_principal, aditivo, boletim, nota_fiscal, comprovante_pagamento, proposta, ata, laudo, certificado, outro. Retorne JSON.`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "classificacao_documento",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  tipo: { type: "string" },
                  nomeFormatado: { type: "string" },
                  confianca: { type: "number" },
                },
                required: ["tipo", "nomeFormatado", "confianca"],
                additionalProperties: false,
              },
            },
          },
        });
        const content = response.choices?.[0]?.message?.content;
        return content ? parseContent(content) : null;
      }),
  }),

  // ── APROVAÇÃO PÚBLICA (sem autenticação) ──────────────────────────────
  aprovacaoPublica: router({
    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const { getDb } = await import("../db");
        const { contratosBoletins } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) return null;
        const [boletim] = await db.select().from(contratosBoletins)
          .where(eq(contratosBoletins.aprovadorToken, input.token));
        return boletim ?? null;
      }),
    aprovarPorToken: publicProcedure
      .input(z.object({
        token: z.string(),
        aprovado: z.boolean(),
        observacoes: z.string().default(""),
      }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("../db");
        const { contratosBoletins } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [boletim] = await db.select().from(contratosBoletins)
          .where(eq(contratosBoletins.aprovadorToken, input.token));
        if (!boletim) throw new Error("Token inválido ou boletim não encontrado");
        const novoStatus = input.aprovado ? "aprovado" : "rejeitado";
        await db.update(contratosBoletins).set({
          status: novoStatus as any,
          observacoesAprovador: input.observacoes,
          dataAprovacao: new Date(),
        }).where(eq(contratosBoletins.id, boletim.id));
        return { success: true, status: novoStatus };
      }),
  }),

  // ── RECEITA & RESULTADO ────────────────────────────────────────────────────
  dashboardReceita: protectedProcedure
    .input(z.object({ empresaId: z.number().optional(), ano: z.number().optional() }))
    .query(async ({ input }) => {
      return await getDashboardReceita(input.empresaId, input.ano);
    }),

  resultadoOperacional: protectedProcedure
    .input(z.object({ empresaId: z.number(), ano: z.number().optional() }))
    .query(async ({ input }) => {
      return await getResultadoOperacional(input.empresaId, input.ano);
    }),

  // ── AUDITORIA ──────────────────────────────────────────────────────────────
  auditoria: router({
    porContrato: protectedProcedure
      .input(z.object({ contratoId: z.number() }))
      .query(async ({ input }) => {
        return await getAuditoriaContrato(input.contratoId);
      }),

    geral: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await getAuditoriaGeral(input.limit);
      }),
  }),

  // ── PAINEL DE RISCOS E CLÁUSULAS ──────────────────────────────────────────
  painelRiscos: protectedProcedure
    .input(z.object({ empresaId: z.number().optional() }))
    .query(async ({ input }) => {
      return await getPainelRiscos(input.empresaId);
    }),

  painelClausulas: protectedProcedure
    .input(z.object({ empresaId: z.number().optional() }))
    .query(async ({ input }) => {
      return await getPainelClausulas(input.empresaId);
    }),
});
