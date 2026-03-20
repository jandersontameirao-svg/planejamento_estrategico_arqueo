import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, Building2, MapPin, Phone, Mail, Briefcase,
  Hash, Loader2, Pencil, Trash2, Users, FileText,
  Plus, Eye, CheckCircle2, XCircle, Clock,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function formatDate(v: any) {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString("pt-BR"); } catch { return String(v); }
}

function formatCurrency(v: any) {
  if (v == null || v === "") return "—";
  const num = typeof v === "string" ? parseFloat(v) : Number(v);
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function ContractStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: any; className: string }> = {
    active:    { label: "Ativo",     icon: CheckCircle2, className: "bg-green-100 text-green-800 border-green-200" },
    completed: { label: "Concluído", icon: CheckCircle2, className: "bg-blue-100 text-blue-800 border-blue-200" },
    cancelled: { label: "Cancelado", icon: XCircle,      className: "bg-red-100 text-red-800 border-red-200" },
  };
  const cfg = map[status] ?? { label: status, icon: Clock, className: "bg-gray-100 text-gray-800 border-gray-200" };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

export default function GestaoClienteDetalhe() {
  const [, params] = useRoute("/gestao-clientes/:id");
  const [, navigate] = useLocation();
  const clientId = Number(params?.id);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState<any>({});
  const utils = trpc.useUtils();

  const { data: client, isLoading } = trpc.clients.getById.useQuery(
    { id: clientId },
    { enabled: !!clientId }
  );

  // Contratos do cliente (módulo ZIP)
  const { data: contracts, isLoading: contractsLoading } = trpc.contractsModule.byClient.useQuery(
    { clientId },
    { enabled: !!clientId }
  );

  const updateMut = trpc.clients.update.useMutation({
    onSuccess: () => {
      utils.clients.getById.invalidate({ id: clientId });
      toast.success("Cliente atualizado!");
      setShowEdit(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = trpc.clients.delete.useMutation({
    onSuccess: () => {
      toast.success("Cliente removido.");
      navigate("/gestao-clientes");
    },
    onError: (e) => toast.error(e.message),
  });

  function handleEdit() {
    if (!client) return;
    setForm({
      name: client.name || "",
      fantasyName: client.fantasyName || "",
      taxId: client.taxId || "",
      logradouro: client.logradouro || "",
      complemento: client.complemento || "",
      bairro: client.bairro || "",
      cep: client.cep || "",
      municipio: client.municipio || "",
      uf: client.uf || "",
      telefone: client.telefone || "",
      email: client.email || "",
      contact: client.contact || "",
      atividadeEconomica: client.atividadeEconomica || "",
      naturezaJuridica: client.naturezaJuridica || "",
      dataAbertura: client.dataAbertura
        ? (typeof client.dataAbertura === "string" ? client.dataAbertura : new Date(client.dataAbertura).toISOString().split("T")[0])
        : "",
      situacaoCadastral: client.situacaoCadastral || "",
      logoUrl: client.logoUrl || "",
    });
    setShowEdit(true);
  }

  function handleDelete() {
    if (!client) return;
    if (confirm(`Tem certeza que deseja excluir "${client.name}"? Esta ação não pode ser desfeita.`)) {
      deleteMut.mutate({ id: clientId });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container py-8 text-center">
        <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Cliente não encontrado</h2>
        <Button variant="outline" onClick={() => navigate("/gestao-clientes")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Clientes
        </Button>
      </div>
    );
  }

  const endereco = [
    client.logradouro, client.complemento, client.bairro,
    client.municipio && client.uf ? `${client.municipio}/${client.uf}` : (client.municipio || client.uf),
    client.cep,
  ].filter(Boolean).join(", ");

  const activeContracts = contracts?.filter((c) => c.status === "active").length ?? 0;
  const totalValue = contracts?.reduce((sum, c) => sum + parseFloat(String(c.totalValue || 0)), 0) ?? 0;

  return (
    <div className="container py-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/gestao-clientes")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Clientes
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium truncate">{client.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {client.logoUrl ? (
            <img src={client.logoUrl} alt={client.name} className="w-16 h-16 rounded-lg object-contain border" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            {client.fantasyName && <p className="text-muted-foreground">{client.fantasyName}</p>}
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm text-muted-foreground">{client.taxId}</span>
              {client.situacaoCadastral && (
                <Badge
                  variant={client.situacaoCadastral.toLowerCase().includes("ativa") ? "default" : "secondary"}
                  className="text-xs"
                >
                  {client.situacaoCadastral}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline" size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dados">Dados Cadastrais</TabsTrigger>
          <TabsTrigger value="contratos">
            Contratos
            {(contracts?.length ?? 0) > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">
                {contracts?.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Dados Cadastrais ── */}
        <TabsContent value="dados">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {endereco ? (
                  <p className="text-sm">{endereco}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Endereço não informado</p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="CEP" value={client.cep} />
                  <InfoRow label="Município" value={client.municipio} />
                  <InfoRow label="UF" value={client.uf} />
                  <InfoRow label="Bairro" value={client.bairro} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.telefone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.telefone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${client.email}`} className="text-primary hover:underline">{client.email}</a>
                  </div>
                )}
                {client.contact && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{client.contact}</span>
                  </div>
                )}
                {!client.telefone && !client.email && !client.contact && (
                  <p className="text-sm text-muted-foreground italic">Contato não informado</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Dados Fiscais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <InfoRow label="Natureza Jurídica" value={client.naturezaJuridica} />
                <InfoRow label="Situação Cadastral" value={client.situacaoCadastral} />
                <InfoRow label="Atividade Econômica" value={client.atividadeEconomica} />
                <InfoRow label="Data de Abertura" value={client.dataAbertura ? formatDate(client.dataAbertura) : undefined} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" />
                  Informações do Cadastro
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <InfoRow label="Código" value={client.code} />
                <InfoRow label="CPF/CNPJ" value={client.taxId} />
                <InfoRow label="Cadastrado em" value={formatDate(client.createdAt)} />
                <InfoRow label="Atualizado em" value={formatDate(client.updatedAt)} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Contratos ── */}
        <TabsContent value="contratos">
          {(contracts?.length ?? 0) > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-green-700 uppercase tracking-wide font-medium">Contratos Ativos</p>
                  <p className="text-2xl font-bold text-green-800">{activeContracts}</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-blue-700 uppercase tracking-wide font-medium">Total de Contratos</p>
                  <p className="text-2xl font-bold text-blue-800">{contracts?.length ?? 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-orange-700 uppercase tracking-wide font-medium">Valor Total</p>
                  <p className="text-lg font-bold text-orange-800">{formatCurrency(totalValue)}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Contratos de {client.name}</h3>
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() =>
                navigate(
                  `/gestao-contratos/novo?clientId=${clientId}&clientName=${encodeURIComponent(client.name)}`
                )
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>
          </div>

          {contractsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !contracts || contracts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-base font-semibold mb-1">Nenhum contrato cadastrado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie o primeiro contrato para este cliente.
                </p>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() =>
                    navigate(
                      `/gestao-contratos/novo?clientId=${clientId}&clientName=${encodeURIComponent(client.name)}`
                    )
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Contrato
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {contracts.map((contract) => (
                <Card
                  key={contract.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/gestao-contratos/${contract.id}`)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm truncate">{contract.title}</span>
                            {contract.code && (
                              <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {contract.code}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <ContractStatusBadge status={contract.status} />
                            <span className="text-xs text-muted-foreground">
                              Início: {formatDate(contract.startDate)}
                            </span>
                            {contract.endDate && (
                              <span className="text-xs text-muted-foreground">
                                Fim: {formatDate(contract.endDate)}
                              </span>
                            )}
                          </div>
                          {contract.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {contract.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {formatCurrency(contract.totalValue)}
                        </span>
                        <Button
                          variant="ghost" size="sm" className="h-7 text-xs"
                          onClick={(e) => { e.stopPropagation(); navigate(`/gestao-contratos/${contract.id}`); }}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Ver detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Edição */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMut.mutate({ id: clientId, ...form });
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nome / Razão Social *</Label>
                <Input value={form.name || ""} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <Label>Nome Fantasia</Label>
                <Input value={form.fantasyName || ""} onChange={e => setForm((f: any) => ({ ...f, fantasyName: e.target.value }))} />
              </div>
              <div>
                <Label>CPF / CNPJ</Label>
                <Input value={form.taxId || ""} onChange={e => setForm((f: any) => ({ ...f, taxId: e.target.value }))} placeholder="00.000.000/0000-00" />
              </div>
              <div className="col-span-2">
                <Label>Logradouro</Label>
                <Input value={form.logradouro || ""} onChange={e => setForm((f: any) => ({ ...f, logradouro: e.target.value }))} />
              </div>
              <div>
                <Label>Complemento</Label>
                <Input value={form.complemento || ""} onChange={e => setForm((f: any) => ({ ...f, complemento: e.target.value }))} />
              </div>
              <div>
                <Label>Bairro</Label>
                <Input value={form.bairro || ""} onChange={e => setForm((f: any) => ({ ...f, bairro: e.target.value }))} />
              </div>
              <div>
                <Label>CEP</Label>
                <Input value={form.cep || ""} onChange={e => setForm((f: any) => ({ ...f, cep: e.target.value }))} placeholder="00000-000" />
              </div>
              <div>
                <Label>Município</Label>
                <Input value={form.municipio || ""} onChange={e => setForm((f: any) => ({ ...f, municipio: e.target.value }))} />
              </div>
              <div>
                <Label>UF</Label>
                <Input value={form.uf || ""} onChange={e => setForm((f: any) => ({ ...f, uf: e.target.value.toUpperCase() }))} maxLength={2} placeholder="SP" />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={form.telefone || ""} onChange={e => setForm((f: any) => ({ ...f, telefone: e.target.value }))} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email || ""} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <Label>Contato Adicional</Label>
                <Input value={form.contact || ""} onChange={e => setForm((f: any) => ({ ...f, contact: e.target.value }))} />
              </div>
              <div>
                <Label>Atividade Econômica</Label>
                <Input value={form.atividadeEconomica || ""} onChange={e => setForm((f: any) => ({ ...f, atividadeEconomica: e.target.value }))} />
              </div>
              <div>
                <Label>Natureza Jurídica</Label>
                <Input value={form.naturezaJuridica || ""} onChange={e => setForm((f: any) => ({ ...f, naturezaJuridica: e.target.value }))} />
              </div>
              <div>
                <Label>Data de Abertura</Label>
                <Input type="date" value={form.dataAbertura || ""} onChange={e => setForm((f: any) => ({ ...f, dataAbertura: e.target.value }))} />
              </div>
              <div>
                <Label>Situação Cadastral</Label>
                <Input value={form.situacaoCadastral || ""} onChange={e => setForm((f: any) => ({ ...f, situacaoCadastral: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>Cancelar</Button>
              <Button type="submit" disabled={updateMut.isPending} className="bg-orange-500 hover:bg-orange-600 text-white">
                {updateMut.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
