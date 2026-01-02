import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface RecursoVRIO {
  id: string;
  nome: string;
  valor: number; // 1-5
  raridade: number; // 1-5
  imitabilidade: number; // 1-5
  organizacao: number; // 1-5
}

interface AnalisadorVRIOProps {
  empresaId?: number;
  onSave?: (recursos: RecursoVRIO[]) => void;
}

const classificarVRIO = (media: number): { label: string; cor: string } => {
  if (media >= 4.5) return { label: "Vantagem Sustentável", cor: "bg-green-500" };
  if (media >= 3.5) return { label: "Vantagem Temporária", cor: "bg-blue-500" };
  if (media >= 2.5) return { label: "Paridade Competitiva", cor: "bg-yellow-500" };
  return { label: "Desvantagem", cor: "bg-red-500" };
};

export function AnalisadorVRIO({ empresaId, onSave }: AnalisadorVRIOProps) {
  const [recursos, setRecursos] = useState<RecursoVRIO[]>([
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
  ]);

  const [novoRecurso, setNovoRecurso] = useState<Partial<RecursoVRIO>>({
    nome: "",
    valor: 3,
    raridade: 3,
    imitabilidade: 3,
    organizacao: 3,
  });

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
    setRecursos(
      recursos.map((r) => (r.id === id ? { ...r, [campo]: valor } : r))
    );
  };

  const calcularMedia = (recurso: RecursoVRIO) => {
    return (recurso.valor + recurso.raridade + recurso.imitabilidade + recurso.organizacao) / 4;
  };

  const dadosGrafico = recursos.map((r) => ({
    nome: r.nome.substring(0, 20),
    Valor: r.valor,
    Raridade: r.raridade,
    Imitabilidade: r.imitabilidade,
    Organização: r.organizacao,
    Média: parseFloat(calcularMedia(r).toFixed(2)),
  }));

  const dadosRadar = recursos.map((r) => ({
    recurso: r.nome.substring(0, 15),
    V: r.valor,
    R: r.raridade,
    I: r.imitabilidade,
    O: r.organizacao,
  }));

  return (
    <div className="space-y-6">
      {/* Seção de Adição de Novo Recurso */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Adicionar Novo Recurso</CardTitle>
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
                  {campo.charAt(0).toUpperCase() + campo.slice(1)}
                </Label>
                <div className="flex items-center gap-2">
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[novoRecurso[campo as keyof RecursoVRIO] as number || 3]}
                    onValueChange={(val) =>
                      setNovoRecurso({ ...novoRecurso, [campo]: val[0] })
                    }
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

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Análise Comparativa VRIO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Valor" fill="#3b82f6" />
                  <Bar dataKey="Raridade" fill="#f97316" />
                  <Bar dataKey="Imitabilidade" fill="#8b5cf6" />
                  <Bar dataKey="Organização" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Perfil VRIO por Recurso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={dadosRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="recurso" />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} />
                  <Radar name="Valor" dataKey="V" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                  <Radar name="Raridade" dataKey="R" stroke="#f97316" fill="#f97316" fillOpacity={0.25} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Recursos */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Avaliados</CardTitle>
          <CardDescription>Clique nos valores para editar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recursos.map((recurso) => {
              const media = calcularMedia(recurso);
              const classificacao = classificarVRIO(media);

              return (
                <div
                  key={recurso.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-2">{recurso.nome}</h4>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge variant="outline">
                          Média: {media.toFixed(2)}
                        </Badge>
                        <Badge className={`${classificacao.cor} text-white`}>
                          {classificacao.label}
                        </Badge>
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
                            min={1}
                            max={5}
                            step={1}
                            value={[recurso[campo as keyof RecursoVRIO] as number]}
                            onValueChange={(val) =>
                              atualizarRecurso(recurso.id, campo as keyof RecursoVRIO, val[0])
                            }
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

      {/* Botão de Salvar */}
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

            const blob = new Blob([csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "analise-vrio.csv";
            a.click();
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
        <Button
          onClick={() => {
            onSave?.(recursos);
          }}
        >
          Salvar Análise VRIO
        </Button>
      </div>
    </div>
  );
}
