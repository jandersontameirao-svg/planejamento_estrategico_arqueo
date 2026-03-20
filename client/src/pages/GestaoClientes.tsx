import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Users, Plus, Search, Building2, Mail, Phone, Pencil, Trash2,
  Loader2, Upload, MapPin, Briefcase, FileText, RefreshCw, X,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type FormState = {
  name: string; fantasyName: string; taxId: string;
  logradouro: string; complemento: string; bairro: string;
  cep: string; municipio: string; uf: string;
  telefone: string; email: string; contact: string;
  atividadeEconomica: string; naturezaJuridica: string;
  dataAbertura: string; situacaoCadastral: string; logoUrl: string;
};

const FORM_VAZIO: FormState = {
  name: "", fantasyName: "", taxId: "",
  logradouro: "", complemento: "", bairro: "",
  cep: "", municipio: "", uf: "",
  telefone: "", email: "", contact: "",
  atividadeEconomica: "", naturezaJuridica: "",
  dataAbertura: "", situacaoCadastral: "", logoUrl: "",
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
export default function GestaoClientes() {
  const [busca, setBusca] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VAZIO);
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const [uploadingCartao, setUploadingCartao] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: clientes = [], isLoading } = trpc.clients.list.useQuery();

  const createMut = trpc.clients.create.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); toast.success("Cliente cadastrado!"); fecharModal(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.clients.update.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); toast.success("Cliente atualizado!"); fecharModal(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.clients.delete.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); toast.success("Cliente removido."); },
    onError: (e) => toast.error(e.message),
  });
  const buscarCNPJQuery = trpc.clients.consultarCNPJ.useQuery(
    { cnpj: form.taxId.replace(/\D/g, "") },
    { enabled: false, retry: false }
  );
  const extrairCartaoMut = trpc.clients.extractFromCNPJCard.useMutation();

  function fecharModal() {
    setShowModal(false);
    setEditandoId(null);
    setForm(FORM_VAZIO);
  }

  function abrirEditar(c: any) {
    setEditandoId(c.id);
    setForm({
      name: c.name || "", fantasyName: c.fantasyName || "", taxId: c.taxId || "",
      logradouro: c.logradouro || "", complemento: c.complemento || "", bairro: c.bairro || "",
      cep: c.cep || "", municipio: c.municipio || "", uf: c.uf || "",
      telefone: c.telefone || "", email: c.email || "", contact: c.contact || "",
      atividadeEconomica: c.atividadeEconomica || "", naturezaJuridica: c.naturezaJuridica || "",
      dataAbertura: c.dataAbertura ? (typeof c.dataAbertura === "string" ? c.dataAbertura : c.dataAbertura.toISOString().split("T")[0]) : "",
      situacaoCadastral: c.situacaoCadastral || "", logoUrl: c.logoUrl || "",
    });
    setShowModal(true);
  }

  function setField(k: keyof FormState, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleBuscarCNPJ() {
    const cnpjLimpo = form.taxId.replace(/\D/g, "");
    if (cnpjLimpo.length !== 14) { toast.error("CNPJ inválido (14 dígitos)"); return; }
    setBuscandoCNPJ(true);
    try {
      const result = await buscarCNPJQuery.refetch();
      const dados = result.data;
      if (dados) {
        setForm(f => ({
          ...f,
          name: (dados as any).razaoSocial || f.name,
          fantasyName: (dados as any).nomeFantasia || f.fantasyName,
          email: (dados as any).email || f.email,
          telefone: (dados as any).telefone || f.telefone,
          logradouro: (dados as any).logradouro || f.logradouro,
          complemento: (dados as any).complemento || f.complemento,
          bairro: (dados as any).bairro || f.bairro,
          municipio: (dados as any).municipio || f.municipio,
          uf: (dados as any).uf || f.uf,
          cep: (dados as any).cep ? formatCEP((dados as any).cep) : f.cep,
          atividadeEconomica: (dados as any).atividadeEconomica || f.atividadeEconomica,
          naturezaJuridica: (dados as any).naturezaJuridica || f.naturezaJuridica,
          situacaoCadastral: (dados as any).situacaoCadastral || f.situacaoCadastral,
          dataAbertura: (dados as any).dataAbertura || f.dataAbertura,
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
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        try {
          const dados = await extrairCartaoMut.mutateAsync({ imageBase64: base64 });
          if (dados) {
            setForm(f => ({
              ...f,
              taxId: (dados as any).cnpj ? formatCNPJ((dados as any).cnpj) : f.taxId,
              name: (dados as any).razaoSocial || f.name,
              fantasyName: (dados as any).nomeFantasia || f.fantasyName,
              email: (dados as any).email || f.email,
              telefone: (dados as any).telefone || f.telefone,
              logradouro: (dados as any).logradouro || f.logradouro,
              complemento: (dados as any).complemento || f.complemento,
              bairro: (dados as any).bairro || f.bairro,
              municipio: (dados as any).municipio || f.municipio,
              uf: (dados as any).uf || f.uf,
              cep: (dados as any).cep ? formatCEP((dados as any).cep) : f.cep,
              atividadeEconomica: (dados as any).atividadeEconomica || f.atividadeEconomica,
              naturezaJuridica: (dados as any).naturezaJuridica || f.naturezaJuridica,
              situacaoCadastral: (dados as any).situacaoCadastral || f.situacaoCadastral,
              dataAbertura: (dados as any).dataAbertura || f.dataAbertura,
            }));
            toast.success("Dados extraídos do cartão CNPJ!");
          }
        } catch { toast.error("Erro ao extrair dados do cartão"); }
        finally { setUploadingCartao(false); }
      };
      reader.readAsDataURL(file);
    } catch { setUploadingCartao(false); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleBuscarCEP(cep: string) {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (data.erro) { toast.error("CEP não encontrado"); return; }
      setForm(f => ({
        ...f,
        logradouro: data.logradouro || f.logradouro,
        bairro: data.bairro || f.bairro,
        municipio: data.localidade || f.municipio,
        uf: data.uf || f.uf,
        complemento: data.complemento || f.complemento,
      }));
    } catch { toast.error("Erro ao buscar CEP"); }
    finally { setLoadingCep(false); }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Nome/Razão Social é obrigatório"); return; }
    if (editandoId) {
      updateMut.mutate({ id: editandoId, ...form });
    } else {
      createMut.mutate(form);
    }
  }

  const filtrados = clientes.filter(c => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.fantasyName?.toLowerCase().includes(q) || c.taxId?.includes(q) || c.municipio?.toLowerCase().includes(q);
  });

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gestão de Clientes
          </h1>
          <p className="text-muted-foreground mt-1">
            Cadastro global compartilhado entre todas as empresas do Grupo Arqueo
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
            {clientes.filter(c => !c.situacaoCadastral || c.situacaoCadastral.toLowerCase().includes("ativa")).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Com Endereço</p>
          <p className="text-2xl font-bold text-blue-600">
            {clientes.filter(c => c.municipio).length}
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
                    <CardTitle className="text-base leading-tight truncate">{c.name}</CardTitle>
                    {c.fantasyName && <p className="text-sm text-muted-foreground truncate">{c.fantasyName}</p>}
                    <CardDescription className="font-mono text-xs mt-1">{c.taxId}</CardDescription>
                  </div>
                  {c.logoUrl ? (
                    <img src={c.logoUrl} alt={c.name} className="w-10 h-10 rounded object-contain shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
                {c.situacaoCadastral && (
                  <Badge
                    variant={c.situacaoCadastral.toLowerCase().includes("ativa") ? "default" : "secondary"}
                    className="w-fit text-xs mt-1"
                  >
                    {c.situacaoCadastral}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex-1 space-y-1.5 pb-3">
                {(c.municipio || c.uf) && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{[c.municipio, c.uf].filter(Boolean).join(" - ")}</span>
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
                {c.atividadeEconomica && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate text-xs">{c.atividadeEconomica}</span>
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
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive"
                    onClick={() => { if (confirm(`Excluir "${c.name}"?`)) deleteMut.mutate({ id: c.id }); }}
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
                <Label htmlFor="name">Nome / Razão Social *</Label>
                <Input id="name" value={form.name} onChange={e => setField("name", e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="fantasyName">Nome Fantasia</Label>
                <Input id="fantasyName" value={form.fantasyName} onChange={e => setField("fantasyName", e.target.value)} />
              </div>

              <div>
                <Label htmlFor="taxId">CPF / CNPJ *</Label>
                <div className="flex gap-2">
                  <Input
                    id="taxId"
                    value={form.taxId}
                    onChange={e => setField("taxId", formatCNPJ(e.target.value))}
                    required
                    placeholder="00.000.000/0000-00"
                  />
                  <Button
                    type="button" variant="outline" size="icon"
                    onClick={handleBuscarCNPJ}
                    disabled={buscandoCNPJ || form.taxId.replace(/\D/g, "").length !== 14}
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
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input id="logradouro" value={form.logradouro} onChange={e => setField("logradouro", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="complemento">Complemento</Label>
                <Input id="complemento" value={form.complemento} onChange={e => setField("complemento", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="bairro">Bairro</Label>
                <Input id="bairro" value={form.bairro} onChange={e => setField("bairro", e.target.value)} />
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
                <Label htmlFor="municipio">Município</Label>
                <Input id="municipio" value={form.municipio} onChange={e => setField("municipio", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="uf">UF</Label>
                <Input id="uf" value={form.uf} onChange={e => setField("uf", e.target.value.toUpperCase())} maxLength={2} placeholder="SP" />
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
                <Label htmlFor="contact">Contato Adicional</Label>
                <Input id="contact" value={form.contact} onChange={e => setField("contact", e.target.value)} placeholder="Outro telefone ou email" />
              </div>

              {/* Informações Adicionais */}
              <div className="col-span-3 mt-2">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2 border-b pb-1">Informações Adicionais</h3>
              </div>
              <div className="col-span-2">
                <Label htmlFor="atividadeEconomica">Atividade Econômica</Label>
                <Input id="atividadeEconomica" value={form.atividadeEconomica} onChange={e => setField("atividadeEconomica", e.target.value)} />
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
    </div>
  );
}
