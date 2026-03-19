import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { EmailAccessProvider } from "./contexts/EmailAccessContext";
import AccessGate from "./components/AccessGate";
import Home from "./pages/Home";
import HoldingPage from "./pages/HoldingPage";
import Calculator from "@/pages/Calculator";
import CapacityTracking from "./pages/CapacityTracking";
import InternalHome from "./pages/InternalHome";
import Pipeline from "./pages/Pipeline";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path={"/"} component={Home} />
      <Route path={"/access-pending"} component={HoldingPage} />
      
      {/* Protected routes - require email whitelist approval */}
      <Route path={"/internal"}>
        <AccessGate><InternalHome /></AccessGate>
      </Route>
      <Route path={"/calculator"}>
        <AccessGate><Calculator /></AccessGate>
      </Route>
      <Route path="/capacity">
        <AccessGate><CapacityTracking /></AccessGate>
      </Route>
      <Route path="/pipeline">
        <AccessGate><Pipeline /></AccessGate>
      </Route>
      
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
        <EmailAccessProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </EmailAccessProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
