import React from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Users, BarChart3, Layers, Building2 } from "lucide-react";
import PageHeaderWithBack from "@/components/PageHeaderWithBack";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardGrupoAnalises() {
  const { data: empresas } = trpc.empresas.list.useQuery();
  const { data: progressoEmpresas } = trpc.analises.getProgressoTodasEmpresas.useQuery();

  // Calcular métricas consolidadas
  const totalEmpresas = empresas?.length || 0;
  const empresasComAnalises = progressoEmpresas?.filter(e => 
    e.progressoPestel > 0 || e.progressoSwot > 0 || e.progressoOkr > 0 || e.progressoBsc > 0
  ).length || 0;

  const progressoMedio = progressoEmpresas?.length
    ? Math.round(
        progressoEmpresas.reduce((acc, e) => 
          acc + (e.progressoPestel + e.progressoSwot + e.progressoOkr + e.progressoBsc) / 4, 0
        ) / progressoEmpresas.length
      )
    : 0;

  const analisesMaisCompletas = progressoEmpresas
    ?.sort((a, b) => {
      const avgA = (a.progressoPestel + a.progressoSwot + a.progressoOkr + a.progressoBsc) / 4;
      const avgB = (b.progressoPestel + b.progressoSwot + b.progressoOkr + b.progressoBsc) / 4;
      return avgB - avgA;
    })
    .slice(0, 3) || [];

  // Dados para gráfico radar (média de progresso por análise)
  const radarData = [
    {
      analise: "PESTEL",
      progresso: progressoEmpresas?.length
        ? Math.round(progressoEmpresas.reduce((acc, e) => acc + e.progressoPestel, 0) / progressoEmpresas.length)
        : 0,
    },
    {
      analise: "SWOT",
      progresso: progressoEmpresas?.length
        ? Math.round(progressoEmpresas.reduce((acc, e) => acc + e.progressoSwot, 0) / progressoEmpresas.length)
        : 0,
    },
    {
      analise: "OKR",
      progresso: progressoEmpresas?.length
        ? Math.round(progressoEmpresas.reduce((acc, e) => acc + e.progressoOkr, 0) / progressoEmpresas.length)
        : 0,
    },
    {
      analise: "BSC",
      progresso: progressoEmpresas?.length
        ? Math.round(progressoEmpresas.reduce((acc, e) => acc + e.progressoBsc, 0) / progressoEmpresas.length)
        : 0,
    },
  ];

  // Dados para gráfico de barras (progresso por empresa)
  const barData = progressoEmpresas?.map(e => ({
    nome: e.nomeEmpresa.length > 15 ? e.nomeEmpresa.substring(0, 15) + "..." : e.nomeEmpresa,
    PESTEL: e.progressoPestel,
    SWOT: e.progressoSwot,
    OKR: e.progressoOkr,
    BSC: e.progressoBsc,
  })) || [];

  // Dados para gráfico de pizza (distribuição de completude)
  const pieData = [
    { name: "Completo (>80%)", value: progressoEmpresas?.filter(e => (e.progressoPestel + e.progressoSwot + e.progressoOkr + e.progressoBsc) / 4 > 80).length || 0 },
    { name: "Em Andamento (50-80%)", value: progressoEmpresas?.filter(e => {
      const avg = (e.progressoPestel + e.progressoSwot + e.progressoOkr + e.progressoBsc) / 4;
      return avg >= 50 && avg <= 80;
    }).length || 0 },
    { name: "Inicial (<50%)", value: progressoEmpresas?.filter(e => (e.progressoPestel + e.progressoSwot + e.progressoOkr + e.progressoBsc) / 4 < 50).length || 0 },
  ];

  const COLORS = ["#22c55e", "#eab308", "#ef4444"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <PageHeaderWithBack
        title="Dashboard Consolidado - Grupo Arqueo"
        description="Visão geral das análises estratégicas de todas as empresas do grupo"
        backUrl="/"
      />

      <div className="max-w-7xl mx-auto space-y-6 mt-6">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-[#8b1538]">
            <CardHeader className="pb-3">
              <CardDescription>Total de Empresas</CardDescription>
              <CardTitle className="text-3xl">{totalEmpresas}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Building2 className="mr-2 h-4 w-4" />
                Empresas cadastradas
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#f97316]">
            <CardHeader className="pb-3">
              <CardDescription>Empresas com Análises</CardDescription>
              <CardTitle className="text-3xl">{empresasComAnalises}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Target className="mr-2 h-4 w-4" />
                Com pelo menos 1 análise
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardDescription>Progresso Médio</CardDescription>
              <CardTitle className="text-3xl">{progressoMedio}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="mr-2 h-4 w-4" />
                Média de completude
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardDescription>Análises Totais</CardDescription>
              <CardTitle className="text-3xl">{totalEmpresas * 4}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Layers className="mr-2 h-4 w-4" />
                PESTEL, SWOT, OKR, BSC
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico Radar */}
          <Card>
            <CardHeader>
              <CardTitle>Progresso Médio por Análise</CardTitle>
              <CardDescription>
                Média de completude de cada tipo de análise no grupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="analise" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Radar
                    name="Progresso (%)"
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

          {/* Gráfico de Pizza */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Completude</CardTitle>
              <CardDescription>
                Empresas por nível de progresso geral
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
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
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

        {/* Gráfico de Barras - Progresso por Empresa */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso por Empresa e Análise</CardTitle>
            <CardDescription>
              Comparativo de completude de cada análise por empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nome" tick={{ fill: "#64748b", fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="PESTEL" fill="#f97316" />
                <Bar dataKey="SWOT" fill="#22c55e" />
                <Bar dataKey="OKR" fill="#3b82f6" />
                <Bar dataKey="BSC" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 3 Empresas */}
        <Card>
          <CardHeader>
            <CardTitle>Empresas com Maior Progresso</CardTitle>
            <CardDescription>
              Top 3 empresas com análises mais completas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analisesMaisCompletas.map((empresa, index) => {
                const progressoGeral = Math.round((empresa.progressoPestel + empresa.progressoSwot + empresa.progressoOkr + empresa.progressoBsc) / 4);
                return (
                  <div key={empresa.empresaId} className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                      index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-600"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{empresa.nomeEmpresa}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded">PESTEL: {empresa.progressoPestel}%</span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">SWOT: {empresa.progressoSwot}%</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">OKR: {empresa.progressoOkr}%</span>
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">BSC: {empresa.progressoBsc}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#8b1538]">{progressoGeral}%</div>
                      <div className="text-xs text-muted-foreground">Progresso Geral</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
