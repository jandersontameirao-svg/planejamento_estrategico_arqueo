import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

export default function CincoForcasLite({ empresaId = 1 }) {
  const [data, setData] = useState({
    rivalidade: "",
    fornecedores: "",
    clientes: "",
    novosEntrantes: "",
    substitutos: "",
  });

  const handleSave = () => {
    console.log("5 Forças salva:", data);
    alert("Análise de 5 Forças salva com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50">
        <CardHeader>
          <CardTitle>5 Forças de Porter</CardTitle>
          <CardDescription>Análise competitiva do mercado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "rivalidade", label: "Rivalidade Competitiva", desc: "Intensidade da concorrência" },
            { key: "fornecedores", label: "Poder dos Fornecedores", desc: "Capacidade de negociação" },
            { key: "clientes", label: "Poder dos Clientes", desc: "Capacidade de negociação" },
            { key: "novosEntrantes", label: "Ameaça de Novos Entrantes", desc: "Barreiras à entrada" },
            { key: "substitutos", label: "Ameaça de Substitutos", desc: "Produtos/serviços alternativos" },
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
            Salvar 5 Forças
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
