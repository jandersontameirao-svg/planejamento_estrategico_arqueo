import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Calculator } from "lucide-react";
import { toast } from "sonner";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface FormularioDadosProps {
  empresaId: number;
  tipoAtuacao?: string; // "servicos" | "produtos" | "servicos_produtos"
  onSalvo?: () => void;
  dadosIniciais?: {
    mes: number;
    ano: number;
    faturamento: number;
    cmv: number;
    contasReceber: number;
    estoques: number;
    contasPagar: number;
    observacoes?: string | null;
  };
}

function calcPreview(dados: {
  faturamento: number; cmv: number; contasReceber: number;
  estoques: number; contasPagar: number;
}) {
  const { faturamento, cmv, contasReceber, estoques, contasPagar } = dados;
  const pmr = faturamento > 0 ? (contasReceber / faturamento) * 30 : 0;
  const pme = cmv > 0 ? (estoques / cmv) * 30 : 0;
  const pmpf = cmv > 0 ? (contasPagar / cmv) * 30 : 0;
  const ccc = pmr + pme - pmpf;
  return { pmr, pme, pmpf, ccc };
}

function cccColor(ccc: number) {
  if (ccc <= 15) return "bg-green-100 text-green-800 border-green-200";
  if (ccc <= 30) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-red-100 text-red-800 border-red-200";
}

export default function FormularioDados({
  empresaId, tipoAtuacao = "servicos", onSalvo, dadosIniciais,
}: FormularioDadosProps) {
  const utils = trpc.useUtils();

  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  const [mes, setMes] = useState(dadosIniciais?.mes ?? mesAtual);
  const [ano, setAno] = useState(dadosIniciais?.ano ?? anoAtual);
  const [faturamento, setFaturamento] = useState(dadosIniciais?.faturamento?.toString() ?? "");
  const [cmv, setCmv] = useState(dadosIniciais?.cmv?.toString() ?? "");
  const [contasReceber, setContasReceber] = useState(dadosIniciais?.contasReceber?.toString() ?? "");
  const [estoques, setEstoques] = useState(dadosIniciais?.estoques?.toString() ?? "");
  const [contasPagar, setContasPagar] = useState(dadosIniciais?.contasPagar?.toString() ?? "");
  const [observacoes, setObservacoes] = useState(dadosIniciais?.observacoes ?? "");

  const temEstoque = tipoAtuacao === "produtos" || tipoAtuacao === "servicos_produtos";

  const salvar = trpc.capitalGiro.salvarDadosMensais.useMutation({
    onSuccess: (data) => {
      toast.success("Dados salvos com sucesso", {
        description: `CCC calculado: ${data.indicadores.ccc.toFixed(1)} dias`,
      });
      utils.capitalGiro.getPorEmpresa.invalidate({ empresaId });
      utils.capitalGiro.getGeral.invalidate();
      onSalvo?.();
    },
    onError: (err) => {
      toast.error("Erro ao salvar", { description: err.message });
    },
  });

  const preview = calcPreview({
    faturamento: parseFloat(faturamento) || 0,
    cmv: parseFloat(cmv) || 0,
    contasReceber: parseFloat(contasReceber) || 0,
    estoques: parseFloat(estoques) || 0,
    contasPagar: parseFloat(contasPagar) || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    salvar.mutate({
      empresaId,
      mes,
      ano,
      faturamento: parseFloat(faturamento) || 0,
      cmv: parseFloat(cmv) || 0,
      contasReceber: parseFloat(contasReceber) || 0,
      estoques: parseFloat(estoques) || 0,
      contasPagar: parseFloat(contasPagar) || 0,
      observacoes: observacoes || undefined,
    });
  };

  const anos = Array.from({ length: 5 }, (_, i) => anoAtual - 2 + i);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Período */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Mês de Referência</Label>
          <Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MESES.map((m, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Ano</Label>
          <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {anos.map((a) => (
                <SelectItem key={a} value={String(a)}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dados brutos */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Dados do Período
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="faturamento">Faturamento do Mês (R$)</Label>
            <Input
              id="faturamento"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={faturamento}
              onChange={(e) => setFaturamento(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cmv">
              {tipoAtuacao === "servicos" ? "Custo do Serviço Vendido (CSV)" : "Custo da Mercadoria Vendida (CMV)"} (R$)
            </Label>
            <Input
              id="cmv"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={cmv}
              onChange={(e) => setCmv(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contasReceber">Saldo de Contas a Receber (R$)</Label>
            <Input
              id="contasReceber"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={contasReceber}
              onChange={(e) => setContasReceber(e.target.value)}
              required
            />
          </div>
          {temEstoque && (
            <div className="space-y-2">
              <Label htmlFor="estoques">Saldo de Estoques (R$)</Label>
              <Input
                id="estoques"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={estoques}
                onChange={(e) => setEstoques(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="contasPagar">Saldo de Contas a Pagar — Fornecedores (R$)</Label>
            <Input
              id="contasPagar"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={contasPagar}
              onChange={(e) => setContasPagar(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Preview de indicadores em tempo real */}
      {(parseFloat(faturamento) > 0 || parseFloat(cmv) > 0) && (
        <Card className="bg-muted/40 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Prévia dos Indicadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">PMR</div>
                <div className="font-semibold">{preview.pmr.toFixed(1)} dias</div>
              </div>
              {temEstoque && (
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">PME</div>
                  <div className="font-semibold">{preview.pme.toFixed(1)} dias</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">PMPF</div>
                <div className="font-semibold">{preview.pmpf.toFixed(1)} dias</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">CCC</div>
                <Badge className={`text-sm font-bold ${cccColor(preview.ccc)}`}>
                  {preview.ccc.toFixed(1)} dias
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="obs">Observações (opcional)</Label>
        <Textarea
          id="obs"
          placeholder="Contexto do período, eventos relevantes..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={2}
        />
      </div>

      <Button type="submit" disabled={salvar.isPending} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        {salvar.isPending ? "Salvando..." : `Salvar ${MESES[mes - 1]} / ${ano}`}
      </Button>
    </form>
  );
}
