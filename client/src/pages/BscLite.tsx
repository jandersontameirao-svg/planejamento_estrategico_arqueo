import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

export default function BscLite() {
  const [data, setData] = useState({
    financeiro: "",
    cliente: "",
    processos: "",
    aprendizado: "",
  });

  const handleSave = () => {
    console.log("BSC salva:", data);
    alert("Análise BSC salva com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50">
        <CardHeader>
          <CardTitle>BSC - Balanced Scorecard</CardTitle>
          <CardDescription>Perspectivas de desempenho</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "financeiro", label: "Perspectiva Financeira", desc: "Rentabilidade, crescimento" },
            { key: "cliente", label: "Perspectiva do Cliente", desc: "Satisfação, retenção" },
            { key: "processos", label: "Perspectiva de Processos", desc: "Eficiência operacional" },
            { key: "aprendizado", label: "Perspectiva de Aprendizado", desc: "Inovação, desenvolvimento" },
          ].map((item) => (
            <div key={item.key} className="space-y-2">
              <label className="text-sm font-semibold">{item.label}</label>
              <p className="text-xs text-gray-600">{item.desc}</p>
              <Textarea
                placeholder={`Descreva ${item.label.toLowerCase()}...`}
                rows={2}
                value={(data as any)[item.key]}
                onChange={(e) => setData({ ...data, [item.key]: e.target.value })}
              />
            </div>
          ))}
          <Button onClick={handleSave} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4" />
            Salvar BSC
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
