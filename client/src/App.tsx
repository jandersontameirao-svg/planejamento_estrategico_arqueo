import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Empresas from "./pages/Empresas";
import IdentidadeOrganizacional from "./pages/IdentidadeOrganizacional";
import KPIs from "./pages/KPIs";
import Dashboard from "./pages/Dashboard";
import PlanejamentoGrupo from "./pages/PlanejamentoGrupo";
import Relatorios from "./pages/Relatorios";
import PlanoAcaoEmpresa from "./pages/PlanoAcaoEmpresa";
import MatrizRiscoEmpresa from "./pages/MatrizRiscoEmpresa";
import ObjetivosEmpresa from "./pages/ObjetivosEmpresa";
import ProjetosEmpresa from "./pages/ProjetosEmpresa";
import DashboardEmpresa from "./pages/DashboardEmpresa";
import AnalisePreditiva from "./pages/AnalisePreditiva";
import PortalStakeholders from "./pages/PortalStakeholders";
import DashboardComparativo from "./pages/DashboardComparativo";
import DashboardAnalises from "./pages/DashboardAnalises";
import GestaoUsuarios from "./pages/GestaoUsuarios";
import AnalisePestel from "./pages/AnalisePestel";
import AnaliseSwoTtows from "./pages/AnaliseSwoTtows";
import PlanejamentoEstrategico from "./pages/PlanejamentoEstrategico";
import DashboardResumoExecutivo from "./pages/DashboardResumoExecutivo";
import PlanejamentoEstrategicoEmpresa from "./pages/PlanejamentoEstrategicoEmpresa";
import PlanejamentoMacro from "./pages/PlanejamentoMacro";
import DashboardGrupo from "./pages/DashboardGrupo";
import ConfigurarTemplate from "./pages/ConfigurarTemplate";
import PlanejamentoEstrategicoGrupo from "./pages/PlanejamentoEstrategicoGrupo";
import DashboardAnalisesGrupo from "./pages/DashboardAnalisesGrupo";
import PlanejamentoEstrategicoParticipacoes from "./pages/PlanejamentoEstrategicoParticipacoes";
import DashboardAnalisesParticipacoes from "./pages/DashboardAnalisesParticipacoes";
import GestaoOrcamentaria from "./pages/GestaoOrcamentaria";
import AreasNegocio from "./pages/AreasNegocio";
import Contratos from "./pages/Contratos";
import ContratoDetalhe from "./pages/ContratoDetalhe";
import ContratosClientes from "./pages/ContratosClientes";
import GestaoClienteDetalhe from "./pages/GestaoClienteDetalhe";

import PlanejamentoEstrategicoArea from "./pages/PlanejamentoEstrategicoArea";
import DashboardAnalisesArea from "./pages/DashboardAnalisesArea";
import AprovacaoBoletim from "./pages/AprovacaoBoletim";
import GestaoRiscos from "./pages/GestaoRiscos";


function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
       <Route path="/" component={Home} />
      <Route path="/dashboard-grupo" component={DashboardGrupo} />
      <Route path="/empresas" component={Empresas} />
      <Route path="/empresa/:id/identidade">
        {(params) => <IdentidadeOrganizacional empresaId={Number(params.id)} />}
      </Route>
      <Route path="/empresa/:id/kpis">
        {(params) => <KPIs empresaId={Number(params.id)} />}
      </Route>
      <Route path="/empresa/:id/plano-acao">
        {(params) => <PlanoAcaoEmpresa empresaId={Number(params.id)} />}
      </Route>
       <Route path="/empresa/:id/matriz-risco" component={MatrizRiscoEmpresa} />
      <Route path="/empresa/:id/objetivos">
        {(params) => <ObjetivosEmpresa empresaId={Number(params.id)} />}
      </Route>
      <Route path="/empresa/:id/projetos">
        {(params) => <ProjetosEmpresa empresaId={Number(params.id)} />}
      </Route>
      <Route path="/empresa/:id/dashboard">
        {(params) => <DashboardEmpresa empresaId={Number(params.id)} />}
      </Route>
      <Route path="/empresa/:id/analise-preditiva">
        {(params) => <AnalisePreditiva empresaId={Number(params.id)} />}
      </Route>
      <Route path="/portal-stakeholders/:token">
        {(params) => <PortalStakeholders token={params.token} />}
      </Route>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard-comparativo" component={DashboardComparativo} />
      <Route path="/empresa/:id/dashboard-analises" component={DashboardAnalises} />
      <Route path="/gestao-usuarios" component={GestaoUsuarios} />
      <Route path="/analise-pestel/:id" component={AnalisePestel} />
      <Route path="/analise-swot-tows/:id" component={AnaliseSwoTtows} />
      <Route path="/empresa/:id/planejamento">
        {(params) => <PlanejamentoEstrategicoEmpresa empresaId={Number(params.id)} empresaNome="Empresa" />}
      </Route>
      <Route path="/planejamento-estrategico/:id?">
        {(params) => <PlanejamentoEstrategico empresaId={params.id ? Number(params.id) : 1} />}
      </Route>
      <Route path="/empresa/:empresaId/configurar-template" component={ConfigurarTemplate} />
      <Route path="/resumo-executivo" component={DashboardResumoExecutivo} />
      <Route path="/planejamento-grupo" component={PlanejamentoEstrategicoGrupo} />
      <Route path="/dashboard-analises-grupo" component={DashboardAnalisesGrupo} />
      <Route path="/planejamento-participacoes" component={PlanejamentoEstrategicoParticipacoes} />
      <Route path="/dashboard-analises-participacoes" component={DashboardAnalisesParticipacoes} />
      <Route path="/areas-negocio" component={AreasNegocio} />
      <Route path="/area/:id/planejamento" component={PlanejamentoEstrategicoArea} />
      <Route path="/area/:id/dashboard" component={DashboardAnalisesArea} />
      <Route path="/empresa/:id/orcamento">
        {(params) => <GestaoOrcamentaria empresaId={Number(params.id)} />}
      </Route>
      <Route path="/empresa/:id/contratos">
        {(params) => <Contratos empresaId={Number(params.id)} />}
      </Route>
      <Route path="/empresa/:id/contratos/clientes">
        {(params) => <ContratosClientes empresaId={Number(params.id)} />}
      </Route>
      <Route path="/empresa/:id/contratos/:contratoId">
        {(params) => <ContratoDetalhe empresaId={Number(params.id)} contratoId={Number(params.contratoId)} />}
      </Route>
      <Route path="/planejamento-macro" component={PlanejamentoMacro} />
      <Route path="/relatorios" component={Relatorios} />
      <Route path="/aprovacao/:token" component={AprovacaoBoletim} />
      <Route path="/gestao-clientes/:id" component={GestaoClienteDetalhe} />
      <Route path="/empresa/:id/gestao-riscos">
        {(params) => <GestaoRiscos />}
      </Route>
      <Route path="/gestao-contratos">{() => { window.location.replace("/empresas"); return null; }}</Route>
      <Route path="/gestao-contratos/novo">{() => { window.location.replace("/empresas"); return null; }}</Route>
      <Route path="/gestao-contratos/:id">{() => { window.location.replace("/empresas"); return null; }}</Route>
      <Route path={"/ 404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
