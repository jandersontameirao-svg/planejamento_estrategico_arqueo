import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Brain, Sparkles, AlertTriangle, TrendingUp, Lightbulb,
  Activity, Loader2, RefreshCw, ChevronDown, ChevronUp,
  ShieldAlert, Target, ArrowRight, CheckCircle2, Clock
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts";

interface Props {
  empresaId: number;
  ano: number;
}

const SEVERIDADE_CONFIG: Record<string, { label: string; cor: string; icon: any }> = {
  alto:  { label: "Alto",  cor: "border-red-200 bg-red-50",    icon: ShieldAlert },
  medio: { label: "Médio", cor: "border-yellow-200 bg-yellow-50", icon: AlertTriangle },
  baixo: { label: "Baixo", cor: "border-blue-200 bg-blue-50",  icon: Activity },
};

const PRIORIDADE_CONFIG: Record<string, { label: string; cor: string }> = {
  urgente: { label: "Urgente", cor: "bg-red-100 text-red-700" },
  alta:    { label: "Alta",    cor: "bg-orange-100 text-orange-700" },
  media:   { label: "Média",   cor: "bg-yellow-100 text-yellow-700" },
  baixa:   { label: "Baixa",   cor: "bg-green-100 text-green-700" },
};

const STATUS_CONFIG: Record<string, { label: string; cor: string }> = {
  critico: { label: "Crítico", cor: "text-red-600 bg-red-100" },
  atencao: { label: "Atenção", cor: "text-yellow-600 bg-yellow-100" },
  ok:      { label: "OK",      cor: "text-green-600 bg-green-100" },
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function ScoreGauge({ score }: { score: number }) {
  const cor = score >= 70 ? "text-green-600" : score >= 40 ? "text-yellow-600" : "text-red-600";
  const bg = score >= 70 ? "bg-green-100" : score >= 40 ? "bg-yellow-100" : "bg-red-100";
  const label = score >= 70 ? "Saudável" : score >= 40 ? "Atenção" : "Crítico";
  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-xl ${bg}`}>
      <span className={`text-5xl font-bold ${cor}`}>{score}</span>
      <span className="text-xs text-muted-foreground mt-1">de 100</span>
      <Badge className={`mt-2 ${cor} border-0 ${bg}`}>{label}</Badge>
    </div>
  );
}

export default function OrcamentoAnaliseIA({ empresaId, ano }: Props) {
  const [analise, setAnalise] = useState<any>(null);
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());

  const analisarMutation = trpc.orcamento.analisarOrcamentoIA.useMutation({
    onSuccess: (data) => {
      setAnalise(data);
      toast.success("Análise IA concluída!");
    },
    onError: (e) => toast.error("Erro na análise: " + e.message),
  });

  const toggleExpandido = (idx: number) => {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const projecoesData = analise?.projecoes?.map((p: any, i: number) => ({
    mes: p.mes,
    Projetado: p.valorProjetado,
    confianca: p.confianca,
  })) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Análise Inteligente com IA
          </h3>
          <p className="text-sm text-muted-foreground">
            A IA analisa os dados orçamentários e identifica riscos, tendências e oportunidades de melhoria
          </p>
        </div>
        <Button
          onClick={() => analisarMutation.mutate({ empresaId, ano })}
          disabled={analisarMutation.isPending}
          className="shrink-0"
        >
          {analisarMutation.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analisando...</>
          ) : analise ? (
            <><RefreshCw className="h-4 w-4 mr-2" /> Reanalisar</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" /> Iniciar Análise IA</>
          )}
        </Button>
      </div>

      {/* Estado inicial */}
      {!analise && !analisarMutation.isPending && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Brain className="h-12 w-12 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base">Análise Orçamentária com IA</p>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Clique em "Iniciar Análise IA" para que a inteligência artificial analise os dados
                  orçamentários do ano {ano} e gere um diagnóstico completo com riscos, projeções e recomendações.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { icon: ShieldAlert, label: "Riscos identificados", cor: "text-red-500 bg-red-50" },
                  { icon: TrendingUp, label: "Projeções futuras", cor: "text-blue-500 bg-blue-50" },
                  { icon: Lightbulb, label: "Recomendações", cor: "text-yellow-500 bg-yellow-50" },
                ].map((item, i) => (
                  <div key={i} className={`flex flex-col items-center gap-2 p-3 rounded-lg ${item.cor}`}>
                    <item.icon className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {analisarMutation.isPending && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="p-4 rounded-full bg-primary/10">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 p-1 rounded-full bg-primary">
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                </div>
              </div>
              <div>
                <p className="font-semibold">IA analisando dados orçamentários...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Processando planejado vs executado, identificando padrões e riscos
                </p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center text-xs text-muted-foreground">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">Analisando tendências</span>
                <span className="px-3 py-1 rounded-full bg-muted">Calculando riscos</span>
                <span className="px-3 py-1 rounded-full bg-muted">Gerando projeções</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado da análise */}
      {analise && (
        <div className="space-y-6">
          {/* Score + Diagnóstico */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScoreGauge score={analise.scoreGeral} />
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Diagnóstico Geral
                </CardTitle>
                <CardDescription className="text-xs">
                  Gerado em {new Date(analise.geradoEm).toLocaleString("pt-BR")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">{analise.diagnostico}</p>
              </CardContent>
            </Card>
          </div>

          {/* Alertas */}
          {analise.alertas?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" /> Indicadores de Alerta
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {analise.alertas.map((a: any, i: number) => {
                  const cfg = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.ok;
                  return (
                    <div key={i} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{a.indicador}</span>
                        <Badge className={`text-xs ${cfg.cor} border-0`}>{cfg.label}</Badge>
                      </div>
                      <p className="text-sm font-semibold">{a.valor}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Riscos */}
          {analise.riscos?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-500" /> Riscos Identificados ({analise.riscos.length})
              </h4>
              <div className="space-y-3">
                {analise.riscos.map((r: any, i: number) => {
                  const cfg = SEVERIDADE_CONFIG[r.severidade] ?? SEVERIDADE_CONFIG.medio;
                  const expanded = expandidos.has(i);
                  return (
                    <Card key={i} className={`border ${cfg.cor}`}>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <cfg.icon className="h-5 w-5 shrink-0 mt-0.5 text-current" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{r.titulo}</span>
                                <Badge variant="outline" className="text-xs">{cfg.label} risco</Badge>
                                {r.impactoEstimado > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    Impacto: {formatCurrency(r.impactoEstimado)}
                                  </span>
                                )}
                              </div>
                              {expanded && (
                                <p className="text-sm text-muted-foreground mt-2">{r.descricao}</p>
                              )}
                            </div>
                          </div>
                          <button onClick={() => toggleExpandido(i)} className="text-muted-foreground hover:text-foreground shrink-0">
                            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Projeções */}
          {projecoesData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" /> Projeções para os Próximos Meses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={projecoesData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                    <Line
                      type="monotone"
                      dataKey="Projetado"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "#3b82f6", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-2">
                  {analise.projecoes.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{p.mes}</span>
                        <Badge variant="outline" className="text-xs">
                          Confiança {p.confianca}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-blue-600">{formatCurrency(p.valorProjetado)}</span>
                        {p.observacao && (
                          <span className="text-xs text-muted-foreground max-w-[200px] truncate">{p.observacao}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recomendações */}
          {analise.recomendacoes?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" /> Recomendações de Ação ({analise.recomendacoes.length})
              </h4>
              <div className="space-y-3">
                {analise.recomendacoes.map((rec: any, i: number) => {
                  const cfg = PRIORIDADE_CONFIG[rec.prioridade] ?? PRIORIDADE_CONFIG.media;
                  return (
                    <Card key={i}>
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-yellow-50 shrink-0">
                            <Target className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-medium text-sm">{rec.titulo}</span>
                              <Badge className={`text-xs ${cfg.cor} border-0`}>{cfg.label}</Badge>
                              {rec.economiaEstimada > 0 && (
                                <span className="text-xs text-green-600 font-medium">
                                  Economia: {formatCurrency(rec.economiaEstimada)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{rec.descricao}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
