import { useParams, useLocation } from "wouter";
import { ArrowLeft, Building2, Lightbulb, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function AnaliseRbvVrio() {
  const params = useParams();
  const empresaId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();

  const { data: empresas } = trpc.empresas.list.useQuery();
  const empresa = empresas?.find((e) => e.id === empresaId);

  const [recursos, setRecursos] = useState([
    { recurso: "", valioso: false, raro: false, inimitavel: false, organizado: false, descricao: "" },
  ]);

  const addRecurso = () => {
    setRecursos([...recursos, { recurso: "", valioso: false, raro: false, inimitavel: false, organizado: false, descricao: "" }]);
  };

  const updateRecurso = (index: number, field: string, value: any) => {
    const updated = [...recursos];
    updated[index] = { ...updated[index], [field]: value };
    setRecursos(updated);
  };

  const getVantagem = (r: any) => {
    const { valioso, raro, inimitavel, organizado } = r;
    if (!valioso) return { tipo: "Desvantagem", cor: "bg-red-100", descricao: "Não valioso" };
    if (!organizado) return { tipo: "Desvantagem", cor: "bg-red-100", descricao: "Não organizado" };
    if (!raro && !inimitavel) return { tipo: "Paridade Competitiva", cor: "bg-yellow-100", descricao: "Valioso e organizado" };
    if (raro && !inimitavel) return { tipo: "Vantagem Temporária", cor: "bg-blue-100", descricao: "Raro e valioso" };
    return { tipo: "Vantagem Sustentável", cor: "bg-green-100", descricao: "Valioso, raro e inimitável" };
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
                <p className="text-sm text-slate-600">Análise RBV/VRIO</p>
              </div>
            </div>
          </div>
        </div>

        {/* Introdução */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              O que é RBV/VRIO?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-900 mb-3">
              RBV (Resource-Based View) e VRIO (Valioso, Raro, Inimitável, Organizado) é um framework para analisar recursos e capacidades da empresa.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-blue-800">
              <div>✓ <strong>V</strong>alioso: Explora oportunidades</div>
              <div>✓ <strong>R</strong>aro: Poucos competidores têm</div>
              <div>✓ <strong>I</strong>nimitável: Difícil de copiar</div>
              <div>✓ <strong>O</strong>rganizado: Bem estruturado</div>
            </div>
          </CardContent>
        </Card>

        {/* Matriz VRIO */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Matriz de Vantagem Competitiva</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-left">Valioso</th>
                    <th className="border p-2 text-left">Raro</th>
                    <th className="border p-2 text-left">Inimitável</th>
                    <th className="border p-2 text-left">Organizado</th>
                    <th className="border p-2 text-left">Implicação Competitiva</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-red-50">
                    <td className="border p-2">Não</td>
                    <td className="border p-2">-</td>
                    <td className="border p-2">-</td>
                    <td className="border p-2">-</td>
                    <td className="border p-2 font-semibold">Desvantagem</td>
                  </tr>
                  <tr className="bg-yellow-50">
                    <td className="border p-2">Sim</td>
                    <td className="border p-2">Não</td>
                    <td className="border p-2">-</td>
                    <td className="border p-2">Sim</td>
                    <td className="border p-2 font-semibold">Paridade</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="border p-2">Sim</td>
                    <td className="border p-2">Sim</td>
                    <td className="border p-2">Não</td>
                    <td className="border p-2">Sim</td>
                    <td className="border p-2 font-semibold">Vantagem Temporária</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border p-2">Sim</td>
                    <td className="border p-2">Sim</td>
                    <td className="border p-2">Sim</td>
                    <td className="border p-2">Sim</td>
                    <td className="border p-2 font-semibold">Vantagem Sustentável</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Recursos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Análise de Recursos e Capacidades</CardTitle>
            <CardDescription>Avalie os recursos e capacidades da empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recursos.map((recurso, index) => {
              const vantagem = getVantagem(recurso);
              return (
                <div key={index} className={`p-4 rounded-lg border ${vantagem.cor}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Recurso/Capacidade</label>
                      <input
                        type="text"
                        placeholder="Nome do recurso"
                        value={recurso.recurso}
                        onChange={(e) => updateRecurso(index, "recurso", e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Vantagem Competitiva</label>
                      <div className="w-full border rounded px-3 py-2 text-sm bg-white font-semibold">
                        {vantagem.tipo}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={recurso.valioso}
                        onChange={(e) => updateRecurso(index, "valioso", e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Valioso</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={recurso.raro}
                        onChange={(e) => updateRecurso(index, "raro", e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Raro</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={recurso.inimitavel}
                        onChange={(e) => updateRecurso(index, "inimitavel", e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Inimitável</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={recurso.organizado}
                        onChange={(e) => updateRecurso(index, "organizado", e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Organizado</span>
                    </label>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Descrição</label>
                    <Textarea
                      placeholder="Descreva este recurso/capacidade..."
                      value={recurso.descricao}
                      onChange={(e) => updateRecurso(index, "descricao", e.target.value)}
                      className="min-h-16"
                    />
                  </div>
                </div>
              );
            })}
            <Button onClick={addRecurso} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Recurso
            </Button>
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
