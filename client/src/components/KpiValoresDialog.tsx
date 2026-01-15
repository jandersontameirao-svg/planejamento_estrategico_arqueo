import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface KpiValoresDialogProps {
  kpiId: number;
  kpiNome: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const meses = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export default function KpiValoresDialog({
  kpiId,
  kpiNome,
  open,
  onOpenChange,
}: KpiValoresDialogProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [ano, setAno] = useState(currentYear);
  const [mes, setMes] = useState(currentMonth);
  const [meta, setMeta] = useState("");
  const [realizado, setRealizado] = useState("");

  const { data: valores, refetch: refetchValores } = trpc.kpiValores.listByKpi.useQuery(
    { kpiId },
    { enabled: open }
  );

  const { data: valorAtual, refetch: refetchValorAtual } = trpc.kpiValores.getByPeriodo.useQuery(
    { kpiId, ano, mes },
    { enabled: open }
  );

  const upsertValor = trpc.kpiValores.upsert.useMutation({
    onSuccess: () => {
      toast.success("Valor registrado com sucesso!");
      refetchValores();
      refetchValorAtual();
      setMeta("");
      setRealizado("");
    },
    onError: (error) => {
      toast.error(`Erro ao registrar valor: ${error.message}`);
    },
  });

  useEffect(() => {
    if (valorAtual && 'meta' in valorAtual) {
      setMeta(valorAtual.meta ? parseFloat(String(valorAtual.meta)).toString() : "");
      setRealizado('realizado' in valorAtual && valorAtual.realizado ? parseFloat(String(valorAtual.realizado)).toString() : "");
    } else {
      setMeta("");
      setRealizado("");
    }
  }, [valorAtual]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    upsertValor.mutate({
      kpiId,
      ano,
      mes,
      meta: meta ? parseFloat(meta) : undefined,
      realizado: realizado ? parseFloat(realizado) : undefined,
    });
  };

  const getStatusRagColor = (status: string | null) => {
    if (!status) return "bg-gray-200";
    if (status === "verde") return "bg-green-500";
    if (status === "amarelo") return "bg-yellow-500";
    if (status === "vermelho") return "bg-red-500";
    return "bg-gray-200";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lançamento de Valores - {kpiNome}</DialogTitle>
          <DialogDescription>
            Registre as metas e valores realizados mensalmente para acompanhar o desempenho do KPI.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulário de Lançamento */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ano">Ano</Label>
                  <Select
                    value={ano.toString()}
                    onValueChange={(value) => setAno(parseInt(value))}
                  >
                    <SelectTrigger id="ano">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mes">Mês</Label>
                  <Select
                    value={mes.toString()}
                    onValueChange={(value) => setMes(parseInt(value))}
                  >
                    <SelectTrigger id="mes">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {meses.map((m) => (
                        <SelectItem key={m.value} value={m.value.toString()}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta">Meta</Label>
                <Input
                  id="meta"
                  type="number"
                  step="0.01"
                  placeholder="Digite a meta"
                  value={meta}
                  onChange={(e) => setMeta(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="realizado">Realizado</Label>
                <Input
                  id="realizado"
                  type="number"
                  step="0.01"
                  placeholder="Digite o valor realizado"
                  value={realizado}
                  onChange={(e) => setRealizado(e.target.value)}
                />
              </div>

              {valorAtual && 'percentualAtingimento' in valorAtual && valorAtual.percentualAtingimento && (
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Percentual de Atingimento</p>
                        <p className="text-2xl font-bold">
                          {parseFloat(String(valorAtual.percentualAtingimento)).toFixed(1)}%
                        </p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full ${getStatusRagColor('statusRag' in valorAtual ? valorAtual.statusRag : null)}`}
                        title={`Status: ${'statusRag' in valorAtual ? valorAtual.statusRag : 'N/A'}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={upsertValor.isPending}>
                  {upsertValor.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </div>

          {/* Gráfico de Evolução */}
          <div>
            <h3 className="font-semibold mb-4">Evolução Temporal</h3>
            {valores && valores.length > 0 ? (
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={valores.slice().reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={(v) => `${meses.find((m) => m.value === v.mes)?.label.substring(0, 3)}/${v.ano}`}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => value.toFixed(2)}
                      labelFormatter={(label) => `Período: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey={(v) => v.meta ? parseFloat(v.meta) : 0} 
                      name="Meta"
                      stroke="#f97316" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={(v) => v.realizado ? parseFloat(v.realizado) : 0}
                      name="Realizado"
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : null}
            
            <h3 className="font-semibold mb-4 mt-6">Histórico de Valores</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {valores && valores.length > 0 ? (
                valores.map((valor) => (
                  <Card key={valor.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {meses.find((m) => m.value === valor.mes)?.label}/{valor.ano}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Meta: {valor.meta ? parseFloat(valor.meta).toFixed(2) : "-"} | Realizado:{" "}
                          {valor.realizado ? parseFloat(valor.realizado).toFixed(2) : "-"}
                        </p>
                        {valor.percentualAtingimento && (
                          <p className="text-sm font-medium">
                            {parseFloat(valor.percentualAtingimento).toFixed(1)}% de atingimento
                          </p>
                        )}
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusRagColor(valor.statusRag)}`}
                        title={`Status: ${valor.statusRag}`}
                      />
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum valor registrado ainda
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
