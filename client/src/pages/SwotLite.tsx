import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Plus, Trash2, Shield, AlertTriangle, TrendingUp, TrendingDown, FileDown } from "lucide-react";
import { exportSwotPDF } from "@/lib/pdfExport";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ItemSwot {
  id: string;
  descricao: string;
}

interface SwotLiteProps {
  empresaId: number;
}

// Helper para converter config do banco para formato de exportação
function convertTemplateConfig(config: any) {
  if (!config) return undefined;
  return {
    corPrimaria: config.corPrimaria,
    corSecundaria: config.corSecundaria,
    incluirPestel: !!config.incluirPestel,
    incluirSwot: !!config.incluirSwot,
    incluirOkr: !!config.incluirOkr,
    incluirBsc: !!config.incluirBsc,
    incluirGraficos: !!config.incluirGraficos,
    incluirRecomendacoes: !!config.incluirRecomendacoes,
    rodapePersonalizado: config.rodapePersonalizado || undefined,
  };
}

export default function SwotLite({ empresaId }: SwotLiteProps) {
  const utils = trpc.useUtils();
  
  // Buscar itens do banco
  const { data: swotData, isLoading } = trpc.analises.getSwot.useQuery({ empresaId });
  const { data: templateConfig } = trpc.templates.getConfig.useQuery({ empresaId });
  const { data: empresa } = trpc.empresas.getById.useQuery({ id: empresaId });  
  // Mutation para salvar itens
  const salvarMutation = trpc.analises.saveSwot.useMutation({
    onSuccess: () => {
      alert("Análise SWOT salva com sucesso!");
      utils.analises.getSwot.invalidate({ empresaId });
    },
    onError: (error) => {
      alert(`Erro ao salvar: ${error.message}`);
    },
  });
  const [forcas, setForcas] = useState<ItemSwot[]>([]);
  const [fraquezas, setFraquezas] = useState<ItemSwot[]>([]);
  const [oportunidades, setOportunidades] = useState<ItemSwot[]>([]);
  const [ameacas, setAmeacas] = useState<ItemSwot[]>([]);

  // Carregar itens do banco ao montar o componente
  useEffect(() => {
    if (swotData && Array.isArray(swotData)) {
      const forcasDb = swotData.filter((i: any) => i.tipo === "forca").map((i: any) => ({ id: i.id?.toString(), descricao: i.descricao }));
      const fraquezasDb = swotData.filter((i: any) => i.tipo === "fraqueza").map((i: any) => ({ id: i.id?.toString(), descricao: i.descricao }));
      const oportunidadesDb = swotData.filter((i: any) => i.tipo === "oportunidade").map((i: any) => ({ id: i.id?.toString(), descricao: i.descricao }));
      const ameacasDb = swotData.filter((i: any) => i.tipo === "ameaca").map((i: any) => ({ id: i.id?.toString(), descricao: i.descricao }));
      setForcas(forcasDb);
      setFraquezas(fraquezasDb);
      setOportunidades(oportunidadesDb);
      setAmeacas(ameacasDb);
    }
  }, [swotData]);

  const [novoItem, setNovoItem] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState<"forcas" | "fraquezas" | "oportunidades" | "ameacas">("forcas");

  const adicionarItem = () => {
    if (!novoItem || novoItem.trim() === "") {
      alert("Por favor, preencha a descrição do item antes de adicionar.");
      return;
    }
    if (novoItem.length < 5) {
      alert("A descrição deve ter pelo menos 5 caracteres.");
      return;
    }
    const item = { id: Date.now().toString(), descricao: novoItem };
    if (tipoSelecionado === "forcas") setForcas([...forcas, item]);
    else if (tipoSelecionado === "fraquezas") setFraquezas([...fraquezas, item]);
    else if (tipoSelecionado === "oportunidades") setOportunidades([...oportunidades, item]);
    else if (tipoSelecionado === "ameacas") setAmeacas([...ameacas, item]);
    setNovoItem("");
  };

  const removerItem = (tipo: string, id: string) => {
    if (tipo === "forcas") setForcas(forcas.filter((i) => i.id !== id));
    else if (tipo === "fraquezas") setFraquezas(fraquezas.filter((i) => i.id !== id));
    else if (tipo === "oportunidades") setOportunidades(oportunidades.filter((i) => i.id !== id));
    else if (tipo === "ameacas") setAmeacas(ameacas.filter((i) => i.id !== id));
  };

  const dadosGrafico = [
    { nome: "Forças", valor: forcas.length, cor: "#22c55e" },
    { nome: "Fraquezas", valor: fraquezas.length, cor: "#ef4444" },
    { nome: "Oportunidades", valor: oportunidades.length, cor: "#3b82f6" },
    { nome: "Ameaças", valor: ameacas.length, cor: "#f97316" },
  ];

  const handleSave = () => {
    // Converter todos os itens para formato do banco
    const items = [
      ...forcas.map(f => ({ tipo: "forca" as const, descricao: f.descricao })),
      ...fraquezas.map(f => ({ tipo: "fraqueza" as const, descricao: f.descricao })),
      ...oportunidades.map(o => ({ tipo: "oportunidade" as const, descricao: o.descricao })),
      ...ameacas.map(a => ({ tipo: "ameaca" as const, descricao: a.descricao })),
    ];

    salvarMutation.mutate({
      empresaId,
      items,
    });
  };

  const tipoConfig = {
    forcas: { label: "Forças", cor: "bg-green-500", icon: Shield, borderCor: "border-green-500", bgCor: "bg-green-50" },
    fraquezas: { label: "Fraquezas", cor: "bg-red-500", icon: TrendingDown, borderCor: "border-red-500", bgCor: "bg-red-50" },
    oportunidades: { label: "Oportunidades", cor: "bg-blue-500", icon: TrendingUp, borderCor: "border-blue-500", bgCor: "bg-blue-50" },
    ameacas: { label: "Ameaças", cor: "bg-orange-500", icon: AlertTriangle, borderCor: "border-orange-500", bgCor: "bg-orange-50" },
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
              <Shield className="h-5 w-5" />
            </div>
            Análise SWOT/TOWS
          </CardTitle>
          <CardDescription>Forças, Fraquezas, Oportunidades, Ameaças</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700">{forcas.length}</div>
              <div className="text-xs text-green-600">Forças</div>
            </div>
            <div className="bg-red-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-700">{fraquezas.length}</div>
              <div className="text-xs text-red-600">Fraquezas</div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-700">{oportunidades.length}</div>
              <div className="text-xs text-blue-600">Oportunidades</div>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-700">{ameacas.length}</div>
              <div className="text-xs text-orange-600">Ameaças</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico */}
      {(forcas.length > 0 || fraquezas.length > 0 || oportunidades.length > 0 || ameacas.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição SWOT</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor">
                  {dadosGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Matriz SWOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(["forcas", "fraquezas", "oportunidades", "ameacas"] as const).map((tipo) => {
          const config = tipoConfig[tipo];
          const items = tipo === "forcas" ? forcas : tipo === "fraquezas" ? fraquezas : tipo === "oportunidades" ? oportunidades : ameacas;
          const Icon = config.icon;
          
          return (
            <Card key={tipo} className={`${config.bgCor} border-l-4 ${config.borderCor}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {config.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-2">Nenhum item adicionado</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                      <span className="text-sm">{item.descricao}</span>
                      <button onClick={() => removerItem(tipo, item.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Adicionar Novo Item */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Adicionar Novo Item
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Tipo</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {(["forcas", "fraquezas", "oportunidades", "ameacas"] as const).map((tipo) => {
                const config = tipoConfig[tipo];
                const Icon = config.icon;
                return (
                  <button
                    key={tipo}
                    onClick={() => setTipoSelecionado(tipo)}
                    className={`p-2 rounded-lg border-2 flex items-center justify-center gap-2 text-sm transition-all ${
                      tipoSelecionado === tipo
                        ? `${config.cor} text-white border-transparent`
                        : `bg-white ${config.borderCor} hover:bg-gray-50`
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Descrição</label>
            <textarea
              value={novoItem}
              onChange={(e) => setNovoItem(e.target.value)}
              placeholder={`Descreva uma ${tipoConfig[tipoSelecionado].label.toLowerCase().slice(0, -1)}...`}
              className="w-full border rounded px-3 py-2 text-sm mt-1"
              rows={2}
            />
          </div>
          <Button onClick={adicionarItem} className="w-full gap-2 bg-gray-700 hover:bg-gray-800">
            <Plus className="h-4 w-4" />
            Adicionar {tipoConfig[tipoSelecionado].label.slice(0, -1)}
          </Button>
        </CardContent>
      </Card>

      {/* Salvar e Exportar */}
      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white">
          <Save className="h-4 w-4" />
          Salvar Análise SWOT
        </Button>
        <Button 
          onClick={() => exportSwotPDF(
            { nome: empresa?.nome || "Empresa", logo: templateConfig?.logoUrl || undefined },
            [
              ...forcas.map(f => ({ tipo: "forca", descricao: f.descricao })),
              ...fraquezas.map(f => ({ tipo: "fraqueza", descricao: f.descricao })),
              ...oportunidades.map(o => ({ tipo: "oportunidade", descricao: o.descricao })),
              ...ameacas.map(a => ({ tipo: "ameaca", descricao: a.descricao })),
            ],
            convertTemplateConfig(templateConfig)
          )}
          variant="outline"
          className="gap-2"
        >
          <FileDown className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>
    </div>
  );
}
