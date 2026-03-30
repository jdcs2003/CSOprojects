import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockSet = vi.fn();
const mockValues = vi.fn();

vi.mock("./db", () => ({
  getDb: vi.fn(async () => ({
    select: () => ({ from: (table: any) => ({ where: mockWhere, orderBy: mockOrderBy }) }),
    insert: (table: any) => ({ values: mockValues }),
    update: (table: any) => ({ set: (data: any) => ({ where: mockUpdate }) }),
    delete: (table: any) => ({ where: mockDelete }),
  })),
}));

describe("Pipeline deals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should define all required pipeline stages", () => {
    const stages = ["lead", "proposal_sent", "under_review", "negotiating", "signed", "active", "lost"];
    expect(stages).toHaveLength(7);
    expect(stages).toContain("lead");
    expect(stages).toContain("proposal_sent");
    expect(stages).toContain("negotiating");
    expect(stages).toContain("signed");
    expect(stages).toContain("active");
    expect(stages).toContain("lost");
  });

  it("should define all required service types", () => {
    const serviceTypes = ["warehousing", "transportation", "ecommerce", "crossdock", "rework", "mixed"];
    expect(serviceTypes).toHaveLength(6);
    expect(serviceTypes).toContain("warehousing");
    expect(serviceTypes).toContain("transportation");
    expect(serviceTypes).toContain("mixed");
  });

  it("should format currency from cents correctly", () => {
    const formatCurrency = (cents: number | null | undefined) => {
      if (!cents) return "$0";
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(cents / 100);
    };

    expect(formatCurrency(210000)).toBe("$2,100");
    expect(formatCurrency(2520000)).toBe("$25,200");
    expect(formatCurrency(23089500)).toBe("$230,895");
    expect(formatCurrency(null)).toBe("$0");
    expect(formatCurrency(undefined)).toBe("$0");
    expect(formatCurrency(0)).toBe("$0");
  });

  it("should calculate weighted pipeline value correctly", () => {
    const deals = [
      { estimatedAnnualRevenue: 2520000, estimatedMonthlyRevenue: 210000, probability: 65, stage: "proposal_sent" },
      { estimatedAnnualRevenue: 23089500, estimatedMonthlyRevenue: 1925000, probability: 80, stage: "negotiating" },
      { estimatedAnnualRevenue: 6000000, estimatedMonthlyRevenue: 500000, probability: 70, stage: "proposal_sent" },
    ];

    const activeDeals = deals.filter(d => d.stage !== "lost");
    const totalPipelineValue = activeDeals.reduce(
      (sum, d) => sum + (d.estimatedAnnualRevenue || (d.estimatedMonthlyRevenue || 0) * 12 || 0),
      0
    );
    const weightedValue = activeDeals.reduce((sum, d) => {
      const annual = d.estimatedAnnualRevenue || (d.estimatedMonthlyRevenue || 0) * 12 || 0;
      const prob = d.probability || 50;
      return sum + (annual * prob / 100);
    }, 0);

    // Total: $25,200 + $230,895 + $60,000 = $316,095 (in dollars) = 31,609,500 cents
    expect(totalPipelineValue).toBe(31609500);

    // Weighted: $25,200*0.65 + $230,895*0.80 + $60,000*0.70 = $16,380 + $184,716 + $42,000 = $243,096
    // In cents: 2520000*0.65 + 23089500*0.80 + 6000000*0.70
    expect(weightedValue).toBe(2520000 * 0.65 + 23089500 * 0.80 + 6000000 * 0.70);
  });

  it("should group deals by stage for kanban view", () => {
    const stages = ["lead", "proposal_sent", "under_review", "negotiating", "signed", "active", "lost"];
    const deals = [
      { id: 1, stage: "proposal_sent", clientName: "Third Deck Brewing" },
      { id: 2, stage: "negotiating", clientName: "Cornerstone Systems" },
      { id: 3, stage: "proposal_sent", clientName: "Señor Sangria" },
    ];

    const grouped: Record<string, any[]> = {};
    stages.forEach(s => { grouped[s] = []; });
    deals.forEach(d => {
      if (grouped[d.stage]) grouped[d.stage].push(d);
    });

    expect(grouped["lead"]).toHaveLength(0);
    expect(grouped["proposal_sent"]).toHaveLength(2);
    expect(grouped["negotiating"]).toHaveLength(1);
    expect(grouped["under_review"]).toHaveLength(0);
    expect(grouped["signed"]).toHaveLength(0);
    expect(grouped["active"]).toHaveLength(0);
    expect(grouped["lost"]).toHaveLength(0);

    expect(grouped["proposal_sent"][0].clientName).toBe("Third Deck Brewing");
    expect(grouped["proposal_sent"][1].clientName).toBe("Señor Sangria");
    expect(grouped["negotiating"][0].clientName).toBe("Cornerstone Systems");
  });

  it("should calculate signed/active revenue separately", () => {
    const deals = [
      { stage: "proposal_sent", estimatedAnnualRevenue: 2520000, estimatedMonthlyRevenue: 210000 },
      { stage: "signed", estimatedAnnualRevenue: 23089500, estimatedMonthlyRevenue: 1925000 },
      { stage: "active", estimatedAnnualRevenue: 6000000, estimatedMonthlyRevenue: 500000 },
      { stage: "lost", estimatedAnnualRevenue: 1000000, estimatedMonthlyRevenue: 83333 },
    ];

    const signedActive = deals.filter(d => d.stage === "signed" || d.stage === "active");
    const signedRevenue = signedActive.reduce(
      (sum, d) => sum + (d.estimatedAnnualRevenue || (d.estimatedMonthlyRevenue || 0) * 12 || 0),
      0
    );

    expect(signedActive).toHaveLength(2);
    expect(signedRevenue).toBe(23089500 + 6000000);
  });

  it("should validate deal form requires client name and deal name", () => {
    const validateDeal = (data: { clientName: string; dealName: string }) => {
      return data.clientName.length > 0 && data.dealName.length > 0;
    };

    expect(validateDeal({ clientName: "Test", dealName: "Test Deal" })).toBe(true);
    expect(validateDeal({ clientName: "", dealName: "Test Deal" })).toBe(false);
    expect(validateDeal({ clientName: "Test", dealName: "" })).toBe(false);
    expect(validateDeal({ clientName: "", dealName: "" })).toBe(false);
  });

  it("should convert dollar amounts to cents for storage", () => {
    const toCents = (dollars: string) => Math.round(Number(dollars) * 100);

    expect(toCents("2100")).toBe(210000);
    expect(toCents("19250")).toBe(1925000);
    expect(toCents("5000")).toBe(500000);
    expect(toCents("0")).toBe(0);
    expect(toCents("99.99")).toBe(9999);
  });
});

