import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, Building2, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: dashboardGrupo, isLoading } = trpc.dashboard.grupo.useQuery();
  const { data: empresas } = trpc.empresas.list.useQuery();

  if (isLoading) {
    return (
      <div className="container py-8">
        <p>Carregando...</p>
      </div>
    );
  }

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
                <p className="text-xs text-muted-foreground">Visão consolidada do Grupo Arqueo</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Executivo</h1>
          <p className="text-muted-foreground">
            Visão consolidada do desempenho do Grupo Arqueo
          </p>
        </div>

        {/* Cards de Estatísticas */}
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
                Status RAG - Verde
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <div className="text-3xl font-bold">{dashboardGrupo?.statusRag.verde || 0}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ≥ 90% da meta
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status RAG - Atenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                </div>
                <div className="text-3xl font-bold">
                  {(dashboardGrupo?.statusRag.amarelo || 0) + (dashboardGrupo?.statusRag.vermelho || 0)}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Amarelo: {dashboardGrupo?.statusRag.amarelo || 0} | Vermelho: {dashboardGrupo?.statusRag.vermelho || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Empresas com Desempenho */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Desempenho por Empresa</h2>
          {empresas && empresas.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {empresas.map((empresa) => (
                <Card key={empresa.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/empresa/${empresa.id}/identidade`)}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{empresa.nome}</CardTitle>
                        <CardDescription>
                          {empresa.tipoAtuacao === "servicos"
                            ? "Serviços"
                            : empresa.tipoAtuacao === "produtos"
                            ? "Produtos"
                            : "Serviços + Produtos"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            empresa.status === "ativa"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {empresa.status === "ativa" ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs text-muted-foreground">
                          Status RAG: Verde
                        </span>
                      </div>
                      <div className="pt-3 border-t">
                        <Button variant="outline" size="sm" className="w-full" onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/empresa/${empresa.id}/kpis`);
                        }}>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Ver KPIs
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma empresa cadastrada</h3>
                <p className="text-muted-foreground mb-4">
                  Comece cadastrando as empresas do grupo
                </p>
                <Button onClick={() => setLocation("/empresas")}>
                  Gerenciar Empresas
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
