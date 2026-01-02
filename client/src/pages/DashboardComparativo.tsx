import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from "recharts";
import { TrendingUp, Award, AlertCircle, ArrowUp, ArrowDown } from "lucide-react";
import { useLocation } from "wouter";

export default function DashboardComparativo() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: empresas, isLoading: loadingEmpresas } = trpc.empresas.list.useQuery();

  // Dados agregados por empresa (exemplo)
  const dadosComparativos = empresas?.map((emp) => ({
    nome: emp.nome,
    id: emp.id,
    kpis: Math.floor(Math.random() * 100) + 50,
    objetivos: Math.floor(Math.random() * 20) + 5,
    projetos: Math.floor(Math.random() * 30) + 10,
    progressoMedio: Math.floor(Math.random() * 100) + 20,
    riscoAlto: Math.floor(Math.random() * 10),
    riscoMedio: Math.floor(Math.random() * 15),
  })) || [];

  // Ranking de performance
  const ranking = [...dadosComparativos]
    .sort((a, b) => b.progressoMedio - a.progressoMedio)
    .slice(0, 5);

  // Dados para gráfico de comparação de KPIs
  const kpisComparacao = dadosComparativos.map((emp) => ({
    empresa: emp.nome.substring(0, 15),
    kpis: emp.kpis,
    objetivos: emp.objetivos * 5,
    projetos: emp.projetos * 3,
  }));

  // Dados para gráfico de progresso
  const progressoComparacao = dadosComparativos.map((emp) => ({
    empresa: emp.nome.substring(0, 15),
    progresso: emp.progressoMedio,
  }));

  // Dados para scatter plot de risco vs progresso
  const riscoVsProgresso = dadosComparativos.map((emp) => ({
    empresa: emp.nome,
    risco: emp.riscoAlto + emp.riscoMedio,
    progresso: emp.progressoMedio,
  }));

  const getPerformanceColor = (progresso: number) => {
    if (progresso >= 75) return "text-green-600";
    if (progresso >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (progresso: number) => {
    if (progresso >= 75) return "default";
    if (progresso >= 50) return "secondary";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-bold text-lg">Dashboard Comparativo</h1>
              <p className="text-sm text-muted-foreground">Análise consolidada de todas as empresas</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>
            Voltar
          </Button>
        </div>
      </header>

      <main className="container py-8">
        {/* Metricas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{dadosComparativos.length}</div>
                <p className="text-sm text-muted-foreground">Total de Empresas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(dadosComparativos.reduce((a, b) => a + b.objetivos, 0) / dadosComparativos.length)}
                </div>
                <p className="text-sm text-muted-foreground">Objetivos Médios</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {Math.round(dadosComparativos.reduce((a, b) => a + b.projetos, 0) / dadosComparativos.length)}
                </div>
                <p className="text-sm text-muted-foreground">Projetos Médios</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(dadosComparativos.reduce((a, b) => a + b.progressoMedio, 0) / dadosComparativos.length)}%
                </div>
                <p className="text-sm text-muted-foreground">Progresso Médio</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ranking de Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top 5 Empresas
              </CardTitle>
              <CardDescription>Ranking por progresso médio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ranking.map((emp, idx) => (
                  <div key={emp.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-muted-foreground">#{idx + 1}</span>
                      <span className="text-sm font-medium truncate">{emp.nome}</span>
                    </div>
                    <Badge className={getPerformanceBadge(emp.progressoMedio)}>
                      {emp.progressoMedio}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Comparação de KPIs */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Comparação de Indicadores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kpisComparacao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="empresa" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="kpis" fill="#3b82f6" />
                  <Bar dataKey="objetivos" fill="#f97316" />
                  <Bar dataKey="projetos" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Progresso */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progresso Médio por Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressoComparacao}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="empresa" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="progresso" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risco vs Progresso */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Análise de Risco vs Progresso</CardTitle>
            <CardDescription>Posicionamento das empresas por risco e progresso</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="progresso" name="Progresso (%)" />
                <YAxis dataKey="risco" name="Risco (Alertas)" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter name="Empresas" data={riscoVsProgresso} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabela Detalhada */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes por Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Empresa</th>
                    <th className="text-center py-2 px-3">Objetivos</th>
                    <th className="text-center py-2 px-3">Projetos</th>
                    <th className="text-center py-2 px-3">KPIs</th>
                    <th className="text-center py-2 px-3">Progresso</th>
                    <th className="text-center py-2 px-3">Riscos</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosComparativos.map((emp) => (
                    <tr key={emp.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-3 font-medium">{emp.nome}</td>
                      <td className="text-center py-3 px-3">{emp.objetivos}</td>
                      <td className="text-center py-3 px-3">{emp.projetos}</td>
                      <td className="text-center py-3 px-3">{emp.kpis}</td>
                      <td className="text-center py-3 px-3">
                        <Badge className={getPerformanceBadge(emp.progressoMedio)}>
                          {emp.progressoMedio}%
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          {emp.riscoAlto > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {emp.riscoAlto}
                            </Badge>
                          )}
                          {emp.riscoMedio > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {emp.riscoMedio}
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Insights e Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              • <strong>Melhor Performance:</strong> {ranking[0]?.nome} lidera com {ranking[0]?.progressoMedio}% de progresso médio
            </p>
            <p>
              • <strong>Oportunidade:</strong> Empresas com progresso abaixo de 50% necessitam de suporte intensivo
            </p>
            <p>
              • <strong>Recomendação:</strong> Implementar reuniões de alinhamento entre empresas para compartilhar boas práticas
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
