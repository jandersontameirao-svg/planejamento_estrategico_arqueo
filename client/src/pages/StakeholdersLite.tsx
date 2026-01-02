import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

export default function StakeholdersLite() {
  const [data, setData] = useState({
    altoPoder: "",
    altoInteresse: "",
    baixoPoder: "",
    baixoInteresse: "",
  });

  const handleSave = () => {
    console.log("Stakeholders salva:", data);
    alert("Análise de Stakeholders salva com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50">
        <CardHeader>
          <CardTitle>Análise de Stakeholders</CardTitle>
          <CardDescription>Matriz Poder x Interesse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-red-300 bg-red-50 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">Alto Poder / Alto Interesse</h4>
              <p className="text-sm text-red-800 mb-2">Gerenciar Ativamente</p>
              <Textarea placeholder="Ex: Diretores, Acionistas" rows={2} value={data.altoPoder} onChange={(e) => setData({ ...data, altoPoder: e.target.value })} />
            </div>
            <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Baixo Poder / Alto Interesse</h4>
              <p className="text-sm text-blue-800 mb-2">Manter Informado</p>
              <Textarea placeholder="Ex: Funcionários, Clientes" rows={2} value={data.altoInteresse} onChange={(e) => setData({ ...data, altoInteresse: e.target.value })} />
            </div>
            <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">Alto Poder / Baixo Interesse</h4>
              <p className="text-sm text-yellow-800 mb-2">Manter Satisfeito</p>
              <Textarea placeholder="Ex: Governo, Reguladores" rows={2} value={data.baixoPoder} onChange={(e) => setData({ ...data, baixoPoder: e.target.value })} />
            </div>
            <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Baixo Poder / Baixo Interesse</h4>
              <p className="text-sm text-green-800 mb-2">Monitorar</p>
              <Textarea placeholder="Ex: Fornecedores menores" rows={2} value={data.baixoInteresse} onChange={(e) => setData({ ...data, baixoInteresse: e.target.value })} />
            </div>
          </div>
          <Button onClick={handleSave} className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
            <Save className="h-4 w-4" />
            Salvar Stakeholders
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
