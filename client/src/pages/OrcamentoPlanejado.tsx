import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Save, Lock } from "lucide-react";

const MESES = ["janeiro","fevereiro","marco","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const MESES_LABEL = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(value);
}

interface Props {
  versaoId: number;
  versaoStatus: string;
  ano: number;
}

export default function OrcamentoPlanejado({ versaoId, versaoStatus, ano }: Props) {
  const isReadOnly = versaoStatus === "congelado";
  const [showAddLinha, setShowAddLinha] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [novaLinha, setNovaLinha] = useState({ categoriaId: "", subcategoriaId: "", descricao: "" });

  const { data: linhas, refetch } = trpc.orcamento.getLinhasPlanejadas.useQuery({ versaoId });
  const { data: categorias } = trpc.orcamento.getCategorias.useQuery();
  const { data: subcategorias } = trpc.orcamento.getSubcategorias.useQuery({ categoriaId: undefined });

  const upsertMutation = trpc.orcamento.upsertLinhaPlanejada.useMutation({
    onSuccess: () => { toast.success("Linha salva!"); refetch(); setEditingId(null); setEditValues({}); },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const deleteMutation = trpc.orcamento.deleteLinhaPlanejada.useMutation({
    onSuccess: () => { toast.success("Linha removida!"); refetch(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const handleAddLinha = () => {
    if (!novaLinha.categoriaId) { toast.error("Selecione uma categoria"); return; }
    upsertMutation.mutate({
      versaoId,
      categoriaId: Number(novaLinha.categoriaId),
      subcategoriaId: novaLinha.subcategoriaId ? Number(novaLinha.subcategoriaId) : undefined,
      descricao: novaLinha.descricao || undefined,
    });
    setShowAddLinha(false);
    setNovaLinha({ categoriaId: "", subcategoriaId: "", descricao: "" });
  };

  const handleSaveEdit = (linha: any) => {
    const payload: any = { id: linha.id, versaoId, categoriaId: linha.categoriaId };
    MESES.forEach((m) => {
      payload[m] = editValues[m] !== undefined ? parseFloat(editValues[m] || "0") : parseFloat(linha[m] ?? "0");
    });
    upsertMutation.mutate(payload);
  };

  const startEdit = (linha: any) => {
    setEditingId(linha.id);
    const vals: Record<string, string> = {};
    MESES.forEach((m) => { vals[m] = String(parseFloat(linha[m] ?? "0")); });
    setEditValues(vals);
  };

  const totalLinha = (linha: any) =>
    MESES.reduce((acc, m) => acc + parseFloat(editingId === linha.id ? (editValues[m] ?? linha[m] ?? "0") : (linha[m] ?? "0")), 0);

  const totalMes = (mesIdx: number) =>
    (linhas ?? []).reduce((acc: number, l: any) => acc + parseFloat(l[MESES[mesIdx]] ?? "0"), 0);

  const totalGeral = (linhas ?? []).reduce((acc: number, l: any) =>
    acc + MESES.reduce((a, m) => a + parseFloat(l[m] ?? "0"), 0), 0);

  const subcatFiltradas = novaLinha.categoriaId
    ? (subcategorias ?? []).filter((s: any) => s.categoriaId === Number(novaLinha.categoriaId))
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Orçamento Planejado — {ano}</CardTitle>
            <CardDescription>
              {isReadOnly
                ? "Versão congelada — somente leitura"
                : "Clique em uma linha para editar os valores mensais"}
            </CardDescription>
          </div>
          {!isReadOnly && (
            <Button size="sm" onClick={() => setShowAddLinha(true)}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar Linha
            </Button>
          )}
          {isReadOnly && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" /> Congelado
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {(!linhas || linhas.length === 0) ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhuma linha orçamentária adicionada.</p>
            {!isReadOnly && (
              <Button className="mt-4" onClick={() => setShowAddLinha(true)}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar Primeira Linha
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2 px-2 min-w-[160px]">Categoria / Descrição</th>
                  {MESES_LABEL.map((m) => (
                    <th key={m} className="text-right py-2 px-1 min-w-[80px]">{m}</th>
                  ))}
                  <th className="text-right py-2 px-2 min-w-[90px] font-bold">Total</th>
                  {!isReadOnly && <th className="py-2 px-2 w-16"></th>}
                </tr>
              </thead>
              <tbody>
                {(linhas as any[]).map((linha) => {
                  const cat = (categorias ?? []).find((c: any) => c.id === linha.categoriaId);
                  const isEditing = editingId === linha.id;
                  return (
                    <tr
                      key={linha.id}
                      className={`border-b transition-colors ${isEditing ? "bg-blue-50 dark:bg-blue-950/20" : "hover:bg-muted/20 cursor-pointer"}`}
                      onClick={() => !isReadOnly && !isEditing && startEdit(linha)}
                    >
                      <td className="py-2 px-2">
                        <div className="font-medium text-xs">{cat?.nome ?? `Cat. ${linha.categoriaId}`}</div>
                        {linha.descricao && <div className="text-muted-foreground text-xs">{linha.descricao}</div>}
                      </td>
                      {MESES.map((m) => (
                        <td key={m} className="py-1 px-1 text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              className="h-7 text-xs text-right w-20 px-1"
                              value={editValues[m] ?? "0"}
                              onChange={(e) => setEditValues((prev) => ({ ...prev, [m]: e.target.value }))}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className={parseFloat(linha[m] ?? "0") > 0 ? "text-foreground" : "text-muted-foreground/40"}>
                              {parseFloat(linha[m] ?? "0") > 0 ? formatCurrency(parseFloat(linha[m])) : "—"}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="py-2 px-2 text-right font-bold">
                        {formatCurrency(totalLinha(linha))}
                      </td>
                      {!isReadOnly && (
                        <td className="py-2 px-2">
                          <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                            {isEditing ? (
                              <>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600"
                                  onClick={() => handleSaveEdit(linha)}>
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6"
                                  onClick={() => { setEditingId(null); setEditValues({}); }}>
                                  ✕
                                </Button>
                              </>
                            ) : (
                              <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500"
                                onClick={() => deleteMutation.mutate({ id: linha.id })}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-muted/40 font-bold">
                  <td className="py-2 px-2 text-sm">TOTAL</td>
                  {MESES.map((_, i) => (
                    <td key={i} className="py-2 px-1 text-right text-xs">
                      {totalMes(i) > 0 ? formatCurrency(totalMes(i)) : "—"}
                    </td>
                  ))}
                  <td className="py-2 px-2 text-right text-sm text-blue-600">
                    {formatCurrency(totalGeral)}
                  </td>
                  {!isReadOnly && <td />}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>

      {/* Modal Adicionar Linha */}
      <Dialog open={showAddLinha} onOpenChange={setShowAddLinha}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Linha Orçamentária</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Categoria *</Label>
              <Select value={novaLinha.categoriaId} onValueChange={(v) => setNovaLinha((p) => ({ ...p, categoriaId: v, subcategoriaId: "" }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {(categorias ?? []).map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nome} ({c.tipo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {subcatFiltradas.length > 0 && (
              <div>
                <Label>Subcategoria</Label>
                <Select value={novaLinha.subcategoriaId} onValueChange={(v) => setNovaLinha((p) => ({ ...p, subcategoriaId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcatFiltradas.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Descrição (opcional)</Label>
              <Input
                placeholder="Ex: Folha de pagamento — Setor Técnico"
                value={novaLinha.descricao}
                onChange={(e) => setNovaLinha((p) => ({ ...p, descricao: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLinha(false)}>Cancelar</Button>
            <Button onClick={handleAddLinha} disabled={!novaLinha.categoriaId || upsertMutation.isPending}>
              {upsertMutation.isPending ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
