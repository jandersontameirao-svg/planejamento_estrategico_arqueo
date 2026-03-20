/**
 * ContratoZipDetalhe.tsx — Detalhe do Contrato (ZIP v1.0.0)
 * Rota: /gestao-contratos/:id
 * Abas: Visão Geral | Marcos Financeiros | Aditivos | Riscos | Documentos | Responsáveis
 */
import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft, FileText, DollarSign, AlertTriangle, Paperclip, Users,
  Loader2, Plus, Pencil, Trash2, CheckCircle2, Clock, XCircle,
  Calendar, Building2, Mail, Phone, Sparkles, Shield, Hash,
  ChevronRight, Eye, Download, Upload, UserCheck,
} from "lucide-react";

function formatDate(v: unknown) {
  if (!v) return "—";
  try { return new Date(v as string).toLocaleDateString("pt-BR"); } catch { return String(v); }
}
function formatCurrency(v: unknown) {
  if (!v) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    parseFloat(String(v))
  );
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "Ativo", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  completed: { label: "Concluído", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  cancelled: { label: "Cancelado", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};
const MILESTONE_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  paid: { label: "Pago", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  overdue: { label: "Vencido", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  cancelled: { label: "Cancelado", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};
const RISK_SEVERITY: Record<string, string> = {
  baixa: "bg-green-500/20 text-green-400 border-green-500/30",
  media: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  alta: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  critica: "bg-red-500/20 text-red-400 border-red-500/30",
};
const RISK_STATUS: Record<string, string> = {
  aberto: "bg-red-500/20 text-red-400 border-red-500/30",
  mitigado: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  aceito: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  fechado: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

type Tab = "overview" | "milestones" | "amendments" | "risks" | "documents" | "responsibles" | "boletins";

export default function ContratoZipDetalhe() {
  const [, params] = useRoute("/gestao-contratos/:id");
  const [, navigate] = useLocation();
  const contractId = Number(params?.id);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Modals
  const [showSignModal, setShowSignModal] = useState(false);
  const [signDate, setSignDate] = useState(new Date().toISOString().split("T")[0]);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [milestoneForm, setMilestoneForm] = useState({ description: "", valorPrevisto: "", dueDate: "", conditionText: "" });
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [amendmentForm, setAmendmentForm] = useState({ title: "", description: "", tipo: "escopo" as "financeiro" | "escopo", additionalValue: "0", startDate: "", endDate: "" });
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [riskForm, setRiskForm] = useState({ tipo: "operacional" as any, descricao: "", severidade: "media" as any, acoesMitigacao: "", responsavel: "" });
  const [generatingMitigation, setGeneratingMitigation] = useState(false);

  const utils = trpc.useUtils();

  // Queries
  const { data: contract, isLoading } = trpc.contractsModule.getById.useQuery(
    { id: contractId },
    { enabled: !!contractId }
  );
  const { data: milestones = [] } = trpc.contractMilestones.list.useQuery(
    { contractId },
    { enabled: !!contractId }
  );
  const { data: amendments = [] } = trpc.contractAmendments.list.useQuery(
    { contractId },
    { enabled: !!contractId }
  );
  const { data: risks = [] } = trpc.contractRisks.list.useQuery(
    { contractId },
    { enabled: !!contractId }
  );
  const { data: documents = [] } = trpc.contractDocuments.list.useQuery(
    { contractId },
    { enabled: !!contractId }
  );
  const { data: approvers = [] } = trpc.contractApprovers.list.useQuery(
    { contractId },
    { enabled: !!contractId }
  );
  const { data: responsibles = [] } = trpc.contractResponsible.list.useQuery(
    { contractId },
    { enabled: !!contractId }
  );
  const { data: boletins = [] } = trpc.boletins.list.useQuery(
    { contratoId: contractId },
    { enabled: !!contractId }
  );

  // Mutations
  const signMut = trpc.contractsModule.sign.useMutation({
    onSuccess: (d) => {
      utils.contractsModule.getById.invalidate({ id: contractId });
      toast.success(`Contrato assinado! Número: ${d.businessNumber}`);
      setShowSignModal(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const createMilestoneMut = trpc.contractMilestones.create.useMutation({
    onSuccess: () => { utils.contractMilestones.list.invalidate({ contractId }); toast.success("Marco criado!"); setShowMilestoneModal(false); },
    onError: (e) => toast.error(e.message),
  });
  const updateMilestoneMut = trpc.contractMilestones.update.useMutation({
    onSuccess: () => { utils.contractMilestones.list.invalidate({ contractId }); toast.success("Marco atualizado!"); setShowMilestoneModal(false); setEditingMilestone(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMilestoneMut = trpc.contractMilestones.delete.useMutation({
    onSuccess: () => { utils.contractMilestones.list.invalidate({ contractId }); toast.success("Marco removido."); },
    onError: (e) => toast.error(e.message),
  });
  const createAmendmentMut = trpc.contractAmendments.create.useMutation({
    onSuccess: () => { utils.contractAmendments.list.invalidate({ contractId }); toast.success("Aditivo criado!"); setShowAmendmentModal(false); },
    onError: (e) => toast.error(e.message),
  });
  const deleteAmendmentMut = trpc.contractAmendments.delete.useMutation({
    onSuccess: () => { utils.contractAmendments.list.invalidate({ contractId }); toast.success("Aditivo removido."); },
    onError: (e) => toast.error(e.message),
  });
  const createRiskMut = trpc.contractRisks.create.useMutation({
    onSuccess: () => { utils.contractRisks.list.invalidate({ contractId }); toast.success("Risco cadastrado!"); setShowRiskModal(false); },
    onError: (e) => toast.error(e.message),
  });
  const deleteRiskMut = trpc.contractRisks.delete.useMutation({
    onSuccess: () => { utils.contractRisks.list.invalidate({ contractId }); toast.success("Risco removido."); },
    onError: (e) => toast.error(e.message),
  });
  const generateMitigationMut = trpc.contractRisks.generateMitigation.useMutation();
  const deleteDocMut = trpc.contractDocuments.delete.useMutation({
    onSuccess: () => { utils.contractDocuments.list.invalidate({ contractId }); toast.success("Documento removido."); },
    onError: (e) => toast.error(e.message),
  });
  const createBoletimMut = trpc.boletins.createFromMarco.useMutation({
    onSuccess: () => { utils.boletins.list.invalidate({ contratoId: contractId }); toast.success("Boletim de medição gerado!"); setActiveTab("boletins"); },
    onError: (e) => toast.error(e.message),
  });
  const enviarBoletimMut = trpc.boletins.enviarParaAprovacao.useMutation({
    onSuccess: () => { utils.boletins.list.invalidate({ contratoId: contractId }); toast.success("Boletim enviado para aprovação!"); },
    onError: (e) => toast.error(e.message),
  });
  const marcarPagoMut = trpc.boletins.marcarComoPago.useMutation({
    onSuccess: () => { utils.boletins.list.invalidate({ contratoId: contractId }); toast.success("Boletim marcado como pago!"); },
    onError: (e) => toast.error(e.message),
  });
  const updateAprovadorMut = trpc.boletins.updateAprovador.useMutation({
    onError: (e) => toast.error(e.message),
  });

  async function handleGenerateMitigation() {
    if (!riskForm.descricao) { toast.error("Preencha a descrição do risco primeiro."); return; }
    setGeneratingMitigation(true);
    try {
      const result = await generateMitigationMut.mutateAsync({
        tipo: riskForm.tipo,
        descricao: riskForm.descricao,
        severidade: riskForm.severidade,
      });
      setRiskForm((f) => ({
        ...f,
        acoesMitigacao: `EVITAR: ${result.evitar}\n\nPROTEGER: ${result.proteger}\n\nMITIGAR: ${result.mitigar}`,
      }));
      toast.success("Ações de mitigação geradas!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGeneratingMitigation(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "overview", label: "Visão Geral", icon: <FileText className="h-4 w-4" /> },
    { id: "milestones", label: "Marcos Financeiros", icon: <DollarSign className="h-4 w-4" />, count: milestones.length },
    { id: "amendments", label: "Aditivos", icon: <ChevronRight className="h-4 w-4" />, count: amendments.length },
    { id: "risks", label: "Riscos", icon: <AlertTriangle className="h-4 w-4" />, count: risks.length },
    { id: "documents", label: "Documentos", icon: <Paperclip className="h-4 w-4" />, count: documents.length },
    { id: "responsibles", label: "Responsáveis", icon: <Users className="h-4 w-4" />, count: approvers.length + responsibles.length },
    { id: "boletins", label: "Boletins", icon: <FileText className="h-4 w-4" />, count: boletins.length },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }
  if (!contract) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">Contrato não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/gestao-contratos")}>
          Voltar
        </Button>
      </div>
    );
  }

  const st = STATUS_MAP[contract.status ?? "active"] ?? STATUS_MAP.active;

  return (
    <div className="container py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/gestao-contratos")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-bold">{contract.title}</h1>
              <Badge className={`text-xs border ${st.color}`}>{st.label}</Badge>
              {contract.isSigned ? (
                <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                  <Hash className="h-3 w-3 mr-1" />{contract.businessNumber}
                </Badge>
              ) : (
                <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  Não assinado
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {contract.clientName && <span>{contract.clientName} • </span>}
              {formatDate(contract.startDate)} — {formatDate(contract.endDate)}
              {contract.totalValue && (
                <span className="text-emerald-400 font-medium"> • {formatCurrency(contract.totalValue)}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!contract.isSigned && (
            <Button
              size="sm"
              onClick={() => setShowSignModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Assinar
            </Button>
          )}
          {contract.pdfUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={contract.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 h-4 w-4" /> Ver PDF
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1 text-xs bg-muted rounded-full px-1.5 py-0.5">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Visão Geral */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Informações do Contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {contract.description && (
                <div>
                  <p className="text-xs text-muted-foreground">Descrição</p>
                  <p>{contract.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Valor Total</p>
                  <p className="font-semibold text-emerald-400">{formatCurrency(contract.totalValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={`text-xs border ${st.color}`}>{st.label}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Início</p>
                  <p>{formatDate(contract.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Término</p>
                  <p>{formatDate(contract.endDate)}</p>
                </div>
                {contract.signedDate && (
                  <div>
                    <p className="text-xs text-muted-foreground">Data de Assinatura</p>
                    <p>{formatDate(contract.signedDate)}</p>
                  </div>
                )}
                {contract.businessNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground">Número do Negócio</p>
                    <p className="font-mono text-purple-400">{contract.businessNumber}</p>
                  </div>
                )}
              </div>
              {contract.observations && (
                <div>
                  <p className="text-xs text-muted-foreground">Observações</p>
                  <p className="text-sm">{contract.observations}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Cliente & Gestores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {contract.clientName && (
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="font-medium">{contract.clientName}</p>
                  {contract.clientTaxId && <p className="text-xs text-muted-foreground">{contract.clientTaxId}</p>}
                  {contract.clientEmail && (
                    <p className="text-xs flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-3 w-3" /> {contract.clientEmail}
                    </p>
                  )}
                  {contract.clientTelefone && (
                    <p className="text-xs flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3" /> {contract.clientTelefone}
                    </p>
                  )}
                </div>
              )}
              {contract.managerName && (
                <div>
                  <p className="text-xs text-muted-foreground">Gestor do Contrato</p>
                  <p className="font-medium">{contract.managerName}</p>
                  {contract.managerEmail && (
                    <p className="text-xs text-muted-foreground">{contract.managerEmail}</p>
                  )}
                </div>
              )}
              {contract.approverName && (
                <div>
                  <p className="text-xs text-muted-foreground">Aprovador</p>
                  <p className="font-medium">{contract.approverName}</p>
                  {contract.approverEmail && (
                    <p className="text-xs text-muted-foreground">{contract.approverEmail}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo financeiro */}
          <Card className="border border-white/10 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Marcos Financeiros</p>
                  <p className="text-xl font-bold">{milestones.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Previsto</p>
                  <p className="text-xl font-bold text-emerald-400">
                    {formatCurrency(milestones.reduce((s: number, m: any) => s + parseFloat(m.valorPrevisto || "0"), 0))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Pago</p>
                  <p className="text-xl font-bold text-blue-400">
                    {formatCurrency(milestones.reduce((s: number, m: any) => s + parseFloat(m.valorPago || "0"), 0))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Aditivos</p>
                  <p className="text-xl font-bold">{amendments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Marcos Financeiros */}
      {activeTab === "milestones" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Marcos Financeiros ({milestones.length})
            </h2>
            <Button
              size="sm"
              onClick={() => { setEditingMilestone(null); setMilestoneForm({ description: "", valorPrevisto: "", dueDate: "", conditionText: "" }); setShowMilestoneModal(true); }}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Marco
            </Button>
          </div>
          {milestones.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Nenhum marco financeiro cadastrado.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {(milestones as any[]).map((m) => {
                const ms = MILESTONE_STATUS[m.status] ?? MILESTONE_STATUS.pending;
                return (
                  <Card key={m.id} className="border border-white/10 hover:border-orange-500/20 transition-all group">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">{m.description}</p>
                            <Badge className={`text-xs border ${ms.color} shrink-0`}>{ms.label}</Badge>
                            {m.origin === "ai" && (
                              <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30 shrink-0">
                                <Sparkles className="h-2.5 w-2.5 mr-1" /> IA
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span className="text-emerald-400 font-medium">{formatCurrency(m.valorPrevisto)}</span>
                            {m.valorPago && parseFloat(m.valorPago) > 0 && (
                              <span className="text-blue-400">Pago: {formatCurrency(m.valorPago)}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {formatDate(m.dueDate)}
                            </span>
                          </div>
                          {m.conditionText && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">{m.conditionText}</p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditingMilestone(m);
                              setMilestoneForm({
                                description: m.description,
                                valorPrevisto: m.valorPrevisto,
                                dueDate: m.dueDate ? new Date(m.dueDate).toISOString().split("T")[0] : "",
                                conditionText: m.conditionText || "",
                              });
                              setShowMilestoneModal(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-blue-400"
                            title="Gerar Boletim de Medição"
                            onClick={() => createBoletimMut.mutate({ marcoId: m.id, contratoId: contractId })}
                            disabled={createBoletimMut.isPending}
                          >
                            {createBoletimMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400"
                            onClick={() => deleteMilestoneMut.mutate({ id: m.id })}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Aditivos */}
      {activeTab === "amendments" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Aditivos Contratuais ({amendments.length})
            </h2>
            <Button
              size="sm"
              onClick={() => navigate(`/gestao-contratos/${contractId}/aditivo/novo`)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Aditivo com IA
            </Button>
          </div>
          {amendments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Nenhum aditivo cadastrado.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {(amendments as any[]).map((a) => (
                <Card key={a.id} className="border border-white/10 hover:border-orange-500/20 transition-all group">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{a.title}</p>
                          <Badge className={`text-xs border ${a.tipo === "financeiro" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>
                            {a.tipo === "financeiro" ? "Financeiro" : "Escopo"}
                          </Badge>
                          {a.businessNumber && !a.businessNumber.startsWith("TEMP") && (
                            <span className="text-xs font-mono text-purple-400">#{a.businessNumber}</span>
                          )}
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          {parseFloat(a.additionalValue || "0") !== 0 && (
                            <span className={parseFloat(a.additionalValue) >= 0 ? "text-emerald-400" : "text-red-400"}>
                              {parseFloat(a.additionalValue) >= 0 ? "+" : ""}{formatCurrency(a.additionalValue)}
                            </span>
                          )}
                          <span>{formatDate(a.startDate)}</span>
                          {a.endDate && <span>até {formatDate(a.endDate)}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400"
                          onClick={() => deleteAmendmentMut.mutate({ id: a.id })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Riscos */}
      {activeTab === "risks" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Riscos ({risks.length})
            </h2>
            <Button
              size="sm"
              onClick={() => { setRiskForm({ tipo: "operacional", descricao: "", severidade: "media", acoesMitigacao: "", responsavel: "" }); setShowRiskModal(true); }}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Risco
            </Button>
          </div>
          {risks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Nenhum risco cadastrado.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {(risks as any[]).map((r) => (
                <Card key={r.id} className="border border-white/10 hover:border-orange-500/20 transition-all group">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={`text-xs border ${RISK_SEVERITY[r.severidade] ?? ""} capitalize`}>
                            {r.severidade}
                          </Badge>
                          <Badge className={`text-xs border ${RISK_STATUS[r.status] ?? ""} capitalize`}>
                            {r.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize">{r.tipo}</span>
                          {r.origin === "ai" && (
                            <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                              <Sparkles className="h-2.5 w-2.5 mr-1" /> IA
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{r.descricao}</p>
                        {r.acoesMitigacao && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.acoesMitigacao}</p>
                        )}
                        {r.responsavel && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <UserCheck className="h-3 w-3 inline mr-1" />{r.responsavel}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400"
                          onClick={() => deleteRiskMut.mutate({ id: r.id })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Documentos */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Documentos ({documents.length})
            </h2>
          </div>
          {documents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Nenhum documento anexado.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {(documents as any[]).map((d) => (
                <Card key={d.id} className="border border-white/10 group">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{d.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {d.mimeType} • {d.size ? `${Math.round(d.size / 1024)} KB` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                          <a href={d.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400"
                          onClick={() => deleteDocMut.mutate({ id: d.id })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Responsáveis */}
      {activeTab === "responsibles" && (
        <div className="space-y-6">
          {/* Aprovadores */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Aprovadores do Cliente ({approvers.length})
            </h3>
            {approvers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum aprovador cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {(approvers as any[]).map((a) => (
                  <Card key={a.id} className="border border-white/10">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{a.name}</p>
                          <p className="text-xs text-muted-foreground">{a.email}</p>
                          {a.role && <p className="text-xs text-muted-foreground">{a.role}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Responsáveis internos */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Responsáveis Internos ({responsibles.length})
            </h3>
            {responsibles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum responsável interno cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {(responsibles as any[]).map((r) => (
                  <Card key={r.id} className="border border-white/10">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.email}</p>
                          {r.role && <p className="text-xs text-muted-foreground">{r.role}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Assinar Contrato */}
      <Dialog open={showSignModal} onOpenChange={setShowSignModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assinar Contrato</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Ao assinar, será gerado um número de negócio único para este contrato. Esta ação não pode ser desfeita.
            </p>
            <div>
              <Label>Data de Assinatura</Label>
              <Input type="date" value={signDate} onChange={(e) => setSignDate(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSignModal(false)}>Cancelar</Button>
              <Button
                onClick={() => signMut.mutate({ contractId, signedDate: new Date(signDate) })}
                disabled={signMut.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {signMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Confirmar Assinatura
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Marco Financeiro */}
      <Dialog open={showMilestoneModal} onOpenChange={setShowMilestoneModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMilestone ? "Editar Marco" : "Novo Marco Financeiro"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingMilestone) {
                updateMilestoneMut.mutate({
                  id: editingMilestone.id,
                  description: milestoneForm.description,
                  valorPrevisto: milestoneForm.valorPrevisto,
                  dueDate: milestoneForm.dueDate ? new Date(milestoneForm.dueDate) : undefined,
                  conditionText: milestoneForm.conditionText || undefined,
                });
              } else {
                createMilestoneMut.mutate({
                  contractId,
                  description: milestoneForm.description,
                  valorPrevisto: milestoneForm.valorPrevisto,
                  dueDate: new Date(milestoneForm.dueDate),
                  conditionText: milestoneForm.conditionText || undefined,
                });
              }
            }}
            className="space-y-4 py-2"
          >
            <div>
              <Label>Descrição *</Label>
              <Input value={milestoneForm.description} onChange={(e) => setMilestoneForm((f) => ({ ...f, description: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valor Previsto (R$) *</Label>
                <Input type="number" step="0.01" value={milestoneForm.valorPrevisto} onChange={(e) => setMilestoneForm((f) => ({ ...f, valorPrevisto: e.target.value }))} required />
              </div>
              <div>
                <Label>Data de Vencimento *</Label>
                <Input type="date" value={milestoneForm.dueDate} onChange={(e) => setMilestoneForm((f) => ({ ...f, dueDate: e.target.value }))} required />
              </div>
            </div>
            <div>
              <Label>Condição de Pagamento</Label>
              <Textarea value={milestoneForm.conditionText} onChange={(e) => setMilestoneForm((f) => ({ ...f, conditionText: e.target.value }))} rows={2} placeholder="Ex: Após entrega e aprovação do relatório" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setShowMilestoneModal(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMilestoneMut.isPending || updateMilestoneMut.isPending} className="bg-orange-500 hover:bg-orange-600 text-white">
                {(createMilestoneMut.isPending || updateMilestoneMut.isPending) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingMilestone ? "Salvar" : "Criar Marco"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Aditivo */}
      <Dialog open={showAmendmentModal} onOpenChange={setShowAmendmentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Aditivo Contratual</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createAmendmentMut.mutate({
                contractId,
                title: amendmentForm.title,
                description: amendmentForm.description,
                tipo: amendmentForm.tipo,
                additionalValue: amendmentForm.additionalValue,
                startDate: new Date(amendmentForm.startDate),
                endDate: amendmentForm.endDate ? new Date(amendmentForm.endDate) : undefined,
              });
            }}
            className="space-y-4 py-2"
          >
            <div>
              <Label>Título *</Label>
              <Input value={amendmentForm.title} onChange={(e) => setAmendmentForm((f) => ({ ...f, title: e.target.value }))} required placeholder="Ex: 1º Aditivo — Acréscimo de Escopo" />
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select value={amendmentForm.tipo} onValueChange={(v) => setAmendmentForm((f) => ({ ...f, tipo: v as "financeiro" | "escopo" }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financeiro">Financeiro (altera valores)</SelectItem>
                  <SelectItem value="escopo">Escopo (altera prazo/especificações)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={amendmentForm.description} onChange={(e) => setAmendmentForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valor Adicional (R$)</Label>
                <Input type="number" step="0.01" value={amendmentForm.additionalValue} onChange={(e) => setAmendmentForm((f) => ({ ...f, additionalValue: e.target.value }))} />
              </div>
              <div>
                <Label>Data de Início *</Label>
                <Input type="date" value={amendmentForm.startDate} onChange={(e) => setAmendmentForm((f) => ({ ...f, startDate: e.target.value }))} required />
              </div>
              <div className="col-span-2">
                <Label>Nova Data de Término</Label>
                <Input type="date" value={amendmentForm.endDate} onChange={(e) => setAmendmentForm((f) => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setShowAmendmentModal(false)}>Cancelar</Button>
              <Button type="submit" disabled={createAmendmentMut.isPending} className="bg-orange-500 hover:bg-orange-600 text-white">
                {createAmendmentMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Criar Aditivo
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Risco */}
      <Dialog open={showRiskModal} onOpenChange={setShowRiskModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Risco Contratual</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createRiskMut.mutate({
                contractId,
                tipo: riskForm.tipo,
                descricao: riskForm.descricao,
                severidade: riskForm.severidade,
                acoesMitigacao: riskForm.acoesMitigacao || undefined,
                responsavel: riskForm.responsavel || undefined,
              });
            }}
            className="space-y-4 py-2"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo *</Label>
                <Select value={riskForm.tipo} onValueChange={(v) => setRiskForm((f) => ({ ...f, tipo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="prazo">Prazo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severidade *</Label>
                <Select value={riskForm.severidade} onValueChange={(v) => setRiskForm((f) => ({ ...f, severidade: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Descrição *</Label>
              <Textarea value={riskForm.descricao} onChange={(e) => setRiskForm((f) => ({ ...f, descricao: e.target.value }))} rows={2} required />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Ações de Mitigação</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-purple-400 hover:text-purple-300"
                  onClick={handleGenerateMitigation}
                  disabled={generatingMitigation}
                >
                  {generatingMitigation ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3" />}
                  Gerar com IA
                </Button>
              </div>
              <Textarea value={riskForm.acoesMitigacao} onChange={(e) => setRiskForm((f) => ({ ...f, acoesMitigacao: e.target.value }))} rows={3} placeholder="Descreva as ações para mitigar este risco" />
            </div>
            <div>
              <Label>Responsável</Label>
              <Input value={riskForm.responsavel} onChange={(e) => setRiskForm((f) => ({ ...f, responsavel: e.target.value }))} placeholder="Nome do responsável" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setShowRiskModal(false)}>Cancelar</Button>
              <Button type="submit" disabled={createRiskMut.isPending} className="bg-orange-500 hover:bg-orange-600 text-white">
                {createRiskMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Cadastrar Risco
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tab: Boletins de Medição */}
      {activeTab === "boletins" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Boletins de Medição ({boletins.length})
            </h2>
            <p className="text-xs text-muted-foreground">Gerados automaticamente a partir dos marcos financeiros</p>
          </div>
          {boletins.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>Nenhum boletim gerado ainda.</p>
                <p className="text-xs mt-1">Clique no ícone <FileText className="inline h-3 w-3" /> em um marco financeiro para gerar o boletim.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {(boletins as any[]).map((b) => {
                const statusColors: Record<string, string> = {
                  pendente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                  enviado: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                  aprovado: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                  reprovado: "bg-red-500/20 text-red-400 border-red-500/30",
                  pago: "bg-purple-500/20 text-purple-400 border-purple-500/30",
                };
                const sc = statusColors[b.status] ?? statusColors.pendente;
                const statusLabels: Record<string, string> = {
                  pendente: "Pendente",
                  enviado: "Aguardando Aprovação",
                  aprovado: "Aprovado",
                  reprovado: "Reprovado",
                  pago: "Pago",
                };
                return (
                  <Card key={b.id} className="border border-white/10 hover:border-orange-500/20 transition-all group">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">{b.numero}</p>
                            <Badge className={`text-xs border ${sc} shrink-0`}>{statusLabels[b.status] ?? b.status}</Badge>
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            {b.valorBruto && <span className="text-emerald-400 font-medium">{formatCurrency(b.valorBruto)}</span>}
                            {b.dataEmissao && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(b.dataEmissao)}</span>}
                            {b.aprovadorNome && <span className="flex items-center gap-1"><UserCheck className="h-3 w-3" /> {b.aprovadorNome}</span>}
                          </div>
                          {b.observacoes && <p className="text-xs text-muted-foreground mt-1 truncate">{b.observacoes}</p>}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {b.status === "pendente" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-blue-400 hover:text-blue-300"
                              onClick={async () => {
                                const email = prompt("E-mail do aprovador:");
                                const nome = prompt("Nome do aprovador:");
                                if (email && nome) {
                                  await updateAprovadorMut.mutateAsync({ id: b.id, aprovadorEmail: email, aprovadorNome: nome });
                                  enviarBoletimMut.mutate({ id: b.id });
                                }
                              }}
                              disabled={enviarBoletimMut.isPending || updateAprovadorMut.isPending}
                            >
                              <Mail className="h-3 w-3 mr-1" /> Enviar
                            </Button>
                          )}
                          {b.status === "aprovado" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-emerald-400 hover:text-emerald-300"
                              onClick={() => marcarPagoMut.mutate({ id: b.id })}
                              disabled={marcarPagoMut.isPending}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Marcar Pago
                            </Button>
                          )}
                          {b.linkAprovacao && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => window.open(b.linkAprovacao, "_blank")}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
