import { useParams, useLocation } from "wouter";
import { ArrowLeft, Building2, Lightbulb, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function AnaliseOkr() {
  const params = useParams();
  const empresaId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();

  const { data: empresas } = trpc.empresas.list.useQuery();
  const empresa = empresas?.find((e) => e.id === empresaId);

  const [okrs, setOkrs] = useState([
    {
      objetivo: "",
      descricao: "",
      periodo: "",
      resultados: [
        { descricao: "", meta: "", status: "nao_iniciado" },
        { descricao: "", meta: "", status: "nao_iniciado" },
        { descricao: "", meta: "", status: "nao_iniciado" },
      ],
      progresso: 0,
    },
  ]);

  const addOkr = () => {
    setOkrs([
      ...okrs,
      {
        objetivo: "",
        descricao: "",
        periodo: "",
        resultados: [
          { descricao: "", meta: "", status: "nao_iniciado" },
          { descricao: "", meta: "", status: "nao_iniciado" },
          { descricao: "", meta: "", status: "nao_iniciado" },
        ],
        progresso: 0,
      },
    ]);
  };

  const updateOkr = (index: number, field: string, value: any) => {
    const updated = [...okrs];
    updated[index] = { ...updated[index], [field]: value };
    setOkrs(updated);
  };

  const updateResultado = (okrIndex: number, resultadoIndex: number, field: string, value: string) => {
    const updated = [...okrs];
    updated[okrIndex].resultados[resultadoIndex] = {
      ...updated[okrIndex].resultados[resultadoIndex],
      [field]: value,
    };
    setOkrs(updated);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "nao_iniciado":
        return "bg-gray-100";
      case "em_progresso":
        return "bg-blue-100";
      case "concluido":
        return "bg-green-100";
      case "cancelado":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setLocation(`/empresa/${empresaId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{empresa?.nome || "Empresa"}</h1>
                <p className="text-sm text-slate-600">OKR - Objetivos e Resultados-Chave</p>
              </div>
            </div>
          </div>
        </div>

        {/* Introdução */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              O que é OKR?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-900 mb-3">
              OKR (Objectives and Key Results) é um framework de definição de metas que combina objetivos qualitativos com resultados-chave mensuráveis.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-800">
              <div>
                <strong>Objetivo:</strong> O que você quer alcançar (qualitativo, inspirador)
              </div>
              <div>
                <strong>Resultado-Chave:</strong> Como você vai medir o sucesso (quantitativo, mensurável)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OKRs */}
        <div className="space-y-6 mb-6">
          {okrs.map((okr, okrIndex) => (
            <Card key={okrIndex}>
              <CardHeader>
                <CardTitle className="text-lg">OKR #{okrIndex + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Objetivo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Objetivo</label>
                    <input
                      type="text"
                      placeholder="O que você quer alcançar?"
                      value={okr.objetivo}
                      onChange={(e) => updateOkr(okrIndex, "objetivo", e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Período</label>
                    <input
                      type="text"
                      placeholder="Ex: Q1 2024, Trimestre 1"
                      value={okr.periodo}
                      onChange={(e) => updateOkr(okrIndex, "periodo", e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Descrição</label>
                  <Textarea
                    placeholder="Descreva o objetivo em detalhes..."
                    value={okr.descricao}
                    onChange={(e) => updateOkr(okrIndex, "descricao", e.target.value)}
                    className="min-h-20"
                  />
                </div>

                {/* Resultados-Chave */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Resultados-Chave</h4>
                  <div className="space-y-3">
                    {okr.resultados.map((resultado, resultadoIndex) => (
                      <div key={resultadoIndex} className={`p-3 rounded border ${getStatusColor(resultado.status)}`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                          <div>
                            <label className="text-xs font-medium mb-1 block">Resultado-Chave</label>
                            <input
                              type="text"
                              placeholder="Como você vai medir?"
                              value={resultado.descricao}
                              onChange={(e) => updateResultado(okrIndex, resultadoIndex, "descricao", e.target.value)}
                              className="w-full border rounded px-2 py-1 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1 block">Meta</label>
                            <input
                              type="text"
                              placeholder="Ex: 100%, +50%, $1M"
                              value={resultado.meta}
                              onChange={(e) => updateResultado(okrIndex, resultadoIndex, "meta", e.target.value)}
                              className="w-full border rounded px-2 py-1 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1 block">Status</label>
                            <select
                              value={resultado.status}
                              onChange={(e) => updateResultado(okrIndex, resultadoIndex, "status", e.target.value)}
                              className="w-full border rounded px-2 py-1 text-xs"
                            >
                              <option value="nao_iniciado">Não Iniciado</option>
                              <option value="em_progresso">Em Progresso</option>
                              <option value="concluido">Concluído</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progresso */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Progresso Geral</label>
                    <span className="text-sm font-semibold">{okr.progresso}%</span>
                  </div>
                  <Progress value={okr.progresso} className="h-2" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={okr.progresso}
                    onChange={(e) => updateOkr(okrIndex, "progresso", parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Adicionar OKR */}
        <Button onClick={addOkr} variant="outline" className="w-full mb-6">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar OKR
        </Button>

        {/* Boas Práticas */}
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-sm">💡 Boas Práticas para OKRs</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-yellow-900 space-y-2">
            <p>✓ Máximo 3-5 OKRs por período para manter o foco</p>
            <p>✓ Resultados-Chave devem ser mensuráveis e ambiciosos (60-70% de chance de sucesso)</p>
            <p>✓ Revise regularmente (semanal ou quinzenal) o progresso</p>
            <p>✓ Comunique OKRs a toda a equipe para alinhamento</p>
            <p>✓ Use OKRs para motivar e não para punir</p>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button variant="outline">Cancelar</Button>
          <Button className="bg-orange-600 hover:bg-orange-700">Salvar OKRs</Button>
        </div>
      </div>
    </div>
  );
}
