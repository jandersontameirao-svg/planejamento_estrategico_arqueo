import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Building2, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import KpiValoresDialog from "@/components/KpiValoresDialog";

interface KPIsProps {
  empresaId: number;
}

export default function KPIs({ empresaId }: KPIsProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [valoresDialogOpen, setValoresDialogOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<{ id: number; nome: string } | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    unidadeMedida: "",
    tipo: "financeiro" as "financeiro" | "operacional" | "cliente" | "processo",
    frequencia: "mensal" as "mensal" | "trimestral" | "anual",
    perspectivaBSC: "financeira" as "financeira" | "clientes" | "processos" | "aprendizado",
    responsavel: "",
  });

  const { data: kpis, isLoading, refetch } = trpc.kpis.listByEmpresa.useQuery({ empresaId });
  const { data: empresa } = trpc.empresas.getById.useQuery({ id: empresaId });

  const createMutation = trpc.kpis.create.useMutation({
    onSuccess: () => {
      toast.success("KPI criado com sucesso!");
      refetch();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      unidadeMedida: "",
      tipo: "financeiro",
      frequencia: "mensal",
      perspectivaBSC: "financeira",
      responsavel: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      empresaId,
      ...formData,
    });
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      financeiro: "Financeiro",
      operacional: "Operacional",
      cliente: "Cliente",
      processo: "Processo",
    };
    return labels[tipo] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      financeiro: "bg-arqueo-laranja text-white",
      operacional: "bg-arqueo-azul text-white",
      cliente: "bg-arqueo-bordo text-white",
      processo: "bg-arqueo-amarelo text-black",
    };
    return colors[tipo] || "bg-gray-500 text-white";
  };

  const canEdit = user?.role === "admin" || user?.role === "gestor";

  if (isLoading) {
    return (
      <div className="container py-8">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setLocation("/")}>
              ← Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <div>
                <h1 className="font-semibold">{empresa?.nome}</h1>
                <p className="text-xs text-muted-foreground">KPIs Estratégicos</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocation(`/empresa/${empresaId}/identidade`)}>
              Identidade
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLocation(`/empresa/${empresaId}/plano-acao`)}>
              Plano de Ação
            </Button>
            {canEdit && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo KPI
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Novo KPI Estratégico</DialogTitle>
                    <DialogDescription>
                      Cadastre um novo indicador de desempenho
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nome">Nome do KPI</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Ex: Faturamento Mensal"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unidadeMedida">Unidade de Medida</Label>
                      <Input
                        id="unidadeMedida"
                        value={formData.unidadeMedida}
                        onChange={(e) => setFormData({ ...formData, unidadeMedida: e.target.value })}
                        placeholder="Ex: R$, %, unidades"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                          <SelectItem value="operacional">Operacional</SelectItem>
                          <SelectItem value="cliente">Cliente</SelectItem>
                          <SelectItem value="processo">Processo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="frequencia">Frequência</Label>
                      <Select
                        value={formData.frequencia}
                        onValueChange={(value: any) => setFormData({ ...formData, frequencia: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="trimestral">Trimestral</SelectItem>
                          <SelectItem value="anual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="perspectivaBSC">Perspectiva BSC</Label>
                      <Select
                        value={formData.perspectivaBSC}
                        onValueChange={(value: any) => setFormData({ ...formData, perspectivaBSC: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="financeira">Financeira</SelectItem>
                          <SelectItem value="clientes">Clientes</SelectItem>
                          <SelectItem value="processos">Processos Internos</SelectItem>
                          <SelectItem value="aprendizado">Aprendizado e Crescimento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="responsavel">Responsável</Label>
                      <Input
                        id="responsavel"
                        value={formData.responsavel}
                        onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                        placeholder="Nome do responsável"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Criar KPI</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">KPIs Estratégicos</h1>
          <p className="text-muted-foreground">
            Indicadores de desempenho com metas e acompanhamento
          </p>
        </div>

        {kpis && kpis.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {kpis.map((kpi) => (
              <Card key={kpi.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{kpi.nome}</CardTitle>
                        <CardDescription>{kpi.unidadeMedida}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tipo:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(kpi.tipo || "financeiro")}`}>
                        {getTipoLabel(kpi.tipo || "financeiro")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Frequência:</span>
                      <span className="font-medium capitalize">{kpi.frequencia || "mensal"}</span>
                    </div>
                    {kpi.perspectivaBSC && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Perspectiva BSC:</span>
                        <span className="font-medium capitalize">{kpi.perspectivaBSC}</span>
                      </div>
                    )}
                    {kpi.responsavel && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Responsável:</span>
                        <span className="font-medium">{kpi.responsavel}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setSelectedKpi({ id: kpi.id, nome: kpi.nome });
                          setValoresDialogOpen(true);
                        }}
                      >
                        Lançar Valores
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum KPI cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro indicador de desempenho
              </p>
              {canEdit && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo KPI
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Dialog de Lançamento de Valores */}
      {selectedKpi && (
        <KpiValoresDialog
          kpiId={selectedKpi.id}
          kpiNome={selectedKpi.nome}
          open={valoresDialogOpen}
          onOpenChange={setValoresDialogOpen}
        />
      )}
    </div>
  );
}
