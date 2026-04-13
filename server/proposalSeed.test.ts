import { describe, expect, it } from "vitest";

import { liquidDeathProposalSeed } from "../shared/proposalSeed";

describe("liquidDeathProposalSeed", () => {
  it("does not include the outdated Outside Carrier BOL support row", () => {
    const serviceNames = liquidDeathProposalSeed.sections.flatMap((section) =>
      section.lines.map((line) => line.serviceName),
    );

    expect(serviceNames).not.toContain("Outside Carrier BOL");
  });

  it("keeps one blended order-processing headline row for the public proposal", () => {
    const orderProcessingRows = liquidDeathProposalSeed.sections.flatMap((section) =>
      section.lines.filter((line) => line.serviceName === "Order Processing (blended)"),
    );

    expect(orderProcessingRows).toHaveLength(1);
    expect(orderProcessingRows[0]?.proposedRate).toBe("8.00");
  });
});
