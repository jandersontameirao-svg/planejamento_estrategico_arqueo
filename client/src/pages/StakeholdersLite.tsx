import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2 } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Stakeholder {
  id: string;
  nome: string;
  poder: number; // 1-5
  interesse: number; // 1-5
  descricao: string;
}

const classificarQuadrante = (poder: number, interesse: number) => {
  if (poder >= 3.5 && interesse >= 3.5) return { label: "Gerenciar Ativamente", cor: "bg-red-500" };
  if (poder >= 3.5 && interesse < 3.5) return { label: "Manter Satisfeito", cor: "bg-yellow-500" };
  if (poder < 3.5 && interesse >= 3.5) return { label: "Manter Informado", cor: "bg-blue-500" };
  return { label: "Monitorar", cor: "bg-green-500" };
};

export default function StakeholdersLite() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([
    { id: "1", nome: "IPHAN", poder: 5, interesse: 4, descricao: "Órgão regulador" },
    { id: "2", nome: "Clientes", poder: 4, interesse: 5, descricao: "Usuários dos serviços" },
  ]);

  const [novoStakeholder, setNovoStakeholder] = useState<Partial<Stakeholder>>({
    nome: "",
    poder: 3,
    interesse: 3,
    descricao: "",
  });

  const adicionarStakeholder = () => {
    if (!novoStakeholder.nome) return;
    setStakeholders([
      ...stakeholders,
      {
        id: Date.now().toString(),
        nome: novoStakeholder.nome,
        poder: novoStakeholder.poder || 3,
        interesse: novoStakeholder.interesse || 3,
        descricao: novoStakeholder.descricao || "",
      },
    ]);
    setNovoStakeholder({ nome: "", poder: 3, interesse: 3, descricao: "" });
  };

  const removerStakeholder = (id: string) => {
    setStakeholders(stakeholders.filter((s) => s.id !== id));
  };

  const atualizarStakeholder = (id: string, campo: keyof Stakeholder, valor: any) => {
    setStakeholders(stakeholders.map((s) => (s.id === id ? { ...s, [campo]: valor } : s)));
  };

  const dadosGrafico = stakeholders.map((s) => ({
    nome: s.nome,
    poder: s.poder,
    interesse: s.interesse,
    size: (s.poder + s.interesse) * 50,
  }));

  const handleSave = () => {
    console.log("Stakeholders salva:", stakeholders);
    alert("Análise de Stakeholders salva com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            Análise de Stakeholders
          </CardTitle>
          <CardDescription>Poder vs Interesse - Matriz de Influência</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div><strong>Total:</strong> {stakeholders.length}</div>
            <div><strong>Poder Médio:</strong> {(stakeholders.reduce((a, s) => a + s.poder, 0) / stakeholders.length).toFixed(1)}/5</div>
            <div><strong>Interesse Médio:</strong> {(stakeholders.reduce((a, s) => a + s.interesse, 0) / stakeholders.length).toFixed(1)}/5</div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Dispersão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Matriz Poder x Interesse</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="poder" name="Poder" domain={[0, 5]} label={{ value: "Poder", position: "insideBottomRight", offset: -5 }} />
              <YAxis dataKey="interesse" name="Interesse" domain={[0, 5]} label={{ value: "Interesse", angle: -90, position: "insideLeft" }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter name="Stakeholders" data={dadosGrafico} fill="#a855f7" />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-red-100 p-2 rounded border-l-4 border-red-500"><strong>Gerenciar Ativamente:</strong> Alto poder + Alto interesse</div>
            <div className="bg-yellow-100 p-2 rounded border-l-4 border-yellow-500"><strong>Manter Satisfeito:</strong> Alto poder + Baixo interesse</div>
            <div className="bg-blue-100 p-2 rounded border-l-4 border-blue-500"><strong>Manter Informado:</strong> Baixo poder + Alto interesse</div>
            <div className="bg-green-100 p-2 rounded border-l-4 border-green-500"><strong>Monitorar:</strong> Baixo poder + Baixo interesse</div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Stakeholders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stakeholders Identificados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stakeholders.map((stakeholder) => {
            const quadrante = classificarQuadrante(stakeholder.poder, stakeholder.interesse);
            return (
              <div key={stakeholder.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-sm">{stakeholder.nome}</h4>
                    <p className="text-xs text-gray-600">{stakeholder.descricao}</p>
                  </div>
                  <Badge className={`${quadrante.cor} text-white text-xs`}>{quadrante.label}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold">Poder: {stakeholder.poder}/5</label>
                    <Slider
                      value={[stakeholder.poder]}
                      onValueChange={(val) => atualizarStakeholder(stakeholder.id, "poder", val[0])}
                      min={1}
                      max={5}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Interesse: {stakeholder.interesse}/5</label>
                    <Slider
                      value={[stakeholder.interesse]}
                      onValueChange={(val) => atualizarStakeholder(stakeholder.id, "interesse", val[0])}
                      min={1}
                      max={5}
                      step={1}
                      className="mt-1"
                    />
                  </div>
                </div>

                <button
                  onClick={() => removerStakeholder(stakeholder.id)}
                  className="mt-3 text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Remover
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Novo Stakeholder */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Adicionar Novo Stakeholder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Nome</label>
            <input
              type="text"
              value={novoStakeholder.nome}
              onChange={(e) => setNovoStakeholder({ ...novoStakeholder, nome: e.target.value })}
              placeholder="Nome do stakeholder..."
              className="w-full border rounded px-3 py-2 text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Descrição</label>
            <textarea
              value={novoStakeholder.descricao}
              onChange={(e) => setNovoStakeholder({ ...novoStakeholder, descricao: e.target.value })}
              placeholder="Descreva o stakeholder..."
              className="w-full border rounded px-3 py-2 text-sm mt-1"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Poder: {novoStakeholder.poder}/5</label>
              <Slider
                value={[novoStakeholder.poder || 3]}
                onValueChange={(val) => setNovoStakeholder({ ...novoStakeholder, poder: val[0] })}
                min={1}
                max={5}
                step={1}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Interesse: {novoStakeholder.interesse}/5</label>
              <Slider
                value={[novoStakeholder.interesse || 3]}
                onValueChange={(val) => setNovoStakeholder({ ...novoStakeholder, interesse: val[0] })}
                min={1}
                max={5}
                step={1}
                className="mt-1"
              />
            </div>
          </div>
          <Button onClick={adicionarStakeholder} className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4" />
            Adicionar Stakeholder
          </Button>
        </CardContent>
      </Card>

      {/* Salvar */}
      <Button onClick={handleSave} className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white">
        <Save className="h-4 w-4" />
        Salvar Análise de Stakeholders
      </Button>
    </div>
  );
}
