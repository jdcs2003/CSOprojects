import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator as CalcIcon, Building2, DollarSign, Users, FileDown, Package, Layers, Box, Truck } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { trpc } from "@/lib/trpc";

interface Facility {
  id: string;
  name: string;
  baseRent: number;
  ticam: number;
  totalCost: number;
  company: "L&M";
  notes?: string;
}

interface FreightLane {
  id: string;
  type: "inbound" | "outbound";
  origin: string;
  destination: string;
  rate: number;
  pallets: number;
  weight: number;
  notes: string;
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

];

interface PricingCalculatorProps {
  companyFilter: "L&M";
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
  const [storageMinimum, setStorageMinimum] = useState<number>(0); // Adjustable storage minimum in dollars
  const [storageMargin, setStorageMargin] = useState<number>(30);
  const [handlingInMargin, setHandlingInMargin] = useState<number>(30);
  const [handlingOutMargin, setHandlingOutMargin] = useState<number>(30);
  
  // Value-Added Services
  const [casePickRate, setCasePickRate] = useState<number>(0.40);
  const [layerPickRate, setLayerPickRate] = useState<number>(0.30);
  const [palletSupplyFee, setPalletSupplyFee] = useState<number>(9.00);
  const [shrinkWrapFee, setShrinkWrapFee] = useState<number>(3.00);
  const [labelingFee, setLabelingFee] = useState<number>(0.50);
  const [orderProcessingFee, setOrderProcessingFee] = useState<number>(10.00);
  const [cancellationFee, setCancellationFee] = useState<number>(25.00);
  const [pickType, setPickType] = useState<string>("full");
  const [casesPerOrder, setCasesPerOrder] = useState<number>(0);
  const [labelsPerOrder, setLabelsPerOrder] = useState<number>(1);
  const [monthlyOrders, setMonthlyOrders] = useState<number>(0);
  
  // Value-added services margins
  const [casePickMargin, setCasePickMargin] = useState<number>(0);
  const [palletSupplyMargin, setPalletSupplyMargin] = useState<number>(0);
  const [shrinkWrapMargin, setShrinkWrapMargin] = useState<number>(0);
  const [labelingMargin, setLabelingMargin] = useState<number>(0);
  const [orderProcessingMargin, setOrderProcessingMargin] = useState<number>(0);
  const [cancellationMargin, setCancellationMargin] = useState<number>(0);
  
  // Rate overrides
  const [storageRateOverride, setStorageRateOverride] = useState<number | null>(null);
  const [handlingInRateOverride, setHandlingInRateOverride] = useState<number | null>(null);
  const [handlingOutRateOverride, setHandlingOutRateOverride] = useState<number | null>(null);
  
   // Quote Management
  const [currentQuoteId, setCurrentQuoteId] = useState<number | null>(null);
  const [quoteName, setQuoteName] = useState<string>("");
  
  // Client Information
  const [clientCompany, setClientCompany] = useState<string>("");
  const [clientContact, setClientContact] = useState<string>("");
  const [clientAddress1, setClientAddress1] = useState<string>("");
  const [clientAddress2, setClientAddress2] = useState<string>("");
  const [clientCity, setClientCity] = useState<string>("");
  const [clientState, setClientState] = useState<string>("");
  const [clientZip, setClientZip] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  
  // Contract Length Discount Tiers
  const [tier1Name, setTier1Name] = useState<string>("Standard");
  const [tier1Length, setTier1Length] = useState<string>("0-60 days");
  const [tier1Discount, setTier1Discount] = useState<number>(0);
  
  const [tier2Name, setTier2Name] = useState<string>("Bronze");
  const [tier2Length, setTier2Length] = useState<string>("12 months");
  const [tier2Discount, setTier2Discount] = useState<number>(5);
  
  const [tier3Name, setTier3Name] = useState<string>("Silver");
  const [tier3Length, setTier3Length] = useState<string>("36 months");
  const [tier3Discount, setTier3Discount] = useState<number>(10);
  
  const [tier4Name, setTier4Name] = useState<string>("Gold");
  const [tier4Length, setTier4Length] = useState<string>("60+ months");
  const [tier4Discount, setTier4Discount] = useState<number>(15);
  
  const [selectedDiscountTier, setSelectedDiscountTier] = useState<string>("none");
  
  // Disclosures & Assumptions
  const [quoteValidDays, setQuoteValidDays] = useState<number>(90);
  const [paymentTerms, setPaymentTerms] = useState<string>("Net 30");
  const [minimumCommitment, setMinimumCommitment] = useState<string>("12 months");
  const [customDisclosures, setCustomDisclosures] = useState<string>("");
  
  // Transportation / Freight Lanes
  const [freightLanes, setFreightLanes] = useState<FreightLane[]>([]);

  const availableFacilities = facilities;
  
  // ZIP code auto-lookup using backend tRPC
  const zipLookupQuery = trpc.zipLookup.getLocation.useQuery(
    { zipCode: clientZip },
    { 
      enabled: clientZip.length === 5 && /^\d{5}$/.test(clientZip),
      retry: false,
    }
  );
  
  useEffect(() => {
    if (zipLookupQuery.data) {
      if (zipLookupQuery.data.city) setClientCity(zipLookupQuery.data.city);
      if (zipLookupQuery.data.state) setClientState(zipLookupQuery.data.state);
    }
  }, [zipLookupQuery.data]);
  
  // Save quote mutation
  const utils = trpc.useUtils();
  const saveQuoteMutation = trpc.quotes.create.useMutation({
    onSuccess: (data: any) => {
      setCurrentQuoteId(data.id);
      utils.quotes.getAll.invalidate(); // Refresh the dropdown list
      alert(`Quote "${quoteName}" saved successfully!`);
    },
    onError: (error: any) => {
      alert(`Failed to save quote: ${error.message}`);
    }
  });
  
  // Load quotes query
  const quotesQuery = trpc.quotes.getAll.useQuery({ company: companyFilter });
  
