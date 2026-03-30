import { useState, useMemo, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  ChevronDown, ChevronRight, ChevronLeft, TrendingUp, TrendingDown, Minus,
  FileText, Printer, Filter, BarChart3, AlertTriangle, Calendar
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

interface RelatorioOrcamentarioProps {
  empresaId: number;
  ano: number;
}

const MESES_NOMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MESES_CURTOS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatCurrencyCompact(value: number) {
  if (Math.abs(value) < 0.01) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function VariacaoIndicator({ variacao, percentual }: { variacao: number; percentual: number }) {
  if (Math.abs(variacao) < 0.01) {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
        <Minus className="h-3 w-3" /> —
      </span>
    );
  }
  const isOver = variacao > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${isOver ? "text-red-600" : "text-green-600"}`}>
      {isOver ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {formatCurrency(Math.abs(variacao))}
      <span className="text-[10px] opacity-70">({formatPercent(percentual)})</span>
    </span>
  );
}

function VariacaoBadge({ percentual }: { percentual: number }) {
  if (percentual === 0) return <Badge variant="outline" className="text-xs">Sem exec.</Badge>;
  if (percentual <= 80) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">Abaixo</Badge>;
  if (percentual <= 100) return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">No alvo</Badge>;
  if (percentual <= 120) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">Atenção</Badge>;
  return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs">Acima</Badge>;
}

// Barra de progresso visual para % execução
function ProgressBar({ percentual }: { percentual: number }) {
  const width = Math.min(percentual, 150);
  let bgColor = "bg-green-500";
  if (percentual > 120) bgColor = "bg-red-500";
  else if (percentual > 100) bgColor = "bg-yellow-500";
  else if (percentual > 80) bgColor = "bg-blue-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${bgColor} rounded-full transition-all`} style={{ width: `${Math.min(width, 100)}%` }} />
      </div>
      <span className="text-xs font-medium w-12 text-right">{formatPercent(percentual)}</span>
    </div>
  );
}

