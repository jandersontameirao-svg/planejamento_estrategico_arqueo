import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus, Trash2, ChevronDown, ChevronRight, Pencil, Check, X,
  Tag, Layers, DollarSign, TrendingDown, ShoppingCart, BarChart2, MoreHorizontal
} from "lucide-react";

type TipoCategoria = "receita" | "custo" | "despesa" | "investimento" | "outro";

const TIPO_CONFIG: Record<TipoCategoria, { label: string; cor: string; icone: React.ReactNode }> = {
  receita:      { label: "Receita",      cor: "bg-green-100 text-green-700 border-green-200",    icone: <TrendingDown className="h-3 w-3 rotate-180" /> },
  custo:        { label: "Custo",        cor: "bg-red-100 text-red-700 border-red-200",           icone: <ShoppingCart className="h-3 w-3" /> },
  despesa:      { label: "Despesa",      cor: "bg-orange-100 text-orange-700 border-orange-200",  icone: <DollarSign className="h-3 w-3" /> },
  investimento: { label: "Investimento", cor: "bg-blue-100 text-blue-700 border-blue-200",        icone: <BarChart2 className="h-3 w-3" /> },
  outro:        { label: "Outro",        cor: "bg-gray-100 text-gray-600 border-gray-200",        icone: <MoreHorizontal className="h-3 w-3" /> },
};

const TIPO_BORDA: Record<TipoCategoria, string> = {
  receita:      "border-l-green-500",
  custo:        "border-l-red-500",
  despesa:      "border-l-orange-500",
  investimento: "border-l-blue-500",
  outro:        "border-l-gray-400",
};

const TIPO_DICA: Record<TipoCategoria, string> = {
  custo:        "Gastos diretamente ligados à produção/operação (ex: matéria-prima, mão de obra direta)",
  despesa:      "Gastos administrativos e comerciais não ligados à produção (ex: aluguel, marketing)",
  receita:      "Entradas financeiras previstas (ex: vendas, serviços, contratos)",
  investimento: "Aplicações de capital para crescimento ou melhoria (ex: equipamentos, tecnologia)",
  outro:        "",
};

