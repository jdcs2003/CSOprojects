import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { trpc } from "@/lib/trpc";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  FileText,
  Plus,
  Trash2,
  Loader2,
  Download,
  MapPin,
  DollarSign,
  ClipboardList,
  Scale,
  BookOpen,
  Truck,
  Package,
  BarChart3,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { hasRoleAtLeast } from "@shared/permissions";
import { FACILITIES, getFacilityList, type ServiceType, SERVICE_TYPE_LABELS, LEGAL_JURISDICTION } from "@shared/contractConfig";
import { CLIENTS, type ClientConfig, type PricingItem } from "@shared/proposalClients";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingRow {
  service: string;
  rate: string;
  notes: string;
}

const emptyRow = (): PricingRow => ({ service: '', rate: '', notes: '' });

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: 'Customer & Facility', icon: <Building2 className="h-5 w-5" /> },
  { id: 2, title: 'Terms & Conditions', icon: <Scale className="h-5 w-5" /> },
  { id: 3, title: 'Appendix A — Warehousing', icon: <Package className="h-5 w-5" /> },
  { id: 4, title: 'Appendix B/C — Co-Pack & VAS', icon: <ClipboardList className="h-5 w-5" /> },
  { id: 5, title: 'Appendix D & Generate', icon: <FileText className="h-5 w-5" /> },
];

// ─── Pricing Table Editor ─────────────────────────────────────────────────────

function PricingTableEditor({
  rows,
  onChange,
  label,
}: {
  rows: PricingRow[];
  onChange: (rows: PricingRow[]) => void;
  label: string;
}) {
  const addRow = () => onChange([...rows, emptyRow()]);
  const removeRow = (idx: number) => onChange(rows.filter((_, i) => i !== idx));
  const updateRow = (idx: number, field: keyof PricingRow, value: string) => {
    const updated = [...rows];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">{label}</Label>
        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-3 w-3 mr-1" /> Add Row
        </Button>
      </div>
      {rows.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Service</TableHead>
              <TableHead className="w-[25%]">Rate</TableHead>
              <TableHead className="w-[30%]">Notes</TableHead>
              <TableHead className="w-[10%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Input
                    value={row.service}
                    onChange={(e) => updateRow(idx, 'service', e.target.value)}
                    placeholder="Service name"
                    className="h-8 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.rate}
                    onChange={(e) => updateRow(idx, 'rate', e.target.value)}
                    placeholder="$0.00/unit"
                    className="h-8 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.notes}
                    onChange={(e) => updateRow(idx, 'notes', e.target.value)}
                    placeholder="Notes"
                    className="h-8 text-sm"
                  />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRow(idx)}>
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {rows.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground border rounded-md">
          No items yet. Click "Add Row" to add pricing.
        </div>
      )}
    </div>
  );
}

// ─── String List Editor ───────────────────────────────────────────────────────

function StringListEditor({
  items,
  onChange,
  label,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  label: string;
  placeholder?: string;
}) {
  const addItem = () => onChange([...items, '']);
  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, value: string) => {
    const updated = [...items];
    updated[idx] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">{label}</Label>
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => updateItem(idx, e.target.value)}
            placeholder={placeholder || 'Enter item...'}
            className="h-8 text-sm"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeItem(idx)}>
            <Trash2 className="h-3 w-3 text-red-500" />
          </Button>
        </div>
      ))}
    </div>
  );
}

// ─── Helper: Convert proposal PricingItem[] to PricingRow[] ──────────────────

