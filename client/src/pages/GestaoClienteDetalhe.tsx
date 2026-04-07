import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SGCBanner } from "@/components/SGCBanner";
import {
  ArrowLeft, Building2, MapPin, Phone, Mail, Briefcase,
  Hash, Loader2, Users, FileText, Eye, CheckCircle2, XCircle, Clock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function formatDate(v: unknown) {
  if (!v) return "—";
  try { return new Date(String(v)).toLocaleDateString("pt-BR"); } catch { return String(v); }
}

function formatCurrency(v: unknown) {
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

const STATUS_MAP: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  ativo:      { label: "Ativo",      icon: CheckCircle2, className: "bg-green-100 text-green-800 border-green-200" },
  encerrado:  { label: "Encerrado",  icon: CheckCircle2, className: "bg-gray-100 text-gray-800 border-gray-200" },
  rescindido: { label: "Rescindido", icon: XCircle,      className: "bg-red-100 text-red-800 border-red-200" },
  suspenso:   { label: "Suspenso",   icon: XCircle,      className: "bg-orange-100 text-orange-800 border-orange-200" },
  rascunho:   { label: "Rascunho",   icon: Clock,        className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
};

function ContractStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? { label: status, icon: Clock, className: "bg-gray-100 text-gray-800 border-gray-200" };
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

  const { data: client, isLoading } = trpc.contratos.clientes.get.useQuery(
    { id: clientId },
    { enabled: !!clientId }
  );

  const { data: contratos, isLoading: contratosLoading } = trpc.contratos.contratos.listByCliente.useQuery(
    { clienteId: clientId },
    { enabled: !!clientId }
  );

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

  const activeContratos = contratos?.filter((c) => c.status === "ativo").length ?? 0;
  const totalValue = contratos?.reduce((sum, c) => sum + parseFloat(String(c.valorTotal || 0)), 0) ?? 0;

  return (
    <div className="container py-8 max-w-5xl">
      <SGCBanner
        message="Os dados deste cliente são gerenciados pelo SGC. Esta é uma visualização somente leitura."
        sgcUrl={`${import.meta.env.VITE_SGC_PUBLIC_APP_URL || ''}/gestao-clientes/${client.id}`}
      />
      <div className="mt-4" />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/gestao-clientes")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Clientes
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium truncate">{client.razaoSocial}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {client.logoUrl ? (
            <img src={client.logoUrl} alt={client.razaoSocial} className="w-16 h-16 rounded-lg object-contain border" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{client.razaoSocial}</h1>
            {client.nomeFantasia && <p className="text-muted-foreground">{client.nomeFantasia}</p>}
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm text-muted-foreground">{client.cnpj}</span>
              <Badge
                variant={client.status === "ativo" ? "default" : client.status === "prospecto" ? "outline" : "secondary"}
                className="text-xs"
              >
                {client.status === "ativo" ? "Ativo" : client.status === "prospecto" ? "Prospecto" : "Inativo"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dados">Dados Cadastrais</TabsTrigger>
          <TabsTrigger value="contratos">
            Contratos
            {(contratos?.length ?? 0) > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">
                {contratos?.length}
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
                {client.endereco ? (
                  <p className="text-sm">{client.endereco}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Endereço não informado</p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="CEP" value={client.cep} />
                  <InfoRow label="Cidade" value={client.cidade} />
                  <InfoRow label="Estado" value={client.estado} />
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
                {client.contatoNome && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{client.contatoNome}</span>
                  </div>
                )}
                {!client.telefone && !client.email && !client.contatoNome && (
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
                <InfoRow label="CNAE" value={client.cnaeDescricao} />
                <InfoRow label="Data de Abertura" value={client.dataAbertura || undefined} />
                <InfoRow label="Porte" value={client.porte} />
                <InfoRow label="Capital Social" value={client.capitalSocial} />
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
                <InfoRow label="CNPJ" value={client.cnpj} />
                <InfoRow label="Cadastrado em" value={formatDate(client.createdAt)} />
                <InfoRow label="Atualizado em" value={formatDate(client.updatedAt)} />
                {client.observacoes && (
                  <div className="col-span-2">
                    <InfoRow label="Observações" value={client.observacoes} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Contratos ── */}
        <TabsContent value="contratos">
          {(contratos?.length ?? 0) > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-green-700 uppercase tracking-wide font-medium">Contratos Ativos</p>
                  <p className="text-2xl font-bold text-green-800">{activeContratos}</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-blue-700 uppercase tracking-wide font-medium">Total de Contratos</p>
                  <p className="text-2xl font-bold text-blue-800">{contratos?.length ?? 0}</p>
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
            <h3 className="text-base font-semibold">Contratos de {client.razaoSocial}</h3>
          </div>

          {contratosLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !contratos || contratos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-base font-semibold mb-1">Nenhum contrato disponível</h3>
                <p className="text-sm text-muted-foreground">
                  Os contratos são gerenciados pelo SGC. Aguardando sincronização de dados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {contratos.map((contrato) => (
                <Card
                  key={contrato.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/contratos/${contrato.id}`)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm truncate">{contrato.titulo}</span>
                            {contrato.numero && (
                              <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {contrato.numero}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <ContractStatusBadge status={contrato.status} />
                            <span className="text-xs text-muted-foreground">
                              Início: {formatDate(contrato.dataInicio)}
                            </span>
                            {contrato.dataFim && (
                              <span className="text-xs text-muted-foreground">
                                Fim: {formatDate(contrato.dataFim)}
                              </span>
                            )}
                          </div>
                          {contrato.descricao && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {contrato.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {formatCurrency(contrato.valorTotal)}
                        </span>
                        <Button
                          variant="ghost" size="sm" className="h-7 text-xs"
                          onClick={(e) => { e.stopPropagation(); navigate(`/contratos/${contrato.id}`); }}
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
    </div>
  );
}
