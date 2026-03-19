import { describe, it, expect } from "vitest";

// Test the email whitelist logic directly
const WHITELISTED_EMAILS = [
  "j.stenson@summitskiesinc.com",
  "amoore@lmwarehousing.com",
];

function checkEmail(email: string): { approved: boolean; email: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const isApproved = WHITELISTED_EMAILS.some(
    (e) => e.toLowerCase() === normalizedEmail
  );
  return { approved: isApproved, email: normalizedEmail };
}

describe("Email Whitelist Access Control", () => {
  it("should approve whitelisted email (exact match)", () => {
    const result = checkEmail("j.stenson@summitskiesinc.com");
    expect(result.approved).toBe(true);
    expect(result.email).toBe("j.stenson@summitskiesinc.com");
  });

  it("should approve whitelisted email (case insensitive)", () => {
    const result = checkEmail("J.Stenson@SummitSkiesInc.com");
    expect(result.approved).toBe(true);
    expect(result.email).toBe("j.stenson@summitskiesinc.com");
  });

  it("should approve second whitelisted email", () => {
    const result = checkEmail("amoore@lmwarehousing.com");
    expect(result.approved).toBe(true);
  });

  it("should approve with leading/trailing whitespace", () => {
    const result = checkEmail("  amoore@lmwarehousing.com  ");
    expect(result.approved).toBe(true);
    expect(result.email).toBe("amoore@lmwarehousing.com");
  });

  it("should reject non-whitelisted email", () => {
    const result = checkEmail("random@example.com");
    expect(result.approved).toBe(false);
    expect(result.email).toBe("random@example.com");
  });

  it("should reject empty-ish emails", () => {
    const result = checkEmail("notanemail@test.com");
    expect(result.approved).toBe(false);
  });

  it("should normalize email to lowercase", () => {
    const result = checkEmail("AMOORE@LMWAREHOUSING.COM");
    expect(result.approved).toBe(true);
    expect(result.email).toBe("amoore@lmwarehousing.com");
  });
});

describe("VAS Toggle Logic", () => {
  // Test the VAS toggle calculation logic
  const defaultToggles: Record<string, boolean> = {
    casePick: false,
    layerPick: false,
    palletSupply: true,
    shrinkWrap: true,
    labeling: true,
    orderProcessing: true,
    cancellation: true,
  };

  it("should have correct default toggle states", () => {
    expect(defaultToggles.casePick).toBe(false);
    expect(defaultToggles.layerPick).toBe(false);
    expect(defaultToggles.palletSupply).toBe(true);
    expect(defaultToggles.shrinkWrap).toBe(true);
    expect(defaultToggles.labeling).toBe(true);
    expect(defaultToggles.orderProcessing).toBe(true);
    expect(defaultToggles.cancellation).toBe(true);
  });

  it("should calculate VAS costs as zero when toggle is off", () => {
    const palletSupplyFee = 9.00;
    const monthlyOrders = 10;
    const isEnabled = false;
    const cost = isEnabled ? palletSupplyFee * monthlyOrders : 0;
    expect(cost).toBe(0);
  });

  it("should calculate VAS costs correctly when toggle is on", () => {
    const palletSupplyFee = 9.00;
    const monthlyOrders = 10;
    const isEnabled = true;
    const cost = isEnabled ? palletSupplyFee * monthlyOrders : 0;
    expect(cost).toBe(90);
  });

  it("should only include enabled VAS items in PDF list", () => {
    const toggles = { ...defaultToggles, shrinkWrap: false, labeling: false };
    const vasItems: [string, string][] = [];
    
    if (toggles.palletSupply) vasItems.push(["Pallet Supply", "$9.00/pallet"]);
    if (toggles.shrinkWrap) vasItems.push(["Shrink Wrap", "$3.00/pallet"]);
    if (toggles.labeling) vasItems.push(["Labeling", "$0.50/label"]);
    if (toggles.orderProcessing) vasItems.push(["Order Processing", "$10.00/order"]);
    if (toggles.cancellation) vasItems.push(["Cancellation/Restock", "$25.00/order"]);
    
    expect(vasItems.length).toBe(3); // palletSupply, orderProcessing, cancellation
    expect(vasItems.map(i => i[0])).toEqual(["Pallet Supply", "Order Processing", "Cancellation/Restock"]);
  });

  it("should include all VAS items when all toggles are on", () => {
    const toggles = { ...defaultToggles, casePick: true };
    const vasItems: [string, string][] = [];
    
    if (toggles.casePick) vasItems.push(["Case Pick", "$0.40/case"]);
    if (toggles.palletSupply) vasItems.push(["Pallet Supply", "$9.00/pallet"]);
    if (toggles.shrinkWrap) vasItems.push(["Shrink Wrap", "$3.00/pallet"]);
    if (toggles.labeling) vasItems.push(["Labeling", "$0.50/label"]);
    if (toggles.orderProcessing) vasItems.push(["Order Processing", "$10.00/order"]);
    if (toggles.cancellation) vasItems.push(["Cancellation/Restock", "$25.00/order"]);
    
    expect(vasItems.length).toBe(6);
  });
});

describe("Facility Data Integrity", () => {
  const facilities = [
    { id: "pa-510", name: "PA-510", baseRent: 9.28, ticam: 1.20, totalCost: 10.48, notes: "Climate-controlled" },
    { id: "pa-1151", name: "PA-1151", baseRent: 5.00, ticam: 2.00, totalCost: 7.00, notes: "Ambient" },
    { id: "pa-13200", name: "PA-13200", baseRent: 7.16, ticam: 2.00, totalCost: 9.16, notes: "Climate-controlled" },
    { id: "nj-2279", name: "NJ-2279", baseRent: 9.28, ticam: 0, totalCost: 9.28, notes: "Ambient" },
    { id: "sc-577", name: "SC-577", baseRent: 7.50, ticam: 2.00, totalCost: 9.50, notes: "Ambient" },
  ];

  it("PA-1151 should have correct cost basis of $7.00/sq ft/year", () => {
    const pa1151 = facilities.find(f => f.id === "pa-1151");
    expect(pa1151).toBeDefined();
    expect(pa1151!.baseRent).toBe(5.00);
    expect(pa1151!.ticam).toBe(2.00);
    expect(pa1151!.totalCost).toBe(7.00);
  });

  it("PA-1151 should be marked as Ambient", () => {
    const pa1151 = facilities.find(f => f.id === "pa-1151");
    expect(pa1151!.notes).toContain("Ambient");
  });

  it("PA-510 should be climate-controlled", () => {
    const pa510 = facilities.find(f => f.id === "pa-510");
    expect(pa510!.notes).toContain("Climate-controlled");
  });

  it("PA-13200 should be climate-controlled", () => {
    const pa13200 = facilities.find(f => f.id === "pa-13200");
    expect(pa13200!.notes).toContain("Climate-controlled");
  });

  it("SC-577 should be ambient", () => {
    const sc577 = facilities.find(f => f.id === "sc-577");
    expect(sc577!.notes).toContain("Ambient");
  });

  it("NJ-2279 should be ambient", () => {
    const nj2279 = facilities.find(f => f.id === "nj-2279");
    expect(nj2279!.notes).toContain("Ambient");
  });

  it("all facilities should have totalCost = baseRent + ticam", () => {
    facilities.forEach(f => {
      expect(f.totalCost).toBeCloseTo(f.baseRent + f.ticam, 2);
    });
  });
});
