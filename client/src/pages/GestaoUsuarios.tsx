import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Users, Shield, Edit2, Trash2, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function GestaoUsuarios() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<"user" | "admin" | "gestor">("user");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { data: usuarios, isLoading, refetch } = trpc.usuarios.list.useQuery();
  const { data: empresas } = trpc.empresas.list.useQuery();
  
  const updateRoleMutation = trpc.usuarios.updateRole.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedUserId(null);
    },
  });

  const vincularEmpresaMutation = trpc.usuarios.vincularEmpresa.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Verificar se usuário é admin
  if (user?.role !== "admin") {
    return (
      <div className="container py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700 font-medium">Acesso Negado</p>
            <p className="text-red-600 text-sm">Apenas administradores podem acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-600">Admin</Badge>;
      case "gestor":
        return <Badge className="bg-blue-600">Gestor</Badge>;
      default:
        return <Badge className="bg-gray-600">Usuário</Badge>;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "gestor":
        return "Gestor";
      default:
        return "Usuário";
    }
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
              <Users className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-semibold">Gestão de Usuários</h1>
                <p className="text-xs text-muted-foreground">Administração de usuários e permissões</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{usuarios?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {usuarios?.filter(u => u.role === "admin").length || 0}
                </div>
                <p className="text-sm text-muted-foreground">Administradores</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {usuarios?.filter(u => u.role === "gestor").length || 0}
                </div>
                <p className="text-sm text-muted-foreground">Gestores</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Usuários */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Usuários</CardTitle>
                <CardDescription>Gerenciar roles e permissões dos usuários</CardDescription>
              </div>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : usuarios && usuarios.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-3">Nome</th>
                      <th className="text-left py-3 px-3">Email</th>
                      <th className="text-center py-3 px-3">Role</th>
                      <th className="text-center py-3 px-3">Data de Criação</th>
                      <th className="text-center py-3 px-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usr) => (
                      <tr key={usr.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-3 font-medium">{usr.name || "Sem nome"}</td>
                        <td className="py-3 px-3">{usr.email || "Sem email"}</td>
                        <td className="text-center py-3 px-3">{getRoleBadge(usr.role)}</td>
                        <td className="text-center py-3 px-3 text-xs text-muted-foreground">
                          {new Date(usr.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="text-center py-3 px-3">
                          <div className="flex items-center justify-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedUserId(usr.id)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Alterar Role de {usr.name}</DialogTitle>
                                  <DialogDescription>
                                    Selecione o novo role para este usuário
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">Novo Role</label>
                                    <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="user">Usuário</SelectItem>
                                        <SelectItem value="gestor">Gestor</SelectItem>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button
                                    onClick={() => {
                                      updateRoleMutation.mutate({
                                        userId: usr.id,
                                        role: selectedRole,
                                      });
                                    }}
                                    disabled={updateRoleMutation.isPending}
                                  >
                                    {updateRoleMutation.isPending ? "Salvando..." : "Salvar"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações de Roles */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informações de Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-red-600 pl-4">
                <h4 className="font-semibold text-red-600">Administrador</h4>
                <p className="text-sm text-muted-foreground">Acesso total ao sistema, incluindo gestão de usuários, empresas e configurações</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-semibold text-blue-600">Gestor</h4>
                <p className="text-sm text-muted-foreground">Acesso a gestão de empresas, usuários e planejamento estratégico</p>
              </div>
              <div className="border-l-4 border-gray-600 pl-4">
                <h4 className="font-semibold text-gray-600">Usuário</h4>
                <p className="text-sm text-muted-foreground">Acesso limitado a visualização de dados e preenchimento de formulários</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
