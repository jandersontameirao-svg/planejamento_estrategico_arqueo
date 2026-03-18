import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, BarChart3, Zap, Users, Target, TrendingUp, AlertCircle, Lightbulb, ChevronDown, ChevronUp, FileDown, Settings, Link2, Plus, X, SlidersHorizontal, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import PageHeaderWithBack from "@/components/PageHeaderWithBack";
import { Link, useRoute } from "wouter";
import IdentidadeOrganizacionalLite from "./IdentidadeOrganizacionalLite";
import AnalisePestelLite from "./AnalisePestelLite";
import CincoForcasLite from "./CincoForcasLite";
import StakeholdersLite from "./StakeholdersLite";
import VrioLite from "./VrioLite";
import SwotLite from "./SwotLite";
import OkrLite from "./OkrLite";
import BscLite from "./BscLite";
import SeletorMetodologias from "@/components/SeletorMetodologias";
import GestaoOrcamentaria from "./GestaoOrcamentaria";

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
  {
    id: "orcamento",
    titulo: "Gestão Orçamentária",
    descricao: "Orçamento e Execução",
    icone: <DollarSign className="h-5 w-5" />,
    cor: "bg-emerald-600",
    componente: GestaoOrcamentaria,
  },
];

export default function PlanejamentoEstrategicoArea() {
  const [, params] = useRoute("/area/:id/planejamento");
  const areaId = params?.id ? Number(params.id) : 1;
  
  // Usar empresaId negativo para áreas de negócio: -100 - areaId
  // Isso diferencia de empresas (>0), Grupo Arqueo (0) e Participações (-1)
  const AREA_EMPRESA_ID = -100 - areaId;
  
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});
  
  // Query para obter dados da área
  const { data: area, isLoading: loadingArea } = trpc.areasNegocio.getById.useQuery({ id: areaId });
  
  // Queries para progresso das análises
  const { data: pestelData } = trpc.analises.getPestel.useQuery({ empresaId: AREA_EMPRESA_ID });
  const { data: swotData } = trpc.analises.getSwot.useQuery({ empresaId: AREA_EMPRESA_ID });
  const { data: okrData } = trpc.analises.getOkr.useQuery({ empresaId: AREA_EMPRESA_ID });
  const { data: bscData } = trpc.bsc.getByEmpresa.useQuery({ empresaId: AREA_EMPRESA_ID });

  const [showVincularModal, setShowVincularModal] = useState(false);
  const [dialogMetodologias, setDialogMetodologias] = useState(false);

  // Metodologias ativas para esta área
  const { data: metodologiasAtivas, refetch: refetchMetodologias } = trpc.metodologias.getByEmpresa.useQuery(
    { empresaId: AREA_EMPRESA_ID }
  );

  const analisesFiltradas = metodologiasAtivas && metodologiasAtivas.length > 0
    ? analises.filter((a) => metodologiasAtivas.includes(a.id))
    : analises;
  
  // Queries para empresas vinculadas e disponíveis
  const { data: empresasVinculadas, refetch: refetchVinculadas } = trpc.areasNegocio.getEmpresasVinculadas.useQuery({ areaId });
  const { data: empresasDisponiveis, refetch: refetchDisponiveis } = trpc.areasNegocio.getEmpresasDisponiveis.useQuery({ areaId });
  
  // Mutations para vincular/desvincular
  const vincularMutation = trpc.areasNegocio.vincularEmpresaArea.useMutation({
    onSuccess: () => {
      toast.success("Empresa vinculada com sucesso!");
      refetchVinculadas();
      refetchDisponiveis();
    },
    onError: (error) => {
      toast.error(`Erro ao vincular empresa: ${error.message}`);
    },
  });
  
  const desvincularMutation = trpc.areasNegocio.desvincularEmpresaArea.useMutation({
    onSuccess: () => {
      toast.success("Empresa desvinculada com sucesso!");
      refetchVinculadas();
      refetchDisponiveis();
    },
    onError: (error) => {
      toast.error(`Erro ao desvincular empresa: ${error.message}`);
    },
  });

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };
  
  const handleVincular = (empresaId: number) => {
    vincularMutation.mutate({ empresaId, areaId });
  };
  
  const handleDesvincular = (empresaId: number) => {
    desvincularMutation.mutate({ empresaId, areaId });
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

  if (loadingArea) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando área de negócio...</p>
        </div>
      </div>
    );
  }

  const areaNome = area?.nome || `Área ${areaId}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 p-6">
      <PageHeaderWithBack
        title={`Planejamento Estratégico - ${areaNome}`}
        description={`Defina e acompanhe as análises estratégicas da ${areaNome}`}
        backUrl="/areas-negocio"
      />

      <div className="max-w-7xl mx-auto mt-6 space-y-4">
        {/* Botões de ação */}
        <div className="flex gap-4 mb-6">
          <Link href={`/area/${areaId}/configurar-template`}>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurar Template de Relatórios
            </Button>
          </Link>

          {/* Botão para configurar metodologias */}
          <Dialog open={dialogMetodologias} onOpenChange={setDialogMetodologias}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-purple-300 text-purple-600 hover:bg-purple-50 gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Configurar Metodologias
                {metodologiasAtivas && (
                  <span className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
                    {metodologiasAtivas.length}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-[92vw] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
              <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <SlidersHorizontal className="w-5 h-5 text-purple-500" />
                  Configurar Metodologias — {areaNome}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <SeletorMetodologias
                  empresaId={AREA_EMPRESA_ID}
                  onSalvo={() => {
                    setDialogMetodologias(false);
                    refetchMetodologias();
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showVincularModal} onOpenChange={setShowVincularModal}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                <Link2 className="h-4 w-4" />
                Vincular Empresas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Vincular Empresas à {areaNome}</DialogTitle>
                <DialogDescription>
                  Selecione empresas do repositório para vincular a esta área de negócio
                </DialogDescription>
              </DialogHeader>
              
              {/* Empresas já vinculadas */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-purple-700 mb-2">Empresas Vinculadas ({empresasVinculadas?.length || 0})</h4>
                  {empresasVinculadas && empresasVinculadas.length > 0 ? (
                    <div className="space-y-2">
                      {empresasVinculadas.map((empresa) => (
                        <div key={empresa.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="font-medium text-sm">{empresa.nome}</p>
                              <p className="text-xs text-muted-foreground capitalize">{empresa.tipoAtuacao?.replace("_", " ")}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDesvincular(empresa.id)}
                            disabled={desvincularMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Nenhuma empresa vinculada a esta área</p>
                  )}
                </div>
                
                {/* Empresas disponíveis */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Empresas Disponíveis ({empresasDisponiveis?.length || 0})</h4>
                  {empresasDisponiveis && empresasDisponiveis.length > 0 ? (
                    <div className="space-y-2">
                      {empresasDisponiveis.map((empresa) => (
                        <div key={empresa.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium text-sm">{empresa.nome}</p>
                              <p className="text-xs text-muted-foreground capitalize">{empresa.tipoAtuacao?.replace("_", " ")}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-purple-600 border-purple-300 hover:bg-purple-50"
                            onClick={() => handleVincular(empresa.id)}
                            disabled={vincularMutation.isPending}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Vincular
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Todas as empresas já estão vinculadas</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Empresas vinculadas - visão rápida */}
        {empresasVinculadas && empresasVinculadas.length > 0 && (
          <Card className="bg-white border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-600" />
                Empresas Vinculadas ({empresasVinculadas.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {empresasVinculadas.map((empresa) => (
                  <Badge key={empresa.id} variant="secondary" className="bg-purple-100 text-purple-700">
                    {empresa.nome}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aviso informativo */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <p className="text-sm text-purple-800">
              👉 Clique em cada card para expandir e visualizar/editar a análise. Os dados são salvos automaticamente.
            </p>
          </CardContent>
        </Card>

        {/* Grid de cards 4x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analisesFiltradas.map((analise) => {
            const progresso = calcularProgresso(analise.id);
            const isExpanded = expandedCards[analise.id];
            
            return (
              <Card 
                key={analise.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${isExpanded ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => toggleCard(analise.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${analise.cor} text-white`}>
                        {analise.icone}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          {analise.titulo}
                          {getProgressoBadge(progresso)}
                        </CardTitle>
                        <CardDescription className="text-xs">{analise.descricao}</CardDescription>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Conteúdo expandido */}
        {analisesFiltradas.map((analise) => {
          const isExpanded = expandedCards[analise.id];
          const Componente = analise.componente;
          
          if (!isExpanded || !Componente) return null;
          
          return (
            <Card key={`expanded-${analise.id}`} className="mt-4 border-2 border-purple-200">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${analise.cor} text-white`}>
                    {analise.icone}
                  </div>
                  <div>
                    <CardTitle>{analise.titulo}</CardTitle>
                    <CardDescription>{analise.descricao}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toggleCard(analise.id)}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Componente empresaId={AREA_EMPRESA_ID} />
              </CardContent>
            </Card>
          );
        })}

        {/* Dashboard e Relatório */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Dashboard Visual de Análises
                </CardTitle>
                <CardDescription>
                  Visualize gráficos e métricas consolidadas de todas as análises estratégicas da {areaNome}
                </CardDescription>
              </div>
              <Link href={`/area/${areaId}/dashboard`}>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Ver Dashboard
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Relatório Consolidado</CardTitle>
                <CardDescription>
                  Gere um PDF com todas as análises estratégicas da {areaNome}
                </CardDescription>
              </div>
              <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                <FileDown className="mr-2 h-4 w-4" />
                Gerar PDF
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
