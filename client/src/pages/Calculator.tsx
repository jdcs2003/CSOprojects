import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator as CalcIcon, Building2, DollarSign, Users } from "lucide-react";

interface Facility {
  id: string;
  name: string;
  baseRent: number; // per sq ft per year
  ticam: number; // per sq ft per year
  totalCost: number; // calculated
  notes?: string;
}

const defaultFacilities: Facility[] = [
  {
    id: "pa-510",
    name: "PA-510 (Bristol)",
    baseRent: 9.28,
    ticam: 1.20,
    totalCost: 10.48,
    notes: "Climate controlled + Bonded storage available"
  },
  {
    id: "pa-13200",
    name: "PA-13200",
    baseRent: 7.16,
    ticam: 2.00,
    totalCost: 9.16,
    notes: ""
  },
  {
    id: "sc-577",
    name: "SC-577",
    baseRent: 7.50,
    ticam: 2.00,
    totalCost: 9.50,
    notes: ""
  },
  {
    id: "nj-2279",
    name: "NJ-2279",
    baseRent: 9.28,
    ticam: 0, // User to input
    totalCost: 9.28,
    notes: "Same base as Bristol, higher TICAM (TBD)"
  },
  {
    id: "sc-2690",
    name: "SC-2690 (Rock Hill, SC)",
    baseRent: 10.00,
    ticam: 1.34,
    totalCost: 11.34,
    notes: "40,000 sq ft facility - $33,333/month"
  },
  {
    id: "pa-1151",
    name: "PA-1151",
    baseRent: 5.00,
    ticam: 0,
    totalCost: 5.00,
    notes: "NNN included"
  }
];

