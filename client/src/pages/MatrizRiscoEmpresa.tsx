import { useParams, useLocation } from "wouter";
import { ArrowLeft, Building2, Target, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { MatrizRiscoInterativa } from "@/components/MatrizRiscoInterativa";

export default function MatrizRiscoEmpresa() {
  const params = useParams();
  const empresaId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();

  // Buscar dados da empresa
  const { data: empresas } = trpc.empresas.list.useQuery();
  const empresa = empresas?.find((e) => e.id === empresaId);

  // Buscar objetivos e projetos da empresa
  const { data: objetivos = [] } = trpc.objetivosGrupo.listByEmpresa.useQuery({ empresaId });
  const { data: projetos = [] } = trpc.projetosGrupo.listByEmpresa.useQuery({ empresaId });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {empresa?.nome || "Empresa"}
                </h1>
                <p className="text-sm text-slate-600">Matriz de Risco</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation(`/empresa/${empresaId}/identidade`)}
            >
              Identidade
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation(`/empresa/${empresaId}/objetivos`)}
            >
              Objetivos
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation(`/empresa/${empresaId}/projetos`)}
            >
              Projetos
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation(`/empresa/${empresaId}/kpis`)}
            >
              KPIs
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation(`/empresa/${empresaId}/plano-acao`)}
            >
              Plano de Ação
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Objetivos Estratégicos
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{objetivos.length}</div>
              <p className="text-xs text-muted-foreground">
                Total de objetivos cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Projetos e Iniciativas
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projetos.length}</div>
              <p className="text-xs text-muted-foreground">
                Total de projetos cadastrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Framework de Metodologia */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Framework de Metodologia - Matriz de Risco
            </CardTitle>
            <CardDescription>
              Guia de utilização e interpretação da matriz de risco
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">O que é a Matriz de Risco?</h4>
                <p className="text-sm text-blue-800">
                  A Matriz de Risco é uma ferramenta de gestão que avalia objetivos e projetos conforme seu impacto potencial e probabilidade de ocorrência. Ela permite priorizar ações de mitigação de riscos e oportunidades.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Como Utilizar?</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li><strong>Impacto:</strong> Avalia o efeito potencial (Baixo, Médio, Alto)</li>
                  <li><strong>Probabilidade:</strong> Estima a chance de ocorrência (Baixa, Média, Alta)</li>
                  <li><strong>Posicionamento:</strong> Objetivos/Projetos aparecem na matriz conforme sua combinação</li>
                  <li><strong>Priorização:</strong> Itens no canto superior direito (alto impacto + alta probabilidade) requerem ação imediata</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Metodologia Aplicada</h4>
                <p className="text-sm text-blue-800">
                  <strong>Matriz de Risco Padrão (3x3):</strong> Combinação de 3 níveis de impacto x 3 níveis de probabilidade, resultando em 9 quadrantes. Recomendado para avaliação rápida e eficiente de riscos estratégicos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matriz de Risco */}
        <Card>
          <CardHeader>
            <CardTitle>Matriz de Risco - {empresa?.nome}</CardTitle>
            <CardDescription>
              Visualização de objetivos e projetos por impacto e probabilidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            {objetivos.length === 0 && projetos.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-lg font-medium mb-2">
                  Nenhum objetivo ou projeto cadastrado
                </p>
                <p className="text-sm">
                  Adicione objetivos e projetos no Planejamento Macro para visualizar a matriz de risco
                </p>
              </div>
            ) : (
              <MatrizRiscoInterativa objetivos={objetivos} projetos={projetos} />
            )}
          </CardContent>
        </Card>

        {/* Seção de Observações */}
        {(objetivos.length > 0 || projetos.length > 0) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Observações e Guia de Ação</CardTitle>
              <CardDescription>
                Recomendações para interpretação e ação conforme a posição na matriz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quadrante Alto Impacto + Alta Probabilidade */}
                <div className="border-l-4 border-red-600 pl-4 py-2">
                  <h4 className="font-semibold text-red-600 mb-2">Crítico (Alto/Alto)</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Requer ação imediata. Desenvolva planos de mitigação e contingencia.
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>✓ Revisar semanalmente</li>
                    <li>✓ Designar responsável</li>
                    <li>✓ Criar plano de ação</li>
                  </ul>
                </div>

                {/* Quadrante Médio */}
                <div className="border-l-4 border-yellow-600 pl-4 py-2">
                  <h4 className="font-semibold text-yellow-600 mb-2">Médio (Médio)</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Requer monitoramento regular. Implemente controles preventivos.
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>✓ Revisar mensalmente</li>
                    <li>✓ Monitorar indicadores</li>
                    <li>✓ Preparar resposta</li>
                  </ul>
                </div>

                {/* Quadrante Baixo Impacto + Baixa Probabilidade */}
                <div className="border-l-4 border-green-600 pl-4 py-2">
                  <h4 className="font-semibold text-green-600 mb-2">Baixo (Baixo/Baixo)</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Risco aceitável. Monitore periodicamente.
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>✓ Revisar trimestralmente</li>
                    <li>✓ Manter documentação</li>
                    <li>✓ Aceitar risco</li>
                  </ul>
                </div>
              </div>

              {/* Observações Adicionais */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Dicas de Interpretação</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li><strong>• Tendência:</strong> Observe se os itens estão se movendo para cima/direita (piora) ou para baixo/esquerda (melhora)</li>
                  <li><strong>• Agrupamento:</strong> Itens agrupados indicam riscos correlacionados que podem ter causas comuns</li>
                  <li><strong>• Lacunas:</strong> Áreas vazias indicam que não há objetivos/projetos com essa combinação de risco</li>
                  <li><strong>• Mudanças:</strong> Monitore mudanças de posição entre períodos para identificar tendências</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
