import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

export default function VrioLite() {
  const [data, setData] = useState({
    recurso: "",
    valioso: "",
    raro: "",
    imitavel: "",
    organizado: "",
  });

  const handleSave = () => {
    console.log("VRIO salva:", data);
    alert("Análise VRIO salva com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50">
        <CardHeader>
          <CardTitle>Análise VRIO</CardTitle>
          <CardDescription>Valioso, Raro, Imitável, Organizado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "recurso", label: "Recurso/Capacidade", desc: "Qual recurso analisar?" },
            { key: "valioso", label: "Valioso", desc: "Agrega valor ao cliente?" },
            { key: "raro", label: "Raro", desc: "Poucos competidores possuem?" },
            { key: "imitavel", label: "Imitável", desc: "Fácil de copiar?" },
            { key: "organizado", label: "Organizado", desc: "Empresa está preparada?" },
          ].map((item) => (
            <div key={item.key} className="space-y-2">
              <label className="text-sm font-semibold">{item.label}</label>
              <p className="text-xs text-gray-600">{item.desc}</p>
              <Textarea
                placeholder={`${item.label}...`}
                rows={2}
                value={(data as any)[item.key]}
                onChange={(e) => setData({ ...data, [item.key]: e.target.value })}
              />
            </div>
          ))}
          <Button onClick={handleSave} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Save className="h-4 w-4" />
            Salvar VRIO
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
