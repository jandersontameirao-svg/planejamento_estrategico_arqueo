import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine,
} from "recharts";
import {
  ArrowLeft, Plus, Trash2, TrendingUp, TrendingDown, Clock,
  DollarSign, BarChart3, CalendarDays, Info, Home,
} from "lucide-react";
import FormularioDados from "@/components/capital-giro/FormularioDados";
import { toast } from "sonner";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { LogOut } from "lucide-react";

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

function cccBadge(ccc: number) {
  if (ccc <= 15) return <Badge className="bg-green-100 text-green-800 border-green-200">Ótimo</Badge>;
  if (ccc <= 30) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Atenção</Badge>;
  return <Badge className="bg-red-100 text-red-800 border-red-200">Crítico</Badge>;
}

function cccTextColor(ccc: number) {
  if (ccc <= 15) return "text-green-600";
  if (ccc <= 30) return "text-yellow-600";
  return "text-red-600";
}

export default function CapitalGiro() {
  const { empresaId } = useParams<{ empresaId: string }>();
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const id = parseInt(empresaId ?? "0", 10);
  const [abaAtiva, setAbaAtiva] = useState("visao-geral");
  const [dialogAberto, setDialogAberto] = useState(false);

  const utils = trpc.useUtils();

  const { data, isLoading, error } = trpc.capitalGiro.getPorEmpresa.useQuery(
    { empresaId: id },
    { enabled: id > 0 },
  );

  const excluir = trpc.capitalGiro.excluirDadosMensais.useMutation({
    onSuccess: () => {
      toast.success("Registro excluído");
      utils.capitalGiro.getPorEmpresa.invalidate({ empresaId: id });
      utils.capitalGiro.getGeral.invalidate();
    },
    onError: (err) => toast.error("Erro ao excluir", { description: err.message }),
  });

  const empresa = data?.empresa;
  const historico = data?.historico ?? [];
  const ultimo = data?.ultimo;

  const dadosGrafico = [...historico]
    .reverse()
    .map((r) => ({
      label: `${MESES[r.mes - 1]}/${String(r.ano).slice(2)}`,
      CCC: parseFloat(r.ccc.toFixed(1)),
      PMR: parseFloat(r.pmr.toFixed(1)),
      PMPF: parseFloat(r.pmpf.toFixed(1)),
      PME: parseFloat(r.pme.toFixed(1)),
    }));

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
      <main className="flex-1 container py-6 space-y-6">
        {/* Breadcrumb / título da página */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/empresa/${id}/planejamento`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Capital de Giro</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                {isLoading ? "Carregando..." : empresa?.nome ?? `Empresa #${id}`} — Ciclo de Conversão de Caixa
              </p>
            </div>
          </div>
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button disabled={isLoading || !!error}>
                <Plus className="h-4 w-4 mr-2" />
                Lançar Dados
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Lançamento Mensal — {empresa?.nome}</DialogTitle>
              </DialogHeader>
              <FormularioDados
                empresaId={id}
                tipoAtuacao={empresa?.tipoAtuacao ?? "servicos"}
                onSalvo={() => setDialogAberto(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Estado de carregamento / erro */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
            Carregando dados...
          </div>
        )}
        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-4 text-center text-destructive">
              Erro ao carregar: {error.message}
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && (
          <>
            {/* KPIs do último período */}
            {ultimo ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Clock className="h-3 w-3" /> CCC — Último Período
                    </div>
                    <div className={`text-3xl font-bold ${cccTextColor(ultimo.ccc)}`}>
                      {ultimo.ccc.toFixed(1)} dias
                    </div>
                    <div className="mt-1">{cccBadge(ultimo.ccc)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" /> PMR (Recebimento)
                    </div>
                    <div className="text-2xl font-semibold">{ultimo.pmr.toFixed(1)} dias</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {MESES[ultimo.mes - 1]}/{ultimo.ano}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> PMPF (Pagamento)
                    </div>
                    <div className="text-2xl font-semibold">{ultimo.pmpf.toFixed(1)} dias</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {MESES[ultimo.mes - 1]}/{ultimo.ano}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Faturamento
                    </div>
                    <div className="text-2xl font-semibold">{formatBRL(ultimo.faturamento)}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {MESES[ultimo.mes - 1]}/{ultimo.ano}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Nenhum dado lançado ainda</p>
                  <p className="text-sm mt-1">Clique em "Lançar Dados" para registrar o primeiro período.</p>
                </CardContent>
              </Card>
            )}

            {/* Abas */}
            <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
              <TabsList>
                <TabsTrigger value="visao-geral">
                  <BarChart3 className="h-4 w-4 mr-1" /> Visão Geral
                </TabsTrigger>
                <TabsTrigger value="historico">
                  <CalendarDays className="h-4 w-4 mr-1" /> Histórico
                </TabsTrigger>
                <TabsTrigger value="conceitos">
                  <Info className="h-4 w-4 mr-1" /> Conceitos
                </TabsTrigger>
              </TabsList>

              {/* Aba Visão Geral */}
              <TabsContent value="visao-geral" className="space-y-4">
                {dadosGrafico.length === 0 ? (
                  <Card>
                    <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
                      <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Nenhum dado para exibir</p>
                      <p className="text-sm mt-1">Lance o primeiro período para ver o gráfico de evolução.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Evolução do CCC (Ciclo de Conversão de Caixa)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                          <LineChart data={dadosGrafico} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} unit=" d" />
                            <Tooltip
                              formatter={(v: number, name: string) => [`${v.toFixed(1)} dias`, name]}
                              contentStyle={{ fontSize: 12 }}
                            />
                            <Legend />
                            <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="4 2" label={{ value: "30d", fontSize: 10 }} />
                            <ReferenceLine y={15} stroke="#22c55e" strokeDasharray="4 2" label={{ value: "15d", fontSize: 10 }} />
                            <Line type="monotone" dataKey="CCC" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="PMR" stroke="#2563eb" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                            <Line type="monotone" dataKey="PMPF" stroke="#16a34a" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          Linha vermelha = 30 dias (atenção) · Linha verde = 15 dias (ótimo)
                        </p>
                      </CardContent>
                    </Card>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "CCC Médio", value: (historico.reduce((s, r) => s + r.ccc, 0) / historico.length).toFixed(1) },
                        { label: "CCC Mínimo", value: Math.min(...historico.map((r) => r.ccc)).toFixed(1) },
                        { label: "CCC Máximo", value: Math.max(...historico.map((r) => r.ccc)).toFixed(1) },
                      ].map((stat) => (
                        <Card key={stat.label}>
                          <CardContent className="pt-4 text-center">
                            <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                            <div className="text-xl font-bold">{stat.value} dias</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Aba Histórico */}
              <TabsContent value="historico">
                {historico.length === 0 ? (
                  <Card>
                    <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
                      <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Nenhum registro encontrado</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Período</TableHead>
                            <TableHead className="text-right">Faturamento</TableHead>
                            <TableHead className="text-right">PMR</TableHead>
                            <TableHead className="text-right">PME</TableHead>
                            <TableHead className="text-right">PMPF</TableHead>
                            <TableHead className="text-right">CCC</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historico.map((r) => (
                            <TableRow key={r.id}>
                              <TableCell className="font-medium">{MESES[r.mes - 1]}/{r.ano}</TableCell>
                              <TableCell className="text-right">{formatBRL(r.faturamento)}</TableCell>
                              <TableCell className="text-right">{r.pmr.toFixed(1)}d</TableCell>
                              <TableCell className="text-right">{r.pme.toFixed(1)}d</TableCell>
                              <TableCell className="text-right">{r.pmpf.toFixed(1)}d</TableCell>
                              <TableCell className={`text-right font-semibold ${cccTextColor(r.ccc)}`}>
                                {r.ccc.toFixed(1)}d
                              </TableCell>
                              <TableCell className="text-center">{cccBadge(r.ccc)}</TableCell>
                              <TableCell>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Isso removerá permanentemente os dados de {MESES[r.mes - 1]}/{r.ano}.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => excluir.mutate({ id: r.id })}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Aba Conceitos */}
              <TabsContent value="conceitos" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      sigla: "CCC",
                      nome: "Ciclo de Conversão de Caixa",
                      formula: "CCC = PMR + PME − PMPF",
                      desc: "Mede o tempo (em dias) que a empresa leva para converter seus investimentos em estoques e outros recursos em fluxo de caixa. Quanto menor, melhor.",
                      cor: "border-purple-200 bg-purple-50",
                    },
                    {
                      sigla: "PMR",
                      nome: "Prazo Médio de Recebimento",
                      formula: "PMR = (Contas a Receber / Faturamento) × 30",
                      desc: "Indica quantos dias, em média, a empresa demora para receber de seus clientes após a venda.",
                      cor: "border-blue-200 bg-blue-50",
                    },
                    {
                      sigla: "PME",
                      nome: "Prazo Médio de Estocagem",
                      formula: "PME = (Estoques / CMV) × 30",
                      desc: "Indica quantos dias, em média, os produtos ficam estocados antes de serem vendidos. Aplicável a empresas com estoque físico.",
                      cor: "border-orange-200 bg-orange-50",
                    },
                    {
                      sigla: "PMPF",
                      nome: "Prazo Médio de Pagamento a Fornecedores",
                      formula: "PMPF = (Contas a Pagar / CMV) × 30",
                      desc: "Indica quantos dias, em média, a empresa demora para pagar seus fornecedores. Quanto maior, melhor para o fluxo de caixa.",
                      cor: "border-green-200 bg-green-50",
                    },
                  ].map((c) => (
                    <Card key={c.sigla} className={`border ${c.cor}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-bold text-base px-2">{c.sigla}</Badge>
                          <CardTitle className="text-sm">{c.nome}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <code className="text-xs bg-white/70 px-2 py-1 rounded block mb-2">{c.formula}</code>
                        <p className="text-sm text-muted-foreground">{c.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Card className="border-dashed">
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-2">Referências de Benchmark</h3>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span><strong>≤ 15 dias</strong> — Ótimo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span><strong>16–30 dias</strong> — Atenção</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span><strong>&gt; 30 dias</strong> — Crítico</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
