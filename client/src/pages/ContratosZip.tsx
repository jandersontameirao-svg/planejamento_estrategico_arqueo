/**
 * ContratosZip.tsx — Listagem de Contratos (Módulo ZIP v1.0.0)
 * Rota: /gestao-contratos
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  FileText, Plus, Search, Building2, Calendar, DollarSign,
  Loader2, ArrowLeft, Eye, Trash2, CheckCircle2, Clock, XCircle,
  AlertTriangle, TrendingUp, Users,
} from "lucide-react";

function formatDate(v: unknown) {
  if (!v) return "—";
  try { return new Date(v as string).toLocaleDateString("pt-BR"); } catch { return String(v); }
}
function formatCurrency(v: unknown) {
  if (!v) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    parseFloat(String(v))
  );
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: "Ativo", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: <CheckCircle2 className="h-3 w-3" /> },
  completed: { label: "Concluído", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: "Cancelado", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <XCircle className="h-3 w-3" /> },
  draft: { label: "Rascunho", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <Clock className="h-3 w-3" /> },
};

export default function ContratosZip() {
  const [, navigate] = useLocation();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("all");
  const [filtroEmpresa, setFiltroEmpresa] = useState("all");

  const { data: contratos = [], isLoading } = trpc.contractsModule.list.useQuery({});
  const { data: stats } = trpc.contractsModule.stats.useQuery({});
  const { data: empresas = [] } = trpc.empresas.list.useQuery();
  const utils = trpc.useUtils();

  const deleteMut = trpc.contractsModule.delete.useMutation({
    onSuccess: () => {
      utils.contractsModule.list.invalidate();
      utils.contractsModule.stats.invalidate();
      toast.success("Contrato excluído.");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtrados = contratos.filter((c) => {
    const matchBusca =
      !busca ||
      c.title?.toLowerCase().includes(busca.toLowerCase()) ||
      c.clientName?.toLowerCase().includes(busca.toLowerCase()) ||
      c.businessNumber?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "all" || c.status === filtroStatus;
    const matchEmpresa = filtroEmpresa === "all" || String(c.companyId) === filtroEmpresa;
    return matchBusca && matchStatus && matchEmpresa;
  });

  function handleDelete(id: number, title: string) {
    if (confirm(`Excluir o contrato "${title}"? Esta ação não pode ser desfeita.`)) {
      deleteMut.mutate({ id });
    }
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/gestao-clientes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-orange-500" />
              Gestão de Contratos
            </h1>
            <p className="text-sm text-muted-foreground">Contratos do Grupo Arqueo</p>
          </div>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
          <Link href="/gestao-contratos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Contrato
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-white/10 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <FileText className="h-3.5 w-3.5" /> Total
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ativos
              </div>
              <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            </CardContent>
          </Card>
          <Card className="border border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-blue-400 text-xs mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Concluídos
              </div>
              <p className="text-2xl font-bold text-blue-400">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card className="border border-orange-500/20 bg-orange-500/5">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-orange-400 text-xs mb-1">
                <TrendingUp className="h-3.5 w-3.5" /> Valor Total
              </div>
              <p className="text-lg font-bold text-orange-400">{formatCurrency(stats.totalValue)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, cliente ou número..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroEmpresa} onValueChange={setFiltroEmpresa}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {empresas.map((e: any) => (
              <SelectItem key={e.id} value={String(e.id)}>{e.nomeFantasia || e.razaoSocial}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : filtrados.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">
              {busca || filtroStatus !== "all" || filtroEmpresa !== "all"
                ? "Nenhum contrato encontrado com os filtros aplicados."
                : "Nenhum contrato cadastrado. Clique em \"Novo Contrato\" para começar."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtrados.map((c) => {
            const st = STATUS_MAP[c.status ?? "active"] ?? STATUS_MAP.active;
            const empresa = (empresas as any[]).find((e: any) => e.id === c.companyId);
            return (
              <Card
                key={c.id}
                className="border border-white/10 bg-card/50 backdrop-blur-sm hover:border-orange-500/30 transition-all group"
              >
                <CardContent className="py-4 px-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-sm truncate">{c.title}</h3>
                        <Badge className={`text-xs px-2 py-0 border ${st.color} flex items-center gap-1`}>
                          {st.icon} {st.label}
                        </Badge>
                        {c.isSigned ? (
                          <Badge className="text-xs px-2 py-0 bg-purple-500/20 text-purple-400 border-purple-500/30">
                            Assinado
                          </Badge>
                        ) : (
                          <Badge className="text-xs px-2 py-0 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            Não assinado
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {c.businessNumber && (
                          <span className="font-mono text-orange-400">#{c.businessNumber}</span>
                        )}
                        {c.clientName && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {c.clientName}
                          </span>
                        )}
                        {empresa && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {(empresa as any).nome}
                          </span>
                        )}
                        {c.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {formatDate(c.startDate)}
                            {c.endDate && <> — {formatDate(c.endDate)}</>}
                          </span>
                        )}
                        {c.totalValue && (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <DollarSign className="h-3 w-3" /> {formatCurrency(c.totalValue)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`/gestao-contratos/${c.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(c.id, c.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