function toPricingRows(items: PricingItem[]): PricingRow[] {
  return items.map(i => ({ service: i.service, rate: i.rate, notes: i.notes || '' }));
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function GenerateContract() {
  const { data: user } = trpc.auth.me.useQuery();
  const isAuthenticated = !!user;

  // Step state
  const [step, setStep] = useState(1);

  // ─── Step 1: Customer & Facility ──────────────────────────────────────
  const [companyName, setCompanyName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [entityType, setEntityType] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerZip, setCustomerZip] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [facilityDescription, setFacilityDescription] = useState('');
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(['ecommerce']);
  const [proposalSlug, setProposalSlug] = useState('');

  // ─── Step 2: Terms ────────────────────────────────────────────────────
  const [effectiveDate, setEffectiveDate] = useState('');
  const [terminationDate, setTerminationDate] = useState('');
  const [termMonths, setTermMonths] = useState(12);
  const [noticeDays, setNoticeDays] = useState(90);
  const [paymentTermsDays, setPaymentTermsDays] = useState(30);
  const [annualIncreaseCap, setAnnualIncreaseCap] = useState(5);
  const [liabilityPerCarton, setLiabilityPerCarton] = useState(50);
  const [securityDeposit, setSecurityDeposit] = useState(0);
  const [securityDepositTerms, setSecurityDepositTerms] = useState('');
  const [slaCutoffTime, setSlaCutoffTime] = useState('14:00 EST');
  const [monthlyMinimum, setMonthlyMinimum] = useState(0);
  const [monthlyMinimumNotes, setMonthlyMinimumNotes] = useState('');
  const [onboardingFee, setOnboardingFee] = useState(0);

  // ─── Step 3: Appendix A ───────────────────────────────────────────────
  const [appendixAEnabled, setAppendixAEnabled] = useState(true);
  const [appendixATitle, setAppendixATitle] = useState('WAREHOUSING AND E-COMMERCE FULFILLMENT SERVICES');
  const [appendixAProductDescription, setAppendixAProductDescription] = useState('');
  const [appendixAProductCategory, setAppendixAProductCategory] = useState('');
  const [appendixAStorageRequirements, setAppendixAStorageRequirements] = useState<string[]>([
    'All products shall be stored away from direct sunlight',
    'Products must be stored in accordance with all applicable regulations',
  ]);
  const [appendixAHandlingProcedures, setAppendixAHandlingProcedures] = useState<string[]>([
    'All products shall be handled with care to prevent damage',
    'Staff must be trained in proper handling procedures',
  ]);
  const [appendixAPalletConfig, setAppendixAPalletConfig] = useState('');
  const [appendixAStoragePricing, setAppendixAStoragePricing] = useState<PricingRow[]>([]);
  const [appendixAHandlingPricing, setAppendixAHandlingPricing] = useState<PricingRow[]>([]);
  const [appendixAFulfillmentPricing, setAppendixAFulfillmentPricing] = useState<PricingRow[]>([]);
  const [appendixALaborPricing, setAppendixALaborPricing] = useState<PricingRow[]>([]);

  // ─── Step 4: Appendix B & C ───────────────────────────────────────────
  const [appendixBEnabled, setAppendixBEnabled] = useState(false);
  const [appendixBTitle, setAppendixBTitle] = useState('CO-PACKING / REPACK SERVICES');
  const [appendixBPackingRequirements, setAppendixBPackingRequirements] = useState<string[]>([
    'All packing activities shall be performed in a clean environment',
    'All packing activities must be documented with batch records',
  ]);
  const [appendixBPricing, setAppendixBPricing] = useState<PricingRow[]>([]);
  const [appendixBForecastNotes, setAppendixBForecastNotes] = useState('');

  const [appendixCEnabled, setAppendixCEnabled] = useState(false);
  const [appendixCTitle, setAppendixCTitle] = useState('TRANSPORTATION AND VALUE-ADDED SERVICES');
  const [appendixCValueAddedPricing, setAppendixCValueAddedPricing] = useState<PricingRow[]>([]);
  const [appendixCTransportRequirements, setAppendixCTransportRequirements] = useState<string[]>([
    'Products must be protected from extreme conditions during transit',
    'Transportation must comply with all applicable regulations',
  ]);
  const [appendixCCarrierRequirements, setAppendixCCarrierRequirements] = useState<string[]>([
    'L&M shall use only carriers approved for transportation services',
    'All carriers must have appropriate insurance coverage',
  ]);
  const [appendixCAdditionalCharges, setAppendixCAdditionalCharges] = useState<PricingRow[]>([]);

  // ─── Step 5: Appendix D ───────────────────────────────────────────────
  const [appendixDEnabled, setAppendixDEnabled] = useState(false);
  const [appendixDVolumeProjection, setAppendixDVolumeProjection] = useState('');
  const [appendixDRateLevelerPercent, setAppendixDRateLevelerPercent] = useState(20);
  const [appendixDAssumptions, setAppendixDAssumptions] = useState<string[]>([]);

  // ─── Pre-fill from existing proposal ──────────────────────────────────

  const prefillFromProposal = useCallback((slug: string) => {
    const client = CLIENTS[slug];
    if (!client) {
      toast.error('Client config not found for this proposal');
      return;
    }

    setCompanyName(client.name);
    setTradeName(client.fullName);
    setLegalName(client.legalInfo || client.fullName);
    setContactName(client.contact?.name || '');
    setContactEmail(client.contact?.email || '');
    setProposalSlug(slug);

    // Set term
    setTermMonths(client.termMonths);
    setMonthlyMinimum(client.monthlyMinimum);
    setSlaCutoffTime(client.slaTime);

    // Set contract terms
    if (client.contractTerms) {
      const noticeDaysMatch = client.contractTerms.termination.match(/(\d+)/);
      if (noticeDaysMatch) setNoticeDays(parseInt(noticeDaysMatch[1]));
      
      const liabilityMatch = client.contractTerms.liability.match(/\$(\d+(?:\.\d+)?)/);
      if (liabilityMatch) setLiabilityPerCarton(parseFloat(liabilityMatch[1]));
    }

    // Set facility from first facility
    if (client.facilities.length > 0) {
      const facilityName = client.facilities[0];
      // Try to match facility by name or code
      const facilityEntries = Object.entries(FACILITIES);
      const match = facilityEntries.find(([code, f]) =>
        facilityName.includes(code) || facilityName.includes(f.city)
      );
      if (match) setFacilityId(match[0]);
    }

    // Set pricing from first location
    if (client.pricing.length > 0) {
      const loc = client.pricing[0];
      
      // Storage pricing
      if (loc.storage.length > 0) {
        setAppendixAStoragePricing(toPricingRows(loc.storage));
      }
      
      // Handling pricing (inbound)
      if (loc.inbound.length > 0) {
        setAppendixAHandlingPricing(toPricingRows(loc.inbound));
      }
      
      // Fulfillment pricing
      if (loc.fulfillment.length > 0) {
        setAppendixAFulfillmentPricing(toPricingRows(loc.fulfillment));
      }
      
      // Labor pricing
      if (loc.labor.length > 0) {
        setAppendixALaborPricing(toPricingRows(loc.labor));
      }

      // E-commerce
      if (loc.ecommerce && loc.ecommerce.length > 0) {
        setAppendixAFulfillmentPricing(prev => [...prev, ...toPricingRows(loc.ecommerce!)]);
        setServiceTypes(['ecommerce']);
      }

      // Value-added / VAS
      if (loc.valueAdded.length > 0) {
        setAppendixCEnabled(true);
        setAppendixCValueAddedPricing(toPricingRows(loc.valueAdded));
      }

      // Delivery / Transport
      if (loc.delivery && loc.delivery.length > 0) {
        setAppendixCEnabled(true);
        setAppendixCAdditionalCharges(toPricingRows(loc.delivery));
      }
      if (loc.transport && loc.transport.length > 0) {
        setAppendixCEnabled(true);
        setAppendixCAdditionalCharges(prev => [...prev, ...toPricingRows(loc.transport!)]);
      }
    }

    // Set service fees
    if (client.serviceFees) {
      const setupMatch = client.serviceFees.setupFee.match(/\$([\d,]+(?:\.\d+)?)/);
      if (setupMatch) setOnboardingFee(parseFloat(setupMatch[1].replace(/,/g, '')));
    }

    toast.success(`Pre-filled from ${client.name} proposal`);
  }, []);

  // ─── Generate Contract Mutation ───────────────────────────────────────

  const generateMutation = trpc.proposals.generateContract.useMutation({
    onSuccess: (data) => {
      toast.success('Contract generated successfully!');
      if (data.docxUrl) {
        window.open(data.docxUrl, '_blank');
      }
    },
    onError: (err) => {
      toast.error(`Failed to generate contract: ${err.message}`);
    },
  });

  const handleGenerate = () => {
    if (!companyName) {
      toast.error('Legal entity name is required');
      return;
    }
    if (!customerAddress) {
      toast.error('Customer registered business address is required (per attorney)');
      return;
    }
    if (!facilityId) {
      toast.error('Please select a facility');
      return;
    }

    generateMutation.mutate({
      companyName,
      tradeName: tradeName || undefined,
      legalName: legalName || undefined,
      entityType: entityType || undefined,
      customerAddress: customerAddress || undefined,
      customerCity: customerCity || undefined,
      customerState: customerState || undefined,
      customerZip: customerZip || undefined,
      contactName: contactName || undefined,
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined,
      facilityId,
      facilityDescription: facilityDescription || undefined,
      serviceTypes,
      effectiveDate: effectiveDate || undefined,
      terminationDate: terminationDate || undefined,
      termMonths,
      noticeDays,
      paymentTermsDays,
      annualIncreaseCapPercent: annualIncreaseCap,
      liabilityPerCarton,
      securityDeposit,
      securityDepositTerms: securityDepositTerms || undefined,
      slaCutoffTime,
      monthlyMinimum,
      monthlyMinimumNotes: monthlyMinimumNotes || undefined,
      onboardingFee,
      appendixAEnabled,
      appendixATitle,
      appendixAProductDescription,
      appendixAProductCategory: appendixAProductCategory || undefined,
      appendixAStorageRequirements,
      appendixAHandlingProcedures,
      appendixAPalletConfig: appendixAPalletConfig || undefined,
      appendixAStoragePricing: appendixAStoragePricing.filter(r => r.service),
      appendixAHandlingPricing: appendixAHandlingPricing.filter(r => r.service),
      appendixAFulfillmentPricing: appendixAFulfillmentPricing.filter(r => r.service),
      appendixALaborPricing: appendixALaborPricing.filter(r => r.service),
      appendixBEnabled,
      appendixBTitle,
      appendixBPackingRequirements,
      appendixBPricing: appendixBPricing.filter(r => r.service),
      appendixBForecastNotes: appendixBForecastNotes || undefined,
      appendixCEnabled,
      appendixCTitle,
      appendixCValueAddedPricing: appendixCValueAddedPricing.filter(r => r.service),
      appendixCTransportRequirements,
      appendixCCarrierRequirements,
      appendixCAdditionalCharges: appendixCAdditionalCharges.filter(r => r.service),
      appendixDEnabled,
      appendixDVolumeProjection,
      appendixDRateLevelerPercent,
      appendixDAssumptions,
      proposalSlug: proposalSlug || undefined,
    });
  };

  // ─── Auth check ───────────────────────────────────────────────────────

  if (!isAuthenticated || !hasRoleAtLeast(user?.role || '', 'admin')) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Admin access required</p>
        </div>
      </AdminLayout>
    );
  }

  const facilities = getFacilityList();
  const proposalSlugs = Object.keys(CLIENTS);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <a href="/admin/proposals">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </a>
              <h1 className="text-2xl font-bold">Generate Customer Services Agreement</h1>
            </div>
            <p className="text-muted-foreground ml-11">
              L&M Warehousing, Inc. — Universal Contract Generator
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                step === s.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : step > s.id
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-background/20 text-xs font-bold">
                {step > s.id ? '✓' : s.id}
              </span>
              {s.title}
            </button>
          ))}
        </div>

        {/* Pre-fill from Proposal */}
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium whitespace-nowrap">Pre-fill from Proposal:</Label>
              <Select onValueChange={(slug) => prefillFromProposal(slug)}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a proposal to pre-fill..." />
                </SelectTrigger>
                <SelectContent>
                  {proposalSlugs.map(slug => (
                    <SelectItem key={slug} value={slug}>
                      {CLIENTS[slug]?.name || slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                Automatically populates customer info, pricing, and terms from an existing proposal
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STEP 1: Customer & Facility */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Customer Information
                </CardTitle>
                <CardDescription>
                  The customer entity that will be party to this agreement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-200">
                  <strong>Attorney Note:</strong> Use the proper legal business entity name (e.g., "Reda Duffy Beverages LLC"), not a brand/trademark name (e.g., "Write-off TM"). The legal entity name and registered address are required.
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Legal Entity Name *</Label>
                    <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g., Reda Duffy Beverages LLC" />
                    <p className="text-xs text-muted-foreground">Full legal business entity name as registered</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Trade Name / DBA</Label>
                    <Input value={tradeName} onChange={e => setTradeName(e.target.value)} placeholder="e.g., WRITE-OFF™" />
                    <p className="text-xs text-muted-foreground">Brand or trademark name (if different from legal name)</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Entity Type *</Label>
                    <Input value={entityType} onChange={e => setEntityType(e.target.value)} placeholder="e.g., a Delaware limited liability company" />
                  </div>
                  <div className="space-y-2">
                    <Label>Alternate Legal Name</Label>
                    <Input value={legalName} onChange={e => setLegalName(e.target.value)} placeholder="Only if different from Legal Entity Name above" />
                  </div>
                </div>
                <Separator />
                <p className="text-sm font-medium">Customer Registered Business Address *</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Street Address *</Label>
                    <Input value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="95 Beaufain St A" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input value={customerCity} onChange={e => setCustomerCity(e.target.value)} placeholder="City" />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input value={customerState} onChange={e => setCustomerState(e.target.value)} placeholder="ST" />
                    </div>
                    <div className="space-y-2">
                      <Label>ZIP</Label>
                      <Input value={customerZip} onChange={e => setCustomerZip(e.target.value)} placeholder="00000" />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Name</Label>
                    <Input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="john@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="(555) 123-4567" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Facility & Service Type
                </CardTitle>
                <CardDescription>
                  Select the L&M Warehousing facility and service types. Forum is always Delaware County, PA (per attorney — L&M is registered in Glen Mills).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Facility *</Label>
                  <Select value={facilityId} onValueChange={setFacilityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a facility..." />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map(f => (
                        <SelectItem key={f.code} value={f.code}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {facilityId && FACILITIES[facilityId] && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">{FACILITIES[facilityId].fullAddress}</Badge>
                      <Badge variant="secondary">Forum: {LEGAL_JURISDICTION}</Badge>
                      <Badge variant="secondary">Storage: {FACILITIES[facilityId].storageType}</Badge>
                      {FACILITIES[facilityId].sqft && (
                        <Badge variant="secondary">{FACILITIES[facilityId].sqft!.toLocaleString()} sq ft</Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Facility Description Override (optional)</Label>
                  <Input
                    value={facilityDescription}
                    onChange={e => setFacilityDescription(e.target.value)}
                    placeholder="e.g., primary PLCB and Wine and Spirits order fulfillment hub"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Service Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(SERVICE_TYPE_LABELS) as [ServiceType, string][]).map(([key, label]) => (
                      <Badge
                        key={key}
                        variant={serviceTypes.includes(key) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          setServiceTypes(prev =>
                            prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
                          );
                        }}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STEP 2: Terms & Conditions */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Agreement Terms
              </CardTitle>
              <CardDescription>
                Configure the legal and financial terms of the agreement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Effective Date</Label>
                  <Input value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} placeholder="e.g., July 1st, 2026" />
                </div>
                <div className="space-y-2">
                  <Label>Termination Date</Label>
                  <Input value={terminationDate} onChange={e => setTerminationDate(e.target.value)} placeholder="e.g., July 1st, 2027" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Term (months)</Label>
                  <Input type="number" value={termMonths} onChange={e => setTermMonths(parseInt(e.target.value) || 12)} />
                </div>
                <div className="space-y-2">
                  <Label>Notice Period (days)</Label>
                  <Input type="number" value={noticeDays} onChange={e => setNoticeDays(parseInt(e.target.value) || 90)} />
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms (days)</Label>
                  <Input type="number" value={paymentTermsDays} onChange={e => setPaymentTermsDays(parseInt(e.target.value) || 30)} />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Annual Increase Cap (%)</Label>
                  <Input type="number" value={annualIncreaseCap} onChange={e => setAnnualIncreaseCap(parseInt(e.target.value) || 5)} />
                </div>
                <div className="space-y-2">
                  <Label>Liability per Carton ($)</Label>
                  <Input type="number" value={liabilityPerCarton} onChange={e => setLiabilityPerCarton(parseFloat(e.target.value) || 50)} />
                </div>
                <div className="space-y-2">
                  <Label>SLA Cutoff Time</Label>
                  <Input value={slaCutoffTime} onChange={e => setSlaCutoffTime(e.target.value)} placeholder="14:00 EST" />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Minimum ($)</Label>
                  <Input type="number" value={monthlyMinimum} onChange={e => setMonthlyMinimum(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Minimum Notes</Label>
                  <Input value={monthlyMinimumNotes} onChange={e => setMonthlyMinimumNotes(e.target.value)} placeholder="e.g., First 3 months: $500" />
                </div>
                <div className="space-y-2">
                  <Label>Onboarding / Setup Fee ($)</Label>
                  <Input type="number" value={onboardingFee} onChange={e => setOnboardingFee(parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Security Deposit ($)</Label>
                  <Input type="number" value={securityDeposit} onChange={e => setSecurityDeposit(parseFloat(e.target.value) || 0)} />
                  <p className="text-xs text-muted-foreground">Set to 0 to omit the security deposit clause</p>
                </div>
                <div className="space-y-2">
                  <Label>Custom Security Deposit Terms</Label>
                  <Textarea
                    value={securityDepositTerms}
                    onChange={e => setSecurityDepositTerms(e.target.value)}
                    placeholder="Leave blank for default terms..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STEP 3: Appendix A */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Appendix A — Warehousing & Fulfillment
                  </CardTitle>
                  <CardDescription>Storage, handling, and fulfillment rates</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Enabled</Label>
                  <Switch checked={appendixAEnabled} onCheckedChange={setAppendixAEnabled} />
                </div>
              </div>
            </CardHeader>
            {appendixAEnabled && (
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Appendix Title</Label>
                    <Input value={appendixATitle} onChange={e => setAppendixATitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Product Category</Label>
                    <Input value={appendixAProductCategory} onChange={e => setAppendixAProductCategory(e.target.value)} placeholder="e.g., Canned Cocktails / RTD Spirits" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Product Description</Label>
                  <Textarea value={appendixAProductDescription} onChange={e => setAppendixAProductDescription(e.target.value)} placeholder="Description of products to be warehoused..." rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Pallet Configuration</Label>
                  <Input value={appendixAPalletConfig} onChange={e => setAppendixAPalletConfig(e.target.value)} placeholder='e.g., Maximum pallet height shall not exceed 60" including the pallet' />
                </div>

                <Separator />

                <StringListEditor
                  items={appendixAStorageRequirements}
                  onChange={setAppendixAStorageRequirements}
                  label="Storage Requirements"
                  placeholder="Storage requirement..."
                />

                <StringListEditor
                  items={appendixAHandlingProcedures}
                  onChange={setAppendixAHandlingProcedures}
                  label="Handling Procedures"
                  placeholder="Handling procedure..."
                />

                <Separator />

                <PricingTableEditor rows={appendixAStoragePricing} onChange={setAppendixAStoragePricing} label="Storage Rates" />
                <PricingTableEditor rows={appendixAHandlingPricing} onChange={setAppendixAHandlingPricing} label="Handling & Inbound Rates" />
                <PricingTableEditor rows={appendixAFulfillmentPricing} onChange={setAppendixAFulfillmentPricing} label="E-Com / Order Fulfillment Rates" />
                <PricingTableEditor rows={appendixALaborPricing} onChange={setAppendixALaborPricing} label="Labor Rates" />
              </CardContent>
            )}
          </Card>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STEP 4: Appendix B & C */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Appendix B */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      Appendix B — Co-Packing / Repack Services
                    </CardTitle>
                    <CardDescription>Include co-packing and repack services in the agreement</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Enabled</Label>
                    <Switch checked={appendixBEnabled} onCheckedChange={setAppendixBEnabled} />
                  </div>
                </div>
              </CardHeader>
              {appendixBEnabled && (
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Appendix Title</Label>
                    <Input value={appendixBTitle} onChange={e => setAppendixBTitle(e.target.value)} />
                  </div>
                  <StringListEditor
                    items={appendixBPackingRequirements}
                    onChange={setAppendixBPackingRequirements}
                    label="Packing Requirements"
                    placeholder="Packing requirement..."
                  />
                  <PricingTableEditor rows={appendixBPricing} onChange={setAppendixBPricing} label="Co-Pack / Repack Rates" />
                  <div className="space-y-2">
                    <Label>Forecast Notes</Label>
                    <Textarea value={appendixBForecastNotes} onChange={e => setAppendixBForecastNotes(e.target.value)} placeholder="Forecasting and planning notes..." rows={3} />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Appendix C */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Appendix C — Transportation & Value-Added Services
                    </CardTitle>
                    <CardDescription>Transportation, delivery, and value-added service rates</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Enabled</Label>
                    <Switch checked={appendixCEnabled} onCheckedChange={setAppendixCEnabled} />
                  </div>
                </div>
              </CardHeader>
              {appendixCEnabled && (
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Appendix Title</Label>
                    <Input value={appendixCTitle} onChange={e => setAppendixCTitle(e.target.value)} />
                  </div>
                  <PricingTableEditor rows={appendixCValueAddedPricing} onChange={setAppendixCValueAddedPricing} label="Value-Added Services Rates" />
                  <StringListEditor
                    items={appendixCTransportRequirements}
                    onChange={setAppendixCTransportRequirements}
                    label="Transportation Requirements"
                    placeholder="Transport requirement..."
                  />
                  <StringListEditor
                    items={appendixCCarrierRequirements}
                    onChange={setAppendixCCarrierRequirements}
                    label="Carrier Requirements"
                    placeholder="Carrier requirement..."
                  />
                  <PricingTableEditor rows={appendixCAdditionalCharges} onChange={setAppendixCAdditionalCharges} label="Additional Charges (Delivery, Fuel, etc.)" />
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STEP 5: Appendix D & Generate */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {step === 5 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Appendix D — Volume Projections & Assumptions
                    </CardTitle>
                    <CardDescription>Volume commitments and rate leveler terms</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Enabled</Label>
                    <Switch checked={appendixDEnabled} onCheckedChange={setAppendixDEnabled} />
                  </div>
                </div>
              </CardHeader>
              {appendixDEnabled && (
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Volume Projection Statement</Label>
                    <Textarea
                      value={appendixDVolumeProjection}
                      onChange={e => setAppendixDVolumeProjection(e.target.value)}
                      placeholder="e.g., Customer anticipates to be at no less than 1000 orders per month by May of 2027..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rate Leveler Increase Cap (%)</Label>
                    <Input type="number" value={appendixDRateLevelerPercent} onChange={e => setAppendixDRateLevelerPercent(parseInt(e.target.value) || 20)} />
                    <p className="text-xs text-muted-foreground">If volume doesn't materialize, L&M may implement rate increases up to this percentage</p>
                  </div>
                  <StringListEditor
                    items={appendixDAssumptions}
                    onChange={setAppendixDAssumptions}
                    label="Assumptions"
                    placeholder="e.g., Seasonal peaks are anticipated in Q4..."
                  />
                </CardContent>
              )}
            </Card>

            {/* Summary & Generate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generate Agreement
                </CardTitle>
                <CardDescription>
                  Review the summary and generate the Customer Services Agreement DOCX
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold">L&M Warehousing, Inc.</h4>
                    {facilityId && FACILITIES[facilityId] && (
                      <>
                        <p>{FACILITIES[facilityId].fullAddress}</p>
                        <p className="text-muted-foreground">Forum: {LEGAL_JURISDICTION}</p>
                      </>
                    )}
                  </div>
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold">{companyName || '(Customer Name)'}</h4>
                    {customerAddress && <p>{customerAddress}{customerCity ? `, ${customerCity}` : ''}{customerState ? `, ${customerState}` : ''}{customerZip ? ` ${customerZip}` : ''}</p>}
                    {legalName && <p className="text-muted-foreground">{legalName}</p>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge>Term: {termMonths} months</Badge>
                  <Badge variant="outline">Notice: {noticeDays} days</Badge>
                  <Badge variant="outline">Payment: Net {paymentTermsDays}</Badge>
                  {monthlyMinimum > 0 && <Badge variant="secondary">Min: ${monthlyMinimum.toLocaleString()}/mo</Badge>}
                  {onboardingFee > 0 && <Badge variant="secondary">Setup: ${onboardingFee.toLocaleString()}</Badge>}
                  {securityDeposit > 0 && <Badge variant="secondary">Deposit: ${securityDeposit.toLocaleString()}</Badge>}
                </div>

                <div className="flex flex-wrap gap-2">
                  {appendixAEnabled && <Badge className="bg-blue-600">Appendix A: Warehousing</Badge>}
                  {appendixBEnabled && <Badge className="bg-purple-600">Appendix B: Co-Pack</Badge>}
                  {appendixCEnabled && <Badge className="bg-orange-600">Appendix C: VAS/Transport</Badge>}
                  {appendixDEnabled && <Badge className="bg-green-600">Appendix D: Volume</Badge>}
                </div>

                <Separator />

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending || !companyName || !customerAddress || !facilityId}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating Agreement...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Generate Customer Services Agreement (DOCX)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {step < 5 ? (
            <Button onClick={() => setStep(Math.min(5, step + 1))}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <a href="/admin/proposals">
                Back to Proposals
              </a>
            </Button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
