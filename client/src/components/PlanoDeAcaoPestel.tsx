import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Shield, Zap } from "lucide-react";
import { useNotification } from "@/hooks/useNotification";

interface AcaoPestel {
  id: string;
  estrategia: "prevencao" | "protecao" | "mitigacao";
  descricao: string;
  urgencia: number;
  importancia: number;
  responsavel?: string;
  dataInicio?: string;
  dataFim?: string;
  status: "planejado" | "em_progresso" | "concluido" | "cancelado";
  percentualConclusao: number;
  observacoes?: string;
}

interface PlanoDeAcaoPestelProps {
  fatorId: string;
  categoria: string;
  onAcaoAdicionada?: (acao: AcaoPestel) => void;
}

const estrategias = [
  { valor: "prevencao", label: "Prevenção", icone: Shield, cor: "bg-blue-100 text-blue-700", descricao: "Evitar que o risco ocorra" },
  { valor: "protecao", label: "Proteção", icone: Zap, cor: "bg-yellow-100 text-yellow-700", descricao: "Minimizar impacto se ocorrer" },
  { valor: "mitigacao", label: "Mitigação", icone: AlertCircle, cor: "bg-orange-100 text-orange-700", descricao: "Reduzir severidade do risco" },
];

export default function PlanoDeAcaoPestel({ fatorId, categoria, onAcaoAdicionada }: PlanoDeAcaoPestelProps) {
  const notification = useNotification();
  const [acoes, setAcoes] = useState<AcaoPestel[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [edicao, setEdicao] = useState<AcaoPestel | null>(null);
  const [formulario, setFormulario] = useState<Partial<AcaoPestel>>({
    estrategia: "prevencao",
    urgencia: 3,
    importancia: 3,
    status: "planejado",
    percentualConclusao: 0,
  });

  const calcularPrioridade = (urgencia: number, importancia: number) => {
    const score = urgencia * importancia;
    if (score >= 16) return { label: "Crítica", cor: "bg-red-500", valor: "critica" };
    if (score >= 12) return { label: "Alta", cor: "bg-orange-500", valor: "alta" };
    if (score >= 8) return { label: "Média", cor: "bg-yellow-500", valor: "media" };
    return { label: "Baixa", cor: "bg-green-500", valor: "baixa" };
  };

  const handleAdicionarAcao = () => {
    if (!formulario.descricao?.trim()) {
      notification.warning("Descrição da ação é obrigatória");
      return;
    }

    const novaAcao: AcaoPestel = {
      id: edicao?.id || Date.now().toString(),
      estrategia: (formulario.estrategia || "prevencao") as any,
      descricao: formulario.descricao,
      urgencia: formulario.urgencia || 3,
      importancia: formulario.importancia || 3,
      responsavel: formulario.responsavel,
      dataInicio: formulario.dataInicio,
      dataFim: formulario.dataFim,
      status: (formulario.status || "planejado") as any,
      percentualConclusao: formulario.percentualConclusao || 0,
      observacoes: formulario.observacoes,
    };

    if (edicao) {
      setAcoes(acoes.map((a) => (a.id === edicao.id ? novaAcao : a)));
      notification.success("Ação atualizada com sucesso!");
      setEdicao(null);
    } else {
      setAcoes([...acoes, novaAcao]);
      notification.success("Ação adicionada com sucesso!");
      onAcaoAdicionada?.(novaAcao);
    }

    setFormulario({
      estrategia: "prevencao",
      urgencia: 3,
      importancia: 3,
      status: "planejado",
      percentualConclusao: 0,
    });
    setMostrarFormulario(false);
  };

  const handleEditarAcao = (acao: AcaoPestel) => {
    setEdicao(acao);
    setFormulario(acao);
    setMostrarFormulario(true);
  };

  const handleDeletarAcao = (id: string) => {
    setAcoes(acoes.filter((a) => a.id !== id));
    notification.success("Ação removida com sucesso!");
  };

  const handleCancelarEdicao = () => {
    setEdicao(null);
    setFormulario({
      estrategia: "prevencao",
      urgencia: 3,
      importancia: 3,
      status: "planejado",
      percentualConclusao: 0,
    });
    setMostrarFormulario(false);
  };

  const acoesPorEstrategia = estrategias.map((e) => ({
    ...e,
    count: acoes.filter((a) => a.estrategia === e.valor).length,
  }));

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Plano de Ação - {categoria}</h3>
          <p className="text-sm text-gray-600">Gerencie ações de prevenção, proteção e mitigação de riscos</p>
        </div>
        <Button onClick={() => setMostrarFormulario(!mostrarFormulario)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Ação
        </Button>
      </div>

      {/* Resumo por Estratégia */}
      <div className="grid grid-cols-3 gap-3">
        {acoesPorEstrategia.map((est) => {
          const Icon = est.icone;
          return (
            <Card key={est.valor}>
              <CardContent className="pt-6">
                <div className={`p-3 rounded-lg ${est.cor} mb-2 flex items-center gap-2`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{est.label}</span>
                </div>
                <div className="text-2xl font-bold">{est.count}</div>
                <p className="text-xs text-gray-600">{est.descricao}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Formulário de Adição */}
      {mostrarFormulario && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">{edicao ? "Editar Ação" : "Nova Ação de Risco"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Estratégia */}
            <div>
              <label className="text-sm font-medium mb-2 block">Estratégia de Resposta</label>
              <Select value={formulario.estrategia} onValueChange={(v) => setFormulario({ ...formulario, estrategia: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {estrategias.map((e) => (
                    <SelectItem key={e.valor} value={e.valor}>
                      {e.label} - {e.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descrição */}
            <div>
              <label className="text-sm font-medium mb-2 block">Descrição da Ação</label>
              <Textarea
                placeholder="Descreva a ação a ser tomada..."
                value={formulario.descricao || ""}
                onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
                className="min-h-20"
              />
            </div>

            {/* Urgência e Importância */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Urgência: {formulario.urgencia}/5</label>
                <Slider
                  value={[formulario.urgencia || 3]}
                  onValueChange={(v) => setFormulario({ ...formulario, urgencia: v[0] })}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Importância: {formulario.importancia}/5</label>
                <Slider
                  value={[formulario.importancia || 3]}
                  onValueChange={(v) => setFormulario({ ...formulario, importancia: v[0] })}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Responsável e Datas */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Responsável</label>
                <Input
                  placeholder="Nome do responsável"
                  value={formulario.responsavel || ""}
                  onChange={(e) => setFormulario({ ...formulario, responsavel: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Data Início</label>
                <Input
                  type="date"
                  value={formulario.dataInicio || ""}
                  onChange={(e) => setFormulario({ ...formulario, dataInicio: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Data Fim</label>
                <Input
                  type="date"
                  value={formulario.dataFim || ""}
                  onChange={(e) => setFormulario({ ...formulario, dataFim: e.target.value })}
                />
              </div>
            </div>

            {/* Status e Conclusão */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={formulario.status} onValueChange={(v) => setFormulario({ ...formulario, status: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planejado">Planejado</SelectItem>
                    <SelectItem value="em_progresso">Em Progresso</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Conclusão: {formulario.percentualConclusao}%</label>
                <Slider
                  value={[formulario.percentualConclusao || 0]}
                  onValueChange={(v) => setFormulario({ ...formulario, percentualConclusao: v[0] })}
                  min={0}
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="text-sm font-medium mb-2 block">Observações</label>
              <Textarea
                placeholder="Notas adicionais..."
                value={formulario.observacoes || ""}
                onChange={(e) => setFormulario({ ...formulario, observacoes: e.target.value })}
                className="min-h-16"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancelarEdicao}>
                Cancelar
              </Button>
              <Button onClick={handleAdicionarAcao}>{edicao ? "Atualizar" : "Adicionar"} Ação</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matriz de Priorização */}
      {acoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Matriz de Priorização</CardTitle>
            <CardDescription>Visualize as ações por prioridade e estratégia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {acoes.map((acao) => {
                const prioridade = calcularPrioridade(acao.urgencia, acao.importancia);
                const estrategia = estrategias.find((e) => e.valor === acao.estrategia);
                const statusIcon = acao.status === "concluido" ? CheckCircle2 : AlertCircle;
                const StatusIcon = statusIcon;

                return (
                  <div key={acao.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={estrategia?.cor}>{estrategia?.label}</Badge>
                          <Badge className={prioridade.cor}>{prioridade.label}</Badge>
                          <Badge variant="outline">{acao.status}</Badge>
                        </div>
                        <p className="font-medium">{acao.descricao}</p>
                        {acao.responsavel && <p className="text-sm text-gray-600 mt-1">Responsável: {acao.responsavel}</p>}
                        {acao.dataInicio && (
                          <p className="text-sm text-gray-600">
                            {acao.dataInicio} {acao.dataFim ? `até ${acao.dataFim}` : ""}
                          </p>
                        )}

                        {/* Barra de Progresso */}
                        {acao.percentualConclusao > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">Conclusão</span>
                              <span className="text-xs font-semibold">{acao.percentualConclusao}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${acao.percentualConclusao}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditarAcao(acao)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletarAcao(acao.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem Vazia */}
      {acoes.length === 0 && !mostrarFormulario && (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Nenhuma ação adicionada ainda</p>
            <p className="text-sm text-gray-500">Clique em "Nova Ação" para começar a criar seu plano de ação</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
