import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle, TrendingUp, TrendingDown, Minus, DollarSign,
  Shield, Target, BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  AlertCircle, Lightbulb, Printer, ChevronDown, ChevronRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Treemap
} from "recharts";

interface AnaliseOrcamentariaProps {
  empresaId: number;
  ano: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

const COLORS_ABC = { A: "#ef4444", B: "#f59e0b", C: "#22c55e" };
const COLORS_PIE = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ec4899", "#14b8a6", "#eab308", "#6366f1"];

const SEVERIDADE_CONFIG = {
  critica: { color: "bg-red-600 text-white", icon: AlertTriangle, label: "Crítico" },
  alta: { color: "bg-red-100 text-red-800 border-red-300", icon: AlertCircle, label: "Alto" },
  media: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: AlertTriangle, label: "Médio" },
  info: { color: "bg-blue-100 text-blue-800 border-blue-300", icon: Lightbulb, label: "Info" },
};

const TENDENCIA_CONFIG = {
  crescente: { icon: TrendingUp, color: "text-red-500", label: "Crescente", bg: "bg-red-50" },
  estavel: { icon: Minus, color: "text-gray-500", label: "Estável", bg: "bg-gray-50" },
  decrescente: { icon: TrendingDown, color: "text-green-500", label: "Decrescente", bg: "bg-green-50" },
  sem_dados: { icon: Minus, color: "text-gray-400", label: "Sem dados", bg: "bg-gray-50" },
};

