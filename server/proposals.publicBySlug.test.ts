import type { TrpcContext } from "./_core/context";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getProposalBySlugMock } = vi.hoisted(() => ({
  getProposalBySlugMock: vi.fn(),
}));

vi.mock("./db", () => ({
  createProposal: vi.fn(),
  duplicateProposal: vi.fn(),
  getProposalById: vi.fn(),
  getProposalBySlug: getProposalBySlugMock,
  listProposals: vi.fn(),
  setProposalPublishState: vi.fn(),
  updateProposal: vi.fn(),
}));

import { appRouter } from "./routers";

function createContext(user: TrpcContext["user"] = null): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("proposals.publicBySlug", () => {
  beforeEach(() => {
    getProposalBySlugMock.mockReset();
    getProposalBySlugMock.mockResolvedValue({ id: 1, publicSlug: "sample-proposal" });
  });

  it("does not expose draft mode to unauthenticated visitors", async () => {
    const caller = appRouter.createCaller(createContext(null));

    await caller.proposals.publicBySlug({ slug: "sample-proposal", includeDraft: true });

    expect(getProposalBySlugMock).toHaveBeenCalledWith("sample-proposal", false);
  });

  it("allows admins to request draft proposal visibility when explicitly asked", async () => {
    const caller = appRouter.createCaller(
      createContext({
        id: 7,
        openId: "admin-user",
        email: "admin@example.com",
        name: "Admin User",
        loginMethod: "manus",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      }),
    );

    await caller.proposals.publicBySlug({ slug: "sample-proposal", includeDraft: true });

    expect(getProposalBySlugMock).toHaveBeenCalledWith("sample-proposal", true);
  });

  it("keeps published-only behavior for admins when draft access is not requested", async () => {
    const caller = appRouter.createCaller(
      createContext({
        id: 7,
        openId: "admin-user",
        email: "admin@example.com",
        name: "Admin User",
        loginMethod: "manus",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      }),
    );

    await caller.proposals.publicBySlug({ slug: "sample-proposal" });

    expect(getProposalBySlugMock).toHaveBeenCalledWith("sample-proposal", false);
  });
});
