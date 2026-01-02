import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, Download, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from "recharts";

interface RecursoVRIO {
  id: string;
  nome: string;
  valor: number;
  raridade: number;
  imitabilidade: number;
  organizacao: number;
}

const RECURSOS_INICIAIS: RecursoVRIO[] = [
  {
    id: "1",
    nome: "Relacionamento institucional com o IPHAN",
    valor: 2,
    raridade: 2,
    imitabilidade: 1,
    organizacao: 2,
  },
  {
    id: "2",
    nome: "Equipe técnica experiente",
    valor: 1,
    raridade: 4,
    imitabilidade: 2,
    organizacao: 3,
  },
  {
    id: "3",
    nome: "Uso de tecnologia (Sigepa Plus, drones, GIS)",
    valor: 5,
    raridade: 5,
    imitabilidade: 3,
    organizacao: 5,
  },
  {
    id: "4",
    nome: "Governança e compliance",
    valor: 0,
    raridade: 0,
    imitabilidade: 5,
    organizacao: 0,
  },
  {
    id: "5",
    nome: "Capacidade de gestão de projetos complexos",
    valor: 5,
    raridade: 0,
    imitabilidade: 0,
    organizacao: 1,
  },
];

const classificarVRIO = (media: number): { label: string; cor: string; descricao: string } => {
  if (media >= 4.5) return { label: "Vantagem Sustentável", cor: "bg-green-500", descricao: "Recurso estratégico crítico" };
  if (media >= 3.5) return { label: "Vantagem Temporária", cor: "bg-blue-500", descricao: "Recurso competitivo importante" };
  if (media >= 2.5) return { label: "Paridade Competitiva", cor: "bg-yellow-500", descricao: "Recurso comum no mercado" };
  return { label: "Desvantagem", cor: "bg-red-500", descricao: "Recurso fraco ou ausente" };
};

