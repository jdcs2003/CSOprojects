import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { EmailAccessProvider } from "./contexts/EmailAccessContext";
import AccessGate from "./components/AccessGate";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import HoldingPage from "./pages/HoldingPage";
import Calculator from "@/pages/Calculator";
import CapacityTracking from "./pages/CapacityTracking";
import InternalHome from "./pages/InternalHome";
import Pipeline from "./pages/Pipeline";
import Tutorial from "./pages/Tutorial";
import UserManagement from "./pages/UserManagement";
import { lazy, Suspense } from "react";

// Lazy load admin pages
const GenerateContract = lazy(() => import("./pages/admin/GenerateContract"));
const Integrations = lazy(() => import("./pages/Integrations"));

function AdminPageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path={"/"} component={Home} />
      <Route path={"/access-pending"} component={HoldingPage} />
      
      {/* Tutorial route - requires auth but not tutorial completion */}
      <Route path={"/tutorial"} component={Tutorial} />
      
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
      
      {/* Admin routes with ProtectedRoute */}
      <Route path="/admin">
        <AccessGate><InternalHome /></AccessGate>
      </Route>
      <Route path="/admin/calculator">
        <ProtectedRoute requiredPermission="pricing">
          <Calculator />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/pipeline">
        <ProtectedRoute requiredPermission="pipeline">
          <Pipeline />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/capacity">
        <ProtectedRoute requiredPermission="capacity">
          <CapacityTracking />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/proposals/generate-contract">
        <ProtectedRoute requiredPermission="proposals">
          <Suspense fallback={<AdminPageLoader />}>
            <GenerateContract />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute requiredPermission="userManagement">
          <UserManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/integrations">
        <ProtectedRoute requiredPermission="integrations">
          <Suspense fallback={<AdminPageLoader />}>
            <Integrations />
          </Suspense>
        </ProtectedRoute>
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
