import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { riscosEmpresa, planosAcaoRisco } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function calcSeveridade(prob: string, impacto: string): "baixa" | "media" | "alta" | "critica" {
  const p = { baixa: 1, media: 2, alta: 3 }[prob] ?? 2;
  const i = { baixo: 1, medio: 2, alto: 3 }[impacto] ?? 2;
  const score = p * i;
  if (score <= 2) return "baixa";
  if (score <= 4) return "media";
  if (score <= 6) return "alta";
  return "critica";
}

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────

const AcaoSchema = z.object({
  acao: z.string(),
  responsavel: z.string().optional().default(""),
  prazo: z.string().optional().default(""),
  status: z.enum(["pendente", "em_andamento", "concluido"]).default("pendente"),
});

// ─── ROUTER ──────────────────────────────────────────────────────────────────

export const gestaoRiscosRouter = router({

  // ── Listar riscos da empresa ──────────────────────────────────────────────
  list: protectedProcedure
    .input(z.object({
      empresaId: z.number(),
      origem: z.enum(["orcamentario","estrategico","operacional","contratual","financeiro","regulatorio","outro"]).optional(),
      status: z.enum(["identificado","em_mitigacao","mitigado","materializado","aceito","monitorando"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const riscos = await db.select().from(riscosEmpresa)
        .where(eq(riscosEmpresa.empresaId, input.empresaId))
        .orderBy(desc(riscosEmpresa.createdAt));
      return riscos.filter(r => {
        if (input.origem && r.origem !== input.origem) return false;
        if (input.status && r.status !== input.status) return false;
        return true;
      });
    }),

  // ── Resumo / dashboard de riscos ─────────────────────────────────────────
  resumo: protectedProcedure
    .input(z.object({ empresaId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { total: 0, porSeveridade: { critica: 0, alta: 0, media: 0, baixa: 0 }, porStatus: { identificado: 0, em_mitigacao: 0, mitigado: 0, materializado: 0, aceito: 0, monitorando: 0 }, porOrigem: { orcamentario: 0, estrategico: 0, operacional: 0, contratual: 0, financeiro: 0, regulatorio: 0, outro: 0 }, matrizCalor: {}, riscos: [] };
      const riscos = await db.select().from(riscosEmpresa)
        .where(eq(riscosEmpresa.empresaId, input.empresaId));

      const total = riscos.length;
      const porSeveridade = {
        critica: riscos.filter(r => r.severidade === "critica").length,
        alta: riscos.filter(r => r.severidade === "alta").length,
        media: riscos.filter(r => r.severidade === "media").length,
        baixa: riscos.filter(r => r.severidade === "baixa").length,
      };
      const porStatus = {
        identificado: riscos.filter(r => r.status === "identificado").length,
        em_mitigacao: riscos.filter(r => r.status === "em_mitigacao").length,
        mitigado: riscos.filter(r => r.status === "mitigado").length,
        materializado: riscos.filter(r => r.status === "materializado").length,
        aceito: riscos.filter(r => r.status === "aceito").length,
        monitorando: riscos.filter(r => r.status === "monitorando").length,
      };
      const porOrigem = {
        orcamentario: riscos.filter(r => r.origem === "orcamentario").length,
        estrategico: riscos.filter(r => r.origem === "estrategico").length,
        operacional: riscos.filter(r => r.origem === "operacional").length,
        contratual: riscos.filter(r => r.origem === "contratual").length,
        financeiro: riscos.filter(r => r.origem === "financeiro").length,
        regulatorio: riscos.filter(r => r.origem === "regulatorio").length,
        outro: riscos.filter(r => r.origem === "outro").length,
      };
      const matrizCalor: Record<string, number> = {};
      for (const r of riscos) {
        const key = `${r.probabilidade}_${r.impacto}`;
        matrizCalor[key] = (matrizCalor[key] || 0) + 1;
      }
      return { total, porSeveridade, porStatus, porOrigem, matrizCalor, riscos };
    }),

  // ── Criar risco ───────────────────────────────────────────────────────────
  create: protectedProcedure
    .input(z.object({
      empresaId: z.number(),
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      origem: z.enum(["orcamentario","estrategico","operacional","contratual","financeiro","regulatorio","outro"]).default("estrategico"),
      categoria: z.enum(["financeiro","juridico","operacional","prazo","escopo","reputacional","regulatorio","rh","tecnologia","outro"]).default("outro"),
      probabilidade: z.enum(["baixa","media","alta"]).default("media"),
      impacto: z.enum(["baixo","medio","alto"]).default("medio"),
      responsavel: z.string().optional(),
      dataIdentificacao: z.string().optional(),
      dataRevisao: z.string().optional(),
      contratoId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const severidade = calcSeveridade(input.probabilidade, input.impacto);
      const [result] = await db.insert(riscosEmpresa).values({
        empresaId: input.empresaId,
        titulo: input.titulo,
        descricao: input.descricao ?? null,
        origem: input.origem,
        categoria: input.categoria,
        probabilidade: input.probabilidade,
        impacto: input.impacto,
        severidade,
        status: "identificado",
        responsavel: input.responsavel ?? null,
        dataIdentificacao: input.dataIdentificacao ? new Date(input.dataIdentificacao) : null,
        dataRevisao: input.dataRevisao ? new Date(input.dataRevisao) : null,
        contratoId: input.contratoId ?? null,
        createdByUserId: ctx.user.id,
      });
      return { success: true, id: (result as any).insertId };
    }),

  // ── Atualizar risco ───────────────────────────────────────────────────────
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      titulo: z.string().min(1).optional(),
      descricao: z.string().optional(),
      origem: z.enum(["orcamentario","estrategico","operacional","contratual","financeiro","regulatorio","outro"]).optional(),
      categoria: z.enum(["financeiro","juridico","operacional","prazo","escopo","reputacional","regulatorio","rh","tecnologia","outro"]).optional(),
      probabilidade: z.enum(["baixa","media","alta"]).optional(),
      impacto: z.enum(["baixo","medio","alto"]).optional(),
      status: z.enum(["identificado","em_mitigacao","mitigado","materializado","aceito","monitorando"]).optional(),
      responsavel: z.string().optional(),
      dataRevisao: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      const updateData: Record<string, any> = { ...data };
      if (data.probabilidade || data.impacto) {
        // Fetch current to compute severidade
        const [cur] = await db.select().from(riscosEmpresa).where(eq(riscosEmpresa.id, id));
        if (cur) {
          const prob = data.probabilidade ?? cur.probabilidade;
          const imp = data.impacto ?? cur.impacto;
          updateData.severidade = calcSeveridade(prob, imp);
        }
      }
      if (data.dataRevisao) {
        updateData.dataRevisao = new Date(data.dataRevisao);
      }
      await db.update(riscosEmpresa).set(updateData).where(eq(riscosEmpresa.id, id));
      return { success: true };
    }),

  // ── Excluir risco ─────────────────────────────────────────────────────────
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(planosAcaoRisco).where(eq(planosAcaoRisco.riscoId, input.id));
      await db.delete(riscosEmpresa).where(eq(riscosEmpresa.id, input.id));
      return { success: true };
    }),

  // ── Listar planos de ação de um risco ─────────────────────────────────────
  listPlanos: protectedProcedure
    .input(z.object({ riscoId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(planosAcaoRisco)
        .where(eq(planosAcaoRisco.riscoId, input.riscoId))
        .orderBy(desc(planosAcaoRisco.createdAt));
    }),

  // ── Criar plano de ação ───────────────────────────────────────────────────
  createPlano: protectedProcedure
    .input(z.object({
      riscoId: z.number(),
      empresaId: z.number(),
      titulo: z.string().min(1),
      objetivo: z.string().optional(),
      descricao: z.string().optional(),
      tipoPrioridade: z.enum(["corte_custos","mitigacao","prevencao","contingencia","monitoramento"]).default("mitigacao"),
      economiaEstimada: z.string().optional(),
      prazoImplementacao: z.string().optional(),
      impactoOperacional: z.enum(["nenhum","baixo","medio","alto"]).default("nenhum"),
      benchmarking: z.string().optional(),
      acoes: z.array(AcaoSchema).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(planosAcaoRisco).values({
        riscoId: input.riscoId,
        empresaId: input.empresaId,
        titulo: input.titulo,
        objetivo: input.objetivo ?? null,
        descricao: input.descricao ?? null,
        tipoPrioridade: input.tipoPrioridade,
        economiaEstimada: input.economiaEstimada ?? null,
        prazoImplementacao: input.prazoImplementacao ?? null,
        impactoOperacional: input.impactoOperacional,
        benchmarking: input.benchmarking ?? null,
        acoes: input.acoes ? input.acoes : null,
        status: "ativo",
        createdByUserId: ctx.user.id,
      });
      return { success: true, id: (result as any).insertId };
    }),

  // ── Atualizar plano de ação ───────────────────────────────────────────────
  updatePlano: protectedProcedure
    .input(z.object({
      id: z.number(),
      titulo: z.string().optional(),
      objetivo: z.string().optional(),
      descricao: z.string().optional(),
      tipoPrioridade: z.enum(["corte_custos","mitigacao","prevencao","contingencia","monitoramento"]).optional(),
      economiaEstimada: z.string().optional(),
      prazoImplementacao: z.string().optional(),
      impactoOperacional: z.enum(["nenhum","baixo","medio","alto"]).optional(),
      benchmarking: z.string().optional(),
      acoes: z.array(AcaoSchema).optional(),
      status: z.enum(["rascunho","ativo","concluido","cancelado"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...rest } = input;
      const updateData: Record<string, any> = { ...rest };
      await db.update(planosAcaoRisco).set(updateData).where(eq(planosAcaoRisco.id, id));
      return { success: true };
    }),

  // ── Excluir plano de ação ─────────────────────────────────────────────────
  deletePlano: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(planosAcaoRisco).where(eq(planosAcaoRisco.id, input.id));
      return { success: true };
    }),

  // ── Gerar plano de ação com IA ────────────────────────────────────────────
  gerarPlanoIA: protectedProcedure
    .input(z.object({
      riscoId: z.number(),
      empresaId: z.number(),
      tituloRisco: z.string(),
      descricaoRisco: z.string().optional(),
      origem: z.enum(["orcamentario","estrategico","operacional","contratual","financeiro","regulatorio","outro"]),
      categoria: z.enum(["financeiro","juridico","operacional","prazo","escopo","reputacional","regulatorio","rh","tecnologia","outro"]),
      probabilidade: z.enum(["baixa","media","alta"]),
      impacto: z.enum(["baixo","medio","alto"]),
      severidade: z.enum(["baixa","media","alta","critica"]),
      nomeEmpresa: z.string().optional(),
      tipoEmpresa: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const prompt = `Você é especialista em gestão de riscos para PMEs do setor de arqueologia e licenciamento ambiental no Brasil.

Analise o risco abaixo e crie um Plano de Ação objetivo e prático:

Empresa: ${input.nomeEmpresa || "Empresa do Grupo Arqueo"}
Setor: ${input.tipoEmpresa || "Arqueologia Preventiva / Licenciamento Ambiental"}
Risco: ${input.tituloRisco}
Descrição: ${input.descricaoRisco || "Não informada"}
Origem: ${input.origem} | Categoria: ${input.categoria}
Probabilidade: ${input.probabilidade} | Impacto: ${input.impacto} | Severidade: ${input.severidade}

Foco do plano:
1. Redução/corte de custos SEM impactar o dia a dia operacional
2. Boas práticas de mercado para PMEs (faturamento até R$ 5M/ano)
3. Benchmarking com empresas similares do setor de arqueologia e licenciamento
4. Plano executável em até 90 dias`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Você é especialista em gestão de riscos para PMEs do setor de arqueologia. Responda sempre em JSON válido." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "plano_acao_risco",
            strict: true,
            schema: {
              type: "object",
              properties: {
                titulo: { type: "string" },
                objetivo: { type: "string" },
                descricao: { type: "string" },
                tipoPrioridade: { type: "string", enum: ["corte_custos","mitigacao","prevencao","contingencia","monitoramento"] },
                economiaEstimada: { type: "string" },
                prazoImplementacao: { type: "string" },
                impactoOperacional: { type: "string", enum: ["nenhum","baixo","medio","alto"] },
                benchmarking: { type: "string" },
                acoes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      acao: { type: "string" },
                      responsavel: { type: "string" },
                      prazo: { type: "string" },
                      status: { type: "string", enum: ["pendente","em_andamento","concluido"] }
                    },
                    required: ["acao","responsavel","prazo","status"],
                    additionalProperties: false
                  }
                }
              },
              required: ["titulo","objetivo","descricao","tipoPrioridade","economiaEstimada","prazoImplementacao","impactoOperacional","benchmarking","acoes"],
              additionalProperties: false
            }
          }
        }
      });

      const content = response.choices[0].message.content;
      const plano = typeof content === "string" ? JSON.parse(content) : content;

      const [result] = await db.insert(planosAcaoRisco).values({
        riscoId: input.riscoId,
        empresaId: input.empresaId,
        titulo: plano.titulo,
        objetivo: plano.objetivo,
        descricao: plano.descricao,
        tipoPrioridade: plano.tipoPrioridade,
        economiaEstimada: plano.economiaEstimada,
        prazoImplementacao: plano.prazoImplementacao,
        impactoOperacional: plano.impactoOperacional,
        benchmarking: plano.benchmarking,
        acoes: plano.acoes,
        geradoPorIA: true,
        iaContexto: prompt,
        status: "ativo",
        createdByUserId: ctx.user.id,
      });

      return { success: true, id: (result as any).insertId, plano };
    }),
});
