import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useState } from "react";
import IdentidadeOrganizacionalLite from "./IdentidadeOrganizacionalLite";
import BscLite from "./BscLite";
import AnalisePestelLite from "./AnalisePestelLite";
import StakeholdersLite from "./StakeholdersLite";
import SwotLite from "./SwotLite";
import OkrLite from "./OkrLite";

export default function PlanejamentoMacro() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const analises = [
    {
      id: "identidade",
      titulo: "Identidade do Grupo",
      descricao: "Missão, Visão, Valores e Propósito do Grupo Arqueo",
      cor: "bg-orange-500",
      progresso: 0,
      Component: IdentidadeOrganizacionalLite,
    },
    {
      id: "bsc",
      titulo: "Balanced Scorecard",
      descricao: "Indicadores estratégicos do grupo nas 4 perspectivas",
      cor: "bg-blue-500",
      progresso: 0,
      Component: BscLite,
    },
    {
      id: "pestel",
      titulo: "Análise PESTEL",
      descricao: "Fatores externos que impactam o grupo",
      cor: "bg-orange-500",
      progresso: 0,
      Component: AnalisePestelLite,
    },
    {
      id: "stakeholders",
      titulo: "Stakeholders",
      descricao: "Mapeamento de partes interessadas do grupo",
      cor: "bg-purple-500",
      progresso: 0,
      Component: StakeholdersLite,
    },
    {
      id: "swot",
      titulo: "SWOT/TOWS",
      descricao: "Forças, Fraquezas, Oportunidades e Ameaças",
      cor: "bg-green-500",
      progresso: 0,
      Component: SwotLite,
    },
    {
      id: "okr",
      titulo: "OKR",
      descricao: "Objetivos e Resultados-Chave do grupo",
      cor: "bg-cyan-500",
      progresso: 0,
      Component: OkrLite,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <PageHeader 
        title="Planejamento Macro - Grupo Arqueo"
        description="Planejamento estratégico consolidado do grupo"
      />
      <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Planejamento Estratégico - Grupo Arqueo</h1>
        <p className="text-muted-foreground">
          Defina a estratégia macro do grupo que orienta todas as empresas
        </p>
      </div>

      {/* Cards de Análises */}
      <div className="grid gap-4">
        {analises.map((analise) => {
          const isExpanded = expandedCard === analise.id;
          const Icon = isExpanded ? ChevronUp : ChevronDown;

          return (
            <Card key={analise.id} className="overflow-hidden">
              {/* Header do Card */}
              <button
                onClick={() => toggleCard(analise.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${analise.cor} flex items-center justify-center text-white`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">{analise.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{analise.descricao}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold">{analise.progresso}%</div>
                    <div className="text-xs text-muted-foreground">Completo</div>
                  </div>
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>

              {/* Conteúdo Expandido */}
              {isExpanded && (
                <div className="border-t p-6 bg-accent/20">
                  <analise.Component empresaId={0} />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Botão de Gerar Relatório */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Relatório Consolidado</h3>
            <p className="text-sm text-muted-foreground">
              Gere um PDF com todas as análises estratégicas do grupo
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <FileText className="w-5 h-5" />
            Gerar Relatório em PDF
          </Button>
        </div>
      </Card>
      </div>
    </div>
  );
}
