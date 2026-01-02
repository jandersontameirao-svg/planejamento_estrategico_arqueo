import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

export default function AnalisePestelLite({ empresaId = 1 }) {
  const [data, setData] = useState({
    politico: "",
    economico: "",
    social: "",
    tecnologico: "",
    ecologico: "",
    legal: "",
  });

  const handleSave = () => {
    console.log("PESTEL salva:", data);
    alert("Análise PESTEL salva com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50">
        <CardHeader>
          <CardTitle>Análise PESTEL</CardTitle>
          <CardDescription>Análise do ambiente externo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "politico", label: "Político", desc: "Políticas governamentais, legislação" },
            { key: "economico", label: "Econômico", desc: "Inflação, juros, crescimento" },
            { key: "social", label: "Social", desc: "Cultura, demográfica, comportamento" },
            { key: "tecnologico", label: "Tecnológico", desc: "Inovação, tecnologia, digitalização" },
            { key: "ecologico", label: "Ecológico", desc: "Sustentabilidade, meio ambiente" },
            { key: "legal", label: "Legal", desc: "Leis, regulações, conformidade" },
          ].map((item) => (
            <div key={item.key} className="space-y-2">
              <label className="text-sm font-semibold">{item.label}</label>
              <p className="text-xs text-gray-600">{item.desc}</p>
              <Textarea
                placeholder={`Descreva os fatores ${item.label.toLowerCase()}...`}
                rows={2}
                value={(data as any)[item.key]}
                onChange={(e) => setData({ ...data, [item.key]: e.target.value })}
              />
            </div>
          ))}
          <Button onClick={handleSave} className="w-full gap-2 bg-orange-600 hover:bg-orange-700">
            <Save className="h-4 w-4" />
            Salvar PESTEL
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
