import { getDb } from "./db";
import {
  orcamentoCategorias,
  orcamentoSubcategorias,
  orcamentoVersoes,
  orcamentoPlanejadoLinhas,
  orcamentoImportacoes,
  orcamentoExecutadoLinhas,
  orcamentoRevisoes,
} from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

async function db() {
  const d = await getDb();
  if (!d) throw new Error("Database not available");
  return d;
}

// ─── CATEGORIAS ─────────────────────────────────────────────────────────────

export async function getCategorias() {
  const d = await db();
  return d
    .select()
    .from(orcamentoCategorias)
    .where(eq(orcamentoCategorias.ativo, 1))
    .orderBy(orcamentoCategorias.ordem, orcamentoCategorias.nome);
}

export async function createCategoria(data: {
  nome: string;
  descricao?: string;
  tipo: "receita" | "custo" | "despesa" | "investimento" | "outro";
  escopoTipo?: "global" | "empresa";
  observacao?: string;
}) {
  const d = await db();
  const [result] = await d.insert(orcamentoCategorias).values({
    nome: data.nome,
    descricao: data.descricao,
    tipo: data.tipo,
    escopoTipo: data.escopoTipo ?? "global",
    observacao: data.observacao,
    ativo: 1,
    ordem: 0,
  });
  return { id: (result as any).insertId };
}

export async function updateCategoria(id: number, data: {
  nome?: string;
  descricao?: string;
  tipo?: "receita" | "custo" | "despesa" | "investimento" | "outro";
  observacao?: string;
  ativo?: number;
}) {
  const d = await db();
  await d.update(orcamentoCategorias).set(data).where(eq(orcamentoCategorias.id, id));
  return { success: true };
}

export async function deleteCategoria(id: number) {
  const d = await db();
  await d.update(orcamentoCategorias).set({ ativo: 0 }).where(eq(orcamentoCategorias.id, id));
  return { success: true };
}

// ─── SUBCATEGORIAS ───────────────────────────────────────────────────────────

export async function getSubcategorias(categoriaId?: number) {
  const d = await db();
  const query = d
    .select()
    .from(orcamentoSubcategorias)
    .where(
      categoriaId
        ? and(eq(orcamentoSubcategorias.categoriaId, categoriaId), eq(orcamentoSubcategorias.ativo, 1))
        : eq(orcamentoSubcategorias.ativo, 1)
    )
    .orderBy(orcamentoSubcategorias.ordem, orcamentoSubcategorias.nome);
  return query;
}

export async function createSubcategoria(data: {
  categoriaId: number;
  nome: string;
  descricao?: string;
  observacao?: string;
}) {
  const d = await db();
  const [result] = await d.insert(orcamentoSubcategorias).values({
    categoriaId: data.categoriaId,
    nome: data.nome,
    descricao: data.descricao,
    observacao: data.observacao,
    ativo: 1,
    ordem: 0,
  });
  return { id: (result as any).insertId };
}

export async function updateSubcategoria(id: number, data: { nome?: string; descricao?: string; observacao?: string }) {
  const d = await db();
  await d.update(orcamentoSubcategorias).set(data).where(eq(orcamentoSubcategorias.id, id));
  return { success: true };
}

export async function deleteSubcategoria(id: number) {
  const d = await db();
  await d.update(orcamentoSubcategorias).set({ ativo: 0 }).where(eq(orcamentoSubcategorias.id, id));
  return { success: true };
}

// ─── VERSÕES ORÇAMENTÁRIAS ───────────────────────────────────────────────────

export async function getVersoesByEmpresa(empresaId: number) {
  const d = await db();
  return d
    .select()
    .from(orcamentoVersoes)
    .where(eq(orcamentoVersoes.empresaId, empresaId))
    .orderBy(desc(orcamentoVersoes.ano), desc(orcamentoVersoes.numeroVersao));
}

export async function getVersaoById(id: number) {
  const d = await db();
  const rows = await d
    .select()
    .from(orcamentoVersoes)
    .where(eq(orcamentoVersoes.id, id));
  return rows[0] ?? null;
}

