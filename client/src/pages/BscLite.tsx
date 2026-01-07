import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2, DollarSign, Users, Settings, GraduationCap, BarChart3 } from "lucide-react";
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

const cores: Record<string, string> = {
  financeira: "#22c55e",
  cliente: "#3b82f6",
  processos: "#f97316",
  aprendizado: "#8b5cf6",
};

interface BscLiteProps {
  empresaId: number;
}

export default function BscLite({ empresaId }: BscLiteProps) {
  const utils = trpc.useUtils();
  
  // Buscar indicadores do banco
  const { data: indicadoresDb, isLoading } = trpc.bsc.getByEmpresa.useQuery({ empresaId });
  
  // Mutation para salvar indicadores
  const salvarMutation = trpc.bsc.saveIndicadores.useMutation({
    onSuccess: () => {
      alert("BSC salvo com sucesso!");
      utils.bsc.getByEmpresa.invalidate({ empresaId });
    },
    onError: (error) => {
      alert(`Erro ao salvar: ${error.message}`);
    },
  });
  const [perspectivas, setPerspectivas] = useState<Perspectiva[]>([
    { id: "financeira", nome: "Financeira", icone: "financeira", cor: "#22c55e", indicadores: [] },
    { id: "cliente", nome: "Cliente", icone: "cliente", cor: "#3b82f6", indicadores: [] },
    { id: "processos", nome: "Processos Internos", icone: "processos", cor: "#f97316", indicadores: [] },
    { id: "aprendizado", nome: "Aprendizado e Crescimento", icone: "aprendizado", cor: "#8b5cf6", indicadores: [] },
  ]);
  
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

  const calcularDesempenho = (indicadores: Indicador[]) => {
    if (indicadores.length === 0) return 0;
    const total = indicadores.reduce((acc, ind) => acc + (ind.atual / ind.meta) * 100, 0);
    return Math.round(total / indicadores.length);
  };

  const adicionarIndicador = (perspectivaId: string) => {
    if (!novoIndicador.nome) return;
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
        empresaId,
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
              const Icon = icones[p.icone];
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
          const Icon = icones[p.icone];
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
                    <Button size="sm" onClick={() => adicionarIndicador(p.id)} style={{ backgroundColor: p.cor }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Salvar */}
      <Button onClick={handleSave} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
        <Save className="h-4 w-4" />
        Salvar Balanced Scorecard
      </Button>
    </div>
  );
}
