import { getDb } from "./db";
import { analiseVrio } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

interface RecursoVRIO {
  id?: string;
  nome: string;
  valor: number;
  raridade: number;
  imitabilidade: number;
  organizacao: number;
}

const classificarVRIO = (media: number): string => {
  if (media >= 4.5) return "vantagem_sustentavel";
  if (media >= 3.5) return "vantagem_temporaria";
  if (media >= 2.5) return "paridade_competitiva";
  return "desvantagem";
};

const gerarRecomendacoes = (recurso: RecursoVRIO, classificacao: string): string => {
  const recomendacoes: string[] = [];

  if (recurso.valor < 3) {
    recomendacoes.push("Aumentar o valor agregado do recurso aos clientes");
  }

  if (recurso.raridade < 3) {
    recomendacoes.push("Tornar o recurso mais raro/diferenciado no mercado");
  }

  if (recurso.imitabilidade < 3) {
    recomendacoes.push("Aumentar as barreiras à imitação (patentes, processos, conhecimento)");
  }

  if (recurso.organizacao < 3) {
    recomendacoes.push("Melhorar a organização interna para explorar melhor este recurso");
  }

  if (classificacao === "desvantagem") {
    recomendacoes.push("Considerar investimento estratégico ou desinvestimento");
  } else if (classificacao === "paridade_competitiva") {
    recomendacoes.push("Manter competitividade e buscar melhorias incrementais");
  } else if (classificacao === "vantagem_temporaria") {
    recomendacoes.push("Consolidar vantagem e preparar para possível imitação");
  } else if (classificacao === "vantagem_sustentavel") {
    recomendacoes.push("Proteger e expandir este recurso estratégico");
  }

  return recomendacoes.join("; ");
};

export async function salvarRecursoVRIO(
  empresaId: number,
  recurso: RecursoVRIO
): Promise<any> {
  const media = (recurso.valor + recurso.raridade + recurso.imitabilidade + recurso.organizacao) / 4;
  const classificacao = classificarVRIO(media);
  const recomendacoes = gerarRecomendacoes(recurso, classificacao);

  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Verificar se já existe registro para este recurso
    const existente = await db
      .select()
      .from(analiseVrio)
      .where(
        and(
          eq(analiseVrio.empresaId, empresaId),
          eq(analiseVrio.recursoNome, recurso.nome)
        )
      )
      .limit(1);

    if (existente.length > 0) {
      // Atualizar
      return await db
        .update(analiseVrio)
        .set({
          valor: recurso.valor,
          raridade: recurso.raridade,
          imitabilidade: recurso.imitabilidade,
          organizacao: recurso.organizacao,
          media: media.toString(),
          classificacao: classificacao as any,
          recomendacoes,
          updatedAt: new Date(),
        })
        .where(eq(analiseVrio.id, existente[0].id));
    } else {
      // Inserir
      return await db.insert(analiseVrio).values({
        empresaId,
        recursoNome: recurso.nome,
        valor: recurso.valor,
        raridade: recurso.raridade,
        imitabilidade: recurso.imitabilidade,
        organizacao: recurso.organizacao,
        media: media.toString(),
        classificacao: classificacao as any,
        recomendacoes,
      });
    }
  } catch (error) {
    console.error("Erro ao salvar recurso VRIO:", error);
    throw error;
  }
}

export async function obterRecursosVRIO(empresaId: number): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .select()
      .from(analiseVrio)
      .where(eq(analiseVrio.empresaId, empresaId));
  } catch (error) {
    console.error("Erro ao obter recursos VRIO:", error);
    throw error;
  }
}

export async function deletarRecursoVRIO(id: number): Promise<any> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db.delete(analiseVrio).where(eq(analiseVrio.id, id));
  } catch (error) {
    console.error("Erro ao deletar recurso VRIO:", error);
    throw error;
  }
}
