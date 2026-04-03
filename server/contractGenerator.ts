/**
 * Universal Contract DOCX Generator
 * 
 * Generates a Customer Services Agreement between L&M Warehousing, Inc.
 * and a customer. Dynamically populates from proposal/pricing data.
 * 
 * Uses the `docx` npm package for server-side DOCX generation.
 */

import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ShadingType,
  PageBreak,
  Packer,
  convertInchesToTwip,
  ITableCellBorders,
  TableLayoutType,
} from 'docx';

import {
  ContractGenerationInput,
  ContractPricingItem,
  FACILITIES,
  LM_ENTITY,
  LEGAL_JURISDICTION,
  LEGAL_JURISDICTION_STATE,
} from '../shared/contractConfig';

// ─── Shared Styles ───────────────────────────────────────────────────────────

const FONT = 'Times New Roman';
const FONT_SIZE = 22; // half-points → 11pt
const HEADING_SIZE = 28; // 14pt
const TITLE_SIZE = 32; // 16pt
const SMALL_SIZE = 20; // 10pt

const TABLE_BORDERS: ITableCellBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
};

// ─── Helper: Normal Paragraph ────────────────────────────────────────────────

function normalPara(text: string, options?: { alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]; spacing?: { after?: number } } | (typeof AlignmentType)[keyof typeof AlignmentType]): Paragraph {
  const align = typeof options === 'string' ? options : options?.alignment;
  const spacingAfter = typeof options === 'object' && options !== null && 'spacing' in options ? (options as any).spacing?.after : undefined;
  return new Paragraph({
    alignment: align ?? AlignmentType.JUSTIFIED,
    spacing: { after: spacingAfter ?? 120, line: 276 },
    children: [
      new TextRun({ text, font: FONT, size: FONT_SIZE }),
    ],
  });
}

function boldPara(text: string, alignment?: typeof AlignmentType.CENTER): Paragraph {
  return new Paragraph({
    alignment: alignment ?? AlignmentType.LEFT,
    spacing: { after: 120, line: 276 },
    children: [
      new TextRun({ text, font: FONT, size: FONT_SIZE, bold: true }),
    ],
  });
}

function mixedPara(parts: Array<{ text: string; bold?: boolean; italic?: boolean }>, options?: { alignment?: typeof AlignmentType.JUSTIFIED; indent?: number }): Paragraph {
  return new Paragraph({
    alignment: options?.alignment ?? AlignmentType.JUSTIFIED,
    spacing: { after: 120, line: 276 },
    indent: options?.indent ? { left: convertInchesToTwip(options.indent) } : undefined,
    children: parts.map(p => new TextRun({
      text: p.text,
      font: FONT,
      size: FONT_SIZE,
      bold: p.bold ?? false,
      italics: p.italic ?? false,
    })),
  });
}

function indentPara(text: string, level: number = 1): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 80, line: 276 },
    indent: { left: convertInchesToTwip(0.5 * level) },
    children: [
      new TextRun({ text, font: FONT, size: FONT_SIZE }),
    ],
  });
}

function indentMixed(parts: Array<{ text: string; bold?: boolean }>, level: number = 1): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 80, line: 276 },
    indent: { left: convertInchesToTwip(0.5 * level) },
    children: parts.map(p => new TextRun({
      text: p.text,
      font: FONT,
      size: FONT_SIZE,
      bold: p.bold ?? false,
    })),
  });
}

function spacer(): Paragraph {
  return new Paragraph({ spacing: { after: 120 }, children: [] });
}

// ─── Helper: Pricing Table ───────────────────────────────────────────────────

function pricingTable(headers: string[], rows: string[][]): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      borders: TABLE_BORDERS,
      shading: { type: ShadingType.SOLID, color: '2C3E50' },
      children: [new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text: h, font: FONT, size: SMALL_SIZE, bold: true, color: 'FFFFFF' })],
      })],
    })),
  });

  const dataRows = rows.map((row, idx) => new TableRow({
    children: row.map(cell => new TableCell({
      borders: TABLE_BORDERS,
      shading: idx % 2 === 1 ? { type: ShadingType.SOLID, color: 'F2F2F2' } : undefined,
      children: [new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text: cell, font: FONT, size: SMALL_SIZE })],
      })],
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.AUTOFIT,
    rows: [headerRow, ...dataRows],
  });
}

// ─── Helper: Signature Table ─────────────────────────────────────────────────

function signatureTable(customerName: string): Table {
  const noBorders: ITableCellBorders = {
    top: { style: BorderStyle.NONE, size: 0 },
    bottom: { style: BorderStyle.NONE, size: 0 },
    left: { style: BorderStyle.NONE, size: 0 },
    right: { style: BorderStyle.NONE, size: 0 },
  };

  const makeCell = (text: string): TableCell => new TableCell({
    borders: noBorders,
    children: [new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text, font: FONT, size: FONT_SIZE })],
    })],
  });

  const makeBoldCell = (text: string): TableCell => new TableCell({
    borders: noBorders,
    children: [new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text, font: FONT, size: FONT_SIZE, bold: true })],
    })],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({ children: [makeBoldCell('L&M Warehousing, Inc.'), makeBoldCell(`Customer (${customerName})`)] }),
      new TableRow({ children: [makeCell('By: ___________________________'), makeCell('By: ___________________________')] }),
      new TableRow({ children: [makeCell('Title: _________________________'), makeCell('Title: _________________________')] }),
      new TableRow({ children: [makeCell('Address: _______________________'), makeCell('Address: _______________________')] }),
      new TableRow({ children: [makeCell('           _______________________'), makeCell('           _______________________')] }),
      new TableRow({ children: [makeCell('Email: _________________________'), makeCell('Email: _________________________')] }),
      new TableRow({ children: [makeCell('Phone No.: _____________________'), makeCell('Phone No.: _____________________')] }),
      new TableRow({ children: [makeCell('Signature: _____________________'), makeCell('Signature: _____________________')] }),
    ],
  });
}

