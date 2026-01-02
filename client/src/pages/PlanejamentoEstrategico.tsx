import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, BarChart3, Zap, Users, Target, TrendingUp, AlertCircle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import IdentidadeOrganizacional from "./IdentidadeOrganizacional";
import AnalisesVRIO from "./AnalisesVRIO";
import AnalisePestelCompleta from "./AnalisePestelCompleta";
import CincoForcasCompleta from "./CincoForcasCompleta";
import { AnalisesStakeholdersCompleta, AnaliseSwoTtowsCompleta, AnaliseOkrCompleta, AnaliseBscCompleta } from "./AnalisesRestantes";

interface AnaliseCard {
  id: string;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  cor: string;
  componente?: React.ComponentType<any>;
}

interface CompletudeState {
  [key: string]: number; // 0-100
}

interface ExpandedState {
  [key: string]: boolean;
}

const analises: AnaliseCard[] = [
  {
    id: "identidade",
    titulo: "Identidade Organizacional",
    descricao: "Missão, Visão, Valores",
    icone: <Building2 className="h-8 w-8" />,
    cor: "bg-orange-500",
    componente: IdentidadeOrganizacional,
  },
  {
    id: "bsc",
    titulo: "BSC",
    descricao: "Balanced Scorecard",
    icone: <BarChart3 className="h-8 w-8" />,
    cor: "bg-blue-600",
  },
  {
    id: "pestel",
    titulo: "PESTEL",
    descricao: "Análise Ambiental",
    icone: <Zap className="h-8 w-8" />,
    cor: "bg-orange-500",
  },
  {
    id: "forcas",
    titulo: "5 Forças",
    descricao: "Porter",
    icone: <TrendingUp className="h-8 w-8" />,
    cor: "bg-blue-500",
  },
  {
    id: "stakeholders",
    titulo: "Stakeholders",
    descricao: "Poder x Interesse",
    icone: <Users className="h-8 w-8" />,
    cor: "bg-purple-500",
  },
  {
    id: "vrio",
    titulo: "RBV/VRIO",
    descricao: "Recursos e Capacidades",
    icone: <Target className="h-8 w-8" />,
    cor: "bg-blue-500",
  },
  {
    id: "swot",
    titulo: "SWOT/TOWS",
    descricao: "Forças e Oportunidades",
    icone: <AlertCircle className="h-8 w-8" />,
    cor: "bg-green-500",
  },
  {
    id: "okr",
    titulo: "OKR",
    descricao: "Objetivos e Resultados",
    icone: <Lightbulb className="h-8 w-8" />,
    cor: "bg-cyan-500",
  },
];

interface PlanejamentoEstrategicoProps {
  empresaId?: number;
}

export default function PlanejamentoEstrategico({ empresaId = 1 }: PlanejamentoEstrategicoProps) {
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [completude, setCompletude] = useState<CompletudeState>({
    identidade: 100,
    bsc: 0,
    pestel: 0,
    forcas: 0,
    stakeholders: 0,
    vrio: 0,
    swot: 0,
    okr: 0,
  });

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const atualizarCompletude = useCallback((analiseId: string, novoPercentual: number) => {
    setCompletude((prev) => ({
      ...prev,
      [analiseId]: Math.min(100, Math.max(0, novoPercentual)),
    }));
  }, []);

  const renderConteudo = (analise: AnaliseCard) => {
    switch (analise.id) {
      case "identidade":
        return <IdentidadeOrganizacional empresaId={empresaId} />;
      case "pestel":
        return <AnalisePestelCompleta empresaId={empresaId} />;
      case "forcas":
        return <CincoForcasCompleta empresaId={empresaId} />;
      case "stakeholders":
        return <AnalisesStakeholdersCompleta />;
      case "vrio":
        return <AnalisesVRIO />;
      case "swot":
        return <AnaliseSwoTtowsCompleta />;
      case "okr":
        return <AnaliseOkrCompleta />;
      case "bsc":
        return <AnaliseBscCompleta />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-gray-900">Planejamento Estratégico</h1>
          <p className="text-gray-600 mt-2">Clique em cada card para expandir e visualizar/editar a análise</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="space-y-4">
          {analises.map((analise) => (
            <div key={analise.id} className="w-full">
              {/* Card Header - Sempre Visível */}
              <Card
                className={`cursor-pointer transition-all duration-300 border-2 ${
                  expanded[analise.id] ? "border-primary/50 shadow-lg" : "hover:border-primary/30"
                }`}
                onClick={() => toggleExpanded(analise.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Ícone */}
                      <div className={`${analise.cor} p-3 rounded-lg text-white flex-shrink-0`}>
                        {analise.icone}
                      </div>

                      {/* Título e Descrição */}
                      <div className="flex-1">
                        <CardTitle className="text-xl">{analise.titulo}</CardTitle>
                        <CardDescription>{analise.descricao}</CardDescription>
                      </div>

                      {/* Indicador de Completude */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">{completude[analise.id] || 0}%</div>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                              style={{ width: `${completude[analise.id] || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Botão de Expandir */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(analise.id);
                        }}
                      >
                        {expanded[analise.id] ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Card Content - Expansível */}
              {expanded[analise.id] && (
                <Card className="mt-2 border-2 border-primary/30 rounded-t-none">
                  <CardContent className="pt-6">
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      {renderConteudo(analise)}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
