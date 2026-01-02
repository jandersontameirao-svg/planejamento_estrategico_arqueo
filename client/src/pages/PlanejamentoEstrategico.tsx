import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, BarChart3, Zap, Users, Target, TrendingUp, AlertCircle, Lightbulb, ChevronDown, ChevronUp, FileDown } from "lucide-react";
import { useCompletudeStorage } from "@/hooks/useLocalStorage";
import { useSalvamentoMultiplo } from "@/hooks/useSalvamento";
import { SalvandoInline } from "@/components/SalvandoIndicador";
import IdentidadeOrganizacionalLite from "./IdentidadeOrganizacionalLite";
import AnalisePestelLite from "./AnalisePestelLite";
import CincoForcasLite from "./CincoForcasLite";
import StakeholdersLite from "./StakeholdersLite";
import VrioLite from "./VrioLite";
import SwotLite from "./SwotLite";
import OkrLite from "./OkrLite";
import BscLite from "./BscLite";
import html2pdf from "html2pdf.js";

interface AnaliseCard {
  id: string;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  cor: string;
  componente?: React.ComponentType<any>;
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
    componente: IdentidadeOrganizacionalLite,
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
  const { completude } = useCompletudeStorage();
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { statusPorAnalise, mensagensPorAnalise, iniciarSalvamento, marcarSalvo, marcarErro } =
    useSalvamentoMultiplo();

  // Simular salvamento ao expandir/colapsar
  useEffect(() => {
    const timer = setTimeout(() => {
      Object.keys(expanded).forEach((id) => {
        if (expanded[id] && statusPorAnalise[id] === "inativo") {
          iniciarSalvamento(id, "Carregando análise...");
          setTimeout(() => marcarSalvo(id, "Análise carregada"), 800);
        }
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [expanded, statusPorAnalise, iniciarSalvamento, marcarSalvo]);

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const exportarPDF = useCallback((analise: AnaliseCard) => {
    const element = contentRefs.current[analise.id];
    if (!element) {
      alert("Conteúdo não encontrado para exportação");
      return;
    }

    const opt: any = {
      margin: 10,
      filename: `${analise.titulo}-${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    html2pdf().set(opt).from(element).save();
  }, []);

  const renderConteudo = (analise: AnaliseCard) => {
    switch (analise.id) {
      case "identidade":
        return <IdentidadeOrganizacionalLite empresaId={empresaId} />;
      case "pestel":
        return <AnalisePestelLite />;
      case "forcas":
        return <CincoForcasLite />;
      case "stakeholders":
        return <StakeholdersLite />;
      case "vrio":
        return <VrioLite />;
      case "swot":
        return <SwotLite />;
      case "okr":
        return <OkrLite />;
      case "bsc":
        return <BscLite />;
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
          <p className="text-gray-600 mt-2">Clique em cada card para expandir e visualizar/editar a análise. Os dados são salvos automaticamente.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="space-y-4">
          {analises.map((analise) => (
            <div key={analise.id} className="w-full">
              {/* Card Header - Sempre Visível */}
              <Card
                className={`transition-all duration-300 border-2 ${
                  expanded[analise.id] ? "border-primary/50 shadow-lg" : "hover:border-primary/30"
                }`}
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
                          <div className="text-sm font-semibold text-gray-900">{(completude as any)[analise.id] || 0}%</div>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                              style={{ width: `${(completude as any)[analise.id] || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        {/* Status de Salvamento */}
                        {statusPorAnalise[analise.id] && (
                          <SalvandoInline
                            status={statusPorAnalise[analise.id]}
                            className="flex-shrink-0"
                          />
                        )}
                      </div>

                      {/* Botão de Exportar PDF */}
                      {expanded[analise.id] && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportarPDF(analise);
                          }}
                          title="Exportar como PDF"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                      )}

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
                    <div
                      ref={(el) => {
                        if (el) contentRefs.current[analise.id] = el;
                      }}
                      className="animate-in fade-in slide-in-from-top-2 duration-300"
                    >
                      {renderConteudo(analise)}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>

        {/* Botão de Exportação Consolidada */}
        <div className="mt-12 flex justify-center">
          <Button
            onClick={() => {
              const elemento = document.createElement("div");
              let conteudoHTML = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                  <h1 style="color: #333; text-align: center; border-bottom: 3px solid #f97316; padding-bottom: 10px;">
                    Relatório Consolidado de Planejamento Estratégico
                  </h1>
                  <p style="color: #666; text-align: center; margin-top: 10px;">
                    Gerado em: ${new Date().toLocaleString("pt-BR")}
                  </p>
                  <hr style="margin: 30px 0; border: none; border-top: 2px solid #ddd;">
              `;
              
              analises.forEach((analise, index) => {
                const content = contentRefs.current[analise.id]?.innerText || "Sem dados";
                conteudoHTML += `
                  <div style="page-break-inside: avoid; margin-bottom: 30px;">
                    <h2 style="color: #f97316; border-left: 4px solid #f97316; padding-left: 10px; margin-top: ${index > 0 ? '40px' : '0'};">
                      ${analise.titulo}
                    </h2>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
                      <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 12px; color: #333;">${content}</pre>
                    </div>
                  </div>
                `;
              });
              
              conteudoHTML += `
                  <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
                  <p style="color: #999; text-align: center; font-size: 12px; margin-top: 20px;">
                    Documento gerado automaticamente pelo Sistema de Gestão Estratégica
                  </p>
                </div>
              `;
              
              elemento.innerHTML = conteudoHTML;
              
              const opt: any = {
                margin: 10,
                filename: `relatorio-consolidado-${new Date().toISOString().split("T")[0]}.pdf`,
                image: { type: "jpeg" as const, quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
              };
              
              html2pdf().set(opt).from(elemento).save();
            }}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg"
          >
            <FileDown className="h-5 w-5" />
            Gerar Relatório Consolidado em PDF
          </Button>
        </div>
      </main>
    </div>
  );
}