export default function Calculator() {
  const [facilities, setFacilities] = useState<Facility[]>(defaultFacilities);
  
  // Deal Calculator State
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [laborRate, setLaborRate] = useState<number>(18);
  const [taxRate, setTaxRate] = useState<number>(25);
  const [sqFtPerPallet, setSqFtPerPallet] = useState<number>(48); // Standard 40x48 pallet + aisle space
  const [inboundMinutes, setInboundMinutes] = useState<number>(5);
  const [outboundMinutes, setOutboundMinutes] = useState<number>(5);
  const [monthlyPallets, setMonthlyPallets] = useState<number>(35);
  const [monthlyTurns, setMonthlyTurns] = useState<number>(2);
  const [targetMargin, setTargetMargin] = useState<number>(30);

  // Update facility
  const updateFacility = (id: string, field: keyof Facility, value: number) => {
    setFacilities(prev => prev.map(f => {
      if (f.id === id) {
        const updated = { ...f, [field]: value };
        updated.totalCost = updated.baseRent + updated.ticam;
        return updated;
      }
      return f;
    }));
  };

  // Calculations
  const selectedFacilityData = facilities.find(f => f.id === selectedFacility);
  const fullyLoadedLaborRate = laborRate * (1 + taxRate / 100);
  
  // Storage cost per pallet per month
  const storageCostPerPallet = selectedFacilityData 
    ? (selectedFacilityData.totalCost * sqFtPerPallet) / 12 
    : 0;
  
  // Labor cost per pallet (inbound + outbound)
  const totalMinutesPerPallet = inboundMinutes + outboundMinutes;
  const laborCostPerPallet = (totalMinutesPerPallet / 60) * fullyLoadedLaborRate;
  
  // Total cost per pallet per month (storage + labor for turns)
  const totalCostPerPallet = storageCostPerPallet + (laborCostPerPallet * monthlyTurns);
  
  // Total monthly cost
  const totalMonthlyCost = totalCostPerPallet * monthlyPallets;
  
  // Recommended billing price
  const recommendedBilling = totalCostPerPallet * (1 + targetMargin / 100);
  
  // FTE calculation (total labor hours per month / 160 hours)
  const totalLaborHoursPerMonth = (totalMinutesPerPallet / 60) * monthlyPallets * monthlyTurns;
  const estimatedFTE = totalLaborHoursPerMonth / 160;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="container max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CalcIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">L&M Internal Pricing Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Calculate warehousing costs, FTE requirements, and billing rates based on facility and labor variables.
          </p>
        </div>

        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calculator">Deal Calculator</TabsTrigger>
            <TabsTrigger value="facilities">Facility Manager</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Deal Calculator
                </CardTitle>
                <CardDescription>
                  Input deal specifics to calculate costs, FTEs, and recommended billing rates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Facility Selection */}
                <div className="space-y-2">
                  <Label htmlFor="facility">Select Facility</Label>
                  <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                    <SelectTrigger id="facility">
                      <SelectValue placeholder="Choose a facility..." />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map(f => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name} - ${f.totalCost.toFixed(2)}/sq ft/year
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Labor Inputs */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Labor Variables</h3>
                    <div className="space-y-2">
                      <Label htmlFor="laborRate">Hourly Labor Rate ($)</Label>
                      <Input
                        id="laborRate"
                        type="number"
                        value={laborRate}
                        onChange={(e) => setLaborRate(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Tax & Benefits (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                      />
                      <p className="text-sm text-muted-foreground">
                        Fully loaded rate: ${fullyLoadedLaborRate.toFixed(2)}/hr
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inbound">Inbound Minutes/Pallet</Label>
                      <Input
                        id="inbound"
                        type="number"
                        value={inboundMinutes}
                        onChange={(e) => setInboundMinutes(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="outbound">Outbound Minutes/Pallet</Label>
                      <Input
                        id="outbound"
                        type="number"
                        value={outboundMinutes}
                        onChange={(e) => setOutboundMinutes(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Volume Inputs */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Volume & Space</h3>
                    <div className="space-y-2">
                      <Label htmlFor="sqft">Sq Ft per Pallet (incl. aisles)</Label>
                      <Input
                        id="sqft"
                        type="number"
                        value={sqFtPerPallet}
                        onChange={(e) => setSqFtPerPallet(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pallets">Monthly Pallet Positions</Label>
                      <Input
                        id="pallets"
                        type="number"
                        value={monthlyPallets}
                        onChange={(e) => setMonthlyPallets(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="turns">Monthly Turns per Pallet</Label>
                      <Input
                        id="turns"
                        type="number"
                        value={monthlyTurns}
                        onChange={(e) => setMonthlyTurns(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="margin">Target Profit Margin (%)</Label>
                      <Input
                        id="margin"
                        type="number"
                        value={targetMargin}
                        onChange={(e) => setTargetMargin(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Results */}
                {selectedFacility && (
                  <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          True Cost per Pallet/Month
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          ${totalCostPerPallet.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Storage: ${storageCostPerPallet.toFixed(2)} + Labor: ${(laborCostPerPallet * monthlyTurns).toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
                          Recommended Billing Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          ${recommendedBilling.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Per pallet/month ({targetMargin}% margin)
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Estimated FTEs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                          {estimatedFTE.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {totalLaborHoursPerMonth.toFixed(0)} hours/month
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {selectedFacility && (
                  <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <h4 className="font-semibold mb-2">Monthly Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Monthly Cost:</span>
                        <span className="ml-2 font-semibold">${totalMonthlyCost.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Monthly Billing:</span>
                        <span className="ml-2 font-semibold">${(recommendedBilling * monthlyPallets).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Monthly Profit:</span>
                        <span className="ml-2 font-semibold text-green-600">
                          ${((recommendedBilling * monthlyPallets) - totalMonthlyCost).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Sq Ft Required:</span>
                        <span className="ml-2 font-semibold">{(sqFtPerPallet * monthlyPallets).toLocaleString()} sq ft</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facilities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Facility Manager
                </CardTitle>
                <CardDescription>
                  Manage facility cost constants (Rent + TICAM per sq ft per year)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {facilities.map(facility => (
                    <div key={facility.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{facility.name}</h3>
                        <span className="text-sm font-mono bg-primary/10 px-3 py-1 rounded">
                          ${facility.totalCost.toFixed(2)}/sq ft/year
                        </span>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor={`${facility.id}-base`}>Base Rent ($/sq ft/year)</Label>
                          <Input
                            id={`${facility.id}-base`}
                            type="number"
                            step="0.01"
                            value={facility.baseRent}
                            onChange={(e) => updateFacility(facility.id, 'baseRent', Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${facility.id}-ticam`}>TICAM ($/sq ft/year)</Label>
                          <Input
                            id={`${facility.id}-ticam`}
                            type="number"
                            step="0.01"
                            value={facility.ticam}
                            onChange={(e) => updateFacility(facility.id, 'ticam', Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Total Cost</Label>
                          <div className="h-10 flex items-center px-3 bg-muted rounded-md font-semibold">
                            ${facility.totalCost.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      {facility.notes && (
                        <p className="text-sm text-muted-foreground italic">{facility.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
