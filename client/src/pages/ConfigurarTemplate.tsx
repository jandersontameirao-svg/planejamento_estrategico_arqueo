import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, FileText, Palette } from "lucide-react";

export default function ConfigurarTemplate() {
  const { empresaId } = useParams<{ empresaId: string }>();
  const [, setLocation] = useLocation();
  const empresaIdNum = parseInt(empresaId || "0");

  const { data: empresa } = trpc.empresas.getById.useQuery({ id: empresaIdNum });
  const { data: config, isLoading } = trpc.templates.getConfig.useQuery({ empresaId: empresaIdNum });

  const [corPrimaria, setCorPrimaria] = useState("#8B1538");
  const [corSecundaria, setCorSecundaria] = useState("#FF6B35");
  const [incluirPestel, setIncluirPestel] = useState(true);
  const [incluirSwot, setIncluirSwot] = useState(true);
  const [incluirOkr, setIncluirOkr] = useState(true);
  const [incluirBsc, setIncluirBsc] = useState(true);
  const [incluirGraficos, setIncluirGraficos] = useState(true);
  const [incluirRecomendacoes, setIncluirRecomendacoes] = useState(true);
  const [rodapePersonalizado, setRodapePersonalizado] = useState("");

  const saveConfigMutation = trpc.templates.saveConfig.useMutation({
    onSuccess: () => {
      alert("✅ Configuração de template salva com sucesso!");
    },
    onError: (error) => {
      alert(`❌ Erro ao salvar: ${error.message}`);
    },
  });

  // Carregar configuração existente
  useEffect(() => {
    if (config) {
      setCorPrimaria(config.corPrimaria);
      setCorSecundaria(config.corSecundaria);
      setIncluirPestel(!!config.incluirPestel);
      setIncluirSwot(!!config.incluirSwot);
      setIncluirOkr(!!config.incluirOkr);
      setIncluirBsc(!!config.incluirBsc);
      setIncluirGraficos(!!config.incluirGraficos);
      setIncluirRecomendacoes(!!config.incluirRecomendacoes);
      setRodapePersonalizado(config.rodapePersonalizado || "");
    }
  }, [config]);

  const handleSave = () => {
    saveConfigMutation.mutate({
      empresaId: empresaIdNum,
      corPrimaria,
      corSecundaria,
      incluirPestel,
      incluirSwot,
      incluirOkr,
      incluirBsc,
      incluirGraficos,
      incluirRecomendacoes,
      rodapePersonalizado: rodapePersonalizado || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation(`/planejamento-estrategico/${empresaId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-xl font-bold">Configurar Template de Relatórios</h1>
              <p className="text-sm text-muted-foreground">{empresa?.nome}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurações */}
          <div className="space-y-6">
            {/* Cores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Cores do Template
                </CardTitle>
                <CardDescription>
                  Personalize as cores utilizadas nos relatórios PDF
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="corPrimaria">Cor Primária (Cabeçalho)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="corPrimaria"
                      type="color"
                      value={corPrimaria}
                      onChange={(e) => setCorPrimaria(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={corPrimaria}
                      onChange={(e) => setCorPrimaria(e.target.value)}
                      placeholder="#8B1538"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="corSecundaria">Cor Secundária (Destaques)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="corSecundaria"
                      type="color"
                      value={corSecundaria}
                      onChange={(e) => setCorSecundaria(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={corSecundaria}
                      onChange={(e) => setCorSecundaria(e.target.value)}
                      placeholder="#FF6B35"
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seções */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Seções do Relatório
                </CardTitle>
                <CardDescription>
                  Selecione quais seções devem aparecer nos relatórios exportados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluirPestel"
                    checked={incluirPestel}
                    onCheckedChange={(checked) => setIncluirPestel(!!checked)}
                  />
                  <Label htmlFor="incluirPestel" className="cursor-pointer">
                    Incluir Análise PESTEL
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluirSwot"
                    checked={incluirSwot}
                    onCheckedChange={(checked) => setIncluirSwot(!!checked)}
                  />
                  <Label htmlFor="incluirSwot" className="cursor-pointer">
                    Incluir Análise SWOT
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluirOkr"
                    checked={incluirOkr}
                    onCheckedChange={(checked) => setIncluirOkr(!!checked)}
                  />
                  <Label htmlFor="incluirOkr" className="cursor-pointer">
                    Incluir OKRs
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluirBsc"
                    checked={incluirBsc}
                    onCheckedChange={(checked) => setIncluirBsc(!!checked)}
                  />
                  <Label htmlFor="incluirBsc" className="cursor-pointer">
                    Incluir Balanced Scorecard
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluirGraficos"
                    checked={incluirGraficos}
                    onCheckedChange={(checked) => setIncluirGraficos(!!checked)}
                  />
                  <Label htmlFor="incluirGraficos" className="cursor-pointer">
                    Incluir Gráficos e Visualizações
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluirRecomendacoes"
                    checked={incluirRecomendacoes}
                    onCheckedChange={(checked) => setIncluirRecomendacoes(!!checked)}
                  />
                  <Label htmlFor="incluirRecomendacoes" className="cursor-pointer">
                    Incluir Recomendações Estratégicas
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Rodapé */}
            <Card>
              <CardHeader>
                <CardTitle>Rodapé Personalizado</CardTitle>
                <CardDescription>
                  Texto adicional para o rodapé dos relatórios (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={rodapePersonalizado}
                  onChange={(e) => setRodapePersonalizado(e.target.value)}
                  placeholder="Ex: Documento confidencial - Uso interno apenas"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Salvar */}
            <Button
              onClick={handleSave}
              disabled={saveConfigMutation.isPending}
              className="w-full gap-2 bg-primary hover:bg-primary/90"
            >
              <Save className="h-4 w-4" />
              {saveConfigMutation.isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>

          {/* Preview */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Preview do Template</CardTitle>
                <CardDescription>
                  Visualização aproximada do cabeçalho do relatório
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  {/* Cabeçalho Preview */}
                  <div
                    className="p-6 text-white"
                    style={{ backgroundColor: corPrimaria }}
                  >
                    <h2 className="text-2xl font-bold text-center mb-2">
                      Relatório Estratégico
                    </h2>
                    <p className="text-center text-sm opacity-90">{empresa?.nome}</p>
                    <p className="text-center text-xs opacity-75 mt-2">
                      Gerado em: {new Date().toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  {/* Conteúdo Preview */}
                  <div className="p-6 bg-white space-y-4">
                    {incluirPestel && (
                      <div className="border-l-4 pl-3" style={{ borderColor: corSecundaria }}>
                        <h3 className="font-semibold">Análise PESTEL</h3>
                        <p className="text-sm text-muted-foreground">Fatores macro-ambientais...</p>
                      </div>
                    )}

                    {incluirSwot && (
                      <div className="border-l-4 pl-3" style={{ borderColor: corSecundaria }}>
                        <h3 className="font-semibold">Análise SWOT</h3>
                        <p className="text-sm text-muted-foreground">Forças, Fraquezas, Oportunidades...</p>
                      </div>
                    )}

                    {incluirOkr && (
                      <div className="border-l-4 pl-3" style={{ borderColor: corSecundaria }}>
                        <h3 className="font-semibold">OKRs</h3>
                        <p className="text-sm text-muted-foreground">Objetivos e Key Results...</p>
                      </div>
                    )}

                    {incluirBsc && (
                      <div className="border-l-4 pl-3" style={{ borderColor: corSecundaria }}>
                        <h3 className="font-semibold">Balanced Scorecard</h3>
                        <p className="text-sm text-muted-foreground">Indicadores por perspectiva...</p>
                      </div>
                    )}

                    {incluirGraficos && (
                      <div className="bg-muted/50 p-3 rounded text-center text-sm text-muted-foreground">
                        [Gráficos e Visualizações]
                      </div>
                    )}

                    {incluirRecomendacoes && (
                      <div className="bg-blue-50 p-3 rounded">
                        <h4 className="font-semibold text-sm text-blue-900">Recomendações</h4>
                        <p className="text-xs text-blue-700 mt-1">Insights estratégicos...</p>
                      </div>
                    )}
                  </div>

                  {/* Rodapé Preview */}
                  {rodapePersonalizado && (
                    <div className="border-t p-3 bg-muted/30 text-center text-xs text-muted-foreground">
                      {rodapePersonalizado}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
