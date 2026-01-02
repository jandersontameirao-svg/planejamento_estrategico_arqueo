import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2 } from "lucide-react";

interface OKR {
  id: string;
  objetivo: string;
  resultados: string[];
  progresso: number;
}

export default function OkrLite() {
  const [okrs, setOkrs] = useState<OKR[]>([
    { id: "1", objetivo: "Aumentar receita", resultados: ["Crescer 20%", "Novos clientes"], progresso: 60 },
  ]);

  const [novoObjetivo, setNovoObjetivo] = useState("");

  const adicionarOKR = () => {
    if (!novoObjetivo) return;
    setOkrs([...okrs, {
      id: Date.now().toString(),
      objetivo: novoObjetivo,
      resultados: [],
      progresso: 0,
    }]);
    setNovoObjetivo("");
  };

  const removerOKR = (id: string) => {
    setOkrs(okrs.filter((o) => o.id !== id));
  };

  const atualizarProgresso = (id: string, progresso: number) => {
    setOkrs(okrs.map((o) => (o.id === id ? { ...o, progresso } : o)));
  };

  const handleSave = () => {
    console.log("OKR salva:", okrs);
    alert("OKR salva com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">O</div>
            OKR - Objetivos e Resultados-Chave
          </CardTitle>
          <CardDescription>Defina objetivos ambiciosos e resultados mensuráveis</CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {okrs.map((okr) => (
          <Card key={okr.id} className="border-cyan-200">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-sm">{okr.objetivo}</h4>
                <Badge className="bg-cyan-500">{okr.progresso}%</Badge>
              </div>
              <div className="mb-3">
                <label className="text-xs font-semibold">Progresso: {okr.progresso}%</label>
                <Slider
                  value={[okr.progresso]}
                  onValueChange={(val) => atualizarProgresso(okr.id, val[0])}
                  min={0}
                  max={100}
                  step={10}
                  className="mt-1"
                />
              </div>
              <button
                onClick={() => removerOKR(okr.id)}
                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> Remover
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-cyan-50 border-cyan-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Adicionar Novo OKR
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            type="text"
            value={novoObjetivo}
            onChange={(e) => setNovoObjetivo(e.target.value)}
            placeholder="Descreva o objetivo..."
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <Button onClick={adicionarOKR} className="w-full gap-2 bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4" />
            Adicionar OKR
          </Button>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full gap-2 bg-cyan-600 hover:bg-cyan-700 text-white">
        <Save className="h-4 w-4" />
        Salvar OKR
      </Button>
    </div>
  );
}
