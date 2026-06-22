import { useParams, useLocation } from "wouter";
import { ArrowLeft, Building2, Lightbulb, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function AnaliseSwoTtows() {
  const params = useParams();
  const empresaId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();

  const { data: empresas } = trpc.empresas.list.useQuery();
  const empresa = empresas?.find((e) => e.id === empresaId);

  const [swot, setSwot] = useState({
    forcas: [{ descricao: "", impacto: "medio", estrategia: "" }],
    fraquezas: [{ descricao: "", impacto: "medio", estrategia: "" }],
    oportunidades: [{ descricao: "", impacto: "medio", estrategia: "" }],
    ameacas: [{ descricao: "", impacto: "medio", estrategia: "" }],
  });

  const tipos = [
    { key: "forcas", label: "Forças", icon: "💪", cor: "bg-green-100", descricao: "Capacidades internas positivas" },
    { key: "fraquezas", label: "Fraquezas", icon: "⚠️", cor: "bg-red-100", descricao: "Limitações internas" },
    { key: "oportunidades", label: "Oportunidades", icon: "🚀", cor: "bg-blue-100", descricao: "Possibilidades externas positivas" },
    { key: "ameacas", label: "Ameaças", icon: "🔥", cor: "bg-orange-100", descricao: "Riscos externos" },
  ];

  const addItem = (tipo: string) => {
    setSwot({
      ...swot,
      [tipo]: [...swot[tipo as keyof typeof swot], { descricao: "", impacto: "medio", estrategia: "" }],
    });
  };

  const updateItem = (tipo: string, index: number, field: string, value: string) => {
    const updated = [...swot[tipo as keyof typeof swot]];
    updated[index] = { ...updated[index], [field]: value };
    setSwot({ ...swot, [tipo]: updated });
  };

  const removeItem = (tipo: string, index: number) => {
    const updated = swot[tipo as keyof typeof swot].filter((_, i) => i !== index);
    setSwot({ ...swot, [tipo]: updated });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setLocation(`/empresa/${empresaId}/planejamento`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{empresa?.nome || "Empresa"}</h1>
                <p className="text-sm text-slate-600">Análise SWOT/TOWS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Introdução */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              O que é SWOT/TOWS?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-900 mb-3">
              SWOT (Strengths, Weaknesses, Opportunities, Threats) é uma análise que avalia fatores internos (Forças e Fraquezas) e externos (Oportunidades e Ameaças).
            </p>
            <p className="text-xs text-blue-800">
              TOWS é a mesma análise com foco em estratégias: como usar forças para aproveitar oportunidades, como superar fraquezas, etc.
            </p>
          </CardContent>
        </Card>

        {/* Matriz SWOT Visual */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Matriz SWOT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-100 p-4 rounded-lg border-2 border-green-300">
                <h3 className="font-semibold text-green-900 mb-2">💪 Forças</h3>
                <p className="text-xs text-green-800">Capacidades e recursos internos positivos</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg border-2 border-red-300">
                <h3 className="font-semibold text-red-900 mb-2">⚠️ Fraquezas</h3>
                <p className="text-xs text-red-800">Limitações e deficiências internas</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-300">
                <h3 className="font-semibold text-blue-900 mb-2">🚀 Oportunidades</h3>
                <p className="text-xs text-blue-800">Possibilidades positivas do ambiente externo</p>
              </div>
              <div className="bg-orange-100 p-4 rounded-lg border-2 border-orange-300">
                <h3 className="font-semibold text-orange-900 mb-2">🔥 Ameaças</h3>
                <p className="text-xs text-orange-800">Riscos e desafios do ambiente externo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário SWOT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {tipos.map((tipo) => (
            <Card key={tipo.key} className={`border-2 ${tipo.cor}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{tipo.icon}</span>
                  {tipo.label}
                </CardTitle>
                <CardDescription className="text-xs">{tipo.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {swot[tipo.key as keyof typeof swot].map((item, index) => (
                  <div key={index} className="p-3 bg-white rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <input
                        type="text"
                        placeholder={`${tipo.label}...`}
                        value={item.descricao}
                        onChange={(e) => updateItem(tipo.key, index, "descricao", e.target.value)}
                        className="flex-1 border rounded px-2 py-1 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(tipo.key, index)}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="text-xs font-medium mb-1 block">Impacto</label>
                        <select
                          value={item.impacto}
                          onChange={(e) => updateItem(tipo.key, index, "impacto", e.target.value)}
                          className="w-full border rounded px-2 py-1 text-xs"
                        >
                          <option value="baixo">Baixo</option>
                          <option value="medio">Médio</option>
                          <option value="alto">Alto</option>
                        </select>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Estratégia..."
                      value={item.estrategia}
                      onChange={(e) => updateItem(tipo.key, index, "estrategia", e.target.value)}
                      className="min-h-12 text-xs"
                    />
                  </div>
                ))}
                <Button
                  onClick={() => addItem(tipo.key)}
                  variant="outline"
                  className="w-full text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar {tipo.label}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Estratégias TOWS */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Estratégias TOWS</CardTitle>
            <CardDescription>Combine elementos para definir estratégias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded border-2 border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Estratégia Ofensiva (F-O)</h4>
                <p className="text-xs text-green-800">Use suas forças para aproveitar oportunidades</p>
              </div>
              <div className="p-4 bg-blue-50 rounded border-2 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Estratégia Defensiva (F-A)</h4>
                <p className="text-xs text-blue-800">Use suas forças para evitar ameaças</p>
              </div>
              <div className="p-4 bg-orange-50 rounded border-2 border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2">Estratégia de Reposicionamento (W-O)</h4>
                <p className="text-xs text-orange-800">Supere fraquezas para aproveitar oportunidades</p>
              </div>
              <div className="p-4 bg-red-50 rounded border-2 border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">Estratégia de Sobrevivência (W-A)</h4>
                <p className="text-xs text-red-800">Minimize fraquezas e evite ameaças</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button variant="outline">Cancelar</Button>
          <Button className="bg-orange-600 hover:bg-orange-700">Salvar Análise</Button>
        </div>
      </div>
    </div>
  );
}
