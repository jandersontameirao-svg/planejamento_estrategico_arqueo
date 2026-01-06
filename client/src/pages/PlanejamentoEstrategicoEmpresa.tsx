import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, BarChart3, Zap, Users, Target, TrendingUp, AlertCircle, Lightbulb, ChevronDown, ChevronUp, FileDown } from "lucide-react";
import PageHeader from "@/components/PageHeader";
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
];

export default function PlanejamentoEstrategicoEmpresa({ empresaId, empresaNome }: PlanejamentoEstrategicoEmpresaProps) {
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
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
      <div className="container mx-auto py-8 space-y-6">
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            👇 Clique em cada card para expandir e visualizar/editar a análise. Os dados são salvos automaticamente.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analises.map((analise) => {
          const isExpanded = expandedCards[analise.id];
          return (
            <Card
              key={analise.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${isExpanded ? "col-span-full" : ""}`}
            >
              <CardHeader onClick={() => toggleCard(analise.id)} className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className={`${analise.cor} text-white p-3 rounded-lg`}>
                    {analise.icone}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{analise.titulo}</CardTitle>
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
