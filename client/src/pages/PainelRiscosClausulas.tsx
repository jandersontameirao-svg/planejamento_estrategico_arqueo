import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle, Shield, ShieldAlert, ShieldCheck, ShieldX,
  FileText, Eye, ChevronDown, ChevronRight, Filter,
  TrendingUp, BarChart3, Target, BookOpen
} from "lucide-react";

// ─── TIPOS ─────────────────────────────────────────────────────────────────

interface PainelRiscosClausulasProps {
  empresaId: number;
}

// ─── CONSTANTES ────────────────────────────────────────────────────────────

const SEVERIDADE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Shield }> = {
  critica: { label: "Crítica", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: ShieldX },
  alta: { label: "Alta", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: ShieldAlert },
  media: { label: "Média", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", icon: Shield },
  baixa: { label: "Baixa", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: ShieldCheck },
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  identificado: { label: "Identificado", variant: "destructive" },
  em_mitigacao: { label: "Em Mitigação", variant: "default" },
  mitigado: { label: "Mitigado", variant: "secondary" },
  materializado: { label: "Materializado", variant: "destructive" },
  aceito: { label: "Aceito", variant: "outline" },
};

const CATEGORIA_LABELS: Record<string, string> = {
  financeiro: "Financeiro",
  juridico: "Jurídico",
  operacional: "Operacional",
  prazo: "Prazo",
  escopo: "Escopo",
  reputacional: "Reputacional",
  regulatorio: "Regulatório",
  outro: "Outro",
};

const PROB_LABELS: Record<string, string> = { baixa: "Baixa", media: "Média", alta: "Alta" };
const IMPACTO_LABELS: Record<string, string> = { baixo: "Baixo", medio: "Médio", alto: "Alto" };

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────

export default function PainelRiscosClausulas({ empresaId }: PainelRiscosClausulasProps) {
  const { data: riscosData, isLoading: loadingRiscos } = trpc.contratos.painelRiscos.useQuery({ empresaId });
  const { data: clausulasData, isLoading: loadingClausulas } = trpc.contratos.painelClausulas.useQuery({ empresaId });

  if (loadingRiscos || loadingClausulas) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6"><div className="h-16 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="riscos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="riscos" className="gap-2">
            <ShieldAlert className="h-4 w-4" /> Riscos ({riscosData?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="mapa" className="gap-2">
            <Target className="h-4 w-4" /> Mapa de Calor
          </TabsTrigger>
          <TabsTrigger value="clausulas" className="gap-2">
            <BookOpen className="h-4 w-4" /> Cláusulas ({clausulasData?.totalClausulas || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="riscos" className="mt-4">
          <RiscosTab data={riscosData} />
        </TabsContent>
        <TabsContent value="mapa" className="mt-4">
          <MapaCalorTab data={riscosData} />
        </TabsContent>
        <TabsContent value="clausulas" className="mt-4">
          <ClausulasTab data={clausulasData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── ABA RISCOS ────────────────────────────────────────────────────────────

function RiscosTab({ data }: { data: any }) {
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>("todos");
  const [expandedRiscos, setExpandedRiscos] = useState<Set<number>>(new Set());

  const riscosFiltrados = useMemo(() => {
    if (!data?.riscos) return [];
    return data.riscos.filter((r: any) => {
      if (filtroCategoria !== "todos" && r.categoria !== filtroCategoria) return false;
      if (filtroStatus !== "todos" && r.status !== filtroStatus) return false;
      if (filtroSeveridade !== "todos" && r.severidade !== filtroSeveridade) return false;
      return true;
    });
  }, [data, filtroCategoria, filtroStatus, filtroSeveridade]);

  const toggleExpand = (id: number) => {
    setExpandedRiscos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <ShieldX className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{data.porSeveridade.critica}</p>
                <p className="text-xs text-red-600">Críticos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShieldAlert className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-700">{data.porSeveridade.alta}</p>
                <p className="text-xs text-orange-600">Altos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">{data.porSeveridade.media}</p>
                <p className="text-xs text-yellow-600">Médios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{data.porSeveridade.baixa}</p>
                <p className="text-xs text-green-600">Baixos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de distribuição */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Por Categoria */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(data.porCategoria)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([cat, count]) => {
                  const pct = data.total > 0 ? ((count as number) / data.total) * 100 : 0;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-xs w-24 truncate">{CATEGORIA_LABELS[cat] || cat}</span>
                      <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full flex items-center justify-end pr-2 transition-all"
                          style={{ width: `${Math.max(pct, 8)}%` }}
                        >
                          <span className="text-[10px] font-medium text-white">{count as number}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Por Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(data.porStatus)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([status, count]) => {
                  const pct = data.total > 0 ? ((count as number) / data.total) * 100 : 0;
                  const cfg = STATUS_CONFIG[status];
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className="text-xs w-24 truncate">{cfg?.label || status}</span>
                      <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2 transition-all"
                          style={{ width: `${Math.max(pct, 8)}%` }}
                        >
                          <span className="text-[10px] font-medium text-white">{count as number}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas críticos */}
      {data.riscosCriticos.length > 0 && (
        <Card className="border-red-300 bg-red-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" /> Riscos que Precisam de Atenção Imediata ({data.riscosCriticos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.riscosCriticos.slice(0, 5).map((r: any) => (
                <div key={r.riscoId} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                  <div className="flex items-center gap-2">
                    <ShieldX className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">{r.titulo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{r.contratoTitulo}</Badge>
                    <Badge variant="destructive" className="text-xs">
                      {SEVERIDADE_CONFIG[r.severidade]?.label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Riscos sem mitigação */}
      {data.riscosSemMitigacao.length > 0 && (
        <Card className="border-amber-300 bg-amber-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" /> Riscos sem Plano de Mitigação ({data.riscosSemMitigacao.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.riscosSemMitigacao.slice(0, 5).map((r: any) => (
                <div key={r.riscoId} className="flex items-center justify-between p-2 bg-white rounded border border-amber-200">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">{r.titulo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{CATEGORIA_LABELS[r.categoria] || r.categoria}</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {STATUS_CONFIG[r.status]?.label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" /> Lista Detalhada de Riscos
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                IA: {data.geradosIA} | Manual: {data.geradosManuais}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas categorias</SelectItem>
                {Object.entries(CATEGORIA_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroSeveridade} onValueChange={setFiltroSeveridade}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas severidades</SelectItem>
                {Object.entries(SEVERIDADE_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground self-center">
              {riscosFiltrados.length} risco(s)
            </span>
          </div>

          {/* Lista de riscos */}
          <div className="space-y-2">
            {riscosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum risco encontrado com os filtros selecionados</p>
              </div>
            ) : (
              riscosFiltrados.map((r: any) => {
                const sevCfg = SEVERIDADE_CONFIG[r.severidade] || SEVERIDADE_CONFIG.media;
                const SevIcon = sevCfg.icon;
                const expanded = expandedRiscos.has(r.riscoId);

                return (
                  <div key={r.riscoId} className={`border rounded-lg overflow-hidden ${sevCfg.bg}`}>
                    <button
                      onClick={() => toggleExpand(r.riscoId)}
                      className="w-full flex items-center justify-between p-3 hover:bg-black/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <SevIcon className={`h-5 w-5 ${sevCfg.color}`} />
                        <div className="text-left">
                          <p className="text-sm font-medium">{r.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.contratoTitulo} {r.contratoNumero ? `(${r.contratoNumero})` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {CATEGORIA_LABELS[r.categoria] || r.categoria}
                        </Badge>
                        <Badge variant={STATUS_CONFIG[r.status]?.variant || "secondary"} className="text-xs">
                          {STATUS_CONFIG[r.status]?.label || r.status}
                        </Badge>
                        {r.geradoPorIA && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            IA
                          </Badge>
                        )}
                        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                    </button>
                    {expanded && (
                      <div className="px-3 pb-3 pt-1 border-t bg-white/50 space-y-2">
                        {r.descricao && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Descrição</p>
                            <p className="text-sm">{r.descricao}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Probabilidade</p>
                            <p className="text-sm">{PROB_LABELS[r.probabilidade] || r.probabilidade}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Impacto</p>
                            <p className="text-sm">{IMPACTO_LABELS[r.impacto] || r.impacto}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Severidade</p>
                            <p className={`text-sm font-medium ${sevCfg.color}`}>{sevCfg.label}</p>
                          </div>
                        </div>
                        {r.planoMitigacao && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Plano de Mitigação</p>
                            <p className="text-sm">{r.planoMitigacao}</p>
                          </div>
                        )}
                        {r.dataIdentificacao && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Identificado em</p>
                            <p className="text-sm">{new Date(r.dataIdentificacao).toLocaleDateString("pt-BR")}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── ABA MAPA DE CALOR ────────────────────────────────────────────────────

function MapaCalorTab({ data }: { data: any }) {
  if (!data) return null;

  const probabilidades = ["alta", "media", "baixa"];
  const impactos = ["baixo", "medio", "alto"];

  const getCellColor = (prob: string, imp: string) => {
    const count = data.mapaCalor[`${prob}_${imp}`] || 0;
    if (count === 0) return "bg-gray-50 text-gray-400";

    // Cores baseadas na severidade da combinação
    if (prob === "alta" && imp === "alto") return "bg-red-500 text-white";
    if ((prob === "alta" && imp === "medio") || (prob === "media" && imp === "alto")) return "bg-orange-500 text-white";
    if (prob === "alta" && imp === "baixo") return "bg-orange-400 text-white";
    if (prob === "media" && imp === "medio") return "bg-yellow-400 text-yellow-900";
    if ((prob === "media" && imp === "baixo") || (prob === "baixa" && imp === "alto")) return "bg-yellow-300 text-yellow-900";
    if (prob === "baixa" && imp === "medio") return "bg-green-300 text-green-900";
    return "bg-green-200 text-green-800";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" /> Matriz de Riscos (Probabilidade x Impacto)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="inline-block">
              {/* Header */}
              <div className="grid grid-cols-4 gap-1 mb-1">
                <div className="p-2 text-xs font-medium text-center text-muted-foreground">
                  Prob. \ Impacto
                </div>
                {impactos.map((imp) => (
                  <div key={imp} className="p-2 text-xs font-medium text-center bg-muted rounded">
                    {IMPACTO_LABELS[imp]}
                  </div>
                ))}
              </div>
              {/* Rows */}
              {probabilidades.map((prob) => (
                <div key={prob} className="grid grid-cols-4 gap-1 mb-1">
                  <div className="p-2 text-xs font-medium text-center bg-muted rounded flex items-center justify-center">
                    {PROB_LABELS[prob]}
                  </div>
                  {impactos.map((imp) => {
                    const count = data.mapaCalor[`${prob}_${imp}`] || 0;
                    return (
                      <div
                        key={`${prob}_${imp}`}
                        className={`p-4 text-center rounded-lg font-bold text-lg transition-all ${getCellColor(prob, imp)}`}
                      >
                        {count}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legenda */}
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-xs">Crítico</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-orange-500" />
              <span className="text-xs">Alto</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-yellow-400" />
              <span className="text-xs">Médio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-green-300" />
              <span className="text-xs">Baixo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-gray-100 border" />
              <span className="text-xs">Sem riscos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo por empresa */}
      {Object.keys(data.porEmpresa).length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Distribuição por Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(data.porEmpresa)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([empresa, count]) => {
                  const pct = data.total > 0 ? ((count as number) / data.total) * 100 : 0;
                  return (
                    <div key={empresa} className="flex items-center gap-3">
                      <span className="text-xs w-40 truncate font-medium">{empresa}</span>
                      <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full flex items-center justify-end pr-2 transition-all"
                          style={{ width: `${Math.max(pct, 8)}%` }}
                        >
                          <span className="text-[10px] font-medium text-white">{count as number}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground w-10 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── ABA CLÁUSULAS ─────────────────────────────────────────────────────────

function ClausulasTab({ data }: { data: any }) {
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [expandedContratos, setExpandedContratos] = useState<Set<number>>(new Set());

  const clausulasFiltradas = useMemo(() => {
    if (!data?.clausulas) return [];
    if (filtroTipo === "todos") return data.clausulas;
    return data.clausulas.filter((c: any) => c.tipo === filtroTipo);
  }, [data, filtroTipo]);

  // Agrupar por contrato
  const porContrato = useMemo(() => {
    const map = new Map<number, { titulo: string; numero: string | null; empresa: string; clausulas: any[] }>();
    for (const c of clausulasFiltradas) {
      if (!map.has(c.contratoId)) {
        map.set(c.contratoId, {
          titulo: c.contratoTitulo,
          numero: c.contratoNumero,
          empresa: c.empresaNome,
          clausulas: [],
        });
      }
      map.get(c.contratoId)!.clausulas.push(c);
    }
    return Array.from(map.entries());
  }, [clausulasFiltradas]);

  const toggleContrato = (id: number) => {
    setExpandedContratos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!data) return null;

  const RELEVANCIA_COLORS: Record<string, string> = {
    alta: "bg-red-100 text-red-700 border-red-200",
    media: "bg-yellow-100 text-yellow-700 border-yellow-200",
    baixa: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.totalContratos}</p>
                <p className="text-xs text-muted-foreground">Contratos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.totalContratosAnalisados}</p>
                <p className="text-xs text-muted-foreground">Analisados por IA</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.totalClausulas}</p>
                <p className="text-xs text-muted-foreground">Cláusulas Extraídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por tipo */}
      {Object.keys(data.porTipo).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Distribuição por Tipo de Cláusula</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.porTipo)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([tipo, count]) => (
                  <Button
                    key={tipo}
                    variant={filtroTipo === tipo ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setFiltroTipo(filtroTipo === tipo ? "todos" : tipo)}
                  >
                    {tipo} ({count as number})
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista agrupada por contrato */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Cláusulas por Contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          {porContrato.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhuma cláusula extraída ainda</p>
              <p className="text-xs mt-1">Crie contratos via upload de PDF com IA para extrair cláusulas automaticamente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {porContrato.map(([contratoId, info]) => {
                const expanded = expandedContratos.has(contratoId);
                return (
                  <div key={contratoId} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleContrato(contratoId)}
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <div className="text-left">
                          <p className="text-sm font-medium">{info.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            {info.empresa} {info.numero ? `| ${info.numero}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {info.clausulas.length} cláusula(s)
                        </Badge>
                        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                    </button>
                    {expanded && (
                      <div className="px-3 pb-3 border-t space-y-2 pt-2">
                        {info.clausulas.map((cl: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-2 bg-muted/30 rounded">
                            <Badge
                              variant="outline"
                              className={`text-xs shrink-0 mt-0.5 ${RELEVANCIA_COLORS[cl.relevancia] || ""}`}
                            >
                              {cl.tipo}
                            </Badge>
                            <p className="text-sm">{cl.descricao}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
