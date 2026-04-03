/**
 * Client Configuration System for Peach Warehouse Proposals
 * 
 * Each client has their own configuration including branding, pricing, and terms.
 * To add a new client, simply add a new entry to the CLIENTS object.
 */

export interface PricingItem {
  service: string;
  rate: string;
  notes?: string;
}

export interface LocationPricing {
  location: string;
  code: string;
  address?: string;
  monthlyMinimum?: string;
  inbound: PricingItem[];
  storage: PricingItem[];
  fulfillment: PricingItem[];
  valueAdded: PricingItem[];
  rush: PricingItem[];
  labor: PricingItem[];
  delivery?: PricingItem[];
  hazmat?: PricingItem[];
  transport?: PricingItem[];
  ecommerce?: PricingItem[];
  fsc?: PricingItem[];
}

export interface StorageIncentive {
  orderRange: string;
  discount: string;
}

export type ProposalTemplate = 'green-lotus' | 'teal-diamond';

export interface ClientConfig {
  // Basic Info
  slug: string;
  name: string;
  fullName: string;
  contactEmail?: string;
  legalInfo?: string;
  website: string;
  tagline: string;
  business: string;
  
  // Template Selection
  template: ProposalTemplate;
  
  // Branding
  primaryColor: string;
  primaryColorHex: string;
  accentColor?: string;
  logoUrl?: string;
  
  // Provider Info (for partner 3PLs)
  provider: {
    name: string;
    isPartner: boolean;
    partnerName?: string;
    partnerAddress?: string;
  };
  
  // Proposal Details
  term: string;
  termMonths: number;
  proposalDate: string;
  monthlyMinimum: number;
  storageWaived?: string;
  slaTime: string;
  slaAccuracy: string;
  
  // Facilities
  facilities: string[];
  
  // Pricing by Location
  pricing: LocationPricing[];
  
  // Storage Incentives
  storageIncentives: StorageIncentive[];
  storageIncentiveNotes: string[];
  
  // Contract Terms
  contractTerms: {
    term: string;
    termination: string;
    payment: string;
    rateIncreases: string;
    liability: string;
    nonCompete: string;
  };
  
  // Service & Fees
  serviceFees: {
    monthlyMinimum: string;
    setupFee: string;
    insurance: string;
    claims: string;
  };
  
  // Technology
  standardIntegrations: string[];
  customIntegrationFee: number;
  integrationFeeWaived: boolean;
  
  // Key Benefits
  benefits: string[];
  
  // Assumptions
  assumptions: string[];
  
  // Hero Image (optional - uses default Unsplash image if not set)
  heroImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  
  // Customizable Proposal Sections (optional - uses defaults if not set)
  storageDescription?: string;
  storageNote?: string;
  inboundType?: 'floor-loaded' | 'palletized' | 'container';
  inboundDescription?: string[];
  inboundNote?: string;
  deliverables?: string[];
  clientResponsibilities?: string[];
  
  // PDF Export
  pdfFilename?: string;
  
  // Analytics & Tracking (default: true)
  trackingEnabled?: boolean;
  
  // Proposal Status (default: true = active)
  active?: boolean;
  
  // Expired/Archived Status
  expired?: boolean;
  expiredDate?: string;
  expiredMessage?: string;
  
  // Auto-Expiration (ISO date string, e.g. '2026-04-15')
  // If set, proposal auto-expires after this date
  expiresAt?: string;
  
  // Contact Info
  contact: {
    name: string;
    title: string;
    email: string;
  };
}

// Shared Lotus Group base configuration
const lotusGroupBase = {
  name: 'Lotus Group',
  fullName: 'The Lotus Group',
  website: 'https://thelotusgroup.us/',
  tagline: 'Good For The Earth, Good For Us',
  business: 'Sustainable/Eco-Friendly Packaging',
  
  primaryColor: 'oklch(0.55 0.18 145)',
  primaryColorHex: '#2E7D32',
  accentColor: '#E91E63',
  
  term: '36-Month Agreement',
  termMonths: 36,
  proposalDate: 'January 9th, 2026',
  monthlyMinimum: 1500,
  slaTime: '14:00 EST',
  slaAccuracy: '96%',
  
  contractTerms: {
    term: 'Commences upon signing. 36-month initial term.',
    termination: '60-days written notice required.',
    payment: 'Net 30 days. 1% monthly interest on late payments.',
    rateIncreases: 'Annual adjustment up to 5% based on CPI.',
    liability: 'Limited to $50.00 per carton for loss/damage.',
    nonCompete: 'Provider agrees not to engage in the manufacturing, distribution, or sale of products that directly compete with Client\'s business. Client agrees not to establish or operate third-party logistics (3PL) services during the term of this agreement and for 24 months thereafter.',
  },
  
  storageIncentives: [
    { orderRange: '501-600 Orders', discount: '5% storage reduction' },
    { orderRange: '601-700 Orders', discount: '10% storage reduction' },
    { orderRange: '701+ Orders', discount: '20% storage reduction' },
  ],
  
  storageIncentiveNotes: [
    'Maximum of 150 pallets per location to qualify for volume-based storage discounts',
    'Storage discounts apply to order volume equal or greater than 500 orders per site while maintaining 150 pallet ratio',
    'Pallet height limited to 72" for standard storage rates; taller pallets subject to premium pricing',
    'Volume thresholds are site-specific and evaluated on a rolling 3-month average',
    'If monthly order volume drops below 500 orders, pricing is subject to review/change',
  ],
  
  serviceFees: {
    monthlyMinimum: '$1,500.00 activity fee (difference invoiced if not met).',
    setupFee: 'Waived with 36-month commitment.',
    insurance: 'Customer responsible for goods insurance.',
    claims: 'Must be filed within 30 days of delivery/loss.',
  },
  
  standardIntegrations: ['Shopify', 'WooCommerce', 'ShipStation', 'Amazon', 'eBay'],
  customIntegrationFee: 4500,
  integrationFeeWaived: true,
  
  assumptions: [
    'Maximum 150 pallets for volume-based storage discounts',
    'Storage discounts apply at 1000+ orders',
    'Pallet height limited to 60" for standard rates',
    'Volume thresholds evaluated on rolling 3-month average',
    'SKU count and product mix remain consistent with onboarding profile',
    'Standard business hours: Monday-Friday, 8:00 AM - 5:00 PM local time',
    'Pricing valid for 30 days from proposal date',
  ],
};

