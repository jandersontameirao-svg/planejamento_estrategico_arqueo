import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Building2, LayoutDashboard, LogOut, CheckCircle2, Users,
  BarChart3, Target, ChevronRight, Globe, MapPin, UserCheck
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { NotificationButton } from "@/components/NotificationButton";

// Componente que exibe cada empresa dentro de uma área
function EmpresaCard({ empresa }: { empresa: any }) {
  return (
    <Card className="border border-primary/15 bg-gradient-to-br from-card to-primary/3 hover:shadow-md hover:border-primary/30 transition-all duration-200">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-br from-primary/15 to-orange-500/10 rounded-lg shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm text-foreground truncate">{empresa.nome}</h4>
              <Badge
                variant="outline"
                className={`text-xs shrink-0 ${
                  empresa.status === "ativa"
                    ? "border-green-300 text-green-700 bg-green-50"
                    : "border-gray-300 text-gray-600 bg-gray-50"
                }`}
              >
                {empresa.status === "ativa" ? "Ativa" : "Inativa"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {empresa.tipoAtuacao === "servicos"
                ? "Serviços"
                : empresa.tipoAtuacao === "produtos"
                ? "Produtos"
                : "Serviços + Produtos"}
            </p>
            <div className="flex gap-2">
              <Link href={`/empresa/${empresa.id}/planejamento`} className="flex-1">
                <Button
                  size="sm"
                  className="w-full h-7 text-xs bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700 text-white"
                >
                  <Target className="h-3 w-3 mr-1" />
                  Planejamento
                </Button>
              </Link>
              <Link href={`/empresa/${empresa.id}/dashboard-analises`} className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-xs border-primary/30 text-primary hover:bg-primary/5"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Seção de áreas com empresas agrupadas
function AreasComEmpresas() {
  const [, setLocation] = useLocation();
  const { data: areas, isLoading } = trpc.areasNegocio.listWithEmpresas.useQuery();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Carregando áreas e empresas...</p>
      </div>
    );
  }

  if (!areas || areas.length === 0) {
    return (
      <Card className="border-dashed border-2 border-purple-200">
        <CardContent className="py-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-purple-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma área de negócio cadastrada</h3>
          <p className="text-muted-foreground mb-4">Crie áreas de negócio para organizar as empresas do grupo</p>
          <Button onClick={() => setLocation("/areas-negocio")} className="bg-purple-600 hover:bg-purple-700">
            Criar Primeira Área
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {areas.map((area) => (
        <Card
          key={area.id}
          className="border-2 border-purple-200/60 hover:border-purple-300 transition-all duration-300"
        >
          {/* Cabeçalho da Área */}
          <CardHeader className="pb-3 bg-gradient-to-r from-purple-50/50 to-transparent rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-purple-800">{area.nome}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    {area.pais && (
                      <>
                        <MapPin className="h-3 w-3" />
                        {area.pais}
                        <span className="mx-1">·</span>
                      </>
                    )}
                    <span>{(area.empresas as any[]).length} empresa{(area.empresas as any[]).length !== 1 ? "s" : ""} vinculada{(area.empresas as any[]).length !== 1 ? "s" : ""}</span>
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50 text-xs"
                  onClick={() => setLocation(`/area/${area.id}/planejamento`)}
                >
                  <Target className="h-3 w-3 mr-1" />
                  Planejamento
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50 text-xs"
                  onClick={() => setLocation(`/area/${area.id}/dashboard`)}
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Dashboard
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Empresas da Área */}
          <CardContent className="pt-3">
            {(area.empresas as any[]).length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-purple-100 rounded-lg">
                <Building2 className="h-8 w-8 mx-auto text-purple-200 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma empresa vinculada a esta área</p>
                <Button
                  variant="link"
                  size="sm"
                  className="text-purple-600 text-xs mt-1"
                  onClick={() => setLocation(`/area/${area.id}/planejamento`)}
                >
                  Vincular empresas <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {(area.empresas as any[]).map((empresa: any) => (
                  <EmpresaCard key={empresa.id} empresa={empresa} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

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
        <header className="border-b bg-gradient-to-r from-card to-card/80 backdrop-blur-sm">
          <div className="container flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo-arqueo.png" alt="Grupo Arqueo" className="h-10 w-10" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-orange-500 to-orange-600 bg-clip-text text-transparent">Grupo Arqueo</span>
            </div>
            <Button asChild>
              <a href={getLoginUrl()}>Entrar</a>
            </Button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>

          <div className="container max-w-5xl text-center py-20 relative z-10">
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 via-orange-500/20 to-blue-500/10 backdrop-blur-sm border border-primary/30 mb-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <img src="/logo-arqueo.png" alt="Grupo Arqueo" className="h-16 w-16" />
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
      <header className="border-b bg-gradient-to-r from-card via-card to-card/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/logo-arqueo.png" alt="Grupo Arqueo" className="h-10 w-10" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-orange-500 to-orange-600 bg-clip-text text-transparent">Grupo Arqueo</span>
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
                  <Link href="/gestao-clientes">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Clientes
                  </Link>
                </Button>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
        <div className="container py-12 relative z-10">

          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Bem-vindo ao Sistema de Gestão Estratégica
            </h1>
            <p className="text-lg text-muted-foreground">
              Visualize e gerencie o planejamento estratégico do Grupo Arqueo
            </p>
          </div>

          {/* Card do Planejamento Estratégico do Grupo Arqueo Participações */}
          <Card
            className="mb-8 border-2 border-primary/40 bg-gradient-to-br from-primary/5 via-card to-blue-500/5 hover:shadow-2xl hover:scale-[1.01] hover:border-primary/60 transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100"
            onClick={() => setLocation("/planejamento-participacoes")}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-orange-500/10 rounded-lg">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                    Planejamento Estratégico – Grupo Arqueo Participações
                  </CardTitle>
                  <CardDescription>
                    Análises estratégicas completas do Grupo Arqueo Participações (PESTEL, SWOT, OKR, BSC e mais)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Status: Operacional</span>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700 text-white"
                onClick={(e) => { e.stopPropagation(); setLocation("/planejamento-participacoes"); }}
              >
                Acessar Planejamento Estratégico
              </Button>
            </CardContent>
          </Card>

          {/* Seção de Áreas de Negócio com Empresas agrupadas */}
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Áreas de Negócio
              </h2>
              <Button
                variant="outline"
                onClick={() => setLocation("/areas-negocio")}
                className="border-primary/30 text-primary hover:bg-primary/5"
              >
                Gerenciar Áreas
              </Button>
            </div>
            <AreasComEmpresas />
          </div>


        </div>
      </main>
    </div>
  );
}
