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
import { GanttChart } from "@/components/GanttChart";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { FolderKanban, Plus, Pencil, Trash2, Building2, AlertCircle, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

interface ProjetosEmpresaProps {
  empresaId: number;
}

export default function ProjetosEmpresa({ empresaId }: ProjetosEmpresaProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProjeto, setEditingProjeto] = useState<any>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const { data: projetos, refetch: refetchProjetos } = trpc.projetosGrupo.listByEmpresa.useQuery({ empresaId });
  const { data: empresa } = trpc.empresas.getById.useQuery({ id: empresaId });
  const { data: objetivos } = trpc.objetivosGrupo.listByEmpresa.useQuery({ empresaId });

  const createMutation = trpc.projetosGrupo.create.useMutation({
    onSuccess: () => {
      toast.success("Projeto criado com sucesso!");
      refetchProjetos();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.projetosGrupo.update.useMutation({
    onSuccess: () => {
      toast.success("Projeto atualizado com sucesso!");
      refetchProjetos();
      setDialogOpen(false);
      setEditingProjeto(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.projetosGrupo.delete.useMutation({
    onSuccess: () => {
      toast.success("Projeto excluído com sucesso!");
      refetchProjetos();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    dataInicio: "",
    dataFim: "",
    status: "planejado" as "planejado" | "em_andamento" | "concluido" | "cancelado",
    responsavel: "",
    impacto: "medio" as "baixo" | "medio" | "alto",
    probabilidade: "media" as "baixa" | "media" | "alta",
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      dataInicio: "",
      dataFim: "",
      status: "planejado",
      responsavel: "",
      impacto: "medio",
      probabilidade: "media",
    });
    setEditingProjeto(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    if (editingProjeto) {
      updateMutation.mutate({
        id: editingProjeto.id,
        empresaId,
        ...formData,
      });
    } else {
      createMutation.mutate({
        empresaId,
        ...formData,
      });
    }
  };

  const handleEdit = (projeto: any) => {
    setEditingProjeto(projeto);
    setFormData({
      nome: projeto.nome,
      descricao: projeto.descricao || "",
      dataInicio: projeto.dataInicio ? new Date(projeto.dataInicio).toISOString().split("T")[0] : "",
      dataFim: projeto.dataFim ? new Date(projeto.dataFim).toISOString().split("T")[0] : "",
      status: projeto.status || "planejado",
      responsavel: projeto.responsavel || "",
      impacto: projeto.impacto || "medio",
      probabilidade: projeto.probabilidade || "media",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este projeto?")) {
      deleteMutation.mutate({ id });
    }
  };

  const canEdit = user?.role === "admin" || user?.role === "gestor";

  const statusColors: Record<string, string> = {
    planejado: "bg-gray-100 text-gray-800",
    em_andamento: "bg-blue-100 text-blue-800",
    concluido: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
  };

  const impactoColors: Record<string, string> = {
    baixo: "bg-yellow-100 text-yellow-800",
    medio: "bg-orange-100 text-orange-800",
    alto: "bg-red-100 text-red-800",
  };

  const filteredProjetos = (projetos || []).filter((proj: any) => {
    if (filtroStatus !== "todos" && proj.status !== filtroStatus) return false;
    return true;
  });

  const getProgressPercentage = (dataInicio: string, dataFim: string, status: string) => {
    if (status === "concluido") return 100;
    if (status === "cancelado") return 0;
    
    const start = new Date(dataInicio).getTime();
    const end = new Date(dataFim).getTime();
    const now = new Date().getTime();
    
    if (now >= end) return 100;
    if (now <= start) return 0;
    
    return Math.round(((now - start) / (end - start)) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setLocation(`/empresa/${empresaId}`)}>
              ← Voltar
            </Button>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-bold text-lg">Projetos e Iniciativas</h1>
                <p className="text-sm text-muted-foreground">{empresa?.nome}</p>
              </div>
            </div>
          </div>
          {canEdit && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Projeto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProjeto ? "Editar Projeto" : "Criar Novo Projeto"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do projeto estratégico
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome do Projeto *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      placeholder="Ex: Sistema de CRM"
                    />
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) =>
                        setFormData({ ...formData, descricao: e.target.value })
                      }
                      placeholder="Descreva o projeto em detalhes"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dataInicio">Data de Início</Label>
                      <Input
                        id="dataInicio"
                        type="date"
                        value={formData.dataInicio}
                        onChange={(e) =>
                          setFormData({ ...formData, dataInicio: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="dataFim">Data de Término</Label>
                      <Input
                        id="dataFim"
                        type="date"
                        value={formData.dataFim}
                        onChange={(e) =>
                          setFormData({ ...formData, dataFim: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="responsavel">Responsável</Label>
                    <Input
                      id="responsavel"
                      value={formData.responsavel}
                      onChange={(e) =>
                        setFormData({ ...formData, responsavel: e.target.value })
                      }
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData({ ...formData, status: value as any })
                        }
                      >
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

                    <div>
                      <Label htmlFor="impacto">Impacto</Label>
                      <Select
                        value={formData.impacto}
                        onValueChange={(value) =>
                          setFormData({ ...formData, impacto: value as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixo">Baixo</SelectItem>
                          <SelectItem value="medio">Médio</SelectItem>
                          <SelectItem value="alto">Alto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="probabilidade">Probabilidade</Label>
                      <Select
                        value={formData.probabilidade}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            probabilidade: value as any,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingProjeto ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <main className="container py-8">
        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="planejado">Planejado</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projetos?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Planejados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projetos?.filter((p: any) => p.status === "planejado").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projetos?.filter((p: any) => p.status === "em_andamento").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Concluídos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projetos?.filter((p: any) => p.status === "concluido").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Gantt */}
        {filteredProjetos.length > 0 && (
          <div className="mb-8">
            <GanttChart projetos={filteredProjetos} height={300} />
          </div>
        )}

        {/* Lista de Projetos */}
        {filteredProjetos.length === 0 ? (
          <Card>
            <CardContent className="pt-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum projeto encontrado com os filtros selecionados
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProjetos.map((projeto: any) => (
              <Card key={projeto.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{projeto.nome}</h3>
                        <Badge className={statusColors[projeto.status]}>
                          {projeto.status.replace("_", " ")}
                        </Badge>
                      </div>
                      {projeto.descricao && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {projeto.descricao}
                        </p>
                      )}
                      
                      {/* Progress Bar */}
                      {projeto.dataInicio && projeto.dataFim && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progresso</span>
                            <span>{getProgressPercentage(projeto.dataInicio, projeto.dataFim, projeto.status)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${getProgressPercentage(projeto.dataInicio, projeto.dataFim, projeto.status)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 text-sm">
                        {projeto.responsavel && (
                          <span className="text-muted-foreground">
                            Responsável: {projeto.responsavel}
                          </span>
                        )}
                        {projeto.dataInicio && (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(projeto.dataInicio).toLocaleDateString("pt-BR")} até{" "}
                            {new Date(projeto.dataFim).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                        <Badge className={impactoColors[projeto.impacto]}>
                          Impacto: {projeto.impacto}
                        </Badge>
                        <Badge variant="outline">
                          Probabilidade: {projeto.probabilidade}
                        </Badge>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(projeto)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(projeto.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
