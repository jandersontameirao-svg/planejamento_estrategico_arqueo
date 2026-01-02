import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const [activeTab, setActiveTab] = useState<"identidade" | "bsc" | "pestel" | "forcas" | "stakeholders" | "rbv" | "swot" | "okr">("identidade");
  const [formData, setFormData] = useState({
    missao: "",
    visao: "",
    valores: "",
    politica: "",
  });

  const { data: identidade, isLoading, refetch } = trpc.identidade.getByEmpresa.useQuery({ empresaId });
  const { data: empresa } = trpc.empresas.getById.useQuery({ id: empresaId });
  // Buscar KPIs do Grupo para visualização consolidada
  const { data: kpis } = trpc.planejamentoGrupo.getKPIs.useQuery();

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
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "pestel"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("pestel")}
            >
              PESTEL
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "forcas"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("forcas")}
            >
              5 Forças de Porter
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "stakeholders"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("stakeholders")}
            >
              Stakeholders
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "rbv"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("rbv")}
            >
              RBV/VRIO
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "swot"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("swot")}
            >
              SWOT/TOWS
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "okr"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("okr")}
            >
              OKR
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
                <CardContent>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Nota:</strong> Os KPIs e valores exibidos são consolidados do <strong>Planejamento Macro do Grupo Arqueo</strong>. 
                      Para lançar ou editar valores, acesse o Planejamento Macro na página inicial.
                    </p>
                  </div>
                </CardContent>
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
                  {kpis?.filter((k: any) => k.perspectivaBSC === "financeira").length ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {kpis.filter((k: any) => k.perspectivaBSC === "financeira").map((kpi: any) => (
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
                  {kpis?.filter((k: any) => k.perspectivaBSC === "clientes").length ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {kpis.filter((k: any) => k.perspectivaBSC === "clientes").map((kpi: any) => (
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
                  {kpis?.filter((k: any) => k.perspectivaBSC === "processos").length ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {kpis.filter((k: any) => k.perspectivaBSC === "processos").map((kpi: any) => (
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
                  {kpis?.filter((k: any) => k.perspectivaBSC === "aprendizado").length ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {kpis.filter((k: any) => k.perspectivaBSC === "aprendizado").map((kpi: any) => (
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

          {/* PESTEL */}
          {activeTab === "pestel" && (
            <div className="space-y-6">
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle>Análise PESTEL</CardTitle>
                  <CardDescription>
                    Análise dos fatores externos: Político, Econômico, Social, Tecnológico, Ecológico e Legal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>PESTEL</strong> analisa o ambiente externo da empresa. Identifique oportunidades e ameaças em cada fator.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Político</Label>
                    <Textarea placeholder="Legislação, políticas governamentais, estabilidade política..." rows={3} disabled={!canEdit} />
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Econômico</Label>
                    <Textarea placeholder="Taxa de juros, inflação, crescimento econômico, crise..." rows={3} disabled={!canEdit} />
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Social</Label>
                    <Textarea placeholder="Tendências demográficas, cultura, valores, estilo de vida..." rows={3} disabled={!canEdit} />
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Tecnológico</Label>
                    <Textarea placeholder="Inovação, automação, inteligência artificial, cibersegurança..." rows={3} disabled={!canEdit} />
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Ecológico</Label>
                    <Textarea placeholder="Sustentabilidade, mudanças climáticas, recursos naturais..." rows={3} disabled={!canEdit} />
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Legal</Label>
                    <Textarea placeholder="Regulamentação, conformidade, direitos trabalhistas, proteção de dados..." rows={3} disabled={!canEdit} />
                  </div>
                  
                  {canEdit && (
                    <div className="flex justify-end">
                      <Button type="submit" size="lg">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Análise PESTEL
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* 5 Forças de Porter */}
          {activeTab === "forcas" && (
            <div className="space-y-6">
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle>5 Forças de Porter</CardTitle>
                  <CardDescription>
                    Análise da competitividade: Rivalidade, Poder dos Fornecedores, Poder dos Clientes, Ameaça de Novos Entrantes e Ameaça de Substitutos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>5 Forças de Porter</strong> avalia a intensidade da competição no setor e a atratividade do mercado.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Rivalidade entre Concorrentes</Label>
                    <Textarea placeholder="Número de concorrentes, diferença de produtos, custos de saída..." rows={3} disabled={!canEdit} />
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Poder dos Fornecedores</Label>
                    <Textarea placeholder="Número de fornecedores, dependência, custos de mudança..." rows={3} disabled={!canEdit} />
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Poder dos Clientes</Label>
                    <Textarea placeholder="Concentração de clientes, sensibilidade ao preço, poder de negociação..." rows={3} disabled={!canEdit} />
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Ameaça de Novos Entrantes</Label>
                    <Textarea placeholder="Barreiras de entrada, capital necessário, economia de escala..." rows={3} disabled={!canEdit} />
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Ameaça de Produtos Substitutos</Label>
                    <Textarea placeholder="Disponibilidade de substitutos, preço, desempenho..." rows={3} disabled={!canEdit} />
                  </div>
                  
                  {canEdit && (
                    <div className="flex justify-end">
                      <Button type="submit" size="lg">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Análise 5 Forças
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Stakeholders */}
          {activeTab === "stakeholders" && (
            <div className="space-y-6">
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle>Análise de Stakeholders</CardTitle>
                  <CardDescription>
                    Matriz de Poder x Interesse: identifique e gerencie as partes interessadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Stakeholders</strong> são grupos com interesse na empresa. Mapeie seu poder e interesse para definir estratégias de engajamento.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-red-300 bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-2">Alto Poder / Alto Interesse</h4>
                      <p className="text-sm text-red-800 mb-2">Gerenciar Ativamente</p>
                      <Textarea placeholder="Ex: Acionistas, Conselho, Clientes-chave" rows={3} disabled={!canEdit} />
                    </div>
                    
                    <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">Alto Poder / Baixo Interesse</h4>
                      <p className="text-sm text-yellow-800 mb-2">Manter Satisfeito</p>
                      <Textarea placeholder="Ex: Governo, Reguladores, Bancos" rows={3} disabled={!canEdit} />
                    </div>
                    
                    <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">Baixo Poder / Alto Interesse</h4>
                      <p className="text-sm text-yellow-800 mb-2">Manter Informado</p>
                      <Textarea placeholder="Ex: Funcionários, Fornecedores, Comunidade" rows={3} disabled={!canEdit} />
                    </div>
                    
                    <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">Baixo Poder / Baixo Interesse</h4>
                      <p className="text-sm text-green-800 mb-2">Monitorar</p>
                      <Textarea placeholder="Ex: Público geral, Concorrentes indiretos" rows={3} disabled={!canEdit} />
                    </div>
                  </div>
                  
                  {canEdit && (
                    <div className="flex justify-end">
                      <Button type="submit" size="lg">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Análise de Stakeholders
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* RBV/VRIO */}
          {activeTab === "rbv" && (
            <div className="space-y-6">
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle>RBV/VRIO</CardTitle>
                  <CardDescription>
                    Análise de Recursos e Capacidades: Valioso, Raro, Inimitável e Organizado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>RBV/VRIO</strong> identifica recursos e capacidades que geram vantagem competitiva sustentável.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Recursos e Capacidades Valiosos</Label>
                    <Textarea placeholder="Quais recursos/capacidades agregam valor aos clientes?" rows={3} disabled={!canEdit} />
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Recursos Raros</Label>
                    <Textarea placeholder="Quais recursos são difíceis de encontrar no mercado?" rows={3} disabled={!canEdit} />
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Recursos Inimitáveis</Label>
                    <Textarea placeholder="Quais recursos são difíceis de copiar pelos concorrentes?" rows={3} disabled={!canEdit} />
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Organização para Explorar</Label>
                    <Textarea placeholder="A empresa está organizada para explorar esses recursos?" rows={3} disabled={!canEdit} />
                  </div>
                  
                  {canEdit && (
                    <div className="flex justify-end">
                      <Button type="submit" size="lg">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Análise RBV/VRIO
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* SWOT/TOWS */}
          {activeTab === "swot" && (
            <div className="space-y-6">
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle>SWOT/TOWS</CardTitle>
                  <CardDescription>
                    Análise de Forças, Fraquezas, Oportunidades e Ameaças
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>SWOT</strong> integra análises internas (Forças/Fraquezas) e externas (Oportunidades/Ameaças). <strong>TOWS</strong> usa essa matriz para gerar estratégias.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">Forças (Strengths)</h4>
                      <p className="text-sm text-green-800 mb-2">Internas - Positivas</p>
                      <Textarea placeholder="Competências, recursos, vantagens..." rows={4} disabled={!canEdit} />
                    </div>
                    
                    <div className="border-2 border-red-300 bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-2">Fraquezas (Weaknesses)</h4>
                      <p className="text-sm text-red-800 mb-2">Internas - Negativas</p>
                      <Textarea placeholder="Limitações, desvantagens, gaps..." rows={4} disabled={!canEdit} />
                    </div>
                    
                    <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Oportunidades (Opportunities)</h4>
                      <p className="text-sm text-blue-800 mb-2">Externas - Positivas</p>
                      <Textarea placeholder="Mercados, tendências, possibilidades..." rows={4} disabled={!canEdit} />
                    </div>
                    
                    <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">Ameaças (Threats)</h4>
                      <p className="text-sm text-yellow-800 mb-2">Externas - Negativas</p>
                      <Textarea placeholder="Riscos, competição, mudanças..." rows={4} disabled={!canEdit} />
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Estratégias TOWS</Label>
                    <Textarea placeholder="Estratégias derivadas da matriz SWOT (SO, ST, WO, WT)..." rows={4} disabled={!canEdit} />
                  </div>
                  
                  {canEdit && (
                    <div className="flex justify-end">
                      <Button type="submit" size="lg">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Análise SWOT/TOWS
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* OKR */}
          {activeTab === "okr" && (
            <div className="space-y-6">
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle>OKR (Objectives and Key Results)</CardTitle>
                  <CardDescription>
                    Metodologia de definição de objetivos e resultados-chave mensuráveis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>OKR</strong> define objetivos ambiciosos e resultados-chave mensuráveis para alinhar a organização e medir progresso.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Objetivo 1</Label>
                    <Input placeholder="Ex: Aumentar participação de mercado" disabled={!canEdit} />
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-semibold">Key Results:</p>
                      <Input placeholder="KR1: Aumentar vendas em 30%" disabled={!canEdit} />
                      <Input placeholder="KR2: Conquistar 5 novos clientes estratégicos" disabled={!canEdit} />
                      <Input placeholder="KR3: Reduzir churn de clientes em 20%" disabled={!canEdit} />
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Objetivo 2</Label>
                    <Input placeholder="Ex: Melhorar satisfação do cliente" disabled={!canEdit} />
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-semibold">Key Results:</p>
                      <Input placeholder="KR1: Aumentar NPS para 70+" disabled={!canEdit} />
                      <Input placeholder="KR2: Reduzir tempo de resposta em 50%" disabled={!canEdit} />
                      <Input placeholder="KR3: Atingir 95% de resolução na 1ª chamada" disabled={!canEdit} />
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <Label className="text-base font-semibold mb-2 block">Objetivo 3</Label>
                    <Input placeholder="Ex: Inovar em produtos/serviços" disabled={!canEdit} />
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-semibold">Key Results:</p>
                      <Input placeholder="KR1: Lançar 2 novos produtos" disabled={!canEdit} />
                      <Input placeholder="KR2: Atingir 40% de receita de novos produtos" disabled={!canEdit} />
                      <Input placeholder="KR3: Implementar 3 melhorias de processo" disabled={!canEdit} />
                    </div>
                  </div>
                  
                  {canEdit && (
                    <div className="flex justify-end">
                      <Button type="submit" size="lg">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar OKRs
                      </Button>
                    </div>
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
