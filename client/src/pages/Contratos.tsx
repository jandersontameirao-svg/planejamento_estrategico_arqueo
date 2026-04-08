import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SGCBanner } from "@/components/SGCBanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  FileText, DollarSign, Clock, AlertTriangle, Users,
  CheckCircle2, TrendingUp, ArrowLeft, BarChart3, Shield, ExternalLink,
  Calendar, Target, Building2, Loader2, TrendingDown, AlertCircle,
} from "lucide-react";

function formatCurrency(val: number | string | null | undefined) {
  if (val == null) return "—";
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPercent(val: number | null | undefined) {
  if (val == null) return "—";
  return `${val.toFixed(1)}%`;
}

interface ContratosProps {
  empresaId: number;
}

export default function Contratos({ empresaId }: ContratosProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("visao-geral");

  const { data: strategic, isLoading } = trpc.contratos.strategicDashboard.useQuery({ empresaId });

  const summary = strategic?.summary;
  const clients = strategic?.clients ?? [];
  const risks = strategic?.risks;

  // Cálculos derivados
  const percentFaturado = useMemo(() => {
    if (!summary || !summary.valorTotalContratado) return 0;
    return (summary.valorTotalFaturado / summary.valorTotalContratado) * 100;
  }, [summary]);

  const percentPrevisto = useMemo(() => {
    if (!summary || !summary.valorTotalContratado) return 0;
    return (summary.valorTotalPrevisto / summary.valorTotalContratado) * 100;
  }, [summary]);

  const totalMarcos = useMemo(() => {
    if (!summary) return 0;
    return summary.marcosVencidos + summary.marcosAVencer;
  }, [summary]);

  const percentMarcosVencidos = useMemo(() => {
    if (!totalMarcos) return 0;
    return (summary!.marcosVencidos / totalMarcos) * 100;
  }, [summary, totalMarcos]);

  // Ranking de clientes por valor
  const clientesRanking = useMemo(() => {
    if (!clients.length) return [];
    const totalValor = clients.reduce((acc: number, c: any) => acc + (c.valorTotalContratos ?? 0), 0);
    return [...clients]
      .sort((a: any, b: any) => (b.valorTotalContratos ?? 0) - (a.valorTotalContratos ?? 0))
      .map((c: any) => ({
        ...c,
        participacao: totalValor > 0 ? ((c.valorTotalContratos ?? 0) / totalValor) * 100 : 0,
      }));
  }, [clients]);

  const totalRiscos = risks?.totalRiscos ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SGC Banner */}
      <div className="max-w-7xl mx-auto px-6 pt-4">
        <SGCBanner
          message="Os contratos são gerenciados pelo SGC. Esta é uma visualização estratégica consolidada."
          sgcUrl={`${import.meta.env.VITE_SGC_PUBLIC_APP_URL || 'https://arqueomanage-c7undxdh.manus.space'}/empresa/${empresaId}/contratos`}
        />
      </div>

      {/* Header */}
      <div className="bg-white border-b px-6 py-4 mt-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/empresa/${empresaId}/planejamento`)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Planejamento
            </Button>
            <div className="h-5 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Dashboard Estratégico de Contratos</h1>
                <p className="text-xs text-gray-500">Dados consolidados do SGC — Sistema de Gestão Contratual</p>
              </div>
            </div>
          </div>
          <a
            href={`${import.meta.env.VITE_SGC_PUBLIC_APP_URL || 'https://arqueomanage-c7undxdh.manus.space'}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-1" /> Abrir no SGC
            </Button>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* KPIs Principais */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Total Contratos</p>
                <p className="text-2xl font-bold text-gray-900">{summary.contratosTotal}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Vigentes</p>
                <p className="text-2xl font-bold text-green-700">{summary.contratosVigentes}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Encerrados</p>
                <p className="text-2xl font-bold text-gray-600">{summary.contratosEncerrados}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Clientes Ativos</p>
                <p className="text-2xl font-bold text-indigo-700">{summary.clientesAtivos}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Marcos Vencidos</p>
                <p className="text-2xl font-bold text-orange-700">{summary.marcosVencidos}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Riscos Críticos</p>
                <p className="text-2xl font-bold text-red-700">{summary.riscosPorSeveridade?.critica ?? 0}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="visao-geral">
              <BarChart3 className="w-4 h-4 mr-1.5" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="carteira-clientes">
              <Users className="w-4 h-4 mr-1.5" /> Carteira de Clientes
            </TabsTrigger>
            <TabsTrigger value="riscos">
              <Shield className="w-4 h-4 mr-1.5" /> Exposição a Riscos
            </TabsTrigger>
          </TabsList>

          {/* ═══ ABA: VISÃO GERAL ═══ */}
          <TabsContent value="visao-geral">
            {summary ? (
              <div className="space-y-6">
                {/* Painel Financeiro */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        Panorama Financeiro
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Valor Contratado</span>
                          <span className="font-semibold">{formatCurrency(summary.valorTotalContratado)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Receita Prevista (Marcos)</span>
                          <span className="font-semibold text-blue-700">{formatCurrency(summary.valorTotalPrevisto)}</span>
                        </div>
                        <Progress value={percentPrevisto} className="h-2" />
                        <p className="text-xs text-gray-400 mt-1">{formatPercent(percentPrevisto)} do contratado</p>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Faturado</span>
                          <span className="font-semibold text-green-700">{formatCurrency(summary.valorTotalFaturado)}</span>
                        </div>
                        <Progress value={percentFaturado} className="h-2" />
                        <p className="text-xs text-gray-400 mt-1">{formatPercent(percentFaturado)} do contratado</p>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Pendente de Faturamento</span>
                          <span className="font-semibold text-amber-700">
                            {formatCurrency(summary.valorTotalContratado - summary.valorTotalFaturado)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Marcos Financeiros */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        Marcos Financeiros
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <p className="text-3xl font-bold text-orange-700">{summary.marcosVencidos}</p>
                          <p className="text-xs text-orange-600 mt-1">Vencidos</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-3xl font-bold text-blue-700">{summary.marcosAVencer}</p>
                          <p className="text-xs text-blue-600 mt-1">A Vencer</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Total de Marcos</span>
                          <span className="font-semibold">{totalMarcos}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full transition-all"
                            style={{ width: `${percentMarcosVencidos}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatPercent(percentMarcosVencidos)} dos marcos estão vencidos
                        </p>
                      </div>
                      {summary.boletinsPendentes > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                          <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0" />
                          <p className="text-xs text-yellow-700">
                            <strong>{summary.boletinsPendentes}</strong> boletim(ns) de medição pendente(s) de aprovação
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Resumo de Riscos */}
                {risks && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-600" />
                        Resumo de Riscos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                          <p className="text-2xl font-bold text-red-700">{risks.riscosPorSeveridade?.critica ?? 0}</p>
                          <p className="text-xs text-red-600">Críticos</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                          <p className="text-2xl font-bold text-orange-700">{risks.riscosPorSeveridade?.alta ?? 0}</p>
                          <p className="text-xs text-orange-600">Altos</p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                          <p className="text-2xl font-bold text-yellow-700">{risks.riscosPorSeveridade?.media ?? 0}</p>
                          <p className="text-xs text-yellow-600">Médios</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                          <p className="text-2xl font-bold text-green-700">{risks.riscosPorSeveridade?.baixa ?? 0}</p>
                          <p className="text-xs text-green-600">Baixos</p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <p className="text-gray-500">Total</p>
                          <p className="font-bold text-lg">{totalRiscos}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Sem Plano de Ação</p>
                          <p className="font-bold text-lg text-red-600">{risks.riscosSemPlanoDeAcao ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Críticos Abertos</p>
                          <p className="font-bold text-lg text-red-700">{risks.riscosCriticosAbertos ?? 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Alertas */}
                {summary.marcosVencidos > 10 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-800">Atenção: Alto volume de marcos vencidos</p>
                        <p className="text-sm text-red-700 mt-1">
                          Existem <strong>{summary.marcosVencidos}</strong> marcos financeiros com prazo vencido.
                          Isso pode impactar o fluxo de caixa e a relação com clientes.
                          Recomenda-se ação imediata no SGC.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Dados não disponíveis</p>
                  <p className="text-gray-400 text-sm mt-1">
                    A integração com o SGC não retornou dados para esta empresa.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ═══ ABA: CARTEIRA DE CLIENTES ═══ */}
          <TabsContent value="carteira-clientes">
            {clientesRanking.length > 0 ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Ranking de Clientes por Valor Contratado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {clientesRanking.map((c: any, idx: number) => (
                        <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            idx === 0 ? "bg-yellow-100 text-yellow-700" :
                            idx === 1 ? "bg-gray-200 text-gray-700" :
                            idx === 2 ? "bg-orange-100 text-orange-700" :
                            "bg-gray-100 text-gray-500"
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{c.razaoSocial || c.nomeFantasia}</p>
                            <p className="text-xs text-gray-500">{c.totalContratos} contrato(s)</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(c.valorTotalContratos)}</p>
                            <p className="text-xs text-gray-500">{formatPercent(c.participacao)} da carteira</p>
                          </div>
                          <div className="w-24">
                            <Progress value={c.participacao} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Resumo da Carteira */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-gray-500">Total de Clientes</p>
                      <p className="text-2xl font-bold text-indigo-700">{clients.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-gray-500">Valor Total da Carteira</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(clients.reduce((acc: number, c: any) => acc + (c.valorTotalContratos ?? 0), 0))}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-gray-500">Ticket Médio por Cliente</p>
                      <p className="text-lg font-bold text-gray-900">
                        {clients.length > 0
                          ? formatCurrency(clients.reduce((acc: number, c: any) => acc + (c.valorTotalContratos ?? 0), 0) / clients.length)
                          : "—"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Concentração */}
                {clientesRanking.length >= 3 && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4 flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-800">Análise de Concentração</p>
                        <p className="text-sm text-amber-700 mt-1">
                          Os 3 maiores clientes representam{" "}
                          <strong>
                            {formatPercent(
                              clientesRanking.slice(0, 3).reduce((acc: number, c: any) => acc + c.participacao, 0)
                            )}
                          </strong>{" "}
                          da carteira total. {clientesRanking[0].participacao > 40
                            ? "Alta concentração no maior cliente — considere diversificar."
                            : "Concentração dentro de níveis aceitáveis."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Nenhum cliente encontrado</p>
                  <p className="text-gray-400 text-sm mt-1">Aguardando sincronização de dados do SGC.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ═══ ABA: EXPOSIÇÃO A RISCOS ═══ */}
          <TabsContent value="riscos">
            {risks ? (
              <div className="space-y-6">
                {/* Status dos Riscos */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-gray-500">Abertos</p>
                      <p className="text-2xl font-bold text-red-700">{risks.riscosPorStatus?.aberto ?? 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-gray-500">Mitigados</p>
                      <p className="text-2xl font-bold text-blue-700">{risks.riscosPorStatus?.mitigado ?? 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-gray-500">Aceitos</p>
                      <p className="text-2xl font-bold text-green-700">{risks.riscosPorStatus?.aceito ?? 0}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Severidade */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      Distribuição por Severidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { label: "Crítica", value: risks.riscosPorSeveridade?.critica ?? 0, color: "bg-red-500", textColor: "text-red-700" },
                        { label: "Alta", value: risks.riscosPorSeveridade?.alta ?? 0, color: "bg-orange-500", textColor: "text-orange-700" },
                        { label: "Média", value: risks.riscosPorSeveridade?.media ?? 0, color: "bg-yellow-500", textColor: "text-yellow-700" },
                        { label: "Baixa", value: risks.riscosPorSeveridade?.baixa ?? 0, color: "bg-green-500", textColor: "text-green-700" },
                      ].map((sev) => (
                        <div key={sev.label} className="flex items-center gap-3">
                          <span className={`text-sm font-medium w-16 ${sev.textColor}`}>{sev.label}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                              className={`h-full ${sev.color} rounded-full transition-all flex items-center justify-end pr-2`}
                              style={{ width: totalRiscos > 0 ? `${Math.max((sev.value / totalRiscos) * 100, 2)}%` : "0%" }}
                            >
                              {sev.value > 0 && (
                                <span className="text-[10px] text-white font-bold">{sev.value}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-semibold w-8 text-right">{sev.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Riscos por Contrato */}
                {risks.riscosPorContrato && risks.riscosPorContrato.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Riscos por Contrato
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {risks.riscosPorContrato
                          .sort((a: any, b: any) => b.criticos - a.criticos)
                          .map((rc: any) => (
                            <div key={rc.contractId} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{rc.contractTitle}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {rc.criticos > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {rc.criticos} crítico(s)
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {rc.total} total
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Alerta de riscos sem plano */}
                {(risks.riscosSemPlanoDeAcao ?? 0) > 0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-800">Riscos sem Plano de Ação</p>
                        <p className="text-sm text-red-700 mt-1">
                          Existem <strong>{risks.riscosSemPlanoDeAcao}</strong> risco(s) identificados sem plano de ação definido.
                          Recomenda-se criar planos de mitigação no SGC para reduzir a exposição.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Dados de riscos não disponíveis</p>
                  <p className="text-gray-400 text-sm mt-1">Aguardando sincronização de dados do SGC.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
