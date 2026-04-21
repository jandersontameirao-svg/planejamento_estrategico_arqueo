import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft, Upload, FileSpreadsheet, FileText, TrendingUp, TrendingDown,
  BarChart3, Brain, DollarSign, Percent, AlertTriangle, CheckCircle2,
  Loader2, ChevronDown, ChevronUp, Download, RefreshCw, Eye, Trash2,
  Info, Calculator, Target, Activity, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, AreaChart, Area, ComposedChart, Cell,
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

// ─── Indicador Card ───────────────────────────────────────────────────────────
interface IndicadorProps {
  label: string;
  valor: number | null;
  variacao?: number | null;
  destaque?: boolean;
  cor?: "blue" | "emerald" | "amber" | "red" | "purple" | "orange";
  icon?: React.ReactNode;
}

function IndicadorCard({ label, valor, variacao, destaque, cor = "blue", icon }: IndicadorProps) {
  const corClasses = {
    blue: "border-l-blue-500 bg-blue-50/30",
    emerald: "border-l-emerald-500 bg-emerald-50/30",
    amber: "border-l-amber-500 bg-amber-50/30",
    red: "border-l-red-500 bg-red-50/30",
    purple: "border-l-purple-500 bg-purple-50/30",
    orange: "border-l-orange-500 bg-orange-50/30",
  };

  const variacaoPositiva = variacao !== null && variacao !== undefined && variacao >= 0;
  const variacaoNegativa = variacao !== null && variacao !== undefined && variacao < 0;

  return (
    <Card className={`border-l-4 ${corClasses[cor]} ${destaque ? "ring-1 ring-offset-1 ring-primary" : ""}`}>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-2 ${destaque ? "text-primary" : ""}`}>
              {formatCurrency(valor)}
            </p>
            {variacao !== null && variacao !== undefined && (
              <div className={`flex items-center gap-1 text-xs mt-2 font-medium ${variacaoPositiva ? "text-emerald-600" : variacaoNegativa ? "text-red-600" : "text-muted-foreground"}`}>
                {variacaoPositiva ? <ArrowUpRight className="h-3 w-3" /> : variacaoNegativa ? <ArrowDownRight className="h-3 w-3" /> : null}
                {formatPercent(variacao)}
              </div>
            )}
          </div>
          {icon && <div className="text-muted-foreground/40 ml-2">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Componente: Visão Geral Completa ─────────────────────────────────────────
function VisaoGeral({ empresaId, ano }: { empresaId: number; ano: number }) {
  const { data: consolidado, isLoading } = trpc.dre.getDadosConsolidados.useQuery({
    empresaId, ano, tipoLancamento: "realizado",
  });
  const { data: comparativo } = trpc.dre.getComparativo.useQuery({
    empresaId, ano, anoAnterior: ano - 1,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!consolidado || Object.keys(consolidado.porMes).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BarChart3 className="h-16 w-16 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">Nenhum dado de DRE encontrado</h3>
        <p className="text-sm text-muted-foreground mt-1">Importe dados na aba "Upload" ou lance manualmente na aba "DRE Detalhada".</p>
      </div>
    );
  }

  const acum = consolidado.acumulado;
  const ind = consolidado.indicadores;

  // Variações YoY
  const varReceita = comparativo?.anterior?.receita_liquida
    ? ((acum.receita_liquida - comparativo.anterior.receita_liquida) / Math.abs(comparativo.anterior.receita_liquida)) * 100
    : null;
  const varLucro = comparativo?.anterior?.lucro_liquido
    ? ((acum.lucro_liquido - comparativo.anterior.lucro_liquido) / Math.abs(comparativo.anterior.lucro_liquido)) * 100
    : null;
  const varEbitda = comparativo?.anterior?.ebitda
    ? ((acum.ebitda - comparativo.anterior.ebitda) / Math.abs(comparativo.anterior.ebitda)) * 100
    : null;

  // Dados para gráfico mensal
  const chartData = Object.entries(consolidado.porMes)
    .map(([mes, dados]) => ({
      mes: MESES[Number(mes) - 1],
      receita: dados.receita_liquida || 0,
      ebitda: dados.ebitda || 0,
      lucro: dados.lucro_liquido || 0,
    }))
    .sort((a, b) => MESES.indexOf(a.mes) - MESES.indexOf(b.mes));

  return (
    <div className="space-y-6">
      {/* Seção 1: Linha de Receita */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Linha de Receita</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <IndicadorCard
            label="Receita Bruta"
            valor={acum.receita_bruta}
            cor="blue"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <IndicadorCard
            label="Deduções de Receita"
            valor={acum.deducoes_receita}
            cor="red"
            icon={<TrendingDown className="h-5 w-5" />}
          />
          <IndicadorCard
            label="Receita Líquida"
            valor={acum.receita_liquida}
            variacao={varReceita}
            destaque
            cor="emerald"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Seção 2: Custos e Lucro Bruto */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Custos e Lucro Bruto</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <IndicadorCard
            label="Custo de Mercadorias/Serviços"
            valor={acum.cmv || acum.csp}
            cor="orange"
            icon={<Activity className="h-5 w-5" />}
          />
          <IndicadorCard
            label="Lucro Bruto"
            valor={acum.lucro_bruto}
            cor="emerald"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <IndicadorCard
            label="Margem Bruta"
            valor={ind.margemBruta}
            cor="purple"
            icon={<Percent className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Seção 3: Despesas Operacionais e EBITDA */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Despesas Operacionais e EBITDA</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <IndicadorCard
            label="Despesas Operacionais"
            valor={acum.despesas_operacionais}
            cor="red"
            icon={<TrendingDown className="h-5 w-5" />}
          />
          <IndicadorCard
            label="EBITDA"
            valor={acum.ebitda}
            variacao={varEbitda}
            destaque
            cor="amber"
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <IndicadorCard
            label="Margem EBITDA"
            valor={ind.margemEbitda}
            cor="purple"
            icon={<Percent className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Seção 4: Depreciação, EBIT e Resultado Operacional */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Resultado Operacional</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <IndicadorCard
            label="Depreciação e Amortização"
            valor={acum.depreciacoes}
            cor="red"
            icon={<TrendingDown className="h-5 w-5" />}
          />
          <IndicadorCard
            label="EBIT (Resultado Operacional)"
            valor={acum.ebit}
            cor="blue"
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <IndicadorCard
            label="Margem Operacional"
            valor={ind.margemOperacional}
            cor="purple"
            icon={<Percent className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Seção 5: Resultado Financeiro e Antes de IR */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Resultado Financeiro</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <IndicadorCard
            label="Juros e Despesas Financeiras"
            valor={acum.juros}
            cor="red"
            icon={<TrendingDown className="h-5 w-5" />}
          />
          <IndicadorCard
            label="Lucro Antes do IR/CS"
            valor={acum.lucro_antes_ir}
            cor="blue"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <IndicadorCard
            label="IR e Contribuição Social"
            valor={acum.ir_cs}
            cor="red"
            icon={<TrendingDown className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Seção 6: Resultado Final */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Resultado Líquido</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <IndicadorCard
            label="Lucro Líquido"
            valor={acum.lucro_liquido}
            variacao={varLucro}
            destaque
            cor="emerald"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <IndicadorCard
            label="Margem Líquida"
            valor={ind.margemLiquida}
            cor="purple"
            icon={<Percent className="h-5 w-5" />}
          />
          <IndicadorCard
            label="Resultado Financeiro"
            valor={acum.resultado_financeiro}
            cor="blue"
            icon={<DollarSign className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Gráfico de Evolução Mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolução Mensal — {ano}</CardTitle>
          <CardDescription>Receita Líquida, EBITDA e Lucro Líquido ao longo dos meses</CardDescription>
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
              <Line dataKey="lucro" name="Lucro Líq." stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela DRE Completa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">DRE Completa — Acumulado {ano}</CardTitle>
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
                { id: "cmv_csp", nome: "(-) Custos (CMV/CSP)", bold: false },
                { id: "lucro_bruto", nome: "= Lucro Bruto", bold: true, highlight: true },
                { id: "despesas_operacionais", nome: "(-) Despesas Operacionais", bold: false },
                { id: "ebitda", nome: "= EBITDA", bold: true, highlight: true },
                { id: "depreciacoes", nome: "(-) Depreciação/Amortização", bold: false },
                { id: "ebit", nome: "= EBIT", bold: true, highlight: true },
                { id: "juros", nome: "(-) Juros e Despesas Financeiras", bold: false },
                { id: "lucro_antes_ir", nome: "= Lucro Antes IR/CS", bold: true },
                { id: "ir_cs", nome: "(-) IR e Contribuição Social", bold: false },
                { id: "lucro_liquido", nome: "= Lucro Líquido", bold: true, highlight: true },
              ].map((l) => {
                let val = 0;
                if (l.id === "cmv_csp") val = acum.cmv || acum.csp || 0;
                else if (l.id === "receita_bruta") val = acum.receita_bruta || 0;
                else if (l.id === "deducoes_receita") val = acum.deducoes_receita || 0;
                else if (l.id === "receita_liquida") val = acum.receita_liquida || 0;
                else if (l.id === "lucro_bruto") val = acum.lucro_bruto || 0;
                else if (l.id === "despesas_operacionais") val = acum.despesas_operacionais || 0;
                else if (l.id === "ebitda") val = acum.ebitda || 0;
                else if (l.id === "depreciacoes") val = acum.depreciacoes || 0;
                else if (l.id === "ebit") val = acum.ebit || 0;
                else if (l.id === "juros") val = acum.juros || 0;
                else if (l.id === "lucro_antes_ir") val = acum.lucro_antes_ir || 0;
                else if (l.id === "ir_cs") val = acum.ir_cs || 0;
                else if (l.id === "lucro_liquido") val = acum.lucro_liquido || 0;

                const pct = acum.receita_liquida ? (val / acum.receita_liquida) * 100 : 0;
                return (
                  <TableRow key={l.id} className={l.highlight ? "bg-muted/40" : ""}>
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
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-emerald-600" />
                DRE / EBITDA
              </h1>
              <p className="text-sm text-muted-foreground">{empresa?.nome || "Empresa"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs font-medium">Ano:</Label>
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
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="visao-geral" className="text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="dre-detalhada" className="text-xs sm:text-sm">
              <Calculator className="h-4 w-4 mr-1 hidden sm:inline" /> Detalhada
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs sm:text-sm">
              <Upload className="h-4 w-4 mr-1 hidden sm:inline" /> Upload
            </TabsTrigger>
            <TabsTrigger value="forecast" className="text-xs sm:text-sm">
              <Target className="h-4 w-4 mr-1 hidden sm:inline" /> Forecast
            </TabsTrigger>
            <TabsTrigger value="analise" className="text-xs sm:text-sm">
              <Brain className="h-4 w-4 mr-1 hidden sm:inline" /> IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="mt-4">
            <VisaoGeral empresaId={empresaId} ano={ano} />
          </TabsContent>
          <TabsContent value="dre-detalhada" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">Aba de DRE Detalhada em desenvolvimento...</div>
          </TabsContent>
          <TabsContent value="upload" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">Aba de Upload em desenvolvimento...</div>
          </TabsContent>
          <TabsContent value="forecast" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">Aba de Forecast em desenvolvimento...</div>
          </TabsContent>
          <TabsContent value="analise" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">Aba de Análise IA em desenvolvimento...</div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
