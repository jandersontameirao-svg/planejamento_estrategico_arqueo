import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  ArrowLeft, Scale, TrendingUp, TrendingDown, Building2, Wallet,
  Upload, BarChart3, FileText, AlertTriangle, CheckCircle, Info,
  ChevronDown, ChevronUp, Minus
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface BalancoDados {
  id: number;
  empresaId: number;
  mes: number;
  ano: number;
  ativoTangivel: number | null;
  ativoIntangivel: number | null;
  amortizacao: number | null;
  clientes: number | null;
  outrosAtivosFinanceiros: number | null;
  outrosAtivosCorrentes: number | null;
  caixaBancos: number | null;
  emprestimosObtidos: number | null;
  provisoes: number | null;
  fornecedores: number | null;
  outrosPassivosFinanceiros: number | null;
  impostosAPagar: number | null;
  outrasContasAPagar: number | null;
  outrosPassivosCorrentes: number | null;
  capitalSocial: number | null;
  reservas: number | null;
  prestacoesSupplementares: number | null;
  resultadosTransitados: number | null;
  resultadoLiquidoExercicio: number | null;
  status: string;
  observacoes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const n = (v: number | null | undefined) => Number(v ?? 0);

function calcularTotais(d: BalancoDados) {
  // ATIVO NÃO CORRENTE
  const ativoNaoCorrente = n(d.ativoTangivel) + n(d.ativoIntangivel) - n(d.amortizacao);
  // ATIVO CORRENTE
  const ativoCorrente = n(d.clientes) + n(d.outrosAtivosFinanceiros) + n(d.outrosAtivosCorrentes) + n(d.caixaBancos);
  // TOTAL ATIVO
  const totalAtivo = ativoNaoCorrente + ativoCorrente;

  // PASSIVO NÃO CORRENTE
  const passivoNaoCorrente = n(d.emprestimosObtidos) + n(d.provisoes);
  // PASSIVO CORRENTE
  const passivoCorrente = n(d.fornecedores) + n(d.outrosPassivosFinanceiros) + n(d.impostosAPagar) + n(d.outrasContasAPagar) + n(d.outrosPassivosCorrentes);
  // TOTAL PASSIVO
  const totalPassivo = passivoNaoCorrente + passivoCorrente;

  // PATRIMÔNIO LÍQUIDO
  const patrimonioLiquido = n(d.capitalSocial) + n(d.reservas) + n(d.prestacoesSupplementares) + n(d.resultadosTransitados) + n(d.resultadoLiquidoExercicio);

  // INDICADORES
  const liquidezCorrente = passivoCorrente > 0 ? ativoCorrente / passivoCorrente : 0;
  const liquidezImediata = passivoCorrente > 0 ? n(d.caixaBancos) / passivoCorrente : 0;
  const solvencia = totalPassivo > 0 ? totalAtivo / totalPassivo : 0;
  const endividamento = totalAtivo > 0 ? (totalPassivo / totalAtivo) * 100 : 0;
  const autonomiaFinanceira = totalAtivo > 0 ? (patrimonioLiquido / totalAtivo) * 100 : 0;

  return {
    ativoNaoCorrente, ativoCorrente, totalAtivo,
    passivoNaoCorrente, passivoCorrente, totalPassivo,
    patrimonioLiquido,
    liquidezCorrente, liquidezImediata, solvencia, endividamento, autonomiaFinanceira
  };
}

function fmt(v: number, moeda = "MT") {
  if (Math.abs(v) >= 1_000_000) return `${moeda} ${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `${moeda} ${(v / 1_000).toFixed(1)}K`;
  return `${moeda} ${v.toFixed(2)}`;
}

function fmtPct(v: number) { return `${v.toFixed(1)}%`; }

function semaforo(valor: number, verde: number, amarelo: number, invertido = false): "verde" | "amarelo" | "vermelho" {
  if (!invertido) {
    if (valor >= verde) return "verde";
    if (valor >= amarelo) return "amarelo";
    return "vermelho";
  } else {
    if (valor <= verde) return "verde";
    if (valor <= amarelo) return "amarelo";
    return "vermelho";
  }
}

function SemaforoIcon({ status }: { status: "verde" | "amarelo" | "vermelho" }) {
  if (status === "verde") return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (status === "amarelo") return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  return <AlertTriangle className="w-4 h-4 text-red-500" />;
}

function VariacaoIcon({ v }: { v: number }) {
  if (v > 0) return <TrendingUp className="w-3 h-3 text-green-500" />;
  if (v < 0) return <TrendingDown className="w-3 h-3 text-red-500" />;
  return <Minus className="w-3 h-3 text-gray-400" />;
}

const ANOS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const CORES = ["#E8632A", "#224887", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function BalancoPatrimonial() {
  const { empresaId } = useParams<{ empresaId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const id = Number(empresaId);

  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [abaAtiva, setAbaAtiva] = useState("dashboard");

  const { data: empresa } = trpc.empresas.getById.useQuery({ id }, { enabled: !!id });
  const { data: dadosRaw, isLoading, refetch } = trpc.balanco.getDadosConsolidados.useQuery(
    { empresaId: id, ano: anoSelecionado },
    { enabled: !!id }
  );
  const { data: uploads, refetch: refetchUploads } = trpc.balanco.getUploads.useQuery(
    { empresaId: id },
    { enabled: !!id }
  );

  const dados = useMemo(() => dadosRaw ?? [], [dadosRaw]);

  // Dados consolidados do ano (soma ou último mês)
  const dadoConsolidado = useMemo(() => {
    if (!dados.length) return null;
    // Usar o último mês com dados
    return dados[dados.length - 1] as BalancoDados;
  }, [dados]);

  const totais = useMemo(() => dadoConsolidado ? calcularTotais(dadoConsolidado) : null, [dadoConsolidado]);

  // Dados para gráfico de evolução
  const dadosGrafico = useMemo(() => dados.map((d) => {
    const t = calcularTotais(d as BalancoDados);
    return {
      mes: MESES[(d.mes ?? 1) - 1],
      ativo: t.totalAtivo,
      passivo: t.totalPassivo,
      pl: t.patrimonioLiquido,
      liquidez: t.liquidezCorrente,
    };
  }), [dados]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://arqueoplan-gdpaurog.manus.space/logo.png" alt="Grupo Arqueo" className="h-8 w-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <div className="h-6 w-px bg-gray-300" />
            <Scale className="w-5 h-5 text-blue-600" />
            <div>
              <h1 className="text-base font-semibold text-gray-900">Balanço Patrimonial</h1>
              <p className="text-xs text-gray-500">{empresa?.nome ?? "Carregando..."}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(anoSelecionado)} onValueChange={(v) => setAnoSelecionado(Number(v))}>
              <SelectTrigger className="w-24 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANOS.map((a) => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/empresa/${id}`)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard"><BarChart3 className="w-4 h-4 mr-1" />Dashboard</TabsTrigger>
            <TabsTrigger value="detalhado"><FileText className="w-4 h-4 mr-1" />Detalhado</TabsTrigger>
            <TabsTrigger value="upload"><Upload className="w-4 h-4 mr-1" />Upload</TabsTrigger>
            <TabsTrigger value="comparativo"><TrendingUp className="w-4 h-4 mr-1" />Comparativo</TabsTrigger>
          </TabsList>

          {/* ── ABA DASHBOARD ── */}
          <TabsContent value="dashboard">
            <AbaDashboard
              dados={dados as BalancoDados[]}
              totais={totais}
              dadoConsolidado={dadoConsolidado}
              dadosGrafico={dadosGrafico}
              isLoading={isLoading}
              anoSelecionado={anoSelecionado}
            />
          </TabsContent>

          {/* ── ABA DETALHADO ── */}
          <TabsContent value="detalhado">
            <AbaDetalhado
              dados={dados as BalancoDados[]}
              empresaId={id}
              anoSelecionado={anoSelecionado}
              onSalvo={() => refetch()}
              userName={user?.name ?? ""}
            />
          </TabsContent>

          {/* ── ABA UPLOAD ── */}
          <TabsContent value="upload">
            <AbaUpload
              empresaId={id}
              uploads={uploads ?? []}
              onUploaded={() => { refetch(); refetchUploads(); }}
            />
          </TabsContent>

          {/* ── ABA COMPARATIVO ── */}
          <TabsContent value="comparativo">
            <AbaComparativo empresaId={id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Aba Dashboard ────────────────────────────────────────────────────────────
function AbaDashboard({ dados, totais, dadoConsolidado, dadosGrafico, isLoading, anoSelecionado }: {
  dados: BalancoDados[];
  totais: ReturnType<typeof calcularTotais> | null;
  dadoConsolidado: BalancoDados | null;
  dadosGrafico: { mes: string; ativo: number; passivo: number; pl: number; liquidez: number }[];
  isLoading: boolean;
  anoSelecionado: number;
}) {
  const kpis = totais ? [
    {
      titulo: "Total do Ativo",
      valor: fmt(totais.totalAtivo),
      sub: `Corrente: ${fmt(totais.ativoCorrente)} | Não Corrente: ${fmt(totais.ativoNaoCorrente)}`,
      icone: <Building2 className="w-5 h-5 text-blue-600" />,
      cor: "blue",
      status: null,
    },
    {
      titulo: "Total do Passivo",
      valor: fmt(totais.totalPassivo),
      sub: `Corrente: ${fmt(totais.passivoCorrente)} | Não Corrente: ${fmt(totais.passivoNaoCorrente)}`,
      icone: <Wallet className="w-5 h-5 text-red-500" />,
      cor: "red",
      status: null,
    },
    {
      titulo: "Patrimônio Líquido",
      valor: fmt(totais.patrimonioLiquido),
      sub: `${fmtPct(totais.autonomiaFinanceira)} do ativo total`,
      icone: <Scale className="w-5 h-5 text-green-600" />,
      cor: "green",
      status: semaforo(totais.patrimonioLiquido, 1, 0),
    },
    {
      titulo: "Liquidez Corrente",
      valor: totais.liquidezCorrente.toFixed(2),
      sub: totais.liquidezCorrente >= 1.5 ? "Solvente" : totais.liquidezCorrente >= 1 ? "Atenção" : "Crítico",
      icone: <TrendingUp className="w-5 h-5 text-orange-500" />,
      cor: "orange",
      status: semaforo(totais.liquidezCorrente, 1.5, 1.0),
    },
    {
      titulo: "Liquidez Imediata",
      valor: totais.liquidezImediata.toFixed(2),
      sub: "Caixa / Passivo Corrente",
      icone: <Wallet className="w-5 h-5 text-purple-500" />,
      cor: "purple",
      status: semaforo(totais.liquidezImediata, 0.5, 0.2),
    },
    {
      titulo: "Endividamento",
      valor: fmtPct(totais.endividamento),
      sub: `Autonomia: ${fmtPct(totais.autonomiaFinanceira)}`,
      icone: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      cor: "yellow",
      status: semaforo(totais.endividamento, 40, 60, true),
    },
    {
      titulo: "Solvência Geral",
      valor: totais.solvencia.toFixed(2),
      sub: totais.solvencia >= 1.5 ? "Excelente" : totais.solvencia >= 1 ? "Adequada" : "Insuficiente",
      icone: <CheckCircle className="w-5 h-5 text-teal-500" />,
      cor: "teal",
      status: semaforo(totais.solvencia, 1.5, 1.0),
    },
    {
      titulo: "Capital de Giro",
      valor: fmt(totais.ativoCorrente - totais.passivoCorrente),
      sub: "Ativo Corrente − Passivo Corrente",
      icone: <TrendingUp className="w-5 h-5 text-indigo-500" />,
      cor: "indigo",
      status: semaforo(totais.ativoCorrente - totais.passivoCorrente, 1, 0),
    },
  ] : [];

  // Dados para gráfico de pizza (composição do ativo)
  const pizzaAtivo = dadoConsolidado ? [
    { name: "Ativo Tangível", value: n(dadoConsolidado.ativoTangivel) },
    { name: "Ativo Intangível", value: n(dadoConsolidado.ativoIntangivel) },
    { name: "Clientes (Receber)", value: n(dadoConsolidado.clientes) },
    { name: "Caixa e Bancos", value: n(dadoConsolidado.caixaBancos) },
    { name: "Outros Correntes", value: n(dadoConsolidado.outrosAtivosCorrentes) + n(dadoConsolidado.outrosAtivosFinanceiros) },
  ].filter(d => d.value > 0) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <Scale className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.length === 0 ? (
          <div className="col-span-4 bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
            <Scale className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum dado de Balanço Patrimonial para {anoSelecionado}</p>
            <p className="text-sm mt-1">Importe dados na aba "Upload" ou lance manualmente na aba "Detalhado".</p>
          </div>
        ) : kpis.map((kpi) => (
          <Card key={kpi.titulo} className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-gray-50 rounded-lg">{kpi.icone}</div>
                {kpi.status && <SemaforoIcon status={kpi.status} />}
              </div>
              <p className="text-xs text-gray-500 mb-1">{kpi.titulo}</p>
              <p className="text-xl font-bold text-gray-900">{kpi.valor}</p>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {dados.length > 0 && (
        <>
          {/* Gráfico de evolução */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">Evolução Mensal — Ativo, Passivo e Patrimônio Líquido</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dadosGrafico} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="ativo" name="Total Ativo" fill="#224887" radius={[3,3,0,0]} />
                  <Bar dataKey="passivo" name="Total Passivo" fill="#ef4444" radius={[3,3,0,0]} />
                  <Bar dataKey="pl" name="Patrimônio Líquido" fill="#10b981" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Liquidez */}
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">Evolução da Liquidez Corrente</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, "auto"]} />
                    <Tooltip formatter={(v: number) => v.toFixed(2)} />
                    <Line type="monotone" dataKey="liquidez" name="Liquidez Corrente" stroke="#E8632A" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pizza composição do ativo */}
            {pizzaAtivo.length > 0 && (
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700">Composição do Ativo (último período)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pizzaAtivo} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {pizzaAtivo.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => fmt(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Aba Detalhado ────────────────────────────────────────────────────────────
function AbaDetalhado({ dados, empresaId, anoSelecionado, onSalvo, userName }: {
  dados: BalancoDados[];
  empresaId: number;
  anoSelecionado: number;
  onSalvo: () => void;
  userName: string;
}) {
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [editando, setEditando] = useState(false);

  const dadoMes = dados.find(d => d.mes === mesSelecionado) ?? null;
  const totaisMes = dadoMes ? calcularTotais(dadoMes) : null;

  const [form, setForm] = useState({
    ativoTangivel: 0, ativoIntangivel: 0, amortizacao: 0,
    clientes: 0, outrosAtivosFinanceiros: 0, outrosAtivosCorrentes: 0, caixaBancos: 0,
    emprestimosObtidos: 0, provisoes: 0, fornecedores: 0,
    outrosPassivosFinanceiros: 0, impostosAPagar: 0, outrasContasAPagar: 0, outrosPassivosCorrentes: 0,
    capitalSocial: 0, reservas: 0, prestacoesSupplementares: 0,
    resultadosTransitados: 0, resultadoLiquidoExercicio: 0,
  });

  const salvarMutation = trpc.balanco.salvarDados.useMutation({
    onSuccess: () => { toast.success("Dados salvos com sucesso!"); setEditando(false); onSalvo(); },
    onError: (e) => toast.error(`Erro ao salvar: ${e.message}`),
  });

  function iniciarEdicao() {
    if (dadoMes) {
      setForm({
        ativoTangivel: n(dadoMes.ativoTangivel), ativoIntangivel: n(dadoMes.ativoIntangivel),
        amortizacao: n(dadoMes.amortizacao), clientes: n(dadoMes.clientes),
        outrosAtivosFinanceiros: n(dadoMes.outrosAtivosFinanceiros),
        outrosAtivosCorrentes: n(dadoMes.outrosAtivosCorrentes), caixaBancos: n(dadoMes.caixaBancos),
        emprestimosObtidos: n(dadoMes.emprestimosObtidos), provisoes: n(dadoMes.provisoes),
        fornecedores: n(dadoMes.fornecedores), outrosPassivosFinanceiros: n(dadoMes.outrosPassivosFinanceiros),
        impostosAPagar: n(dadoMes.impostosAPagar), outrasContasAPagar: n(dadoMes.outrasContasAPagar),
        outrosPassivosCorrentes: n(dadoMes.outrosPassivosCorrentes), capitalSocial: n(dadoMes.capitalSocial),
        reservas: n(dadoMes.reservas), prestacoesSupplementares: n(dadoMes.prestacoesSupplementares),
        resultadosTransitados: n(dadoMes.resultadosTransitados),
        resultadoLiquidoExercicio: n(dadoMes.resultadoLiquidoExercicio),
      });
    }
    setEditando(true);
  }

  function salvar() {
    salvarMutation.mutate({
      empresaId, mes: mesSelecionado, ano: anoSelecionado,
      ...form,
    });
  }

  const campos = [
    { grupo: "ATIVO NÃO CORRENTE", itens: [
      { label: "Ativo Tangível (Imobilizado)", key: "ativoTangivel" },
      { label: "Ativo Intangível", key: "ativoIntangivel" },
      { label: "(-) Amortizações/Depreciações", key: "amortizacao" },
    ]},
    { grupo: "ATIVO CORRENTE", itens: [
      { label: "Clientes (Contas a Receber)", key: "clientes" },
      { label: "Outros Ativos Financeiros", key: "outrosAtivosFinanceiros" },
      { label: "Outros Ativos Correntes", key: "outrosAtivosCorrentes" },
      { label: "Caixa e Equivalentes de Caixa", key: "caixaBancos" },
    ]},
    { grupo: "PASSIVO NÃO CORRENTE", itens: [
      { label: "Empréstimos Obtidos (LP)", key: "emprestimosObtidos" },
      { label: "Provisões", key: "provisoes" },
    ]},
    { grupo: "PASSIVO CORRENTE", itens: [
      { label: "Fornecedores", key: "fornecedores" },
      { label: "Outros Passivos Financeiros", key: "outrosPassivosFinanceiros" },
      { label: "Impostos a Pagar", key: "impostosAPagar" },
      { label: "Outras Contas a Pagar", key: "outrasContasAPagar" },
      { label: "Outros Passivos Correntes", key: "outrosPassivosCorrentes" },
    ]},
    { grupo: "PATRIMÔNIO LÍQUIDO", itens: [
      { label: "Capital Social", key: "capitalSocial" },
      { label: "Reservas", key: "reservas" },
      { label: "Prestações Suplementares", key: "prestacoesSupplementares" },
      { label: "Resultados Transitados", key: "resultadosTransitados" },
      { label: "Resultado Líquido do Exercício", key: "resultadoLiquidoExercicio" },
    ]},
  ];

  return (
    <div className="space-y-4">
      {/* Seletor de mês */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4">
        <Label className="text-sm font-medium text-gray-700">Mês:</Label>
        <div className="flex gap-1 flex-wrap">
          {MESES.map((m, i) => {
            const temDados = dados.some(d => d.mes === i + 1);
            return (
              <button
                key={m}
                onClick={() => { setMesSelecionado(i + 1); setEditando(false); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  mesSelecionado === i + 1
                    ? "bg-blue-600 text-white"
                    : temDados
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex gap-2">
          {!editando ? (
            <Button size="sm" onClick={iniciarEdicao} className="bg-blue-600 hover:bg-blue-700 text-white">
              {dadoMes ? "Editar" : "Lançar Dados"}
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditando(false)}>Cancelar</Button>
              <Button size="sm" onClick={salvar} disabled={salvarMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                {salvarMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabela de balanço */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-semibold text-gray-700 w-1/2">Conta</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">Valor (MT)</th>
              {!editando && <th className="text-right px-4 py-3 font-semibold text-gray-700 w-24">% Ativo</th>}
            </tr>
          </thead>
          <tbody>
            {campos.map(({ grupo, itens }) => {
              const isAtivo = grupo.startsWith("ATIVO");
              const isPassivo = grupo.startsWith("PASSIVO");
              const isPL = grupo.startsWith("PATRIMÔNIO");
              const bgGrupo = isAtivo ? "bg-blue-50" : isPassivo ? "bg-red-50" : "bg-green-50";
              const textGrupo = isAtivo ? "text-blue-700" : isPassivo ? "text-red-700" : "text-green-700";

              // Totais do grupo
              let totalGrupo = 0;
              if (grupo === "ATIVO NÃO CORRENTE") totalGrupo = totaisMes?.ativoNaoCorrente ?? 0;
              else if (grupo === "ATIVO CORRENTE") totalGrupo = totaisMes?.ativoCorrente ?? 0;
              else if (grupo === "PASSIVO NÃO CORRENTE") totalGrupo = totaisMes?.passivoNaoCorrente ?? 0;
              else if (grupo === "PASSIVO CORRENTE") totalGrupo = totaisMes?.passivoCorrente ?? 0;
              else if (grupo === "PATRIMÔNIO LÍQUIDO") totalGrupo = totaisMes?.patrimonioLiquido ?? 0;

              return [
                <tr key={`g-${grupo}`} className={`${bgGrupo} border-b border-gray-100`}>
                  <td colSpan={editando ? 2 : 3} className={`px-4 py-2 font-semibold text-xs uppercase tracking-wide ${textGrupo}`}>
                    {grupo}
                    {!editando && totaisMes && (
                      <span className="ml-2 font-bold">{fmt(totalGrupo)}</span>
                    )}
                  </td>
                </tr>,
                ...itens.map(({ label, key }) => {
                  const valor = dadoMes ? n((dadoMes as unknown as Record<string, number>)[key]) : 0;
                  const pct = totaisMes && totaisMes.totalAtivo > 0 ? (valor / totaisMes.totalAtivo) * 100 : 0;
                  return (
                    <tr key={key} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 text-gray-700 pl-8">{label}</td>
                      <td className="px-4 py-2.5 text-right">
                        {editando ? (
                          <Input
                            type="number"
                            value={(form as Record<string, number>)[key]}
                            onChange={(e) => setForm(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                            className="w-40 h-7 text-right text-sm ml-auto"
                          />
                        ) : (
                          <span className={`font-medium ${valor < 0 ? "text-red-600" : "text-gray-900"}`}>
                            {fmt(valor)}
                          </span>
                        )}
                      </td>
                      {!editando && (
                        <td className="px-4 py-2.5 text-right text-gray-400 text-xs">
                          {pct > 0 ? fmtPct(pct) : "—"}
                        </td>
                      )}
                    </tr>
                  );
                })
              ];
            })}

            {/* Totais finais */}
            {totaisMes && !editando && (
              <>
                <tr className="bg-blue-600 text-white font-bold">
                  <td className="px-4 py-3">TOTAL DO ATIVO</td>
                  <td className="px-4 py-3 text-right">{fmt(totaisMes.totalAtivo)}</td>
                  <td className="px-4 py-3 text-right">100%</td>
                </tr>
                <tr className="bg-red-600 text-white font-bold">
                  <td className="px-4 py-3">TOTAL DO PASSIVO</td>
                  <td className="px-4 py-3 text-right">{fmt(totaisMes.totalPassivo)}</td>
                  <td className="px-4 py-3 text-right">{fmtPct(totaisMes.totalAtivo > 0 ? (totaisMes.totalPassivo / totaisMes.totalAtivo) * 100 : 0)}</td>
                </tr>
                <tr className="bg-green-600 text-white font-bold">
                  <td className="px-4 py-3">PATRIMÔNIO LÍQUIDO</td>
                  <td className="px-4 py-3 text-right">{fmt(totaisMes.patrimonioLiquido)}</td>
                  <td className="px-4 py-3 text-right">{fmtPct(totaisMes.autonomiaFinanceira)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Aba Upload ────────────────────────────────────────────────────────────────
function AbaUpload({ empresaId, uploads, onUploaded }: {
  empresaId: number;
  uploads: { id: number; nomeArquivo: string; status: string; ano: number; createdAt: Date }[];
  onUploaded: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [anoUpload, setAnoUpload] = useState(new Date().getFullYear());

  const registrarMutation = trpc.balanco.registrarUpload.useMutation({
    onSuccess: () => { toast.success("Arquivo registrado. Processamento em andamento..."); onUploaded(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  function handleFile(file: File) {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "xlsx", "xls"].includes(ext ?? "")) {
      toast.error("Formato não suportado. Use PDF, XLSX ou XLS.");
      return;
    }
    registrarMutation.mutate({
      empresaId,
      ano: anoUpload,
      nomeArquivo: file.name,
      urlArquivo: URL.createObjectURL(file),
      tipoArquivo: (ext as "pdf" | "xlsx" | "xls") ?? "pdf",
    });
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700">Importar Balanço Patrimonial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Label className="text-sm">Ano de referência:</Label>
            <Select value={String(anoUpload)} onValueChange={(v) => setAnoUpload(Number(v))}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANOS.map((a) => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}`}
            onClick={() => document.getElementById("upload-balanco")?.click()}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-600">Arraste o arquivo aqui ou clique para selecionar</p>
            <p className="text-sm text-gray-400 mt-1">PDF, XLSX ou XLS — Balanço Patrimonial {anoUpload}</p>
            <input
              id="upload-balanco"
              type="file"
              accept=".pdf,.xlsx,.xls"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Histórico de uploads */}
      {uploads.length > 0 && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700">Histórico de Importações</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase">
                  <th className="text-left pb-2">Arquivo</th>
                  <th className="text-center pb-2">Ano</th>
                  <th className="text-center pb-2">Status</th>
                  <th className="text-right pb-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {u.nomeArquivo}
                    </td>
                    <td className="py-2.5 text-center text-gray-600">{u.ano}</td>
                    <td className="py-2.5 text-center">
                      <Badge variant={u.status === "consolidado" ? "default" : u.status === "erro" ? "destructive" : "secondary"}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Aba Comparativo ──────────────────────────────────────────────────────────
function AbaComparativo({ empresaId }: { empresaId: number }) {
  const anosDisponiveis = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const [anosComp, setAnosComp] = useState([2024, 2025]);

  const queries = anosComp.map((ano) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    trpc.balanco.getDadosConsolidados.useQuery({ empresaId, ano }, { enabled: !!empresaId })
  );

  const dadosPorAno = anosComp.map((ano, i) => {
    const dados = (queries[i].data ?? []) as BalancoDados[];
    if (!dados.length) return { ano, totais: null };
    const ultimo = dados[dados.length - 1];
    return { ano, totais: calcularTotais(ultimo) };
  });

  const dadosGrafico = [
    { nome: "Total Ativo", ...Object.fromEntries(dadosPorAno.map(d => [d.ano, d.totais?.totalAtivo ?? 0])) },
    { nome: "Total Passivo", ...Object.fromEntries(dadosPorAno.map(d => [d.ano, d.totais?.totalPassivo ?? 0])) },
    { nome: "Patrimônio Líquido", ...Object.fromEntries(dadosPorAno.map(d => [d.ano, d.totais?.patrimonioLiquido ?? 0])) },
    { nome: "Ativo Corrente", ...Object.fromEntries(dadosPorAno.map(d => [d.ano, d.totais?.ativoCorrente ?? 0])) },
    { nome: "Passivo Corrente", ...Object.fromEntries(dadosPorAno.map(d => [d.ano, d.totais?.passivoCorrente ?? 0])) },
  ];

  const indicadoresComp = [
    { nome: "Liquidez Corrente", key: "liquidezCorrente", fmt: (v: number) => v.toFixed(2) },
    { nome: "Liquidez Imediata", key: "liquidezImediata", fmt: (v: number) => v.toFixed(2) },
    { nome: "Solvência Geral", key: "solvencia", fmt: (v: number) => v.toFixed(2) },
    { nome: "Endividamento", key: "endividamento", fmt: (v: number) => fmtPct(v) },
    { nome: "Autonomia Financeira", key: "autonomiaFinanceira", fmt: (v: number) => fmtPct(v) },
    { nome: "Total do Ativo", key: "totalAtivo", fmt: fmt },
    { nome: "Total do Passivo", key: "totalPassivo", fmt: fmt },
    { nome: "Patrimônio Líquido", key: "patrimonioLiquido", fmt: fmt },
  ];

  return (
    <div className="space-y-6">
      {/* Seletor de anos */}
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Label className="text-sm font-medium">Comparar anos:</Label>
            {anosDisponiveis.map((ano) => (
              <button
                key={ano}
                onClick={() => setAnosComp(prev =>
                  prev.includes(ano)
                    ? prev.filter(a => a !== ano)
                    : prev.length < 4 ? [...prev, ano].sort() : prev
                )}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  anosComp.includes(ano)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {ano}
              </button>
            ))}
            <span className="text-xs text-gray-400 ml-2">Máx. 4 anos</span>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico comparativo */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Comparativo Ativo / Passivo / Patrimônio Líquido</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dadosGrafico} layout="vertical" margin={{ left: 120, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="nome" tick={{ fontSize: 11 }} width={120} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Legend />
              {anosComp.map((ano, i) => (
                <Bar key={ano} dataKey={String(ano)} name={String(ano)} fill={CORES[i]} radius={[0,3,3,0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de indicadores */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Indicadores Financeiros Comparativos</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Indicador</th>
                {dadosPorAno.map(d => (
                  <th key={d.ano} className="text-right px-4 py-3 font-semibold text-gray-700">{d.ano}</th>
                ))}
                {dadosPorAno.length === 2 && (
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Variação</th>
                )}
              </tr>
            </thead>
            <tbody>
              {indicadoresComp.map(({ nome, key, fmt: fmtFn }) => {
                const valores = dadosPorAno.map(d => d.totais ? (d.totais as Record<string, number>)[key] ?? 0 : null);
                const variacao = dadosPorAno.length === 2 && valores[0] != null && valores[1] != null && valores[0] !== 0
                  ? ((valores[1]! - valores[0]!) / Math.abs(valores[0]!)) * 100
                  : null;
                return (
                  <tr key={key} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-700 font-medium">{nome}</td>
                    {valores.map((v, i) => (
                      <td key={i} className="px-4 py-2.5 text-right text-gray-900">
                        {v != null ? fmtFn(v) : <span className="text-gray-300">—</span>}
                      </td>
                    ))}
                    {variacao !== null && (
                      <td className="px-4 py-2.5 text-right">
                        <span className={`flex items-center justify-end gap-1 font-medium ${variacao > 0 ? "text-green-600" : variacao < 0 ? "text-red-600" : "text-gray-400"}`}>
                          <VariacaoIcon v={variacao} />
                          {variacao > 0 ? "+" : ""}{variacao.toFixed(1)}%
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
