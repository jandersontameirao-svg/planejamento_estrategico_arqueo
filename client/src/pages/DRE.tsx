import { useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft, Upload, TrendingUp, TrendingDown, BarChart3, Brain,
  DollarSign, Percent, CheckCircle2, Loader2, Target, Activity,
  ArrowUpRight, ArrowDownRight, Home, LogOut, FileText, FileSpreadsheet,
  CloudUpload, History, RefreshCw, AlertTriangle,
} from "lucide-react";
import {
  Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ComposedChart, AreaChart, Area,
  BarChart,
} from "recharts";
import { getLoginUrl } from "@/const";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const ANOS_DISPONIVEIS = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027];

function fBRL(v: number | undefined | null) {
  if (v == null) return "R$ 0";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

function fBRLK(v: number | undefined | null) {
  if (v == null || v === 0) return "R$ 0";
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${v < 0 ? "-" : ""}R$ ${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${v < 0 ? "-" : ""}R$ ${(abs / 1_000).toFixed(0)}k`;
  return fBRL(v);
}

function fPct(v: number | undefined | null) {
  if (v == null) return "0,0%";
  return v.toFixed(1).replace(".", ",") + "%";
}

function variacaoColor(v: number | null | undefined) {
  if (v == null) return "text-muted-foreground";
  return v >= 0 ? "text-emerald-600" : "text-red-600";
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
interface KpiProps {
  label: string;
  valor: number | null;
  variacao?: number | null;
  subtitulo?: string;
  cor: "blue" | "emerald" | "amber" | "purple" | "red" | "orange";
  icon: React.ReactNode;
  isPct?: boolean;
}

function KpiCard({ label, valor, variacao, subtitulo, cor, icon, isPct }: KpiProps) {
  const borderColors = {
    blue: "border-t-blue-500", emerald: "border-t-emerald-500",
    amber: "border-t-amber-500", purple: "border-t-purple-500",
    red: "border-t-red-500", orange: "border-t-orange-500",
  };
  const iconBg = {
    blue: "bg-blue-100 text-blue-600", emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600", purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600", orange: "bg-orange-100 text-orange-600",
  };
  return (
    <Card className={`border-t-4 ${borderColors[cor]} shadow-sm hover:shadow-md transition-shadow`}>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{label}</p>
            <p className="text-2xl font-bold mt-1 tabular-nums">
              {isPct ? fPct(valor) : fBRL(valor)}
            </p>
            {variacao != null && (
              <div className={`flex items-center gap-1 text-xs mt-1 font-medium ${variacaoColor(variacao)}`}>
                {variacao >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {fPct(Math.abs(variacao))} vs ano anterior
              </div>
            )}
            {subtitulo && <p className="text-xs text-muted-foreground mt-1">{subtitulo}</p>}
          </div>
          <div className={`p-2 rounded-lg ${iconBg[cor]} ml-3 shrink-0`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Linha DRE para tabela ────────────────────────────────────────────────────
const LINHAS_TABELA = [
  { id: "receita_bruta", nome: "Receita Bruta", indent: 0, bold: true },
  { id: "deducoes_receita", nome: "(-) Deduções de Receita", indent: 1, bold: false },
  { id: "receita_liquida", nome: "= Receita Líquida", indent: 0, bold: true, highlight: true },
  { id: "cmv_csp", nome: "(-) Custos", indent: 1, bold: false },
  { id: "lucro_bruto", nome: "= Lucro Bruto", indent: 0, bold: true, highlight: true },
  { id: "despesas_operacionais", nome: "(-) Despesas Operacionais", indent: 1, bold: false },
  { id: "ebitda", nome: "= EBITDA", indent: 0, bold: true, highlight: true, destaque: true },
  { id: "depreciacoes", nome: "(-) Depreciação e Amortização", indent: 1, bold: false },
  { id: "ebit", nome: "= EBIT", indent: 0, bold: true, highlight: true },
  { id: "juros", nome: "(-) Juros e Despesas Financeiras", indent: 1, bold: false },
  { id: "lucro_antes_ir", nome: "= Lucro Antes do IR/CS", indent: 0, bold: true },
  { id: "ir_cs", nome: "(-) IR e Contribuição Social", indent: 1, bold: false },
  { id: "lucro_liquido", nome: "= Lucro Líquido", indent: 0, bold: true, highlight: true, destaque: true },
];

function getVal(acum: Record<string, number>, id: string, isProduto?: boolean) {
  if (id === "cmv_csp") return isProduto ? (acum.cmv || 0) : (acum.csp || 0);
  return acum[id] || 0;
}

// ─── Aba: Visão Geral / Dashboard ─────────────────────────────────────────────
function AbaVisaoGeral({ empresaId, ano, isProduto }: { empresaId: number; ano: number; isProduto: boolean }) {
  const { data: consolidado, isLoading } = trpc.dre.getDadosConsolidados.useQuery(
    { empresaId, ano, tipoLancamento: "realizado" },
    { enabled: empresaId > 0 },
  );
  const { data: comparativo } = trpc.dre.getComparativo.useQuery(
    { empresaId, ano, anoAnterior: ano - 1 },
    { enabled: empresaId > 0 },
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
        <span className="text-muted-foreground">Carregando dados...</span>
      </div>
    );
  }

  const acum = consolidado?.acumulado ?? {} as Record<string, number>;
  const ind = consolidado?.indicadores ?? {} as Record<string, number>;
  const ant = comparativo?.anterior ?? {} as Record<string, number>;

  const varPct = (curr: number, prev: number) =>
    prev !== 0 ? ((curr - prev) / Math.abs(prev)) * 100 : null;

  // Dados gráfico mensal (barras + linhas de margem)
  const chartMensal = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const d = consolidado?.porMes?.[m] ?? {};
    const rl = d.receita_liquida || 0;
    return {
      mes: MESES[i],
      receita: rl,
      ebitda: d.ebitda || 0,
      lucro: d.lucro_liquido || 0,
      margemEbitda: rl > 0 ? ((d.ebitda || 0) / rl) * 100 : 0,
      margemLiquida: rl > 0 ? ((d.lucro_liquido || 0) / rl) * 100 : 0,
    };
  });

  const temDados = chartMensal.some((d) => d.receita > 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Receita Líquida"
          valor={acum.receita_liquida || 0}
          variacao={varPct(acum.receita_liquida || 0, ant.receita_liquida || 0)}
          cor="blue"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiCard
          label="EBITDA"
          valor={acum.ebitda || 0}
          variacao={varPct(acum.ebitda || 0, ant.ebitda || 0)}
          subtitulo={`Margem: ${fPct(ind.margemEbitda || 0)}`}
          cor="amber"
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <KpiCard
          label="Lucro Líquido"
          valor={acum.lucro_liquido || 0}
          variacao={varPct(acum.lucro_liquido || 0, ant.lucro_liquido || 0)}
          subtitulo={`Margem: ${fPct(ind.margemLiquida || 0)}`}
          cor="emerald"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <KpiCard
          label="Margem Bruta"
          valor={ind.margemBruta || 0}
          isPct
          subtitulo={`Lucro Bruto: ${fBRLK(acum.lucro_bruto || 0)}`}
          cor="purple"
          icon={<Percent className="h-5 w-5" />}
        />
      </div>

      {/* Segunda linha de KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          label="Receita Bruta"
          valor={acum.receita_bruta || 0}
          cor="blue"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KpiCard
          label={isProduto ? "Custo das Mercadorias (CMV)" : "Custo dos Serviços (CSP)"}
          valor={isProduto ? (acum.cmv || 0) : (acum.csp || 0)}
          cor="orange"
          icon={<Activity className="h-4 w-4" />}
        />
        <KpiCard
          label="Desp. Operacionais"
          valor={acum.despesas_operacionais || 0}
          cor="red"
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <KpiCard
          label="EBIT"
          valor={acum.ebit || 0}
          subtitulo={`Margem Op.: ${fPct(ind.margemOperacional || 0)}`}
          cor="purple"
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      {/* Gráfico mensal */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Evolução Mensal — {ano}
          </CardTitle>
          <CardDescription>Receita Líquida (barras), EBITDA e Lucro Líquido (linhas) + Margens (%)</CardDescription>
        </CardHeader>
        <CardContent>
          {!temDados ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mb-3 opacity-20" />
              <p className="font-medium">Nenhum dado lançado para {ano}</p>
              <p className="text-sm mt-1">Use a aba <strong>Upload</strong> para importar dados históricos ou lance manualmente.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={chartMensal} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="valor"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => fBRLK(v)}
                  width={70}
                />
                <YAxis
                  yAxisId="pct"
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${v.toFixed(0)}%`}
                  width={45}
                />
                <Tooltip
                  formatter={(v: number, name: string) => {
                    if (name.includes("Margem")) return [fPct(v), name];
                    return [fBRL(v), name];
                  }}
                  contentStyle={{ fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="valor" dataKey="receita" name="Receita Líq." fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.85} />
                <Line yAxisId="valor" type="monotone" dataKey="ebitda" name="EBITDA" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="valor" type="monotone" dataKey="lucro" name="Lucro Líq." stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="pct" type="monotone" dataKey="margemEbitda" name="Margem EBITDA %" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                <Line yAxisId="pct" type="monotone" dataKey="margemLiquida" name="Margem Líq. %" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Tabela DRE detalhada com todos os meses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            DRE Detalhada — {ano} (todos os meses)
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-48 font-semibold">Linha</TableHead>
                {MESES.map((m) => (
                  <TableHead key={m} className="text-right font-semibold min-w-[80px]">{m}</TableHead>
                ))}
                <TableHead className="text-right font-semibold min-w-[90px] bg-primary/5">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LINHAS_TABELA.map((linha) => {
                const total = getVal(acum, linha.id, isProduto);
                const nomeExibido = linha.id === "cmv_csp"
                  ? (isProduto ? "(-) Custo das Mercadorias (CMV)" : "(-) Custo dos Serviços (CSP)")
                  : linha.nome;
                return (
                  <TableRow
                    key={linha.id}
                    className={`${linha.highlight ? "bg-muted/30" : ""} ${linha.destaque ? "bg-primary/5 font-bold" : ""}`}
                  >
                    <TableCell
                      className={`${linha.bold ? "font-semibold" : "text-muted-foreground"}`}
                      style={{ paddingLeft: linha.indent > 0 ? "1.5rem" : undefined }}
                    >
                      {nomeExibido}
                    </TableCell>
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = i + 1;
                      const d = consolidado?.porMes?.[m] ?? {};
                      const v = getVal(d, linha.id, isProduto);
                      return (
                        <TableCell
                          key={m}
                          className={`text-right tabular-nums ${v < 0 ? "text-red-600" : ""} ${linha.bold ? "font-semibold" : ""}`}
                        >
                          {v !== 0 ? fBRLK(v) : <span className="text-muted-foreground/40">—</span>}
                        </TableCell>
                      );
                    })}
                    <TableCell
                      className={`text-right tabular-nums font-semibold bg-primary/5 ${total < 0 ? "text-red-600" : ""}`}
                    >
                      {fBRLK(total)}
                    </TableCell>
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

// ─── Aba: Upload ──────────────────────────────────────────────────────────────
function AbaUpload({ empresaId }: { empresaId: number }) {
  const [arrastando, setArrastando] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [anoUpload, setAnoUpload] = useState(new Date().getFullYear());
  const [processando, setProcessando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: uploads, refetch: refetchUploads } = trpc.dre.getUploads.useQuery(
    { empresaId },
    { enabled: empresaId > 0 },
  );

  const registrar = trpc.dre.registrarUpload.useMutation({
    onSuccess: () => {
      toast.success("Upload registrado com sucesso!");
      setArquivo(null);
      refetchUploads();
    },
    onError: (err) => toast.error("Erro ao registrar upload", { description: err.message }),
  });

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setArrastando(false);
    const f = e.dataTransfer.files[0];
    if (f) setArquivo(f);
  }

  async function handleEnviar() {
    if (!arquivo) return;
    setProcessando(true);
    try {
      // Registrar upload com metadados (sem enviar bytes — S3 seria o próximo passo)
      await registrar.mutateAsync({
        empresaId,
        ano: anoUpload,
        nomeArquivo: arquivo.name,
        tipoArquivo: arquivo.name.endsWith(".pdf") ? "pdf" : "excel",
        tamanhoBytes: arquivo.size,
        urlArquivo: "",
        periodo: `${anoUpload}`,
      });
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Área de upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CloudUpload className="h-4 w-4 text-primary" />
            Importar DRE Histórica
          </CardTitle>
          <CardDescription>
            Envie arquivos PDF ou Excel da DRE. O sistema processa e extrai os dados automaticamente via IA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de ano */}
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium">Ano de referência:</Label>
            <Select value={String(anoUpload)} onValueChange={(v) => setAnoUpload(Number(v))}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ANOS_DISPONIVEIS.map((a) => (
                  <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
            onDragLeave={() => setArrastando(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
              ${arrastando ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30"}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) setArquivo(e.target.files[0]); }}
            />
            {arquivo ? (
              <div className="flex flex-col items-center gap-2">
                {arquivo.name.endsWith(".pdf")
                  ? <FileText className="h-10 w-10 text-red-500" />
                  : <FileSpreadsheet className="h-10 w-10 text-green-600" />}
                <p className="font-semibold">{arquivo.name}</p>
                <p className="text-sm text-muted-foreground">{(arquivo.size / 1024).toFixed(1)} KB</p>
                <Badge variant="outline" className="text-xs">Pronto para enviar</Badge>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <CloudUpload className="h-12 w-12 opacity-40" />
                <div>
                  <p className="font-medium">Arraste o arquivo aqui ou clique para selecionar</p>
                  <p className="text-sm mt-1">Formatos aceitos: PDF, Excel (.xlsx, .xls), CSV</p>
                </div>
              </div>
            )}
          </div>

          {arquivo && (
            <div className="flex gap-3">
              <Button onClick={handleEnviar} disabled={processando} className="flex-1">
                {processando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                {processando ? "Processando..." : `Enviar DRE ${anoUpload}`}
              </Button>
              <Button variant="outline" onClick={() => setArquivo(null)}>Cancelar</Button>
            </div>
          )}

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
            <span>
              Após o envio, a IA extrai os dados automaticamente. Você poderá revisar e confirmar antes de consolidar no sistema.
              Arquivos de anos anteriores são armazenados como histórico e ficam disponíveis para comparativos.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de uploads */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            Histórico de Uploads
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!uploads || uploads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum arquivo enviado ainda.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploads.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-sm">{u.nomeArquivo}</TableCell>
                    <TableCell>{u.ano}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {u.tipoArquivo?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${
                          u.status === "confirmado" ? "bg-green-100 text-green-800" :
                          u.status === "processado" ? "bg-blue-100 text-blue-800" :
                          u.status === "erro" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(u.criadoEm).toLocaleDateString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Aba: Comparativo Anual ───────────────────────────────────────────────────
function AbaComparativo({ empresaId, isProduto }: { empresaId: number; isProduto: boolean }) {
  const anoAtual = new Date().getFullYear();
  const [anos, setAnos] = useState<number[]>([anoAtual - 2, anoAtual - 1, anoAtual]);

  const queries = [
    trpc.dre.getDadosConsolidados.useQuery(
      { empresaId, ano: anos[0], tipoLancamento: "realizado" },
      { enabled: empresaId > 0 },
    ),
    trpc.dre.getDadosConsolidados.useQuery(
      { empresaId, ano: anos[1], tipoLancamento: "realizado" },
      { enabled: empresaId > 0 },
    ),
    trpc.dre.getDadosConsolidados.useQuery(
      { empresaId, ano: anos[2], tipoLancamento: "realizado" },
      { enabled: empresaId > 0 },
    ),
  ];

  const dadosPorAno = anos.map((ano, i) => ({
    ano,
    acum: queries[i].data?.acumulado ?? ({} as Record<string, number>),
    ind: (queries[i].data?.indicadores ?? {}) as Record<string, number>,
    isLoading: queries[i].isLoading,
  }));

  // Dados para gráfico de barras agrupadas
  const chartComparativo = [
    { indicador: "Receita Líq.", ...Object.fromEntries(dadosPorAno.map((d) => [d.ano, d.acum.receita_liquida || 0])) },
    { indicador: "EBITDA", ...Object.fromEntries(dadosPorAno.map((d) => [d.ano, d.acum.ebitda || 0])) },
    { indicador: "Lucro Líq.", ...Object.fromEntries(dadosPorAno.map((d) => [d.ano, d.acum.lucro_liquido || 0])) },
    { indicador: "Lucro Bruto", ...Object.fromEntries(dadosPorAno.map((d) => [d.ano, d.acum.lucro_bruto || 0])) },
  ];

  const CORES_ANOS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];

  const temDados = dadosPorAno.some((d) => (d.acum.receita_liquida || 0) > 0);

  return (
    <div className="space-y-6">
      {/* Seleção de anos */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Comparar anos:</span>
            {anos.map((ano, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CORES_ANOS[i] }} />
                <Select value={String(ano)} onValueChange={(v) => {
                  const novos = [...anos];
                  novos[i] = Number(v);
                  setAnos(novos);
                }}>
                  <SelectTrigger className="w-24 h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ANOS_DISPONIVEIS.map((a) => (
                      <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico comparativo */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Comparativo por Indicador
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!temDados ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mb-3 opacity-20" />
              <p className="font-medium">Nenhum dado disponível para os anos selecionados</p>
              <p className="text-sm mt-1">Importe dados históricos na aba <strong>Upload</strong>.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartComparativo} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="indicador" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => fBRLK(v)} width={70} />
                <Tooltip formatter={(v: number, name: string) => [fBRL(v), String(name)]} contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {anos.map((ano, i) => (
                  <Bar key={ano} dataKey={ano} name={String(ano)} fill={CORES_ANOS[i]} radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Tabela comparativa */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Tabela Comparativa Anual
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-52 font-semibold">Indicador</TableHead>
                {dadosPorAno.map((d) => (
                  <TableHead key={d.ano} className="text-right font-semibold" style={{ color: CORES_ANOS[dadosPorAno.indexOf(d)] }}>
                    {d.ano}
                  </TableHead>
                ))}
                {dadosPorAno.length >= 2 && (
                  <TableHead className="text-right font-semibold text-muted-foreground">
                    Var. {dadosPorAno[dadosPorAno.length - 2].ano}→{dadosPorAno[dadosPorAno.length - 1].ano}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {LINHAS_TABELA.map((linha) => {
                const nomeExibidoComp = linha.id === "cmv_csp"
                  ? (isProduto ? "(-) Custo das Mercadorias (CMV)" : "(-) Custo dos Serviços (CSP)")
                  : linha.nome;
                const valores = dadosPorAno.map((d) => getVal(d.acum, linha.id, isProduto));
                const ultimo = valores[valores.length - 1];
                const penultimo = valores[valores.length - 2];
                const variacao = penultimo !== 0 ? ((ultimo - penultimo) / Math.abs(penultimo)) * 100 : null;
                return (
                  <TableRow key={linha.id} className={linha.highlight ? "bg-muted/30" : ""}>
                    <TableCell
                      className={`${linha.bold ? "font-semibold" : "text-muted-foreground text-xs"}`}
                      style={{ paddingLeft: linha.indent > 0 ? "1.5rem" : undefined }}
                    >
                      {nomeExibidoComp}
                    </TableCell>
                    {valores.map((v, i) => (
                      <TableCell key={i} className={`text-right tabular-nums ${linha.bold ? "font-semibold" : ""} ${v < 0 ? "text-red-600" : ""}`}>
                        {v !== 0 ? fBRL(v) : <span className="text-muted-foreground/40">—</span>}
                      </TableCell>
                    ))}
                    {dadosPorAno.length >= 2 && (
                      <TableCell className={`text-right font-medium ${variacaoColor(variacao)}`}>
                        {variacao != null ? (
                          <span className="flex items-center justify-end gap-1">
                            {variacao >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {fPct(Math.abs(variacao))}
                          </span>
                        ) : "—"}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}

              {/* Margens */}
              <TableRow className="bg-primary/5 border-t-2">
                <TableCell className="font-semibold text-xs text-muted-foreground uppercase tracking-wide" colSpan={dadosPorAno.length + 2}>
                  Indicadores de Margem
                </TableCell>
              </TableRow>
              {[
                { label: "Margem Bruta", key: "margemBruta" },
                { label: "Margem EBITDA", key: "margemEbitda" },
                { label: "Margem Operacional", key: "margemOperacional" },
                { label: "Margem Líquida", key: "margemLiquida" },
              ].map((m) => {
                const valores = dadosPorAno.map((d) => d.ind[m.key] || 0);
                const variacao = valores.length >= 2 ? valores[valores.length - 1] - valores[valores.length - 2] : null;
                return (
                  <TableRow key={m.key}>
                    <TableCell className="font-medium">{m.label}</TableCell>
                    {valores.map((v, i) => (
                      <TableCell key={i} className={`text-right font-semibold ${v < 0 ? "text-red-600" : "text-emerald-700"}`}>
                        {fPct(v)}
                      </TableCell>
                    ))}
                    {dadosPorAno.length >= 2 && (
                      <TableCell className={`text-right font-medium ${variacaoColor(variacao)}`}>
                        {variacao != null ? (
                          <span className="flex items-center justify-end gap-1">
                            {variacao >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {fPct(Math.abs(variacao))} pp
                          </span>
                        ) : "—"}
                      </TableCell>
                    )}
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

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function DRE() {
  const params = useParams<{ empresaId: string }>();
  const [, navigate] = useLocation();
  const empresaId = Number(params.empresaId);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [tab, setTab] = useState("dashboard");
  const { user, logout } = useAuth();

  const { data: empresasList } = trpc.empresas.list.useQuery();
  const empresa = empresasList?.find((e: any) => e.id === empresaId);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header padrão do sistema */}
      <header className="border-b bg-gradient-to-r from-card via-card to-card/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/logo-arqueo.png" alt="Grupo Arqueo" className="h-10 w-10" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-orange-500 to-orange-600 bg-clip-text text-transparent">
              Grupo Arqueo
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <>
                <span className="text-sm text-muted-foreground hidden md:inline">{user.name || user.email}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium hidden md:inline">
                  {user.role === "admin" ? "Administrador" : user.role === "gestor" ? "Gestor" : "Usuário"}
                </span>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate("/" as any)} className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden md:inline">Início</span>
            </Button>
            {user ? (
              <Button variant="ghost" size="sm" onClick={() => logout()} className="text-muted-foreground gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            ) : (
              <Button size="sm" asChild>
                <a href={getLoginUrl()}>Entrar</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 container py-6">
        <div className="space-y-5">
          {/* Título + controles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(`/empresa/${empresaId}/planejamento` as any)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                  DRE / EBITDA
                </h1>
                <p className="text-sm text-muted-foreground">{empresa?.nome || `Empresa #${empresaId}`}</p>
              </div>
            </div>
            {tab === "dashboard" && (
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-muted-foreground">Ano:</Label>
                <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ANOS_DISPONIVEIS.map((a) => (
                      <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator />

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="dashboard" className="gap-1.5">
                <BarChart3 className="h-4 w-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-1.5">
                <Upload className="h-4 w-4" /> Upload
              </TabsTrigger>
              <TabsTrigger value="comparativo" className="gap-1.5">
                <RefreshCw className="h-4 w-4" /> Comparativo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-5">
              <AbaVisaoGeral empresaId={empresaId} ano={ano} isProduto={empresa?.tipoAtuacao === "produtos" || empresa?.tipoAtuacao === "servicos_produtos"} />
            </TabsContent>
            <TabsContent value="upload" className="mt-5">
              <AbaUpload empresaId={empresaId} />
            </TabsContent>
            <TabsContent value="comparativo" className="mt-5">
              <AbaComparativo empresaId={empresaId} isProduto={empresa?.tipoAtuacao === "produtos" || empresa?.tipoAtuacao === "servicos_produtos"} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
