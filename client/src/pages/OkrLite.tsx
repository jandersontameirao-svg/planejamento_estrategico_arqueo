import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

export default function OkrLite() {
  const [data, setData] = useState({
    objetivo1: "",
    resultado1: "",
    objetivo2: "",
    resultado2: "",
    objetivo3: "",
    resultado3: "",
  });

  const handleSave = () => {
    console.log("OKR salva:", data);
    alert("Análise OKR salva com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100/50">
        <CardHeader>
          <CardTitle>OKR - Objetivos e Resultados-Chave</CardTitle>
          <CardDescription>Defina objetivos e como medi-los</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-l-4 border-cyan-500 pl-4 space-y-2">
              <label className="text-sm font-semibold">Objetivo {i}</label>
              <Textarea
                placeholder={`Objetivo qualitativo ${i}...`}
                rows={2}
                value={(data as any)[`objetivo${i}`]}
                onChange={(e) => setData({ ...data, [`objetivo${i}` as any]: e.target.value })}
              />
              <label className="text-sm font-semibold">Resultado-Chave {i}</label>
              <Textarea
                placeholder={`Como medir o resultado ${i}...`}
                rows={2}
                value={(data as any)[`resultado${i}`]}
                onChange={(e) => setData({ ...data, [`resultado${i}` as any]: e.target.value })}
              />
            </div>
          ))}
          <Button onClick={handleSave} className="w-full gap-2 bg-cyan-600 hover:bg-cyan-700">
            <Save className="h-4 w-4" />
            Salvar OKR
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
