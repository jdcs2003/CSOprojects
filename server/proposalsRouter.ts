import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getUserPermissions } from "./db";
import { TRPCError } from "@trpc/server";
import { hasRoleAtLeast } from "@shared/permissions";
import { storagePut } from './storage';
import { generateContractDocx } from './contractGenerator';
import type { ContractGenerationInput } from '../shared/contractConfig';
import { FACILITIES } from '../shared/contractConfig';

export const proposalsRouter = router({
  // Generate a contract DOCX from pricing/proposal data
  generateContract: protectedProcedure
    .input(z.object({
      // Customer info
      companyName: z.string().min(1),
      tradeName: z.string().optional(),
      legalName: z.string().optional(),
      entityType: z.string().optional(),
      customerAddress: z.string().optional(),
      customerCity: z.string().optional(),
      customerState: z.string().optional(),
      customerZip: z.string().optional(),
      contactName: z.string().optional(),
      contactEmail: z.string().optional(),
      contactPhone: z.string().optional(),
      
      // Facility
      facilityId: z.string().min(1),
      facilityDescription: z.string().optional(),
      
      // Service types
      serviceTypes: z.array(z.enum(['ecommerce', 'pallet-in-out', 'co-packing', 'transportation', 'general'])),
      
      // Terms
      effectiveDate: z.string().optional(),
      terminationDate: z.string().optional(),
      termMonths: z.number().default(12),
      noticeDays: z.number().default(90),
      paymentTermsDays: z.number().default(30),
      annualIncreaseCapPercent: z.number().default(5),
      liabilityPerCarton: z.number().default(50),
      securityDeposit: z.number().default(0),
      securityDepositTerms: z.string().optional(),
      slaCutoffTime: z.string().default('14:00 EST'),
      monthlyMinimum: z.number().default(0),
      monthlyMinimumNotes: z.string().optional(),
      onboardingFee: z.number().default(0),
      
      // Appendix A - Warehousing/Fulfillment
      appendixAEnabled: z.boolean().default(true),
      appendixATitle: z.string().default('WAREHOUSING AND E-COMMERCE FULFILLMENT SERVICES'),
      appendixAProductDescription: z.string().default(''),
      appendixAProductCategory: z.string().optional(),
      appendixAStorageRequirements: z.array(z.string()).default([]),
      appendixAHandlingProcedures: z.array(z.string()).default([]),
      appendixAPalletConfig: z.string().optional(),
      appendixAStoragePricing: z.array(z.object({ service: z.string(), rate: z.string(), notes: z.string().optional() })).default([]),
      appendixAHandlingPricing: z.array(z.object({ service: z.string(), rate: z.string(), notes: z.string().optional() })).default([]),
      appendixAFulfillmentPricing: z.array(z.object({ service: z.string(), rate: z.string(), notes: z.string().optional() })).default([]),
      appendixALaborPricing: z.array(z.object({ service: z.string(), rate: z.string(), notes: z.string().optional() })).default([]),
      
      // Appendix B - Co-Packing
      appendixBEnabled: z.boolean().default(false),
      appendixBTitle: z.string().default('CO-PACKING / REPACK SERVICES'),
      appendixBPackingRequirements: z.array(z.string()).default([]),
      appendixBPricing: z.array(z.object({ service: z.string(), rate: z.string(), notes: z.string().optional() })).default([]),
      appendixBForecastNotes: z.string().optional(),
      
      // Appendix C - Transportation/VAS
      appendixCEnabled: z.boolean().default(false),
      appendixCTitle: z.string().default('TRANSPORTATION AND VALUE-ADDED SERVICES'),
      appendixCValueAddedPricing: z.array(z.object({ service: z.string(), rate: z.string(), notes: z.string().optional() })).default([]),
      appendixCTransportRequirements: z.array(z.string()).default([]),
      appendixCCarrierRequirements: z.array(z.string()).default([]),
      appendixCAdditionalCharges: z.array(z.object({ service: z.string(), rate: z.string(), notes: z.string().optional() })).default([]),
      
      // Appendix D - Volume Projections
      appendixDEnabled: z.boolean().default(false),
      appendixDVolumeProjection: z.string().default(''),
      appendixDRateLevelerPercent: z.number().default(20),
      appendixDAssumptions: z.array(z.string()).default([]),
      
      // Link to proposal
      proposalSlug: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!hasRoleAtLeast(ctx.user.role, 'admin')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }

      // Validate facility
      if (!FACILITIES[input.facilityId]) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: `Unknown facility: ${input.facilityId}` });
      }

      // Build the ContractGenerationInput
      const contractInput: ContractGenerationInput = {
        customer: {
          companyName: input.companyName,
          tradeName: input.tradeName,
          legalName: input.legalName,
          entityType: input.entityType,
          address: input.customerAddress,
          city: input.customerCity,
          state: input.customerState,
          zip: input.customerZip,
          contactName: input.contactName,
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone,
        },
        facilityId: input.facilityId,
        facilityDescription: input.facilityDescription,
        serviceTypes: input.serviceTypes,
        terms: {
          effectiveDate: input.effectiveDate || '___________',
          terminationDate: input.terminationDate,
          termMonths: input.termMonths,
          noticeDays: input.noticeDays,
          autoRenew: true,
          paymentTermsDays: input.paymentTermsDays,
          annualIncreaseCapPercent: input.annualIncreaseCapPercent,
          liabilityPerCarton: input.liabilityPerCarton,
          securityDeposit: input.securityDeposit,
          securityDepositTerms: input.securityDepositTerms,
          slaCutoffTime: input.slaCutoffTime,
          monthlyMinimum: input.monthlyMinimum,
          monthlyMinimumNotes: input.monthlyMinimumNotes,
          onboardingFee: input.onboardingFee,
        },
        appendixA: {
          enabled: input.appendixAEnabled,
          title: input.appendixATitle,
          productDescription: input.appendixAProductDescription,
          productCategory: input.appendixAProductCategory,
          storageRequirements: input.appendixAStorageRequirements.length > 0
            ? input.appendixAStorageRequirements
            : ['All products shall be stored away from direct sunlight', 'Products must be stored in accordance with all applicable regulations'],
          handlingProcedures: input.appendixAHandlingProcedures.length > 0
            ? input.appendixAHandlingProcedures
            : ['All products shall be handled with care to prevent damage', 'Staff must be trained in proper handling procedures'],
          palletConfig: input.appendixAPalletConfig,
          facilityCode: input.facilityId,
          storagePricing: input.appendixAStoragePricing,
          handlingPricing: input.appendixAHandlingPricing,
          fulfillmentPricing: input.appendixAFulfillmentPricing,
          laborPricing: input.appendixALaborPricing,
        },
        appendixB: {
          enabled: input.appendixBEnabled,
          title: input.appendixBTitle,
          packingRequirements: input.appendixBPackingRequirements.length > 0
            ? input.appendixBPackingRequirements
            : ['All packing activities shall be performed in a clean environment', 'All packing activities must be documented with batch records'],
          pricing: input.appendixBPricing,
          forecastNotes: input.appendixBForecastNotes,
        },
        appendixC: {
          enabled: input.appendixCEnabled,
          title: input.appendixCTitle,
          valueAddedPricing: input.appendixCValueAddedPricing,
          transportRequirements: input.appendixCTransportRequirements.length > 0
            ? input.appendixCTransportRequirements
            : ['Products must be protected from extreme conditions during transit', 'Transportation must comply with all applicable regulations'],
          carrierRequirements: input.appendixCCarrierRequirements.length > 0
            ? input.appendixCCarrierRequirements
            : ['L&M shall use only carriers approved for transportation services', 'All carriers must have appropriate insurance coverage'],
          additionalCharges: input.appendixCAdditionalCharges,
        },
        appendixD: {
          enabled: input.appendixDEnabled,
          title: 'VOLUME PROJECTIONS AND ASSUMPTIONS',
          volumeProjection: input.appendixDVolumeProjection,
          rateLevelerPercent: input.appendixDRateLevelerPercent,
          assumptions: input.appendixDAssumptions,
        },
        proposalSlug: input.proposalSlug,
        generatedBy: ctx.user.email || ctx.user.name || 'admin',
      };

      // Generate DOCX
      const docxBuffer = await generateContractDocx(contractInput);

      // Upload to storage
      const safeCompanyName = input.companyName.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '_');
      const timestamp = Date.now();
      const fileKey = `contracts/${safeCompanyName}_LM_Warehousing_Agreement_${timestamp}.docx`;
      const { url: docxUrl } = await storagePut(
        fileKey,
        docxBuffer,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );

      console.log(`[Contract] Generated for ${input.companyName}: ${docxUrl}`);
      return { success: true, docxUrl };
    }),
});