export async function createVersao(data: {
  empresaId: number;
  ano: number;
  nomeVersao: string;
  moedaBase?: string;
  observacoes?: string;
  criadoPor?: number;
  versaoOrigemId?: number;
}) {
  // Determinar próximo número de versão para o mesmo ano/empresa
  const d = await db();
  const existentes = await d
    .select()
    .from(orcamentoVersoes)
    .where(and(eq(orcamentoVersoes.empresaId, data.empresaId), eq(orcamentoVersoes.ano, data.ano)));
  const numeroVersao = existentes.length + 1;

  const [result] = await d.insert(orcamentoVersoes).values({
    empresaId: data.empresaId,
    ano: data.ano,
    nomeVersao: data.nomeVersao,
    numeroVersao,
    status: "rascunho",
    moedaBase: data.moedaBase ?? "BRL",
    observacoes: data.observacoes,
    criadoPor: data.criadoPor,
    versaoOrigemId: data.versaoOrigemId,
  });
  const versaoId = (result as any).insertId;

  // Registrar revisão de criação
  await d.insert(orcamentoRevisoes).values({
    versaoId,
    acao: "criacao",
    usuarioId: data.criadoPor,
    motivo: "Criação inicial da versão orçamentária",
  });

  return { id: versaoId };
}

export async function updateVersaoStatus(
  versaoId: number,
  status: "rascunho" | "em_revisao" | "aprovado" | "congelado",
  usuarioId?: number,
  motivo?: string
) {
  const versaoAtual = await getVersaoById(versaoId);
  if (!versaoAtual) throw new Error("Versão não encontrada");

  const d = await db();
  const updateData: any = { status };
  if (status === "aprovado") {
    updateData.aprovadoPor = usuarioId;
    updateData.dataAprovacao = new Date();
  }

  await d.update(orcamentoVersoes).set(updateData).where(eq(orcamentoVersoes.id, versaoId));

  // Registrar revisão
  const acaoMap: Record<string, any> = {
    em_revisao: "envio_revisao",
    aprovado: "aprovacao",
    congelado: "congelamento",
    rascunho: "edicao",
  };
  await d.insert(orcamentoRevisoes).values({
    versaoId,
    acao: acaoMap[status] ?? "edicao",
    usuarioId,
    motivo: motivo ?? `Status alterado para ${status}`,
    payloadAnterior: JSON.stringify({ status: versaoAtual.status }),
    payloadNovo: JSON.stringify({ status }),
  });

  return { success: true };
}

export async function duplicarVersao(versaoOrigemId: number, nomeVersao: string, usuarioId?: number) {
  const origem = await getVersaoById(versaoOrigemId);
  if (!origem) throw new Error("Versão de origem não encontrada");

  // Criar nova versão
  const { id: novaVersaoId } = await createVersao({
    empresaId: origem.empresaId,
    ano: origem.ano,
    nomeVersao,
    moedaBase: origem.moedaBase ?? "BRL",
    observacoes: `Duplicada da versão: ${origem.nomeVersao}`,
    criadoPor: usuarioId,
    versaoOrigemId,
  });

  // Copiar linhas planejadas
  const d2 = await db();
  const linhasOrigem = await d2
    .select()
    .from(orcamentoPlanejadoLinhas)
    .where(eq(orcamentoPlanejadoLinhas.versaoId, versaoOrigemId));

  for (const linha of linhasOrigem) {
    await d2.insert(orcamentoPlanejadoLinhas).values({
      versaoId: novaVersaoId,
      categoriaId: linha.categoriaId,
      subcategoriaId: linha.subcategoriaId,
      descricao: linha.descricao,
      janeiro: linha.janeiro,
      fevereiro: linha.fevereiro,
      marco: linha.marco,
      abril: linha.abril,
      maio: linha.maio,
      junho: linha.junho,
      julho: linha.julho,
      agosto: linha.agosto,
      setembro: linha.setembro,
      outubro: linha.outubro,
      novembro: linha.novembro,
      dezembro: linha.dezembro,
      totalAnual: linha.totalAnual,
      observacoes: linha.observacoes,
    });
  }

  // Registrar revisão de duplicação
  await d2.insert(orcamentoRevisoes).values({
    versaoId: novaVersaoId,
    acao: "duplicacao",
    usuarioId,
    motivo: `Duplicada da versão ${versaoOrigemId}: ${origem.nomeVersao}`,
  });

  return { id: novaVersaoId };
}

// ─── LINHAS PLANEJADAS ───────────────────────────────────────────────────────