export default function AnalisesVRIO() {
  const [, setLocation] = useLocation();
  const [recursos, setRecursos] = useState<RecursoVRIO[]>(RECURSOS_INICIAIS);
  const [novoRecurso, setNovoRecurso] = useState<Partial<RecursoVRIO>>({
    nome: "",
    valor: 3,
    raridade: 3,
    imitabilidade: 3,
    organizacao: 3,
  });

  const calcularMedia = (recurso: RecursoVRIO) => {
    return (recurso.valor + recurso.raridade + recurso.imitabilidade + recurso.organizacao) / 4;
  };

  const adicionarRecurso = () => {
    if (!novoRecurso.nome) return;
    const recurso: RecursoVRIO = {
      id: Date.now().toString(),
      nome: novoRecurso.nome,
      valor: novoRecurso.valor || 3,
      raridade: novoRecurso.raridade || 3,
      imitabilidade: novoRecurso.imitabilidade || 3,
      organizacao: novoRecurso.organizacao || 3,
    };
    setRecursos([...recursos, recurso]);
    setNovoRecurso({ nome: "", valor: 3, raridade: 3, imitabilidade: 3, organizacao: 3 });
  };

  const removerRecurso = (id: string) => {
    setRecursos(recursos.filter((r) => r.id !== id));
  };

  const atualizarRecurso = (id: string, campo: keyof RecursoVRIO, valor: number) => {
    setRecursos(recursos.map((r) => (r.id === id ? { ...r, [campo]: valor } : r)));
  };

  // Dados para gráficos
  const dadosComparacao = recursos.map((r) => ({
    nome: r.nome.substring(0, 20),
    V: r.valor,
    R: r.raridade,
    I: r.imitabilidade,
    O: r.organizacao,
    Média: parseFloat(calcularMedia(r).toFixed(2)),
  }));

  const dadosRadar = recursos.map((r) => ({
    recurso: r.nome.substring(0, 15),
    V: r.valor,
    R: r.raridade,
    I: r.imitabilidade,
    O: r.organizacao,
  }));

  const dadosDispersao = recursos.map((r) => {
    const media = calcularMedia(r);
    return {
      x: (r.valor + r.raridade) / 2, // Eixo X: Valor + Raridade
      y: (r.imitabilidade + r.organizacao) / 2, // Eixo Y: Imitabilidade + Organização
      media,
      nome: r.nome,
    };
  });

  const resumoClassificacoes = recursos.reduce(
    (acc, r) => {
      const media = calcularMedia(r);
      const classificacao = classificarVRIO(media);
      const key = classificacao.label.replace(/\s+/g, "_");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Análise VRIO Interativa</h1>
              <p className="text-sm text-muted-foreground">Avalie recursos organizacionais</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Resumo de Classificações */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{resumoClassificacoes.Vantagem_Sustentável || 0}</div>
                <p className="text-sm text-muted-foreground">Vantagem Sustentável</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{resumoClassificacoes.Vantagem_Temporária || 0}</div>
                <p className="text-sm text-muted-foreground">Vantagem Temporária</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{resumoClassificacoes.Paridade_Competitiva || 0}</div>
                <p className="text-sm text-muted-foreground">Paridade Competitiva</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{resumoClassificacoes.Desvantagem || 0}</div>
                <p className="text-sm text-muted-foreground">Desvantagem</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras */}
          <Card>
            <CardHeader>
              <CardTitle>Comparação VRIO</CardTitle>
              <CardDescription>Análise comparativa dos critérios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosComparacao}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="V" fill="#3b82f6" name="Valor" />
                    <Bar dataKey="R" fill="#f97316" name="Raridade" />
                    <Bar dataKey="I" fill="#8b5cf6" name="Imitabilidade" />
                    <Bar dataKey="O" fill="#06b6d4" name="Organização" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico Radar */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil VRIO</CardTitle>
              <CardDescription>Visualização em radar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={dadosRadar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="recurso" />
                    <PolarRadiusAxis angle={90} domain={[0, 5]} />
                    <Radar name="Valor" dataKey="V" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                    <Radar name="Raridade" dataKey="R" stroke="#f97316" fill="#f97316" fillOpacity={0.15} />
                    <Radar name="Imitabilidade" dataKey="I" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
                    <Radar name="Organização" dataKey="O" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Dispersão */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Matriz Estratégica</CardTitle>
              <CardDescription>Eixo X: Valor + Raridade | Eixo Y: Imitabilidade + Organização</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" name="Valor + Raridade" domain={[0, 5]} />
                    <YAxis dataKey="y" name="Imitabilidade + Organização" domain={[0, 5]} />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter name="Recursos" data={dadosDispersao} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Adicionar Novo Recurso */}
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle>Adicionar Novo Recurso</CardTitle>
            <CardDescription>Avalie um novo recurso organizacional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="novo-recurso">Nome do Recurso</Label>
              <Input
                id="novo-recurso"
                placeholder="Ex: Marca forte no mercado"
                value={novoRecurso.nome || ""}
                onChange={(e) => setNovoRecurso({ ...novoRecurso, nome: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["valor", "raridade", "imitabilidade", "organizacao"].map((campo) => (
                <div key={campo}>
                  <Label className="text-sm">
                    {campo === "valor" && "Valor (V)"}
                    {campo === "raridade" && "Raridade (R)"}
                    {campo === "imitabilidade" && "Imitabilidade (I)"}
                    {campo === "organizacao" && "Organização (O)"}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      min={0}
                      max={5}
                      step={1}
                      value={[novoRecurso[campo as keyof RecursoVRIO] as number || 3]}
                      onValueChange={(val) => setNovoRecurso({ ...novoRecurso, [campo]: val[0] })}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold w-6 text-right">
                      {novoRecurso[campo as keyof RecursoVRIO] || 3}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={adicionarRecurso} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Recurso
            </Button>
          </CardContent>
        </Card>

        {/* Tabela de Recursos */}
        <Card>
          <CardHeader>
            <CardTitle>Recursos Avaliados</CardTitle>
            <CardDescription>Clique nos sliders para editar os valores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recursos.map((recurso) => {
                const media = calcularMedia(recurso);
                const classificacao = classificarVRIO(media);

                return (
                  <div key={recurso.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-2">{recurso.nome}</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          <Badge variant="outline">Média: {media.toFixed(2)}</Badge>
                          <Badge className={`${classificacao.cor} text-white`}>{classificacao.label}</Badge>
                          <span className="text-xs text-muted-foreground">{classificacao.descricao}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removerRecurso(recurso.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {["valor", "raridade", "imitabilidade", "organizacao"].map((campo) => (
                        <div key={campo} className="space-y-1">
                          <Label className="text-xs">
                            {campo === "valor" && "Valor (V)"}
                            {campo === "raridade" && "Raridade (R)"}
                            {campo === "imitabilidade" && "Imitabilidade (I)"}
                            {campo === "organizacao" && "Organização (O)"}
                          </Label>
                          <div className="flex items-center gap-2">
                            <Slider
                              min={0}
                              max={5}
                              step={1}
                              value={[recurso[campo as keyof RecursoVRIO] as number]}
                              onValueChange={(val) => atualizarRecurso(recurso.id, campo as keyof RecursoVRIO, val[0])}
                              className="flex-1"
                            />
                            <span className="text-sm font-semibold w-6 text-right">
                              {recurso[campo as keyof RecursoVRIO]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const csv = [
                ["Recurso", "Valor", "Raridade", "Imitabilidade", "Organização", "Média", "Classificação"],
                ...recursos.map((r) => {
                  const media = calcularMedia(r);
                  const classificacao = classificarVRIO(media);
                  return [r.nome, r.valor, r.raridade, r.imitabilidade, r.organizacao, media.toFixed(2), classificacao.label];
                }),
              ]
                .map((row) => row.join(","))
                .join("\n");

              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = "analise-vrio.csv";
              link.click();
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button>Salvar Análise</Button>
        </div>
      </main>
    </div>
  );
}
