import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calculator as CalcIcon, Building2, DollarSign, Users, Lock, FileDown } from "lucide-react";
import jsPDF from "jspdf";

interface Facility {
  id: string;
  name: string;
  baseRent: number; // per sq ft per year
  ticam: number; // per sq ft per year
  totalCost: number; // calculated
  company: "L&M" | "Peach";
  notes?: string;
}

const defaultFacilities: Facility[] = [
  {
    id: "pa-510",
    name: "PA-510 (Bensalem - 85,602 sq ft)",
    baseRent: 9.28,
    ticam: 1.20,
    totalCost: 10.48,
    company: "L&M",
    notes: "Climate controlled + Bonded storage available"
  },
  {
    id: "pa-1151",
    name: "PA-1151 (Bristol - 226,000 sq ft)",
    baseRent: 5.00,
    ticam: 0,
    totalCost: 5.00,
    company: "L&M",
    notes: "NNN included"
  },
  {
    id: "pa-13200",
    name: "PA-13200 (Townsend - 65,856 sq ft)",
    baseRent: 7.16,
    ticam: 2.00,
    totalCost: 9.16,
    company: "L&M",
    notes: "Philadelphia location"
  },
  {
    id: "nj-2279",
    name: "NJ-2279 (Logan Township - 84,000 sq ft)",
    baseRent: 9.28,
    ticam: 0,
    totalCost: 9.28,
    company: "L&M",
    notes: "TICAM TBD"
  },
  {
    id: "sc-577",
    name: "SC-577 (Rock Hill - 275,963 sq ft)",
    baseRent: 7.50,
    ticam: 2.00,
    totalCost: 9.50,
    company: "L&M",
    notes: ""
  },
  {
    id: "pa-2101",
    name: "PA-2101 (Peach Warehouse - 85,716 sq ft)",
    baseRent: 9.50,
    ticam: 2.00,
    totalCost: 11.50,
    company: "Peach",
    notes: "Climate Control"
  },
  {
    id: "sc-144",
    name: "SC-144 (144 Old Elloree Road - 150,000 sq ft)",
    baseRent: 5.00,
    ticam: 0,
    totalCost: 5.00,
    company: "Peach",
    notes: "All-in rate"
  }
];

