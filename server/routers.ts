import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { facilityCapacity } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { makeRequest, GeocodingResult } from "./_core/map";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
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
});

export type AppRouter = typeof appRouter;
