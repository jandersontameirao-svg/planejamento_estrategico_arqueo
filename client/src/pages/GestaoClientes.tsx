import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { SGCBanner } from "@/components/SGCBanner";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import {
  Users, Plus, Search, Building2, Mail, Phone, Pencil, Trash2,
  Loader2, Upload, MapPin, Briefcase, FileText, RefreshCw, ArrowLeft,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type FormState = {
  razaoSocial: string; nomeFantasia: string; cnpj: string;
  endereco: string; cep: string; cidade: string; estado: string;
  telefone: string; email: string; contatoNome: string;
  cnaeDescricao: string; naturezaJuridica: string;
  dataAbertura: string; situacaoCadastral: string; logoUrl: string;
  status: "ativo" | "inativo" | "prospecto";
};

const FORM_VAZIO: FormState = {
  razaoSocial: "", nomeFantasia: "", cnpj: "",
  endereco: "", cep: "", cidade: "", estado: "",
  telefone: "", email: "", contatoNome: "",
  cnaeDescricao: "", naturezaJuridica: "",
  dataAbertura: "", situacaoCadastral: "", logoUrl: "",
  status: "ativo",
};

function formatCNPJ(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    .replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, "$1.$2.$3/$4")
    .replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2.$3")
    .replace(/(\d{2})(\d{3})/, "$1.$2");
}

function formatCEP(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d{3})/, "$1-$2");
}