export default function Calculator() {
  const [facilities, setFacilities] = useState<Facility[]>(defaultFacilities);
  
  // Peach Access Control
  const [peachUnlocked, setPeachUnlocked] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>("");
  const [showPasscodeDialog, setShowPasscodeDialog] = useState<boolean>(false);
  
  // Deal Calculator State
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [laborRate, setLaborRate] = useState<number>(18);
  const [taxRate, setTaxRate] = useState<number>(25);
  const [sqFtPerPallet, setSqFtPerPallet] = useState<number>(48); // Standard 40x48 pallet + aisle space
  const [stackHeight, setStackHeight] = useState<number>(1); // 1x, 2x, 3x, 4x stacking
  const [inboundMinutes, setInboundMinutes] = useState<number>(5);
  const [outboundMinutes, setOutboundMinutes] = useState<number>(5);
  const [monthlyPallets, setMonthlyPallets] = useState<number>(35);
  const [monthlyTurns, setMonthlyTurns] = useState<number>(2);
  
  // Independent Margins
  const [storageMargin, setStorageMargin] = useState<number>(30);
  const [handlingInMargin, setHandlingInMargin] = useState<number>(30);
  const [handlingOutMargin, setHandlingOutMargin] = useState<number>(30);

  // Passcode verification
  const verifyPasscode = () => {
    if (passcodeInput === "Peach2026!") {
      setPeachUnlocked(true);
      setShowPasscodeDialog(false);
      setPasscodeInput("");
    } else {
      alert("Incorrect passcode. Please try again.");
      setPasscodeInput("");
    }
  };
  
  // Filter facilities based on Peach access
  const availableFacilities = facilities.filter(f => 
    f.company === "L&M" || (f.company === "Peach" && peachUnlocked)
  );
  
  // Handle facility selection with Peach check
  const handleFacilitySelect = (facilityId: string) => {
    const facility = facilities.find(f => f.id === facilityId);
    if (facility?.company === "Peach" && !peachUnlocked) {
      setShowPasscodeDialog(true);
      return;
    }
    setSelectedFacility(facilityId);
  };
  
  // Export quote to PDF
  const exportQuotePDF = () => {
    if (!selectedFacilityData) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    
    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("L&M Distribution & Logistics", pageWidth / 2, yPos, { align: "center" });
    yPos += 10;
    
    doc.setFontSize(16);
    doc.text("Warehousing Quote", pageWidth / 2, yPos, { align: "center" });
    yPos += 15;
    
    // Facility Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Facility:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(selectedFacilityData.name, 50, yPos);
    yPos += 7;
    
    doc.setFont("helvetica", "bold");
    doc.text("Date:", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), 50, yPos);
    yPos += 15;
    
    // Monthly Storage Minimum
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Monthly Storage Minimum (Recurring)", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Pallet Positions: ${monthlyPallets}`, 25, yPos);
    yPos += 6;
    doc.text(`Rate per Pallet: $${recommendedStorageRate.toFixed(2)}/month`, 25, yPos);
    yPos += 6;
    doc.setFont("helvetica", "bold");
    doc.text(`Monthly Total: $${recommendedMonthlyStorage.toFixed(2)}`, 25, yPos);
    yPos += 15;
    
    // Handling In
    doc.setFontSize(14);
    doc.text("Handling In (Activity-Based)", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Rate per Pallet: $${recommendedHandlingInRate.toFixed(2)}`, 25, yPos);
    yPos += 6;
    doc.text(`Market Range: $6-8/pallet`, 25, yPos);
    yPos += 6;
    doc.text(`Est. Monthly (${monthlyPallets} pallets × ${monthlyTurns} turns): $${estimatedMonthlyHandlingIn.toFixed(2)}`, 25, yPos);
    yPos += 15;
    
    // Handling Out
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Handling Out (Activity-Based)", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Rate per Pallet: $${recommendedHandlingOutRate.toFixed(2)}`, 25, yPos);
    yPos += 6;
    doc.text(`Market Range: $6-10/pallet`, 25, yPos);
    yPos += 6;
    doc.text(`Est. Monthly (${monthlyPallets} pallets × ${monthlyTurns} turns): $${estimatedMonthlyHandlingOut.toFixed(2)}`, 25, yPos);
    yPos += 20;
    
    // Summary
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Monthly Summary", 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Storage Minimum: $${recommendedMonthlyStorage.toFixed(2)}`, 25, yPos);
    yPos += 6;
    doc.text(`Est. Handling In: $${estimatedMonthlyHandlingIn.toFixed(2)}`, 25, yPos);
    yPos += 6;
    doc.text(`Est. Handling Out: $${estimatedMonthlyHandlingOut.toFixed(2)}`, 25, yPos);
    yPos += 8;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Est. Monthly: $${totalEstimatedMonthlyBilling.toFixed(2)}`, 25, yPos);
    yPos += 15;
    
    // Footer
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("This quote is valid for 30 days from the date above.", 20, yPos);
    yPos += 5;
    doc.text("Storage is billed monthly. Handling is billed per transaction.", 20, yPos);
    
    // Save
    const filename = `LM_Quote_${selectedFacilityData.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };
  
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
  
  // STACKING CALCULATION
  const effectiveSqFtPerPallet = sqFtPerPallet / stackHeight;
  
  // STORAGE MINIMUM (Monthly Recurring)
  const storageCostPerPallet = selectedFacilityData 
    ? (selectedFacilityData.totalCost * effectiveSqFtPerPallet) / 12 
    : 0;
  const monthlyStorageMinimum = storageCostPerPallet * monthlyPallets;
  const recommendedStorageRate = storageCostPerPallet * (1 + storageMargin / 100);
  const recommendedMonthlyStorage = recommendedStorageRate * monthlyPallets;
  
  // HANDLING IN (Activity-Based per Pallet)
  const handlingInCost = (inboundMinutes / 60) * fullyLoadedLaborRate;
  const recommendedHandlingInRate = handlingInCost * (1 + handlingInMargin / 100);
  const estimatedMonthlyHandlingIn = recommendedHandlingInRate * monthlyPallets * monthlyTurns;
  
  // HANDLING OUT (Activity-Based per Pallet)
  const handlingOutCost = (outboundMinutes / 60) * fullyLoadedLaborRate;
  const recommendedHandlingOutRate = handlingOutCost * (1 + handlingOutMargin / 100);
  const estimatedMonthlyHandlingOut = recommendedHandlingOutRate * monthlyPallets * monthlyTurns;
  
  // TOTALS
  const totalMonthlyCost = monthlyStorageMinimum + (handlingInCost * monthlyPallets * monthlyTurns) + (handlingOutCost * monthlyPallets * monthlyTurns);
  const totalEstimatedMonthlyBilling = recommendedMonthlyStorage + estimatedMonthlyHandlingIn + estimatedMonthlyHandlingOut;
  const estimatedMonthlyProfit = totalEstimatedMonthlyBilling - totalMonthlyCost;
  
  // FTE calculation (total labor hours per month / 160 hours)
  const totalLaborHoursPerMonth = ((inboundMinutes + outboundMinutes) / 60) * monthlyPallets * monthlyTurns;
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
                  <Select value={selectedFacility} onValueChange={handleFacilitySelect}>
                    <SelectTrigger id="facility">
                      <SelectValue placeholder="Choose a facility..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFacilities.map(f => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name} - ${f.totalCost.toFixed(2)}/sq ft/year {f.company === "Peach" ? "🍑" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!peachUnlocked && (
                    <p className="text-xs text-muted-foreground">
                      🔒 Peach facilities require passcode
                    </p>
                  )}
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
                      <Label htmlFor="stack-height">Stack Height</Label>
                      <Select value={stackHeight.toString()} onValueChange={(v) => setStackHeight(Number(v))}>
                        <SelectTrigger id="stack-height">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1x (Single Stack)</SelectItem>
                          <SelectItem value="2">2x (Double Stack)</SelectItem>
                          <SelectItem value="3">3x (Triple Stack)</SelectItem>
                          <SelectItem value="4">4x (Quad Stack)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Effective: {effectiveSqFtPerPallet.toFixed(1)} sq ft/pallet
                      </p>
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
                      <Label htmlFor="storage-margin">Storage Margin (%)</Label>
                      <Input
                        id="storage-margin"
                        type="number"
                        value={storageMargin}
                        onChange={(e) => setStorageMargin(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="handling-in-margin">Handling In Margin (%)</Label>
                      <Input
                        id="handling-in-margin"
                        type="number"
                        value={handlingInMargin}
                        onChange={(e) => setHandlingInMargin(Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">Market: $6-8/pallet</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="handling-out-margin">Handling Out Margin (%)</Label>
                      <Input
                        id="handling-out-margin"
                        type="number"
                        value={handlingOutMargin}
                        onChange={(e) => setHandlingOutMargin(Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">Market: $6-10/pallet</p>
                    </div>
                  </div>
                </div>

                {/* Results */}
                {selectedFacility && (
                  <div className="mt-8 space-y-6">
                    {/* Export Button */}
                    <div className="flex justify-end">
                      <Button onClick={exportQuotePDF} className="gap-2">
                        <FileDown className="h-4 w-4" />
                        Export Quote PDF
                      </Button>
                    </div>
                    {/* Monthly Recurring Storage */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        Monthly Storage Minimum (Recurring)
                      </h3>
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              Cost per Pallet/Month
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              ${storageCostPerPallet.toFixed(2)}
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
                              Recommended Rate
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              ${recommendedStorageRate.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              per pallet/month ({storageMargin}% margin)
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                              Monthly Minimum
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              ${recommendedMonthlyStorage.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {monthlyPallets} pallets
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Activity-Based Handling */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-amber-600" />
                        Activity-Based Handling (Per Pallet)
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card className="border-2">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Handling In (Receiving)</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Cost per Pallet</p>
                              <p className="text-lg font-semibold">${handlingInCost.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Recommended Rate</p>
                              <p className="text-2xl font-bold text-green-600">${recommendedHandlingInRate.toFixed(2)}</p>
                            </div>
                            <div className="pt-2 border-t">
                              <p className="text-xs text-muted-foreground">Est. Monthly ({monthlyPallets} × {monthlyTurns} turns)</p>
                              <p className="text-lg font-semibold">${estimatedMonthlyHandlingIn.toFixed(2)}</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-2">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Handling Out (Shipping)</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Cost per Pallet</p>
                              <p className="text-lg font-semibold">${handlingOutCost.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Recommended Rate</p>
                              <p className="text-2xl font-bold text-green-600">${recommendedHandlingOutRate.toFixed(2)}</p>
                            </div>
                            <div className="pt-2 border-t">
                              <p className="text-xs text-muted-foreground">Est. Monthly ({monthlyPallets} × {monthlyTurns} turns)</p>
                              <p className="text-lg font-semibold">${estimatedMonthlyHandlingOut.toFixed(2)}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* FTE Card */}
                    <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Estimated FTEs Required
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                          {estimatedFTE.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {totalLaborHoursPerMonth.toFixed(0)} labor hours/month
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {selectedFacility && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg border-2 border-slate-300 dark:border-slate-700">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Estimated Monthly Summary
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h5 className="font-semibold text-sm text-muted-foreground uppercase">Revenue Breakdown</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Storage Minimum:</span>
                            <span className="font-semibold">${recommendedMonthlyStorage.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Est. Handling In:</span>
                            <span className="font-semibold">${estimatedMonthlyHandlingIn.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Est. Handling Out:</span>
                            <span className="font-semibold">${estimatedMonthlyHandlingOut.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t-2 border-slate-300 dark:border-slate-600">
                            <span className="font-semibold">Total Est. Billing:</span>
                            <span className="font-bold text-lg text-green-600">${totalEstimatedMonthlyBilling.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h5 className="font-semibold text-sm text-muted-foreground uppercase">Cost & Profit</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Total Monthly Cost:</span>
                            <span className="font-semibold">${totalMonthlyCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Est. Monthly Profit:</span>
                            <span className="font-semibold text-green-600">${estimatedMonthlyProfit.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Profit Margin:</span>
                            <span className="font-semibold">{((estimatedMonthlyProfit / totalEstimatedMonthlyBilling) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t-2 border-slate-300 dark:border-slate-600">
                            <span className="text-sm">Sq Ft Required:</span>
                            <span className="font-semibold">{(sqFtPerPallet * monthlyPallets).toLocaleString()} sq ft</span>
                          </div>
                        </div>
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

      {/* Passcode Dialog */}
      <Dialog open={showPasscodeDialog} onOpenChange={setShowPasscodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Peach Facilities Access
            </DialogTitle>
            <DialogDescription>
              Enter the passcode to access Peach warehouse facilities.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="passcode">Passcode</Label>
              <Input
                id="passcode"
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verifyPasscode()}
                placeholder="Enter passcode..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasscodeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={verifyPasscode}>
              Unlock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
