import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { AlertCircle, TrendingUp, Activity, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface AnalisePreditivaProps {
  empresaId: number;
}

export default function AnalisePreditiva({ empresaId }: AnalisePreditivaProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: alertas, isLoading: loadingAlertas } = trpc.analisePreditiva.getAlertas.useQuery({ empresaId });
  const { data: tendencias, isLoading: loadingTendencias } = trpc.analisePreditiva.getTendencias.useQuery({ empresaId });
  const { data: empresa } = trpc.empresas.getById.useQuery({ id: empresaId });

  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
      case "critico":
        return "bg-red-100 text-red-800 border-red-300";
      case "aviso":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getSeveridadeBadge = (severidade: string) => {
    switch (severidade) {
      case "critico":
        return "destructive";
      case "aviso":
        return "secondary";
      default:
        return "default";
    }
  };

  const getDesvioColor = (previsao: string) => {
    switch (previsao) {
      case "alto":
        return "text-red-600";
      case "medio":
        return "text-yellow-600";
      case "baixo":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const chartData = tendencias ? [
    {
      name: "Planejado",
      valor: tendencias.statusCount.planejado,
    },
    {
      name: "Em Andamento",
      valor: tendencias.statusCount.em_andamento,
    },
    {
      name: "Concluido",
      valor: tendencias.statusCount.concluido,
    },
    {
      name: "Cancelado",
      valor: tendencias.statusCount.cancelado,
    },
  ] : [];

  const progressoData = [
    {
      name: "Progresso Medio",
      valor: tendencias?.progressoMedio || 0,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setLocation(`/empresa/${empresaId}/planejamento`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-bold text-lg">Analise Preditiva</h1>
                <p className="text-sm text-muted-foreground">{empresa?.nome}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Alertas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Alertas e Avisos</h2>
          
          {loadingAlertas ? (
            <Card>
              <CardContent className="pt-8">
                <div className="text-center text-muted-foreground">Carregando alertas...</div>
              </CardContent>
            </Card>
          ) : alertas && alertas.length > 0 ? (
            <div className="space-y-3">
              {alertas.map((alerta: any, idx: number) => (
                <Card key={idx} className={`border-l-4 ${getSeveridadeColor(alerta.severidade)}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-5 w-5" />
                          <h3 className="font-semibold">{alerta.titulo}</h3>
                          <Badge variant={getSeveridadeBadge(alerta.severidade)}>
                            {alerta.severidade.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alerta.mensagem}</p>
                        {alerta.progresso !== undefined && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Progresso</span>
                              <span>{alerta.progresso}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${alerta.progresso}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-8">
                <div className="text-center text-muted-foreground">
                  Nenhum alerta no momento. Tudo esta em dia!
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tendencias */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Tendencias e Previsoes</h2>
          
          {loadingTendencias ? (
            <Card>
              <CardContent className="pt-8">
                <div className="text-center text-muted-foreground">Carregando tendencias...</div>
              </CardContent>
            </Card>
          ) : tendencias ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Metricas */}
              <Card>
                <CardHeader>
                  <CardTitle>Metricas Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total de Projetos</span>
                    <span className="text-2xl font-bold">{tendencias.totalProjetos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Progresso Medio</span>
                    <span className="text-2xl font-bold">{tendencias.progressoMedio}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Previsao de Desvios</span>
                    <Badge className={getDesvioColor(tendencias.previsaoDesvios)}>
                      {tendencias.previsaoDesvios.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuicao por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Planejado</span>
                      <span className="font-semibold">{tendencias.statusCount.planejado}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Em Andamento</span>
                      <span className="font-semibold">{tendencias.statusCount.em_andamento}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Concluido</span>
                      <span className="font-semibold">{tendencias.statusCount.concluido}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancelado</span>
                      <span className="font-semibold">{tendencias.statusCount.cancelado}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Graficos */}
          {tendencias && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuicao de Projetos por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="valor" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progresso Medio dos Projetos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-primary mb-2">
                        {tendencias.progressoMedio}%
                      </div>
                      <p className="text-muted-foreground">
                        Progresso medio de todos os projetos
                      </p>
                      <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full transition-all"
                          style={{ width: `${tendencias.progressoMedio}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
