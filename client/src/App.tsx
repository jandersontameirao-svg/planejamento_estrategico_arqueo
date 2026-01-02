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


function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/empresas" component={Empresas} />
      <Route path="/empresa/:id/identidade">
        {(params) => <IdentidadeOrganizacional empresaId={Number(params.id)} />}
      </Route>
      <Route path="/empresa/:id/kpis">
        {(params) => <KPIs empresaId={Number(params.id)} />}
      </Route>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/planejamento-grupo" component={PlanejamentoGrupo} />
      <Route path="/relatorios" component={Relatorios} />
      <Route path={"/404"} component={NotFound} />
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
