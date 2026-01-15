import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2, DollarSign, Users, Settings, GraduationCap, BarChart3, FileDown } from "lucide-react";
import { exportBscPDF } from "@/lib/pdfExport";
import CommentSection from "@/components/CommentSection";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { trpc } from "@/lib/trpc";

interface Indicador {
  id: string;
  nome: string;
  meta: number;
  atual: number;
}

interface Perspectiva {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  indicadores: Indicador[];
}

const icones: Record<string, any> = {
  financeira: DollarSign,
  cliente: Users,
  processos: Settings,
  aprendizado: GraduationCap,
};

const getIcon = (iconeName: string | undefined) => {
  return icones[iconeName || 'financeira'] || BarChart3;
};

const cores: Record<string, string> = {
  financeira: "#22c55e",
  cliente: "#3b82f6",
  processos: "#f97316",
  aprendizado: "#8b5cf6",
};

interface BscLiteProps {
  empresaId: number;
}

// Helper para converter config do banco para formato de exportação
function convertTemplateConfig(config: any) {
  if (!config) return undefined;
  return {
    corPrimaria: config.corPrimaria,
    corSecundaria: config.corSecundaria,
    rodapePersonalizado: config.rodapePersonalizado || undefined,
  };
}

export default function BscLite({ empresaId }: BscLiteProps) {
  const utils = trpc.useUtils();
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  
  // Buscar indicadores do banco
  const { data: indicadoresDb } = trpc.bsc.getByEmpresa.useQuery({ empresaId });
  const { data: templateConfig } = trpc.templates.getConfig.useQuery({ empresaId });
  const { data: empresa } = trpc.empresas.getById.useQuery({ id: empresaId });

  const [perspectivas, setPerspectivas] = useState<Perspectiva[]>([
    { id: "financeira", nome: "Financeira", icone: "financeira", cor: "#22c55e", indicadores: [] },
    { id: "cliente", nome: "Cliente", icone: "cliente", cor: "#3b82f6", indicadores: [] },
    { id: "processos", nome: "Processos Internos", icone: "processos", cor: "#f97316", indicadores: [] },
    { id: "aprendizado", nome: "Aprendizado e Crescimento", icone: "aprendizado", cor: "#8b5cf6", indicadores: [] },
  ]);
  
  // Mutation para salvar indicadores
  const salvarMutation = trpc.bsc.saveIndicadores.useMutation({
    onSuccess: () => {
      setAutoSaveStatus('saved');
      utils.bsc.getByEmpresa.invalidate({ empresaId });
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    },
    onError: (error) => {
      setAutoSaveStatus('error');
      console.error('Erro ao salvar BSC:', error.message);
    },
  });

  // Função de auto-save com debounce
  const autoSave = useCallback(() => {
    if (isInitialLoadRef.current) return;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setAutoSaveStatus('saving');
      const indicadoresParaSalvar = perspectivas.flatMap(p =>
        p.indicadores.map(ind => ({
          perspectiva: p.id as "financeira" | "cliente" | "processos" | "aprendizado",
          nome: ind.nome,
          meta: ind.meta,
          valorAtual: ind.atual,
        }))
      );
      salvarMutation.mutate({ empresaId, indicadores: indicadoresParaSalvar });
    }, 2000);
  }, [perspectivas, empresaId, salvarMutation]);

  // Trigger auto-save quando perspectivas mudam
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    autoSave();
  }, [perspectivas]);
  
  // Carregar dados do banco quando disponíveis
  useEffect(() => {
    if (indicadoresDb && indicadoresDb.length > 0) {
      const novasPerspectivas = perspectivas.map(p => ({
        ...p,
        indicadores: indicadoresDb
          .filter(ind => ind.perspectiva === p.id)
          .map(ind => ({
            id: ind.id.toString(),
            nome: ind.nome,
            meta: Number(ind.meta),
            atual: Number(ind.valorAtual || 0),
          })),
      }));
      setPerspectivas(novasPerspectivas);
    }
  }, [indicadoresDb]);

  const [novoIndicador, setNovoIndicador] = useState({ perspectivaId: "", nome: "", meta: 100 });
  const [mostrarFormNovaPerspectiva, setMostrarFormNovaPerspectiva] = useState(false);
  const [novaPerspectiva, setNovaPerspectiva] = useState({ nome: "", cor: "#6366f1", icone: "custom" });

  const adicionarNovaPerspectiva = () => {
    if (!novaPerspectiva.nome) return;
    const novaPersp: Perspectiva = {
      id: `custom-${Date.now()}`,
      nome: novaPerspectiva.nome,
      icone: novaPerspectiva.icone,
      cor: novaPerspectiva.cor,
      indicadores: [],
    };
    setPerspectivas([...perspectivas, novaPersp]);
    setNovaPerspectiva({ nome: "", cor: "#6366f1", icone: "custom" });
    setMostrarFormNovaPerspectiva(false);
  };

  const removerPerspectiva = (perspectivaId: string) => {
    if (perspectivas.length <= 4) {
      alert("Você deve manter pelo menos as 4 perspectivas padrão!");
      return;
    }
    setPerspectivas(perspectivas.filter(p => p.id !== perspectivaId));
  };

  const calcularDesempenho = (indicadores: Indicador[]) => {
    if (indicadores.length === 0) return 0;
    const total = indicadores.reduce((acc, ind) => acc + (ind.atual / ind.meta) * 100, 0);
    return Math.round(total / indicadores.length);
  };

  const adicionarIndicador = (perspectivaId: string) => {
    // Verificar se há nome preenchido para esta perspectiva
    if (novoIndicador.perspectivaId !== perspectivaId || !novoIndicador.nome) return;
    
    setPerspectivas(perspectivas.map((p) => {
      if (p.id === perspectivaId) {
        return {
          ...p,
          indicadores: [...p.indicadores, {
            id: Date.now().toString(),
            nome: novoIndicador.nome,
            meta: novoIndicador.meta,
            atual: 0,
          }],
        };
      }
      return p;
    }));
    // Resetar apenas o indicador da perspectiva que foi adicionado
    setNovoIndicador({ perspectivaId: "", nome: "", meta: 100 });
  };

  const removerIndicador = (perspectivaId: string, indicadorId: string) => {
    setPerspectivas(perspectivas.map((p) => {
      if (p.id === perspectivaId) {
        return { ...p, indicadores: p.indicadores.filter((i) => i.id !== indicadorId) };
      }
      return p;
    }));
  };

  const atualizarIndicador = (perspectivaId: string, indicadorId: string, atual: number) => {
    setPerspectivas(perspectivas.map((p) => {
      if (p.id === perspectivaId) {
        return {
          ...p,
          indicadores: p.indicadores.map((i) => (i.id === indicadorId ? { ...i, atual } : i)),
        };
      }
      return p;
    }));
  };

  const dadosRadar = perspectivas.map((p) => ({
    perspectiva: p.nome.split(" ")[0],
    desempenho: calcularDesempenho(p.indicadores),
  }));

  const dadosBarras = perspectivas.map((p) => ({
    nome: p.nome.split(" ")[0],
    desempenho: calcularDesempenho(p.indicadores),
    cor: p.cor,
  }));

  const desempenhoGeral = Math.round(
    perspectivas.reduce((acc, p) => acc + calcularDesempenho(p.indicadores), 0) / perspectivas.length
  );

  const handleSave = () => {
    // Preparar dados para salvar
    const indicadores = perspectivas.flatMap(p => 
      p.indicadores.map(ind => ({
        perspectiva: p.id as "financeira" | "cliente" | "processos" | "aprendizado",
        nome: ind.nome,
        meta: ind.meta,
        valorAtual: ind.atual,
      }))
    );
    
    salvarMutation.mutate({ empresaId, indicadores });
  };

  const getCorDesempenho = (desempenho: number) => {
    if (desempenho >= 70) return "bg-green-500";
    if (desempenho >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            Balanced Scorecard (BSC)
          </CardTitle>
          <CardDescription>4 Perspectivas de Desempenho Estratégico</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {perspectivas.map((p) => {
              const Icon = getIcon(p.icone);
              const desempenho = calcularDesempenho(p.indicadores);
              return (
                <div key={p.id} className="p-3 rounded-lg text-center" style={{ backgroundColor: `${p.cor}20` }}>
                  <Icon className="h-5 w-5 mx-auto mb-1" style={{ color: p.cor }} />
                  <div className="text-xl font-bold" style={{ color: p.cor }}>{desempenho}%</div>
                  <div className="text-xs" style={{ color: p.cor }}>{p.nome.split(" ")[0]}</div>
                </div>
              );
            })}
            <div className="p-3 rounded-lg text-center bg-gray-100">
              <BarChart3 className="h-5 w-5 mx-auto mb-1 text-gray-700" />
              <div className="text-xl font-bold text-gray-700">{desempenhoGeral}%</div>
              <div className="text-xs text-gray-600">Geral</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      {perspectivas.some((p) => p.indicadores.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Radar de Desempenho</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={dadosRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="perspectiva" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Desempenho" dataKey="desempenho" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparativo por Perspectiva</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dadosBarras}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="desempenho">
                    {dadosBarras.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Perspectivas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {perspectivas.map((p) => {
          const Icon = getIcon(p.icone);
          const desempenho = calcularDesempenho(p.indicadores);
          return (
            <Card key={p.id} className="border-l-4" style={{ borderLeftColor: p.cor }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" style={{ color: p.cor }} />
                    {p.nome}
                  </div>
                  <Badge className={getCorDesempenho(desempenho)}>{desempenho}%</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {p.indicadores.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-2">Nenhum indicador definido</p>
                ) : (
                  p.indicadores.map((ind) => {
                    const indDesempenho = Math.round((ind.atual / ind.meta) * 100);
                    return (
                      <div key={ind.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{ind.nome}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{ind.atual}/{ind.meta}</span>
                            <button onClick={() => removerIndicador(p.id, ind.id)} className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <Slider
                          value={[ind.atual]}
                          onValueChange={(val) => atualizarIndicador(p.id, ind.id, val[0])}
                          min={0}
                          max={ind.meta}
                          step={1}
                        />
                      </div>
                    );
                  })
                )}

                {/* Adicionar Indicador */}
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={novoIndicador.perspectivaId === p.id ? novoIndicador.nome : ""}
                      onChange={(e) => setNovoIndicador({ ...novoIndicador, perspectivaId: p.id, nome: e.target.value })}
                      placeholder="Novo indicador..."
                      className="flex-1 border rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="number"
                      value={novoIndicador.perspectivaId === p.id ? novoIndicador.meta : 100}
                      onChange={(e) => setNovoIndicador({ ...novoIndicador, perspectivaId: p.id, meta: parseInt(e.target.value) || 100 })}
                      placeholder="Meta"
                      className="w-20 border rounded px-2 py-1 text-sm"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => adicionarIndicador(p.id)}
                      disabled={!novoIndicador.nome || novoIndicador.perspectivaId !== p.id}
                      style={{ backgroundColor: p.cor }}
                      className="hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Adicionar Nova Perspectiva */}
      <div className="border-t pt-4">
        {!mostrarFormNovaPerspectiva ? (
          <Button 
            onClick={() => setMostrarFormNovaPerspectiva(true)}
            variant="outline"
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Nova Perspectiva
          </Button>
        ) : (
          <Card className="bg-gray-50">
            <CardContent className="pt-6 space-y-3">
              <div>
                <label className="text-sm font-medium">Nome da Perspectiva</label>
                <input
                  type="text"
                  value={novaPerspectiva.nome}
                  onChange={(e) => setNovaPerspectiva({ ...novaPerspectiva, nome: e.target.value })}
                  placeholder="Ex: Inovação, Sustentabilidade..."
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cor</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={novaPerspectiva.cor}
                    onChange={(e) => setNovaPerspectiva({ ...novaPerspectiva, cor: e.target.value })}
                    className="w-12 h-10 border rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 self-center">{novaPerspectiva.cor}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={adicionarNovaPerspectiva}
                  className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={!novaPerspectiva.nome}
                >
                  <Plus className="h-4 w-4" />
                  Criar Perspectiva
                </Button>
                <Button 
                  onClick={() => setMostrarFormNovaPerspectiva(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Indicador de Auto-Save */}
      {autoSaveStatus !== 'idle' && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
          autoSaveStatus === 'saving' ? 'bg-yellow-100 text-yellow-700' :
          autoSaveStatus === 'saved' ? 'bg-green-100 text-green-700' :
          'bg-red-100 text-red-700'
        }`}>
          {autoSaveStatus === 'saving' && '⏳ Salvando automaticamente...'}
          {autoSaveStatus === 'saved' && '✓ Salvo automaticamente!'}
          {autoSaveStatus === 'error' && '✗ Erro ao salvar'}
        </div>
      )}

      {/* Salvar e Exportar */}
      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Save className="h-4 w-4" />
          Salvar Balanced Scorecard
        </Button>
        <Button 
          onClick={() => {
            const todosIndicadores = perspectivas.flatMap(p => 
              p.indicadores.map(i => ({
                nome: i.nome,
                perspectiva: p.id,
                meta: i.meta,
                realizado: i.atual,
                unidade: "%",
              }))
            );
            exportBscPDF(
              { nome: empresa?.nome || "Empresa", logo: templateConfig?.logoUrl || undefined },
              todosIndicadores,
              convertTemplateConfig(templateConfig)
            );
          }}
          variant="outline"
          className="gap-2"
        >
          <FileDown className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Comentários */}
      <CommentSection empresaId={empresaId} tipoAnalise="bsc" />
    </div>
  );
}
