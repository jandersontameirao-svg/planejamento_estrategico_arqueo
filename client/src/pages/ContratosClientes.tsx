import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft, Users, Plus, Search, Building2, Mail, Phone, Edit2, Trash2,
  Loader2, Sparkles, Upload, CheckCircle2, AlertCircle, MapPin, Calendar,
  Briefcase, Hash, ChevronDown, ChevronUp, X, Eye,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  ativo: "bg-green-100 text-green-700 border-green-200",
  inativo: "bg-gray-100 text-gray-600 border-gray-200",
  prospecto: "bg-blue-100 text-blue-700 border-blue-200",
};

const FONTE_LABELS: Record<string, { label: string; color: string }> = {
  brasilapi: { label: "Receita Federal (BrasilAPI)", color: "text-green-600" },
  receitaws: { label: "Receita Federal (ReceitaWS)", color: "text-green-600" },
  ia: { label: "IA (dados aproximados)", color: "text-amber-600" },
  cartao_ia: { label: "Cartão CNPJ (IA)", color: "text-blue-600" },
};

interface ContratosClientesProps {
  empresaId: number;
}

type FormState = {
  cnpj: string; razaoSocial: string; nomeFantasia: string; email: string; telefone: string;
  endereco: string; cidade: string; estado: string; cep: string; contatoNome: string;
  contatoEmail: string; contatoTelefone: string; status: "ativo" | "inativo" | "prospecto";
  observacoes: string; empresaId: string;
  porte: string; naturezaJuridica: string; cnaePrincipal: string; cnaeDescricao: string;
  situacaoCadastral: string; dataAbertura: string; capitalSocial: string;
  socios: string; dadosReceita: string;
};

const FORM_VAZIO: FormState = {
  cnpj: "", razaoSocial: "", nomeFantasia: "", email: "", telefone: "",
  endereco: "", cidade: "", estado: "", cep: "", contatoNome: "",
  contatoEmail: "", contatoTelefone: "", status: "ativo", observacoes: "", empresaId: "",
  porte: "", naturezaJuridica: "", cnaePrincipal: "", cnaeDescricao: "",
  situacaoCadastral: "", dataAbertura: "", capitalSocial: "", socios: "", dadosReceita: "",
};

function formatCNPJ(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    .replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, "$1.$2.$3/$4")
    .replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2.$3")
    .replace(/(\d{2})(\d{3})/, "$1.$2");
}

