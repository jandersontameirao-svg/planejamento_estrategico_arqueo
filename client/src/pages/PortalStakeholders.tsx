import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, Download, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface PortalStakeholdersProps {
  token?: string;
}

export default function PortalStakeholders({ token }: PortalStakeholdersProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Dados de exemplo para demonstração
  const projetosData = [
    { nome: "Projeto A", progresso: 75, status: "em_andamento" },
    { nome: "Projeto B", progresso: 50, status: "em_andamento" },
    { nome: "Projeto C", progresso: 100, status: "concluido" },
    { nome: "Projeto D", progresso: 25, status: "planejado" },
  ];

  const statusData = [
    { name: "Planejado", value: 1 },
    { name: "Em Andamento", value: 2 },
    { name: "Concluido", value: 1 },
    { name: "Cancelado", value: 0 },
  ];

  const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#6b7280"];

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

  const handleExportPDF = () => {
    alert("Exportação em PDF será implementada em breve!");
  };

  const handleExportCSV = () => {
    alert("Exportação em CSV será implementada em breve!");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Share2 className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-bold text-lg">Portal de Stakeholders</h1>
              <p className="text-sm text-muted-foreground">Visualização compartilhada de projetos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Ocultar Detalhes
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Mostrar Detalhes
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Resumo Executivo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4</div>
                <p className="text-sm text-muted-foreground">Total de Projetos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">2</div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">1</div>
                <p className="text-sm text-muted-foreground">Concluidos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">63%</div>
                <p className="text-sm text-muted-foreground">Progresso Medio</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Distribuicao de Projetos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progresso dos Projetos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projetosData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="progresso" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Projetos */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos em Acompanhamento</CardTitle>
            <CardDescription>
              {showDetails
                ? "Visualizando todos os detalhes dos projetos"
                : "Visualizando informações resumidas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projetosData.map((projeto, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{projeto.nome}</h3>
                      {showDetails && (
                        <p className="text-sm text-muted-foreground">
                          Progresso: {projeto.progresso}%
                        </p>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(projeto.status)} text-white`}>
                      {projeto.status.replace("_", " ")}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${projeto.progresso}%` }}
                    />
                  </div>

                  {showDetails && (
                    <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                      <p>Progresso: {projeto.progresso}%</p>
                      <p>Status: {projeto.status.replace("_", " ")}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rodape */}
        <div className="mt-8 text-center text-sm text-muted-foreground border-t pt-4">
          <p>Este é um portal compartilhado de acompanhamento de projetos</p>
          <p>Para mais informações, entre em contato com o gerenciador do projeto</p>
        </div>
      </main>
    </div>
  );
}
