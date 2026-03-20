import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Upload, Brain, FileText, CheckCircle2, Loader2, AlertTriangle, Save } from "lucide-react";

interface AditivoFormProps {
  empresaId: number;
  contratoId: number;
}

type Step = "upload" | "revisao" | "form";

export default function AditivoForm({ empresaId, contratoId }: AditivoFormProps) {
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [uploading, setUploading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfKey, setPdfKey] = useState("");
  const [dadosIA, setDadosIA] = useState<any>(null);

  const [form, setForm] = useState({
    numero: "",
    tipo: "financeiro" as "financeiro" | "escopo" | "prazo" | "misto",
    descricao: "",
    valorAditivo: "",
    novaDataFim: "",
    status: "rascunho" as "rascunho" | "aprovado" | "vigente" | "cancelado",
    resumoIA: "",
    dadosExtradosIA: "",
    iaRevisado: false,
  });

  const { data: contrato } = trpc.contratos.contratos.get.useQuery({ id: contratoId });
  const extrairPDF = trpc.contratos.contratos.extrairPDF.useMutation();
  const createAditivo = trpc.contratos.aditivos.create.useMutation({
    onSuccess: () => {
      toast.success("Aditivo criado com sucesso!");
      navigate(`/empresa/${empresaId}/contratos/${contratoId}`);
    },
    onError: (e) => toast.error("Erro ao criar aditivo: " + e.message),
  });

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 16 * 1024 * 1024) { toast.error("Arquivo muito grande (máx 16MB)"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Falha no upload");
      const { url, key } = await res.json();
      setPdfUrl(url);
      setPdfKey(key);
      toast.info("Analisando aditivo com IA...");
      const dados = await extrairPDF.mutateAsync({ pdfUrl: url, contratoId, tipo: "aditivo", tipoAditivo: "misto" }) as any;
      setDadosIA(dados);
      // Pré-preencher formulário com dados da IA
      setForm(prev => ({
        ...prev,
        descricao: dados.descricao ?? dados.resumo ?? prev.descricao,
        valorAditivo: dados.valorAditivo ?? prev.valorAditivo,
        novaDataFim: dados.novaDataFim ?? prev.novaDataFim,
        tipo: dados.tipoAditivo ?? prev.tipo,
        resumoIA: dados.resumo ?? "",
        dadosExtradosIA: JSON.stringify(dados),
      }));
      setStep("revisao");
    } catch (err: any) {
      toast.error("Erro ao processar PDF: " + (err.message ?? "Tente novamente"));
    } finally {
      setUploading(false);
    }
  }

  function handleConfirmarIA() {
    setForm(prev => ({ ...prev, iaRevisado: true }));
    setStep("form");
    toast.success("Dados da IA confirmados. Revise e salve o aditivo.");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.numero || !form.tipo) {
      toast.error("Preencha o número e tipo do aditivo");
      return;
    }
    createAditivo.mutate({
      contratoId,
      ...form,
      pdfUrl: pdfUrl || undefined,
      pdfKey: pdfKey || undefined,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/empresa/${empresaId}/contratos/${contratoId}`)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Contrato
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Novo Aditivo Contratual</h1>
            {contrato && <p className="text-sm text-gray-500">{contrato.numero} — {contrato.titulo}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* STEP 1: Upload PDF */}
        {step === "upload" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                Upload do Aditivo (PDF)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Faça upload do PDF do aditivo para extração automática dos dados com IA.
                Após a extração, você poderá revisar e confirmar os dados antes de salvar.
              </p>
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-sm font-medium text-blue-600">Analisando com IA...</p>
                    <p className="text-xs text-gray-400">Isso pode levar alguns segundos</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="w-10 h-10 text-gray-300" />
                    <p className="text-sm font-medium text-gray-600">Clique para selecionar o PDF do aditivo</p>
                    <p className="text-xs text-gray-400">Máximo 16MB</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">ou</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <Button variant="outline" className="w-full" onClick={() => setStep("form")}>
                Preencher manualmente sem PDF
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Revisão IA */}
        {step === "revisao" && dadosIA && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Revisão dos Dados Extraídos pela IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-purple-700">
                    Revise os dados extraídos pela IA antes de confirmar. Você poderá editar qualquer campo após a confirmação.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {dadosIA.resumo && (
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Resumo IA</Label>
                    <p className="text-sm text-gray-800 mt-1 bg-gray-50 p-3 rounded">{dadosIA.resumo}</p>
                  </div>
                )}
                {dadosIA.tipoAditivo && (
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Tipo Identificado</Label>
                    <p className="text-sm font-medium text-gray-800 mt-1 capitalize">{dadosIA.tipoAditivo}</p>
                  </div>
                )}
                {dadosIA.valorAditivo && (
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Valor do Aditivo</Label>
                    <p className="text-sm font-medium text-gray-800 mt-1">{dadosIA.valorAditivo}</p>
                  </div>
                )}
                {dadosIA.novaDataFim && (
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Nova Data de Término</Label>
                    <p className="text-sm font-medium text-gray-800 mt-1">{dadosIA.novaDataFim}</p>
                  </div>
                )}
                {dadosIA.marcos?.length > 0 && (
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Marcos Identificados ({dadosIA.marcos.length})</Label>
                    <div className="mt-1 space-y-1">
                      {dadosIA.marcos.map((m: any, i: number) => (
                        <div key={i} className="text-sm bg-gray-50 p-2 rounded flex justify-between">
                          <span>{m.titulo}</span>
                          {m.valorPrevisto && <span className="font-medium">{m.valorPrevisto}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep("upload")} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={handleConfirmarIA} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Confirmar e Preencher Formulário
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Formulário */}
        {step === "form" && (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Dados do Aditivo
                  {form.iaRevisado && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Brain className="w-3 h-3" /> Dados pré-preenchidos pela IA
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Número do Aditivo *</Label>
                    <Input
                      value={form.numero}
                      onChange={e => setForm(prev => ({ ...prev, numero: e.target.value }))}
                      placeholder="Ex: ADT-001"
                      required
                    />
                  </div>
                  <div>
                    <Label>Tipo *</Label>
                    <Select value={form.tipo} onValueChange={v => setForm(prev => ({ ...prev, tipo: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="escopo">Escopo</SelectItem>
                        <SelectItem value="prazo">Prazo</SelectItem>
                        <SelectItem value="misto">Misto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={form.descricao}
                    onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva o objeto do aditivo..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valor do Aditivo (R$)</Label>
                    <Input
                      value={form.valorAditivo}
                      onChange={e => setForm(prev => ({ ...prev, valorAditivo: e.target.value }))}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label>Nova Data de Término</Label>
                    <Input
                      type="date"
                      value={form.novaDataFim}
                      onChange={e => setForm(prev => ({ ...prev, novaDataFim: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(prev => ({ ...prev, status: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="vigente">Vigente</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.resumoIA && (
                  <div className="bg-purple-50 border border-purple-100 rounded p-3">
                    <p className="text-xs text-purple-600 font-medium mb-1">Resumo gerado pela IA</p>
                    <p className="text-sm text-purple-800">{form.resumoIA}</p>
                  </div>
                )}

                {pdfUrl && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded">
                    <FileText className="w-4 h-4" />
                    <span>PDF anexado ao aditivo</span>
                    <a href={pdfUrl} target="_blank" rel="noreferrer" className="underline ml-auto">Visualizar</a>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => navigate(`/empresa/${empresaId}/contratos/${contratoId}`)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createAditivo.isPending} className="flex-1">
                    {createAditivo.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                    Salvar Aditivo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}
