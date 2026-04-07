import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SGCBanner } from "@/components/SGCBanner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, Plus, Search, Building2, DollarSign, Clock, AlertTriangle,
  CheckCircle2, TrendingUp, Users, ArrowLeft, BarChart3, Shield,
} from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  rascunho:   { label: "Rascunho",   color: "bg-gray-100 text-gray-700" },
  ativo:      { label: "Ativo",      color: "bg-green-100 text-green-700" },
  suspenso:   { label: "Suspenso",   color: "bg-orange-100 text-orange-700" },
  encerrado:  { label: "Encerrado",  color: "bg-gray-200 text-gray-600" },
  rescindido: { label: "Rescindido", color: "bg-red-100 text-red-700" },
};

const TIPO_LABELS: Record<string, string> = {
  servico:     "Serviço",
  produto:     "Produto",
  misto:       "Misto",
  consultoria: "Consultoria",
  manutencao:  "Manutenção",
  outros:      "Outros",
};

function formatCurrency(val: string | null | undefined) {
  if (!val) return "—";
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(val: string | Date | null | undefined) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("pt-BR");
}

interface ContratosProps {
  empresaId: number;
}
export default function Contratos({ empresaId }: ContratosProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const { data: contratos = [], isLoading } = trpc.contratos.contratos.list.useQuery({ empresaId });
  const { data: dashboard } = trpc.contratos.dashboard.useQuery({ empresaId });
  const { data: empresas = [] } = trpc.empresas.list.useQuery();

  const contratosFiltrados = contratos.filter((c: any) => {
    const matchBusca = !busca || c.titulo.toLowerCase().includes(busca.toLowerCase()) || c.numero.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || c.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SGC Integration Banner */}
      <div className="max-w-7xl mx-auto px-6 pt-4">
        <SGCBanner
          message="Os contratos são gerenciados pelo SGC. Esta é uma visualização somente leitura."
          sgcUrl={`${import.meta.env.VITE_SGC_PUBLIC_APP_URL || ''}/empresa/${empresaId}/contratos`}
        />
      </div>
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/empresa/${empresaId}/planejamento`)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Planejamento
            </Button>
            <div className="h-5 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Gestão de Contratos</h1>
                <p className="text-xs text-gray-500">SGC — Sistema de Gestão Contratual</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/empresa/${empresaId}/contratos/clientes`)}>
              <Users className="w-4 h-4 mr-1" /> Clientes
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* KPIs */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total de Contratos</p>
                    <p className="text-2xl font-bold text-gray-900">{(dashboard as any).totalContratos ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ativos</p>
                    <p className="text-2xl font-bold text-green-700">{(dashboard as any).ativos ?? (dashboard as any).vigentes ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Valor Total</p>
                    <p className="text-lg font-bold text-purple-700">{formatCurrency(String((dashboard as any).valorTotal ?? 0))}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Marcos Atrasados</p>
                    <p className="text-2xl font-bold text-orange-700">{(dashboard as any).marcosAtrasados ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por número ou título..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>

        {/* Lista de Contratos */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white rounded-xl border animate-pulse" />
            ))}
          </div>
        ) : contratosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum contrato encontrado</p>
              <p className="text-gray-400 text-sm mt-1">
                {busca || filtroStatus !== "todos" ? "Tente ajustar os filtros" : "Clique em \"Novo Contrato\" para começar"}
              </p>
              {!busca && filtroStatus === "todos" && (
                <Button className="mt-4" onClick={() => navigate(`/empresa/${empresaId}/contratos/novo`)}>
                  <Plus className="w-4 h-4 mr-1" /> Criar Primeiro Contrato
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {contratosFiltrados.map((contrato: any) => {
              const statusInfo = STATUS_LABELS[contrato.status] ?? { label: contrato.status, color: "bg-gray-100 text-gray-700" };
              const empresa = empresas.find((e: any) => e.id === contrato.empresaId);
              return (
                <Card
                  key={contrato.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/empresa/${empresaId}/contratos/${contrato.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-500 font-mono">{contrato.numero}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              {TIPO_LABELS[contrato.tipo] ?? contrato.tipo}
                            </span>
                            {!contrato.iaRevisado && contrato.pdfUrl && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Revisão IA pendente
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 mt-1 truncate">{contrato.titulo}</h3>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 flex-wrap">
                            {empresa && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {empresa.nome}
                              </span>
                            )}
                            {contrato.dataInicio && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(contrato.dataInicio)} → {formatDate(contrato.dataFim)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(contrato.valorTotal)}</p>
                        <p className="text-xs text-gray-500">{contrato.moeda}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
