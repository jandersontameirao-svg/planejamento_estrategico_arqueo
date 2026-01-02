import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, BarChart3, Zap, Users, Target, TrendingUp, AlertCircle, Lightbulb, X } from "lucide-react";
import { useLocation } from "wouter";
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
    componente: AnalisesVRIO,
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
  const [isOpen, setIsOpen] = useState(false);
  const [analiseAtualId, setAnaliseAtualId] = useState<string | null>(null);
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

  const atualizarCompletude = useCallback((analiseId: string, novoPercentual: number) => {
    setCompletude((prev) => ({
      ...prev,
      [analiseId]: Math.min(100, Math.max(0, novoPercentual)),
    }));
  }, []);

  const analiseAtual = analises.find((a) => a.id === analiseAtualId);

  const handleCardClick = (id: string) => {
    setAnaliseAtualId(id);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setAnaliseAtualId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-gray-900">Planejamento Estratégico</h1>
          <p className="text-gray-600 mt-2">Selecione uma análise para começar</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analises.map((analise) => (
            <div
              key={analise.id}
              onClick={() => handleCardClick(analise.id)}
              className="cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <Card className="h-full hover:shadow-lg border-2 hover:border-primary/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Ícone */}
                    <div className={`${analise.cor} p-4 rounded-lg text-white`}>
                      {analise.icone}
                    </div>

                    {/* Título e Descrição */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{analise.titulo}</h3>
                      <p className="text-sm text-gray-600 mt-1">{analise.descricao}</p>
                    </div>

                    {/* Indicador de Completude */}
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-gray-700">Completude</span>
                        <span className="text-xs font-bold text-gray-900">{completude[analise.id] || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                          style={{ width: `${completude[analise.id] || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>

      {/* Modal para Análises */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header fixo */}
          <div className="flex flex-row items-center justify-between border-b pb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className={`${analiseAtual?.cor} p-2 rounded-lg text-white`}>
                {analiseAtual?.icone}
              </div>
              <div>
                <DialogTitle className="text-2xl">{analiseAtual?.titulo}</DialogTitle>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Conteúdo da Análise - scrollable */}
          <div className="overflow-y-auto flex-1 pr-4">
            {analiseAtual?.id === "identidade" && (
              <IdentidadeOrganizacional empresaId={empresaId} />
            )}
            {analiseAtual?.id === "pestel" && <AnalisePestelCompleta empresaId={empresaId} />}
            {analiseAtual?.id === "forcas" && <CincoForcasCompleta empresaId={empresaId} />}
            {analiseAtual?.id === "stakeholders" && <AnalisesStakeholdersCompleta />}
            {analiseAtual?.id === "vrio" && <AnalisesVRIO />}
            {analiseAtual?.id === "swot" && <AnaliseSwoTtowsCompleta />}
            {analiseAtual?.id === "okr" && <AnaliseOkrCompleta />}
            {analiseAtual?.id === "bsc" && <AnaliseBscCompleta />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
