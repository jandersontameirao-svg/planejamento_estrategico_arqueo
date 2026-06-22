import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Building2, Edit, FileText, Plus, Shield, Trash2, Upload, Users, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Empresas() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    tipoAtuacao: "servicos" as "servicos" | "produtos" | "servicos_produtos",
    status: "ativa" as "ativa" | "inativa",
    observacoes: "",
    logoUrl: "",
    logoKey: "",
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const { data: empresas, isLoading, refetch } = trpc.empresas.list.useQuery();

  const createMutation = trpc.empresas.create.useMutation({
    onSuccess: () => {
      toast.success("Empresa criada com sucesso!");
      refetch();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.empresas.update.useMutation({
    onSuccess: () => {
      toast.success("Empresa atualizada com sucesso!");
      refetch();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.empresas.delete.useMutation({
    onSuccess: () => {
      toast.success("Empresa excluída com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      tipoAtuacao: "servicos",
      status: "ativa",
      observacoes: "",
      logoUrl: "",
      logoKey: "",
    });
    setLogoPreview("");
    setEditingId(null);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem (PNG, JPG, SVG)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A logo deve ter no máximo 2MB");
      return;
    }
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Falha no upload");
      const { url, key } = await res.json();
      setFormData((prev) => ({ ...prev, logoUrl: url, logoKey: key }));
      setLogoPreview(url);
      toast.success("Logo enviada com sucesso!");
    } catch {
      toast.error("Erro ao enviar a logo");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (empresa: any) => {
    setEditingId(empresa.id);
    setFormData({
      nome: empresa.nome,
      tipoAtuacao: empresa.tipoAtuacao,
      status: empresa.status,
      observacoes: empresa.observacoes || "",
      logoUrl: empresa.logoUrl || "",
      logoKey: empresa.logoKey || "",
    });
    setLogoPreview(empresa.logoUrl || "");
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta empresa?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      servicos: "Serviços",
      produtos: "Produtos",
      servicos_produtos: "Serviços + Produtos",
    };
    return labels[tipo] || tipo;
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Empresas</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as empresas do Grupo Arqueo
          </p>
        </div>
        {user?.role === "admin" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Editar Empresa" : "Nova Empresa"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados da empresa
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Logo */}
                  <div className="grid gap-2">
                    <Label>Logo da Empresa</Label>
                    {logoPreview ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-16 w-auto max-w-[180px] object-contain border rounded-lg p-1 bg-white"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLogoPreview("");
                            setFormData((prev) => ({ ...prev, logoUrl: "", logoKey: "" }));
                          }}
                        >
                          <X className="h-4 w-4 mr-1" /> Remover
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        {logoUploading ? (
                          <span className="text-sm text-muted-foreground">Enviando...</span>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                            <span className="text-sm text-muted-foreground text-center px-4">
                              Clique para enviar a logo (PNG, JPG, SVG — máx. 2MB)
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={logoUploading}
                        />
                      </label>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="nome">Nome da Empresa</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tipoAtuacao">Tipo de Atuação</Label>
                    <Select
                      value={formData.tipoAtuacao}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, tipoAtuacao: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="servicos">Serviços</SelectItem>
                        <SelectItem value="produtos">Produtos</SelectItem>
                        <SelectItem value="servicos_produtos">
                          Serviços + Produtos
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativa">Ativa</SelectItem>
                        <SelectItem value="inativa">Inativa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="observacoes">Observações Estratégicas</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) =>
                        setFormData({ ...formData, observacoes: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
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
                  <Button type="submit" disabled={logoUploading}>
                    {editingId ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {empresas?.map((empresa) => (
          <Card key={empresa.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {(empresa as any).logoUrl ? (
                    <div className="h-12 w-12 flex items-center justify-center rounded-lg border bg-white p-1 shrink-0">
                      <img
                        src={(empresa as any).logoUrl}
                        alt={`Logo ${empresa.nome}`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{empresa.nome}</CardTitle>
                    <CardDescription>
                      {getTipoLabel(empresa.tipoAtuacao)}
                    </CardDescription>
                  </div>
                </div>
                {user?.role === "admin" && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(empresa)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(empresa.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      empresa.status === "ativa"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {empresa.status === "ativa" ? "Ativa" : "Inativa"}
                  </span>
                </div>
                {empresa.observacoes && (
                  <div className="text-sm text-muted-foreground">
                    <p className="line-clamp-2">{empresa.observacoes}</p>
                  </div>
                )}
                <div className="flex gap-2 mt-3 pt-3 border-t flex-wrap">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/empresa/${empresa.id}/contratos`}>
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      Contratos
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/empresa/${empresa.id}/contratos/clientes`}>
                      <Users className="w-3.5 h-3.5 mr-1" />
                      Clientes
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" asChild>
                    <Link href={`/empresa/${empresa.id}/gestao-riscos`}>
                      <Shield className="w-3.5 h-3.5 mr-1" />
                      Riscos
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {empresas?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma empresa cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando sua primeira empresa
            </p>
            {user?.role === "admin" && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Empresa
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
