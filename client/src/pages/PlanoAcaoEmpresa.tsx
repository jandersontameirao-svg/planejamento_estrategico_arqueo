import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Clock, Circle, AlertCircle, Plus, Pencil, Trash2, Target, FolderKanban, DollarSign, User, Calendar as CalendarIcon, LayoutList, LayoutGrid, Building2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

interface PlanoAcaoEmpresaProps {
  empresaId: number;
}

export default function PlanoAcaoEmpresa({ empresaId }: PlanoAcaoEmpresaProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAcao, setEditingAcao] = useState<any>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>("");
  const [visualizacao, setVisualizacao] = useState<"lista" | "kanban">("lista");

  const { data: acoes, refetch: refetchAcoes } = trpc.acoesGrupo.listByEmpresa.useQuery({ empresaId });
  const { data: empresa } = trpc.empresas.getById.useQuery({ id: empresaId });
  const { data: objetivos } = trpc.objetivosGrupo.list.useQuery();
  const { data: projetos } = trpc.projetosGrupo.list.useQuery();

  const createMutation = trpc.acoesGrupo.create.useMutation({
    onSuccess: () => {
      toast.success("Ação criada com sucesso!");
      refetchAcoes();
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao criar ação");
    },
  });

  const updateMutation = trpc.acoesGrupo.update.useMutation({
    onSuccess: () => {
      toast.success("Ação atualizada com sucesso!");
      refetchAcoes();
      setDialogOpen(false);
      setEditingAcao(null);
      resetForm();
    },
    onError: () => {
      toast.error("Erro ao atualizar ação");
    },
  });

  const deleteMutation = trpc.acoesGrupo.delete.useMutation({
    onSuccess: () => {
      toast.success("Ação excluída com sucesso!");
      refetchAcoes();
    },
    onError: () => {
      toast.error("Erro ao excluir ação");
    },
  });

  const [formData, setFormData] = useState({
    descricao: "",
    responsavel: "",
    prazo: "",
    custo: "",
    status: "pendente" as "pendente" | "em_andamento" | "concluida" | "cancelada",
    objetivoId: undefined as number | undefined,
    projetoId: undefined as number | undefined,
    observacoes: "",
  });

  const resetForm = () => {
    setFormData({
      descricao: "",
      responsavel: "",
      prazo: "",
      custo: "",
      status: "pendente",
      objetivoId: undefined,
      projetoId: undefined,
      observacoes: "",
    });
  };

  const handleEdit = (acao: any) => {
    setEditingAcao(acao);
    setFormData({
      descricao: acao.descricao || "",
      responsavel: acao.responsavel || "",
      prazo: acao.prazo ? new Date(acao.prazo).toISOString().split('T')[0] : "",
                      custo: acao.custo?.toString() || "",
      status: acao.status || "pendente",
      objetivoId: acao.objetivoId || undefined,
      projetoId: acao.projetoId || undefined,
      observacoes: acao.observacoes || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAcao) {
      updateMutation.mutate({
        id: editingAcao.id,
        ...formData,
      });
    } else {
      createMutation.mutate({ empresaId, ...formData });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta ação?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <Circle className="h-4 w-4 text-gray-400" />;
      case "em_andamento":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "concluida":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "cancelada":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pendente: "secondary",
      em_andamento: "default",
      concluida: "outline",
      cancelada: "destructive",
    };
    
    const labels: Record<string, string> = {
      pendente: "Pendente",
      em_andamento: "Em Andamento",
      concluida: "Concluída",
      cancelada: "Cancelada",
    };

    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  // Filtrar ações
  const acoesFiltradas = acoes?.filter(acao => {
    if (filtroStatus !== "todos" && acao.status !== filtroStatus) return false;
    if (filtroResponsavel && !acao.responsavel?.toLowerCase().includes(filtroResponsavel.toLowerCase())) return false;
    return true;
  });

  // Calcular estatísticas
  const totalAcoes = acoes?.length || 0;
  const acoesPorStatus = {
    pendente: acoes?.filter(a => a.status === "pendente").length || 0,
    em_andamento: acoes?.filter(a => a.status === "em_andamento").length || 0,
    concluida: acoes?.filter(a => a.status === "concluida").length || 0,
    cancelada: acoes?.filter(a => a.status === "cancelada").length || 0,
  };

  const progressoAcoes = totalAcoes > 0 
    ? Math.round((acoesPorStatus.concluida / totalAcoes) * 100)
    : 0;

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
                <p className="text-xs text-muted-foreground">Plano de Ação</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocation(`/empresa/${empresaId}/identidade`)}>
              Identidade
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLocation(`/empresa/${empresaId}/kpis`)}>
              KPIs
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
              <Button onClick={() => { setEditingAcao(null); resetForm(); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Ação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAcao ? "Editar Ação" : "Nova Ação"}</DialogTitle>
                <DialogDescription>
                  {editingAcao ? "Atualize os dados da ação" : "Cadastre uma nova ação do plano"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva a ação a ser executada"
                    required
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="responsavel">Responsável</Label>
                    <Input
                      id="responsavel"
                      value={formData.responsavel}
                      onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div>
                    <Label htmlFor="prazo">Prazo</Label>
                    <Input
                      id="prazo"
                      type="date"
                      value={formData.prazo}
                      onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="custo">Custo Estimado (R$)</Label>
                    <Input
                      id="custo"
                      type="number"
                      step="0.01"
                      value={formData.custo}
                      onChange={(e) => setFormData({ ...formData, custo: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluida">Concluída</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="objetivoId">Vincular a Objetivo</Label>
                    <Select
                      value={formData.objetivoId?.toString() || "none"}
                      onValueChange={(value) => setFormData({ ...formData, objetivoId: value === "none" ? undefined : parseInt(value) })}
                    >
                      <SelectTrigger id="objetivoId">
                        <SelectValue placeholder="Selecione (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {objetivos?.map((obj) => (
                          <SelectItem key={obj.id} value={obj.id.toString()}>
                            {obj.titulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="projetoId">Vincular a Projeto</Label>
                    <Select
                      value={formData.projetoId?.toString() || "none"}
                      onValueChange={(value) => setFormData({ ...formData, projetoId: value === "none" ? undefined : parseInt(value) })}
                    >
                      <SelectTrigger id="projetoId">
                        <SelectValue placeholder="Selecione (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {projetos?.map((proj) => (
                          <SelectItem key={proj.id} value={proj.id.toString()}>
                            {proj.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Informações adicionais sobre a ação"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setEditingAcao(null); resetForm(); }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingAcao ? "Atualizar" : "Criar"} Ação
                  </Button>
                </div>
              </form>
             </DialogContent>
           </Dialog>
          </div>
        </div>
       </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Plano de Ação</h1>
          <p className="text-muted-foreground">
            Desdobramento operacional dos objetivos estratégicos e projetos
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Ações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalAcoes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {acoesPorStatus.concluida} concluídas ({progressoAcoes}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Circle className="h-4 w-4 text-gray-400" />
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{acoesPorStatus.pendente}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{acoesPorStatus.em_andamento}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Concluídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{acoesPorStatus.concluida}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filtros</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={visualizacao === "lista" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVisualizacao("lista")}
                >
                  <LayoutList className="mr-2 h-4 w-4" />
                  Lista
                </Button>
                <Button
                  variant={visualizacao === "kanban" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVisualizacao("kanban")}
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Kanban
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="filtroStatus">Status</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger id="filtroStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filtroResponsavel">Responsável</Label>
                <Input
                  id="filtroResponsavel"
                  value={filtroResponsavel}
                  onChange={(e) => setFiltroResponsavel(e.target.value)}
                  placeholder="Filtrar por responsável"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista ou Kanban de Ações */}
        {visualizacao === "lista" ? (
          <Card>
            <CardHeader>
              <CardTitle>Ações Cadastradas</CardTitle>
              <CardDescription>
                {acoesFiltradas?.length || 0} ações encontradas
              </CardDescription>
            </CardHeader>
            <CardContent>
            {!acoesFiltradas || acoesFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma ação cadastrada</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Clique em "Nova Ação" para começar
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {acoesFiltradas.map((acao) => {
                  const objetivo = objetivos?.find(o => o.id === acao.objetivoId);
                  const projeto = projetos?.find(p => p.id === acao.projetoId);

                  return (
                    <div
                      key={acao.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(acao.status || 'pendente')}
                            <h3 className="font-semibold">{acao.descricao}</h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            {acao.responsavel && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {acao.responsavel}
                              </div>
                            )}
                            {acao.prazo && (
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                {new Date(acao.prazo).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                            {acao.custo && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                R$ {acao.custo ? parseFloat(acao.custo).toFixed(2) : '0.00'}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {getStatusBadge(acao.status || 'pendente')}
                            {objetivo && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {objetivo.titulo}
                              </Badge>
                            )}
                            {projeto && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <FolderKanban className="h-3 w-3" />
                                {projeto.nome}
                              </Badge>
                            )}
                          </div>

                          {acao.observacoes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {acao.observacoes}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(acao)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(acao.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        ) : (
          <KanbanBoard
            acoes={acoesFiltradas || []}
            objetivos={objetivos || []}
            projetos={projetos || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={(id, status) => {
              updateMutation.mutate({ id, status });
            }}
          />
        )}
      </main>
    </div>
  );
}

// Componente Kanban Board
interface KanbanBoardProps {
  acoes: any[];
  objetivos: any[];
  projetos: any[];
  onEdit: (acao: any) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: "pendente" | "em_andamento" | "concluida" | "cancelada") => void;
}

function KanbanBoard({ acoes, objetivos, projetos, onEdit, onDelete, onStatusChange }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null);

  const colunas: Array<{ id: "pendente" | "em_andamento" | "concluida" | "cancelada"; titulo: string; cor: string }> = [
    { id: "pendente", titulo: "Pendente", cor: "bg-gray-100" },
    { id: "em_andamento", titulo: "Em Andamento", cor: "bg-blue-50" },
    { id: "concluida", titulo: "Concluída", cor: "bg-green-50" },
    { id: "cancelada", titulo: "Cancelada", cor: "bg-red-50" },
  ];

  const acoesPorStatus = {
    pendente: acoes.filter(a => (a.status || "pendente") === "pendente"),
    em_andamento: acoes.filter(a => a.status === "em_andamento"),
    concluida: acoes.filter(a => a.status === "concluida"),
    cancelada: acoes.filter(a => a.status === "cancelada"),
  };

  const handleDragStart = (id: number) => {
    setActiveId(id);
  };

  const handleDragEnd = (status: "pendente" | "em_andamento" | "concluida" | "cancelada") => {
    if (activeId !== null) {
      onStatusChange(activeId, status);
      setActiveId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <Circle className="h-4 w-4 text-gray-400" />;
      case "em_andamento":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "concluida":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "cancelada":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {colunas.map((coluna) => (
        <Card key={coluna.id} className={coluna.cor}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              {getStatusIcon(coluna.id)}
              {coluna.titulo}
              <Badge variant="secondary" className="ml-auto">
                {acoesPorStatus[coluna.id].length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent
            className="space-y-3 min-h-[400px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDragEnd(coluna.id)}
          >
            {acoesPorStatus[coluna.id].map((acao) => {
              const objetivo = objetivos.find(o => o.id === acao.objetivoId);
              const projeto = projetos.find(p => p.id === acao.projetoId);

              return (
                <div
                  key={acao.id}
                  draggable
                  onDragStart={() => handleDragStart(acao.id)}
                  className="p-3 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-move"
                >
                  <div className="space-y-2">
                    <p className="font-medium text-sm line-clamp-2">{acao.descricao}</p>

                    {(acao.responsavel || acao.prazo || acao.custo) && (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {acao.responsavel && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {acao.responsavel}
                          </div>
                        )}
                        {acao.prazo && (
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(acao.prazo).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                        {acao.custo && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            R$ {acao.custo ? parseFloat(acao.custo).toFixed(2) : '0.00'}
                          </div>
                        )}
                      </div>
                    )}

                    {(objetivo || projeto) && (
                      <div className="flex flex-wrap gap-1">
                        {objetivo && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Target className="h-2 w-2" />
                            {objetivo.titulo}
                          </Badge>
                        )}
                        {projeto && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <FolderKanban className="h-2 w-2" />
                            {projeto.nome}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-1 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onEdit(acao)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onDelete(acao.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {acoesPorStatus[coluna.id].length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhuma ação
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
