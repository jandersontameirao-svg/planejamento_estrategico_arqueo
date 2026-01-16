import { useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { UndoRedoToolbar } from "@/components/UndoRedoToolbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import PlanoDeAcaoPestelIntegrado from "@/components/PlanoDeAcaoPestelIntegrado";

// ============ SWOT/TOWS ============
export function AnaliseSwoTtowsCompleta() {
  const notification = useNotification();
  const { state: data, setState: setData, undo, redo, canUndo, canRedo } = useUndoRedo({
    forcas: "",
    fraquezas: "",
    oportunidades: "",
    ameacas: "",
    estrategias: "",
  });

  const handleSave = () => {
    console.log("Análise SWOT/TOWS salva:", data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Análise SWOT/TOWS</h2>
        <UndoRedoToolbar onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
      </div>
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>Análise SWOT/TOWS</CardTitle>
          <CardDescription>Análise de Forças, Fraquezas, Oportunidades e Ameaças</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Forças (Strengths)</h4>
              <Textarea placeholder="Competências, recursos, vantagens..." rows={4} value={data.forcas} onChange={(e) => setData({ ...data, forcas: e.target.value })} />
            </div>

            <div className="border-2 border-red-300 bg-red-50 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">Fraquezas (Weaknesses)</h4>
              <Textarea placeholder="Limitações, desvantagens, gaps..." rows={4} value={data.fraquezas} onChange={(e) => setData({ ...data, fraquezas: e.target.value })} />
            </div>

            <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Oportunidades (Opportunities)</h4>
              <Textarea placeholder="Mercados, tendências, possibilidades..." rows={4} value={data.oportunidades} onChange={(e) => setData({ ...data, oportunidades: e.target.value })} />
            </div>

            <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">Ameaças (Threats)</h4>
              <Textarea placeholder="Riscos, competição, mudanças..." rows={4} value={data.ameacas} onChange={(e) => setData({ ...data, ameacas: e.target.value })} />
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <Label className="text-base font-semibold mb-2 block">Estratégias TOWS</Label>
            <Textarea placeholder="Estratégias derivadas da matriz SWOT..." rows={4} value={data.estrategias} onChange={(e) => setData({ ...data, estrategias: e.target.value })} />
          </div>

          {/* Plano de Ação */}
          <div className="mt-8 pt-8 border-t space-y-4">
            <h3 className="text-lg font-semibold">Plano de Ação - SWOT</h3>
            <PlanoDeAcaoPestelIntegrado 
              fatorId="swot-completa"
              fatorDescricao="Análise SWOT/TOWS Completa"
              fatorCategoria="SWOT"
            />
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} size="lg">
              <Save className="mr-2 h-4 w-4" />
              Salvar Análise SWOT/TOWS
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ BSC ============
export function AnaliseBscCompleta() {
  const notification = useNotification();
  const { state: data, setState: setData, undo, redo, canUndo, canRedo } = useUndoRedo({
    financeira: "",
    clientes: "",
    processos: "",
    aprendizado: "",
  });

  const handleSave = () => {
    console.log("Análise BSC salva:", data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">BSC (Balanced Scorecard)</h2>
        <UndoRedoToolbar onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
      </div>
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>BSC (Balanced Scorecard)</CardTitle>
          <CardDescription>Perspectivas Financeira, Clientes, Processos Internos e Aprendizado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Perspectiva Financeira</h4>
              <Textarea placeholder="Objetivos financeiros, ROI, crescimento de receita..." rows={4} value={data.financeira} onChange={(e) => setData({ ...data, financeira: e.target.value })} />
            </div>

            <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Perspectiva de Clientes</h4>
              <Textarea placeholder="Satisfação, retenção, aquisição de clientes..." rows={4} value={data.clientes} onChange={(e) => setData({ ...data, clientes: e.target.value })} />
            </div>

            <div className="border-2 border-purple-300 bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Perspectiva de Processos Internos</h4>
              <Textarea placeholder="Eficiência, qualidade, inovação de processos..." rows={4} value={data.processos} onChange={(e) => setData({ ...data, processos: e.target.value })} />
            </div>

            <div className="border-2 border-orange-300 bg-orange-50 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2">Perspectiva de Aprendizado e Crescimento</h4>
              <Textarea placeholder="Desenvolvimento de pessoas, inovação, cultura..." rows={4} value={data.aprendizado} onChange={(e) => setData({ ...data, aprendizado: e.target.value })} />
            </div>
          </div>

          {/* Plano de Ação */}
          <div className="mt-8 pt-8 border-t space-y-4">
            <h3 className="text-lg font-semibold">Plano de Ação - BSC Financeira</h3>
            <PlanoDeAcaoPestelIntegrado 
              fatorId="bsc-financeira"
              fatorDescricao="Perspectiva Financeira"
              fatorCategoria="BSC"
            />
          </div>

          <div className="mt-8 pt-8 border-t space-y-4">
            <h3 className="text-lg font-semibold">Plano de Ação - BSC Clientes</h3>
            <PlanoDeAcaoPestelIntegrado 
              fatorId="bsc-clientes"
              fatorDescricao="Perspectiva de Clientes"
              fatorCategoria="BSC"
            />
          </div>

          <div className="mt-8 pt-8 border-t space-y-4">
            <h3 className="text-lg font-semibold">Plano de Ação - BSC Processos</h3>
            <PlanoDeAcaoPestelIntegrado 
              fatorId="bsc-processos"
              fatorDescricao="Perspectiva de Processos Internos"
              fatorCategoria="BSC"
            />
          </div>

          <div className="mt-8 pt-8 border-t space-y-4">
            <h3 className="text-lg font-semibold">Plano de Ação - BSC Aprendizado</h3>
            <PlanoDeAcaoPestelIntegrado 
              fatorId="bsc-aprendizado"
              fatorDescricao="Perspectiva de Aprendizado e Crescimento"
              fatorCategoria="BSC"
            />
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} size="lg">
              <Save className="mr-2 h-4 w-4" />
              Salvar Análise BSC
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
