import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2, Users, AlertCircle, Eye, UserCheck } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceArea } from "recharts";

interface Stakeholder {
  id: string;
  nome: string;
  poder: number; // 1-5
  interesse: number; // 1-5
  descricao: string;
}

const classificarQuadrante = (poder: number, interesse: number) => {
  if (poder >= 3 && interesse >= 3) return { label: "Gerenciar de Perto", cor: "#ef4444", bg: "#fee2e2", icone: UserCheck };
  if (poder >= 3 && interesse < 3) return { label: "Manter Satisfeito", cor: "#f59e0b", bg: "#fef3c7", icone: AlertCircle };
  if (poder < 3 && interesse >= 3) return { label: "Manter Informado", cor: "#3b82f6", bg: "#dbeafe", icone: Eye };
  return { label: "Monitorar", cor: "#22c55e", bg: "#dcfce7", icone: Users };
};

interface StakeholdersLiteProps {
  empresaId: number;
}

export default function StakeholdersLite({ empresaId }: StakeholdersLiteProps) {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
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
  }, [stakeholders]);

  // Trigger auto-save quando stakeholders mudam
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    autoSave();
  }, [stakeholders]);
  const [quadranteAtivo, setQuadranteAtivo] = useState<string | null>(null);

  const [novoStakeholder, setNovoStakeholder] = useState<Partial<Stakeholder>>({
    nome: "",
    poder: 3,
    interesse: 3,
    descricao: "",
  });

  const adicionarStakeholder = () => {
    if (!novoStakeholder.nome) return;
    setStakeholders([
      ...stakeholders,
      {
        id: Date.now().toString(),
        nome: novoStakeholder.nome,
        poder: novoStakeholder.poder || 3,
        interesse: novoStakeholder.interesse || 3,
        descricao: novoStakeholder.descricao || "",
      },
    ]);
    setNovoStakeholder({ nome: "", poder: 3, interesse: 3, descricao: "" });
  };

  const removerStakeholder = (id: string) => {
    setStakeholders(stakeholders.filter((s) => s.id !== id));
  };

  const contarPorQuadrante = (label: string) => stakeholders.filter((s) => classificarQuadrante(s.poder, s.interesse).label === label).length;

  const dadosGrafico = stakeholders.map((s) => ({
    x: s.poder,
    y: s.interesse,
    nome: s.nome,
    descricao: s.descricao.substring(0, 50) + (s.descricao.length > 50 ? "..." : ""),
  }));

  const stakeholdersFiltrados = quadranteAtivo
    ? stakeholders.filter((s) => classificarQuadrante(s.poder, s.interesse).label === quadranteAtivo)
    : stakeholders;

  const handleSave = () => {
    console.log("Stakeholders salva:", stakeholders);
    alert("Análise de Stakeholders salva com sucesso!");
  };

  const quadrantes = [
    { label: "Gerenciar de Perto", cor: "#ef4444", bg: "#fee2e2", icone: UserCheck, descricao: "Alto Poder + Alto Interesse" },
    { label: "Manter Satisfeito", cor: "#f59e0b", bg: "#fef3c7", icone: AlertCircle, descricao: "Alto Poder + Baixo Interesse" },
    { label: "Manter Informado", cor: "#3b82f6", bg: "#dbeafe", icone: Eye, descricao: "Baixo Poder + Alto Interesse" },
    { label: "Monitorar", cor: "#22c55e", bg: "#dcfce7", icone: Users, descricao: "Baixo Poder + Baixo Interesse" },
  ];

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white">
              <Users className="h-5 w-5" />
            </div>
            Análise de Stakeholders
          </CardTitle>
          <CardDescription>Matriz Poder × Interesse para Gestão de Partes Interessadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-700">{stakeholders.length}</div>
              <div className="text-xs text-purple-600">Total</div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-700">
                {stakeholders.length > 0 ? (stakeholders.reduce((a, s) => a + s.poder, 0) / stakeholders.length).toFixed(1) : "0"}/5
              </div>
              <div className="text-xs text-blue-600">Poder Médio</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700">
                {stakeholders.length > 0 ? (stakeholders.reduce((a, s) => a + s.interesse, 0) / stakeholders.length).toFixed(1) : "0"}/5
              </div>
              <div className="text-xs text-green-600">Interesse Médio</div>
            </div>
            <div className="bg-red-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-700">{contarPorQuadrante("Gerenciar de Perto")}</div>
              <div className="text-xs text-red-600">Prioritários</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Quadrantes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quadrantes.map((quad) => {
          const Icon = quad.icone;
          const quantidade = contarPorQuadrante(quad.label);
          const ativo = quadranteAtivo === quad.label;
          return (
            <Card
              key={quad.label}
              className={`cursor-pointer transition-all hover:shadow-lg ${ativo ? "ring-2 ring-offset-2" : ""}`}
              style={{ borderLeftColor: quad.cor, borderLeftWidth: "4px", backgroundColor: ativo ? quad.bg : "white" }}
              onClick={() => setQuadranteAtivo(ativo ? null : quad.label)}
            >
              <CardContent className="p-4 text-center">
                <Icon className="h-6 w-6 mx-auto mb-2" style={{ color: quad.cor }} />
                <div className="text-xs font-semibold mb-1">{quad.label}</div>
                <div className="text-2xl font-bold" style={{ color: quad.cor }}>{quantidade}</div>
                <div className="text-xs text-gray-500 mt-1">{quad.descricao}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {quadranteAtivo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Filtrando por: {quadranteAtivo}</span>
          <Button size="sm" variant="outline" onClick={() => setQuadranteAtivo(null)}>
            Limpar Filtro
          </Button>
        </div>
      )}

      {/* Matriz Poder x Interesse */}
      {stakeholders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Matriz Poder × Interesse</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                {/* Quadrantes de fundo */}
                <ReferenceArea x1={0} x2={3} y1={0} y2={3} fill="#dcfce7" fillOpacity={0.3} />
                <ReferenceArea x1={3} x2={5} y1={0} y2={3} fill="#fef3c7" fillOpacity={0.3} />
                <ReferenceArea x1={0} x2={3} y1={3} y2={5} fill="#dbeafe" fillOpacity={0.3} />
                <ReferenceArea x1={3} x2={5} y1={3} y2={5} fill="#fee2e2" fillOpacity={0.3} />
                
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name="Poder" domain={[0, 5.5]} label={{ value: "Poder →", position: "bottom" }} />
                <YAxis type="number" dataKey="y" name="Interesse" domain={[0, 5.5]} label={{ value: "Interesse ↑", angle: -90, position: "left" }} />
                <Tooltip content={({ payload }) => {
                  if (payload && payload.length > 0) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded shadow-lg text-xs">
                        <div className="font-bold mb-1">{data.nome}</div>
                        <div className="text-gray-600 mb-2">{data.descricao}</div>
                        <div>Poder: {data.x}/5 | Interesse: {data.y}/5</div>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Scatter data={dadosGrafico}>
                  {dadosGrafico.map((entry, index) => {
                    const quad = classificarQuadrante(entry.x, entry.y);
                    return <Cell key={`cell-${index}`} fill={quad.cor} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {quadrantes.map((quad) => (
                <div key={quad.label} className="p-2 rounded border-l-4" style={{ backgroundColor: quad.bg, borderLeftColor: quad.cor }}>
                  <strong>{quad.label}:</strong> {quad.descricao}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Stakeholders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stakeholders Identificados ({stakeholdersFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stakeholdersFiltrados.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhum stakeholder identificado ainda. Adicione um stakeholder abaixo.</p>
          ) : (
            stakeholdersFiltrados.map((stakeholder) => {
              const quadrante = classificarQuadrante(stakeholder.poder, stakeholder.interesse);
              const Icon = quadrante.icone;
              return (
                <div key={stakeholder.id} className="border rounded-lg p-4" style={{ borderLeftColor: quadrante.cor, borderLeftWidth: "4px" }}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: quadrante.bg }}>
                        <Icon className="h-4 w-4" style={{ color: quadrante.cor }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{stakeholder.nome}</div>
                        <div className="text-xs text-gray-600">{stakeholder.descricao}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge style={{ backgroundColor: quadrante.cor }} className="text-white text-xs">{quadrante.label}</Badge>
                      <button onClick={() => removerStakeholder(stakeholder.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">Poder</span>
                        <span>{stakeholder.poder}/5</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${(stakeholder.poder / 5) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">Interesse</span>
                        <span>{stakeholder.interesse}/5</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${(stakeholder.interesse / 5) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Novo Stakeholder */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Adicionar Novo Stakeholder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Nome do Stakeholder</label>
            <input
              type="text"
              value={novoStakeholder.nome}
              onChange={(e) => setNovoStakeholder({ ...novoStakeholder, nome: e.target.value })}
              placeholder="Ex: Acionistas, Clientes, Fornecedores..."
              className="w-full border rounded px-3 py-2 text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Descrição</label>
            <textarea
              value={novoStakeholder.descricao}
              onChange={(e) => setNovoStakeholder({ ...novoStakeholder, descricao: e.target.value })}
              placeholder="Descreva o papel e importância deste stakeholder..."
              className="w-full border rounded px-3 py-2 text-sm mt-1"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Poder: {novoStakeholder.poder}/5</label>
              <Slider
                value={[novoStakeholder.poder || 3]}
                onValueChange={(val) => setNovoStakeholder({ ...novoStakeholder, poder: val[0] })}
                min={1}
                max={5}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-gray-500 mt-1">Capacidade de influenciar decisões</div>
            </div>
            <div>
              <label className="text-sm font-semibold">Interesse: {novoStakeholder.interesse}/5</label>
              <Slider
                value={[novoStakeholder.interesse || 3]}
                onValueChange={(val) => setNovoStakeholder({ ...novoStakeholder, interesse: val[0] })}
                min={1}
                max={5}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-gray-500 mt-1">Nível de envolvimento no projeto</div>
            </div>
          </div>
          <Button onClick={adicionarStakeholder} className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4" />
            Adicionar Stakeholder
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
      <Button onClick={handleSave} className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white">
        <Save className="h-4 w-4" />
        Salvar Análise de Stakeholders
      </Button>
    </div>
  );
}