  // Save quote function
  const saveQuote = () => {
    if (!quoteName.trim()) {
      alert("Please enter a quote name before saving.");
      return;
    }
    
    const quoteData = {
      quoteName,
      company: companyFilter,
      facilityId: selectedFacility,
      selectedFacility,
      laborRate,
      taxRate,
      fullyLoadedLaborRate: laborRate * (1 + taxRate / 100),
      sqFtPerPallet,
      stackHeight,
      inboundMinutes,
      outboundMinutes,
      monthlyPallets,
      monthlyTurns,
      storageMargin,
      handlingInMargin,
      handlingOutMargin,
      monthlyStorageMinimum: storageMinimum,
      casePickRate,
      layerPickRate,
      palletSupplyFee,
      shrinkWrapFee,
      labelingFee,
      orderProcessingFee,
      cancellationFee,
      pickType: pickType as "full" | "layer" | "case",
      casesPerOrder,
      labelsPerOrder,
      monthlyOrders,
      casePickMargin,
      palletSupplyMargin,
      shrinkWrapMargin,
      labelingMargin,
      orderProcessingMargin,
      cancellationMargin,
      storageRateOverride: storageRateOverride ?? undefined,
      handlingInRateOverride: handlingInRateOverride ?? undefined,
      handlingOutRateOverride: handlingOutRateOverride ?? undefined,
      clientCompany,
      clientContact,
      clientAddress1,
      clientAddress2,
      clientCity,
      clientState,
      clientZip,
      clientPhone,
      clientEmail,
      tier1Name,
      tier1Length,
      tier1Discount,
      tier2Name,
      tier2Length,
      tier2Discount,
      tier3Name,
      tier3Length,
      tier3Discount,
      tier4Name,
      tier4Length,
      tier4Discount,
      selectedDiscountTier,
      quoteValidDays,
      paymentTerms,
      minimumCommitment,
      customDisclosures,
      freightLanes: JSON.stringify(freightLanes)
    };
    
    if (currentQuoteId) {
      // Update existing quote
      // TODO: implement update
      saveQuoteMutation.mutate(quoteData);
    } else {
      // Save new quote
      saveQuoteMutation.mutate(quoteData);
    }
  };
  
  // Load quote function
  const loadQuote = (quoteId: number) => {
    const quote = quotesQuery.data?.find((q: any) => q.id === quoteId);
    if (!quote) return;
    
    // Load all fields
    setQuoteName(quote.quoteName);
    setSelectedFacility(quote.selectedFacility);
    setLaborRate(quote.laborRate);
    setTaxRate(quote.taxRate);
    setSqFtPerPallet(quote.sqFtPerPallet);
    setStackHeight(quote.stackHeight);
    setInboundMinutes(quote.inboundMinutes);
    setOutboundMinutes(quote.outboundMinutes);
    setMonthlyPallets(quote.monthlyPallets);
    setMonthlyTurns(quote.monthlyTurns);
    setStorageMargin(quote.storageMargin);
    setHandlingInMargin(quote.handlingInMargin);
    setHandlingOutMargin(quote.handlingOutMargin);
    setStorageMinimum(quote.monthlyStorageMinimum || 0);
    setCasePickRate(quote.casePickRate);
    setLayerPickRate(quote.layerPickRate);
    setPalletSupplyFee(quote.palletSupplyFee);
    setShrinkWrapFee(quote.shrinkWrapFee);
    setLabelingFee(quote.labelingFee);
    setOrderProcessingFee(quote.orderProcessingFee);
    setCancellationFee(quote.cancellationFee);
    setPickType(quote.pickType);
    setCasesPerOrder(quote.casesPerOrder);
    setLabelsPerOrder(quote.labelsPerOrder);
    setMonthlyOrders(quote.monthlyOrders);
    setCasePickMargin(quote.casePickMargin);
    setPalletSupplyMargin(quote.palletSupplyMargin);
    setShrinkWrapMargin(quote.shrinkWrapMargin);
    setLabelingMargin(quote.labelingMargin);
    setOrderProcessingMargin(quote.orderProcessingMargin);
    setCancellationMargin(quote.cancellationMargin);
    setStorageRateOverride(quote.storageRateOverride ?? null);
    setHandlingInRateOverride(quote.handlingInRateOverride ?? null);
    setHandlingOutRateOverride(quote.handlingOutRateOverride ?? null);
    setClientCompany(quote.clientCompany || "");
    setClientContact(quote.clientContact || "");
    setClientAddress1(quote.clientAddress1 || "");
    setClientAddress2(quote.clientAddress2 || "");
    setClientCity(quote.clientCity || "");
    setClientState(quote.clientState || "");
    setClientZip(quote.clientZip || "");
    setClientPhone(quote.clientPhone || "");
    setClientEmail(quote.clientEmail || "");
    setTier1Name(quote.tier1Name || "Standard");
    setTier1Length(quote.tier1Length || "0-60 days");
    setTier1Discount(quote.tier1Discount || 0);
    setTier2Name(quote.tier2Name || "Bronze");
    setTier2Length(quote.tier2Length || "12 months");
    setTier2Discount(quote.tier2Discount || 5);
    setTier3Name(quote.tier3Name || "Silver");
    setTier3Length(quote.tier3Length || "36 months");
    setTier3Discount(quote.tier3Discount || 10);
    setTier4Name(quote.tier4Name || "Gold");
    setTier4Length(quote.tier4Length || "60+ months");
    setTier4Discount(quote.tier4Discount || 15);
    setSelectedDiscountTier(quote.selectedDiscountTier || "tier1");
    setQuoteValidDays(quote.quoteValidDays || 90);
    setPaymentTerms(quote.paymentTerms || "Net 30");
    setMinimumCommitment(quote.minimumCommitment || "");
    setCustomDisclosures(quote.customDisclosures || "");
    // Load freight lanes
    if (quote.freightLanes) {
      try {
        setFreightLanes(JSON.parse(quote.freightLanes));
      } catch (e) {
        setFreightLanes([]);
      }
    } else {
      setFreightLanes([]);
    }
    setCurrentQuoteId(quote.id);
    
    alert(`Quote "${quote.quoteName}" loaded successfully!`);
  };
  
  // Export quote to PDF - Professional proposal style matching GBV format
  const exportQuotePDF = () => {
    if (!selectedFacilityData) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const blue = [30, 62, 99] as const;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Helper: section header bar
    const sectionBar = (text: string, y: number) => {
      doc.setFillColor(...blue);
      doc.rect(margin, y, contentWidth, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`  ${text}`, margin + 2, y + 5);
      doc.setTextColor(0, 0, 0);
      return y + 9;
    };
    
    // Helper: table header row
    const tableHeader = (cols: string[], widths: number[], y: number) => {
      doc.setFillColor(...blue);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      let x = margin;
      for (let i = 0; i < cols.length; i++) {
        const align = i === 0 ? "L" : "R";
        doc.rect(x, y, widths[i], 6, "F");
        if (align === "L") {
          doc.text(`  ${cols[i]}`, x + 1, y + 4);
        } else {
          doc.text(cols[i], x + widths[i] - 2, y + 4, { align: "right" });
        }
        x += widths[i];
      }
      doc.setTextColor(0, 0, 0);
      return y + 6;
    };
    
    // Helper: table data row
    const tableRow = (values: string[], widths: number[], y: number, boldCol: number = 1) => {
      let x = margin;
      for (let i = 0; i < values.length; i++) {
        const isBold = i === boldCol;
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.setFontSize(isBold ? 8.5 : 8.5);
        if (i > 1 && i !== boldCol) {
          doc.setTextColor(100, 100, 100);
        } else {
          doc.setTextColor(0, 0, 0);
        }
        const align = i === 0 ? "L" : "R";
        // Draw bottom border
        doc.setDrawColor(220, 220, 220);
        doc.line(x, y + 5.5, x + widths[i], y + 5.5);
        if (align === "L") {
          doc.text(`  ${values[i]}`, x + 1, y + 4);
        } else {
          doc.text(values[i], x + widths[i] - 2, y + 4, { align: "right" });
        }
        x += widths[i];
      }
      doc.setTextColor(0, 0, 0);
      return y + 5.5;
    };
    
    // Helper: footer on every page
    const addFooter = () => {
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text(`${companyName} | Confidential`, pageWidth / 2, pageHeight - 10, { align: "center" });
        doc.text("sales@lmwarehousing.com", pageWidth / 2, pageHeight - 6, { align: "center" });
      }
    };
    
