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
import { eq, and, desc, sql, inArray } from "drizzle-orm";

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

export async function duplicarVersao(
  versaoOrigemId: number,
  nomeVersao: string,
  usuarioId?: number,
  motivoRevisao?: string,
  congelarOrigem?: boolean
) {
  const origem = await getVersaoById(versaoOrigemId);
  if (!origem) throw new Error("Versão de origem não encontrada");

  // Opcionalmente congelar a versão original para preservar referência
  if (congelarOrigem && origem.status !== "congelado") {
    await updateVersaoStatus(versaoOrigemId, "congelado", usuarioId, "Congelada automaticamente ao criar revisão");
  }

  // Criar nova versão
  const { id: novaVersaoId } = await createVersao({
    empresaId: origem.empresaId,
    ano: origem.ano,
    nomeVersao,
    moedaBase: origem.moedaBase ?? "BRL",
    observacoes: motivoRevisao ?? `Duplicada da versão: ${origem.nomeVersao}`,
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

  // Registrar revisão de duplicação com motivo
  await d2.insert(orcamentoRevisoes).values({
    versaoId: novaVersaoId,
    acao: "duplicacao",
    usuarioId,
    motivo: motivoRevisao ?? `Duplicada da versão ${versaoOrigemId}: ${origem.nomeVersao}`,
  });

  return { id: novaVersaoId };
}

// ─── COMPARATIVO ENTRE VERSÕES ──────────────────────────────────────────────

export async function compararVersoes(versaoIdA: number, versaoIdB: number) {
  const d = await db();

  const [versaoA, versaoB] = await Promise.all([
    getVersaoById(versaoIdA),
    getVersaoById(versaoIdB),
  ]);
  if (!versaoA || !versaoB) throw new Error("Uma ou ambas versões não encontradas");

  const [linhasA, linhasB] = await Promise.all([
    d.select().from(orcamentoPlanejadoLinhas).where(eq(orcamentoPlanejadoLinhas.versaoId, versaoIdA)),
    d.select().from(orcamentoPlanejadoLinhas).where(eq(orcamentoPlanejadoLinhas.versaoId, versaoIdB)),
  ]);

  // Buscar nomes de categorias e subcategorias
  const allCatIds = new Set<number>();
  const allSubIds = new Set<number>();
  [...linhasA, ...linhasB].forEach(l => {
    allCatIds.add(l.categoriaId);
    if (l.subcategoriaId) allSubIds.add(l.subcategoriaId);
  });

  const cats = allCatIds.size > 0
    ? await d.select().from(orcamentoCategorias).where(inArray(orcamentoCategorias.id, Array.from(allCatIds)))
    : [];
  const subs = allSubIds.size > 0
    ? await d.select().from(orcamentoSubcategorias).where(inArray(orcamentoSubcategorias.id, Array.from(allSubIds)))
    : [];

  const catMap = new Map(cats.map(c => [c.id, c.nome]));
  const subMap = new Map(subs.map(s => [s.id, s.nome]));

  const meses = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"] as const;

  // Indexar linhas por subcategoriaId para comparação
  const mapA = new Map<string, typeof linhasA[0]>();
  const mapB = new Map<string, typeof linhasB[0]>();
  linhasA.forEach(l => mapA.set(`${l.categoriaId}-${l.subcategoriaId ?? 0}`, l));
  linhasB.forEach(l => mapB.set(`${l.categoriaId}-${l.subcategoriaId ?? 0}`, l));

  const allKeys = new Set([...Array.from(mapA.keys()), ...Array.from(mapB.keys())]);

  const comparativo: Array<{
    categoriaId: number;
    categoriaNome: string;
    subcategoriaId: number | null;
    subcategoriaNome: string;
    status: "inalterado" | "alterado" | "adicionado" | "removido";
    versaoA: { meses: number[]; total: number };
    versaoB: { meses: number[]; total: number };
    diferencas: { meses: number[]; total: number };
  }> = [];

  for (const key of Array.from(allKeys)) {
    const linhaA = mapA.get(key);
    const linhaB = mapB.get(key);

    const catId = linhaA?.categoriaId ?? linhaB!.categoriaId;
    const subId = linhaA?.subcategoriaId ?? linhaB!.subcategoriaId;

    const valoresA = meses.map(m => Number(linhaA?.[m] ?? 0));
    const valoresB = meses.map(m => Number(linhaB?.[m] ?? 0));
    const totalA = valoresA.reduce((a, b) => a + b, 0);
    const totalB = valoresB.reduce((a, b) => a + b, 0);
    const diffs = meses.map((_, i) => valoresB[i] - valoresA[i]);
    const totalDiff = totalB - totalA;

    let status: "inalterado" | "alterado" | "adicionado" | "removido";
    if (!linhaA) status = "adicionado";
    else if (!linhaB) status = "removido";
    else if (Math.abs(totalDiff) < 0.01) status = "inalterado";
    else status = "alterado";

    comparativo.push({
      categoriaId: catId,
      categoriaNome: catMap.get(catId) ?? `Categoria ${catId}`,
      subcategoriaId: subId,
      subcategoriaNome: subId ? (subMap.get(subId) ?? `Sub ${subId}`) : "Geral",
      status,
      versaoA: { meses: valoresA, total: totalA },
      versaoB: { meses: valoresB, total: totalB },
      diferencas: { meses: diffs, total: totalDiff },
    });
  }

  // Ordenar: alterados/adicionados/removidos primeiro, depois por categoria
  const statusOrder = { alterado: 0, adicionado: 1, removido: 2, inalterado: 3 };
  comparativo.sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || a.categoriaNome.localeCompare(b.categoriaNome));

  // Resumo
  const totalVersaoA = comparativo.reduce((a, c) => a + c.versaoA.total, 0);
  const totalVersaoB = comparativo.reduce((a, c) => a + c.versaoB.total, 0);

  return {
    versaoA: { id: versaoA.id, nome: versaoA.nomeVersao, numero: versaoA.numeroVersao, status: versaoA.status },
    versaoB: { id: versaoB.id, nome: versaoB.nomeVersao, numero: versaoB.numeroVersao, status: versaoB.status },
    resumo: {
      totalVersaoA,
      totalVersaoB,
      diferencaTotal: totalVersaoB - totalVersaoA,
      percentualVariacao: totalVersaoA > 0 ? ((totalVersaoB - totalVersaoA) / totalVersaoA) * 100 : 0,
      itensAlterados: comparativo.filter(c => c.status === "alterado").length,
      itensAdicionados: comparativo.filter(c => c.status === "adicionado").length,
      itensRemovidos: comparativo.filter(c => c.status === "removido").length,
      itensInalterados: comparativo.filter(c => c.status === "inalterado").length,
    },
    itens: comparativo,
  };
}

// ─── LISTAR VERSÕES POR EMPRESA/ANO ─────────────────────────────────────────

export async function listarVersoes(empresaId: number, ano: number) {
  const d = await db();
  return d
    .select()
    .from(orcamentoVersoes)
    .where(and(eq(orcamentoVersoes.empresaId, empresaId), eq(orcamentoVersoes.ano, ano)))
    .orderBy(orcamentoVersoes.numeroVersao);
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


// ─── RELATÓRIO DETALHADO: PLANEJADO vs EXECUTADO ──────────────────────────

export async function getRelatorioDetalhadoPvsE(empresaId: number, ano: number, categoriaIdFiltro?: number, versaoIdEspecifica?: number) {
  const d = await db();

  // Buscar versão específica ou aprovada ou mais recente do ano
  const versoes = await getVersoesByEmpresa(empresaId);
  const versaoAtiva = versaoIdEspecifica
    ? versoes.find((v: any) => v.id === versaoIdEspecifica)
    : (versoes.find((v: any) => v.ano === ano && v.status === "aprovado")
      ?? versoes.find((v: any) => v.ano === ano)
      ?? null);

  if (!versaoAtiva) {
    return { versaoId: null, versaoNome: null, categorias: [], totais: null };
  }

  // Buscar linhas planejadas
  const linhasPlanejadas = await getLinhasPlanejadas(versaoAtiva.id);

  // Buscar executado
  const linhasExecutadas = await getExecutadoByEmpresa(empresaId, ano);

  // Buscar categorias e subcategorias para nomes
  const todasCategorias = await getCategorias();
  const todasSubcategorias = await getSubcategorias(undefined);

  const catMap = new Map((todasCategorias as any[]).map(c => [c.id, c]));
  const subMap = new Map((todasSubcategorias as any[]).map(s => [s.id, s]));

  const mesesKeys = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"] as const;
  const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  // Agrupar executado por subcategoria+mês e categoria+mês
  const execPorSubMes = new Map<string, number>();
  const execPorCatMes = new Map<string, number>();

  for (const exec of linhasExecutadas as any[]) {
    let mesIdx = -1;
    if (exec.competencia) {
      const parts = exec.competencia.split("-");
      mesIdx = parseInt(parts[1], 10) - 1;
    } else if (exec.dataLancamento) {
      mesIdx = new Date(exec.dataLancamento).getMonth();
    }
    if (mesIdx < 0 || mesIdx > 11) continue;

    const valor = parseFloat(exec.valorConvertidoBase ?? "0");
    const subId = exec.subcategoriaId ?? 0;
    const catId = exec.categoriaId ?? 0;

    // Chave com subcategoria real (não-zero) para match preciso
    if (subId !== 0) {
      const keySubMes = `${catId}_${subId}_${mesIdx}`;
      execPorSubMes.set(keySubMes, (execPorSubMes.get(keySubMes) ?? 0) + valor);
    }

    const keyCatMes = `${catId}_${mesIdx}`;
    execPorCatMes.set(keyCatMes, (execPorCatMes.get(keyCatMes) ?? 0) + valor);
  }

  // Track quais categorias+mês já tiveram executado atribuído (para evitar duplicação)
  const execCatMesConsumed = new Set<string>();

  // Agrupar por categoria > subcategoria
  type SubcategoriaRelatorio = {
    subcategoriaId: number;
    subcategoriaNome: string;
    meses: Array<{ mes: string; planejado: number; executado: number; variacao: number; percentual: number }>;
    totalPlanejado: number;
    totalExecutado: number;
    totalVariacao: number;
    totalPercentual: number;
  };

  type CategoriaRelatorio = {
    categoriaId: number;
    categoriaNome: string;
    subcategorias: SubcategoriaRelatorio[];
    meses: Array<{ mes: string; planejado: number; executado: number; variacao: number; percentual: number }>;
    totalPlanejado: number;
    totalExecutado: number;
    totalVariacao: number;
    totalPercentual: number;
  };

  const categoriasMap = new Map<number, CategoriaRelatorio>();

  // Processar linhas planejadas
  for (const lp of linhasPlanejadas as any[]) {
    const catId = lp.categoriaId;
    const subId = lp.subcategoriaId ?? 0;

    if (categoriaIdFiltro && catId !== categoriaIdFiltro) continue;

    if (!categoriasMap.has(catId)) {
      const cat = catMap.get(catId);
      categoriasMap.set(catId, {
        categoriaId: catId,
        categoriaNome: cat?.nome ?? `Categoria ${catId}`,
        subcategorias: [],
        meses: mesesNomes.map(m => ({ mes: m, planejado: 0, executado: 0, variacao: 0, percentual: 0 })),
        totalPlanejado: 0,
        totalExecutado: 0,
        totalVariacao: 0,
        totalPercentual: 0,
      });
    }

    const catRel = categoriasMap.get(catId)!;
    const sub = subMap.get(subId);

    const subMeses = mesesKeys.map((mesKey, idx) => {
      const planejado = parseFloat(lp[mesKey] ?? "0");
      // Para executado: se subcategoria é real (não-zero), usar match por sub
      // Se subcategoria é 0 (NULL), NÃO atribuir executado aqui para evitar duplicação
      // O executado será atribuído no nível da categoria depois
      let executado = 0;
      if (subId !== 0) {
        executado = execPorSubMes.get(`${catId}_${subId}_${idx}`) ?? 0;
      }
      const variacao = executado - planejado;
      const percentual = planejado > 0 ? ((executado / planejado) * 100) : (executado > 0 ? 100 : 0);
      return { mes: mesesNomes[idx], planejado, executado, variacao, percentual };
    });

    const totalPlanejadoSub = subMeses.reduce((a, m) => a + m.planejado, 0);
    const totalExecutadoSub = subMeses.reduce((a, m) => a + m.executado, 0);

    catRel.subcategorias.push({
      subcategoriaId: subId,
      subcategoriaNome: sub?.nome ?? lp.descricao ?? `Subcategoria ${subId}`,
      meses: subMeses,
      totalPlanejado: totalPlanejadoSub,
      totalExecutado: totalExecutadoSub,
      totalVariacao: totalExecutadoSub - totalPlanejadoSub,
      totalPercentual: totalPlanejadoSub > 0 ? (totalExecutadoSub / totalPlanejadoSub) * 100 : (totalExecutadoSub > 0 ? 100 : 0),
    });

    // Acumular planejado nos totais da categoria
    for (let i = 0; i < 12; i++) {
      catRel.meses[i].planejado += subMeses[i].planejado;
      // Executado de subcategorias reais
      if (subId !== 0) {
        catRel.meses[i].executado += subMeses[i].executado;
      }
    }
  }

  // Calcular totais de cada categoria e variações
  const categorias: CategoriaRelatorio[] = [];
  let grandTotalPlanejado = 0;
  let grandTotalExecutado = 0;

  for (const catRel of Array.from(categoriasMap.values())) {
    // Se a categoria tem subcategorias com subId=0 (sem subcategoria real),
    // atribuir executado no nível da categoria usando execPorCatMes (uma vez só)
    const hasNullSubs = catRel.subcategorias.some(s => s.subcategoriaId === 0);
    if (hasNullSubs) {
      for (let i = 0; i < 12; i++) {
        const catExec = execPorCatMes.get(`${catRel.categoriaId}_${i}`) ?? 0;
        catRel.meses[i].executado = catExec;
      }
      // Redistribuir executado proporcionalmente entre subcategorias para exibição
      for (let i = 0; i < 12; i++) {
        const totalPlanMes = catRel.subcategorias.reduce((a, s) => a + s.meses[i].planejado, 0);
        const catExec = catRel.meses[i].executado;
        for (const sub of catRel.subcategorias) {
          if (totalPlanMes > 0) {
            sub.meses[i].executado = (sub.meses[i].planejado / totalPlanMes) * catExec;
          } else {
            sub.meses[i].executado = catExec / catRel.subcategorias.length;
          }
          sub.meses[i].variacao = sub.meses[i].executado - sub.meses[i].planejado;
          sub.meses[i].percentual = sub.meses[i].planejado > 0 ? (sub.meses[i].executado / sub.meses[i].planejado) * 100 : (sub.meses[i].executado > 0 ? 100 : 0);
        }
      }
      // Recalcular totais das subcategorias
      for (const sub of catRel.subcategorias) {
        sub.totalPlanejado = sub.meses.reduce((a, m) => a + m.planejado, 0);
        sub.totalExecutado = sub.meses.reduce((a, m) => a + m.executado, 0);
        sub.totalVariacao = sub.totalExecutado - sub.totalPlanejado;
        sub.totalPercentual = sub.totalPlanejado > 0 ? (sub.totalExecutado / sub.totalPlanejado) * 100 : (sub.totalExecutado > 0 ? 100 : 0);
      }
    }

    catRel.totalPlanejado = catRel.meses.reduce((a: number, m: { planejado: number }) => a + m.planejado, 0);
    catRel.totalExecutado = catRel.meses.reduce((a: number, m: { executado: number }) => a + m.executado, 0);
    catRel.totalVariacao = catRel.totalExecutado - catRel.totalPlanejado;
    catRel.totalPercentual = catRel.totalPlanejado > 0 ? (catRel.totalExecutado / catRel.totalPlanejado) * 100 : 0;

    for (const m of catRel.meses) {
      m.variacao = m.executado - m.planejado;
      m.percentual = m.planejado > 0 ? (m.executado / m.planejado) * 100 : (m.executado > 0 ? 100 : 0);
    }

    grandTotalPlanejado += catRel.totalPlanejado;
    grandTotalExecutado += catRel.totalExecutado;
    categorias.push(catRel);
  }

  // Ordenar categorias por nome
  categorias.sort((a, b) => a.categoriaNome.localeCompare(b.categoriaNome));

  // Totais gerais por mês
  const totaisMeses = mesesNomes.map((mes, idx) => {
    const planejado = categorias.reduce((a, c) => a + c.meses[idx].planejado, 0);
    const executado = categorias.reduce((a, c) => a + c.meses[idx].executado, 0);
    return {
      mes,
      planejado,
      executado,
      variacao: executado - planejado,
      percentual: planejado > 0 ? (executado / planejado) * 100 : (executado > 0 ? 100 : 0),
    };
  });

  return {
    versaoId: versaoAtiva.id,
    versaoNome: versaoAtiva.nomeVersao,
    versaoStatus: versaoAtiva.status,
    categorias,
    totais: {
      meses: totaisMeses,
      totalPlanejado: grandTotalPlanejado,
      totalExecutado: grandTotalExecutado,
      totalVariacao: grandTotalExecutado - grandTotalPlanejado,
      totalPercentual: grandTotalPlanejado > 0 ? (grandTotalExecutado / grandTotalPlanejado) * 100 : 0,
    },
  };
}

// ─── ANÁLISE DE CUSTOS ─────────────────────────────────────────────────────

export async function getAnaliseCustos(empresaId: number, ano: number) {
  const d = await db();

  // Buscar versão aprovada ou mais recente do ano
  const versoes = await getVersoesByEmpresa(empresaId);
  const versaoAtiva = (versoes as any[]).find((v: any) => v.ano === ano && v.status === "aprovado")
    ?? (versoes as any[]).find((v: any) => v.ano === ano)
    ?? null;

  if (!versaoAtiva) {
    return { versaoId: null, itens: [], classificacaoABC: { A: [], B: [], C: [] }, alertas: [], tendencias: [], resumo: null };
  }

  // Buscar linhas planejadas
  const linhasPlanejadas = await getLinhasPlanejadas(versaoAtiva.id);

  // Buscar executado
  const linhasExecutadas = await getExecutadoByEmpresa(empresaId, ano);

  // Buscar categorias e subcategorias
  const todasCategorias = await getCategorias();
  const todasSubcategorias = await getSubcategorias(undefined);

  const catMap = new Map((todasCategorias as any[]).map(c => [c.id, c]));
  const subMap = new Map((todasSubcategorias as any[]).map(s => [s.id, s]));

  const mesesKeys = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"] as const;

  // Agrupar executado por subcategoria+mês e categoria+mês
  const execPorSubMes = new Map<string, number>();
  const execPorCatMesAnalise = new Map<string, number>();
  for (const exec of linhasExecutadas as any[]) {
    let mesIdx = -1;
    if (exec.competencia) {
      const parts = exec.competencia.split("-");
      mesIdx = parseInt(parts[1], 10) - 1;
    } else if (exec.dataLancamento) {
      mesIdx = new Date(exec.dataLancamento).getMonth();
    }
    if (mesIdx < 0 || mesIdx > 11) continue;
    const valor = parseFloat(exec.valorConvertidoBase ?? "0");
    const subId = exec.subcategoriaId ?? 0;
    const catId = exec.categoriaId ?? 0;
    if (subId !== 0) {
      const key = `${catId}_${subId}_${mesIdx}`;
      execPorSubMes.set(key, (execPorSubMes.get(key) ?? 0) + valor);
    }
    const keyCat = `${catId}_${mesIdx}`;
    execPorCatMesAnalise.set(keyCat, (execPorCatMesAnalise.get(keyCat) ?? 0) + valor);
  }

  // Pré-calcular quantas linhas planejadas cada categoria tem (para distribuir executado)
  const catLinhaCount = new Map<number, number>();
  const catLinhaIdx = new Map<number, number>();
  for (const lp of linhasPlanejadas as any[]) {
    const catId = lp.categoriaId;
    catLinhaCount.set(catId, (catLinhaCount.get(catId) ?? 0) + 1);
  }

  // Construir itens de análise por subcategoria
  type ItemAnalise = {
    subcategoriaId: number;
    subcategoriaNome: string;
    categoriaId: number;
    categoriaNome: string;
    categoriaTipo: string;
    planejadoAnual: number;
    executadoAnual: number;
    variacao: number;
    percentualExecucao: number;
    meses: Array<{ mes: number; planejado: number; executado: number }>;
    tendencia: "crescente" | "estavel" | "decrescente" | "sem_dados";
    natureza: "fixo" | "variavel";
    classificacaoABC?: "A" | "B" | "C";
    potencialEconomia: number;
    prioridade: "alta" | "media" | "baixa";
  };

  const itens: ItemAnalise[] = [];

  // Categorias consideradas fixas
  const categoriasFixas = new Set([
    "Salários e Encargos", "Encargos Sociais e Trabalhistas", "Benefícios",
    "Infraestrutura e Ocupação", "Tecnologia e Sistemas", "Serviços Contábeis e Jurídicos",
    "Tributos e Impostos"
  ]);

  for (const lp of linhasPlanejadas as any[]) {
    const catId = lp.categoriaId;
    const subId = lp.subcategoriaId ?? 0;
    const cat = catMap.get(catId);
    const sub = subMap.get(subId);

    const meses: Array<{ mes: number; planejado: number; executado: number }> = [];
    let planejadoAnual = 0;
    let executadoAnual = 0;

    // Track índice desta linha dentro da categoria
    const currentIdx = catLinhaIdx.get(catId) ?? 0;
    catLinhaIdx.set(catId, currentIdx + 1);
    const totalLinhasNaCat = catLinhaCount.get(catId) ?? 1;
    const isFirstInCat = currentIdx === 0;

    for (let i = 0; i < 12; i++) {
      const planejado = parseFloat(lp[mesesKeys[i]] ?? "0");
      let executado = 0;
      if (subId !== 0) {
        executado = execPorSubMes.get(`${catId}_${subId}_${i}`) ?? 0;
      } else if (isFirstInCat) {
        // Atribuir todo o executado da categoria apenas na primeira linha
        // para evitar duplicação
        executado = execPorCatMesAnalise.get(`${catId}_${i}`) ?? 0;
      }
      meses.push({ mes: i, planejado, executado });
      planejadoAnual += planejado;
      executadoAnual += executado;
    }

    // Calcular tendência (regressão linear simples nos meses com executado)
    const mesesComExec = meses.filter(m => m.executado > 0);
    let tendencia: "crescente" | "estavel" | "decrescente" | "sem_dados" = "sem_dados";

    if (mesesComExec.length >= 2) {
      const n = mesesComExec.length;
      const xs = mesesComExec.map((_, i) => i);
      const ys = mesesComExec.map(m => m.executado);
      const sumX = xs.reduce((a, b) => a + b, 0);
      const sumY = ys.reduce((a, b) => a + b, 0);
      const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
      const sumX2 = xs.reduce((a, x) => a + x * x, 0);
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const avgY = sumY / n;
      const slopePercent = avgY > 0 ? (slope / avgY) * 100 : 0;

      if (slopePercent > 5) tendencia = "crescente";
      else if (slopePercent < -5) tendencia = "decrescente";
      else tendencia = "estavel";
    }

    const variacao = executadoAnual - planejadoAnual;
    const percentualExecucao = planejadoAnual > 0 ? (executadoAnual / planejadoAnual) * 100 : (executadoAnual > 0 ? 100 : 0);
    const catNome = cat?.nome ?? `Categoria ${catId}`;
    const natureza = categoriasFixas.has(catNome) ? "fixo" as const : "variavel" as const;

    // Potencial de economia: se executado > planejado, a diferença é potencial de economia
    const potencialEconomia = variacao > 0 ? variacao : 0;

    // Prioridade baseada no valor e desvio
    let prioridade: "alta" | "media" | "baixa" = "baixa";
    if (percentualExecucao > 120 && executadoAnual > 10000) prioridade = "alta";
    else if (percentualExecucao > 110 || (tendencia === "crescente" && executadoAnual > 5000)) prioridade = "media";

    itens.push({
      subcategoriaId: subId,
      subcategoriaNome: sub?.nome ?? lp.descricao ?? `Subcategoria ${subId}`,
      categoriaId: catId,
      categoriaNome: catNome,
      categoriaTipo: cat?.tipo ?? "outro",
      planejadoAnual,
      executadoAnual,
      variacao,
      percentualExecucao,
      meses,
      tendencia,
      natureza,
      potencialEconomia,
      prioridade,
    });
  }

  // ── CLASSIFICAÇÃO ABC ──
  // Ordenar por executado (ou planejado se não há executado) decrescente
  const itensOrdenados = [...itens].sort((a, b) => {
    const valA = a.executadoAnual > 0 ? a.executadoAnual : a.planejadoAnual;
    const valB = b.executadoAnual > 0 ? b.executadoAnual : b.planejadoAnual;
    return valB - valA;
  });

  const totalGasto = itensOrdenados.reduce((a, i) => a + (i.executadoAnual > 0 ? i.executadoAnual : i.planejadoAnual), 0);
  let acumulado = 0;

  const classificacaoABC: { A: ItemAnalise[]; B: ItemAnalise[]; C: ItemAnalise[] } = { A: [], B: [], C: [] };

  for (const item of itensOrdenados) {
    const val = item.executadoAnual > 0 ? item.executadoAnual : item.planejadoAnual;
    acumulado += val;
    const percentAcum = totalGasto > 0 ? (acumulado / totalGasto) * 100 : 0;

    if (percentAcum <= 80) {
      item.classificacaoABC = "A";
      classificacaoABC.A.push(item);
    } else if (percentAcum <= 95) {
      item.classificacaoABC = "B";
      classificacaoABC.B.push(item);
    } else {
      item.classificacaoABC = "C";
      classificacaoABC.C.push(item);
    }
  }

  // ── ALERTAS ──
  type Alerta = {
    tipo: "acima_orcamento" | "tendencia_alta" | "gasto_nao_previsto" | "economia_possivel";
    severidade: "critica" | "alta" | "media" | "info";
    titulo: string;
    descricao: string;
    subcategoriaId: number;
    subcategoriaNome: string;
    valor: number;
  };

  const alertas: Alerta[] = [];

  for (const item of itens) {
    // Acima do orçamento (> 120%)
    if (item.percentualExecucao > 120 && item.executadoAnual > 0) {
      alertas.push({
        tipo: "acima_orcamento",
        severidade: item.variacao > 50000 ? "critica" : item.variacao > 10000 ? "alta" : "media",
        titulo: `${item.subcategoriaNome} acima do orçamento`,
        descricao: `Executado ${item.percentualExecucao.toFixed(0)}% do planejado (R$ ${item.variacao.toFixed(2)} acima)`,
        subcategoriaId: item.subcategoriaId,
        subcategoriaNome: item.subcategoriaNome,
        valor: item.variacao,
      });
    }

    // Tendência crescente em itens classe A ou B
    if (item.tendencia === "crescente" && (item.classificacaoABC === "A" || item.classificacaoABC === "B")) {
      alertas.push({
        tipo: "tendencia_alta",
        severidade: "media",
        titulo: `${item.subcategoriaNome} com tendência crescente`,
        descricao: `Item classe ${item.classificacaoABC} com custo em alta — monitorar de perto`,
        subcategoriaId: item.subcategoriaId,
        subcategoriaNome: item.subcategoriaNome,
        valor: item.executadoAnual,
      });
    }

    // Gasto não previsto (executado > 0, planejado = 0)
    if (item.planejadoAnual === 0 && item.executadoAnual > 0) {
      alertas.push({
        tipo: "gasto_nao_previsto",
        severidade: item.executadoAnual > 10000 ? "alta" : "media",
        titulo: `${item.subcategoriaNome} — gasto não previsto`,
        descricao: `R$ ${item.executadoAnual.toFixed(2)} gastos sem previsão orçamentária`,
        subcategoriaId: item.subcategoriaId,
        subcategoriaNome: item.subcategoriaNome,
        valor: item.executadoAnual,
      });
    }
  }

  // Economia possível: itens variáveis classe A com execução > 100%
  const itensEconomia = itens
    .filter(i => i.natureza === "variavel" && i.classificacaoABC === "A" && i.percentualExecucao > 100)
    .sort((a, b) => b.potencialEconomia - a.potencialEconomia);

  for (const item of itensEconomia.slice(0, 5)) {
    alertas.push({
      tipo: "economia_possivel",
      severidade: "info",
      titulo: `Potencial de economia: ${item.subcategoriaNome}`,
      descricao: `Custo variável classe A acima do previsto. Potencial de economia: R$ ${item.potencialEconomia.toFixed(2)}`,
      subcategoriaId: item.subcategoriaId,
      subcategoriaNome: item.subcategoriaNome,
      valor: item.potencialEconomia,
    });
  }

  // Ordenar alertas por severidade
  const severidadeOrdem = { critica: 0, alta: 1, media: 2, info: 3 };
  alertas.sort((a, b) => severidadeOrdem[a.severidade] - severidadeOrdem[b.severidade]);

  // ── RESUMO ──
  const totalPlanejado = itens.reduce((a, i) => a + i.planejadoAnual, 0);
  const totalExecutado = itens.reduce((a, i) => a + i.executadoAnual, 0);
  const totalFixo = itens.filter(i => i.natureza === "fixo").reduce((a, i) => a + i.executadoAnual, 0);
  const totalVariavel = itens.filter(i => i.natureza === "variavel").reduce((a, i) => a + i.executadoAnual, 0);
  const totalPotencialEconomia = itens.reduce((a, i) => a + i.potencialEconomia, 0);
  const itensAcima = itens.filter(i => i.percentualExecucao > 110 && i.executadoAnual > 0).length;
  const itensCrescentes = itens.filter(i => i.tendencia === "crescente").length;

  return {
    versaoId: versaoAtiva.id,
    itens: itensOrdenados,
    classificacaoABC: {
      A: classificacaoABC.A.map(i => ({ id: i.subcategoriaId, nome: i.subcategoriaNome, categoria: i.categoriaNome, valor: i.executadoAnual > 0 ? i.executadoAnual : i.planejadoAnual, natureza: i.natureza })),
      B: classificacaoABC.B.map(i => ({ id: i.subcategoriaId, nome: i.subcategoriaNome, categoria: i.categoriaNome, valor: i.executadoAnual > 0 ? i.executadoAnual : i.planejadoAnual, natureza: i.natureza })),
      C: classificacaoABC.C.map(i => ({ id: i.subcategoriaId, nome: i.subcategoriaNome, categoria: i.categoriaNome, valor: i.executadoAnual > 0 ? i.executadoAnual : i.planejadoAnual, natureza: i.natureza })),
    },
    alertas,
    resumo: {
      totalPlanejado,
      totalExecutado,
      variacaoTotal: totalExecutado - totalPlanejado,
      percentualExecucao: totalPlanejado > 0 ? (totalExecutado / totalPlanejado) * 100 : 0,
      totalFixo,
      totalVariavel,
      percentualFixo: totalExecutado > 0 ? (totalFixo / totalExecutado) * 100 : 0,
      percentualVariavel: totalExecutado > 0 ? (totalVariavel / totalExecutado) * 100 : 0,
      totalPotencialEconomia,
      itensAcima,
      itensCrescentes,
      totalItensA: classificacaoABC.A.length,
      totalItensB: classificacaoABC.B.length,
      totalItensC: classificacaoABC.C.length,
    },
  };
}
