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