    // ============================================================
    // PAGE 1 - HEADER
    // ============================================================
    
    // Logo
    try {
      doc.addImage(logoPath, "PNG", margin, 10, 45, 18);
    } catch (e) {
      console.warn("Logo not loaded");
    }
    
    // Title block (right of logo)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...blue);
    doc.text("WAREHOUSING SERVICES PROPOSAL", 60, 16);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const preparedForName = clientCompany || clientContact || "Prospective Client";
    doc.text(`Prepared for ${preparedForName}`, 60, 23);
    
    doc.setFontSize(8.5);
    doc.text(`${today}  |  Quote Valid for ${quoteValidDays} Days`, 60, 29);
    doc.setTextColor(0, 0, 0);
    
    // Divider line
    let yPos = 34;
    doc.setDrawColor(...blue);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4;
    
    // Two-column info boxes
    const colW = 88;
    const yInfoStart = yPos;
    
    // Left: Prepared For
    doc.setFillColor(245, 247, 250);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.rect(margin, yInfoStart, colW, 5.5, "F");
    doc.text("  PREPARED FOR", margin + 1, yInfoStart + 4);
    
    let leftY = yInfoStart + 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const leftLines = [
      clientCompany || "",
      clientContact || "",
      clientAddress1 || "",
      clientAddress2 || "",
      [clientCity, clientState, clientZip].filter(Boolean).join(", "),
      clientPhone || "",
      clientEmail || ""
    ].filter(Boolean);
    
    leftLines.forEach(line => {
      doc.text(`  ${line}`, margin + 1, leftY);
      leftY += 4.5;
    });
    
    // Right: Prepared By
    const rightX = 110;
    doc.setFillColor(245, 247, 250);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.rect(rightX, yInfoStart, colW, 5.5, "F");
    doc.text("  PREPARED BY", rightX + 1, yInfoStart + 4);
    
    let rightY = yInfoStart + 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const rightLines = [
      companyName,
      "sales@lmwarehousing.com",
      "",
      "Primary Facility:",
      selectedFacilityData.name,
    ];
    rightLines.forEach(line => {
      doc.text(`  ${line}`, rightX + 1, rightY);
      rightY += 4.5;
    });
    
    yPos = Math.max(leftY, rightY) + 4;
    
    // ============================================================
    // SECTION 1 - STORAGE RATES
    // ============================================================
    yPos = sectionBar(`1. STORAGE RATES`, yPos);
    
    const col3Widths = [contentWidth * 0.45, contentWidth * 0.25, contentWidth * 0.30];
    yPos = tableHeader(["Service", "Rate", "Notes"], col3Widths, yPos);
    
    yPos = tableRow(["Pallet Storage", `$${finalStorageRate.toFixed(2)}`, "Per pallet / month"], col3Widths, yPos);
    