// ── Componente Principal ──────────────────────────────────────────────────────
interface GestaoClientesProps {
  empresaId?: number;
}
export default function GestaoClientes({ empresaId }: GestaoClientesProps = {}) {
  const [, navigate] = useLocation();
  const [busca, setBusca] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VAZIO);
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const [uploadingCartao, setUploadingCartao] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Estado do modal de vínculo
  const [showVincularModal, setShowVincularModal] = useState(false);
  const [buscaVincular, setBuscaVincular] = useState("");

  const utils = trpc.useUtils();
  const { data: clientes = [], isLoading } = trpc.contratos.clientes.list.useQuery({ empresaId });
  // Todos os clientes globais para o seletor de vínculo (só carrega quando o modal está aberto)
  const { data: clientesGlobais = [] } = trpc.contratos.clientes.listGlobal.useQuery(
    undefined,
    { enabled: showVincularModal }
  );

  const createMut = trpc.contratos.clientes.create.useMutation({
    onSuccess: () => { utils.contratos.clientes.list.invalidate({ empresaId }); toast.success("Cliente cadastrado!"); fecharModal(); },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const updateMut = trpc.contratos.clientes.update.useMutation({
    onSuccess: () => { utils.contratos.clientes.list.invalidate({ empresaId }); toast.success("Cliente atualizado!"); fecharModal(); },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const deleteMut = trpc.contratos.clientes.delete.useMutation({
    onSuccess: () => { utils.contratos.clientes.list.invalidate({ empresaId }); toast.success("Cliente removido."); },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const vincularMut = trpc.contratos.clientes.vincularEmpresa.useMutation({
    onSuccess: () => {
      utils.contratos.clientes.list.invalidate({ empresaId });
      utils.contratos.clientes.listGlobal.invalidate();
      toast.success("Cliente vinculado com sucesso!");
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const desvincularMut = trpc.contratos.clientes.desvincularEmpresa.useMutation({
    onSuccess: () => {
      utils.contratos.clientes.list.invalidate({ empresaId });
      utils.contratos.clientes.listGlobal.invalidate();
      toast.success("Cliente desvinculado.");
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  // empresaId é garantido quando o botão desvincular é exibido
  const handleDesvincular = (c: { id: number; razaoSocial: string }) => {
    if (!empresaId) return;
    if (confirm(`Desvincular "${c.razaoSocial}" desta empresa?`)) {
      desvincularMut.mutate({ clienteId: c.id, empresaId });
    }
  };
  const buscarCNPJMut = trpc.contratos.clientes.buscarCNPJ.useMutation();
  const extrairCartaoMut = trpc.contratos.clientes.extrairCartaoCNPJ.useMutation();

  function fecharModal() {
    setShowModal(false);
    setEditandoId(null);
    setForm(FORM_VAZIO);
  }

  function abrirEditar(c: typeof clientes[number]) {
    setEditandoId(c.id);
    setForm({
      razaoSocial: c.razaoSocial || "",
      nomeFantasia: c.nomeFantasia || "",
      cnpj: c.cnpj || "",
      endereco: c.endereco || "",
      cep: c.cep || "",
      cidade: c.cidade || "",
      estado: c.estado || "",
      telefone: c.telefone || "",
      email: c.email || "",
      contatoNome: c.contatoNome || "",
      cnaeDescricao: c.cnaeDescricao || "",
      naturezaJuridica: c.naturezaJuridica || "",
      dataAbertura: c.dataAbertura || "",
      situacaoCadastral: c.situacaoCadastral || "",
      logoUrl: c.logoUrl || "",
      status: (c.status as "ativo" | "inativo" | "prospecto") || "ativo",
    });
    setShowModal(true);
  }

  function setField(k: keyof FormState, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleBuscarCNPJ() {
    const cnpjLimpo = form.cnpj.replace(/\D/g, "");
    if (cnpjLimpo.length !== 14) { toast.error("CNPJ inválido (14 dígitos)"); return; }
    setBuscandoCNPJ(true);
    try {
      const dados = await buscarCNPJMut.mutateAsync({ cnpj: form.cnpj.replace(/\D/g, "") }) as Record<string, string> | null | undefined;
      if (dados) {
        setForm(f => ({
          ...f,
          razaoSocial: dados.razaoSocial || f.razaoSocial,
          nomeFantasia: dados.nomeFantasia || f.nomeFantasia,
          email: dados.email || f.email,
          telefone: dados.telefone || f.telefone,
          endereco: dados.endereco || f.endereco,
          cidade: dados.cidade || f.cidade,
          estado: dados.estado || f.estado,
          cep: dados.cep ? formatCEP(dados.cep) : f.cep,
          cnaeDescricao: dados.cnaeDescricao || f.cnaeDescricao,
          naturezaJuridica: dados.naturezaJuridica || f.naturezaJuridica,
          situacaoCadastral: dados.situacaoCadastral || f.situacaoCadastral,
          dataAbertura: dados.dataAbertura || f.dataAbertura,
        }));
        toast.success("Dados preenchidos via Receita Federal!");
      } else {
        toast.warning("CNPJ não encontrado. Preencha manualmente.");
      }
    } catch { toast.error("Erro ao buscar CNPJ"); }
    finally { setBuscandoCNPJ(false); }
  }

  async function handleUploadCartao(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Arquivo muito grande (máx. 5MB)"); return; }
    setUploadingCartao(true);
    try {
      // Upload do arquivo para S3 primeiro, depois envia a URL para a IA
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Falha no upload");
      const { url } = await uploadRes.json() as { url: string };
      const dados = await extrairCartaoMut.mutateAsync({ imageUrl: url }) as Record<string, string> | null;
      if (dados) {
        // Filtrar valores literais "null"/"undefined" retornados pelo modelo de IA
        const v = (val: string | undefined, fallback: string) =>
          val && val !== "null" && val !== "undefined" && val.trim() !== "" ? val : fallback;
        setForm(f => ({
          ...f,
          cnpj: dados.cnpj && dados.cnpj !== "null" ? formatCNPJ(dados.cnpj) : f.cnpj,
          razaoSocial: v(dados.razaoSocial, f.razaoSocial),
          nomeFantasia: v(dados.nomeFantasia, f.nomeFantasia),
          email: v(dados.email, f.email),
          telefone: v(dados.telefone, f.telefone),
          endereco: v(dados.endereco, f.endereco),
          cidade: v(dados.cidade, f.cidade),
          estado: v(dados.estado, f.estado),
          cep: dados.cep && dados.cep !== "null" ? formatCEP(dados.cep) : f.cep,
          cnaeDescricao: v(dados.cnaeDescricao, f.cnaeDescricao),
          naturezaJuridica: v(dados.naturezaJuridica, f.naturezaJuridica),
          situacaoCadastral: v(dados.situacaoCadastral, f.situacaoCadastral),
          dataAbertura: v(dados.dataAbertura, f.dataAbertura),
        }));
        toast.success("Dados extraídos do cartão CNPJ!");
      }
    } catch { toast.error("Erro ao extrair dados do cartão"); }
    finally {
      setUploadingCartao(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleBuscarCEP(cep: string) {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json() as Record<string, string> & { erro?: boolean };
      if (data.erro) { toast.error("CEP não encontrado"); return; }
      setForm(f => ({
        ...f,
        endereco: [data.logradouro, data.bairro].filter(Boolean).join(", ") || f.endereco,
        cidade: data.localidade || f.cidade,
        estado: data.uf || f.estado,
      }));
    } catch { toast.error("Erro ao buscar CEP"); }
    finally { setLoadingCep(false); }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.razaoSocial.trim() && !form.nomeFantasia.trim()) { toast.error("Informe ao menos a Razão Social ou o Nome Fantasia"); return; }
    if (!form.cnpj.trim()) { toast.error("CNPJ é obrigatório"); return; }
    const payload = {
      cnpj: form.cnpj,
      razaoSocial: form.razaoSocial,
      nomeFantasia: form.nomeFantasia || undefined,
      email: form.email || undefined,
      telefone: form.telefone || undefined,
      endereco: form.endereco || undefined,
      cidade: form.cidade || undefined,
      estado: form.estado || undefined,
      cep: form.cep || undefined,
      contatoNome: form.contatoNome || undefined,
      cnaeDescricao: form.cnaeDescricao || undefined,
      naturezaJuridica: form.naturezaJuridica || undefined,
      dataAbertura: form.dataAbertura || undefined,
      situacaoCadastral: form.situacaoCadastral || undefined,
      logoUrl: form.logoUrl || undefined,
      status: form.status,
      // Vínculo automático: quando acessado via /empresa/:id/clientes, vincula o cliente à empresa
      empresaId: empresaId || undefined,
    };
    if (editandoId) {
      updateMut.mutate({ id: editandoId, data: payload });
    } else {
      createMut.mutate(payload);
    }
  }

  const filtrados = clientes.filter((c) => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return (
      c.razaoSocial?.toLowerCase().includes(q) ||
      c.nomeFantasia?.toLowerCase().includes(q) ||
      c.cnpj?.includes(q) ||
      c.cidade?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container py-8">
      <SGCBanner
        message="A gestão de clientes agora é realizada pelo SGC. Os dados exibidos são somente leitura."
        sgcUrl={empresaId ? `${import.meta.env.VITE_SGC_PUBLIC_APP_URL || ''}/empresa/${empresaId}/clientes` : (import.meta.env.VITE_SGC_PUBLIC_APP_URL || '')}
        variant="info"
      />
      <div className="mt-4" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          {empresaId && (
            <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => navigate(`/empresa/${empresaId}/planejamento`)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Hub
            </Button>
          )}
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gestão de Clientes
          </h1>
          <p className="text-muted-foreground mt-1">
            {empresaId ? "Clientes vinculados a esta empresa" : "Cadastro global compartilhado entre todas as empresas do Grupo Arqueo"}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CNPJ, cidade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
          {empresaId && (
            <Button variant="outline" onClick={() => { setBuscaVincular(""); setShowVincularModal(true); }}>
              <Users className="mr-2 h-4 w-4" />
              Vincular Existente
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{clientes.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Ativos</p>
          <p className="text-2xl font-bold text-green-600">
            {clientes.filter((c) => c.status === "ativo").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Com Endereço</p>
          <p className="text-2xl font-bold text-blue-600">
            {clientes.filter((c) => c.cidade).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Filtrados</p>
          <p className="text-2xl font-bold">{filtrados.length}</p>
        </Card>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtrados.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {busca ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {busca ? `Nenhum resultado para "${busca}"` : "Comece criando seu primeiro cliente"}
            </p>
            {!busca && (
              <Button onClick={() => setShowModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Cliente
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((c) => (
            <Card key={c.id} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base leading-tight truncate">{c.razaoSocial}</CardTitle>
                    {c.nomeFantasia && <p className="text-sm text-muted-foreground truncate">{c.nomeFantasia}</p>}
                    <CardDescription className="font-mono text-xs mt-1">{c.cnpj}</CardDescription>
                  </div>
                  {c.logoUrl ? (
                    <img src={c.logoUrl} alt={c.razaoSocial} className="w-10 h-10 rounded object-contain shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
                <Badge
                  variant={c.status === "ativo" ? "default" : c.status === "prospecto" ? "outline" : "secondary"}
                  className="w-fit text-xs mt-1"
                >
                  {c.status === "ativo" ? "Ativo" : c.status === "prospecto" ? "Prospecto" : "Inativo"}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 space-y-1.5 pb-3">
                {(c.cidade || c.estado) && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{[c.cidade, c.estado].filter(Boolean).join(" - ")}</span>
                  </div>
                )}
                {c.telefone && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.telefone}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
                {c.cnaeDescricao && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate text-xs">{c.cnaeDescricao}</span>
                  </div>
                )}
              </CardContent>
              <div className="px-6 pb-4 flex items-center justify-between border-t pt-3">
                <Link href={`/gestao-clientes/${c.id}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                  <FileText className="h-4 w-4" />
                  Ver detalhes
                </Link>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => abrirEditar(c)} title="Editar">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  {empresaId && (
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 hover:text-amber-600"
                      onClick={() => handleDesvincular(c)}
                      title="Desvincular da empresa"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive"
                    onClick={() => { if (confirm(`Excluir "${c.razaoSocial}"?`)) deleteMut.mutate({ id: c.id }); }}
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      <Dialog open={showModal} onOpenChange={(v) => { if (!v) fecharModal(); else setShowModal(true); }}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto w-[95vw]">
          <DialogHeader>
            <DialogTitle>{editandoId ? "Editar Cliente" : "Cadastrar Novo Cliente"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Upload Cartão CNPJ */}
            <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Upload do Cartão CNPJ (Opcional)</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Faça upload de uma foto do Cartão CNPJ para preencher automaticamente os campos usando IA
              </p>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleUploadCartao} className="hidden" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCartao}
              >
                {uploadingCartao ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Extraindo dados...</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" />Selecionar Imagem ou PDF</>
                )}
              </Button>
            </div>

            {/* Dados Principais */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="razaoSocial">Razão Social</Label>
                <Input id="razaoSocial" value={form.razaoSocial} onChange={e => setField("razaoSocial", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input id="nomeFantasia" value={form.nomeFantasia} onChange={e => setField("nomeFantasia", e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Informe a Razão Social ou o Nome Fantasia</p>
              </div>

              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <div className="flex gap-2">
                  <Input
                    id="cnpj"
                    value={form.cnpj}
                    onChange={e => setField("cnpj", formatCNPJ(e.target.value))}
                    required
                    placeholder="00.000.000/0000-00"
                  />
                  <Button
                    type="button" variant="outline" size="icon"
                    onClick={handleBuscarCNPJ}
                    disabled={buscandoCNPJ || form.cnpj.replace(/\D/g, "").length !== 14}
                    title="Consultar CNPJ na Receita Federal"
                  >
                    {buscandoCNPJ ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Endereço */}
              <div className="col-span-3 mt-2">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2 border-b pb-1">Endereço</h3>
              </div>
              <div className="col-span-2">
                <Label htmlFor="endereco">Logradouro / Endereço</Label>
                <Input id="endereco" value={form.endereco} onChange={e => setField("endereco", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={form.cep}
                  onChange={e => {
                    const v = formatCEP(e.target.value);
                    setField("cep", v);
                    if (v.replace(/\D/g, "").length === 8) handleBuscarCEP(v);
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                  disabled={loadingCep}
                />
                {loadingCep && <p className="text-xs text-muted-foreground mt-1">Buscando endereço...</p>}
              </div>
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" value={form.cidade} onChange={e => setField("cidade", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="estado">Estado (UF)</Label>
                <Input id="estado" value={form.estado} onChange={e => setField("estado", e.target.value.toUpperCase())} maxLength={2} placeholder="SP" />
              </div>

              {/* Contato */}
              <div className="col-span-3 mt-2">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2 border-b pb-1">Contato</h3>
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" type="tel" value={form.telefone} onChange={e => setField("telefone", e.target.value)} placeholder="(11) 3456-7890" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={e => setField("email", e.target.value)} placeholder="contato@empresa.com.br" />
              </div>
              <div>
                <Label htmlFor="contatoNome">Nome do Contato</Label>
                <Input id="contatoNome" value={form.contatoNome} onChange={e => setField("contatoNome", e.target.value)} />
              </div>

              {/* Informações Adicionais */}
              <div className="col-span-3 mt-2">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2 border-b pb-1">Informações Adicionais</h3>
              </div>
              <div className="col-span-2">
                <Label htmlFor="cnaeDescricao">Atividade Econômica (CNAE)</Label>
                <Input id="cnaeDescricao" value={form.cnaeDescricao} onChange={e => setField("cnaeDescricao", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="naturezaJuridica">Natureza Jurídica</Label>
                <Input id="naturezaJuridica" value={form.naturezaJuridica} onChange={e => setField("naturezaJuridica", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="dataAbertura">Data de Abertura</Label>
                <Input id="dataAbertura" type="date" value={form.dataAbertura} onChange={e => setField("dataAbertura", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="situacaoCadastral">Situação Cadastral</Label>
                <Input id="situacaoCadastral" value={form.situacaoCadastral} onChange={e => setField("situacaoCadastral", e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={fecharModal}>Cancelar</Button>
              <Button
                type="submit"
                disabled={createMut.isPending || updateMut.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {editandoId
                  ? (updateMut.isPending ? "Salvando..." : "Salvar Alterações")
                  : (createMut.isPending ? "Criando..." : "Criar Cliente")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Vínculo de Cliente Existente */}
      <Dialog open={showVincularModal} onOpenChange={setShowVincularModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Vincular Cliente Existente
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Selecione um cliente do cadastro global para vincular a esta empresa.
            </p>
          </DialogHeader>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CNPJ ou cidade..."
              value={buscaVincular}
              onChange={(e) => setBuscaVincular(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {/* Lista de clientes globais */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {clientesGlobais
              .filter((c) => {
                // Filtra apenas por busca (N:N permite vínculos múltiplos)
                if (!buscaVincular) return true;
                const q = buscaVincular.toLowerCase();
                return (
                  c.razaoSocial.toLowerCase().includes(q) ||
                  (c.nomeFantasia ?? "").toLowerCase().includes(q) ||
                  c.cnpj.includes(q) ||
                  (c.cidade ?? "").toLowerCase().includes(q)
                );
              })
              .map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{c.razaoSocial}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.cnpj}{c.cidade ? ` • ${c.cidade}/${c.estado}` : ""}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-3 shrink-0"
                    disabled={vincularMut.isPending}
                    onClick={() => {
                      if (empresaId) {
                        vincularMut.mutate({ clienteId: c.id, empresaId });
                      }
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Vincular
                  </Button>
                </div>
              ))
            }
            {clientesGlobais.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhum cliente disponível para vincular.</p>
                <p className="text-xs mt-1">Todos os clientes já estão vinculados a esta empresa ou não há clientes cadastrados.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button variant="outline" onClick={() => setShowVincularModal(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
