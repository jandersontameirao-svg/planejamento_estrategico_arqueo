import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, AlertTriangle, Shield, Zap, Sparkles } from "lucide-react";
import { useNotification } from "@/hooks/useNotification";
import { trpc } from "@/lib/trpc";

interface AcaoPestel {
  id: string;
  fatorId: string;
  estrategia: "prevencao" | "protecao" | "mitigacao";
  descricao: string;
  responsavel: string;
  prazo?: string;
  status: "planejado" | "em_progresso" | "concluido";
  urgencia: number; // 1-5
  importancia: number; // 1-5
  observacoes?: string;
}

interface PlanoDeAcaoPestelIntegradoProps {
  fatorId: string;
  fatorDescricao: string;
  fatorCategoria: string;
  onAcaoAdicionada?: (acao: AcaoPestel) => void;
}

export default function PlanoDeAcaoPestelIntegrado({
  fatorId,
  fatorDescricao,
  fatorCategoria,
  onAcaoAdicionada,
}: PlanoDeAcaoPestelIntegradoProps) {
  const notification = useNotification();
  const [acoes, setAcoes] = useState<AcaoPestel[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [edicao, setEdicao] = useState<AcaoPestel | null>(null);
  const [carregandoIA, setCarregandoIA] = useState(false);
  const gerarComIAMutation = trpc.planoAcao.gerarComIA.useMutation();
  const [formulario, setFormulario] = useState<Omit<AcaoPestel, 'id' | 'fatorId'>>({
    estrategia: "prevencao",
    descricao: "",
    responsavel: "",
    prazo: "",
    status: "planejado",
    urgencia: 3,
    importancia: 3,
    observacoes: "",
  });

  const estrategias = [
    {
      id: "prevencao",
      nome: "Prevenção",
      descricao: "Evitar que o risco ocorra",
      icone: AlertTriangle,
      cor: "bg-blue-50 border-blue-200",
      badge: "bg-blue-100 text-blue-800",
    },
    {
      id: "protecao",
      nome: "Proteção",
      descricao: "Reduzir o impacto se o risco ocorrer",
      icone: Shield,
      cor: "bg-green-50 border-green-200",
      badge: "bg-green-100 text-green-800",
    },
    {
      id: "mitigacao",
      nome: "Mitigação",
      descricao: "Minimizar os efeitos do risco",
      icone: Zap,
      cor: "bg-orange-50 border-orange-200",
      badge: "bg-orange-100 text-orange-800",
    },
  ];

  const handleAdicionarAcao = () => {
    if (!formulario.descricao.trim() || !formulario.responsavel.trim()) {
      notification.warning("Preencha descrição e responsável");
      return;
    }

    const novaAcao: AcaoPestel = {
      id: `acao-${Date.now()}`,
      fatorId,
      estrategia: formulario.estrategia,
      descricao: formulario.descricao,
      responsavel: formulario.responsavel,
      prazo: formulario.prazo,
      status: formulario.status,
      urgencia: formulario.urgencia,
      importancia: formulario.importancia,
      observacoes: formulario.observacoes,
    };

    if (edicao) {
      setAcoes(acoes.map((a) => (a.id === edicao.id ? { ...novaAcao, id: edicao.id } : a)));
      setEdicao(null);
    } else {
      setAcoes([...acoes, novaAcao]);
      onAcaoAdicionada?.(novaAcao);
    }

    setFormulario({
      estrategia: "prevencao",
      descricao: "",
      responsavel: "",
      prazo: "",
      status: "planejado",
      urgencia: 3,
      importancia: 3,
      observacoes: "",
    });
    setMostrarFormulario(false);
  };

  const handleDeletarAcao = (id: string) => {
    setAcoes(acoes.filter((a) => a.id !== id));
  };

  const handleEditarAcao = (acao: AcaoPestel) => {
    setEdicao(acao);
    setFormulario(acao);
    setMostrarFormulario(true);
  };

  const getEstrategiaInfo = (estrategia: string) => {
    return estrategias.find((e) => e.id === estrategia);
  };

  const getMatrizPrioridade = (urgencia: number, importancia: number) => {
    const score = (urgencia + importancia) / 2;
    if (score >= 4) return { nivel: "Alta", cor: "bg-red-100 text-red-800" };
    if (score >= 3) return { nivel: "Média", cor: "bg-yellow-100 text-yellow-800" };
    return { nivel: "Baixa", cor: "bg-green-100 text-green-800" };
  };

  const acoesAgrupadas = estrategias.map((est) => ({
    ...est,
    acoes: acoes.filter((a) => a.estrategia === est.id),
  }));

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          Plano de Ação - {fatorCategoria}
        </h3>
        <p className="text-sm text-blue-700">
          Fator: <strong>{fatorDescricao}</strong>
        </p>
      </div>

      {/* Botão Gerar com IA */}
      <div className="flex gap-2 mb-4">
        <Button
          onClick={async () => {
            setCarregandoIA(true);
            try {
              const resultado = await gerarComIAMutation.mutateAsync({
                fator: fatorDescricao,
                categoria: fatorCategoria,
              });
              const novasAcoes: AcaoPestel[] = [];
              if (resultado.prevencao) {
                novasAcoes.push(...resultado.prevencao.map((a: any) => ({
                  id: `acao-${Date.now()}-${Math.random()}`,
                  fatorId,
                  estrategia: "prevencao" as const,
                  descricao: a.titulo,
                  responsavel: a.responsavel || "A definir",
                  prazo: a.prazo || "",
                  status: "planejado" as const,
                  urgencia: 3,
                  importancia: 3,
                  observacoes: a.descricao,
                })));
              }
              if (resultado.protecao) {
                novasAcoes.push(...resultado.protecao.map((a: any) => ({
                  id: `acao-${Date.now()}-${Math.random()}`,
                  fatorId,
                  estrategia: "protecao" as const,
                  descricao: a.titulo,
                  responsavel: a.responsavel || "A definir",
                  prazo: a.prazo || "",
                  status: "planejado" as const,
                  urgencia: 3,
                  importancia: 3,
                  observacoes: a.descricao,
                })));
              }
              if (resultado.mitigacao) {
                novasAcoes.push(...resultado.mitigacao.map((a: any) => ({
                  id: `acao-${Date.now()}-${Math.random()}`,
                  fatorId,
                  estrategia: "mitigacao" as const,
                  descricao: a.titulo,
                  responsavel: a.responsavel || "A definir",
                  prazo: a.prazo || "",
                  status: "planejado" as const,
                  urgencia: 3,
                  importancia: 3,
                  observacoes: a.descricao,
                })));
              }
              setAcoes([...acoes, ...novasAcoes]);
              notification.success(`${novasAcoes.length} acoes geradas!`);
            } catch (erro) {
              notification.error("Erro ao gerar plano com IA");
            } finally {
              setCarregandoIA(false);
            }
          }}
          disabled={carregandoIA}
          className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700 text-white"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {carregandoIA ? "Gerando..." : "Gerar com IA"}
        </Button>
      </div>

      {/* Estratégias com Ações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {acoesAgrupadas.map((estrategia) => {
          const IconComponent = estrategia.icone;
          return (
            <Card key={estrategia.id} className={`border-l-4 ${estrategia.cor}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  <CardTitle className="text-base">{estrategia.nome}</CardTitle>
                </div>
                <p className="text-xs text-gray-600">{estrategia.descricao}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold text-gray-700">
                  {estrategia.acoes.length}
                </div>

                {estrategia.acoes.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {estrategia.acoes.map((acao) => {
                      const prioridade = getMatrizPrioridade(
                        acao.urgencia,
                        acao.importancia
                      );
                      return (
                        <div
                          key={acao.id}
                          className="bg-white p-2 rounded border border-gray-200 text-sm space-y-1"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <p className="font-medium text-gray-800 flex-1">
                              {acao.descricao}
                            </p>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditarAcao(acao)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeletarAcao(acao.id)}
                                className="p-1 hover:bg-red-100 rounded"
                              >
                                <Trash2 className="h-3 w-3 text-red-600" />
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {acao.responsavel}
                            </Badge>
                            <Badge className={`text-xs ${prioridade.cor}`}>
                              {prioridade.nivel}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {acao.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Button
                  onClick={() => {
                    setFormulario((prev) => ({
                      ...prev,
                      estrategia: estrategia.id as any,
                    }));
                    setMostrarFormulario(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Nova Ação
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Formulário de Ação */}
      {mostrarFormulario && (
        <Card className="bg-gray-50 border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="text-base">
              {edicao ? "Editar Ação" : "Nova Ação"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Descrição *</label>
              <Textarea
                value={formulario.descricao}
                onChange={(e) =>
                  setFormulario({ ...formulario, descricao: e.target.value })
                }
                placeholder="Descreva a ação a ser tomada"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Responsável *</label>
                <Input
                  value={formulario.responsavel}
                  onChange={(e) =>
                    setFormulario({ ...formulario, responsavel: e.target.value })
                  }
                  placeholder="Nome do responsável"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Prazo</label>
                <Input
                  type="date"
                  value={formulario.prazo}
                  onChange={(e) =>
                    setFormulario({ ...formulario, prazo: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Urgência: {formulario.urgencia}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formulario.urgencia}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      urgencia: parseInt(e.target.value),
                    })
                  }
                  className="w-full mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Importância: {formulario.importancia}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formulario.importancia}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      importancia: parseInt(e.target.value),
                    })
                  }
                  className="w-full mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={formulario.status}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full mt-1 px-2 py-1 border rounded"
                >
                  <option value="planejado">Planejado</option>
                  <option value="em_progresso">Em Progresso</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Observações</label>
              <Textarea
                value={formulario.observacoes}
                onChange={(e) =>
                  setFormulario({ ...formulario, observacoes: e.target.value })
                }
                placeholder="Observações adicionais"
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAdicionarAcao} className="flex-1 bg-blue-600">
                {edicao ? "Atualizar" : "Adicionar"}
              </Button>
              <Button
                onClick={() => {
                  setMostrarFormulario(false);
                  setEdicao(null);
                  setFormulario({
                    estrategia: "prevencao",
                    descricao: "",
                    responsavel: "",
                    prazo: "",
                    status: "planejado",
                    urgencia: 3,
                    importancia: 3,
                    observacoes: "",
                  });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
