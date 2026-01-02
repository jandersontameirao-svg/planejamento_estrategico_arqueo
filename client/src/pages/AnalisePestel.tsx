import { useParams, useLocation } from "wouter";
import { ArrowLeft, Building2, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function AnalisePestel() {
  const params = useParams();
  const empresaId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();

  const { data: empresas } = trpc.empresas.list.useQuery();
  const empresa = empresas?.find((e) => e.id === empresaId);

  const [formData, setFormData] = useState({
    politico: "",
    economico: "",
    social: "",
    tecnologico: "",
    ambiental: "",
    legal: "",
    observacoes: "",
  });

  const fatores = [
    { key: "politico", label: "Político", icon: "🏛️", descricao: "Políticas governamentais, regulamentações, estabilidade política" },
    { key: "economico", label: "Econômico", icon: "💰", descricao: "Crescimento econômico, inflação, taxa de câmbio, desemprego" },
    { key: "social", label: "Social", icon: "👥", descricao: "Cultura, demografia, tendências sociais, valores da sociedade" },
    { key: "tecnologico", label: "Tecnológico", icon: "🔬", descricao: "Inovação, tecnologia, automação, pesquisa e desenvolvimento" },
    { key: "ambiental", label: "Ambiental", icon: "🌍", descricao: "Sustentabilidade, mudanças climáticas, recursos naturais" },
    { key: "legal", label: "Legal", icon: "⚖️", descricao: "Leis trabalhistas, proteção ao consumidor, propriedade intelectual" },
  ];

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
                <p className="text-sm text-slate-600">Análise PESTEL</p>
              </div>
            </div>
          </div>
        </div>

        {/* Introdução */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              O que é Análise PESTEL?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-900 mb-3">
              PESTEL é um acrônimo que representa os fatores externos que podem impactar sua empresa. Analise cada fator para identificar oportunidades e ameaças do ambiente externo.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-blue-800">
              <div>• <strong>P</strong>olítico: Governo e políticas</div>
              <div>• <strong>E</strong>conômico: Economia e finanças</div>
              <div>• <strong>S</strong>ocial: Sociedade e cultura</div>
              <div>• <strong>T</strong>ecnológico: Tecnologia e inovação</div>
              <div>• <strong>A</strong>mbiental: Meio ambiente e sustentabilidade</div>
              <div>• <strong>L</strong>egal: Leis e regulamentações</div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Análise */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fatores.map((fator) => (
            <Card key={fator.key}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{fator.icon}</span>
                  {fator.label}
                </CardTitle>
                <CardDescription className="text-xs">{fator.descricao}</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder={`Descreva os fatores ${fator.label.toLowerCase()} que afetam a empresa...`}
                  value={formData[fator.key as keyof typeof formData] || ""}
                  onChange={(e) => setFormData({ ...formData, [fator.key]: e.target.value })}
                  className="min-h-24"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Observações Gerais */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Observações Gerais</CardTitle>
            <CardDescription>Adicione observações sobre a análise PESTEL</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Observações sobre o ambiente externo e impactos potenciais..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="min-h-32"
            />
            <div className="flex gap-2 mt-4">
              <Button variant="outline">Cancelar</Button>
              <Button className="bg-orange-600 hover:bg-orange-700">Salvar Análise</Button>
            </div>
          </CardContent>
        </Card>

        {/* Matriz de Impacto */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Matriz de Impacto PESTEL</CardTitle>
            <CardDescription>Avalie o impacto de cada fator na empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left font-semibold">Fator</th>
                    <th className="border p-3 text-center font-semibold">Impacto Atual</th>
                    <th className="border p-3 text-center font-semibold">Tendência</th>
                    <th className="border p-3 text-center font-semibold">Ação Necessária</th>
                  </tr>
                </thead>
                <tbody>
                  {fatores.map((fator) => (
                    <tr key={fator.key} className="hover:bg-gray-50">
                      <td className="border p-3 font-medium">{fator.label}</td>
                      <td className="border p-3 text-center">
                        <select className="border rounded px-2 py-1 text-sm">
                          <option>Baixo</option>
                          <option>Médio</option>
                          <option>Alto</option>
                        </select>
                      </td>
                      <td className="border p-3 text-center">
                        <select className="border rounded px-2 py-1 text-sm">
                          <option>Estável</option>
                          <option>Melhorando</option>
                          <option>Piorando</option>
                        </select>
                      </td>
                      <td className="border p-3 text-center">
                        <input type="checkbox" className="w-4 h-4" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
