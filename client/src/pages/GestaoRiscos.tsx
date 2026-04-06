import React, { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Plus, Sparkles, Target, TrendingDown, TrendingUp, Shield, ChevronDown, ChevronRight, Trash2, Edit3, CheckCircle2, Clock, AlertCircle, X, History, MessageSquare, Send, FileEdit, PlusCircle, MinusCircle, RefreshCw, Bot, Activity, BarChart3, Zap, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { toast } from "sonner";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type Risco = {
  id: number;
  empresaId: number;
  titulo: string;
  descricao?: string | null;
  origem: string;
  categoria: string;
  probabilidade: string;
  impacto: string;
  severidade: string;
  status: string;
  responsavel?: string | null;
  createdAt: Date;
};

type HistoricoItem = {
  id: number;
  riscoId: number;
  empresaId: number;
  userId?: number | null;
  userName?: string | null;
  tipoEvento: string;
  descricao: string;
  camposAlterados?: any;
  valorAnterior?: any;
  valorNovo?: any;
  createdAt: Date;
};

type PlanoAcao = {
  id: number;
  riscoId: number;
  titulo: string;
  objetivo?: string | null;
  descricao?: string | null;
  tipoPrioridade: string;
  economiaEstimada?: string | null;
  prazoImplementacao?: string | null;
  impactoOperacional: string;
  benchmarking?: string | null;
  acoes?: any;
  geradoPorIA?: boolean | null;
  status: string;
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const SEVERIDADE_COLOR: Record<string, string> = {
  critica: "bg-red-100 text-red-800 border-red-200",
  alta: "bg-orange-100 text-orange-800 border-orange-200",
  media: "bg-yellow-100 text-yellow-800 border-yellow-200",
  baixa: "bg-green-100 text-green-800 border-green-200",
};

const SEVERIDADE_DOT: Record<string, string> = {
  critica: "bg-red-500",
  alta: "bg-orange-500",
  media: "bg-yellow-500",
  baixa: "bg-green-500",
};

const STATUS_COLOR: Record<string, string> = {
  identificado: "bg-blue-100 text-blue-800",
  em_mitigacao: "bg-purple-100 text-purple-800",
  mitigado: "bg-green-100 text-green-800",
  materializado: "bg-red-100 text-red-800",
  aceito: "bg-gray-100 text-gray-800",
  monitorando: "bg-cyan-100 text-cyan-800",
};

const ORIGEM_LABEL: Record<string, string> = {
  orcamentario: "Orçamentário",
  estrategico: "Estratégico",
  operacional: "Operacional",
  contratual: "Contratual",
  financeiro: "Financeiro",
  regulatorio: "Regulatório",
  outro: "Outro",
};

const TIPO_PRIORIDADE_LABEL: Record<string, string> = {
  corte_custos: "Corte de Custos",
  mitigacao: "Mitigação",
  prevencao: "Prevenção",
  contingencia: "Contingência",
  monitoramento: "Monitoramento",
};

const IMPACTO_OP_COLOR: Record<string, string> = {
  nenhum: "text-green-600",
  baixo: "text-yellow-600",
  medio: "text-orange-600",
  alto: "text-red-600",
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function GestaoRiscos() {
  const params = useParams<{ empresaId: string }>();
  const empresaId = parseInt(params.empresaId || "0");
  const [tabAtiva, setTabAtiva] = useState("dashboard");
  const [filtroOrigem, setFiltroOrigem] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [riscoExpandido, setRiscoExpandido] = useState<number | null>(null);
  const [modalNovoRisco, setModalNovoRisco] = useState(false);
  const [modalPlanoIA, setModalPlanoIA] = useState<Risco | null>(null);
  const [modalEditarRisco, setModalEditarRisco] = useState<Risco | null>(null);
  const [gerando, setGerando] = useState(false);
  const [riscoHistorico, setRiscoHistorico] = useState<number | null>(null);
  const [comentario, setComentario] = useState("");

  // ── Queries ────────────────────────────────────────────────────────────────
  const empresa = trpc.empresas.getById.useQuery({ id: empresaId });
  const resumo = trpc.gestaoRiscos.resumo.useQuery({ empresaId });
  const riscos = trpc.gestaoRiscos.list.useQuery({
    empresaId,
    origem: filtroOrigem !== "todos" ? filtroOrigem as any : undefined,
    status: filtroStatus !== "todos" ? filtroStatus as any : undefined,
  });

  // ── Utils ──────────────────────────────────────────────────────────────────
  const utils = trpc.useUtils();
  const invalidate = () => {
    utils.gestaoRiscos.resumo.invalidate({ empresaId });
    utils.gestaoRiscos.list.invalidate({ empresaId });
    utils.gestaoRiscos.getDashboard.invalidate({ empresaId });
  };

  const adicionarComentario = trpc.gestaoRiscos.adicionarComentario.useMutation({
    onSuccess: () => {
      setComentario("");
      utils.gestaoRiscos.listHistorico.invalidate({ riscoId: riscoHistorico! });
      utils.gestaoRiscos.listHistoricoEmpresa.invalidate({ empresaId });
      toast.success("Comentário adicionado");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const criarRisco = trpc.gestaoRiscos.create.useMutation({
    onSuccess: () => { toast.success("Risco cadastrado com sucesso"); invalidate(); setModalNovoRisco(false); },
    onError: (e) => toast.error("Erro ao cadastrar risco: " + e.message),
  });

  const excluirRisco = trpc.gestaoRiscos.delete.useMutation({
    onSuccess: () => { toast.success("Risco excluído"); invalidate(); },
    onError: (e) => toast.error("Erro ao excluir: " + e.message),
  });

  const gerarPlanoIA = trpc.gestaoRiscos.gerarPlanoIA.useMutation({
    onSuccess: (data) => {
      toast.success("Plano de Ação gerado pela IA: " + data.plano.titulo);
      utils.gestaoRiscos.listPlanos.invalidate({ riscoId: modalPlanoIA?.id });
      setModalPlanoIA(null);
      setGerando(false);
    },
    onError: (e) => {
      toast.error("Erro ao gerar plano: " + e.message);
      setGerando(false);
    },
  });

  // ── Form novo risco ────────────────────────────────────────────────────────
  const [formRisco, setFormRisco] = useState({
    titulo: "", descricao: "", origem: "estrategico", categoria: "financeiro",
    probabilidade: "media", impacto: "medio", responsavel: "",
  });

  const handleCriarRisco = () => {
    if (!formRisco.titulo.trim()) return;
    criarRisco.mutate({ empresaId, ...formRisco as any });
  };

  const handleGerarPlanoIA = () => {
    if (!modalPlanoIA) return;
    setGerando(true);
    gerarPlanoIA.mutate({
      riscoId: modalPlanoIA.id,
      empresaId,
      tituloRisco: modalPlanoIA.titulo,
      descricaoRisco: modalPlanoIA.descricao ?? undefined,
      origem: modalPlanoIA.origem as any,
      categoria: modalPlanoIA.categoria as any,
      probabilidade: modalPlanoIA.probabilidade as any,
      impacto: modalPlanoIA.impacto as any,
      severidade: modalPlanoIA.severidade as any,
      nomeEmpresa: empresa.data?.nome,
      tipoEmpresa: (empresa.data as any)?.tipoAtuacao,
    });
  };

  const dashboard = trpc.gestaoRiscos.getDashboard.useQuery({ empresaId });
  const d = dashboard.data;
  const r = resumo.data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Riscos</h1>
            <p className="text-sm text-gray-500">{empresa.data?.nome}</p>
          </div>
        </div>
        <Button onClick={() => setModalNovoRisco(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Risco
        </Button>
      </div>

      <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="riscos">Riscos ({riscos.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="matriz">Matriz de Calor</TabsTrigger>
          <TabsTrigger value="historico" className="gap-1.5"><History className="w-3.5 h-3.5" />Histórico</TabsTrigger>
        </TabsList>

        {/* ── DASHBOARD ─────────────────────────────────────────────────── */}
        <TabsContent value="dashboard" className="space-y-5 mt-4">

          {/* ── Linha 1: Score de Exposição + KPIs principais ── */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

            {/* Score de Exposição */}
            <Card className="md:col-span-1 flex flex-col items-center justify-center p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Score de Exposição</p>
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke={d?.scoreExposicao ?? 0 >= 70 ? "#ef4444" : d?.scoreExposicao ?? 0 >= 40 ? "#f97316" : "#22c55e"}
                    strokeWidth="12"
                    strokeDasharray={`${((d?.scoreExposicao ?? 0) / 100) * 251.2} 251.2`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-black ${(d?.scoreExposicao ?? 0) >= 70 ? "text-red-600" : (d?.scoreExposicao ?? 0) >= 40 ? "text-orange-500" : "text-green-600"}`}>
                    {d?.scoreExposicao ?? 0}
                  </span>
                  <span className="text-xs text-slate-400">/100</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs">
                {d?.tendencia === 'alta' ? <><ArrowUp className="w-3 h-3 text-red-500" /><span className="text-red-500 font-medium">Em alta</span></> :
                 d?.tendencia === 'queda' ? <><ArrowDown className="w-3 h-3 text-green-500" /><span className="text-green-500 font-medium">Em queda</span></> :
                 <><Minus className="w-3 h-3 text-gray-400" /><span className="text-gray-400">Estável</span></>}
              </div>
            </Card>

            {/* KPIs */}
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Críticos</p>
                  <p className="text-3xl font-black text-red-600">{d?.criticos ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-1">{d?.altos ?? 0} altos</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Ativos</p>
                  <p className="text-3xl font-black text-blue-600">{d?.ativos ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-1">{d?.emMitigacao ?? 0} em mitigação</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Mitigados</p>
                  <p className="text-3xl font-black text-green-600">{d?.mitigados ?? 0}</p>
                  <p className="text-xs text-gray-400 mt-1">{d?.materializados ?? 0} materializados</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Cobertura</p>
                  <p className="text-3xl font-black text-purple-600">{d?.cobertura ?? 0}%</p>
                  <p className="text-xs text-gray-400 mt-1">{d?.planosAtivos ?? 0} planos ativos</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Linha 2: Gráficos ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Distribuição por Severidade (Donut) */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-500" /> Distribuição por Severidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                {d && d.total > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={[
                        { name: 'Crítica', value: d.criticos, fill: '#ef4444' },
                        { name: 'Alta', value: d.altos, fill: '#f97316' },
                        { name: 'Média', value: d.medios, fill: '#eab308' },
                        { name: 'Baixa', value: d.baixos, fill: '#22c55e' },
                      ].filter(x => x.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                        {["#ef4444","#f97316","#eab308","#22c55e"].map((c, i) => <Cell key={i} fill={c} />)}
                      </Pie>
                      <Tooltip formatter={(v: any, n: any) => [v, n]} />
                      <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-gray-400 text-center py-12">Nenhum risco cadastrado</p>}
              </CardContent>
            </Card>

            {/* Distribuição por Categoria (Barras) */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" /> Por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                {d && Object.keys(d.porCategoria).length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={Object.entries(d.porCategoria).map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(0, 5), value: v }))} layout="vertical" margin={{ left: 0, right: 10 }}>
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={55} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-gray-400 text-center py-12">Nenhum dado</p>}
              </CardContent>
            </Card>

            {/* Evolução Mensal (Linha) */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-green-500" /> Evolução (6 meses)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={d?.evolucaoMensal ?? []} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend iconSize={8} />
                    <Line type="monotone" dataKey="novos" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="Novos" />
                    <Line type="monotone" dataKey="mitigados" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Mitigados" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* ── Linha 3: Top 5 Riscos + Status ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Top 5 Riscos Críticos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" /> Top 5 Riscos Prioritários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {d?.top5 && d.top5.length > 0 ? d.top5.map((risco, idx) => (
                  <div key={risco.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <span className="text-xs font-bold text-gray-400 w-4">#{idx + 1}</span>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${SEVERIDADE_DOT[risco.severidade]}`} />
                    <span className="text-sm text-gray-800 flex-1 truncate">{risco.titulo}</span>
                    <div className="flex items-center gap-1">
                      {risco.temPlano ? <span title="Tem plano de ação"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /></span> : <span title="Sem plano de ação"><AlertCircle className="w-3.5 h-3.5 text-orange-400" /></span>}
                      <Badge className={`${SEVERIDADE_COLOR[risco.severidade]} text-xs px-1.5 py-0`}>{risco.severidade}</Badge>
                    </div>
                  </div>
                )) : <p className="text-sm text-gray-400 text-center py-6">Nenhum risco ativo</p>}
              </CardContent>
            </Card>

            {/* Distribuição por Status + Origem */}
            <div className="space-y-3">
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-semibold text-gray-700">Por Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {r && Object.entries(r.porStatus).filter(([, v]) => v > 0).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 capitalize">{k.replace(/_/g, " ")}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${(v / (r.total || 1)) * 100}%` }} />
                        </div>
                        <Badge className={`${STATUS_COLOR[k]} text-xs px-1.5 py-0`}>{v}</Badge>
                      </div>
                    </div>
                  ))}
                  {(!r || r.total === 0) && <p className="text-xs text-gray-400 text-center py-3">Nenhum risco</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-semibold text-gray-700">Por Origem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {r && Object.entries(r.porOrigem).filter(([, v]) => v > 0).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{ORIGEM_LABEL[k] || k}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${(v / (r.total || 1)) * 100}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-4 text-right">{v}</span>
                      </div>
                    </div>
                  ))}
                  {(!r || r.total === 0) && <p className="text-xs text-gray-400 text-center py-3">Nenhum risco</p>}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Linha 4: Planos de Ação ── */}
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-purple-500 uppercase tracking-wide font-semibold">Total de Planos</p>
                  <p className="text-2xl font-black text-purple-700">{d?.totalPlanos ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-indigo-500 uppercase tracking-wide font-semibold">Planos Ativos</p>
                  <p className="text-2xl font-black text-indigo-700">{d?.planosAtivos ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Gerados por IA</p>
                  <p className="text-2xl font-black text-blue-700">{d?.planosPorIA ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        {/* ── LISTA DE RISCOS ───────────────────────────────────────────── */}
        <TabsContent value="riscos" className="space-y-4 mt-4">
          {/* Filtros */}
          <div className="flex gap-3 flex-wrap">
            <Select value={filtroOrigem} onValueChange={setFiltroOrigem}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as origens</SelectItem>
                <SelectItem value="orcamentario">Orçamentário</SelectItem>
                <SelectItem value="estrategico">Estratégico</SelectItem>
                <SelectItem value="operacional">Operacional</SelectItem>
                <SelectItem value="contratual">Contratual</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="regulatorio">Regulatório</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="identificado">Identificado</SelectItem>
                <SelectItem value="em_mitigacao">Em Mitigação</SelectItem>
                <SelectItem value="mitigado">Mitigado</SelectItem>
                <SelectItem value="materializado">Materializado</SelectItem>
                <SelectItem value="aceito">Aceito</SelectItem>
                <SelectItem value="monitorando">Monitorando</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista */}
          {riscos.isLoading && <p className="text-sm text-gray-400 text-center py-8">Carregando riscos...</p>}
          {!riscos.isLoading && (!riscos.data || riscos.data.length === 0) && (
            <div className="text-center py-12 text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum risco cadastrado</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setModalNovoRisco(true)}>
                <Plus className="w-4 h-4 mr-1" /> Cadastrar primeiro risco
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {riscos.data?.map((risco) => (
              <RiscoCard
                key={risco.id}
                risco={risco}
                expanded={riscoExpandido === risco.id}
                onToggle={() => setRiscoExpandido(riscoExpandido === risco.id ? null : risco.id)}
                onGerarPlanoIA={() => setModalPlanoIA(risco)}
                onExcluir={() => {
                  if (confirm(`Excluir o risco "${risco.titulo}"?`)) excluirRisco.mutate({ id: risco.id });
                }}
                empresaId={empresaId}
                onVerHistorico={(id) => setRiscoHistorico(id)}
              />
            ))}
          </div>
        </TabsContent>

        {/* ── HISTÓRICO GERAL DA EMPRESA ───────────────────────────────── */}
        <TabsContent value="historico" className="space-y-4 mt-4">
          <HistoricoEmpresa empresaId={empresaId} onVerRisco={(id) => setRiscoHistorico(id)} />
        </TabsContent>

        {/* ── MATRIZ DE CALOR ───────────────────────────────────────────── */}
        <TabsContent value="matriz" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Matriz de Risco (Probabilidade × Impacto)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="p-3 text-left text-gray-500 font-medium">Prob. \ Impacto</th>
                      <th className="p-3 bg-green-50 text-green-700 font-medium rounded-tl">Baixo</th>
                      <th className="p-3 bg-yellow-50 text-yellow-700 font-medium">Médio</th>
                      <th className="p-3 bg-red-50 text-red-700 font-medium rounded-tr">Alto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { prob: "alta", label: "Alta", cells: [{ bg: "bg-yellow-100", sev: "media" }, { bg: "bg-orange-100", sev: "alta" }, { bg: "bg-red-200", sev: "critica" }] },
                      { prob: "media", label: "Média", cells: [{ bg: "bg-green-100", sev: "baixa" }, { bg: "bg-yellow-100", sev: "media" }, { bg: "bg-orange-100", sev: "alta" }] },
                      { prob: "baixa", label: "Baixa", cells: [{ bg: "bg-green-50", sev: "baixa" }, { bg: "bg-green-100", sev: "baixa" }, { bg: "bg-yellow-100", sev: "media" }] },
                    ].map(({ prob, label, cells }) => (
                      <tr key={prob}>
                        <td className="p-3 text-left font-medium text-gray-600">{label}</td>
                        {cells.map(({ bg, sev }, idx) => {
                          const impactos = ["baixo", "medio", "alto"];
                          const count = r?.matrizCalor[`${prob}_${impactos[idx]}`] ?? 0;
                          return (
                            <td key={idx} className={`p-4 ${bg} border border-white`}>
                              <span className={`text-2xl font-bold ${count > 0 ? "text-gray-800" : "text-gray-300"}`}>{count}</span>
                              {count > 0 && <p className="text-xs text-gray-500 mt-1">{sev}</p>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-4 mt-4 justify-center flex-wrap">
                {[
                  { label: "Crítico", color: "bg-red-500" },
                  { label: "Alto", color: "bg-orange-500" },
                  { label: "Médio", color: "bg-yellow-500" },
                  { label: "Baixo", color: "bg-green-500" },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── MODAL NOVO RISCO ─────────────────────────────────────────────────── */}
      <Dialog open={modalNovoRisco} onOpenChange={setModalNovoRisco}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Risco</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título do Risco *</Label>
              <Input placeholder="Ex: Desvio orçamentário em campo" value={formRisco.titulo} onChange={e => setFormRisco(f => ({ ...f, titulo: e.target.value }))} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea placeholder="Descreva o risco em detalhes..." value={formRisco.descricao} onChange={e => setFormRisco(f => ({ ...f, descricao: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Origem</Label>
                <Select value={formRisco.origem} onValueChange={v => setFormRisco(f => ({ ...f, origem: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orcamentario">Orçamentário</SelectItem>
                    <SelectItem value="estrategico">Estratégico</SelectItem>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="contratual">Contratual</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="regulatorio">Regulatório</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={formRisco.categoria} onValueChange={v => setFormRisco(f => ({ ...f, categoria: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="juridico">Jurídico</SelectItem>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="prazo">Prazo</SelectItem>
                    <SelectItem value="escopo">Escopo</SelectItem>
                    <SelectItem value="reputacional">Reputacional</SelectItem>
                    <SelectItem value="regulatorio">Regulatório</SelectItem>
                    <SelectItem value="rh">RH</SelectItem>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Probabilidade</Label>
                <Select value={formRisco.probabilidade} onValueChange={v => setFormRisco(f => ({ ...f, probabilidade: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Impacto</Label>
                <Select value={formRisco.impacto} onValueChange={v => setFormRisco(f => ({ ...f, impacto: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixo">Baixo</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Responsável</Label>
              <Input placeholder="Nome do responsável pelo risco" value={formRisco.responsavel} onChange={e => setFormRisco(f => ({ ...f, responsavel: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalNovoRisco(false)}>Cancelar</Button>
            <Button onClick={handleCriarRisco} disabled={criarRisco.isPending}>
              {criarRisco.isPending ? "Salvando..." : "Cadastrar Risco"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL HISTÓRICO DO RISCO ─────────────────────────────────────────── */}
      <Dialog open={!!riscoHistorico} onOpenChange={() => { setRiscoHistorico(null); setComentario(""); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" />
              Histórico de Alterações
            </DialogTitle>
          </DialogHeader>
          {riscoHistorico && (
            <HistoricoRisco
              riscoId={riscoHistorico}
              empresaId={empresaId}
              comentario={comentario}
              setComentario={setComentario}
              onEnviarComentario={() => {
                if (!comentario.trim()) return;
                adicionarComentario.mutate({ riscoId: riscoHistorico, empresaId, comentario });
              }}
              enviando={adicionarComentario.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL GERAR PLANO IA ─────────────────────────────────────────────── */}
      <Dialog open={!!modalPlanoIA} onOpenChange={() => setModalPlanoIA(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Gerar Plano de Ação com IA
            </DialogTitle>
          </DialogHeader>
          {modalPlanoIA && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">{modalPlanoIA.titulo}</p>
                <div className="flex gap-2 mt-2">
                  <Badge className={`${SEVERIDADE_COLOR[modalPlanoIA.severidade]} text-xs`}>
                    {modalPlanoIA.severidade}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{ORIGEM_LABEL[modalPlanoIA.origem]}</Badge>
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>A IA irá gerar um plano de ação personalizado com:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-500 ml-2">
                  <li>Ações concretas para mitigar o risco</li>
                  <li>Foco em corte de custos sem impactar operações</li>
                  <li>Benchmarking com empresas do mesmo setor</li>
                  <li>Prazo de implementação de até 90 dias</li>
                </ul>
              </div>
              {gerando && (
                <div className="flex items-center gap-2 text-purple-600 text-sm">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  Gerando plano de ação...
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalPlanoIA(null)} disabled={gerando}>Cancelar</Button>
            <Button onClick={handleGerarPlanoIA} disabled={gerando} className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Sparkles className="w-4 h-4" />
              {gerando ? "Gerando..." : "Gerar com IA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── HISTÓRICO RISCO ─────────────────────────────────────────────────────────

const EVENTO_ICON: Record<string, React.ReactNode> = {
  criado: <PlusCircle className="w-4 h-4 text-green-500" />,
  editado: <FileEdit className="w-4 h-4 text-blue-500" />,
  excluido: <MinusCircle className="w-4 h-4 text-red-500" />,
  plano_criado: <Target className="w-4 h-4 text-indigo-500" />,
  plano_ia: <Bot className="w-4 h-4 text-purple-500" />,
  status_alterado: <RefreshCw className="w-4 h-4 text-orange-500" />,
  comentario: <MessageSquare className="w-4 h-4 text-gray-500" />,
};

const EVENTO_LABEL: Record<string, string> = {
  criado: "Risco criado",
  editado: "Risco editado",
  excluido: "Risco excluído",
  plano_criado: "Plano de ação criado",
  plano_ia: "Plano gerado por IA",
  status_alterado: "Status alterado",
  comentario: "Comentário",
};

function HistoricoItem({ item }: { item: HistoricoItem }) {
  const [expandido, setExpandido] = useState(false);
  const temDetalhes = item.camposAlterados && Object.keys(item.camposAlterados).length > 0;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          {EVENTO_ICON[item.tipoEvento] ?? <History className="w-4 h-4 text-gray-400" />}
        </div>
        <div className="w-0.5 bg-gray-100 flex-1 mt-1" />
      </div>
      <div className="pb-4 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-700">{EVENTO_LABEL[item.tipoEvento] ?? item.tipoEvento}</span>
          {item.userName && <span className="text-xs text-gray-400">por {item.userName}</span>}
          <span className="text-xs text-gray-300 ml-auto">{new Date(item.createdAt).toLocaleString("pt-BR")}</span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5">{item.descricao}</p>
        {temDetalhes && (
          <button
            className="text-xs text-blue-500 hover:text-blue-700 mt-1 flex items-center gap-1"
            onClick={() => setExpandido(!expandido)}
          >
            {expandido ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {expandido ? "Ocultar detalhes" : "Ver campos alterados"}
          </button>
        )}
        {expandido && temDetalhes && (
          <div className="mt-2 space-y-1">
            {Object.entries(item.camposAlterados as Record<string, { de: any; para: any }>).map(([campo, { de, para }]) => (
              <div key={campo} className="text-xs bg-gray-50 rounded p-2">
                <span className="font-medium text-gray-600">{campo}:</span>{" "}
                <span className="text-red-500 line-through">{String(de ?? "—")}</span>{" → "}
                <span className="text-green-600 font-medium">{String(para ?? "—")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoricoRisco({ riscoId, empresaId, comentario, setComentario, onEnviarComentario, enviando }: {
  riscoId: number;
  empresaId: number;
  comentario: string;
  setComentario: (v: string) => void;
  onEnviarComentario: () => void;
  enviando: boolean;
}) {
  const historico = trpc.gestaoRiscos.listHistorico.useQuery({ riscoId });

  return (
    <div className="flex flex-col gap-4 overflow-hidden">
      <div className="overflow-y-auto flex-1 max-h-[50vh] pr-1">
        {historico.isLoading && <p className="text-sm text-gray-400 text-center py-8">Carregando histórico...</p>}
        {!historico.isLoading && (!historico.data || historico.data.length === 0) && (
          <div className="text-center py-8 text-gray-400">
            <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma alteração registrada ainda</p>
          </div>
        )}
        <div className="space-y-0">
          {historico.data?.map((item) => (
            <HistoricoItem key={item.id} item={item as HistoricoItem} />
          ))}
        </div>
      </div>
      {/* Caixa de comentário */}
      <div className="border-t pt-3">
        <p className="text-xs text-gray-500 mb-2 font-medium">Adicionar comentário</p>
        <div className="flex gap-2">
          <Textarea
            placeholder="Escreva uma observação sobre este risco..."
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            rows={2}
            className="text-sm resize-none"
            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) onEnviarComentario(); }}
          />
          <Button
            size="sm"
            onClick={onEnviarComentario}
            disabled={!comentario.trim() || enviando}
            className="self-end gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            {enviando ? "..." : "Enviar"}
          </Button>
        </div>
        <p className="text-xs text-gray-300 mt-1">Ctrl+Enter para enviar</p>
      </div>
    </div>
  );
}

function HistoricoEmpresa({ empresaId, onVerRisco }: { empresaId: number; onVerRisco: (id: number) => void }) {
  const historico = trpc.gestaoRiscos.listHistoricoEmpresa.useQuery({ empresaId, limit: 50 });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Últimas 50 alterações em todos os riscos</h3>
        <Button variant="ghost" size="sm" onClick={() => historico.refetch()} className="gap-1 text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Atualizar
        </Button>
      </div>
      {historico.isLoading && <p className="text-sm text-gray-400 text-center py-8">Carregando...</p>}
      {!historico.isLoading && (!historico.data || historico.data.length === 0) && (
        <div className="text-center py-12 text-gray-400">
          <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma alteração registrada ainda</p>
          <p className="text-xs mt-1">O histórico será preenchido conforme os riscos forem criados e editados</p>
        </div>
      )}
      <div className="space-y-0">
        {historico.data?.map((item) => (
          <div key={item.id} className="flex gap-3 group">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                {EVENTO_ICON[item.tipoEvento] ?? <History className="w-4 h-4 text-gray-400" />}
              </div>
              <div className="w-0.5 bg-gray-100 flex-1 mt-1" />
            </div>
            <div className="pb-4 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-700">{EVENTO_LABEL[item.tipoEvento] ?? item.tipoEvento}</span>
                {item.userName && <span className="text-xs text-gray-400">por {item.userName}</span>}
                <button
                  className="text-xs text-blue-500 hover:underline ml-1"
                  onClick={() => onVerRisco(item.riscoId)}
                >
                  Ver risco #{item.riscoId}
                </button>
                <span className="text-xs text-gray-300 ml-auto">{new Date(item.createdAt).toLocaleString("pt-BR")}</span>
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{item.descricao}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RISCO CARD ───────────────────────────────────────────────────────────────

function RiscoCard({ risco, expanded, onToggle, onGerarPlanoIA, onExcluir, empresaId, onVerHistorico }: {
  risco: Risco;
  expanded: boolean;
  onToggle: () => void;
  onGerarPlanoIA: () => void;
  onExcluir: () => void;
  empresaId: number;
  onVerHistorico: (id: number) => void;
}) {
  const planos = trpc.gestaoRiscos.listPlanos.useQuery(
    { riscoId: risco.id },
    { enabled: expanded }
  );

  const deletePlano = trpc.gestaoRiscos.deletePlano.useMutation({
    onSuccess: () => planos.refetch(),
  });

  return (
    <Card className="overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${SEVERIDADE_DOT[risco.severidade]}`} />
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{risco.titulo}</p>
            <div className="flex gap-2 mt-1 flex-wrap">
              <Badge className={`${SEVERIDADE_COLOR[risco.severidade]} text-xs border`}>
                {risco.severidade}
              </Badge>
              <Badge className={`${STATUS_COLOR[risco.status]} text-xs`}>
                {risco.status.replace("_", " ")}
              </Badge>
              <span className="text-xs text-gray-400">{ORIGEM_LABEL[risco.origem]}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <Button
            variant="ghost" size="sm"
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-1"
            onClick={e => { e.stopPropagation(); onGerarPlanoIA(); }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs hidden sm:inline">Plano IA</span>
          </Button>
          <Button
            variant="ghost" size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={e => { e.stopPropagation(); onExcluir(); }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t bg-gray-50 p-4 space-y-4">
          {/* Detalhes do risco */}
          {risco.descricao && (
            <p className="text-sm text-gray-600">{risco.descricao}</p>
          )}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-gray-400 uppercase tracking-wide">Probabilidade</span>
              <p className="font-medium capitalize mt-0.5">{risco.probabilidade}</p>
            </div>
            <div>
              <span className="text-gray-400 uppercase tracking-wide">Impacto</span>
              <p className="font-medium capitalize mt-0.5">{risco.impacto}</p>
            </div>
            <div>
              <span className="text-gray-400 uppercase tracking-wide">Responsável</span>
              <p className="font-medium mt-0.5">{risco.responsavel || "—"}</p>
            </div>
          </div>

          {/* Histórico do risco */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <History className="w-4 h-4 text-gray-400" />
              Histórico de Alterações
            </h4>
            <Button
              variant="ghost" size="sm"
              className="text-xs text-gray-500 gap-1"
              onClick={e => { e.stopPropagation(); onVerHistorico(risco.id); }}
            >
              <History className="w-3.5 h-3.5" /> Ver histórico completo
            </Button>
          </div>

          {/* Planos de ação */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-500" />
                Planos de Ação ({planos.data?.length ?? 0})
              </h4>
              <Button
                variant="outline" size="sm"
                className="gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                onClick={onGerarPlanoIA}
              >
                <Sparkles className="w-3.5 h-3.5" /> Gerar com IA
              </Button>
            </div>

            {planos.isLoading && <p className="text-xs text-gray-400">Carregando planos...</p>}
            {planos.data?.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-3">
                Nenhum plano de ação cadastrado. Use a IA para gerar um automaticamente.
              </p>
            )}

            <div className="space-y-3">
              {planos.data?.map((plano) => (
                <PlanoCard key={plano.id} plano={plano} onExcluir={() => deletePlano.mutate({ id: plano.id })} />
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── PLANO CARD ───────────────────────────────────────────────────────────────

function PlanoCard({ plano, onExcluir }: { plano: PlanoAcao; onExcluir: () => void }) {
  const [expandido, setExpandido] = useState(false);
  const acoes: any[] = Array.isArray(plano.acoes) ? plano.acoes : (plano.acoes ? JSON.parse(plano.acoes as string) : []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {plano.geradoPorIA && <Sparkles className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />}
          <p className="text-sm font-medium text-gray-800 truncate">{plano.titulo}</p>
          <Badge variant="outline" className="text-xs flex-shrink-0">
            {TIPO_PRIORIDADE_LABEL[plano.tipoPrioridade] || plano.tipoPrioridade}
          </Badge>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-500 h-7 w-7 p-0"
            onClick={e => { e.stopPropagation(); onExcluir(); }}>
            <Trash2 className="w-3 h-3" />
          </Button>
          {expandido ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expandido && (
        <div className="border-t p-3 space-y-3 text-sm">
          {plano.objetivo && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Objetivo</p>
              <p className="text-gray-700">{plano.objetivo}</p>
            </div>
          )}
          {plano.descricao && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Descrição</p>
              <p className="text-gray-600">{plano.descricao}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 text-xs">
            {plano.economiaEstimada && (
              <div className="bg-green-50 rounded p-2">
                <p className="text-green-600 font-medium flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> Economia Est.
                </p>
                <p className="text-green-800 font-semibold mt-0.5">{plano.economiaEstimada}</p>
              </div>
            )}
            {plano.prazoImplementacao && (
              <div className="bg-blue-50 rounded p-2">
                <p className="text-blue-600 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Prazo
                </p>
                <p className="text-blue-800 font-semibold mt-0.5">{plano.prazoImplementacao}</p>
              </div>
            )}
            {plano.impactoOperacional && (
              <div className="bg-gray-50 rounded p-2">
                <p className="text-gray-500 font-medium">Impacto Op.</p>
                <p className={`font-semibold mt-0.5 capitalize ${IMPACTO_OP_COLOR[plano.impactoOperacional]}`}>
                  {plano.impactoOperacional}
                </p>
              </div>
            )}
          </div>

          {plano.benchmarking && (
            <div className="bg-purple-50 rounded p-2">
              <p className="text-xs text-purple-600 font-medium mb-1">Benchmarking / Boas Práticas</p>
              <p className="text-xs text-purple-800">{plano.benchmarking}</p>
            </div>
          )}

          {acoes.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Ações ({acoes.length})</p>
              <div className="space-y-1.5">
                {acoes.map((acao: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                    {acao.status === "concluido"
                      ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      : acao.status === "em_andamento"
                      ? <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      : <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800">{acao.acao}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {acao.responsavel && `${acao.responsavel} · `}{acao.prazo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
