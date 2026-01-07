import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Layers, BarChart3 } from "lucide-react";
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

import { useRoute } from "wouter";

export default function DashboardAnalisesArea() {
  const [, params] = useRoute("/area/:id/dashboard");
  const areaId = params?.id ? Number(params.id) : 1;
  
  // Usar empresaId negativo para áreas de negócio: -100 - areaId
  const AREA_EMPRESA_ID = -100 - areaId;
  
  // Query para obter dados da área
  const { data: area } = trpc.areasNegocio.getById.useQuery({ id: areaId });
  const areaNome = area?.nome || `Área ${areaId}`;
  
  // Queries para buscar dados das análises da Área
  const { data: pestelData } = trpc.analises.getPestel.useQuery({ empresaId: AREA_EMPRESA_ID });
  const { data: swotData } = trpc.analises.getSwot.useQuery({ empresaId: AREA_EMPRESA_ID });
  const { data: okrData } = trpc.analises.getOkr.useQuery({ empresaId: AREA_EMPRESA_ID });
  const { data: bscData } = trpc.bsc.getByEmpresa.useQuery({ empresaId: AREA_EMPRESA_ID });

  // Calcular progresso de cada análise
  const progressoPestel = pestelData?.length ? Math.min(Math.round((pestelData.length / 6) * 100), 100) : 0;
  const progressoSwot = swotData?.length ? Math.min(Math.round((swotData.length / 8) * 100), 100) : 0;
  const progressoOkr = okrData?.length ? Math.min(Math.round((okrData.length / 3) * 100), 100) : 0;
  const progressoBsc = bscData?.length ? Math.min(Math.round((bscData.length / 8) * 100), 100) : 0;

  const progressoMedio = Math.round((progressoPestel + progressoSwot + progressoOkr + progressoBsc) / 4);

  // Dados para gráfico radar (progresso por análise)
  const radarData = [
    { analise: "PESTEL", progresso: progressoPestel },
    { analise: "SWOT", progresso: progressoSwot },
    { analise: "OKR", progresso: progressoOkr },
    { analise: "BSC", progresso: progressoBsc },
  ];

  // Dados para gráfico de barras
  const barData = [
    { nome: "PESTEL", progresso: progressoPestel, cor: "#f97316" },
    { nome: "SWOT", progresso: progressoSwot, cor: "#22c55e" },
    { nome: "OKR", progresso: progressoOkr, cor: "#3b82f6" },
    { nome: "BSC", progresso: progressoBsc, cor: "#8b5cf6" },
  ];

  // Dados para gráfico de pizza (distribuição de completude)
  const analisesCompletas = [progressoPestel, progressoSwot, progressoOkr, progressoBsc].filter(p => p === 100).length;
  const analisesEmAndamento = [progressoPestel, progressoSwot, progressoOkr, progressoBsc].filter(p => p > 0 && p < 100).length;
  const analisesNaoIniciadas = [progressoPestel, progressoSwot, progressoOkr, progressoBsc].filter(p => p === 0).length;

  const pieData = [
    { name: "Completas (100%)", value: analisesCompletas },
    { name: "Em Andamento", value: analisesEmAndamento },
    { name: "Não Iniciadas", value: analisesNaoIniciadas },
  ];

  const COLORS = ["#22c55e", "#eab308", "#ef4444"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <PageHeaderWithBack
        title={`Dashboard de Análises - ${areaNome}`}
        description={`Visão geral das análises estratégicas da ${areaNome}`}
        backUrl={`/area/${areaId}/planejamento`}
      />

      <div className="max-w-7xl mx-auto space-y-6 mt-6">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-[#8b1538]">
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

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardDescription>Análises Completas</CardDescription>
              <CardTitle className="text-3xl">{analisesCompletas}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Target className="mr-2 h-4 w-4" />
                100% preenchidas
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardDescription>Em Andamento</CardDescription>
              <CardTitle className="text-3xl">{analisesEmAndamento}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <BarChart3 className="mr-2 h-4 w-4" />
                Parcialmente preenchidas
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardDescription>Não Iniciadas</CardDescription>
              <CardTitle className="text-3xl">{analisesNaoIniciadas}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Layers className="mr-2 h-4 w-4" />
                Aguardando preenchimento
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico Radar */}
          <Card>
            <CardHeader>
              <CardTitle>Progresso por Análise</CardTitle>
              <CardDescription>
                Completude de cada tipo de análise estratégica
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
                Status geral das análises do Grupo
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

        {/* Gráfico de Barras - Progresso por Análise */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso Detalhado por Análise</CardTitle>
            <CardDescription>
              Percentual de completude de cada análise estratégica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nome" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="progresso" fill="#8b1538" name="Progresso (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detalhes por Análise */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento das Análises</CardTitle>
            <CardDescription>
              Status individual de cada análise estratégica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-semibold">PESTEL - Análise Ambiental</div>
                  <div className="text-sm text-muted-foreground">
                    {pestelData?.length || 0} fatores cadastrados (mínimo: 6)
                  </div>
                </div>
                <Badge className={progressoPestel === 100 ? "bg-green-600" : progressoPestel > 0 ? "bg-yellow-500" : "bg-gray-400"}>
                  {progressoPestel}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <div className="font-semibold">SWOT/TOWS - Forças e Oportunidades</div>
                  <div className="text-sm text-muted-foreground">
                    {swotData?.length || 0} itens cadastrados (mínimo: 8)
                  </div>
                </div>
                <Badge className={progressoSwot === 100 ? "bg-green-600" : progressoSwot > 0 ? "bg-yellow-500" : "bg-gray-400"}>
                  {progressoSwot}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-semibold">OKR - Objetivos e Resultados</div>
                  <div className="text-sm text-muted-foreground">
                    {okrData?.length || 0} objetivos cadastrados (mínimo: 3)
                  </div>
                </div>
                <Badge className={progressoOkr === 100 ? "bg-green-600" : progressoOkr > 0 ? "bg-yellow-500" : "bg-gray-400"}>
                  {progressoOkr}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-semibold">BSC - Balanced Scorecard</div>
                  <div className="text-sm text-muted-foreground">
                    {bscData?.length || 0} indicadores cadastrados (mínimo: 8)
                  </div>
                </div>
                <Badge className={progressoBsc === 100 ? "bg-green-600" : progressoBsc > 0 ? "bg-yellow-500" : "bg-gray-400"}>
                  {progressoBsc}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
