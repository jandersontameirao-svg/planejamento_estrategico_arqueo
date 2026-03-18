import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle, AlertTriangle, Download } from "lucide-react";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

interface Props {
  empresaId: number;
  ano: number;
}

interface LinhaPreview {
  descricao: string;
  valor: number;
  competencia: string;
  moeda: string;
}

export default function OrcamentoImportacao({ empresaId, ano }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<LinhaPreview[]>([]);
  const [arquivoNome, setArquivoNome] = useState("");
  const [mesReferencia, setMesReferencia] = useState<string>("");
  const [moedaLote, setMoedaLote] = useState("BRL");
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");

  const { data: importacoes, refetch } = trpc.orcamento.getImportacoesByEmpresa.useQuery({ empresaId });
  const { data: categorias } = trpc.orcamento.getCategorias.useQuery();

  const importarMutation = trpc.orcamento.importarExecutado.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.totalImportado} lançamentos importados com sucesso!`);
      setStep("done");
      setPreview([]);
      refetch();
    },
    onError: (e) => toast.error("Erro na importação: " + e.message),
  });

  const parseCSV = (text: string): LinhaPreview[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    const headers = lines[0].split(";").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
    return lines.slice(1).filter((l) => l.trim()).map((line) => {
      const cols = line.split(";").map((c) => c.trim().replace(/"/g, ""));
      const obj: any = {};
      headers.forEach((h, i) => { obj[h] = cols[i] ?? ""; });
      return {
        descricao: obj["descricao"] || obj["historico"] || obj["description"] || "Lançamento",
        valor: parseFloat((obj["valor"] || obj["value"] || obj["amount"] || "0").replace(",", ".")),
        competencia: obj["competencia"] || obj["data"] || obj["date"] || "",
        moeda: obj["moeda"] || obj["currency"] || moedaLote,
      };
    }).filter((l) => l.valor > 0);
  };

  const handleFile = (file: File) => {
    if (!file) return;
    setArquivoNome(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const linhas = parseCSV(text);
      if (linhas.length === 0) {
        toast.error("Nenhuma linha válida encontrada no arquivo. Verifique o formato CSV.");
        return;
      }
      setPreview(linhas);
      setStep("preview");
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirmar = () => {
    importarMutation.mutate({
      empresaId,
      ano,
      mesReferencia: mesReferencia ? Number(mesReferencia) : undefined,
      arquivoNome,
      moedaLote,
      linhas: preview.map((l) => ({
        descricao: l.descricao,
        valorOriginal: l.valor,
        moedaOriginal: l.moeda || moedaLote,
        competencia: l.competencia || undefined,
      })),
    });
  };

  const downloadModelo = () => {
    const csv = `descricao;valor;competencia;moeda\nFornecedor ABC;15000,00;2025-01;BRL\nAluguel Escritório;8500,00;2025-01;BRL\nFolha Pessoal;42000,00;2025-01;BRL`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo_importacao_orcamento.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Upload */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Importar Executado do ERP</CardTitle>
                <CardDescription>
                  Importe um arquivo CSV com os lançamentos executados. Colunas esperadas: descricao, valor, competencia, moeda.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={downloadModelo}>
                <Download className="h-4 w-4 mr-1" /> Baixar Modelo CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mês de Referência (opcional)</Label>
                <Select value={mesReferencia} onValueChange={setMesReferencia}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os meses</SelectItem>
                    {MESES.map((m, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Moeda do Lote</Label>
                <Select value={moedaLote} onValueChange={setMoedaLote}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL — Real</SelectItem>
                    <SelectItem value="USD">USD — Dólar</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dropzone */}
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${dragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">Arraste o arquivo CSV aqui</p>
              <p className="text-sm text-muted-foreground mt-1">ou clique para selecionar</p>
              <p className="text-xs text-muted-foreground mt-2">Formatos suportados: .csv (separado por ponto e vírgula)</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {step === "preview" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Prévia da Importação — {preview.length} lançamentos
            </CardTitle>
            <CardDescription>
              Arquivo: <strong>{arquivoNome}</strong>. Revise os dados antes de confirmar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-80 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="text-left py-2 px-3">Descrição</th>
                    <th className="text-left py-2 px-3">Competência</th>
                    <th className="text-right py-2 px-3">Valor</th>
                    <th className="text-left py-2 px-3">Moeda</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 50).map((l, i) => (
                    <tr key={i} className="border-t hover:bg-muted/20">
                      <td className="py-2 px-3">{l.descricao}</td>
                      <td className="py-2 px-3 text-muted-foreground">{l.competencia || "—"}</td>
                      <td className="py-2 px-3 text-right font-medium">
                        {l.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3">{l.moeda}</td>
                    </tr>
                  ))}
                  {preview.length > 50 && (
                    <tr>
                      <td colSpan={4} className="text-center py-2 text-muted-foreground text-xs">
                        ... e mais {preview.length - 50} lançamentos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => { setStep("upload"); setPreview([]); }}>
                Voltar
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                disabled={importarMutation.isPending}
                onClick={handleConfirmar}
              >
                {importarMutation.isPending ? "Importando..." : `Confirmar Importação (${preview.length} lançamentos)`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sucesso */}
      {step === "done" && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Importação Concluída!</h3>
            <p className="text-muted-foreground mb-4">Os lançamentos foram importados e estão disponíveis na aba "Executado".</p>
            <Button onClick={() => setStep("upload")}>
              <Upload className="h-4 w-4 mr-2" /> Nova Importação
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Histórico de importações */}
      {importacoes && importacoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Histórico de Importações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(importacoes as any[]).map((imp) => (
                <div key={imp.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{imp.arquivoNome ?? "Importação manual"}</p>
                    <p className="text-xs text-muted-foreground">
                      {imp.totalLinhas} lançamentos — {new Date(imp.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Badge className={imp.status === "concluido" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                    {imp.status === "concluido" ? "Concluído" : imp.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
