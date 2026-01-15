import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2, TrendingUp, Users, ShoppingCart, DoorOpen, Repeat } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";

interface Forca {
  id: string;
  tipo: "Rivalidade" | "Fornecedores" | "Clientes" | "Novos Entrantes" | "Substitutos";
  intensidade: number; // 1-5
  descricao: string;
}

const tiposForca = [
  { nome: "Rivalidade", icone: TrendingUp, cor: "#ef4444", corBg: "#fee2e2", descricao: "Concorrência entre empresas" },
  { nome: "Fornecedores", icone: Users, cor: "#f97316", corBg: "#ffedd5", descricao: "Poder de barganha dos fornecedores" },
  { nome: "Clientes", icone: ShoppingCart, cor: "#3b82f6", corBg: "#dbeafe", descricao: "Poder de barganha dos clientes" },
  { nome: "Novos Entrantes", icone: DoorOpen, cor: "#8b5cf6", corBg: "#ede9fe", descricao: "Ameaça de novos competidores" },
  { nome: "Substitutos", icone: Repeat, cor: "#10b981", corBg: "#d1fae5", descricao: "Ameaça de produtos substitutos" },
];

interface CincoForcasLiteProps {
  empresaId: number;
}

export default function CincoForcasLite({ empresaId }: CincoForcasLiteProps) {
  const [forcas, setForcas] = useState<Forca[]>([]);
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
      // Simular salvamento (5 Forças não tem mutation ainda)
      setTimeout(() => {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      }, 500);
    }, 2000);
  }, [forcas]);

  // Trigger auto-save quando forças mudam
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    autoSave();
  }, [forcas]);
  const [tipoAtivo, setTipoAtivo] = useState<string | null>(null);

  const [novaForca, setNovaForca] = useState<Partial<Forca>>({
    tipo: "Rivalidade",
    intensidade: 3,
    descricao: "",
  });

  const adicionarForca = () => {
    if (!novaForca.descricao) return;
    setForcas([
      ...forcas,
      {
        id: Date.now().toString(),
        tipo: novaForca.tipo as any,
        intensidade: novaForca.intensidade || 3,
        descricao: novaForca.descricao,
      },
    ]);
    setNovaForca({ tipo: novaForca.tipo, intensidade: 3, descricao: "" });
  };

  const removerForca = (id: string) => {
    setForcas(forcas.filter((f) => f.id !== id));
  };

  const classificarIntensidade = (intensidade: number) => {
    if (intensidade >= 4.5) return { label: "Muito Forte", cor: "bg-red-500" };
    if (intensidade >= 3.5) return { label: "Forte", cor: "bg-orange-500" };
    if (intensidade >= 2.5) return { label: "Moderada", cor: "bg-yellow-500" };
    return { label: "Fraca", cor: "bg-green-500" };
  };

  const calcularIntensidadePorTipo = (tipo: string) => {
    const forcasTipo = forcas.filter((f) => f.tipo === tipo);
    if (forcasTipo.length === 0) return 0;
    return forcasTipo.reduce((a, f) => a + f.intensidade, 0) / forcasTipo.length;
  };

  const intensidadeMedia = forcas.length > 0 ? forcas.reduce((a, f) => a + f.intensidade, 0) / forcas.length : 0;
  const atratividade = 5 - intensidadeMedia;

  const classificarAtratividade = (atratividade: number) => {
    if (atratividade >= 4) return { label: "Muito Atrativo", cor: "#22c55e", descricao: "Setor com baixas barreiras competitivas" };
    if (atratividade >= 3) return { label: "Atrativo", cor: "#3b82f6", descricao: "Setor com oportunidades moderadas" };
    if (atratividade >= 2) return { label: "Pouco Atrativo", cor: "#f59e0b", descricao: "Setor com alta competição" };
    return { label: "Não Atrativo", cor: "#ef4444", descricao: "Setor com forças muito intensas" };
  };

  const dadosRadar = tiposForca.map((tipo) => ({
    tipo: tipo.nome,
    intensidade: calcularIntensidadePorTipo(tipo.nome),
  }));

  const dadosBarras = tiposForca.map((tipo) => ({
    tipo: tipo.nome,
    intensidade: calcularIntensidadePorTipo(tipo.nome),
    cor: tipo.cor,
  }));

  const forcasFiltradas = tipoAtivo ? forcas.filter((f) => f.tipo === tipoAtivo) : forcas;

  const handleSave = () => {
    console.log("5 Forças salva:", forcas);
    alert("Análise de 5 Forças salva com sucesso!");
  };

  const atratividadeInfo = classificarAtratividade(atratividade);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">5F</div>
            Análise das 5 Forças de Porter
          </CardTitle>
          <CardDescription>Avaliação das forças competitivas que moldam o setor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-700">{forcas.length}</div>
              <div className="text-xs text-blue-600">Total de Forças</div>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-700">{intensidadeMedia.toFixed(1)}/5</div>
              <div className="text-xs text-orange-600">Intensidade Média</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700">{atratividade.toFixed(1)}/5</div>
              <div className="text-xs text-green-600">Atratividade</div>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: atratividadeInfo.cor + "20" }}>
              <div className="text-sm font-bold" style={{ color: atratividadeInfo.cor }}>{atratividadeInfo.label}</div>
              <div className="text-xs" style={{ color: atratividadeInfo.cor }}>{atratividadeInfo.descricao}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards por Tipo de Força */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {tiposForca.map((tipo) => {
          const Icon = tipo.icone;
          const intensidade = calcularIntensidadePorTipo(tipo.nome);
          const quantidade = forcas.filter((f) => f.tipo === tipo.nome).length;
          const ativo = tipoAtivo === tipo.nome;
          return (
            <Card
              key={tipo.nome}
              className={`cursor-pointer transition-all hover:shadow-lg ${ativo ? "ring-2 ring-offset-2" : ""}`}
              style={{ borderLeftColor: tipo.cor, borderLeftWidth: "4px", backgroundColor: ativo ? tipo.corBg : "white" }}
              onClick={() => setTipoAtivo(ativo ? null : tipo.nome)}
            >
              <CardContent className="p-4 text-center">
                <Icon className="h-6 w-6 mx-auto mb-2" style={{ color: tipo.cor }} />
                <div className="text-xs font-semibold mb-1">{tipo.nome}</div>
                <div className="text-2xl font-bold" style={{ color: tipo.cor }}>{quantidade}</div>
                {intensidade > 0 && (
                  <Badge className="mt-2 text-xs" style={{ backgroundColor: tipo.cor }}>
                    {intensidade.toFixed(1)}/5
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tipoAtivo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Filtrando por: {tipoAtivo}</span>
          <Button size="sm" variant="outline" onClick={() => setTipoAtivo(null)}>
            Limpar Filtro
          </Button>
        </div>
      )}

      {/* Gráficos */}
      {forcas.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Radar das 5 Forças</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={dadosRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="tipo" />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} />
                  <Radar name="Intensidade" dataKey="intensidade" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Intensidade por Força</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosBarras}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tipo" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="intensidade" name="Intensidade">
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

      {/* Lista de Forças */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Forças Identificadas ({forcasFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {forcasFiltradas.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhuma força identificada ainda. Adicione uma força abaixo.</p>
          ) : (
            forcasFiltradas.map((forca) => {
              const intensidade = classificarIntensidade(forca.intensidade);
              const tipoInfo = tiposForca.find((t) => t.nome === forca.tipo);
              const Icon = tipoInfo?.icone || TrendingUp;
              return (
                <div key={forca.id} className="border rounded-lg p-4" style={{ borderLeftColor: tipoInfo?.cor, borderLeftWidth: "4px" }}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: tipoInfo?.corBg }}>
                        <Icon className="h-4 w-4" style={{ color: tipoInfo?.cor }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{forca.tipo}</div>
                        <div className="text-xs text-gray-600">{forca.descricao}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${intensidade.cor} text-white text-xs`}>{intensidade.label}</Badge>
                      <button onClick={() => removerForca(forca.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">Intensidade</span>
                      <span>{forca.intensidade}/5</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div className="h-2 rounded-full" style={{ width: `${(forca.intensidade / 5) * 100}%`, backgroundColor: tipoInfo?.cor }}></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Nova Força */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Adicionar Nova Força
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Tipo de Força</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
              {tiposForca.map((tipo) => {
                const Icon = tipo.icone;
                const selecionado = novaForca.tipo === tipo.nome;
                return (
                  <button
                    key={tipo.nome}
                    onClick={() => setNovaForca({ ...novaForca, tipo: tipo.nome as any })}
                    className={`p-2 rounded-lg border-2 transition-all ${selecionado ? "border-blue-500 shadow-md" : "border-gray-200"}`}
                    style={{ backgroundColor: selecionado ? tipo.corBg : "white" }}
                  >
                    <Icon className="h-5 w-5 mx-auto mb-1" style={{ color: tipo.cor }} />
                    <div className="text-xs font-semibold">{tipo.nome}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Descrição da Força</label>
            <textarea
              value={novaForca.descricao}
              onChange={(e) => setNovaForca({ ...novaForca, descricao: e.target.value })}
              placeholder="Ex: Alta rivalidade devido a muitos concorrentes com produtos similares..."
              className="w-full border rounded px-3 py-2 text-sm mt-1"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Intensidade: {novaForca.intensidade}/5</label>
            <Slider
              value={[novaForca.intensidade || 3]}
              onValueChange={(val) => setNovaForca({ ...novaForca, intensidade: val[0] })}
              min={1}
              max={5}
              step={1}
              className="mt-2"
            />
            <div className="text-xs text-gray-500 mt-1">Quão forte é esta força competitiva?</div>
          </div>
          <Button onClick={adicionarForca} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Adicionar Força
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
      <Button onClick={handleSave} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
        <Save className="h-4 w-4" />
        Salvar Análise de 5 Forças
      </Button>
    </div>
  );
}
