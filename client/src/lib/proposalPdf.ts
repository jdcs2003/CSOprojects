import { Margin, Resolution } from "react-to-pdf";

export const PDF_EXPORT_MODE_CLASS = "pdf-export-mode";
export const PDF_EXPORT_ROOT_SELECTOR = ".proposal-export-root";

const EXPORT_STYLE_PROPERTIES = [
  "color",
  "background-color",
  "background-image",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline-color",
  "text-decoration-color",
  "text-emphasis-color",
  "caret-color",
  "column-rule-color",
  "fill",
  "stroke",
  "stop-color",
  "flood-color",
  "lighting-color",
  "box-shadow",
] as const;

type RestorableNode = HTMLElement | SVGElement;

type RestoreRecord = {
  node: RestorableNode;
  styleAttribute: string | null;
};

function getExportNodes(root: HTMLElement): RestorableNode[] {
  return [root, ...Array.from(root.querySelectorAll<RestorableNode>("*"))];
}

export function prepareProposalElementForPdf(root: HTMLElement): () => void {
  const restoreRecords: RestoreRecord[] = [];

  for (const node of getExportNodes(root)) {
    restoreRecords.push({
      node,
      styleAttribute: node.getAttribute("style"),
    });

    const computedStyle = window.getComputedStyle(node);

    for (const property of EXPORT_STYLE_PROPERTIES) {
      const value = computedStyle.getPropertyValue(property);
      if (value) {
        node.style.setProperty(property, value);
      }
    }
  }

  root.dataset.pdfExportPrepared = "true";

  return () => {
    delete root.dataset.pdfExportPrepared;

    for (const { node, styleAttribute } of restoreRecords) {
      if (styleAttribute === null) {
        node.removeAttribute("style");
      } else {
        node.setAttribute("style", styleAttribute);
      }
    }
  };
}

export function buildProposalPdfOptions(filename: string) {
  return {
    filename,
    resolution: Resolution.HIGH,
    page: {
      margin: Margin.SMALL,
      format: "letter" as const,
      orientation: "portrait" as const,
    },
    canvas: {
      mimeType: "image/png" as const,
      qualityRatio: 1,
    },
    overrides: {
      canvas: {
        useCORS: true,
        scale: 2,
        backgroundColor: "#f4f7fb",
        onclone: (clonedDocument: Document) => {
          clonedDocument.documentElement.classList.add(PDF_EXPORT_MODE_CLASS);
          clonedDocument.body.classList.add(PDF_EXPORT_MODE_CLASS);
        },
      },
      pdf: {
        compress: true,
      },
    },
  };
}
