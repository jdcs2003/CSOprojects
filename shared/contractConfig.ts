/**
 * Universal Contract Configuration
 * 
 * Defines the data model for generating Customer Services Agreements
 * between L&M Warehousing, Inc. and clients. Facility-aware, service-type-aware,
 * and dynamically populated from pricing dashboard / proposal inputs.
 */

// ─── Facility Registry ───────────────────────────────────────────────────────

export interface FacilityConfig {
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  fullAddress: string;
  storageType: 'ambient' | 'climate-controlled' | 'both';
  sqft?: number;
  jurisdiction: string; // County, State for governing law
  jurisdictionState: string;
  wms?: string; // WMS system name
}

export const FACILITIES: Record<string, FacilityConfig> = {
  'PA-510': {
    code: 'PA-510',
    name: 'Bensalem - PA-510',
    address: '510 Station Ave',
    city: 'Bensalem',
    state: 'PA',
    zip: '19020',
    fullAddress: '510 Station Ave, Bensalem, PA 19020',
    storageType: 'both',
    sqft: 88000,
    jurisdiction: 'Bucks County, Pennsylvania',
    jurisdictionState: 'Pennsylvania',
    wms: 'Connect',
  },
  'PA-13200': {
    code: 'PA-13200',
    name: 'Sharon Hill - PA-13200',
    address: '2009 Elmwood Avenue',
    city: 'Sharon Hill',
    state: 'PA',
    zip: '19079',
    fullAddress: '2009 Elmwood Avenue, Sharon Hill, PA 19079',
    storageType: 'ambient',
    jurisdiction: 'Delaware County, Pennsylvania',
    jurisdictionState: 'Pennsylvania',
  },
  'PA-2101': {
    code: 'PA-2101',
    name: 'Philadelphia - PA-2101',
    address: '2101 Hornig Road',
    city: 'Philadelphia',
    state: 'PA',
    zip: '19116',
    fullAddress: '2101 Hornig Road, Philadelphia, PA 19116',
    storageType: 'climate-controlled',
    jurisdiction: 'Philadelphia County, Pennsylvania',
    jurisdictionState: 'Pennsylvania',
  },
  'NJ-2279': {
    code: 'NJ-2279',
    name: 'New Jersey - NJ-2279',
    address: '2279 Route 130',
    city: 'Dayton',
    state: 'NJ',
    zip: '08810',
    fullAddress: '2279 Route 130, Dayton, NJ 08810',
    storageType: 'ambient',
    jurisdiction: 'Middlesex County, New Jersey',
    jurisdictionState: 'New Jersey',
  },
  'SC-OBG': {
    code: 'SC-OBG',
    name: 'Orangeburg - SC-OBG',
    address: '144 Logistics Lane',
    city: 'Orangeburg',
    state: 'SC',
    zip: '29115',
    fullAddress: '144 Logistics Lane, Orangeburg, SC 29115',
    storageType: 'ambient',
    jurisdiction: 'Orangeburg County, South Carolina',
    jurisdictionState: 'South Carolina',
  },
  'CA-821': {
    code: 'CA-821',
    name: 'Ontario - CA-821',
    address: '821 S Rockefeller Ave',
    city: 'Ontario',
    state: 'CA',
    zip: '91761',
    fullAddress: '821 S Rockefeller Ave, Ontario, CA 91761',
    storageType: 'ambient',
    jurisdiction: 'San Bernardino County, California',
    jurisdictionState: 'California',
  },
};

// ─── Service Type Definitions ────────────────────────────────────────────────

export type ServiceType = 'ecommerce' | 'pallet-in-out' | 'co-packing' | 'transportation' | 'general';

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  'ecommerce': 'Warehousing and E-Commerce Fulfillment',
  'pallet-in-out': 'Warehousing and Pallet In/Out Services',
  'co-packing': 'Co-Packing Services',
  'transportation': 'Transportation Services',
  'general': 'General Warehousing Services',
};

// ─── Contract Input Data ─────────────────────────────────────────────────────

