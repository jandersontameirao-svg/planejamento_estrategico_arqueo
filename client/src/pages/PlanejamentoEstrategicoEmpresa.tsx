import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, BarChart3, Zap, Users, Target, TrendingUp, AlertCircle, Lightbulb, ChevronDown, ChevronUp, FileDown, Settings, DollarSign, SlidersHorizontal, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Link, useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SeletorMetodologias from "@/components/SeletorMetodologias";
import IdentidadeOrganizacionalLite from "./IdentidadeOrganizacionalLite";
import AnalisePestelLite from "./AnalisePestelLite";
import CincoForcasLite from "./CincoForcasLite";
import StakeholdersLite from "./StakeholdersLite";
import VrioLite from "./VrioLite";
import SwotLite from "./SwotLite";
import OkrLite from "./OkrLite";
import BscLite from "./BscLite";

interface PlanejamentoEstrategicoEmpresaProps {
  empresaId: number;
  empresaNome: string;
}

interface AnaliseCard {
  id: string;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  cor: string;
  componente?: React.ComponentType<any>;
  href?: boolean;
}

const analises: AnaliseCard[] = [
  {
    id: "identidade",
    titulo: "Identidade Organizacional",
    descricao: "Missão, Visão, Valores",
    icone: <Building2 className="h-8 w-8" />,
    cor: "bg-orange-500",
    componente: IdentidadeOrganizacionalLite,
  },
  {
    id: "bsc",
    titulo: "BSC",
    descricao: "Balanced Scorecard",
    icone: <BarChart3 className="h-8 w-8" />,
    cor: "bg-blue-600",
    componente: BscLite,
  },
  {
    id: "pestel",
    titulo: "PESTEL",
    descricao: "Análise Ambiental",
    icone: <Zap className="h-8 w-8" />,
    cor: "bg-orange-600",
    componente: AnalisePestelLite,
  },
  {
    id: "5forcas",
    titulo: "5 Forças",
    descricao: "Porter",
    icone: <TrendingUp className="h-8 w-8" />,
    cor: "bg-blue-500",
    componente: CincoForcasLite,
  },
  {
    id: "stakeholders",
    titulo: "Stakeholders",
    descricao: "Poder x Interesse",
    icone: <Users className="h-8 w-8" />,
    cor: "bg-purple-500",
    componente: StakeholdersLite,
  },
  {
    id: "vrio",
    titulo: "RBV/VRIO",
    descricao: "Recursos e Capacidades",
    icone: <Target className="h-8 w-8" />,
    cor: "bg-blue-600",
    componente: VrioLite,
  },
  {
    id: "swot",
    titulo: "SWOT/TOWS",
    descricao: "Forças e Oportunidades",
    icone: <AlertCircle className="h-8 w-8" />,
    cor: "bg-green-600",
    componente: SwotLite,
  },
  {
    id: "okr",
    titulo: "OKR",
    descricao: "Objetivos e Resultados",
    icone: <Lightbulb className="h-8 w-8" />,
    cor: "bg-cyan-500",
    componente: OkrLite,
  },
  {
    id: "orcamento",
    titulo: "Gestão Orçamentária",
    descricao: "Planejado vs Executado",
    icone: <DollarSign className="h-8 w-8" />,
    cor: "bg-emerald-600",
    href: true,
  },
];

