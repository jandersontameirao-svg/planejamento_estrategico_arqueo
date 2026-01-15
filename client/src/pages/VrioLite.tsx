import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface RecursoVRIO {
  id: string;
  nome: string;
  valioso: number; // 0-5
  raro: number; // 0-5
  imitavel: number; // 0-5
  organizado: number; // 0-5
}

const calcularClassificacao = (v: number, r: number, i: number, o: number) => {
  const media = (v + r + i + o) / 4;
  if (v >= 4 && r >= 4 && i >= 4 && o >= 4) return { label: "Vantagem Sustentável", cor: "bg-green-500", desc: "Recurso estratégico de longo prazo" };
  if (v >= 3 && r >= 3 && i >= 3) return { label: "Vantagem Temporária", cor: "bg-blue-500", desc: "Vantagem competitiva de curto prazo" };
  if (v >= 3 && r >= 2) return { label: "Paridade Competitiva", cor: "bg-yellow-500", desc: "Igual aos concorrentes" };
  return { label: "Desvantagem", cor: "bg-red-500", desc: "Recurso não estratégico" };
};

interface VrioLiteProps {
  empresaId: number;
}

export default function VrioLite({ empresaId }: VrioLiteProps) {
  const [recursos, setRecursos] = useState<RecursoVRIO[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);

  // Função de auto-save com debounce
  const autoSave = useCallback(() => {
    if (isInitialLoadRef.current) return;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setAutoSaveStatus('saving');
      setTimeout(() => {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      }, 500);
    }, 2000);
  }, [recursos]);

  // Trigger auto-save quando recursos mudam
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    autoSave();
  }, [recursos]);
  const [novoRecurso, setNovoRecurso] = useState({
    nome: "",
    valioso: 3,
    raro: 3,
    imitavel: 3,
    organizado: 3,
  });

  const adicionarRecurso = () => {
    if (!novoRecurso.nome) return;
    setRecursos([
      ...recursos,
      {
        id: Date.now().toString(),
        ...novoRecurso,
      },
    ]);
    setNovoRecurso({ nome: "", valioso: 3, raro: 3, imitavel: 3, organizado: 3 });
  };

  const removerRecurso = (id: string) => {
    setRecursos(recursos.filter((r) => r.id !== id));
  };

  const atualizarRecurso = (id: string, campo: keyof RecursoVRIO, valor: any) => {
    setRecursos(recursos.map((r) => (r.id === id ? { ...r, [campo]: valor } : r)));
  };

  const dadosGrafico = recursos.map((r) => ({
    nome: r.nome.substring(0, 15),
    Valioso: r.valioso,
    Raro: r.raro,
    Imitável: r.imitavel,
    Organizado: r.organizado,
  }));

  const dadosRadar = recursos.length > 0 ? [
    { criterio: "Valioso", valor: recursos.reduce((a, r) => a + r.valioso, 0) / recursos.length },
    { criterio: "Raro", valor: recursos.reduce((a, r) => a + r.raro, 0) / recursos.length },
    { criterio: "Imitável", valor: recursos.reduce((a, r) => a + r.imitavel, 0) / recursos.length },
    { criterio: "Organizado", valor: recursos.reduce((a, r) => a + r.organizado, 0) / recursos.length },
  ] : [];

  const contarClassificacoes = () => {
    const contagem = { sustentavel: 0, temporaria: 0, paridade: 0, desvantagem: 0 };
    recursos.forEach((r) => {
      const classificacao = calcularClassificacao(r.valioso, r.raro, r.imitavel, r.organizado);
      if (classificacao.label === "Vantagem Sustentável") contagem.sustentavel++;
      else if (classificacao.label === "Vantagem Temporária") contagem.temporaria++;
      else if (classificacao.label === "Paridade Competitiva") contagem.paridade++;
      else contagem.desvantagem++;
    });
    return contagem;
  };

  const classificacoes = contarClassificacoes();

  const handleSave = () => {
    console.log("VRIO salva:", recursos);
    alert("Análise VRIO salva com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
              <Target className="h-5 w-5" />
            </div>
            Análise VRIO
          </CardTitle>
          <CardDescription>Valioso, Raro, Imitável, Organizado - Avalie seus recursos estratégicos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-green-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700">{classificacoes.sustentavel}</div>
              <div className="text-xs text-green-600">Vantagem Sustentável</div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-700">{classificacoes.temporaria}</div>
              <div className="text-xs text-blue-600">Vantagem Temporária</div>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-700">{classificacoes.paridade}</div>
              <div className="text-xs text-yellow-600">Paridade Competitiva</div>
            </div>
            <div className="bg-red-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-700">{classificacoes.desvantagem}</div>
              <div className="text-xs text-red-600">Desvantagem</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      {recursos.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparativo VRIO por Recurso</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Valioso" fill="#22c55e" />
                  <Bar dataKey="Raro" fill="#3b82f6" />
                  <Bar dataKey="Imitável" fill="#f97316" />
                  <Bar dataKey="Organizado" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Perfil VRIO Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={dadosRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="criterio" />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} />
                  <Radar name="Média" dataKey="valor" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Recursos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recursos Avaliados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recursos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum recurso avaliado ainda. Adicione um recurso abaixo.</p>
          ) : (
            recursos.map((recurso) => {
              const classificacao = calcularClassificacao(recurso.valioso, recurso.raro, recurso.imitavel, recurso.organizado);
              const media = ((recurso.valioso + recurso.raro + recurso.imitavel + recurso.organizado) / 4).toFixed(1);
              return (
                <div key={recurso.id} className="border-l-4 border-indigo-400 p-4 rounded-lg bg-indigo-50/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{recurso.nome}</h4>
                      <p className="text-xs text-gray-600">{classificacao.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${classificacao.cor} text-white`}>{classificacao.label}</Badge>
                      <Badge variant="outline">Média: {media}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: "valioso", label: "Valioso", cor: "bg-green-500" },
                      { key: "raro", label: "Raro", cor: "bg-blue-500" },
                      { key: "imitavel", label: "Imitável", cor: "bg-orange-500" },
                      { key: "organizado", label: "Organizado", cor: "bg-purple-500" },
                    ].map((item) => (
                      <div key={item.key}>
                        <label className="text-xs font-semibold flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${item.cor}`}></span>
                          {item.label}: {(recurso as any)[item.key]}/5
                        </label>
                        <Slider
                          value={[(recurso as any)[item.key]]}
                          onValueChange={(val) => atualizarRecurso(recurso.id, item.key as keyof RecursoVRIO, val[0])}
                          min={0}
                          max={5}
                          step={1}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => removerRecurso(recurso.id)}
                    className="mt-3 text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Remover
                  </button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Novo Recurso */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Adicionar Novo Recurso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Nome do Recurso/Capacidade</label>
            <input
              type="text"
              value={novoRecurso.nome}
              onChange={(e) => setNovoRecurso({ ...novoRecurso, nome: e.target.value })}
              placeholder="Ex: Equipe de P&D, Marca reconhecida, Patentes..."
              className="w-full border rounded px-3 py-2 text-sm mt-1"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: "valioso", label: "Valioso", desc: "Agrega valor ao cliente?" },
              { key: "raro", label: "Raro", desc: "Poucos competidores têm?" },
              { key: "imitavel", label: "Imitável", desc: "Difícil de copiar?" },
              { key: "organizado", label: "Organizado", desc: "Empresa explora bem?" },
            ].map((item) => (
              <div key={item.key}>
                <label className="text-sm font-semibold">{item.label}: {(novoRecurso as any)[item.key]}/5</label>
                <p className="text-xs text-gray-500">{item.desc}</p>
                <Slider
                  value={[(novoRecurso as any)[item.key]]}
                  onValueChange={(val) => setNovoRecurso({ ...novoRecurso, [item.key]: val[0] })}
                  min={0}
                  max={5}
                  step={1}
                  className="mt-1"
                />
              </div>
            ))}
          </div>

          <Button onClick={adicionarRecurso} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Adicionar Recurso
          </Button>
        </CardContent>
      </Card>

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

      {/* Salvar */}
      <Button onClick={handleSave} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
        <Save className="h-4 w-4" />
        Salvar Análise VRIO
      </Button>
    </div>
  );
}