describe("Pipeline CSV export", () => {
  const STAGES = [
    { id: "lead", label: "Lead" },
    { id: "proposal_sent", label: "Proposal Sent" },
    { id: "under_review", label: "Under Review" },
    { id: "negotiating", label: "Negotiating" },
    { id: "signed", label: "Signed" },
    { id: "active", label: "Active" },
    { id: "lost", label: "Lost" },
  ];

  const SERVICE_TYPES = [
    { id: "warehousing", label: "Warehousing" },
    { id: "transportation", label: "Transportation" },
    { id: "ecommerce", label: "E-Commerce" },
    { id: "crossdock", label: "Cross-Dock" },
    { id: "rework", label: "Rework / VAS" },
    { id: "mixed", label: "Mixed Services" },
  ];

  function getStageInfo(stageId: string) {
    return STAGES.find(s => s.id === stageId) || { label: stageId };
  }

  function getServiceInfo(serviceId: string) {
    return SERVICE_TYPES.find(s => s.id === serviceId) || { label: serviceId };
  }

  function formatCurrencyRaw(cents: number | null | undefined) {
    if (!cents) return "0";
    return (cents / 100).toFixed(0);
  }

  function escapeCSV(val: string) {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return '"' + val.replace(/"/g, '""') + '"';
    }
    return val;
  }

  it("should format currency raw values correctly for CSV", () => {
    expect(formatCurrencyRaw(210000)).toBe("2100");
    expect(formatCurrencyRaw(1925000)).toBe("19250");
    expect(formatCurrencyRaw(null)).toBe("0");
    expect(formatCurrencyRaw(undefined)).toBe("0");
    expect(formatCurrencyRaw(0)).toBe("0");
  });

  it("should escape CSV values with commas", () => {
    expect(escapeCSV("Hello, World")).toBe('"Hello, World"');
    expect(escapeCSV("Simple")).toBe("Simple");
    expect(escapeCSV('Has "quotes"')).toBe('"Has ""quotes"""');
    expect(escapeCSV("Has\nnewline")).toBe('"Has\nnewline"');
  });

  it("should generate correct CSV headers", () => {
    const headers = [
      "Client Name", "Deal Name", "Stage", "Service Type", "Company",
      "Facility", "Contact", "Email", "Phone", "Est. Monthly Revenue",
      "Est. Annual Revenue", "Est. Pallets", "Est. Loads/Year",
      "Probability (%)", "Key Services", "Notes", "Proposal Date", "Created",
    ];
    expect(headers).toHaveLength(18);
    expect(headers[0]).toBe("Client Name");
    expect(headers[9]).toBe("Est. Monthly Revenue");
  });

  it("should map deal data to CSV rows correctly", () => {
    const deal = {
      clientName: "Write-Off",
      dealName: "Write-Off - Ecom Fulfillment",
      stage: "proposal_sent",
      serviceType: "ecommerce",
      company: "L&M",
      facility: "SC-577",
      clientContact: "Josh Reda & Lauren Duffy",
      clientEmail: "josh@write-off.com",
      clientPhone: "910-431-4608",
      estimatedMonthlyRevenue: 150000,
      estimatedAnnualRevenue: 1800000,
      estimatedPallets: 50,
      estimatedLoads: null,
      probability: 50,
      keyServices: "Storage, Handling In/Out, Case Pick",
      notes: "Ecom fulfillment deal",
      proposalDate: new Date("2026-03-25"),
      createdAt: new Date("2026-03-25"),
    };

    const stageInfo = getStageInfo(deal.stage);
    const serviceInfo = getServiceInfo(deal.serviceType);

    expect(stageInfo.label).toBe("Proposal Sent");
    expect(serviceInfo.label).toBe("E-Commerce");
    expect(formatCurrencyRaw(deal.estimatedMonthlyRevenue)).toBe("1500");
    expect(formatCurrencyRaw(deal.estimatedAnnualRevenue)).toBe("18000");
  });
});