    if (storageMinimum > 0) {
      yPos += 2;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`Monthly storage minimum: $${storageMinimum.toFixed(2)}. Storage billed monthly based on pallet positions occupied.`, margin + 2, yPos + 3);
      doc.setTextColor(0, 0, 0);
      yPos += 6;
    } else {
      yPos += 4;
    }
    
    // ============================================================
    // SECTION 2 - HANDLING & LABOR
    // ============================================================
    yPos = sectionBar("2. HANDLING & LABOR RATES", yPos);
    
    yPos = tableHeader(["Service", "Rate", "Notes"], col3Widths, yPos);
    yPos = tableRow(["Handling In (Receiving)", `$${finalHandlingInRate.toFixed(2)}`, "Per pallet"], col3Widths, yPos);
    yPos = tableRow(["Handling Out (Shipping)", `$${finalHandlingOutRate.toFixed(2)}`, "Per pallet"], col3Widths, yPos);
    
    yPos += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("  Out-of-Scope Labor:", margin + 1, yPos + 3);
    doc.setFont("helvetica", "normal");
    doc.text("Standard: $50.00/hour  |  Weekend: $75.00/hour", margin + 50, yPos + 3);
    yPos += 8;
    
    // ============================================================
    // SECTION 3 - VALUE-ADDED SERVICES
    // ============================================================
    yPos = sectionBar("3. VALUE-ADDED SERVICES", yPos);
    
    const col2Widths = [contentWidth * 0.55, contentWidth * 0.45];
    yPos = tableHeader(["Service", "Rate"], col2Widths, yPos);
    
    const vasItems: [string, string][] = [
      ["Case Pick", `$${casePickRate.toFixed(2)}/case`],
      ["Layer Pick", `$${layerPickRate.toFixed(2)}/case`],
      ["Pallet Supply", `$${palletSupplyFee.toFixed(2)}/pallet`],
      ["Shrink Wrap", `$${shrinkWrapFee.toFixed(2)}/pallet`],
      ["Labeling", `$${labelingFee.toFixed(2)}/label`],
      ["Order Processing", `$${orderProcessingFee.toFixed(2)}/order`],
      ["Cancellation/Restock", `$${cancellationFee.toFixed(2)}/order`]
    ];
    
    vasItems.forEach(item => {
      yPos = tableRow(item, col2Widths, yPos);
    });
    yPos += 6;
    
    // ============================================================
    // SECTION 4 - TRANSPORTATION (if freight lanes exist)
    // ============================================================
    if (freightLanes.length > 0) {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 15;
      }
      
      yPos = sectionBar("4. TRANSPORTATION SERVICES", yPos);
      
      const freightWidths = [contentWidth * 0.40, contentWidth * 0.20, contentWidth * 0.20, contentWidth * 0.20];
      
      const outboundLanes = freightLanes.filter(l => l.type === "outbound");
      const inboundLanes = freightLanes.filter(l => l.type === "inbound");
      
      if (outboundLanes.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text("  Outbound (Delivery from Warehouse)", margin + 1, yPos + 3);
        yPos += 6;
        yPos = tableHeader(["Destination", "Load Size", "Weight", "Rate/Load"], freightWidths, yPos);
        outboundLanes.forEach(lane => {
          yPos = tableRow([lane.destination, `${lane.pallets} pallets`, `${lane.weight.toLocaleString()} lbs`, `$${lane.rate.toFixed(2)}`], freightWidths, yPos);
        });
        yPos += 4;
      }
      
      if (inboundLanes.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text("  Inbound (Pickup to Warehouse)", margin + 1, yPos + 3);
        yPos += 6;
        yPos = tableHeader(["Origin", "Load Size", "Weight", "Rate/Load"], freightWidths, yPos);
        inboundLanes.forEach(lane => {
          yPos = tableRow([lane.origin, `${lane.pallets} pallets`, `${lane.weight.toLocaleString()} lbs`, `$${lane.rate.toFixed(2)}`], freightWidths, yPos);
        });
        yPos += 4;
      }
      yPos += 4;
    }
    
    // ============================================================
    // TERMS & CONDITIONS
    // ============================================================
    const termsSection = freightLanes.length > 0 ? 5 : 4;
    if (yPos > pageHeight - 70) {
      doc.addPage();
      yPos = 15;
    }
    
    yPos = sectionBar(`${termsSection}. SERVICE COMMITMENT & TERMS`, yPos);
    
    const termsData = [
      ["Payment Terms", paymentTerms || "Net 30"],
      ["Quote Validity", `${quoteValidDays} days from date of proposal`],
      ["Insurance", "Comprehensive GL: $1M | Cargo: $250K"],
      minimumCommitment ? ["Minimum Commitment", minimumCommitment] : null,
      ["Support", "sales@lmwarehousing.com"]
    ].filter(Boolean) as string[][];
    
    termsData.forEach(term => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(`  ${term[0]}:`, margin + 1, yPos + 3);
      doc.setFont("helvetica", "normal");
      doc.text(term[1], margin + 52, yPos + 3);
      yPos += 5.5;
    });
    
    yPos += 6;
    
    // ============================================================
    // TIERED PRICING (if any tiers have discounts)
    // ============================================================
    const tiers = [
      { name: tier1Name, length: tier1Length, discount: tier1Discount },
      { name: tier2Name, length: tier2Length, discount: tier2Discount },
      { name: tier3Name, length: tier3Length, discount: tier3Discount },
      { name: tier4Name, length: tier4Length, discount: tier4Discount },
    ].filter(t => t.name && t.length);
    
    if (tiers.length > 1) {
      const tierSection = termsSection + 1;
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 15;
      }
      
      yPos = sectionBar(`${tierSection}. CONTRACT TIER PRICING`, yPos);
      
      const tierWidths = [contentWidth * 0.25, contentWidth * 0.25, contentWidth * 0.25, contentWidth * 0.25];
      yPos = tableHeader(["Tier", "Commitment", "Storage Rate", "Discount"], tierWidths, yPos);
      
      tiers.forEach(tier => {
        const discountedRate = finalStorageRate * (1 - tier.discount / 100);
        yPos = tableRow(
          [tier.name, tier.length, `$${discountedRate.toFixed(2)}/pallet`, tier.discount > 0 ? `${tier.discount}% off` : "Base rate"],
          tierWidths, yPos, 2
        );
      });
      yPos += 6;
    }
    
    // ============================================================
    // DISCLOSURES / PALLET CONFIGURATIONS
    // ============================================================
    if (customDisclosures) {
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 15;
      }
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("  Additional Disclosures:", margin + 1, yPos + 3);
      yPos += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      const discLines = doc.splitTextToSize(customDisclosures, contentWidth - 4);
      discLines.slice(0, 8).forEach((line: string) => {
        doc.text(line, margin + 2, yPos + 3);
        yPos += 4;
      });
      doc.setTextColor(0, 0, 0);
      yPos += 4;
    }
    
    // ============================================================
    // AUTHORIZATION & SIGNATURE BLOCKS
    // ============================================================
    const sigSection = termsSection + 1;
    if (yPos > pageHeight - 65) {
      doc.addPage();
      yPos = 15;
    }
    
    yPos = sectionBar(`${sigSection}. AUTHORIZATION & ACCEPTANCE`, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("By signing below, both parties agree to the rates and terms outlined in this proposal.", margin + 2, yPos + 3);
    yPos += 10;
    
    // Two signature columns
    const clientSigName = (clientCompany || clientContact || "CLIENT").toUpperCase();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(clientSigName, margin + 2, yPos);
    doc.text(companyName.toUpperCase(), rightX + 2, yPos);
    yPos += 12;
    
    doc.setDrawColor(150, 150, 150);
    doc.line(margin, yPos, margin + 85, yPos);
    doc.line(rightX, yPos, rightX + 85, yPos);
    yPos += 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Signature", margin + 2, yPos + 2);
    doc.text("Signature", rightX + 2, yPos + 2);
    yPos += 10;
    
    doc.line(margin, yPos, margin + 85, yPos);
    doc.line(rightX, yPos, rightX + 85, yPos);
    yPos += 2;
    doc.text("Printed Name & Title", margin + 2, yPos + 2);
    doc.text("Printed Name & Title", rightX + 2, yPos + 2);
    yPos += 10;
    
    doc.line(margin, yPos, margin + 85, yPos);
    doc.line(rightX, yPos, rightX + 85, yPos);
    yPos += 2;
    doc.text("Date", margin + 2, yPos + 2);
    doc.text("Date", rightX + 2, yPos + 2);
    
    // Add footer to all pages
    addFooter();
    
    // Save
    const clientSlug = (clientCompany || clientContact || "Quote").replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `L&M_Proposal_${clientSlug}_${new Date().toISOString().split('T')[0]}.pdf`;
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
  const calculatedMonthlyStorage = recommendedStorageRate * monthlyPallets;
  const recommendedMonthlyStorage = Math.max(calculatedMonthlyStorage, storageMinimum); // Apply minimum if set
  
  const handlingInCost = (inboundMinutes / 60) * fullyLoadedLaborRate;
  const recommendedHandlingInRate = handlingInCost * (1 + handlingInMargin / 100);
  const estimatedMonthlyHandlingIn = recommendedHandlingInRate * monthlyPallets * monthlyTurns;
  
  const handlingOutCost = (outboundMinutes / 60) * fullyLoadedLaborRate;
  const recommendedHandlingOutRate = handlingOutCost * (1 + handlingOutMargin / 100);
  const estimatedMonthlyHandlingOut = recommendedHandlingOutRate * monthlyPallets * monthlyTurns;
  
  // Value-Added Services Calculations
  const pickRatePerCase = pickType === "layer" ? layerPickRate : pickType === "case" ? casePickRate : 0;
  const monthlyCasePickCost = pickRatePerCase * casesPerOrder * monthlyOrders;
  const monthlyCasePickRate = monthlyCasePickCost * (1 + casePickMargin / 100);
  
  const monthlyPalletSupplyCost = palletSupplyFee * monthlyOrders;
  const monthlyPalletSupplyRate = monthlyPalletSupplyCost * (1 + palletSupplyMargin / 100);
  
  const monthlyShrinkWrapCost = shrinkWrapFee * monthlyOrders;
  const monthlyShrinkWrapRate = monthlyShrinkWrapCost * (1 + shrinkWrapMargin / 100);
  
  const monthlyLabelingCost = labelingFee * labelsPerOrder * monthlyOrders;
  const monthlyLabelingRate = monthlyLabelingCost * (1 + labelingMargin / 100);
  
  const monthlyOrderProcessingCost = orderProcessingFee * monthlyOrders;
  const monthlyOrderProcessingRate = monthlyOrderProcessingCost * (1 + orderProcessingMargin / 100);
  
  const totalValueAddedServices = monthlyCasePickRate + monthlyPalletSupplyRate + monthlyShrinkWrapRate + monthlyLabelingRate + monthlyOrderProcessingRate;
  
  // Apply overrides first, then apply contract length discount
  const getDiscountMultiplier = () => {
    if (selectedDiscountTier === "tier1") return 1 - (tier1Discount / 100);
    if (selectedDiscountTier === "tier2") return 1 - (tier2Discount / 100);
    if (selectedDiscountTier === "tier3") return 1 - (tier3Discount / 100);
    if (selectedDiscountTier === "tier4") return 1 - (tier4Discount / 100);
    return 1; // no discount
  };
  const discountMultiplier = getDiscountMultiplier();
  
  // Storage: override first, then discount
  const baseStorageRate = storageRateOverride !== null ? storageRateOverride : recommendedStorageRate;
  const finalStorageRate = baseStorageRate * discountMultiplier;
  const actualStorageMargin = storageCostPerPallet > 0 ? ((finalStorageRate - storageCostPerPallet) / storageCostPerPallet) * 100 : 0;
  const finalMonthlyStorage = finalStorageRate * monthlyPallets;
  
  // Handling In: override first, then discount
  const baseHandlingInRate = handlingInRateOverride !== null ? handlingInRateOverride : recommendedHandlingInRate;
  const finalHandlingInRate = baseHandlingInRate * discountMultiplier;
  const actualHandlingInMargin = handlingInCost > 0 ? ((finalHandlingInRate - handlingInCost) / handlingInCost) * 100 : 0;
  const finalMonthlyHandlingIn = finalHandlingInRate * monthlyPallets * monthlyTurns;
  
  // Handling Out: override first, then discount
  const baseHandlingOutRate = handlingOutRateOverride !== null ? handlingOutRateOverride : recommendedHandlingOutRate;
  const finalHandlingOutRate = baseHandlingOutRate * discountMultiplier;
  const actualHandlingOutMargin = handlingOutCost > 0 ? ((finalHandlingOutRate - handlingOutCost) / handlingOutCost) * 100 : 0;
  const finalMonthlyHandlingOut = finalHandlingOutRate * monthlyPallets * monthlyTurns;
  
  const totalEstimatedMonthlyBilling = finalMonthlyStorage + finalMonthlyHandlingIn + finalMonthlyHandlingOut + totalValueAddedServices;

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
                {/* Save/Load Quote */}
                <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                  <h3 className="font-semibold text-sm">Save & Load Quotes</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quote-name">Quote Name</Label>
                      <Input
                        id="quote-name"
                        type="text"
                        value={quoteName}
                        onChange={(e) => setQuoteName(e.target.value)}
                        placeholder="e.g., Señor Sangria - Initial Quote"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="load-quote">Load Saved Quote</Label>
                      <Select onValueChange={(v) => loadQuote(Number(v))}>
                        <SelectTrigger id="load-quote">
                          <SelectValue placeholder="Select a quote..." />
                        </SelectTrigger>
                        <SelectContent>
                          {quotesQuery.data?.map((quote: any) => (
                            <SelectItem key={quote.id} value={quote.id.toString()}>
                              {quote.quoteName} - {new Date(quote.updatedAt).toLocaleDateString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={saveQuote} variant="default" size="sm" className="w-full" disabled={saveQuoteMutation.isPending}>
                    {saveQuoteMutation.isPending ? "Saving..." : currentQuoteId ? "Update Quote" : "Save New Quote"}
                  </Button>
                </div>
                
                {/* New Quote Button */}
                {currentQuoteId && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                      Currently editing: <strong>{quoteName}</strong>
                    </p>
                    <Button onClick={() => { setCurrentQuoteId(null); setQuoteName(""); }} variant="outline" size="sm">
                      Start New Quote
                    </Button>
                  </div>
                )}
                
                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Client Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-company">Company Name</Label>
                      <Input
                        id="client-company"
                        type="text"
                        value={clientCompany}
                        onChange={(e) => setClientCompany(e.target.value)}
                        placeholder="Company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-contact">Contact Name</Label>
                      <Input
                        id="client-contact"
                        type="text"
                        value={clientContact}
                        onChange={(e) => setClientContact(e.target.value)}
                        placeholder="Contact person"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-address1">Address Line 1</Label>
                    <Input
                      id="client-address1"
                      type="text"
                      value={clientAddress1}
                      onChange={(e) => setClientAddress1(e.target.value)}
                        placeholder="Street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-address2">Address Line 2 (Optional)</Label>
                    <Input
                      id="client-address2"
                      type="text"
                      value={clientAddress2}
                      onChange={(e) => setClientAddress2(e.target.value)}
                        placeholder="Suite, floor, etc."
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-city">City</Label>
                      <Input
                        id="client-city"
                        type="text"
                        value={clientCity}
                        onChange={(e) => setClientCity(e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-state">State</Label>
                      <Input
                        id="client-state"
                        type="text"
                        value={clientState}
                        onChange={(e) => setClientState(e.target.value)}
                        placeholder="State"
                        maxLength={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-zip">ZIP Code</Label>
                      <Input
                        id="client-zip"
                        type="text"
                        value={clientZip}
                        onChange={(e) => setClientZip(e.target.value)}
                        placeholder="ZIP code"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-phone">Phone</Label>
                      <Input
                        id="client-phone"
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-email">Email</Label>
                      <Input
                        id="client-email"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="Email address"
                      />
                    </div>
                  </div>
                </div>
                
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
                    <div className="space-y-2">
                      <Label htmlFor="storage-minimum">Monthly Storage Minimum ($)</Label>
                      <Input
                        id="storage-minimum"
                        type="number"
                        value={storageMinimum}
                        onChange={(e) => setStorageMinimum(Number(e.target.value))}
                        step="50"
                        placeholder="0 = no minimum"
                      />
                      <p className="text-xs text-muted-foreground">
                        Set minimum monthly storage charge (adjustable for client flow)
                      </p>
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
            
            {/* Value-Added Services */}
            <Card>
              <CardHeader>
                <CardTitle>Value-Added Services</CardTitle>
                <CardDescription>Configure pick type, order volume, and service fees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pick Type Selection */}
                <div className="space-y-4">
                  <Label>Pick Type</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={pickType === "full" ? "default" : "outline"}
                      onClick={() => setPickType("full")}
                      className="h-auto py-3 flex flex-col items-center gap-2"
                    >
                      <Package className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-semibold">Full Pallet</div>
                        <div className="text-xs text-muted-foreground">No case pick fee</div>
                      </div>
                    </Button>
                    <Button
                      variant={pickType === "layer" ? "default" : "outline"}
                      onClick={() => setPickType("layer")}
                      className="h-auto py-3 flex flex-col items-center gap-2"
                    >
                      <Layers className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-semibold">Layer Pick</div>
                        <div className="text-xs text-muted-foreground">${layerPickRate.toFixed(2)}/case</div>
                      </div>
                    </Button>
                    <Button
                      variant={pickType === "case" ? "default" : "outline"}
                      onClick={() => setPickType("case")}
                      className="h-auto py-3 flex flex-col items-center gap-2"
                    >
                      <Box className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-semibold">Case Pick</div>
                        <div className="text-xs text-muted-foreground">${casePickRate.toFixed(2)}/case</div>
                      </div>
                    </Button>
                  </div>
                </div>
                
                {/* Order Volume */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthly-orders">Monthly Orders</Label>
                    <Input
                      id="monthly-orders"
                      type="number"
                      value={monthlyOrders}
                      onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                      min="0"
                    />
                  </div>
                  {pickType !== "full" && (
                    <div className="space-y-2">
                      <Label htmlFor="cases-per-order">Cases per Order</Label>
                      <Input
                        id="cases-per-order"
                        type="number"
                        value={casesPerOrder}
                        onChange={(e) => setCasesPerOrder(Number(e.target.value))}
                        min="0"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="labels-per-order">Labels per Order</Label>
                    <Input
                      id="labels-per-order"
                      type="number"
                      value={labelsPerOrder}
                      onChange={(e) => setLabelsPerOrder(Number(e.target.value))}
                      min="0"
                    />
                  </div>
                </div>
                
                {/* Service Rates */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Service Rates & Margins</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {pickType !== "full" && (
                      <div className="space-y-2">
                        <Label htmlFor="case-pick-rate">{pickType === "layer" ? "Layer" : "Case"} Pick Rate ($/case)</Label>
                        <Input
                          id="case-pick-rate"
                          type="number"
                          value={pickType === "layer" ? layerPickRate : casePickRate}
                          onChange={(e) => pickType === "layer" ? setLayerPickRate(Number(e.target.value)) : setCasePickRate(Number(e.target.value))}
                          step="0.05"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="pallet-supply">Pallet Supply ($/pallet)</Label>
                      <Input
                        id="pallet-supply"
                        type="number"
                        value={palletSupplyFee}
                        onChange={(e) => setPalletSupplyFee(Number(e.target.value))}
                        step="0.50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shrink-wrap">Shrink Wrap ($/pallet)</Label>
                      <Input
                        id="shrink-wrap"
                        type="number"
                        value={shrinkWrapFee}
                        onChange={(e) => setShrinkWrapFee(Number(e.target.value))}
                        step="0.50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="labeling">Labeling ($/label)</Label>
                      <Input
                        id="labeling"
                        type="number"
                        value={labelingFee}
                        onChange={(e) => setLabelingFee(Number(e.target.value))}
                        step="0.05"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="order-processing">Order Processing ($/order)</Label>
                      <Input
                        id="order-processing"
                        type="number"
                        value={orderProcessingFee}
                        onChange={(e) => setOrderProcessingFee(Number(e.target.value))}
                        step="1.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cancellation">Cancellation/Restock ($/order)</Label>
                      <Input
                        id="cancellation"
                        type="number"
                        value={cancellationFee}
                        onChange={(e) => setCancellationFee(Number(e.target.value))}
                        step="5.00"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Disclosures & Assumptions */}
            <Card>
              <CardHeader>
                <CardTitle>Quote Terms & Disclosures</CardTitle>
                <CardDescription>Add contract terms and product specifications for PDF export</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quote-valid-days">Quote Valid (days)</Label>
                    <Input
                      id="quote-valid-days"
                      type="number"
                      value={quoteValidDays}
                      onChange={(e) => setQuoteValidDays(Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-terms">Payment Terms</Label>
                    <Input
                      id="payment-terms"
                      type="text"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      placeholder="Net 30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimum-commitment">Minimum Commitment</Label>
                    <Input
                      id="minimum-commitment"
                      type="text"
                      value={minimumCommitment}
                      onChange={(e) => setMinimumCommitment(e.target.value)}
                      placeholder="12 months"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-disclosures">Additional Disclosures (Optional)</Label>
                  <Textarea
                    id="custom-disclosures"
                    value={customDisclosures}
                    onChange={(e) => setCustomDisclosures(e.target.value)}
                    placeholder="Standard Pallet Configurations:\n• 750ml / 12-pack: 56 cases/pallet\n• 1.5L / 6-pack: 60 cases/pallet\n• RTD 12oz sleek / 24ct trays: 104 trays/pallet\n• Mixed pallets: billed at case-pick rate"
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Transportation / Freight Lanes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Transportation Services
                </CardTitle>
                <CardDescription>Add freight lanes for inbound/outbound shipping quotes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Lane */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newLane: FreightLane = {
                        id: Date.now().toString(),
                        type: "outbound",
                        origin: selectedFacilityData?.name || "",
                        destination: "",
                        rate: 0,
                        pallets: 21,
                        weight: 40000,
                        notes: ""
                      };
                      setFreightLanes([...freightLanes, newLane]);
                    }}
                  >
                    + Add Outbound Lane
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newLane: FreightLane = {
                        id: Date.now().toString(),
                        type: "inbound",
                        origin: "",
                        destination: selectedFacilityData?.name || "",
                        rate: 0,
                        pallets: 21,
                        weight: 40000,
                        notes: ""
                      };
                      setFreightLanes([...freightLanes, newLane]);
                    }}
                  >
                    + Add Inbound Lane
                  </Button>
                </div>
                
                {/* Freight Lanes List */}
                {freightLanes.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No freight lanes added. Click above to add transportation quotes.</p>
                ) : (
                  <div className="space-y-3">
                    {freightLanes.map((lane, index) => (
                      <div key={lane.id} className={`border rounded-lg p-3 ${lane.type === "inbound" ? "bg-green-50 dark:bg-green-950" : "bg-blue-50 dark:bg-blue-950"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-semibold uppercase ${lane.type === "inbound" ? "text-green-600" : "text-blue-600"}`}>
                            {lane.type === "inbound" ? "Inbound (Pickup)" : "Outbound (Delivery)"}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={() => setFreightLanes(freightLanes.filter(l => l.id !== lane.id))}
                          >
                            ×
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-5 gap-2">
                          <div className="md:col-span-2">
                            <Label className="text-xs">{lane.type === "inbound" ? "Pickup Address" : "Delivery Address"}</Label>
                            <Input
                              value={lane.type === "inbound" ? lane.origin : lane.destination}
                              onChange={(e) => {
                                const updated = [...freightLanes];
                                if (lane.type === "inbound") {
                                  updated[index].origin = e.target.value;
                                } else {
                                  updated[index].destination = e.target.value;
                                }
                                setFreightLanes(updated);
                              }}
                              placeholder="Full address"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Pallets</Label>
                            <Input
                              type="number"
                              value={lane.pallets}
                              onChange={(e) => {
                                const updated = [...freightLanes];
                                updated[index].pallets = Number(e.target.value);
                                setFreightLanes(updated);
                              }}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Weight (lbs)</Label>
                            <Input
                              type="number"
                              value={lane.weight}
                              onChange={(e) => {
                                const updated = [...freightLanes];
                                updated[index].weight = Number(e.target.value);
                                setFreightLanes(updated);
                              }}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Rate ($)</Label>
                            <Input
                              type="number"
                              value={lane.rate}
                              onChange={(e) => {
                                const updated = [...freightLanes];
                                updated[index].rate = Number(e.target.value);
                                setFreightLanes(updated);
                              }}
                              step="25"
                              className="text-sm font-semibold"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Freight Summary */}
                    {freightLanes.length > 0 && (
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">Total Freight Lanes:</span>
                          <span>{freightLanes.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Outbound:</span>
                          <span>{freightLanes.filter(l => l.type === "outbound").length} lanes - ${freightLanes.filter(l => l.type === "outbound").reduce((sum, l) => sum + l.rate, 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Inbound:</span>
                          <span>{freightLanes.filter(l => l.type === "inbound").length} lanes - ${freightLanes.filter(l => l.type === "inbound").reduce((sum, l) => sum + l.rate, 0).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                  
                  {/* Value-Added Services Display */}
                  {monthlyOrders > 0 && (
                    <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950">
                      <h3 className="font-semibold text-lg mb-3">Value-Added Services</h3>
                      <div className="grid gap-2 text-sm">
                        {pickType !== "full" && monthlyCasePickRate > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{pickType === "layer" ? "Layer" : "Case"} Pick ({casesPerOrder} cases × {monthlyOrders} orders):</span>
                            <span className="font-mono">${monthlyCasePickRate.toFixed(2)}</span>
                          </div>
                        )}
                        {monthlyPalletSupplyRate > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pallet Supply ({monthlyOrders} orders):</span>
                            <span className="font-mono">${monthlyPalletSupplyRate.toFixed(2)}</span>
                          </div>
                        )}
                        {monthlyShrinkWrapRate > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Shrink Wrap ({monthlyOrders} orders):</span>
                            <span className="font-mono">${monthlyShrinkWrapRate.toFixed(2)}</span>
                          </div>
                        )}
                        {monthlyLabelingRate > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Labeling ({labelsPerOrder} labels × {monthlyOrders} orders):</span>
                            <span className="font-mono">${monthlyLabelingRate.toFixed(2)}</span>
                          </div>
                        )}
                        {monthlyOrderProcessingRate > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Order Processing ({monthlyOrders} orders):</span>
                            <span className="font-mono">${monthlyOrderProcessingRate.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-semibold">Total Value-Added Services:</span>
                          <span className="font-mono text-lg font-bold">${totalValueAddedServices.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                        <p>Note: Cancellation/Restock fee (${cancellationFee.toFixed(2)}) is charged per cancelled order and not included in monthly estimates.</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Contract Length Discount Configuration */}
                  <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Contract Length Discounts
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Configure tiered pricing based on commitment length. Discounts apply to all rates (after any manual overrides).</p>
                    
                    {/* Tier Configuration */}
                    <div className="space-y-4 mb-4">
                      {/* Tier 1 */}
                      <div className="grid md:grid-cols-3 gap-4 p-3 border rounded-lg bg-background">
                        <div className="space-y-2">
                          <Label htmlFor="tier1-name">Tier 1 Name</Label>
                          <Input
                            id="tier1-name"
                            value={tier1Name}
                            onChange={(e) => setTier1Name(e.target.value)}
                            placeholder="Standard"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tier1-length">Contract Length</Label>
                          <Input
                            id="tier1-length"
                            value={tier1Length}
                            onChange={(e) => setTier1Length(e.target.value)}
                            placeholder="0-60 days"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tier1-discount">Discount %</Label>
                          <Input
                            id="tier1-discount"
                            type="number"
                            value={tier1Discount}
                            onChange={(e) => setTier1Discount(Number(e.target.value))}
                            step="1"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                      
                      {/* Tier 2 */}
                      <div className="grid md:grid-cols-3 gap-4 p-3 border rounded-lg bg-background">
                        <div className="space-y-2">
                          <Label htmlFor="tier2-name">Tier 2 Name</Label>
                          <Input
                            id="tier2-name"
                            value={tier2Name}
                            onChange={(e) => setTier2Name(e.target.value)}
                            placeholder="Bronze"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tier2-length">Contract Length</Label>
                          <Input
                            id="tier2-length"
                            value={tier2Length}
                            onChange={(e) => setTier2Length(e.target.value)}
                            placeholder="12 months"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tier2-discount">Discount %</Label>
                          <Input
                            id="tier2-discount"
                            type="number"
                            value={tier2Discount}
                            onChange={(e) => setTier2Discount(Number(e.target.value))}
                            step="1"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                      
                      {/* Tier 3 */}
                      <div className="grid md:grid-cols-3 gap-4 p-3 border rounded-lg bg-background">
                        <div className="space-y-2">
                          <Label htmlFor="tier3-name">Tier 3 Name</Label>
                          <Input
                            id="tier3-name"
                            value={tier3Name}
                            onChange={(e) => setTier3Name(e.target.value)}
                            placeholder="Silver"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tier3-length">Contract Length</Label>
                          <Input
                            id="tier3-length"
                            value={tier3Length}
                            onChange={(e) => setTier3Length(e.target.value)}
                            placeholder="36 months"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tier3-discount">Discount %</Label>
                          <Input
                            id="tier3-discount"
                            type="number"
                            value={tier3Discount}
                            onChange={(e) => setTier3Discount(Number(e.target.value))}
                            step="1"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                      
                      {/* Tier 4 */}
                      <div className="grid md:grid-cols-3 gap-4 p-3 border rounded-lg bg-background">
                        <div className="space-y-2">
                          <Label htmlFor="tier4-name">Tier 4 Name</Label>
                          <Input
                            id="tier4-name"
                            value={tier4Name}
                            onChange={(e) => setTier4Name(e.target.value)}
                            placeholder="Gold"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tier4-length">Contract Length</Label>
                          <Input
                            id="tier4-length"
                            value={tier4Length}
                            onChange={(e) => setTier4Length(e.target.value)}
                            placeholder="60+ months"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tier4-discount">Discount %</Label>
                          <Input
                            id="tier4-discount"
                            type="number"
                            value={tier4Discount}
                            onChange={(e) => setTier4Discount(Number(e.target.value))}
                            step="1"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Select Active Discount Tier */}
                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor="selected-tier">Apply Discount Tier to This Quote</Label>
                      <Select value={selectedDiscountTier} onValueChange={setSelectedDiscountTier}>
                        <SelectTrigger id="selected-tier">
                          <SelectValue placeholder="No discount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Discount (0%)</SelectItem>
                          <SelectItem value="tier1">{tier1Name} - {tier1Length} ({tier1Discount}% off)</SelectItem>
                          <SelectItem value="tier2">{tier2Name} - {tier2Length} ({tier2Discount}% off)</SelectItem>
                          <SelectItem value="tier3">{tier3Name} - {tier3Length} ({tier3Discount}% off)</SelectItem>
                          <SelectItem value="tier4">{tier4Name} - {tier4Length} ({tier4Discount}% off)</SelectItem>
                        </SelectContent>
                      </Select>
                      {selectedDiscountTier !== "none" && (
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                          ✓ {selectedDiscountTier === "tier1" ? tier1Discount : selectedDiscountTier === "tier2" ? tier2Discount : selectedDiscountTier === "tier3" ? tier3Discount : tier4Discount}% discount applied to all rates
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Rate Override Section */}
                  <div className="border-2 border-amber-500 rounded-lg p-4 bg-amber-50 dark:bg-amber-950">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Override Final Rates (Optional)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Adjust rates before PDF export. Actual margins will be recalculated below.</p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="storage-override">Storage Rate Override ($/pallet/month)</Label>
                        <Input
                          id="storage-override"
                          type="number"
                          value={storageRateOverride ?? ""}
                          onChange={(e) => setStorageRateOverride(e.target.value ? Number(e.target.value) : null)}
                          placeholder={`Default: $${recommendedStorageRate.toFixed(2)}`}
                          step="0.50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="handling-in-override">Handling In Override ($/pallet)</Label>
                        <Input
                          id="handling-in-override"
                          type="number"
                          value={handlingInRateOverride ?? ""}
                          onChange={(e) => setHandlingInRateOverride(e.target.value ? Number(e.target.value) : null)}
                          placeholder={`Default: $${recommendedHandlingInRate.toFixed(2)}`}
                          step="0.50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="handling-out-override">Handling Out Override ($/pallet)</Label>
                        <Input
                          id="handling-out-override"
                          type="number"
                          value={handlingOutRateOverride ?? ""}
                          onChange={(e) => setHandlingOutRateOverride(e.target.value ? Number(e.target.value) : null)}
                          placeholder={`Default: $${recommendedHandlingOutRate.toFixed(2)}`}
                          step="0.50"
                        />
                      </div>
                    </div>
                    
                    {/* Show actual margins when overridden */}
                    {(storageRateOverride !== null || handlingInRateOverride !== null || handlingOutRateOverride !== null) && (
                      <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                        <p className="font-semibold">Actual Margins with Overrides:</p>
                        {storageRateOverride !== null && (
                          <div className="flex justify-between">
                            <span>Storage: Cost ${storageCostPerPallet.toFixed(2)} → Rate ${finalStorageRate.toFixed(2)}</span>
                            <span className={`font-mono font-semibold ${actualStorageMargin < 0 ? 'text-red-600' : actualStorageMargin < 20 ? 'text-amber-600' : 'text-green-600'}`}>
                              {actualStorageMargin.toFixed(1)}% margin
                            </span>
                          </div>
                        )}
                        {handlingInRateOverride !== null && (
                          <div className="flex justify-between">
                            <span>Handling In: Cost ${handlingInCost.toFixed(2)} → Rate ${finalHandlingInRate.toFixed(2)}</span>
                            <span className={`font-mono font-semibold ${actualHandlingInMargin < 0 ? 'text-red-600' : actualHandlingInMargin < 20 ? 'text-amber-600' : 'text-green-600'}`}>
                              {actualHandlingInMargin.toFixed(1)}% margin
                            </span>
                          </div>
                        )}
                        {handlingOutRateOverride !== null && (
                          <div className="flex justify-between">
                            <span>Handling Out: Cost ${handlingOutCost.toFixed(2)} → Rate ${finalHandlingOutRate.toFixed(2)}</span>
                            <span className={`font-mono font-semibold ${actualHandlingOutMargin < 0 ? 'text-red-600' : actualHandlingOutMargin < 20 ? 'text-amber-600' : 'text-green-600'}`}>
                              {actualHandlingOutMargin.toFixed(1)}% margin
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Monthly Summary */}
                  <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
                    <h3 className="font-semibold text-lg mb-3">Monthly Summary</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Storage Minimum:</span>
                        <span className="font-mono">${finalMonthlyStorage.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. Handling In:</span>
                        <span className="font-mono">${finalMonthlyHandlingIn.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Est. Handling Out:</span>
                        <span className="font-mono">${finalMonthlyHandlingOut.toFixed(2)}</span>
                      </div>
                      {totalValueAddedServices > 0 && (
                        <div className="flex justify-between">
                          <span>Value-Added Services:</span>
                          <span className="font-mono">${totalValueAddedServices.toFixed(2)}</span>
                        </div>
                      )}
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
