import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft, FileText, DollarSign, AlertTriangle, CheckCircle2,
  Clock, Plus, Upload, Brain, Shield, FileCheck, Edit2, Trash2,
  Download, Eye, Loader2, CheckSquare, Send, History, ClipboardList,
} from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-gray-100 text-gray-700" },
  em_analise: { label: "Em Análise", color: "bg-yellow-100 text-yellow-700" },
  aprovado: { label: "Aprovado", color: "bg-blue-100 text-blue-700" },
  vigente: { label: "Vigente", color: "bg-green-100 text-green-700" },
  suspenso: { label: "Suspenso", color: "bg-orange-100 text-orange-700" },
  encerrado: { label: "Encerrado", color: "bg-gray-200 text-gray-600" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

const MARCO_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-gray-100 text-gray-700" },
  em_medicao: { label: "Em Medição", color: "bg-blue-100 text-blue-700" },
  aprovado: { label: "Aprovado", color: "bg-green-100 text-green-700" },
  pago: { label: "Pago", color: "bg-emerald-100 text-emerald-700" },
  atrasado: { label: "Atrasado", color: "bg-red-100 text-red-700" },
  cancelado: { label: "Cancelado", color: "bg-gray-200 text-gray-600" },
};

const RISCO_SEV: Record<string, string> = {
  baixa: "bg-green-100 text-green-700",
  media: "bg-yellow-100 text-yellow-700",
  alta: "bg-orange-100 text-orange-700",
  critica: "bg-red-100 text-red-700",
};

function formatCurrency(val: string | null | undefined) {
  if (!val) return "—";
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(val: string | Date | null | undefined) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("pt-BR");
}

