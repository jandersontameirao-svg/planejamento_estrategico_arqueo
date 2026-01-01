import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Building2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface IdentidadeOrganizacionalProps {
  empresaId: number;
}

export default function IdentidadeOrganizacional({ empresaId }: IdentidadeOrganizacionalProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"identidade" | "bsc">("identidade");
  const [formData, setFormData] = useState({
    missao: "",
    visao: "",
    valores: "",
    politica: "",
  });

  const { data: identidade, isLoading, refetch } = trpc.identidade.getByEmpresa.useQuery({ empresaId });
  const { data: empresa } = trpc.empresas.getById.useQuery({ id: empresaId });
  const { data: kpis } = trpc.kpis.listByEmpresa.useQuery({ empresaId });

  const upsertMutation = trpc.identidade.upsert.useMutation({
    onSuccess: () => {
      toast.success("Identidade organizacional salva com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (identidade) {
      setFormData({
        missao: identidade.missao || "",
        visao: identidade.visao || "",
        valores: identidade.valores || "",
        politica: identidade.politica || "",
      });
    }
  }, [identidade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate({
      empresaId,
      ...formData,
    });
  };

  const canEdit = user?.role === "admin" || user?.role === "gestor";

  if (isLoading) {
    return (
      <div className="container py-8">
        <p>Carregando...</p>
      </div>
    );
  }

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
                <h1 className="font-semibold">{empresa?.nome}</h1>
                <p className="text-xs text-muted-foreground">Identidade Organizacional</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocation(`/empresa/${empresaId}/kpis`)}>
              KPIs
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{empresa?.nome}</h1>
            <p className="text-muted-foreground">
              Planejamento estratégico da empresa
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "identidade"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("identidade")}
            >
              Identidade Organizacional
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "bsc"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("bsc")}
            >
              BSC (Balanced Scorecard)
            </button>
          </div>

          {activeTab === "identidade" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Missão</CardTitle>
                <CardDescription>
                  Razão de existir da empresa, seu propósito fundamental
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.missao}
                  onChange={(e) => setFormData({ ...formData, missao: e.target.value })}
                  placeholder="Descreva a missão da empresa..."
                  rows={4}
                  disabled={!canEdit}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visão</CardTitle>
                <CardDescription>
                  Onde a empresa quer chegar, seu objetivo de longo prazo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.visao}
                  onChange={(e) => setFormData({ ...formData, visao: e.target.value })}
                  placeholder="Descreva a visão da empresa..."
                  rows={4}
                  disabled={!canEdit}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valores</CardTitle>
                <CardDescription>
                  Princípios e crenças que guiam as ações da empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.valores}
                  onChange={(e) => setFormData({ ...formData, valores: e.target.value })}
                  placeholder="Liste os valores da empresa..."
                  rows={6}
                  disabled={!canEdit}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Política</CardTitle>
                <CardDescription>
                  Diretrizes e normas que orientam as decisões e comportamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.politica}
                  onChange={(e) => setFormData({ ...formData, politica: e.target.value })}
                  placeholder="Descreva as políticas da empresa..."
                  rows={6}
                  disabled={!canEdit}
                />
              </CardContent>
            </Card>

            {canEdit && (
              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={upsertMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {upsertMutation.isPending ? "Salvando..." : "Salvar Identidade"}
                </Button>
              </div>
            )}
          </form>
          )}

          {/* BSC */}
          {activeTab === "bsc" && (
            <div className="space-y-6">
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle>Balanced Scorecard - {empresa?.nome}</CardTitle>
                  <CardDescription>
                    Visão estratégica organizada nas 4 perspectivas do BSC
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Perspectiva Financeira */}
              <Card className="border-2 border-arqueo-laranja/30">
                <CardHeader className="bg-arqueo-laranja/10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-arqueo-laranja rounded-lg">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Perspectiva Financeira</CardTitle>
                      <CardDescription>Como somos vistos pelos acionistas?</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {kpis?.filter(k => k.perspectivaBSC === "financeira").length ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {kpis.filter(k => k.perspectivaBSC === "financeira").map((kpi) => (
                        <Card key={kpi.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-base">{kpi.nome}</CardTitle>
                            <CardDescription>{kpi.unidadeMedida}</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tipo:</span>
                              <span className="font-medium capitalize">{kpi.tipo}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Frequência:</span>
                              <span className="font-medium capitalize">{kpi.frequencia}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum KPI cadastrado nesta perspectiva. Acesse a aba KPIs para adicionar.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Perspectiva de Clientes */}
              <Card className="border-2 border-arqueo-azul/30">
                <CardHeader className="bg-arqueo-azul/10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-arqueo-azul rounded-lg">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Perspectiva de Clientes</CardTitle>
                      <CardDescription>Como somos vistos pelos clientes?</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {kpis?.filter(k => k.perspectivaBSC === "clientes").length ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {kpis.filter(k => k.perspectivaBSC === "clientes").map((kpi) => (
                        <Card key={kpi.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-base">{kpi.nome}</CardTitle>
                            <CardDescription>{kpi.unidadeMedida}</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tipo:</span>
                              <span className="font-medium capitalize">{kpi.tipo}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Frequência:</span>
                              <span className="font-medium capitalize">{kpi.frequencia}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum KPI cadastrado nesta perspectiva. Acesse a aba KPIs para adicionar.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Perspectiva de Processos Internos */}
              <Card className="border-2 border-arqueo-bordo/30">
                <CardHeader className="bg-arqueo-bordo/10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-arqueo-bordo rounded-lg">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Perspectiva de Processos Internos</CardTitle>
                      <CardDescription>Em que processos devemos nos destacar?</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {kpis?.filter(k => k.perspectivaBSC === "processos").length ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {kpis.filter(k => k.perspectivaBSC === "processos").map((kpi) => (
                        <Card key={kpi.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-base">{kpi.nome}</CardTitle>
                            <CardDescription>{kpi.unidadeMedida}</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tipo:</span>
                              <span className="font-medium capitalize">{kpi.tipo}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Frequência:</span>
                              <span className="font-medium capitalize">{kpi.frequencia}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum KPI cadastrado nesta perspectiva. Acesse a aba KPIs para adicionar.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Perspectiva de Aprendizado e Crescimento */}
              <Card className="border-2 border-arqueo-amarelo/30">
                <CardHeader className="bg-arqueo-amarelo/10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-arqueo-amarelo rounded-lg">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Perspectiva de Aprendizado e Crescimento</CardTitle>
                      <CardDescription>Como sustentar nossa capacidade de mudar e melhorar?</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {kpis?.filter(k => k.perspectivaBSC === "aprendizado").length ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {kpis.filter(k => k.perspectivaBSC === "aprendizado").map((kpi) => (
                        <Card key={kpi.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-base">{kpi.nome}</CardTitle>
                            <CardDescription>{kpi.unidadeMedida}</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tipo:</span>
                              <span className="font-medium capitalize">{kpi.tipo}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Frequência:</span>
                              <span className="font-medium capitalize">{kpi.frequencia}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum KPI cadastrado nesta perspectiva. Acesse a aba KPIs para adicionar.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
