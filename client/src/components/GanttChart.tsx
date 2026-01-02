import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Projeto {
  id: number;
  nome: string;
  dataInicio?: string | Date | null;
  dataFim?: string | Date | null;
  status: "planejado" | "em_andamento" | "concluido" | "cancelado";
  progresso?: number;
  responsavel?: string | null;
}

interface GanttChartProps {
  projetos: Projeto[];
  height?: number;
}

export function GanttChart({ projetos, height = 400 }: GanttChartProps) {
  const ganttData = useMemo(() => {
    if (!projetos.length) return [];

    // Encontrar datas mínima e máxima
    const datas = projetos
      .filter((p) => p.dataInicio && p.dataFim)
      .flatMap((p) => [new Date(p.dataInicio!), new Date(p.dataFim!)]);

    if (datas.length === 0) return [];

    const minData = new Date(Math.min(...datas.map((d) => d.getTime())));
    const maxData = new Date(Math.max(...datas.map((d) => d.getTime())));

    // Calcular dias totais
    const diasTotais = Math.ceil(
      (maxData.getTime() - minData.getTime()) / (1000 * 60 * 60 * 24)
    );

    return projetos.map((projeto) => {
      const inicio = projeto.dataInicio ? new Date(projeto.dataInicio) : minData;
      const fim = projeto.dataFim ? new Date(projeto.dataFim) : maxData;

      const diasAteInicio = Math.ceil(
        (inicio.getTime() - minData.getTime()) / (1000 * 60 * 60 * 24)
      );
      const diasDuracao = Math.ceil(
        (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
      );

      const percentualInicio = (diasAteInicio / diasTotais) * 100;
      const percentualDuracao = (diasDuracao / diasTotais) * 100;

      return {
        id: projeto.id,
        nome: projeto.nome,
        status: projeto.status,
        progresso: projeto.progresso || 0,
        percentualInicio,
        percentualDuracao,
        dataInicio: projeto.dataInicio,
        dataFim: projeto.dataFim,
      };
    });
  }, [projetos]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planejado":
        return "bg-gray-300";
      case "em_andamento":
        return "bg-blue-500";
      case "concluido":
        return "bg-green-500";
      case "cancelado":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "planejado":
        return "Planejado";
      case "em_andamento":
        return "Em Andamento";
      case "concluido":
        return "Concluído";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  if (!ganttData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cronograma de Projetos (Gantt)</CardTitle>
          <CardDescription>Visualize o cronograma dos projetos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Nenhum projeto com datas definidas
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cronograma de Projetos (Gantt)</CardTitle>
        <CardDescription>Visualize o cronograma dos projetos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div style={{ minHeight: height }} className="space-y-3">
            {ganttData.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-48 truncate text-sm font-medium">{item.nome}</div>

                <div className="flex-1 relative h-8 bg-gray-100 rounded border border-gray-200">
                  {/* Barra de progresso */}
                  <div
                    className={`absolute h-full rounded ${getStatusColor(item.status)} transition-all`}
                    style={{
                      left: `${item.percentualInicio}%`,
                      width: `${item.percentualDuracao}%`,
                      opacity: 0.8,
                    }}
                  >
                    {/* Indicador de progresso */}
                    {item.progresso > 0 && (
                      <div
                        className="h-full bg-opacity-100 rounded transition-all"
                        style={{
                          width: `${item.progresso}%`,
                          backgroundColor: `rgba(0, 0, 0, 0.2)`,
                        }}
                      />
                    )}
                  </div>

                  {/* Texto de progresso */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white drop-shadow">
                      {item.progresso}%
                    </span>
                  </div>
                </div>

                <div className="w-32 text-right">
                  <Badge className={`${getStatusColor(item.status)} text-white`}>
                    {getStatusLabel(item.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-6 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span>Planejado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Em Andamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Cancelado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
