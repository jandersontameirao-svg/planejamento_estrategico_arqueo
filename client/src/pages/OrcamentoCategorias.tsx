import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

const TIPO_CORES: Record<string, string> = {
  receita: "bg-green-100 text-green-700",
  custo: "bg-red-100 text-red-700",
  despesa: "bg-orange-100 text-orange-700",
  investimento: "bg-blue-100 text-blue-700",
  outro: "bg-gray-100 text-gray-700",
};

export default function OrcamentoCategorias() {
  const [showNova, setShowNova] = useState(false);
  const [showNovaSubcat, setShowNovaSubcat] = useState(false);
  const [catExpandida, setCatExpandida] = useState<number | null>(null);
  const [subcatParentId, setSubcatParentId] = useState<number | null>(null);
  const [form, setForm] = useState({ nome: "", tipo: "despesa" as any, descricao: "" });
  const [formSubcat, setFormSubcat] = useState({ nome: "", descricao: "" });

  const { data: categorias, refetch } = trpc.orcamento.getCategorias.useQuery();
  const { data: subcategorias, refetch: refetchSub } = trpc.orcamento.getSubcategorias.useQuery({ categoriaId: undefined });

  const createMutation = trpc.orcamento.createCategoria.useMutation({
    onSuccess: () => { toast.success("Categoria criada!"); refetch(); setShowNova(false); setForm({ nome: "", tipo: "despesa", descricao: "" }); },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const deleteMutation = trpc.orcamento.deleteCategoria.useMutation({
    onSuccess: () => { toast.success("Categoria removida!"); refetch(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const createSubcatMutation = trpc.orcamento.createSubcategoria.useMutation({
    onSuccess: () => {
      toast.success("Subcategoria criada!");
      refetchSub();
      setShowNovaSubcat(false);
      setFormSubcat({ nome: "", descricao: "" });
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const deleteSubcatMutation = trpc.orcamento.deleteSubcategoria.useMutation({
    onSuccess: () => { toast.success("Subcategoria removida!"); refetchSub(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const getSubcatsDaCategoria = (catId: number) =>
    (subcategorias ?? []).filter((s: any) => s.categoriaId === catId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Categorias Orçamentárias</CardTitle>
            <CardDescription>Gerencie as categorias e subcategorias para classificação dos lançamentos</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowNova(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova Categoria
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {(!categorias || categorias.length === 0) ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhuma categoria cadastrada.</p>
            <Button className="mt-4" onClick={() => setShowNova(true)}>
              <Plus className="h-4 w-4 mr-2" /> Criar Primeira Categoria
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {(categorias as any[]).map((cat) => {
              const subcats = getSubcatsDaCategoria(cat.id);
              const expanded = catExpandida === cat.id;
              return (
                <div key={cat.id} className="border rounded-lg overflow-hidden">
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setCatExpandida(expanded ? null : cat.id)}
                  >
                    {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <div className="flex-1">
                      <span className="font-medium">{cat.nome}</span>
                      {cat.descricao && <span className="text-muted-foreground text-sm ml-2">— {cat.descricao}</span>}
                    </div>
                    <Badge className={TIPO_CORES[cat.tipo] ?? "bg-gray-100 text-gray-700"}>
                      {cat.tipo}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{subcats.length} subcats</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-red-500 hover:text-red-700"
                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({ id: cat.id }); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {expanded && (
                    <div className="border-t bg-muted/10 p-3 space-y-2">
                      {subcats.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">Nenhuma subcategoria</p>
                      ) : (
                        subcats.map((s: any) => (
                          <div key={s.id} className="flex items-center gap-2 pl-4 py-1 rounded hover:bg-muted/20">
                            <span className="text-sm flex-1">{s.nome}</span>
                            {s.descricao && <span className="text-xs text-muted-foreground">{s.descricao}</span>}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-red-400"
                              onClick={() => deleteSubcatMutation.mutate({ id: s.id })}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-1"
                        onClick={() => { setSubcatParentId(cat.id); setShowNovaSubcat(true); }}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Adicionar Subcategoria
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Modal Nova Categoria */}
      <Dialog open={showNova} onOpenChange={setShowNova}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria Orçamentária</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome *</Label>
              <Input placeholder="Ex: Pessoal, Marketing, Infraestrutura..." value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} />
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm((p) => ({ ...p, tipo: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="custo">Custo</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="investimento">Investimento</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Input placeholder="Descrição breve..." value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNova(false)}>Cancelar</Button>
            <Button disabled={!form.nome.trim() || createMutation.isPending} onClick={() => createMutation.mutate(form)}>
              {createMutation.isPending ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Nova Subcategoria */}
      <Dialog open={showNovaSubcat} onOpenChange={setShowNovaSubcat}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Subcategoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome *</Label>
              <Input placeholder="Ex: Salários, Encargos..." value={formSubcat.nome} onChange={(e) => setFormSubcat((p) => ({ ...p, nome: e.target.value }))} />
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Input placeholder="Descrição breve..." value={formSubcat.descricao} onChange={(e) => setFormSubcat((p) => ({ ...p, descricao: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovaSubcat(false)}>Cancelar</Button>
            <Button
              disabled={!formSubcat.nome.trim() || createSubcatMutation.isPending}
              onClick={() => subcatParentId && createSubcatMutation.mutate({ categoriaId: subcatParentId, ...formSubcat })}
            >
              {createSubcatMutation.isPending ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
