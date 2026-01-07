import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2, Building2, DollarSign, Users, Cpu, Leaf, Scale, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from "recharts";

interface FatorPestel {
  id: string;
  categoria: "Político" | "Econômico" | "Social" | "Tecnológico" | "Ambiental" | "Legal";
  impacto: number; // 1-5
  probabilidade: number; // 1-5
  descricao: string;
}

const categorias = [
  { nome: "Político", icone: Building2, cor: "#ef4444", corBg: "#fee2e2" },
  { nome: "Econômico", icone: DollarSign, cor: "#3b82f6", corBg: "#dbeafe" },
  { nome: "Social", icone: Users, cor: "#10b981", corBg: "#d1fae5" },
  { nome: "Tecnológico", icone: Cpu, cor: "#8b5cf6", corBg: "#ede9fe" },
  { nome: "Ambiental", icone: Leaf, cor: "#059669", corBg: "#d1fae5" },
  { nome: "Legal", icone: Scale, cor: "#f59e0b", corBg: "#fef3c7" },
];

interface AnalisePestelLiteProps {
  empresaId: number;
}

export default function AnalisePestelLite({ empresaId }: AnalisePestelLiteProps) {
  const utils = trpc.useUtils();
  
  // Buscar fatores do banco
  const { data: fatoresDb, isLoading } = trpc.analises.getPestel.useQuery({ empresaId });
  
  // Mutation para salvar fatores
  const salvarMutation = trpc.analises.savePestel.useMutation({
    onSuccess: () => {
      alert("Análise PESTEL salva com sucesso!");
      utils.analises.getPestel.invalidate({ empresaId });
    },
    onError: (error) => {
      alert(`Erro ao salvar: ${error.message}`);
    },
  });
  const [fatores, setFatores] = useState<FatorPestel[]>([]);

  // Carregar fatores do banco ao montar o componente
  useEffect(() => {
    if (fatoresDb && Array.isArray(fatoresDb)) {
      const fatoresFormatados: FatorPestel[] = fatoresDb.map((f: any) => ({
        id: f.id?.toString() || Date.now().toString(),
        categoria: f.categoria.charAt(0).toUpperCase() + f.categoria.slice(1) as any,
        impacto: f.impacto,
        probabilidade: f.probabilidade,
        descricao: f.descricao,
      }));
      setFatores(fatoresFormatados);
    }
  }, [fatoresDb]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);

  const [novoFator, setNovoFator] = useState<Partial<FatorPestel>>({
    categoria: "Político",
    impacto: 3,
    probabilidade: 3,
    descricao: "",
  });

  const adicionarFator = () => {
    if (!novoFator.descricao) return;
    setFatores([
      ...fatores,
      {
        id: Date.now().toString(),
        categoria: novoFator.categoria as any,
        impacto: novoFator.impacto || 3,
        probabilidade: novoFator.probabilidade || 3,
        descricao: novoFator.descricao,
      },
    ]);
    setNovoFator({ categoria: novoFator.categoria, impacto: 3, probabilidade: 3, descricao: "" });
  };

  const removerFator = (id: string) => {
    setFatores(fatores.filter((f) => f.id !== id));
  };

  const calcularRisco = (impacto: number, probabilidade: number) => {
    const risco = impacto * probabilidade;
    if (risco >= 16) return { label: "Crítico", cor: "bg-red-500" };
    if (risco >= 12) return { label: "Alto", cor: "bg-orange-500" };
    if (risco >= 8) return { label: "Médio", cor: "bg-yellow-500" };
    return { label: "Baixo", cor: "bg-green-500" };
  };

  const contarPorCategoria = (cat: string) => fatores.filter((f) => f.categoria === cat).length;
  const riscoMedioPorCategoria = (cat: string) => {
    const fatoresCat = fatores.filter((f) => f.categoria === cat);
    if (fatoresCat.length === 0) return "0";
    return (fatoresCat.reduce((a, f) => a + f.impacto * f.probabilidade, 0) / fatoresCat.length).toFixed(1);
  };

  const dadosScatter = fatores.map((f) => ({
    x: f.probabilidade,
    y: f.impacto,
    categoria: f.categoria,
    descricao: f.descricao.substring(0, 30) + "...",
    risco: f.impacto * f.probabilidade,
  }));

  const dadosBarras = categorias.map((cat) => ({
    categoria: cat.nome,
    quantidade: contarPorCategoria(cat.nome),
    risco: parseFloat(riscoMedioPorCategoria(cat.nome)),
    cor: cat.cor,
  }));

  const fatoresFiltrados = categoriaAtiva ? fatores.filter((f) => f.categoria === categoriaAtiva) : fatores;

  const handleSave = () => {
    // Converter fatores para formato do banco
    const fatoresParaSalvar = fatores.map((f) => ({
      categoria: f.categoria.toLowerCase() as "politico" | "economico" | "social" | "tecnologico" | "ambiental" | "legal",
      descricao: f.descricao,
      impacto: f.impacto,
      probabilidade: f.probabilidade,
    }));

    salvarMutation.mutate({
      empresaId,
      fatores: fatoresParaSalvar,
    });
  };

  const getCorPorRisco = (risco: number) => {
    if (risco >= 16) return "#ef4444";
    if (risco >= 12) return "#f97316";
    if (risco >= 8) return "#eab308";
    return "#22c55e";
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            Análise PESTEL
          </CardTitle>
          <CardDescription>Fatores Políticos, Econômicos, Sociais, Tecnológicos, Ambientais e Legais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-orange-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-700">{fatores.length}</div>
              <div className="text-xs text-orange-600">Total de Fatores</div>
            </div>
            <div className="bg-red-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-700">
                {fatores.length > 0 ? (fatores.reduce((a, f) => a + f.impacto * f.probabilidade, 0) / fatores.length).toFixed(1) : "0"}
              </div>
              <div className="text-xs text-red-600">Risco Médio</div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-700">
                {fatores.length > 0 ? (fatores.reduce((a, f) => a + f.impacto, 0) / fatores.length).toFixed(1) : "0"}/5
              </div>
              <div className="text-xs text-blue-600">Impacto Médio</div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-700">
                {fatores.filter((f) => f.impacto * f.probabilidade >= 12).length}
              </div>
              <div className="text-xs text-purple-600">Alto Risco</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards por Categoria */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categorias.map((cat) => {
          const Icon = cat.icone;
          const quantidade = contarPorCategoria(cat.nome);
          const riscoMedio = parseFloat(riscoMedioPorCategoria(cat.nome));
          const ativo = categoriaAtiva === cat.nome;
          return (
            <Card
              key={cat.nome}
              className={`cursor-pointer transition-all hover:shadow-lg ${ativo ? "ring-2 ring-offset-2" : ""}`}
              style={{ borderLeftColor: cat.cor, borderLeftWidth: "4px", backgroundColor: ativo ? cat.corBg : "white" }}
              onClick={() => setCategoriaAtiva(ativo ? null : cat.nome)}
            >
              <CardContent className="p-4 text-center">
                <Icon className="h-6 w-6 mx-auto mb-2" style={{ color: cat.cor }} />
                <div className="text-xs font-semibold mb-1">{cat.nome}</div>
                <div className="text-2xl font-bold" style={{ color: cat.cor }}>{quantidade}</div>
                {quantidade > 0 && (
                  <Badge className="mt-2 text-xs" style={{ backgroundColor: getCorPorRisco(riscoMedio) }}>
                    Risco: {riscoMedio}
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categoriaAtiva && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Filtrando por: {categoriaAtiva}</span>
          <Button size="sm" variant="outline" onClick={() => setCategoriaAtiva(null)}>
            Limpar Filtro
          </Button>
        </div>
      )}

      {/* Gráficos */}
      {fatores.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Matriz de Risco (Impacto × Probabilidade)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="x" name="Probabilidade" domain={[0, 6]} label={{ value: "Probabilidade", position: "bottom" }} />
                  <YAxis type="number" dataKey="y" name="Impacto" domain={[0, 6]} label={{ value: "Impacto", angle: -90, position: "left" }} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ payload }) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border rounded shadow-lg text-xs">
                          <div><strong>{data.categoria}</strong></div>
                          <div>{data.descricao}</div>
                          <div>Risco: {data.risco}</div>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Scatter data={dadosScatter}>
                    {dadosScatter.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCorPorRisco(entry.risco)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fatores por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dadosBarras}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" name="Quantidade">
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

      {/* Lista de Fatores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fatores Identificados ({fatoresFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {fatoresFiltrados.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhum fator identificado ainda. Adicione um fator abaixo.</p>
          ) : (
            fatoresFiltrados.map((fator) => {
              const risco = calcularRisco(fator.impacto, fator.probabilidade);
              const catInfo = categorias.find((c) => c.nome === fator.categoria);
              const Icon = catInfo?.icone || AlertTriangle;
              return (
                <div key={fator.id} className="border rounded-lg p-4" style={{ borderLeftColor: catInfo?.cor, borderLeftWidth: "4px" }}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: catInfo?.corBg }}>
                        <Icon className="h-4 w-4" style={{ color: catInfo?.cor }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{fator.categoria}</div>
                        <div className="text-xs text-gray-600">{fator.descricao}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${risco.cor} text-white`}>{risco.label}</Badge>
                      <button onClick={() => removerFator(fator.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">Impacto</span>
                        <span>{fator.impacto}/5</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${(fator.impacto / 5) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">Probabilidade</span>
                        <span>{fator.probabilidade}/5</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-orange-500 rounded-full" style={{ width: `${(fator.probabilidade / 5) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Novo Fator */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Adicionar Novo Fator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Categoria</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {categorias.map((cat) => {
                const Icon = cat.icone;
                const selecionado = novoFator.categoria === cat.nome;
                return (
                  <button
                    key={cat.nome}
                    onClick={() => setNovoFator({ ...novoFator, categoria: cat.nome as any })}
                    className={`p-2 rounded-lg border-2 transition-all ${selecionado ? "border-blue-500 shadow-md" : "border-gray-200"}`}
                    style={{ backgroundColor: selecionado ? cat.corBg : "white" }}
                  >
                    <Icon className="h-5 w-5 mx-auto mb-1" style={{ color: cat.cor }} />
                    <div className="text-xs font-semibold">{cat.nome}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Descrição do Fator</label>
            <textarea
              value={novoFator.descricao}
              onChange={(e) => setNovoFator({ ...novoFator, descricao: e.target.value })}
              placeholder="Ex: Nova legislação trabalhista pode aumentar custos operacionais..."
              className="w-full border rounded px-3 py-2 text-sm mt-1"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold">Impacto: {novoFator.impacto}/5</label>
              <Slider
                value={[novoFator.impacto || 3]}
                onValueChange={(val) => setNovoFator({ ...novoFator, impacto: val[0] })}
                min={1}
                max={5}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-gray-500 mt-1">Qual o impacto no negócio?</div>
            </div>
            <div>
              <label className="text-sm font-semibold">Probabilidade: {novoFator.probabilidade}/5</label>
              <Slider
                value={[novoFator.probabilidade || 3]}
                onValueChange={(val) => setNovoFator({ ...novoFator, probabilidade: val[0] })}
                min={1}
                max={5}
                step={1}
                className="mt-2"
              />
              <div className="text-xs text-gray-500 mt-1">Qual a chance de ocorrer?</div>
            </div>
          </div>
          <Button onClick={adicionarFator} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Adicionar Fator
          </Button>
        </CardContent>
      </Card>

      {/* Salvar */}
      <Button onClick={handleSave} className="w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white">
        <Save className="h-4 w-4" />
        Salvar Análise PESTEL
      </Button>
    </div>
  );
}
