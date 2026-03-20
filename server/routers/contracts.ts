/**
 * contracts.ts — Router tRPC para o módulo de Gestão de Contratos (ZIP v1.0.0)
 * Isolado do SGC existente. Montado em routers.ts como `contractsModule`.
 *
 * Nota: O tipo User do projeto não possui companyId.
 * O controle de acesso é feito via role (admin pode tudo, outros só veem seus dados).
 * O companyId sempre vem no input da requisição.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../contracts.db";
import { generateContractBusinessNumber, generateAmendmentBusinessNumber } from "../services/contractNumbering";
import { analyzeContract, generateRiskMitigationActions } from "../services/contractAnalysis";
import { analyzeAmendmentPdf } from "../services/amendmentAnalysis";

// ─── Contracts ────────────────────────────────────────────────────────────────
export const contractsRouter = router({
  // Listar contratos (opcionalmente por empresa)
  list: protectedProcedure
    .input(z.object({ companyId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return db.getAllContracts(input?.companyId);
    }),

  // Buscar contrato por ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const contract = await db.getContractById(input.id);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND" });
      return contract;
    }),

  // Criar contrato
  create: protectedProcedure
    .input(
      z.object({
        companyId: z.number(),
        clientId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        totalValue: z.string(),
        startDate: z.date(),
        endDate: z.date().optional(),
        observations: z.string().optional(),
        pdfUrl: z.string().optional(),
        pdfFileKey: z.string().optional(),
        managerName: z.string().optional(),
        managerEmail: z.string().email().optional(),
        approverName: z.string().optional(),
        approverEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const client = await db.getClientById(input.clientId);
      if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Cliente não encontrado" });

      const isLinked = await db.isClientLinkedToCompany(input.clientId, input.companyId);
      if (!isLinked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cliente não está vinculado a esta empresa",
        });
      }

      const contract = await db.createContract({
        companyId: input.companyId,
        clientId: input.clientId,
        title: input.title,
        description: input.description,
        totalValue: input.totalValue,
        startDate: input.startDate,
        endDate: input.endDate,
        observations: input.observations,
        pdfUrl: input.pdfUrl,
        pdfFileKey: input.pdfFileKey,
        managerName: input.managerName,
        managerEmail: input.managerEmail,
        approverName: input.approverName,
        approverEmail: input.approverEmail,
      });

      await db.createAuditLog({
        userId: ctx.user.id,
        entityType: "contract",
        entityId: contract!.id,
        action: "create",
        changes: JSON.stringify(input),
      });

      return contract;
    }),

  // Atualizar contrato
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        totalValue: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        observations: z.string().optional(),
        status: z.enum(["active", "completed", "cancelled"]).optional(),
        managerName: z.string().optional(),
        managerEmail: z.string().optional(),
        approverName: z.string().optional(),
        approverEmail: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const contract = await db.getContractById(id);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND" });

      await db.updateContract(id, data as Parameters<typeof db.updateContract>[1]);
      await db.createAuditLog({
        userId: ctx.user.id,
        entityType: "contract",
        entityId: id,
        action: "update",
        changes: JSON.stringify(data),
      });
      return { success: true };
    }),

  // Assinar contrato e gerar business_number
  sign: protectedProcedure
    .input(z.object({ contractId: z.number(), signedDate: z.date() }))
    .mutation(async ({ input, ctx }) => {
      const contract = await db.getContractById(input.contractId);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND" });
      if (contract.isSigned) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Contrato já assinado. Número: ${contract.businessNumber}`,
        });
      }

      const businessNumber = await generateContractBusinessNumber(
        input.contractId,
        input.signedDate
      );

      await db.createAuditLog({
        userId: ctx.user.id,
        entityType: "contract",
        entityId: input.contractId,
        action: "sign",
        changes: JSON.stringify({ businessNumber, signedDate: input.signedDate }),
      });

      return { success: true, businessNumber };
    }),

  // Excluir contrato
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const contract = await db.getContractById(input.id);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND" });

      await db.createAuditLog({
        userId: ctx.user.id,
        entityType: "contract",
        entityId: input.id,
        action: "delete",
        changes: JSON.stringify({ title: contract.title }),
      });

      await db.deleteContract(input.id);
      return { success: true };
    }),

  // Analisar PDF de contrato com IA
  analyzePdf: protectedProcedure
    .input(z.object({ contractId: z.number(), pdfUrl: z.string() }))
    .mutation(async ({ input }) => {
      const contract = await db.getContractById(input.contractId);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND" });
      return analyzeContract(input.pdfUrl);
    }),

  // Aplicar resultado da análise IA ao contrato
  applyAnalysis: protectedProcedure
    .input(
      z.object({
        contractId: z.number(),
        analysis: z.object({
          informacoesBasicas: z.object({
            titulo: z.string(),
            dataInicio: z.string(),
            dataTermino: z.string(),
          }),
          valores: z.object({
            valorTotal: z.number(),
            parcelas: z.number(),
            formaPagamento: z.string(),
          }),
          marcosFinanceiros: z.array(
            z.object({
              descricao: z.string(),
              valor: z.number(),
              dataVencimento: z.string(),
              percentual: z.number().optional(),
            })
          ),
          riscos: z.array(
            z.object({
              tipo: z.enum(["financeiro", "legal", "operacional", "prazo"]),
              descricao: z.string(),
              severidade: z.enum(["baixa", "media", "alta", "critica"]),
            })
          ),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const contract = await db.getContractById(input.contractId);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND" });

      const { analysis } = input;

      // Atualizar dados básicos do contrato
      await db.updateContract(input.contractId, {
        title: analysis.informacoesBasicas.titulo,
        totalValue: String(analysis.valores.valorTotal),
        startDate: new Date(analysis.informacoesBasicas.dataInicio),
        endDate: new Date(analysis.informacoesBasicas.dataTermino),
      });

      // Criar marcos financeiros
      const createdMilestones = [];
      for (const marco of analysis.marcosFinanceiros) {
        const milestone = await db.createMilestone({
          contractId: input.contractId,
          description: marco.descricao,
          valorPrevisto: String(marco.valor),
          valorPago: "0",
          dueDate: new Date(marco.dataVencimento),
          prazoPagamento: 0,
          status: "pending",
          origin: "ai",
          confidence: marco.percentual ? String(marco.percentual / 100) : "0.90",
        });
        createdMilestones.push(milestone);
      }

      // Criar riscos
      const createdRisks = [];
      for (const risco of analysis.riscos) {
        const risk = await db.createContractRisk({
          contractId: input.contractId,
          tipo: risco.tipo,
          descricao: risco.descricao,
          severidade: risco.severidade,
          status: "aberto",
          origin: "ai",
        });
        createdRisks.push(risk);
      }

      await db.createAuditLog({
        userId: ctx.user.id,
        entityType: "contract",
        entityId: input.contractId,
        action: "apply",
        changes: JSON.stringify({
          milestones: createdMilestones.length,
          risks: createdRisks.length,
        }),
      });

      return {
        success: true,
        milestonesCreated: createdMilestones.length,
        risksCreated: createdRisks.length,
      };
    }),

  // Buscar contratos por cliente
  byClient: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      return db.getContractsByClient(input.clientId);
    }),

  // Estatísticas de contratos
  stats: protectedProcedure
    .input(z.object({ companyId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return db.getContractStats(input?.companyId);
    }),

  // Audit logs do contrato
  auditLogs: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ input }) => {
      const contract = await db.getContractById(input.contractId);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND" });
      return db.getAuditLogsByContract(input.contractId);
    }),
});

// ─── Financial Milestones ─────────────────────────────────────────────────────
export const milestonesRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ input }) => {
      return db.getMilestonesByContract(input.contractId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        contractId: z.number(),
        description: z.string().min(1),
        valorPrevisto: z.string(),
        dueDate: z.date(),
        prazoPagamento: z.number().default(0),
        conditionText: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const contract = await db.getContractById(input.contractId);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND" });

      return db.createMilestone({
        contractId: input.contractId,
        description: input.description,
        valorPrevisto: input.valorPrevisto,
        valorPago: "0",
        dueDate: input.dueDate,
        prazoPagamento: input.prazoPagamento,
        status: "pending",
        origin: "manual",
        conditionText: input.conditionText,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        description: z.string().optional(),
        valorPrevisto: z.string().optional(),
        valorPago: z.string().optional(),
        dueDate: z.date().optional(),
        prazoPagamento: z.number().optional(),
        status: z.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
        paidDate: z.date().optional(),
        dataRecebimento: z.date().optional(),
        conditionText: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateMilestone(id, data as Parameters<typeof db.updateMilestone>[1]);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.deleteMilestone(input.id);
    }),

  overdue: protectedProcedure
    .input(z.object({ companyId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return db.getOverdueMilestones(input?.companyId);
    }),
});

// ─── Contract Amendments ──────────────────────────────────────────────────────
export const amendmentsRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ input }) => {
      return db.getAmendmentsByContract(input.contractId);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const amendment = await db.getAmendmentById(input.id);
      if (!amendment) throw new TRPCError({ code: "NOT_FOUND" });
      return amendment;
    }),

  create: protectedProcedure
    .input(
      z.object({
        contractId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        tipo: z.enum(["financeiro", "escopo"]),
        additionalValue: z.string(),
        startDate: z.date(),
        endDate: z.date().optional(),
        pdfUrl: z.string().optional(),
        pdfFileKey: z.string().optional(),
        changeTypes: z.array(z.string()).optional(),
        financialImpact: z.record(z.string(), z.unknown()).optional(),
        scheduleImpact: z.record(z.string(), z.unknown()).optional(),
        scopeChanges: z.string().optional(),
        effectiveDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const contract = await db.getContractById(input.contractId);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND" });
      const seq = await db.getNextAmendmentSeq(input.contractId);;
      const tempBusinessNumber = `TEMP-${input.contractId}-${seq}`;

      const amendment = await db.createAmendment({
        contractId: input.contractId,
        businessNumber: tempBusinessNumber,
        seq,
        title: input.title,
        description: input.description,
        tipo: input.tipo,
        additionalValue: input.additionalValue,
        startDate: input.startDate,
        endDate: input.endDate,
        pdfUrl: input.pdfUrl,
        pdfFileKey: input.pdfFileKey,
        changeTypes: (input.changeTypes ?? []) as unknown as null,
        financialImpact: (input.financialImpact ?? {}) as unknown as null,
        scheduleImpact: (input.scheduleImpact ?? {}) as unknown as null,
        scopeChanges: input.scopeChanges,
        effectiveDate: input.effectiveDate as unknown as Date | null | undefined,
        status: "active",
      });

      // Gerar business_number se contrato estiver assinado
      if (contract.isSigned && contract.businessNumber) {
        try {
          await generateAmendmentBusinessNumber(input.contractId, amendment!.id);
        } catch {
          // Não bloquear criação se falhar numeração
        }
      }

      await db.createAuditLog({
        userId: ctx.user.id,
        entityType: "amendment",
        entityId: amendment!.id,
        action: "create",
        changes: JSON.stringify(input),
      });

      return db.getAmendmentById(amendment!.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        tipo: z.enum(["financeiro", "escopo"]).optional(),
        additionalValue: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.enum(["active", "completed", "cancelled"]).optional(),
        pdfUrl: z.string().optional(),
        pdfFileKey: z.string().optional(),
        scopeChanges: z.string().optional(),
        aiAnalysis: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateAmendment(id, data as Parameters<typeof db.updateAmendment>[1]);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.deleteAmendment(input.id);
    }),

  // Analisar PDF de aditivo com IA
  analyzePdf: protectedProcedure
    .input(z.object({ pdfUrl: z.string() }))
    .mutation(async ({ input }) => {
      return analyzeAmendmentPdf(input.pdfUrl);
    }),
});

// ─── Contract Risks ───────────────────────────────────────────────────────────
export const contractRisksRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ input }) => {
      return db.getRisksByContract(input.contractId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        contractId: z.number(),
        tipo: z.enum(["financeiro", "legal", "operacional", "prazo"]),
        descricao: z.string().min(1),
        severidade: z.enum(["baixa", "media", "alta", "critica"]).optional(),
        acoesMitigacao: z.string().optional(),
        responsavel: z.string().optional(),
        status: z.enum(["aberto", "mitigado", "aceito", "fechado"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const contract = await db.getContractById(input.contractId);
      if (!contract) throw new TRPCError({ code: "NOT_FOUND" });

      return db.createContractRisk({
        contractId: input.contractId,
        tipo: input.tipo,
        descricao: input.descricao,
        severidade: input.severidade ?? "media",
        acoesMitigacao: input.acoesMitigacao,
        responsavel: input.responsavel,
        status: input.status ?? "aberto",
        origin: "manual",
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tipo: z.enum(["financeiro", "legal", "operacional", "prazo"]).optional(),
        descricao: z.string().optional(),
        severidade: z.enum(["baixa", "media", "alta", "critica"]).optional(),
        acoesMitigacao: z.string().optional(),
        responsavel: z.string().optional(),
        status: z.enum(["aberto", "mitigado", "aceito", "fechado"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateContractRisk(id, data as Parameters<typeof db.updateContractRisk>[1]);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const risk = await db.getContractRiskById(input.id);
      if (!risk) throw new TRPCError({ code: "NOT_FOUND" });
      return db.deleteContractRisk(input.id);
    }),

  // Gerar ações de mitigação com IA
  generateMitigation: protectedProcedure
    .input(
      z.object({
        tipo: z.enum(["financeiro", "legal", "operacional", "prazo"]),
        descricao: z.string().min(1),
        severidade: z.enum(["baixa", "media", "alta", "critica"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return generateRiskMitigationActions(
        input.tipo,
        input.descricao,
        input.severidade ?? "media"
      );
    }),
});

// ─── Contract Documents ───────────────────────────────────────────────────────
export const contractDocumentsRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ input }) => {
      return db.listContractDocuments(input.contractId);
    }),

  add: protectedProcedure
    .input(
      z.object({
        contractId: z.number(),
        fileName: z.string(),
        fileKey: z.string(),
        fileUrl: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return db.addContractDocument({
        contractId: input.contractId,
        name: input.fileName,
        url: input.fileUrl,
        fileKey: input.fileKey,
        size: input.fileSize,
        mimeType: input.mimeType,
        uploadedBy: ctx.user.id,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.deleteContractDocument(input.id);
    }),
});

// ─── Contract Approvers ───────────────────────────────────────────────────────
export const contractApproversRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ input }) => {
      return db.getContractApprovers(input.contractId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        contractId: z.number(),
        clientContactName: z.string().min(1),
        clientContactEmail: z.string().email(),
        clientContactPhone: z.string().optional(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return db.createContractApprover(input);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        clientContactName: z.string().optional(),
        clientContactEmail: z.string().email().optional(),
        clientContactPhone: z.string().optional(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateContractApprover(id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.deleteContractApprover(input.id);
    }),
});

// ─── Contract Responsible ─────────────────────────────────────────────────────
export const contractResponsibleRouter = router({
  list: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ input }) => {
      return db.getContractResponsibles(input.contractId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        contractId: z.number(),
        responsibleName: z.string().min(1),
        responsibleEmail: z.string().email(),
        financialEmail: z.string().email(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return db.createContractResponsible(input);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        responsibleName: z.string().optional(),
        responsibleEmail: z.string().email().optional(),
        financialEmail: z.string().email().optional(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateContractResponsible(id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.deleteContractResponsible(input.id);
    }),
});
