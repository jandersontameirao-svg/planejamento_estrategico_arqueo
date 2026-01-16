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
import PlanoDeAcaoPestel from "@/components/PlanoDeAcaoPestel";

// ============ STAKEHOLDERS ============
export function AnalisesStakeholdersCompleta() {
  const notification = useNotification();
  const { state: data, setState: setData, undo, redo, canUndo, canRedo } = useUndoRedo({
    altoPoder: "",
    altoInteresse: "",
    baixoPoder: "",
    baixoInteresse: "",
  });

  const handleSave = () => {
    console.log("Análise Stakeholders salva:", data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Análise de Stakeholders</h2>
        <UndoRedoToolbar onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
      </div>
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>Análise de Stakeholders</CardTitle>
          <CardDescription>Matriz Poder x Interesse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-red-300 bg-red-50 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">Alto Poder / Alto Interesse</h4>
              <p className="text-sm text-red-800 mb-2">Gerenciar Ativamente</p>
              <Textarea placeholder="Ex: Diretores, Acionistas" rows={3} value={data.altoPoder} onChange={(e) => setData({ ...data, altoPoder: e.target.value })} />
            </div>

            <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Baixo Poder / Alto Interesse</h4>
              <p className="text-sm text-blue-800 mb-2">Manter Informado</p>
              <Textarea placeholder="Ex: Funcionários, Clientes" rows={3} value={data.altoInteresse} onChange={(e) => setData({ ...data, altoInteresse: e.target.value })} />
            </div>

            <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">Alto Poder / Baixo Interesse</h4>
              <p className="text-sm text-yellow-800 mb-2">Manter Satisfeito</p>
              <Textarea placeholder="Ex: Governo, Reguladores" rows={3} value={data.baixoPoder} onChange={(e) => setData({ ...data, baixoPoder: e.target.value })} />
            </div>

            <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Baixo Poder / Baixo Interesse</h4>
              <p className="text-sm text-green-800 mb-2">Monitorar</p>
              <Textarea placeholder="Ex: Público geral" rows={3} value={data.baixoInteresse} onChange={(e) => setData({ ...data, baixoInteresse: e.target.value })} />
            </div>
          </div>

          {/* Plano de Ação */}
          <div className="mt-8 pt-8 border-t">
            <PlanoDeAcaoPestel 
              fatorId="stakeholders"
              categoria="Stakeholders"
            />
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} size="lg">
              <Save className="mr-2 h-4 w-4" />
              Salvar Análise Stakeholders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
          <CardTitle>Análise SWOT/TOWS</CardTitle>     <CardDescription>Análise de Forças, Fraquezas, Oportunidades e Ameaças</CardDescription>
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
          <div className="mt-8 pt-8 border-t">
            <PlanoDeAcaoPestel 
              fatorId="swot"
              categoria="SWOT"
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

// ============ OKR ============
export function AnalisesOkrCompleta() {
  const notification = useNotification();
  const { state: data, setState: setData, undo, redo, canUndo, canRedo } = useUndoRedo({
    objetivo1: "",
    kr1_1: "",
    kr1_2: "",
    kr1_3: "",
    objetivo2: "",
    kr2_1: "",
    kr2_2: "",
    kr2_3: "",
  });

  const handleSave = () => {
    console.log("Análise OKR salva:", data);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>OKR (Objectives and Key Results)</CardTitle>
          <CardDescription>Metodologia de definição de objetivos e resultados-chave mensuráveis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            {/* Objetivo 1 */}
            <div className="border rounded-lg p-4">
              <Label className="text-base font-semibold mb-2 block">Objetivo 1</Label>
              <Input placeholder="Ex: Aumentar participação de mercado" value={data.objetivo1} onChange={(e) => setData({ ...data, objetivo1: e.target.value })} />
              <div className="mt-3 space-y-2">
                <p className="text-sm font-semibold">Key Results:</p>
                <Input placeholder="KR1: Aumentar vendas em 30%" value={data.kr1_1} onChange={(e) => setData({ ...data, kr1_1: e.target.value })} />
                <Input placeholder="KR2: Conquistar 5 novos clientes" value={data.kr1_2} onChange={(e) => setData({ ...data, kr1_2: e.target.value })} />
                <Input placeholder="KR3: Reduzir churn em 20%" value={data.kr1_3} onChange={(e) => setData({ ...data, kr1_3: e.target.value })} />
              </div>
            </div>

            {/* Objetivo 2 */}
            <div className="border rounded-lg p-4">
              <Label className="text-base font-semibold mb-2 block">Objetivo 2</Label>
              <Input placeholder="Ex: Melhorar eficiência operacional" value={data.objetivo2} onChange={(e) => setData({ ...data, objetivo2: e.target.value })} />
              <div className="mt-3 space-y-2">
                <p className="text-sm font-semibold">Key Results:</p>
                <Input placeholder="KR1: Reduzir custos em 15%" value={data.kr2_1} onChange={(e) => setData({ ...data, kr2_1: e.target.value })} />
                <Input placeholder="KR2: Aumentar produtividade em 25%" value={data.kr2_2} onChange={(e) => setData({ ...data, kr2_2: e.target.value })} />
                <Input placeholder="KR3: Implementar 3 processos de automação" value={data.kr2_3} onChange={(e) => setData({ ...data, kr2_3: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Plano de Ação */}
          <div className="mt-8 pt-8 border-t">
            <PlanoDeAcaoPestel 
              fatorId="okr"
              categoria="OKR"
            />
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} size="lg">
              <Save className="mr-2 h-4 w-4" />
              Salvar Análise OKR
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
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>BSC (Balanced Scorecard)</CardTitle>
          <CardDescription>Perspectivas Financeira, Clientes, Processos Internos e Aprendizado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Perspectiva Financeira</h4>
              <Textarea placeholder="Rentabilidade, crescimento, fluxo de caixa..." rows={4} value={data.financeira} onChange={(e) => setData({ ...data, financeira: e.target.value })} />
            </div>

            <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Perspectiva do Cliente</h4>
              <Textarea placeholder="Satisfação, retenção, participação de mercado..." rows={4} value={data.clientes} onChange={(e) => setData({ ...data, clientes: e.target.value })} />
            </div>

            <div className="border-2 border-purple-300 bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Processos Internos</h4>
              <Textarea placeholder="Qualidade, eficiência, inovação..." rows={4} value={data.processos} onChange={(e) => setData({ ...data, processos: e.target.value })} />
            </div>

            <div className="border-2 border-orange-300 bg-orange-50 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2">Aprendizado e Crescimento</h4>
              <Textarea placeholder="Desenvolvimento de pessoas, cultura, tecnologia..." rows={4} value={data.aprendizado} onChange={(e) => setData({ ...data, aprendizado: e.target.value })} />
            </div>
          </div>

          {/* Plano de Ação */}
          <div className="mt-8 pt-8 border-t">
            <PlanoDeAcaoPestel 
              fatorId="bsc"
              categoria="BSC"
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
