import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

export default function SwotLite() {
  const [data, setData] = useState({
    forcas: "",
    fraquezas: "",
    oportunidades: "",
    ameacas: "",
  });

  const handleSave = () => {
    console.log("SWOT salva:", data);
    alert("Análise SWOT salva com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-50 to-green-100/50">
        <CardHeader>
          <CardTitle>Análise SWOT/TOWS</CardTitle>
          <CardDescription>Forças, Fraquezas, Oportunidades e Ameaças</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Forças</h4>
              <p className="text-sm text-green-800 mb-2">Vantagens internas</p>
              <Textarea placeholder="Descreva as forças..." rows={2} value={data.forcas} onChange={(e) => setData({ ...data, forcas: e.target.value })} />
            </div>
            <div className="border-2 border-red-300 bg-red-50 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">Fraquezas</h4>
              <p className="text-sm text-red-800 mb-2">Desvantagens internas</p>
              <Textarea placeholder="Descreva as fraquezas..." rows={2} value={data.fraquezas} onChange={(e) => setData({ ...data, fraquezas: e.target.value })} />
            </div>
            <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Oportunidades</h4>
              <p className="text-sm text-blue-800 mb-2">Possibilidades externas</p>
              <Textarea placeholder="Descreva as oportunidades..." rows={2} value={data.oportunidades} onChange={(e) => setData({ ...data, oportunidades: e.target.value })} />
            </div>
            <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">Ameaças</h4>
              <p className="text-sm text-yellow-800 mb-2">Riscos externos</p>
              <Textarea placeholder="Descreva as ameaças..." rows={2} value={data.ameacas} onChange={(e) => setData({ ...data, ameacas: e.target.value })} />
            </div>
          </div>
          <Button onClick={handleSave} className="w-full gap-2 bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4" />
            Salvar SWOT
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
