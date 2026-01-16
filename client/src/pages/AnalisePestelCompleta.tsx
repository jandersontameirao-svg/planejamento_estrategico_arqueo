import { useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { UndoRedoToolbar } from "@/components/UndoRedoToolbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer } from "recharts";

interface PestelData {
  politico: string;
  economico: string;
  social: string;
  tecnologico: string;
  ecologico: string;
  legal: string;
}

interface AnalisePestelCompletaProps {
  empresaId?: number;
}

export default function AnalisePestelCompleta({ empresaId = 1 }: AnalisePestelCompletaProps) {
  const notification = useNotification();
  
  const initialData: PestelData = {
    politico: "",
    economico: "",
    social: "",
    tecnologico: "",
    ecologico: "",
    legal: "",
  };

  const { state: data, setState: setData, undo, redo, canUndo, canRedo } = useUndoRedo<PestelData>(initialData);

  const [scores, setScores] = useState({
    politico: 3,
    economico: 3,
    social: 3,
    tecnologico: 3,
    ecologico: 3,
    legal: 3,
  });

  const chartData = [
    { name: "Político", value: scores.politico, fullMark: 5 },
    { name: "Econômico", value: scores.economico, fullMark: 5 },
    { name: "Social", value: scores.social, fullMark: 5 },
    { name: "Tecnológico", value: scores.tecnologico, fullMark: 5 },
    { name: "Ecológico", value: scores.ecologico, fullMark: 5 },
    { name: "Legal", value: scores.legal, fullMark: 5 },
  ];

  const handleSave = () => {
    console.log("Análise PESTEL salva:", { data, scores });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Análise PESTEL</h2>
        <UndoRedoToolbar onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
      </div>
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>Análise PESTEL</CardTitle>
          <CardDescription>
            Análise do ambiente externo: Político, Econômico, Social, Tecnológico, Ecológico e Legal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulários */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-2 block">Político</Label>
                <Textarea
                  placeholder="Políticas governamentais, estabilidade política, regulamentações..."
                  rows={3}
                  value={data.politico}
                  onChange={(e) => setData({ ...data, politico: e.target.value })}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={scores.politico}
                    onChange={(e) => setScores({ ...scores, politico: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold">{scores.politico}/5</span>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-2 block">Econômico</Label>
                <Textarea
                  placeholder="Crescimento econômico, inflação, taxas de juros, câmbio..."
                  rows={3}
                  value={data.economico}
                  onChange={(e) => setData({ ...data, economico: e.target.value })}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={scores.economico}
                    onChange={(e) => setScores({ ...scores, economico: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold">{scores.economico}/5</span>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-2 block">Social</Label>
                <Textarea
                  placeholder="Demografia, cultura, valores sociais, educação, emprego..."
                  rows={3}
                  value={data.social}
                  onChange={(e) => setData({ ...data, social: e.target.value })}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={scores.social}
                    onChange={(e) => setScores({ ...scores, social: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold">{scores.social}/5</span>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-2 block">Tecnológico</Label>
                <Textarea
                  placeholder="Inovação, pesquisa e desenvolvimento, automação, internet..."
                  rows={3}
                  value={data.tecnologico}
                  onChange={(e) => setData({ ...data, tecnologico: e.target.value })}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={scores.tecnologico}
                    onChange={(e) => setScores({ ...scores, tecnologico: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold">{scores.tecnologico}/5</span>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-2 block">Ecológico</Label>
                <Textarea
                  placeholder="Sustentabilidade, mudanças climáticas, recursos naturais..."
                  rows={3}
                  value={data.ecologico}
                  onChange={(e) => setData({ ...data, ecologico: e.target.value })}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={scores.ecologico}
                    onChange={(e) => setScores({ ...scores, ecologico: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold">{scores.ecologico}/5</span>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-2 block">Legal</Label>
                <Textarea
                  placeholder="Legislação, compliance, direitos trabalhistas, proteção de dados..."
                  rows={3}
                  value={data.legal}
                  onChange={(e) => setData({ ...data, legal: e.target.value })}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={scores.legal}
                    onChange={(e) => setScores({ ...scores, legal: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold">{scores.legal}/5</span>
                </div>
              </div>
            </div>

            {/* Gráfico */}
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} />
                  <Radar name="Impacto" dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              <Save className="mr-2 h-4 w-4" />
              Salvar Análise PESTEL
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
