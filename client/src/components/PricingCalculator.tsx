import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator as CalcIcon, Building2, DollarSign, Users, FileDown, Package, Layers, Box } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { trpc } from "@/lib/trpc";

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
    
    // Prepared For (if provided)
    const hasClientInfo = clientCompany || clientContact;
    if (hasClientInfo) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60, 60, 60);
      const preparedForText = clientCompany || clientContact || "";
      doc.text(`PREPARED FOR: ${preparedForText.toUpperCase()}`, pageWidth / 2, 35, { align: "center" });
    }
    
    // Facility & Date Info Box (adjust position if client info is present)
    const infoBoxY = hasClientInfo ? 42 : 35;
    doc.setFillColor(245, 247, 250);
    doc.rect(15, infoBoxY, pageWidth - 30, 20, "F");
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.text("Facility:", 20, infoBoxY + 8);
    doc.setFont("helvetica", "normal");
    doc.text(selectedFacilityData.name, 20, infoBoxY + 13);
    
    doc.setFont("helvetica", "bold");
    doc.text("Quote Date:", pageWidth - 60, infoBoxY + 8);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), pageWidth - 60, infoBoxY + 13);
    
    // Client Contact Details (if provided)
    let yPos = infoBoxY + 25;
    if (clientContact || clientAddress1 || clientPhone || clientEmail) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60, 60, 60);
      doc.text("Client Contact:", 15, yPos);
      yPos += 5;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      if (clientContact) {
        doc.text(clientContact, 15, yPos);
        yPos += 4;
      }
      if (clientAddress1) {
        doc.text(clientAddress1, 15, yPos);
        yPos += 4;
      }
      if (clientAddress2) {
        doc.text(clientAddress2, 15, yPos);
        yPos += 4;
      }
      if (clientCity || clientState || clientZip) {
        const cityStateZip = [clientCity, clientState, clientZip].filter(Boolean).join(", ");
        doc.text(cityStateZip, 15, yPos);
        yPos += 4;
      }
      if (clientPhone) {
        doc.text(clientPhone, 15, yPos);
        yPos += 4;
      }
      if (clientEmail) {
        doc.text(clientEmail, 15, yPos);
        yPos += 4;
      }
      yPos += 5;
    }
    
    // Contract Length Discounts Table (if discount is applied)
    yPos = Math.max(yPos, infoBoxY + 30);
    if (selectedDiscountTier !== "none") {
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text("Contract Length Discounts", 15, yPos);
      yPos += 8;
      
      autoTable(doc, {
        startY: yPos,
        head: [["Contract Length", "Discount", "Notes"]],
        body: [
          [tier1Length, `${tier1Discount}%`, tier1Name],
          [tier2Length, `${tier2Discount}%`, tier2Name],
          [tier3Length, `${tier3Discount}%`, tier3Name],
          [tier4Length, `${tier4Discount}%`, tier4Name],
        ],
        theme: "grid",
        headStyles: { fillColor: companyName.includes("Peach") ? [255, 165, 79] : [30, 62, 99], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 3 },
        didParseCell: (data) => {
          // Highlight selected tier
          const rowIndex = data.row.index;
          const selectedIndex = selectedDiscountTier === "tier1" ? 0 : selectedDiscountTier === "tier2" ? 1 : selectedDiscountTier === "tier3" ? 2 : 3;
          if (data.section === "body" && rowIndex === selectedIndex) {
            data.cell.styles.fillColor = [255, 248, 220]; // Light yellow highlight
            data.cell.styles.fontStyle = "bold";
          }
        },
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }
    
    // Monthly Storage Minimum Section
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
        `$${finalStorageRate.toFixed(2)}/pallet/month`,
        `$${finalMonthlyStorage.toFixed(2)}`
      ]],
      theme: "grid",
      headStyles: { fillColor: companyName.includes("Peach") ? [255, 165, 79] : [30, 62, 99], textColor: 255, fontStyle: "bold" },
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
          `$${finalHandlingInRate.toFixed(2)}`,
          `$${finalMonthlyHandlingIn.toFixed(2)}`
        ],
        [
          "Handling Out",
          `$${finalHandlingOutRate.toFixed(2)}`,
          `$${finalMonthlyHandlingOut.toFixed(2)}`
        ]
      ],
      theme: "grid",
      headStyles: { fillColor: companyName.includes("Peach") ? [255, 165, 79] : [30, 62, 99], textColor: 255, fontStyle: "bold" },
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
    
    // Value-Added Services Section (Rate Card Format)
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Value-Added Services Rate Card", 15, yPos);
    yPos += 8;
    
    const vasBody: string[][] = [
      ["Case Pick", `$${casePickRate.toFixed(2)}/case`],
      ["Layer Pick", `$${layerPickRate.toFixed(2)}/case`],
      ["Pallet Supply", `$${palletSupplyFee.toFixed(2)}/pallet`],
      ["Shrink Wrap", `$${shrinkWrapFee.toFixed(2)}/pallet`],
      ["Labeling", `$${labelingFee.toFixed(2)}/label`],
      ["Order Processing", `$${orderProcessingFee.toFixed(2)}/order`],
      ["Cancellation/Restock", `$${cancellationFee.toFixed(2)}/order`]
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [["Service", "Rate"]],
      body: vasBody,
      theme: "grid",
      headStyles: { fillColor: companyName.includes("Peach") ? [255, 165, 79] : [30, 62, 99], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 90, halign: "right", fontStyle: "bold" }
      }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Monthly Summary Section
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Monthly Investment Summary", 15, yPos);
    yPos += 8;
    
    const summaryBody: string[][] = [
      ["Storage Minimum (Recurring)", `$${finalMonthlyStorage.toFixed(2)}`],
      ["Est. Handling In", `$${finalMonthlyHandlingIn.toFixed(2)}`],
      ["Est. Handling Out", `$${finalMonthlyHandlingOut.toFixed(2)}`]
    ];
    
    if (totalValueAddedServices > 0) {
      summaryBody.push(["Value-Added Services", `$${totalValueAddedServices.toFixed(2)}`]);
    }
    
    summaryBody.push(["Total Estimated Monthly", `$${totalEstimatedMonthlyBilling.toFixed(2)}`]);
    
    const totalRowIndex = summaryBody.length - 1;
    
    autoTable(doc, {
      startY: yPos,
      head: [["Component", "Amount"]],
      body: summaryBody,
      theme: "grid",
      headStyles: { fillColor: companyName.includes("Peach") ? [255, 165, 79] : [30, 62, 99], textColor: 255, fontStyle: "bold" },
      bodyStyles: { fontSize: 10 },
      styles: { cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 60, halign: "right", fontStyle: "bold" }
      },
      didParseCell: (data) => {
        if (data.row.index === totalRowIndex && data.section === "body") {
          data.cell.styles.fillColor = companyName.includes("Peach") ? [255, 165, 79] : [30, 62, 99];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontSize = 12;
        }
      }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Terms & Disclosures Section (compact)
    if (yPos < pageHeight - 80) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text("Terms & Assumptions", 15, yPos);
      yPos += 6;
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      
      const terms = [
        `Quote valid for ${quoteValidDays} days from date above`,
        `Payment terms: ${paymentTerms}`,
        minimumCommitment ? `Minimum commitment: ${minimumCommitment}` : null,
        "Storage billed monthly as minimum commitment",
        "Handling billed per transaction"
      ].filter(Boolean);
      
      terms.forEach(term => {
        doc.text(`• ${term}`, 15, yPos);
        yPos += 4;
      });
      
      if (customDisclosures) {
        yPos += 2;
        const lines = doc.splitTextToSize(customDisclosures, pageWidth - 30);
        lines.slice(0, 4).forEach((line: string) => {
          doc.text(line, 15, yPos);
          yPos += 4;
        });
      }
    }
    
    // Footer
    const footerY = pageHeight - 15;
    doc.setFillColor(245, 247, 250);
    doc.rect(0, footerY - 5, pageWidth, 20, "F");
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Storage is billed monthly as a minimum commitment. Handling is billed per transaction.", pageWidth / 2, footerY + 2, { align: "center" });
    
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
