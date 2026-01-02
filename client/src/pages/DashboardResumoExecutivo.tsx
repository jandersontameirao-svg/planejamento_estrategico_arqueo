import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Building2, BarChart3, Zap, Users, Target, TrendingUp, AlertCircle, Lightbulb, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { useCompletudeStorage } from "@/hooks/useLocalStorage";
import { useLocation } from "wouter";

interface AnaliseResumo {
  id: string;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  cor: string;
  prioridade: "alta" | "media" | "baixa";
}

const analises: AnaliseResumo[] = [
  {
    id: "identidade",
    titulo: "Identidade Organizacional",
    descricao: "Missão, Visão, Valores",
    icone: <Building2 className="h-6 w-6" />,
    cor: "bg-orange-500",
    prioridade: "alta",
  },
  {
    id: "pestel",
    titulo: "PESTEL",
    descricao: "Análise Ambiental",
    icone: <Zap className="h-6 w-6" />,
    cor: "bg-orange-500",
    prioridade: "alta",
  },
  {
    id: "forcas",
    titulo: "5 Forças",
    descricao: "Porter",
    icone: <TrendingUp className="h-6 w-6" />,
    cor: "bg-blue-500",
    prioridade: "alta",
  },
  {
    id: "stakeholders",
    titulo: "Stakeholders",
    descricao: "Poder x Interesse",
    icone: <Users className="h-6 w-6" />,
    cor: "bg-purple-500",
    prioridade: "media",
  },
  {
    id: "vrio",
    titulo: "RBV/VRIO",
    descricao: "Recursos e Capacidades",
    icone: <Target className="h-6 w-6" />,
    cor: "bg-blue-500",
    prioridade: "media",
  },
  {
    id: "swot",
    titulo: "SWOT/TOWS",
    descricao: "Forças e Oportunidades",
    icone: <AlertCircle className="h-6 w-6" />,
    cor: "bg-green-500",
    prioridade: "media",
  },
  {
    id: "okr",
    titulo: "OKR",
    descricao: "Objetivos e Resultados",
    icone: <Lightbulb className="h-6 w-6" />,
    cor: "bg-cyan-500",
    prioridade: "media",
  },
  {
    id: "bsc",
    titulo: "BSC",
    descricao: "Balanced Scorecard",
    icone: <BarChart3 className="h-6 w-6" />,
    cor: "bg-blue-600",
    prioridade: "baixa",
  },
];

export default function DashboardResumoExecutivo() {
  const { completude } = useCompletudeStorage();
  const [, navigate] = useLocation();

  const completudeTotal = Math.round(
    Object.values(completude).reduce((a, b) => a + b, 0) / Object.values(completude).length
  );

  const analisesConcluidas = Object.values(completude).filter((c) => c === 100).length;
  const analisesPendentes = Object.values(completude).filter((c) => c === 0).length;

  const recomendacoes = [
    {
      titulo: "Iniciar Análises Prioritárias",
      descricao: "Comece pelas análises de alta prioridade (Identidade, PESTEL, 5 Forças)",
      icone: <AlertCircle className="h-5 w-5" />,
      acao: "Ir para Planejamento",
    },
    {
      titulo: "Consolidar Dados Coletados",
      descricao: "Reúna informações internas e externas para preencher as análises",
      icone: <Clock className="h-5 w-5" />,
      acao: "Próximo Passo",
    },
    {
      titulo: "Alinhar com Stakeholders",
      descricao: "Valide as análises com líderes e stakeholders-chave do grupo",
      icone: <Users className="h-5 w-5" />,
      acao: "Próximo Passo",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-gray-900">Resumo Executivo - Planejamento Estratégico</h1>
          <p className="text-gray-600 mt-2">Visão consolidada do progresso do planejamento estratégico do Grupo Arqueo</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600">{completudeTotal}%</div>
                <p className="text-sm text-gray-600 mt-2">Completude Total</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">{analisesConcluidas}</div>
                <p className="text-sm text-gray-600 mt-2">Análises Concluídas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600">{Object.values(completude).filter((c) => c > 0 && c < 100).length}</div>
                <p className="text-sm text-gray-600 mt-2">Em Progresso</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600">{analisesPendentes}</div>
                <p className="text-sm text-gray-600 mt-2">Não Iniciadas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progresso por Análise */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progresso por Análise</CardTitle>
            <CardDescription>Completude de cada análise estratégica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analises.map((analise) => (
                <div key={analise.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${analise.cor} p-2 rounded-lg text-white`}>{analise.icone}</div>
                      <div>
                        <p className="font-semibold text-gray-900">{analise.titulo}</p>
                        <p className="text-sm text-gray-600">{analise.descricao}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{(completude as any)[analise.id] || 0}%</p>
                      {(completude as any)[analise.id] === 100 && (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-1" />
                      )}
                    </div>
                  </div>
                  <Progress value={(completude as any)[analise.id] || 0} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recomendações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {recomendacoes.map((rec, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="text-blue-600">{rec.icone}</div>
                  <CardTitle className="text-lg">{rec.titulo}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{rec.descricao}</p>
                <Button size="sm" variant="outline" className="w-full">
                  {rec.acao}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Próximos Passos */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Passos Recomendados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-blue-600 flex-shrink-0">1</div>
                <div>
                  <p className="font-semibold text-gray-900">Completar Análises de Alta Prioridade</p>
                  <p className="text-sm text-gray-600">Identidade Organizacional, PESTEL e 5 Forças são fundamentais para o planejamento</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-green-600 flex-shrink-0">2</div>
                <div>
                  <p className="font-semibold text-gray-900">Validar com Stakeholders</p>
                  <p className="text-sm text-gray-600">Apresente as análises aos líderes do grupo para alinhamento e feedback</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-purple-600 flex-shrink-0">3</div>
                <div>
                  <p className="font-semibold text-gray-900">Gerar Relatório Consolidado</p>
                  <p className="text-sm text-gray-600">Exporte todas as análises em PDF para apresentação executiva</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Ação */}
        <div className="mt-8 text-center">
          <Button
            size="lg"
            onClick={() => navigate("/planejamento-estrategico")}
            className="gap-2"
          >
            Ir para Planejamento Estratégico
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </main>
    </div>
  );
}
