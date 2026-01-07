import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Plus, Building2, MapPin, Edit2, Trash2, Target, LayoutDashboard, ChevronRight } from "lucide-react";

export default function AreasNegocio() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<{ id: number; nome: string; descricao?: string; pais?: string } | null>(null);
  
  const [novaArea, setNovaArea] = useState({
    nome: "",
    descricao: "",
    pais: "Brasil",
  });

  const utils = trpc.useUtils();
  const { data: areas, isLoading } = trpc.areasNegocio.list.useQuery();
  
  const createMutation = trpc.areasNegocio.create.useMutation({
    onSuccess: () => {
      toast.success("Área de negócio criada com sucesso!");
      utils.areasNegocio.list.invalidate();
      setIsCreateOpen(false);
      setNovaArea({ nome: "", descricao: "", pais: "Brasil" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.areasNegocio.update.useMutation({
    onSuccess: () => {
      toast.success("Área de negócio atualizada com sucesso!");
      utils.areasNegocio.list.invalidate();
      setEditingArea(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.areasNegocio.delete.useMutation({
    onSuccess: () => {
      toast.success("Área de negócio excluída com sucesso!");
      utils.areasNegocio.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreate = () => {
    if (!novaArea.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    createMutation.mutate(novaArea);
  };

  const handleUpdate = () => {
    if (!editingArea) return;
    updateMutation.mutate({
      id: editingArea.id,
      nome: editingArea.nome,
      descricao: editingArea.descricao,
      pais: editingArea.pais,
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Áreas de Negócio</h1>
                <p className="text-sm text-muted-foreground">Gerencie as áreas de negócio do Grupo Arqueo Participações</p>
              </div>
            </div>
          </div>
          
          {isAdmin && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Área de Negócio
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Área de Negócio</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova área de negócio ao Grupo Arqueo Participações
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      placeholder="Ex: Grupo Arqueo Brasil"
                      value={novaArea.nome}
                      onChange={(e) => setNovaArea({ ...novaArea, nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pais">País</Label>
                    <Input
                      id="pais"
                      placeholder="Ex: Brasil"
                      value={novaArea.pais}
                      onChange={(e) => setNovaArea({ ...novaArea, pais: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      placeholder="Descrição da área de negócio..."
                      value={novaArea.descricao}
                      onChange={(e) => setNovaArea({ ...novaArea, descricao: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Criando..." : "Criar Área"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando áreas de negócio...</p>
          </div>
        ) : areas && areas.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {areas.map((area) => (
              <Card key={area.id} className="hover:shadow-lg transition-all duration-300 border-2 border-purple-200/50 hover:border-purple-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Building2 className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{area.nome}</CardTitle>
                        {area.pais && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            {area.pais}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      area.status === "ativa" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {area.status === "ativa" ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  {area.descricao && (
                    <CardDescription className="mt-2">{area.descricao}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setLocation(`/area/${area.id}/planejamento`)}
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Planejamento
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setLocation(`/area/${area.id}/dashboard`)}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </div>
                  
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setLocation(`/area/${area.id}/empresas`)}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Ver Empresas
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Button>

                  {isAdmin && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Dialog open={editingArea?.id === area.id} onOpenChange={(open) => !open && setEditingArea(null)}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setEditingArea({ 
                              id: area.id, 
                              nome: area.nome, 
                              descricao: area.descricao || "", 
                              pais: area.pais || "" 
                            })}
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Área de Negócio</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-nome">Nome *</Label>
                              <Input
                                id="edit-nome"
                                value={editingArea?.nome || ""}
                                onChange={(e) => setEditingArea(prev => prev ? { ...prev, nome: e.target.value } : null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-pais">País</Label>
                              <Input
                                id="edit-pais"
                                value={editingArea?.pais || ""}
                                onChange={(e) => setEditingArea(prev => prev ? { ...prev, pais: e.target.value } : null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-descricao">Descrição</Label>
                              <Textarea
                                id="edit-descricao"
                                value={editingArea?.descricao || ""}
                                onChange={(e) => setEditingArea(prev => prev ? { ...prev, descricao: e.target.value } : null)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingArea(null)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                              {updateMutation.isPending ? "Salvando..." : "Salvar"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Área de Negócio</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir "{area.nome}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(area.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma área de negócio cadastrada</h3>
              <p className="text-muted-foreground mb-6">
                Crie a primeira área de negócio para organizar as empresas do grupo
              </p>
              {isAdmin && (
                <Button onClick={() => setIsCreateOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Área
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
