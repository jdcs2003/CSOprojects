import { describe, expect, it, vi } from "vitest";

import {
  buildProposalPdfOptions,
  PDF_EXPORT_MODE_CLASS,
  prepareProposalElementForPdf,
} from "./proposalPdf";

describe("prepareProposalElementForPdf", () => {
  it("applies computed export-safe styles and restores the original markup afterward", () => {
    const rootStyleState = new Map<string, string>();
    const childStyleState = new Map<string, string>();

    const rootNode = {
      dataset: {},
      getAttribute: vi.fn().mockReturnValue("color: red;"),
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      querySelectorAll: vi.fn(),
      style: {
        setProperty: vi.fn((property: string, value: string) => rootStyleState.set(property, value)),
      },
    };

    const childNode = {
      getAttribute: vi.fn().mockReturnValue(null),
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      style: {
        setProperty: vi.fn((property: string, value: string) => childStyleState.set(property, value)),
      },
    };

    rootNode.querySelectorAll.mockReturnValue([childNode]);

    const getComputedStyleMock = vi
      .spyOn(window, "getComputedStyle")
      .mockImplementation(node => ({
        getPropertyValue: (property: string) => {
          if (property === "color") {
            return node === rootNode ? "rgb(15, 23, 42)" : "rgb(51, 65, 85)";
          }

          if (property === "background-color") {
            return node === rootNode ? "rgb(255, 255, 255)" : "rgba(255, 255, 255, 0)";
          }

          if (property === "border-top-color") {
            return "rgb(226, 232, 240)";
          }

          return "";
        },
      }) as CSSStyleDeclaration);

    const restore = prepareProposalElementForPdf(rootNode as unknown as HTMLElement);

    expect(rootNode.style.setProperty).toHaveBeenCalledWith("color", "rgb(15, 23, 42)");
    expect(rootNode.style.setProperty).toHaveBeenCalledWith("background-color", "rgb(255, 255, 255)");
    expect(childNode.style.setProperty).toHaveBeenCalledWith("color", "rgb(51, 65, 85)");
    expect(rootNode.dataset.pdfExportPrepared).toBe("true");

    restore();

    expect(rootNode.setAttribute).toHaveBeenCalledWith("style", "color: red;");
    expect(childNode.removeAttribute).toHaveBeenCalledWith("style");
    expect(rootNode.dataset.pdfExportPrepared).toBeUndefined();

    getComputedStyleMock.mockRestore();
  });
});

describe("buildProposalPdfOptions", () => {
  it("adds export-safe classes to the cloned document", () => {
    const options = buildProposalPdfOptions("liquid-death-proposal.pdf");
    const documentElement = { classList: { add: vi.fn() } };
    const body = { classList: { add: vi.fn() } };

    options.overrides.canvas.onclone({
      documentElement,
      body,
    } as unknown as Document);

    expect(documentElement.classList.add).toHaveBeenCalledWith(PDF_EXPORT_MODE_CLASS);
    expect(body.classList.add).toHaveBeenCalledWith(PDF_EXPORT_MODE_CLASS);
  });

  it("keeps the intended export defaults", () => {
    const options = buildProposalPdfOptions("liquid-death-proposal.pdf");

    expect(options.filename).toBe("liquid-death-proposal.pdf");
    expect(options.overrides.canvas.backgroundColor).toBe("#f4f7fb");
    expect(options.overrides.canvas.useCORS).toBe(true);
    expect(options.overrides.pdf.compress).toBe(true);
  });
});
