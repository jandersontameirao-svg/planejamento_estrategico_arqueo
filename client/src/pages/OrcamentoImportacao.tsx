import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Upload, FileText, CheckCircle, Download, Sparkles,
  Brain, FileSpreadsheet, FileSearch, ChevronDown, ChevronUp,
  Loader2, Info, RefreshCw, Check
} from "lucide-react";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const CONFIANCA_CONFIG: Record<string, { label: string; cor: string }> = {
  alta:  { label: "Alta",  cor: "bg-green-100 text-green-700 border-green-200" },
  media: { label: "Média", cor: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  baixa: { label: "Baixa", cor: "bg-red-100 text-red-700 border-red-200" },
};

const TIPO_CONFIG: Record<string, { label: string; cor: string }> = {
  receita:      { label: "Receita",      cor: "bg-green-100 text-green-700" },
  custo:        { label: "Custo",        cor: "bg-red-100 text-red-700" },
  despesa:      { label: "Despesa",      cor: "bg-orange-100 text-orange-700" },
  investimento: { label: "Investimento", cor: "bg-blue-100 text-blue-700" },
  outro:        { label: "Outro",        cor: "bg-gray-100 text-gray-600" },
};

interface LancamentoIA {
  descricao: string;
  valor: number;
  competencia: string;
  tipo: string;
  categoriaId: number | null;
  categoriaNome: string;
  subcategoriaId: number | null;
  subcategoriaNome: string;
  confianca: "alta" | "media" | "baixa";
  observacao: string;
  selecionado?: boolean;
}

interface Props {
  empresaId: number;
  ano: number;
}

export default function OrcamentoImportacao({ empresaId, ano }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState<"upload" | "processando" | "preview" | "importando" | "done">("upload");
  const [arquivoNome, setArquivoNome] = useState("");
  const [arquivoTipo, setArquivoTipo] = useState("");
  const [resumoIA, setResumoIA] = useState("");
  const [lancamentosIA, setLancamentosIA] = useState<LancamentoIA[]>([]);
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());
  const [mesReferencia, setMesReferencia] = useState<string>("");
  const [moedaLote, setMoedaLote] = useState("BRL");

  const { data: importacoes, refetch } = trpc.orcamento.getImportacoesByEmpresa.useQuery({ empresaId });

  const importarIAMutation = trpc.orcamento.importarOrcamentoIA.useMutation({
    onSuccess: (data) => {
      const lancamentos = (data.lancamentos as LancamentoIA[]).map((l) => ({ ...l, selecionado: true }));
      setLancamentosIA(lancamentos);
      setResumoIA(data.resumo);
      setStep("preview");
      toast.success(`IA identificou ${data.totalItens} lançamentos no arquivo!`);
    },
    onError: (e) => {
      toast.error("Erro ao processar com IA: " + e.message);
      setStep("upload");
    },
  });

  const importarMutation = trpc.orcamento.importarExecutado.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.totalImportado} lançamentos importados com sucesso!`);
      setStep("done");
      refetch();
    },
    onError: (e) => toast.error("Erro na importação: " + e.message),
  });

  const getFileType = (nome: string): string => {
    const ext = nome.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "pdf") return "pdf";
    if (ext === "xlsx" || ext === "xls") return ext;
    return "csv";
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    const tipo = getFileType(file.name);
    setArquivoNome(file.name);
    setArquivoTipo(tipo);
    setStep("processando");

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      importarIAMutation.mutate({
        empresaId,
        ano,
        arquivoBase64: base64,
        arquivoNome: file.name,
        arquivoTipo: tipo,
      });
    };
    reader.readAsDataURL(file);
  };

  const toggleExpandido = (idx: number) => {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const toggleSelecionado = (idx: number) => {
    setLancamentosIA((prev) => prev.map((l, i) => i === idx ? { ...l, selecionado: !l.selecionado } : l));
  };

  const selecionarTodos = (valor: boolean) => {
    setLancamentosIA((prev) => prev.map((l) => ({ ...l, selecionado: valor })));
  };

  const confirmarImportacao = () => {
    const selecionados = lancamentosIA.filter((l) => l.selecionado);
    if (selecionados.length === 0) {
      toast.error("Selecione ao menos um lançamento para importar.");
      return;
    }
    setStep("importando");
    importarMutation.mutate({
      empresaId,
      ano,
      arquivoNome,
      moedaLote,
      mesReferencia: mesReferencia ? parseInt(mesReferencia) : undefined,
      linhas: selecionados.map((l) => ({
        descricao: l.descricao,
        valorOriginal: l.valor,
        competencia: l.competencia || `${ano}-01`,
        categoriaId: l.categoriaId ?? undefined,
        subcategoriaId: l.subcategoriaId ?? undefined,
        moedaOriginal: moedaLote,
      })),
    });
  };

  const selecionadosCount = lancamentosIA.filter((l) => l.selecionado).length;
  const totalSelecionado = lancamentosIA.filter((l) => l.selecionado).reduce((a, l) => a + l.valor, 0);
  const formatCurrency = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Importação Inteligente com IA
          </h3>
          <p className="text-sm text-muted-foreground">
            Envie um PDF, planilha Excel ou CSV — a IA identifica e categoriza os lançamentos automaticamente
          </p>
        </div>
        {step !== "upload" && step !== "processando" && (
          <Button variant="outline" size="sm" onClick={() => { setStep("upload"); setLancamentosIA([]); setArquivoNome(""); }}>
            <RefreshCw className="h-4 w-4 mr-2" /> Nova Importação
          </Button>
        )}
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <Card>
          <CardContent className="pt-6">
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => fileRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-3">
                  <div className="p-3 rounded-xl bg-red-100 text-red-600"><FileText className="h-6 w-6" /></div>
                  <div className="p-3 rounded-xl bg-green-100 text-green-600"><FileSpreadsheet className="h-6 w-6" /></div>
                  <div className="p-3 rounded-xl bg-blue-100 text-blue-600"><FileSearch className="h-6 w-6" /></div>
                </div>
                <div>
                  <p className="font-semibold text-base">Arraste o arquivo aqui ou clique para selecionar</p>
                  <p className="text-sm text-muted-foreground mt-1">Suporta PDF, Excel (.xlsx/.xls) e CSV</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  A IA analisa o conteúdo e sugere categorias e subcategorias automaticamente
                </div>
              </div>
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.xlsx,.xls,.csv,.txt"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Mês de referência (opcional)</Label>
                <Select value={mesReferencia} onValueChange={setMesReferencia}>
                  <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue placeholder="Detectar automaticamente" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Detectar automaticamente</SelectItem>
                    {MESES.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Moeda</Label>
                <Select value={moedaLote} onValueChange={setMoedaLote}>
                  <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL — Real Brasileiro</SelectItem>
                    <SelectItem value="USD">USD — Dólar Americano</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Processando */}
      {step === "processando" && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="p-4 rounded-full bg-primary/10">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 p-1 rounded-full bg-primary">
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-base">IA analisando o arquivo...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Extraindo dados de <strong>{arquivoNome}</strong> e identificando categorias
                </p>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground flex-wrap justify-center">
                <span className="px-3 py-1 rounded-full bg-muted">Lendo estrutura</span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">Classificando lançamentos</span>
                <span className="px-3 py-1 rounded-full bg-muted">Sugerindo categorias</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <div className="space-y-4">
          {resumoIA && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-3 px-4">
                <div className="flex gap-2 items-start">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{resumoIA}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{selecionadosCount} de {lancamentosIA.length} selecionados</span>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => selecionarTodos(true)}>Todos</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => selecionarTodos(false)}>Nenhum</Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Total: <strong>{formatCurrency(totalSelecionado)}</strong></span>
              <Button onClick={confirmarImportacao} disabled={selecionadosCount === 0}>
                <Check className="h-4 w-4 mr-2" /> Importar {selecionadosCount} lançamentos
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {lancamentosIA.map((l, idx) => {
              const expanded = expandidos.has(idx);
              const confCfg = CONFIANCA_CONFIG[l.confianca] ?? CONFIANCA_CONFIG.media;
              const tipoCfg = TIPO_CONFIG[l.tipo] ?? TIPO_CONFIG.outro;
              return (
                <Card key={idx} className={`transition-all ${l.selecionado ? "border-primary/30" : "opacity-60"}`}>
                  <div className="p-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={l.selecionado ?? true}
                        onChange={() => toggleSelecionado(idx)}
                        className="h-4 w-4 rounded accent-primary shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate max-w-[200px]">{l.descricao}</span>
                          <Badge variant="outline" className={`text-xs ${tipoCfg.cor}`}>{tipoCfg.label}</Badge>
                          <Badge variant="outline" className={`text-xs ${confCfg.cor}`}>
                            <Sparkles className="h-2.5 w-2.5 mr-1" /> {confCfg.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                          <span>{l.categoriaNome || "Sem categoria"}</span>
                          {l.subcategoriaNome && <span>› {l.subcategoriaNome}</span>}
                          {l.competencia && <span>📅 {l.competencia}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-semibold text-sm">{formatCurrency(l.valor)}</span>
                        <button onClick={() => toggleExpandido(idx)} className="text-muted-foreground hover:text-foreground">
                          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    {expanded && l.observacao && (
                      <div className="mt-2 ml-7 p-2 rounded bg-muted/40 text-xs text-muted-foreground flex gap-2">
                        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{l.observacao}</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Step: Importando */}
      {step === "importando" && (
        <Card>
          <CardContent className="py-16 text-center">
            <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin mb-4" />
            <p className="font-semibold">Importando lançamentos...</p>
            <p className="text-sm text-muted-foreground mt-1">Salvando {selecionadosCount} lançamentos no banco de dados</p>
          </CardContent>
        </Card>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-10 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
            <p className="font-semibold text-green-800 text-lg">Importação concluída!</p>
            <p className="text-sm text-green-700 mt-1">Os lançamentos foram importados e estão disponíveis no Dashboard e na aba Executado.</p>
            <Button className="mt-4" onClick={() => { setStep("upload"); setLancamentosIA([]); setArquivoNome(""); }}>
              <Upload className="h-4 w-4 mr-2" /> Nova Importação
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Histórico */}
      {importacoes && importacoes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Download className="h-4 w-4" /> Histórico de Importações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(importacoes as any[]).map((imp: any) => (
                <div key={imp.id} className="flex items-center justify-between p-2 rounded border text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{imp.arquivoNome || "Importação manual"}</span>
                    {imp.mesReferencia && <Badge variant="outline" className="text-xs">{MESES[imp.mesReferencia - 1]}</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <span>{imp.totalLinhas ?? 0} lançamentos</span>
                    <span>{new Date(imp.criadoEm ?? imp.createdAt).toLocaleDateString("pt-BR")}</span>
                    <Badge variant="outline" className={imp.status === "concluido" ? "text-green-700 border-green-200" : ""}>
                      {imp.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
