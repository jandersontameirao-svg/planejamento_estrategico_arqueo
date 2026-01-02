import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ForcasData {
  ameacaNovosConcorrentes: string;
  poderFornecedores: string;
  poderClientes: string;
  ameacaProdutosSubstitutos: string;
  rivalidadeExistente: string;
}

interface CincoForcasCompletaProps {
  empresaId?: number;
}

export default function CincoForcasCompleta({ empresaId = 1 }: CincoForcasCompletaProps) {
  const [data, setData] = useState<ForcasData>({
    ameacaNovosConcorrentes: "",
    poderFornecedores: "",
    poderClientes: "",
    ameacaProdutosSubstitutos: "",
    rivalidadeExistente: "",
  });

  const [scores, setScores] = useState({
    ameacaNovosConcorrentes: 3,
    poderFornecedores: 3,
    poderClientes: 3,
    ameacaProdutosSubstitutos: 3,
    rivalidadeExistente: 3,
  });

  const chartData = [
    { name: "Novos Concorrentes", value: scores.ameacaNovosConcorrentes },
    { name: "Poder Fornecedores", value: scores.poderFornecedores },
    { name: "Poder Clientes", value: scores.poderClientes },
    { name: "Produtos Substitutos", value: scores.ameacaProdutosSubstitutos },
    { name: "Rivalidade Existente", value: scores.rivalidadeExistente },
  ];

  const handleSave = () => {
    console.log("Análise 5 Forças salva:", { data, scores });
    alert("Análise 5 Forças de Porter salva com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>5 Forças de Porter</CardTitle>
          <CardDescription>
            Análise da intensidade competitiva e atratividade da indústria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulários */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-2 block">Ameaça de Novos Concorrentes</Label>
                <Textarea
                  placeholder="Barreiras de entrada, capital necessário, acesso a canais de distribuição..."
                  rows={3}
                  value={data.ameacaNovosConcorrentes}
                  onChange={(e) => setData({ ...data, ameacaNovosConcorrentes: e.target.value })}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={scores.ameacaNovosConcorrentes}
                    onChange={(e) => setScores({ ...scores, ameacaNovosConcorrentes: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold">{scores.ameacaNovosConcorrentes}/5</span>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-2 block">Poder dos Fornecedores</Label>
                <Textarea
                  placeholder="Concentração de fornecedores, diferenciação de insumos, custos de mudança..."
                  rows={3}
                  value={data.poderFornecedores}
                  onChange={(e) => setData({ ...data, poderFornecedores: e.target.value })}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={scores.poderFornecedores}
                    onChange={(e) => setScores({ ...scores, poderFornecedores: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold">{scores.poderFornecedores}/5</span>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-2 block">Poder dos Clientes</Label>
                <Textarea
                  placeholder="Concentração de clientes, sensibilidade ao preço, disponibilidade de alternativas..."
                  rows={3}
                  value={data.poderClientes}
                  onChange={(e) => setData({ ...data, poderClientes: e.target.value })}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={scores.poderClientes}
                    onChange={(e) => setScores({ ...scores, poderClientes: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold">{scores.poderClientes}/5</span>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-2 block">Ameaça de Produtos Substitutos</Label>
                <Textarea
                  placeholder="Disponibilidade de substitutos, preço relativo, disposição de trocar..."
                  rows={3}
                  value={data.ameacaProdutosSubstitutos}
                  onChange={(e) => setData({ ...data, ameacaProdutosSubstitutos: e.target.value })}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={scores.ameacaProdutosSubstitutos}
                    onChange={(e) => setScores({ ...scores, ameacaProdutosSubstitutos: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold">{scores.ameacaProdutosSubstitutos}/5</span>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-2 block">Rivalidade entre Concorrentes Existentes</Label>
                <Textarea
                  placeholder="Número de concorrentes, diferenciação, custos fixos, capacidade ociosa..."
                  rows={3}
                  value={data.rivalidadeExistente}
                  onChange={(e) => setData({ ...data, rivalidadeExistente: e.target.value })}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={scores.rivalidadeExistente}
                    onChange={(e) => setScores({ ...scores, rivalidadeExistente: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold">{scores.rivalidadeExistente}/5</span>
                </div>
              </div>
            </div>

            {/* Gráfico */}
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              <Save className="mr-2 h-4 w-4" />
              Salvar Análise 5 Forças
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
