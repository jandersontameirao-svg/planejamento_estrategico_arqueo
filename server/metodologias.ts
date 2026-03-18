import { getDb } from "./db";
import { empresaMetodologias } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

async function db() {
  const d = await getDb();
  if (!d) throw new Error("Database not available");
  return d;
}

// Lista completa de metodologias disponíveis no sistema
export const METODOLOGIAS_DISPONIVEIS = [
  { id: "identidade", titulo: "Identidade Organizacional", descricao: "Missão, Visão e Valores", categoria: "Fundamentos", obrigatoria: true },
  { id: "pestel", titulo: "PESTEL", descricao: "Análise do ambiente externo (Político, Econômico, Social, Tecnológico, Ambiental, Legal)", categoria: "Ambiente Externo" },
  { id: "5forcas", titulo: "5 Forças de Porter", descricao: "Análise da competitividade e atratividade do setor", categoria: "Ambiente Externo" },
  { id: "stakeholders", titulo: "Stakeholders", descricao: "Mapeamento de partes interessadas por poder e interesse", categoria: "Ambiente Externo" },
  { id: "vrio", titulo: "RBV / VRIO", descricao: "Análise de recursos e capacidades internas", categoria: "Ambiente Interno" },
  { id: "swot", titulo: "SWOT / TOWS", descricao: "Forças, Fraquezas, Oportunidades e Ameaças", categoria: "Síntese Estratégica" },
  { id: "bsc", titulo: "BSC", descricao: "Balanced Scorecard — perspectivas financeira, clientes, processos e aprendizado", categoria: "Execução Estratégica" },
  { id: "okr", titulo: "OKR", descricao: "Objetivos e Resultados-Chave para acompanhamento de metas", categoria: "Execução Estratégica" },
  { id: "orcamento", titulo: "Gestão Orçamentária", descricao: "Planejamento orçamentário com comparativo planejado vs executado", categoria: "Financeiro" },
];

export async function getMetodologiasEmpresa(empresaId: number): Promise<string[]> {
  const d = await db();
  const rows = await d
    .select()
    .from(empresaMetodologias)
    .where(and(eq(empresaMetodologias.empresaId, empresaId), eq(empresaMetodologias.ativa, true)));

  // Se não há configuração, retorna todas as metodologias (compatibilidade retroativa)
  if (rows.length === 0) {
    return METODOLOGIAS_DISPONIVEIS.map((m) => m.id);
  }

  return rows.map((r) => r.metodologia);
}

export async function saveMetodologiasEmpresa(
  empresaId: number,
  metodologias: string[]
): Promise<{ success: boolean }> {
  const d = await db();
  const now = Date.now();

  // Garante que identidade organizacional está sempre incluída
  const metodologiasComIdentidade = Array.from(new Set(["identidade", ...metodologias]));

  // Deleta configurações antigas e insere as novas
  await d.delete(empresaMetodologias).where(eq(empresaMetodologias.empresaId, empresaId));

  if (metodologiasComIdentidade.length > 0) {
    await d.insert(empresaMetodologias).values(
      metodologiasComIdentidade.map((metodologia) => ({
        empresaId,
        metodologia,
        ativa: true,
        createdAt: now,
        updatedAt: now,
      }))
    );
  }

  return { success: true };
}