export async function getLinhasPlanejadas(versaoId: number) {
  const d = await db();
  return d
    .select()
    .from(orcamentoPlanejadoLinhas)
    .where(eq(orcamentoPlanejadoLinhas.versaoId, versaoId))
    .orderBy(orcamentoPlanejadoLinhas.categoriaId);
}

export async function upsertLinhaPlanejada(data: {
  id?: number;
  versaoId: number;
  categoriaId: number;
  subcategoriaId?: number;
  descricao?: string;
  janeiro?: number;
  fevereiro?: number;
  marco?: number;
  abril?: number;
  maio?: number;
  junho?: number;
  julho?: number;
  agosto?: number;
  setembro?: number;
  outubro?: number;
  novembro?: number;
  dezembro?: number;
}) {
  const meses = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"] as const;
  const totalAnual = meses.reduce((acc, m) => acc + ((data as any)[m] ?? 0), 0);

  const payload: any = {
    versaoId: data.versaoId,
    categoriaId: data.categoriaId,
    subcategoriaId: data.subcategoriaId,
    descricao: data.descricao,
    janeiro: String(data.janeiro ?? 0),
    fevereiro: String(data.fevereiro ?? 0),
    marco: String(data.marco ?? 0),
    abril: String(data.abril ?? 0),
    maio: String(data.maio ?? 0),
    junho: String(data.junho ?? 0),
    julho: String(data.julho ?? 0),
    agosto: String(data.agosto ?? 0),
    setembro: String(data.setembro ?? 0),
    outubro: String(data.outubro ?? 0),
    novembro: String(data.novembro ?? 0),
    dezembro: String(data.dezembro ?? 0),
    totalAnual: String(totalAnual),
  };

  const d = await db();
  if (data.id) {
    await d.update(orcamentoPlanejadoLinhas).set(payload).where(eq(orcamentoPlanejadoLinhas.id, data.id));
    return { id: data.id };
  } else {
    const [result] = await d.insert(orcamentoPlanejadoLinhas).values(payload);
    return { id: (result as any).insertId };
  }
}

export async function deleteLinhaPlanejada(id: number) {
  const d = await db();
  await d.delete(orcamentoPlanejadoLinhas).where(eq(orcamentoPlanejadoLinhas.id, id));
  return { success: true };
}

// ─── EXECUTADO ───────────────────────────────────────────────────────────────

export async function getExecutadoByEmpresa(empresaId: number, ano: number) {
  const d = await db();
  return d
    .select()
    .from(orcamentoExecutadoLinhas)
    .where(
      and(
        eq(orcamentoExecutadoLinhas.empresaId, empresaId),
        eq(orcamentoExecutadoLinhas.ativo, 1),
        sql`YEAR(${orcamentoExecutadoLinhas.dataLancamento}) = ${ano}`
      )
    )
    .orderBy(orcamentoExecutadoLinhas.dataLancamento);
}

export async function getImportacoesByEmpresa(empresaId: number) {
  const d = await db();
  return d
    .select()
    .from(orcamentoImportacoes)
    .where(eq(orcamentoImportacoes.empresaId, empresaId))
    .orderBy(desc(orcamentoImportacoes.createdAt));
}

export async function criarImportacao(data: {
  empresaId: number;
  ano: number;
  mesReferencia?: number;
  arquivoNome?: string;
  arquivoKey?: string;
  moedaLote?: string;
  importadoPor?: number;
}) {
  const d = await db();
  const [result] = await d.insert(orcamentoImportacoes).values({
    empresaId: data.empresaId,
    ano: data.ano,
    mesReferencia: data.mesReferencia,
    arquivoNome: data.arquivoNome,
    arquivoKey: data.arquivoKey,
    status: "processando",
    moedaLote: data.moedaLote ?? "BRL",
    importadoPor: data.importadoPor,
  });
  return { id: (result as any).insertId };
}