export interface ContractCustomerInfo {
  companyName: string;
  tradeName?: string; // e.g., "WRITE-OFF™" vs legal name
  legalName?: string; // Full legal entity name if different
  entityType?: string; // e.g., "a Delaware limited liability company"
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  contactName?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ContractTerms {
  effectiveDate: string; // e.g., "June 1st, 2025"
  terminationDate?: string; // e.g., "June 1st, 2026"
  termMonths: number;
  noticeDays: number; // Default 90
  autoRenew: boolean;
  paymentTermsDays: number; // Default 30
  annualIncreaseCapPercent: number; // Default 5
  liabilityPerCarton: number; // Default 50
  securityDeposit: number; // 0 = none
  securityDepositTerms?: string; // Custom terms for security deposit
  slaCutoffTime: string; // e.g., "14:00 EST"
  monthlyMinimum: number;
  monthlyMinimumNotes?: string; // e.g., "First 3 months: $500"
  onboardingFee: number;
}

export interface ContractPricingItem {
  service: string;
  rate: string;
  notes?: string;
}

export interface ContractAppendixA {
  enabled: boolean;
  title: string; // e.g., "WAREHOUSING AND E-COMMERCE FULFILLMENT SERVICES"
  productDescription: string;
  productCategory?: string; // e.g., "Canned Cocktails / RTD Spirits"
  storageRequirements: string[];
  handlingProcedures: string[];
  palletSpecs?: string;
  palletConfig?: string; // e.g., "8 tiers, 104 cases per pallet"
  facilityCode: string;
  storagePricing: ContractPricingItem[];
  handlingPricing: ContractPricingItem[];
  fulfillmentPricing: ContractPricingItem[];
  laborPricing: ContractPricingItem[];
}

export interface ContractAppendixB {
  enabled: boolean;
  title: string; // "CO-PACKING / REPACK SERVICES"
  packingRequirements: string[];
  pricing: ContractPricingItem[];
  forecastNotes?: string;
}

export interface ContractAppendixC {
  enabled: boolean;
  title: string; // "TRANSPORTATION AND VALUE-ADDED SERVICES"
  valueAddedPricing: ContractPricingItem[];
  transportRequirements: string[];
  carrierRequirements: string[];
  additionalCharges: ContractPricingItem[];
}

export interface ContractAppendixD {
  enabled: boolean;
  title: string; // "VOLUME PROJECTIONS AND ASSUMPTIONS"
  volumeProjection: string;
  rateLevelerPercent: number; // e.g., 20
  assumptions: string[];
}

export interface ContractGenerationInput {
  // Parties
  customer: ContractCustomerInfo;
  
  // Facility
  facilityId: string; // Key from FACILITIES
  facilityDescription?: string; // e.g., "primary PLCB and Wine and Spirits order fulfillment hub"
  
  // Service types
  serviceTypes: ServiceType[];
  
  // Terms
  terms: ContractTerms;
  
  // Appendices
  appendixA: ContractAppendixA;
  appendixB: ContractAppendixB;
  appendixC: ContractAppendixC;
  appendixD: ContractAppendixD;
  
  // Metadata
  proposalSlug?: string; // Link back to proposal
  generatedBy?: string;
}

// ─── L&M Entity Info ─────────────────────────────────────────────────────────

export const LM_ENTITY = {
  name: 'L&M WAREHOUSING, INC.',
  shortName: 'L&M',
  entityType: 'a Pennsylvania corporation',
  // Registered address is Glen Mills, PA (Delaware County)
  // Per attorney Eric S. Carroll: L&M Warehousing is registered with a Glen Mills address
  registeredAddress: '510 Station Ave, Bensalem, PA 19020',
};

// ─── Legal Jurisdiction ─────────────────────────────────────────────────────
// Per attorney Eric S. Carroll (3/31/2026):
// Choice of forum clause (Section 14g) should ALWAYS be Delaware County, PA
// because L&M Warehousing, Inc. is registered with a Glen Mills address (Delaware County).
// This applies regardless of which facility the services are performed at.
export const LEGAL_JURISDICTION = 'Delaware County, Pennsylvania';
export const LEGAL_JURISDICTION_STATE = 'Pennsylvania';

// ─── Default Contract Terms ──────────────────────────────────────────────────

export const DEFAULT_CONTRACT_TERMS: Omit<ContractTerms, 'effectiveDate' | 'monthlyMinimum' | 'onboardingFee'> = {
  termMonths: 12,
  noticeDays: 90,
  autoRenew: true,
  paymentTermsDays: 30,
  annualIncreaseCapPercent: 5,
  liabilityPerCarton: 50,
  securityDeposit: 0,
  slaCutoffTime: '14:00 EST',
};

// ─── Helper: Build contract input from a proposal client config ─────────────

export function getFacilityAddress(facilityId: string): string {
  const f = FACILITIES[facilityId];
  return f ? f.fullAddress : facilityId;
}

export function getFacilityJurisdiction(_facilityId: string): string {
  // Per attorney Eric S. Carroll: jurisdiction is ALWAYS Delaware County, PA
  // regardless of facility location. L&M Warehousing is registered in Glen Mills (Delaware County).
  return LEGAL_JURISDICTION;
}

export function getFacilityList(): Array<{ code: string; label: string }> {
  return Object.values(FACILITIES).map(f => ({
    code: f.code,
    label: `${f.name} — ${f.fullAddress}`,
  }));
}
