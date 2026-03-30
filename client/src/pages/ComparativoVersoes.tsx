import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowRight, ArrowUpRight, ArrowDownRight, Minus, GitCompare,
  Plus, Trash2, Edit3, Printer, ChevronDown, ChevronRight
} from "lucide-react";

interface ComparativoVersoesProps {
  empresaId: number;
  ano: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

const STATUS_CONFIG = {
  inalterado: { color: "bg-gray-100 text-gray-600", icon: Minus, label: "Inalterado" },
  alterado: { color: "bg-blue-100 text-blue-700", icon: Edit3, label: "Alterado" },
  adicionado: { color: "bg-green-100 text-green-700", icon: Plus, label: "Adicionado" },
  removido: { color: "bg-red-100 text-red-700", icon: Trash2, label: "Removido" },
};

const VERSAO_STATUS_CONFIG: Record<string, string> = {
  rascunho: "bg-gray-100 text-gray-600",
  em_revisao: "bg-yellow-100 text-yellow-700",
  aprovado: "bg-green-100 text-green-700",
  congelado: "bg-blue-100 text-blue-700",
};

const MESES_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function ComparativoVersoes({ empresaId, ano }: ComparativoVersoesProps) {
  const [versaoIdA, setVersaoIdA] = useState<string>("");
  const [versaoIdB, setVersaoIdB] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());
  const [showMeses, setShowMeses] = useState(false);

  const { data: versoes } = trpc.orcamento.listarVersoes.useQuery({ empresaId, ano });

  const { data: comparativo, isLoading } = trpc.orcamento.compararVersoes.useQuery(
    { versaoIdA: Number(versaoIdA), versaoIdB: Number(versaoIdB) },
    { enabled: !!versaoIdA && !!versaoIdB && versaoIdA !== versaoIdB }
  );

  const itensFiltrados = useMemo(() => {
    if (!comparativo?.itens) return [];
    if (filtroStatus === "todos") return comparativo.itens;
    return comparativo.itens.filter((i: any) => i.status === filtroStatus);
  }, [comparativo, filtroStatus]);

