import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator as CalcIcon, Building2, DollarSign, Users, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Facility {
  id: string;
  name: string;
  baseRent: number;
  ticam: number;
  totalCost: number;
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

interface PricingCalculatorProps {
  companyFilter: "L&M" | "Peach";
  title: string;
  logoPath: string;
  companyName: string;
}

export default function PricingCalculator({ companyFilter, title, logoPath, companyName }: PricingCalculatorProps) {
  const filteredFacilities = defaultFacilities.filter(f => f.company === companyFilter);
  const [facilities, setFacilities] = useState<Facility[]>(filteredFacilities);
  
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [laborRate, setLaborRate] = useState<number>(18);
  const [taxRate, setTaxRate] = useState<number>(25);
  const [sqFtPerPallet, setSqFtPerPallet] = useState<number>(48);
  const [stackHeight, setStackHeight] = useState<number>(1);
  const [inboundMinutes, setInboundMinutes] = useState<number>(5);
  const [outboundMinutes, setOutboundMinutes] = useState<number>(5);
  const [monthlyPallets, setMonthlyPallets] = useState<number>(35);
  const [monthlyTurns, setMonthlyTurns] = useState<number>(0.5);
  const [storageMargin, setStorageMargin] = useState<number>(30);
  const [handlingInMargin, setHandlingInMargin] = useState<number>(30);
  const [handlingOutMargin, setHandlingOutMargin] = useState<number>(30);

  const availableFacilities = facilities;
  
  // Export quote to PDF
  const exportQuotePDF = () => {
    if (!selectedFacilityData) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Add logo with background for visibility
    try {
      // Add light background behind logo for white logos
      doc.setFillColor(240, 245, 250);
      doc.roundedRect(12, 8, 30, 20, 2, 2, "F");
      // Use PNG format and maintain aspect ratio (square logo)
      doc.addImage(logoPath, "PNG", 15, 10, 24, 16);
    } catch (e) {
      console.warn("Logo not loaded");
    }
    
    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(companyName, pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("Warehousing Services Quote", pageWidth / 2, 28, { align: "center" });
    
    // Facility & Date Info Box
    doc.setFillColor(245, 247, 250);
    doc.rect(15, 35, pageWidth - 30, 20, "F");
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.text("Facility:", 20, 43);
    doc.setFont("helvetica", "normal");
    doc.text(selectedFacilityData.name, 20, 48);
    
    doc.setFont("helvetica", "bold");
    doc.text("Quote Date:", pageWidth - 60, 43);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), pageWidth - 60, 48);
    
    // Monthly Storage Minimum Section
    let yPos = 65;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Monthly Storage Minimum (Recurring)", 15, yPos);
    yPos += 8;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Description", "Quantity", "Rate", "Monthly Total"]],
      body: [[
        "Pallet Positions",
        monthlyPallets.toString(),
        `$${recommendedStorageRate.toFixed(2)}/pallet/month`,
        `$${recommendedMonthlyStorage.toFixed(2)}`
      ]],
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: 50, halign: "right" },
        3: { cellWidth: 40, halign: "right", fontStyle: "bold" }
      }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Handling Services Section
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Handling Services (Activity-Based)", 15, yPos);
    yPos += 8;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Service", "Rate per Pallet", "Est. Monthly"]],
      body: [
        [
          "Handling In",
          `$${recommendedHandlingInRate.toFixed(2)}`,
          `$${estimatedMonthlyHandlingIn.toFixed(2)}`
        ],
        [
          "Handling Out",
          `$${recommendedHandlingOutRate.toFixed(2)}`,
          `$${estimatedMonthlyHandlingOut.toFixed(2)}`
        ]
      ],
      theme: "grid",
      headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 60, halign: "right" },
        2: { cellWidth: 60, halign: "right", fontStyle: "bold" }
      }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(`* Based on ${monthlyPallets} pallets × ${monthlyTurns} turns per month`, 15, yPos);
    
    yPos += 15;
    
    // Monthly Summary Section
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Monthly Investment Summary", 15, yPos);
    yPos += 8;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Component", "Amount"]],
      body: [
        ["Storage Minimum (Recurring)", `$${recommendedMonthlyStorage.toFixed(2)}`],
        ["Est. Handling In", `$${estimatedMonthlyHandlingIn.toFixed(2)}`],
        ["Est. Handling Out", `$${estimatedMonthlyHandlingOut.toFixed(2)}`],
        ["Total Estimated Monthly", `$${totalEstimatedMonthlyBilling.toFixed(2)}`]
      ],
      theme: "grid",
      headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: "bold" },
      bodyStyles: { fontSize: 10 },
      styles: { cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 60, halign: "right", fontStyle: "bold" }
      },
      didParseCell: (data) => {
        if (data.row.index === 3 && data.section === "body") {
          data.cell.styles.fillColor = [231, 76, 60];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontSize = 12;
        }
      }
    });
    
    // Footer
    const footerY = pageHeight - 25;
    doc.setFillColor(245, 247, 250);
    doc.rect(0, footerY - 5, pageWidth, 30, "F");
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("This quote is valid for 30 days from the date above.", pageWidth / 2, footerY + 2, { align: "center" });
    doc.text("Storage is billed monthly as a minimum commitment. Handling is billed per transaction.", pageWidth / 2, footerY + 8, { align: "center" });
    
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const contactEmail = companyFilter === "Peach" ? "info@peachwarehousing.com" : "sales@lmwarehousing.com";
    doc.text(`${companyName} | ${contactEmail}`, pageWidth / 2, footerY + 14, { align: "center" });
    
    // Save
    const filename = `${companyFilter}_Quote_${selectedFacilityData.id}_${new Date().toISOString().split('T')[0]}.pdf`;
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
  
  const effectiveSqFtPerPallet = sqFtPerPallet / stackHeight;
  
  const storageCostPerPallet = selectedFacilityData 
    ? (selectedFacilityData.totalCost * effectiveSqFtPerPallet) / 12 
    : 0;
  const recommendedStorageRate = storageCostPerPallet * (1 + storageMargin / 100);
  const recommendedMonthlyStorage = recommendedStorageRate * monthlyPallets;
  
  const handlingInCost = (inboundMinutes / 60) * fullyLoadedLaborRate;
  const recommendedHandlingInRate = handlingInCost * (1 + handlingInMargin / 100);
  const estimatedMonthlyHandlingIn = recommendedHandlingInRate * monthlyPallets * monthlyTurns;
  
  const handlingOutCost = (outboundMinutes / 60) * fullyLoadedLaborRate;
  const recommendedHandlingOutRate = handlingOutCost * (1 + handlingOutMargin / 100);
  const estimatedMonthlyHandlingOut = recommendedHandlingOutRate * monthlyPallets * monthlyTurns;
  
  const totalEstimatedMonthlyBilling = recommendedMonthlyStorage + estimatedMonthlyHandlingIn + estimatedMonthlyHandlingOut;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CalcIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
          <p className="text-muted-foreground">
            Calculate warehousing costs, FTE requirements, and billing rates based on facility and labor variables.
          </p>
        </div>

        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calculator">Deal Calculator</TabsTrigger>
            <TabsTrigger value="facility-manager">Facility Manager</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Input Variables</CardTitle>
                <CardDescription>Configure facility, labor, and deal parameters</CardDescription>
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
                      {availableFacilities.map(f => (
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
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Labor & Tax
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="labor-rate">Hourly Labor Rate ($)</Label>
                      <Input
                        id="labor-rate"
                        type="number"
                        value={laborRate}
                        onChange={(e) => setLaborRate(Number(e.target.value))}
                        step="0.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-rate">Tax/Benefits Rate (%)</Label>
                      <Input
                        id="tax-rate"
                        type="number"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        step="1"
                      />
                      <p className="text-xs text-muted-foreground">
                        Fully Loaded Rate: ${fullyLoadedLaborRate.toFixed(2)}/hr
                      </p>
                    </div>
                  </div>

                  {/* Storage Inputs */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Storage Parameters
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="sq-ft">Base Sq Ft per Pallet</Label>
                      <Input
                        id="sq-ft"
                        type="number"
                        value={sqFtPerPallet}
                        onChange={(e) => setSqFtPerPallet(Number(e.target.value))}
                        step="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stack-height">Stack Height (1x, 2x, 3x, 4x)</Label>
                      <Select value={stackHeight.toString()} onValueChange={(v) => setStackHeight(Number(v))}>
                        <SelectTrigger id="stack-height">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1x (No Stacking)</SelectItem>
                          <SelectItem value="2">2x (Double Stack)</SelectItem>
                          <SelectItem value="3">3x (Triple Stack)</SelectItem>
                          <SelectItem value="4">4x (Quad Stack)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Effective: {effectiveSqFtPerPallet.toFixed(1)} sq ft/pallet
                      </p>
                    </div>
                  </div>

                  {/* Handling Inputs */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Handling Time</h3>
                    <div className="space-y-2">
                      <Label htmlFor="inbound-minutes">Inbound Minutes per Pallet</Label>
                      <Input
                        id="inbound-minutes"
                        type="number"
                        value={inboundMinutes}
                        onChange={(e) => setInboundMinutes(Number(e.target.value))}
                        step="0.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="outbound-minutes">Outbound Minutes per Pallet</Label>
                      <Input
                        id="outbound-minutes"
                        type="number"
                        value={outboundMinutes}
                        onChange={(e) => setOutboundMinutes(Number(e.target.value))}
                        step="0.5"
                      />
                    </div>
                  </div>

                  {/* Deal Parameters */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Deal Parameters
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="monthly-pallets">Monthly Pallet Positions</Label>
                      <Input
                        id="monthly-pallets"
                        type="number"
                        value={monthlyPallets}
                        onChange={(e) => setMonthlyPallets(Number(e.target.value))}
                        step="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthly-turns">Monthly Turns per Pallet</Label>
                      <Input
                        id="monthly-turns"
                        type="number"
                        value={monthlyTurns}
                        onChange={(e) => setMonthlyTurns(Number(e.target.value))}
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Margin Controls */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Target Margins (%)</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="storage-margin">Storage Margin</Label>
                      <Input
                        id="storage-margin"
                        type="number"
                        value={storageMargin}
                        onChange={(e) => setStorageMargin(Number(e.target.value))}
                        step="5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="handling-in-margin">Handling In Margin</Label>
                      <Input
                        id="handling-in-margin"
                        type="number"
                        value={handlingInMargin}
                        onChange={(e) => setHandlingInMargin(Number(e.target.value))}
                        step="5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="handling-out-margin">Handling Out Margin</Label>
                      <Input
                        id="handling-out-margin"
                        type="number"
                        value={handlingOutMargin}
                        onChange={(e) => setHandlingOutMargin(Number(e.target.value))}
                        step="5"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedFacility && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recommended Billing Rates</CardTitle>
                      <CardDescription>Cost + margin for {selectedFacilityData?.name}</CardDescription>
                    </div>
                    <Button onClick={exportQuotePDF} variant="outline" size="sm">
                      <FileDown className="mr-2 h-4 w-4" />
                      Export Quote PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Monthly Storage Minimum */}
                  <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                    <h3 className="font-semibold text-lg mb-3">Monthly Storage Minimum (Recurring)</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost per Pallet:</span>
                        <span className="font-mono">${storageCostPerPallet.toFixed(2)}/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recommended Rate ({storageMargin}% margin):</span>
                        <span className="font-mono font-semibold">${recommendedStorageRate.toFixed(2)}/pallet/month</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold">Monthly Total ({monthlyPallets} pallets):</span>
                        <span className="font-mono text-lg font-bold">${recommendedMonthlyStorage.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Handling In */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3">Handling In (Activity-Based)</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost per Pallet:</span>
                        <span className="font-mono">${handlingInCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recommended Rate ({handlingInMargin}% margin):</span>
                        <span className="font-mono font-semibold">${recommendedHandlingInRate.toFixed(2)}/pallet</span>
                      </div>

                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold">Est. Monthly ({monthlyPallets} × {monthlyTurns} turns):</span>
                        <span className="font-mono text-lg font-bold">${estimatedMonthlyHandlingIn.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Handling Out */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3">Handling Out (Activity-Based)</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost per Pallet:</span>
                        <span className="font-mono">${handlingOutCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recommended Rate ({handlingOutMargin}% margin):</span>
                        <span className="font-mono font-semibold">${recommendedHandlingOutRate.toFixed(2)}/pallet</span>
                      </div>

                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold">Est. Monthly ({monthlyPallets} × {monthlyTurns} turns):</span>
                        <span className="font-mono text-lg font-bold">${estimatedMonthlyHandlingOut.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Summary */}
                  <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
                    <h3 className="font-semibold text-lg mb-3">Monthly Summary</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Storage Minimum:</span>
                        <span className="font-mono">${recommendedMonthlyStorage.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. Handling In:</span>
                        <span className="font-mono">${estimatedMonthlyHandlingIn.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. Handling Out:</span>
                        <span className="font-mono">${estimatedMonthlyHandlingOut.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t-2 border-primary">
                        <span className="font-bold text-lg">Total Est. Monthly:</span>
                        <span className="font-mono text-2xl font-bold text-primary">${totalEstimatedMonthlyBilling.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="facility-manager">
            <Card>
              <CardHeader>
                <CardTitle>Facility Cost Parameters</CardTitle>
                <CardDescription>Adjust base rent and TICAM for each facility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {facilities.map(facility => (
                    <div key={facility.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">{facility.name}</h4>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Base Rent ($/sq ft/year)</Label>
                          <Input
                            type="number"
                            value={facility.baseRent}
                            onChange={(e) => updateFacility(facility.id, "baseRent", Number(e.target.value))}
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>TICAM ($/sq ft/year)</Label>
                          <Input
                            type="number"
                            value={facility.ticam}
                            onChange={(e) => updateFacility(facility.id, "ticam", Number(e.target.value))}
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Total Cost</Label>
                          <div className="h-10 flex items-center px-3 border rounded-md bg-muted font-mono font-semibold">
                            ${facility.totalCost.toFixed(2)}/sq ft/year
                          </div>
                        </div>
                      </div>
                      {facility.notes && (
                        <p className="text-sm text-muted-foreground mt-2">Note: {facility.notes}</p>
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
