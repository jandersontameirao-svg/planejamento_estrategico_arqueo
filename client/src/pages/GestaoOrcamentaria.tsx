import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, Upload,
  Plus, Settings, Copy, Lock, CheckCircle, FileText, AlertTriangle,
  ChevronRight, RefreshCw, Brain, Target, GitCompare
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import OrcamentoPlanejado from "./OrcamentoPlanejado";
import OrcamentoCategorias from "./OrcamentoCategorias";
import OrcamentoImportacao from "./OrcamentoImportacao";
import OrcamentoAnaliseIA from "./OrcamentoAnaliseIA";
import RelatorioOrcamentario from "./RelatorioOrcamentario";
import AnaliseOrcamentaria from "./AnaliseOrcamentaria";
import ComparativoVersoes from "./ComparativoVersoes";
import DashboardReceita from "./DashboardReceita";

interface GestaoOrcamentariaProps {
  empresaId: number;
}

const ANO_ATUAL = new Date().getFullYear();
const ANOS = [ANO_ATUAL - 1, ANO_ATUAL, ANO_ATUAL + 1];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-gray-400" },
  em_revisao: { label: "Em Revisão", color: "bg-yellow-500" },
  aprovado: { label: "Aprovado", color: "bg-green-500" },
  congelado: { label: "Congelado", color: "bg-blue-600" },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function GestaoOrcamentaria({ empresaId }: GestaoOrcamentariaProps) {
  const { user } = useAuth();
  const [anoSelecionado, setAnoSelecionado] = useState(ANO_ATUAL);
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [showNovaVersao, setShowNovaVersao] = useState(false);
  const [showDuplicar, setShowDuplicar] = useState(false);
  const [versaoDuplicarId, setVersaoDuplicarId] = useState<number | null>(null);
  const [novaVersaoNome, setNovaVersaoNome] = useState("");
  const [novaVersaoObs, setNovaVersaoObs] = useState("");
  const [motivoRevisao, setMotivoRevisao] = useState("");
  const [congelarOrigem, setCongelarOrigem] = useState(true);
  const [versaoSelecionadaId, setVersaoSelecionadaId] = useState<number | null>(null);

  const { data: versoes, refetch: refetchVersoes } = trpc.orcamento.getVersoesByEmpresa.useQuery({ empresaId });
  const { data: dashboard, refetch: refetchDashboard } = trpc.orcamento.getDashboard.useQuery({
    empresaId,
    ano: anoSelecionado,
  });

  const createVersaoMutation = trpc.orcamento.createVersao.useMutation({
    onSuccess: () => {
      toast.success("Versão orçamentária criada com sucesso!");
      setShowNovaVersao(false);
      setNovaVersaoNome("");
      setNovaVersaoObs("");
      refetchVersoes();
    },
    onError: (e) => toast.error("Erro ao criar versão: " + e.message),
  });

  const duplicarMutation = trpc.orcamento.duplicarVersao.useMutation({
    onSuccess: (data) => {
      toast.success("Versão duplicada com sucesso!");
      setShowDuplicar(false);
      setNovaVersaoNome("");
      setMotivoRevisao("");
      setCongelarOrigem(true);
      setVersaoDuplicarId(null);
      refetchVersoes();
      setVersaoSelecionadaId(data.id);
    },
    onError: (e) => toast.error("Erro ao duplicar: " + e.message),
  });

  const updateStatusMutation = trpc.orcamento.updateVersaoStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetchVersoes();
      refetchDashboard();
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const versoesDoAno = (versoes ?? []).filter((v: any) => v.ano === anoSelecionado);
  const versaoAtiva = versaoSelecionadaId
    ? (versoes ?? []).find((v: any) => v.id === versaoSelecionadaId)
    : versoesDoAno.find((v: any) => v.status === "aprovado") ?? versoesDoAno[0];

  const chartData = dashboard
    ? dashboard.planejadoPorMes.map((p: any, i: number) => ({
        mes: p.mes,
        Planejado: p.valor,
        Executado: dashboard.executadoPorMes[i]?.valor ?? 0,
      }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <PageHeader
        title="Gestão Orçamentária"
        description="Planejamento, controle e análise orçamentária empresarial"
      />

      <div className="container mx-auto py-6 space-y-6">
        {/* Barra de controles */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={String(anoSelecionado)} onValueChange={(v) => setAnoSelecionado(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ANOS.map((a) => (
                <SelectItem key={a} value={String(a)}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {versaoAtiva && (
            <Select
              value={String(versaoAtiva.id)}
              onValueChange={(v) => setVersaoSelecionadaId(Number(v))}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Selecionar versão" />
              </SelectTrigger>
              <SelectContent>
                {versoesDoAno.map((v: any) => (
                  <SelectItem key={v.id} value={String(v.id)}>
                    {v.nomeVersao} (v{v.numeroVersao})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {versaoAtiva && (
            <Badge className={`${STATUS_LABELS[versaoAtiva.status]?.color ?? "bg-gray-400"} text-white`}>
              {STATUS_LABELS[versaoAtiva.status]?.label ?? versaoAtiva.status}
            </Badge>
          )}

          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowNovaVersao(true)}>
              <Plus className="h-4 w-4 mr-1" /> Nova Versão
            </Button>
            {versaoAtiva && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setVersaoDuplicarId(versaoAtiva.id);
                    setNovaVersaoNome(`Revisão ${(versoes?.length ?? 1)} - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`);
                    setShowDuplicar(true);
                  }}
                >
                  <Copy className="h-4 w-4 mr-1" /> Criar Revisão
                </Button>
                {versaoAtiva.status === "rascunho" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ versaoId: versaoAtiva.id, status: "em_revisao" })}
                  >
                    <ChevronRight className="h-4 w-4 mr-1" /> Enviar p/ Revisão
                  </Button>
                )}
                {versaoAtiva.status === "em_revisao" && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => updateStatusMutation.mutate({ versaoId: versaoAtiva.id, status: "aprovado" })}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Aprovar
                  </Button>
                )}
                {versaoAtiva.status === "aprovado" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ versaoId: versaoAtiva.id, status: "congelado" })}
                  >
                    <Lock className="h-4 w-4 mr-1" /> Congelar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* KPIs do Dashboard */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Planejado</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(dashboard.totalPlanejado)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Executado</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(dashboard.totalExecutado)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`${dashboard.variacao >= 0 ? "bg-red-100" : "bg-green-100"} p-3 rounded-lg`}>
                    {dashboard.variacao >= 0
                      ? <TrendingUp className="h-6 w-6 text-red-600" />
                      : <TrendingDown className="h-6 w-6 text-green-600" />}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Variação</p>
                    <p className={`text-lg font-bold ${dashboard.variacao >= 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(Math.abs(dashboard.variacao))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">% Execução</p>
                    <p className="text-lg font-bold text-purple-600">
                      {dashboard.percentualExecucao.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs principais */}
        <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
          <TabsList className="grid grid-cols-9 w-full">
            <TabsTrigger value="dashboard">
              <BarChart3 className="h-4 w-4 mr-1" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="planejado">
              <FileText className="h-4 w-4 mr-1" /> Planejado
            </TabsTrigger>
            <TabsTrigger value="executado">
              <TrendingUp className="h-4 w-4 mr-1" /> Executado
            </TabsTrigger>
            <TabsTrigger value="importacao">
              <Upload className="h-4 w-4 mr-1" /> Importação
            </TabsTrigger>
            <TabsTrigger value="categorias">
              <Settings className="h-4 w-4 mr-1" /> Categorias
            </TabsTrigger>
            <TabsTrigger value="relatorio">
              <FileText className="h-4 w-4 mr-1" /> Relatório
            </TabsTrigger>
            <TabsTrigger value="analise-custos">
              <Target className="h-4 w-4 mr-1" /> Análise
            </TabsTrigger>
            <TabsTrigger value="comparativo">
              <GitCompare className="h-4 w-4 mr-1" /> Versões
            </TabsTrigger>
            <TabsTrigger value="financeiro">
              <TrendingUp className="h-4 w-4 mr-1" /> Financeiro
            </TabsTrigger>
            <TabsTrigger value="analise-ia">
              <Brain className="h-4 w-4 mr-1" /> IA
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {!versaoAtiva ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma versão orçamentária encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie uma versão orçamentária para o ano {anoSelecionado} para começar.
                  </p>
                  <Button onClick={() => setShowNovaVersao(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Criar Versão Orçamentária
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Planejado vs Executado — {anoSelecionado}
                    </CardTitle>
                    <CardDescription>
                      Versão: {versaoAtiva.nomeVersao} (v{versaoAtiva.numeroVersao})
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="mes" />
                          <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(v: any) => formatCurrency(v)} />
                          <Legend />
                          <Bar dataKey="Planejado" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Executado" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Nenhum dado disponível. Adicione linhas no orçamento planejado.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Evolução mensal */}
                {chartData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Evolução Acumulada</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={chartData.map((d, i) => ({
                          ...d,
                          PlanejaAcum: chartData.slice(0, i + 1).reduce((a, c) => a + c.Planejado, 0),
                          ExecAcum: chartData.slice(0, i + 1).reduce((a, c) => a + c.Executado, 0),
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="mes" />
                          <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(v: any) => formatCurrency(v)} />
                          <Legend />
                          <Line type="monotone" dataKey="PlanejaAcum" stroke="#3b82f6" name="Planejado Acum." strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="ExecAcum" stroke="#22c55e" name="Executado Acum." strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Planejado */}
          <TabsContent value="planejado" className="mt-6">
            {versaoAtiva ? (
              <OrcamentoPlanejado
                versaoId={versaoAtiva.id}
                versaoStatus={versaoAtiva.status}
                ano={anoSelecionado}
              />
            ) : (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-muted-foreground">
                  Crie uma versão orçamentária primeiro.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Executado */}
          <TabsContent value="executado" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Lançamentos Executados — {anoSelecionado}</CardTitle>
                <CardDescription>Dados importados do ERP ou lançados manualmente</CardDescription>
              </CardHeader>
              <CardContent>
                <ExecutadoLista empresaId={empresaId} ano={anoSelecionado} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Importação */}
          <TabsContent value="importacao" className="mt-6">
            <OrcamentoImportacao empresaId={empresaId} ano={anoSelecionado} />
          </TabsContent>

          {/* Categorias */}
          <TabsContent value="categorias" className="mt-6">
            <OrcamentoCategorias />
          </TabsContent>

          {/* Relatório Detalhado */}
          <TabsContent value="relatorio" className="mt-6">
            <RelatorioOrcamentario empresaId={empresaId} ano={anoSelecionado} />
          </TabsContent>

          {/* Análise de Custos */}
          <TabsContent value="analise-custos" className="mt-6">
            <AnaliseOrcamentaria empresaId={empresaId} ano={anoSelecionado} />
          </TabsContent>

          {/* Comparativo de Versões */}
          <TabsContent value="comparativo" className="mt-6">
            <ComparativoVersoes empresaId={empresaId} ano={anoSelecionado} />
          </TabsContent>

          {/* Análise IA */}
          <TabsContent value="financeiro" className="mt-6">
            <DashboardReceita empresaId={empresaId} />
          </TabsContent>

          <TabsContent value="analise-ia" className="mt-6">
            <OrcamentoAnaliseIA empresaId={empresaId} ano={anoSelecionado} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Nova Versão */}
      <Dialog open={showNovaVersao} onOpenChange={setShowNovaVersao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Versão Orçamentária</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome da Versão</Label>
              <Input
                placeholder="Ex: Orçamento 2025 v1"
                value={novaVersaoNome}
                onChange={(e) => setNovaVersaoNome(e.target.value)}
              />
            </div>
            <div>
              <Label>Ano</Label>
              <Select value={String(anoSelecionado)} onValueChange={(v) => setAnoSelecionado(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANOS.map((a) => (
                    <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações (opcional)</Label>
              <Textarea
                placeholder="Contexto ou notas sobre esta versão..."
                value={novaVersaoObs}
                onChange={(e) => setNovaVersaoObs(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovaVersao(false)}>Cancelar</Button>
            <Button
              disabled={!novaVersaoNome.trim() || createVersaoMutation.isPending}
              onClick={() => createVersaoMutation.mutate({
                empresaId,
                ano: anoSelecionado,
                nomeVersao: novaVersaoNome.trim(),
                observacoes: novaVersaoObs.trim() || undefined,
              })}
            >
              {createVersaoMutation.isPending ? "Criando..." : "Criar Versão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Duplicar / Criar Revisão */}
      <Dialog open={showDuplicar} onOpenChange={setShowDuplicar}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar Revisão Orçamentária</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Duplica a versão atual com todos os valores, permitindo ajustes sem perder a referência original.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome da Nova Versão *</Label>
              <Input
                value={novaVersaoNome}
                onChange={(e) => setNovaVersaoNome(e.target.value)}
                placeholder="Ex: Revisão 1 - Abril 2026"
              />
            </div>
            <div>
              <Label>Motivo da Revisão</Label>
              <Textarea
                value={motivoRevisao}
                onChange={(e) => setMotivoRevisao(e.target.value)}
                placeholder="Descreva o motivo da revisão (ex: Inclusão de custos operacionais de campo)"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="congelar-origem"
                checked={congelarOrigem}
                onChange={(e) => setCongelarOrigem(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="congelar-origem" className="cursor-pointer">
                <span className="flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" />
                  Congelar versão original (recomendado)
                </span>
              </Label>
            </div>
            <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
              Ao congelar, a versão original fica protegida contra edições e serve como referência histórica.
              Você poderá comparar as versões na aba "Versões".
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicar(false)}>Cancelar</Button>
            <Button
              disabled={!novaVersaoNome.trim() || duplicarMutation.isPending}
              onClick={() => versaoDuplicarId && duplicarMutation.mutate({
                versaoOrigemId: versaoDuplicarId,
                nomeVersao: novaVersaoNome.trim(),
                motivoRevisao: motivoRevisao.trim() || undefined,
                congelarOrigem,
              })}
            >
              {duplicarMutation.isPending ? "Criando revisão..." : "Criar Revisão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Componente de lista do executado ────────────────────────────────────────

function ExecutadoLista({ empresaId, ano }: { empresaId: number; ano: number }) {
  const { data: linhas, isLoading } = trpc.orcamento.getExecutadoByEmpresa.useQuery({ empresaId, ano });

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;
  if (!linhas || linhas.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Upload className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p>Nenhum lançamento executado encontrado para {ano}.</p>
        <p className="text-sm mt-1">Use a aba "Importação" para importar dados do ERP.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 pr-4">Data</th>
            <th className="text-left py-2 pr-4">Descrição</th>
            <th className="text-left py-2 pr-4">Competência</th>
            <th className="text-right py-2 pr-4">Valor Original</th>
            <th className="text-right py-2">Valor BRL</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l: any) => (
            <tr key={l.id} className="border-b hover:bg-muted/30">
              <td className="py-2 pr-4 text-muted-foreground">
                {l.dataLancamento ? new Date(l.dataLancamento).toLocaleDateString("pt-BR") : "—"}
              </td>
              <td className="py-2 pr-4">{l.descricao ?? "—"}</td>
              <td className="py-2 pr-4">{l.competencia ?? "—"}</td>
              <td className="py-2 pr-4 text-right">
                {l.moedaOriginal} {parseFloat(l.valorOriginal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2 text-right font-medium">
                {formatCurrency(parseFloat(l.valorConvertidoBase))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
