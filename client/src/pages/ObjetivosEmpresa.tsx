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
import { useAuth } from "@/_core/hooks/useAuth";
import { Target, Plus, Pencil, Trash2, Building2, AlertCircle, User } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

interface ObjetivosEmpresaProps {
  empresaId: number;
}

export default function ObjetivosEmpresa({ empresaId }: ObjetivosEmpresaProps) {
  const { user } = useAuth();

  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingObjetivo, setEditingObjetivo] = useState<any>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroPerspectiva, setFiltroPerspectiva] = useState<string>("todos");

  const { data: objetivos, refetch: refetchObjetivos } = trpc.objetivosGrupo.listByEmpresa.useQuery({ empresaId });
  const { data: empresa } = trpc.empresas.getById.useQuery({ id: empresaId });

  const createMutation = trpc.objetivosGrupo.create.useMutation({
    onSuccess: () => {
      toast.success("Objetivo criado com sucesso!");
      refetchObjetivos();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.objetivosGrupo.update.useMutation({
    onSuccess: () => {
      toast.success("Objetivo atualizado com sucesso!");
      refetchObjetivos();
      setDialogOpen(false);
      setEditingObjetivo(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.objetivosGrupo.delete.useMutation({
    onSuccess: () => {
      toast.success("Objetivo excluído com sucesso!");
      refetchObjetivos();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    perspectivaBSC: "financeira" as "financeira" | "clientes" | "processos" | "aprendizado",
    prazo: "",
    status: "planejado" as "planejado" | "em_andamento" | "concluido" | "cancelado",
    impacto: "medio" as "baixo" | "medio" | "alto",
    probabilidade: "media" as "baixa" | "media" | "alta",
    responsavelOrganoId: "" as string | null,
    responsavelOrganoNome: "" as string | null,
    responsavelOrganoCargo: "" as string | null,
  });

  const { data: lideres } = trpc.organograma.leaders.useQuery();
  const vincularLiderMutation = trpc.objetivosGrupo.vincularLider.useMutation({
    onSuccess: () => {
      refetchObjetivos();
    },
  });

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      perspectivaBSC: "financeira",
      prazo: "",
      status: "planejado",
      impacto: "medio",
      probabilidade: "media",
      responsavelOrganoId: null,
      responsavelOrganoNome: null,
      responsavelOrganoCargo: null,
    });
    setEditingObjetivo(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    const payload = { ...formData, empresaId };
    if (editingObjetivo) {
      updateMutation.mutate({ id: editingObjetivo.id, ...payload });
      // Vincular líder após atualizar
      if (formData.responsavelOrganoId !== editingObjetivo.responsavelOrganoId) {
        vincularLiderMutation.mutate({
          objetivoId: editingObjetivo.id,
          responsavelOrganoId: formData.responsavelOrganoId || null,
          responsavelOrganoNome: formData.responsavelOrganoNome || null,
          responsavelOrganoCargo: formData.responsavelOrganoCargo || null,
        });
      }
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (objetivo: any) => {
    setEditingObjetivo(objetivo);
    setFormData({
      titulo: objetivo.titulo,
      descricao: objetivo.descricao || "",
      perspectivaBSC: objetivo.perspectivaBSC || "financeira",
      prazo: objetivo.prazo ? new Date(objetivo.prazo).toISOString().split("T")[0] : "",
      status: objetivo.status || "planejado",
      impacto: objetivo.impacto || "medio",
      probabilidade: objetivo.probabilidade || "media",
      responsavelOrganoId: objetivo.responsavelOrganoId || null,
      responsavelOrganoNome: objetivo.responsavelOrganoNome || null,
      responsavelOrganoCargo: objetivo.responsavelOrganoCargo || null,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este objetivo?")) {
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

  const perspectivas: Record<string, string> = {
    financeira: "Financeira",
    clientes: "Clientes",
    processos: "Processos Internos",
    aprendizado: "Aprendizado e Crescimento",
  };

  const impactoColors: Record<string, string> = {
    baixo: "bg-yellow-100 text-yellow-800",
    medio: "bg-orange-100 text-orange-800",
    alto: "bg-red-100 text-red-800",
  };

  const filteredObjetivos = (objetivos || []).filter((obj: any) => {
    if (filtroStatus !== "todos" && obj.status !== filtroStatus) return false;
    if (filtroPerspectiva !== "todos" && obj.perspectivaBSC !== filtroPerspectiva) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setLocation(`/empresa/${empresaId}`)}>
              ← Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-bold text-lg">Objetivos Estratégicos</h1>
                <p className="text-sm text-muted-foreground">{empresa?.nome}</p>
              </div>
            </div>
          </div>
          {canEdit && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Objetivo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingObjetivo ? "Editar Objetivo" : "Criar Novo Objetivo"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do objetivo estratégico
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) =>
                        setFormData({ ...formData, titulo: e.target.value })
                      }
                      placeholder="Ex: Aumentar margem de lucro"
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
                      placeholder="Descreva o objetivo em detalhes"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="perspectiva">Perspectiva BSC</Label>
                      <Select
                        value={formData.perspectivaBSC}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            perspectivaBSC: value as any,
                          })
                        }
                      >
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

                    <div>
                      <Label htmlFor="prazo">Prazo</Label>
                      <Input
                        id="prazo"
                        type="date"
                        value={formData.prazo}
                        onChange={(e) =>
                          setFormData({ ...formData, prazo: e.target.value })
                        }
                      />
                    </div>
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

                  <div>
                    <Label htmlFor="responsavel">Responsável (OrganoArq)</Label>
                    <Select
                      value={formData.responsavelOrganoId || "none"}
                      onValueChange={(value) => {
                        if (value === "none") {
                          setFormData({
                            ...formData,
                            responsavelOrganoId: null,
                            responsavelOrganoNome: null,
                            responsavelOrganoCargo: null,
                          });
                        } else {
                          const lider = lideres?.leaders?.find((l: any) => l.positionId === value);
                          setFormData({
                            ...formData,
                            responsavelOrganoId: value,
                            responsavelOrganoNome: lider?.person?.name || null,
                            responsavelOrganoCargo: lider?.title || null,
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um líder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {lideres?.leaders?.map((lider: any) => (
                          <SelectItem key={lider.positionId} value={lider.positionId}>
                            {lider.person?.name} - {lider.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      {editingObjetivo ? "Atualizar" : "Criar"}
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

          <Select value={filtroPerspectiva} onValueChange={setFiltroPerspectiva}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as Perspectivas</SelectItem>
              <SelectItem value="financeira">Financeira</SelectItem>
              <SelectItem value="clientes">Clientes</SelectItem>
              <SelectItem value="processos">Processos Internos</SelectItem>
              <SelectItem value="aprendizado">Aprendizado e Crescimento</SelectItem>
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
              <div className="text-2xl font-bold">{objetivos?.length || 0}</div>
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
                {objetivos?.filter((o: any) => o.status === "planejado").length || 0}
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
                {objetivos?.filter((o: any) => o.status === "em_andamento").length || 0}
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
                {objetivos?.filter((o: any) => o.status === "concluido").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Objetivos */}
        {filteredObjetivos.length === 0 ? (
          <Card>
            <CardContent className="pt-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum objetivo encontrado com os filtros selecionados
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredObjetivos.map((objetivo: any) => (
              <Card key={objetivo.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{objetivo.titulo}</h3>
                        <Badge className={statusColors[objetivo.status]}>
                          {objetivo.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline">
                          {perspectivas[objetivo.perspectivaBSC]}
                        </Badge>
                      </div>
                      {objetivo.descricao && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {objetivo.descricao}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm flex-wrap">
                        {objetivo.prazo && (
                          <span className="text-muted-foreground">
                            Prazo: {new Date(objetivo.prazo).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                        <Badge className={impactoColors[objetivo.impacto]}>
                          Impacto: {objetivo.impacto}
                        </Badge>
                        <Badge variant="outline">
                          Probabilidade: {objetivo.probabilidade}
                        </Badge>
                        {objetivo.responsavelOrganoNome && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{objetivo.responsavelOrganoNome} ({objetivo.responsavelOrganoCargo})</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(objetivo)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(objetivo.id)}
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
