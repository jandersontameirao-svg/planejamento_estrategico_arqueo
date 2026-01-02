import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Save, AlertCircle, TrendingUp } from "lucide-react";

interface ItemRisco {
  id: number;
  nome: string;
  tipo: "objetivo" | "projeto";
  impacto: "muito_baixo" | "baixo" | "moderado" | "alto" | "muito_alto";
  probabilidade: "10" | "30" | "50" | "70" | "90";
  tipo_risco: "ameaca" | "oportunidade";
  metodologia?: string;
  observacoes?: string;
}

interface MatrizRisco5x5Props {
  objetivos: any[];
  projetos: any[];
}

export function MatrizRisco5x5({ objetivos, projetos }: MatrizRisco5x5Props) {
  const [selectedItem, setSelectedItem] = useState<ItemRisco | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<ItemRisco | null>(null);
  const [formData, setFormData] = useState({
    impacto: "moderado" as "muito_baixo" | "baixo" | "moderado" | "alto" | "muito_alto",
    probabilidade: "50" as "10" | "30" | "50" | "70" | "90",
    tipo_risco: "ameaca" as "ameaca" | "oportunidade",
    metodologia: "matriz_risco_padrao",
    observacoes: "",
  });

  const updateObjetivoMutation = trpc.riscos.updateObjetivoRisco.useMutation();
  const updateProjetoMutation = trpc.riscos.updateProjetoRisco.useMutation();

  // Mapeamento de valores
  const impactoMap = {
    muito_baixo: 1,
    baixo: 2,
    moderado: 3,
    alto: 4,
    muito_alto: 5,
  };

  const probabilidadeMap = {
    "10": "baixa",
    "30": "baixa",
    "50": "media",
    "70": "alta",
    "90": "alta",
  };

  const impactoMapReverse = {
    baixo: "muito_baixo",
    medio: "moderado",
    alto: "muito_alto",
  };

  // Preparar dados
  const items: ItemRisco[] = [
    ...(objetivos || []).map((obj: any) => {
      const impactoVal = impactoMapReverse[obj.impacto as keyof typeof impactoMapReverse] || "moderado";
      const probVal = obj.probabilidade === "alta" ? "70" : obj.probabilidade === "media" ? "50" : "30";
      return {
        id: obj.id,
        nome: obj.titulo,
        tipo: "objetivo" as const,
        impacto: impactoVal as "muito_baixo" | "baixo" | "moderado" | "alto" | "muito_alto",
        probabilidade: probVal as "10" | "30" | "50" | "70" | "90",
        tipo_risco: "ameaca" as const,
        metodologia: obj.metodologia || "matriz_risco_padrao",
        observacoes: obj.observacoes || "",
      };
    }),
    ...(projetos || []).map((proj: any) => {
      const impactoVal = impactoMapReverse[proj.impacto as keyof typeof impactoMapReverse] || "moderado";
      const probVal = proj.probabilidade === "alta" ? "70" : proj.probabilidade === "media" ? "50" : "30";
      return {
        id: proj.id,
        nome: proj.nome,
        tipo: "projeto" as const,
        impacto: impactoVal as "muito_baixo" | "baixo" | "moderado" | "alto" | "muito_alto",
        probabilidade: probVal as "10" | "30" | "50" | "70" | "90",
        tipo_risco: "ameaca" as const,
        metodologia: proj.metodologia || "matriz_risco_padrao",
        observacoes: proj.observacoes || "",
      };
    }),
  ];

  // Cores por nível de risco
  const getCorRisco = (impacto: string, probabilidade: string, tipo: string) => {
    const impactoNum = impactoMap[impacto as keyof typeof impactoMap] || 3;
    const probNum = parseInt(probabilidade);
    const nivelRisco = impactoNum * (probNum / 100);

    if (tipo === "oportunidade") {
      if (nivelRisco >= 3.5) return "#4ade80"; // Verde escuro
      if (nivelRisco >= 2.5) return "#86efac"; // Verde médio
      return "#bbf7d0"; // Verde claro
    } else {
      if (nivelRisco >= 3.5) return "#ef4444"; // Vermelho (Alta)
      if (nivelRisco >= 2.5) return "#f97316"; // Laranja (Média)
      if (nivelRisco >= 1.5) return "#eab308"; // Amarelo (Baixa)
      return "#22c55e"; // Verde (Muito Baixa)
    }
  };

  // Determinar nível de risco
  const getNivelRisco = (impacto: string, probabilidade: string, tipo: string) => {
    const impactoNum = impactoMap[impacto as keyof typeof impactoMap] || 3;
    const probNum = parseInt(probabilidade);
    const nivelRisco = impactoNum * (probNum / 100);

    if (tipo === "oportunidade") {
      if (nivelRisco >= 3.5) return "Alta";
      if (nivelRisco >= 2.5) return "Média";
      return "Baixa";
    } else {
      if (nivelRisco >= 3.5) return "Alta";
      if (nivelRisco >= 2.5) return "Média";
      if (nivelRisco >= 1.5) return "Baixa";
      return "Muito Baixa";
    }
  };

  const handleEditItem = (item: ItemRisco) => {
    setSelectedItem(item);
    setFormData({
      impacto: item.impacto,
      probabilidade: item.probabilidade,
      tipo_risco: item.tipo_risco,
      metodologia: item.metodologia || "matriz_risco_padrao",
      observacoes: item.observacoes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedItem) return;

    try {
      const impactoMap2: Record<string, "baixo" | "medio" | "alto"> = {
        muito_baixo: "baixo",
        baixo: "baixo",
        moderado: "medio",
        alto: "alto",
        muito_alto: "alto",
      };

      const probMap: Record<string, "baixa" | "media" | "alta"> = {
        "10": "baixa",
        "30": "baixa",
        "50": "media",
        "70": "alta",
        "90": "alta",
      };

      if (selectedItem.tipo === "objetivo") {
        await updateObjetivoMutation.mutateAsync({
          objetivoId: selectedItem.id,
          impacto: impactoMap2[formData.impacto] as "baixo" | "medio" | "alto",
          probabilidade: probMap[formData.probabilidade] as "baixa" | "media" | "alta",
          metodologia: formData.metodologia,
          observacoes: formData.observacoes,
        });
      } else {
        await updateProjetoMutation.mutateAsync({
          projetoId: selectedItem.id,
          impacto: impactoMap2[formData.impacto] as "baixo" | "medio" | "alto",
          probabilidade: probMap[formData.probabilidade] as "baixa" | "media" | "alta",
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

  const probabilidades = ["10%", "30%", "50%", "70%", "90%"];
  const impactos = ["Muito Baixo", "Baixo", "Moderado", "Alto", "Muito Alto"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Matriz de Risco 5x5
        </CardTitle>
        <CardDescription>
          Análise de Ameaças e Oportunidades com avaliação de Impacto e Probabilidade
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Matriz de Ameaças */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Ameaças (Riscos)
            </h3>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-100 w-20">Probabilidade</th>
                    {impactos.map((imp) => (
                      <th key={imp} className="border p-2 bg-gray-100 text-center font-semibold">
                        {imp}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {probabilidades.reverse().map((prob, probIdx) => (
                    <tr key={prob}>
                      <td className="border p-2 bg-gray-50 font-semibold text-center">{prob}</td>
                      {impactos.map((imp, impIdx) => {
                        const impactoKey = Object.keys(impactoMap)[impIdx] as keyof typeof impactoMap;
                        const probKey = Object.keys(probabilidadeMap)[4 - probIdx] as keyof typeof probabilidadeMap;
                        const cellItems = items.filter(
                          (item) =>
                            item.tipo_risco === "ameaca" &&
                            item.impacto === impactoKey &&
                            item.probabilidade === probKey
                        );
                        const cor = getCorRisco(impactoKey, probKey, "ameaca");

                        return (
                          <td
                            key={`${imp}-${prob}`}
                            className="border p-2 text-center min-h-24 cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: cor }}
                          >
                            <div className="text-xs font-semibold mb-1">
                              {getNivelRisco(impactoKey, probKey, "ameaca")}
                            </div>
                            <div className="space-y-1">
                              {cellItems.map((item) => (
                                <div
                                  key={`${item.tipo}-${item.id}`}
                                  onClick={() => handleEditItem(item)}
                                  className="bg-white bg-opacity-80 rounded px-2 py-1 text-xs font-semibold cursor-pointer hover:bg-opacity-100 border border-gray-300"
                                >
                                  {item.tipo === "objetivo" ? "🎯" : "📋"} {item.nome.substring(0, 20)}...
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Matriz de Oportunidades */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-700 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Oportunidades
            </h3>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-100 w-20">Probabilidade</th>
                    {impactos.map((imp) => (
                      <th key={imp} className="border p-2 bg-gray-100 text-center font-semibold">
                        {imp}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {probabilidades.reverse().map((prob, probIdx) => (
                    <tr key={prob}>
                      <td className="border p-2 bg-gray-50 font-semibold text-center">{prob}</td>
                      {impactos.map((imp, impIdx) => {
                        const impactoKey = Object.keys(impactoMap)[impIdx] as keyof typeof impactoMap;
                        const probKey = Object.keys(probabilidadeMap)[4 - probIdx] as keyof typeof probabilidadeMap;
                        const cellItems = items.filter(
                          (item) =>
                            item.tipo_risco === "oportunidade" &&
                            item.impacto === impactoKey &&
                            item.probabilidade === probKey
                        );
                        const cor = getCorRisco(impactoKey, probKey, "oportunidade");

                        return (
                          <td
                            key={`${imp}-${prob}`}
                            className="border p-2 text-center min-h-24 cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: cor }}
                          >
                            <div className="text-xs font-semibold mb-1">
                              {getNivelRisco(impactoKey, probKey, "oportunidade")}
                            </div>
                            <div className="space-y-1">
                              {cellItems.map((item) => (
                                <div
                                  key={`${item.tipo}-${item.id}`}
                                  onClick={() => handleEditItem(item)}
                                  className="bg-white bg-opacity-80 rounded px-2 py-1 text-xs font-semibold cursor-pointer hover:bg-opacity-100 border border-gray-300"
                                >
                                  {item.tipo === "objetivo" ? "🎯" : "📋"} {item.nome.substring(0, 20)}...
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dialog fora das tabelas */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Editar {selectedItem?.tipo === "objetivo" ? "Objetivo" : "Projeto"}
              </DialogTitle>
              <DialogDescription>{selectedItem?.nome}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tipo de Risco</label>
                <Select value={formData.tipo_risco} onValueChange={(value: any) => setFormData({ ...formData, tipo_risco: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ameaca">Ameaça (Risco)</SelectItem>
                    <SelectItem value="oportunidade">Oportunidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Impacto</label>
                <Select value={formData.impacto} onValueChange={(value: any) => setFormData({ ...formData, impacto: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="muito_baixo">Muito Baixo</SelectItem>
                    <SelectItem value="baixo">Baixo</SelectItem>
                    <SelectItem value="moderado">Moderado</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                    <SelectItem value="muito_alto">Muito Alto</SelectItem>
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
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="70">70%</SelectItem>
                    <SelectItem value="90">90%</SelectItem>
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
                    <SelectItem value="matriz_risco_padrao">Matriz Padrão 5x5</SelectItem>
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
                  placeholder="Adicione observações sobre este item..."
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

        {/* Legenda */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold mb-3">Legenda de Cores</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "#ef4444" }}></div>
              <span>Risco Alto (Ameaça)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "#4ade80" }}></div>
              <span>Oportunidade Alta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "#f97316" }}></div>
              <span>Risco Médio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "#86efac" }}></div>
              <span>Oportunidade Média</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "#eab308" }}></div>
              <span>Risco Baixo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: "#bbf7d0" }}></div>
              <span>Oportunidade Baixa</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
