import { useParams, useLocation, Link } from "wouter";
import { ArrowLeft, Building2, Target, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { MatrizRisco } from "@/components/MatrizRisco";

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
              <MatrizRisco objetivos={objetivos} projetos={projetos} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
