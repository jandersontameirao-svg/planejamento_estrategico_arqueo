import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";

interface Acao {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  estrategia: "Prevenção" | "Proteção" | "Mitigação";
  status: "Planejado" | "Em Progresso" | "Concluído" | "Atrasado";
  responsavel: string;
  dataInicio?: string;
  dataFim?: string;
  urgencia: number; // 1-5
  importancia: number; // 1-5
}

interface DashboardAcoesProps {
  empresaId?: number;
  acoes?: Acao[];
}

export default function DashboardAcoes({ empresaId = 1, acoes = [] }: DashboardAcoesProps) {
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
  const [filtroEstrategia, setFiltroEstrategia] = useState<string | null>(null);

  // Dados de exemplo se não houver ações
  const acoesExemplo: Acao[] = [
    {
      id: "1",
      titulo: "Implementar sistema de monitoramento de legislação",
      descricao: "Criar sistema para alertar sobre mudanças regulatórias",
      categoria: "PESTEL",
      estrategia: "Prevenção",
      status: "Em Progresso",
      responsavel: "Gerente de Compliance",
      dataInicio: "2026-01-15",
      dataFim: "2026-03-15",
      urgencia: 4,
      importancia: 5,
    },
  ];

  const acoesAtivas = acoes.length > 0 ? acoes : acoesExemplo;
  const acoesFiltradas = acoesAtivas.filter((acao) => {
    if (filtroStatus && acao.status !== filtroStatus) return false;
    if (filtroEstrategia && acao.estrategia !== filtroEstrategia) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Concluído":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "Atrasado":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "Em Progresso":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído":
        return "bg-green-100 text-green-800";
      case "Atrasado":
        return "bg-red-100 text-red-800";
      case "Em Progresso":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstrategiaColor = (estrategia: string) => {
    switch (estrategia) {
      case "Prevenção":
        return "bg-blue-100 text-blue-800";
      case "Proteção":
        return "bg-yellow-100 text-yellow-800";
      case "Mitigação":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calcularPrioridade = (urgencia: number, importancia: number) => {
    const score = (urgencia + importancia) / 2;
    if (score >= 4) return "Alta";
    if (score >= 2.5) return "Média";
    return "Baixa";
  };

  const resumoStatus = {
    total: acoesAtivas.length,
    concluidas: acoesAtivas.filter((a) => a.status === "Concluído").length,
    emProgresso: acoesAtivas.filter((a) => a.status === "Em Progresso").length,
    atrasadas: acoesAtivas.filter((a) => a.status === "Atrasado").length,
    planejadas: acoesAtivas.filter((a) => a.status === "Planejado").length,
  };

  return (
    <div className="space-y-6">
      {/* Resumo de Status */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{resumoStatus.total}</p>
              <p className="text-sm text-gray-600 mt-1">Total de Ações</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{resumoStatus.concluidas}</p>
              <p className="text-sm text-gray-600 mt-1">Concluídas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{resumoStatus.emProgresso}</p>
              <p className="text-sm text-gray-600 mt-1">Em Progresso</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{resumoStatus.atrasadas}</p>
              <p className="text-sm text-gray-600 mt-1">Atrasadas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-600">{resumoStatus.planejadas}</p>
              <p className="text-sm text-gray-600 mt-1">Planejadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold mb-2">Status:</p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filtroStatus === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroStatus(null)}
                >
                  Todos
                </Button>
                {["Planejado", "Em Progresso", "Concluído", "Atrasado"].map((status) => (
                  <Button
                    key={status}
                    variant={filtroStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroStatus(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Estratégia:</p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filtroEstrategia === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroEstrategia(null)}
                >
                  Todas
                </Button>
                {["Prevenção", "Proteção", "Mitigação"].map((estrategia) => (
                  <Button
                    key={estrategia}
                    variant={filtroEstrategia === estrategia ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroEstrategia(estrategia)}
                  >
                    {estrategia}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Ações */}
      <Card>
        <CardHeader>
          <CardTitle>Ações ({acoesFiltradas.length})</CardTitle>
          <CardDescription>Acompanhamento de ações por status e estratégia</CardDescription>
        </CardHeader>
        <CardContent>
          {acoesFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma ação encontrada com os filtros selecionados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {acoesFiltradas.map((acao) => (
                <div key={acao.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(acao.status)}
                        <h3 className="font-semibold text-lg">{acao.titulo}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{acao.descricao}</p>

                      <div className="flex gap-2 flex-wrap mb-3">
                        <Badge className={getStatusColor(acao.status)}>{acao.status}</Badge>
                        <Badge className={getEstrategiaColor(acao.estrategia)}>
                          {acao.estrategia}
                        </Badge>
                        <Badge variant="outline">{acao.categoria}</Badge>
                        <Badge variant="outline">
                          Prioridade: {calcularPrioridade(acao.urgencia, acao.importancia)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Responsável</p>
                          <p className="font-medium">{acao.responsavel}</p>
                        </div>
                        {acao.dataInicio && (
                          <div>
                            <p className="text-gray-600">Início</p>
                            <p className="font-medium">
                              {new Date(acao.dataInicio).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        )}
                        {acao.dataFim && (
                          <div>
                            <p className="text-gray-600">Fim</p>
                            <p className="font-medium">
                              {new Date(acao.dataFim).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
