import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign, TrendingUp, TrendingDown, Receipt, FileText,
  AlertTriangle, CheckCircle, Clock, BarChart3, PieChart,
  ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";

interface Props {
  empresaId: number;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const formatPercent = (v: number) => `${v.toFixed(1)}%`;

export default function DashboardReceita({ empresaId }: Props) {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [tab, setTab] = useState("receita");

  const { data: receita, isLoading: loadingReceita } = trpc.contratos.dashboardReceita.useQuery({ empresaId, ano });
  const { data: resultado, isLoading: loadingResultado } = trpc.contratos.resultadoOperacional.useQuery({ empresaId, ano });

  const anos = useMemo(() => {
    const current = new Date().getFullYear();
    return [current - 1, current, current + 1];
  }, []);

  if (loadingReceita || loadingResultado) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl" />)}
        </div>
        <div className="h-80 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h2>
          <p className="text-gray-500 mt-1">Receita, Resultado Operacional e DRE</p>
        </div>
        <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="receita" className="gap-1">
            <DollarSign className="w-4 h-4" /> Receita
          </TabsTrigger>
          <TabsTrigger value="dre" className="gap-1">
            <BarChart3 className="w-4 h-4" /> DRE
          </TabsTrigger>
          <TabsTrigger value="contratos" className="gap-1">
            <FileText className="w-4 h-4" /> Por Contrato
          </TabsTrigger>
        </TabsList>

        {/* ── ABA RECEITA ── */}
        <TabsContent value="receita" className="mt-4 space-y-6">
          {receita ? (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Receita Prevista</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(receita.totais.totalPrevisto)}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-full">
                        <Receipt className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{receita.totais.totalContratos} contratos</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Receita Recebida</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(receita.totais.totalPago)}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-full">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={receita.totais.percentualRecebido} className="h-2" />
                      <p className="text-xs text-gray-400 mt-1">{formatPercent(receita.totais.percentualRecebido)} recebido</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">A Receber</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(receita.totais.totalPrevisto - receita.totais.totalPago)}</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-full">
                        <Clock className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatCurrency(receita.statusMarcos.atrasados)} em atraso
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Marcos Atrasados</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(receita.statusMarcos.atrasados)}</p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                    <p className="text-xs text-red-500 mt-2">Requer atenção imediata</p>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico Receita Mensal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Receita Mensal — Prevista vs Recebida</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {receita.receitaMensal.map((m: any) => {
                      const maxVal = Math.max(...receita.receitaMensal.map((x: any) => Math.max(x.previsto, x.pago)), 1);
                      const prevW = (m.previsto / maxVal) * 100;
                      const pagoW = (m.pago / maxVal) * 100;
                      return (
                        <div key={m.mes} className="grid grid-cols-12 gap-2 items-center text-sm">
                          <div className="col-span-1 font-medium text-gray-600">{m.nome}</div>
                          <div className="col-span-7">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="h-4 bg-blue-200 rounded-sm transition-all" style={{ width: `${prevW}%`, minWidth: m.previsto > 0 ? "4px" : "0" }} />
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-4 bg-green-400 rounded-sm transition-all" style={{ width: `${pagoW}%`, minWidth: m.pago > 0 ? "4px" : "0" }} />
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2 text-right text-blue-600 font-medium">{formatCurrency(m.previsto)}</div>
                          <div className="col-span-2 text-right text-green-600 font-medium">{formatCurrency(m.pago)}</div>
                        </div>
                      );
                    })}
                    <div className="flex gap-6 mt-4 pt-3 border-t text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-200 rounded-sm" />
                        <span className="text-gray-600">Previsto</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-400 rounded-sm" />
                        <span className="text-gray-600">Recebido</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pipeline de Marcos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pipeline de Receita por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Pendentes</p>
                      <p className="text-xl font-bold text-gray-700">{formatCurrency(receita.statusMarcos.pendentes)}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <p className="text-sm text-blue-600">Aprovados</p>
                      <p className="text-xl font-bold text-blue-700">{formatCurrency(receita.statusMarcos.aprovados)}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-sm text-green-600">Pagos</p>
                      <p className="text-xl font-bold text-green-700">{formatCurrency(receita.statusMarcos.pagos)}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg text-center">
                      <p className="text-sm text-red-600">Atrasados</p>
                      <p className="text-xl font-bold text-red-700">{formatCurrency(receita.statusMarcos.atrasados)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum contrato encontrado para esta empresa.</p>
              <p className="text-sm text-gray-400 mt-1">Cadastre contratos para visualizar a receita.</p>
            </Card>
          )}
        </TabsContent>

        {/* ── ABA DRE ── */}
        <TabsContent value="dre" className="mt-4 space-y-6">
          {resultado ? (
            <>
              {/* KPIs DRE */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-500">Receita Realizada</p>
                    <p className="text-2xl font-bold">{formatCurrency(resultado.totais.receitaRealizada)}</p>
                    <p className="text-xs text-gray-400 mt-1">Prevista: {formatCurrency(resultado.totais.receitaPrevista)}</p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-500">Despesa Executada</p>
                    <p className="text-2xl font-bold">{formatCurrency(resultado.totais.despesaExecutada)}</p>
                    <p className="text-xs text-gray-400 mt-1">Planejada: {formatCurrency(resultado.totais.despesaPlanejada)}</p>
                  </CardContent>
                </Card>
                <Card className={`border-l-4 ${resultado.totais.resultadoRealizado >= 0 ? "border-l-green-500" : "border-l-red-500"}`}>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-500">Resultado Operacional</p>
                    <p className={`text-2xl font-bold ${resultado.totais.resultadoRealizado >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(resultado.totais.resultadoRealizado)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Previsto: {formatCurrency(resultado.totais.resultadoPrevisto)}</p>
                  </CardContent>
                </Card>
                <Card className={`border-l-4 ${resultado.totais.margemRealizada >= 0 ? "border-l-emerald-500" : "border-l-red-500"}`}>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-500">Margem Operacional</p>
                    <p className={`text-2xl font-bold ${resultado.totais.margemRealizada >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatPercent(resultado.totais.margemRealizada)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Prevista: {formatPercent(resultado.totais.margemPrevista)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabela DRE Mensal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">DRE Simplificado — Mensal {ano}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-semibold text-gray-700">Conta</th>
                          {resultado.dreMensal.map((m: any) => (
                            <th key={m.mes} className="text-right p-3 font-semibold text-gray-700 whitespace-nowrap">{m.nome}</th>
                          ))}
                          <th className="text-right p-3 font-bold text-gray-900 bg-gray-100">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Receita Prevista */}
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-3 text-gray-600">Receita Prevista</td>
                          {resultado.dreMensal.map((m: any) => (
                            <td key={m.mes} className="text-right p-3 text-blue-600">{formatCurrency(m.receitaPrevista)}</td>
                          ))}
                          <td className="text-right p-3 font-bold text-blue-700 bg-gray-50">{formatCurrency(resultado.totais.receitaPrevista)}</td>
                        </tr>
                        {/* Receita Realizada */}
                        <tr className="border-b hover:bg-gray-50 bg-blue-50/30">
                          <td className="p-3 font-semibold text-blue-800">Receita Realizada</td>
                          {resultado.dreMensal.map((m: any) => (
                            <td key={m.mes} className="text-right p-3 font-semibold text-blue-700">{formatCurrency(m.receitaRealizada)}</td>
                          ))}
                          <td className="text-right p-3 font-bold text-blue-800 bg-blue-50">{formatCurrency(resultado.totais.receitaRealizada)}</td>
                        </tr>
                        {/* Despesa Planejada */}
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-3 text-gray-600">(-) Despesa Planejada</td>
                          {resultado.dreMensal.map((m: any) => (
                            <td key={m.mes} className="text-right p-3 text-orange-600">{formatCurrency(m.despesaPlanejada)}</td>
                          ))}
                          <td className="text-right p-3 font-bold text-orange-700 bg-gray-50">{formatCurrency(resultado.totais.despesaPlanejada)}</td>
                        </tr>
                        {/* Despesa Executada */}
                        <tr className="border-b hover:bg-gray-50 bg-red-50/30">
                          <td className="p-3 font-semibold text-red-800">(-) Despesa Executada</td>
                          {resultado.dreMensal.map((m: any) => (
                            <td key={m.mes} className="text-right p-3 font-semibold text-red-600">{formatCurrency(m.despesaExecutada)}</td>
                          ))}
                          <td className="text-right p-3 font-bold text-red-700 bg-red-50">{formatCurrency(resultado.totais.despesaExecutada)}</td>
                        </tr>
                        {/* Separador */}
                        <tr className="border-b-2 border-gray-300">
                          <td colSpan={14} className="p-0" />
                        </tr>
                        {/* Resultado Previsto */}
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-3 text-gray-600">= Resultado Previsto</td>
                          {resultado.dreMensal.map((m: any) => (
                            <td key={m.mes} className={`text-right p-3 ${m.resultadoPrevisto >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {formatCurrency(m.resultadoPrevisto)}
                            </td>
                          ))}
                          <td className={`text-right p-3 font-bold bg-gray-50 ${resultado.totais.resultadoPrevisto >= 0 ? "text-green-700" : "text-red-700"}`}>
                            {formatCurrency(resultado.totais.resultadoPrevisto)}
                          </td>
                        </tr>
                        {/* Resultado Realizado */}
                        <tr className={`border-b ${resultado.totais.resultadoRealizado >= 0 ? "bg-green-50/50" : "bg-red-50/50"}`}>
                          <td className="p-3 font-bold text-gray-900">= Resultado Realizado</td>
                          {resultado.dreMensal.map((m: any) => (
                            <td key={m.mes} className={`text-right p-3 font-bold ${m.resultadoRealizado >= 0 ? "text-green-700" : "text-red-700"}`}>
                              {formatCurrency(m.resultadoRealizado)}
                            </td>
                          ))}
                          <td className={`text-right p-3 font-bold text-lg ${resultado.totais.resultadoRealizado >= 0 ? "text-green-800 bg-green-100" : "text-red-800 bg-red-100"}`}>
                            {formatCurrency(resultado.totais.resultadoRealizado)}
                          </td>
                        </tr>
                        {/* Margem Realizada */}
                        <tr className="bg-gray-50">
                          <td className="p-3 font-semibold text-gray-700">Margem (%)</td>
                          {resultado.dreMensal.map((m: any) => (
                            <td key={m.mes} className={`text-right p-3 font-medium ${m.margemRealizada >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                              {m.receitaRealizada > 0 || m.despesaExecutada > 0 ? formatPercent(m.margemRealizada) : "—"}
                            </td>
                          ))}
                          <td className={`text-right p-3 font-bold ${resultado.totais.margemRealizada >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                            {formatPercent(resultado.totais.margemRealizada)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico Resultado Mensal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evolução do Resultado Operacional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resultado.dreMensal.map((m: any) => {
                      const maxVal = Math.max(
                        ...resultado.dreMensal.map((x: any) => Math.max(Math.abs(x.resultadoRealizado), Math.abs(x.resultadoPrevisto))),
                        1
                      );
                      const prevW = Math.abs(m.resultadoPrevisto) / maxVal * 50;
                      const realW = Math.abs(m.resultadoRealizado) / maxVal * 50;
                      return (
                        <div key={m.mes} className="grid grid-cols-12 gap-2 items-center text-sm">
                          <div className="col-span-1 font-medium text-gray-600">{m.nome}</div>
                          <div className="col-span-7 flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <div
                                className={`h-3 rounded-sm ${m.resultadoPrevisto >= 0 ? "bg-blue-200" : "bg-orange-200"}`}
                                style={{ width: `${prevW}%`, minWidth: "2px" }}
                              />
                              <span className="text-xs text-gray-400">prev</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div
                                className={`h-3 rounded-sm ${m.resultadoRealizado >= 0 ? "bg-green-400" : "bg-red-400"}`}
                                style={{ width: `${realW}%`, minWidth: "2px" }}
                              />
                              <span className="text-xs text-gray-400">real</span>
                            </div>
                          </div>
                          <div className="col-span-2 text-right">
                            <span className={m.resultadoPrevisto >= 0 ? "text-blue-600" : "text-orange-600"}>
                              {formatCurrency(m.resultadoPrevisto)}
                            </span>
                          </div>
                          <div className="col-span-2 text-right">
                            <span className={`font-medium ${m.resultadoRealizado >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {formatCurrency(m.resultadoRealizado)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Dados insuficientes para gerar o DRE.</p>
            </Card>
          )}
        </TabsContent>

        {/* ── ABA POR CONTRATO ── */}
        <TabsContent value="contratos" className="mt-4 space-y-4">
          {receita && receita.receitaPorContrato.length > 0 ? (
            <>
              <div className="grid gap-4">
                {receita.receitaPorContrato
                  .sort((a: any, b: any) => b.totalPrevisto - a.totalPrevisto)
                  .map((c: any) => (
                    <Card key={c.contratoId} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{c.titulo || "Sem título"}</h3>
                              <Badge variant={c.status === "ativo" ? "default" : "secondary"}>
                                {c.status}
                              </Badge>
                            </div>
                            {c.numero && <p className="text-sm text-gray-500">Nº {c.numero}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Valor do Contrato</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(c.valorContrato)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500">Previsto (Marcos)</p>
                            <p className="font-semibold text-blue-600">{formatCurrency(c.totalPrevisto)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Recebido</p>
                            <p className="font-semibold text-green-600">{formatCurrency(c.totalPago)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">A Receber</p>
                            <p className="font-semibold text-amber-600">{formatCurrency(c.totalPrevisto - c.totalPago)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Marcos</p>
                            <p className="font-semibold text-gray-700">
                              {c.marcosPagos}/{c.totalMarcos}
                              {c.marcosAtrasados > 0 && (
                                <span className="text-red-500 text-xs ml-1">({c.marcosAtrasados} atrasados)</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">% Recebido</p>
                            <div className="flex items-center gap-2">
                              <Progress value={c.percentual} className="h-2 flex-1" />
                              <span className="text-sm font-medium text-gray-700">{formatPercent(c.percentual)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum contrato encontrado.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
