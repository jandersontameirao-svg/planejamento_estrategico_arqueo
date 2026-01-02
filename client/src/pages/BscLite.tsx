import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2 } from "lucide-react";

interface Perspectiva {
  id: string;
  nome: string;
  indicadores: string[];
  desempenho: number;
}

export default function BscLite() {
  const [perspectivas, setPerspectivas] = useState<Perspectiva[]>([
    { id: "1", nome: "Financeira", indicadores: ["ROI", "Receita"], desempenho: 75 },
    { id: "2", nome: "Cliente", indicadores: ["Satisfação", "Retenção"], desempenho: 80 },
    { id: "3", nome: "Processos", indicadores: ["Eficiência", "Qualidade"], desempenho: 70 },
    { id: "4", nome: "Aprendizado", indicadores: ["Inovação", "Desenvolvimento"], desempenho: 65 },
  ]);

  const atualizarDesempenho = (id: string, desempenho: number) => {
    setPerspectivas(perspectivas.map((p) => (p.id === id ? { ...p, desempenho } : p)));
  };

  const handleSave = () => {
    console.log("BSC salva:", perspectivas);
    alert("Balanced Scorecard salva com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">B</div>
            Balanced Scorecard (BSC)
          </CardTitle>
          <CardDescription>4 Perspectivas de Desempenho</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {perspectivas.map((p) => (
          <Card key={p.id} className="border-indigo-200">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-sm">{p.nome}</h4>
                <Badge className="bg-indigo-500">{p.desempenho}%</Badge>
              </div>
              <Slider
                value={[p.desempenho]}
                onValueChange={(val) => atualizarDesempenho(p.id, val[0])}
                min={0}
                max={100}
                step={5}
                className="mt-1"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleSave} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
        <Save className="h-4 w-4" />
        Salvar Balanced Scorecard
      </Button>
    </div>
  );
}
