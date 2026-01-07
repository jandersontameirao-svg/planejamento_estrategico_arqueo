import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Building2, LayoutDashboard, LogOut, FileText, CheckCircle2, Users, Bell, BarChart3, Target } from "lucide-react";
import { Link, useLocation } from "wouter";
import { NotificationButton } from "@/components/NotificationButton";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: empresas, isLoading: loadingEmpresas } = trpc.empresas.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-card">
          <div className="container flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src="/logo-arqueo.svg" alt="Grupo Arqueo" className="h-8 w-8" />
              <span className="text-xl font-bold">Grupo Arqueo</span>
            </div>
            <Button asChild>
              <a href={getLoginUrl()}>Entrar</a>
            </Button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center relative overflow-hidden">
          {/* Background com gradiente animado */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
          
          <div className="container max-w-5xl text-center py-20 relative z-10">
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/20 mb-8 shadow-2xl">
                <img src="/logo-arqueo.svg" alt="Grupo Arqueo" className="h-14 w-14" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Planejamento Estratégico
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Transforme a visão do <span className="font-semibold text-primary">Grupo Arqueo</span> em ações estratégicas mensuráveis
              </p>
              <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <a href={getLoginUrl()} className="gap-2">
                  <LogOut className="h-5 w-5 rotate-180" />
                  Acessar Plataforma
                </a>
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Multiempresa</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Gerencie múltiplas empresas do grupo em uma única plataforma integrada
                  </p>
                </CardContent>
              </Card>
              <Card className="border-accent/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-3">
                    <CheckCircle2 className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">KPIs e Metas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe indicadores estratégicos com visões mensais e anuais
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Governança</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Trilha de auditoria completa e controle de acesso por perfil
                  </p>
                </CardContent>
              </Card>
            </div>

            <Button size="lg" asChild>
              <a href={getLoginUrl()}>Acessar Sistema</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Grupo Arqueo</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {user?.role === "admin" ? "Administrador" : user?.role === "gestor" ? "Gestor" : "Usuário"}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard-comparativo">
                <BarChart3 className="mr-2 h-4 w-4" />
                Comparativo
              </Link>
            </Button>
            {user?.role === "admin" && (
              <>
                <NotificationButton />
                <Button variant="outline" size="sm" asChild>
                  <Link href="/empresas">
                    <Building2 className="mr-2 h-4 w-4" />
                    Gerenciar Empresas
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/gestao-usuarios">
                    <Users className="mr-2 h-4 w-4" />
                    Usuários
                  </Link>
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
        <div className="container py-12 relative z-10">
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Bem-vindo ao Sistema de Gestão Estratégica
          </h1>
          <p className="text-lg text-muted-foreground">
            Selecione uma empresa para visualizar o planejamento estratégico
          </p>
        </div>

        {/* Card do Planejamento Estratégico do Grupo */}
        <Card className="mb-10 border-2 border-primary/30 bg-gradient-to-br from-card to-primary/5 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150" onClick={() => setLocation("/planejamento-grupo")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Planejamento Estratégico – Grupo Arqueo</CardTitle>
                <CardDescription>Análises estratégicas completas do Grupo (PESTEL, SWOT, OKR, BSC e mais)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-muted-foreground">Status: Operacional</span>
            </div>
            <Button variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); setLocation("/planejamento-grupo"); }}>
              Acessar Planejamento Estratégico
            </Button>
          </CardContent>
        </Card>

        {/* Cards de Empresas */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <h2 className="text-3xl font-bold mb-6">Empresas do Grupo</h2>
          {loadingEmpresas ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando empresas...</p>
            </div>
          ) : empresas && empresas.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {empresas.map((empresa) => (
                <Card key={empresa.id} className="hover:shadow-lg transition-shadow h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{empresa.nome}</CardTitle>
                          <CardDescription>
                            {empresa.tipoAtuacao === "servicos"
                              ? "Serviços"
                              : empresa.tipoAtuacao === "produtos"
                              ? "Produtos"
                              : "Serviços + Produtos"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              empresa.status === "ativa"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {empresa.status === "ativa" ? "Ativa" : "Inativa"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-xs text-muted-foreground">
                            Status RAG: Verde
                          </span>
                        </div>
                        
                        {/* Botões de ação */}
                        <div className="flex gap-2 mt-4">
                          <Link href={`/empresa/${empresa.id}/planejamento`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Target className="h-4 w-4 mr-2" />
                              Planejamento
                            </Button>
                          </Link>
                          <Link href={`/empresa/${empresa.id}/dashboard-analises`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 hover:from-blue-500/20 hover:to-purple-500/20">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Dashboard
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma empresa cadastrada</h3>
                <p className="text-muted-foreground mb-4">
                  {user?.role === "admin"
                    ? "Comece criando sua primeira empresa"
                    : "Entre em contato com o administrador para vincular empresas"}
                </p>
                {user?.role === "admin" && (
                  <Button asChild>
                    <Link href="/empresas">
                      <Building2 className="mr-2 h-4 w-4" />
                      Criar Primeira Empresa
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
