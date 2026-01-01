import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, Building2, TrendingUp, Users, Cog, GraduationCap, DollarSign } from "lucide-react";
import { useLocation } from "wouter";

export default function DashboardBSC() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: kpisGrupo } = trpc.planejamentoGrupo.getKPIs.useQuery();
  const { data: empresas } = trpc.empresas.list.useQuery();

  // Agrupar KPIs por perspectiva BSC
  const kpisPorPerspectiva = {
    financeira: kpisGrupo?.filter(k => k.perspectivaBSC === "financeira") || [],
    clientes: kpisGrupo?.filter(k => k.perspectivaBSC === "clientes") || [],
    processos: kpisGrupo?.filter(k => k.perspectivaBSC === "processos") || [],
    aprendizado: kpisGrupo?.filter(k => k.perspectivaBSC === "aprendizado") || [],
  };

  const perspectivas = [
    {
      id: "financeira",
      nome: "Perspectiva Financeira",
      descricao: "Como somos vistos pelos acionistas?",
      icon: DollarSign,
      color: "bg-arqueo-laranja",
      textColor: "text-arqueo-laranja",
      kpis: kpisPorPerspectiva.financeira,
    },
    {
      id: "clientes",
      nome: "Perspectiva de Clientes",
      descricao: "Como somos vistos pelos clientes?",
      icon: Users,
      color: "bg-arqueo-azul",
      textColor: "text-arqueo-azul",
      kpis: kpisPorPerspectiva.clientes,
    },
    {
      id: "processos",
      nome: "Perspectiva de Processos Internos",
      descricao: "Em que processos devemos nos destacar?",
      icon: Cog,
      color: "bg-arqueo-bordo",
      textColor: "text-arqueo-bordo",
      kpis: kpisPorPerspectiva.processos,
    },
    {
      id: "aprendizado",
      nome: "Perspectiva de Aprendizado e Crescimento",
      descricao: "Como sustentar nossa capacidade de mudar e melhorar?",
      icon: GraduationCap,
      color: "bg-arqueo-amarelo",
      textColor: "text-arqueo-amarelo",
      kpis: kpisPorPerspectiva.aprendizado,
    },
  ];

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
                <h1 className="font-semibold">Dashboard BSC</h1>
                <p className="text-xs text-muted-foreground">Balanced Scorecard</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocation("/dashboard")}>
              Dashboard Executivo
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLocation("/planejamento-grupo")}>
              Planejamento Macro
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Balanced Scorecard - Grupo Arqueo</h1>
          <p className="text-muted-foreground">
            Visão estratégica organizada nas 4 perspectivas do BSC
          </p>
        </div>

        {/* Resumo Geral */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {perspectivas.map((perspectiva) => {
            const Icon = perspectiva.icon;
            return (
              <Card key={perspectiva.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 ${perspectiva.color} rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{perspectiva.kpis.length}</CardTitle>
                      <CardDescription className="text-xs">KPIs</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Perspectivas Detalhadas */}
        <div className="space-y-8">
          {perspectivas.map((perspectiva) => {
            const Icon = perspectiva.icon;
            return (
              <Card key={perspectiva.id} className="border-2">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 ${perspectiva.color} rounded-lg`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl mb-1">{perspectiva.nome}</CardTitle>
                        <CardDescription className="text-base">{perspectiva.descricao}</CardDescription>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${perspectiva.color} text-white`}>
                      {perspectiva.kpis.length} KPIs
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {perspectiva.kpis.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {perspectiva.kpis.map((kpi) => (
                        <Card key={kpi.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{kpi.nome}</CardTitle>
                                <CardDescription className="text-sm">{kpi.unidadeMedida}</CardDescription>
                              </div>
                              <TrendingUp className={`h-5 w-5 ${perspectiva.textColor}`} />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tipo:</span>
                                <span className="font-medium capitalize">{kpi.tipo}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Frequência:</span>
                                <span className="font-medium capitalize">{kpi.frequencia}</span>
                              </div>
                              {kpi.responsavel && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Responsável:</span>
                                  <span className="font-medium">{kpi.responsavel}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum KPI nesta perspectiva</h3>
                      <p className="text-muted-foreground mb-4">
                        Adicione KPIs na perspectiva {perspectiva.nome.toLowerCase()}
                      </p>
                      {(user?.role === "admin" || user?.role === "gestor") && (
                        <Button variant="outline" onClick={() => setLocation("/planejamento-grupo")}>
                          Adicionar KPI
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Informações sobre BSC */}
        <Card className="mt-8 bg-muted/30">
          <CardHeader>
            <CardTitle>Sobre o Balanced Scorecard (BSC)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              O Balanced Scorecard é uma metodologia de gestão estratégica que organiza objetivos e indicadores 
              em 4 perspectivas interligadas, proporcionando uma visão balanceada do desempenho organizacional.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-arqueo-laranja" />
                  Financeira
                </h4>
                <p className="text-sm text-muted-foreground">
                  Foco em resultados financeiros: faturamento, lucro, ROI, margem de contribuição.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-arqueo-azul" />
                  Clientes
                </h4>
                <p className="text-sm text-muted-foreground">
                  Foco na satisfação e retenção: NPS, participação de mercado, satisfação do cliente.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Cog className="h-5 w-5 text-arqueo-bordo" />
                  Processos Internos
                </h4>
                <p className="text-sm text-muted-foreground">
                  Foco em eficiência operacional: qualidade, tempo de entrega, produtividade.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-arqueo-amarelo" />
                  Aprendizado e Crescimento
                </h4>
                <p className="text-sm text-muted-foreground">
                  Foco em capacitação e inovação: treinamentos, clima organizacional, tecnologia.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
