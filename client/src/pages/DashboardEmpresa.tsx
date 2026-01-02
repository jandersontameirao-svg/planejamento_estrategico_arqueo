import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Building2, Target, FolderKanban, TrendingUp, CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

interface DashboardEmpresaProps {
  empresaId: number;
}

export default function DashboardEmpresa({ empresaId }: DashboardEmpresaProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Buscar dados da empresa
  const { data: empresa } = trpc.empresas.getById.useQuery({ id: empresaId });
  
  // Buscar dados estratégicos
  const { data: objetivos = [] } = trpc.objetivosGrupo.listByEmpresa.useQuery({ empresaId });
  const { data: projetos = [] } = trpc.projetosGrupo.listByEmpresa.useQuery({ empresaId });
  const { data: acoes = [] } = trpc.acoesGrupo.listByEmpresa.useQuery({ empresaId });
  const { data: kpis = [] } = trpc.kpis.listByEmpresa.useQuery({ empresaId });

  // Calcular estatísticas de objetivos
  const objetivosStats = {
    total: objetivos.length,
    planejados: objetivos.filter((o: any) => o.status === "planejado").length,
    emAndamento: objetivos.filter((o: any) => o.status === "em_andamento").length,
    concluidos: objetivos.filter((o: any) => o.status === "concluido").length,
  };

  // Calcular estatísticas de projetos
  const projetosStats = {
    total: projetos.length,
    planejados: projetos.filter((p: any) => p.status === "planejado").length,
    emAndamento: projetos.filter((p: any) => p.status === "em_andamento").length,
    concluidos: projetos.filter((p: any) => p.status === "concluido").length,
  };

  // Calcular estatísticas de ações
  const acoesStats = {
    total: acoes.length,
    pendentes: acoes.filter((a: any) => a.status === "pendente").length,
    emAndamento: acoes.filter((a: any) => a.status === "em_andamento").length,
    concluidas: acoes.filter((a: any) => a.status === "concluida").length,
  };

  // Dados para gráfico de distribuição de objetivos por perspectiva
  const objetivosPorPerspectiva = [
    { name: "Financeira", value: objetivos.filter((o: any) => o.perspectivaBSC === "financeira").length },
    { name: "Clientes", value: objetivos.filter((o: any) => o.perspectivaBSC === "clientes").length },
    { name: "Processos", value: objetivos.filter((o: any) => o.perspectivaBSC === "processos").length },
    { name: "Aprendizado", value: objetivos.filter((o: any) => o.perspectivaBSC === "aprendizado").length },
  ];

  // Dados para gráfico de status dos objetivos
  const statusObjetivos = [
    { name: "Planejado", value: objetivosStats.planejados },
    { name: "Em Andamento", value: objetivosStats.emAndamento },
    { name: "Concluído", value: objetivosStats.concluidos },
  ];

  // Dados para gráfico de status dos projetos
  const statusProjetos = [
    { name: "Planejado", value: projetosStats.planejados },
    { name: "Em Andamento", value: projetosStats.emAndamento },
    { name: "Concluído", value: projetosStats.concluidos },
  ];

  const COLORS = ["#FF8C42", "#1E88E5", "#7C3AED"];
  const COLORS_PERSPECTIVA = ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  const canEdit = user?.role === "admin" || user?.role === "gestor";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setLocation("/")}>
              ← Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-bold text-lg">Dashboard Executivo</h1>
                <p className="text-sm text-muted-foreground">{empresa?.nome}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocation(`/empresa/${empresaId}/identidade`)}>
              Identidade
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLocation(`/empresa/${empresaId}/objetivos`)}>
              Objetivos
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLocation(`/empresa/${empresaId}/projetos`)}>
              Projetos
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLocation(`/empresa/${empresaId}/kpis`)}>
              KPIs
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLocation(`/empresa/${empresaId}/plano-acao`)}>
              Plano de Ação
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLocation(`/empresa/${empresaId}/matriz-risco`)}>
              Matriz de Risco
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Métricas Principais */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Objetivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{objetivosStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {objetivosStats.emAndamento} em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                Projetos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{projetosStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {projetosStats.emAndamento} em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Ações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{acoesStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {acoesStats.concluidas} concluídas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpis.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Indicadores cadastrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Objetivos por Perspectiva BSC */}
          <Card>
            <CardHeader>
              <CardTitle>Objetivos por Perspectiva BSC</CardTitle>
              <CardDescription>Distribuição dos objetivos estratégicos</CardDescription>
            </CardHeader>
            <CardContent>
              {objetivosPorPerspectiva.some((p) => p.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={objetivosPorPerspectiva}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {objetivosPorPerspectiva.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_PERSPECTIVA[index % COLORS_PERSPECTIVA.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhum objetivo cadastrado
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status dos Objetivos */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Objetivos</CardTitle>
              <CardDescription>Progresso dos objetivos estratégicos</CardDescription>
            </CardHeader>
            <CardContent>
              {statusObjetivos.some((s) => s.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusObjetivos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#FF8C42" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhum objetivo cadastrado
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status dos Projetos */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Projetos</CardTitle>
              <CardDescription>Progresso dos projetos e iniciativas</CardDescription>
            </CardHeader>
            <CardContent>
              {statusProjetos.some((s) => s.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusProjetos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1E88E5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhum projeto cadastrado
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribuição de Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Ações</CardTitle>
              <CardDescription>Status do plano de ação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pendentes</span>
                  <Badge variant="outline">{acoesStats.pendentes}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Em Andamento</span>
                  <Badge className="bg-blue-100 text-blue-800">{acoesStats.emAndamento}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Concluídas</span>
                  <Badge className="bg-green-100 text-green-800">{acoesStats.concluidas}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Ação Rápida */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation(`/empresa/${empresaId}/objetivos`)}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Objetivos</p>
                  <p className="text-2xl font-bold">{objetivosStats.total}</p>
                </div>
                <Target className="h-8 w-8 text-primary opacity-20" />
              </div>
              <Button variant="ghost" size="sm" className="mt-4 w-full justify-start">
                Gerenciar <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation(`/empresa/${empresaId}/projetos`)}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projetos</p>
                  <p className="text-2xl font-bold">{projetosStats.total}</p>
                </div>
                <FolderKanban className="h-8 w-8 text-primary opacity-20" />
              </div>
              <Button variant="ghost" size="sm" className="mt-4 w-full justify-start">
                Gerenciar <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation(`/empresa/${empresaId}/plano-acao`)}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ações</p>
                  <p className="text-2xl font-bold">{acoesStats.total}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-primary opacity-20" />
              </div>
              <Button variant="ghost" size="sm" className="mt-4 w-full justify-start">
                Gerenciar <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation(`/empresa/${empresaId}/matriz-risco`)}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Riscos</p>
                  <p className="text-2xl font-bold">{objetivosStats.total + projetosStats.total}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-primary opacity-20" />
              </div>
              <Button variant="ghost" size="sm" className="mt-4 w-full justify-start">
                Analisar <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
