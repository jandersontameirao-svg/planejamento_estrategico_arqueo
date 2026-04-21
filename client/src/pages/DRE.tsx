import { useState, useMemo, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft, Upload, FileSpreadsheet, FileText, TrendingUp, TrendingDown,
  BarChart3, Brain, DollarSign, Percent, AlertTriangle, CheckCircle2,
  Loader2, ChevronDown, ChevronUp, Download, RefreshCw, Eye, Trash2,
  Info, Calculator, Target, Activity,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, AreaChart, Area, ComposedChart, Cell, PieChart, Pie,
} from "recharts";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatCurrency(v: number | undefined | null) {
  if (v == null) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}
function formatPercent(v: number | undefined | null) {
  if (v == null) return "0,0%";
  return v.toFixed(1).replace(".", ",") + "%";
}

// ─── Componente: Visão Geral ──────────────────────────────────────────────────
function VisaoGeral({ empresaId, ano }: { empresaId: number; ano: number }) {
  const { data: consolidado, isLoading } = trpc.dre.getDadosConsolidados.useQuery({
    empresaId, ano, tipoLancamento: "realizado",
  });
  const { data: comparativo } = trpc.dre.getComparativo.useQuery({
    empresaId, ano, anoAnterior: ano - 1,
  });

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!consolidado || Object.keys(consolidado.porMes).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BarChart3 className="h-16 w-16 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">Nenhum dado de DRE encontrado</h3>
        <p className="text-sm text-muted-foreground mt-1">Importe dados na aba "Upload" ou lance manualmente na aba "DRE Detalhada".</p>
      </div>
    );
  }

  const ind = consolidado.indicadores;
  const acum = consolidado.acumulado;

  // Dados para gráfico mensal
  const chartData = Object.entries(consolidado.porMes).map(([mes, dados]) => ({
    mes: MESES[Number(mes) - 1],
    receita: dados.receita_liquida || 0,
    ebitda: dados.ebitda || 0,
    lucro: dados.lucro_liquido || 0,
  })).sort((a, b) => MESES.indexOf(a.mes) - MESES.indexOf(b.mes));

  // Variação YoY
  const varReceita = comparativo?.anterior?.receita_liquida
    ? ((acum.receita_liquida - comparativo.anterior.receita_liquida) / Math.abs(comparativo.anterior.receita_liquida)) * 100
    : null;
  const varLucro = comparativo?.anterior?.lucro_liquido
    ? ((acum.lucro_liquido - comparativo.anterior.lucro_liquido) / Math.abs(comparativo.anterior.lucro_liquido)) * 100
    : null;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs font-medium text-muted-foreground">Receita Líquida</p>
            <p className="text-xl font-bold">{formatCurrency(acum.receita_liquida)}</p>
            {varReceita !== null && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${varReceita >= 0 ? "text-green-600" : "text-red-600"}`}>
                {varReceita >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {formatPercent(varReceita)} vs {ano - 1}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs font-medium text-muted-foreground">EBITDA</p>
            <p className="text-xl font-bold">{formatCurrency(acum.ebitda)}</p>
            <p className="text-xs text-muted-foreground mt-1">Margem: {formatPercent(ind.margemEbitda)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs font-medium text-muted-foreground">Lucro Líquido</p>
            <p className="text-xl font-bold">{formatCurrency(acum.lucro_liquido)}</p>
            {varLucro !== null && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${varLucro >= 0 ? "text-green-600" : "text-red-600"}`}>
                {varLucro >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {formatPercent(varLucro)} vs {ano - 1}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs font-medium text-muted-foreground">Margem Líquida</p>
            <p className="text-xl font-bold">{formatPercent(ind.margemLiquida)}</p>
            <p className="text-xs text-muted-foreground mt-1">Bruta: {formatPercent(ind.margemBruta)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Evolução Mensal */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Evolução Mensal</CardTitle>
          <CardDescription>Receita Líquida, EBITDA e Lucro Líquido</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="receita" name="Receita Líq." fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Line dataKey="ebitda" name="EBITDA" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line dataKey="lucro" name="Lucro Líq." stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Indicadores de Margem */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Indicadores de Margem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Margem Bruta", value: ind.margemBruta, color: "bg-blue-100 text-blue-700", benchmark: 40 },
              { label: "Margem EBITDA", value: ind.margemEbitda, color: "bg-amber-100 text-amber-700", benchmark: 20 },
              { label: "Margem Operacional", value: ind.margemOperacional, color: "bg-purple-100 text-purple-700", benchmark: 15 },
              { label: "Margem Líquida", value: ind.margemLiquida, color: "bg-green-100 text-green-700", benchmark: 10 },
            ].map((m) => (
              <div key={m.label} className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                <p className={`text-2xl font-bold ${m.value >= m.benchmark ? "text-green-600" : m.value >= 0 ? "text-amber-600" : "text-red-600"}`}>
                  {formatPercent(m.value)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">Ref: {m.benchmark}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumo DRE Simplificado */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">DRE Resumida — Acumulado {ano}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Linha</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">% Receita Líq.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { id: "receita_bruta", nome: "Receita Bruta", bold: true },
                { id: "deducoes_receita", nome: "(-) Deduções" },
                { id: "receita_liquida", nome: "= Receita Líquida", bold: true, highlight: true },
                { id: "lucro_bruto", nome: "= Lucro Bruto", bold: true, highlight: true },
                { id: "ebitda", nome: "= EBITDA", bold: true, highlight: true },
                { id: "ebit", nome: "= EBIT", bold: true },
                { id: "lucro_antes_ir", nome: "= Lucro Antes IR", bold: true },
                { id: "lucro_liquido", nome: "= Lucro Líquido", bold: true, highlight: true },
              ].map((l) => {
                const val = acum[l.id] || 0;
                const pct = acum.receita_liquida ? (val / acum.receita_liquida) * 100 : 0;
                return (
                  <TableRow key={l.id} className={l.highlight ? "bg-muted/30" : ""}>
                    <TableCell className={l.bold ? "font-semibold" : "pl-6"}>{l.nome}</TableCell>
                    <TableCell className={`text-right ${l.bold ? "font-semibold" : ""} ${val < 0 ? "text-red-600" : ""}`}>
                      {formatCurrency(val)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatPercent(pct)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Componente: DRE Detalhada (Lançamento Manual) ────────────────────────────
function DREDetalhada({ empresaId, ano }: { empresaId: number; ano: number }) {
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [tipoLancamento, setTipoLancamento] = useState<"realizado" | "orcado">("realizado");
  const { data: linhas } = trpc.dre.getLinhasDre.useQuery();
  const { data: dados, refetch } = trpc.dre.getDados.useQuery({
    empresaId, ano, mes: mesSelecionado, tipoLancamento,
  });
  const { data: natureza } = trpc.dre.getNatureza.useQuery({ empresaId });
  const salvarMut = trpc.dre.salvarDados.useMutation({
    onSuccess: () => { toast.success("Dados salvos com sucesso!"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const [valores, setValores] = useState<Record<string, number>>({});
  const linhasInput = useMemo(() => {
    if (!linhas) return [];
    return linhas.filter((l: any) => {
      if ("calculada" in l) return false;
      if ("natureza" in l) {
        const nat = natureza?.natureza || "servico";
        if (l.natureza === "produto" && nat !== "produto") return false;
        if (l.natureza === "servico" && nat !== "servico") return false;
      }
      return true;
    });
  }, [linhas, natureza]);

  // Preencher valores existentes
  useMemo(() => {
    if (!dados || dados.length === 0) return;
    const map: Record<string, number> = {};
    for (const d of dados) map[d.linhaDre] = parseFloat(String(d.valor));
    setValores(map);
  }, [dados]);

  const handleSalvar = () => {
    const linhasParaSalvar = Object.entries(valores)
      .filter(([_, v]) => v !== 0)
      .map(([linhaDre, valor]) => ({ linhaDre, valor }));
    salvarMut.mutate({ empresaId, ano, mes: mesSelecionado, tipoLancamento, linhas: linhasParaSalvar });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <Label className="text-xs">Mês</Label>
          <Select value={String(mesSelecionado)} onValueChange={(v) => setMesSelecionado(Number(v))}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MESES.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Tipo</Label>
          <Select value={tipoLancamento} onValueChange={(v) => setTipoLancamento(v as any)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="realizado">Realizado</SelectItem>
              <SelectItem value="orcado">Orçado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Badge variant="outline" className="mb-1">
          {natureza?.natureza === "produto" ? "Produto (CMV)" : "Serviço (CSP)"}
        </Badge>
      </div>

      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Linha da DRE</TableHead>
                <TableHead className="text-right">Valor (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhasInput.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium text-sm">{l.nome}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      step="0.01"
                      className="w-40 ml-auto text-right"
                      value={valores[l.id] ?? ""}
                      onChange={(e) => setValores(prev => ({ ...prev, [l.id]: parseFloat(e.target.value) || 0 }))}
                      placeholder="0,00"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSalvar} disabled={salvarMut.isPending}>
              {salvarMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Salvar {tipoLancamento === "realizado" ? "Realizado" : "Orçado"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Componente: Upload e Importação ──────────────────────────────────────────
function UploadImportacao({ empresaId }: { empresaId: number }) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [dadosExtraidos, setDadosExtraidos] = useState<any>(null);
  const [uploadAtual, setUploadAtual] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anoImport, setAnoImport] = useState(new Date().getFullYear());
  const [mesImport, setMesImport] = useState(new Date().getMonth() + 1);

  const { data: uploads, refetch } = trpc.dre.getUploads.useQuery({ empresaId });
  const registrarMut = trpc.dre.registrarUpload.useMutation();
  const processarMut = trpc.dre.processarArquivo.useMutation();
  const confirmarMut = trpc.dre.confirmarImportacao.useMutation({
    onSuccess: () => {
      toast.success("Dados importados com sucesso!");
      setDialogOpen(false);
      setDadosExtraidos(null);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["pdf", "xlsx", "xls", "csv"].includes(ext)) {
      toast.error("Formato não suportado. Use PDF, XLSX, XLS ou CSV.");
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 16MB.");
      return;
    }
    setUploading(true);
    try {
      // Upload para S3
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const { url, key } = await res.json();
      // Registrar no banco
      const result = await registrarMut.mutateAsync({
        empresaId,
        nomeArquivo: file.name,
        tipoArquivo: ext,
        tamanhoBytes: file.size,
        urlArquivo: url,
        s3Key: key,
      });
      toast.success("Arquivo enviado! Processando com IA...");
      // Processar com IA
      setProcessando(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        try {
          const dados = await processarMut.mutateAsync({
            uploadId: result.id,
            arquivoBase64: base64,
            arquivoTipo: ext,
            empresaId,
          });
          setDadosExtraidos(dados);
          setUploadAtual({ id: result.id, nome: file.name });
          if (dados.periodo) {
            setAnoImport(dados.periodo.ano || new Date().getFullYear());
            setMesImport(dados.periodo.mes || new Date().getMonth() + 1);
          }
          setDialogOpen(true);
          toast.success("Dados extraídos! Revise antes de confirmar.");
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setProcessando(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error("Erro no upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmar = () => {
    if (!dadosExtraidos?.linhas || !uploadAtual) return;
    confirmarMut.mutate({
      uploadId: uploadAtual.id,
      empresaId,
      ano: anoImport,
      mes: mesImport,
      tipoLancamento: "realizado",
      linhas: dadosExtraidos.linhas.map((l: any) => ({
        linhaDre: l.linhaDre,
        valor: l.valor,
        descricao: l.descricao,
      })),
    });
  };

  return (
    <div className="space-y-6">
      {/* Área de Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-5 w-5" /> Importar Arquivo DRE
          </CardTitle>
          <CardDescription>
            Envie um PDF ou planilha Excel com os dados da DRE. A IA extrairá automaticamente os valores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
            <input type="file" className="hidden" accept=".pdf,.xlsx,.xls,.csv" onChange={handleFileUpload} disabled={uploading || processando} />
            {uploading || processando ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                <p className="text-sm font-medium">{processando ? "Processando com IA..." : "Enviando arquivo..."}</p>
              </>
            ) : (
              <>
                <div className="flex gap-3 mb-3">
                  <FileText className="h-8 w-8 text-red-500" />
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm font-medium">Arraste ou clique para enviar</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, XLSX, XLS ou CSV — Máx. 16MB</p>
              </>
            )}
          </label>
        </CardContent>
      </Card>

      {/* Histórico de Uploads */}
      {uploads && uploads.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Histórico de Importações</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploads.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-sm">{u.nomeArquivo}</TableCell>
                    <TableCell>{u.mes && u.ano ? `${MESES[u.mes - 1]}/${u.ano}` : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={
                        u.status === "consolidado" ? "default" :
                        u.status === "processado" ? "secondary" :
                        u.status === "erro" ? "destructive" : "outline"
                      }>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Revisão */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revisar Dados Extraídos</DialogTitle>
            <DialogDescription>
              Arquivo: {uploadAtual?.nome} — Confiança: {dadosExtraidos?.confianca || "N/A"}
            </DialogDescription>
          </DialogHeader>
          {dadosExtraidos?.resumo && (
            <div className="bg-muted/30 p-3 rounded text-sm">{dadosExtraidos.resumo}</div>
          )}
          <div className="flex gap-3">
            <div>
              <Label className="text-xs">Ano</Label>
              <Input type="number" value={anoImport} onChange={(e) => setAnoImport(Number(e.target.value))} className="w-24" />
            </div>
            <div>
              <Label className="text-xs">Mês</Label>
              <Select value={String(mesImport)} onValueChange={(v) => setMesImport(Number(v))}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MESES.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {dadosExtraidos?.linhas && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Linha DRE</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosExtraidos.linhas.map((l: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm font-medium">{l.linhaDre}</TableCell>
                    <TableCell className={`text-right font-mono ${l.valor < 0 ? "text-red-600" : ""}`}>
                      {formatCurrency(l.valor)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{l.descricao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {dadosExtraidos?.observacoes && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <span>{dadosExtraidos.observacoes}</span>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmar} disabled={confirmarMut.isPending}>
              {confirmarMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Confirmar Importação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Componente: Forecast ─────────────────────────────────────────────────────
function Forecast({ empresaId, ano }: { empresaId: number; ano: number }) {
  const [cenario, setCenario] = useState<"conservador" | "base" | "otimista">("base");
  const { data: forecast, refetch } = trpc.dre.getForecast.useQuery({ empresaId, ano, cenario });
  const { data: linhas } = trpc.dre.getLinhasDre.useQuery();
  const { data: natureza } = trpc.dre.getNatureza.useQuery({ empresaId });
  const salvarMut = trpc.dre.salvarForecast.useMutation({
    onSuccess: (r) => { toast.success(`Forecast v${r.versao} salvo!`); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const [valores, setValores] = useState<Record<string, Record<string, number>>>({});

  const linhasInput = useMemo(() => {
    if (!linhas) return [];
    return linhas.filter((l: any) => {
      if ("calculada" in l) return false;
      if ("natureza" in l) {
        const nat = natureza?.natureza || "servico";
        if (l.natureza === "produto" && nat !== "produto") return false;
        if (l.natureza === "servico" && nat !== "servico") return false;
      }
      return true;
    });
  }, [linhas, natureza]);

  // Preencher com dados existentes
  useMemo(() => {
    if (!forecast || forecast.length === 0) return;
    const map: Record<string, Record<string, number>> = {};
    for (const f of forecast) {
      const mesKey = String(f.mes);
      if (!map[mesKey]) map[mesKey] = {};
      map[mesKey][f.linhaDre] = parseFloat(String(f.valor));
    }
    setValores(map);
  }, [forecast]);

  const handleSalvar = () => {
    const linhasArr: { mes: number; linhaDre: string; valor: number }[] = [];
    for (const [mes, dados] of Object.entries(valores)) {
      for (const [linhaDre, valor] of Object.entries(dados)) {
        if (valor !== 0) linhasArr.push({ mes: Number(mes), linhaDre, valor });
      }
    }
    salvarMut.mutate({ empresaId, ano, cenario, linhas: linhasArr });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <div>
          <Label className="text-xs">Cenário</Label>
          <Select value={cenario} onValueChange={(v) => setCenario(v as any)}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="conservador">Conservador</SelectItem>
              <SelectItem value="base">Base</SelectItem>
              <SelectItem value="otimista">Otimista</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Badge variant="outline">{forecast?.length ? `${forecast.length} registros` : "Sem dados"}</Badge>
      </div>

      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10 min-w-[180px]">Linha</TableHead>
                {MESES.map((m, i) => (
                  <TableHead key={i} className="text-center min-w-[100px]">{m}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhasInput.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="sticky left-0 bg-background z-10 font-medium text-sm">{l.nome}</TableCell>
                  {MESES.map((_, i) => {
                    const mesKey = String(i + 1);
                    return (
                      <TableCell key={i} className="p-1">
                        <Input
                          type="number"
                          step="0.01"
                          className="w-24 text-right text-xs"
                          value={valores[mesKey]?.[l.id] ?? ""}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setValores(prev => ({
                              ...prev,
                              [mesKey]: { ...(prev[mesKey] || {}), [l.id]: val },
                            }));
                          }}
                          placeholder="0"
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSalvar} disabled={salvarMut.isPending}>
              {salvarMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Target className="h-4 w-4 mr-2" />}
              Salvar Forecast ({cenario})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Componente: Análise Estratégica ──────────────────────────────────────────
function AnaliseEstrategica({ empresaId, ano }: { empresaId: number; ano: number }) {
  const [analise, setAnalise] = useState<string | null>(null);
  const gerarMut = trpc.dre.gerarAnaliseEstrategica.useMutation({
    onSuccess: (r) => { setAnalise(typeof r.analise === "string" ? r.analise : "Análise indisponível."); toast.success("Análise gerada!"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5" /> Análise Estratégica com IA
          </CardTitle>
          <CardDescription>
            A IA analisa os dados da DRE e gera insights sobre margens, custos, tendências e recomendações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => gerarMut.mutate({ empresaId, ano })} disabled={gerarMut.isPending} size="lg">
            {gerarMut.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analisando...</>
            ) : (
              <><Brain className="h-4 w-4 mr-2" /> Gerar Análise Estratégica</>
            )}
          </Button>
        </CardContent>
      </Card>

      {analise && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resultado da Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
              {analise}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function DRE() {
  const params = useParams<{ empresaId: string }>();
  const [, navigate] = useLocation();
  const empresaId = Number(params.empresaId);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [tab, setTab] = useState("visao-geral");

  const { data: empresasList } = trpc.empresas.list.useQuery();
  const empresa = empresasList?.find((e: any) => e.id === empresaId);

  return (
    <DashboardLayout>
      <div className="space-y-4 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/empresa/${empresaId}/planejamento`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                DRE — {empresa?.nome || "Empresa"}
              </h1>
              <p className="text-sm text-muted-foreground">Demonstração do Resultado do Exercício e Análise EBITDA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Ano:</Label>
            <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026, 2027].map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="visao-geral" className="text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="dre-detalhada" className="text-xs sm:text-sm">
              <Calculator className="h-4 w-4 mr-1 hidden sm:inline" /> DRE Detalhada
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm">
              <Upload className="h-4 w-4 mr-1 hidden sm:inline" /> Upload
            </TabsTrigger>
            <TabsTrigger value="forecast" className="text-xs sm:text-sm">
              <Target className="h-4 w-4 mr-1 hidden sm:inline" /> Forecast
            </TabsTrigger>
            <TabsTrigger value="analise" className="text-xs sm:text-sm">
              <Brain className="h-4 w-4 mr-1 hidden sm:inline" /> Análise IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="mt-4">
            <VisaoGeral empresaId={empresaId} ano={ano} />
          </TabsContent>
          <TabsContent value="dre-detalhada" className="mt-4">
            <DREDetalhada empresaId={empresaId} ano={ano} />
          </TabsContent>
          <TabsContent value="upload" className="mt-4">
            <UploadImportacao empresaId={empresaId} />
          </TabsContent>
          <TabsContent value="forecast" className="mt-4">
            <Forecast empresaId={empresaId} ano={ano} />
          </TabsContent>
          <TabsContent value="analise" className="mt-4">
            <AnaliseEstrategica empresaId={empresaId} ano={ano} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
