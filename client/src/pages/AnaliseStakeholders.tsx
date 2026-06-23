import { useParams, useLocation } from "wouter";
import { ArrowLeft, Building2, Lightbulb, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AnaliseStakeholders() {
  const params = useParams();
  const empresaId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();

  const { data: empresas } = trpc.empresas.list.useQuery();
  const empresa = empresas?.find((e) => e.id === empresaId);

  const [stakeholders, setStakeholders] = useState([
    { nome: "", poder: "medio", interesse: "medio", estrategia: "" },
  ]);

  const saved = trpc.analises.getStakeholders.useQuery({ empresaId }, { enabled: empresaId > 0 });
  useEffect(() => {
    const arr = (saved.data as any)?.stakeholders;
    if (Array.isArray(arr) && arr.length) setStakeholders(arr);
  }, [saved.data]);

  const salvar = trpc.analises.saveStakeholders.useMutation({
    onSuccess: () => toast.success("Stakeholders salvos!"),
    onError: (e) => toast.error(e.message || "Erro ao salvar"),
  });

  const addStakeholder = () => {
    setStakeholders([...stakeholders, { nome: "", poder: "medio", interesse: "medio", estrategia: "" }]);
  };

  const updateStakeholder = (index: number, field: string, value: string) => {
    const updated = [...stakeholders];
    updated[index] = { ...updated[index], [field]: value };
    setStakeholders(updated);
  };

  const getMatrizQuadrante = (poder: string, interesse: string) => {
    if (poder === "alto" && interesse === "alto") return { quadrante: "Gerenciar Ativamente", cor: "bg-red-100" };
    if (poder === "alto" && interesse !== "alto") return { quadrante: "Manter Satisfeito", cor: "bg-yellow-100" };
    if (poder !== "alto" && interesse === "alto") return { quadrante: "Manter Informado", cor: "bg-blue-100" };
    return { quadrante: "Monitorar", cor: "bg-green-100" };
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
                <p className="text-sm text-slate-600">Análise de Stakeholders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Introdução */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Matriz de Poder x Interesse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-900 mb-3">
              Identifique os stakeholders e posicione-os na matriz de Poder x Interesse para definir estratégias de engajamento apropriadas.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs text-blue-800">
              <div className="bg-red-100 p-2 rounded">🔴 <strong>Gerenciar Ativamente</strong>: Alto Poder + Alto Interesse</div>
              <div className="bg-yellow-100 p-2 rounded">🟡 <strong>Manter Satisfeito</strong>: Alto Poder + Baixo Interesse</div>
              <div className="bg-blue-100 p-2 rounded">🔵 <strong>Manter Informado</strong>: Baixo Poder + Alto Interesse</div>
              <div className="bg-green-100 p-2 rounded">🟢 <strong>Monitorar</strong>: Baixo Poder + Baixo Interesse</div>
            </div>
          </CardContent>
        </Card>

        {/* Matriz Visual */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Matriz de Stakeholders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 h-96 border-4 border-gray-300">
              {/* Quadrante 1: Baixo Poder, Baixo Interesse */}
              <div className="bg-green-100 p-4 border-r-2 border-b-2 border-gray-300 rounded-tl">
                <p className="font-semibold text-sm mb-2">Monitorar</p>
                <p className="text-xs text-gray-600">Baixo Poder<br/>Baixo Interesse</p>
              </div>
              {/* Quadrante 2: Alto Poder, Baixo Interesse */}
              <div className="bg-yellow-100 p-4 border-b-2 border-gray-300 rounded-tr">
                <p className="font-semibold text-sm mb-2">Manter Satisfeito</p>
                <p className="text-xs text-gray-600">Alto Poder<br/>Baixo Interesse</p>
              </div>
              {/* Quadrante 3: Baixo Poder, Alto Interesse */}
              <div className="bg-blue-100 p-4 border-r-2 border-gray-300 rounded-bl">
                <p className="font-semibold text-sm mb-2">Manter Informado</p>
                <p className="text-xs text-gray-600">Baixo Poder<br/>Alto Interesse</p>
              </div>
              {/* Quadrante 4: Alto Poder, Alto Interesse */}
              <div className="bg-red-100 p-4 rounded-br">
                <p className="font-semibold text-sm mb-2">Gerenciar Ativamente</p>
                <p className="text-xs text-gray-600">Alto Poder<br/>Alto Interesse</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Stakeholders */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Stakeholders</CardTitle>
            <CardDescription>Adicione e gerencie os stakeholders da empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stakeholders.map((stakeholder, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getMatrizQuadrante(stakeholder.poder, stakeholder.interesse).cor}`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nome</label>
                    <input
                      type="text"
                      placeholder="Nome do stakeholder"
                      value={stakeholder.nome}
                      onChange={(e) => updateStakeholder(index, "nome", e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Poder</label>
                    <select
                      value={stakeholder.poder}
                      onChange={(e) => updateStakeholder(index, "poder", e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="baixo">Baixo</option>
                      <option value="medio">Médio</option>
                      <option value="alto">Alto</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Interesse</label>
                    <select
                      value={stakeholder.interesse}
                      onChange={(e) => updateStakeholder(index, "interesse", e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="baixo">Baixo</option>
                      <option value="medio">Médio</option>
                      <option value="alto">Alto</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Quadrante</label>
                    <div className="w-full border rounded px-3 py-2 text-sm bg-white">
                      {getMatrizQuadrante(stakeholder.poder, stakeholder.interesse).quadrante}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Estratégia de Engajamento</label>
                  <Textarea
                    placeholder="Descreva a estratégia para engajar este stakeholder..."
                    value={stakeholder.estrategia}
                    onChange={(e) => updateStakeholder(index, "estrategia", e.target.value)}
                    className="min-h-16"
                  />
                </div>
              </div>
            ))}
            <Button onClick={addStakeholder} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Stakeholder
            </Button>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation(`/empresa/${empresaId}/planejamento`)}>Cancelar</Button>
          <Button className="bg-orange-600 hover:bg-orange-700" disabled={salvar.isPending} onClick={() => salvar.mutate({ empresaId, dados: { stakeholders } })}>
            {salvar.isPending ? "Salvando..." : "Salvar Análise"}
          </Button>
        </div>
      </div>
    </div>
  );
}