export default function AnaliseOrcamentaria({ empresaId, ano }: AnaliseOrcamentariaProps) {
  const [visao, setVisao] = useState("resumo");
  const [filtroNatureza, setFiltroNatureza] = useState<string>("todos");
  const [filtroClasse, setFiltroClasse] = useState<string>("todos");
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const { data, isLoading } = trpc.orcamento.getAnaliseCustos.useQuery({ empresaId, ano });

  const itensFiltrados = useMemo(() => {
    if (!data?.itens) return [];
    return data.itens.filter((item: any) => {
      if (filtroNatureza !== "todos" && item.natureza !== filtroNatureza) return false;
      if (filtroClasse !== "todos" && item.classificacaoABC !== filtroClasse) return false;
      return true;
    });
  }, [data, filtroNatureza, filtroClasse]);

  // Agrupar itens por categoria para a visão detalhada
  const itensPorCategoria = useMemo(() => {
    const map = new Map<number, { categoriaNome: string; categoriaId: number; itens: any[] }>();
    for (const item of itensFiltrados) {
      if (!map.has(item.categoriaId)) {
        map.set(item.categoriaId, { categoriaId: item.categoriaId, categoriaNome: item.categoriaNome, itens: [] });
      }
      map.get(item.categoriaId)!.itens.push(item);
    }
    return Array.from(map.values()).sort((a, b) => {
      const totalA = a.itens.reduce((s: number, i: any) => s + (i.executadoAnual > 0 ? i.executadoAnual : i.planejadoAnual), 0);
      const totalB = b.itens.reduce((s: number, i: any) => s + (i.executadoAnual > 0 ? i.executadoAnual : i.planejadoAnual), 0);
      return totalB - totalA;
    });
  }, [itensFiltrados]);

  // Dados para gráfico Pareto ABC
  const paretoData = useMemo(() => {
    if (!data?.itens) return [];
    const sorted = [...data.itens].sort((a: any, b: any) => {
      const valA = a.executadoAnual > 0 ? a.executadoAnual : a.planejadoAnual;
      const valB = b.executadoAnual > 0 ? b.executadoAnual : b.planejadoAnual;
      return valB - valA;
    });
    const total = sorted.reduce((a: number, i: any) => a + (i.executadoAnual > 0 ? i.executadoAnual : i.planejadoAnual), 0);
    let acum = 0;
    return sorted.slice(0, 20).map((item: any) => {
      const val = item.executadoAnual > 0 ? item.executadoAnual : item.planejadoAnual;
      acum += val;
      return {
        nome: item.subcategoriaNome.length > 20 ? item.subcategoriaNome.substring(0, 18) + "…" : item.subcategoriaNome,
        valor: val,
        acumulado: total > 0 ? (acum / total) * 100 : 0,
        classe: item.classificacaoABC,
      };
    });
  }, [data]);

  // Dados para gráfico de pizza Fixo vs Variável
  const fixoVarData = useMemo(() => {
    if (!data?.resumo) return [];
    return [
      { name: "Custos Fixos", value: data.resumo.totalFixo },
      { name: "Custos Variáveis", value: data.resumo.totalVariavel },
    ].filter(d => d.value > 0);
  }, [data]);

  // Dados para treemap por categoria
  const treemapData = useMemo(() => {
    if (!itensPorCategoria.length) return [];
    return itensPorCategoria.map(cat => ({
      name: cat.categoriaNome,
      size: cat.itens.reduce((s: number, i: any) => s + (i.executadoAnual > 0 ? i.executadoAnual : i.planejadoAnual), 0),
    })).filter(d => d.size > 0);
  }, [itensPorCategoria]);

  const toggleCategory = (catId: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}><CardContent className="h-32 animate-pulse bg-muted/30" /></Card>
        ))}
      </div>
    );
  }

  if (!data?.versaoId) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma versão orçamentária encontrada</h3>
          <p className="text-muted-foreground">Crie uma versão orçamentária para o ano {ano} para visualizar a análise.</p>
        </CardContent>
      </Card>
    );
  }

  const { resumo, alertas, classificacaoABC } = data;

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Análise de Custos e Despesas — {ano}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Classificação ABC, desvios, tendências e oportunidades de economia
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filtroNatureza} onValueChange={setFiltroNatureza}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="fixo">Custos Fixos</SelectItem>
              <SelectItem value="variavel">Custos Variáveis</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroClasse} onValueChange={setFiltroClasse}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas Classes</SelectItem>
              <SelectItem value="A">Classe A</SelectItem>
              <SelectItem value="B">Classe B</SelectItem>
              <SelectItem value="C">Classe C</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" /> Imprimir
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      {resumo && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Planejado Anual</p>
              <p className="text-lg font-bold">{formatCurrency(resumo.totalPlanejado)}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Executado</p>
              <p className="text-lg font-bold">{formatCurrency(resumo.totalExecutado)}</p>
              <p className="text-xs text-muted-foreground">{formatPercent(resumo.percentualExecucao)} do planejado</p>
            </CardContent>
          </Card>
          <Card className={`border-l-4 ${resumo.variacaoTotal > 0 ? "border-l-red-500" : "border-l-green-500"}`}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Variação</p>
              <p className={`text-lg font-bold ${resumo.variacaoTotal > 0 ? "text-red-600" : "text-green-600"}`}>
                {formatCurrency(resumo.variacaoTotal)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Potencial Economia</p>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(resumo.totalPotencialEconomia)}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-400">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Itens Acima</p>
              <p className="text-lg font-bold">{resumo.itensAcima}</p>
              <p className="text-xs text-muted-foreground">{resumo.itensCrescentes} em alta</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Classificação ABC</p>
              <div className="flex gap-1 mt-1">
                <Badge variant="outline" className="text-red-600 border-red-300 text-xs">A: {resumo.totalItensA}</Badge>
                <Badge variant="outline" className="text-yellow-600 border-yellow-300 text-xs">B: {resumo.totalItensB}</Badge>
                <Badge variant="outline" className="text-green-600 border-green-300 text-xs">C: {resumo.totalItensC}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Abas de visão */}
      <Tabs value={visao} onValueChange={setVisao}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="abc">Curva ABC</TabsTrigger>
          <TabsTrigger value="alertas">
            Alertas {alertas.length > 0 && <Badge variant="destructive" className="ml-1 text-xs h-5 w-5 p-0 flex items-center justify-center">{alertas.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="detalhado">Detalhado</TabsTrigger>
          <TabsTrigger value="economia">Economia</TabsTrigger>
        </TabsList>

        {/* ── RESUMO ── */}
        <TabsContent value="resumo" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico Fixo vs Variável */}
            {fixoVarData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Custos Fixos vs Variáveis</CardTitle>
                  <CardDescription>Distribuição do executado por natureza</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie
                        data={fixoVarData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f97316" />
                      </Pie>
                      <Tooltip formatter={(v: any) => formatCurrency(v)} />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>Fixos: {formatCurrency(resumo?.totalFixo ?? 0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span>Variáveis: {formatCurrency(resumo?.totalVariavel ?? 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Treemap por Categoria */}
            {treemapData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Mapa de Gastos por Categoria</CardTitle>
                  <CardDescription>Proporção visual dos gastos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <Treemap
                      data={treemapData}
                      dataKey="size"
                      aspectRatio={4 / 3}
                      stroke="#fff"
                    >
                      <Tooltip formatter={(v: any) => formatCurrency(v)} />
                    </Treemap>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Top 10 maiores gastos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top 10 Maiores Gastos</CardTitle>
              <CardDescription>Itens com maior impacto no orçamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {itensFiltrados.slice(0, 10).map((item: any, idx: number) => {
                  const val = item.executadoAnual > 0 ? item.executadoAnual : item.planejadoAnual;
                  const maxVal = itensFiltrados[0] ? (itensFiltrados[0].executadoAnual > 0 ? itensFiltrados[0].executadoAnual : itensFiltrados[0].planejadoAnual) : 1;
                  const TendIcon = TENDENCIA_CONFIG[item.tendencia as keyof typeof TENDENCIA_CONFIG].icon;
                  const tendColor = TENDENCIA_CONFIG[item.tendencia as keyof typeof TENDENCIA_CONFIG].color;

                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-sm font-mono text-muted-foreground w-6">{idx + 1}.</span>
                      <Badge
                        variant="outline"
                        className={`w-7 h-6 flex items-center justify-center text-xs font-bold ${
                          item.classificacaoABC === "A" ? "border-red-400 text-red-600" :
                          item.classificacaoABC === "B" ? "border-yellow-400 text-yellow-600" :
                          "border-green-400 text-green-600"
                        }`}
                      >
                        {item.classificacaoABC}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{item.subcategoriaNome}</span>
                          <span className="text-xs text-muted-foreground">({item.categoriaNome})</span>
                        </div>
                        <Progress value={maxVal > 0 ? (val / maxVal) * 100 : 0} className="h-1.5 mt-1" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatCurrency(val)}</p>
                        <div className="flex items-center gap-1 justify-end">
                          <TendIcon className={`h-3 w-3 ${tendColor}`} />
                          <span className={`text-xs ${tendColor}`}>{TENDENCIA_CONFIG[item.tendencia as keyof typeof TENDENCIA_CONFIG].label}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.natureza === "fixo" ? "Fixo" : "Variável"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CURVA ABC ── */}
        <TabsContent value="abc" className="space-y-6 mt-4">
          {/* Gráfico Pareto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Curva ABC — Diagrama de Pareto</CardTitle>
              <CardDescription>Top 20 itens ordenados por valor (barras) com % acumulado (linha)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={paretoData} margin={{ bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" angle={-45} textAnchor="end" interval={0} fontSize={10} height={100} />
                  <YAxis yAxisId="left" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                  <Tooltip
                    formatter={(v: any, name: string) => name === "acumulado" ? `${Number(v).toFixed(1)}%` : formatCurrency(v)}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="valor" name="Valor" radius={[4, 4, 0, 0]}>
                    {paretoData.map((entry: any, idx: number) => (
                      <Cell key={idx} fill={COLORS_ABC[entry.classe as keyof typeof COLORS_ABC] ?? "#94a3b8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabela ABC */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {(["A", "B", "C"] as const).map(classe => (
              <Card key={classe} className={`border-t-4 ${classe === "A" ? "border-t-red-500" : classe === "B" ? "border-t-yellow-500" : "border-t-green-500"}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Classe {classe}</span>
                    <Badge variant="outline" className={`${classe === "A" ? "text-red-600" : classe === "B" ? "text-yellow-600" : "text-green-600"}`}>
                      {classificacaoABC[classe].length} itens
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {classe === "A" ? "~80% do gasto total — foco principal" :
                     classe === "B" ? "~15% do gasto total — monitorar" :
                     "~5% do gasto total — baixo impacto"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {classificacaoABC[classe].map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-dashed last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{item.nome}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.categoria}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-mono text-sm">{formatCurrency(item.valor)}</p>
                          <Badge variant="outline" className="text-xs">{item.natureza === "fixo" ? "Fixo" : "Var"}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t font-bold text-sm flex justify-between">
                    <span>Total</span>
                    <span>{formatCurrency(classificacaoABC[classe].reduce((a: number, i: any) => a + i.valor, 0))}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── ALERTAS ── */}
        <TabsContent value="alertas" className="space-y-4 mt-4">
          {alertas.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum alerta identificado</h3>
                <p className="text-muted-foreground">Todos os itens estão dentro dos parâmetros esperados.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span>{alertas.length} alertas identificados — ordenados por severidade</span>
              </div>
              {alertas.map((alerta: any, idx: number) => {
                const config = SEVERIDADE_CONFIG[alerta.severidade as keyof typeof SEVERIDADE_CONFIG];
                const Icon = config.icon;
                return (
                  <Card key={idx} className="overflow-hidden">
                    <div className="flex">
                      <div className={`w-1.5 ${
                        alerta.severidade === "critica" ? "bg-red-600" :
                        alerta.severidade === "alta" ? "bg-red-400" :
                        alerta.severidade === "media" ? "bg-yellow-400" :
                        "bg-blue-400"
                      }`} />
                      <CardContent className="pt-4 pb-4 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <Icon className={`h-5 w-5 mt-0.5 ${
                              alerta.severidade === "critica" ? "text-red-600" :
                              alerta.severidade === "alta" ? "text-red-400" :
                              alerta.severidade === "media" ? "text-yellow-500" :
                              "text-blue-500"
                            }`} />
                            <div>
                              <p className="font-semibold text-sm">{alerta.titulo}</p>
                              <p className="text-sm text-muted-foreground mt-1">{alerta.descricao}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge className={config.color}>{config.label}</Badge>
                            <p className="text-sm font-bold mt-1">{formatCurrency(alerta.valor)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </>
          )}
        </TabsContent>

        {/* ── DETALHADO ── */}
        <TabsContent value="detalhado" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Análise Detalhada por Categoria</CardTitle>
              <CardDescription>Clique em uma categoria para expandir as subcategorias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left py-2 px-3 font-semibold">Item</th>
                      <th className="text-center py-2 px-2 font-semibold w-12">ABC</th>
                      <th className="text-center py-2 px-2 font-semibold w-16">Tipo</th>
                      <th className="text-right py-2 px-3 font-semibold">Planejado</th>
                      <th className="text-right py-2 px-3 font-semibold">Executado</th>
                      <th className="text-right py-2 px-3 font-semibold">Variação</th>
                      <th className="text-right py-2 px-3 font-semibold">%</th>
                      <th className="text-center py-2 px-2 font-semibold w-24">Tendência</th>
                      <th className="text-center py-2 px-2 font-semibold w-20">Prioridade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itensPorCategoria.map(cat => {
                      const isExpanded = expandedCategories.has(cat.categoriaId);
                      const catTotalPlan = cat.itens.reduce((a: number, i: any) => a + i.planejadoAnual, 0);
                      const catTotalExec = cat.itens.reduce((a: number, i: any) => a + i.executadoAnual, 0);
                      const catVariacao = catTotalExec - catTotalPlan;
                      const catPercent = catTotalPlan > 0 ? (catTotalExec / catTotalPlan) * 100 : 0;

                      return (
                        <React.Fragment key={cat.categoriaId}>
                          <tr
                            className="border-b bg-muted/10 cursor-pointer hover:bg-muted/20 transition-colors"
                            onClick={() => toggleCategory(cat.categoriaId)}
                          >
                            <td className="py-2 px-3 font-bold flex items-center gap-1">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              {cat.categoriaNome}
                              <span className="text-xs text-muted-foreground font-normal ml-1">({cat.itens.length})</span>
                            </td>
                            <td />
                            <td />
                            <td className="text-right py-2 px-3 font-bold">{formatCurrency(catTotalPlan)}</td>
                            <td className="text-right py-2 px-3 font-bold">{formatCurrency(catTotalExec)}</td>
                            <td className={`text-right py-2 px-3 font-bold ${catVariacao > 0 ? "text-red-600" : catVariacao < 0 ? "text-green-600" : ""}`}>
                              {formatCurrency(catVariacao)}
                            </td>
                            <td className="text-right py-2 px-3 font-bold">{catPercent > 0 ? formatPercent(catPercent) : "—"}</td>
                            <td />
                            <td />
                          </tr>
                          {isExpanded && cat.itens.map((item: any, idx: number) => {
                            const TendIcon = TENDENCIA_CONFIG[item.tendencia as keyof typeof TENDENCIA_CONFIG].icon;
                            const tendColor = TENDENCIA_CONFIG[item.tendencia as keyof typeof TENDENCIA_CONFIG].color;
                            return (
                              <tr key={idx} className="border-b border-dashed hover:bg-muted/5">
                                <td className="py-1.5 px-3 pl-10 text-muted-foreground">{item.subcategoriaNome}</td>
                                <td className="text-center py-1.5">
                                  <Badge variant="outline" className={`text-xs ${
                                    item.classificacaoABC === "A" ? "border-red-400 text-red-600" :
                                    item.classificacaoABC === "B" ? "border-yellow-400 text-yellow-600" :
                                    "border-green-400 text-green-600"
                                  }`}>{item.classificacaoABC}</Badge>
                                </td>
                                <td className="text-center py-1.5">
                                  <Badge variant="outline" className="text-xs">{item.natureza === "fixo" ? "Fixo" : "Var"}</Badge>
                                </td>
                                <td className="text-right py-1.5 px-3 font-mono">{formatCurrency(item.planejadoAnual)}</td>
                                <td className="text-right py-1.5 px-3 font-mono">{formatCurrency(item.executadoAnual)}</td>
                                <td className={`text-right py-1.5 px-3 font-mono ${item.variacao > 0 ? "text-red-600" : item.variacao < 0 ? "text-green-600" : ""}`}>
                                  {formatCurrency(item.variacao)}
                                </td>
                                <td className="text-right py-1.5 px-3">
                                  {item.percentualExecucao > 0 ? formatPercent(item.percentualExecucao) : "—"}
                                </td>
                                <td className="text-center py-1.5">
                                  <div className="flex items-center justify-center gap-1">
                                    <TendIcon className={`h-3 w-3 ${tendColor}`} />
                                    <span className={`text-xs ${tendColor}`}>{TENDENCIA_CONFIG[item.tendencia as keyof typeof TENDENCIA_CONFIG].label}</span>
                                  </div>
                                </td>
                                <td className="text-center py-1.5">
                                  <Badge className={`text-xs ${
                                    item.prioridade === "alta" ? "bg-red-100 text-red-800" :
                                    item.prioridade === "media" ? "bg-yellow-100 text-yellow-800" :
                                    "bg-gray-100 text-gray-600"
                                  }`}>{item.prioridade === "alta" ? "Alta" : item.prioridade === "media" ? "Média" : "Baixa"}</Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ECONOMIA ── */}
        <TabsContent value="economia" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Oportunidades de Redução de Custos
              </CardTitle>
              <CardDescription>
                Itens com maior potencial de economia baseado na diferença entre executado e planejado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resumo && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="pt-4 pb-4 text-center">
                      <p className="text-xs text-orange-600 font-medium">Potencial Total de Economia</p>
                      <p className="text-2xl font-bold text-orange-700">{formatCurrency(resumo.totalPotencialEconomia)}</p>
                      <p className="text-xs text-orange-500 mt-1">
                        {resumo.totalPlanejado > 0 ? formatPercent((resumo.totalPotencialEconomia / resumo.totalPlanejado) * 100) : "0%"} do orçamento
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4 pb-4 text-center">
                      <p className="text-xs text-blue-600 font-medium">Custos Variáveis (mais fácil cortar)</p>
                      <p className="text-2xl font-bold text-blue-700">{formatCurrency(resumo.totalVariavel)}</p>
                      <p className="text-xs text-blue-500 mt-1">{formatPercent(resumo.percentualVariavel)} do executado</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="pt-4 pb-4 text-center">
                      <p className="text-xs text-gray-600 font-medium">Custos Fixos (renegociáveis)</p>
                      <p className="text-2xl font-bold text-gray-700">{formatCurrency(resumo.totalFixo)}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatPercent(resumo.percentualFixo)} do executado</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Ranking de economia */}
              <h3 className="font-semibold text-sm mb-3">Ranking — Maiores Oportunidades de Economia</h3>
              <div className="space-y-3">
                {itensFiltrados
                  .filter((i: any) => i.potencialEconomia > 0)
                  .sort((a: any, b: any) => b.potencialEconomia - a.potencialEconomia)
                  .slice(0, 15)
                  .map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/10 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        idx < 3 ? "bg-red-100 text-red-700" : idx < 7 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{item.subcategoriaNome}</span>
                          <Badge variant="outline" className={`text-xs ${
                            item.classificacaoABC === "A" ? "border-red-400 text-red-600" :
                            item.classificacaoABC === "B" ? "border-yellow-400 text-yellow-600" :
                            "border-green-400 text-green-600"
                          }`}>{item.classificacaoABC}</Badge>
                          <Badge variant="outline" className="text-xs">{item.natureza === "fixo" ? "Fixo" : "Variável"}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.categoriaNome}</p>
                        <div className="flex gap-4 mt-1 text-xs">
                          <span>Planejado: {formatCurrency(item.planejadoAnual)}</span>
                          <span>Executado: {formatCurrency(item.executadoAnual)}</span>
                          <span className="text-red-600 font-medium">Excedente: {formatCurrency(item.potencialEconomia)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-orange-600">{formatCurrency(item.potencialEconomia)}</p>
                        <p className="text-xs text-muted-foreground">{formatPercent(item.percentualExecucao)} do planejado</p>
                      </div>
                    </div>
                  ))}
                {itensFiltrados.filter((i: any) => i.potencialEconomia > 0).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-10 w-10 mx-auto mb-3 text-green-500" />
                    <p>Nenhum item com excedente identificado. Todos dentro do orçamento!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
