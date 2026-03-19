/**
 * Módulo de Avaliação de Contratos
 * Usado como componente embarcado na aba "Avaliação" do ContratoDetalhe
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Star, Users, ClipboardList, Settings, Trash2, Edit2,
  CheckCircle, AlertTriangle, ChevronRight, Loader2, BarChart3,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  contratoId: number;
  empresaId: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    rascunho: { label: "Rascunho", cls: "bg-gray-100 text-gray-700" },
    em_andamento: { label: "Em Andamento", cls: "bg-blue-100 text-blue-700" },
    finalizada: { label: "Finalizada", cls: "bg-green-100 text-green-700" },
    cancelada: { label: "Cancelada", cls: "bg-red-100 text-red-700" },
  };
  const cfg = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>{cfg.label}</span>;
}

// ── Subcomponente: Avaliação Detalhada ───────────────────────────────────────

function AvaliacaoDetalhada({
  avaliacaoId,
  onBack,
}: {
  avaliacaoId: number;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [novoAvaliador, setNovoAvaliador] = useState({ nome: "", email: "", cargo: "", tipo: "interno" as const });
  const [novaAcao, setNovaAcao] = useState({ acao: "", responsavel: "", prazo: "" });
  const [notas, setNotas] = useState<Record<number, string>>({});
  const [avaliadorSelecionado, setAvaliadorSelecionado] = useState<number | null>(null);

  const { data: avaliacao } = trpc.avaliacaoContratos.avaliacoes.get.useQuery({ id: avaliacaoId });
  const { data: avaliadores } = trpc.avaliacaoContratos.avaliadores.list.useQuery({ avaliacaoId });
  const { data: metodologia } = trpc.avaliacaoContratos.metodologias.getCompleta.useQuery(
    { id: avaliacao?.metodologiaId ?? 0 },
    { enabled: !!avaliacao?.metodologiaId }
  );
  const { data: respostas } = trpc.avaliacaoContratos.respostas.list.useQuery(
    { avaliacaoId, avaliadorId: avaliadorSelecionado ?? undefined },
    { enabled: !!avaliadorSelecionado }
  );
  const { data: planos } = trpc.avaliacaoContratos.planos.list.useQuery({ avaliacaoId });
  const { data: planoDetalhe } = trpc.avaliacaoContratos.planos.get.useQuery(
    { id: planos?.[0]?.id ?? 0 },
    { enabled: !!(planos && planos.length > 0) }
  );

  const addAvaliador = trpc.avaliacaoContratos.avaliadores.create.useMutation({
    onSuccess: () => {
      utils.avaliacaoContratos.avaliadores.list.invalidate({ avaliacaoId });
      setNovoAvaliador({ nome: "", email: "", cargo: "", tipo: "interno" });
      toast.success("Avaliador adicionado");
    },
  });

  const deleteAvaliador = trpc.avaliacaoContratos.avaliadores.delete.useMutation({
    onSuccess: () => utils.avaliacaoContratos.avaliadores.list.invalidate({ avaliacaoId }),
  });

  const upsertResposta = trpc.avaliacaoContratos.respostas.upsert.useMutation({
    onSuccess: () => utils.avaliacaoContratos.respostas.list.invalidate({ avaliacaoId }),
  });

  const finalizarMutation = trpc.avaliacaoContratos.avaliacoes.finalizar.useMutation({
    onSuccess: (data) => {
      utils.avaliacaoContratos.avaliacoes.get.invalidate({ id: avaliacaoId });
      utils.avaliacaoContratos.planos.list.invalidate({ avaliacaoId });
      if (data.planoAcaoTriggered) {
        toast.warning(`Nota ${data.notaFinal.toFixed(2)} — Plano de Ação criado automaticamente!`);
      } else {
        toast.success(`Avaliação finalizada. Nota: ${data.notaFinal.toFixed(2)}`);
      }
    },
  });

  const addItem = trpc.avaliacaoContratos.planos.addItem.useMutation({
    onSuccess: () => {
      if (planos?.[0]) utils.avaliacaoContratos.planos.get.invalidate({ id: planos[0].id });
      setNovaAcao({ acao: "", responsavel: "", prazo: "" });
      toast.success("Ação adicionada ao plano");
    },
  });

  const updateItem = trpc.avaliacaoContratos.planos.updateItem.useMutation({
    onSuccess: () => {
      if (planos?.[0]) utils.avaliacaoContratos.planos.get.invalidate({ id: planos[0].id });
    },
  });

  const handleSalvarNota = (criterioId: number) => {
    if (!avaliadorSelecionado) return;
    const nota = notas[criterioId];
    if (!nota) return;
    upsertResposta.mutate({ avaliacaoId, avaliadorId: avaliadorSelecionado, criterioId, nota });
  };

  const getNotaExistente = (criterioId: number) => {
    return respostas?.find(r => r.criterioId === criterioId)?.nota ?? "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>← Voltar</Button>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{avaliacao?.titulo}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            {avaliacao && statusBadge(avaliacao.status)}
            {avaliacao?.notaFinal && (
              <span className="text-sm font-medium text-blue-700">Nota: {avaliacao.notaFinal}</span>
            )}
          </div>
        </div>
        {avaliacao?.status !== "finalizada" && avaliacao?.status !== "cancelada" && (
          <Button
            size="sm"
            onClick={() => finalizarMutation.mutate({ id: avaliacaoId })}
            disabled={finalizarMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {finalizarMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
            Finalizar
          </Button>
        )}
      </div>

      <Tabs defaultValue="avaliadores">
        <TabsList>
          <TabsTrigger value="avaliadores"><Users className="h-4 w-4 mr-1" />Avaliadores</TabsTrigger>
          <TabsTrigger value="notas"><Star className="h-4 w-4 mr-1" />Notas</TabsTrigger>
          {planos && planos.length > 0 && (
            <TabsTrigger value="plano"><AlertTriangle className="h-4 w-4 mr-1" />Plano de Ação</TabsTrigger>
          )}
        </TabsList>

        {/* Aba Avaliadores */}
        <TabsContent value="avaliadores" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Adicionar Avaliador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Nome *"
                  value={novoAvaliador.nome}
                  onChange={e => setNovoAvaliador(p => ({ ...p, nome: e.target.value }))}
                />
                <Input
                  placeholder="E-mail"
                  value={novoAvaliador.email}
                  onChange={e => setNovoAvaliador(p => ({ ...p, email: e.target.value }))}
                />
                <Input
                  placeholder="Cargo"
                  value={novoAvaliador.cargo}
                  onChange={e => setNovoAvaliador(p => ({ ...p, cargo: e.target.value }))}
                />
                <Select
                  value={novoAvaliador.tipo}
                  onValueChange={v => setNovoAvaliador(p => ({ ...p, tipo: v as any }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interno">Interno</SelectItem>
                    <SelectItem value="externo">Externo</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                onClick={() => addAvaliador.mutate({ avaliacaoId, ...novoAvaliador })}
                disabled={!novoAvaliador.nome || addAvaliador.isPending}
              >
                <Plus className="h-4 w-4 mr-1" />Adicionar
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {avaliadores?.map(av => (
              <div key={av.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium">{av.nome}</p>
                  <p className="text-xs text-gray-500">{av.cargo} · {av.email}</p>
                </div>
                <Badge variant="outline" className="text-xs">{av.tipo}</Badge>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-red-500"
                  onClick={() => deleteAvaliador.mutate({ id: av.id })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {(!avaliadores || avaliadores.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum avaliador adicionado.</p>
            )}
          </div>
        </TabsContent>

        {/* Aba Notas */}
        <TabsContent value="notas" className="space-y-4 mt-4">
          {!avaliadores || avaliadores.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Adicione avaliadores primeiro.</p>
          ) : (
            <>
              <div className="flex gap-2 flex-wrap">
                {avaliadores.map(av => (
                  <Button
                    key={av.id}
                    variant={avaliadorSelecionado === av.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAvaliadorSelecionado(av.id)}
                  >
                    {av.nome}
                  </Button>
                ))}
              </div>

              {avaliadorSelecionado && metodologia?.grupos?.map(grupo => (
                <Card key={grupo.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: grupo.cor ?? "#3B82F6" }}
                      />
                      {grupo.nome}
                      <span className="text-xs text-gray-400 font-normal">peso {grupo.peso}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {grupo.criterios?.map(crit => (
                      <div key={crit.id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{crit.titulo}</p>
                          {crit.descricao && <p className="text-xs text-gray-500">{crit.descricao}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={metodologia.escalaMin ?? 0}
                            max={metodologia.escalaMax ?? 10}
                            step="0.5"
                            className="w-20 text-center"
                            placeholder={getNotaExistente(crit.id) || "0"}
                            value={notas[crit.id] ?? getNotaExistente(crit.id)}
                            onChange={e => setNotas(p => ({ ...p, [crit.id]: e.target.value }))}
                          />
                          <Button
                            size="sm" variant="outline"
                            onClick={() => handleSalvarNota(crit.id)}
                            disabled={!notas[crit.id]}
                          >
                            OK
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        {/* Aba Plano de Ação */}
        {planos && planos.length > 0 && (
          <TabsContent value="plano" className="space-y-4 mt-4">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-orange-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {planoDetalhe?.titulo}
                </CardTitle>
                <p className="text-xs text-orange-700">{planoDetalhe?.descricao}</p>
              </CardHeader>
            </Card>

            {/* Adicionar ação */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Adicionar Ação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Descreva a ação *"
                  value={novaAcao.acao}
                  onChange={e => setNovaAcao(p => ({ ...p, acao: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Responsável"
                    value={novaAcao.responsavel}
                    onChange={e => setNovaAcao(p => ({ ...p, responsavel: e.target.value }))}
                  />
                  <Input
                    type="date"
                    value={novaAcao.prazo}
                    onChange={e => setNovaAcao(p => ({ ...p, prazo: e.target.value }))}
                  />
                </div>
                <Button
                  size="sm"
                  disabled={!novaAcao.acao || !planos[0] || addItem.isPending}
                  onClick={() => addItem.mutate({ planoId: planos[0].id, ...novaAcao })}
                >
                  <Plus className="h-4 w-4 mr-1" />Adicionar Ação
                </Button>
              </CardContent>
            </Card>

            {/* Lista de ações */}
            <div className="space-y-2">
              {planoDetalhe?.itens?.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.acao}</p>
                    <p className="text-xs text-gray-500">
                      {item.responsavel && `${item.responsavel} · `}
                      {item.prazo ? new Date(item.prazo).toLocaleDateString("pt-BR") : "Sem prazo"}
                    </p>
                  </div>
                  <Select
                    value={item.status}
                    onValueChange={v => updateItem.mutate({ id: item.id, data: { status: v as any } })}
                  >
                    <SelectTrigger className="w-36 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
              {(!planoDetalhe?.itens || planoDetalhe.itens.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">Nenhuma ação registrada ainda.</p>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function AvaliacaoContratos({ contratoId, empresaId }: Props) {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [tab, setTab] = useState<"avaliacoes" | "metodologias">("avaliacoes");
  const [avaliacaoAberta, setAvaliacaoAberta] = useState<number | null>(null);
  const [modalNovaAvaliacao, setModalNovaAvaliacao] = useState(false);
  const [modalNovaMetodologia, setModalNovaMetodologia] = useState(false);
  const [metodologiaSelecionada, setMetodologiaSelecionada] = useState<number | null>(null);
  const [modalNovoGrupo, setModalNovoGrupo] = useState(false);
  const [modalNovoCriterio, setModalNovoCriterio] = useState<{ grupoId: number } | null>(null);

  const [formAvaliacao, setFormAvaliacao] = useState({
    titulo: "", descricao: "", periodo: "", metodologiaId: 0,
  });
  const [formMetodologia, setFormMetodologia] = useState({
    nome: "", tipo: "customizada" as const, descricao: "", escalaMin: 0, escalaMax: 10, notaMinima: "7.00",
  });
  const [formGrupo, setFormGrupo] = useState({ nome: "", peso: "1.00", cor: "#3B82F6" });
  const [formCriterio, setFormCriterio] = useState({ titulo: "", descricao: "", peso: "1.00" });

  const { data: avaliacoes, isLoading: loadingAvaliacoes } = trpc.avaliacaoContratos.avaliacoes.list.useQuery({ contratoId });
  const { data: metodologias } = trpc.avaliacaoContratos.metodologias.list.useQuery({ empresaId });
  const { data: metodologiaCompleta } = trpc.avaliacaoContratos.metodologias.getCompleta.useQuery(
    { id: metodologiaSelecionada ?? 0 },
    { enabled: !!metodologiaSelecionada }
  );

  const criarAvaliacao = trpc.avaliacaoContratos.avaliacoes.create.useMutation({
    onSuccess: (data) => {
      utils.avaliacaoContratos.avaliacoes.list.invalidate({ contratoId });
      setModalNovaAvaliacao(false);
      setAvaliacaoAberta(data.id);
      toast.success("Avaliação criada");
    },
  });

  const deletarAvaliacao = trpc.avaliacaoContratos.avaliacoes.delete.useMutation({
    onSuccess: () => utils.avaliacaoContratos.avaliacoes.list.invalidate({ contratoId }),
  });

  const criarMetodologia = trpc.avaliacaoContratos.metodologias.create.useMutation({
    onSuccess: (data) => {
      utils.avaliacaoContratos.metodologias.list.invalidate({ empresaId });
      setModalNovaMetodologia(false);
      setMetodologiaSelecionada(data.id);
      toast.success("Metodologia criada");
    },
  });

  const deletarMetodologia = trpc.avaliacaoContratos.metodologias.delete.useMutation({
    onSuccess: () => {
      utils.avaliacaoContratos.metodologias.list.invalidate({ empresaId });
      setMetodologiaSelecionada(null);
    },
  });

  const criarGrupo = trpc.avaliacaoContratos.grupos.create.useMutation({
    onSuccess: () => {
      if (metodologiaSelecionada) utils.avaliacaoContratos.metodologias.getCompleta.invalidate({ id: metodologiaSelecionada });
      setModalNovoGrupo(false);
      setFormGrupo({ nome: "", peso: "1.00", cor: "#3B82F6" });
      toast.success("Grupo criado");
    },
  });

  const deletarGrupo = trpc.avaliacaoContratos.grupos.delete.useMutation({
    onSuccess: () => {
      if (metodologiaSelecionada) utils.avaliacaoContratos.metodologias.getCompleta.invalidate({ id: metodologiaSelecionada });
    },
  });

  const criarCriterio = trpc.avaliacaoContratos.criterios.create.useMutation({
    onSuccess: () => {
      if (metodologiaSelecionada) utils.avaliacaoContratos.metodologias.getCompleta.invalidate({ id: metodologiaSelecionada });
      setModalNovoCriterio(null);
      setFormCriterio({ titulo: "", descricao: "", peso: "1.00" });
      toast.success("Critério criado");
    },
  });

  const deletarCriterio = trpc.avaliacaoContratos.criterios.delete.useMutation({
    onSuccess: () => {
      if (metodologiaSelecionada) utils.avaliacaoContratos.metodologias.getCompleta.invalidate({ id: metodologiaSelecionada });
    },
  });

  // ── Se há avaliação aberta, mostra detalhe ───────────────────────────────
  if (avaliacaoAberta) {
    return (
      <AvaliacaoDetalhada
        avaliacaoId={avaliacaoAberta}
        onBack={() => setAvaliacaoAberta(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={tab === "avaliacoes" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("avaliacoes")}
          >
            <BarChart3 className="h-4 w-4 mr-1" />Avaliações
          </Button>
          <Button
            variant={tab === "metodologias" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("metodologias")}
          >
            <Settings className="h-4 w-4 mr-1" />Metodologias
          </Button>
        </div>
        {tab === "avaliacoes" && (
          <Button size="sm" onClick={() => setModalNovaAvaliacao(true)}>
            <Plus className="h-4 w-4 mr-1" />Nova Avaliação
          </Button>
        )}
        {tab === "metodologias" && (
          <Button size="sm" onClick={() => setModalNovaMetodologia(true)}>
            <Plus className="h-4 w-4 mr-1" />Nova Metodologia
          </Button>
        )}
      </div>

      {/* ── Tab Avaliações ─────────────────────────────────────────────────── */}
      {tab === "avaliacoes" && (
        <div className="space-y-3">
          {loadingAvaliacoes && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}
          {!loadingAvaliacoes && (!avaliacoes || avaliacoes.length === 0) && (
            <div className="text-center py-12 text-gray-400">
              <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma avaliação registrada para este contrato.</p>
              <p className="text-xs mt-1">Clique em "Nova Avaliação" para começar.</p>
            </div>
          )}
          {avaliacoes?.map(av => (
            <div
              key={av.id}
              className="flex items-center gap-3 p-4 bg-white border rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
              onClick={() => setAvaliacaoAberta(av.id)}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{av.titulo}</p>
                <div className="flex items-center gap-2 mt-1">
                  {statusBadge(av.status)}
                  {av.periodo && <span className="text-xs text-gray-400">{av.periodo}</span>}
                  {av.notaFinal && (
                    <span className="text-xs font-semibold text-blue-700">Nota: {av.notaFinal}</span>
                  )}
                  {av.planoAcaoTriggered && (
                    <span className="text-xs text-orange-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />Plano de Ação
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          ))}
        </div>
      )}

      {/* ── Tab Metodologias ───────────────────────────────────────────────── */}
      {tab === "metodologias" && (
        <div className="grid grid-cols-3 gap-4">
          {/* Lista de metodologias */}
          <div className="col-span-1 space-y-2">
            {metodologias?.map(m => (
              <div
                key={m.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  metodologiaSelecionada === m.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setMetodologiaSelecionada(m.id)}
              >
                <p className="text-sm font-medium">{m.nome}</p>
                <p className="text-xs text-gray-500 capitalize">{m.tipo} · Escala {m.escalaMin}–{m.escalaMax}</p>
              </div>
            ))}
            {(!metodologias || metodologias.length === 0) && (
              <p className="text-xs text-gray-400 text-center py-4">Nenhuma metodologia criada.</p>
            )}
          </div>

          {/* Detalhe da metodologia selecionada */}
          <div className="col-span-2">
            {!metodologiaSelecionada && (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                Selecione uma metodologia para ver os detalhes.
              </div>
            )}
            {metodologiaSelecionada && metodologiaCompleta && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{metodologiaCompleta.nome}</h4>
                    <p className="text-xs text-gray-500">Nota mínima: {metodologiaCompleta.notaMinima}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setModalNovoGrupo(true)}>
                      <Plus className="h-3.5 w-3.5 mr-1" />Grupo
                    </Button>
                    <Button
                      size="sm" variant="ghost"
                      className="text-red-500"
                      onClick={() => deletarMetodologia.mutate({ id: metodologiaSelecionada })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {metodologiaCompleta.grupos?.map(grupo => (
                  <Card key={grupo.id} className="border-l-4" style={{ borderLeftColor: grupo.cor ?? "#3B82F6" }}>
                    <CardHeader className="pb-2 pt-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{grupo.nome} <span className="text-xs text-gray-400 font-normal">peso {grupo.peso}</span></CardTitle>
                        <div className="flex gap-1">
                          <Button
                            size="sm" variant="ghost" className="h-6 text-xs"
                            onClick={() => setModalNovoCriterio({ grupoId: grupo.id })}
                          >
                            <Plus className="h-3 w-3 mr-0.5" />Critério
                          </Button>
                          <Button
                            size="icon" variant="ghost" className="h-6 w-6 text-red-400"
                            onClick={() => deletarGrupo.mutate({ id: grupo.id })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-3 space-y-1">
                      {grupo.criterios?.map(c => (
                        <div key={c.id} className="flex items-center gap-2 text-sm py-1">
                          <span className="flex-1 text-gray-700">{c.titulo}</span>
                          <span className="text-xs text-gray-400">peso {c.peso}</span>
                          <Button
                            size="icon" variant="ghost" className="h-5 w-5 text-red-400"
                            onClick={() => deletarCriterio.mutate({ id: c.id })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {(!grupo.criterios || grupo.criterios.length === 0) && (
                        <p className="text-xs text-gray-400 italic">Nenhum critério. Adicione um.</p>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {(!metodologiaCompleta.grupos || metodologiaCompleta.grupos.length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Nenhum grupo (nuvem) criado. Clique em "+ Grupo" para começar.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Nova Avaliação ─────────────────────────────────────────── */}
      <Dialog open={modalNovaAvaliacao} onOpenChange={setModalNovaAvaliacao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Avaliação</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Título *"
              value={formAvaliacao.titulo}
              onChange={e => setFormAvaliacao(p => ({ ...p, titulo: e.target.value }))}
            />
            <Textarea
              placeholder="Descrição"
              value={formAvaliacao.descricao}
              onChange={e => setFormAvaliacao(p => ({ ...p, descricao: e.target.value }))}
              rows={2}
            />
            <Input
              placeholder="Período (ex: Q1 2025)"
              value={formAvaliacao.periodo}
              onChange={e => setFormAvaliacao(p => ({ ...p, periodo: e.target.value }))}
            />
            <Select
              value={formAvaliacao.metodologiaId ? String(formAvaliacao.metodologiaId) : ""}
              onValueChange={v => setFormAvaliacao(p => ({ ...p, metodologiaId: Number(v) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a metodologia *" />
              </SelectTrigger>
              <SelectContent>
                {metodologias?.map(m => (
                  <SelectItem key={m.id} value={String(m.id)}>{m.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalNovaAvaliacao(false)}>Cancelar</Button>
            <Button
              disabled={!formAvaliacao.titulo || !formAvaliacao.metodologiaId || criarAvaliacao.isPending}
              onClick={() => criarAvaliacao.mutate({
                contratoId,
                empresaId,
                metodologiaId: formAvaliacao.metodologiaId,
                titulo: formAvaliacao.titulo,
                descricao: formAvaliacao.descricao,
                periodo: formAvaliacao.periodo,
              })}
            >
              {criarAvaliacao.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Nova Metodologia ───────────────────────────────────────── */}
      <Dialog open={modalNovaMetodologia} onOpenChange={setModalNovaMetodologia}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Metodologia de Avaliação</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nome *"
              value={formMetodologia.nome}
              onChange={e => setFormMetodologia(p => ({ ...p, nome: e.target.value }))}
            />
            <Select
              value={formMetodologia.tipo}
              onValueChange={v => setFormMetodologia(p => ({ ...p, tipo: v as any }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="customizada">Customizada</SelectItem>
                <SelectItem value="360">360°</SelectItem>
                <SelectItem value="nps">NPS</SelectItem>
                <SelectItem value="csat">CSAT</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Descrição"
              value={formMetodologia.descricao}
              onChange={e => setFormMetodologia(p => ({ ...p, descricao: e.target.value }))}
              rows={2}
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500">Escala mínima</label>
                <Input
                  type="number"
                  value={formMetodologia.escalaMin}
                  onChange={e => setFormMetodologia(p => ({ ...p, escalaMin: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Escala máxima</label>
                <Input
                  type="number"
                  value={formMetodologia.escalaMax}
                  onChange={e => setFormMetodologia(p => ({ ...p, escalaMax: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Nota mínima</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formMetodologia.notaMinima}
                  onChange={e => setFormMetodologia(p => ({ ...p, notaMinima: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalNovaMetodologia(false)}>Cancelar</Button>
            <Button
              disabled={!formMetodologia.nome || criarMetodologia.isPending}
              onClick={() => criarMetodologia.mutate({ empresaId, ...formMetodologia })}
            >
              {criarMetodologia.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Novo Grupo ─────────────────────────────────────────────── */}
      <Dialog open={modalNovoGrupo} onOpenChange={setModalNovoGrupo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Grupo (Nuvem)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nome do grupo *"
              value={formGrupo.nome}
              onChange={e => setFormGrupo(p => ({ ...p, nome: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Peso</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formGrupo.peso}
                  onChange={e => setFormGrupo(p => ({ ...p, peso: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Cor</label>
                <Input
                  type="color"
                  value={formGrupo.cor}
                  onChange={e => setFormGrupo(p => ({ ...p, cor: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalNovoGrupo(false)}>Cancelar</Button>
            <Button
              disabled={!formGrupo.nome || !metodologiaSelecionada || criarGrupo.isPending}
              onClick={() => criarGrupo.mutate({
                metodologiaId: metodologiaSelecionada!,
                nome: formGrupo.nome,
                peso: formGrupo.peso,
                cor: formGrupo.cor,
              })}
            >
              {criarGrupo.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Novo Critério ──────────────────────────────────────────── */}
      <Dialog open={!!modalNovoCriterio} onOpenChange={() => setModalNovoCriterio(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Critério</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Título do critério *"
              value={formCriterio.titulo}
              onChange={e => setFormCriterio(p => ({ ...p, titulo: e.target.value }))}
            />
            <Textarea
              placeholder="Descrição"
              value={formCriterio.descricao}
              onChange={e => setFormCriterio(p => ({ ...p, descricao: e.target.value }))}
              rows={2}
            />
            <div>
              <label className="text-xs text-gray-500">Peso</label>
              <Input
                type="number"
                step="0.1"
                value={formCriterio.peso}
                onChange={e => setFormCriterio(p => ({ ...p, peso: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalNovoCriterio(null)}>Cancelar</Button>
            <Button
              disabled={!formCriterio.titulo || !modalNovoCriterio || !metodologiaSelecionada || criarCriterio.isPending}
              onClick={() => criarCriterio.mutate({
                metodologiaId: metodologiaSelecionada!,
                grupoId: modalNovoCriterio!.grupoId,
                titulo: formCriterio.titulo,
                descricao: formCriterio.descricao,
                peso: formCriterio.peso,
              })}
            >
              {criarCriterio.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