export async function inserirLinhasExecutado(
  importacaoId: number,
  empresaId: number,
  linhas: Array<{
    categoriaId?: number;
    subcategoriaId?: number;
    dataLancamento?: string;
    competencia?: string;
    descricao?: string;
    valorOriginal: number;
    moedaOriginal?: string;
    taxaCambio?: number;
    referenciaExterna?: string;
    documentoReferencia?: string;
  }>
) {
  let totalImportado = 0;
  let totalErros = 0;
  const erros: string[] = [];

  for (const linha of linhas) {
    try {
      const valorConvertido = linha.valorOriginal * (linha.taxaCambio ?? 1);
      const dExec = await db();
      await dExec.insert(orcamentoExecutadoLinhas).values({
        importacaoId,
        empresaId,
        categoriaId: linha.categoriaId,
        subcategoriaId: linha.subcategoriaId,
        dataLancamento: linha.dataLancamento ? new Date(linha.dataLancamento) as any : undefined,
        competencia: linha.competencia,
        descricao: linha.descricao,
        valorOriginal: String(linha.valorOriginal),
        moedaOriginal: linha.moedaOriginal ?? "BRL",
        taxaCambio: String(linha.taxaCambio ?? 1),
        valorConvertidoBase: String(valorConvertido),
        referenciaExterna: linha.referenciaExterna,
        documentoReferencia: linha.documentoReferencia,
        ativo: 1,
      });
      totalImportado++;
    } catch (e: any) {
      totalErros++;
      erros.push(e.message);
    }
  }

  // Atualizar status da importação
  const dUpd = await db();
  await dUpd.update(orcamentoImportacoes).set({
    status: totalErros === 0 ? "concluido" : "erro",
    totalLinhas: linhas.length,
    totalImportado,
    totalErros,
    errosDetalhes: erros.length > 0 ? JSON.stringify(erros.slice(0, 20)) : undefined,
  }).where(eq(orcamentoImportacoes.id, importacaoId));

  return { totalImportado, totalErros, erros: erros.slice(0, 5) };
}

// ─── REVISÕES ────────────────────────────────────────────────────────────────

export async function getRevisoesByVersao(versaoId: number) {
  const d = await db();
  return d
    .select()
    .from(orcamentoRevisoes)
    .where(eq(orcamentoRevisoes.versaoId, versaoId))
    .orderBy(desc(orcamentoRevisoes.createdAt));
}

// ─── DASHBOARD / CONSOLIDADO ─────────────────────────────────────────────────

export async function getDashboardOrcamento(empresaId: number, ano: number) {
  // Buscar versão aprovada ou mais recente
  const versoes = await getVersoesByEmpresa(empresaId);
  const versaoAtiva = versoes.find((v: any) => v.ano === ano && v.status === "aprovado")
    ?? versoes.find((v: any) => v.ano === ano)
    ?? null;

  if (!versaoAtiva) {
    return {
      versaoId: null,
      totalPlanejado: 0,
      totalExecutado: 0,
      variacao: 0,
      percentualExecucao: 0,
      planejadoPorMes: [],
      executadoPorMes: [],
    };
  }

  const linhasPlanejadas = await getLinhasPlanejadas(versaoAtiva.id);
  const linhasExecutadas = await getExecutadoByEmpresa(empresaId, ano);

  const meses = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const nomeMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  const planejadoPorMes = meses.map((mes, idx) => ({
    mes: nomeMeses[idx],
    valor: linhasPlanejadas.reduce((acc: number, l: any) => acc + parseFloat(l[mes] ?? "0"), 0),
  }));

  const executadoPorMes = nomeMeses.map((nomeMes, idx) => {
    const mesNum = String(idx + 1).padStart(2, "0");
    const total = linhasExecutadas
      .filter((l: any) => l.competencia?.endsWith(`-${mesNum}`) || (l.dataLancamento && new Date(l.dataLancamento).getMonth() === idx))
      .reduce((acc: number, l: any) => acc + parseFloat(l.valorConvertidoBase ?? "0"), 0);
    return { mes: nomeMes, valor: total };
  });

  const totalPlanejado = planejadoPorMes.reduce((acc, m) => acc + m.valor, 0);
  const totalExecutado = executadoPorMes.reduce((acc, m) => acc + m.valor, 0);
  const variacao = totalExecutado - totalPlanejado;
  const percentualExecucao = totalPlanejado > 0 ? (totalExecutado / totalPlanejado) * 100 : 0;

  return {
    versaoId: versaoAtiva.id,
    versaoNome: versaoAtiva.nomeVersao,
    versaoStatus: versaoAtiva.status,
    totalPlanejado,
    totalExecutado,
    variacao,
    percentualExecucao,
    planejadoPorMes,
    executadoPorMes,
  };
}
