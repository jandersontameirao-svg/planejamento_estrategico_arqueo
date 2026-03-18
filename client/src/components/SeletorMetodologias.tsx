import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Zap, BarChart3, TrendingUp, Users, Target, AlertCircle,
  Lightbulb, DollarSign, Building2, CheckCircle2, Circle, Loader2,
  Shield, Layers
} from "lucide-react";

const ICONES: Record<string, React.ReactNode> = {
  identidade: <Building2 className="w-6 h-6" />,
  pestel: <Zap className="w-6 h-6" />,
  "5forcas": <TrendingUp className="w-6 h-6" />,
  stakeholders: <Users className="w-6 h-6" />,
  vrio: <Shield className="w-6 h-6" />,
  swot: <Layers className="w-6 h-6" />,
  bsc: <BarChart3 className="w-6 h-6" />,
  okr: <Lightbulb className="w-6 h-6" />,
  orcamento: <DollarSign className="w-6 h-6" />,
};

const CORES: Record<string, { bg: string; light: string; border: string }> = {
  identidade: { bg: "bg-orange-500", light: "bg-orange-50", border: "border-orange-200" },
  pestel:     { bg: "bg-red-500",    light: "bg-red-50",    border: "border-red-200" },
  "5forcas":  { bg: "bg-blue-500",   light: "bg-blue-50",   border: "border-blue-200" },
  stakeholders:{ bg: "bg-purple-500",light: "bg-purple-50", border: "border-purple-200" },
  vrio:       { bg: "bg-indigo-600", light: "bg-indigo-50", border: "border-indigo-200" },
  swot:       { bg: "bg-green-600",  light: "bg-green-50",  border: "border-green-200" },
  bsc:        { bg: "bg-blue-700",   light: "bg-blue-50",   border: "border-blue-200" },
  okr:        { bg: "bg-cyan-500",   light: "bg-cyan-50",   border: "border-cyan-200" },
  orcamento:  { bg: "bg-emerald-600",light: "bg-emerald-50",border: "border-emerald-200" },
};

const CATEGORIAS_ORDEM = [
  "Fundamentos",
  "Ambiente Externo",
  "Ambiente Interno",
  "Síntese Estratégica",
  "Execução Estratégica",
  "Financeiro",
];

const CATEGORIA_CORES: Record<string, string> = {
  "Fundamentos":           "text-orange-700 bg-orange-100 border-orange-200",
  "Ambiente Externo":      "text-blue-700 bg-blue-100 border-blue-200",
  "Ambiente Interno":      "text-indigo-700 bg-indigo-100 border-indigo-200",
  "Síntese Estratégica":   "text-green-700 bg-green-100 border-green-200",
  "Execução Estratégica":  "text-cyan-700 bg-cyan-100 border-cyan-200",
  "Financeiro":            "text-emerald-700 bg-emerald-100 border-emerald-200",
};

interface SeletorMetodologiasProps {
  empresaId: number;
  onSalvo?: (metodologias: string[]) => void;
  compact?: boolean;
}

export default function SeletorMetodologias({ empresaId, onSalvo }: SeletorMetodologiasProps) {
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [inicializado, setInicializado] = useState(false);

  const { data: todasMetodologias, isLoading: carregandoLista } = trpc.metodologias.listar.useQuery();

  const { data: ativasData, isLoading: carregandoAtivas } = trpc.metodologias.getByEmpresa.useQuery(
    { empresaId }
  );

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
    setSelecionadas(["identidade"]);
  };

  if (carregandoLista || carregandoAtivas) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="text-sm text-muted-foreground">Carregando metodologias...</p>
      </div>
    );
  }

  const porCategoria = CATEGORIAS_ORDEM.reduce<Record<string, typeof todasMetodologias>>((acc, cat) => {
    const itens = todasMetodologias?.filter((m) => m.categoria === cat) ?? [];
    if (itens.length > 0) acc[cat] = itens;
    return acc;
  }, {});

  const total = todasMetodologias?.length ?? 0;

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho com ações */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b mb-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Selecione as ferramentas estratégicas para esta empresa.{" "}
          <span className="font-semibold text-orange-600">Identidade Organizacional</span> é obrigatória.
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={selecionarTodas} className="text-xs">
            ✓ Selecionar todas
          </Button>
          <Button variant="outline" size="sm" onClick={desmarcarTodas} className="text-xs">
            ✗ Desmarcar todas
          </Button>
        </div>
      </div>

      {/* Lista de categorias e metodologias */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1">
        {Object.entries(porCategoria).map(([categoria, itens]) => (
          <div key={categoria}>
            {/* Label da categoria */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${CATEGORIA_CORES[categoria] ?? "text-gray-600 bg-gray-100 border-gray-200"}`}>
                {categoria}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Grid de cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {itens?.map((metodologia) => {
                const ativa = selecionadas.includes(metodologia.id);
                const obrigatoria = metodologia.id === "identidade";
                const cores = CORES[metodologia.id] ?? { bg: "bg-gray-500", light: "bg-gray-50", border: "border-gray-200" };

                return (
                  <button
                    key={metodologia.id}
                    type="button"
                    onClick={() => toggleMetodologia(metodologia.id)}
                    className={`
                      w-full text-left rounded-xl border-2 p-4 transition-all duration-200 group
                      flex items-center gap-4
                      ${ativa
                        ? `border-orange-500 bg-orange-50 shadow-md shadow-orange-100`
                        : `border-border bg-card hover:border-orange-300 hover:shadow-sm hover:bg-orange-50/30`
                      }
                      ${obrigatoria ? "cursor-default" : "cursor-pointer"}
                    `}
                  >
                    {/* Ícone */}
                    <div className={`
                      ${cores.bg} text-white rounded-xl p-3 flex-shrink-0
                      flex items-center justify-center
                      shadow-sm
                    `}>
                      {ICONES[metodologia.id] ?? <Target className="w-6 h-6" />}
                    </div>

                    {/* Texto */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground">
                          {metodologia.titulo}
                        </span>
                        {obrigatoria && (
                          <Badge className="text-[10px] px-2 py-0 bg-orange-100 text-orange-700 border-orange-300 border font-semibold">
                            Obrigatória
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {metodologia.descricao}
                      </p>
                    </div>

                    {/* Indicador de seleção */}
                    <div className="flex-shrink-0">
                      {ativa ? (
                        <CheckCircle2 className="w-6 h-6 text-orange-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground/30 group-hover:text-orange-300 transition-colors" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé com contador e botão salvar */}
      <div className="flex items-center justify-between pt-4 border-t mt-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-sm font-semibold text-foreground">{selecionadas.length}</span>
            <span className="text-sm text-muted-foreground">de {total} ferramentas selecionadas</span>
          </div>
          {/* Barra de progresso */}
          <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${total > 0 ? (selecionadas.length / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        <Button
          onClick={handleSalvar}
          disabled={salvarMutation.isPending || selecionadas.length === 0}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6"
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
