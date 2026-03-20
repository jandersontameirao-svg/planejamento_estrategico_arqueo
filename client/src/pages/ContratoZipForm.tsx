/**
 * ContratoZipForm.tsx — Formulário de Criação de Contrato (ZIP v1.0.0)
 * Rota: /gestao-contratos/novo
 * Inclui: upload de PDF, análise por IA, revisão obrigatória antes de salvar
 */
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, Upload, Loader2, FileText, Sparkles, CheckCircle2,
  AlertTriangle, DollarSign, Calendar, Building2, Users, X,
  ChevronRight, Info,
} from "lucide-react";

type RiscoTipo = "financeiro" | "legal" | "operacional" | "prazo";
type RiscoSeveridade = "baixa" | "media" | "alta" | "critica";
type AnalysisResult = {
  informacoesBasicas: { titulo: string; dataInicio: string; dataTermino: string };
  valores: { valorTotal: number; parcelas: number; formaPagamento: string };
  marcosFinanceiros: Array<{ descricao: string; valor: number; dataVencimento: string; percentual?: number }>;
  riscos: Array<{ tipo: RiscoTipo; descricao: string; severidade: RiscoSeveridade }>;
};

const SEVERITY_COLORS: Record<string, string> = {
  baixa: "bg-green-500/20 text-green-400 border-green-500/30",
  media: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  alta: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  critica: "bg-red-500/20 text-red-400 border-red-500/30",
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default function ContratoZipForm() {
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  // Formulário
  const [form, setForm] = useState({
    companyId: "",
    clientId: "",
    title: "",
    description: "",
    totalValue: "",
    startDate: "",
    endDate: "",
    observations: "",
    managerName: "",
    managerEmail: "",
    approverName: "",
    approverEmail: "",
  });

  // Upload e análise
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFileKey, setPdfFileKey] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisReviewed, setAnalysisReviewed] = useState(false);
  const [step, setStep] = useState<"form" | "review" | "done">("form");

  const { data: empresas = [] } = trpc.empresas.list.useQuery();
  const { data: clientes = [] } = trpc.clients.list.useQuery();

  const createMut = trpc.contractsModule.create.useMutation({
    onError: (e) => toast.error(e.message),
  });
  const analyzePdfMut = trpc.contractsModule.analyzePdf.useMutation();
  const applyAnalysisMut = trpc.contractsModule.applyAnalysis.useMutation({
    onError: (e) => toast.error(e.message),
  });

  // Filtrar clientes pela empresa selecionada
  const clientesFiltrados = form.companyId
    ? clientes.filter((c: any) => {
        // Mostrar todos os clientes (a vinculação é validada no servidor)
        return true;
      })
    : clientes;

  async function handleUploadPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 16 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 16MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Falha no upload");
      const data = await res.json();
      setPdfUrl(data.url);
      setPdfFileKey(data.key);
      setPdfName(file.name);
      toast.success("PDF enviado com sucesso!");
    } catch (err) {
      toast.error("Erro ao enviar PDF. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  async function handleAnalyze() {
    if (!pdfUrl) {
      toast.error("Faça o upload do PDF primeiro.");
      return;
    }
    setAnalyzing(true);
    try {
      // Criar contrato temporário para análise
      if (!form.companyId || !form.clientId || !form.title) {
        toast.error("Preencha empresa, cliente e título antes de analisar.");
        setAnalyzing(false);
        return;
      }

      const contract = await createMut.mutateAsync({
        companyId: Number(form.companyId),
        clientId: Number(form.clientId),
        title: form.title || "Contrato em análise",
        description: form.description,
        totalValue: form.totalValue || "0",
        startDate: form.startDate ? new Date(form.startDate) : new Date(),
        endDate: form.endDate ? new Date(form.endDate) : undefined,
        observations: form.observations,
        pdfUrl,
        pdfFileKey,
        managerName: form.managerName,
        managerEmail: form.managerEmail || undefined,
        approverName: form.approverName,
        approverEmail: form.approverEmail || undefined,
      });

      if (!contract) throw new Error("Erro ao criar contrato");

      // Analisar PDF com IA
      const result = await analyzePdfMut.mutateAsync({
        contractId: contract.id,
        pdfUrl,
      });

      setAnalysis(result as AnalysisResult);

      // Pré-preencher formulário com dados da IA
      setForm((f) => ({
        ...f,
        title: result.informacoesBasicas.titulo || f.title,
        totalValue: String(result.valores.valorTotal) || f.totalValue,
        startDate: result.informacoesBasicas.dataInicio
          ? new Date(result.informacoesBasicas.dataInicio).toISOString().split("T")[0]
          : f.startDate,
        endDate: result.informacoesBasicas.dataTermino
          ? new Date(result.informacoesBasicas.dataTermino).toISOString().split("T")[0]
          : f.endDate,
      }));

      // Guardar ID do contrato para aplicar análise depois
      sessionStorage.setItem("pendingContractId", String(contract.id));
      setStep("review");
      toast.success("Análise concluída! Revise os dados antes de confirmar.");
    } catch (err: any) {
      toast.error(err.message || "Erro na análise. Tente novamente.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleApplyAndFinish() {
    if (!analysis) return;
    const contractId = Number(sessionStorage.getItem("pendingContractId"));
    if (!contractId) {
      toast.error("Contrato não encontrado. Tente novamente.");
      return;
    }

    try {
      await applyAnalysisMut.mutateAsync({ contractId, analysis });
      utils.contractsModule.list.invalidate();
      utils.contractsModule.stats.invalidate();
      sessionStorage.removeItem("pendingContractId");
      toast.success("Contrato criado com marcos e riscos!");
      navigate(`/gestao-contratos/${contractId}`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao aplicar análise.");
    }
  }

  async function handleSaveWithoutAnalysis() {
    if (!form.companyId || !form.clientId || !form.title) {
      toast.error("Preencha empresa, cliente e título.");
      return;
    }

    try {
      const contract = await createMut.mutateAsync({
        companyId: Number(form.companyId),
        clientId: Number(form.clientId),
        title: form.title,
        description: form.description,
        totalValue: form.totalValue || "0",
        startDate: form.startDate ? new Date(form.startDate) : new Date(),
        endDate: form.endDate ? new Date(form.endDate) : undefined,
        observations: form.observations,
        pdfUrl: pdfUrl || undefined,
        pdfFileKey: pdfFileKey || undefined,
        managerName: form.managerName,
        managerEmail: form.managerEmail || undefined,
        approverName: form.approverName,
        approverEmail: form.approverEmail || undefined,
      });

      if (!contract) throw new Error("Erro ao criar contrato");
      utils.contractsModule.list.invalidate();
      utils.contractsModule.stats.invalidate();
      toast.success("Contrato criado!");
      navigate(`/gestao-contratos/${contract.id}`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar contrato.");
    }
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  if (step === "review" && analysis) {
    return (
      <div className="container py-6 max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep("form")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              Revisão da Análise por IA
            </h1>
            <p className="text-sm text-muted-foreground">Revise e confirme os dados extraídos do PDF</p>
          </div>
        </div>

        {/* Aviso de revisão obrigatória */}
        <Card className="border border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />
            <p className="text-sm text-yellow-300">
              Revise cuidadosamente os dados extraídos pela IA antes de confirmar. Os marcos financeiros e riscos serão criados automaticamente.
            </p>
          </CardContent>
        </Card>

        {/* Informações básicas */}
        <Card className="border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-500" /> Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Título</p>
                <p className="font-medium">{analysis.informacoesBasicas.titulo}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Valor Total</p>
                <p className="font-medium text-emerald-400">{formatCurrency(analysis.valores.valorTotal)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Início</p>
                <p className="font-medium">{analysis.informacoesBasicas.dataInicio}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Término</p>
                <p className="font-medium">{analysis.informacoesBasicas.dataTermino}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Forma de Pagamento</p>
                <p className="font-medium">{analysis.valores.formaPagamento}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Parcelas</p>
                <p className="font-medium">{analysis.valores.parcelas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marcos Financeiros */}
        <Card className="border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              Marcos Financeiros ({analysis.marcosFinanceiros.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.marcosFinanceiros.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum marco financeiro identificado.</p>
            ) : (
              <div className="space-y-2">
                {analysis.marcosFinanceiros.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-sm">
                    <div>
                      <p className="font-medium">{m.descricao}</p>
                      <p className="text-xs text-muted-foreground">{m.dataVencimento}</p>
                    </div>
                    <p className="font-semibold text-emerald-400">{formatCurrency(m.valor)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Riscos */}
        <Card className="border border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Riscos Identificados ({analysis.riscos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.riscos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum risco identificado.</p>
            ) : (
              <div className="space-y-2">
                {analysis.riscos.map((r, i) => (
                  <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-muted/30 text-sm gap-3">
                    <div className="flex-1">
                      <p className="font-medium">{r.descricao}</p>
                      <p className="text-xs text-muted-foreground capitalize">{r.tipo}</p>
                    </div>
                    <Badge className={`text-xs border ${SEVERITY_COLORS[r.severidade] ?? ""} capitalize`}>
                      {r.severidade}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmação */}
        <div className="flex items-center gap-3 p-4 rounded-lg border border-white/10 bg-card/50">
          <input
            type="checkbox"
            id="reviewed"
            checked={analysisReviewed}
            onChange={(e) => setAnalysisReviewed(e.target.checked)}
            className="h-4 w-4 accent-orange-500"
          />
          <label htmlFor="reviewed" className="text-sm cursor-pointer">
            Confirmo que revisei os dados extraídos pela IA e autorizo a criação dos marcos financeiros e riscos.
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setStep("form")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button
            onClick={handleApplyAndFinish}
            disabled={!analysisReviewed || applyAnalysisMut.isPending}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {applyAnalysisMut.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Confirmar e Criar Contrato
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/gestao-contratos")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-500" />
            Novo Contrato
          </h1>
          <p className="text-sm text-muted-foreground">Preencha os dados ou faça upload do PDF para análise automática</p>
        </div>
      </div>

      {/* Upload de PDF */}
      <Card className="border border-orange-500/20 bg-orange-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Upload className="h-4 w-4 text-orange-500" /> Upload do Contrato (PDF)
          </CardTitle>
          <CardDescription className="text-xs">
            Faça upload do PDF para que a IA extraia automaticamente os dados, marcos financeiros e riscos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pdfUrl ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <FileText className="h-5 w-5 text-orange-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{pdfName}</p>
                <p className="text-xs text-muted-foreground">PDF enviado com sucesso</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => { setPdfUrl(""); setPdfFileKey(""); setPdfName(""); }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-orange-500/30 rounded-lg p-6 text-center cursor-pointer hover:border-orange-500/60 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 mx-auto text-orange-500 animate-spin mb-2" />
              ) : (
                <Upload className="h-8 w-8 mx-auto text-orange-500/50 mb-2" />
              )}
              <p className="text-sm text-muted-foreground">
                {uploading ? "Enviando..." : "Arraste o PDF aqui ou clique para selecionar"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Máximo 16MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleUploadPdf}
          />
        </CardContent>
      </Card>

      {/* Dados do Contrato */}
      <Card className="border border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Dados do Contrato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Empresa *</Label>
              <Select value={form.companyId} onValueChange={(v) => setForm((f) => ({ ...f, companyId: v, clientId: "" }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {(empresas as any[]).map((e: any) => (
                    <SelectItem key={e.id} value={String(e.id)}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Cliente *</Label>
              <Select value={form.clientId} onValueChange={(v) => setForm((f) => ({ ...f, clientId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {(clientesFiltrados as any[]).map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.fantasyName || c.name} {c.taxId ? `— ${c.taxId}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Título do Contrato *</Label>
              <Input value={form.title} onChange={f("title")} placeholder="Ex: Contrato de Prestação de Serviços" />
            </div>
            <div className="col-span-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={f("description")} rows={2} placeholder="Descrição resumida do objeto do contrato" />
            </div>
            <div>
              <Label>Valor Total (R$)</Label>
              <Input value={form.totalValue} onChange={f("totalValue")} placeholder="0,00" type="number" step="0.01" />
            </div>
            <div>
              <Label>Data de Início</Label>
              <Input type="date" value={form.startDate} onChange={f("startDate")} />
            </div>
            <div>
              <Label>Data de Término</Label>
              <Input type="date" value={form.endDate} onChange={f("endDate")} />
            </div>
          </div>

          {/* Gestor e Aprovador */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Responsáveis</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gestor do Contrato</Label>
                <Input value={form.managerName} onChange={f("managerName")} placeholder="Nome do gestor" />
              </div>
              <div>
                <Label>Email do Gestor</Label>
                <Input type="email" value={form.managerEmail} onChange={f("managerEmail")} placeholder="gestor@empresa.com" />
              </div>
              <div>
                <Label>Aprovador</Label>
                <Input value={form.approverName} onChange={f("approverName")} placeholder="Nome do aprovador" />
              </div>
              <div>
                <Label>Email do Aprovador</Label>
                <Input type="email" value={form.approverEmail} onChange={f("approverEmail")} placeholder="aprovador@empresa.com" />
              </div>
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea value={form.observations} onChange={f("observations")} rows={2} placeholder="Observações adicionais" />
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/gestao-contratos")}>
          Cancelar
        </Button>
        {pdfUrl && (
          <Button
            onClick={handleAnalyze}
            disabled={analyzing || !form.companyId || !form.clientId || !form.title}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {analyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Analisar com IA
          </Button>
        )}
        <Button
          onClick={handleSaveWithoutAnalysis}
          disabled={createMut.isPending || !form.companyId || !form.clientId || !form.title}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {createMut.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-4 w-4" />
          )}
          Salvar Contrato
        </Button>
      </div>
    </div>
  );
}
