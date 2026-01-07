import React from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Users, BarChart3, Layers } from "lucide-react";
import PageHeaderWithBack from "@/components/PageHeaderWithBack";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#8b1538", "#f97316", "#eab308", "#3b82f6", "#10b981"];

export default function DashboardAnalises() {
  const params = useParams();
  const navigate = useNavigate();
  const empresaId = params.id ? parseInt(params.id) : null;

  // Queries para buscar dados das análises
  const { data: pestelData } = trpc.analises.getPestel.useQuery(
    { empresaId: empresaId! },
    { enabled: !!empresaId }
  );
  const { data: swotData } = trpc.analises.getSwot.useQuery(
    { empresaId: empresaId! },
    { enabled: !!empresaId }
  );
  const { data: okrData } = trpc.analises.getOkr.useQuery(
    { empresaId: empresaId! },
    { enabled: !!empresaId }
  );
  const { data: bscData } = trpc.analises.getBsc.useQuery(
    { empresaId: empresaId! },
    { enabled: !!empresaId }
  );
  const { data: empresa } = trpc.empresas.getById.useQuery(
    { id: empresaId! },
    { enabled: !!empresaId }
  );

  // Calcular progresso das análises
  const calcularProgressoPestel = () => {
    if (!pestelData || pestelData.length === 0) return 0;
    const total = 6; // 6 categorias
    const preenchidas = new Set(pestelData.map((f: any) => f.categoria)).size;
    return Math.round((preenchidas / total) * 100);
  };

  const calcularProgressoSwot = () => {
    if (!swotData || swotData.length === 0) return 0;
    const total = 4; // 4 quadrantes
    const preenchidos = new Set(swotData.map((item: any) => item.tipo)).size;
    return Math.round((preenchidos / total) * 100);
  };

  const calcularProgressoOkr = () => {
    if (!okrData || okrData.length === 0) return 0;
    const objetivosComKr = okrData.filter(
      (obj: any) =>
        obj.resultadoChave1 || obj.resultadoChave2 || obj.resultadoChave3
    ).length;
    return Math.round((objetivosComKr / okrData.length) * 100);
  };

  const calcularProgressoBsc = () => {
    if (!bscData || bscData.length === 0) return 0;
    const total = 4; // 4 perspectivas
    const preenchidas = new Set(bscData.map((ind: any) => ind.perspectiva)).size;
    return Math.round((preenchidas / total) * 100);
  };

  // Dados para gráfico de radar
  const radarData = [
    { analise: "PESTEL", progresso: calcularProgressoPestel() },
    { analise: "SWOT", progresso: calcularProgressoSwot() },
    { analise: "OKR", progresso: calcularProgressoOkr() },
    { analise: "BSC", progresso: calcularProgressoBsc() },
  ];

  // Dados para gráfico de barras
  const barData = [
    {
      nome: "PESTEL",
      fatores: pestelData?.length || 0,
      cor: COLORS[0],
    },
    {
      nome: "SWOT",
      itens: swotData?.length || 0,
      cor: COLORS[1],
    },
    {
      nome: "OKR",
      objetivos: okrData?.length || 0,
      cor: COLORS[2],
    },
    {
      nome: "BSC",
      indicadores: bscData?.length || 0,
      cor: COLORS[3],
    },
  ];

  // Dados para gráfico de pizza (distribuição de completude)
  const pieData = [
    { name: "PESTEL", value: calcularProgressoPestel() },
    { name: "SWOT", value: calcularProgressoSwot() },
    { name: "OKR", value: calcularProgressoOkr() },
    { name: "BSC", value: calcularProgressoBsc() },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <PageHeaderWithBack
        title="Dashboard de Análises Estratégicas"
        description={`${empresa?.nome || "Carregando..."} - Visão consolidada de todas as análises`}
        backUrl={`/empresa/${empresaId}/planejamento`}
      />

      <div className="max-w-7xl mx-auto space-y-6 mt-6">

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-[#8b1538]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Análise PESTEL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#8b1538]">
                {calcularProgressoPestel()}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {pestelData?.length || 0} fatores identificados
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#f97316]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Análise SWOT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#f97316]">
                {calcularProgressoSwot()}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {swotData?.length || 0} itens mapeados
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#eab308]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Objetivos OKR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#eab308]">
                {calcularProgressoOkr()}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {okrData?.length || 0} objetivos definidos
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#3b82f6]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Indicadores BSC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#3b82f6]">
                {calcularProgressoBsc()}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {bscData?.length || 0} indicadores ativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Radar - Progresso Geral */}
          <Card>
            <CardHeader>
              <CardTitle>Progresso das Análises</CardTitle>
              <CardDescription>
                Percentual de completude de cada análise estratégica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="analise" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Radar
                    name="Progresso"
                    dataKey="progresso"
                    stroke="#8b1538"
                    fill="#8b1538"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Pizza - Distribuição */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Completude</CardTitle>
              <CardDescription>
                Proporção de progresso entre as análises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Barras - Quantidade de Itens */}
        <Card>
          <CardHeader>
            <CardTitle>Quantidade de Itens por Análise</CardTitle>
            <CardDescription>
              Total de fatores, itens, objetivos e indicadores cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nome" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="fatores" fill={COLORS[0]} name="Fatores PESTEL" />
                <Bar dataKey="itens" fill={COLORS[1]} name="Itens SWOT" />
                <Bar dataKey="objetivos" fill={COLORS[2]} name="Objetivos OKR" />
                <Bar dataKey="indicadores" fill={COLORS[3]} name="Indicadores BSC" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resumo Executivo */}
        <Card className="bg-gradient-to-r from-[#8b1538] to-[#f97316] text-white">
          <CardHeader>
            <CardTitle className="text-white">Resumo Executivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total de Análises Completas:</span>
              <span className="text-2xl font-bold">
                {[
                  calcularProgressoPestel(),
                  calcularProgressoSwot(),
                  calcularProgressoOkr(),
                  calcularProgressoBsc(),
                ].filter((p) => p === 100).length}{" "}
                / 4
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Progresso Médio Geral:</span>
              <span className="text-2xl font-bold">
                {Math.round(
                  (calcularProgressoPestel() +
                    calcularProgressoSwot() +
                    calcularProgressoOkr() +
                    calcularProgressoBsc()) /
                    4
                )}
                %
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Total de Itens Cadastrados:</span>
              <span className="text-2xl font-bold">
                {(pestelData?.length || 0) +
                  (swotData?.length || 0) +
                  (okrData?.length || 0) +
                  (bscData?.length || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
