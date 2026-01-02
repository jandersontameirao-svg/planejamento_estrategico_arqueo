import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { FileText, Download, Building2, Target, TrendingUp, Calendar } from "lucide-react";
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Relatorios() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const reportRef = useRef<HTMLDivElement>(null);

  // Buscar dados
  const { data: identidade } = trpc.planejamentoGrupo.getIdentidade.useQuery();
  const { data: kpis } = trpc.planejamentoGrupo.getKPIs.useQuery();
  const { data: objetivos } = trpc.objetivosGrupo.list.useQuery();
  const { data: projetos } = trpc.projetosGrupo.list.useQuery();

  const handleGerarPDF = async () => {
    if (!reportRef.current) return;

    try {
      toast.info("Gerando PDF...");
      
      // Usar html2pdf para gerar o PDF
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: 10,
        filename: `relatorio-estrategico-grupo-arqueo-${anoSelecionado}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(reportRef.current).save();
      toast.success("PDF gerado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao gerar PDF: " + error.message);
    }
  };

  // Organizar KPIs por perspectiva
  const kpisPorPerspectiva = {
    financeira: kpis?.filter(k => k.perspectivaBSC === "financeira") || [],
    clientes: kpis?.filter(k => k.perspectivaBSC === "clientes") || [],
    processos: kpis?.filter(k => k.perspectivaBSC === "processos") || [],
    aprendizado: kpis?.filter(k => k.perspectivaBSC === "aprendizado") || [],
  };

  const perspectivasLabels = {
    financeira: "Financeira",
    clientes: "Clientes",
    processos: "Processos Internos",
    aprendizado: "Aprendizado e Crescimento",
  };

  const statusLabels = {
    planejado: "Planejado",
    em_andamento: "Em Andamento",
    concluido: "Concluído",
    cancelado: "Cancelado",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setLocation("/")}>
              ← Voltar
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-semibold">Relatórios Consolidados</h1>
                <p className="text-xs text-muted-foreground">Grupo Arqueo</p>
              </div>
            </div>
          </div>
          <Button onClick={handleGerarPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Relatório Estratégico Consolidado</h1>
            <p className="text-muted-foreground">
              Visão completa do planejamento estratégico do Grupo Arqueo
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label>Ano:</Label>
            <select
              className="px-3 py-2 border rounded-md"
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026, 2027, 2028].map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Conteúdo do relatório */}
        <div ref={reportRef} className="space-y-8 bg-white p-8 rounded-lg">
          {/* Cabeçalho do Relatório */}
          <div className="text-center border-b pb-6">
            <h1 className="text-4xl font-bold text-primary mb-2">Grupo Arqueo</h1>
            <h2 className="text-2xl font-semibold mb-2">Relatório Estratégico Consolidado</h2>
            <p className="text-muted-foreground">Ano: {anoSelecionado}</p>
            <p className="text-sm text-muted-foreground">
              Gerado em: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Identidade Organizacional */}
          {identidade && (
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Identidade Organizacional
              </h2>
              <div className="space-y-4">
                {identidade.missao && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Missão</h3>
                    <p className="text-muted-foreground">{identidade.missao}</p>
                  </div>
                )}
                {identidade.visao && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Visão</h3>
                    <p className="text-muted-foreground">{identidade.visao}</p>
                  </div>
                )}
                {identidade.valores && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Valores</h3>
                    <p className="text-muted-foreground">{identidade.valores}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Objetivos Estratégicos */}
          {objetivos && objetivos.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Objetivos Estratégicos
              </h2>
              <div className="space-y-4">
                {(Object.keys(perspectivasLabels) as Array<keyof typeof perspectivasLabels>).map((perspectiva) => {
                  const objetivosDaPerspectiva = objetivos.filter(o => o.perspectivaBSC === perspectiva);
                  if (objetivosDaPerspectiva.length === 0) return null;

                  return (
                    <div key={perspectiva}>
                      <h3 className="font-semibold text-lg mb-2 text-primary">
                        {perspectivasLabels[perspectiva]}
                      </h3>
                      <div className="space-y-2">
                        {objetivosDaPerspectiva.map((objetivo) => (
                          <div key={objetivo.id} className="border-l-4 border-primary pl-4 py-2">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{objetivo.titulo}</p>
                              <span className="text-xs px-2 py-1 rounded bg-gray-100">
                                {statusLabels[objetivo.status || "planejado"]}
                              </span>
                            </div>
                            {objetivo.descricao && (
                              <p className="text-sm text-muted-foreground mt-1">{objetivo.descricao}</p>
                            )}
                            {objetivo.prazo && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Prazo: {objetivo.prazo instanceof Date ? objetivo.prazo.toLocaleDateString('pt-BR') : objetivo.prazo}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* KPIs Estratégicos */}
          {kpis && kpis.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                KPIs Estratégicos (Balanced Scorecard)
              </h2>
              <div className="space-y-6">
                {(Object.keys(perspectivasLabels) as Array<keyof typeof perspectivasLabels>).map((perspectiva) => {
                  const kpisDaPerspectiva = kpisPorPerspectiva[perspectiva];
                  if (kpisDaPerspectiva.length === 0) return null;

                  return (
                    <div key={perspectiva}>
                      <h3 className="font-semibold text-lg mb-3 text-primary">
                        {perspectivasLabels[perspectiva]}
                      </h3>
                      <div className="grid gap-3">
                        {kpisDaPerspectiva.map((kpi) => (
                          <div key={kpi.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold">{kpi.nome}</p>
                                <p className="text-sm text-muted-foreground">
                                  {kpi.unidadeMedida} • {kpi.tipo} • {kpi.frequencia}
                                </p>
                              </div>
                            </div>
                            {kpi.responsavel && (
                              <p className="text-sm text-muted-foreground">
                                Responsável: {kpi.responsavel}
                              </p>
                            )}
                            <KPIChart kpiId={kpi.id} kpiNome={kpi.nome} ano={anoSelecionado} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Projetos e Iniciativas */}
          {projetos && projetos.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Projetos e Iniciativas Estratégicas
              </h2>
              <div className="space-y-3">
                {projetos.map((projeto) => (
                  <div key={projeto.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{projeto.nome}</p>
                          <span className="text-xs px-2 py-1 rounded bg-gray-100">
                            {statusLabels[projeto.status || "planejado"]}
                          </span>
                        </div>
                        {projeto.descricao && (
                          <p className="text-sm text-muted-foreground mt-1">{projeto.descricao}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {projeto.dataInicio && (
                        <span>Início: {projeto.dataInicio instanceof Date ? projeto.dataInicio.toLocaleDateString('pt-BR') : projeto.dataInicio}</span>
                      )}
                      {projeto.dataFim && (
                        <span>Fim: {projeto.dataFim instanceof Date ? projeto.dataFim.toLocaleDateString('pt-BR') : projeto.dataFim}</span>
                      )}
                      {projeto.responsavel && (
                        <span>Responsável: {projeto.responsavel}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Rodapé */}
          <div className="text-center text-sm text-muted-foreground border-t pt-6">
            <p>Grupo Arqueo - Sistema de Gestão Estratégica</p>
            <p>Documento confidencial - Uso interno</p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Componente de gráfico de KPI
function KPIChart({ kpiId, kpiNome, ano }: { kpiId: number; kpiNome: string; ano: number }) {
  const { data: valores } = trpc.kpiValores.listByKpi.useQuery({ kpiId });

  if (!valores || valores.length === 0) {
    return (
      <div className="mt-3 text-center text-sm text-muted-foreground py-4 bg-gray-50 rounded">
        Nenhum valor registrado
      </div>
    );
  }

  // Filtrar valores do ano selecionado
  const valoresDoAno = valores.filter(v => v.ano === ano);

  if (valoresDoAno.length === 0) {
    return (
      <div className="mt-3 text-center text-sm text-muted-foreground py-4 bg-gray-50 rounded">
        Nenhum valor registrado para {ano}
      </div>
    );
  }

  // Preparar dados para o gráfico
  const dadosGrafico = valoresDoAno
    .sort((a, b) => a.mes - b.mes)
    .map(v => ({
      mes: new Date(2000, v.mes - 1).toLocaleDateString('pt-BR', { month: 'short' }),
      Meta: v.meta,
      Realizado: v.realizado,
      percentual: v.meta && v.realizado ? ((Number(v.realizado) / Number(v.meta)) * 100).toFixed(1) : '0',
    }));

  return (
    <div className="mt-4">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={dadosGrafico}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Meta" stroke="#f97316" strokeWidth={2} />
          <Line type="monotone" dataKey="Realizado" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
