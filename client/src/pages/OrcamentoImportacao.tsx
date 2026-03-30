import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Upload, FileText, CheckCircle, Download, Sparkles,
  Brain, FileSpreadsheet, FileSearch, ChevronDown, ChevronUp,
  Loader2, Info, RefreshCw, Check, ClipboardList, TrendingUp,
  DollarSign, ArrowDownCircle, ArrowUpCircle, BarChart3
} from "lucide-react";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MESES_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const CONFIANCA_CONFIG: Record<string, { label: string; cor: string }> = {
  alta:  { label: "Alta",  cor: "bg-green-100 text-green-700 border-green-200" },
  media: { label: "Média", cor: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  baixa: { label: "Baixa", cor: "bg-red-100 text-red-700 border-red-200" },
};

const TIPO_CONFIG: Record<string, { label: string; cor: string; icon: typeof TrendingUp }> = {
  receita:      { label: "Receita",      cor: "bg-green-100 text-green-700", icon: ArrowUpCircle },
  custo:        { label: "Custo",        cor: "bg-red-100 text-red-700", icon: ArrowDownCircle },
  despesa:      { label: "Despesa",      cor: "bg-orange-100 text-orange-700", icon: ArrowDownCircle },
  investimento: { label: "Investimento", cor: "bg-blue-100 text-blue-700", icon: BarChart3 },
  outro:        { label: "Outro",        cor: "bg-gray-100 text-gray-600", icon: DollarSign },
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

interface ItemPlanejadoIA {
  descricao: string;
  subcategoriaId?: number | null;
  subcategoriaNome?: string;
  janeiro: number; fevereiro: number; marco: number; abril: number;
  maio: number; junho: number; julho: number; agosto: number;
  setembro: number; outubro: number; novembro: number; dezembro: number;
  totalAnual: number;
  observacao?: string;
  selecionado?: boolean;
}

interface CategoriaIA {
  categoriaId: number | null;
  categoriaNome: string;
  categoriaTipo: string;
  itens: ItemPlanejadoIA[];
  expandida?: boolean;
}

interface Props {
  empresaId: number;
  ano: number;
}

export default function OrcamentoImportacao({ empresaId, ano }: Props) {
  const [activeTab, setActiveTab] = useState("planejado");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="planejado" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Gerar Orçamento por IA
          </TabsTrigger>
          <TabsTrigger value="executado" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Importar Executado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="planejado" className="mt-4">
          <GerarOrcamentoPlanejado empresaId={empresaId} ano={ano} />
        </TabsContent>

        <TabsContent value="executado" className="mt-4">
          <ImportarExecutado empresaId={empresaId} ano={ano} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GERAR ORÇAMENTO PLANEJADO POR IA
// ═══════════════════════════════════════════════════════════════════════════════
function GerarOrcamentoPlanejado({ empresaId, ano }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState<"upload" | "processando" | "preview" | "salvando" | "done">("upload");
  const [arquivoNome, setArquivoNome] = useState("");
  const [resumoIA, setResumoIA] = useState("");
  const [categoriasIA, setCategoriasIA] = useState<CategoriaIA[]>([]);
  const [totais, setTotais] = useState({ totalReceitas: 0, totalCustos: 0, totalDespesas: 0, totalInvestimentos: 0, resultadoLiquido: 0 });
  const [nomeVersao, setNomeVersao] = useState(`Orçamento ${ano} - IA`);
  const [versaoIdCriada, setVersaoIdCriada] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const gerarMutation = trpc.orcamento.gerarOrcamentoPlanejadoIA.useMutation({
    onSuccess: (data) => {
      const cats = (data.categorias as CategoriaIA[]).map((c) => ({
        ...c,
        expandida: true,
        itens: c.itens.map((i) => ({ ...i, selecionado: true })),
      }));
      setCategoriasIA(cats);
      setResumoIA(data.resumo);
      setTotais({
        totalReceitas: data.totalReceitas,
        totalCustos: data.totalCustos,
        totalDespesas: data.totalDespesas,
        totalInvestimentos: data.totalInvestimentos,
        resultadoLiquido: data.resultadoLiquido,
      });
      setStep("preview");
      const totalItens = cats.reduce((a, c) => a + c.itens.length, 0);
      toast.success(`IA gerou ${totalItens} itens orçamentários em ${cats.length} categorias!`);
    },
    onError: (e) => {
      toast.error("Erro ao processar com IA: " + e.message);
      setStep("upload");
    },
  });

  const confirmarMutation = trpc.orcamento.confirmarOrcamentoPlanejadoIA.useMutation({
    onSuccess: (data) => {
      setVersaoIdCriada(data.versaoId);
      setStep("done");
      toast.success(data.mensagem);
      utils.orcamento.getVersoesByEmpresa.invalidate({ empresaId });
      utils.orcamento.getDashboard.invalidate({ empresaId, ano });
    },
    onError: (e) => {
      toast.error("Erro ao salvar orçamento: " + e.message);
      setStep("preview");
    },
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
    setStep("processando");
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      gerarMutation.mutate({ empresaId, ano, arquivoBase64: base64, arquivoNome: file.name, arquivoTipo: tipo });
    };
    reader.readAsDataURL(file);
  };

  const toggleCategoria = (idx: number) => {
    setCategoriasIA((prev) => prev.map((c, i) => i === idx ? { ...c, expandida: !c.expandida } : c));
  };

  const toggleItem = (catIdx: number, itemIdx: number) => {
    setCategoriasIA((prev) => prev.map((c, ci) =>
      ci === catIdx ? { ...c, itens: c.itens.map((it, ii) => ii === itemIdx ? { ...it, selecionado: !it.selecionado } : it) } : c
    ));
  };

  const confirmarOrcamento = () => {
    const catsFiltradas = categoriasIA
      .map((c) => ({
        categoriaId: c.categoriaId,
        categoriaNome: c.categoriaNome,
        categoriaTipo: c.categoriaTipo as "receita" | "custo" | "despesa" | "investimento" | "outro",
        itens: c.itens.filter((i) => i.selecionado).map((i) => ({
          descricao: i.descricao,
          subcategoriaId: i.subcategoriaId ?? null,
          subcategoriaNome: i.subcategoriaNome,
          janeiro: i.janeiro, fevereiro: i.fevereiro, marco: i.marco, abril: i.abril,
          maio: i.maio, junho: i.junho, julho: i.julho, agosto: i.agosto,
          setembro: i.setembro, outubro: i.outubro, novembro: i.novembro, dezembro: i.dezembro,
        })),
      }))
      .filter((c) => c.itens.length > 0);

    if (catsFiltradas.length === 0) {
      toast.error("Selecione ao menos um item para gerar o orçamento.");
      return;
    }
    setStep("salvando");
    confirmarMutation.mutate({ empresaId, ano, nomeVersao, categorias: catsFiltradas });
  };

  const totalItensSelecionados = categoriasIA.reduce((a, c) => a + c.itens.filter((i) => i.selecionado).length, 0);
  const totalItens = categoriasIA.reduce((a, c) => a + c.itens.length, 0);
  const formatCurrency = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Gerar Orçamento Planejado com IA
          </h3>
          <p className="text-sm text-muted-foreground">
            Envie um PDF, planilha Excel ou CSV — a IA gera categorias, itens e valores mensais automaticamente
          </p>
        </div>
        {step !== "upload" && step !== "processando" && step !== "salvando" && (
          <Button variant="outline" size="sm" onClick={() => { setStep("upload"); setCategoriasIA([]); setArquivoNome(""); setResumoIA(""); }}>
            <RefreshCw className="h-4 w-4 mr-2" /> Novo Upload
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
                  <p className="font-semibold text-base">Arraste o arquivo orçamentário aqui ou clique para selecionar</p>
                  <p className="text-sm text-muted-foreground mt-1">Suporta PDF, Excel (.xlsx/.xls) e CSV com dados orçamentários</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  A IA extrai categorias, itens e valores mensais para criar uma versão orçamentária completa
                </div>
              </div>
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.xlsx,.xls,.csv,.txt"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
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
                <p className="font-semibold text-base">IA gerando orçamento planejado...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Analisando <strong>{arquivoNome}</strong> e estruturando categorias e valores mensais
                </p>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground flex-wrap justify-center">
                <span className="px-3 py-1 rounded-full bg-muted">Extraindo dados</span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">Gerando categorias</span>
                <span className="px-3 py-1 rounded-full bg-muted">Distribuindo valores mensais</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <div className="space-y-4">
          {/* Resumo IA */}
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

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="py-3 px-4 text-center">
                <p className="text-xs text-green-600 font-medium">Receitas</p>
                <p className="text-sm font-bold text-green-700">{formatCurrency(totais.totalReceitas)}</p>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-3 px-4 text-center">
                <p className="text-xs text-red-600 font-medium">Custos</p>
                <p className="text-sm font-bold text-red-700">{formatCurrency(totais.totalCustos)}</p>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="py-3 px-4 text-center">
                <p className="text-xs text-orange-600 font-medium">Despesas</p>
                <p className="text-sm font-bold text-orange-700">{formatCurrency(totais.totalDespesas)}</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="py-3 px-4 text-center">
                <p className="text-xs text-blue-600 font-medium">Investimentos</p>
                <p className="text-sm font-bold text-blue-700">{formatCurrency(totais.totalInvestimentos)}</p>
              </CardContent>
            </Card>
            <Card className={`${totais.resultadoLiquido >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <CardContent className="py-3 px-4 text-center">
                <p className={`text-xs font-medium ${totais.resultadoLiquido >= 0 ? "text-green-600" : "text-red-600"}`}>Resultado</p>
                <p className={`text-sm font-bold ${totais.resultadoLiquido >= 0 ? "text-green-700" : "text-red-700"}`}>{formatCurrency(totais.resultadoLiquido)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Nome da versão */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="flex-1 w-full sm:max-w-sm">
              <Label className="text-xs font-medium">Nome da Versão Orçamentária</Label>
              <Input
                value={nomeVersao}
                onChange={(e) => setNomeVersao(e.target.value)}
                className="mt-1 h-9"
                placeholder="Ex: Orçamento 2026 - Versão 1"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{totalItensSelecionados} de {totalItens} itens</span>
              <Button onClick={confirmarOrcamento} disabled={totalItensSelecionados === 0}>
                <Check className="h-4 w-4 mr-2" /> Gerar Orçamento ({totalItensSelecionados} itens)
              </Button>
            </div>
          </div>

          {/* Categorias e Itens */}
          <div className="space-y-3">
            {categoriasIA.map((cat, catIdx) => {
              const tipoCfg = TIPO_CONFIG[cat.categoriaTipo] ?? TIPO_CONFIG.outro;
              const TipoIcon = tipoCfg.icon;
              const itensSelecionados = cat.itens.filter((i) => i.selecionado).length;
              const totalCat = cat.itens.filter((i) => i.selecionado).reduce((a, i) => a + i.totalAnual, 0);

              return (
                <Card key={catIdx} className="overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleCategoria(catIdx)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tipoCfg.cor}`}>
                        <TipoIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{cat.categoriaNome}</span>
                          <Badge variant="outline" className={`text-xs ${tipoCfg.cor}`}>{tipoCfg.label}</Badge>
                          {cat.categoriaId && <Badge variant="outline" className="text-xs bg-muted">Existente</Badge>}
                          {!cat.categoriaId && <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">Nova</Badge>}
                        </div>
                        <span className="text-xs text-muted-foreground">{itensSelecionados}/{cat.itens.length} itens — {formatCurrency(totalCat)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{formatCurrency(totalCat)}</span>
                      {cat.expandida ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {cat.expandida && (
                    <div className="border-t">
                      {/* Header da tabela */}
                      <div className="grid grid-cols-[auto_1fr_repeat(12,minmax(0,1fr))_auto] gap-0 text-xs font-medium text-muted-foreground bg-muted/40 px-4 py-2 overflow-x-auto">
                        <div className="w-6" />
                        <div className="min-w-[140px] pl-2">Item</div>
                        {MESES_SHORT.map((m) => <div key={m} className="text-right px-1">{m}</div>)}
                        <div className="text-right min-w-[80px] pl-2">Total</div>
                      </div>
                      {/* Itens */}
                      {cat.itens.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className={`grid grid-cols-[auto_1fr_repeat(12,minmax(0,1fr))_auto] gap-0 text-xs px-4 py-2 border-t border-border/50 transition-all ${
                            item.selecionado ? "" : "opacity-40"
                          }`}
                        >
                          <div className="flex items-center w-6">
                            <input
                              type="checkbox"
                              checked={item.selecionado ?? true}
                              onChange={() => toggleItem(catIdx, itemIdx)}
                              className="h-3.5 w-3.5 rounded accent-primary"
                            />
                          </div>
                          <div className="min-w-[140px] pl-2 truncate font-medium" title={item.descricao}>
                            {item.descricao}
                            {item.subcategoriaNome && <span className="text-muted-foreground font-normal ml-1">({item.subcategoriaNome})</span>}
                          </div>
                          {[item.janeiro, item.fevereiro, item.marco, item.abril, item.maio, item.junho,
                            item.julho, item.agosto, item.setembro, item.outubro, item.novembro, item.dezembro
                          ].map((v, mi) => (
                            <div key={mi} className="text-right px-1 tabular-nums">
                              {v > 0 ? (v / 1000).toFixed(1) + "k" : "—"}
                            </div>
                          ))}
                          <div className="text-right min-w-[80px] pl-2 font-semibold tabular-nums">
                            {formatCurrency(item.totalAnual)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Step: Salvando */}
      {step === "salvando" && (
        <Card>
          <CardContent className="py-16 text-center">
            <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin mb-4" />
            <p className="font-semibold">Gerando orçamento planejado...</p>
            <p className="text-sm text-muted-foreground mt-1">Criando versão, categorias e linhas orçamentárias no sistema</p>
          </CardContent>
        </Card>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-10 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
            <p className="font-semibold text-green-800 text-lg">Orçamento gerado com sucesso!</p>
            <p className="text-sm text-green-700 mt-1">
              A versão "{nomeVersao}" foi criada e está disponível na aba Planejado e no Dashboard.
            </p>
            <div className="flex gap-3 justify-center mt-4">
              <Button variant="outline" onClick={() => { setStep("upload"); setCategoriasIA([]); setArquivoNome(""); setResumoIA(""); }}>
                <Upload className="h-4 w-4 mr-2" /> Novo Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTAR EXECUTADO (funcionalidade original)
// ═══════════════════════════════════════════════════════════════════════════════
function ImportarExecutado({ empresaId, ano }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState<"upload" | "processando" | "preview" | "importando" | "done">("upload");
  const [arquivoNome, setArquivoNome] = useState("");
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
    setStep("processando");
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      importarIAMutation.mutate({ empresaId, ano, arquivoBase64: base64, arquivoNome: file.name, arquivoTipo: tipo });
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
            Importação de Lançamentos Executados
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
                          {l.competencia && <span>{l.competencia}</span>}
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
