import { useState, useRef, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, FileText, Save, Search, Building2, ExternalLink,
  Upload, Brain, CheckCircle2, AlertCircle, X, Loader2, FileUp,
  Shield, Landmark, Calendar, DollarSign, Users, BookOpen,
  Trash2, Plus, Edit3, ChevronDown, ChevronUp, Eye, Check,
} from "lucide-react";

interface ContratoFormProps {
  empresaId: number;
}

const STEPS = [
  { id: 1, title: "Upload do Documento", icon: FileUp, desc: "Envie o PDF do contrato" },
  { id: 2, title: "Revisão IA", icon: Brain, desc: "Revise os dados extraídos" },
  { id: 3, title: "Complementar Dados", icon: Edit3, desc: "Complete informações" },
  { id: 4, title: "Confirmar e Criar", icon: Check, desc: "Revise e finalize" },
];

export default function ContratoForm({ empresaId }: ContratoFormProps) {
  const [, navigate] = useLocation();
  const { data: empresas = [] } = trpc.empresas.list.useQuery();
  const { data: clientes = [] } = trpc.contratos.clientes.list.useQuery({ empresaId });

  const [step, setStep] = useState(1);
  const [modoManual, setModoManual] = useState(false);

  // Form state
  const [form, setForm] = useState({
    numero: "",
    titulo: "",
    descricao: "",
    tipo: "servico" as any,
    status: "rascunho" as any,
    empresaId: String(empresaId),
    clienteId: "",
    dataInicio: "",
    dataFim: "",
    dataAssinatura: "",
    valorTotal: "",
    moeda: "BRL",
    observacoes: "",
  });

  // PDF upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [iaResult, setIaResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // IA extracted data - editable
  const [marcos, setMarcos] = useState<any[]>([]);
  const [riscos, setRiscos] = useState<any[]>([]);
  const [clausulas, setClausulas] = useState<any[]>([]);
  const [contratante, setContratante] = useState<any>({});
  const [contratado, setContratado] = useState<any>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dados: true, partes: true, marcos: true, riscos: true, clausulas: true,
  });

  const extrairPDF = trpc.contratos.contratos.extrairPDF.useMutation();
  const confirmarExtracao = trpc.contratos.contratos.confirmarExtracao.useMutation();

  const createContrato = trpc.contratos.contratos.create.useMutation({
    onSuccess: async (data: any) => {
      // data is the raw insertId (number) returned by createContrato
      const novoId = typeof data === "number" ? data : data?.id;
      // If we have IA data, confirm extraction to create marcos and riscos
      if (iaResult && (marcos.length > 0 || riscos.length > 0)) {
        try {
          await confirmarExtracao.mutateAsync({
            contratoId: novoId,
            dadosRevisados: {
              resumoIA: iaResult.resumo || form.descricao,
              dadosExtradosIA: JSON.stringify(iaResult),
              marcos: marcos.map((m, i) => ({
                titulo: m.titulo,
                valorPrevisto: String(m.valor || "0"),
                dataPrevista: m.dataPrevista || form.dataInicio || new Date().toISOString().split("T")[0],
                descricao: m.descricao || "",
                ordem: i + 1,
              })),
              riscos: riscos.map(r => ({
                titulo: r.titulo,
                descricao: r.descricao || "",
                categoria: r.categoria || "outro",
                probabilidade: r.probabilidade || "media",
                impacto: r.impacto || "medio",
              })),
            },
          });
        } catch (err) {
          console.error("Erro ao salvar marcos/riscos:", err);
        }
      }
      toast.success("Contrato criado com sucesso!");
      navigate(`/empresa/${empresaId}/contratos/${novoId}`);
    },
    onError: (err: any) => {
      toast.error("Erro ao criar contrato: " + err.message);
    },
  });

  const [buscaCliente, setBuscaCliente] = useState("");

  const clientesFiltrados = useMemo(() => {
    const base = form.empresaId
      ? clientes.filter((c: any) => !c.empresaId || c.empresaId === parseInt(form.empresaId))
      : clientes;
    if (!buscaCliente) return base;
    const q = buscaCliente.toLowerCase();
    return base.filter((c: any) =>
      c.razaoSocial?.toLowerCase().includes(q) ||
      (c.nomeFantasia ?? "").toLowerCase().includes(q) ||
      c.cnpj?.includes(buscaCliente)
    );
  }, [clientes, form.empresaId, buscaCliente]);

  // Auto-match client by CNPJ from IA extraction
  const autoMatchCliente = useCallback((cnpj: string) => {
    if (!cnpj) return;
    const cleaned = cnpj.replace(/\D/g, "");
    const match = clientes.find((c: any) => c.cnpj?.replace(/\D/g, "") === cleaned);
    if (match) {
      setForm(f => ({ ...f, clienteId: String(match.id) }));
      toast.success(`Cliente identificado: ${(match as any).nomeFantasia || (match as any).razaoSocial}`);
    }
  }, [clientes]);

  async function handleFileSelect(file: File) {
    if (!file.type.includes("pdf")) {
      toast.error("Apenas arquivos PDF são aceitos");
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Limite de 16MB.");
      return;
    }
    setPdfFile(file);
    setIaResult(null);
    setMarcos([]);
    setRiscos([]);
    setClausulas([]);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-pdf", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Falha no upload");
      const { url } = await res.json();
      setPdfUrl(url);
      toast.success("PDF enviado. Iniciando extração por IA...");

      setIsExtracting(true);
      const result = await extrairPDF.mutateAsync({ pdfUrl: url }) as any;
      setIaResult(result);

      if (result) {
        // Pre-fill form
        setForm(f => ({
          ...f,
          titulo: result.titulo || f.titulo,
          numero: result.numero || f.numero,
          valorTotal: result.valorTotal ? String(result.valorTotal).replace(/[^\d.,]/g, "") : f.valorTotal,
          dataInicio: result.dataInicio ? result.dataInicio.split("T")[0] : f.dataInicio,
          dataFim: result.dataFim ? result.dataFim.split("T")[0] : f.dataFim,
          dataAssinatura: result.dataAssinatura ? result.dataAssinatura.split("T")[0] : f.dataAssinatura,
          descricao: result.resumo || f.descricao,
          tipo: result.tipo || f.tipo,
        }));

        // Set extracted sub-data
        if (result.marcos?.length) setMarcos(result.marcos);
        if (result.riscos?.length) setRiscos(result.riscos);
        if (result.clausulasChave?.length) setClausulas(result.clausulasChave);
        if (result.contratante) setContratante(result.contratante);
        if (result.contratado) setContratado(result.contratado);

        // Try auto-match client by CNPJ
        const clienteCnpj = result.contratante?.cnpj || result.contratado?.cnpj;
        if (clienteCnpj) autoMatchCliente(clienteCnpj);

        toast.success("Dados extraídos pela IA! Avance para revisar.");
        setStep(2);
      }
    } catch (err: any) {
      toast.error("Erro na extração: " + (err.message || "Tente novamente"));
    } finally {
      setIsUploading(false);
      setIsExtracting(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  function toggleSection(key: string) {
    setExpandedSections(s => ({ ...s, [key]: !s[key] }));
  }

  function handleSubmit() {
    if (!form.numero || !form.titulo || !form.empresaId || !form.clienteId) {
      toast.error("Preencha os campos obrigatórios: número, título, empresa e cliente");
      return;
    }
    createContrato.mutate({
      ...form,
      empresaId: parseInt(form.empresaId),
      clienteId: parseInt(form.clienteId),
      pdfUrl: pdfUrl ?? undefined,
    });
  }

  // ─── STEP 1: Upload ─────────────────────────────────────────────────────────
  function renderStep1() {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Criação Inteligente de Contrato
            </CardTitle>
            <CardDescription>
              Faça upload do PDF do contrato e a IA extrairá automaticamente todos os dados:
              partes envolvidas, valores, marcos financeiros, riscos e cláusulas-chave.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!pdfFile ? (
              <div
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-purple-500 bg-purple-50 scale-[1.01]"
                    : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/30"
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-base font-semibold text-gray-800 mb-1">
                  Arraste o PDF do contrato aqui
                </p>
                <p className="text-sm text-gray-500 mb-3">ou clique para selecionar o arquivo</p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> PDF até 16MB</span>
                  <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> Extração por IA</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Revisão obrigatória</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{pdfFile.name}</p>
                    <p className="text-xs text-gray-400">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  {(isUploading || isExtracting) && (
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isUploading ? "Enviando..." : "Extraindo dados..."}</span>
                    </div>
                  )}
                  {iaResult && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  <button
                    type="button"
                    className="text-gray-400 hover:text-red-500 p-1"
                    onClick={() => { setPdfFile(null); setPdfUrl(null); setIaResult(null); setMarcos([]); setRiscos([]); setClausulas([]); }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {(isUploading || isExtracting) && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Brain className="w-6 h-6 text-purple-600" />
                        <Loader2 className="w-3 h-3 animate-spin text-purple-400 absolute -bottom-0.5 -right-0.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-800">
                          {isUploading ? "Enviando documento..." : "IA analisando contrato..."}
                        </p>
                        <p className="text-xs text-purple-600">
                          {isUploading
                            ? "Fazendo upload do PDF para o servidor"
                            : "Identificando partes, valores, marcos financeiros, riscos e cláusulas"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 bg-purple-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full animate-pulse" style={{ width: isUploading ? "30%" : "70%" }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
            onClick={() => { setModoManual(true); setStep(3); }}
          >
            Prefiro preencher manualmente sem IA
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP 2: Revisão IA ──────────────────────────────────────────────────────
  function renderStep2() {
    if (!iaResult) return null;

    return (
      <div className="space-y-4">
        {/* Resumo Executivo */}
        {iaResult.resumo && (
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-purple-800 mb-1">Resumo Executivo (IA)</p>
                  <p className="text-sm text-purple-700 leading-relaxed">{iaResult.resumo}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dados Gerais */}
        <Card>
          <CardHeader className="cursor-pointer py-3" onClick={() => toggleSection("dados")}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Dados Gerais do Contrato
              </CardTitle>
              {expandedSections.dados ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </CardHeader>
          {expandedSections.dados && (
            <CardContent className="pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Número</Label>
                  <Input size={1} value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Tipo</Label>
                  <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servico">Serviço</SelectItem>
                      <SelectItem value="produto">Produto</SelectItem>
                      <SelectItem value="misto">Misto</SelectItem>
                      <SelectItem value="consultoria">Consultoria</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Título / Objeto</Label>
                <Input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Descrição / Resumo</Label>
                <Textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={2} className="text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Valor Total (R$)</Label>
                  <Input value={form.valorTotal} onChange={e => setForm(f => ({ ...f, valorTotal: e.target.value }))} className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Moeda</Label>
                  <Select value={form.moeda} onValueChange={v => setForm(f => ({ ...f, moeda: v }))}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">BRL</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Assinatura</Label>
                  <Input type="date" value={form.dataAssinatura} onChange={e => setForm(f => ({ ...f, dataAssinatura: e.target.value }))} className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Início</Label>
                  <Input type="date" value={form.dataInicio} onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))} className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Término</Label>
                  <Input type="date" value={form.dataFim} onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))} className="h-8 text-sm" />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Partes Envolvidas */}
        <Card>
          <CardHeader className="cursor-pointer py-3" onClick={() => toggleSection("partes")}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Partes Envolvidas
                {(contratante.razaoSocial || contratado.razaoSocial) && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-300">Identificadas pela IA</Badge>
                )}
              </CardTitle>
              {expandedSections.partes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </CardHeader>
          {expandedSections.partes && (
            <CardContent className="pt-0 space-y-4">
              {contratante.razaoSocial && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 mb-2">Contratante</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-500">Razão Social:</span> <span className="font-medium">{contratante.razaoSocial}</span></div>
                    <div><span className="text-gray-500">CNPJ:</span> <span className="font-mono font-medium">{contratante.cnpj}</span></div>
                    {contratante.representante && <div className="col-span-2"><span className="text-gray-500">Representante:</span> <span className="font-medium">{contratante.representante}</span></div>}
                  </div>
                </div>
              )}
              {contratado.razaoSocial && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-green-700 mb-2">Contratado</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-500">Razão Social:</span> <span className="font-medium">{contratado.razaoSocial}</span></div>
                    <div><span className="text-gray-500">CNPJ:</span> <span className="font-mono font-medium">{contratado.cnpj}</span></div>
                    {contratado.representante && <div className="col-span-2"><span className="text-gray-500">Representante:</span> <span className="font-medium">{contratado.representante}</span></div>}
                  </div>
                </div>
              )}
              {!contratante.razaoSocial && !contratado.razaoSocial && (
                <p className="text-xs text-gray-400 italic">Nenhuma parte identificada pela IA. Selecione o cliente no próximo passo.</p>
              )}
            </CardContent>
          )}
        </Card>

        {/* Marcos Financeiros */}
        <Card>
          <CardHeader className="cursor-pointer py-3" onClick={() => toggleSection("marcos")}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-600" />
                Marcos Financeiros
                <Badge variant="outline" className="text-xs">{marcos.length} identificado(s)</Badge>
              </CardTitle>
              {expandedSections.marcos ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </CardHeader>
          {expandedSections.marcos && (
            <CardContent className="pt-0 space-y-2">
              {marcos.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Nenhum marco financeiro identificado pela IA.</p>
              ) : (
                marcos.map((m, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border group">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <Input
                          value={m.titulo}
                          onChange={e => {
                            const updated = [...marcos];
                            updated[i] = { ...updated[i], titulo: e.target.value };
                            setMarcos(updated);
                          }}
                          className="h-7 text-sm font-medium border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:border-b"
                        />
                      </div>
                      <button
                        type="button"
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setMarcos(marcos.filter((_, j) => j !== i))}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-[10px] text-gray-400">Valor (R$)</Label>
                        <Input
                          value={m.valor || ""}
                          onChange={e => {
                            const updated = [...marcos];
                            updated[i] = { ...updated[i], valor: e.target.value };
                            setMarcos(updated);
                          }}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-400">Data Prevista</Label>
                        <Input
                          type="date"
                          value={m.dataPrevista || ""}
                          onChange={e => {
                            const updated = [...marcos];
                            updated[i] = { ...updated[i], dataPrevista: e.target.value };
                            setMarcos(updated);
                          }}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-400">% do Total</Label>
                        <Input
                          value={m.percentual ? `${m.percentual}%` : ""}
                          readOnly
                          className="h-7 text-xs bg-gray-100"
                        />
                      </div>
                    </div>
                    {m.descricao && (
                      <div className="mt-2">
                        <Label className="text-[10px] text-gray-400">Descrição</Label>
                        <Textarea
                          value={m.descricao}
                          onChange={e => {
                            const updated = [...marcos];
                            updated[i] = { ...updated[i], descricao: e.target.value };
                            setMarcos(updated);
                          }}
                          rows={1}
                          className="text-xs"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs border-dashed"
                onClick={() => setMarcos([...marcos, { titulo: `Marco ${marcos.length + 1}`, valor: "", dataPrevista: "", descricao: "" }])}
              >
                <Plus className="w-3 h-3 mr-1" /> Adicionar Marco
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Riscos */}
        <Card>
          <CardHeader className="cursor-pointer py-3" onClick={() => toggleSection("riscos")}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" />
                Riscos Identificados
                <Badge variant="outline" className="text-xs">{riscos.length} identificado(s)</Badge>
              </CardTitle>
              {expandedSections.riscos ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </CardHeader>
          {expandedSections.riscos && (
            <CardContent className="pt-0 space-y-2">
              {riscos.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Nenhum risco identificado pela IA.</p>
              ) : (
                riscos.map((r, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border group">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Input
                        value={r.titulo}
                        onChange={e => {
                          const updated = [...riscos];
                          updated[i] = { ...updated[i], titulo: e.target.value };
                          setRiscos(updated);
                        }}
                        className="h-7 text-sm font-medium border-0 bg-transparent p-0 focus-visible:ring-0"
                      />
                      <button
                        type="button"
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setRiscos(riscos.filter((_, j) => j !== i))}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-[10px] text-gray-400">Categoria</Label>
                        <Select value={r.categoria || "outro"} onValueChange={v => {
                          const updated = [...riscos];
                          updated[i] = { ...updated[i], categoria: v };
                          setRiscos(updated);
                        }}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="financeiro">Financeiro</SelectItem>
                            <SelectItem value="juridico">Jurídico</SelectItem>
                            <SelectItem value="operacional">Operacional</SelectItem>
                            <SelectItem value="prazo">Prazo</SelectItem>
                            <SelectItem value="escopo">Escopo</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-400">Probabilidade</Label>
                        <Select value={r.probabilidade || "media"} onValueChange={v => {
                          const updated = [...riscos];
                          updated[i] = { ...updated[i], probabilidade: v };
                          setRiscos(updated);
                        }}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baixa">Baixa</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-400">Impacto</Label>
                        <Select value={r.impacto || "medio"} onValueChange={v => {
                          const updated = [...riscos];
                          updated[i] = { ...updated[i], impacto: v };
                          setRiscos(updated);
                        }}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baixo">Baixo</SelectItem>
                            <SelectItem value="medio">Médio</SelectItem>
                            <SelectItem value="alto">Alto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {r.descricao && (
                      <Textarea
                        value={r.descricao}
                        onChange={e => {
                          const updated = [...riscos];
                          updated[i] = { ...updated[i], descricao: e.target.value };
                          setRiscos(updated);
                        }}
                        rows={1}
                        className="mt-2 text-xs"
                      />
                    )}
                    {r.acaoMitigacao && (
                      <div className="mt-2">
                        <Label className="text-[10px] text-gray-400">Ação de Mitigação</Label>
                        <p className="text-xs text-gray-600">{r.acaoMitigacao}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs border-dashed"
                onClick={() => setRiscos([...riscos, { titulo: `Risco ${riscos.length + 1}`, categoria: "outro", probabilidade: "media", impacto: "medio", descricao: "" }])}
              >
                <Plus className="w-3 h-3 mr-1" /> Adicionar Risco
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Cláusulas-Chave */}
        {clausulas.length > 0 && (
          <Card>
            <CardHeader className="cursor-pointer py-3" onClick={() => toggleSection("clausulas")}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-600" />
                  Cláusulas-Chave
                  <Badge variant="outline" className="text-xs">{clausulas.length}</Badge>
                </CardTitle>
                {expandedSections.clausulas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </CardHeader>
            {expandedSections.clausulas && (
              <CardContent className="pt-0 space-y-2">
                {clausulas.map((c: any, i: number) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg border text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] capitalize">{c.tipo || "geral"}</Badge>
                      <span className="font-medium text-gray-800">{c.titulo}</span>
                    </div>
                    <p className="text-gray-600">{c.descricao}</p>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        )}
      </div>
    );
  }

  // ─── STEP 3: Complementar Dados ──────────────────────────────────────────────
  function renderStep3() {
    return (
      <div className="space-y-4">
        {!modoManual && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-semibold">Dados da IA revisados</p>
              <p>Complete as informações abaixo que não foram identificadas automaticamente.</p>
            </div>
          </div>
        )}

        {modoManual && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Identificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Número do Contrato *</Label>
                    <Input placeholder="CT-2026-001" value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="servico">Serviço</SelectItem>
                        <SelectItem value="produto">Produto</SelectItem>
                        <SelectItem value="misto">Misto</SelectItem>
                        <SelectItem value="consultoria">Consultoria</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Título / Objeto *</Label>
                  <Input placeholder="Descreva o objeto do contrato" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea placeholder="Detalhes adicionais..." value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={3} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Valores e Datas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Valor Total</Label>
                    <Input type="number" placeholder="0.00" value={form.valorTotal} onChange={e => setForm(f => ({ ...f, valorTotal: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Moeda</Label>
                    <Select value={form.moeda} onValueChange={v => setForm(f => ({ ...f, moeda: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">BRL</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Assinatura</Label>
                    <Input type="date" value={form.dataAssinatura} onChange={e => setForm(f => ({ ...f, dataAssinatura: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Início</Label>
                    <Input type="date" value={form.dataInicio} onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Término</Label>
                    <Input type="date" value={form.dataFim} onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empresa e Cliente - always shown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Empresa e Cliente *
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Empresa Contratante</Label>
              <Select value={form.empresaId} onValueChange={v => setForm(f => ({ ...f, empresaId: v, clienteId: "" }))}>
                <SelectTrigger><SelectValue placeholder="Selecione a empresa" /></SelectTrigger>
                <SelectContent>
                  {empresas.map((e: any) => (
                    <SelectItem key={e.id} value={String(e.id)}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cliente / Contratado *</Label>
              <div className="relative mt-1 mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  placeholder="Filtrar por CNPJ, razão social ou nome fantasia..."
                  value={buscaCliente}
                  onChange={e => setBuscaCliente(e.target.value)}
                  className="pl-8 text-sm h-8"
                />
              </div>
              <Select value={form.clienteId} onValueChange={v => setForm(f => ({ ...f, clienteId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {clientesFiltrados.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      <span className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{c.nomeFantasia || c.razaoSocial}</span>
                        <span className="text-xs text-gray-400 font-mono ml-1">{c.cnpj}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between mt-1">
                {clientesFiltrados.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    Nenhum cliente encontrado.{" "}
                    <button type="button" className="text-blue-600 underline" onClick={() => navigate(`/empresa/${empresaId}/contratos/clientes`)}>
                      Cadastrar cliente
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">{clientesFiltrados.length} cliente(s)</p>
                )}
                <button type="button" className="text-xs text-indigo-600 flex items-center gap-1 hover:underline" onClick={() => navigate(`/empresa/${empresaId}/contratos/clientes`)}>
                  <ExternalLink className="w-3 h-3" /> Gerenciar
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Notas internas, condições especiais..." value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} rows={3} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── STEP 4: Confirmar ────────────────────────────────────────────────────────
  function renderStep4() {
    const valorTotal = parseFloat(form.valorTotal) || 0;
    const totalMarcos = marcos.reduce((s, m) => s + (parseFloat(m.valor) || 0), 0);

    return (
      <div className="space-y-4">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">Pronto para criar o contrato</p>
                <p className="text-xs text-green-700">Revise o resumo abaixo e confirme a criação.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Resumo do Contrato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <div><span className="text-gray-500 text-xs">Número:</span> <span className="font-medium">{form.numero || "—"}</span></div>
                <div><span className="text-gray-500 text-xs">Tipo:</span> <span className="font-medium capitalize">{form.tipo}</span></div>
                <div><span className="text-gray-500 text-xs">Início:</span> <span className="font-medium">{form.dataInicio || "—"}</span></div>
              </div>
              <div className="space-y-2">
                <div><span className="text-gray-500 text-xs">Valor:</span> <span className="font-semibold text-green-700">R$ {valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></div>
                <div><span className="text-gray-500 text-xs">Moeda:</span> <span className="font-medium">{form.moeda}</span></div>
                <div><span className="text-gray-500 text-xs">Término:</span> <span className="font-medium">{form.dataFim || "—"}</span></div>
              </div>
            </div>
            <Separator />
            <div><span className="text-gray-500 text-xs">Título:</span> <p className="text-sm font-medium mt-0.5">{form.titulo || "—"}</p></div>
            {form.descricao && (
              <div><span className="text-gray-500 text-xs">Descrição:</span> <p className="text-xs text-gray-600 mt-0.5">{form.descricao}</p></div>
            )}

            {form.clienteId && (
              <div>
                <span className="text-gray-500 text-xs">Cliente:</span>
                <p className="text-sm font-medium mt-0.5">
                  {clientes.find((c: any) => String(c.id) === form.clienteId)?.nomeFantasia
                    || clientes.find((c: any) => String(c.id) === form.clienteId)?.razaoSocial
                    || "—"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {marcos.length > 0 && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-600" />
                {marcos.length} Marco(s) Financeiro(s)
                <span className="text-xs text-gray-400 font-normal ml-auto">
                  Total: R$ {totalMarcos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  {valorTotal > 0 && ` (${((totalMarcos / valorTotal) * 100).toFixed(1)}%)`}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {marcos.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b last:border-0">
                    <span className="text-gray-700">{m.titulo}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">{m.dataPrevista || "—"}</span>
                      <span className="font-medium">R$ {(parseFloat(m.valor) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {riscos.length > 0 && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" />
                {riscos.length} Risco(s) Identificado(s)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {riscos.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b last:border-0">
                    <span className="text-gray-700">{r.titulo}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{r.categoria}</Badge>
                      <Badge className={`text-[10px] ${r.probabilidade === "alta" ? "bg-red-100 text-red-700" : r.probabilidade === "media" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                        {r.probabilidade}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {pdfUrl && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FileText className="w-3.5 h-3.5" />
                <span>PDF do contrato anexado</span>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 ml-auto">
                  <Eye className="w-3 h-3" /> Visualizar
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ─── NAVIGATION ──────────────────────────────────────────────────────────────
  const canGoNext = () => {
    if (step === 1) return !!iaResult || modoManual;
    if (step === 2) return true;
    if (step === 3) return !!(form.numero && form.titulo && form.empresaId && form.clienteId);
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/empresa/${empresaId}/contratos`)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Contratos
            </Button>
            <div className="h-5 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">Novo Contrato</h1>
              {!modoManual && <Badge className="bg-purple-100 text-purple-700 text-xs">Assistido por IA</Badge>}
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all w-full ${
                      isActive
                        ? "bg-purple-100 text-purple-800 font-semibold"
                        : isCompleted
                          ? "bg-green-50 text-green-700 cursor-pointer hover:bg-green-100"
                          : "text-gray-400"
                    }`}
                    onClick={() => isCompleted && setStep(s.id)}
                    disabled={!isCompleted && !isActive}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      isActive ? "bg-purple-600 text-white" : isCompleted ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
                    }`}>
                      {isCompleted ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                    </div>
                    <span className="hidden sm:inline truncate">{s.title}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`w-6 h-px mx-1 shrink-0 ${step > s.id ? "bg-green-300" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (step === 1) navigate(`/empresa/${empresaId}/contratos`);
              else if (modoManual && step === 3) setStep(1);
              else setStep(step - 1);
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {step === 1 ? "Cancelar" : "Voltar"}
          </Button>

          {step < 4 ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Avançar <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={createContrato.isPending || confirmarExtracao.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createContrato.isPending || confirmarExtracao.isPending ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Criando...</>
              ) : (
                <><Save className="w-4 h-4 mr-1" /> Criar Contrato</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
