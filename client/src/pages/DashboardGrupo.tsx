import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Building2, Users, DollarSign, TrendingUp, Target, AlertCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Link } from "wouter";

export default function DashboardGrupo() {
  const { data: empresas = [] } = trpc.empresas.list.useQuery();
  const { data: todosIndicadores = [] } = trpc.bsc.getAll.useQuery();

  // Calcular métricas consolidadas
  const totalEmpresas = empresas.length;
  const empresasAtivas = empresas.filter(e => e.status === "ativa").length;

  // Calcular desempenho médio BSC
  const calcularDesempenhoMedio = () => {
    if (todosIndicadores.length === 0) return 0;
    const total = todosIndicadores.reduce((sum, ind) => {
      const valor = Number(ind.valorAtual || 0);
      const meta = Number(ind.meta || 1);
      return sum + (valor / meta) * 100;
    }, 0);
    return Math.round(total / todosIndicadores.length);
  };

  const desempenhoMedio = calcularDesempenhoMedio();

  // Dados para gráfico de desempenho por perspectiva
  const desempenhoPorPerspectiva = [
    { nome: "Financeira", valor: calcularMediaPerspectiva("financeira") },
    { nome: "Cliente", valor: calcularMediaPerspectiva("cliente") },
    { nome: "Processos", valor: calcularMediaPerspectiva("processos") },
    { nome: "Aprendizado", valor: calcularMediaPerspectiva("aprendizado") },
  ];

  function calcularMediaPerspectiva(perspectiva: "financeira" | "cliente" | "processos" | "aprendizado") {
    const indicadores = todosIndicadores.filter(ind => ind.perspectiva === perspectiva);
    if (indicadores.length === 0) return 0;
    const total = indicadores.reduce((sum, ind) => {
      const valor = Number(ind.valorAtual || 0);
      const meta = Number(ind.meta || 1);
      return sum + (valor / meta) * 100;
    }, 0);
    return Math.round(total / indicadores.length);
  }

  // Dados para gráfico de empresas
  const dadosEmpresas = empresas.map(empresa => {
    const indicadoresEmpresa = todosIndicadores.filter(ind => ind.empresaId === empresa.id);
    let desempenho = 0;
    if (indicadoresEmpresa.length > 0) {
      const total = indicadoresEmpresa.reduce((sum, ind) => {
        const valor = Number(ind.valorAtual || 0);
        const meta = Number(ind.meta || 1);
        return sum + (valor / meta) * 100;
      }, 0);
      desempenho = Math.round(total / indicadoresEmpresa.length);
    }
    return {
      nome: empresa.nome.length > 20 ? empresa.nome.substring(0, 20) + "..." : empresa.nome,
      desempenho,
    };
  });

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  const getStatusBadge = (valor: number) => {
    if (valor >= 90) return <Badge className="bg-green-500">Excelente</Badge>;
    if (valor >= 70) return <Badge className="bg-blue-500">Bom</Badge>;
    if (valor >= 50) return <Badge className="bg-yellow-500">Regular</Badge>;
    return <Badge className="bg-red-500">Crítico</Badge>;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Dashboard - Grupo Arqueo</h1>
        <p className="text-muted-foreground">
          Visão consolidada do desempenho de todas as empresas do grupo
        </p>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Empresas</p>
              <h3 className="text-3xl font-bold mt-2">{totalEmpresas}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {empresasAtivas} ativas
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Desempenho Médio</p>
              <h3 className="text-3xl font-bold mt-2">{desempenhoMedio}%</h3>
              <div className="mt-1">
                {getStatusBadge(desempenhoMedio)}
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Indicadores BSC</p>
              <h3 className="text-3xl font-bold mt-2">{todosIndicadores.length}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Total cadastrados
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center text-white">
              <Target className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Alertas</p>
              <h3 className="text-3xl font-bold mt-2">
                {todosIndicadores.filter(ind => {
                  const percentual = (Number(ind.valorAtual || 0) / Number(ind.meta || 1)) * 100;
                  return percentual < 50;
                }).length}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Indicadores críticos
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center text-white">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desempenho por Perspectiva BSC */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Desempenho por Perspectiva BSC</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={desempenhoPorPerspectiva}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="valor" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Desempenho por Empresa */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Desempenho por Empresa</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosEmpresas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="desempenho" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Lista de Empresas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Empresas do Grupo</h3>
        <div className="space-y-4">
          {empresas.map(empresa => {
            const indicadoresEmpresa = todosIndicadores.filter(ind => ind.empresaId === empresa.id);
            let desempenho = 0;
            if (indicadoresEmpresa.length > 0) {
              const total = indicadoresEmpresa.reduce((sum, ind) => {
                const valor = Number(ind.valorAtual || 0);
                const meta = Number(ind.meta || 1);
                return sum + (valor / meta) * 100;
              }, 0);
              desempenho = Math.round(total / indicadoresEmpresa.length);
            }

            return (
              <Link key={empresa.id} href={`/empresa/${empresa.id}/planejamento`}>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{empresa.nome}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {empresa.tipoAtuacao?.replace("_", " e ")} • {indicadoresEmpresa.length} indicadores
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{desempenho}%</div>
                      <div className="text-xs text-muted-foreground">Desempenho</div>
                    </div>
                    {getStatusBadge(desempenho)}
                    <Badge variant={empresa.status === "ativa" ? "default" : "secondary"}>
                      {empresa.status === "ativa" ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
