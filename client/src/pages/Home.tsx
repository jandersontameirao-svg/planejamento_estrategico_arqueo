import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Building2, LayoutDashboard, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";

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
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Planejamento Estratégico</span>
            </div>
            <Button asChild>
              <a href={getLoginUrl()}>Entrar</a>
            </Button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-background to-muted">
          <div className="container max-w-4xl text-center py-16">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4">
                Sistema de Gestão Estratégica
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Planejamento estratégico corporativo para o Grupo Arqueo
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Multiempresa</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Gerencie múltiplas empresas do grupo em uma única plataforma
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">KPIs e Metas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe indicadores estratégicos com visões mensais e anuais
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
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
            {user?.role === "admin" && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/empresas">
                  <Building2 className="mr-2 h-4 w-4" />
                  Gerenciar Empresas
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo ao Sistema de Gestão Estratégica</h1>
          <p className="text-muted-foreground">
            Selecione uma empresa para visualizar o planejamento estratégico
          </p>
        </div>

        {/* Card do Planejamento Macro do Grupo */}
        <Card className="mb-8 border-2 border-primary/20 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/planejamento-grupo")}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <LayoutDashboard className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Planejamento Macro – Grupo Arqueo</CardTitle>
                <CardDescription>Visão consolidada do grupo empresarial</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-muted-foreground">Status: Operacional</span>
            </div>
            <Button variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); setLocation("/planejamento-grupo"); }}>
              Acessar Planejamento Macro
            </Button>
          </CardContent>
        </Card>

        {/* Cards de Empresas */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Empresas do Grupo</h2>
          {loadingEmpresas ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando empresas...</p>
            </div>
          ) : empresas && empresas.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {empresas.map((empresa) => (
                <Link key={empresa.id} href={`/empresa/${empresa.id}/identidade`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
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
                      </div>
                    </CardContent>
                  </Card>
                </Link>
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
                      Gerenciar Empresas
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