export const CLIENTS: Record<string, ClientConfig> = {
  // Lotus Group - Philadelphia (Peach Warehouse Direct)
  'lotus-group-pa': {
    ...lotusGroupBase,
    slug: 'lotus-group-pa',
    template: 'green-lotus',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    slaTime: '14:00 EST',
    storageWaived: 'First 60 days',
    
    facilities: ['PA-2101 (Philadelphia, PA)'],
    
    pricing: [
      {
        location: 'Philadelphia, PA',
        code: 'PA-2101',
        address: 'Philadelphia, PA',
        inbound: [
          { service: 'Floor-Loaded Container', rate: '$550.00/container' },
          { service: 'Pallet Label', rate: '$0.50/pallet' },
          { service: 'Pallet Supply Fee', rate: '$10.00/pallet' },
          { service: 'Shrink Wrap', rate: '$4.00/pallet' },
          { service: 'Pallet Handling In', rate: '$11.00/pallet' },
        ],
        storage: [
          { service: 'Storage (after 60 days)', rate: '$20.00/pallet/mo' },
          { service: 'Handling Out', rate: '$12.00/pallet' },
        ],
        fulfillment: [
          { service: 'Initial Pick', rate: '$3.25/order' },
          { service: 'Order Intervention', rate: '$2.00/instance' },
          { service: 'Additional Item', rate: '$0.60/item' },
          { service: 'Heavy Item (40+ lbs)', rate: '$5.00/item' },
        ],
        valueAdded: [
          { service: 'Returns Processing', rate: '$2.50/return' },
          { service: 'Quality Inspection', rate: 'Hourly rate' },
        ],
        rush: [
          { service: 'Rush Fee (Same Day)', rate: '$2.00/item', notes: 'Outside SLA, 9 item minimum' },
          { service: 'Saturday Fulfillment', rate: '20% surcharge', notes: 'OT coverage if needed' },
          { service: 'Heavy Item (40+ lbs)', rate: '$5.00/item', notes: 'Team lift/OSHA requirement' },
        ],
        labor: [
          { service: 'Labor (General)', rate: '$40.00/hour' },
          { service: 'Manual Order Entry', rate: '$2.00/order' },
        ],
      },
    ],
    
    benefits: [
      '36-Month Term',
      'East Coast Coverage (PA)',
      '$1,500 Monthly Minimum',
      '60-Day Storage Waived',
    ],
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },
  
  // Lotus Group - California (Ironlink Logistics Partner)
  'lotus-group-ca': {
    ...lotusGroupBase,
    slug: 'lotus-group-ca',
    template: 'green-lotus',
    
    provider: {
      name: 'Ironlink Logistics',
      isPartner: true,
      partnerName: 'Ironlink Logistics',
      partnerAddress: '821 S Rockefeller Ave, Ontario, CA 91761',
    },
    
    slaTime: '11:00 PST',
    
    facilities: ['CA-821 (Ontario, CA)'],
    
    pricing: [
      {
        location: 'Ontario, CA',
        code: 'CA-821',
        address: '821 S Rockefeller Ave, Ontario, CA 91761',
        inbound: [
          { service: 'Floor-Loaded Container', rate: '$550.00/container' },
          { service: 'Pallet Label', rate: '$0.50/pallet' },
          { service: 'Pallet Supply Fee', rate: '$12.00/pallet' },
          { service: 'Shrink Wrap', rate: '$4.50/pallet' },
          { service: 'Pallet Handling In', rate: '$11.00/pallet' },
        ],
        storage: [
          { service: 'Storage', rate: '$22.00/pallet/mo' },
          { service: 'Storage (72" height)', rate: '$26.00/pallet/mo' },
          { service: 'Handling Out', rate: '$13.60/pallet' },
        ],
        fulfillment: [
          { service: 'Initial Pick', rate: '$3.25/order' },
          { service: 'Order Intervention', rate: '$2.25/instance' },
          { service: 'Additional Item', rate: '$0.66/item' },
          { service: 'Heavy Item (40+ lbs)', rate: '$5.50/item' },
        ],
        valueAdded: [
          { service: 'Returns Processing', rate: '$2.50/return' },
          { service: 'Shrink Wrap', rate: '$4.50/instance' },
        ],
        rush: [
          { service: 'Rush Fee (Same Day)', rate: '$2.35/item', notes: 'Outside SLA, 9 item minimum' },
          { service: 'Saturday Fulfillment', rate: 'OT coverage', notes: 'If needed' },
          { service: 'Heavy Item (40+ lbs)', rate: '$5.50/item', notes: 'Team lift/OSHA requirement' },
        ],
        labor: [
          { service: 'Labor (General)', rate: '$40.00/hour' },
          { service: 'Manual Order Entry', rate: '$2.40/order' },
        ],
      },
    ],
    
    benefits: [
      '36-Month Term',
      'West Coast Coverage (CA)',
      '$1,500 Monthly Minimum',
      'Partner 3PL Network',
    ],
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },
  
  // Diamond Home USA - Orangeburg, SC
  'diamond-home-sc': {
    slug: 'diamond-home-sc',
    template: 'teal-diamond',
    name: 'Diamond Home USA',
    fullName: 'AL DIAMOND HOME PRODUCTS LLC',
    legalInfo: 'New York State, EIN 46-5760723',
    website: 'https://diamondhomeusa.com/',
    tagline: 'Strategic Fulfillment for Home Goods',
    business: 'Home Goods / Furniture Distribution',
    
    primaryColor: 'oklch(0.65 0.15 195)',
    primaryColorHex: '#00ACC1',
    accentColor: '#FF6F00',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    term: '180-Day Initial Agreement',
    termMonths: 6,
    proposalDate: 'January 15th, 2026',
    monthlyMinimum: 0,
    slaTime: '48 hours',
    slaAccuracy: '99%',
    
    facilities: ['SC-OBG (Orangeburg, SC)'],
    
    pricing: [
      {
        location: 'Starter Tier (65K Cartons)',
        code: '65K',
        address: '144 Old Elloree Road, Orangeburg, SC 29115',
        inbound: [
          { service: 'Floor-Loaded Hand Unload', rate: '$0.15/carton' },
          { service: 'Minimum Inbound Charge', rate: '$550.00/container' },
        ],
        storage: [
          { service: 'Storage (Actual Cube)', rate: '$0.18/cubic foot/mo', notes: '1.0 cu ft minimum per carton' },
        ],
        fulfillment: [
          { service: 'Outbound Handling', rate: '$0.15/carton', notes: 'No minimum' },
          { service: 'Admin Fee (Outbound)', rate: '$5.00/order', notes: 'Per outbound order' },
        ],
        valueAdded: [
          { service: 'Label Fee (Print + Apply)', rate: '$0.25/label' },
          { service: 'Pallet Supply Fee', rate: '$8.80/pallet' },
          { service: 'Shrink Wrap', rate: '$2.50/pallet', notes: 'At cost' },
        ],
        rush: [
          { service: 'Drayage', rate: '$495.00/container' },
          { service: 'Chassis', rate: 'Waived', notes: 'First wave (10 containers)' },
        ],
        labor: [
          { service: 'General Labor', rate: '$40.00/hour' },
        ],
      },
    ],
    
    storageIncentives: [],
    
    storageIncentiveNotes: [
      'Volume commitment measured over rolling 90-day period',
      'Storage billed on Actual Cube calculated from case dimensions',
      '1.0 cubic foot minimum per carton for billing purposes',
      'Billing: Monthly on the 1st based on inventory on hand',
      'Ready time: 48 hours from receipt for outbound availability',
    ],
    
    contractTerms: {
      term: '180-day initial agreement effective January 29, 2026. 36-month scaled pricing available upon completion.',
      termination: '180-day written notice required (available after initial 90 days).',
      payment: 'Net 30 days. Monthly billing on the 1st.',
      rateIncreases: 'Annual adjustment up to 5% based on CPI.',
      liability: 'Standard warehouse liability applies. $50/carton max.',
      nonCompete: 'Standard non-compete terms apply.',
    },
    
    serviceFees: {
      monthlyMinimum: 'Minimum 65,000 cartons @ $0.18/cu ft ($15K/mo at 1.5 cu ft avg).',
      setupFee: 'Waived with 180-day commitment.',
      insurance: 'Customer responsible for goods insurance.',
      claims: 'Must be filed within 30 days of delivery/loss.',
    },
    
    standardIntegrations: ['WMS Portal', 'Daily Reporting', 'Monthly Summary'],
    customIntegrationFee: 0,
    integrationFeeWaived: true,
    
    benefits: [
      'Port of Charleston Proximity',
      'I-26 & I-95 Access',
      'Floor-Loaded Specialist',
      'Home Goods Ready',
    ],
    
    assumptions: [
      'Storage billed on Actual Cube from case dimensions with 1.0 cu ft minimum per carton',
      'Average carton size estimated at 1.50 cubic feet based on packing list analysis',
      'Carton weight assumed 25-40 lbs (standard floor-loaded handling)',
      'Floor-loaded containers only; palletized inbound subject to different rates',
      'Volume commitment: 65,000 cartons over rolling 90-day period',
      'Ready time: 48 hours from receipt for outbound availability',
      'Standard orders ship within 48 hours of order receipt',
      '99%+ inventory accuracy target',
      'Inbound received within 2 business days of appointment',
      'Client maintains accurate item master data (dimensions, weights, SKUs)',
      'Pricing valid for 30 days from proposal date',
      'Annual rate adjustment up to 5% based on CPI',
      'Drayage rate assumes Port of Charleston or within 50-mile radius',
      'Client responsible for cargo insurance on stored goods',
    ],
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },
  
  // Diamond Home USA - Orangeburg, SC (Addendum - Updated Rates March 2026)
  'diamond-home-addendum': {
    slug: 'diamond-home-addendum',
    template: 'teal-diamond',
    name: 'Diamond Home USA',
    fullName: 'AL DIAMOND HOME PRODUCTS LLC',
    legalInfo: 'New York State, EIN 46-5760723',
    website: 'https://diamondhomeusa.com/',
    tagline: 'Strategic Fulfillment for Home Goods',
    business: 'Home Goods / Furniture Distribution',
    
    primaryColor: 'oklch(0.65 0.15 195)',
    primaryColorHex: '#00ACC1',
    accentColor: '#FF6F00',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    term: '180-Day Initial Agreement (Addendum)',
    termMonths: 6,
    proposalDate: 'March 15th, 2026',
    monthlyMinimum: 0,
    slaTime: '48 hours',
    slaAccuracy: '99%',
    
    facilities: ['SC-OBG (Orangeburg, SC)'],
    
    pricing: [
      {
        location: 'Starter Tier (65K Cartons) - Amended Rates',
        code: '65K-ADDENDUM',
        address: '144 Old Elloree Road, Orangeburg, SC 29115',
        inbound: [
          { service: 'Floor-Loaded Hand Unload', rate: '$0.15/carton' },
          { service: 'Minimum Inbound Charge', rate: '$530.00/container' },
          { service: 'Inbound Charge (Shrink Wrap)', rate: '$2.50/pallet', notes: 'At cost' },
        ],
        storage: [
          { service: 'Storage (Actual Cube)', rate: '$0.18/cubic foot/mo', notes: '1.0 cu ft minimum per carton' },
          { service: 'Storage (Arriving After 15th)', rate: '$0.11/cubic foot/mo', notes: 'Prorated rate for inventory arriving after the 15th of the month' },
        ],
        fulfillment: [
          { service: 'Outbound Handling', rate: '$0.15/carton', notes: 'No minimum' },
          { service: 'Admin Fee (Outbound)', rate: '$5.00/order', notes: 'Per outbound order' },
        ],
        valueAdded: [
          { service: 'Label Fee (Print + Apply)', rate: '$0.25/label' },
          { service: 'Pallet Supply Fee', rate: '$8.80/pallet' },
          { service: 'Heat Treated Pallets', rate: '$13.00/pallet' },
        ],
        rush: [
          { service: 'Drayage', rate: '$585.00/container' },
          { service: 'Chassis', rate: '$40.00/day', notes: 'First 10 containers waived' },
        ],
        labor: [
          { service: 'General Labor', rate: '$40.00/hour' },
        ],
        ecommerce: [
          { service: 'E-Commerce Boxes', rate: '$2.00/item' },
          { service: 'Bubble Wrap', rate: '$2.00/order' },
          { service: 'Additional Items (SKU Line)', rate: '$0.70/item' },
          { service: 'Admin Fee (Outbound)', rate: '$5.00/order' },
        ],
        fsc: [
          { service: 'Base Fuel Price', rate: '$3.00/gallon', notes: 'FSC pegged at $3.00/gallon. 1% surcharge per $0.10 above base.' },
          { service: '$3.00', rate: '0% | $0.00 | $585.00', notes: 'No surcharge' },
          { service: '$3.10', rate: '1% | $5.85 | $590.85' },
          { service: '$3.20', rate: '2% | $11.70 | $596.70' },
          { service: '$3.30', rate: '3% | $17.55 | $602.55' },
          { service: '$3.40', rate: '4% | $23.40 | $608.40' },
          { service: '$3.50', rate: '5% | $29.25 | $614.25' },
          { service: '$3.60', rate: '6% | $35.10 | $620.10' },
          { service: '$3.70', rate: '7% | $40.95 | $625.95' },
          { service: '$3.80', rate: '8% | $46.80 | $631.80' },
          { service: '$3.90', rate: '9% | $52.65 | $637.65' },
          { service: '$4.00', rate: '10% | $58.50 | $643.50' },
          { service: '$4.10', rate: '11% | $64.35 | $649.35' },
          { service: '$4.20', rate: '12% | $70.20 | $655.20' },
          { service: '$4.30', rate: '13% | $76.05 | $661.05' },
          { service: '$4.40', rate: '14% | $81.90 | $666.90' },
          { service: '$4.50', rate: '15% | $87.75 | $672.75' },
          { service: '$4.60', rate: '16% | $93.60 | $678.60' },
          { service: '$4.70', rate: '17% | $99.45 | $684.45' },
          { service: '$4.80', rate: '18% | $105.30 | $690.30' },
          { service: '$4.90', rate: '19% | $111.15 | $696.15' },
          { service: '$5.00', rate: '20% | $117.00 | $702.00' },
          { service: '$5.10', rate: '21% | $122.85 | $707.85' },
          { service: '$5.20', rate: '22% | $128.70 | $713.70' },
          { service: '$5.30', rate: '23% | $134.55 | $719.55' },
          { service: '$5.40', rate: '24% | $140.40 | $725.40' },
          { service: '$5.50', rate: '25% | $146.25 | $731.25' },
          { service: '$5.60', rate: '26% | $152.10 | $737.10' },
          { service: '$5.70', rate: '27% | $157.95 | $742.95' },
          { service: '$5.80', rate: '28% | $163.80 | $748.80' },
          { service: '$5.90', rate: '29% | $169.65 | $754.65' },
          { service: '$6.00', rate: '30% | $175.50 | $760.50' },
        ],
      },
    ],
    
    storageIncentives: [],
    
    storageIncentiveNotes: [
      'Volume commitment measured over rolling 90-day period',
      'Storage billed on Actual Cube calculated from case dimensions',
      '1.0 cubic foot minimum per carton for billing purposes',
      'Billing: Monthly on the 1st based on inventory on hand',
      'Ready time: 48 hours from receipt for outbound availability',
    ],
    
    contractTerms: {
      term: '180-day initial warehouse agreement effective January 29, 2026, expiring July 28, 2026. Rate addendum effective March 15, 2026. This addendum supersedes all prior rate schedules. Drayage rates shall be honored through December 31, 2026, provided Peach Warehouse continues to provide warehouse services for Diamond Home. 3-year agreement to be executed following the initial 180-day period.',
      termination: '180-day written notice required (available after initial 90 days).',
      payment: 'Net 30 days. Recurring storage billed on the 1st of each month. Activity (including initial storage) billed weekly.',
      rateIncreases: 'Annual adjustment up to 5% based on CPI.',
      liability: 'Standard warehouse liability applies. $50/carton max.',
      nonCompete: 'Standard non-compete terms apply.',
    },
    
    serviceFees: {
      monthlyMinimum: 'Minimum 65,000 cartons @ $0.18/cu ft ($15,210/mo at 1.3 cu ft avg).',
      setupFee: 'Waived with 180-day commitment.',
      insurance: 'Customer responsible for goods insurance.',
      claims: 'Must be filed within 30 days of delivery/loss.',
    },
    
    standardIntegrations: ['WMS Portal', 'Daily Reporting', 'Monthly Summary'],
    customIntegrationFee: 0,
    integrationFeeWaived: true,
    
    benefits: [
      'Port of Charleston Proximity',
      'I-26 & I-95 Access',
      'Floor-Loaded Specialist',
      'Home Goods Ready',
    ],
    
    assumptions: [
      'Storage billed on Actual Cube from case dimensions with 1.0 cu ft minimum per carton',
      'Average carton size estimated at 1.30 cubic feet based on packing list analysis (1.0 cu ft minimum per carton)',
      'Carton weight assumed 25-40 lbs (standard floor-loaded handling)',
      'Floor-loaded containers only; palletized inbound subject to different rates',
      'Volume commitment: 65,000 cartons over rolling 90-day period',
      'Ready time: 48 hours from receipt for outbound availability',
      'Standard orders ship within 48 hours of order receipt',
      '99%+ inventory accuracy target',
      'Inbound received within 2 business days of appointment',
      'Client maintains accurate item master data (dimensions, weights, SKUs)',
      'Pricing valid for 30 days from proposal date',
      'Annual rate adjustment up to 5% based on CPI',
      'Drayage rate ($585/container) assumes Port of Charleston or within 50-mile radius',
      'Fuel Surcharge (FSC) pegged at $3.00/gallon base; 1% per $0.10 above base, table extends to $6.00/gallon',
      'Chassis fee of $40/day applies after first 10 containers (waived for initial wave)',
      'E-commerce fulfillment rates apply to direct-to-consumer orders only',
      'Client responsible for cargo insurance on stored goods',
    ],
    
    pdfFilename: 'Peach Warehouse - AL DIAMOND HOME PRODUCTS LLC Addendum',
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },
  
  // K2J Gifts - Philadelphia (Parx Casino Repack Project)
  'k2j-gifts': {
    slug: 'k2j-gifts',
    expired: true,
    template: 'teal-diamond',
    name: 'K2J Gifts',
    fullName: 'K2J Marketing Partners',
    website: 'https://www.k2jgifts.com/',
    tagline: 'Casino Gifting Solutions',
    business: 'Casino Promotional Products / Gift Distribution',
    
    primaryColor: 'oklch(0.65 0.15 195)',
    primaryColorHex: '#00ACC1',
    accentColor: '#F05A4D',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    term: 'Project-Based Agreement',
    termMonths: 0,
    proposalDate: 'January 13th, 2026',
    monthlyMinimum: 0,
    slaTime: '48 hours from receipt',
    slaAccuracy: '99.5%',
    
    facilities: ['PA-2101 (Philadelphia, PA)'],
    
    pricing: [
      {
        location: 'Long-Term Agreement (12+ Months)',
        code: 'LONG-TERM',
        address: '2101 Hornig Road, Philadelphia, PA',
        monthlyMinimum: '20 pallet minimum ($600/month storage commitment)',
        inbound: [
          { service: 'Inbound Receiving', rate: '$10.00/pallet', notes: 'Schedule appointment, verify count, stage for processing' },
          { service: 'Pallet Handling In', rate: '$8.00/pallet' },
        ],
        storage: [
          { service: 'Pallet Storage', rate: '$30.00/pallet/month', notes: '20 pallet minimum ($600/month). Billed on arrival, then 1st of each month. 65% rate if arriving after 15th.' },
        ],
        fulfillment: [
          { service: 'De-cartonize (Remove Master Cartons)', rate: '$0.30/unit', notes: 'Remove outer/master cartons from inbound pallets' },
          { service: 'Gaylord Build (160 units)', rate: '$15.00/gaylord', notes: 'Count/confirm units, build gaylords at 160 units each' },
          { service: 'Internal Labeling', rate: '$0.25/label', notes: 'SKU / unit count / lot or date code as needed' },
        ],
        valueAdded: [
          { service: 'Gaylord Securing', rate: '$6.50/gaylord', notes: 'Banding/strapping, corner protection, top cap, stretch-wrap' },
          { service: 'Gaylord Supply', rate: '$10.00/gaylord', notes: 'Or client-supplied at no charge' },
          { service: 'Hazmat Documentation & BOL', rate: '$12.00/shipment', notes: 'Includes BOL, Class 9 UN3481 labeling, and shipping paperwork' },
          { service: 'Hazmat Placards (Pallet)', rate: '$4.00/pallet', notes: '2 placards per pallet outbound' },
          { service: 'Hazmat Placards (Trailer)', rate: '$8.00/shipment', notes: '2 placards per trailer' },
        ],
        rush: [
          { service: 'Rush Processing (Same Day)', rate: '+25% surcharge', notes: 'Subject to availability' },
        ],
        labor: [
          { service: 'Labor (General)', rate: '$40.00/hour' },
        ],
        delivery: [
          { service: 'FTL Delivery to Parx Casino', rate: '$400.00/delivery', notes: 'Full truckload to Bensalem, PA (~18 miles) - includes POD' },
          { service: 'Single Pallet Delivery', rate: '$110.00/pallet', notes: '1 pallet to Bensalem, PA (~18 miles) - includes POD' },
        ],
      },
      {
        location: 'Short-Term / Project-Based',
        code: 'PROJECT',
        address: '2101 Hornig Road, Philadelphia, PA',
        monthlyMinimum: 'No monthly minimum - project-based billing',
        inbound: [
          { service: 'Inbound Receiving', rate: '$12.00/pallet', notes: 'Schedule appointment, verify count, stage for processing' },
          { service: 'Pallet Handling In', rate: '$10.00/pallet' },
        ],
        storage: [
          { service: 'Pallet Storage', rate: '$35.00/pallet/month', notes: 'No minimum. Billed on arrival, then 1st of each month. 65% rate if arriving after 15th.' },
        ],
        fulfillment: [
          { service: 'De-cartonize (Remove Master Cartons)', rate: '$0.35/unit', notes: 'Remove outer/master cartons from inbound pallets' },
          { service: 'Gaylord Build (160 units)', rate: '$15.00/gaylord', notes: 'Count/confirm units, build gaylords at 160 units each' },
          { service: 'Internal Labeling', rate: '$0.25/label', notes: 'SKU / unit count / lot or date code as needed' },
        ],
        valueAdded: [
          { service: 'Gaylord Securing', rate: '$7.50/gaylord', notes: 'Banding/strapping, corner protection, top cap, stretch-wrap' },
          { service: 'Gaylord Supply', rate: '$12.00/gaylord', notes: 'Or client-supplied at no charge' },
          { service: 'Hazmat Documentation & BOL', rate: '$15.00/shipment', notes: 'Includes BOL, Class 9 UN3481 labeling, and shipping paperwork' },
          { service: 'Hazmat Placards (Pallet)', rate: '$5.00/pallet', notes: '2 placards per pallet outbound' },
          { service: 'Hazmat Placards (Trailer)', rate: '$10.00/shipment', notes: '2 placards per trailer' },
        ],
        rush: [
          { service: 'Rush Processing (Same Day)', rate: '+25% surcharge', notes: 'Subject to availability' },
        ],
        labor: [
          { service: 'Labor (General)', rate: '$45.00/hour' },
        ],
        delivery: [
          { service: 'FTL Delivery to Parx Casino', rate: '$600.00/delivery', notes: 'Full truckload to Bensalem, PA (~18 miles) - includes POD' },
          { service: 'LTL Delivery to Parx Casino', rate: '$400.00/delivery', notes: '10 pallets or less to Bensalem, PA - includes POD' },
          { service: 'Single Pallet Delivery', rate: '$200.00/delivery', notes: '1 pallet to Bensalem, PA - includes POD' },
        ],
      },
    ],
    
    storageIncentives: [],
    
    storageIncentiveNotes: [
      'Product is Hazmat Class 9 (Miscellaneous Dangerous Goods) - UN3481 Lithium ion batteries contained in equipment',
      'Gaylords supplied by Peach or client (either option available)',
      'Parx receiving requirements (appointment, labeling, dock rules) will be followed once provided',
      'All shipments will include required hazmat documentation and UN3481 labeling',
    ],
    
    contractTerms: {
      term: 'Project-based agreement. Pricing valid for duration of project.',
      termination: 'Either party may terminate with 7-days written notice.',
      payment: 'Net 15 days. Invoice upon completion of each shipment.',
      rateIncreases: 'Rates fixed for project duration.',
      liability: 'Standard warehouse liability applies.',
      nonCompete: 'N/A for project-based work.',
    },
    
    serviceFees: {
      monthlyMinimum: 'No monthly minimum - project-based billing.',
      setupFee: 'Waived.',
      insurance: 'Customer responsible for goods insurance.',
      claims: 'Must be filed within 7 days of delivery.',
    },
    
    standardIntegrations: ['Email Notifications', 'POD Documentation', 'Inventory Reporting'],
    customIntegrationFee: 0,
    integrationFeeWaived: true,
    
    benefits: [
      'Philadelphia Location',
      'Parx Casino Proximity',
      'Project-Based Pricing',
      'Fast Turnaround',
    ],
    
    assumptions: [
      'Inbound: 35 pallets received March 1, 2026',
      'Storage: March 1 - May 1, 2026 (2 months)',
      'Product: Hazmat Class 9 - UN3481 Lithium ion batteries contained in equipment',
      'Output: De-cartonize and repack into gaylords at 160 units per gaylord',
      'Delivery: Secured gaylords delivered to Parx Casino, Bensalem PA',
      'Gaylords: Supplied by Peach or client (either option available)',
      'Parx receiving requirements (appointment, labeling, dock rules) to be provided by client',
      'Standard business hours: Monday-Friday, 8:00 AM - 5:00 PM EST',
    ],
    
    // K2J-specific proposal sections
    storageDescription: 'Storage is billed per pallet position per month. Pallets are staged in secure racking with full WMS tracking by location and lot.',
    storageNote: 'Short-term staging for project duration. No long-term storage commitment required.',
    inboundType: 'palletized',
    inboundDescription: [
      'Receive palletized shipments at dock.',
      'Verify pallet count and visible condition on arrival.',
      'Check-in and stage product for processing.',
      'Apply pallet and location labels for WMS tracking.',
    ],
    inboundNote: 'Specialization: Efficient palletized receiving with same-day check-in.',
    deliverables: [
      'Real-time inventory visibility via client portal for all casino promotional products',
      'Delivery confirmation and POD documentation for each Parx Casino shipment',
      'Hazmat compliance documentation (UN3481) for all lithium battery shipments',
      'Project completion summary with unit counts and delivery records',
    ],
    clientResponsibilities: [
      'Provide advance notice of inbound pallet shipments (48 hours minimum)',
      'Confirm Parx Casino receiving requirements and delivery windows',
      'Approve gaylord build specifications and unit counts per gaylord',
    ],
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },
  
  // K2J Gifts - Project-Based Pricing (Parx + Seneca Buffalo Creek)
  'k2j-gifts-2': {
    slug: 'k2j-gifts-2',
    expired: true,
    template: 'teal-diamond',
    name: 'K2J Gifts',
    fullName: 'K2J Marketing Partners',
    website: 'https://www.k2jgifts.com/',
    tagline: 'Casino Gifting Solutions',
    business: 'Casino Promotional Products / Gift Distribution',
    
    primaryColor: 'oklch(0.65 0.15 195)',
    primaryColorHex: '#00ACC1',
    accentColor: '#F05A4D',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    term: 'Project-Based Agreement',
    termMonths: 0,
    proposalDate: 'February 9th, 2026',
    monthlyMinimum: 0,
    slaTime: '48 hours from receipt',
    slaAccuracy: '99.5%',
    
    facilities: ['PA-2101 (Philadelphia, PA)'],
    
    pricing: [
      {
        location: 'Project-Based Pricing',
        code: 'PROJECT-2',
        address: '2101 Hornig Road, Philadelphia, PA',
        monthlyMinimum: 'No monthly minimum - project-based billing',
        inbound: [
          { service: 'Inbound Receiving', rate: '$10.00/pallet', notes: 'Schedule appointment, verify count, stage for processing' },
          { service: 'Pallet Handling In', rate: '$8.00/pallet' },
        ],
        storage: [
          { service: 'Pallet Storage', rate: '$30.00/pallet/month', notes: 'Billed on arrival, then 1st of each month. 65% rate if arriving after 15th.' },
        ],
        fulfillment: [
          { service: 'Outbound Handling', rate: '$18.00/pallet', notes: 'Pallet staging, forklift loadout for carrier pickup or Peach delivery' },
          { service: 'De-cartonize (Remove Master Cartons)', rate: '$0.30/unit', notes: 'Remove outer/master cartons from inbound pallets' },
          { service: 'Gaylord Build', rate: '$15.00/gaylord', notes: 'Count/confirm units, build gaylords' },
          { service: 'Internal Labeling', rate: '$0.25/label', notes: 'SKU / unit count / lot or date code as needed' },
        ],
        valueAdded: [
          { service: 'Gaylord Supply', rate: '$25.00/gaylord', notes: 'Or client-supplied at no charge' },
          { service: 'Gaylord Securing', rate: '$6.50/gaylord', notes: 'Banding/strapping, corner protection, top cap, stretch-wrap' },
          { service: 'Hazmat Documentation & BOL', rate: '$12.00/shipment', notes: 'Includes BOL, Class 9 UN3481 labeling, and shipping paperwork (if applicable)' },
          { service: 'Hazmat Placards (Pallet)', rate: '$4.00/pallet', notes: '2 placards per pallet outbound (if applicable)' },
          { service: 'Hazmat Placards (Trailer)', rate: '$8.00/shipment', notes: '2 placards per trailer (if applicable)' },
          { service: 'Hazmat Surcharge (Storage)', rate: '$5.00/pallet/month', notes: 'Additional storage fee for hazmat-classified items (if applicable)' },
        ],
        rush: [
          { service: 'Rush Processing (Same Day)', rate: '+25% surcharge', notes: 'Subject to availability' },
        ],
        labor: [
          { service: 'Labor (General)', rate: '$40.00/hour' },
        ],
        delivery: [
          { service: 'FTL Delivery to Parx Casino', rate: '$400.00/delivery + FSC', notes: 'Full truckload delivery - includes POD. Fuel surcharge (FSC) at applicable rate.' },
          { service: 'LTL Delivery to Parx Casino', rate: '$250.00/delivery + FSC', notes: '10 pallets or less - includes POD. Fuel surcharge (FSC) at applicable rate.' },
          { service: 'Single Pallet Delivery', rate: '$110.00/pallet + FSC', notes: '1 pallet delivery - includes POD. Fuel surcharge (FSC) at applicable rate.' },
        ],
      },
    ],
    
    storageIncentives: [],
    
    storageIncentiveNotes: [
      'Gaylords supplied by Peach ($25.00 each) or client-supplied at no charge',
      'De-cartonize and gaylord build services available if requested',
      'Parx receiving requirements (appointment, labeling, dock rules) will be followed once provided',
      'Seneca Buffalo Creek delivery to be quoted separately via carrier',
    ],
    
    contractTerms: {
      term: 'Project-based agreement. Pricing valid for duration of project.',
      termination: 'Either party may terminate with 7-days written notice.',
      payment: 'Net 15 days. Invoice upon completion of each shipment.',
      rateIncreases: 'Rates fixed for project duration.',
      liability: 'Standard warehouse liability applies.',
      nonCompete: 'N/A for project-based work.',
    },
    
    serviceFees: {
      monthlyMinimum: 'No monthly minimum - project-based billing.',
      setupFee: 'Waived.',
      insurance: 'Customer responsible for goods insurance.',
      claims: 'Must be filed within 7 days of delivery.',
    },
    
    standardIntegrations: ['Email Notifications', 'POD Documentation', 'Inventory Reporting'],
    customIntegrationFee: 0,
    integrationFeeWaived: true,
    
    benefits: [
      'Philadelphia Location',
      'Parx Casino Proximity',
      'Project-Based Pricing',
      'Fast Turnaround',
    ],
    
    assumptions: [
      'Parx Shippensburg: 5 pallets (650 units) Craftsman Hedge Trimmer - Receive 4/1/2026, In-Hands 5/20/2026',
      'Parx Bensalem: 33 pallets (4,700 units) Craftsman Hedge Trimmer - Receive 4/1/2026, In-Hands 5/20/2026',
      'Seneca Buffalo Creek: 25 pallets (multiple Craftsman SKUs) - Receive 4/1/2026, In-Hands 5/28-6/18/2026',
      'Parx: Storage + Peach delivery to casino locations',
      'Seneca Buffalo Creek: Storage only - delivery quoted separately via carrier',
      'All items received palletized at dock',
      'Standard business hours: Monday-Friday, 8:00 AM - 5:00 PM EST',
    ],
    
    // K2J-specific proposal sections
    storageDescription: 'Storage is billed per pallet position per month. Pallets are staged in secure racking with full WMS tracking by location and lot.',
    storageNote: 'Project-based staging. No long-term storage commitment required.',
    inboundType: 'palletized',
    inboundDescription: [
      'Receive palletized shipments at dock.',
      'Verify pallet count and visible condition on arrival.',
      'Check-in and stage product for processing.',
      'Apply pallet and location labels for WMS tracking.',
    ],
    inboundNote: 'Specialization: Efficient palletized receiving with same-day check-in.',
    deliverables: [
      'Real-time inventory visibility via client portal for all casino promotional products',
      'Delivery confirmation and POD documentation for each Parx Casino shipment',
      'Inventory reporting by SKU, location, and pallet count',
      'Project completion summary with unit counts and delivery records',
    ],
    clientResponsibilities: [
      'Provide advance notice of inbound pallet shipments (48 hours minimum)',
      'Confirm Parx Casino and Seneca Buffalo Creek receiving requirements and delivery windows',
      'Specify de-cartonize / gaylord build requirements per item if applicable',
    ],
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },

  // Regfluent LLC - Pharmaceutical API & Finished Product Storage
  'regfluent': {
    slug: 'regfluent',
    template: 'teal-diamond',
    name: 'Regfluent LLC',
    fullName: 'Regfluent LLC',
    website: 'https://regfluent.com/',
    tagline: 'cGMP-Compliant Pharmaceutical Storage Solutions',
    business: 'Pharmaceutical Regulatory Consulting / API & Finished Product Storage',
    expired: true,
    expiredDate: '2026-03-10',
    expiredMessage: 'This proposal has expired. Please contact sales@peachwarehouse.com for an updated quote.',
    
    primaryColor: 'oklch(0.55 0.15 260)',
    primaryColorHex: '#5C6BC0',
    accentColor: '#00897B',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    term: '12-Month Agreement',
    termMonths: 12,
    proposalDate: 'February 15th, 2026',
    monthlyMinimum: 1000,
    slaTime: '48 hours from receipt',
    slaAccuracy: '99.5%',
    
    facilities: ['PA-2101 (Philadelphia, PA)'],
    
    pricing: [
      {
        location: 'Tier 1: Under 10 Pallets',
        code: 'PHARMA-TIER1',
        address: '2101 Hornig Road, Philadelphia, PA',
        monthlyMinimum: '$1,000.00/month compliance & storage minimum',
        inbound: [
          { service: 'Account Setup Fee', rate: '$2,500.00/one-time', notes: 'Includes first month storage, compliance onboarding, SOP development, and system configuration' },
          { service: 'Inbound Receiving (Palletized)', rate: '$18.00/pallet', notes: 'Appointment scheduling, count verification, lot/batch recording, staging' },
          { service: 'Inbound Receiving (Carton/Sub-Pallet)', rate: '$5.00/carton', notes: 'For sub-pallet quantities; includes inspection and check-in' },
        ],
        storage: [
          { service: 'USP Room Temp Storage (15-30°C)', rate: '$70.00/pallet/mo', notes: 'cGMP-compliant, continuously monitored, USP <659> validated environment' },
          { service: 'USP Room Temp Storage (Per Carton)', rate: '$15.00/carton/mo', notes: 'For sub-pallet quantities stored in validated room-temp zone' },
          { service: 'Refrigerated Storage (2-8°C)', rate: '$140.00/pallet/mo', notes: 'Cold chain validated, 24/7 monitoring with alarm system, limited availability' },
          { service: 'Refrigerated Storage (Per Carton)', rate: '$30.00/carton/mo', notes: 'For sub-pallet quantities in refrigerated zone' },
          { service: 'Monthly Compliance Minimum', rate: '$1,000.00/month', notes: 'Minimum monthly charge regardless of pallet count — covers compliance zone maintenance, documentation, and monitoring' },
        ],
        fulfillment: [
          { service: 'Outbound Handling (Pallet)', rate: '$18.00/pallet', notes: 'Staging, documentation, carrier coordination' },
          { service: 'Outbound Handling (Carton)', rate: '$5.00/carton', notes: 'Pick, verify lot/batch, stage for shipment' },
          { service: 'COA/Lot Documentation per Shipment', rate: '$12.00/shipment', notes: 'Lot tracking, COA matching, shipment documentation' },
        ],
        valueAdded: [
          { service: 'Temperature Excursion Report', rate: '$50.00/report', notes: 'Investigation and documentation per FDA/cGMP requirements' },
          { service: 'Regulatory Audit Support', rate: '$75.00/hour', notes: 'On-site support during client or regulatory audits' },
          { service: 'Stability Sample Pull', rate: '$25.00/pull', notes: 'Per stability protocol sample retrieval and documentation' },
          { service: 'Custom Labeling / Relabeling', rate: '$1.50/label', notes: 'Per client specification' },
        ],
        rush: [
          { service: 'Rush Processing (Same Day)', rate: '+25% surcharge', notes: 'Subject to availability' },
        ],
        labor: [
          { service: 'Labor (General)', rate: '$45.00/hour' },
          { service: 'Quality Documentation', rate: '$55.00/hour', notes: 'SOP review, deviation reports, CAPA support' },
        ],
      },
      {
        location: 'Tier 2: 10+ Pallets',
        code: 'PHARMA-TIER2',
        address: '2101 Hornig Road, Philadelphia, PA',
        monthlyMinimum: '$1,500.00/month compliance & account management fee + per-pallet storage',
        inbound: [
          { service: 'Account Setup Fee', rate: '$2,500.00/one-time', notes: 'Includes first month storage, compliance onboarding, SOP development, and system configuration' },
          { service: 'Inbound Receiving (Palletized)', rate: '$15.00/pallet', notes: 'Appointment scheduling, count verification, lot/batch recording, staging' },
          { service: 'Inbound Receiving (Carton/Sub-Pallet)', rate: '$4.00/carton', notes: 'For sub-pallet quantities; includes inspection and check-in' },
        ],
        storage: [
          { service: 'USP Room Temp Storage (15-30°C)', rate: '$60.00/pallet/mo', notes: 'cGMP-compliant, continuously monitored, USP <659> validated environment' },
          { service: 'USP Room Temp Storage (Per Carton)', rate: '$12.00/carton/mo', notes: 'For sub-pallet quantities stored in validated room-temp zone' },
          { service: 'Refrigerated Storage (2-8°C)', rate: '$120.00/pallet/mo', notes: 'Cold chain validated, 24/7 monitoring with alarm system, limited availability' },
          { service: 'Refrigerated Storage (Per Carton)', rate: '$25.00/carton/mo', notes: 'For sub-pallet quantities in refrigerated zone' },
          { service: 'Monthly Account Management Fee', rate: '$1,500.00/month', notes: 'Flat compliance/documentation overhead fee — covers cGMP zone maintenance, monitoring, quality documentation, and dedicated account management. Per-pallet storage billed on top.' },
        ],
        fulfillment: [
          { service: 'Outbound Handling (Pallet)', rate: '$15.00/pallet', notes: 'Staging, documentation, carrier coordination' },
          { service: 'Outbound Handling (Carton)', rate: '$4.00/carton', notes: 'Pick, verify lot/batch, stage for shipment' },
          { service: 'COA/Lot Documentation per Shipment', rate: '$10.00/shipment', notes: 'Lot tracking, COA matching, shipment documentation' },
        ],
        valueAdded: [
          { service: 'Temperature Excursion Report', rate: '$50.00/report', notes: 'Investigation and documentation per FDA/cGMP requirements' },
          { service: 'Regulatory Audit Support', rate: '$75.00/hour', notes: 'On-site support during client or regulatory audits' },
          { service: 'Stability Sample Pull', rate: '$25.00/pull', notes: 'Per stability protocol sample retrieval and documentation' },
          { service: 'Custom Labeling / Relabeling', rate: '$1.25/label', notes: 'Per client specification' },
        ],
        rush: [
          { service: 'Rush Processing (Same Day)', rate: '+25% surcharge', notes: 'Subject to availability' },
        ],
        labor: [
          { service: 'Labor (General)', rate: '$45.00/hour' },
          { service: 'Quality Documentation', rate: '$55.00/hour', notes: 'SOP review, deviation reports, CAPA support' },
        ],
      },
    ],
    
    storageIncentives: [],
    
    storageIncentiveNotes: [
      'All storage zones are USP-validated and continuously temperature-monitored with 24/7 alarm systems',
      'Refrigerated (2-8°C) capacity is limited — availability confirmed at time of onboarding',
      'Monthly compliance minimum applies regardless of inventory volume to cover cGMP zone overhead',
      'Tier 2 pricing available at 10+ pallets with dedicated account management',
      'All pricing subject to final validation upon receipt of product specification sheets and COA',
    ],
    
    contractTerms: {
      term: '12-month initial agreement effective upon signing. Renewable annually.',
      termination: '90-day written notice required after initial term.',
      payment: 'Net 30 days. Monthly billing on the 1st.',
      rateIncreases: 'Annual adjustment up to 5% based on CPI.',
      liability: 'Standard warehouse liability applies. Declared value coverage available.',
      nonCompete: 'Standard confidentiality and non-disclosure terms apply for pharmaceutical materials.',
    },
    
    serviceFees: {
      monthlyMinimum: '$1,000.00/month compliance minimum (Tier 1) or $1,500.00/month account management fee (Tier 2, 10+ pallets).',
      setupFee: '$2,500.00 one-time account setup fee (includes first month charges).',
      insurance: 'Customer responsible for goods insurance. Declared value coverage available upon request.',
      claims: 'Must be filed within 30 days of delivery/loss.',
    },
    
    standardIntegrations: ['WMS Portal', 'Lot/Batch Tracking', 'Temperature Monitoring Reports', 'Inventory Reporting', 'COA Document Management'],
    customIntegrationFee: 0,
    integrationFeeWaived: true,
    
    benefits: [
      'USP Room Temp Validated',
      'cGMP Certified Facility',
      'Cold Chain (2-8°C) Available',
      'Philadelphia Location',
    ],
    
    assumptions: [
      'Product includes both a finished pharmaceutical product and an Active Pharmaceutical Ingredient (API)',
      'Room temperature storage at 15-30°C (USP Controlled Room Temperature) for finished product and API',
      'Refrigerated storage at 2-8°C for temperature-sensitive materials — subject to availability',
      'Initial volume estimated at sub-pallet quantity; pricing structured per carton and per pallet',
      'Client to provide Product Specification Sheet, Certificate of Analysis (COA), and Safety Data Sheet (SDS) prior to onboarding',
      'Client to provide exact product dimensions and weights for final rate confirmation',
      'All materials must comply with applicable FDA, DEA, and state pharmacy board regulations',
      'Peach Warehouse facility is cGMP-certified and USP <659> temperature-validated',
      'Standard business hours: Monday-Friday, 8:00 AM - 5:00 PM EST',
      'Pricing valid for 30 days from proposal date',
    ],
    
    heroImage: 'https://files.manuscdn.com/user_upload_by_module/session_file/93927875/VEqQyoHQWRBXUeEI.jpg',
    heroTitle: 'Pharmaceutical\nStorage',
    heroSubtitle: 'A cGMP-compliant pharmaceutical storage proposal for Regfluent LLC — FDA-registered, USP-validated, temperature-controlled warehousing in Philadelphia.',
    
    // Regfluent-specific proposal sections
    storageDescription: 'All pharmaceutical materials are stored in cGMP-compliant, USP-validated temperature zones with continuous 24/7 monitoring and alarm systems. Room temperature (15-30°C) and refrigerated (2-8°C) zones are available. Each zone maintains full audit trail documentation for regulatory compliance.',
    storageNote: 'Refrigerated capacity is limited. Final availability confirmed during onboarding.',
    inboundType: 'palletized',
    inboundDescription: [
      'Schedule receiving appointment with advance notice.',
      'Verify pallet/carton count and visible condition on arrival.',
      'Record lot numbers, batch numbers, and expiration dates.',
      'Match inbound shipment against COA and packing list.',
      'Stage product in appropriate temperature zone within 2 hours of receipt.',
    ],
    inboundNote: 'Specialization: cGMP pharmaceutical receiving with full lot traceability and COA verification.',
    deliverables: [
      'Real-time inventory visibility with lot/batch tracking via client portal',
      'Monthly temperature monitoring reports for all storage zones',
      'COA document management and matching for all inbound/outbound shipments',
      'Regulatory audit support documentation package on request',
      'Temperature excursion investigation reports (if applicable)',
    ],
    clientResponsibilities: [
      'Provide Product Specification Sheet for each product prior to onboarding',
      'Provide Certificate of Analysis (COA) for each inbound batch/lot',
      'Provide current Safety Data Sheet (SDS) for each product — SDS must include storage conditions, handling precautions, stability data, and hazard classification. SDS must be provided before any product is received at the facility.',
      'Maintain and update SDS documentation whenever product formulation, classification, or regulatory status changes',
      'Provide exact product dimensions and weights for storage planning',
      'Provide advance notice of inbound shipments (48 hours minimum)',
      'Maintain current regulatory status and notify Peach of any changes',
      'Maintain adequate product insurance for all materials stored at the facility',
    ],
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },

  // K2J Gifts 3 - General Scope of Services (Preferred Rates)
  'k2j-gifts-3': {
    slug: 'k2j-gifts-3',
    expired: true,
    template: 'teal-diamond',
    name: 'K2J Gifts',
    fullName: 'K2J Marketing Partners',
    website: 'https://www.k2jgifts.com/',
    tagline: 'Casino Gifting Solutions',
    business: 'Casino Promotional Products / Gift Distribution',
    
    primaryColor: 'oklch(0.65 0.15 195)',
    primaryColorHex: '#00ACC1',
    accentColor: '#F05A4D',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    term: '12-Month Agreement',
    termMonths: 12,
    proposalDate: 'February 17th, 2026',
    monthlyMinimum: 500,
    slaTime: '48 hours from receipt',
    slaAccuracy: '99.5%',
    
    facilities: ['PA-2101 (Philadelphia, PA)'],
    
    pricing: [
      {
        location: 'General Scope of Services',
        code: 'GENERAL',
        address: '2101 Hornig Road, Philadelphia, PA',
        monthlyMinimum: '$500.00/month minimum storage.',
        inbound: [
          { service: 'New Account Setup Fee', rate: '$1,500.00/one-time', notes: 'Due upon acceptance. Covers account onboarding, WMS configuration, and system setup.' },
          { service: 'Inbound Receiving (Palletized)', rate: '$8.30/pallet', notes: 'Appointment scheduling, count verification, staging for storage' },
          { service: 'Pallet Handling In', rate: '$6.65/pallet', notes: 'Put-away to racking location with WMS scan' },
        ],
        storage: [
          { service: 'Pallet Storage', rate: '$21.25/pallet/month', notes: 'Standard pallets up to 72" high. Billed on arrival, then 1st of each month. 65% rate if arriving after 15th.' },
        ],
        fulfillment: [
          { service: 'Outbound Handling (Pallet)', rate: '$15.00/pallet', notes: 'Pull from racking, stage at dock for carrier pickup or delivery' },
          { service: 'De-cartonize (Remove Master Cartons)', rate: '$0.25/unit', notes: 'Remove outer/master cartons from inbound pallets' },
          { service: 'Gaylord Build', rate: '$12.50/gaylord', notes: 'Count/confirm units, build gaylords per specification' },
          { service: 'Internal Labeling', rate: '$0.25/label', notes: 'SKU / unit count / lot or date code as needed' },
        ],
        valueAdded: [
          { service: 'Gaylord Supply', rate: '$20.75/gaylord', notes: 'Or client-supplied at no charge' },
          { service: 'Gaylord Securing', rate: '$5.40/gaylord', notes: 'Banding/strapping, corner protection, top cap, stretch-wrap' },
          { service: 'BOL Preparation', rate: '$5.00/shipment', notes: 'Bill of Lading preparation for each outbound shipment' },
          { service: 'Photos / Condition Report', rate: '$5.00/pallet', notes: 'Inbound condition documentation with photos' },
          { service: 'Pallet Restacking / Rewrap', rate: '$12.00/pallet', notes: 'If pallets need restacking or re-wrapping before outbound' },
        ],
        rush: [
          { service: 'Rush Processing (Same Day)', rate: '+25% surcharge', notes: 'Subject to availability' },
        ],
        labor: [
          { service: 'Labor (General)', rate: '$33.00/hour' },
        ],
        delivery: [
          { service: 'FTL Delivery (Philadelphia Metro)', rate: '$332.00/delivery', notes: 'Full truckload within 25-mile radius - includes POD' },
          { service: 'LTL Delivery (Philadelphia Metro)', rate: '$207.50/delivery', notes: '10 pallets or less within 25-mile radius - includes POD' },
          { service: 'Single Pallet Delivery', rate: '$91.00/pallet', notes: 'Within 25-mile radius - includes POD' },
        ],
        hazmat: [
          { service: 'Hazmat Documentation & BOL', rate: '$10.00/shipment', notes: 'Includes BOL, Class 9 labeling, and required shipping paperwork' },
          { service: 'Hazmat Placards (Pallet)', rate: '$3.50/pallet', notes: '2 placards per pallet outbound' },
          { service: 'Hazmat Placards (Trailer)', rate: '$6.50/shipment', notes: '2 placards per trailer' },
          { service: 'Hazmat Surcharge (Storage)', rate: '$7.00/pallet/month', notes: 'Additional storage fee for hazmat-classified items' },
        ],
      },
    ],
    
    storageIncentives: [],
    
    storageIncentiveNotes: [
      'General scope of services — rates apply to all K2J projects and ongoing storage',
      'Hazmat handling available — see separate Hazmat Rates section for applicable surcharges',
      'Gaylord build and de-cartonize services available on a per-project basis',
      'All pallets tracked by WMS with location and lot visibility',
      'Volume-based pricing available for 100+ pallet commitments — contact for details',
    ],
    
    contractTerms: {
      term: '12-month agreement effective upon signing. Auto-renews annually unless terminated.',
      termination: 'Either party may terminate with 30-days written notice after initial 12-month term.',
      payment: 'New Account Setup Fee ($1,500.00) due upon acceptance. All other invoicing Net 30 days.',
      rateIncreases: 'Rates fixed for initial 12-month term. Annual adjustment up to 5% based on CPI thereafter.',
      liability: 'Standard warehouse liability applies. $50/carton max.',
      nonCompete: 'N/A.',
    },
    
    serviceFees: {
      monthlyMinimum: '$500.00/month minimum storage (difference invoiced if not met through storage charges).',
      setupFee: '$1,500.00 new account setup fee due upon acceptance.',
      insurance: 'Customer responsible for goods insurance.',
      claims: 'Must be filed within 14 days of delivery/loss.',
    },
    
    standardIntegrations: ['Email Notifications', 'POD Documentation', 'Inventory Reporting', 'WMS Portal Access'],
    customIntegrationFee: 0,
    integrationFeeWaived: true,
    
    benefits: [
      'Philadelphia Location',
      'Preferred Rates',
      '12-Month Partnership',
      '$500/mo Min Storage',
    ],
    
    assumptions: [
      'General scope of services covering all K2J warehousing and logistics needs',
      'Rates apply to all current and future K2J projects during agreement term',
      'Hazmat products accepted — Class 9 and other classifications per DOT/IATA requirements',
      'Pallet height up to 72" for standard storage rates',
      'Gaylord build and de-cartonize services available per project as needed',
      'New Account Setup Fee ($1,500.00) due upon acceptance — covers onboarding, WMS setup, and account configuration',
      '$500.00/month minimum storage applies',
      'Standard business hours: Monday-Friday, 8:00 AM - 5:00 PM EST',
      'Pricing valid for 30 days from proposal date',
    ],
    
    // K2J General Scope proposal sections
    storageDescription: 'Storage is billed per pallet position per month. All pallets are stored in secure racking with full WMS tracking by location and lot. Rates apply to all K2J projects under this agreement.',
    storageNote: '$500.00/month minimum storage applies.',
    inboundType: 'palletized',
    inboundDescription: [
      'Receive palletized shipments at dock.',
      'Verify pallet count and visible condition on arrival.',
      'Check-in and stage product for put-away or processing.',
      'Apply pallet and location labels for WMS tracking.',
    ],
    inboundNote: 'Efficient palletized receiving with same-day check-in for all K2J projects.',
    deliverables: [
      'Real-time inventory visibility via client portal for all products',
      'Delivery confirmation and POD documentation for each outbound shipment',
      'Inventory reporting by SKU, location, and pallet count',
      'Monthly activity and billing summary',
    ],
    clientResponsibilities: [
      'Provide advance notice of inbound pallet shipments (48 hours minimum)',
      'Confirm outbound delivery destinations and scheduling',
      'Specify de-cartonize / gaylord build requirements per project if applicable',
      'Arrange carrier for outbound shipments (or use Peach delivery service)',
    ],
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },

  // K2J Gifts 4 - Volume Commitment with Drayage (NY/NJ Port)
  'k2j-gifts-4': {
    slug: 'k2j-gifts-4',
    template: 'teal-diamond',
    name: 'K2J Gifts',
    fullName: 'K2J Marketing Partners',
    website: 'https://www.k2jgifts.com/',
    tagline: 'Casino Gifting Solutions',
    business: 'Casino Promotional Products / Gift Distribution',
    
    primaryColor: 'oklch(0.65 0.15 195)',
    primaryColorHex: '#00ACC1',
    accentColor: '#F05A4D',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    term: '12-Month Agreement',
    termMonths: 12,
    proposalDate: 'March 13th, 2026',
    monthlyMinimum: 875,
    slaTime: '48 hours from receipt',
    slaAccuracy: '99.5%',
    
    facilities: ['PA-2101 (Philadelphia, PA)'],
    
    pricing: [
      {
        location: 'Volume Commitment — 50 Pallet Minimum',
        code: 'VOL-50',
        address: '2101 Hornig Road, Philadelphia, PA',
        monthlyMinimum: '50 pallet minimum ($875.00/month storage commitment). Minimum monthly storage effective after first activity.',
        inbound: [
          { service: 'New Account Setup Fee', rate: '$1,500.00/one-time', notes: 'Due upon acceptance. Covers account creation, space allocation, and admin setup.' },
          { service: 'Inbound Receiving (Palletized)', rate: '$11.30/pallet', notes: 'Appointment scheduling, count verification, staging for storage' },
          { service: 'Pallet Handling In', rate: '$9.65/pallet', notes: 'Put-away to storage location with WMS scan' },
        ],
        transport: [
          { service: 'Drayage — Port of NY/NJ to PA-2101', rate: '$1,000.00/container', notes: 'Full container drayage from Port Newark / Elizabeth to Philadelphia warehouse. Available upon request.' },
          { service: 'Drayage — Packer Terminal (Philadelphia) to PA-2101', rate: '$600.00/container', notes: 'Full container drayage from Packer Avenue Marine Terminal to Philadelphia warehouse. Available upon request.' },
          { service: 'Chassis Usage', rate: '$40.00/day', notes: 'Per-day chassis rental from port pickup through return' },
        ],
        storage: [
          { service: 'Pallet Storage (Standard)', rate: '$17.50/pallet/month', notes: '50 pallet monthly minimum. Standard pallets up to 72" high (double-stacked). Billed on arrival, then 1st of each month. 65% rate if arriving after 15th. Minimum monthly storage effective after first activity.' },
        ],
        fulfillment: [
          { service: 'Outbound Handling (Pallet)', rate: '$18.00/pallet', notes: 'Pull from storage, stage at dock for carrier pickup or delivery' },
          { service: 'De-cartonize (Remove Master Cartons)', rate: '$0.25/unit', notes: 'Remove outer/master cartons from inbound pallets' },
          { service: 'Gaylord Build', rate: '$12.50/gaylord', notes: 'Count/confirm units, build gaylords per specification' },
          { service: 'Internal Labeling', rate: '$0.25/label', notes: 'SKU / unit count / lot or date code as needed' },
        ],
        valueAdded: [
          { service: 'Gaylord Supply', rate: '$20.75/gaylord', notes: 'Or client-supplied at no charge' },
          { service: 'Gaylord Securing', rate: '$5.40/gaylord', notes: 'Banding/strapping, corner protection, top cap, stretch-wrap' },
          { service: 'BOL Preparation', rate: '$5.00/shipment', notes: 'Bill of Lading preparation for each outbound shipment' },
          { service: 'Photos / Condition Report', rate: '$5.00/pallet', notes: 'Inbound condition documentation with photos' },
          { service: 'Pallet Restacking / Rewrap', rate: 'As needed', notes: 'Supplies billed back at cost + 10%' },
        ],
        rush: [
          { service: 'Rush Processing (Same Day)', rate: '+25% surcharge', notes: 'Subject to availability' },
        ],
        labor: [
          { service: 'Labor (General)', rate: '$33.00/hour' },
        ],
        delivery: [
          { service: 'FTL Delivery — Parx Casino', rate: '$350.00 + FSC', notes: 'Full truckload delivery to Parx Casino. Fuel surcharge (FSC) applied at current rate per table below.' },
          { service: 'LTL Delivery — Parx Casino', rate: '$100.00 + FSC', notes: 'Less-than-truckload delivery to Parx Casino. Fuel surcharge (FSC) at applicable rate.' },
        ],
        fsc: [
          { service: 'Base Fuel Price', rate: '$3.00/gallon', notes: 'FSC pegged at $3.00/gallon. 1% surcharge per $0.10 above base.' },
          { service: '$3.00', rate: '0% | $0.00 | $350.00', notes: 'No surcharge' },
          { service: '$3.10', rate: '1% | $3.50 | $353.50' },
          { service: '$3.20', rate: '2% | $7.00 | $357.00' },
          { service: '$3.30', rate: '3% | $10.50 | $360.50' },
          { service: '$3.40', rate: '4% | $14.00 | $364.00' },
          { service: '$3.50', rate: '5% | $17.50 | $367.50' },
          { service: '$3.60', rate: '6% | $21.00 | $371.00' },
          { service: '$3.70', rate: '7% | $24.50 | $374.50' },
          { service: '$3.80', rate: '8% | $28.00 | $378.00' },
          { service: '$3.90', rate: '9% | $31.50 | $381.50' },
          { service: '$4.00', rate: '10% | $35.00 | $385.00' },
          { service: '$4.10', rate: '11% | $38.50 | $388.50' },
          { service: '$4.20', rate: '12% | $42.00 | $392.00' },
          { service: '$4.30', rate: '13% | $45.50 | $395.50' },
          { service: '$4.40', rate: '14% | $49.00 | $399.00' },
          { service: '$4.50', rate: '15% | $52.50 | $402.50' },
          { service: '$4.60', rate: '16% | $56.00 | $406.00' },
          { service: '$4.70', rate: '17% | $59.50 | $409.50' },
          { service: '$4.80', rate: '18% | $63.00 | $413.00' },
          { service: '$4.90', rate: '19% | $66.50 | $416.50' },
          { service: '$5.00', rate: '20% | $70.00 | $420.00' },
          { service: '$5.10', rate: '21% | $73.50 | $423.50' },
          { service: '$5.20', rate: '22% | $77.00 | $427.00' },
          { service: '$5.30', rate: '23% | $80.50 | $430.50' },
          { service: '$5.40', rate: '24% | $84.00 | $434.00' },
          { service: '$5.50', rate: '25% | $87.50 | $437.50' },
          { service: '$5.60', rate: '26% | $91.00 | $441.00' },
          { service: '$5.70', rate: '27% | $94.50 | $444.50' },
          { service: '$5.80', rate: '28% | $98.00 | $448.00' },
          { service: '$5.90', rate: '29% | $101.50 | $451.50' },
          { service: '$6.00', rate: '30% | $105.00 | $455.00' },
        ],
        hazmat: [
          { service: 'Hazmat Documentation & BOL', rate: '$10.00/shipment', notes: 'Includes BOL, Class 9 labeling, and required shipping paperwork' },
          { service: 'Hazmat Placards (Pallet)', rate: '$3.50/pallet', notes: '2 placards per pallet outbound' },
          { service: 'Hazmat Placards (Trailer)', rate: '$6.50/shipment', notes: '2 placards per trailer' },
          { service: 'Hazmat Surcharge (Storage)', rate: '$7.00/pallet/month', notes: 'Additional storage fee for hazmat-classified items' },
        ],
      },
    ],
    
    storageIncentives: [],
    
    storageIncentiveNotes: [
      '50 pallet monthly minimum commitment — volume pricing applied',
      'Minimum monthly storage effective after first activity',
      'Parx Casino truckload delivery at $350.00 + FSC',
      'Includes full-service drayage from Port of NY/NJ (Port Newark / Elizabeth Marine Terminal)',
      'Chassis rental billed per day from port pickup through chassis return',
      'Double-stacked pallets accepted at standard storage rate',
      'Hazmat handling available — see separate Hazmat Rates section for applicable surcharges',
      'All pallets tracked by WMS with location and lot visibility',
    ],
    
    contractTerms: {
      term: '12-month agreement effective upon signing. Auto-renews annually unless terminated.',
      termination: 'Either party may terminate with 30-days written notice after initial 12-month term.',
      payment: 'Net 30 days. All invoicing monthly in arrears.',
      rateIncreases: 'Rates fixed for initial 12-month term. Annual adjustment up to 5% based on CPI thereafter.',
      liability: 'Standard warehouse liability applies. $50/carton max.',
      nonCompete: 'N/A.',
    },
    
    serviceFees: {
      monthlyMinimum: '$875.00/month minimum storage (50 pallets × $17.50). Minimum effective after first activity. Difference invoiced if not met through storage charges.',
      setupFee: '$1,500.00 new account setup fee due upon acceptance — covers account creation, space allocation, and admin setup.',
      insurance: 'Customer responsible for goods insurance.',
      claims: 'Must be filed within 14 days of delivery/loss.',
    },
    
    standardIntegrations: ['Email Notifications', 'POD Documentation', 'Inventory Reporting', 'WMS Portal Access'],
    customIntegrationFee: 0,
    integrationFeeWaived: true,
    
    benefits: [
      '50 Pallet Volume Rate',
      'Parx Casino Delivery',
      'NY/NJ Port Drayage',
      '$17.50/Pallet Storage',
    ],
    
    assumptions: [
      '50 pallet monthly minimum commitment at $17.50/pallet/month — minimum effective after first activity',
      'Parx Casino truckload delivery at $350.00 + FSC (fuel surcharge pegged at $3.00/gallon base)',
      'Drayage from Port of NY/NJ (Port Newark / Elizabeth Marine Terminal) to PA-2101 at $1,000/container',
      'Chassis billed per day from port pickup through return',
      'Double-stacked pallets accepted — standard storage rate applies',
      'Rates apply to all current and future K2J projects during agreement term',
      'Hazmat products accepted — Class 9 and other classifications per DOT/IATA requirements',
      'Pallet height up to 72" for standard storage rates',
      'Gaylord build and de-cartonize services available per project as needed',
      'New Account Setup Fee ($1,500.00) due upon acceptance — covers account creation, space allocation, and admin setup',
      'Minimum monthly storage effective after first activity',
      'Standard business hours: Monday-Friday, 8:00 AM - 5:00 PM EST',
      'Pricing valid for 30 days from proposal date',
    ],
    
    storageDescription: 'Storage is billed per pallet position per month at the volume commitment rate of $17.50/pallet. 50 pallet monthly minimum applies after first activity. All pallets are stored securely with full WMS tracking by location and lot. Double-stacked pallets accepted at standard rate.',
    storageNote: '50 pallet monthly minimum ($875.00/month), effective after first activity. If actual pallet count falls below 50, the $875.00 minimum still applies.',
    inboundType: 'palletized',
    inboundDescription: [
      'Receive palletized shipments at dock (or via Peach drayage from Port of NY/NJ).',
      'Verify pallet count and visible condition on arrival.',
      'Check-in and stage product for put-away or processing.',
      'Apply pallet and location labels for WMS tracking.',
    ],
    inboundNote: 'Full-service drayage available from Port of NY/NJ at $1,000/container + chassis.',
    deliverables: [
      'Real-time inventory visibility via client portal for all products',
      'Delivery confirmation and POD documentation for each outbound shipment',
      'Inventory reporting by SKU, location, and pallet count',
      'Monthly activity and billing summary',
      'Drayage tracking with chassis day count per container',
    ],
    clientResponsibilities: [
      'Provide advance notice of inbound pallet shipments (48 hours minimum)',
      'Provide container release information for NY/NJ port drayage pickups',
      'Confirm outbound delivery destinations and scheduling',
      'Specify de-cartonize / gaylord build requirements per project if applicable',
      'Arrange carrier for outbound shipments (or use Peach delivery service)',
    ],
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },

  // Best Vision Marketing - Honeywell Consumer Products (Pallet-In/Pallet-Out)
  'best-vision': {
    slug: 'best-vision',
    template: 'teal-diamond',
    name: 'Best Vision Marketing',
    fullName: 'Best Vision Marketing LLC',
    contactEmail: 'electronicexplosion007@gmail.com',
    website: 'https://www.bestvisionmarketing.com/',
    tagline: 'Complete fulfillment services for special markets.',
    business: 'Full-service special markets stocking distributor specializing in pick-pack operations, warehouse management, custom packaging, and product personalization. Serving clients in casino loyalty, health and wellness, consumer loyalty, corporate gifts, and employee engagement.',
    
    primaryColor: 'oklch(0.55 0.12 250)',
    primaryColorHex: '#1565C0',
    accentColor: '#E65100',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    term: 'Month-to-Month Agreement (48-Hour Acceptance Window)',
    termMonths: 0,
    proposalDate: 'February 23rd, 2026',
    monthlyMinimum: 0,
    slaTime: '48 hours from receipt',
    slaAccuracy: '99.5%',
    
    facilities: ['PA-2101 (Philadelphia, PA)'],
    
    pricing: [
      {
        location: 'Standard Pallet Storage',
        code: 'PALLET-STD',
        address: '2101 Hornig Road, Philadelphia, PA',
        monthlyMinimum: 'No monthly minimum',
        inbound: [
          { service: 'Inbound Receiving (Palletized)', rate: '$8.00/pallet', notes: 'Live unload at dock, verify pallet count and condition, stage for storage' },
          { service: 'Pallet Handling In', rate: '$6.00/pallet', notes: 'Put-away to racking location with WMS scan' },
        ],
        storage: [
          { service: 'Pallet Storage (Standard)', rate: '$12.50/pallet/month', notes: '50% Discount Applied. Standard 48×40" pallets up to 36" high. Billed on arrival, then 1st of each month. 65% rate if arriving after 15th.' },
        ],
        fulfillment: [
          { service: 'Outbound Handling (Pallet)', rate: '$8.00/pallet', notes: 'Pull from racking, stage at dock for carrier pickup or delivery' },
        ],
        valueAdded: [
          { service: 'BOL Preparation', rate: '$5.00/shipment', notes: 'Bill of Lading preparation for each outbound shipment' },
          { service: 'Pallet Restacking / Rewrap', rate: '$12.00/pallet', notes: 'If pallets need restacking or re-wrapping before outbound' },
          { service: 'Photos / Condition Report', rate: '$5.00/pallet', notes: 'Inbound condition documentation with photos' },
        ],
        rush: [
          { service: 'Rush Processing (Same Day)', rate: '+25% surcharge', notes: 'Subject to availability' },
        ],
        labor: [
          { service: 'Labor (General)', rate: '$35.00/hour' },
        ],
        delivery: [
          { service: 'Local Delivery (Philadelphia Metro)', rate: '$150.00/delivery', notes: 'Full truckload within 25-mile radius - includes POD' },
          { service: 'Single Pallet Delivery', rate: '$85.00/pallet', notes: 'Within 25-mile radius - includes POD' },
        ],
      },
    ],
    
    storageIncentives: [],
    
    storageIncentiveNotes: [
      'Standard 48×40" pallets, product height up to 36"',
      'Honeywell consumer products — no hazmat, no special handling required',
      'Live unload at receiving dock',
      'All pallets tracked by WMS with location and lot visibility',
    ],
    
    contractTerms: {
      term: 'Month-to-month agreement, valid for 48 hours from date of proposal. No long-term commitment required.',
      termination: 'Either party may terminate with 15-days written notice.',
      payment: 'Net 15 days. Invoice on the 1st of each month.',
      rateIncreases: 'Rates fixed for first 6 months. Annual adjustment up to 5% based on CPI thereafter.',
      liability: 'Standard warehouse liability applies. $50/carton max.',
      nonCompete: 'N/A.',
    },
    
    serviceFees: {
      monthlyMinimum: 'No monthly minimum — billed on actual pallet count.',
      setupFee: 'Waived.',
      insurance: 'Customer responsible for goods insurance.',
      claims: 'Must be filed within 14 days of delivery/loss.',
    },
    
    standardIntegrations: ['Email Notifications', 'POD Documentation', 'Inventory Reporting'],
    customIntegrationFee: 0,
    integrationFeeWaived: true,
    
    benefits: [
      'Philadelphia Location',
      'No Monthly Minimum',
      'Simple Pallet-In/Out',
      'Competitive Rates',
    ],
    
    assumptions: [
      'Inbound: 54 pallets of Honeywell consumer products',
      'Pallet dimensions: 48" × 40" × 36" (short pallets)',
      'Weight: 180.22 lbs per pallet (12 units per pallet)',
      'Total units: 650 (53 pallets × 12 units + 1 pallet × 2 units)',
      'Last pallet is a partial with only 2 units',
      'No hazmat — standard consumer electronics',
      'Pallet-in/pallet-out only — no repack, no pick-and-pack',
      'Live unload at Philadelphia warehouse',
      'Standard business hours: Monday-Friday, 8:00 AM - 5:00 PM EST',
      'Pricing valid for 48 hours from proposal date',
    ],
    
    // Best Vision-specific proposal sections
    storageDescription: 'Storage is billed per pallet position per month. All pallets are stored in secure racking with full WMS tracking by location. Standard 48×40" short pallets up to 36" high qualify for the discounted storage rate of $12.50/pallet/month (50% off standard rate).',
    storageNote: 'No long-term commitment required. Month-to-month billing based on actual inventory. This proposal must be accepted within 48 hours of issue date.',
    inboundType: 'palletized',
    inboundDescription: [
      'Receive palletized shipments via live unload at dock.',
      'Verify pallet count and visible condition on arrival.',
      'Check-in and stage product for put-away.',
      'Apply pallet and location labels for WMS tracking.',
    ],
    inboundNote: 'Live unload — driver waits while pallets are offloaded at dock.',
    deliverables: [
      'Real-time inventory visibility with pallet-level tracking',
      'Delivery confirmation and POD documentation for each outbound shipment',
      'Monthly inventory summary report',
    ],
    clientResponsibilities: [
      'Provide advance notice of inbound shipments (24 hours minimum)',
      'Confirm outbound delivery destinations and scheduling',
      'Arrange carrier for outbound shipments (or use Peach delivery service)',
    ],
    
    expired: true,
    expiredDate: 'February 25th, 2026',
    expiredMessage: 'This proposal has expired. The 48-hour acceptance window has closed. If you are still interested in warehousing services, please contact us to request an updated quote.',
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },

  // Flybar Inc. - Tractor Supply Program (SC-144)
  'flybar': {
    slug: 'flybar',
    template: 'teal-diamond',
    name: 'Flybar',
    fullName: 'Flybar Inc.',
    website: 'https://www.flybar.com/',
    tagline: 'Tractor Supply Program',
    business: 'Consumer Products / Outdoor Recreation',
    
    primaryColor: 'oklch(0.55 0.15 250)',
    primaryColorHex: '#1565C0',
    accentColor: '#FF6F00',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    term: 'Month-to-Month Agreement',
    termMonths: 0,
    proposalDate: 'February 23rd, 2026',
    monthlyMinimum: 0,
    slaTime: '48 hours from receipt',
    slaAccuracy: '99.5%',
    
    facilities: ['SC-144 (Orangeburg, SC)'],
    
    pricing: [
      {
        location: 'Pallet Processing — Tractor Supply Program',
        code: 'SC-144',
        address: '144 Old Elloree Road, Orangeburg, SC 29115',
        monthlyMinimum: 'No monthly minimum — project-based billing',
        inbound: [
          { service: 'Clean Pick', rate: '$0.82/case', notes: 'Container pallets built to outbound specs by lumpers. Verify, pick, label, stage, and load.' },
          { service: 'Rework Pick', rate: '$2.00/case', notes: 'Container pallets NOT built to outbound specs. Break down, sort by PO/SKU, rebuild to final configuration, rewrap, label, stage, and load.' },
        ],
        storage: [],
        fulfillment: [
          { service: 'BOL / Order Processing', rate: '$15.00/shipment', notes: 'Bill of Lading preparation and order processing for each outbound FTL shipment' },
        ],
        valueAdded: [
          { service: 'Out-of-Scope Labor', rate: '$35.00/hour', notes: 'Any handling, special projects, or non-standard work outside the scope defined above' },
        ],
        rush: [],
        labor: [],
        delivery: [],
      },
    ],
    
    storageIncentives: [],
    
    storageIncentiveNotes: [
      'Pricing is based on per-case pick rates of $0.82 (clean pick) and $2.00 (rework pick)',
      'Estimated pallet cost assumes a 50/50 mix of clean and rework pallets',
      'Average pallet density assumed at ~10 cases per pallet',
      'Resulting estimated handling cost: $14.10 per pallet (blended)',
      'Flybar provides pallets — Peach Warehouse can procure pallets if required and pass through at cost',
    ],
    
    contractTerms: {
      term: 'Month-to-month agreement. Activity-based billing only.',
      termination: 'Either party may terminate with 7-days written notice.',
      payment: 'Net 30 days.',
      rateIncreases: 'Rates fixed for project duration.',
      liability: 'Standard warehouse liability applies.',
      nonCompete: 'N/A for project-based work.',
    },
    
    serviceFees: {
      monthlyMinimum: 'No monthly minimum — activity-based billing only.',
      setupFee: 'Waived.',
      insurance: 'Customer responsible for goods insurance.',
      claims: 'Must be filed within 7 days of delivery.',
    },
    
    standardIntegrations: ['Email Notifications', 'POD Documentation', 'Inventory Reporting'],
    customIntegrationFee: 0,
    integrationFeeWaived: true,
    
    benefits: [
      'SC-144 Facility',
      'Project-Based Pricing',
      'Fast Turnaround',
      '$14.10/Pallet Blended',
    ],
    
    assumptions: [
      'Pricing is based on per-case handling rates of $0.82 (clean pick) and $2.00 (rework pick)',
      'Estimated pallet cost assumes a 50/50 mix of clean and rework pallets',
      'Average pallet density assumed at ~10 cases per pallet',
      'Resulting estimated handling cost: $14.10 per pallet (blended)',
      'Flybar provides pallets — Peach Warehouse can procure pallets if required and pass through at cost',
      'Inbound pallets may require reconditioning to meet outbound stability and retail requirements (Rework)',
      'Limited SKU count per inbound container (typically 1–4 SKUs)',
      'Outbound shipments are primarily full truckload (FTL), ~30 pallets per shipment',
      'Standard business hours shipping',
      'Project designed for high-velocity flow (≤45-day turn)',
      'Estimated volume: ~22,000 units across 4 SKUs',
    ],
    
    heroTitle: 'Tractor Supply\nProgram',
    heroSubtitle: 'Pallet verification, case-level reconfiguration, labeling, staging, and outbound distribution to Tractor Supply — operated from our SC-144 facility in Orangeburg, SC.',
    
    storageDescription: 'This is a project-based flow-through operation. Product is received, processed, and shipped within 45 days. No long-term storage is required.',
    storageNote: 'No storage charges apply — product flows through the facility on a project basis.',
    inboundType: 'palletized',
    inboundDescription: [
      'Receive container shipments at dock.',
      'Verify pallet count, SKU, and carton count on arrival.',
      'Classify each pallet as Clean (built to outbound specs) or Rework (requires reconfiguration).',
      'Stage for processing based on classification.',
    ],
    inboundNote: 'Clean pallets require ~8 minutes of handling. Rework pallets require ~28 minutes including breakdown, sort, rebuild, and relabel. Estimating 50/50 mix.',
    deliverables: [
      'SKU and carton-level verification for every inbound pallet',
      'Pallet rebuild to final PO/store configuration where required',
      'Packing slip and shipping label application per Tractor Supply requirements',
      'BOL preparation and FTL load-out coordination',
      'Project completion summary with unit counts and handling breakdown',
    ],
    clientResponsibilities: [
      'Provide advance notice of inbound container shipments (48 hours minimum)',
      'Confirm Tractor Supply PO structure, label format, and routing instructions',
      'Provide pallets or approve Peach procurement at pass-through cost',
      'Confirm what constitutes a ship-ready pallet vs. one requiring reconfiguration',
    ],
    
    pdfFilename: 'Peach Warehouse - Flybar Inc. Tractor Supply Program Proposal',
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },

  // Flavours Premium Martini's - Ready-to-Drink Cocktails (Philadelphia, PA)
  'flavours-martinis': {
    slug: 'flavours-martinis',
    template: 'teal-diamond',
    name: "Flavours Premium Martini's",
    fullName: "Flavours Premium Martini's",
    contactEmail: 'ccarter@drink-flavours.com',
    website: 'https://drink-flavours.com/',
    tagline: 'An Unrestricted Happy Hour — Anywhere, Anytime, Anyplace',
    business: 'Ready-to-Drink Premium Cocktails / RTD Beverages',
    
    primaryColor: 'oklch(0.65 0.15 195)',
    primaryColorHex: '#00ACC1',
    accentColor: '#C8A951',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    term: '12-Month Agreement',
    termMonths: 12,
    proposalDate: 'February 26th, 2026',
    monthlyMinimum: 250,
    slaTime: '14:00 EST',
    slaAccuracy: '99%',
    
    facilities: ['PA-2101 (Philadelphia, PA)'],
    
    pricing: [
      {
        location: 'Philadelphia, PA',
        code: 'PA-2101',
        address: '2101 Hornig Road, Philadelphia, PA 19116',
        monthlyMinimum: '$250.00/month minimum storage',
        inbound: [
          { service: 'Account Setup Fee', rate: '$500.00', notes: 'One-time fee' },
          { service: 'Transport (ABT → Peach)', rate: '$125.00/pallet', notes: 'Per pallet from ABT to Peach Warehouse' },
          { service: 'Pallet Handling In', rate: '$10.00/pallet', notes: 'Unload, verify count, check-in, stage' },
          { service: 'Case Receiving (Inbound)', rate: 'Per case', notes: 'Based on volume and profile' },
          { service: 'Pallet Label', rate: '$0.50/pallet', notes: 'WMS barcode label per pallet' },
          { service: 'Pallet Supply Fee', rate: '$10.00/pallet', notes: 'If pallet exchange required' },
          { service: 'Shrink Wrap', rate: '$4.00/pallet', notes: 'If re-wrap required' },
        ],
        storage: [
          { service: 'Standard Pallet Storage (48×40)', rate: '$20.00/pallet/mo', notes: 'Subject to $250/mo minimum. FIFO / lot control available.' },
          { service: 'Handling Out', rate: '$10.00/pallet', notes: 'Retrieval, staging, and load-out' },
        ],
        fulfillment: [
          { service: 'Order Processing', rate: '$3.25/order', notes: 'Pick, pack, and ship per order' },
          { service: 'Case Pick', rate: '$0.60/case', notes: 'Per case picked' },
          { service: 'Additional Item Pick', rate: '$0.60/item', notes: 'Each additional item beyond first pick' },
          { service: 'Variety Pack Build (2 SKU)', rate: '$1.20–$2.75/pack', notes: 'Per variety pack — rate depends on configuration and volume' },
          { service: 'Pallet Outbound (Shipping)', rate: 'Per pallet or per order', notes: 'Staging, loading, and ship-out' },
          { service: 'Order Cancellation', rate: '$2.00/order', notes: 'Orders cancelled after processing begins' },
          { service: 'Order Intervention / Change', rate: '$2.00/instance', notes: 'Modifications after order is released' },
          { service: 'Heavy Item (40+ lbs)', rate: '$5.00/item', notes: 'Team lift / OSHA requirement' },
        ],
        valueAdded: [
          { service: 'Labeling / Relabeling', rate: 'Per label', notes: 'Compliance labels, retail-ready, UPC' },
          { service: 'Kitting / Bundling', rate: 'Per unit', notes: 'Multi-pack builds, promo packs, variety packs' },
          { service: 'Inventory Management (WMS)', rate: 'Included', notes: 'Real-time inventory visibility' },
          { service: 'Container Devanning / Floor Unloads', rate: 'Per container', notes: 'If applicable for future imports' },
          { service: 'Returns Processing', rate: '$2.50/return', notes: 'Inspect, restock, or dispose' },
          { service: 'Quality Inspection', rate: 'Hourly rate', notes: 'Detailed product inspection if needed' },
        ],
        rush: [
          { service: 'Rush Fee (Same Day)', rate: '$2.00/item', notes: 'Outside SLA, 9 item minimum' },
          { service: 'Saturday Fulfillment', rate: '20% surcharge', notes: 'OT coverage if needed' },
          { service: 'Rework / Special Projects', rate: 'Hourly or per-unit', notes: 'Labeling, repacking, kitting projects' },
        ],
        labor: [
          { service: 'General Labor', rate: '$40.00/hour' },
          { service: 'Manual Order Entry', rate: '$2.00/order', notes: 'Non-integrated order processing' },
        ],
      },
    ],
    
    storageIncentives: [],
    
    storageIncentiveNotes: [
      'Initial run: 4 full pallets (2 pallets per SKU, 2 SKUs)',
      'Standard 48×40 pallet footprint',
      'FIFO and lot control available at no additional charge',
      'Pricing customizable as volume scales',
      'Alcohol/beverage handling experience — compliance-aware operations',
    ],
    
    contractTerms: {
      term: '12-month initial agreement. Renewable annually.',
      termination: '60-days written notice required.',
      payment: 'Net 30 days. Monthly billing on the 1st.',
      rateIncreases: 'Annual adjustment up to 5% based on CPI.',
      liability: 'Standard warehouse liability applies. $50/carton max.',
      nonCompete: 'Standard non-compete terms apply.',
    },
    
    serviceFees: {
      monthlyMinimum: '$250.00/month minimum storage (difference invoiced if not met).',
      setupFee: '$500.00 one-time account setup fee.',
      insurance: 'Customer responsible for goods insurance.',
      claims: 'Must be filed within 30 days of delivery/loss.',
    },
    
    standardIntegrations: ['WMS Portal', 'Inventory Reporting', 'Order Management'],
    customIntegrationFee: 0,
    integrationFeeWaived: true,
    
    benefits: [
      'Philadelphia Location',
      'Beverage Expertise',
      'DTC + Wholesale',
      'Scalable Growth',
    ],
    
    assumptions: [
      'Initial run: 4 full pallets (2 pallets per SKU, 2 SKUs)',
      'Standard 48×40 pallet footprint',
      'Product: Ready-to-drink premium cocktails (RTD)',
      'Variety pack fulfillment at $1.20–$2.75 per pack depending on configuration',
      'Fulfillment fees billed separately based on activity (case pick, pallet in/out, rework)',
      'Transport from ABT to Peach at $125.00 per pallet',
      'FIFO / lot control available if needed',
      'Pricing can be customized based on volume and order profile as Flavours scales',
      'Standard business hours: Monday–Friday, 8:00 AM – 5:00 PM EST',
      'Pricing valid for 30 days from proposal date',
    ],
    
    storageDescription: 'Standard palletized storage on 48×40 pallet footprint with monthly billing subject to $250/month minimum. FIFO and lot control available.',
    storageNote: 'Scalable storage — rates adjust as volume grows.',
    inboundType: 'palletized',
    inboundDescription: [
      'Receive palletized shipments at dock or via ABT transfer.',
      'Verify pallet count and visible condition on arrival.',
      'Check-in and stage product in temperature-appropriate area.',
      'Apply pallet and location labels for WMS tracking.',
    ],
    inboundNote: 'Beverage-experienced receiving team. Compliance-aware operations for alcohol products.',
    deliverables: [
      'Real-time inventory visibility via WMS portal',
      'Order fulfillment — DTC and wholesale channels',
      'Variety pack builds (multi-SKU kitting)',
      'Labeling and compliance preparation',
      'Freight coordination for inbound and outbound',
      'Monthly inventory and activity reporting',
    ],
    clientResponsibilities: [
      'Provide advance notice of inbound shipments (48 hours minimum)',
      'Confirm variety pack build specifications and SKU configurations',
      'Provide labeling requirements and compliance specs',
      'Coordinate ABT transfer schedule with Peach team',
    ],
    
    pdfFilename: 'Peach Warehouse - Flavours Premium Martinis Proposal',
    
    heroTitle: "Flavours\nPremium Martini's",
    heroSubtitle: 'Warehousing, fulfillment, and variety pack kitting for premium ready-to-drink cocktails — operated from our PA-2101 facility in Philadelphia, PA.',
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },

  // Aminex, Inc. — Pharmaceutical Storage (Tier 1 Only, via Regfluent)
  '416773540671': {
    slug: '416773540671',
    template: 'teal-diamond',
    name: 'Aminex, Inc.',
    fullName: 'Aminex, Inc.',
    website: 'https://aminexinc.com/',
    tagline: 'cGMP-Compliant Pharmaceutical Storage Solutions',
    business: 'Pharmaceutical Oncology / API & Finished Product Storage',
    
    primaryColor: 'oklch(0.55 0.15 260)',
    primaryColorHex: '#5C6BC0',
    accentColor: '#00897B',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    term: '12-Month Agreement',
    termMonths: 12,
    proposalDate: 'March 10th, 2026',
    monthlyMinimum: 1000,
    slaTime: '48 hours from receipt',
    slaAccuracy: '99.5%',
    
    facilities: ['PA-2101 (Philadelphia, PA)'],
    
    pricing: [
      {
        location: 'Tier 1: Under 10 Pallets',
        code: 'PHARMA-TIER1',
        address: '2101 Hornig Road, Philadelphia, PA',
        monthlyMinimum: '$1,000.00/month compliance & storage minimum',
        inbound: [
          { service: 'Account Setup Fee', rate: '$2,500.00/one-time', notes: 'Due upon acceptance. Includes compliance onboarding, SOP development, system configuration, and outfitting of dedicated refrigerated storage space. Setup and outfitting commence upon receipt of fee.' },
          { service: 'Inbound Receiving (Palletized)', rate: '$18.00/pallet', notes: 'Appointment scheduling, count verification, lot/batch recording, staging' },
          { service: 'Inbound Receiving (Carton/Sub-Pallet)', rate: '$5.00/carton', notes: 'For sub-pallet quantities; includes inspection and check-in' },
        ],
        storage: [
          { service: 'USP Room Temp Storage (15-30°C)', rate: '$70.00/pallet/mo', notes: 'cGMP-compliant, continuously monitored, USP <659> validated environment' },
          { service: 'USP Room Temp Storage (Per Carton)', rate: '$15.00/carton/mo', notes: 'For sub-pallet quantities stored in validated room-temp zone' },
          { service: 'Refrigerated Storage (2-8°C)', rate: '$140.00/pallet/mo', notes: 'Cold chain validated, 24/7 monitoring with alarm system' },
          { service: 'Refrigerated Storage (Per Carton)', rate: '$30.00/carton/mo', notes: 'For sub-pallet quantities in refrigerated zone' },
          { service: 'Monthly Compliance Minimum', rate: '$1,000.00/month', notes: 'Minimum monthly charge regardless of pallet count — covers compliance zone maintenance, documentation, and monitoring' },
        ],
        fulfillment: [
          { service: 'Outbound Handling (Pallet)', rate: '$18.00/pallet', notes: 'Staging, documentation, carrier coordination' },
          { service: 'Outbound Handling (Carton)', rate: '$5.00/carton', notes: 'Pick, verify lot/batch, stage for shipment' },
          { service: 'COA/Lot Documentation per Shipment', rate: '$12.00/shipment', notes: 'Lot tracking, COA matching, shipment documentation' },
        ],
        valueAdded: [
          { service: 'Temperature Excursion Report', rate: '$50.00/report', notes: 'Investigation and documentation per FDA/cGMP requirements' },
          { service: 'Regulatory Audit Support', rate: '$75.00/hour', notes: 'On-site support during client or regulatory audits' },
          { service: 'Stability Sample Pull', rate: '$25.00/pull', notes: 'Per stability protocol sample retrieval and documentation' },
          { service: 'Custom Labeling / Relabeling', rate: '$1.50/label', notes: 'Per client specification' },
        ],
        rush: [
          { service: 'Rush Processing (Same Day)', rate: '+25% surcharge', notes: 'Subject to availability' },
        ],
        labor: [
          { service: 'Labor (General)', rate: '$45.00/hour' },
          { service: 'Quality Documentation', rate: '$55.00/hour', notes: 'SOP review, deviation reports, CAPA support' },
        ],
      },
    ],
    
    storageIncentives: [],
    
    storageIncentiveNotes: [
      'All storage zones are USP-validated and continuously temperature-monitored with 24/7 alarm systems',
      'Refrigerated (2-8°C) capacity requires 2-4 week lead time for outfitting and validation',
      'Monthly compliance minimum applies regardless of inventory volume to cover cGMP zone overhead',
      'All pricing subject to final validation upon receipt of product specification sheets and COA',
    ],
    
    contractTerms: {
      term: '12-month initial agreement effective upon signing. Renewable annually.',
      termination: '90-day written notice required after initial term.',
      payment: 'Net 30 days. Monthly billing on the 1st.',
      rateIncreases: 'Annual adjustment up to 5% based on CPI.',
      liability: 'Standard warehouse liability applies. Declared value coverage available.',
      nonCompete: 'Standard confidentiality and non-disclosure terms apply for pharmaceutical materials.',
    },
    
    serviceFees: {
      monthlyMinimum: '$1,000.00/month compliance minimum.',
      setupFee: '$2,500.00 one-time account setup fee due upon acceptance. Covers compliance onboarding, SOP development, system configuration, and outfitting of dedicated refrigerated storage space. Estimated onboarding timeline: 2-4 weeks from receipt of payment.',
      insurance: 'Customer responsible for goods insurance. Declared value coverage available upon request.',
      claims: 'Must be filed within 30 days of delivery/loss.',
    },
    
    standardIntegrations: ['WMS Portal', 'Lot/Batch Tracking', 'Temperature Monitoring Reports', 'Inventory Reporting', 'COA Document Management'],
    customIntegrationFee: 0,
    integrationFeeWaived: true,
    
    benefits: [
      'USP Room Temp Validated',
      'cGMP Certified Facility',
      'Cold Chain (2-8°C) Available',
      'Philadelphia Location',
    ],
    
    assumptions: [
      'Prepared on behalf of Regfluent LLC for Aminex, Inc.',
      'Product includes finished pharmaceutical products (AMXT-1501 Enteric Capsules, DFMO Capsules, AMXT 1501 Tablets) and Active Pharmaceutical Ingredient (Eflornithine HCl Monohydrate)',
      'Refrigerated storage at 2-8°C required for AMXT-1501 products — 2-4 week lead time to outfit and validate refrigerated space',
      'Ambient storage at 15-30°C (USP Controlled Room Temperature) for API materials',
      'Initial volume estimated at sub-pallet quantity; pricing structured per carton and per pallet',
      'Client to provide Product Specification Sheet, Certificate of Analysis (COA), and Safety Data Sheet (SDS) prior to onboarding',
      'Client to provide exact product dimensions and weights for final rate confirmation',
      'All materials must comply with applicable FDA, DEA, and state pharmacy board regulations',
      'Peach Warehouse facility is cGMP-certified and USP <659> temperature-validated',
      'Account setup fee ($2,500.00) due upon acceptance — triggers refrigerated space outfitting',
      'Estimated onboarding timeline: 2-4 weeks from receipt of signed agreement and setup fee',
      'Standard business hours: Monday-Friday, 8:00 AM - 5:00 PM EST',
      'Pricing valid for 30 days from proposal date',
    ],
    
    heroImage: 'https://files.manuscdn.com/user_upload_by_module/session_file/93927875/VEqQyoHQWRBXUeEI.jpg',
    heroTitle: 'Pharmaceutical\nStorage',
    heroSubtitle: 'A cGMP-compliant pharmaceutical storage proposal for Aminex, Inc. — FDA-registered, USP-validated, temperature-controlled warehousing in Philadelphia. Prepared on behalf of Regfluent LLC.',
    
    storageDescription: 'All pharmaceutical materials are stored in cGMP-compliant, USP-validated temperature zones with continuous 24/7 monitoring and alarm systems. Room temperature (15-30°C) and refrigerated (2-8°C) zones are available. Each zone maintains full audit trail documentation for regulatory compliance.',
    storageNote: 'Refrigerated capacity requires 2-4 week lead time for outfitting and validation. Final availability confirmed during onboarding.',
    inboundType: 'palletized',
    inboundDescription: [
      'Schedule receiving appointment with advance notice.',
      'Verify pallet/carton count and visible condition on arrival.',
      'Record lot numbers, batch numbers, and expiration dates.',
      'Match inbound shipment against COA and packing list.',
      'Stage product in appropriate temperature zone within 2 hours of receipt.',
    ],
    inboundNote: 'Specialization: cGMP pharmaceutical receiving with full lot traceability and COA verification.',
    deliverables: [
      'Real-time inventory visibility with lot/batch tracking via client portal',
      'Monthly temperature monitoring reports for all storage zones',
      'COA document management and matching for all inbound/outbound shipments',
      'Regulatory audit support documentation package on request',
      'Temperature excursion investigation reports (if applicable)',
    ],
    clientResponsibilities: [
      'Provide Product Specification Sheet for each product prior to onboarding',
      'Provide Certificate of Analysis (COA) for each inbound batch/lot',
      'Provide current Safety Data Sheet (SDS) for each product — SDS must include storage conditions, handling precautions, stability data, and hazard classification',
      'Maintain and update SDS documentation whenever product formulation, classification, or regulatory status changes',
      'Provide exact product dimensions and weights for storage planning',
      'Provide advance notice of inbound shipments (48 hours minimum)',
      'Maintain current regulatory status and notify Peach of any changes',
      'Maintain adequate product insurance for all materials stored at the facility',
    ],
    
    pdfFilename: 'Peach Warehouse - Aminex Inc Pharmaceutical Storage Proposal',
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },

  'robbie-dans': {
    slug: 'robbie-dans',
    template: 'teal-diamond',
    name: "Robbie Dan's",
    fullName: "Disco Beverage / Robbie Dan's",
    contactEmail: 'Rjcordisco@gmail.com',
    website: 'https://www.robbiedans.com',
    tagline: 'Original Bourbon Barrel Lemonade',
    business: 'Ready-to-Drink Canned Cocktails / RTD Beverages',
    
    primaryColor: 'oklch(0.65 0.15 85)',
    primaryColorHex: '#C8A020',
    accentColor: '#2E7D32',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    term: '12-Month Agreement',
    termMonths: 12,
    proposalDate: 'March 2nd, 2026',
    monthlyMinimum: 250,
    slaTime: '14:00 EST',
    slaAccuracy: '99%',
    
    facilities: ['PA-2101 (Philadelphia, PA)'],
    
    pricing: [
      {
        location: 'Philadelphia, PA',
        code: 'PA-2101',
        address: '2101 Hornig Road, Philadelphia, PA 19116',
        monthlyMinimum: '$250.00/month minimum storage',
        inbound: [
          { service: 'New Account Setup Fee', rate: '$500.00/one-time', notes: 'Due upon acceptance. Covers account onboarding, WMS configuration, and system setup.' },
          { service: 'Pallet Handling In', rate: '$11.00/pallet', notes: 'Unload, verify count, check-in, stage for storage' },
          { service: 'Case Receiving (Inbound)', rate: 'Per case', notes: 'Based on volume and profile' },
          { service: 'Pallet Label', rate: '$0.50/pallet', notes: 'WMS barcode label per pallet' },
          { service: 'Pallet Supply Fee', rate: '$10.00/pallet', notes: 'If pallet exchange required' },
          { service: 'Shrink Wrap', rate: '$4.00/pallet', notes: 'If re-wrap required' },
        ],
        storage: [
          { service: 'Standard Pallet Storage (48×40)', rate: '$20.00/pallet/mo', notes: 'Subject to $250/mo minimum. FIFO / lot control available.' },
          { service: 'Handling Out', rate: '$11.00/pallet', notes: 'Retrieval, staging, and load-out' },
        ],
        fulfillment: [
          { service: 'Order Processing', rate: '$3.25/order', notes: 'Pick, pack, and ship per order' },
          { service: 'Case Pick', rate: '$0.60/case', notes: 'Per case picked' },
          { service: 'Additional Item Pick', rate: '$0.60/item', notes: 'Each additional item beyond first pick' },
          { service: 'Variety Pack Build (2 SKU)', rate: '$1.20–$2.75/pack', notes: 'Per variety pack — rate depends on configuration and volume' },
          { service: 'Pallet Outbound (Shipping)', rate: 'Per pallet or per order', notes: 'Staging, loading, and ship-out' },
          { service: 'Order Cancellation', rate: '$2.00/order', notes: 'Orders cancelled after processing begins' },
          { service: 'Order Intervention / Change', rate: '$2.00/instance', notes: 'Modifications after order is released' },
          { service: 'Heavy Item (40+ lbs)', rate: '$5.00/item', notes: 'Team lift / OSHA requirement' },
        ],
        valueAdded: [
          { service: 'Co-Packing / Variety Pack Assembly', rate: 'Per unit', notes: 'Multi-pack builds, promo packs, variety packs, seasonal kits' },
          { service: 'Labeling / Relabeling', rate: 'Per label', notes: 'Compliance labels, retail-ready, UPC' },
          { service: 'Kitting / Bundling', rate: 'Per unit', notes: 'Multi-pack builds, promo packs, variety packs' },
          { service: 'Inventory Management (WMS)', rate: 'Included', notes: 'Real-time inventory visibility' },
          { service: 'Container Devanning / Floor Unloads', rate: 'Per container', notes: 'If applicable for future imports' },
          { service: 'Returns Processing', rate: '$2.50/return', notes: 'Inspect, restock, or dispose' },
          { service: 'Quality Inspection', rate: 'Hourly rate', notes: 'Detailed product inspection if needed' },
        ],
        rush: [
          { service: 'Rush Fee (Same Day)', rate: '$2.00/item', notes: 'Outside SLA, 9 item minimum' },
          { service: 'Saturday Fulfillment', rate: '20% surcharge', notes: 'OT coverage if needed' },
          { service: 'Rework / Special Projects', rate: 'Hourly or per-unit', notes: 'Labeling, repacking, kitting projects' },
        ],
        labor: [
          { service: 'General Labor', rate: '$40.00/hour' },
          { service: 'Manual Order Entry', rate: '$2.00/order', notes: 'Non-integrated order processing' },
        ],
      },
    ],
    
    storageIncentives: [],
    
    storageIncentiveNotes: [
      'Standard 48×40 pallet footprint',
      'FIFO and lot control available at no additional charge',
      'Pricing customizable as volume scales',
      'Alcohol/beverage handling experience — compliance-aware operations',
    ],
    
    contractTerms: {
      term: '12-month initial agreement. Renewable annually.',
      termination: '60-days written notice required.',
      payment: 'Net 30 days. Monthly billing on the 1st.',
      rateIncreases: 'Annual adjustment up to 5% based on CPI.',
      liability: 'Standard warehouse liability applies. $50/carton max.',
      nonCompete: 'Standard non-compete terms apply.',
    },
    
    serviceFees: {
      monthlyMinimum: '$250.00/month minimum storage (difference invoiced if not met).',
      setupFee: '$500.00 new account setup fee due upon acceptance.',
      insurance: 'Customer responsible for goods insurance.',
      claims: 'Must be filed within 30 days of delivery/loss.',
    },
    
    standardIntegrations: ['WMS Portal', 'Inventory Reporting', 'Order Management'],
    customIntegrationFee: 0,
    integrationFeeWaived: true,
    
    benefits: [
      'Philadelphia Location',
      'Beverage Expertise',
      'Co-Packing Services',
      'Scalable Growth',
    ],
    
    assumptions: [
      'Product: Ready-to-drink canned cocktails (RTD) — Original Bourbon Barrel Lemonade',
      'Standard 48×40 pallet footprint',
      'Co-packing and variety pack assembly services available',
      'Fulfillment fees billed separately based on activity (case pick, pallet in/out, rework)',
      'FIFO / lot control available if needed',
      'Pricing can be customized based on volume and order profile as Robbie Dan\'s scales',
      'New Account Setup Fee ($500.00) due upon acceptance',
      '$250.00/month minimum storage applies',
      'Standard business hours: Monday–Friday, 8:00 AM – 5:00 PM EST',
      'Pricing valid for 30 days from proposal date',
    ],
    
    storageDescription: 'Standard palletized storage on 48×40 pallet footprint with monthly billing subject to $250/month minimum. FIFO and lot control available.',
    storageNote: 'Scalable storage — rates adjust as volume grows.',
    inboundType: 'palletized',
    inboundDescription: [
      'Receive palletized shipments at dock.',
      'Verify pallet count and visible condition on arrival.',
      'Check-in and stage product in temperature-appropriate area.',
      'Apply pallet and location labels for WMS tracking.',
    ],
    inboundNote: 'Beverage-experienced receiving team. Compliance-aware operations for alcohol products.',
    deliverables: [
      'Real-time inventory visibility via WMS portal',
      'Order fulfillment — DTC and wholesale channels',
      'Co-packing and variety pack builds',
      'Labeling and compliance preparation',
      'Freight coordination for inbound and outbound',
      'Monthly inventory and activity reporting',
    ],
    clientResponsibilities: [
      'Provide advance notice of inbound shipments (48 hours minimum)',
      'Confirm variety pack build specifications and SKU configurations',
      'Provide labeling requirements and compliance specs',
      'Coordinate inbound delivery schedule with Peach team',
    ],
    
    pdfFilename: 'Peach Warehouse - Robbie Dans Disco Beverage Proposal',
    
    heroTitle: "Robbie Dan's\nOriginal Bourbon Barrel Lemonade",
    heroSubtitle: 'Warehousing, co-packing, fulfillment, and variety pack kitting for premium ready-to-drink canned cocktails — operated from our PA-2101 facility in Philadelphia, PA.',
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },
  // Lindsay's Southside - ORIGINAL (expired — replaced by lindsays-southside)
  'pa-13cfaf41ef34': {
    slug: 'pa-13cfaf41ef34',
    expired: true,
    expiredMessage: 'This proposal has been superseded by an updated version.',
    template: 'teal-diamond',
    name: "Lindsay's Southside",
    fullName: "Lindsay's Southside",
    contactEmail: 'jason.quenzer@hotmail.com',
    website: '',
    tagline: 'Variety Pack Co-Packing Services',
    business: 'Ready-to-Drink Beverages / RTD',
    
    primaryColor: 'oklch(0.60 0.18 30)',
    primaryColorHex: '#D84315',
    accentColor: '#1B5E20',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    term: 'Project-Based Agreement',
    termMonths: 0,
    proposalDate: 'March 16th, 2026',
    monthlyMinimum: 0,
    slaTime: '48 hours',
    slaAccuracy: '99%',
    
    facilities: ['PA-2101 (Philadelphia, PA)'],
    
    pricing: [
      {
        location: 'Philadelphia, PA',
        code: 'PA-2101',
        address: '2101 Hornig Road, Philadelphia, PA 19116',
        inbound: [
          { service: 'New Account Setup Fee', rate: '$1,500.00/one-time', notes: '$1,000 credit applied toward project labor/reserve' },
          { service: 'Pallet Handling In', rate: '$11.00/pallet', notes: 'Unload, verify count, check-in, stage for storage' },
          { service: 'Pallet Label', rate: '$0.50/pallet', notes: 'WMS barcode label per pallet' },
        ],
        storage: [
          { service: 'Standard Pallet Storage (48×40)', rate: '$20.00/pallet/mo', notes: 'Finished goods and raw materials' },
        ],
        fulfillment: [
          { service: 'Variety Pack Assembly — Case Rate (24 cans)', rate: '', notes: '1 case = 3 × 8-packs. Auto-bottom box, tabbed closure. Boardroom discount applied.' },
          { service: '1 SKU — Finished Case (24-count)', rate: '$1.65/case', notes: '$0.55/8-pack — single flavor, 3 packs per case' },
          { service: '2 SKUs — Finished Case (24-count)', rate: '$1.85/case', notes: '$0.62/8-pack — 2 flavors, 3 packs per case' },
          { service: '3 SKUs — Finished Case (24-count)', rate: '$2.10/case', notes: '← Lindsay\'s project — $0.70/8-pack (4-2-2 configuration)' },
          { service: '4 SKUs — Finished Case (24-count)', rate: '$2.40/case', notes: '$0.80/8-pack — 4 flavors, 3 packs per case' },
          { service: '', rate: '', notes: '' },
          { service: 'Variety Pack Assembly — 12-Count', rate: '', notes: 'Per finished pack. Auto-bottom box, tabbed closure.' },
          { service: '1 SKU (12-count)', rate: '$1.35/pack' },
          { service: '2 SKUs (12-count)', rate: '$1.50/pack', notes: 'Confirm units per SKU per pack' },
          { service: '3 SKUs (12-count)', rate: '$1.70/pack' },
          { service: '4 SKUs (12-count)', rate: '$1.90/pack' },
        ],
        valueAdded: [
          { service: 'Heat Shrink Wrap', rate: '$1.00/pack', notes: 'If required — not needed for this project' },
          { service: 'Supplies', rate: 'At cost', notes: 'Billed back as needed (tape, glue, dividers, etc.)' },
          { service: 'Pallet Supply Fee', rate: '$10.00/pallet', notes: 'If pallet exchange required' },
          { service: 'Shrink Wrap (Pallet)', rate: '$4.00/pallet', notes: 'Finished pallet wrap for outbound' },
        ],
        delivery: [
          { service: 'Transport from ABT (Lansdale, PA → 19116)', rate: '$125.00/pallet', notes: 'Boardroom/ABT production facility to PA-2101' },
          { service: 'Full Truckload from ABT', rate: '$500.00/load', notes: 'Boardroom/ABT production facility to PA-2101' },
        ],
        rush: [
          { service: 'Rush Fee (Same Day)', rate: '$2.00/item', notes: 'Outside SLA' },
          { service: 'Saturday Production', rate: '20% surcharge', notes: 'OT coverage if needed' },
        ],
        labor: [
          { service: 'General Labor', rate: '$40.00/hour' },
        ],
      },
    ],
    
    storageIncentives: [],
    
    storageIncentiveNotes: [
      'Standard 48×40 pallet footprint',
      'FIFO and lot control available at no additional charge',
      'Raw materials and finished goods stored separately',
    ],
    
    contractTerms: {
      term: 'Project-based agreement. Scope: 2,000 finished cases (24-count, 3 SKU — 6,000 eight-packs / 48,000 cans). Production target: first or second week of April 2026.',
      termination: 'Project completes upon delivery of all finished goods.',
      payment: 'Net 30 days. Activity billed weekly. Setup fee due upon acceptance.',
      rateIncreases: 'Rates fixed for duration of project.',
      liability: 'Standard warehouse liability applies. $50/carton max.',
      nonCompete: 'Standard non-compete terms apply.',
    },
    
    serviceFees: {
      monthlyMinimum: 'No monthly minimum — project-based billing.',
      setupFee: '$1,500.00 new account setup fee due upon acceptance. $1,000 credit applied toward project labor.',
      insurance: 'Customer responsible for goods insurance.',
      claims: 'Must be filed within 30 days of delivery/loss.',
    },
    
    standardIntegrations: ['WMS Portal', 'Inventory Reporting', 'Project Updates'],
    customIntegrationFee: 0,
    integrationFeeWaived: true,
    
    benefits: [
      'Philadelphia Location',
      'Beverage Co-Pack Expertise',
      'Recent Variety Pack Experience',
      'Quick Turnaround',
    ],
    
    assumptions: [
      'Product: 12oz sleek digitally printed cans — Lindsay\'s Southside RTD beverages',
      'Case configuration: 1 case = 3 × 8-packs (24 cans per case), 3 SKUs per 8-pack (4-2-2: 4x Lemon Mint, 2x Watermelon, 2x Orange)',
      'Single case output — all finished cases are identical 3-SKU configuration',
      'Total production: 2,000 cases / 6,000 eight-packs (48,000 cans total)',
      'Pricing quoted per finished case (24-count) — Boardroom discount applied',
      '5% shrinkage factored into production planning — coordinate with production partner (Advanced Beverage Tech)',
      'Box type: auto-bottom, partially glued, tabbed closure — no gluing or stickering required',
      'Pending receipt of dieline or sample box (no artwork needed)',
      'Client supplies printed boxes; Peach Warehouse assembles variety packs only',
      'Supplies (tape, dividers, etc.) billed back at cost as needed',
      'Estimated output: ~20 finished pallets (~1 truckload)',
      'Outbound: distributor pickup from PA-2101 facility, destination Maryland',
      'Production partner: Advanced Beverage Tech (Vlad Mamedov) — cans produced and delivered to Peach for packing',
      'Production target: first or second week of April 2026, pending label approval and box delivery',
      'Heat shrink wrap not required for this project ($1.00/pack additional if needed)',
      'Pricing valid for 30 days from proposal date',
    ],
    
    storageDescription: 'Standard palletized storage for raw materials (loose cans by flavor) and finished variety packs. FIFO and lot control available.',
    storageNote: 'Storage duration expected to be short-term for this project.',
    inboundType: 'palletized',
    inboundDescription: [
      'Receive palletized shipments of loose cans from production partner (Advanced Beverage Tech).',
      'Verify pallet count, flavor SKUs, and visible condition on arrival.',
      'Stage cans by flavor for variety pack assembly line.',
      'Receive and stage client-supplied printed boxes.',
    ],
    inboundNote: 'Beverage co-packing team with recent variety pack experience. Coordinate inbound timing with production partner.',
    deliverables: [
      '2,000 finished cases (24-count — 3 × 8-packs, 3 SKU, 4-2-2 configuration per pack)',
      'Palletized and staged for distributor pickup',
      'Real-time inventory visibility via WMS portal',
      'Project progress updates throughout production',
      'Final production report with pack counts and shrinkage reconciliation',
    ],
    clientResponsibilities: [
      'Coordinate production schedule with Advanced Beverage Tech and confirm delivery date to Peach',
      'Supply printed variety pack boxes to PA-2101 facility prior to production start',
      'Provide dieline or sample box for assembly planning (no artwork needed)',
      'Confirm variety pack configuration (4-2-2) and any changes prior to production',
      'Arrange distributor pickup from PA-2101 upon completion',
      'Factor 5% shrinkage into can production quantities with Advanced Beverage Tech',
    ],
    
    pdfFilename: 'Peach Warehouse - Lindsays Southside Variety Pack Proposal',
    
    heroImage: 'https://files.manuscdn.com/user_upload_by_module/session_file/93927875/LwYcbzzcFrMuSGEo.jpg',
    heroTitle: "Lindsay's Southside\nVariety Pack Co-Packing",
    heroSubtitle: 'Variety pack assembly and fulfillment for 12oz sleek RTD beverages — 2,000 cases (24-count, 3 SKU) operated from our PA-2101 facility in Philadelphia, PA.',
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },
  // Lindsay's Southside - Variety Pack Co-Packing V2 (PA-2101) — corrected case-rate pricing
  'lindsays-southside': {
    slug: 'lindsays-southside',
    template: 'teal-diamond',
    name: "Lindsay's Southside",
    fullName: "Lindsay's Southside",
    contactEmail: 'jason.quenzer@hotmail.com',
    website: '',
    tagline: 'Variety Pack Co-Packing Services',
    business: 'Ready-to-Drink Beverages / RTD',
    
    primaryColor: 'oklch(0.60 0.18 30)',
    primaryColorHex: '#D84315',
    accentColor: '#1B5E20',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    term: 'Project-Based Agreement',
    termMonths: 0,
    proposalDate: 'March 18th, 2026',
    monthlyMinimum: 0,
    slaTime: '48 hours',
    slaAccuracy: '99%',
    
    facilities: ['PA-2101 (Philadelphia, PA)'],
    
    pricing: [
      {
        location: 'Philadelphia, PA',
        code: 'PA-2101',
        address: '2101 Hornig Road, Philadelphia, PA 19116',
        inbound: [
          { service: 'New Account Setup Fee', rate: '$1,500.00/one-time', notes: '$1,000 credit applied toward project labor/reserve' },
          { service: 'Pallet Handling In', rate: '$11.00/pallet', notes: 'Unload, verify count, check-in, stage for storage' },
          { service: 'Pallet Label', rate: '$0.50/pallet', notes: 'WMS barcode label per pallet' },
        ],
        storage: [
          { service: 'Standard Pallet Storage (48\u00d740)', rate: '$20.00/pallet/mo', notes: 'Finished goods and raw materials' },
        ],
        fulfillment: [
          { service: 'Variety Pack Assembly \u2014 Case Rate (24 cans)', rate: '', notes: '1 case = 3 \u00d7 8-packs. Auto-bottom box, tabbed closure. Boardroom discount applied.' },
          { service: '1 SKU \u2014 Finished Case (24-count)', rate: '$1.65/case', notes: '$0.55/8-pack \u2014 single flavor, 3 packs per case' },
          { service: '2 SKUs \u2014 Finished Case (24-count)', rate: '$1.85/case', notes: '$0.62/8-pack \u2014 2 flavors, 3 packs per case' },
          { service: '3 SKUs \u2014 Finished Case (24-count)', rate: '$2.10/case', notes: '\u2190 Lindsay\'s project \u2014 $0.70/8-pack (4-2-2 configuration)' },
          { service: '4 SKUs \u2014 Finished Case (24-count)', rate: '$2.40/case', notes: '$0.80/8-pack \u2014 4 flavors, 3 packs per case' },
          { service: '', rate: '', notes: '' },
          { service: 'Variety Pack Assembly \u2014 12-Count', rate: '', notes: 'Per finished pack. Auto-bottom box, tabbed closure.' },
          { service: '1 SKU (12-count)', rate: '$1.35/pack' },
          { service: '2 SKUs (12-count)', rate: '$1.50/pack', notes: 'Confirm units per SKU per pack' },
          { service: '3 SKUs (12-count)', rate: '$1.70/pack' },
          { service: '4 SKUs (12-count)', rate: '$1.90/pack' },
        ],
        valueAdded: [
          { service: 'Heat Shrink Wrap', rate: '$1.00/pack', notes: 'If required \u2014 not needed for this project' },
          { service: 'Supplies', rate: 'At cost', notes: 'Billed back as needed (tape, glue, dividers, etc.)' },
          { service: 'Pallet Supply Fee', rate: '$10.00/pallet', notes: 'If pallet exchange required' },
          { service: 'Shrink Wrap (Pallet)', rate: '$4.00/pallet', notes: 'Finished pallet wrap for outbound' },
        ],
        delivery: [
          { service: 'Transport from ABT (Lansdale, PA \u2192 19116)', rate: '$125.00/pallet', notes: 'Boardroom/ABT production facility to PA-2101' },
          { service: 'Full Truckload from ABT', rate: '$500.00/load', notes: 'Boardroom/ABT production facility to PA-2101' },
        ],
        rush: [
          { service: 'Rush Fee (Same Day)', rate: '$2.00/item', notes: 'Outside SLA' },
          { service: 'Saturday Production', rate: '20% surcharge', notes: 'OT coverage if needed' },
        ],
        labor: [
          { service: 'General Labor', rate: '$40.00/hour' },
        ],
      },
    ],
    
    storageIncentives: [],
    
    storageIncentiveNotes: [
      'Standard 48\u00d740 pallet footprint',
      'FIFO and lot control available at no additional charge',
      'Raw materials and finished goods stored separately',
    ],
    
    contractTerms: {
      term: 'Project-based agreement. Scope: 2,000 finished cases (24-count, 3 SKU \u2014 6,000 eight-packs / 48,000 cans). Production target: first or second week of April 2026.',
      termination: 'Project completes upon delivery of all finished goods.',
      payment: 'Net 30 days. Activity billed weekly. Setup fee due upon acceptance.',
      rateIncreases: 'Rates fixed for duration of project.',
      liability: 'Standard warehouse liability applies. $50/carton max.',
      nonCompete: 'Standard non-compete terms apply.',
    },
    
    serviceFees: {
      monthlyMinimum: 'No monthly minimum \u2014 project-based billing.',
      setupFee: '$1,500.00 new account setup fee due upon acceptance. $1,000 credit applied toward project labor.',
      insurance: 'Customer responsible for goods insurance.',
      claims: 'Must be filed within 30 days of delivery/loss.',
    },
    
    standardIntegrations: ['WMS Portal', 'Inventory Reporting', 'Project Updates'],
    customIntegrationFee: 0,
    integrationFeeWaived: true,
    
    benefits: [
      'Philadelphia Location',
      'Beverage Co-Pack Expertise',
      'Recent Variety Pack Experience',
      'Quick Turnaround',
    ],
    
    assumptions: [
      'Product: 12oz sleek digitally printed cans \u2014 Lindsay\'s Southside RTD beverages',
      'Case configuration: 1 case = 3 \u00d7 8-packs (24 cans per case), 3 SKUs per 8-pack (4-2-2: 4x Lemon Mint, 2x Watermelon, 2x Orange)',
      'Single case output \u2014 all finished cases are identical 3-SKU configuration',
      'Total production: 2,000 cases / 6,000 eight-packs (48,000 cans total)',
      'Pricing quoted per finished case (24-count) \u2014 Boardroom discount applied',
      '5% shrinkage factored into production planning \u2014 coordinate with production partner (Advanced Beverage Tech)',
      'Box type: auto-bottom, partially glued, tabbed closure \u2014 no gluing or stickering required',
      'Pending receipt of dieline or sample box (no artwork needed)',
      'Client supplies printed boxes; Peach Warehouse assembles variety packs only',
      'Supplies (tape, dividers, etc.) billed back at cost as needed',
      'Estimated output: ~20 finished pallets (~1 truckload)',
      'Outbound: distributor pickup from PA-2101 facility, destination Maryland',
      'Production partner: Advanced Beverage Tech (Vlad Mamedov) \u2014 cans produced and delivered to Peach for packing',
      'Production target: first or second week of April 2026, pending label approval and box delivery',
      'Heat shrink wrap not required for this project ($1.00/pack additional if needed)',
      'Pricing valid for 30 days from proposal date',
    ],
    
    storageDescription: 'Standard palletized storage for raw materials (loose cans by flavor) and finished variety packs. FIFO and lot control available.',
    storageNote: 'Storage duration expected to be short-term for this project.',
    inboundType: 'palletized',
    inboundDescription: [
      'Receive palletized shipments of loose cans from production partner (Advanced Beverage Tech).',
      'Verify pallet count, flavor SKUs, and visible condition on arrival.',
      'Stage cans by flavor for variety pack assembly line.',
      'Receive and stage client-supplied printed boxes.',
    ],
    inboundNote: 'Beverage co-packing team with recent variety pack experience. Coordinate inbound timing with production partner.',
    deliverables: [
      '2,000 finished cases (24-count \u2014 3 \u00d7 8-packs, 3 SKU, 4-2-2 configuration per pack)',
      'Palletized and staged for distributor pickup',
      'Real-time inventory visibility via WMS portal',
      'Project progress updates throughout production',
      'Final production report with pack counts and shrinkage reconciliation',
    ],
    clientResponsibilities: [
      'Coordinate production schedule with Advanced Beverage Tech and confirm delivery date to Peach',
      'Supply printed variety pack boxes to PA-2101 facility prior to production start',
      'Provide dieline or sample box for assembly planning (no artwork needed)',
      'Confirm variety pack configuration (4-2-2) and any changes prior to production',
      'Arrange distributor pickup from PA-2101 upon completion',
      'Factor 5% shrinkage into can production quantities with Advanced Beverage Tech',
    ],
    
    pdfFilename: 'Peach Warehouse - Lindsays Southside Variety Pack Proposal',
    
    heroImage: 'https://files.manuscdn.com/user_upload_by_module/session_file/93927875/LwYcbzzcFrMuSGEo.jpg',
    heroTitle: "Lindsay's Southside\nVariety Pack Co-Packing",
    heroSubtitle: 'Variety pack assembly and fulfillment for 12oz sleek RTD beverages \u2014 2,000 cases (24-count, 3 SKU) operated from our PA-2101 facility in Philadelphia, PA.',
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },
  // Wai M\u0101nuka - Variety Pack Co-Packing (PA-2101)
  'pa-8fd572801653': {
    slug: 'pa-8fd572801653',
    template: 'teal-diamond',
    name: 'Wai Mānuka',
    fullName: 'Wai Mānuka',
    contactEmail: 'joe.harawira@waimanuka.co.nz',
    website: 'waimanuka.co.nz',
    tagline: 'Variety Pack Co-Packing Services',
    business: 'Premium Non-Alcoholic Sparkling Beverages',
    
    primaryColor: 'oklch(0.45 0.15 250)',
    primaryColorHex: '#1A3A5C',
    accentColor: '#C8963E',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    term: 'Project-Based Agreement',
    termMonths: 0,
    proposalDate: 'March 16th, 2026',
    monthlyMinimum: 0,
    slaTime: '48 hours',
    slaAccuracy: '99%',
    
    facilities: ['PA-2101 (Philadelphia, PA)'],
    
    pricing: [
      {
        location: 'Philadelphia, PA',
        code: 'PA-2101',
        address: '2101 Hornig Road, Philadelphia, PA 19116',
        inbound: [
          { service: 'New Account Setup Fee', rate: '$1,500.00/one-time', notes: '$1,000 credit applied toward project labor/reserve' },
          { service: 'Pallet Handling In', rate: '$11.00/pallet', notes: 'Unload, verify count, check-in, stage for storage' },
          { service: 'Pallet Label', rate: '$0.50/pallet', notes: 'WMS barcode label per pallet' },
        ],
        storage: [
          { service: 'Standard Pallet Storage (48×40)', rate: '$20.00/pallet/mo', notes: 'Finished goods and raw materials' },
        ],
        fulfillment: [
          { service: 'Variety Pack Assembly — 8-Count', rate: '', notes: 'Per finished pack. Auto-bottom box, tabbed closure.' },
          { service: '1 SKU (8-count)', rate: '$1.25/pack' },
          { service: '2 SKUs (8-count)', rate: '$1.40/pack', notes: 'Confirm units per SKU per pack' },
          { service: '3 SKUs (8-count)', rate: '$1.60/pack' },
          { service: '4 SKUs (8-count)', rate: '$1.80/pack' },
          { service: 'Variety Pack Assembly — 12-Count', rate: '', notes: 'Per finished pack. Auto-bottom box, tabbed closure.' },
          { service: '1 SKU (12-count)', rate: '$1.35/pack' },
          { service: '2 SKUs (12-count)', rate: '$1.50/pack', notes: 'Confirm units per SKU per pack' },
          { service: '3 SKUs (12-count)', rate: '$1.70/pack' },
          { service: '4 SKUs (12-count)', rate: '$1.90/pack' },
        ],
        valueAdded: [
          { service: 'Heat Shrink Wrap', rate: '$1.00/pack', notes: 'If required' },
          { service: 'Supplies', rate: 'At cost', notes: 'Billed back as needed (tape, glue, dividers, etc.)' },
          { service: 'Pallet Supply Fee', rate: '$10.00/pallet', notes: 'If pallet exchange required' },
          { service: 'Shrink Wrap (Pallet)', rate: '$4.00/pallet', notes: 'Finished pallet wrap for outbound' },
        ],
        delivery: [
          { service: 'Transport from ABT (Lansdale, PA → 19116)', rate: '$125.00/pallet', notes: 'Boardroom/ABT production facility to PA-2101' },
          { service: 'Full Truckload from ABT', rate: '$500.00/load', notes: 'Boardroom/ABT production facility to PA-2101' },
        ],
        rush: [
          { service: 'Rush Fee (Same Day)', rate: '$2.00/item', notes: 'Outside SLA' },
          { service: 'Saturday Production', rate: '20% surcharge', notes: 'OT coverage if needed' },
        ],
        labor: [
          { service: 'General Labor', rate: '$40.00/hour' },
        ],
      },
    ],
    
    storageIncentives: [],
    
    storageIncentiveNotes: [
      'Standard 48×40 pallet footprint',
      'FIFO and lot control available at no additional charge',
      'Raw materials and finished goods stored separately',
    ],
    
    contractTerms: {
      term: 'Project-based agreement. Co-packing services for 250ml slim can (8.5oz) non-alcoholic sparkling mānuka honey beverage. Production target: May 2026.',
      termination: 'Project completes upon delivery of all finished goods.',
      payment: 'Net 30 days. Activity billed weekly. Setup fee due upon acceptance.',
      rateIncreases: 'Rates fixed for duration of project.',
      liability: 'Standard warehouse liability applies. $50/carton max.',
      nonCompete: 'Standard non-compete terms apply.',
    },
    
    serviceFees: {
      monthlyMinimum: 'No monthly minimum — project-based billing.',
      setupFee: '$1,500.00 new account setup fee due upon acceptance. $1,000 credit applied toward project labor.',
      insurance: 'Customer responsible for goods insurance.',
      claims: 'Must be filed within 30 days of delivery/loss.',
    },
    
    standardIntegrations: ['WMS Portal', 'Inventory Reporting', 'Project Updates'],
    customIntegrationFee: 0,
    integrationFeeWaived: true,
    
    benefits: [
      'Philadelphia Location',
      'Beverage Co-Pack Expertise',
      'Close Proximity to ABT/Boardroom',
      'Quick Turnaround',
    ],
    
    assumptions: [
      'Product: 250ml slim can (8.5oz) — Wai Mānuka premium non-alcoholic sparkling mānuka honey beverage',
      'Currently 1 SKU — pricing tiers provided for future SKU expansion (up to 4 SKUs)',
      'Pack configurations: 4-pack and 12-pack for retail distribution',
      'Auto-bottom boxes, fold-and-click closure — no gluing required',
      '5% shrinkage factored into production planning — coordinate with ABT (Advanced Beverage Tech)',
      'Client supplies printed boxes; Peach Warehouse assembles variety packs only',
      'Supplies (tape, dividers, etc.) billed back at cost as needed',
      'Cans produced by Advanced Beverage Tech (Boardroom, Lansdale, PA) and transported to PA-2101',
      'Transport from ABT: $125/pallet or $500/truckload (Lansdale, PA to Philadelphia, PA 19116)',
      'Outbound: distributor (Fine Saler) pickup from PA-2101 facility initially',
      'Production target: May 2026, pending ABT trial results and label finalization',
      'MOQ: ~350 gallons per production run',
      'Heat shrink wrap available at $1.00/pack additional if needed',
      'Pricing valid for 30 days from proposal date',
    ],
    
    storageDescription: 'Standard palletized storage for raw materials (loose cans) and finished packs. FIFO and lot control available.',
    storageNote: 'No warehousing needed initially — co-pack and pickup only.',
    inboundType: 'palletized',
    inboundDescription: [
      'Receive palletized shipments of cans from ABT (Boardroom, Lansdale, PA).',
      'Verify pallet count and visible condition on arrival.',
      'Stage cans for variety pack assembly line.',
      'Receive and stage client-supplied printed boxes.',
    ],
    inboundNote: 'Beverage co-packing team with recent variety pack experience. ABT located ~30 miles from PA-2101 for efficient transport.',
    deliverables: [
      'Finished variety packs (4-pack and 12-pack configurations)',
      'Palletized and staged for distributor pickup',
      'Real-time inventory visibility via WMS portal',
      'Project progress updates throughout production',
      'Final production report with pack counts and shrinkage reconciliation',
    ],
    clientResponsibilities: [
      'Coordinate production schedule with Advanced Beverage Tech and confirm delivery date to Peach',
      'Supply printed variety pack boxes to PA-2101 facility prior to production start',
      'Confirm pack configuration (4-pack and/or 12-pack) and SKU count prior to production',
      'Arrange distributor pickup from PA-2101 upon completion',
      'Factor 5% shrinkage into can production quantities with Advanced Beverage Tech',
    ],
    
    pdfFilename: 'Peach Warehouse - Wai Manuka Variety Pack Proposal',
    
    heroImage: 'https://files.manuscdn.com/user_upload_by_module/session_file/93927875/zrTjMgGIXtkCwULF.png',
    heroTitle: 'Wai Mānuka\nVariety Pack Co-Packing',
    heroSubtitle: 'Variety pack assembly for premium non-alcoholic sparkling mānuka honey beverages — 250ml slim cans operated from our PA-2101 facility in Philadelphia, PA.',
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },

  // Lindsay's Southside v2 — Case Rate (24-count) Pricing (PA-2101)
  'pa-7b2e9a63d418': {
    slug: 'pa-7b2e9a63d418',
    template: 'teal-diamond',
    name: "Lindsay's Southside",
    fullName: "Lindsay's Southside",
    contactEmail: 'jason.quenzer@hotmail.com',
    website: '',
    tagline: 'Variety Pack Co-Packing Services',
    business: 'Ready-to-Drink Beverages / RTD',
    
    primaryColor: 'oklch(0.60 0.18 30)',
    primaryColorHex: '#D84315',
    accentColor: '#1B5E20',
    
    provider: {
      name: 'Peach Warehouse',
      isPartner: false,
    },
    
    term: 'Project-Based Agreement',
    termMonths: 0,
    proposalDate: 'March 18th, 2026',
    monthlyMinimum: 0,
    slaTime: '48 hours',
    slaAccuracy: '99%',
    
    facilities: ['PA-2101 (Philadelphia, PA)'],
    
    pricing: [
      {
        location: 'Philadelphia, PA',
        code: 'PA-2101',
        address: '2101 Hornig Road, Philadelphia, PA 19116',
        inbound: [
          { service: 'New Account Setup Fee', rate: '$1,500.00/one-time', notes: '$1,000 credit applied toward project labor/reserve' },
          { service: 'Pallet Handling In', rate: '$11.00/pallet', notes: 'Unload, verify count, check-in, stage for storage' },
          { service: 'Pallet Label', rate: '$0.50/pallet', notes: 'WMS barcode label per pallet' },
        ],
        storage: [
          { service: 'Standard Pallet Storage (48\u00d740)', rate: '$20.00/pallet/mo', notes: 'Finished goods and raw materials' },
        ],
        fulfillment: [
          { service: 'Variety Pack Assembly \u2014 Case Rate (24 cans)', rate: '', notes: '1 case = 3 \u00d7 8-packs. Auto-bottom box, tabbed closure. Boardroom discount applied.' },
          { service: '1 SKU \u2014 Finished Case (24-count)', rate: '$1.65/case', notes: '$0.55/8-pack \u2014 single flavor, 3 packs per case' },
          { service: '2 SKUs \u2014 Finished Case (24-count)', rate: '$1.85/case', notes: '$0.62/8-pack \u2014 2 flavors, 3 packs per case' },
          { service: '3 SKUs \u2014 Finished Case (24-count)', rate: '$2.10/case', notes: '\u2190 Lindsay\'s project \u2014 $0.70/8-pack (4-2-2 configuration)' },
          { service: '4 SKUs \u2014 Finished Case (24-count)', rate: '$2.40/case', notes: '$0.80/8-pack \u2014 4 flavors, 3 packs per case' },
          { service: 'Variety Pack Assembly \u2014 12-Count', rate: '', notes: 'Per finished pack. Auto-bottom box, tabbed closure.' },
          { service: '1 SKU (12-count)', rate: '$1.35/pack' },
          { service: '2 SKUs (12-count)', rate: '$1.50/pack', notes: 'Confirm units per SKU per pack' },
          { service: '3 SKUs (12-count)', rate: '$1.70/pack' },
          { service: '4 SKUs (12-count)', rate: '$1.90/pack' },
        ],
        valueAdded: [
          { service: 'Heat Shrink Wrap', rate: '$1.00/pack', notes: 'If required \u2014 not needed for this project' },
          { service: 'Supplies', rate: 'At cost', notes: 'Billed back as needed (tape, glue, dividers, etc.)' },
          { service: 'Pallet Supply Fee', rate: '$10.00/pallet', notes: 'If pallet exchange required' },
          { service: 'Shrink Wrap (Pallet)', rate: '$4.00/pallet', notes: 'Finished pallet wrap for outbound' },
        ],
        delivery: [
          { service: 'Transport from ABT (Lansdale, PA \u2192 19116)', rate: '$125.00/pallet', notes: 'Boardroom/ABT production facility to PA-2101' },
          { service: 'Full Truckload from ABT', rate: '$500.00/load', notes: 'Boardroom/ABT production facility to PA-2101' },
        ],
        rush: [
          { service: 'Rush Fee (Same Day)', rate: '$2.00/item', notes: 'Outside SLA' },
          { service: 'Saturday Production', rate: '20% surcharge', notes: 'OT coverage if needed' },
        ],
        labor: [
          { service: 'General Labor', rate: '$40.00/hour' },
        ],
      },
    ],
    
    storageIncentives: [],
    
    storageIncentiveNotes: [
      'Standard 48\u00d740 pallet footprint',
      'FIFO and lot control available at no additional charge',
      'Raw materials and finished goods stored separately',
    ],
    
    contractTerms: {
      term: 'Project-based agreement. Scope: 2,000 cases / 6,000 eight-packs (48,000 cans). Production target: first or second week of April 2026.',
      termination: 'Project completes upon delivery of all finished goods.',
      payment: 'Net 30 days. Activity billed weekly. Setup fee due upon acceptance.',
      rateIncreases: 'Rates fixed for duration of project.',
      liability: 'Standard warehouse liability applies. $50/carton max.',
      nonCompete: 'Standard non-compete terms apply.',
    },
    
    serviceFees: {
      monthlyMinimum: 'No monthly minimum \u2014 project-based billing.',
      setupFee: '$1,500.00 new account setup fee due upon acceptance. $1,000 credit applied toward project labor.',
      insurance: 'Customer responsible for goods insurance.',
      claims: 'Must be filed within 30 days of delivery/loss.',
    },
    
    standardIntegrations: ['WMS Portal', 'Inventory Reporting', 'Project Updates'],
    customIntegrationFee: 0,
    integrationFeeWaived: true,
    
    benefits: [
      'Philadelphia Location',
      'Beverage Co-Pack Expertise',
      'Recent Variety Pack Experience',
      'Quick Turnaround',
    ],
    
    assumptions: [
      'Product: 12oz sleek digitally printed cans \u2014 Lindsay\'s Southside RTD beverages',
      'Case configuration: 1 case = 3 \u00d7 8-packs (24 cans per case), 3 SKUs per 8-pack (4-2-2: 4x Lemon Mint, 2x Watermelon, 2x Orange)',
      'Total production: 2,000 cases / 6,000 eight-packs (48,000 cans total)',
      '5% shrinkage factored into production planning \u2014 coordinate with production partner (Advanced Beverage Tech)',
      'Pending receipt of dieline or sample box (no artwork needed)',
      'Supplies (tape, dividers, etc.) billed back at cost as needed',
      'Single case output \u2014 all finished cases are identical 3-SKU configuration',
      'Pricing quoted per finished case (24-count) \u2014 Boardroom discount applied',
      'Box type: auto-bottom, partially glued, tabbed closure \u2014 no gluing or stickering required',
      'Client supplies printed boxes; Peach Warehouse assembles variety packs only',
      'Estimated output: ~20 finished pallets (~1 truckload)',
      'Production partner: Advanced Beverage Tech (Vlad Mamedov) \u2014 cans produced and delivered to Peach for packing',
      'Heat shrink wrap not required for this project ($1.00/pack additional if needed)',
      'Outbound: distributor pickup from PA-2101 facility, destination Maryland',
      'Production target: first or second week of April 2026, pending label approval and box delivery',
      'Pricing valid for 30 days from proposal date',
    ],
    
    storageDescription: 'Standard palletized storage for raw materials (loose cans by flavor) and finished variety packs. FIFO and lot control available.',
    storageNote: 'Storage duration expected to be short-term for this project.',
    inboundType: 'palletized',
    inboundDescription: [
      'Receive palletized shipments of loose cans from production partner (Advanced Beverage Tech).',
      'Verify pallet count, flavor SKUs, and visible condition on arrival.',
      'Stage cans by flavor for variety pack assembly line.',
      'Receive and stage client-supplied printed boxes.',
    ],
    inboundNote: 'Beverage co-packing team with recent variety pack experience (Lucky Energy). Coordinate inbound timing with production partner.',
    deliverables: [
      '2,000 finished cases (24-count, 3 SKU, 4-2-2 configuration)',
      'Palletized and staged for distributor pickup',
      'Real-time inventory visibility via WMS portal',
      'Project progress updates throughout production',
      'Final production report with pack counts and shrinkage reconciliation',
    ],
    clientResponsibilities: [
      'Coordinate production schedule with Advanced Beverage Tech and confirm delivery date to Peach',
      'Supply printed variety pack boxes to PA-2101 facility prior to production start',
      'Provide dieline or sample box for assembly planning (no artwork needed)',
      'Confirm variety pack configuration (4-2-2) and any changes prior to production',
      'Arrange distributor pickup from PA-2101 upon completion',
      'Factor 5% shrinkage into can production quantities with Advanced Beverage Tech',
    ],
    
    pdfFilename: 'Peach Warehouse - Lindsays Southside Variety Pack Proposal',
    
    heroImage: 'https://files.manuscdn.com/user_upload_by_module/session_file/93927875/LwYcbzzcFrMuSGEo.jpg',
    heroTitle: "Lindsay's Southside\nVariety Pack Co-Packing",
    heroSubtitle: 'Variety pack assembly and fulfillment for 12oz sleek RTD beverages \u2014 2,000 cases (24-count, 3 SKU) operated from our PA-2101 facility in Philadelphia, PA.',
    
    contact: {
      name: 'Jim Stenson',
      title: 'Chief Strategy Officer',
      email: 'sales@peachwarehouse.com',
    },
  },
};

export function getClient(slug: string): ClientConfig | undefined {
  return CLIENTS[slug];
}

/**
 * Check if a client proposal is expired.
 * Returns true if:
 *   - client.expired === true (manually expired), OR
 *   - client.expiresAt is set and the current date is past that date
 */
export function isProposalExpired(client: ClientConfig): boolean {
  if (client.expired) return true;
  if (client.expiresAt) {
    const expiresDate = new Date(client.expiresAt);
    // Set to end of day so it expires AFTER the date, not at midnight
    expiresDate.setHours(23, 59, 59, 999);
    return new Date() > expiresDate;
  }
  return false;
}

/**
 * Get the effective status of a proposal.
 * Priority: expired flag/date > active flag > default 'active'
 */
export function getProposalStatus(client: ClientConfig): 'active' | 'expired' | 'draft' {
  if (isProposalExpired(client)) return 'expired';
  if (client.active === false) return 'draft';
  return 'active';
}

export function getAllClientSlugs(): string[] {
  return Object.keys(CLIENTS);
}
