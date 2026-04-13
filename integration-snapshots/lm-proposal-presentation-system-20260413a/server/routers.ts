import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import {
  createProposal,
  duplicateProposal,
  getProposalById,
  getProposalBySlug,
  listProposals,
  setProposalPublishState,
  updateProposal,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";

const proposalLineSchema = z.object({
  serviceName: z.string().min(1),
  currentRate: z.string(),
  proposedRate: z.string(),
  rate2027: z.string(),
  rate2028: z.string(),
  rate2029: z.string(),
  rate2030: z.string(),
  discountLabel: z.string(),
  unitNote: z.string(),
  laneLabel: z.string(),
  sourceLabel: z.string(),
  sourceTab: z.string(),
});

const proposalSectionSchema = z.object({
  title: z.string().min(1),
  sectionType: z.enum(["headline", "verification", "renewal"]),
  laneLabel: z.string(),
  note: z.string(),
  lines: z.array(proposalLineSchema),
});

const proposalMutationSchema = z.object({
  id: z.number().int().positive(),
  proposalName: z.string().min(1),
  clientName: z.string().min(1),
  proposalTitle: z.string().min(1),
  proposalSubtitle: z.string().min(1),
  preparedBy: z.string().min(1),
  issueDate: z.string().min(1),
  effectiveDate: z.string().min(1),
  expirationDate: z.string().min(1),
  introText: z.string().min(1),
  verificationNote: z.string().min(1),
  brandingNote: z.string().min(1),
  publicSummary: z.string().min(1),
  logoMode: z.enum(["wordmark", "monogram"]),
  accentColor: z.string().min(1),
  accentSoftColor: z.string().min(1),
  publicSlug: z.string().min(1),
  sections: z.array(proposalSectionSchema).min(1),
});

export const appRouter = router({
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
  proposals: router({
    list: adminProcedure.query(async () => {
      return listProposals();
    }),
    getById: adminProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
      return getProposalById(input.id);
    }),
    create: adminProcedure.mutation(async ({ ctx }) => {
      return createProposal(ctx.user.id);
    }),
    duplicate: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      return duplicateProposal(input.id, ctx.user.id);
    }),
    update: adminProcedure.input(proposalMutationSchema).mutation(async ({ input }) => {
      return updateProposal(input);
    }),
    publishState: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          status: z.enum(["draft", "published"]),
        }),
      )
      .mutation(async ({ input }) => {
        return setProposalPublishState(input.id, input.status);
      }),
    publicBySlug: publicProcedure
      .input(
        z.object({
          slug: z.string().min(1),
          includeDraft: z.boolean().optional(),
        }),
      )
      .query(async ({ input, ctx }) => {
        const canSeeDraft = Boolean(ctx.user && ctx.user.role === "admin" && input.includeDraft);
        return getProposalBySlug(input.slug, canSeeDraft);
      }),
  }),
});

export type AppRouter = typeof appRouter;
