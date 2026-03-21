import { useState, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, FileText, Save, Search, Building2, ExternalLink,
  Upload, Brain, CheckCircle2, AlertCircle, X, Loader2, FileUp,
} from "lucide-react";

interface ContratoFormProps {
  empresaId: number;
}

export default function ContratoForm({ empresaId }: ContratoFormProps) {
  const [, navigate] = useLocation();
  const { data: empresas = [] } = trpc.empresas.list.useQuery();
  const { data: clientes = [] } = trpc.contratos.clientes.list.useQuery({ empresaId });

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
  const [iaRevisado, setIaRevisado] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extrairPDF = trpc.contratos.contratos.extrairPDF.useMutation();

  const createContrato = trpc.contratos.contratos.create.useMutation({
    onSuccess: (data: any) => {
      toast.success("Contrato criado com sucesso!");
      navigate(`/empresa/${empresaId}/contratos/${data.id}`);
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
    setIaRevisado(false);

    // Upload to S3
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-pdf", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Falha no upload");
      const { url } = await res.json();
      setPdfUrl(url);
      toast.success("PDF enviado. Iniciando extração por IA...");

      // Extract with AI
      setIsExtracting(true);
      const result = await extrairPDF.mutateAsync({ pdfUrl: url }) as any;
      setIaResult(result);
      // Pre-fill form with AI data
      if (result) {
        setForm(f => ({
          ...f,
          titulo: result.titulo || f.titulo,
          numero: result.numero || f.numero,
          valorTotal: result.valorTotal ? String(result.valorTotal) : f.valorTotal,
          dataInicio: result.dataInicio ? result.dataInicio.split("T")[0] : f.dataInicio,
          dataFim: result.dataFim ? result.dataFim.split("T")[0] : f.dataFim,
          descricao: result.resumo || f.descricao,
          tipo: result.tipo || f.tipo,
        }));
        toast.success("Dados extraídos pela IA. Revise antes de salvar.");
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.numero || !form.titulo || !form.empresaId || !form.clienteId) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    if (iaResult && !iaRevisado) {
      toast.error("Revise os dados extraídos pela IA antes de salvar");
      return;
    }
    createContrato.mutate({
      ...form,
      empresaId: parseInt(form.empresaId),
      clienteId: parseInt(form.clienteId),
      pdfUrl: pdfUrl ?? undefined,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/empresa/${empresaId}/contratos`)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Contratos
          </Button>
          <div className="h-5 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Novo Contrato</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* PDF Upload + IA */}
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                Documento do Contrato (PDF)
                <Badge variant="outline" className="text-purple-600 border-purple-300 text-xs">IA disponível</Badge>
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Faça upload do PDF para extração automática de dados. Você poderá preencher manualmente se preferir.
              </p>
            </CardHeader>
            <CardContent>
              {!pdfFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Arraste o PDF aqui ou clique para selecionar</p>
                  <p className="text-xs text-gray-400 mt-1">PDF até 16MB • A IA extrai valores, marcos e riscos automaticamente</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <FileText className="w-5 h-5 text-red-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{pdfFile.name}</p>
                      <p className="text-xs text-gray-400">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {(isUploading || isExtracting) ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    ) : iaResult ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : null}
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => { setPdfFile(null); setPdfUrl(null); setIaResult(null); setIaRevisado(false); }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {isUploading && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Enviando arquivo...
                    </div>
                  )}
                  {isExtracting && (
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Extraindo dados com IA...
                    </div>
                  )}

                  {iaResult && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <Brain className="w-3.5 h-3.5 text-purple-600" />
                          <span className="text-xs font-semibold text-purple-700">Dados extraídos pela IA</span>
                        </div>
                        {!iaRevisado && (
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">Revisão pendente</Badge>
                        )}
                        {iaRevisado && (
                          <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">Revisado</Badge>
                        )}
                      </div>
                      {iaResult.resumo && (
                        <p className="text-xs text-purple-800 mb-2">{iaResult.resumo}</p>
                      )}
                      <div className="grid grid-cols-2 gap-1 text-xs text-purple-700">
                        {iaResult.titulo && <span>• Título: {iaResult.titulo}</span>}
                        {iaResult.valorTotal && <span>• Valor: R$ {Number(iaResult.valorTotal).toLocaleString("pt-BR")}</span>}
                        {iaResult.marcos?.length > 0 && <span>• {iaResult.marcos.length} marco(s) identificado(s)</span>}
                        {iaResult.riscos?.length > 0 && <span>• {iaResult.riscos.length} risco(s) identificado(s)</span>}
                      </div>
                      {!iaRevisado && (
                        <Button
                          type="button"
                          size="sm"
                          className="mt-2 h-7 text-xs bg-purple-600 hover:bg-purple-700"
                          onClick={() => setIaRevisado(true)}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmar revisão dos dados
                        </Button>
                      )}
                    </div>
                  )}

                  {!iaResult && !isUploading && !isExtracting && pdfUrl && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Extração não disponível. Preencha os dados manualmente.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Número do Contrato *</Label>
                  <Input
                    placeholder="CT-2026-001"
                    value={form.numero}
                    onChange={(e) => setForm(f => ({ ...f, numero: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm(f => ({ ...f, tipo: v }))}>
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
                <Input
                  placeholder="Descreva o objeto do contrato"
                  value={form.titulo}
                  onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Detalhes adicionais sobre o contrato..."
                  value={form.descricao}
                  onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Partes Envolvidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Empresa Contratante *</Label>
                <Select value={form.empresaId} onValueChange={(v) => setForm(f => ({ ...f, empresaId: v, clienteId: "" }))}>
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
                    onChange={(e) => setBuscaCliente(e.target.value)}
                    className="pl-8 text-sm h-8"
                  />
                </div>
                <Select value={form.clienteId} onValueChange={(v) => setForm(f => ({ ...f, clienteId: v }))}>
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
                      <button
                        type="button"
                        className="text-blue-600 underline"
                        onClick={() => navigate(`/empresa/${empresaId}/contratos/clientes`)}
                      >
                        Cadastrar cliente
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">{clientesFiltrados.length} cliente(s) disponível(is)</p>
                  )}
                  <button
                    type="button"
                    className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"
                    onClick={() => navigate(`/empresa/${empresaId}/contratos/clientes`)}
                  >
                    <ExternalLink className="w-3 h-3" /> Gerenciar clientes
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Valores e Datas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor Total</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={form.valorTotal}
                    onChange={(e) => setForm(f => ({ ...f, valorTotal: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Moeda</Label>
                  <Select value={form.moeda} onValueChange={(v) => setForm(f => ({ ...f, moeda: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">BRL — Real</SelectItem>
                      <SelectItem value="USD">USD — Dólar</SelectItem>
                      <SelectItem value="EUR">EUR — Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Data de Assinatura</Label>
                  <Input
                    type="date"
                    value={form.dataAssinatura}
                    onChange={(e) => setForm(f => ({ ...f, dataAssinatura: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={form.dataInicio}
                    onChange={(e) => setForm(f => ({ ...f, dataInicio: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Data de Término</Label>
                  <Input
                    type="date"
                    value={form.dataFim}
                    onChange={(e) => setForm(f => ({ ...f, dataFim: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Notas internas, condições especiais..."
                value={form.observacoes}
                onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))}
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(`/empresa/${empresaId}/contratos`)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createContrato.isPending || isUploading || isExtracting}>
              <Save className="w-4 h-4 mr-1" />
              {createContrato.isPending ? "Salvando..." : "Criar Contrato"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
