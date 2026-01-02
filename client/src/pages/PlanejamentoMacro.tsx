import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, Users, Settings, GraduationCap, TrendingUp, Building2 } from "lucide-react";

export default function PlanejamentoMacro() {
  // Buscar dados de todas as empresas
  const { data: empresas = [] } = trpc.empresas.list.useQuery();
  
  // Buscar todos os indicadores BSC de todas as empresas
  const { data: todosIndicadores = [] } = trpc.bsc.getAll.useQuery();

  // Agregar dados por perspectiva
  const agregaPerspectiva = (perspectiva: "financeira" | "cliente" | "processos" | "aprendizado") => {
    const indicadores = todosIndicadores.filter(ind => ind.perspectiva === perspectiva);
    
    if (indicadores.length === 0) {
      return { valor: 0, meta: 100, empresas: [] };
    }

    // Calcular média dos valores atuais e metas
    const valorTotal = indicadores.reduce((sum, ind) => sum + Number(ind.valorAtual || 0), 0);
    const metaTotal = indicadores.reduce((sum, ind) => sum + Number(ind.meta || 0), 0);
    const valor = indicadores.length > 0 ? Math.round(valorTotal / indicadores.length) : 0;
    const meta = indicadores.length > 0 ? Math.round(metaTotal / indicadores.length) : 100;

    // Agrupar por empresa
    const empresasMap = new Map<number, { nome: string; valores: number[]; metas: number[] }>();
    
    indicadores.forEach(ind => {
      const empresa = empresas.find(e => e.id === ind.empresaId);
      if (!empresa) return;
      
      if (!empresasMap.has(ind.empresaId)) {
        empresasMap.set(ind.empresaId, { nome: empresa.nome, valores: [], metas: [] });
      }
      
      empresasMap.get(ind.empresaId)!.valores.push(Number(ind.valorAtual || 0));
      empresasMap.get(ind.empresaId)!.metas.push(Number(ind.meta || 0));
    });

    const empresasAgregadas = Array.from(empresasMap.entries()).map(([id, data]) => ({
      nome: data.nome,
      valor: data.valores.length > 0 ? Math.round(data.valores.reduce((a, b) => a + b, 0) / data.valores.length) : 0,
    }));

    return { valor, meta, empresas: empresasAgregadas };
  };

  const dadosConsolidados = {
    financeira: agregaPerspectiva("financeira"),
    cliente: agregaPerspectiva("cliente"),
    processos: agregaPerspectiva("processos"),
    aprendizado: agregaPerspectiva("aprendizado"),
  };

  const dadosRadar = [
    {
      perspectiva: "Financeira",
      valor: dadosConsolidados.financeira.valor,
      meta: dadosConsolidados.financeira.meta,
    },
    {
      perspectiva: "Cliente",
      valor: dadosConsolidados.cliente.valor,
      meta: dadosConsolidados.cliente.meta,
    },
    {
      perspectiva: "Processos",
      valor: dadosConsolidados.processos.valor,
      meta: dadosConsolidados.processos.meta,
    },
    {
      perspectiva: "Aprendizado",
      valor: dadosConsolidados.aprendizado.valor,
      meta: dadosConsolidados.aprendizado.meta,
    },
  ];

  // Gerar dados comparativos por empresa
  const dadosComparativos = empresas.map(empresa => {
    const indicadoresEmpresa = todosIndicadores.filter(ind => ind.empresaId === empresa.id);
    
    const calcularMediaPerspectiva = (perspectiva: "financeira" | "cliente" | "processos" | "aprendizado") => {
      const inds = indicadoresEmpresa.filter(ind => ind.perspectiva === perspectiva);
      if (inds.length === 0) return 0;
      const total = inds.reduce((sum, ind) => sum + Number(ind.valorAtual || 0), 0);
      return Math.round(total / inds.length);
    };

    return {
      empresa: empresa.nome,
      financeira: calcularMediaPerspectiva("financeira"),
      cliente: calcularMediaPerspectiva("cliente"),
      processos: calcularMediaPerspectiva("processos"),
      aprendizado: calcularMediaPerspectiva("aprendizado"),
    };
  });

  const calcularDesempenho = (valor: number, meta: number) => {
    const percentual = (valor / meta) * 100;
    if (percentual >= 90) return { cor: "bg-green-500", texto: "Excelente" };
    if (percentual >= 70) return { cor: "bg-blue-500", texto: "Bom" };
    if (percentual >= 50) return { cor: "bg-yellow-500", texto: "Regular" };
    return { cor: "bg-red-500", texto: "Crítico" };
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Planejamento Macro - Grupo Arqueo</h1>
        <p className="text-gray-600 mt-2">
          Visão consolidada do Balanced Scorecard de todas as empresas do grupo
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financeira</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dadosConsolidados.financeira.valor}%</div>
            <p className="text-xs text-gray-600">Meta: {dadosConsolidados.financeira.meta}%</p>
            <Badge className={`mt-2 ${calcularDesempenho(dadosConsolidados.financeira.valor, dadosConsolidados.financeira.meta).cor} text-white`}>
              {calcularDesempenho(dadosConsolidados.financeira.valor, dadosConsolidados.financeira.meta).texto}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliente</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dadosConsolidados.cliente.valor}%</div>
            <p className="text-xs text-gray-600">Meta: {dadosConsolidados.cliente.meta}%</p>
            <Badge className={`mt-2 ${calcularDesempenho(dadosConsolidados.cliente.valor, dadosConsolidados.cliente.meta).cor} text-white`}>
              {calcularDesempenho(dadosConsolidados.cliente.valor, dadosConsolidados.cliente.meta).texto}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processos</CardTitle>
            <Settings className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dadosConsolidados.processos.valor}%</div>
            <p className="text-xs text-gray-600">Meta: {dadosConsolidados.processos.meta}%</p>
            <Badge className={`mt-2 ${calcularDesempenho(dadosConsolidados.processos.valor, dadosConsolidados.processos.meta).cor} text-white`}>
              {calcularDesempenho(dadosConsolidados.processos.valor, dadosConsolidados.processos.meta).texto}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprendizado</CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dadosConsolidados.aprendizado.valor}%</div>
            <p className="text-xs text-gray-600">Meta: {dadosConsolidados.aprendizado.meta}%</p>
            <Badge className={`mt-2 ${calcularDesempenho(dadosConsolidados.aprendizado.valor, dadosConsolidados.aprendizado.meta).cor} text-white`}>
              {calcularDesempenho(dadosConsolidados.aprendizado.valor, dadosConsolidados.aprendizado.meta).texto}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Radar */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral das 4 Perspectivas</CardTitle>
          <CardDescription>Comparação entre valores atuais e metas do grupo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={dadosRadar}>
              <PolarGrid />
              <PolarAngleAxis dataKey="perspectiva" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Valor Atual" dataKey="valor" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Radar name="Meta" dataKey="meta" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico Comparativo por Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Empresa</CardTitle>
          <CardDescription>Comparação das 4 perspectivas entre as empresas do grupo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosComparativos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="empresa" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="financeira" name="Financeira" fill="#10b981" />
              <Bar dataKey="cliente" name="Cliente" fill="#3b82f6" />
              <Bar dataKey="processos" name="Processos" fill="#f97316" />
              <Bar dataKey="aprendizado" name="Aprendizado" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detalhamento por Perspectiva */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Perspectiva Financeira
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dadosConsolidados.financeira.empresas.map((emp) => (
              <div key={emp.nome} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{emp.nome}</span>
                </div>
                <Badge variant="outline">{emp.valor}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Perspectiva Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dadosConsolidados.cliente.empresas.map((emp) => (
              <div key={emp.nome} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{emp.nome}</span>
                </div>
                <Badge variant="outline">{emp.valor}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-600" />
              Perspectiva Processos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dadosConsolidados.processos.empresas.map((emp) => (
              <div key={emp.nome} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{emp.nome}</span>
                </div>
                <Badge variant="outline">{emp.valor}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              Perspectiva Aprendizado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dadosConsolidados.aprendizado.empresas.map((emp) => (
              <div key={emp.nome} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{emp.nome}</span>
                </div>
                <Badge variant="outline">{emp.valor}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