// ─── Main Generator ──────────────────────────────────────────────────────────

export async function generateContractDocx(input: ContractGenerationInput): Promise<Buffer> {
  const facility = FACILITIES[input.facilityId];
  if (!facility) {
    throw new Error(`Unknown facility: ${input.facilityId}`);
  }

  const customerDisplayName = input.customer.tradeName || input.customer.companyName;
  const customerLegalName = input.customer.legalName || input.customer.companyName;
  const customerEntityType = input.customer.entityType ? `, ${input.customer.entityType}` : '';
  const customerAddress = input.customer.address
    ? `${input.customer.address}${input.customer.city ? ', ' + input.customer.city : ''}${input.customer.state ? ', ' + input.customer.state : ''}${input.customer.zip ? ' ' + input.customer.zip : ''}`
    : '__________________________________________';

  const effectiveDate = input.terms.effectiveDate || '___________';
  const termEndDate = input.terms.terminationDate || '___________';
  const noticeDays = input.terms.noticeDays || 90;
  const paymentDays = input.terms.paymentTermsDays || 30;
  const annualIncrease = input.terms.annualIncreaseCapPercent || 5;
  const liabilityPerCarton = input.terms.liabilityPerCarton || 50;

  // Build facility description
  const storageTypeLabel = facility.storageType === 'both' ? 'Climate Controlled + Ambient Storage'
    : facility.storageType === 'climate-controlled' ? 'Climate Controlled Storage'
    : 'Ambient Storage';
  const facilityDesc = input.facilityDescription
    || `${facility.code} (${facility.city}, ${facility.state}) — ${storageTypeLabel}${facility.sqft ? `. ${facility.sqft.toLocaleString()} sq ft` : ''}`;

  // Build appendix service list
  const appendixRefs: Paragraph[] = [];
  if (input.appendixA.enabled) {
    appendixRefs.push(indentPara(`a. ${input.appendixA.title} (See Appendix A for specific terms, conditions, rates and charges);`));
  }
  if (input.appendixB.enabled) {
    appendixRefs.push(indentPara(`b. ${input.appendixB.title} (See Appendix B for specific terms, conditions, rates and charges);`));
  }
  if (input.appendixC.enabled) {
    appendixRefs.push(indentPara(`c. ${input.appendixC.title} (See Appendix C for specific terms, conditions, rates and charges).`));
  }
  if (input.appendixD.enabled) {
    appendixRefs.push(indentPara(`d. Volume Projections and Assumptions Specific Terms and Conditions (See Appendix D).`));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN AGREEMENT BODY
  // ═══════════════════════════════════════════════════════════════════════════

  const mainBody: (Paragraph | Table)[] = [
    // Title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [new TextRun({ text: 'CUSTOMER SERVICES AGREEMENT', font: FONT, size: TITLE_SIZE, bold: true })],
    }),
    spacer(),

    // Preamble
    normalPara(
      `This Customer Services Agreement ("Agreement") is entered into as of ${effectiveDate}, ` +
      `by and between ${LM_ENTITY.name}, ${LM_ENTITY.entityType} with a primary address ` +
      `of ${facility.fullAddress} ("L&M"), and ${customerLegalName}${customerEntityType} with a primary business address of ` +
      `${customerAddress} ("Customer"). L&M and Customer may be referred to hereinafter individually as a "Party," and collectively as the "Parties".`
    ),

    spacer(),
    boldPara('RECITALS', AlignmentType.CENTER),

    indentPara('A. WHEREAS, L&M provides end-to-end warehousing, storage and shipping services;'),
    indentPara('B. WHEREAS, Customer desires to engage L&M to provide the storage space, materials, handling, order fulfillment, and personnel necessary for the receipt, storage, and delivery of its goods ("Goods");'),
    indentPara('C. WHEREAS, L&M has such space available and the facilities and personnel to provide the services required;'),

    spacer(),
    boldPara('AGREEMENT', AlignmentType.CENTER),

    normalPara(
      'NOW, THEREFORE, for good and valuable consideration, the receipt and sufficiency of which are acknowledged by and through this Agreement, L&M and Customer, for themselves, their successors and assigns, agree as follows:'
    ),

    // ─── 1. Term and Termination ──────────────────────────────────────────
    mixedPara([{ text: '1. Term and Termination.', bold: true }]),

    indentMixed([
      { text: 'a. ', bold: true },
      { text: `The Term of this Agreement shall commence on ${effectiveDate} ("Effective Date"), and terminate on ${termEndDate}. The Term of this Agreement will auto-renew on an annual basis if not terminated pursuant the terms herein.` },
    ]),

    indentMixed([
      { text: 'b. ', bold: true },
      { text: `Either Party may terminate this Agreement at the end of any Term by providing at least ${noticeDays} days written notice prior to the end of the Term, except that after the initial Term Customer may terminate this Agreement for any or no reason on ${noticeDays} days written notice.` },
    ]),

    indentMixed([
      { text: 'c. ', bold: true },
      { text: 'Either Party may terminate this Agreement upon written notice to the other Party if:' },
    ]),

    indentPara('(i) the other Party materially breaches this Agreement and has not cured such breach to the reasonable satisfaction of the Party giving notice within thirty (30) days;', 2),
    indentPara('(ii) the other Party becomes insolvent, files for bankruptcy, or makes an assignment for the benefit of creditors;', 2),
    indentPara('(iii) the other Party ceases to conduct business in the normal course.', 2),

    indentMixed([
      { text: 'd. ', bold: true },
      { text: 'Upon termination of this Agreement:' },
    ]),

    indentPara("(i) L&M shall return all of Customer's Goods in its possession within 30 days of termination, subject to payment of all undisputed outstanding amounts owed;", 2),
    indentPara('(ii) Each Party shall return or destroy all Confidential Information of the other Party; and', 2),
    indentPara('(iii) The provisions of this Agreement that by their nature are intended to survive termination shall survive.', 2),

    // ─── 2. Services ──────────────────────────────────────────────────────
    mixedPara([
      { text: '2. Services. ', bold: true },
      { text: 'L&M shall provide the below listed warehousing and fulfillment services, and other services agreed to in writing by the Parties, required for the distribution and/or care of the Goods in domestic transit (the "Services"). Along with the general terms set forth in the main body of this Agreement, the terms specific to each Service provided to Customer by L&M are set forth in each applicable document below as follows:' },
    ]),

    ...appendixRefs,

    // ─── 3. Facilities ────────────────────────────────────────────────────
    mixedPara([
      { text: '3. Facilities. ', bold: true },
      { text: `L&M shall perform the Services in its facility located at: ${facilityDesc}` },
    ]),

    // ─── 4. General Terms ─────────────────────────────────────────────────
    mixedPara([{ text: '4. General Terms Related to Services.', bold: true }]),

    indentMixed([
      { text: 'a. Compliance with Applicable Laws. ', bold: true },
      { text: 'Both Customer and L&M shall comply with all applicable laws, rules and regulations relating to the performance of the Services, including but not limited to those governing warehousing, transportation, packaging, and labor practices.' },
    ]),

    indentMixed([
      { text: 'b. Special Instructions. ', bold: true },
      { text: 'The parties acknowledge that special services or instructions may occasionally arise with respect to the Services. In such event, Customer shall provide L&M with written requests as to its needs for such special service, and L&M may provide the requested service upon payment by Customer of the associated charge for such services.' },
    ]),

    indentMixed([
      { text: 'c. Control. ', bold: true },
      { text: 'L&M shall have sole and exclusive control over the manner in which L&M performs the Services, and L&M shall utilize such persons and/or entities as L&M deems necessary in connection therewith.' },
    ]),

    indentMixed([
      { text: 'd. Service Standards. ', bold: true },
      { text: "L&M warrants that all Services provided under this Agreement shall be performed in a professional and workmanlike manner, consistent with industry best practices for logistics and fulfillment providers. Without limiting the foregoing, L&M will perform the Services in accordance with the Appendices attached hereto. The Parties will review service levels and appropriate credits upon request of Customer." },
    ]),

    indentMixed([
      { text: 'e. Product Handling. ', bold: true },
      { text: "L&M represents that all of Customer's Goods shall be stored, packed, and handled with due care, using industry-accepted materials and practices to prevent damage, contamination, or deterioration. L&M shall ensure that all personnel involved in handling of Customer's Goods receive appropriate training in the handling and packing of fragile and perishable items." },
    ]),

    // ─── 5. Rates and Charges ─────────────────────────────────────────────
    mixedPara([{ text: '5. Rates and Charges.', bold: true }]),

    indentMixed([
      { text: 'a. Rates and Charges. ', bold: true },
      { text: 'In consideration of the Services performed, L&M shall charge Customer the rates, charges and minimums set forth in Appendices to this Agreement.' },
    ]),

    indentMixed([
      { text: 'b. Invoice Terms. ', bold: true },
      { text: `L&M will invoice Customer on a monthly basis. Except as otherwise provided in the Agreement, and except with respect to charges disputed by Customer in good faith, payment shall be due from Customer within ${paymentDays} calendar days from the date of invoice by L&M. If payment is not made within ${paymentDays} days, Customer agrees that interest shall accrue daily and be payable to L&M at the interest rate of the lesser of one percent (1%) per month or the highest amount permitted by law, together with any and all reasonable and verifiable collection costs, including attorney fees. The parties agree that any payments made hereunder are made in payment of debts incurred in the ordinary course of business and are made according to ordinary business terms.` },
    ]),

    indentMixed([
      { text: 'c. Increases. ', bold: true },
      { text: `Rates are subject to an annual increase upon review of service levels and percentage change to the Consumer Price Index, up to ${annualIncrease} percent (${annualIncrease}%) annually.` },
    ]),

    indentMixed([
      { text: 'd. Overcharge and Undercharge Claims. ', bold: true },
      { text: 'No action or claim to recover any overcharge or undercharge for Services may be brought by either party more than one hundred eighty (180) days after discovery.' },
    ]),

    indentMixed([
      { text: 'e. ', bold: true },
      { text: '[Intentionally Omitted]' },
    ]),

    indentMixed([
      { text: 'f. Spot Quotes. ', bold: true },
      { text: "The parties understand that additional services and charges other than those set forth herein may periodically arise. In those circumstances, L&M shall spot quote the requested services in writing, which shall become the applicable rate upon L&M receiving written acceptance of the spot quote from Customer. Upon written request from Customer, L&M shall include with its invoice for the spot quote a copy of the written acceptance. Unless the spot quote and the written acceptance clearly indicate that the services provided and the applicable rate are to be on an extended basis (e.g., for the remainder of the Term), the spot quote will apply only to the immediate services provided. Services provided pursuant to spot quotes will be subject to the terms of this Agreement." },
    ]),
  ];

  // ─── 5.g Security Deposit (conditional) ────────────────────────────────
  if (input.terms.securityDeposit > 0) {
    const depositAmt = `$${input.terms.securityDeposit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const depositTerms = input.terms.securityDepositTerms || (
      `Due to the Client's lack of established credit history, the Client shall provide a security deposit of ${depositAmt} upon execution of this Agreement. This deposit will be held by the Company as security for the Client's payment obligations. If the Client makes all payments in full and on time for a consecutive period of ninety (90) days, the deposit will be credited toward the Client's account balance or applied to future invoices. If the Client fails to make any payment on time, a $250 administrative fee will be deducted from the deposit for each occurrence. Upon a third payment failure or delay within the ninety (90) day period, the entire remaining deposit shall be forfeited to the Company, and the Client shall have no further claim to its return or credit. The forfeiture shall be in addition to, and not in lieu of, any other rights or remedies available to the Company under this Agreement.`
    );
    mainBody.push(indentMixed([
      { text: 'g. Credit Worthiness. ', bold: true },
      { text: depositTerms },
    ]));
  }

  // ─── 6-14: Standard Clauses ─────────────────────────────────────────────
  mainBody.push(
    // 6. Transportation Document
    mixedPara([
      { text: '6. Transportation Document. ', bold: true },
      { text: "Any shipment(s) of Customer's Goods under this Agreement shall be evidenced by one or more Transportation Document, which may include, but not be limited to, bills of lading, ocean bills of lading, warehouse receipts, manifests and/or any other Document purporting to control the custody and/or movement of the Goods (collectively, the \"Transportation Document\"), showing the kind, quantity and condition of the Goods received and delivered by L&M at the loading and unloading points, respectively. Except as provided herein, to the extent any term or condition of such Transportation Document conflicts in any way with any term or condition of this Agreement, this Agreement shall govern. In the event that L&M shall issue a through bill of lading to the ultimate destination, L&M shall be liable to Customer for loss or damage in accordance with the terms of this Agreement regardless of the number of separate contracts of carriage entered into by L&M with Subcontractors, if any." },
    ]),

    // 7. Title to and Risk of Loss
    mixedPara([
      { text: '7. Title to and Risk of Loss of the Goods. ', bold: true },
      { text: "Unless otherwise expressly agreed to by the Parties in writing, L&M shall not acquire title to or assume risk of loss for any of the Goods on behalf of Customer, and shall not, in the course of providing the Services in accordance with this Agreement, acquire title to or assume risk of loss for, or be deemed to have acquired title to or assumed risk of loss for, the Goods." },
    ]),

    // 8. Insurance
    mixedPara([
      { text: '8. Insurance. ', bold: true },
      { text: 'During the Term of this Agreement, L&M shall place and maintain in full force and effect the types and amount of insurance coverage set forth below:' },
    ]),

    indentPara('a. Commercial general liability insurance for bodily injury and property damage in the amount of $1,000,000 per occurrence.'),
    indentPara("b. Warehouseman's legal liability insurance in the amount of $1,000,000 per occurrence;"),
    indentPara('c. Cargo liability insurance coverage of not less than $________ per occurrence; and'),
    indentPara('d. Worker\'s compensation insurance in accordance with statutory law.'),

    normalPara('At the request of Customer, L&M shall deliver to Customer certificates of insurance.'),

    // 9. Cargo Loss or Damage
    mixedPara([{ text: '9. Cargo Loss or Damage.', bold: true }]),

    indentMixed([
      { text: 'a. ', bold: true },
      { text: "Except as otherwise set forth in Paragraph 8(a)(ii) below, L&M shall ensure that, with respect to any portion of services provided within the United States, motor carriers and rail carriers assume liability as a common carrier (i.e. Carmack Amendment liability under 49 U.S.C. § 14706) for loss or damage of any and all of the Goods while under such carrier's care, custody or control, notwithstanding that a bill of lading, circular or tariff of a Subcontractor may state otherwise, subject to the standard exceptions to common carrier liability. For any portion of the Services provided outside the United States, L&M shall insure that motor carriers and rail carriers assume liability for loss or damage in accordance with the laws governing said Services." },
    ]),

    indentMixed([
      { text: 'b. ', bold: true },
      { text: 'L&M shall ensure that indirect and direct air carriers assume liability for international air freight in accordance with the rules of the Warsaw Convention, as amended or altered by any applicable protocol adopted or ratified by the United States, and for any United States domestic shipments in accordance with common carrier liability.' },
    ]),

    indentMixed([
      { text: 'c. ', bold: true },
      { text: "With respect to transportation of the Goods, L&M's liability shall be in accordance with the applicable statutory liability standards for the particular mode of transportation described above. In the event L&M issues the pertinent Transportation Document in its name and is acting as a surface freight forwarder or freight broker, L&M shall be liable for any loss or damage of Goods subject to any liability limitations set forth in this Agreement and/or Transportation Document. In the event L&M does not issue the Transportation Document or is acting as an air or ocean freight forwarder or property broker, L&M shall not have liability for any loss or damage of Goods, all such liability shall be borne by the applicable Subcontractor in accordance with the terms of this Agreement." },
    ]),

    indentMixed([
      { text: 'd. ', bold: true },
      { text: 'Notwithstanding anything to the contrary in this Agreement, in no event shall L&M be liable to Customer for loss of profits or business, or any indirect, special, consequential, or punitive damages.' },
    ]),

    indentMixed([
      { text: 'e. ', bold: true },
      { text: "If L&M, due to no fault of its own, is unable to deliver a shipment of Goods, or if a shipment of Goods is refused by the consignee, L&M shall be liable for the Goods solely to the extent it is acting as a warehouseman." },
    ]),

    indentMixed([
      { text: 'f. ', bold: true },
      { text: "Any claim made by Customer against L&M for loss or damage to the Goods shall be subject to the following procedures:" },
    ]),

    indentPara("(i) Customer shall notify L&M promptly once Customer discovers a possible cargo loss or damage claim. The parties agree that Customer shall have sixty (60) days after delivery of the shipment of Goods or, if no delivery, the scheduled delivery date, to file a written claim for loss or damage to the shipment. The term \"written claim\" means delivering a written claim or notice of claim which reasonably notifies L&M that loss or damage has occurred to the shipment of Goods, and the nature of the problem.", 2),

    indentPara(`(ii) Each claim filed against L&M shall be promptly investigated by L&M. L&M shall pay each claim, decline payment with explanation, or make a compromise settlement offer, or reasonably request additional information in writing, within ninety (90) days after the receipt of the claim by Customer. L&M limits the liability of the value of a shipment to $${liabilityPerCarton.toFixed(2)} per carton.`, 2),

    indentPara('(iii) Any action at law to recover any cargo claim shall be instituted by Customer against L&M no later than one (1) year after a written declination of claim has been delivered to Customer by L&M.', 2),

    indentPara("(iv) Customer shall not off-set claims against other charges from L&M without L&M's written permission.", 2),

    indentPara("(v) Any salvage value shall be deducted from Customer's claim against L&M for the loss or damage. If Customer chooses to not sell or allow the sale of Goods for salvage, the reasonable salvage value shall be deducted from the claim amount due Customer. With respect to the handling of any damaged Goods, L&M agrees that Customer shall have the right to dispose of or destroy such Goods within ninety (90) business days of Customer providing L&M with written notice of L&M's right to inspect the damaged Goods. Customer agrees to provide L&M with an inspection notification form with pertinent information regarding the damage and the location where the Goods may be inspected if so desired by L&M.", 2),

    indentMixed([
      { text: 'g. ', bold: true },
      { text: "L&M shall not be liable for service delays. Unless responsibility is expressly assumed in writing by L&M, Customer shall be responsible for procuring and reinstating any additional insurance coverage to reduce or eliminate any potential loss exposure." },
    ]),

    // 10. Indemnification by L&M
    mixedPara([
      { text: '10. Indemnification by L&M. ', bold: true },
      { text: "L&M shall indemnify, defend, and hold Customer harmless from and against any and all third-party claims, demands, damages, losses, liabilities, costs or expenses, including without limitation reasonable attorneys' fees (collectively, the \"Third Party Claims\") with respect to:" },
    ]),

    indentPara("a. any actual loss, damage to or destruction of tangible property (including the Goods), and/or illness, injury or death to any person, arising out of L&M's negligent acts or omissions; and"),
    indentPara('b. any violation by L&M of applicable laws or regulations, or breach of any terms of this Agreement.'),

    normalPara("L&M shall not have a duty of indemnification to the extent that the Third Party Claims arise due to the grossly negligent or willful act or omission of Customer. Except with respect to its indemnification obligations hereunder, L&M shall not be liable for any incidental, special, exemplary, consequential, or punitive damages, whether direct or indirect, including but not limited to loss of income, opportunity, or profits, in excess of the limitations of liability contained herein, regardless of whether L&M had knowledge that such damages might be incurred."),

    // 11. Indemnification by Customer
    mixedPara([
      { text: '11. Indemnification by Customer. ', bold: true },
      { text: 'Customer will indemnify, defend, and hold L&M harmless from and against any and all Third Party Claims with respect to:' },
    ]),

    indentPara("a. any actual loss, damage to or destruction of tangible property, and/or illness, injury or death to any person, arising out of Customer's acts or omissions; and"),
    indentPara('b. any violation by Customer of applicable laws or regulations, or breach of the terms of this Agreement or the Document.'),

    normalPara("Customer shall not have a duty of indemnification to the extent that the Third Party Claims arise due to the grossly negligent or willful act or omission of L&M. Except with respect to its indemnification obligations hereunder, Customer shall not be liable for any incidental, special, exemplary, consequential, or punitive damages, whether direct or indirect, including but not limited to loss of income, opportunity, or profits, in excess of the limitations of liability contained herein, regardless of whether Customer had knowledge that such damages might be incurred."),

    // 12. Information Systems
    mixedPara([{ text: '12. Information Systems and Proprietary Information.', bold: true }]),

    indentMixed([
      { text: 'a. Information Services Provided. ', bold: true },
      { text: "Any management information system or computer hardware or software used or supplied by L&M in connection with the Services provided under this Agreement is and will remain L&M's exclusive property. Neither the use nor any access to such systems or property by the Customer will convey to Customer any use, license or ownership rights in L&M's property." },
    ]),

    indentMixed([
      { text: 'b. Proprietary Information. ', bold: true },
      { text: 'The parties agree and understand that they have or may gain confidential and/or proprietary information and/or trade secrets (the "Proprietary Information") of the other Party during the term of this Agreement. The parties agree that all Proprietary Information of one Party known or obtained by the other shall be kept confidential and shall not be disclosed or permitted to be disclosed to any third party without prior written authorization from the other Party or unless otherwise required by law. For purposes of this provision, Proprietary Information shall include, but not be limited to, technical information including computer software and systems, report formats, pricing and financial information, and management information systems.' },
    ]),

    // 13. Accurate Information
    mixedPara([
      { text: '13. Accurate Information. ', bold: true },
      { text: "Each Party shall provide the other with complete, accurate and timely information regarding the Goods to be transported and/or stored. Each Party shall indemnify, defend and hold harmless the other, its officers, employees, agents and insurers, against all third-party claims, liabilities, losses, fines, reasonable attorney fees and other expenses arising out of or caused by incomplete, inaccurate and/or untimely information." },
    ]),

    // 14. Miscellaneous
    mixedPara([{ text: '14. Miscellaneous.', bold: true }]),

    indentMixed([
      { text: 'a. Force Majeure. ', bold: true },
      { text: "Neither Party, nor any subcontractor utilized to provide Services under this Agreement, shall be liable to the other Party for failing to perform or discharge any obligation of this Agreement where such failure is caused by acts of God, labor disorders, fire, weather, closing of public highways, government interference and/or other causes beyond the Party's control or outside of the Party's standard of care." },
    ]),

    indentMixed([
      { text: 'b. Successors and Assigns. ', bold: true },
      { text: "This Agreement is binding and for the benefit of both Parties and their respective successors and permitted assigns. Neither Party may assign this Agreement without the written consent of the other Party, except that either Party may, without consent, assign this Agreement to a subsidiary or other related company or in the event of a sale of all or substantially all of such Party's stock, assets or business to which this Agreement relates." },
    ]),

    indentMixed([
      { text: 'c. Waiver. ', bold: true },
      { text: "Either Party's failure to strictly enforce any provision of this Agreement shall not be construed as a waiver of that provision and shall not excuse the other Party from future performance." },
    ]),

    indentMixed([
      { text: 'd. Notices. ', bold: true },
      { text: 'All notices required or permitted under this Agreement must be in writing (unless otherwise indicated in this Agreement) either emailed, telefaxed, sent via overnight courier, hand delivered or sent via certified mail, return receipt requested, postage prepaid, to the address or telefax number set forth below. Telefaxes, email, overnight courier and hand delivered notices will be effective upon actual receipt. Certified mail notices will be effective on the third business day after the mailing date.' },
    ]),

    indentMixed([
      { text: 'e. Entire Agreement. ', bold: true },
      { text: "This Agreement represents the entire agreement of the Parties with respect to its subject matter, and supersedes all prior proposals, agreements, oral representations, memoranda or understandings with respect to this Agreement or its subject matter. Any future modification, representation, agreement, understanding or waiver will be binding only if in writing signed by the Parties sought to be bound. The Parties' intent is that this Agreement constitutes the complete and exclusive statement of its terms and that no extensive evidence whatsoever may be introduced in any judicial or arbitration proceeding, if any, involving this Agreement." },
    ]),

    indentMixed([
      { text: 'f. Additional Document. ', bold: true },
      { text: 'The Appendices to this Agreement, and the Rate Sheet, are part of and subject to this Agreement.' },
    ]),

    indentMixed([
      { text: 'g. Applicable Law. ', bold: true },
      { text: `All civil actions filed as a result of disputes arising out of this Agreement shall be filed in the court of proper jurisdiction in ${LEGAL_JURISDICTION}, and the laws of the State of ${LEGAL_JURISDICTION_STATE} or applicable federal law shall apply. If any provision in this Agreement violates any applicable law, that provision will be ineffective to the extent of the violation without invalidating any other provision of this Agreement.` },
    ]),

    indentMixed([
      { text: 'h. Signatures. ', bold: true },
      { text: 'The parties have executed this Agreement as of the date set forth above.' },
    ]),

    // Signature Block
    spacer(),
    normalPara('IN WITNESS WHEREOF, the Parties have caused this Agreement to be signed by their duly authorized representatives:', AlignmentType.LEFT),
    spacer(),
    signatureTable(customerDisplayName),
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // APPENDIX A
  // ═══════════════════════════════════════════════════════════════════════════

  const appendixAContent: (Paragraph | Table)[] = [];
  if (input.appendixA.enabled) {
    appendixAContent.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: 'APPENDIX A', font: FONT, size: HEADING_SIZE, bold: true })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: input.appendixA.title.toUpperCase(), font: FONT, size: 24, bold: true })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: `${customerDisplayName.toUpperCase()} SPECIFIC TERMS AND CONDITIONS`, font: FONT, size: FONT_SIZE, bold: true })],
      }),
      spacer(),

      // 1. Storage Specifications
      boldPara('1. STORAGE SPECIFICATIONS'),
      mixedPara([{ text: '1.1 Product Storage Requirements', bold: true }]),
    );

    for (const req of input.appendixA.storageRequirements) {
      appendixAContent.push(indentPara(`- ${req}`));
    }

    appendixAContent.push(
      mixedPara([{ text: '1.2 Product Specifications', bold: true }]),
      normalPara(`L&M shall provide warehousing services for the following ${customerDisplayName} products:`),
    );

    if (input.appendixA.productCategory) {
      appendixAContent.push(indentPara(input.appendixA.productCategory));
    }
    if (input.appendixA.palletConfig) {
      appendixAContent.push(indentPara(`Pallet configuration: ${input.appendixA.palletConfig}`));
    }

    // 2. Inventory Management
    appendixAContent.push(
      spacer(),
      boldPara('2. INVENTORY MANAGEMENT'),
      mixedPara([{ text: '2.1 Inventory Reporting', bold: true }]),
      indentPara('- L&M shall provide daily inventory reports for all products'),
      indentPara('- Reports shall include beginning inventory, receipts, shipments, adjustments, and ending inventory by SKU'),
      indentPara('- L&M shall provide cycle count reports with accuracy metrics'),
      indentPara('- L&M shall conduct full physical inventory counts annually'),

      mixedPara([{ text: '2.2 Lot Control and Traceability', bold: true }]),
      indentPara(`- L&M shall maintain lot control for all ${customerDisplayName} products`),
      indentPara('- Products shall be stored and shipped using First-In-First-Out (FIFO) methodology'),
      indentPara('- L&M shall maintain traceability records in compliance with requirements'),
    );

    // 3. Handling Procedures
    appendixAContent.push(
      spacer(),
      boldPara('3. HANDLING PROCEDURES'),
      mixedPara([{ text: '3.1 Receiving', bold: true }]),
      indentPara('- L&M shall inspect all incoming shipments for damage and count accuracy'),
      indentPara('- Any discrepancies shall be reported to client within 48 hours of receipt'),
      indentPara('- L&M shall provide receiving reports including photos of any damaged product'),

      mixedPara([{ text: '3.2 Product Handling', bold: true }]),
    );

    for (const proc of input.appendixA.handlingProcedures) {
      appendixAContent.push(indentPara(`- ${proc}`));
    }

    appendixAContent.push(
      mixedPara([{ text: '3.3 Order Fulfillment', bold: true }]),
      indentPara(`- Orders shall be processed same day with a cut off of ${input.terms.slaCutoffTime}`),
      indentPara('- Freight orders shall be processed within a 48-hour window'),
      indentPara('- L&M shall verify order accuracy before shipping'),
      indentPara('- L&M shall provide order confirmation and tracking information to Customer'),
    );

    // 4. Pallet Configuration
    appendixAContent.push(
      spacer(),
      boldPara('4. PALLET CONFIGURATION'),
      mixedPara([{ text: '4.1 Pallet Specifications', bold: true }]),
      indentPara('- All products shall be stored on standard 48" x 40" GMA pallets'),
      indentPara(input.appendixA.palletConfig ? `- ${input.appendixA.palletConfig}` : '- Maximum pallet height shall not exceed 60" including the pallet'),
      indentPara('- Pallets shall be labeled with product SKU, description, quantity, and lot number'),
    );

    // 5. Rate Schedule
    appendixAContent.push(
      spacer(),
      boldPara('5. RATE SCHEDULE'),
    );

    if (input.appendixA.storagePricing.length > 0) {
      appendixAContent.push(
        spacer(),
        boldPara(`5.1 Storage Rates (${facility.code} ${facility.city})`),
        pricingTable(
          ['Service', 'Rate', 'Unit / Notes'],
          input.appendixA.storagePricing.map(p => [p.service, p.rate, p.notes || '']),
        ),
      );
    }

    if (input.appendixA.handlingPricing.length > 0) {
      appendixAContent.push(
        spacer(),
        boldPara('5.2 Handling & Labor Rates'),
        pricingTable(
          ['Service', 'Rate', 'Unit / Notes'],
          input.appendixA.handlingPricing.map(p => [p.service, p.rate, p.notes || '']),
        ),
      );
    }

    if (input.appendixA.fulfillmentPricing.length > 0) {
      appendixAContent.push(
        spacer(),
        boldPara('5.3 E-Com / Order Fulfillment'),
        pricingTable(
          ['Service', 'Rate', 'Unit / Notes'],
          input.appendixA.fulfillmentPricing.map(p => [p.service, p.rate, p.notes || '']),
        ),
      );
    }

    if (input.appendixA.laborPricing.length > 0) {
      appendixAContent.push(
        spacer(),
        boldPara('5.4 Labor Rates'),
        pricingTable(
          ['Service', 'Rate', 'Unit / Notes'],
          input.appendixA.laborPricing.map(p => [p.service, p.rate, p.notes || '']),
        ),
      );
    }

    // 6. Facility Designation
    appendixAContent.push(
      spacer(),
      boldPara('6. FACILITY DESIGNATION'),
      normalPara('L&M shall perform the Warehousing and Fulfillment Services at its facility located at:'),
      indentPara(`${facility.code} (${facility.city}, ${facility.state}) — ${storageTypeLabel}${facility.sqft ? ' — ' + facility.sqft.toLocaleString() + ' sq ft' : ''}`),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // APPENDIX B
  // ═══════════════════════════════════════════════════════════════════════════

  const appendixBContent: (Paragraph | Table)[] = [];
  if (input.appendixB.enabled) {
    appendixBContent.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: 'APPENDIX B', font: FONT, size: HEADING_SIZE, bold: true })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: input.appendixB.title.toUpperCase(), font: FONT, size: 24, bold: true })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: `${customerDisplayName.toUpperCase()} SPECIFIC TERMS AND CONDITIONS`, font: FONT, size: FONT_SIZE, bold: true })],
      }),
      spacer(),

      boldPara('1. CO-PACK / REPACK SPECIFICATIONS'),
      mixedPara([{ text: '1.1 Product Packing Requirements', bold: true }]),
    );

    for (const req of input.appendixB.packingRequirements) {
      appendixBContent.push(indentPara(`- ${req}`));
    }

    appendixBContent.push(
      spacer(),
      boldPara('2. RATE SCHEDULE'),
      pricingTable(
        ['Service', 'Rate', 'Unit / Notes'],
        input.appendixB.pricing.map(p => [p.service, p.rate, p.notes || '']),
      ),
    );

    if (input.appendixB.forecastNotes) {
      appendixBContent.push(
        spacer(),
        normalPara(input.appendixB.forecastNotes),
      );
    }

    appendixBContent.push(
      spacer(),
      boldPara('3. PRODUCTION / FULFILLMENT PLANNING'),
      mixedPara([{ text: '3.1 Forecasting', bold: true }]),
      indentPara(`- Customer shall provide L&M with a rolling forecast of co-packing/repack requirements`),
      indentPara('- L&M shall schedule co-packing activities based on the forecast and available inventory'),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // APPENDIX C
  // ═══════════════════════════════════════════════════════════════════════════

  const appendixCContent: (Paragraph | Table)[] = [];
  if (input.appendixC.enabled) {
    appendixCContent.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: 'APPENDIX C', font: FONT, size: HEADING_SIZE, bold: true })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: input.appendixC.title.toUpperCase(), font: FONT, size: 24, bold: true })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: `${customerDisplayName.toUpperCase()} SPECIFIC TERMS AND CONDITIONS`, font: FONT, size: FONT_SIZE, bold: true })],
      }),
      spacer(),

      boldPara('1. VALUE-ADDED SERVICES RATE SCHEDULE'),
      pricingTable(
        ['Service', 'Rate', 'Unit / Notes'],
        input.appendixC.valueAddedPricing.map(p => [p.service, p.rate, p.notes || '']),
      ),

      spacer(),
      boldPara('2. TRANSPORTATION SPECIFICATIONS'),
      mixedPara([{ text: '2.1 Product Transportation Requirements', bold: true }]),
    );

    for (const req of input.appendixC.transportRequirements) {
      appendixCContent.push(indentPara(`- ${req}`));
    }

    appendixCContent.push(
      mixedPara([{ text: '2.2 Product Handling During Transit', bold: true }]),
      indentPara('- All products must be properly secured to prevent shifting during transit'),
      indentPara('- Pallets must be wrapped with clear stretch film with minimum 3 wraps'),
      indentPara('- Products must be loaded to prevent crushing or damage'),
    );

    appendixCContent.push(
      spacer(),
      boldPara('3. CARRIER SELECTION AND MANAGEMENT'),
      mixedPara([{ text: '3.1 Approved Carriers', bold: true }]),
    );

    for (const req of input.appendixC.carrierRequirements) {
      appendixCContent.push(indentPara(`- ${req}`));
    }

    appendixCContent.push(
      mixedPara([{ text: '3.2 Carrier Performance Management', bold: true }]),
      indentPara('- L&M shall monitor carrier performance including on-time delivery and product condition'),
      indentPara('- L&M shall address any carrier performance issues promptly'),
    );

    if (input.appendixC.additionalCharges.length > 0) {
      appendixCContent.push(
        spacer(),
        boldPara('4. ADDITIONAL CHARGES'),
        pricingTable(
          ['Service', 'Description', 'Cost'],
          input.appendixC.additionalCharges.map(p => [p.service, p.notes || '', p.rate]),
        ),
      );
    }

    appendixCContent.push(
      spacer(),
      normalPara(`Rates are effective for 12 months from the commencement date. All rates are subject to a fuel surcharge based on the current DOE fuel index. Accessorial charges are in addition to base rates. Payment terms: Net ${paymentDays} days.`),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // APPENDIX D
  // ═══════════════════════════════════════════════════════════════════════════

  const appendixDContent: (Paragraph | Table)[] = [];
  if (input.appendixD.enabled) {
    appendixDContent.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: 'APPENDIX D', font: FONT, size: HEADING_SIZE, bold: true })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: 'VOLUME PROJECTIONS AND ASSUMPTIONS', font: FONT, size: 24, bold: true })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: `${customerDisplayName.toUpperCase()} SPECIFIC TERMS AND CONDITIONS`, font: FONT, size: FONT_SIZE, bold: true })],
      }),
      spacer(),

      boldPara('VOLUME PROJECTIONS AND ASSUMPTIONS'),
      normalPara(input.appendixD.volumeProjection),
    );

    if (input.appendixD.rateLevelerPercent > 0) {
      appendixDContent.push(
        normalPara(`If volume does not materialize to expected levels within the first six (6) months, L&M may choose to implement rate leveler increases of up to ${input.appendixD.rateLevelerPercent}%. Significant volume changes (±25%) may require operational adjustments and rate review.`),
      );
    }

    for (let i = 0; i < input.appendixD.assumptions.length; i++) {
      appendixDContent.push(indentPara(`${i + 1}. ${input.appendixD.assumptions[i]}`));
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BUILD DOCUMENT
  // ═══════════════════════════════════════════════════════════════════════════

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT,
            size: FONT_SIZE,
          },
          paragraph: {
            spacing: { after: 120, line: 276 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
            },
          },
        },
        children: [
          ...mainBody,
          ...appendixAContent,
          ...appendixBContent,
          ...appendixCContent,
          ...appendixDContent,
        ] as (Paragraph | Table)[],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
