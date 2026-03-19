import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEmailAccess } from "@/contexts/EmailAccessContext";
import { trpc } from "@/lib/trpc";
import { Building2, LogIn, Loader2, BarChart3, Calculator, TrendingUp, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Home() {
  const { status, setAccess } = useEmailAccess();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkEmailMutation = trpc.access.checkEmail.useMutation();

  // If already approved, redirect to internal home
  useEffect(() => {
    if (status === "approved") {
      navigate("/internal");
    } else if (status === "pending") {
      navigate("/access-pending");
    }
  }, [status, navigate]);

  if (status === "approved" || status === "pending") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await checkEmailMutation.mutateAsync({ email: email.trim() });
      
      if (result.approved) {
        setAccess(result.email, true);
        toast.success("Access granted! Redirecting...");
        // Navigate will happen via the useEffect above
      } else {
        setAccess(result.email, false);
        // Navigate to holding page will happen via the useEffect above
      }
    } catch (error) {
      console.error("Email check failed:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

              {/* Email Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Enter your email to access
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  size="lg" 
                  className="w-full font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Checking access...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Continue
                    </>
                  )}
                </Button>
              </form>

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
