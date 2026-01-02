import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

interface IdentidadeOrganizacionalLiteProps {
  empresaId?: number;
}

/**
 * Versão Lite de Identidade Organizacional para renderizar DENTRO do card
 * Sem navegação, sem tabs, apenas formulário simples
 */
export default function IdentidadeOrganizacionalLite({ empresaId = 1 }: IdentidadeOrganizacionalLiteProps) {
  const [formData, setFormData] = useState({
    missao: "",
    visao: "",
    valores: "",
  });

  const handleSave = () => {
    console.log("Identidade Organizacional salva:", formData);
    alert("Identidade Organizacional salva com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50">
        <CardHeader>
          <CardTitle>Identidade Organizacional</CardTitle>
          <CardDescription>Defina a missão, visão e valores da empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Missão */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Missão</label>
            <p className="text-xs text-gray-600 mb-2">Razão de existir da empresa, seu propósito fundamental</p>
            <Textarea
              placeholder="Descreva a missão da empresa..."
              rows={3}
              value={formData.missao}
              onChange={(e) => setFormData({ ...formData, missao: e.target.value })}
              className="border-orange-200 focus:border-orange-500"
            />
          </div>

          {/* Visão */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Visão</label>
            <p className="text-xs text-gray-600 mb-2">Onde a empresa quer chegar no futuro</p>
            <Textarea
              placeholder="Descreva a visão da empresa..."
              rows={3}
              value={formData.visao}
              onChange={(e) => setFormData({ ...formData, visao: e.target.value })}
              className="border-orange-200 focus:border-orange-500"
            />
          </div>

          {/* Valores */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900">Valores</label>
            <p className="text-xs text-gray-600 mb-2">Princípios e crenças que guiam a empresa</p>
            <Textarea
              placeholder="Liste os valores da empresa..."
              rows={3}
              value={formData.valores}
              onChange={(e) => setFormData({ ...formData, valores: e.target.value })}
              className="border-orange-200 focus:border-orange-500"
            />
          </div>

          {/* Botão Salvar */}
          <Button onClick={handleSave} className="w-full gap-2 bg-orange-600 hover:bg-orange-700">
            <Save className="h-4 w-4" />
            Salvar Identidade
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
