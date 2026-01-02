import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Plus, Trash2 } from "lucide-react";

interface ItemSwot {
  id: string;
  descricao: string;
}

export default function SwotLite() {
  const [forcas, setForcas] = useState<ItemSwot[]>([
    { id: "1", descricao: "Equipe técnica experiente" },
  ]);
  const [fraquezas, setFraquezas] = useState<ItemSwot[]>([
    { id: "1", descricao: "Recursos limitados" },
  ]);
  const [oportunidades, setOportunidades] = useState<ItemSwot[]>([
    { id: "1", descricao: "Crescimento de demanda" },
  ]);
  const [ameacas, setAmeacas] = useState<ItemSwot[]>([
    { id: "1", descricao: "Concorrência aumentando" },
  ]);

  const [novoItem, setNovoItem] = useState("");

  const adicionarItem = (tipo: string) => {
    if (!novoItem) return;
    const item = { id: Date.now().toString(), descricao: novoItem };
    if (tipo === "forcas") setForcas([...forcas, item]);
    else if (tipo === "fraquezas") setFraquezas([...fraquezas, item]);
    else if (tipo === "oportunidades") setOportunidades([...oportunidades, item]);
    else if (tipo === "ameacas") setAmeacas([...ameacas, item]);
    setNovoItem("");
  };

  const removerItem = (tipo: string, id: string) => {
    if (tipo === "forcas") setForcas(forcas.filter((i) => i.id !== id));
    else if (tipo === "fraquezas") setFraquezas(fraquezas.filter((i) => i.id !== id));
    else if (tipo === "oportunidades") setOportunidades(oportunidades.filter((i) => i.id !== id));
    else if (tipo === "ameacas") setAmeacas(ameacas.filter((i) => i.id !== id));
  };

  const handleSave = () => {
    console.log("SWOT salva:", { forcas, fraquezas, oportunidades, ameacas });
    alert("Análise SWOT salva com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            Análise SWOT/TOWS
          </CardTitle>
          <CardDescription>Forças, Fraquezas, Oportunidades, Ameaças</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-green-300 bg-green-50">
          <CardHeader><CardTitle className="text-base text-green-900">Forças</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {forcas.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded border-l-4 border-green-500">
                <span className="text-sm">{item.descricao}</span>
                <button onClick={() => removerItem("forcas", item.id)} className="text-red-600"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-red-300 bg-red-50">
          <CardHeader><CardTitle className="text-base text-red-900">Fraquezas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {fraquezas.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded border-l-4 border-red-500">
                <span className="text-sm">{item.descricao}</span>
                <button onClick={() => removerItem("fraquezas", item.id)} className="text-red-600"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-blue-300 bg-blue-50">
          <CardHeader><CardTitle className="text-base text-blue-900">Oportunidades</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {oportunidades.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded border-l-4 border-blue-500">
                <span className="text-sm">{item.descricao}</span>
                <button onClick={() => removerItem("oportunidades", item.id)} className="text-red-600"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-orange-300 bg-orange-50">
          <CardHeader><CardTitle className="text-base text-orange-900">Ameaças</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {ameacas.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded border-l-4 border-orange-500">
                <span className="text-sm">{item.descricao}</span>
                <button onClick={() => removerItem("ameacas", item.id)} className="text-red-600"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleSave} className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white">
        <Save className="h-4 w-4" />
        Salvar Análise SWOT
      </Button>
    </div>
  );
}