export default function ContratosClientes({ empresaId }: ContratosClientesProps) {
  const [, navigate] = useLocation();
  const [busca, setBusca] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const [cnpjVerificado, setCnpjVerificado] = useState<{ existe: boolean; cliente: any } | null>(null);
  const [dadosBuscados, setDadosBuscados] = useState<any>(null);
  const [expandirDetalhes, setExpandirDetalhes] = useState(false);
  const [uploadingCartao, setUploadingCartao] = useState(false);
  const [clienteDetalhes, setClienteDetalhes] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: empresas = [] } = trpc.empresas.list.useQuery();
  const { data: clientes = [], refetch } = trpc.contratos.clientes.list.useQuery({ empresaId });
  const utils = trpc.useUtils();

  const buscarCNPJMut = trpc.contratos.clientes.buscarCNPJ.useMutation();
  const verificarCNPJQuery = trpc.contratos.clientes.verificarCNPJ;
  const extrairCartaoMut = trpc.contratos.clientes.extrairCartaoCNPJ.useMutation();

  const createCliente = trpc.contratos.clientes.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowDialog(false);
      toast.success("Cliente cadastrado com sucesso!");
      resetForm();
    },
    onError: (err: any) => toast.error("Erro ao cadastrar: " + err.message),
  });
  const updateCliente = trpc.contratos.clientes.update.useMutation({
    onSuccess: () => {
      refetch();
      setShowDialog(false);
      toast.success("Cliente atualizado!");
      resetForm();
    },
    onError: (err: any) => toast.error("Erro ao atualizar: " + err.message),
  });
  const deleteCliente = trpc.contratos.clientes.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Cliente removido!"); },
  });

  const [form, setForm] = useState<FormState>(FORM_VAZIO);

  function resetForm() {
    setForm(FORM_VAZIO);
    setEditando(null);
    setDadosBuscados(null);
    setCnpjVerificado(null);
    setExpandirDetalhes(false);
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
      porte: cliente.porte ?? "",
      naturezaJuridica: cliente.naturezaJuridica ?? "",
      cnaePrincipal: cliente.cnaePrincipal ?? "",
      cnaeDescricao: cliente.cnaeDescricao ?? "",
      situacaoCadastral: cliente.situacaoCadastral ?? "",
      dataAbertura: cliente.dataAbertura ?? "",
      capitalSocial: cliente.capitalSocial ?? "",
      socios: cliente.socios ?? "",
      dadosReceita: cliente.dadosReceita ?? "",
    });
    setShowDialog(true);
  }

  async function handleBuscarCNPJ() {
    const cnpjLimpo = form.cnpj.replace(/\D/g, "");
    if (cnpjLimpo.length !== 14) { toast.error("Digite um CNPJ válido com 14 dígitos"); return; }
    setBuscandoCNPJ(true);
    setDadosBuscados(null);
    setCnpjVerificado(null);
    try {
      // Verifica se já existe
      const verificacao = await utils.contratos.clientes.verificarCNPJ.fetch({ cnpj: form.cnpj });
      setCnpjVerificado(verificacao);

      if (verificacao.existe && !editando) {
        toast.warning(`CNPJ já cadastrado como "${(verificacao.cliente as any)?.razaoSocial}"`);
        setBuscandoCNPJ(false);
        return;
      }

      // Busca dados na Receita Federal
      const dados = await buscarCNPJMut.mutateAsync({ cnpj: form.cnpj });
      if (dados) {
        setDadosBuscados(dados);
        setForm(f => ({
          ...f,
          cnpj: verificacao.cnpjFormatado || f.cnpj,
          razaoSocial: (dados as any).razaoSocial || f.razaoSocial,
          nomeFantasia: (dados as any).nomeFantasia || f.nomeFantasia,
          email: (dados as any).email || f.email,
          telefone: (dados as any).telefone || f.telefone,
          endereco: (dados as any).endereco || f.endereco,
          cidade: (dados as any).cidade || f.cidade,
          estado: (dados as any).estado || f.estado,
          cep: (dados as any).cep || f.cep,
          porte: (dados as any).porte || f.porte,
          naturezaJuridica: (dados as any).naturezaJuridica || f.naturezaJuridica,
          cnaePrincipal: (dados as any).cnaePrincipal || f.cnaePrincipal,
          cnaeDescricao: (dados as any).cnaeDescricao || f.cnaeDescricao,
          situacaoCadastral: (dados as any).situacaoCadastral || f.situacaoCadastral,
          dataAbertura: (dados as any).dataAbertura || f.dataAbertura,
          capitalSocial: (dados as any).capitalSocial || f.capitalSocial,
          socios: (dados as any).socios || f.socios,
          dadosReceita: (dados as any).dadosReceita || f.dadosReceita,
        }));
        const fonte = FONTE_LABELS[(dados as any).fonte] ?? { label: "API", color: "" };
        toast.success(`Dados preenchidos via ${fonte.label}!`);
      }
    } catch (e: any) {
      toast.error("Erro ao buscar CNPJ: " + (e.message || "Tente novamente"));
    } finally {
      setBuscandoCNPJ(false);
    }
  }

  async function handleUploadCartao(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Arquivo muito grande (máx. 5MB)"); return; }
    setUploadingCartao(true);
    try {
      // Converte para base64 para enviar ao LLM
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        try {
          const dados = await extrairCartaoMut.mutateAsync({ imageUrl: base64 });
          if (dados) {
            setDadosBuscados(dados);
            setForm(f => ({
              ...f,
              cnpj: (dados as any).cnpj ? formatCNPJ((dados as any).cnpj) : f.cnpj,
              razaoSocial: (dados as any).razaoSocial || f.razaoSocial,
              nomeFantasia: (dados as any).nomeFantasia || f.nomeFantasia,
              email: (dados as any).email || f.email,
              telefone: (dados as any).telefone || f.telefone,
              endereco: (dados as any).endereco || f.endereco,
              cidade: (dados as any).cidade || f.cidade,
              estado: (dados as any).estado || f.estado,
              cep: (dados as any).cep || f.cep,
              porte: (dados as any).porte || f.porte,
              naturezaJuridica: (dados as any).naturezaJuridica || f.naturezaJuridica,
              cnaePrincipal: (dados as any).cnaePrincipal || f.cnaePrincipal,
              cnaeDescricao: (dados as any).cnaeDescricao || f.cnaeDescricao,
              situacaoCadastral: (dados as any).situacaoCadastral || f.situacaoCadastral,
              dataAbertura: (dados as any).dataAbertura || f.dataAbertura,
              capitalSocial: (dados as any).capitalSocial || f.capitalSocial,
            }));
            toast.success("Dados extraídos do cartão CNPJ pela IA!");
          }
        } catch {
          toast.error("Não foi possível extrair dados do cartão");
        } finally {
          setUploadingCartao(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingCartao(false);
      toast.error("Erro ao processar arquivo");
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    !busca ||
    c.razaoSocial?.toLowerCase().includes(busca.toLowerCase()) ||
    (c.nomeFantasia ?? "").toLowerCase().includes(busca.toLowerCase()) ||
    c.cnpj?.includes(busca)
  );

  const socios = clienteDetalhes?.socios ? (() => {
    try { return JSON.parse(clienteDetalhes.socios); } catch { return []; }
  })() : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/empresa/${empresaId}/contratos`)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Contratos
            </Button>
            <div className="h-5 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Clientes / Contratados</h1>
                <p className="text-xs text-gray-500">Cadastro via CNPJ com dados da Receita Federal</p>
              </div>
            </div>
          </div>
          <Button size="sm" onClick={() => { resetForm(); setShowDialog(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Novo Cliente
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Lista de clientes */}
        {clientesFiltrados.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum cliente cadastrado</p>
              <p className="text-sm text-gray-400 mt-1">Cadastre clientes usando CNPJ para preenchimento automático</p>
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
                          <Badge variant="outline" className={`text-xs ${STATUS_COLORS[cliente.status] ?? ""}`}>
                            {cliente.status}
                          </Badge>
                        </div>
                        {cliente.nomeFantasia && (
                          <p className="text-xs text-gray-500 truncate">{cliente.razaoSocial}</p>
                        )}
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{cliente.cnpj}</p>
                        {(cliente.porte || cliente.cnaeDescricao) && (
                          <p className="text-xs text-indigo-500 mt-0.5 truncate">
                            {[cliente.porte, cliente.cnaeDescricao].filter(Boolean).join(" · ")}
                          </p>
                        )}
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
                          {cliente.cidade && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {cliente.cidade}/{cliente.estado}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="sm" variant="ghost" className="h-8 w-8 p-0 text-indigo-500"
                        title="Ver detalhes"
                        onClick={() => setClienteDetalhes(clienteDetalhes?.id === cliente.id ? null : cliente)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => abrirEdicao(cliente)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => { if (confirm("Remover este cliente?")) deleteCliente.mutate({ id: cliente.id }); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Painel de detalhes expandido */}
                  {clienteDetalhes?.id === cliente.id && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {cliente.situacaoCadastral && (
                          <div>
                            <span className="text-gray-400">Situação:</span>
                            <span className={`ml-1 font-medium ${cliente.situacaoCadastral === "ATIVA" ? "text-green-600" : "text-red-600"}`}>
                              {cliente.situacaoCadastral}
                            </span>
                          </div>
                        )}
                        {cliente.dataAbertura && (
                          <div>
                            <span className="text-gray-400">Abertura:</span>
                            <span className="ml-1 font-medium text-gray-700">{cliente.dataAbertura}</span>
                          </div>
                        )}
                        {cliente.naturezaJuridica && (
                          <div className="col-span-2">
                            <span className="text-gray-400">Natureza:</span>
                            <span className="ml-1 font-medium text-gray-700">{cliente.naturezaJuridica}</span>
                          </div>
                        )}
                        {cliente.capitalSocial && (
                          <div>
                            <span className="text-gray-400">Capital:</span>
                            <span className="ml-1 font-medium text-gray-700">{cliente.capitalSocial}</span>
                          </div>
                        )}
                        {cliente.endereco && (
                          <div className="col-span-2">
                            <span className="text-gray-400">Endereço:</span>
                            <span className="ml-1 font-medium text-gray-700">{cliente.endereco}, {cliente.cidade}/{cliente.estado} - {cliente.cep}</span>
                          </div>
                        )}
                      </div>
                      {socios.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Sócios/QSA:</p>
                          {socios.map((s: any, i: number) => (
                            <p key={i} className="text-xs text-gray-600">• {s.nome} — {s.qualificacao}</p>
                          ))}
                        </div>
                      )}
                      <Button
                        size="sm" variant="ghost" className="h-6 text-xs text-gray-400 p-0"
                        onClick={() => setClienteDetalhes(null)}
                      >
                        <X className="w-3 h-3 mr-1" /> Fechar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog: Cadastro/Edição de Cliente */}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowDialog(open); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              {editando ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Seção CNPJ — busca automática */}
            <Card className="border-indigo-100 bg-indigo-50/30">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Busca Automática por CNPJ
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">CNPJ *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="00.000.000/0000-00"
                      value={form.cnpj}
                      onChange={(e) => {
                        setForm(f => ({ ...f, cnpj: formatCNPJ(e.target.value) }));
                        setCnpjVerificado(null);
                        setDadosBuscados(null);
                      }}
                      className="flex-1 font-mono"
                      maxLength={18}
                    />
                    <Button
                      type="button"
                      onClick={handleBuscarCNPJ}
                      disabled={buscandoCNPJ || form.cnpj.replace(/\D/g, "").length !== 14}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                      size="sm"
                    >
                      {buscandoCNPJ ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Buscando...</>
                      ) : (
                        <><Search className="w-4 h-4 mr-1" /> Buscar</>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Consulta automática na Receita Federal (BrasilAPI/ReceitaWS) + IA como fallback
                  </p>
                </div>

                {/* Upload de cartão CNPJ */}
                <div>
                  <Label className="text-xs text-gray-600">Ou envie o Cartão CNPJ (imagem/PDF)</Label>
                  <div className="mt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleUploadCartao}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingCartao}
                    >
                      {uploadingCartao ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Extraindo dados com IA...</>
                      ) : (
                        <><Upload className="w-4 h-4 mr-2" /> Enviar Cartão CNPJ (IA extrai os dados)</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Feedback de verificação */}
                {cnpjVerificado && (
                  <div className={`flex items-center gap-2 text-xs p-2 rounded-md ${cnpjVerificado.existe ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                    {cnpjVerificado.existe ? (
                      <><AlertCircle className="w-4 h-4 shrink-0" /> CNPJ já cadastrado como <strong>{cnpjVerificado.cliente?.razaoSocial}</strong></>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4 shrink-0" /> CNPJ disponível para cadastro</>
                    )}
                  </div>
                )}

                {/* Fonte dos dados */}
                {dadosBuscados && (
                  <div className="flex items-center gap-2 text-xs p-2 rounded-md bg-green-50 border border-green-200">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span className={FONTE_LABELS[(dadosBuscados as any).fonte]?.color ?? "text-gray-600"}>
                      Dados obtidos via {FONTE_LABELS[(dadosBuscados as any).fonte]?.label ?? "API"}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dados principais */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Razão Social *</Label>
                <Input
                  value={form.razaoSocial}
                  onChange={(e) => setForm(f => ({ ...f, razaoSocial: e.target.value }))}
                  placeholder="Nome empresarial completo"
                />
              </div>
              <div className="col-span-2">
                <Label>Nome Fantasia</Label>
                <Input
                  value={form.nomeFantasia}
                  onChange={(e) => setForm(f => ({ ...f, nomeFantasia: e.target.value }))}
                  placeholder="Nome comercial (opcional)"
                />
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
                <Label>UF</Label>
                <Input maxLength={2} placeholder="SP" value={form.estado} onChange={(e) => setForm(f => ({ ...f, estado: e.target.value.toUpperCase() }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>CEP</Label>
                <Input value={form.cep} onChange={(e) => setForm(f => ({ ...f, cep: e.target.value }))} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="prospecto">Prospecto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dados da Receita Federal (expandível) */}
            <div>
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 w-full text-left py-1"
                onClick={() => setExpandirDetalhes(!expandirDetalhes)}
              >
                {expandirDetalhes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Dados da Receita Federal
                {(form.porte || form.situacaoCadastral) && (
                  <Badge variant="outline" className="ml-auto text-xs bg-green-50 text-green-700 border-green-200">
                    Preenchido
                  </Badge>
                )}
              </button>
              {expandirDetalhes && (
                <div className="mt-2 space-y-3 pl-2 border-l-2 border-indigo-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Porte</Label>
                      <Input value={form.porte} onChange={(e) => setForm(f => ({ ...f, porte: e.target.value }))} placeholder="MEI, ME, EPP, Grande..." className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Situação Cadastral</Label>
                      <Input value={form.situacaoCadastral} onChange={(e) => setForm(f => ({ ...f, situacaoCadastral: e.target.value }))} placeholder="ATIVA, SUSPENSA..." className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Data de Abertura</Label>
                      <Input value={form.dataAbertura} onChange={(e) => setForm(f => ({ ...f, dataAbertura: e.target.value }))} className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Capital Social</Label>
                      <Input value={form.capitalSocial} onChange={(e) => setForm(f => ({ ...f, capitalSocial: e.target.value }))} className="text-sm" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Natureza Jurídica</Label>
                      <Input value={form.naturezaJuridica} onChange={(e) => setForm(f => ({ ...f, naturezaJuridica: e.target.value }))} className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">CNAE Principal</Label>
                      <Input value={form.cnaePrincipal} onChange={(e) => setForm(f => ({ ...f, cnaePrincipal: e.target.value }))} className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Descrição CNAE</Label>
                      <Input value={form.cnaeDescricao} onChange={(e) => setForm(f => ({ ...f, cnaeDescricao: e.target.value }))} className="text-sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Contato Principal */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Contato Principal</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Nome</Label>
                  <Input value={form.contatoNome} onChange={(e) => setForm(f => ({ ...f, contatoNome: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">E-mail</Label>
                  <Input type="email" value={form.contatoEmail} onChange={(e) => setForm(f => ({ ...f, contatoEmail: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">Telefone</Label>
                  <Input value={form.contatoTelefone} onChange={(e) => setForm(f => ({ ...f, contatoTelefone: e.target.value }))} />
                </div>
              </div>
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

            <div>
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowDialog(false); }}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={createCliente.isPending || updateCliente.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {(createCliente.isPending || updateCliente.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editando ? "Salvar Alterações" : "Cadastrar Cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
