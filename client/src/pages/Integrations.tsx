import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";

export default function Integrations() {
  const integrations = [
    {
      name: "HubSpot CRM",
      description: "Sync pipeline deals, contacts, and company data with HubSpot CRM for unified sales management.",
      status: "not_connected" as const,
      icon: "🔶",
      features: ["Auto-sync pipeline deals", "Contact enrichment", "Activity logging", "Deal stage mapping"],
    },
    {
      name: "QuickBooks Online",
      description: "Connect to QuickBooks for automated invoicing, payment tracking, and financial reporting.",
      status: "not_connected" as const,
      icon: "📗",
      features: ["Auto-generate invoices", "Payment tracking", "Revenue reporting", "Customer sync"],
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/internal">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-500 mt-1">Connect external services to enhance your workflow</p>
          </div>
        </div>

        <div className="grid gap-6">
          {integrations.map((integration) => (
            <Card key={integration.name} className="border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{integration.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription className="mt-1">{integration.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-gray-500 border-gray-300">
                    Not Connected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                  <ul className="grid grid-cols-2 gap-1">
                    {integration.features.map((feature) => (
                      <li key={feature} className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => toast.info(`${integration.name} integration coming soon. Contact j.stenson@summitskiesinc.com for setup.`)}
                >
                  <Plug className="h-4 w-4 mr-2" />
                  Connect {integration.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
