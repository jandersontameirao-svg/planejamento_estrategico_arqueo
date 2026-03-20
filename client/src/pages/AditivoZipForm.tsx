/**
 * AditivoZipForm.tsx — Formulário de Aditivo Contratual com Análise IA
 * Rota: /gestao-contratos/:contractId/aditivo/novo
 * Fluxo: Upload PDF → IA extrai dados → Revisão obrigatória → Salvar
 * Idêntico ao fluxo do ContratoZipForm para consistência
 */
import { useState, useRef, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, Upload, Sparkles, CheckCircle2, AlertTriangle,
  Loader2, FileText, DollarSign, Calendar, ChevronRight,
  Eye, Pencil, X,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AnalysisResult {
  title: string;
  description: string;
  tipo: "financeiro" | "escopo";
  additionalValue: number;
  effectiveDate: string;
  justification?: string;
  newEndDate?: string;
}

type Step = "upload" | "analyzing" | "review" | "form" | "saving";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(v: number | string) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v));
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AditivoZipForm() {
  const [, params] = useRoute("/gestao-contratos/:contractId/aditivo/novo");
  const contractId = Number(params?.contractId ?? 0);
  const [, navigate] = useLocation();

  // Estados do fluxo
  const [step, setStep] = useState<Step>("upload");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pdfKey, setPdfKey] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formulário manual (pós-revisão ou sem PDF)
  const [form, setForm] = useState({
    title: "",
    description: "",
    tipo: "escopo" as "financeiro" | "escopo",
    additionalValue: "0",
    startDate: "",
    endDate: "",
    justification: "",
  });

  // Queries
  const { data: contract } = trpc.contractsModule.getById.useQuery(
    { id: contractId },
    { enabled: !!contractId }
  );

  // Mutations
  const analyzeMut = trpc.contractAmendments.analyzePdf.useMutation({
    onError: (e) => {
      toast.error("Erro na análise IA: " + e.message);
      setStep("form");
    },
  });

  const createMut = trpc.contractAmendments.create.useMutation({
    onSuccess: () => {
      toast.success("Aditivo criado com sucesso!");
      navigate(`/gestao-contratos/${contractId}`);
    },
    onError: (e) => {
      toast.error("Erro ao criar aditivo: " + e.message);
      setStep("form");
    },
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.includes("pdf")) {
      toast.error("Apenas arquivos PDF são aceitos.");
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 16 MB.");
      return;
    }
    setPdfFile(file);
    setStep("analyzing");

    try {
      // Upload do PDF via /api/upload
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Falha no upload");
      const uploadResult = await res.json() as { url: string; key: string };
      setPdfUrl(uploadResult.url);
      setPdfKey(uploadResult.key);

      // Análise IA
      const result = await analyzeMut.mutateAsync({ pdfUrl: uploadResult.url });
      setAnalysis(result);

      // Pré-preencher formulário com dados extraídos
      setForm({
        title: result.title,
        description: result.description,
        tipo: result.tipo,
        additionalValue: String(result.additionalValue),
        startDate: result.effectiveDate
          ? (() => {
              const [d, m, y] = result.effectiveDate.split("/");
              return `${y}-${m}-${d}`;
            })()
          : "",
        endDate: result.newEndDate
          ? (() => {
              const [d, m, y] = result.newEndDate.split("/");
              return `${y}-${m}-${d}`;
            })()
          : "",
        justification: result.justification || "",
      });

      setStep("review");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error("Erro: " + msg);
      setStep("upload");
    }
  }, [contractId, analyzeMut]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleSubmit = () => {
    if (!reviewed && step === "review") {
      toast.error("Revise os dados extraídos antes de continuar.");
      return;
    }
    setStep("saving");
    createMut.mutate({
      contractId,
      title: form.title,
      description: form.description || undefined,
      tipo: form.tipo,
      additionalValue: form.additionalValue,
      startDate: new Date(form.startDate),
      endDate: form.endDate ? new Date(form.endDate) : undefined,
      pdfUrl: pdfUrl || undefined,
      pdfFileKey: pdfKey || undefined,
      scopeChanges: form.justification || undefined,
    });
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/gestao-contratos/${contractId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span>Contratos</span>
              <ChevronRight className="h-3 w-3" />
              <span className="truncate max-w-[200px]">{contract?.title || `Contrato #${contractId}`}</span>
              <ChevronRight className="h-3 w-3" />
              <span>Novo Aditivo</span>
            </div>
            <h1 className="text-xl font-bold">Novo Aditivo Contratual</h1>
          </div>
        </div>

        {/* Progresso */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {["upload", "analyzing", "review", "form"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              <span className={step === s || (step === "saving" && s === "form") ? "text-orange-400 font-medium" : ""}>
                {s === "upload" ? "Upload PDF" : s === "analyzing" ? "Análise IA" : s === "review" ? "Revisão" : "Formulário"}
              </span>
            </div>
          ))}
        </div>

        {/* ── STEP: Upload ─────────────────────────────────────────────────── */}
        {step === "upload" && (
          <Card className="border border-white/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4 text-orange-500" />
                Upload do Aditivo em PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  isDragging ? "border-orange-500 bg-orange-500/5" : "border-white/20 hover:border-orange-500/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">Arraste o PDF do aditivo aqui</p>
                <p className="text-xs text-muted-foreground">ou clique para selecionar (máx. 16 MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-muted-foreground">ou</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStep("form")}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Preencher manualmente (sem PDF)
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── STEP: Analyzing ──────────────────────────────────────────────── */}
        {step === "analyzing" && (
          <Card className="border border-orange-500/20 bg-orange-500/5">
            <CardContent className="py-10 text-center space-y-4">
              <div className="relative mx-auto w-16 h-16">
                <Loader2 className="h-16 w-16 animate-spin text-orange-500" />
                <Sparkles className="h-6 w-6 text-orange-400 absolute inset-0 m-auto" />
              </div>
              <div>
                <p className="font-semibold text-orange-400">Analisando aditivo com IA...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {pdfFile?.name} — Extraindo tipo, valor e vigência
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── STEP: Review ─────────────────────────────────────────────────── */}
        {step === "review" && analysis && (
          <div className="space-y-4">
            <Card className="border border-orange-500/20 bg-orange-500/5">
              <CardContent className="py-4 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-400">Dados extraídos pela IA</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Revise cuidadosamente os dados abaixo antes de confirmar.
                    <strong className="text-orange-400"> A revisão é obrigatória.</strong>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dados extraídos */}
            <Card className="border border-white/10">
              <CardContent className="py-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Tipo</p>
                    <Badge className={`text-xs border mt-1 ${analysis.tipo === "financeiro" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>
                      {analysis.tipo === "financeiro" ? "Financeiro" : "Escopo"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" /> Valor Adicional</p>
                    <p className={`text-sm font-bold mt-1 ${analysis.additionalValue >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {analysis.additionalValue >= 0 ? "+" : ""}{formatCurrency(analysis.additionalValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Vigência</p>
                    <p className="text-sm mt-1">{analysis.effectiveDate}</p>
                  </div>
                  {analysis.newEndDate && (
                    <div>
                      <p className="text-xs text-muted-foreground">Nova data fim</p>
                      <p className="text-sm mt-1">{analysis.newEndDate}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Título</p>
                  <p className="text-sm font-medium mt-1">{analysis.title}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Descrição</p>
                  <p className="text-sm mt-1">{analysis.description}</p>
                </div>
                {analysis.justification && (
                  <div>
                    <p className="text-xs text-muted-foreground">Justificativa</p>
                    <p className="text-sm mt-1 text-muted-foreground">{analysis.justification}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Confirmação de revisão */}
            <Card className={`border cursor-pointer transition-all ${reviewed ? "border-green-500/40 bg-green-500/5" : "border-white/10 hover:border-orange-500/30"}`}
              onClick={() => setReviewed(!reviewed)}
            >
              <CardContent className="py-3 flex items-center gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${reviewed ? "border-green-500 bg-green-500" : "border-white/30"}`}>
                  {reviewed && <CheckCircle2 className="h-3 w-3 text-white" />}
                </div>
                <p className="text-sm">
                  Confirmo que revisei os dados extraídos e estão corretos.
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("form")} className="flex-1">
                <Pencil className="mr-2 h-4 w-4" /> Editar dados
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!reviewed}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirmar e Salvar
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP: Form (manual ou edição pós-revisão) ────────────────────── */}
        {(step === "form" || step === "saving") && (
          <Card className="border border-white/10">
            <CardHeader>
              <CardTitle className="text-base">
                {pdfUrl ? "Revisar dados do Aditivo" : "Dados do Aditivo"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                className="space-y-4"
              >
                {/* Tipo */}
                <div>
                  <Label>Tipo de Aditivo *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {(["financeiro", "escopo"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, tipo: t }))}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          form.tipo === t
                            ? t === "financeiro"
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                              : "border-blue-500 bg-blue-500/10 text-blue-400"
                            : "border-white/10 text-muted-foreground hover:border-white/20"
                        }`}
                      >
                        {t === "financeiro" ? "💰 Financeiro" : "📋 Escopo"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Título */}
                <div>
                  <Label>Título / Número do Aditivo *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Ex: Aditivo nº 01 ao Contrato..."
                    required
                  />
                </div>

                {/* Descrição */}
                <div>
                  <Label>Descrição / Objeto</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    placeholder="Descreva o objeto do aditivo..."
                  />
                </div>

                {/* Valor adicional */}
                <div>
                  <Label>Valor Adicional (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.additionalValue}
                    onChange={(e) => setForm((f) => ({ ...f, additionalValue: e.target.value }))}
                    placeholder="0.00 (negativo para supressão)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Use valor negativo para supressão. Zero se não houver impacto financeiro.</p>
                </div>

                {/* Datas */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Data de Vigência *</Label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Nova Data Fim (opcional)</Label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Justificativa */}
                <div>
                  <Label>Justificativa / Motivação</Label>
                  <Textarea
                    value={form.justification}
                    onChange={(e) => setForm((f) => ({ ...f, justification: e.target.value }))}
                    rows={2}
                    placeholder="Motivo ou justificativa para o aditivo..."
                  />
                </div>

                {/* PDF anexado */}
                {pdfUrl && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 rounded-lg p-2">
                    <FileText className="h-3.5 w-3.5 text-orange-400" />
                    <span className="truncate">{pdfFile?.name || "PDF anexado"}</span>
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-orange-400 hover:underline">
                      <Eye className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}

                <div className="flex gap-3 pt-2 border-t border-white/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/gestao-contratos/${contractId}`)}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" /> Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={step === "saving" || createMut.isPending}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {(step === "saving" || createMut.isPending) ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Salvar Aditivo
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
