import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, BarChart3, Zap, Users, Target, TrendingUp, AlertCircle, Lightbulb, X } from "lucide-react";
import { useLocation } from "wouter";
import IdentidadeOrganizacional from "./IdentidadeOrganizacional";
import AnalisesVRIO from "./AnalisesVRIO";

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
  const [, setLocation] = useLocation();
  const [selectedAnalise, setSelectedAnalise] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const analiseAtual = analises.find((a) => a.id === selectedAnalise);

  const handleCardClick = (id: string) => {
    setSelectedAnalise(id);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedAnalise(null);
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

                    {/* Indicador de seleção */}
                    <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>

      {/* Modal para Análises */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`${analiseAtual?.cor} p-2 rounded-lg text-white`}>
                {analiseAtual?.icone}
              </div>
              <div>
                <DialogTitle>{analiseAtual?.titulo}</DialogTitle>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {/* Conteúdo da Análise */}
          <div className="mt-6">
            {analiseAtual?.id === "identidade" && (
              <IdentidadeOrganizacional empresaId={empresaId} />
            )}
            {analiseAtual?.id === "vrio" && <AnalisesVRIO />}
            {!analiseAtual?.componente && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  Análise <strong>{analiseAtual?.titulo}</strong> em desenvolvimento
                </p>
                <p className="text-gray-500 mt-2">Esta funcionalidade será disponibilizada em breve</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
