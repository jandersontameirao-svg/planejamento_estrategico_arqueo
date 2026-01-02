import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface FatorPestel {
  id: string;
  categoria: "Político" | "Econômico" | "Social" | "Tecnológico" | "Ecológico" | "Legal";
  impacto: number; // 1-5
  probabilidade: number; // 1-5
  descricao: string;
}

const cores = {
  Político: "bg-red-100 border-red-300",
  Econômico: "bg-blue-100 border-blue-300",
  Social: "bg-green-100 border-green-300",
  Tecnológico: "bg-purple-100 border-purple-300",
  Ecológico: "bg-emerald-100 border-emerald-300",
  Legal: "bg-yellow-100 border-yellow-300",
};

const coresIcone = {
  Político: "bg-red-500",
  Econômico: "bg-blue-500",
  Social: "bg-green-500",
  Tecnológico: "bg-purple-500",
  Ecológico: "bg-emerald-500",
  Legal: "bg-yellow-500",
};

export default function AnalisePestelLite() {
  const [fatores, setFatores] = useState<FatorPestel[]>([]);

  const [novoFator, setNovoFator] = useState<Partial<FatorPestel>>({
    categoria: "Político",
    impacto: 3,
    probabilidade: 3,
    descricao: "",
  });

  const adicionarFator = () => {
    if (!novoFator.descricao) return;
    setFatores([
      ...fatores,
      {
        id: Date.now().toString(),
        categoria: novoFator.categoria as any,
        impacto: novoFator.impacto || 3,
        probabilidade: novoFator.probabilidade || 3,
        descricao: novoFator.descricao,
      },
    ]);
    setNovoFator({ categoria: "Político", impacto: 3, probabilidade: 3, descricao: "" });
  };

  const removerFator = (id: string) => {
    setFatores(fatores.filter((f) => f.id !== id));
  };

  const atualizarFator = (id: string, campo: keyof FatorPestel, valor: any) => {
    setFatores(fatores.map((f) => (f.id === id ? { ...f, [campo]: valor } : f)));
  };

  const calcularRisco = (impacto: number, probabilidade: number) => {
    const risco = impacto * probabilidade;
    if (risco >= 16) return { label: "Crítico", cor: "bg-red-500" };
    if (risco >= 12) return { label: "Alto", cor: "bg-orange-500" };
    if (risco >= 8) return { label: "Médio", cor: "bg-yellow-500" };
    return { label: "Baixo", cor: "bg-green-500" };
  };

  const dadosGrafico = fatores.map((f) => ({
    nome: f.categoria,
    Impacto: f.impacto,
    Probabilidade: f.probabilidade,
    Risco: f.impacto * f.probabilidade,
  }));

  const handleSave = () => {
    console.log("PESTEL salva:", fatores);
    alert("Análise PESTEL salva com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">P</div>
            Análise PESTEL
          </CardTitle>
          <CardDescription>Fatores Políticos, Econômicos, Sociais, Tecnológicos, Ecológicos e Legais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div><strong>Total de Fatores:</strong> {fatores.length}</div>
            <div><strong>Risco Médio:</strong> {(fatores.reduce((a, f) => a + f.impacto * f.probabilidade, 0) / fatores.length).toFixed(1)}</div>
            <div><strong>Impacto Médio:</strong> {(fatores.reduce((a, f) => a + f.impacto, 0) / fatores.length).toFixed(1)}/5</div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Impacto vs Probabilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Impacto" fill="#f97316" />
                <Bar dataKey="Probabilidade" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Análise de Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={dadosGrafico}>
                <PolarGrid />
                <PolarAngleAxis dataKey="nome" />
                <PolarRadiusAxis angle={90} domain={[0, 25]} />
                <Radar name="Risco" dataKey="Risco" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Fatores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fatores Identificados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fatores.map((fator) => {
            const risco = calcularRisco(fator.impacto, fator.probabilidade);
            return (
              <div key={fator.id} className={`border-l-4 p-4 rounded-lg ${(cores as any)[fator.categoria]}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${(coresIcone as any)[fator.categoria]}`}></div>
                    <div>
                      <h4 className="font-semibold text-sm">{fator.categoria}</h4>
                      <p className="text-xs text-gray-600">{fator.descricao}</p>
                    </div>
                  </div>
                  <Badge className={`${risco.cor} text-white`}>{risco.label}</Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold">Impacto: {fator.impacto}/5</label>
                    <Slider
                      value={[fator.impacto]}
                      onValueChange={(val) => atualizarFator(fator.id, "impacto", val[0])}
                      min={1}
                      max={5}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Probabilidade: {fator.probabilidade}/5</label>
                    <Slider
                      value={[fator.probabilidade]}
                      onValueChange={(val) => atualizarFator(fator.id, "probabilidade", val[0])}
                      min={1}
                      max={5}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                </div>

                <button
                  onClick={() => removerFator(fator.id)}
                  className="mt-3 text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Remover
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Novo Fator */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Adicionar Novo Fator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Categoria</label>
            <select
              value={novoFator.categoria}
              onChange={(e) => setNovoFator({ ...novoFator, categoria: e.target.value as any })}
              className="w-full border rounded px-3 py-2 text-sm mt-1"
            >
              {["Político", "Econômico", "Social", "Tecnológico", "Ecológico", "Legal"].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">Descrição</label>
            <textarea
              value={novoFator.descricao}
              onChange={(e) => setNovoFator({ ...novoFator, descricao: e.target.value })}
              placeholder="Descreva o fator..."
              className="w-full border rounded px-3 py-2 text-sm mt-1"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Impacto: {novoFator.impacto}/5</label>
              <Slider
                value={[novoFator.impacto || 3]}
                onValueChange={(val) => setNovoFator({ ...novoFator, impacto: val[0] })}
                min={1}
                max={5}
                step={1}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Probabilidade: {novoFator.probabilidade}/5</label>
              <Slider
                value={[novoFator.probabilidade || 3]}
                onValueChange={(val) => setNovoFator({ ...novoFator, probabilidade: val[0] })}
                min={1}
                max={5}
                step={1}
                className="mt-1"
              />
            </div>
          </div>
          <Button onClick={adicionarFator} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Adicionar Fator
          </Button>
        </CardContent>
      </Card>

      {/* Salvar */}
      <Button onClick={handleSave} className="w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white">
        <Save className="h-4 w-4" />
        Salvar Análise PESTEL
      </Button>
    </div>
  );
}
