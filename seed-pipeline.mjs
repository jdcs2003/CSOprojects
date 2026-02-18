import 'dotenv/config';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);

  // Check if deals already exist
  const [existing] = await connection.execute('SELECT COUNT(*) as count FROM pipelineDeals');
  if (existing[0].count > 0) {
    console.log(`Already have ${existing[0].count} deals in pipeline, skipping seed.`);
    await connection.end();
    return;
  }

  const deals = [
    {
      clientName: 'Third Deck Brewing',
      clientContact: 'Gabe K. & Matt G.',
      clientEmail: 'gabe@thirddeckbrewing.com',
      clientPhone: null,
      dealName: 'Warehousing & Distribution Proposal',
      serviceType: 'warehousing',
      facility: 'PA-1151',
      company: 'L&M',
      stage: 'proposal_sent',
      estimatedMonthlyRevenue: 210000, // $2,100/mo in cents
      estimatedAnnualRevenue: 2520000, // $25,200/yr in cents
      estimatedPallets: 50,
      estimatedLoads: null,
      keyServices: 'Climate-controlled storage, WMS integration, alcohol licensing, local/long-haul freight',
      notes: 'First-time market launch. Craft brewery targeting PA/NJ/NY. Conservative (20 pallets) and Standard (50 pallets) options proposed. Launch target March 2025.',
      probability: 65,
    },
    {
      clientName: 'Cornerstone Systems (Wine Group)',
      clientContact: null,
      clientEmail: null,
      clientPhone: null,
      dealName: 'MGX Transportation & Cross-Dock Services',
      serviceType: 'transportation',
      facility: 'PA-1151',
      company: 'L&M',
      stage: 'negotiating',
      estimatedMonthlyRevenue: 1925000, // ~$19,250/mo (300 loads/yr @ $769.65 = $230,895/yr ÷ 12)
      estimatedAnnualRevenue: 23089500, // $230,895/yr in cents
      estimatedPallets: null,
      estimatedLoads: 300,
      keyServices: 'Edison NJ Rail → KLS DC5 ($769.65/load), cross-dock services ($16/pallet exception), PLCB re-delivery ($650), Southern Delaware ($750)',
      notes: '300 loads/year. MGX boxcar rail ramp to PLCB is core business. Cross-dock clause: $16 for PLCB refusals/weather, other exceptions at L&M discretion but non-billable. $100K cargo insurance per contract minimum.',
      probability: 80,
    },
    {
      clientName: 'Señor Sangria',
      clientContact: null,
      clientEmail: null,
      clientPhone: null,
      dealName: 'Warehousing & Freight Services',
      serviceType: 'mixed',
      facility: 'PA-1151',
      company: 'L&M',
      stage: 'proposal_sent',
      estimatedMonthlyRevenue: 500000, // ~$5,000/mo estimate in cents
      estimatedAnnualRevenue: 6000000, // $60,000/yr in cents
      estimatedPallets: 100,
      estimatedLoads: null,
      keyServices: 'Pallet storage, handling in/out, outbound freight (Union NJ $700, Freehold NJ $615, Bronx NY $975), inbound pickup (Washingtonville NY $1,050)',
      notes: 'Sangria/wine product. Freight lanes established. Quote saved in calculator.',
      probability: 70,
    },
  ];

  for (const deal of deals) {
    await connection.execute(
      `INSERT INTO pipelineDeals 
        (clientName, clientContact, clientEmail, clientPhone, dealName, serviceType, facility, company, stage, 
         estimatedMonthlyRevenue, estimatedAnnualRevenue, estimatedPallets, estimatedLoads, 
         keyServices, notes, probability, proposalDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        deal.clientName, deal.clientContact, deal.clientEmail, deal.clientPhone,
        deal.dealName, deal.serviceType, deal.facility, deal.company, deal.stage,
        deal.estimatedMonthlyRevenue, deal.estimatedAnnualRevenue, deal.estimatedPallets, deal.estimatedLoads,
        deal.keyServices, deal.notes, deal.probability,
      ]
    );
    console.log(`✓ Seeded: ${deal.clientName} — ${deal.dealName}`);
  }

  console.log('\nDone! 3 deals seeded into pipeline.');
  await connection.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
