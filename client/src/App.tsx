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
import CincoForcasPorter from "./pages/CincoForcasPorter";
import AnaliseStakeholders from "./pages/AnaliseStakeholders";
import AnaliseRbvVrio from "./pages/AnaliseRbvVrio";
import AnaliseSwoTtows from "./pages/AnaliseSwoTtows";
import AnalisesVRIO from "./pages/AnalisesVRIO";
import PlanejamentoEstrategico from "./pages/PlanejamentoEstrategico";
import DashboardResumoExecutivo from "./pages/DashboardResumoExecutivo";
import PlanejamentoEstrategicoEmpresa from "./pages/PlanejamentoEstrategicoEmpresa";
import PlanejamentoMacro from "./pages/PlanejamentoMacro";
import DashboardGrupo from "./pages/DashboardGrupo";
import ConfigurarTemplate from "./pages/ConfigurarTemplate";


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
      <Route path="/cinco-forcas-porter/:id" component={CincoForcasPorter} />
      <Route path="/analise-stakeholders/:id" component={AnaliseStakeholders} />
      <Route path="/analise-rbv-vrio/:id" component={AnaliseRbvVrio} />
      <Route path="/analise-swot-tows/:id" component={AnaliseSwoTtows} />
      <Route path="/analises-vrio" component={AnalisesVRIO} />
      <Route path="/planejamento-macro" component={PlanejamentoMacro} />
      <Route path="/empresa/:id/planejamento">
        {(params) => <PlanejamentoEstrategicoEmpresa empresaId={Number(params.id)} empresaNome="Empresa" />}
      </Route>
      <Route path="/planejamento-estrategico/:id?">
        {(params) => <PlanejamentoEstrategico empresaId={params.id ? Number(params.id) : 1} />}
      </Route>
      <Route path="/empresa/:empresaId/configurar-template" component={ConfigurarTemplate} />
      <Route path="/resumo-executivo" component={DashboardResumoExecutivo} />
      <Route path="/planejamento-grupo" component={PlanejamentoGrupo} />
      <Route path="/relatorios" component={Relatorios} />
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
