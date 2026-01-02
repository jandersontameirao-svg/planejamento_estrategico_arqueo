import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  BarChart3, 
  Layers, 
  Users, 
  Zap, 
  Target, 
  TrendingUp,
  Building2
} from "lucide-react";

interface AnalisesNavigationProps {
  activeTab: "identidade" | "bsc" | "pestel" | "forcas" | "stakeholders" | "rbv" | "swot" | "okr";
  onTabChange: (tab: "identidade" | "bsc" | "pestel" | "forcas" | "stakeholders" | "rbv" | "swot" | "okr") => void;
}

export function AnalisesNavigation({ activeTab, onTabChange }: AnalisesNavigationProps) {
  const analyses = [
    {
      id: "identidade" as const,
      title: "Identidade Organizacional",
      description: "Missão, Visão, Valores",
      icon: Building2,
      color: "bg-arqueo-laranja",
    },
    {
      id: "bsc" as const,
      title: "BSC",
      description: "Balanced Scorecard",
      icon: BarChart3,
      color: "bg-arqueo-azul",
    },
    {
      id: "pestel" as const,
      title: "PESTEL",
      description: "Análise Ambiental",
      icon: Layers,
      color: "bg-orange-500",
    },
    {
      id: "forcas" as const,
      title: "5 Forças",
      description: "Porter",
      icon: Zap,
      color: "bg-blue-500",
    },
    {
      id: "stakeholders" as const,
      title: "Stakeholders",
      description: "Poder x Interesse",
      icon: Users,
      color: "bg-purple-500",
    },
    {
      id: "rbv" as const,
      title: "RBV/VRIO",
      description: "Recursos e Capacidades",
      icon: Target,
      color: "bg-indigo-500",
    },
    {
      id: "swot" as const,
      title: "SWOT/TOWS",
      description: "Forças e Oportunidades",
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      id: "okr" as const,
      title: "OKR",
      description: "Objetivos e Resultados",
      icon: Target,
      color: "bg-cyan-500",
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyses.map((analysis) => {
          const Icon = analysis.icon;
          const isActive = activeTab === analysis.id;

          return (
            <Button
              key={analysis.id}
              variant="ghost"
              className="h-auto p-0"
              onClick={() => onTabChange(analysis.id)}
            >
              <Card
                className={`w-full h-full p-4 cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "ring-2 ring-offset-2 ring-arqueo-laranja shadow-lg scale-105"
                    : "hover:shadow-md hover:scale-102"
                }`}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className={`${analysis.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">
                      {analysis.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analysis.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="mt-2 h-1 w-8 bg-arqueo-laranja rounded-full" />
                  )}
                </div>
              </Card>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
