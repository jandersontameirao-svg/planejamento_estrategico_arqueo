import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Building2, Target, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function PlanejamentoGrupo() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"identidade" | "objetivos" | "kpis">("identidade");

  // Identidade
  const { data: identidade, refetch: refetchIdentidade } = trpc.planejamentoGrupo.getIdentidade.useQuery();
  const upsertIdentidade = trpc.planejamentoGrupo.upsertIdentidade.useMutation();

  const [missao, setMissao] = useState("");
  const [visao, setVisao] = useState("");
  const [valores, setValores] = useState("");
  const [politica, setPolitica] = useState("");

  useEffect(() => {
    if (identidade) {
      setMissao(identidade.missao || "");
      setVisao(identidade.visao || "");
      setValores(identidade.valores || "");
      setPolitica(identidade.politica || "");
    }
  }, [identidade]);

  const handleSaveIdentidade = async () => {
    try {
      await upsertIdentidade.mutateAsync({ missao, visao, valores, politica });
      toast.success("Identidade do Grupo salva com sucesso!");
      refetchIdentidade();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar identidade");
    }
  };

  // KPIs
  const { data: kpis, refetch: refetchKPIs } = trpc.planejamentoGrupo.getKPIs.useQuery();
  const createKPI = trpc.planejamentoGrupo.createKPI.useMutation();

  const [showKPIForm, setShowKPIForm] = useState(false);
  const [nomeKPI, setNomeKPI] = useState("");
  const [unidadeMedida, setUnidadeMedida] = useState("");
  const [tipoKPI, setTipoKPI] = useState<"financeiro" | "operacional" | "cliente" | "processo">("financeiro");
  const [frequenciaKPI, setFrequenciaKPI] = useState<"mensal" | "trimestral" | "anual">("mensal");
  const [responsavelKPI, setResponsavelKPI] = useState("");

  const handleCreateKPI = async () => {
    if (!nomeKPI || !unidadeMedida) {
      toast.error("Preencha nome e unidade de medida");
      return;
    }

    try {
      await createKPI.mutateAsync({
        nome: nomeKPI,
        unidadeMedida,
        tipo: tipoKPI,
        frequencia: frequenciaKPI,
        responsavel: responsavelKPI || undefined,
      });
      toast.success("KPI criado com sucesso!");
      setShowKPIForm(false);
      setNomeKPI("");
      setUnidadeMedida("");
      setResponsavelKPI("");
      refetchKPIs();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar KPI");
    }
  };

  const kpiCount = kpis?.length || 0;
  const needsMoreKPIs = kpiCount < 5;

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
                <h1 className="font-semibold">Planejamento Macro</h1>
                <p className="text-xs text-muted-foreground">Grupo Arqueo</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Planejamento Estratégico do Grupo Arqueo</h1>
          <p className="text-muted-foreground">
            Defina a identidade, objetivos e KPIs consolidados do grupo empresarial
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
            Identidade
          </button>
          <button
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "kpis"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("kpis")}
          >
            KPIs Consolidados
            {needsMoreKPIs && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                {kpiCount}/5 mínimo
              </span>
            )}
          </button>
        </div>

        {/* Identidade */}
        {activeTab === "identidade" && (
          <Card>
            <CardHeader>
              <CardTitle>Identidade Organizacional do Grupo</CardTitle>
              <CardDescription>
                Defina a Missão, Visão, Valores e Política que orientam todas as empresas do Grupo Arqueo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="missao">Missão</Label>
                <Textarea
                  id="missao"
                  placeholder="Qual é a razão de existir do Grupo Arqueo?"
                  value={missao}
                  onChange={(e) => setMissao(e.target.value)}
                  rows={4}
                  disabled={user?.role !== "admin"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visao">Visão</Label>
                <Textarea
                  id="visao"
                  placeholder="Onde o Grupo Arqueo quer chegar?"
                  value={visao}
                  onChange={(e) => setVisao(e.target.value)}
                  rows={4}
                  disabled={user?.role !== "admin"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valores">Valores</Label>
                <Textarea
                  id="valores"
                  placeholder="Quais são os princípios que guiam o Grupo Arqueo?"
                  value={valores}
                  onChange={(e) => setValores(e.target.value)}
                  rows={4}
                  disabled={user?.role !== "admin"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="politica">Política</Label>
                <Textarea
                  id="politica"
                  placeholder="Quais são as diretrizes e normas do Grupo Arqueo?"
                  value={politica}
                  onChange={(e) => setPolitica(e.target.value)}
                  rows={4}
                  disabled={user?.role !== "admin"}
                />
              </div>

              {user?.role === "admin" && (
                <Button onClick={handleSaveIdentidade} disabled={upsertIdentidade.isPending}>
                  {upsertIdentidade.isPending ? "Salvando..." : "Salvar Identidade"}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* KPIs */}
        {activeTab === "kpis" && (
          <div className="space-y-6">
            {needsMoreKPIs && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-sm text-red-800">
                    <strong>Atenção:</strong> É necessário cadastrar no mínimo 5 KPIs para o Grupo Arqueo. 
                    Atualmente você possui {kpiCount} KPI{kpiCount !== 1 ? "s" : ""} cadastrado{kpiCount !== 1 ? "s" : ""}.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">KPIs Consolidados do Grupo</h2>
                <p className="text-muted-foreground">
                  Indicadores que agregam dados de todas as empresas
                </p>
              </div>
              {(user?.role === "admin" || user?.role === "gestor") && (
                <Button onClick={() => setShowKPIForm(!showKPIForm)}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Novo KPI
                </Button>
              )}
            </div>

            {showKPIForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Criar Novo KPI do Grupo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeKPI">Nome do KPI *</Label>
                      <Input
                        id="nomeKPI"
                        placeholder="Ex: Faturamento Total do Grupo"
                        value={nomeKPI}
                        onChange={(e) => setNomeKPI(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unidadeMedida">Unidade de Medida *</Label>
                      <Input
                        id="unidadeMedida"
                        placeholder="Ex: R$, %, unidades"
                        value={unidadeMedida}
                        onChange={(e) => setUnidadeMedida(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipoKPI">Tipo</Label>
                      <select
                        id="tipoKPI"
                        className="w-full px-3 py-2 border rounded-md"
                        value={tipoKPI}
                        onChange={(e) => setTipoKPI(e.target.value as any)}
                      >
                        <option value="financeiro">Financeiro</option>
                        <option value="operacional">Operacional</option>
                        <option value="cliente">Cliente</option>
                        <option value="processo">Processo</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequenciaKPI">Frequência</Label>
                      <select
                        id="frequenciaKPI"
                        className="w-full px-3 py-2 border rounded-md"
                        value={frequenciaKPI}
                        onChange={(e) => setFrequenciaKPI(e.target.value as any)}
                      >
                        <option value="mensal">Mensal</option>
                        <option value="trimestral">Trimestral</option>
                        <option value="anual">Anual</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="responsavelKPI">Responsável</Label>
                      <Input
                        id="responsavelKPI"
                        placeholder="Nome do responsável"
                        value={responsavelKPI}
                        onChange={(e) => setResponsavelKPI(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateKPI} disabled={createKPI.isPending}>
                      {createKPI.isPending ? "Criando..." : "Criar KPI"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowKPIForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {kpis && kpis.length > 0 ? (
              <div className="grid gap-4">
                {kpis.map((kpi) => (
                  <Card key={kpi.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{kpi.nome}</CardTitle>
                          <CardDescription>
                            {kpi.unidadeMedida} • {kpi.tipo} • {kpi.frequencia}
                            {kpi.responsavel && ` • Responsável: ${kpi.responsavel}`}
                          </CardDescription>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          kpi.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {kpi.ativo ? "Ativo" : "Inativo"}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum KPI cadastrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece criando os KPIs consolidados do Grupo Arqueo (mínimo 5)
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
