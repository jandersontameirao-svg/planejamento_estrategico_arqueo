import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Users, Plus, Search, Building2, Mail, Phone, Edit2, Trash2, Brain, Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  ativo: "bg-green-100 text-green-700",
  inativo: "bg-gray-100 text-gray-600",
  prospecto: "bg-blue-100 text-blue-700",
};

export default function ContratosClientes() {
  const [, navigate] = useLocation();
  const [busca, setBusca] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [extraindoCNPJ, setExtraindoCNPJ] = useState(false);

  const { data: empresas = [] } = trpc.empresas.list.useQuery();
  const { data: clientes = [], refetch } = trpc.contratos.clientes.list.useQuery({});

  const extrairCnpj = trpc.contratos.clientes.extrairCnpj.useMutation();
  const createCliente = trpc.contratos.clientes.create.useMutation({
    onSuccess: () => { refetch(); setShowDialog(false); toast.success("Cliente cadastrado!"); resetForm(); },
    onError: (err: any) => toast.error("Erro: " + err.message),
  });
  const updateCliente = trpc.contratos.clientes.update.useMutation({
    onSuccess: () => { refetch(); setShowDialog(false); toast.success("Cliente atualizado!"); resetForm(); },
    onError: (err: any) => toast.error("Erro: " + err.message),
  });
  const deleteCliente = trpc.contratos.clientes.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Cliente removido!"); },
  });

  const [form, setForm] = useState({
    cnpj: "", razaoSocial: "", nomeFantasia: "", email: "", telefone: "",
    endereco: "", cidade: "", estado: "", cep: "", contatoNome: "",
    contatoEmail: "", contatoTelefone: "", status: "ativo" as any,
    observacoes: "", empresaId: "",
  });

  function resetForm() {
    setForm({
      cnpj: "", razaoSocial: "", nomeFantasia: "", email: "", telefone: "",
      endereco: "", cidade: "", estado: "", cep: "", contatoNome: "",
      contatoEmail: "", contatoTelefone: "", status: "ativo",
      observacoes: "", empresaId: "",
    });
    setEditando(null);
  }

  function abrirEdicao(cliente: any) {
    setEditando(cliente);
    setForm({
      cnpj: cliente.cnpj ?? "",
      razaoSocial: cliente.razaoSocial ?? "",
      nomeFantasia: cliente.nomeFantasia ?? "",
      email: cliente.email ?? "",
      telefone: cliente.telefone ?? "",
      endereco: cliente.endereco ?? "",
      cidade: cliente.cidade ?? "",
      estado: cliente.estado ?? "",
      cep: cliente.cep ?? "",
      contatoNome: cliente.contatoNome ?? "",
      contatoEmail: cliente.contatoEmail ?? "",
      contatoTelefone: cliente.contatoTelefone ?? "",
      status: cliente.status ?? "ativo",
      observacoes: cliente.observacoes ?? "",
      empresaId: cliente.empresaId ? String(cliente.empresaId) : "",
    });
    setShowDialog(true);
  }

  async function handleExtrairCNPJ() {
    if (!form.cnpj || form.cnpj.length < 14) { toast.error("Digite um CNPJ válido"); return; }
    setExtraindoCNPJ(true);
    try {
      const dados = await extrairCnpj.mutateAsync({ cnpj: form.cnpj }) as any;
      if (dados) {
        setForm(f => ({
          ...f,
          razaoSocial: dados.razaoSocial ?? f.razaoSocial,
          nomeFantasia: dados.nomeFantasia ?? f.nomeFantasia,
          email: dados.email ?? f.email,
          telefone: dados.telefone ?? f.telefone,
          endereco: dados.endereco ?? f.endereco,
          cidade: dados.cidade ?? f.cidade,
          estado: dados.estado ?? f.estado,
          cep: dados.cep ?? f.cep,
        }));
        toast.success("Dados preenchidos pela IA!");
      }
    } catch {
      toast.error("Não foi possível extrair os dados do CNPJ");
    } finally {
      setExtraindoCNPJ(false);
    }
  }

  function handleSubmit() {
    if (!form.cnpj || !form.razaoSocial) { toast.error("CNPJ e Razão Social são obrigatórios"); return; }
    const data = {
      ...form,
      empresaId: form.empresaId ? parseInt(form.empresaId) : undefined,
    };
    if (editando) {
      updateCliente.mutate({ id: editando.id, data });
    } else {
      createCliente.mutate(data as any);
    }
  }

  const clientesFiltrados = clientes.filter((c: any) =>
    !busca || c.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
    (c.nomeFantasia ?? "").toLowerCase().includes(busca.toLowerCase()) ||
    c.cnpj.includes(busca)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/contratos")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Contratos
            </Button>
            <div className="h-5 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">Clientes / Contratados</h1>
            </div>
          </div>
          <Button size="sm" onClick={() => { resetForm(); setShowDialog(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Novo Cliente
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>

        {clientesFiltrados.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum cliente cadastrado</p>
              <Button className="mt-4" onClick={() => { resetForm(); setShowDialog(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Cadastrar Primeiro Cliente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientesFiltrados.map((cliente: any) => (
              <Card key={cliente.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {cliente.nomeFantasia || cliente.razaoSocial}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[cliente.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {cliente.status}
                          </span>
                        </div>
                        {cliente.nomeFantasia && (
                          <p className="text-xs text-gray-500">{cliente.razaoSocial}</p>
                        )}
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{cliente.cnpj}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                          {cliente.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {cliente.email}
                            </span>
                          )}
                          {cliente.telefone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {cliente.telefone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => abrirEdicao(cliente)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (confirm("Remover este cliente?")) deleteCliente.mutate({ id: cliente.id });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog: Cadastro/Edição de Cliente */}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowDialog(open); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* CNPJ com extração IA */}
            <div>
              <Label>CNPJ *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="00.000.000/0000-00"
                  value={form.cnpj}
                  onChange={(e) => setForm(f => ({ ...f, cnpj: e.target.value }))}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExtrairCNPJ}
                  disabled={extraindoCNPJ}
                  title="Preencher dados via IA"
                >
                  {extraindoCNPJ ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Clique no ícone IA para preencher os dados automaticamente</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Razão Social *</Label>
                <Input value={form.razaoSocial} onChange={(e) => setForm(f => ({ ...f, razaoSocial: e.target.value }))} />
              </div>
              <div>
                <Label>Nome Fantasia</Label>
                <Input value={form.nomeFantasia} onChange={(e) => setForm(f => ({ ...f, nomeFantasia: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={form.telefone} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} />
              </div>
            </div>

            <div>
              <Label>Endereço</Label>
              <Input value={form.endereco} onChange={(e) => setForm(f => ({ ...f, endereco: e.target.value }))} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label>Cidade</Label>
                <Input value={form.cidade} onChange={(e) => setForm(f => ({ ...f, cidade: e.target.value }))} />
              </div>
              <div>
                <Label>Estado</Label>
                <Input maxLength={2} placeholder="SP" value={form.estado} onChange={(e) => setForm(f => ({ ...f, estado: e.target.value.toUpperCase() }))} />
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Contato Principal</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Nome</Label>
                  <Input value={form.contatoNome} onChange={(e) => setForm(f => ({ ...f, contatoNome: e.target.value }))} />
                </div>
                <div>
                  <Label>E-mail</Label>
                  <Input type="email" value={form.contatoEmail} onChange={(e) => setForm(f => ({ ...f, contatoEmail: e.target.value }))} />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={form.contatoTelefone} onChange={(e) => setForm(f => ({ ...f, contatoTelefone: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="prospecto">Prospecto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Empresa Vinculada</Label>
                <Select value={form.empresaId || "nenhuma"} onValueChange={(v) => setForm(f => ({ ...f, empresaId: v === "nenhuma" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhuma">Nenhuma</SelectItem>
                    {empresas.map((e: any) => (
                      <SelectItem key={e.id} value={String(e.id)}>{e.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowDialog(false); }}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createCliente.isPending || updateCliente.isPending}>
              {editando ? "Salvar Alterações" : "Cadastrar Cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
