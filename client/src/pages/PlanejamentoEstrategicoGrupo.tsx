import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, BarChart3, Zap, Users, Target, TrendingUp, AlertCircle, Lightbulb, ChevronDown, ChevronUp, FileDown, Settings } from "lucide-react";
import PageHeaderWithBack from "@/components/PageHeaderWithBack";
import { Link } from "wouter";
import IdentidadeOrganizacionalLite from "./IdentidadeOrganizacionalLite";
import AnalisePestelLite from "./AnalisePestelLite";
import CincoForcasLite from "./CincoForcasLite";
import StakeholdersLite from "./StakeholdersLite";
import VrioLite from "./VrioLite";
import SwotLite from "./SwotLite";
import OkrLite from "./OkrLite";
import BscLite from "./BscLite";

interface AnaliseCard {
  id: string;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  cor: string;
  componente?: React.ComponentType<any>;
}

const analises: AnaliseCard[] = [
  {
    id: "identidade",
    titulo: "Identidade Organizacional",
    descricao: "Missão, Visão, Valores",
    icone: <Building2 className="h-5 w-5" />,
    cor: "bg-orange-500",
    componente: IdentidadeOrganizacionalLite,
  },
  {
    id: "bsc",
    titulo: "BSC",
    descricao: "Balanced Scorecard",
    icone: <BarChart3 className="h-5 w-5" />,
    cor: "bg-blue-600",
    componente: BscLite,
  },
  {
    id: "pestel",
    titulo: "PESTEL",
    descricao: "Análise Ambiental",
    icone: <Zap className="h-5 w-5" />,
    cor: "bg-orange-600",
    componente: AnalisePestelLite,
  },
  {
    id: "5forcas",
    titulo: "5 Forças",
    descricao: "Porter",
    icone: <TrendingUp className="h-5 w-5" />,
    cor: "bg-blue-500",
    componente: CincoForcasLite,
  },
  {
    id: "stakeholders",
    titulo: "Stakeholders",
    descricao: "Poder x Interesse",
    icone: <Users className="h-5 w-5" />,
    cor: "bg-purple-500",
    componente: StakeholdersLite,
  },
  {
    id: "vrio",
    titulo: "RBV/VRIO",
    descricao: "Recursos e Capacidades",
    icone: <Target className="h-5 w-5" />,
    cor: "bg-blue-600",
    componente: VrioLite,
  },
  {
    id: "swot",
    titulo: "SWOT/TOWS",
    descricao: "Forças e Oportunidades",
    icone: <AlertCircle className="h-5 w-5" />,
    cor: "bg-green-600",
    componente: SwotLite,
  },
  {
    id: "okr",
    titulo: "OKR",
    descricao: "Objetivos e Resultados",
    icone: <Lightbulb className="h-5 w-5" />,
    cor: "bg-cyan-500",
    componente: OkrLite,
  },
];

export default function PlanejamentoEstrategicoGrupo() {
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});
  
  // Usar empresaId = 0 para representar o Grupo Arqueo
  const GRUPO_ARQUEO_ID = 0;
  
  // Queries para progresso das análises
  const { data: pestelData } = trpc.analises.getPestel.useQuery({ empresaId: GRUPO_ARQUEO_ID });
  const { data: swotData } = trpc.analises.getSwot.useQuery({ empresaId: GRUPO_ARQUEO_ID });
  const { data: okrData } = trpc.analises.getOkr.useQuery({ empresaId: GRUPO_ARQUEO_ID });
  const { data: bscData } = trpc.bsc.getByEmpresa.useQuery({ empresaId: GRUPO_ARQUEO_ID });

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const calcularProgresso = (analiseId: string): number => {
    switch (analiseId) {
      case "pestel":
        if (!pestelData || pestelData.length === 0) return 0;
        return pestelData.length >= 6 ? 100 : Math.round((pestelData.length / 6) * 100);
      case "swot":
        if (!swotData || swotData.length === 0) return 0;
        return swotData.length >= 8 ? 100 : Math.round((swotData.length / 8) * 100);
      case "okr":
        if (!okrData || okrData.length === 0) return 0;
        return okrData.length >= 3 ? 100 : Math.round((okrData.length / 3) * 100);
      case "bsc":
        if (!bscData || bscData.length === 0) return 0;
        return bscData.length >= 8 ? 100 : Math.round((bscData.length / 8) * 100);
      case "identidade":
        return 100; // Assumir completo por padrão
      default:
        return 0;
    }
  };

  const getProgressoBadge = (progresso: number) => {
    if (progresso === 0) return <Badge variant="secondary" className="text-xs px-1.5 py-0.5">0%</Badge>;
    if (progresso < 50) return <Badge variant="destructive" className="text-xs px-1.5 py-0.5">{progresso}%</Badge>;
    if (progresso < 100) return <Badge className="text-xs px-1.5 py-0.5 bg-yellow-500">{progresso}%</Badge>;
    return <Badge className="text-xs px-1.5 py-0.5 bg-green-600">100%</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <PageHeaderWithBack
        title="Planejamento Estratégico - Grupo Arqueo"
        description="Defina e acompanhe as análises estratégicas do Grupo"
        backUrl="/"
      />

      <div className="max-w-7xl mx-auto mt-6 space-y-4">
        {/* Botões de ação */}
        <div className="flex gap-4 mb-6">
          <Link href="/configurar-template">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurar Template de Relatórios
            </Button>
          </Link>
        </div>

        {/* Aviso informativo */}
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <p className="text-sm text-orange-800">
              👉 Clique em cada card para expandir e visualizar/editar a análise. Os dados são salvos automaticamente.
            </p>
          </CardContent>
        </Card>

        {/* Cards de análises em grade 4x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analises.map((analise) => {
            const progresso = calcularProgresso(analise.id);
            const isExpanded = expandedCards[analise.id];

            return (
              <Card
                key={analise.id}
                className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border-2"
                onClick={() => toggleCard(analise.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${analise.cor} text-white`}>
                      <div className="w-6 h-6 flex items-center justify-center">
                        {analise.icone}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <CardTitle className="text-sm font-semibold">{analise.titulo}</CardTitle>
                      {getProgressoBadge(progresso)}
                    </div>
                    <CardDescription className="text-xs leading-tight">{analise.descricao}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Cards expandidos (renderizados abaixo da grade) */}
        {analises.map((analise) => {
          const isExpanded = expandedCards[analise.id];
          const Componente = analise.componente;

          if (!isExpanded || !Componente) return null;

          return (
            <Card key={`expanded-${analise.id}`} className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${analise.cor} text-white`}>
                      {analise.icone}
                    </div>
                    <CardTitle>{analise.titulo}</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toggleCard(analise.id)}>
                    <ChevronUp className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Componente empresaId={GRUPO_ARQUEO_ID} />
              </CardContent>
            </Card>
          );
        })}

        {/* Dashboard Visual */}
        <Card className="bg-blue-50 border-blue-200 mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Dashboard Visual de Análises
                </CardTitle>
                <CardDescription>
                  Visualize gráficos e métricas consolidadas de todas as análises estratégicas
                </CardDescription>
              </div>
              <Link href="/dashboard-analises-grupo">
                <Button className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Ver Dashboard
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {/* Relatório Consolidado */}
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Relatório Consolidado</CardTitle>
                <CardDescription>
                  Gere um PDF com todas as análises estratégicas do Grupo
                </CardDescription>
              </div>
              <Button className="gap-2" variant="outline">
                <FileDown className="h-4 w-4" />
                Gerar PDF
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
