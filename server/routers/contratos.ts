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
} from "../contratos.db";

function parseContent(content: string | unknown): unknown {
  const str = typeof content === "string" ? content : JSON.stringify(content);
  return JSON.parse(str);
}

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────

const clienteSchema = z.object({
  cnpj: z.string().min(14),
  razaoSocial: z.string().min(2),
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
});

const contratoSchema = z.object({
  numero: z.string().min(1),
  titulo: z.string().min(2),
  descricao: z.string().optional(),
  tipo: z.enum(["servicos", "fornecimento", "consultoria", "manutencao", "parceria", "outro"]).default("servicos"),
  status: z.enum(["rascunho", "em_analise", "aprovado", "vigente", "suspenso", "encerrado", "cancelado"]).default("rascunho"),
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
        return await createContratosCliente(input as any, ctx.user.id);
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

    // Extração de dados do cartão CNPJ via IA
    extrairCnpj: protectedProcedure
      .input(z.object({ cnpj: z.string(), imageUrl: z.string().optional() }))
      .mutation(async ({ input }) => {
        const prompt = input.imageUrl
          ? `Analise este cartão CNPJ e extraia os dados da empresa: CNPJ, Razão Social, Nome Fantasia, Endereço, Cidade, Estado, CEP, Telefone, Email. Retorne em JSON.`
          : `Para o CNPJ ${input.cnpj}, formate os dados básicos de uma empresa brasileira em JSON com os campos: cnpj, razaoSocial, nomeFantasia, endereco, cidade, estado, cep.`;

        const userContent: MessageContent | MessageContent[] = input.imageUrl
          ? ([
              { type: "text" as const, text: prompt },
              { type: "image_url" as const, image_url: { url: input.imageUrl } },
            ] as MessageContent[])
          : prompt;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é um assistente especializado em extração de dados de documentos empresariais brasileiros. Retorne apenas JSON válido.",
            },
            { role: "user", content: userContent },
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
                },
                required: ["cnpj", "razaoSocial"],
                additionalProperties: false,
              },
            },
          },
        });
        const content = response.choices?.[0]?.message?.content;
        return content ? parseContent(content) : null;
      }),
  }),

  // ── CONTRATOS ──────────────────────────────────────────────────────────────
  contratos: router({
    list: protectedProcedure
      .input(z.object({ empresaId: z.number().optional() }))
      .query(async ({ input }) => {
        return await getAllContratos(input.empresaId);
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
          { type: "text" as const, text: `Analise este ${tipoLabel} e extraia os dados estruturados:` },
          { type: "file_url" as const, file_url: { url: input.pdfUrl, mime_type: "application/pdf" as const } },
        ];

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um especialista em análise de contratos brasileiros. Extraia as informações estruturadas do documento.
              Para contratos: extraia número, título, partes, valor total, data de início, data de fim, marcos financeiros e riscos.
              Para aditivos: identifique se é financeiro (altera valor) ou de escopo (altera entregáveis/prazo).
              Retorne JSON estruturado.`,
            },
            { role: "user", content: userContent },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "extracao_contrato",
              strict: false,
              schema: {
                type: "object",
                properties: {
                  numero: { type: "string" },
                  titulo: { type: "string" },
                  tipo: { type: "string" },
                  valorTotal: { type: "string" },
                  valorAditivo: { type: "string" },
                  dataInicio: { type: "string" },
                  dataFim: { type: "string" },
                  resumo: { type: "string" },
                  marcos: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        titulo: { type: "string" },
                        valor: { type: "string" },
                        dataPrevista: { type: "string" },
                        descricao: { type: "string" },
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
                        categoria: { type: "string" },
                        probabilidade: { type: "string" },
                        impacto: { type: "string" },
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
});
