import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Zap, BarChart3, TrendingUp, Users, Target, AlertCircle,
  Lightbulb, DollarSign, Building2, CheckCircle2, Circle, Loader2
} from "lucide-react";

const ICONES: Record<string, React.ReactNode> = {
  identidade: <Building2 className="w-5 h-5" />,
  pestel: <Zap className="w-5 h-5" />,
  "5forcas": <TrendingUp className="w-5 h-5" />,
  stakeholders: <Users className="w-5 h-5" />,
  vrio: <Target className="w-5 h-5" />,
  swot: <AlertCircle className="w-5 h-5" />,
  bsc: <BarChart3 className="w-5 h-5" />,
  okr: <Lightbulb className="w-5 h-5" />,
  orcamento: <DollarSign className="w-5 h-5" />,
};

const CORES: Record<string, string> = {
  identidade: "bg-orange-500",
  pestel: "bg-orange-600",
  "5forcas": "bg-blue-500",
  stakeholders: "bg-purple-500",
  vrio: "bg-blue-600",
  swot: "bg-green-600",
  bsc: "bg-blue-700",
  okr: "bg-cyan-500",
  orcamento: "bg-emerald-600",
};

const CATEGORIAS_ORDEM = [
  "Fundamentos",
  "Ambiente Externo",
  "Ambiente Interno",
  "Síntese Estratégica",
  "Execução Estratégica",
  "Financeiro",
];

interface SeletorMetodologiasProps {
  empresaId: number;
  /** Callback chamado após salvar com sucesso */
  onSalvo?: (metodologias: string[]) => void;
  /** Modo compacto para uso em dialogs */
  compact?: boolean;
}

export default function SeletorMetodologias({ empresaId, onSalvo, compact = false }: SeletorMetodologiasProps) {
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [inicializado, setInicializado] = useState(false);

  const { data: todasMetodologias, isLoading: carregandoLista } = trpc.metodologias.listar.useQuery();

  const { data: ativasData, isLoading: carregandoAtivas } = trpc.metodologias.getByEmpresa.useQuery(
    { empresaId }
  );

  // Inicializar seleção com metodologias ativas da empresa
  if (ativasData && !inicializado) {
    setSelecionadas(ativasData);
    setInicializado(true);
  }

  const salvarMutation = trpc.metodologias.salvar.useMutation({
    onSuccess: () => {
      toast.success("Metodologias salvas com sucesso!");
      onSalvo?.(selecionadas);
    },
    onError: (err) => {
      toast.error("Erro ao salvar: " + err.message);
    },
  });

  const toggleMetodologia = (id: string) => {
    // Identidade organizacional é obrigatória
    if (id === "identidade") return;
    setSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSalvar = () => {
    salvarMutation.mutate({ empresaId, metodologias: selecionadas });
  };

  const selecionarTodas = () => {
    setSelecionadas(todasMetodologias?.map((m) => m.id) ?? []);
  };

  const desmarcarTodas = () => {
    setSelecionadas(["identidade"]); // mantém obrigatória
  };

  if (carregandoLista || carregandoAtivas) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Agrupar por categoria
  const porCategoria = CATEGORIAS_ORDEM.reduce<Record<string, typeof todasMetodologias>>((acc, cat) => {
    const itens = todasMetodologias?.filter((m) => m.categoria === cat) ?? [];
    if (itens.length > 0) acc[cat] = itens;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm text-muted-foreground">
            Selecione as ferramentas estratégicas que serão utilizadas nesta empresa.
            <span className="font-medium text-orange-600"> Identidade Organizacional</span> é obrigatória.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selecionarTodas}>
            Selecionar todas
          </Button>
          <Button variant="outline" size="sm" onClick={desmarcarTodas}>
            Desmarcar todas
          </Button>
        </div>
      </div>

      {/* Grupos por categoria */}
      {Object.entries(porCategoria).map(([categoria, itens]) => (
        <div key={categoria}>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            {categoria}
          </h4>
          <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
            {itens?.map((metodologia) => {
              const ativa = selecionadas.includes(metodologia.id);
              const obrigatoria = metodologia.id === "identidade";
              return (
                <Card
                  key={metodologia.id}
                  onClick={() => toggleMetodologia(metodologia.id)}
                  className={`cursor-pointer transition-all duration-200 border-2 ${
                    ativa
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20 shadow-md"
                      : "border-border hover:border-orange-300 hover:shadow-sm"
                  } ${obrigatoria ? "opacity-90" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Ícone colorido */}
                      <div className={`${CORES[metodologia.id] ?? "bg-gray-500"} text-white rounded-lg p-2 flex-shrink-0`}>
                        {ICONES[metodologia.id] ?? <Target className="w-5 h-5" />}
                      </div>
                      {/* Texto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{metodologia.titulo}</span>
                          {obrigatoria && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              Obrigatória
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {metodologia.descricao}
                        </p>
                      </div>
                      {/* Checkbox visual */}
                      <div className="flex-shrink-0 mt-0.5">
                        {ativa ? (
                          <CheckCircle2 className="w-5 h-5 text-orange-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground/40" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Resumo e botão salvar */}
      <div className="flex items-center justify-between pt-2 border-t">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{selecionadas.length}</span> de{" "}
          {todasMetodologias?.length ?? 0} ferramentas selecionadas
        </p>
        <Button
          onClick={handleSalvar}
          disabled={salvarMutation.isPending || selecionadas.length === 0}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {salvarMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
          ) : (
            "Salvar Configuração"
          )}
        </Button>
      </div>
    </div>
  );
}
