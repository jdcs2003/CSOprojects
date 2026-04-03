import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Building2, LogIn, Loader2, BarChart3, Calculator, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // If already authenticated, redirect to internal home
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/internal");
    }
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/lm-logo.jpg" alt="L&M Distribution and Logistics" className="h-12 w-auto" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8">
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center space-y-4 pb-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl">L&M Distribution & Logistics</CardTitle>
                <CardDescription className="text-base mt-2">
                  Pricing Calculator & Sales Pipeline
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features Overview */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-slate-100 dark:bg-slate-800 space-y-2">
                  <Calculator className="h-6 w-6 mx-auto text-primary" />
                  <p className="text-sm font-medium">Pricing Calculator</p>
                  <p className="text-xs text-muted-foreground">Warehouse & logistics quotes</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-100 dark:bg-slate-800 space-y-2">
                  <BarChart3 className="h-6 w-6 mx-auto text-primary" />
                  <p className="text-sm font-medium">Sales Pipeline</p>
                  <p className="text-xs text-muted-foreground">Deal tracking & forecasting</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-100 dark:bg-slate-800 space-y-2">
                  <TrendingUp className="h-6 w-6 mx-auto text-primary" />
                  <p className="text-sm font-medium">Capacity Tracking</p>
                  <p className="text-xs text-muted-foreground">Facility utilization</p>
                </div>
              </div>

              {/* OAuth Sign In Button */}
              <div className="pt-4">
                <Button 
                  size="lg" 
                  className="w-full font-semibold"
                  onClick={handleLogin}
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In with L&M Account
                </Button>
              </div>

              {/* Footer Info */}
              <p className="text-center text-xs text-muted-foreground pt-2">
                Internal tool for authorized L&M team members only.
              </p>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <p className="text-center text-sm text-muted-foreground">
            L&M Distribution and Logistics &bull; Serving PA, NJ, SC, and beyond
          </p>
        </div>
      </main>
    </div>
  );
}
