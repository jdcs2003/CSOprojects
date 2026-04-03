import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { adminRouter } from "./adminRouter";
import { proposalsRouter } from "./proposalsRouter";
import { z } from "zod";
import { getDb } from "./db";
import { AUTO_APPROVED_DOMAINS } from "@shared/permissions";
import { facilityCapacity, savedQuotes, pipelineDeals, authorizedEmails } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { makeRequest, GeocodingResult } from "./_core/map";

// Email whitelist for access control
const WHITELISTED_EMAILS = [
  "j.stenson@summitskiesinc.com",
  "amoore@lmwarehousing.com",
];

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  admin: adminRouter,
  proposals: proposalsRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Email whitelist access control (checks hardcoded list + DB authorized emails + auto-approved domains)
  access: router({
    checkEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const normalizedEmail = input.email.toLowerCase().trim();
        
        // 1. Check hardcoded whitelist
        const isWhitelisted = WHITELISTED_EMAILS.some(
          (e) => e.toLowerCase() === normalizedEmail
        );
        if (isWhitelisted) return { approved: true, email: normalizedEmail };
        
        // 2. Check auto-approved domains (let them through email gate, but they still
        //    need to be provisioned by admin for full access via ProtectedRoute)
        const domain = normalizedEmail.split('@')[1];
        if (domain && AUTO_APPROVED_DOMAINS.includes(domain)) {
          return { approved: true, email: normalizedEmail };
        }
        
        // 3. Check DB authorized emails
        const db = await getDb();
        if (db) {
          const [authorized] = await db.select().from(authorizedEmails).where(eq(authorizedEmails.email, normalizedEmail)).limit(1);
          if (authorized) return { approved: true, email: normalizedEmail };
        }
        
        return { approved: false, email: normalizedEmail };
      }),
  }),

  // Capacity tracking router
  capacity: router({
    getByMonth: publicProcedure
      .input(z.object({ month: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(facilityCapacity).where(eq(facilityCapacity.month, input.month));
      }),
    
    upsert: publicProcedure
      .input(z.object({
        facilityCode: z.string(),
        facilityName: z.string(),
        month: z.string(),
        totalSquareFeet: z.number(),
        availableSquareFeet: z.number(),
        notes: z.string().optional(),
        updatedBy: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Check if record exists
        const existing = await db.select().from(facilityCapacity)
          .where(and(
            eq(facilityCapacity.facilityCode, input.facilityCode),
            eq(facilityCapacity.month, input.month)
          ));
        
        if (existing.length > 0) {
          // Update existing
          await db.update(facilityCapacity)
            .set({
              availableSquareFeet: input.availableSquareFeet,
              notes: input.notes,
              updatedBy: input.updatedBy,
              updatedAt: new Date(),
            })
            .where(and(
              eq(facilityCapacity.facilityCode, input.facilityCode),
              eq(facilityCapacity.month, input.month)
            ));
        } else {
          // Insert new
          await db.insert(facilityCapacity).values(input);
        }
        
        return { success: true };
      }),
  }),
  
  // ZIP code lookup router
  zipLookup: router({
    getLocation: publicProcedure
      .input(z.object({ zipCode: z.string().length(5) }))
      .query(async ({ input }) => {
        try {
          const result = await makeRequest<GeocodingResult>(
            "/maps/api/geocode/json",
            { address: input.zipCode }
          );
          
          if (result.results && result.results.length > 0) {
            const addressComponents = result.results[0].address_components;
            
            const cityComponent = addressComponents.find((c) => 
              c.types.includes('locality') || c.types.includes('postal_town')
            );
            const stateComponent = addressComponents.find((c) => 
              c.types.includes('administrative_area_level_1')
            );
            
            return {
              city: cityComponent?.long_name || "",
              state: stateComponent?.short_name || "",
            };
          }
          
          return { city: "", state: "" };
        } catch (error) {
          console.error('ZIP lookup failed:', error);
          return { city: "", state: "" };
        }
      }),
  }),
  
  // Saved quotes router
  quotes: router({
    // Get all quotes
    getAll: publicProcedure
      .input(z.object({ company: z.enum(["L&M", "Peach"]).optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        
        if (input.company) {
          return await db.select().from(savedQuotes)
            .where(eq(savedQuotes.company, input.company))
            .orderBy(desc(savedQuotes.updatedAt));
        }
        
        return await db.select().from(savedQuotes)
          .orderBy(desc(savedQuotes.updatedAt));
      }),
    
    // Get quote by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        
        const results = await db.select().from(savedQuotes)
          .where(eq(savedQuotes.id, input.id));
        
        return results[0] || null;
      }),
    
    // Save new quote
    create: publicProcedure
      .input(z.object({
        quoteName: z.string(),
        company: z.enum(["L&M", "Peach"]),
        clientCompany: z.string().optional(),
        clientContact: z.string().optional(),
        clientAddress1: z.string().optional(),
        clientAddress2: z.string().optional(),
        clientCity: z.string().optional(),
        clientState: z.string().optional(),
        clientZip: z.string().optional(),
        clientPhone: z.string().optional(),
        clientEmail: z.string().optional(),
        facilityId: z.string(),
        selectedFacility: z.string(),
        laborRate: z.number(),
        taxRate: z.number(),
        monthlyPallets: z.number(),
        monthlyTurns: z.number(),
        sqFtPerPallet: z.number(),
        stackHeight: z.number(),
        fullyLoadedLaborRate: z.number(),
        inboundMinutes: z.number(),
        outboundMinutes: z.number(),
        storageMargin: z.number(),
        handlingInMargin: z.number(),
        handlingOutMargin: z.number(),
        monthlyStorageMinimum: z.number().optional(),
        pickType: z.enum(["full", "layer", "case"]),
        monthlyOrders: z.number(),
        casesPerOrder: z.number(),
        labelsPerOrder: z.number(),
        casePickRate: z.number(),
        layerPickRate: z.number(),
        palletSupplyFee: z.number(),
        shrinkWrapFee: z.number(),
        labelingFee: z.number(),
        orderProcessingFee: z.number(),
        cancellationFee: z.number(),
        palletPickRate: z.number().optional(),
        newAccountSetupFee: z.number().optional(),
        cancellationMargin: z.number(),
        casePickMargin: z.number(),
        palletSupplyMargin: z.number(),
        shrinkWrapMargin: z.number(),
        labelingMargin: z.number(),
        orderProcessingMargin: z.number(),
        tier1Name: z.string().optional(),
        tier1Length: z.string().optional(),
        tier1Discount: z.number().optional(),
        tier1Enabled: z.boolean().optional(),
        tier2Name: z.string().optional(),
        tier2Length: z.string().optional(),
        tier2Discount: z.number().optional(),
        tier2Enabled: z.boolean().optional(),
        tier3Name: z.string().optional(),
        tier3Length: z.string().optional(),
        tier3Discount: z.number().optional(),
        tier3Enabled: z.boolean().optional(),
        tier4Name: z.string().optional(),
        tier4Length: z.string().optional(),
        tier4Discount: z.number().optional(),
        tier4Enabled: z.boolean().optional(),
        selectedDiscountTier: z.string().optional(),
        storageRateOverride: z.number().optional(),
        handlingInRateOverride: z.number().optional(),
        handlingOutRateOverride: z.number().optional(),
        quoteValidDays: z.number().optional(),
        paymentTerms: z.string().optional(),
        minimumCommitment: z.string().optional(),
        customDisclosures: z.string().optional(),
        freightLanes: z.string().optional(), // JSON string of freight lane objects
        productDescription: z.string().optional(),
        accountOverview: z.string().optional(),
        palletStacking: z.string().optional(),
        orderProcessingTime: z.string().optional(),
        vasToggles: z.string().optional(), // JSON string of VAS toggle states
        createdBy: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { tier1Enabled, tier2Enabled, tier3Enabled, tier4Enabled, ...rest } = input;
        const result = await db.insert(savedQuotes).values({
          ...rest,
          tier1Enabled: tier1Enabled !== undefined ? (tier1Enabled ? 1 : 0) : 1,
          tier2Enabled: tier2Enabled !== undefined ? (tier2Enabled ? 1 : 0) : 1,
          tier3Enabled: tier3Enabled !== undefined ? (tier3Enabled ? 1 : 0) : 1,
          tier4Enabled: tier4Enabled !== undefined ? (tier4Enabled ? 1 : 0) : 1,
        });
        return { success: true, id: Number((result as any).insertId) };
      }),
    
    // Update existing quote
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        quoteName: z.string(),
        company: z.enum(["L&M", "Peach"]),
        clientCompany: z.string().optional(),
        clientContact: z.string().optional(),
        clientAddress1: z.string().optional(),
        clientAddress2: z.string().optional(),
        clientCity: z.string().optional(),
        clientState: z.string().optional(),
        clientZip: z.string().optional(),
        clientPhone: z.string().optional(),
        clientEmail: z.string().optional(),
        facilityId: z.string(),
        selectedFacility: z.string(),
        laborRate: z.number(),
        taxRate: z.number(),
        monthlyPallets: z.number(),
        monthlyTurns: z.number(),
        sqFtPerPallet: z.number(),
        stackHeight: z.number(),
        fullyLoadedLaborRate: z.number(),
        inboundMinutes: z.number(),
        outboundMinutes: z.number(),
        storageMargin: z.number(),
        handlingInMargin: z.number(),
        handlingOutMargin: z.number(),
        monthlyStorageMinimum: z.number().optional(),
        pickType: z.enum(["full", "layer", "case"]),
        monthlyOrders: z.number(),
        casesPerOrder: z.number(),
        labelsPerOrder: z.number(),
        casePickRate: z.number(),
        layerPickRate: z.number(),
        palletSupplyFee: z.number(),
        shrinkWrapFee: z.number(),
        labelingFee: z.number(),
        orderProcessingFee: z.number(),
        cancellationFee: z.number(),
        palletPickRate: z.number().optional(),
        newAccountSetupFee: z.number().optional(),
        cancellationMargin: z.number(),
        casePickMargin: z.number(),
        palletSupplyMargin: z.number(),
        shrinkWrapMargin: z.number(),
        labelingMargin: z.number(),
        orderProcessingMargin: z.number(),
        tier1Name: z.string().optional(),
        tier1Length: z.string().optional(),
        tier1Discount: z.number().optional(),
        tier1Enabled: z.boolean().optional(),
        tier2Name: z.string().optional(),
        tier2Length: z.string().optional(),
        tier2Discount: z.number().optional(),
        tier2Enabled: z.boolean().optional(),
        tier3Name: z.string().optional(),
        tier3Length: z.string().optional(),
        tier3Discount: z.number().optional(),
        tier3Enabled: z.boolean().optional(),
        tier4Name: z.string().optional(),
        tier4Length: z.string().optional(),
        tier4Discount: z.number().optional(),
        tier4Enabled: z.boolean().optional(),
        selectedDiscountTier: z.string().optional(),
        storageRateOverride: z.number().optional(),
        handlingInRateOverride: z.number().optional(),
        handlingOutRateOverride: z.number().optional(),
        quoteValidDays: z.number().optional(),
        paymentTerms: z.string().optional(),
        minimumCommitment: z.string().optional(),
        customDisclosures: z.string().optional(),
        freightLanes: z.string().optional(), // JSON string of freight lane objects
        productDescription: z.string().optional(),
        accountOverview: z.string().optional(),
        palletStacking: z.string().optional(),
        orderProcessingTime: z.string().optional(),
        vasToggles: z.string().optional(), // JSON string of VAS toggle states
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { id, tier1Enabled, tier2Enabled, tier3Enabled, tier4Enabled, ...updateRest } = input;
        const updateData = {
          ...updateRest,
          ...(tier1Enabled !== undefined && { tier1Enabled: tier1Enabled ? 1 : 0 }),
          ...(tier2Enabled !== undefined && { tier2Enabled: tier2Enabled ? 1 : 0 }),
          ...(tier3Enabled !== undefined && { tier3Enabled: tier3Enabled ? 1 : 0 }),
          ...(tier4Enabled !== undefined && { tier4Enabled: tier4Enabled ? 1 : 0 }),
        };
        await db.update(savedQuotes).set(updateData).where(eq(savedQuotes.id, id));
        return { success: true };
      }),
    
    // Delete quote
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.delete(savedQuotes).where(eq(savedQuotes.id, input.id));
        return { success: true };
      }),
  }),

  // Pipeline deals router
  pipeline: router({
    getAll: publicProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) return [];
        return await db.select().from(pipelineDeals).orderBy(desc(pipelineDeals.updatedAt));
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const results = await db.select().from(pipelineDeals).where(eq(pipelineDeals.id, input.id));
        return results[0] || null;
      }),

    create: publicProcedure
      .input(z.object({
        clientName: z.string(),
        clientContact: z.string().optional(),
        clientEmail: z.string().optional(),
        clientPhone: z.string().optional(),
        dealName: z.string(),
        serviceType: z.enum(["warehousing", "transportation", "ecommerce", "crossdock", "rework", "mixed"]),
        facility: z.string().optional(),
        company: z.enum(["L&M", "Peach"]),
        stage: z.enum(["lead", "proposal_sent", "under_review", "negotiating", "signed", "active", "lost"]),
        estimatedMonthlyRevenue: z.number().optional(),
        estimatedAnnualRevenue: z.number().optional(),
        estimatedPallets: z.number().optional(),
        estimatedLoads: z.number().optional(),
        proposalDate: z.date().optional(),
        expectedCloseDate: z.date().optional(),
        actualCloseDate: z.date().optional(),
        savedQuoteId: z.number().optional(),
        keyServices: z.string().optional(),
        notes: z.string().optional(),
        probability: z.number().optional(),
        createdBy: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.insert(pipelineDeals).values(input);
        return { success: true, id: Number((result as any).insertId) };
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        clientName: z.string().optional(),
        clientContact: z.string().optional(),
        clientEmail: z.string().optional(),
        clientPhone: z.string().optional(),
        dealName: z.string().optional(),
        serviceType: z.enum(["warehousing", "transportation", "ecommerce", "crossdock", "rework", "mixed"]).optional(),
        facility: z.string().optional(),
        company: z.enum(["L&M", "Peach"]).optional(),
        stage: z.enum(["lead", "proposal_sent", "under_review", "negotiating", "signed", "active", "lost"]).optional(),
        estimatedMonthlyRevenue: z.number().optional(),
        estimatedAnnualRevenue: z.number().optional(),
        estimatedPallets: z.number().optional(),
        estimatedLoads: z.number().optional(),
        proposalDate: z.date().optional(),
        expectedCloseDate: z.date().optional(),
        actualCloseDate: z.date().optional(),
        savedQuoteId: z.number().optional(),
        keyServices: z.string().optional(),
        notes: z.string().optional(),
        probability: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { id, ...updateData } = input;
        await db.update(pipelineDeals).set(updateData).where(eq(pipelineDeals.id, id));
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(pipelineDeals).where(eq(pipelineDeals.id, input.id));
        return { success: true };
      }),

    // Update just the stage (for drag-and-drop)
    updateStage: publicProcedure
      .input(z.object({
        id: z.number(),
        stage: z.enum(["lead", "proposal_sent", "under_review", "negotiating", "signed", "active", "lost"]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(pipelineDeals).set({ stage: input.stage }).where(eq(pipelineDeals.id, input.id));
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
