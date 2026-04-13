import { Margin, Resolution } from "react-to-pdf";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ProposalSeedSection } from "../../../shared/proposalSeed";

export const PDF_EXPORT_MODE_CLASS = "pdf-export-mode";
export const PDF_EXPORT_ROOT_SELECTOR = ".proposal-export-root";

export type ProposalPdfData = {
  clientName: string;
  proposalTitle: string;
  proposalSubtitle: string;
  preparedBy: string;
  issueDate: string;
  effectiveDate: string;
  expirationDate: string;
  introText: string;
  verificationNote: string;
  publicSummary: string;
  accentColor: string;
  serviceLanes: string[];
  sections: ProposalSeedSection[];
};

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

function formatDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeCurrency(value: string) {
  const trimmed = value.trim();

  if (!trimmed || trimmed === "—") {
    return "—";
  }

  const numeric = Number(trimmed.replace(/[$,]/g, ""));
  if (Number.isNaN(numeric)) {
    return trimmed;
  }

  return `$${numeric.toFixed(numeric >= 100 ? 0 : 2)}`;
}

function addWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const safe = normalized.length === 3
    ? normalized.split("").map(char => `${char}${char}`).join("")
    : normalized.padEnd(6, "0").slice(0, 6);

  return [
    Number.parseInt(safe.slice(0, 2), 16),
    Number.parseInt(safe.slice(2, 4), 16),
    Number.parseInt(safe.slice(4, 6), 16),
  ];
}

export async function downloadProposalPdf(filename: string, proposal: ProposalPdfData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter", compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12.7;
  const contentWidth = pageWidth - margin * 2;
  const accent = hexToRgb(proposal.accentColor || "#123f73");
  let y = margin;

  doc.setFillColor(...accent);
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(proposal.proposalTitle, margin + 4, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(proposal.proposalSubtitle, margin + 4, y + 14);
  doc.text(`Prepared for ${proposal.clientName}`, margin + 4, y + 19.5);
  y += 30;

  doc.setTextColor(33, 37, 41);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Contract overview", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 2.2, lineColor: [226, 232, 240], lineWidth: 0.2 },
    headStyles: { fillColor: accent, textColor: 255, fontStyle: "bold" },
    bodyStyles: { textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 34, fontStyle: "bold", textColor: [15, 23, 42] },
      1: { cellWidth: contentWidth - 34 },
    },
    body: [
      ["Prepared by", proposal.preparedBy],
      ["Issue date", formatDate(proposal.issueDate)],
      ["Effective", formatDate(proposal.effectiveDate)],
      ["Expiration", formatDate(proposal.expirationDate)],
      ["Service lanes", proposal.serviceLanes.join(" • ") || "Proposal lanes"],
    ],
  });

  y = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? y;
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Overview", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  y = addWrappedText(doc, proposal.introText, margin, y, contentWidth, 4.5);
  y += 3;
  y = addWrappedText(doc, proposal.verificationNote, margin, y, contentWidth, 4.5);
  y += 3;
  y = addWrappedText(doc, proposal.publicSummary, margin, y, contentWidth, 4.5);
  y += 4;

  for (const section of proposal.sections) {
    if (y > pageHeight - 45) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(...accent);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(section.title, margin + 3, y + 5.2);
    y += 12;

    doc.setTextColor(55, 65, 81);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    y = addWrappedText(doc, `${section.laneLabel} — ${section.note}`, margin, y, contentWidth, 4.2);
    y += 3;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 7.2,
        cellPadding: 1.8,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
        overflow: "linebreak",
      },
      headStyles: { fillColor: accent, textColor: 255, fontStyle: "bold", halign: "center" },
      bodyStyles: { textColor: [31, 41, 55], valign: "middle" },
      columnStyles: {
        0: { cellWidth: 32, halign: "left", fontStyle: "bold" },
        1: { cellWidth: 17, halign: "right" },
        2: { cellWidth: 17, halign: "right" },
        3: { cellWidth: 17, halign: "right" },
        4: { cellWidth: 17, halign: "right" },
        5: { cellWidth: 17, halign: "right" },
        6: { cellWidth: 17, halign: "right" },
        7: { cellWidth: 16, halign: "center" },
        8: { cellWidth: 19, halign: "left" },
      },
      head: [["Service", "Current", "Proposal", "2027", "2028", "2029", "2030", "Delta", "Unit"]],
      body: section.lines.map(line => [
        line.serviceName,
        normalizeCurrency(line.currentRate),
        normalizeCurrency(line.proposedRate),
        normalizeCurrency(line.rate2027),
        normalizeCurrency(line.rate2028),
        normalizeCurrency(line.rate2029),
        normalizeCurrency(line.rate2030),
        line.discountLabel || "—",
        line.unitNote || "—",
      ]),
      didParseCell: data => {
        if (data.section === "body" && data.column.index === 7) {
          const raw = String(data.cell.raw ?? "");
          if (raw.includes("+")) {
            data.cell.styles.textColor = [185, 28, 28];
          } else if (raw !== "—" && raw !== "0.0%") {
            data.cell.styles.textColor = [21, 128, 61];
          }
        }
      },
    });

    y = ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? y) + 8;
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${proposal.clientName} proposal`, margin, pageHeight - 7.5);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 7.5, { align: "right" });
  }

  const pdfBlob = doc.output("blob");
  const downloadUrl = URL.createObjectURL(pdfBlob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 1000);
}