export default function OrcamentoCategorias() {
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [expandidas, setExpandidas] = useState<Set<number>>(new Set());
  const [showNova, setShowNova] = useState(false);
  const [showNovaSubcat, setShowNovaSubcat] = useState(false);
  const [subcatParentId, setSubcatParentId] = useState<number | null>(null);
  const [editandoCat, setEditandoCat] = useState<number | null>(null);
  const [editandoSubcat, setEditandoSubcat] = useState<number | null>(null);

  const [form, setForm] = useState({ nome: "", tipo: "despesa" as TipoCategoria, descricao: "", observacao: "" });
  const [formSubcat, setFormSubcat] = useState({ nome: "", descricao: "" });
  const [editCatForm, setEditCatForm] = useState({ nome: "", tipo: "despesa" as TipoCategoria, descricao: "", observacao: "" });
  const [editSubcatForm, setEditSubcatForm] = useState({ nome: "", descricao: "" });

  const { data: categorias, refetch } = trpc.orcamento.getCategorias.useQuery();
  const { data: subcategorias, refetch: refetchSub } = trpc.orcamento.getSubcategorias.useQuery({ categoriaId: undefined });

  const createMutation = trpc.orcamento.createCategoria.useMutation({
    onSuccess: () => { toast.success("Categoria criada!"); refetch(); setShowNova(false); setForm({ nome: "", tipo: "despesa", descricao: "", observacao: "" }); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  const updateCatMutation = trpc.orcamento.updateCategoria.useMutation({
    onSuccess: () => { toast.success("Categoria atualizada!"); refetch(); setEditandoCat(null); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  const deleteMutation = trpc.orcamento.deleteCategoria.useMutation({
    onSuccess: () => { toast.success("Categoria removida!"); refetch(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  const createSubcatMutation = trpc.orcamento.createSubcategoria.useMutation({
    onSuccess: () => { toast.success("Subcategoria criada!"); refetchSub(); setShowNovaSubcat(false); setFormSubcat({ nome: "", descricao: "" }); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  const updateSubcatMutation = trpc.orcamento.updateSubcategoria.useMutation({
    onSuccess: () => { toast.success("Subcategoria atualizada!"); refetchSub(); setEditandoSubcat(null); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  const deleteSubcatMutation = trpc.orcamento.deleteSubcategoria.useMutation({
    onSuccess: () => { toast.success("Subcategoria removida!"); refetchSub(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const getSubcatsDaCategoria = (catId: number) =>
    (subcategorias ?? []).filter((s: any) => s.categoriaId === catId);

  const toggleExpandida = (id: number) => {
    setExpandidas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const iniciarEditCat = (cat: any) => {
    setEditCatForm({ nome: cat.nome, tipo: cat.tipo, descricao: cat.descricao ?? "", observacao: cat.observacao ?? "" });
    setEditandoCat(cat.id);
  };

  const iniciarEditSubcat = (sub: any) => {
    setEditSubcatForm({ nome: sub.nome, descricao: sub.descricao ?? "" });
    setEditandoSubcat(sub.id);
  };

  const categoriasFiltradas = (categorias ?? []).filter((c: any) =>
    filtroTipo === "todos" || c.tipo === filtroTipo
  );

  const contadores = (categorias ?? []).reduce((acc: Record<string, number>, c: any) => {
    acc[c.tipo] = (acc[c.tipo] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Categorias Orçamentárias
          </h3>
          <p className="text-sm text-muted-foreground">
            Gerencie categorias e subcategorias para classificar custos, despesas e receitas
          </p>
        </div>
        <Button onClick={() => setShowNova(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" /> Nova Categoria
        </Button>
      </div>

      {/* Filtros por tipo */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltroTipo("todos")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
            filtroTipo === "todos"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-border hover:bg-muted"
          }`}
        >
          Todos ({(categorias ?? []).length})
        </button>
        {(["custo", "despesa", "receita", "investimento", "outro"] as TipoCategoria[]).map((tipo) => {
          const cfg = TIPO_CONFIG[tipo];
          const count = contadores[tipo] ?? 0;
          if (count === 0 && filtroTipo !== tipo) return null;
          return (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${
                filtroTipo === tipo
                  ? "bg-primary text-primary-foreground border-primary"
                  : `${cfg.cor} border`
              }`}
            >
              {cfg.icone}
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {categoriasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Layers className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">
              {filtroTipo === "todos"
                ? "Nenhuma categoria cadastrada"
                : `Nenhuma categoria do tipo "${TIPO_CONFIG[filtroTipo as TipoCategoria]?.label}"`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Crie categorias para organizar os lançamentos orçamentários
            </p>
            <Button className="mt-4" onClick={() => setShowNova(true)}>
              <Plus className="h-4 w-4 mr-2" /> Criar Primeira Categoria
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {categoriasFiltradas.map((cat: any) => {
            const subcats = getSubcatsDaCategoria(cat.id);
            const expanded = expandidas.has(cat.id);
            const cfg = TIPO_CONFIG[cat.tipo as TipoCategoria] ?? TIPO_CONFIG.outro;
            const editando = editandoCat === cat.id;

            return (
              <Card key={cat.id} className={`border-l-4 ${TIPO_BORDA[cat.tipo as TipoCategoria] ?? "border-l-gray-400"} overflow-hidden`}>
                <div className="p-4">
                  {editando ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Nome *</Label>
                          <Input value={editCatForm.nome} onChange={(e) => setEditCatForm((p) => ({ ...p, nome: e.target.value }))} className="h-8 text-sm mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">Tipo *</Label>
                          <Select value={editCatForm.tipo} onValueChange={(v) => setEditCatForm((p) => ({ ...p, tipo: v as TipoCategoria }))}>
                            <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="receita">Receita</SelectItem>
                              <SelectItem value="custo">Custo</SelectItem>
                              <SelectItem value="despesa">Despesa</SelectItem>
                              <SelectItem value="investimento">Investimento</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Descrição</Label>
                        <Input value={editCatForm.descricao} onChange={(e) => setEditCatForm((p) => ({ ...p, descricao: e.target.value }))} className="h-8 text-sm mt-1" placeholder="Descrição breve..." />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => setEditandoCat(null)}><X className="h-3 w-3 mr-1" /> Cancelar</Button>
                        <Button size="sm" disabled={!editCatForm.nome.trim() || updateCatMutation.isPending} onClick={() => updateCatMutation.mutate({ id: cat.id, ...editCatForm })}>
                          <Check className="h-3 w-3 mr-1" /> Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleExpandida(cat.id)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{cat.nome}</span>
                          <Badge variant="outline" className={`text-xs ${cfg.cor}`}>
                            <span className="flex items-center gap-1">{cfg.icone} {cfg.label}</span>
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {subcats.length} subcategoria{subcats.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {cat.descricao && <p className="text-xs text-muted-foreground mt-0.5 truncate">{cat.descricao}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Editar" onClick={() => iniciarEditCat(cat)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-red-600" title="Remover"
                          onClick={() => { if (confirm(`Remover a categoria "${cat.nome}"?`)) deleteMutation.mutate({ id: cat.id }); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {expanded && !editando && (
                  <div className="border-t bg-muted/20">
                    <div className="p-3 space-y-1">
                      {subcats.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-3">Nenhuma subcategoria. Adicione abaixo.</p>
                      ) : (
                        subcats.map((sub: any) => (
                          <div key={sub.id} className="rounded-md border bg-background">
                            {editandoSubcat === sub.id ? (
                              <div className="p-3 space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs">Nome *</Label>
                                    <Input value={editSubcatForm.nome} onChange={(e) => setEditSubcatForm((p) => ({ ...p, nome: e.target.value }))} className="h-7 text-xs mt-1" />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Descrição</Label>
                                    <Input value={editSubcatForm.descricao} onChange={(e) => setEditSubcatForm((p) => ({ ...p, descricao: e.target.value }))} className="h-7 text-xs mt-1" placeholder="Opcional..." />
                                  </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => setEditandoSubcat(null)}>Cancelar</Button>
                                  <Button size="sm" className="h-6 text-xs px-2" disabled={!editSubcatForm.nome.trim() || updateSubcatMutation.isPending}
                                    onClick={() => updateSubcatMutation.mutate({ id: sub.id, ...editSubcatForm })}>
                                    Salvar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 px-3 py-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                                <span className="text-sm flex-1">{sub.nome}</span>
                                {sub.descricao && <span className="text-xs text-muted-foreground hidden sm:block">{sub.descricao}</span>}
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => iniciarEditSubcat(sub)}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-red-600"
                                    onClick={() => { if (confirm(`Remover subcategoria "${sub.nome}"?`)) deleteSubcatMutation.mutate({ id: sub.id }); }}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                      <Button size="sm" variant="outline" className="w-full mt-2 h-8 text-xs border-dashed"
                        onClick={() => { setSubcatParentId(cat.id); setShowNovaSubcat(true); }}>
                        <Plus className="h-3 w-3 mr-1" /> Adicionar Subcategoria
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Nova Categoria */}
      <Dialog open={showNova} onOpenChange={setShowNova}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" /> Nova Categoria Orçamentária
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome <span className="text-red-500">*</span></Label>
              <Input placeholder="Ex: Pessoal, Marketing, Infraestrutura..." value={form.nome}
                onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Tipo <span className="text-red-500">*</span></Label>
              <Select value={form.tipo} onValueChange={(v) => setForm((p) => ({ ...p, tipo: v as TipoCategoria }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="custo"><span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-red-500" /> Custo</span></SelectItem>
                  <SelectItem value="despesa"><span className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-orange-500" /> Despesa</span></SelectItem>
                  <SelectItem value="receita"><span className="flex items-center gap-2"><TrendingDown className="h-4 w-4 text-green-500 rotate-180" /> Receita</span></SelectItem>
                  <SelectItem value="investimento"><span className="flex items-center gap-2"><BarChart2 className="h-4 w-4 text-blue-500" /> Investimento</span></SelectItem>
                  <SelectItem value="outro"><span className="flex items-center gap-2"><MoreHorizontal className="h-4 w-4 text-gray-500" /> Outro</span></SelectItem>
                </SelectContent>
              </Select>
              {TIPO_DICA[form.tipo] && (
                <p className="text-xs text-muted-foreground mt-1">{TIPO_DICA[form.tipo]}</p>
              )}
            </div>
            <div>
              <Label>Descrição <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input placeholder="Breve descrição da categoria..." value={form.descricao}
                onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Observação <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Textarea placeholder="Notas adicionais, critérios de uso..." value={form.observacao}
                onChange={(e) => setForm((p) => ({ ...p, observacao: e.target.value }))} className="mt-1 resize-none" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNova(false)}>Cancelar</Button>
            <Button disabled={!form.nome.trim() || createMutation.isPending} onClick={() => createMutation.mutate(form)}>
              {createMutation.isPending ? "Criando..." : "Criar Categoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Nova Subcategoria */}
      <Dialog open={showNovaSubcat} onOpenChange={setShowNovaSubcat}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Nova Subcategoria
            </DialogTitle>
            {subcatParentId && (
              <p className="text-sm text-muted-foreground">
                Categoria: <strong>{(categorias ?? []).find((c: any) => c.id === subcatParentId)?.nome}</strong>
              </p>
            )}
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome <span className="text-red-500">*</span></Label>
              <Input placeholder="Ex: Salários, Encargos, Aluguel..." value={formSubcat.nome}
                onChange={(e) => setFormSubcat((p) => ({ ...p, nome: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Descrição <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input placeholder="Breve descrição..." value={formSubcat.descricao}
                onChange={(e) => setFormSubcat((p) => ({ ...p, descricao: e.target.value }))} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovaSubcat(false)}>Cancelar</Button>
            <Button disabled={!formSubcat.nome.trim() || createSubcatMutation.isPending}
              onClick={() => { if (subcatParentId) createSubcatMutation.mutate({ categoriaId: subcatParentId, ...formSubcat }); }}>
              {createSubcatMutation.isPending ? "Criando..." : "Criar Subcategoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