export default function RelatorioOrcamentario({ empresaId, ano }: RelatorioOrcamentarioProps) {
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());
  const [mesAtual, setMesAtual] = useState<number>(Math.min(new Date().getMonth(), 11));
  const [viewMode, setViewMode] = useState<"mensal" | "anual" | "evolucao">("mensal");
  const [versaoSelecionada, setVersaoSelecionada] = useState<string>("auto");
  const printRef = useRef<HTMLDivElement>(null);

  const { data: versoes } = trpc.orcamento.listarVersoes.useQuery({ empresaId, ano });

  const { data: relatorio, isLoading } = trpc.orcamento.getRelatorioDetalhado.useQuery({
    empresaId,
    ano,
    categoriaId: categoriaFiltro !== "todas" ? Number(categoriaFiltro) : undefined,
    versaoId: versaoSelecionada !== "auto" ? Number(versaoSelecionada) : undefined,
  });

  const { data: categorias } = trpc.orcamento.getCategorias.useQuery();

  const toggleCat = (catId: number) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const expandAll = () => {
    if (relatorio?.categorias) {
      setExpandedCats(new Set(relatorio.categorias.map((c: any) => c.categoriaId)));
    }
  };

  const collapseAll = () => setExpandedCats(new Set());

  const prevMes = () => setMesAtual(prev => Math.max(0, prev - 1));
  const nextMes = () => setMesAtual(prev => Math.min(11, prev + 1));

  // Dados para gráfico do mês selecionado (por categoria)
  const chartMesData = useMemo(() => {
    if (!relatorio?.categorias) return [];
    return relatorio.categorias
      .map((cat: any) => ({
        nome: cat.categoriaNome.length > 25 ? cat.categoriaNome.slice(0, 23) + "..." : cat.categoriaNome,
        Previsto: cat.meses[mesAtual].planejado,
        Executado: cat.meses[mesAtual].executado,
      }))
      .filter((d: any) => d.Previsto > 0 || d.Executado > 0);
  }, [relatorio, mesAtual]);

  // Dados para gráfico de evolução mensal
  const chartEvolucao = useMemo(() => {
    if (!relatorio?.totais?.meses) return [];
    let acumPrev = 0;
    let acumExec = 0;
    return relatorio.totais.meses.map((m: any, i: number) => {
      acumPrev += m.planejado;
      acumExec += m.executado;
      return {
        mes: MESES_CURTOS[i],
        Previsto: m.planejado,
        Executado: m.executado,
        "Prev. Acum.": acumPrev,
        "Exec. Acum.": acumExec,
      };
    });
  }, [relatorio]);

  // Totais do mês selecionado
  const totaisMes = useMemo(() => {
    if (!relatorio?.totais?.meses) return null;
    return relatorio.totais.meses[mesAtual];
  }, [relatorio, mesAtual]);

  // Acumulado até o mês selecionado
  const acumuladoAteMes = useMemo(() => {
    if (!relatorio?.totais?.meses) return null;
    let prevAcum = 0;
    let execAcum = 0;
    for (let i = 0; i <= mesAtual; i++) {
      prevAcum += relatorio.totais.meses[i].planejado;
      execAcum += relatorio.totais.meses[i].executado;
    }
    const variacao = execAcum - prevAcum;
    const percentual = prevAcum > 0 ? (execAcum / prevAcum) * 100 : 0;
    return { prevAcum, execAcum, variacao, percentual };
  }, [relatorio, mesAtual]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!relatorio?.versaoId) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma versão orçamentária encontrada</h3>
          <p className="text-muted-foreground">
            Crie uma versão orçamentária para o ano {ano} para gerar o relatório.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4" ref={printRef}>
      {/* Header com filtros */}
      <Card className="print:shadow-none print:border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatório Detalhado — Previsto vs Executado
              </CardTitle>
              <CardDescription className="mt-1">
                Versão: {relatorio.versaoNome} | Ano: {ano}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" /> Imprimir
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="print:hidden">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Seletor de visão */}
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Detalhamento Mensal</SelectItem>
                  <SelectItem value="anual">Resumo Anual</SelectItem>
                  <SelectItem value="evolucao">Evolução Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Seletor de versão */}
            {versoes && versoes.length > 1 && (
              <div className="flex items-center gap-2">
                <Select value={versaoSelecionada} onValueChange={setVersaoSelecionada}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Versão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Versão ativa (automático)</SelectItem>
                    {(versoes as any[]).map((v: any) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        v{v.numeroVersao} — {v.nomeVersao} ({v.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {/* Filtro de categoria */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {(categorias as any[])?.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-1 ml-auto">
              <Button variant="ghost" size="sm" onClick={expandAll}>Expandir tudo</Button>
              <Button variant="ghost" size="sm" onClick={collapseAll}>Recolher tudo</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* VISÃO MENSAL DETALHADA */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === "mensal" && (
        <>
          {/* Navegação entre meses */}
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={prevMes} disabled={mesAtual === 0}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <span className="text-lg font-bold">{MESES_NOMES[mesAtual]} {ano}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={nextMes} disabled={mesAtual === 11}>
                  Próximo <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              {/* Mini navegação rápida */}
              <div className="flex justify-center gap-1 mt-2">
                {MESES_CURTOS.map((m, i) => (
                  <Button
                    key={i}
                    variant={i === mesAtual ? "default" : "ghost"}
                    size="sm"
                    className={`h-7 px-2 text-xs ${i === mesAtual ? "bg-orange-600 hover:bg-orange-700" : ""}`}
                    onClick={() => setMesAtual(i)}
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cards de Totais do Mês */}
          {totaisMes && acumuladoAteMes && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              <Card>
                <CardContent className="pt-3 pb-3">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Previsto no Mês</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(totaisMes.planejado)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-3 pb-3">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Executado no Mês</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(totaisMes.executado)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-3 pb-3">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Variação no Mês</p>
                  <p className={`text-lg font-bold ${totaisMes.variacao > 0 ? "text-red-600" : "text-green-600"}`}>
                    {totaisMes.variacao > 0 ? "+" : ""}{formatCurrency(totaisMes.variacao)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-3 pb-3">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Previsto Acum.</p>
                  <p className="text-lg font-bold text-blue-500">{formatCurrency(acumuladoAteMes.prevAcum)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-3 pb-3">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Executado Acum.</p>
                  <p className="text-lg font-bold text-green-500">{formatCurrency(acumuladoAteMes.execAcum)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-3 pb-3">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">% Exec. Mês</p>
                  <ProgressBar percentual={totaisMes.percentual} />
                  <VariacaoBadge percentual={totaisMes.percentual} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Gráfico do mês por categoria */}
          {chartMesData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Previsto vs Executado — {MESES_NOMES[mesAtual]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={Math.max(200, chartMesData.length * 35)}>
                  <BarChart data={chartMesData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="nome" width={180} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="Previsto" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Executado" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Tabela detalhada do mês com subcategorias */}
          <Card className="print:break-before-page">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Detalhamento por Categoria e Subcategoria — {MESES_NOMES[mesAtual]} {ano}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[320px] font-bold">Categoria / Subcategoria</TableHead>
                      <TableHead className="text-right font-bold w-[130px]">Previsto</TableHead>
                      <TableHead className="text-right font-bold w-[130px]">Executado</TableHead>
                      <TableHead className="text-right font-bold w-[160px]">Variação (R$)</TableHead>
                      <TableHead className="text-center font-bold w-[100px]">% Exec.</TableHead>
                      <TableHead className="text-center font-bold w-[80px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatorio.categorias.map((cat: any) => {
                      const isExpanded = expandedCats.has(cat.categoriaId);
                      const catPlan = cat.meses[mesAtual].planejado;
                      const catExec = cat.meses[mesAtual].executado;
                      const catVar = catExec - catPlan;
                      const catPct = catPlan > 0 ? (catExec / catPlan) * 100 : (catExec > 0 ? 100 : 0);

                      // Pular categorias sem valores no mês
                      if (catPlan === 0 && catExec === 0) return null;

                      return (
                        <>{/* Fragment */}
                          <TableRow
                            key={`cat-${cat.categoriaId}`}
                            className="cursor-pointer hover:bg-muted/30 font-semibold bg-muted/20"
                            onClick={() => toggleCat(cat.categoriaId)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                                <span>{cat.categoriaNome}</span>
                                <span className="text-xs text-muted-foreground font-normal">({cat.subcategorias.length})</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(catPlan)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(catExec)}</TableCell>
                            <TableCell className="text-right">
                              <VariacaoIndicator variacao={catVar} percentual={catPct} />
                            </TableCell>
                            <TableCell className="text-center">
                              <ProgressBar percentual={catPct} />
                            </TableCell>
                            <TableCell className="text-center">
                              <VariacaoBadge percentual={catPct} />
                            </TableCell>
                          </TableRow>
                          {isExpanded && cat.subcategorias.map((sub: any) => {
                            const subPlan = sub.meses[mesAtual].planejado;
                            const subExec = sub.meses[mesAtual].executado;
                            const subVar = subExec - subPlan;
                            const subPct = subPlan > 0 ? (subExec / subPlan) * 100 : (subExec > 0 ? 100 : 0);

                            if (subPlan === 0 && subExec === 0) return null;

                            return (
                              <TableRow key={`sub-${sub.subcategoriaId}`} className="text-sm hover:bg-muted/10">
                                <TableCell className="pl-10 text-muted-foreground">{sub.subcategoriaNome}</TableCell>
                                <TableCell className="text-right">{formatCurrencyCompact(subPlan)}</TableCell>
                                <TableCell className="text-right">{formatCurrencyCompact(subExec)}</TableCell>
                                <TableCell className="text-right">
                                  <VariacaoIndicator variacao={subVar} percentual={subPct} />
                                </TableCell>
                                <TableCell className="text-center">
                                  <ProgressBar percentual={subPct} />
                                </TableCell>
                                <TableCell className="text-center">
                                  <VariacaoBadge percentual={subPct} />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </>
                      );
                    })}
                    {/* Linha de totais */}
                    {totaisMes && (
                      <TableRow className="font-bold bg-muted/40 border-t-2">
                        <TableCell>TOTAL — {MESES_NOMES[mesAtual].toUpperCase()}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totaisMes.planejado)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totaisMes.executado)}</TableCell>
                        <TableCell className="text-right">
                          <VariacaoIndicator variacao={totaisMes.variacao} percentual={totaisMes.percentual} />
                        </TableCell>
                        <TableCell className="text-center">
                          <ProgressBar percentual={totaisMes.percentual} />
                        </TableCell>
                        <TableCell className="text-center">
                          <VariacaoBadge percentual={totaisMes.percentual} />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* VISÃO ANUAL (RESUMO) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === "anual" && (
        <>
          {/* Cards de Totais Anuais */}
          {relatorio.totais && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-sm text-muted-foreground">Total Previsto Anual</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(relatorio.totais.totalPlanejado)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-sm text-muted-foreground">Total Executado</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(relatorio.totais.totalExecutado)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-sm text-muted-foreground">Variação</p>
                  <p className={`text-xl font-bold ${relatorio.totais.totalVariacao > 0 ? "text-red-600" : "text-green-600"}`}>
                    {relatorio.totais.totalVariacao > 0 ? "+" : ""}{formatCurrency(relatorio.totais.totalVariacao)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-sm text-muted-foreground">% Execução</p>
                  <p className="text-xl font-bold">{formatPercent(relatorio.totais.totalPercentual)}</p>
                  <VariacaoBadge percentual={relatorio.totais.totalPercentual} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabela anual com todas categorias e subcategorias */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Detalhamento Anual por Categoria e Subcategoria</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[300px] font-bold">Categoria / Subcategoria</TableHead>
                      <TableHead className="text-right font-bold">Previsto Anual</TableHead>
                      <TableHead className="text-right font-bold">Executado</TableHead>
                      <TableHead className="text-right font-bold">Variação (R$)</TableHead>
                      <TableHead className="text-center font-bold">% Exec.</TableHead>
                      <TableHead className="text-center font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatorio.categorias.map((cat: any) => {
                      const isExpanded = expandedCats.has(cat.categoriaId);
                      return (
                        <>
                          <TableRow
                            key={`cat-${cat.categoriaId}`}
                            className="cursor-pointer hover:bg-muted/30 font-semibold bg-muted/20"
                            onClick={() => toggleCat(cat.categoriaId)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                                <span>{cat.categoriaNome}</span>
                                <span className="text-xs text-muted-foreground font-normal">({cat.subcategorias.length})</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(cat.totalPlanejado)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(cat.totalExecutado)}</TableCell>
                            <TableCell className="text-right">
                              <VariacaoIndicator variacao={cat.totalVariacao} percentual={cat.totalPercentual} />
                            </TableCell>
                            <TableCell className="text-center">
                              <ProgressBar percentual={cat.totalPercentual} />
                            </TableCell>
                            <TableCell className="text-center">
                              <VariacaoBadge percentual={cat.totalPercentual} />
                            </TableCell>
                          </TableRow>
                          {isExpanded && cat.subcategorias.map((sub: any) => (
                            <TableRow key={`sub-${sub.subcategoriaId}`} className="text-sm hover:bg-muted/10">
                              <TableCell className="pl-10 text-muted-foreground">{sub.subcategoriaNome}</TableCell>
                              <TableCell className="text-right">{formatCurrency(sub.totalPlanejado)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(sub.totalExecutado)}</TableCell>
                              <TableCell className="text-right">
                                <VariacaoIndicator variacao={sub.totalVariacao} percentual={sub.totalPercentual} />
                              </TableCell>
                              <TableCell className="text-center">
                                <ProgressBar percentual={sub.totalPercentual} />
                              </TableCell>
                              <TableCell className="text-center">
                                <VariacaoBadge percentual={sub.totalPercentual} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </>
                      );
                    })}
                    {relatorio.totais && (
                      <TableRow className="font-bold bg-muted/40 border-t-2">
                        <TableCell>TOTAL GERAL — {ano}</TableCell>
                        <TableCell className="text-right">{formatCurrency(relatorio.totais.totalPlanejado)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(relatorio.totais.totalExecutado)}</TableCell>
                        <TableCell className="text-right">
                          <VariacaoIndicator variacao={relatorio.totais.totalVariacao} percentual={relatorio.totais.totalPercentual} />
                        </TableCell>
                        <TableCell className="text-center">
                          <ProgressBar percentual={relatorio.totais.totalPercentual} />
                        </TableCell>
                        <TableCell className="text-center">
                          <VariacaoBadge percentual={relatorio.totais.totalPercentual} />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* VISÃO EVOLUÇÃO MENSAL */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === "evolucao" && (
        <>
          {/* Gráfico de evolução mensal */}
          {chartEvolucao.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Evolução Mensal — Previsto vs Executado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartEvolucao}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="Previsto" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Executado" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Tabela de evolução mês a mês por categoria */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Evolução Mensal por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[200px] font-bold sticky left-0 bg-muted/50 z-10">Categoria</TableHead>
                      <TableHead className="text-center font-bold w-[60px] text-[10px]">Tipo</TableHead>
                      {MESES_CURTOS.map(m => (
                        <TableHead key={m} className="text-center font-bold min-w-[100px] text-xs">{m}</TableHead>
                      ))}
                      <TableHead className="text-right font-bold min-w-[110px]">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatorio.categorias.map((cat: any) => (
                      <>
                        <TableRow key={`cat-prev-${cat.categoriaId}`} className="bg-blue-50/40">
                          <TableCell className="font-semibold sticky left-0 bg-blue-50/40 z-10 text-sm" rowSpan={1}>
                            {cat.categoriaNome}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-[10px] text-blue-600 font-medium">Prev.</span>
                          </TableCell>
                          {cat.meses.map((m: any, i: number) => (
                            <TableCell key={i} className="text-right text-[11px]">
                              {formatCurrencyCompact(m.planejado)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-semibold text-xs">{formatCurrency(cat.totalPlanejado)}</TableCell>
                        </TableRow>
                        <TableRow key={`cat-exec-${cat.categoriaId}`} className="bg-green-50/40">
                          <TableCell className="sticky left-0 bg-green-50/40 z-10" />
                          <TableCell className="text-center">
                            <span className="text-[10px] text-green-600 font-medium">Exec.</span>
                          </TableCell>
                          {cat.meses.map((m: any, i: number) => (
                            <TableCell key={i} className="text-right text-[11px]">
                              {formatCurrencyCompact(m.executado)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right font-semibold text-xs">{formatCurrency(cat.totalExecutado)}</TableCell>
                        </TableRow>
                        <TableRow key={`cat-var-${cat.categoriaId}`} className="border-b-2">
                          <TableCell className="sticky left-0 bg-background z-10" />
                          <TableCell className="text-center">
                            <span className="text-[10px] text-muted-foreground font-medium">Var.</span>
                          </TableCell>
                          {cat.meses.map((m: any, i: number) => (
                            <TableCell key={i} className="text-right">
                              <VariacaoIndicator variacao={m.variacao} percentual={m.percentual} />
                            </TableCell>
                          ))}
                          <TableCell className="text-right">
                            <VariacaoIndicator variacao={cat.totalVariacao} percentual={cat.totalPercentual} />
                          </TableCell>
                        </TableRow>
                      </>
                    ))}
                    {/* Totais gerais */}
                    {relatorio.totais && (
                      <>
                        <TableRow className="font-bold bg-blue-100/50">
                          <TableCell className="sticky left-0 bg-blue-100/50 z-10">TOTAL GERAL</TableCell>
                          <TableCell className="text-center"><span className="text-[10px] text-blue-600">Prev.</span></TableCell>
                          {relatorio.totais.meses.map((m: any, i: number) => (
                            <TableCell key={i} className="text-right text-[11px]">{formatCurrency(m.planejado)}</TableCell>
                          ))}
                          <TableCell className="text-right">{formatCurrency(relatorio.totais.totalPlanejado)}</TableCell>
                        </TableRow>
                        <TableRow className="font-bold bg-green-100/50">
                          <TableCell className="sticky left-0 bg-green-100/50 z-10" />
                          <TableCell className="text-center"><span className="text-[10px] text-green-600">Exec.</span></TableCell>
                          {relatorio.totais.meses.map((m: any, i: number) => (
                            <TableCell key={i} className="text-right text-[11px]">{formatCurrency(m.executado)}</TableCell>
                          ))}
                          <TableCell className="text-right">{formatCurrency(relatorio.totais.totalExecutado)}</TableCell>
                        </TableRow>
                        <TableRow className="font-bold border-t-2">
                          <TableCell className="sticky left-0 bg-background z-10" />
                          <TableCell className="text-center"><span className="text-[10px] text-muted-foreground">Var.</span></TableCell>
                          {relatorio.totais.meses.map((m: any, i: number) => (
                            <TableCell key={i} className="text-right">
                              <VariacaoIndicator variacao={m.variacao} percentual={m.percentual} />
                            </TableCell>
                          ))}
                          <TableCell className="text-right">
                            <VariacaoIndicator variacao={relatorio.totais.totalVariacao} percentual={relatorio.totais.totalPercentual} />
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
