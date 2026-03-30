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
  ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus,
  FileText, Printer, Filter, BarChart3, AlertTriangle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

interface RelatorioOrcamentarioProps {
  empresaId: number;
  ano: number;
}

const MESES_NOMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatCurrency(value: number) {
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

export default function RelatorioOrcamentario({ empresaId, ano }: RelatorioOrcamentarioProps) {
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"resumo" | "mensal">("resumo");
  const [mesSelecionado, setMesSelecionado] = useState<string>("todos");
  const printRef = useRef<HTMLDivElement>(null);

  const { data: relatorio, isLoading } = trpc.orcamento.getRelatorioDetalhado.useQuery({
    empresaId,
    ano,
    categoriaId: categoriaFiltro !== "todas" ? Number(categoriaFiltro) : undefined,
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

  // Dados para gráfico de barras por categoria
  const chartData = useMemo(() => {
    if (!relatorio?.categorias) return [];
    return relatorio.categorias.map((cat: any) => ({
      nome: cat.categoriaNome.length > 20 ? cat.categoriaNome.slice(0, 18) + "..." : cat.categoriaNome,
      Planejado: cat.totalPlanejado,
      Executado: cat.totalExecutado,
    }));
  }, [relatorio]);

  // Dados mensais para gráfico
  const chartMensal = useMemo(() => {
    if (!relatorio?.totais?.meses) return [];
    return relatorio.totais.meses.map((m: any) => ({
      mes: m.mes,
      Planejado: m.planejado,
      Executado: m.executado,
    }));
  }, [relatorio]);

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

  const mesIdx = mesSelecionado !== "todos" ? Number(mesSelecionado) : -1;

  return (
    <div className="space-y-6 print:space-y-4" ref={printRef}>
      {/* Header com filtros */}
      <Card className="print:shadow-none print:border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatório Detalhado — Planejado vs Executado
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
            <div className="flex items-center gap-2">
              <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os meses</SelectItem>
                  {MESES_NOMES.map((m, i) => (
                    <SelectItem key={i} value={String(i)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resumo">Visão Resumida</SelectItem>
                  <SelectItem value="mensal">Visão Mensal</SelectItem>
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

      {/* Cards de Totais */}
      {relatorio.totais && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-muted-foreground">Total Planejado</p>
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

      {/* Gráfico comparativo por categoria */}
      {chartData.length > 0 && (
        <Card className="print:break-before-page">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Comparativo por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(250, chartData.length * 40)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="nome" width={160} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="Planejado" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Executado" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tabela detalhada */}
      <Card className="print:break-before-page">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {viewMode === "resumo" ? "Detalhamento por Categoria e Subcategoria" : "Detalhamento Mensal"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {viewMode === "resumo" ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[300px] font-bold">Categoria / Subcategoria</TableHead>
                    <TableHead className="text-right font-bold">Planejado</TableHead>
                    <TableHead className="text-right font-bold">Executado</TableHead>
                    <TableHead className="text-right font-bold">Variação (R$)</TableHead>
                    <TableHead className="text-right font-bold">% Exec.</TableHead>
                    <TableHead className="text-center font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatorio.categorias.map((cat: any) => {
                    const isExpanded = expandedCats.has(cat.categoriaId);
                    // Se mês selecionado, filtrar valores
                    const catPlan = mesIdx >= 0 ? cat.meses[mesIdx].planejado : cat.totalPlanejado;
                    const catExec = mesIdx >= 0 ? cat.meses[mesIdx].executado : cat.totalExecutado;
                    const catVar = catExec - catPlan;
                    const catPct = catPlan > 0 ? (catExec / catPlan) * 100 : (catExec > 0 ? 100 : 0);

                    return (
                      <>{/* Fragment for category + subcategories */}
                        <TableRow
                          key={`cat-${cat.categoriaId}`}
                          className="cursor-pointer hover:bg-muted/30 font-semibold bg-muted/20"
                          onClick={() => toggleCat(cat.categoriaId)}
                        >
                          <TableCell className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            {cat.categoriaNome}
                            <span className="text-xs text-muted-foreground font-normal">({cat.subcategorias.length})</span>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(catPlan)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(catExec)}</TableCell>
                          <TableCell className="text-right">
                            <VariacaoIndicator variacao={catVar} percentual={catPct} />
                          </TableCell>
                          <TableCell className="text-right">{formatPercent(catPct)}</TableCell>
                          <TableCell className="text-center">
                            <VariacaoBadge percentual={catPct} />
                          </TableCell>
                        </TableRow>
                        {isExpanded && cat.subcategorias.map((sub: any) => {
                          const subPlan = mesIdx >= 0 ? sub.meses[mesIdx].planejado : sub.totalPlanejado;
                          const subExec = mesIdx >= 0 ? sub.meses[mesIdx].executado : sub.totalExecutado;
                          const subVar = subExec - subPlan;
                          const subPct = subPlan > 0 ? (subExec / subPlan) * 100 : (subExec > 0 ? 100 : 0);
                          return (
                            <TableRow key={`sub-${sub.subcategoriaId}`} className="text-sm">
                              <TableCell className="pl-10 text-muted-foreground">{sub.subcategoriaNome}</TableCell>
                              <TableCell className="text-right">{formatCurrency(subPlan)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(subExec)}</TableCell>
                              <TableCell className="text-right">
                                <VariacaoIndicator variacao={subVar} percentual={subPct} />
                              </TableCell>
                              <TableCell className="text-right">{formatPercent(subPct)}</TableCell>
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
                  {relatorio.totais && (
                    <TableRow className="font-bold bg-muted/40 border-t-2">
                      <TableCell>TOTAL GERAL</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(mesIdx >= 0 ? relatorio.totais.meses[mesIdx].planejado : relatorio.totais.totalPlanejado)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(mesIdx >= 0 ? relatorio.totais.meses[mesIdx].executado : relatorio.totais.totalExecutado)}
                      </TableCell>
                      <TableCell className="text-right">
                        <VariacaoIndicator
                          variacao={mesIdx >= 0 ? relatorio.totais.meses[mesIdx].variacao : relatorio.totais.totalVariacao}
                          percentual={mesIdx >= 0 ? relatorio.totais.meses[mesIdx].percentual : relatorio.totais.totalPercentual}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercent(mesIdx >= 0 ? relatorio.totais.meses[mesIdx].percentual : relatorio.totais.totalPercentual)}
                      </TableCell>
                      <TableCell className="text-center">
                        <VariacaoBadge percentual={mesIdx >= 0 ? relatorio.totais.meses[mesIdx].percentual : relatorio.totais.totalPercentual} />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              /* Visão Mensal */
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[200px] font-bold sticky left-0 bg-muted/50 z-10">Categoria</TableHead>
                    {MESES_NOMES.map(m => (
                      <TableHead key={m} className="text-center font-bold min-w-[120px]" colSpan={1}>
                        {m}
                      </TableHead>
                    ))}
                    <TableHead className="text-right font-bold min-w-[120px]">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatorio.categorias.map((cat: any) => (
                    <>
                      {/* Planejado row */}
                      <TableRow key={`cat-plan-${cat.categoriaId}`} className="bg-blue-50/50">
                        <TableCell className="font-semibold sticky left-0 bg-blue-50/50 z-10">
                          <span className="text-xs text-blue-600 block">Planejado</span>
                          {cat.categoriaNome}
                        </TableCell>
                        {cat.meses.map((m: any, i: number) => (
                          <TableCell key={i} className="text-right text-xs">
                            {formatCurrency(m.planejado)}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-semibold">{formatCurrency(cat.totalPlanejado)}</TableCell>
                      </TableRow>
                      {/* Executado row */}
                      <TableRow key={`cat-exec-${cat.categoriaId}`} className="bg-green-50/50">
                        <TableCell className="sticky left-0 bg-green-50/50 z-10">
                          <span className="text-xs text-green-600">Executado</span>
                        </TableCell>
                        {cat.meses.map((m: any, i: number) => (
                          <TableCell key={i} className="text-right text-xs">
                            {formatCurrency(m.executado)}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-semibold">{formatCurrency(cat.totalExecutado)}</TableCell>
                      </TableRow>
                      {/* Variação row */}
                      <TableRow key={`cat-var-${cat.categoriaId}`} className="border-b-2">
                        <TableCell className="sticky left-0 bg-background z-10">
                          <span className="text-xs text-muted-foreground">Variação</span>
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
                        <TableCell className="sticky left-0 bg-blue-100/50 z-10">
                          <span className="text-xs text-blue-600 block">Planejado</span>
                          TOTAL GERAL
                        </TableCell>
                        {relatorio.totais.meses.map((m: any, i: number) => (
                          <TableCell key={i} className="text-right text-xs">{formatCurrency(m.planejado)}</TableCell>
                        ))}
                        <TableCell className="text-right">{formatCurrency(relatorio.totais.totalPlanejado)}</TableCell>
                      </TableRow>
                      <TableRow className="font-bold bg-green-100/50">
                        <TableCell className="sticky left-0 bg-green-100/50 z-10">
                          <span className="text-xs text-green-600">Executado</span>
                        </TableCell>
                        {relatorio.totais.meses.map((m: any, i: number) => (
                          <TableCell key={i} className="text-right text-xs">{formatCurrency(m.executado)}</TableCell>
                        ))}
                        <TableCell className="text-right">{formatCurrency(relatorio.totais.totalExecutado)}</TableCell>
                      </TableRow>
                      <TableRow className="font-bold border-t-2">
                        <TableCell className="sticky left-0 bg-background z-10">
                          <span className="text-xs text-muted-foreground">Variação</span>
                        </TableCell>
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
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
