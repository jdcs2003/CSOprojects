import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Clock, Building2 } from "lucide-react";

export default function Home() {
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
          {/* Expiration Notice Card */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center space-y-4 pb-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl">Quote Has Expired</CardTitle>
                <CardDescription className="text-base mt-2">
                  This proposal is no longer active
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Thank you for your interest in L&M Distribution and Logistics warehousing services. 
                  This specific proposal has expired and is no longer available.
                </p>
                
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg space-y-3">
                  <p className="font-semibold text-lg">Interested in our services?</p>
                  <p className="text-sm text-muted-foreground">
                    Our team is ready to create a new custom proposal tailored to your current needs.
                  </p>
                </div>
              </div>

              {/* Contact Section */}
              <div className="pt-4 border-t">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-5 w-5" />
                    <span className="text-sm">Contact our sales team:</span>
                  </div>
                  <Button 
                    size="lg"
                    onClick={() => window.location.href = 'mailto:sales@lmwarehousing.com'}
                    className="font-semibold"
                  >
                    sales@lmwarehousing.com
                  </Button>
                </div>
              </div>

              {/* Services Overview */}
              <div className="pt-6 border-t">
                <p className="text-sm font-semibold mb-3 text-center">Our Warehousing Services Include:</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Climate-controlled storage</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Bonded warehouse options</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Multi-state distribution</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>WMS technology integration</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <p className="text-center text-sm text-muted-foreground">
            L&M Distribution and Logistics • Serving PA, NJ, SC, and beyond
          </p>
        </div>
      </main>
    </div>
  );
}