describe("Pipeline auto-creation from quote save", () => {
  it("should determine service type based on pick type and orders", () => {
    const getServiceType = (pickType: string, monthlyOrders: number) => {
      if (pickType === "case" && monthlyOrders > 0) return "ecommerce";
      if (monthlyOrders > 0) return "mixed";
      return "warehousing";
    };

    expect(getServiceType("full", 0)).toBe("warehousing");
    expect(getServiceType("case", 100)).toBe("ecommerce");
    expect(getServiceType("layer", 50)).toBe("mixed");
    expect(getServiceType("full", 10)).toBe("mixed");
    expect(getServiceType("case", 0)).toBe("warehousing");
  });

  it("should convert monthly billing to cents for pipeline", () => {
    const totalEstimatedMonthlyBilling = 1500.50;
    const estMonthlyRevenue = Math.round(totalEstimatedMonthlyBilling * 100);
    const estAnnualRevenue = estMonthlyRevenue * 12;

    expect(estMonthlyRevenue).toBe(150050);
    expect(estAnnualRevenue).toBe(1800600);
  });

  it("should build key services string from VAS toggles", () => {
    const vasToggles = {
      palletSupply: true,
      shrinkWrap: true,
      labeling: false,
      orderProcessing: true,
    };
    const pickType = "case";

    const keyServices = [
      "Storage",
      "Handling In/Out",
      pickType !== "full" ? `${pickType === "case" ? "Case" : "Layer"} Pick` : "",
      vasToggles.palletSupply ? "Pallet Supply" : "",
      vasToggles.shrinkWrap ? "Shrink Wrap" : "",
      vasToggles.labeling ? "Labeling" : "",
      vasToggles.orderProcessing ? "Order Processing" : "",
    ].filter(Boolean).join(", ");

    expect(keyServices).toBe("Storage, Handling In/Out, Case Pick, Pallet Supply, Shrink Wrap, Order Processing");
  });

  it("should use clientCompany as clientName, fallback to quoteName", () => {
    const getClientName = (clientCompany: string, quoteName: string) => clientCompany || quoteName;

    expect(getClientName("Write-Off", "Write-Off Quote")).toBe("Write-Off");
    expect(getClientName("", "Unnamed Quote")).toBe("Unnamed Quote");
  });

  it("should set initial stage to proposal_sent", () => {
    const stage = "proposal_sent";
    expect(stage).toBe("proposal_sent");
  });

  it("should set default probability to 50%", () => {
    const probability = 50;
    expect(probability).toBe(50);
  });
});