interface ContratoDetalheProps {
  empresaId: number;
  contratoId: number;
}
export default function ContratoDetalhe({ empresaId, contratoId }: ContratoDetalheProps) {
  const [, navigate] = useLocation();

  const [showMarcoDialog, setShowMarcoDialog] = useState(false);
  const [showRiscoDialog, setShowRiscoDialog] = useState(false);
  const [showRevisaoIA, setShowRevisaoIA] = useState(false);
  const [showBoletimAprovDialog, setShowBoletimAprovDialog] = useState(false);
  const [selectedBoletimId, setSelectedBoletimId] = useState<number | null>(null);
  const [dadosIA, setDadosIA] = useState<any>(null);
  const [analisandoIA, setAnalisandoIA] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [aprovForm, setAprovForm] = useState({ aprovadorNome: "", aprovadorEmail: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: contrato, refetch } = trpc.contratos.contratos.get.useQuery({ id: contratoId });
  const { data: marcos = [], refetch: refetchMarcos } = trpc.contratos.marcos.list.useQuery({ contratoId });
  const { data: riscos = [], refetch: refetchRiscos } = trpc.contratos.riscos.list.useQuery({ contratoId });
  const { data: documentos = [], refetch: refetchDocs } = trpc.contratos.documentos.list.useQuery({ contratoId });
  const { data: aditivos = [] } = trpc.contratos.aditivos.list.useQuery({ contratoId });
  const { data: boletins = [], refetch: refetchBoletins } = trpc.contratos.boletins.list.useQuery({ contratoId });
  const { data: auditoria = [] } = trpc.contratos.auditoria.porContrato.useQuery({ contratoId });

  const utils = trpc.useUtils();

  const extrairPDF = trpc.contratos.contratos.extrairPDF.useMutation();
  const confirmarExtracao = trpc.contratos.contratos.confirmarExtracao.useMutation();
  const analisarRiscosIA = trpc.contratos.riscos.analisarIA.useMutation();
  const createMarco = trpc.contratos.marcos.create.useMutation({
    onSuccess: () => { refetchMarcos(); setShowMarcoDialog(false); toast.success("Marco criado!"); },
  });
  const updateMarco = trpc.contratos.marcos.update.useMutation({
    onSuccess: () => { refetchMarcos(); toast.success("Marco atualizado!"); },
  });
  const createRisco = trpc.contratos.riscos.create.useMutation({
    onSuccess: () => { refetchRiscos(); setShowRiscoDialog(false); toast.success("Risco registrado!"); },
  });
  const updateContrato = trpc.contratos.contratos.update.useMutation({
    onSuccess: () => { refetch(); toast.success("Contrato atualizado!"); },
  });
  const enviarAprovacao = trpc.contratos.boletins.enviarAprovacao.useMutation({
    onSuccess: () => { refetchBoletins(); setShowBoletimAprovDialog(false); toast.success("Boletim enviado para aprovação!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  const updateRisco = trpc.contratos.riscos.update.useMutation({
    onSuccess: () => { refetchRiscos(); },
  });

  // Marco form state
  const [marcoForm, setMarcoForm] = useState({
    titulo: "", valorPrevisto: "", dataPrevista: "", descricao: "", ordem: 1,
  });

  // Risco form state
  const [riscoForm, setRiscoForm] = useState({
    titulo: "", descricao: "", categoria: "outro" as any,
    probabilidade: "media" as any, impacto: "medio" as any, severidade: "media" as any,
    planoMitigacao: "",
  });

  async function handlePDFUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 16 * 1024 * 1024) { toast.error("Arquivo muito grande (máx 16MB)"); return; }

    setUploadingPDF(true);
    try {
      // Upload via fetch para o endpoint de storage
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Falha no upload");
      const { url, key } = await res.json();

      // Salva URL no contrato
      await updateContrato.mutateAsync({ id: contratoId, data: { pdfUrl: url, pdfKey: key } });

      // Extrai dados com IA
      toast.info("Analisando PDF com IA...");
      const dados = await extrairPDF.mutateAsync({ pdfUrl: url, contratoId, tipo: "contrato" });
      setDadosIA(dados);
      setShowRevisaoIA(true);
    } catch (err: any) {
      toast.error("Erro ao processar PDF: " + (err.message ?? "Tente novamente"));
    } finally {
      setUploadingPDF(false);
    }
  }

  async function handleConfirmarIA() {
    if (!dadosIA) return;
    try {
      await confirmarExtracao.mutateAsync({
        contratoId,
        dadosRevisados: {
          resumoIA: dadosIA.resumo,
          dadosExtradosIA: JSON.stringify(dadosIA),
          marcos: dadosIA.marcos?.map((m: any, i: number) => ({
            titulo: m.titulo,
            valorPrevisto: m.valor ?? "0",
            dataPrevista: m.dataPrevista ?? new Date().toISOString().split("T")[0],
            descricao: m.descricao,
            ordem: i + 1,
          })),
          riscos: dadosIA.riscos?.map((r: any) => ({
            titulo: r.titulo,
            descricao: r.descricao,
            categoria: r.categoria ?? "outro",
            probabilidade: r.probabilidade ?? "media",
            impacto: r.impacto ?? "medio",
          })),
        },
      });
      toast.success("Dados confirmados e salvos!");
      setShowRevisaoIA(false);
      refetch();
      refetchMarcos();
      refetchRiscos();
    } catch (err: any) {
      toast.error("Erro ao confirmar: " + (err.message ?? "Tente novamente"));
    }
  }

  async function handleAnalisarRiscos() {
    setAnalisandoIA(true);
    try {
      const result = await analisarRiscosIA.mutateAsync({ contratoId });
      toast.success(`${(result as any).criados} riscos identificados pela IA!`);
      refetchRiscos();
    } catch (err: any) {
      toast.error("Erro na análise: " + (err.message ?? "Tente novamente"));
    } finally {
      setAnalisandoIA(false);
    }
  }

  if (!contrato) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[contrato.status] ?? { label: contrato.status, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/empresa/${empresaId}/contratos`)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Contratos
              </Button>
              <div className="h-5 w-px bg-gray-300" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono">{contrato.numero}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  {!contrato.iaRevisado && contrato.pdfUrl && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Revisão IA pendente
                    </span>
                  )}
                </div>
                <h1 className="text-lg font-semibold text-gray-900">{contrato.titulo}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {contrato.pdfUrl ? (
                <Button variant="outline" size="sm" onClick={() => window.open(contrato.pdfUrl!, "_blank")}>
                  <Eye className="w-4 h-4 mr-1" /> Ver PDF
                </Button>
              ) : (
                <>
                  <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePDFUpload} />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingPDF}>
                    {uploadingPDF ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                    {uploadingPDF ? "Processando..." : "Anexar PDF"}
                  </Button>
                </>
              )}
              <Select
                value={contrato.status}
                onValueChange={(v) => updateContrato.mutate({ id: contratoId, data: { status: v as any } })}
              >
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resumo IA */}
          {contrato.resumoIA && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800 flex items-start gap-2">
              <Brain className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
              <p>{contrato.resumoIA}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* KPIs do contrato */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-gray-500">Valor Total</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(contrato.valorTotal)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-gray-500">Início → Fim</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {formatDate(contrato.dataInicio)} → {formatDate(contrato.dataFim)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-gray-500">Marcos</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{marcos.length}</p>
              <p className="text-xs text-red-500">
                {marcos.filter((m: any) => m.status === "atrasado").length} atrasados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-gray-500">Riscos</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{riscos.length}</p>
              <p className="text-xs text-orange-500">
                {riscos.filter((r: any) => r.severidade === "critica" || r.severidade === "alta").length} críticos/altos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="marcos">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="marcos">
              <DollarSign className="w-4 h-4 mr-1" /> Marcos ({marcos.length})
            </TabsTrigger>
            <TabsTrigger value="boletins">
              <ClipboardList className="w-4 h-4 mr-1" /> Boletins ({boletins.length})
            </TabsTrigger>
            <TabsTrigger value="riscos">
              <Shield className="w-4 h-4 mr-1" /> Riscos ({riscos.length})
            </TabsTrigger>
            <TabsTrigger value="aditivos">
              <FileCheck className="w-4 h-4 mr-1" /> Aditivos ({aditivos.length})
            </TabsTrigger>
            <TabsTrigger value="documentos">
              <FileText className="w-4 h-4 mr-1" /> Documentos ({documentos.length})
            </TabsTrigger>
            <TabsTrigger value="auditoria">
              <History className="w-4 h-4 mr-1" /> Auditoria ({auditoria.length})
            </TabsTrigger>
          </TabsList>

          {/* MARCOS */}
          <TabsContent value="marcos" className="mt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Marcos Financeiros</h3>
              <Button size="sm" onClick={() => setShowMarcoDialog(true)}>
                <Plus className="w-4 h-4 mr-1" /> Novo Marco
              </Button>
            </div>
            {marcos.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-gray-400">
                  <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Nenhum marco financeiro cadastrado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {marcos.map((marco: any) => {
                  const ms = MARCO_STATUS_LABELS[marco.status] ?? { label: marco.status, color: "bg-gray-100 text-gray-700" };
                  return (
                    <Card key={marco.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{marco.titulo}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${ms.color}`}>{ms.label}</span>
                            </div>
                            {marco.descricao && <p className="text-sm text-gray-500 mt-1">{marco.descricao}</p>}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Previsto: {formatDate(marco.dataPrevista)}
                              </span>
                              {marco.dataPagamento && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-green-500" /> Pago: {formatDate(marco.dataPagamento)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(marco.valorPrevisto)}</p>
                            {marco.valorPago && (
                              <p className="text-xs text-green-600">Pago: {formatCurrency(marco.valorPago)}</p>
                            )}
                            <div className="flex gap-1 mt-2 justify-end">
                              {marco.status !== "pago" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => updateMarco.mutate({ id: marco.id, data: { status: "pago", dataPagamento: new Date().toISOString().split("T")[0] as any } })}
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Marcar Pago
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* RISCOS */}
          <TabsContent value="riscos" className="mt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Gestão de Riscos</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleAnalisarRiscos} disabled={analisandoIA}>
                  {analisandoIA ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Brain className="w-4 h-4 mr-1" />}
                  {analisandoIA ? "Analisando..." : "Analisar com IA"}
                </Button>
                <Button size="sm" onClick={() => setShowRiscoDialog(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Novo Risco
                </Button>
              </div>
            </div>
            {riscos.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-gray-400">
                  <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Nenhum risco cadastrado</p>
                  <p className="text-sm mt-1">Use "Analisar com IA" para identificar riscos automaticamente</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {riscos.map((risco: any) => (
                  <Card key={risco.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900">{risco.titulo}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${RISCO_SEV[risco.severidade] ?? "bg-gray-100 text-gray-700"}`}>
                              {risco.severidade}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{risco.categoria}</span>
                            {risco.geradoPorIA && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1">
                                <Brain className="w-3 h-3" /> IA
                              </span>
                            )}
                          </div>
                          {risco.descricao && <p className="text-sm text-gray-600 mt-1">{risco.descricao}</p>}
                          {risco.planoMitigacao && (
                            <p className="text-xs text-gray-500 mt-1 italic">Mitigação: {risco.planoMitigacao}</p>
                          )}
                          <div className="flex gap-3 mt-2 text-xs text-gray-500">
                            <span>Probabilidade: <strong>{risco.probabilidade}</strong></span>
                            <span>Impacto: <strong>{risco.impacto}</strong></span>
                          </div>
                        </div>
                        <Select
                          value={risco.status}
                          onValueChange={(v) => updateRisco.mutate({ id: risco.id, data: { status: v as any } })}
                        >
                          <SelectTrigger className="w-36 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["identificado", "em_mitigacao", "mitigado", "materializado", "aceito"].map((s) => (
                              <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ADITIVOS */}
          <TabsContent value="aditivos" className="mt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Aditivos Contratuais</h3>
              <Button size="sm" onClick={() => navigate(`/empresa/${empresaId}/contratos/${contratoId}/aditivo/novo`)}>
                <Plus className="w-4 h-4 mr-1" /> Novo Aditivo
              </Button>
            </div>
            {aditivos.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-gray-400">
                  <FileCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Nenhum aditivo cadastrado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {aditivos.map((ad: any) => (
                  <Card key={ad.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ad.numero}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{ad.tipo}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{ad.status}</span>
                          </div>
                          {ad.descricao && <p className="text-sm text-gray-500 mt-1">{ad.descricao}</p>}
                        </div>
                        {ad.valorAditivo && (
                          <p className="font-bold text-gray-900">{formatCurrency(ad.valorAditivo)}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* BOLETINS DE MEDICAO */}
          <TabsContent value="boletins" className="mt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Boletins de Medição</h3>
            </div>
            {boletins.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-gray-400">
                  <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Nenhum boletim de medição cadastrado</p>
                  <p className="text-sm mt-1">Os boletins são criados a partir dos marcos financeiros</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {boletins.map((b: any) => {
                  const statusColors: Record<string, string> = {
                    rascunho: "bg-gray-100 text-gray-700",
                    enviado: "bg-blue-100 text-blue-700",
                    em_aprovacao: "bg-yellow-100 text-yellow-700",
                    aprovado: "bg-green-100 text-green-700",
                    reprovado: "bg-red-100 text-red-700",
                    pago: "bg-emerald-100 text-emerald-700",
                  };
                  return (
                    <Card key={b.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{b.numero}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[b.status] ?? "bg-gray-100 text-gray-700"}`}>{b.status.replace("_", " ")}</span>
                            </div>
                            {b.descricao && <p className="text-sm text-gray-500 mt-1">{b.descricao}</p>}
                            <div className="flex gap-3 mt-2 text-xs text-gray-500">
                              {b.dataEmissao && <span>Emissão: {new Date(b.dataEmissao).toLocaleDateString("pt-BR")}</span>}
                              {b.dataVencimento && <span>Vencimento: {new Date(b.dataVencimento).toLocaleDateString("pt-BR")}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{b.valorBruto ? `R$ ${Number(b.valorBruto).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "-"}</p>
                            {b.status === "rascunho" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2 h-7 text-xs"
                                onClick={() => { setSelectedBoletimId(b.id); setShowBoletimAprovDialog(true); }}
                              >
                                <Send className="w-3 h-3 mr-1" /> Enviar Aprovação
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
          </TabsContent>

          {/* DOCUMENTOS */}
          <TabsContent value="documentos" className="mt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Documentos</h3>
            </div>
            {documentos.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-gray-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Nenhum documento anexado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {documentos.map((doc: any) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-sm">{doc.nome}</p>
                            <p className="text-xs text-gray-500">{doc.tipo}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => window.open(doc.url, "_blank")}>
                          <Download className="w-4 h-4 mr-1" /> Baixar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* AUDITORIA */}
          <TabsContent value="auditoria" className="mt-4">
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900">Histórico de Auditoria</h3>
              <p className="text-sm text-gray-500">Todas as alterações registradas automaticamente pelo sistema</p>
            </div>
            {auditoria.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-gray-400">
                  <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Nenhum registro de auditoria encontrado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {auditoria.map((entry: any) => (
                  <Card key={entry.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <History className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm text-gray-900">{entry.acao}</p>
                            <span className="text-xs text-gray-400">
                              {new Date(entry.createdAt).toLocaleString("pt-BR")}
                            </span>
                          </div>
                          {entry.descricao && (
                            <p className="text-sm text-gray-600 mt-1">{entry.descricao}</p>
                          )}
                          {entry.dadosAnteriores && (
                            <details className="mt-2">
                              <summary className="text-xs text-gray-400 cursor-pointer">Ver dados alterados</summary>
                              <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-32">
                                {JSON.stringify(entry.dadosAnteriores, null, 2)}
                              </pre>
                            </details>
                          )}
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

      {/* Dialog: Enviar Aprovação Boletim */}
      <Dialog open={showBoletimAprovDialog} onOpenChange={setShowBoletimAprovDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              Enviar Boletim para Aprovação
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Informe os dados do aprovador que receberá o link de aprovação por e-mail.</p>
            <div>
              <Label>Nome do Aprovador *</Label>
              <Input
                value={aprovForm.aprovadorNome}
                onChange={(e) => setAprovForm(f => ({ ...f, aprovadorNome: e.target.value }))}
                placeholder="Ex: João Silva"
              />
            </div>
            <div>
              <Label>E-mail do Aprovador *</Label>
              <Input
                type="email"
                value={aprovForm.aprovadorEmail}
                onChange={(e) => setAprovForm(f => ({ ...f, aprovadorEmail: e.target.value }))}
                placeholder="Ex: joao@empresa.com.br"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBoletimAprovDialog(false)}>Cancelar</Button>
            <Button
              onClick={() => selectedBoletimId && enviarAprovacao.mutate({
                id: selectedBoletimId,
                aprovadorNome: aprovForm.aprovadorNome,
                aprovadorEmail: aprovForm.aprovadorEmail,
              })}
              disabled={!aprovForm.aprovadorNome || !aprovForm.aprovadorEmail || enviarAprovacao.isPending}
            >
              {enviarAprovacao.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Novo Marco */}
      <Dialog open={showMarcoDialog} onOpenChange={setShowMarcoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Marco Financeiro</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Título *</Label>
              <Input value={marcoForm.titulo} onChange={(e) => setMarcoForm(f => ({ ...f, titulo: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valor Previsto *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={marcoForm.valorPrevisto}
                  onChange={(e) => setMarcoForm(f => ({ ...f, valorPrevisto: e.target.value }))}
                />
              </div>
              <div>
                <Label>Data Prevista *</Label>
                <Input
                  type="date"
                  value={marcoForm.dataPrevista}
                  onChange={(e) => setMarcoForm(f => ({ ...f, dataPrevista: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={marcoForm.descricao} onChange={(e) => setMarcoForm(f => ({ ...f, descricao: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMarcoDialog(false)}>Cancelar</Button>
            <Button
              onClick={() => createMarco.mutate({
                contratoId,
                titulo: marcoForm.titulo,
                valorPrevisto: marcoForm.valorPrevisto,
                dataPrevista: marcoForm.dataPrevista,
                descricao: marcoForm.descricao,
                ordem: marcoForm.ordem,
                status: "pendente",
              })}
              disabled={!marcoForm.titulo || !marcoForm.valorPrevisto || !marcoForm.dataPrevista}
            >
              Criar Marco
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Novo Risco */}
      <Dialog open={showRiscoDialog} onOpenChange={setShowRiscoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Risco</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Título *</Label>
              <Input value={riscoForm.titulo} onChange={(e) => setRiscoForm(f => ({ ...f, titulo: e.target.value }))} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={riscoForm.descricao} onChange={(e) => setRiscoForm(f => ({ ...f, descricao: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Categoria</Label>
                <Select value={riscoForm.categoria} onValueChange={(v) => setRiscoForm(f => ({ ...f, categoria: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["financeiro", "juridico", "operacional", "prazo", "escopo", "reputacional", "regulatorio", "outro"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Probabilidade</Label>
                <Select value={riscoForm.probabilidade} onValueChange={(v) => setRiscoForm(f => ({ ...f, probabilidade: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Impacto</Label>
                <Select value={riscoForm.impacto} onValueChange={(v) => setRiscoForm(f => ({ ...f, impacto: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixo">Baixo</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Plano de Mitigação</Label>
              <Textarea value={riscoForm.planoMitigacao} onChange={(e) => setRiscoForm(f => ({ ...f, planoMitigacao: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRiscoDialog(false)}>Cancelar</Button>
            <Button
              onClick={() => createRisco.mutate({ contratoId, ...riscoForm })}
              disabled={!riscoForm.titulo}
            >
              Registrar Risco
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Revisão IA */}
      <Dialog open={showRevisaoIA} onOpenChange={setShowRevisaoIA}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Revisão dos Dados Extraídos pela IA
            </DialogTitle>
          </DialogHeader>
          {dadosIA && (
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Revise os dados antes de confirmar. Após confirmação, marcos e riscos serão criados automaticamente.
              </div>
              {dadosIA.resumo && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Resumo</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{dadosIA.resumo}</p>
                </div>
              )}
              {dadosIA.marcos?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Marcos Identificados ({dadosIA.marcos.length})</p>
                  <div className="space-y-1">
                    {dadosIA.marcos.map((m: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                        <span>{m.titulo}</span>
                        <div className="flex items-center gap-3 text-gray-500">
                          <span>{formatCurrency(m.valor)}</span>
                          <span>{m.dataPrevista}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {dadosIA.riscos?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Riscos Identificados ({dadosIA.riscos.length})</p>
                  <div className="space-y-1">
                    {dadosIA.riscos.map((r: any, i: number) => (
                      <div key={i} className="text-sm bg-gray-50 p-2 rounded">
                        <span className="font-medium">{r.titulo}</span>
                        <span className="text-gray-500 ml-2">({r.categoria} / {r.probabilidade} prob.)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevisaoIA(false)}>Cancelar</Button>
            <Button onClick={handleConfirmarIA} disabled={confirmarExtracao.isPending}>
              {confirmarExtracao.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckSquare className="w-4 h-4 mr-1" />}
              Confirmar e Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