  // Agrupar por categoria
  const porCategoria = useMemo(() => {
    const map = new Map<number, { nome: string; itens: any[] }>();
    for (const item of itensFiltrados) {
      if (!map.has(item.categoriaId)) {
        map.set(item.categoriaId, { nome: item.categoriaNome, itens: [] });
      }
      map.get(item.categoriaId)!.itens.push(item);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].nome.localeCompare(b[1].nome));
  }, [itensFiltrados]);

  const toggleCat = (catId: number) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <GitCompare className="h-5 w-5 text-orange-500" />
        <h2 className="text-xl font-bold">Comparativo entre Versões — {ano}</h2>
      </div>

      {/* Seletores de versão */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Versão Base (Original)</label>
              <Select value={versaoIdA} onValueChange={setVersaoIdA}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a versão base..." />
                </SelectTrigger>
                <SelectContent>
                  {versoes?.map((v: any) => (
                    <SelectItem key={v.id} value={String(v.id)} disabled={String(v.id) === versaoIdB}>
                      v{v.numeroVersao} — {v.nomeVersao} ({v.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground mt-5" />

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Versão Revisada</label>
              <Select value={versaoIdB} onValueChange={setVersaoIdB}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a versão revisada..." />
                </SelectTrigger>
                <SelectContent>
                  {versoes?.map((v: any) => (
                    <SelectItem key={v.id} value={String(v.id)} disabled={String(v.id) === versaoIdA}>
                      v{v.numeroVersao} — {v.nomeVersao} ({v.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo do comparativo */}
      {!versaoIdA || !versaoIdB || versaoIdA === versaoIdB ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <GitCompare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Selecione duas versões diferentes</h3>
            <p className="text-muted-foreground">
              Escolha a versão base (original) e a versão revisada para ver as diferenças lado a lado.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="h-24 animate-pulse bg-muted/30" /></Card>
          ))}
        </div>
      ) : comparativo ? (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <Card className="border-l-4 border-l-gray-400">
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-muted-foreground">Versão Base</p>
                <p className="text-sm font-bold">{comparativo.versaoA.nome}</p>
                <Badge className={`mt-1 text-xs ${VERSAO_STATUS_CONFIG[comparativo.versaoA.status] ?? ""}`}>
                  {comparativo.versaoA.status}
                </Badge>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-muted-foreground">Versão Revisada</p>
                <p className="text-sm font-bold">{comparativo.versaoB.nome}</p>
                <Badge className={`mt-1 text-xs ${VERSAO_STATUS_CONFIG[comparativo.versaoB.status] ?? ""}`}>
                  {comparativo.versaoB.status}
                </Badge>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-muted-foreground">Total Base</p>
                <p className="text-sm font-bold">{formatCurrency(comparativo.resumo.totalVersaoA)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-muted-foreground">Total Revisada</p>
                <p className="text-sm font-bold">{formatCurrency(comparativo.resumo.totalVersaoB)}</p>
              </CardContent>
            </Card>
            <Card className={`border-l-4 ${comparativo.resumo.diferencaTotal > 0 ? "border-l-red-500" : "border-l-green-500"}`}>
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-muted-foreground">Diferença</p>
                <p className={`text-sm font-bold ${comparativo.resumo.diferencaTotal > 0 ? "text-red-600" : "text-green-600"}`}>
                  {formatCurrency(comparativo.resumo.diferencaTotal)}
                </p>
                <p className="text-xs text-muted-foreground">{formatPercent(comparativo.resumo.percentualVariacao)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-400">
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-muted-foreground">Alterados</p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-blue-600 text-xs">{comparativo.resumo.itensAlterados} alt</Badge>
                  <Badge variant="outline" className="text-green-600 text-xs">{comparativo.resumo.itensAdicionados} add</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-gray-300">
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-muted-foreground">Sem Mudança</p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-gray-600 text-xs">{comparativo.resumo.itensInalterados} inal</Badge>
                  <Badge variant="outline" className="text-red-600 text-xs">{comparativo.resumo.itensRemovidos} rem</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros e opções */}
          <div className="flex items-center gap-3">
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os itens</SelectItem>
                <SelectItem value="alterado">Alterados</SelectItem>
                <SelectItem value="adicionado">Adicionados</SelectItem>
                <SelectItem value="removido">Removidos</SelectItem>
                <SelectItem value="inalterado">Inalterados</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setShowMeses(!showMeses)}>
              {showMeses ? "Ocultar Meses" : "Mostrar Meses"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1" /> Imprimir
            </Button>
          </div>

          {/* Tabela de comparativo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhamento das Diferenças</CardTitle>
              <CardDescription>
                {itensFiltrados.length} itens exibidos — clique na categoria para expandir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left py-2 px-3 font-semibold">Item</th>
                      <th className="text-center py-2 px-2 font-semibold w-24">Status</th>
                      <th className="text-right py-2 px-3 font-semibold">Base</th>
                      <th className="text-right py-2 px-3 font-semibold">Revisada</th>
                      <th className="text-right py-2 px-3 font-semibold">Diferença</th>
                      <th className="text-right py-2 px-3 font-semibold w-16">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {porCategoria.map(([catId, cat]) => {
                      const isExpanded = expandedCats.has(catId);
                      const catTotalA = cat.itens.reduce((a: number, i: any) => a + i.versaoA.total, 0);
                      const catTotalB = cat.itens.reduce((a: number, i: any) => a + i.versaoB.total, 0);
                      const catDiff = catTotalB - catTotalA;
                      const catPercent = catTotalA > 0 ? ((catDiff / catTotalA) * 100) : (catTotalB > 0 ? 100 : 0);
                      const hasChanges = cat.itens.some((i: any) => i.status !== "inalterado");

                      return (
                        <React.Fragment key={catId}>
                          <tr
                            className={`border-b cursor-pointer hover:bg-muted/20 transition-colors ${hasChanges ? "bg-muted/10" : ""}`}
                            onClick={() => toggleCat(catId)}
                          >
                            <td className="py-2 px-3 font-bold flex items-center gap-1">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              {cat.nome}
                              <span className="text-xs text-muted-foreground font-normal ml-1">({cat.itens.length})</span>
                              {hasChanges && <Badge variant="outline" className="text-blue-600 text-xs ml-1">alterações</Badge>}
                            </td>
                            <td />
                            <td className="text-right py-2 px-3 font-bold">{formatCurrency(catTotalA)}</td>
                            <td className="text-right py-2 px-3 font-bold">{formatCurrency(catTotalB)}</td>
                            <td className={`text-right py-2 px-3 font-bold ${catDiff > 0 ? "text-red-600" : catDiff < 0 ? "text-green-600" : ""}`}>
                              {formatCurrency(catDiff)}
                            </td>
                            <td className={`text-right py-2 px-3 font-bold ${catDiff > 0 ? "text-red-600" : catDiff < 0 ? "text-green-600" : ""}`}>
                              {Math.abs(catDiff) > 0.01 ? formatPercent(catPercent) : "—"}
                            </td>
                          </tr>
                          {isExpanded && cat.itens.map((item: any, idx: number) => {
                            const config = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
                            const Icon = config.icon;
                            const diffPercent = item.versaoA.total > 0 ? ((item.diferencas.total / item.versaoA.total) * 100) : (item.versaoB.total > 0 ? 100 : 0);

                            return (
                              <React.Fragment key={idx}>
                                <tr className={`border-b border-dashed hover:bg-muted/5 ${item.status !== "inalterado" ? "bg-blue-50/30" : ""}`}>
                                  <td className="py-1.5 px-3 pl-10 text-muted-foreground">{item.subcategoriaNome}</td>
                                  <td className="text-center py-1.5">
                                    <Badge className={`text-xs ${config.color}`}>
                                      <Icon className="h-3 w-3 mr-1" />{config.label}
                                    </Badge>
                                  </td>
                                  <td className={`text-right py-1.5 px-3 font-mono ${item.status === "removido" ? "line-through text-red-400" : ""}`}>
                                    {formatCurrency(item.versaoA.total)}
                                  </td>
                                  <td className={`text-right py-1.5 px-3 font-mono ${item.status === "adicionado" ? "text-green-600 font-bold" : ""}`}>
                                    {formatCurrency(item.versaoB.total)}
                                  </td>
                                  <td className={`text-right py-1.5 px-3 font-mono ${item.diferencas.total > 0 ? "text-red-600" : item.diferencas.total < 0 ? "text-green-600" : ""}`}>
                                    {Math.abs(item.diferencas.total) > 0.01 ? formatCurrency(item.diferencas.total) : "—"}
                                  </td>
                                  <td className={`text-right py-1.5 px-3 ${item.diferencas.total > 0 ? "text-red-600" : item.diferencas.total < 0 ? "text-green-600" : ""}`}>
                                    {Math.abs(item.diferencas.total) > 0.01 ? formatPercent(diffPercent) : "—"}
                                  </td>
                                </tr>
                                {/* Detalhamento mensal */}
                                {showMeses && item.status !== "inalterado" && (
                                  <tr className="border-b border-dashed bg-muted/5">
                                    <td colSpan={6} className="py-2 px-3 pl-14">
                                      <div className="grid grid-cols-12 gap-1 text-xs">
                                        {MESES_LABELS.map((mes, mi) => (
                                          <div key={mi} className="text-center">
                                            <p className="text-muted-foreground font-medium">{mes}</p>
                                            <p className="font-mono">{(item.versaoA.meses[mi] / 1000).toFixed(1)}k</p>
                                            <p className="font-mono">{(item.versaoB.meses[mi] / 1000).toFixed(1)}k</p>
                                            <p className={`font-mono font-bold ${item.diferencas.meses[mi] > 0 ? "text-red-500" : item.diferencas.meses[mi] < 0 ? "text-green-500" : ""}`}>
                                              {item.diferencas.meses[mi] !== 0 ? `${item.diferencas.meses[mi] > 0 ? "+" : ""}${(item.diferencas.meses[mi] / 1000).toFixed(1)}k` : "—"}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                    {/* Linha de total */}
                    {comparativo && (
                      <tr className="border-t-2 bg-muted/20 font-bold">
                        <td className="py-2 px-3">TOTAL GERAL</td>
                        <td />
                        <td className="text-right py-2 px-3">{formatCurrency(comparativo.resumo.totalVersaoA)}</td>
                        <td className="text-right py-2 px-3">{formatCurrency(comparativo.resumo.totalVersaoB)}</td>
                        <td className={`text-right py-2 px-3 ${comparativo.resumo.diferencaTotal > 0 ? "text-red-600" : "text-green-600"}`}>
                          {formatCurrency(comparativo.resumo.diferencaTotal)}
                        </td>
                        <td className={`text-right py-2 px-3 ${comparativo.resumo.diferencaTotal > 0 ? "text-red-600" : "text-green-600"}`}>
                          {formatPercent(comparativo.resumo.percentualVariacao)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
