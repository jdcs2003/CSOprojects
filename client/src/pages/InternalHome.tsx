import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Building2, ArrowRight, TrendingUp, LogOut, Users, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useEmailAccess } from "@/contexts/EmailAccessContext";
import { trpc } from "@/lib/trpc";

export default function InternalHome() {
  const [, setLocation] = useLocation();
  const { email, clearAccess } = useEmailAccess();
  const { data: adminAccess } = trpc.admin.checkAdminAccess.useQuery(undefined, { retry: false });
  const showUserManagement = adminAccess?.hasAccess && (adminAccess?.permissions as any)?.userManagement;

  const handleSignOut = () => {
    clearAccess();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold">L&M Internal Tools</h1>
              <p className="text-xs text-muted-foreground">Pricing & Capacity Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {email && (
              <span className="text-xs text-muted-foreground hidden sm:block">{email}</span>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
            <img src="/images/lm-logo.jpg" alt="L&M Distribution" className="h-10 w-auto" />
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Welcome to L&M Internal Tools</h2>
            <p className="text-muted-foreground text-lg">
              Access pricing calculators and capacity tracking for all L&M facilities
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Pricing Calculator Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/calculator")}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Calculator className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>Pricing Calculator</CardTitle>
                    <CardDescription>Deal analysis & FTE planning</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Calculate true costs, FTE requirements, and recommended billing rates for client deals across all facilities.
                </p>
                
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Features:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Facility cost comparison (5 locations)</li>
                    <li>• Labor & occupancy cost analysis</li>
                    <li>• FTE requirement calculations</li>
                    <li>• Recommended billing rates with margin</li>
                  </ul>
                </div>

                <Button className="w-full" onClick={() => setLocation("/calculator")}>
                  Open Calculator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Pipeline Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500" onClick={() => setLocation("/pipeline")}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>Sales Pipeline</CardTitle>
                    <CardDescription>Deal tracking & forecasting</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Track all proposals and deals through the sales pipeline. Monitor revenue forecasts and deal stages.
                </p>
                
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Features:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Kanban board & table views</li>
                    <li>• Revenue forecasting & probability</li>
                    <li>• Deal stage management</li>
                    <li>• Pipeline value rollup</li>
                  </ul>
                </div>

                <Button className="w-full" onClick={() => setLocation("/pipeline")}>
                  Open Pipeline
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Capacity Tracking Card */}
            {/* User Management Card (admin only) */}
            {showUserManagement && (
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-amber-500" onClick={() => setLocation("/admin/users")}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Roles & permissions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Manage user roles, permissions, and pre-authorized emails for the CSO Pricing Dashboard.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Features:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Role assignment (Admin, Client, User)</li>
                      <li>• Granular permission control</li>
                      <li>• Pre-authorized email management</li>
                      <li>• Access audit & review</li>
                    </ul>
                  </div>
                  <Button className="w-full" onClick={() => setLocation("/admin/users")}>
                    Manage Users
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/capacity")}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>Capacity Tracking</CardTitle>
                    <CardDescription>Facility availability management</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Track available square footage across all L&M facilities with monthly forecasting and utilization monitoring.
                </p>
                
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Features:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Monthly capacity input by facility</li>
                    <li>• 12-month forecasting capability</li>
                    <li>• Utilization dashboard with alerts</li>
                    <li>• Google Sheets export</li>
                  </ul>
                </div>

                <Button className="w-full" onClick={() => setLocation("/capacity")}>
                  Open Capacity Tracking
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Facilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">5</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">737K</p>
                <p className="text-xs text-muted-foreground">square feet</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">States Covered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">PA, NJ, SC</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tools Available</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">3</p>
              </CardContent>
            </Card>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-8">
            <p className="text-sm text-muted-foreground">
              These tools are for internal L&M use only. Not visible to clients.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