export default function PlanejamentoEstrategicoEmpresa({ empresaId, empresaNome }: PlanejamentoEstrategicoEmpresaProps) {
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});
  const [dialogMetodologias, setDialogMetodologias] = useState(false);

  // Buscar metodologias ativas para filtrar cards
  const { data: metodologiasAtivas, refetch: refetchMetodologias } = trpc.metodologias.getByEmpresa.useQuery(
    { empresaId },
    { staleTime: 30_000 }
  );

  // Filtrar cards com base nas metodologias ativas (se não há config, mostra todos)
  const analisesFiltradas = metodologiasAtivas && metodologiasAtivas.length > 0
    ? analises.filter((a) => metodologiasAtivas.includes(a.id))
    : analises;

  // Buscar dados para calcular progresso
  const [, navigate] = useLocation();
  const { data: pestelData } = trpc.analises.getPestel.useQuery({ empresaId });
  const { data: swotData } = trpc.analises.getSwot.useQuery({ empresaId });
  const { data: okrData } = trpc.analises.getOkr.useQuery({ empresaId });
  const { data: bscData } = trpc.bsc.getByEmpresa.useQuery({ empresaId });

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Calcular progresso de cada análise
  const calcularProgresso = (id: string): number => {
    switch (id) {
      case "pestel":
        if (!pestelData || !Array.isArray(pestelData)) return 0;
        // Mínimo 6 fatores (1 por categoria)
        return Math.min(100, Math.round((pestelData.length / 6) * 100));
      
      case "swot":
        if (!swotData || !Array.isArray(swotData)) return 0;
        // Mínimo 8 itens (2 por quadrante)
        return Math.min(100, Math.round((swotData.length / 8) * 100));
      
      case "okr":
        if (!okrData || !Array.isArray(okrData)) return 0;
        // Mínimo 3 objetivos
        return Math.min(100, Math.round((okrData.length / 3) * 100));
      
      case "bsc":
        if (!bscData || !Array.isArray(bscData)) return 0;
        // Mínimo 8 indicadores (2 por perspectiva)
        return Math.min(100, Math.round((bscData.length / 8) * 100));
      
      case "identidade":
      case "5forcas":
      case "stakeholders":
      case "vrio":
        // Análises sem persistência ainda
        return 0;
      
      default:
        return 0;
    }
  };

  const getCorProgresso = (progresso: number): string => {
    if (progresso === 0) return "bg-gray-400";
    if (progresso < 50) return "bg-red-500";
    if (progresso < 100) return "bg-yellow-500";
    return "bg-green-500";
  };

  const renderComponente = (id: string) => {
    const analise = analises.find((a) => a.id === id);
    if (!analise?.componente) return null;
    const Componente = analise.componente;
    return <Componente empresaId={empresaId} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <PageHeader 
        title={`Planejamento Estratégico - ${empresaNome}`}
        description="Defina e acompanhe as análises estratégicas da empresa"
      />
      <div className="container mx-auto pt-4 flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/empresa/${empresaId}/configurar-template`}>
            <Settings className="mr-2 h-4 w-4" />
            Configurar Template de Relatórios
          </Link>
        </Button>
        {/* Botão para configurar metodologias */}
        <Dialog open={dialogMetodologias} onOpenChange={setDialogMetodologias}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="border-orange-300 text-orange-600 hover:bg-orange-50">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Configurar Metodologias
              {metodologiasAtivas && (
                <span className="ml-2 bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
                  {metodologiasAtivas.length}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl w-[92vw] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <SlidersHorizontal className="w-5 h-5 text-orange-500" />
                Configurar Metodologias — {empresaNome}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <SeletorMetodologias
                empresaId={empresaId}
                compact={false}
                onSalvo={() => {
                  setDialogMetodologias(false);
                  refetchMetodologias();
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="container mx-auto py-8 space-y-6">
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            👇 Clique em cada card para expandir e visualizar/editar a análise. Os dados são salvos automaticamente.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analisesFiltradas.map((analise) => {
          const isExpanded = expandedCards[analise.id];
          const progresso = calcularProgresso(analise.id);
          const corProgresso = getCorProgresso(progresso);
          return (
            <Card
              key={analise.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${isExpanded ? "col-span-full" : ""}`}
            >
              <CardHeader onClick={() => analise.href ? navigate(`/empresa/${empresaId}/orcamento`) : toggleCard(analise.id)} className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className={`${analise.cor} text-white p-3 rounded-lg`}>
                    {analise.icone}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{analise.titulo}</CardTitle>
                      <Badge className={`${corProgresso} text-white text-xs`}>
                        {progresso}%
                      </Badge>
                    </div>
                    <CardDescription>{analise.descricao}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </Button>
              </CardHeader>
              {isExpanded && (
                <CardContent className="pt-4">
                  {renderComponente(analise.id)}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Dashboard Visual */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Dashboard Visual de Análises
              </h3>
              <p className="text-sm text-muted-foreground">
                Visualize gráficos e métricas consolidadas de todas as análises estratégicas
              </p>
            </div>
            <Link href={`/empresa/${empresaId}/dashboard-analises`}>
              <Button 
                size="lg" 
                className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <BarChart3 className="w-5 h-5" />
                Ver Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Relatório Consolidado</h3>
              <p className="text-sm text-muted-foreground">
                Gere um PDF com todas as análises estratégicas da empresa
              </p>
            </div>
            <Button size="lg" className="gap-2">
              <FileDown className="h-5 w-5" />
              Gerar PDF
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
