import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Building2, Target, TrendingUp, Calendar, Link as LinkIcon, X, Plus, Edit, Trash2, CheckCircle2, Circle, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function PlanejamentoGrupo() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"identidade" | "objetivos" | "projetos" | "bsc">("identidade");

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

  // Objetivos Estratégicos
  const { data: objetivos, refetch: refetchObjetivos } = trpc.objetivosGrupo.list.useQuery();
  const createObjetivo = trpc.objetivosGrupo.create.useMutation();
  const updateObjetivo = trpc.objetivosGrupo.update.useMutation();
  const deleteObjetivo = trpc.objetivosGrupo.delete.useMutation();
  const vincularKPI = trpc.objetivosGrupo.vincularKPI.useMutation();
  const desvincularKPI = trpc.objetivosGrupo.desvincularKPI.useMutation();

  const [showObjetivoDialog, setShowObjetivoDialog] = useState(false);
  const [editingObjetivo, setEditingObjetivo] = useState<any>(null);
  const [objetivoTitulo, setObjetivoTitulo] = useState("");
  const [objetivoDescricao, setObjetivoDescricao] = useState("");
  const [objetivoPerspectiva, setObjetivoPerspectiva] = useState<"financeira" | "clientes" | "processos" | "aprendizado">("financeira");
  const [objetivoPrazo, setObjetivoPrazo] = useState("");
  const [objetivoStatus, setObjetivoStatus] = useState<"planejado" | "em_andamento" | "concluido" | "cancelado">("planejado");

  const [showVincularKPIDialog, setShowVincularKPIDialog] = useState(false);
  const [objetivoParaVincular, setObjetivoParaVincular] = useState<any>(null);
  const { data: kpisVinculados, refetch: refetchKPIsVinculados } = trpc.objetivosGrupo.getKPIsVinculados.useQuery(
    { objetivoId: objetivoParaVincular?.id || 0 },
    { enabled: !!objetivoParaVincular }
  );

  const handleOpenObjetivoDialog = (objetivo?: any) => {
    if (objetivo) {
      setEditingObjetivo(objetivo);
      setObjetivoTitulo(objetivo.titulo);
      setObjetivoDescricao(objetivo.descricao || "");
      setObjetivoPerspectiva(objetivo.perspectivaBSC || "financeira");
      setObjetivoPrazo(objetivo.prazo || "");
      setObjetivoStatus(objetivo.status || "planejado");
    } else {
      setEditingObjetivo(null);
      setObjetivoTitulo("");
      setObjetivoDescricao("");
      setObjetivoPerspectiva("financeira");
      setObjetivoPrazo("");
      setObjetivoStatus("planejado");
    }
    setShowObjetivoDialog(true);
  };

  const handleSaveObjetivo = async () => {
    if (!objetivoTitulo) {
      toast.error("Preencha o título do objetivo");
      return;
    }

    try {
      if (editingObjetivo) {
        await updateObjetivo.mutateAsync({
          id: editingObjetivo.id,
          titulo: objetivoTitulo,
          descricao: objetivoDescricao,
          perspectivaBSC: objetivoPerspectiva,
          prazo: objetivoPrazo,
          status: objetivoStatus,
        });
        toast.success("Objetivo atualizado com sucesso!");
      } else {
        await createObjetivo.mutateAsync({
          titulo: objetivoTitulo,
          descricao: objetivoDescricao,
          perspectivaBSC: objetivoPerspectiva,
          prazo: objetivoPrazo,
          status: objetivoStatus,
        });
        toast.success("Objetivo criado com sucesso!");
      }
      setShowObjetivoDialog(false);
      refetchObjetivos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar objetivo");
    }
  };

  const handleDeleteObjetivo = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este objetivo?")) return;

    try {
      await deleteObjetivo.mutateAsync({ id });
      toast.success("Objetivo excluído com sucesso!");
      refetchObjetivos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir objetivo");
    }
  };

  const handleOpenVincularKPIDialog = (objetivo: any) => {
    setObjetivoParaVincular(objetivo);
    setShowVincularKPIDialog(true);
  };

  const handleVincularKPI = async (kpiId: number) => {
    if (!objetivoParaVincular) return;

    try {
      await vincularKPI.mutateAsync({
        objetivoId: objetivoParaVincular.id,
        kpiId,
      });
      toast.success("KPI vinculado com sucesso!");
      refetchKPIsVinculados();
    } catch (error: any) {
      toast.error(error.message || "Erro ao vincular KPI");
    }
  };

  const handleDesvincularKPI = async (kpiId: number) => {
    if (!objetivoParaVincular) return;

    try {
      await desvincularKPI.mutateAsync({
        objetivoId: objetivoParaVincular.id,
        kpiId,
      });
      toast.success("KPI desvinculado com sucesso!");
      refetchKPIsVinculados();
    } catch (error: any) {
      toast.error(error.message || "Erro ao desvincular KPI");
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
  const [perspectivaBSC, setPerspectivaBSC] = useState<"financeira" | "clientes" | "processos" | "aprendizado">("financeira");
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
        perspectivaBSC,
        responsavel: responsavelKPI || undefined,
      });
      toast.success("KPI criado com sucesso!");
      setShowKPIForm(false);
      setNomeKPI("");
      setUnidadeMedida("");
      setPerspectivaBSC("financeira");
      setResponsavelKPI("");
      refetchKPIs();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar KPI");
    }
  };

  const kpiCount = kpis?.length || 0;
  const needsMoreKPIs = kpiCount < 5;

  // Organizar objetivos por perspectiva BSC
  const objetivosPorPerspectiva = {
    financeira: objetivos?.filter(o => o.perspectivaBSC === "financeira") || [],
    clientes: objetivos?.filter(o => o.perspectivaBSC === "clientes") || [],
    processos: objetivos?.filter(o => o.perspectivaBSC === "processos") || [],
    aprendizado: objetivos?.filter(o => o.perspectivaBSC === "aprendizado") || [],
  };

  const perspectivasLabels = {
    financeira: "Financeira",
    clientes: "Clientes",
    processos: "Processos Internos",
    aprendizado: "Aprendizado e Crescimento",
  };

  const statusLabels = {
    planejado: "Planejado",
    em_andamento: "Em Andamento",
    concluido: "Concluído",
    cancelado: "Cancelado",
  };

  const statusIcons = {
    planejado: Circle,
    em_andamento: Clock,
    concluido: CheckCircle2,
    cancelado: XCircle,
  };

  const statusColors = {
    planejado: "bg-gray-100 text-gray-800",
    em_andamento: "bg-blue-100 text-blue-800",
    concluido: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
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
              activeTab === "objetivos"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("objetivos")}
          >
            Objetivos Estratégicos
          </button>

          <button
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "projetos"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("projetos")}
          >
            Projetos e Iniciativas
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

        {/* Objetivos Estratégicos */}
        {activeTab === "objetivos" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Objetivos Estratégicos do Grupo</h2>
                <p className="text-muted-foreground">
                  Defina os objetivos estratégicos organizados nas 4 perspectivas do BSC
                </p>
              </div>
              {user?.role === "admin" && (
                <Button onClick={() => handleOpenObjetivoDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Objetivo
                </Button>
              )}
            </div>

            {objetivos && objetivos.length > 0 ? (
              <div className="space-y-6">
                {(Object.keys(perspectivasLabels) as Array<keyof typeof perspectivasLabels>).map((perspectiva) => {
                  const objetivosDaPerspectiva = objetivosPorPerspectiva[perspectiva];
                  if (objetivosDaPerspectiva.length === 0) return null;

                  return (
                    <div key={perspectiva}>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        {perspectivasLabels[perspectiva]}
                      </h3>
                      <div className="grid gap-4">
                        {objetivosDaPerspectiva.map((objetivo) => {
                          const StatusIcon = statusIcons[objetivo.status || "planejado"];
                          return (
                            <Card key={objetivo.id}>
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <CardTitle className="text-lg">{objetivo.titulo}</CardTitle>
                                      <Badge className={statusColors[objetivo.status || "planejado"]}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {statusLabels[objetivo.status || "planejado"]}
                                      </Badge>
                                    </div>
                                    {objetivo.descricao && (
                                      <CardDescription className="mb-2">{objetivo.descricao}</CardDescription>
                                    )}
                                    {objetivo.prazo && (
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        Prazo: {objetivo.prazo instanceof Date ? objetivo.prazo.toLocaleDateString('pt-BR') : objetivo.prazo}
                                      </div>
                                    )}
                                  </div>
                                  {user?.role === "admin" && (
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleOpenVincularKPIDialog(objetivo)}
                                      >
                                        <LinkIcon className="h-4 w-4 mr-1" />
                                        KPIs
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleOpenObjetivoDialog(objetivo)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeleteObjetivo(objetivo.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </CardHeader>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum objetivo cadastrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece criando os objetivos estratégicos do Grupo Arqueo
                  </p>
                  {user?.role === "admin" && (
                    <Button onClick={() => handleOpenObjetivoDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeiro Objetivo
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Dialog de Criar/Editar Objetivo */}
        <Dialog open={showObjetivoDialog} onOpenChange={setShowObjetivoDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingObjetivo ? "Editar Objetivo" : "Criar Novo Objetivo"}</DialogTitle>
              <DialogDescription>
                Defina o título, descrição, perspectiva BSC, prazo e status do objetivo estratégico
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="objetivoTitulo">Título *</Label>
                <Input
                  id="objetivoTitulo"
                  placeholder="Ex: Aumentar a rentabilidade do Grupo"
                  value={objetivoTitulo}
                  onChange={(e) => setObjetivoTitulo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objetivoDescricao">Descrição</Label>
                <Textarea
                  id="objetivoDescricao"
                  placeholder="Descreva o objetivo estratégico..."
                  value={objetivoDescricao}
                  onChange={(e) => setObjetivoDescricao(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="objetivoPerspectiva">Perspectiva BSC</Label>
                  <Select value={objetivoPerspectiva} onValueChange={(v: any) => setObjetivoPerspectiva(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financeira">Financeira</SelectItem>
                      <SelectItem value="clientes">Clientes</SelectItem>
                      <SelectItem value="processos">Processos Internos</SelectItem>
                      <SelectItem value="aprendizado">Aprendizado e Crescimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objetivoStatus">Status</Label>
                  <Select value={objetivoStatus} onValueChange={(v: any) => setObjetivoStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planejado">Planejado</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objetivoPrazo">Prazo</Label>
                <Input
                  id="objetivoPrazo"
                  placeholder="Ex: Dezembro 2026"
                  value={objetivoPrazo}
                  onChange={(e) => setObjetivoPrazo(e.target.value)}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowObjetivoDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveObjetivo} disabled={createObjetivo.isPending || updateObjetivo.isPending}>
                  {createObjetivo.isPending || updateObjetivo.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Vincular KPIs */}
        <Dialog open={showVincularKPIDialog} onOpenChange={setShowVincularKPIDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vincular KPIs ao Objetivo</DialogTitle>
              <DialogDescription>
                {objetivoParaVincular?.titulo}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">KPIs Vinculados</h4>
                {kpisVinculados && kpisVinculados.length > 0 ? (
                  <div className="space-y-2">
                    {kpisVinculados.map((kpi) => (
                      <div key={kpi.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{kpi.nome}</p>
                          <p className="text-sm text-muted-foreground">{kpi.unidadeMedida}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDesvincularKPI(kpi.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum KPI vinculado</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">KPIs Disponíveis</h4>
                {kpis && kpis.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {kpis
                      .filter((kpi) => !kpisVinculados?.some((kv) => kv.id === kpi.id))
                      .map((kpi) => (
                        <div key={kpi.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{kpi.nome}</p>
                            <p className="text-sm text-muted-foreground">{kpi.unidadeMedida}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVincularKPI(kpi.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum KPI disponível</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowVincularKPIDialog(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Projetos e Iniciativas */}
        {activeTab === "projetos" && (
          <ProjetosTab 
            user={user} 
            kpis={kpis || []} 
            objetivos={objetivos || []}
          />
        )}

        {/* KPIs removido - agora apenas no BSC */}
        {false && (
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

                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="perspectivaBSC">Perspectiva BSC *</Label>
                      <select
                        id="perspectivaBSC"
                        className="w-full px-3 py-2 border rounded-md"
                        value={perspectivaBSC}
                        onChange={(e) => setPerspectivaBSC(e.target.value as any)}
                      >
                        <option value="financeira">Financeira</option>
                        <option value="clientes">Clientes</option>
                        <option value="processos">Processos Internos</option>
                        <option value="aprendizado">Aprendizado e Crescimento</option>
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

            {kpis?.length ? (
              <div className="grid gap-4">
                {kpis?.map((kpi) => (
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

        {/* BSC */}
        {activeTab === "bsc" && (
          <BSCTab 
            kpis={kpis || []} 
            user={user} 
            showKPIForm={showKPIForm}
            setShowKPIForm={setShowKPIForm}
            nomeKPI={nomeKPI}
            setNomeKPI={setNomeKPI}
            unidadeMedida={unidadeMedida}
            setUnidadeMedida={setUnidadeMedida}
            tipoKPI={tipoKPI}
            setTipoKPI={setTipoKPI}
            frequenciaKPI={frequenciaKPI}
            setFrequenciaKPI={setFrequenciaKPI}
            perspectivaBSC={perspectivaBSC}
            setPerspectivaBSC={setPerspectivaBSC}
            responsavelKPI={responsavelKPI}
            setResponsavelKPI={setResponsavelKPI}
            handleCreateKPI={handleCreateKPI}
            createKPI={createKPI}
            needsMoreKPIs={needsMoreKPIs}
            kpiCount={kpiCount}
          />
        )}
      </main>
    </div>
  );
}

// Componente BSC Tab (mantido do código original)
function BSCTab({ kpis, user, showKPIForm, setShowKPIForm, nomeKPI, setNomeKPI, unidadeMedida, setUnidadeMedida, tipoKPI, setTipoKPI, frequenciaKPI, setFrequenciaKPI, perspectivaBSC, setPerspectivaBSC, responsavelKPI, setResponsavelKPI, handleCreateKPI, createKPI, needsMoreKPIs, kpiCount }: any) {
  const { data: kpiValores, refetch: refetchValores } = trpc.kpiValores.listByKpi.useQuery(
    { kpiId: 0 },
    { enabled: false }
  );
  const createValor = trpc.kpiValores.upsert.useMutation();
  
  const [showValorDialog, setShowValorDialog] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<any>(null);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [meta, setMeta] = useState("");
  const [realizado, setRealizado] = useState("");

  const { data: valores, refetch: refetchValoresKPI } = trpc.kpiValores.listByKpi.useQuery(
    { kpiId: selectedKPI?.id || 0 },
    { enabled: !!selectedKPI }
  );

  const handleOpenValorDialog = (kpi: any) => {
    setSelectedKPI(kpi);
    setShowValorDialog(true);
  };

  const handleSaveValor = async () => {
    if (!selectedKPI || !meta || !realizado) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await createValor.mutateAsync({
        kpiId: selectedKPI.id,
        ano,
        mes,
        meta: parseFloat(meta),
        realizado: parseFloat(realizado),
      });
      toast.success("Valor registrado com sucesso!");
      setShowValorDialog(false);
      setMeta("");
      setRealizado("");
      refetchValoresKPI();
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar valor");
    }
  };

  const kpisPorPerspectiva = {
    financeira: kpis.filter((k: any) => k.perspectivaBSC === "financeira"),
    clientes: kpis.filter((k: any) => k.perspectivaBSC === "clientes"),
    processos: kpis.filter((k: any) => k.perspectivaBSC === "processos"),
    aprendizado: kpis.filter((k: any) => k.perspectivaBSC === "aprendizado"),
  };

  const perspectivasLabels = {
    financeira: "Financeira",
    clientes: "Clientes",
    processos: "Processos Internos",
    aprendizado: "Aprendizado e Crescimento",
  };

  const calcularStatus = (valores: any[]) => {
    if (!valores || valores.length === 0) return null;
    const ultimo = valores[valores.length - 1];
    const percentual = (ultimo.realizado / ultimo.meta) * 100;
    if (percentual >= 90) return { cor: "bg-green-500", label: "Verde" };
    if (percentual >= 70) return { cor: "bg-yellow-500", label: "Amarelo" };
    return { cor: "bg-red-500", label: "Vermelho" };
  };

  return (
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
          <h2 className="text-2xl font-bold">BSC - Balanced Scorecard</h2>
          <p className="text-muted-foreground">
            KPIs organizados nas 4 perspectivas estratégicas
          </p>
        </div>
        {(user?.role === "admin" || user?.role === "gestor") && (
          <Button onClick={() => setShowKPIForm(!showKPIForm)}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Criar KPI
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

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="perspectivaBSC">Perspectiva BSC *</Label>
                <select
                  id="perspectivaBSC"
                  className="w-full px-3 py-2 border rounded-md"
                  value={perspectivaBSC}
                  onChange={(e) => setPerspectivaBSC(e.target.value as any)}
                >
                  <option value="financeira">Financeira</option>
                  <option value="clientes">Clientes</option>
                  <option value="processos">Processos Internos</option>
                  <option value="aprendizado">Aprendizado e Crescimento</option>
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

      {kpis.length > 0 ? (
        <div className="space-y-8">
          {(Object.keys(perspectivasLabels) as Array<keyof typeof perspectivasLabels>).map((perspectiva) => {
            const kpisDaPerspectiva = kpisPorPerspectiva[perspectiva];
            if (kpisDaPerspectiva.length === 0) return null;

            return (
              <div key={perspectiva}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {perspectivasLabels[perspectiva]}
                </h3>
                <div className="grid gap-4">
                  {kpisDaPerspectiva.map((kpi: any) => (
                    <KPICard 
                      key={kpi.id} 
                      kpi={kpi} 
                      user={user} 
                      onLancarValor={handleOpenValorDialog}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum KPI cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando os KPIs do Grupo Arqueo organizados nas 4 perspectivas do BSC
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Lançar Valor */}
      <Dialog open={showValorDialog} onOpenChange={setShowValorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lançar Valor Mensal</DialogTitle>
            <DialogDescription>
              {selectedKPI?.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mes">Mês</Label>
                <select
                  id="mes"
                  className="w-full px-3 py-2 border rounded-md"
                  value={mes}
                  onChange={(e) => setMes(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleDateString("pt-BR", { month: "long" })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <Input
                  id="ano"
                  type="number"
                  value={ano}
                  onChange={(e) => setAno(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta">Meta</Label>
              <Input
                id="meta"
                type="number"
                step="0.01"
                placeholder="Valor da meta"
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="realizado">Realizado</Label>
              <Input
                id="realizado"
                type="number"
                step="0.01"
                placeholder="Valor realizado"
                value={realizado}
                onChange={(e) => setRealizado(e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowValorDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveValor} disabled={createValor.isPending}>
                {createValor.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente KPICard (mantido do código original)
function KPICard({ kpi, user, onLancarValor }: any) {
  const { data: valores } = trpc.kpiValores.listByKpi.useQuery({ kpiId: kpi.id });
  
  const calcularStatus = (valores: any[]) => {
    if (!valores || valores.length === 0) return null;
    const ultimo = valores[valores.length - 1];
    const percentual = (ultimo.realizado / ultimo.meta) * 100;
    if (percentual >= 90) return { cor: "bg-green-500", label: "Verde", percentual };
    if (percentual >= 70) return { cor: "bg-yellow-500", label: "Amarelo", percentual };
    return { cor: "bg-red-500", label: "Vermelho", percentual };
  };

  const status = valores ? calcularStatus(valores) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{kpi.nome}</CardTitle>
              {status && (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${status.cor}`} />
                  <span className="text-sm text-muted-foreground">
                    {status.percentual.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <CardDescription>
              {kpi.unidadeMedida} • {kpi.tipo} • {kpi.frequencia}
              {kpi.responsavel && ` • Responsável: ${kpi.responsavel}`}
            </CardDescription>
          </div>
          {(user?.role === "admin" || user?.role === "gestor") && (
            <Button size="sm" onClick={() => onLancarValor(kpi)}>
              Lançar Valor
            </Button>
          )}
        </div>
      </CardHeader>
      {valores && valores.length > 0 && (
        <CardContent>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Últimos Lançamentos</h4>
            <div className="space-y-1">
              {valores.slice(-3).reverse().map((valor: any) => {
                const perc = (valor.realizado / valor.meta) * 100;
                const cor = perc >= 90 ? "text-green-600" : perc >= 70 ? "text-yellow-600" : "text-red-600";
                return (
                  <div key={valor.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {new Date(2000, valor.mes - 1).toLocaleDateString("pt-BR", { month: "short" })}/{valor.ano}
                    </span>
                    <span>
                      Meta: {valor.meta} | Realizado: {valor.realizado}
                    </span>
                    <span className={`font-semibold ${cor}`}>
                      {perc.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}


// Componente ProjetosTab
function ProjetosTab({ user, kpis, objetivos }: any) {
  const { data: projetos, refetch: refetchProjetos } = trpc.projetosGrupo.list.useQuery();
  const createProjeto = trpc.projetosGrupo.create.useMutation();
  const updateProjeto = trpc.projetosGrupo.update.useMutation();
  const deleteProjeto = trpc.projetosGrupo.delete.useMutation();
  const vincularKPI = trpc.projetosGrupo.vincularKPI.useMutation();
  const desvincularKPI = trpc.projetosGrupo.desvincularKPI.useMutation();

  const [showProjetoDialog, setShowProjetoDialog] = useState(false);
  const [editingProjeto, setEditingProjeto] = useState<any>(null);
  const [projetoNome, setProjetoNome] = useState("");
  const [projetoDescricao, setProjetoDescricao] = useState("");
  const [projetoDataInicio, setProjetoDataInicio] = useState("");
  const [projetoDataFim, setProjetoDataFim] = useState("");
  const [projetoStatus, setProjetoStatus] = useState<"planejado" | "em_andamento" | "concluido" | "cancelado">("planejado");
  const [projetoResponsavel, setProjetoResponsavel] = useState("");

  const [showVincularDialog, setShowVincularDialog] = useState(false);
  const [projetoParaVincular, setProjetoParaVincular] = useState<any>(null);
  const { data: kpisVinculados, refetch: refetchKPIsVinculados } = trpc.projetosGrupo.getKPIsVinculados.useQuery(
    { projetoId: projetoParaVincular?.id || 0 },
    { enabled: !!projetoParaVincular }
  );

  const [viewMode, setViewMode] = useState<"list" | "gantt">("list");

  const handleOpenProjetoDialog = (projeto?: any) => {
    if (projeto) {
      setEditingProjeto(projeto);
      setProjetoNome(projeto.nome);
      setProjetoDescricao(projeto.descricao || "");
      setProjetoDataInicio(projeto.dataInicio || "");
      setProjetoDataFim(projeto.dataFim || "");
      setProjetoStatus(projeto.status || "planejado");
      setProjetoResponsavel(projeto.responsavel || "");
    } else {
      setEditingProjeto(null);
      setProjetoNome("");
      setProjetoDescricao("");
      setProjetoDataInicio("");
      setProjetoDataFim("");
      setProjetoStatus("planejado");
      setProjetoResponsavel("");
    }
    setShowProjetoDialog(true);
  };

  const handleSaveProjeto = async () => {
    if (!projetoNome) {
      toast.error("Preencha o nome do projeto");
      return;
    }

    try {
      if (editingProjeto) {
        await updateProjeto.mutateAsync({
          id: editingProjeto.id,
          nome: projetoNome,
          descricao: projetoDescricao,
          dataInicio: projetoDataInicio,
          dataFim: projetoDataFim,
          status: projetoStatus,
          responsavel: projetoResponsavel,
        });
        toast.success("Projeto atualizado com sucesso!");
      } else {
        await createProjeto.mutateAsync({
          nome: projetoNome,
          descricao: projetoDescricao,
          dataInicio: projetoDataInicio,
          dataFim: projetoDataFim,
          status: projetoStatus,
          responsavel: projetoResponsavel,
        });
        toast.success("Projeto criado com sucesso!");
      }
      setShowProjetoDialog(false);
      refetchProjetos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar projeto");
    }
  };

  const handleDeleteProjeto = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return;

    try {
      await deleteProjeto.mutateAsync({ id });
      toast.success("Projeto excluído com sucesso!");
      refetchProjetos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir projeto");
    }
  };

  const handleOpenVincularDialog = (projeto: any) => {
    setProjetoParaVincular(projeto);
    setShowVincularDialog(true);
  };

  const handleVincularKPI = async (kpiId: number) => {
    if (!projetoParaVincular) return;

    try {
      await vincularKPI.mutateAsync({
        projetoId: projetoParaVincular.id,
        kpiId,
      });
      toast.success("KPI vinculado com sucesso!");
      refetchKPIsVinculados();
    } catch (error: any) {
      toast.error(error.message || "Erro ao vincular KPI");
    }
  };

  const handleDesvincularKPI = async (kpiId: number) => {
    if (!projetoParaVincular) return;

    try {
      await desvincularKPI.mutateAsync({
        projetoId: projetoParaVincular.id,
        kpiId,
      });
      toast.success("KPI desvinculado com sucesso!");
      refetchKPIsVinculados();
    } catch (error: any) {
      toast.error(error.message || "Erro ao desvincular KPI");
    }
  };

  const statusLabels = {
    planejado: "Planejado",
    em_andamento: "Em Andamento",
    concluido: "Concluído",
    cancelado: "Cancelado",
  };

  const statusIcons = {
    planejado: Circle,
    em_andamento: Clock,
    concluido: CheckCircle2,
    cancelado: XCircle,
  };

  const statusColors = {
    planejado: "bg-gray-100 text-gray-800",
    em_andamento: "bg-blue-100 text-blue-800",
    concluido: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Projetos e Iniciativas Estratégicas</h2>
          <p className="text-muted-foreground">
            Gerencie os projetos vinculados aos objetivos estratégicos
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              Lista
            </Button>
            <Button
              variant={viewMode === "gantt" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("gantt")}
            >
              Gantt
            </Button>
          </div>
          {user?.role === "admin" && (
            <Button onClick={() => handleOpenProjetoDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Projeto
            </Button>
          )}
        </div>
      </div>

      {viewMode === "list" ? (
        projetos && projetos.length > 0 ? (
          <div className="grid gap-4">
            {projetos.map((projeto) => {
              const StatusIcon = statusIcons[projeto.status || "planejado"];
              return (
                <Card key={projeto.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{projeto.nome}</CardTitle>
                          <Badge className={statusColors[projeto.status || "planejado"]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusLabels[projeto.status || "planejado"]}
                          </Badge>
                        </div>
                        {projeto.descricao && (
                          <CardDescription className="mb-2">{projeto.descricao}</CardDescription>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {projeto.dataInicio && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Início: {projeto.dataInicio instanceof Date ? projeto.dataInicio.toLocaleDateString('pt-BR') : projeto.dataInicio}
                            </div>
                          )}
                          {projeto.dataFim && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Fim: {projeto.dataFim instanceof Date ? projeto.dataFim.toLocaleDateString('pt-BR') : projeto.dataFim}
                            </div>
                          )}
                          {projeto.responsavel && (
                            <div>Responsável: {projeto.responsavel}</div>
                          )}
                        </div>
                      </div>
                      {user?.role === "admin" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenVincularDialog(projeto)}
                          >
                            <LinkIcon className="h-4 w-4 mr-1" />
                            KPIs
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenProjetoDialog(projeto)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProjeto(projeto.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum projeto cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando os projetos e iniciativas estratégicas do Grupo Arqueo
              </p>
              {user?.role === "admin" && (
                <Button onClick={() => handleOpenProjetoDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Projeto
                </Button>
              )}
            </CardContent>
          </Card>
        )
      ) : (
        <GanttChart projetos={projetos || []} />
      )}

      {/* Dialog de Criar/Editar Projeto */}
      <Dialog open={showProjetoDialog} onOpenChange={setShowProjetoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProjeto ? "Editar Projeto" : "Criar Novo Projeto"}</DialogTitle>
            <DialogDescription>
              Defina o nome, descrição, datas, status e responsável do projeto estratégico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projetoNome">Nome do Projeto *</Label>
              <Input
                id="projetoNome"
                placeholder="Ex: Implementação de novo sistema ERP"
                value={projetoNome}
                onChange={(e) => setProjetoNome(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projetoDescricao">Descrição</Label>
              <Textarea
                id="projetoDescricao"
                placeholder="Descreva o projeto..."
                value={projetoDescricao}
                onChange={(e) => setProjetoDescricao(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projetoDataInicio">Data de Início</Label>
                <Input
                  id="projetoDataInicio"
                  type="date"
                  value={projetoDataInicio}
                  onChange={(e) => setProjetoDataInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projetoDataFim">Data de Término</Label>
                <Input
                  id="projetoDataFim"
                  type="date"
                  value={projetoDataFim}
                  onChange={(e) => setProjetoDataFim(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projetoStatus">Status</Label>
                <Select value={projetoStatus} onValueChange={(v: any) => setProjetoStatus(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planejado">Planejado</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="projetoResponsavel">Responsável</Label>
                <Input
                  id="projetoResponsavel"
                  placeholder="Nome do responsável"
                  value={projetoResponsavel}
                  onChange={(e) => setProjetoResponsavel(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowProjetoDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProjeto} disabled={createProjeto.isPending || updateProjeto.isPending}>
                {createProjeto.isPending || updateProjeto.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Vincular KPIs */}
      <Dialog open={showVincularDialog} onOpenChange={setShowVincularDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vincular KPIs ao Projeto</DialogTitle>
            <DialogDescription>
              {projetoParaVincular?.nome}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">KPIs Vinculados</h4>
              {kpisVinculados && kpisVinculados.length > 0 ? (
                <div className="space-y-2">
                  {kpisVinculados.map((kpi) => (
                    <div key={kpi.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{kpi.nome}</p>
                        <p className="text-sm text-muted-foreground">{kpi.unidadeMedida}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDesvincularKPI(kpi.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum KPI vinculado</p>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">KPIs Disponíveis</h4>
              {kpis && kpis.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {kpis
                    .filter((kpi: any) => !kpisVinculados?.some((kv) => kv.id === kpi.id))
                    .map((kpi: any) => (
                      <div key={kpi.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{kpi.nome}</p>
                          <p className="text-sm text-muted-foreground">{kpi.unidadeMedida}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVincularKPI(kpi.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum KPI disponível</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setShowVincularDialog(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente GanttChart
function GanttChart({ projetos }: { projetos: any[] }) {
  if (!projetos || projetos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum projeto para exibir</h3>
          <p className="text-muted-foreground">
            Crie projetos com datas de início e fim para visualizar o cronograma Gantt
          </p>
        </CardContent>
      </Card>
    );
  }

  // Filtrar projetos com datas válidas
  const projetosComDatas = projetos.filter(p => p.dataInicio && p.dataFim);

  if (projetosComDatas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum projeto com datas definidas</h3>
          <p className="text-muted-foreground">
            Adicione datas de início e fim aos projetos para visualizar o cronograma Gantt
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calcular intervalo de datas
  const todasDatas = projetosComDatas.flatMap(p => [new Date(p.dataInicio), new Date(p.dataFim)]);
  const dataMinima = new Date(Math.min(...todasDatas.map(d => d.getTime())));
  const dataMaxima = new Date(Math.max(...todasDatas.map(d => d.getTime())));

  // Gerar meses entre dataMinima e dataMaxima
  const meses: Date[] = [];
  const dataAtual = new Date(dataMinima.getFullYear(), dataMinima.getMonth(), 1);
  while (dataAtual <= dataMaxima) {
    meses.push(new Date(dataAtual));
    dataAtual.setMonth(dataAtual.getMonth() + 1);
  }

  const statusColors = {
    planejado: "bg-gray-400",
    em_andamento: "bg-blue-500",
    concluido: "bg-green-500",
    cancelado: "bg-red-500",
  };

  const calcularPosicao = (dataInicio: string, dataFim: string) => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    const totalDias = (dataMaxima.getTime() - dataMinima.getTime()) / (1000 * 60 * 60 * 24);
    const diasDoInicio = (inicio.getTime() - dataMinima.getTime()) / (1000 * 60 * 60 * 24);
    const duracaoDias = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);

    const left = (diasDoInicio / totalDias) * 100;
    const width = (duracaoDias / totalDias) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cronograma Gantt</CardTitle>
        <CardDescription>
          Visualização temporal dos projetos estratégicos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Cabeçalho de meses */}
          <div className="flex border-b pb-2">
            <div className="w-48 font-semibold">Projeto</div>
            <div className="flex-1 flex">
              {meses.map((mes, idx) => (
                <div
                  key={idx}
                  className="flex-1 text-center text-sm text-muted-foreground border-l px-1"
                >
                  {mes.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
                </div>
              ))}
            </div>
          </div>

          {/* Linhas de projetos */}
          {projetosComDatas.map((projeto) => {
            const posicao = calcularPosicao(projeto.dataInicio, projeto.dataFim);
            return (
              <div key={projeto.id} className="flex items-center">
                <div className="w-48 pr-4 text-sm font-medium truncate" title={projeto.nome}>
                  {projeto.nome}
                </div>
                <div className="flex-1 relative h-8 bg-gray-50 rounded">
                  <div
                    className={`absolute h-6 top-1 rounded ${statusColors[projeto.status as keyof typeof statusColors || "planejado"]} flex items-center justify-center text-white text-xs px-2`}
                    style={posicao}
                    title={`${projeto.nome}: ${projeto.dataInicio} - ${projeto.dataFim}`}
                  >
                    <span className="truncate">{projeto.nome}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="mt-6 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400"></div>
            <span>Planejado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span>Em Andamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>Cancelado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