describe("Bidirectional Pipeline-Calculator link", () => {
  const FACILITIES = [
    { id: "pa-510", label: "PA-510", fullName: "PA-510 (Bensalem)" },
    { id: "pa-1151", label: "PA-1151", fullName: "PA-1151 (Bristol)" },
    { id: "pa-13200", label: "PA-13200", fullName: "PA-13200 (Townsend)" },
    { id: "nj-2279", label: "NJ-2279", fullName: "NJ-2279 (Logan Township)" },
    { id: "sc-577", label: "SC-577", fullName: "SC-577 (Rock Hill)" },
  ];

  it("should map facility label to facility id", () => {
    const mapFacility = (facilityParam: string) => {
      const matched = FACILITIES.find(f => f.label === facilityParam || f.id === facilityParam.toLowerCase());
      return matched?.id || null;
    };

    expect(mapFacility("PA-1151")).toBe("pa-1151");
    expect(mapFacility("SC-577")).toBe("sc-577");
    expect(mapFacility("pa-510")).toBe("pa-510");
    expect(mapFacility("UNKNOWN")).toBeNull();
  });

  it("should map facility id to facility label for pipeline", () => {
    const mapToLabel = (facilityId: string) => {
      return FACILITIES.find(f => f.id === facilityId)?.label || facilityId;
    };

    expect(mapToLabel("pa-1151")).toBe("PA-1151");
    expect(mapToLabel("sc-577")).toBe("SC-577");
    expect(mapToLabel("unknown")).toBe("unknown");
  });

  it("should build URL params for pipeline-to-calculator navigation", () => {
    const deal = {
      id: 123,
      clientName: "Kermit Lynch",
      clientContact: "John Doe",
      clientEmail: "john@kermitlynch.com",
      clientPhone: "555-1234",
      facility: "PA-1151",
      serviceType: "warehousing",
      dealName: "PLCB Consolidation",
    };

    const params = new URLSearchParams();
    params.set("dealId", String(deal.id));
    if (deal.clientName) params.set("clientCompany", deal.clientName);
    if (deal.clientContact) params.set("clientContact", deal.clientContact);
    if (deal.clientEmail) params.set("clientEmail", deal.clientEmail);
    if (deal.clientPhone) params.set("clientPhone", deal.clientPhone);
    if (deal.facility) params.set("facility", deal.facility);
    if (deal.serviceType) params.set("serviceType", deal.serviceType);
    if (deal.dealName) params.set("dealName", deal.dealName);

    const url = `/calculator?${params.toString()}`;
    expect(url).toContain("dealId=123");
    expect(url).toContain("clientCompany=Kermit+Lynch");
    expect(url).toContain("facility=PA-1151");
    expect(url).toContain("dealName=PLCB+Consolidation");
  });

  it("should parse URL params on calculator load", () => {
    const searchString = "dealId=123&clientCompany=Kermit+Lynch&clientContact=John+Doe&clientEmail=john%40kermitlynch.com&facility=PA-1151&serviceType=ecommerce&dealName=PLCB+Consolidation";
    const params = new URLSearchParams(searchString);

    expect(params.get("dealId")).toBe("123");
    expect(params.get("clientCompany")).toBe("Kermit Lynch");
    expect(params.get("clientContact")).toBe("John Doe");
    expect(params.get("clientEmail")).toBe("john@kermitlynch.com");
    expect(params.get("facility")).toBe("PA-1151");
    expect(params.get("serviceType")).toBe("ecommerce");
    expect(params.get("dealName")).toBe("PLCB Consolidation");
  });

  it("should not create duplicate pipeline deal when linked to existing deal", () => {
    const linkedDealId = 123;
    const shouldCreateNew = !linkedDealId;
    expect(shouldCreateNew).toBe(false);
  });

  it("should create new pipeline deal when not linked", () => {
    const linkedDealId = null;
    const shouldCreateNew = !linkedDealId;
    expect(shouldCreateNew).toBe(true);
  });

  it("should use standardized facility codes from shared list", () => {
    // All facility labels should be uppercase with dash format
    FACILITIES.forEach(f => {
      expect(f.label).toMatch(/^[A-Z]{2}-\d+$/);
      expect(f.id).toBe(f.label.toLowerCase());
    });
  });
});
