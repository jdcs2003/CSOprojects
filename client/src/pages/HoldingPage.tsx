import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { Clock, Mail, ArrowLeft } from "lucide-react";

export default function HoldingPage() {
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    window.location.href = "/";
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
        <div className="max-w-lg w-full">
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center space-y-4 pb-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Clock className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl">Your Request Has Been Received</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-3">
                <p className="text-muted-foreground">
                  Thank you for your interest. Your access request for <span className="font-semibold text-foreground">{user?.email || user?.name}</span> is being reviewed.
                </p>
                <p className="text-muted-foreground">
                  Please contact us if you don't hear back within 24 hours:
                </p>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:sales@lmwarehousing.com" className="hover:underline">
                    sales@lmwarehousing.com
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Sign Out & Try Different Account
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            L&M Distribution and Logistics
          </p>
        </div>
      </main>
    </div>
  );
}
