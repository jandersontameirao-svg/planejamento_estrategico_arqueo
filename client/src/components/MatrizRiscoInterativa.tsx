import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Edit2, Save } from "lucide-react";

interface ItemRisco {
  id: number;
  nome: string;
  tipo: "objetivo" | "projeto";
  impacto: "baixo" | "medio" | "alto";
  probabilidade: "baixa" | "media" | "alta";
  metodologia?: string;
  observacoes?: string;
}

interface MatrizRiscoInterativaProps {
  objetivos: any[];
  projetos: any[];
}

export function MatrizRiscoInterativa({ objetivos, projetos }: MatrizRiscoInterativaProps) {
  const [selectedItem, setSelectedItem] = useState<ItemRisco | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    impacto: "medio" as "baixo" | "medio" | "alto",
    probabilidade: "media" as "baixa" | "media" | "alta",
    metodologia: "matriz_risco_padrao",
    observacoes: "",
  });

  const updateObjetivoMutation = trpc.riscos.updateObjetivoRisco.useMutation();
  const updateProjetoMutation = trpc.riscos.updateProjetoRisco.useMutation();

  // Converter valores textuais para numéricos
  const impactoMap = { baixo: 1, medio: 2, alto: 3 };
  const probabilidadeMap = { baixa: 1, media: 2, alta: 3 };

  // Preparar dados
  const items: ItemRisco[] = [
    ...(objetivos || []).map((obj: any) => ({
      id: obj.id,
      nome: obj.titulo,
      tipo: "objetivo" as const,
      impacto: obj.impacto || "medio",
      probabilidade: obj.probabilidade || "media",
      metodologia: obj.metodologia || "matriz_risco_padrao",
      observacoes: obj.observacoes || "",
    })),
    ...(projetos || []).map((proj: any) => ({
      id: proj.id,
      nome: proj.nome,
      tipo: "projeto" as const,
      impacto: proj.impacto || "medio",
      probabilidade: proj.probabilidade || "media",
      metodologia: proj.metodologia || "matriz_risco_padrao",
      observacoes: proj.observacoes || "",
    })),
  ];

  // Calcular nível de risco (1-9)
  const calcularNivelRisco = (impacto: string, probabilidade: string) => {
    const imp = impactoMap[impacto as keyof typeof impactoMap] || 2;
    const prob = probabilidadeMap[probabilidade as keyof typeof probabilidadeMap] || 2;
    return imp * prob;
  };

  // Determinar cor baseada no nível de risco
  const getCorRisco = (nivelRisco: number) => {
    if (nivelRisco <= 2) return "#22c55e"; // Verde (baixo)
    if (nivelRisco <= 4) return "#eab308"; // Amarelo (médio)
    if (nivelRisco <= 6) return "#f97316"; // Laranja (alto)
    return "#ef4444"; // Vermelho (crítico)
  };

  const handleEditItem = (item: ItemRisco) => {
    setSelectedItem(item);
    setFormData({
      impacto: item.impacto,
      probabilidade: item.probabilidade,
      metodologia: item.metodologia || "matriz_risco_padrao",
      observacoes: item.observacoes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    try {
      if (selectedItem.tipo === "objetivo") {
        await updateObjetivoMutation.mutateAsync({
          objetivoId: selectedItem.id,
          impacto: formData.impacto,
          probabilidade: formData.probabilidade,
          metodologia: formData.metodologia,
          observacoes: formData.observacoes,
        });
      } else {
        await updateProjetoMutation.mutateAsync({
          projetoId: selectedItem.id,
          impacto: formData.impacto,
          probabilidade: formData.probabilidade,
          metodologia: formData.metodologia,
          observacoes: formData.observacoes,
        });
      }
      setIsDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Risco Interativa</CardTitle>
        <CardDescription>
          Clique em um item para editar impacto, probabilidade, metodologia e observações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg viewBox="0 0 600 600" className="w-full max-w-2xl mx-auto border border-gray-300 rounded-lg bg-white">
            {/* Grid de fundo */}
            <defs>
              <pattern id="grid" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#f0f0f0" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="600" height="600" fill="url(#grid)" />

            {/* Eixos */}
            <line x1="50" y1="550" x2="550" y2="550" stroke="#333" strokeWidth="2" />
            <line x1="50" y1="550" x2="50" y2="50" stroke="#333" strokeWidth="2" />

            {/* Rótulos dos eixos */}
            <text x="300" y="590" textAnchor="middle" className="text-xs font-semibold" fill="#333">
              Probabilidade →
            </text>
            <text x="20" y="300" textAnchor="middle" transform="rotate(-90 20 300)" className="text-xs font-semibold" fill="#333">
              Impacto ↑
            </text>

            {/* Divisões */}
            <line x1="200" y1="50" x2="200" y2="550" stroke="#ddd" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="400" y1="50" x2="400" y2="550" stroke="#ddd" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="50" y1="350" x2="550" y2="350" stroke="#ddd" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="50" y1="150" x2="550" y2="150" stroke="#ddd" strokeWidth="1" strokeDasharray="5,5" />

            {/* Rótulos das divisões */}
            <text x="100" y="570" textAnchor="middle" className="text-xs" fill="#666">
              Baixa
            </text>
            <text x="300" y="570" textAnchor="middle" className="text-xs" fill="#666">
              Média
            </text>
            <text x="500" y="570" textAnchor="middle" className="text-xs" fill="#666">
              Alta
            </text>

            <text x="30" y="500" textAnchor="middle" className="text-xs" fill="#666">
              Baixo
            </text>
            <text x="30" y="300" textAnchor="middle" className="text-xs" fill="#666">
              Médio
            </text>
            <text x="30" y="100" textAnchor="middle" className="text-xs" fill="#666">
              Alto
            </text>

            {/* Renderizar itens */}
            {items.map((item) => {
              const nivelRisco = calcularNivelRisco(item.impacto, item.probabilidade);
              const cor = getCorRisco(nivelRisco);
              
              // Calcular posição baseada em impacto e probabilidade
              const impactoPos = { baixo: 450, medio: 250, alto: 50 }[item.impacto];
              const probabilidadePos = { baixa: 100, media: 300, alta: 500 }[item.probabilidade];

              return (
                <g key={`${item.tipo}-${item.id}`}>
                  <Dialog open={isDialogOpen && selectedItem?.id === item.id} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <circle
                        cx={probabilidadePos}
                        cy={impactoPos}
                        r="20"
                        fill={cor}
                        stroke="#333"
                        strokeWidth="2"
                        style={{ cursor: "pointer", opacity: 0.8 }}
                        onClick={() => handleEditItem(item)}
                      />
                    </DialogTrigger>
                    <text
                      x={probabilidadePos}
                      y={impactoPos + 5}
                      textAnchor="middle"
                      className="text-xs font-bold"
                      fill="white"
                      style={{ cursor: "pointer", pointerEvents: "none" }}
                    >
                      {item.tipo === "objetivo" ? "O" : "P"}
                    </text>

                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Editar {item.tipo === "objetivo" ? "Objetivo" : "Projeto"}</DialogTitle>
                        <DialogDescription>{item.nome}</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Impacto</label>
                          <Select value={formData.impacto} onValueChange={(value: any) => setFormData({ ...formData, impacto: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="baixo">Baixo</SelectItem>
                              <SelectItem value="medio">Médio</SelectItem>
                              <SelectItem value="alto">Alto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Probabilidade</label>
                          <Select value={formData.probabilidade} onValueChange={(value: any) => setFormData({ ...formData, probabilidade: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="baixa">Baixa</SelectItem>
                              <SelectItem value="media">Média</SelectItem>
                              <SelectItem value="alta">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Metodologia</label>
                          <Select value={formData.metodologia} onValueChange={(value) => setFormData({ ...formData, metodologia: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="matriz_risco_padrao">Matriz Padrão 3x3</SelectItem>
                              <SelectItem value="iso31000">ISO 31000</SelectItem>
                              <SelectItem value="coso">COSO</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Observações</label>
                          <Textarea
                            value={formData.observacoes}
                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                            placeholder="Adicione observações sobre como este item deve ser utilizado..."
                            className="min-h-24"
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleSave} disabled={updateObjetivoMutation.isPending || updateProjetoMutation.isPending}>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legenda */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-3">Legenda</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#22c55e" }}></div>
              <span className="text-sm">Risco Baixo (1-2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#eab308" }}></div>
              <span className="text-sm">Risco Médio (3-4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#f97316" }}></div>
              <span className="text-sm">Risco Alto (5-6)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#ef4444" }}></div>
              <span className="text-sm">Risco Crítico (7-9)</span>
            </div>
          </div>

          <div className="mt-3 flex gap-4 justify-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-[8px]">O</div>
              <span>Objetivo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-[8px]">P</div>
              <span>Projeto</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
