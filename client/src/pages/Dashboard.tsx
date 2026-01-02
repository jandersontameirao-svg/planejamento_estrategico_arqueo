import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { BarChart3, Building2, TrendingUp, Target, Calendar, CheckCircle2, Clock, Circle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: dashboardGrupo, isLoading } = trpc.dashboard.grupo.useQuery();
  const { data: empresas } = trpc.empresas.list.useQuery();
  const { data: objetivos } = trpc.objetivosGrupo.list.useQuery();
  const { data: projetos } = trpc.projetosGrupo.list.useQuery();
  const { data: kpis } = trpc.planejamentoGrupo.getKPIs.useQuery();

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calcular estatísticas de objetivos
  const objetivosPorStatus = {
    planejado: objetivos?.filter(o => o.status === "planejado").length || 0,
    em_andamento: objetivos?.filter(o => o.status === "em_andamento").length || 0,
    concluido: objetivos?.filter(o => o.status === "concluido").length || 0,
    cancelado: objetivos?.filter(o => o.status === "cancelado").length || 0,
  };

  const totalObjetivos = objetivos?.length || 0;
  const progressoObjetivos = totalObjetivos > 0 
    ? Math.round((objetivosPorStatus.concluido / totalObjetivos) * 100)
    : 0;

  // Calcular estatísticas de projetos
  const projetosPorStatus = {
    planejado: projetos?.filter(p => p.status === "planejado").length || 0,
    em_andamento: projetos?.filter(p => p.status === "em_andamento").length || 0,
    concluido: projetos?.filter(p => p.status === "concluido").length || 0,
    cancelado: projetos?.filter(p => p.status === "cancelado").length || 0,
  };

  const totalProjetos = projetos?.length || 0;
  const progressoProjetos = totalProjetos > 0 
    ? Math.round((projetosPorStatus.concluido / totalProjetos) * 100)
    : 0;

  // Dados para gráfico de pizza de objetivos
  const dadosObjetivos = [
    { name: 'Planejado', value: objetivosPorStatus.planejado, color: '#94a3b8' },
    { name: 'Em Andamento', value: objetivosPorStatus.em_andamento, color: '#3b82f6' },
    { name: 'Concluído', value: objetivosPorStatus.concluido, color: '#22c55e' },
    { name: 'Cancelado', value: objetivosPorStatus.cancelado, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Dados para gráfico de pizza de projetos
  const dadosProjetos = [
    { name: 'Planejado', value: projetosPorStatus.planejado, color: '#94a3b8' },
    { name: 'Em Andamento', value: projetosPorStatus.em_andamento, color: '#3b82f6' },
    { name: 'Concluído', value: projetosPorStatus.concluido, color: '#22c55e' },
    { name: 'Cancelado', value: projetosPorStatus.cancelado, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Calcular KPIs por perspectiva
  const kpisPorPerspectiva = {
    financeira: kpis?.filter(k => k.perspectivaBSC === "financeira").length || 0,
    clientes: kpis?.filter(k => k.perspectivaBSC === "clientes").length || 0,
    processos: kpis?.filter(k => k.perspectivaBSC === "processos").length || 0,
    aprendizado: kpis?.filter(k => k.perspectivaBSC === "aprendizado").length || 0,
  };

  const dadosKPIsPerspectiva = [
    { perspectiva: 'Financeira', quantidade: kpisPorPerspectiva.financeira },
    { perspectiva: 'Clientes', quantidade: kpisPorPerspectiva.clientes },
    { perspectiva: 'Processos', quantidade: kpisPorPerspectiva.processos },
    { perspectiva: 'Aprendizado', quantidade: kpisPorPerspectiva.aprendizado },
  ];

  const getStatusRagColor = (status: "verde" | "amarelo" | "vermelho") => {
    const colors = {
      verde: "bg-green-500",
      amarelo: "bg-yellow-500",
      vermelho: "bg-red-500",
    };
    return colors[status];
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setLocation("/")}>
              ← Voltar
            </Button>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-semibold">Dashboard Executivo</h1>
                <p className="text-xs text-muted-foreground">Acompanhamento em Tempo Real</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard de Acompanhamento em Tempo Real</h1>
          <p className="text-muted-foreground">
            Visão executiva consolidada do Grupo Arqueo com métricas-chave e indicadores de performance
          </p>
        </div>

        {/* Métricas-Chave Executivas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Empresas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardGrupo?.totalEmpresas || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardGrupo?.empresasAtivas || 0} ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardGrupo?.totalKpis || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Indicadores cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Objetivos Estratégicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalObjetivos}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {objetivosPorStatus.concluido} concluídos ({progressoObjetivos}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Projetos e Iniciativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalProjetos}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {projetosPorStatus.concluido} concluídos ({progressoProjetos}%)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Progresso dos Objetivos */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Progresso dos Objetivos Estratégicos
              </CardTitle>
              <CardDescription>
                Acompanhamento do status dos objetivos por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progresso Geral</span>
                    <span className="text-sm font-bold text-primary">{progressoObjetivos}%</span>
                  </div>
                  <Progress value={progressoObjetivos} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-2xl font-bold">{objetivosPorStatus.planejado}</p>
                      <p className="text-xs text-muted-foreground">Planejado</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{objetivosPorStatus.em_andamento}</p>
                      <p className="text-xs text-muted-foreground">Em Andamento</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{objetivosPorStatus.concluido}</p>
                      <p className="text-xs text-muted-foreground">Concluído</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{objetivosPorStatus.cancelado}</p>
                      <p className="text-xs text-muted-foreground">Cancelado</p>
                    </div>
                  </div>
                </div>

                {totalObjetivos > 0 && (
                  <div className="pt-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={dadosObjetivos}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dadosObjetivos.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status dos Projetos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Status dos Projetos e Iniciativas
              </CardTitle>
              <CardDescription>
                Acompanhamento do status dos projetos estratégicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progresso Geral</span>
                    <span className="text-sm font-bold text-primary">{progressoProjetos}%</span>
                  </div>
                  <Progress value={progressoProjetos} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-2xl font-bold">{projetosPorStatus.planejado}</p>
                      <p className="text-xs text-muted-foreground">Planejado</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{projetosPorStatus.em_andamento}</p>
                      <p className="text-xs text-muted-foreground">Em Andamento</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{projetosPorStatus.concluido}</p>
                      <p className="text-xs text-muted-foreground">Concluído</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{projetosPorStatus.cancelado}</p>
                      <p className="text-xs text-muted-foreground">Cancelado</p>
                    </div>
                  </div>
                </div>

                {totalProjetos > 0 && (
                  <div className="pt-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={dadosProjetos}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dadosProjetos.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de Tendência dos KPIs */}
        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Distribuição de KPIs por Perspectiva BSC
              </CardTitle>
              <CardDescription>
                Balanceamento dos indicadores estratégicos nas quatro perspectivas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosKPIsPerspectiva}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="perspectiva" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantidade" fill="#f97316" name="Quantidade de KPIs" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status RAG dos KPIs */}
          <Card>
            <CardHeader>
              <CardTitle>Status RAG dos KPIs</CardTitle>
              <CardDescription>
                Indicadores de performance baseados no sistema RAG (Red, Amber, Green)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{dashboardGrupo?.statusRag.verde || 0}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verde</p>
                    <p className="text-xs text-muted-foreground">Meta atingida</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{dashboardGrupo?.statusRag.amarelo || 0}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amarelo</p>
                    <p className="text-xs text-muted-foreground">Atenção necessária</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{dashboardGrupo?.statusRag.vermelho || 0}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vermelho</p>
                    <p className="text-xs text-muted-foreground">Abaixo da meta</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Top KPIs */}
        {kpis && kpis.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top KPIs Estratégicos</CardTitle>
              <CardDescription>
                Principais indicadores do Grupo Arqueo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpis.slice(0, 5).map((kpi) => (
                  <div key={kpi.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold">{kpi.nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {kpi.perspectivaBSC}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{kpi.unidadeMedida}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{kpi.frequencia}</span>
                      </div>
                    </div>
                    {kpi.responsavel && (
                      <div className="text-sm text-muted-foreground">
                        {kpi.responsavel}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Empresas */}
        {empresas && empresas.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Empresas do Grupo
              </CardTitle>
              <CardDescription>
                Status consolidado das empresas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {empresas.map((empresa) => (
                  <div
                    key={empresa.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/empresa/${empresa.id}/identidade`)}
                  >
                    <div>
                      <p className="font-semibold">{empresa.nome}</p>
                      <p className="text-sm text-muted-foreground">{empresa.tipoAtuacao}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={empresa.status === "ativa" ? "default" : "secondary"}>
                        {empresa.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
