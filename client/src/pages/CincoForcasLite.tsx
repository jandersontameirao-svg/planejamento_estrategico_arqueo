import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface Forca {
  id: string;
  tipo: "Rivalidade" | "Fornecedores" | "Clientes" | "Novos Entrantes" | "Substitutos";
  intensidade: number; // 1-5
  descricao: string;
}

const cores = {
  Rivalidade: "bg-red-100 border-red-300",
  Fornecedores: "bg-orange-100 border-orange-300",
  Clientes: "bg-blue-100 border-blue-300",
  "Novos Entrantes": "bg-purple-100 border-purple-300",
  Substitutos: "bg-green-100 border-green-300",
};

const coresIcone = {
  Rivalidade: "bg-red-500",
  Fornecedores: "bg-orange-500",
  Clientes: "bg-blue-500",
  "Novos Entrantes": "bg-purple-500",
  Substitutos: "bg-green-500",
};

export default function CincoForcasLite() {
  const [forcas, setForcas] = useState<Forca[]>([
    { id: "1", tipo: "Rivalidade", intensidade: 4, descricao: "Competição intensa no mercado" },
    { id: "2", tipo: "Fornecedores", intensidade: 3, descricao: "Poder moderado dos fornecedores" },
  ]);

  const [novaForca, setNovaForca] = useState<Partial<Forca>>({
    tipo: "Rivalidade",
    intensidade: 3,
    descricao: "",
  });

  const adicionarForca = () => {
    if (!novaForca.descricao) return;
    setForcas([
      ...forcas,
      {
        id: Date.now().toString(),
        tipo: novaForca.tipo as any,
        intensidade: novaForca.intensidade || 3,
        descricao: novaForca.descricao,
      },
    ]);
    setNovaForca({ tipo: "Rivalidade", intensidade: 3, descricao: "" });
  };

  const removerForca = (id: string) => {
    setForcas(forcas.filter((f) => f.id !== id));
  };

  const atualizarForca = (id: string, campo: keyof Forca, valor: any) => {
    setForcas(forcas.map((f) => (f.id === id ? { ...f, [campo]: valor } : f)));
  };

  const classificarIntensidade = (intensidade: number) => {
    if (intensidade >= 4.5) return { label: "Muito Forte", cor: "bg-red-500" };
    if (intensidade >= 3.5) return { label: "Forte", cor: "bg-orange-500" };
    if (intensidade >= 2.5) return { label: "Moderada", cor: "bg-yellow-500" };
    return { label: "Fraca", cor: "bg-green-500" };
  };

  const dadosGrafico = forcas.map((f) => ({
    nome: f.tipo,
    Intensidade: f.intensidade,
  }));

  const handleSave = () => {
    console.log("5 Forças salva:", forcas);
    alert("Análise de 5 Forças salva com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">5</div>
            Análise das 5 Forças de Porter
          </CardTitle>
          <CardDescription>Rivalidade, Fornecedores, Clientes, Novos Entrantes, Substitutos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div><strong>Total de Forças:</strong> {forcas.length}</div>
            <div><strong>Intensidade Média:</strong> {(forcas.reduce((a, f) => a + f.intensidade, 0) / forcas.length).toFixed(1)}/5</div>
            <div><strong>Atratividade:</strong> {(5 - forcas.reduce((a, f) => a + f.intensidade, 0) / forcas.length).toFixed(1)}/5</div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Intensidade das Forças</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="Intensidade" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Análise Competitiva</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={dadosGrafico}>
                <PolarGrid />
                <PolarAngleAxis dataKey="nome" />
                <PolarRadiusAxis angle={90} domain={[0, 5]} />
                <Radar name="Intensidade" dataKey="Intensidade" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Forças */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Forças Identificadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {forcas.map((forca) => {
            const intensidade = classificarIntensidade(forca.intensidade);
            return (
              <div key={forca.id} className={`border-l-4 p-4 rounded-lg ${(cores as any)[forca.tipo]}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${(coresIcone as any)[forca.tipo]}`}></div>
                    <div>
                      <h4 className="font-semibold text-sm">{forca.tipo}</h4>
                      <p className="text-xs text-gray-600">{forca.descricao}</p>
                    </div>
                  </div>
                  <Badge className={`${intensidade.cor} text-white`}>{intensidade.label}</Badge>
                </div>

                <div>
                  <label className="text-xs font-semibold">Intensidade: {forca.intensidade}/5</label>
                  <Slider
                    value={[forca.intensidade]}
                    onValueChange={(val) => atualizarForca(forca.id, "intensidade", val[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="mt-1"
                  />
                </div>

                <button
                  onClick={() => removerForca(forca.id)}
                  className="mt-3 text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Remover
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Nova Força */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Adicionar Nova Força
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Tipo de Força</label>
            <select
              value={novaForca.tipo}
              onChange={(e) => setNovaForca({ ...novaForca, tipo: e.target.value as any })}
              className="w-full border rounded px-3 py-2 text-sm mt-1"
            >
              {["Rivalidade", "Fornecedores", "Clientes", "Novos Entrantes", "Substitutos"].map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">Descrição</label>
            <textarea
              value={novaForca.descricao}
              onChange={(e) => setNovaForca({ ...novaForca, descricao: e.target.value })}
              placeholder="Descreva a força..."
              className="w-full border rounded px-3 py-2 text-sm mt-1"
              rows={2}
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Intensidade: {novaForca.intensidade}/5</label>
            <Slider
              value={[novaForca.intensidade || 3]}
              onValueChange={(val) => setNovaForca({ ...novaForca, intensidade: val[0] })}
              min={1}
              max={5}
              step={1}
              className="mt-1"
            />
          </div>
          <Button onClick={adicionarForca} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Adicionar Força
          </Button>
        </CardContent>
      </Card>

      {/* Salvar */}
      <Button onClick={handleSave} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
        <Save className="h-4 w-4" />
        Salvar Análise de 5 Forças
      </Button>
    </div>
  );
}
