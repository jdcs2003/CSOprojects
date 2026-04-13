import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Download, ExternalLink, Link2, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import generatePDF, { Margin, Resolution } from "react-to-pdf";
import { useLocation, useRoute } from "wouter";
import type { ProposalSeedSection } from "../../../shared/proposalSeed";

const lmLogoUrl = "https://d2xsxph8kpxj0f.cloudfront.net/93927875/J5uRcJfEoMsHGQmkwYye4i/lm-distribution-logistics_256ab6e3.png";

type PublicProposal = {
  id: number;
  proposalName: string;
  clientName: string;
  proposalTitle: string;
  proposalSubtitle: string;
  preparedBy: string;
  issueDate: string;
  effectiveDate: string;
  expirationDate: string;
  introText: string;
  verificationNote: string;
  brandingNote: string;
  publicSummary: string;
  logoMode: "wordmark" | "monogram";
  accentColor: string;
  accentSoftColor: string;
  status: "draft" | "published";
  publicSlug: string;
  sections: ProposalSeedSection[];
  serviceLanes: string[];
  publishedAt: Date | null;
};

export default function ProposalPublicPage() {
  const [, params] = useRoute<{ slug: string }>("/proposal/:slug");
  const [, navigate] = useLocation();
  const slug = params?.slug ?? "";
  const [copyMessage, setCopyMessage] = useState<string>("");

  const proposalQuery = trpc.proposals.publicBySlug.useQuery({ slug }, { enabled: Boolean(slug) });
  const proposal = (proposalQuery.data ?? null) as PublicProposal | null;

  const summaryCards = useMemo(() => {
    if (!proposal) return [];

    return [
      {
        title: "Prepared by",
        value: proposal.preparedBy,
        body: "Prepared by the L&M Logistics team and published as a client-ready proposal presentation.",
      },
      {
        title: "Contract term",
        value: `${formatDate(proposal.effectiveDate)} – ${formatDate(proposal.expirationDate)}`,
        body: "Renewal pricing is presented with current rates, proposal rates, and 2027–2030 modeled visibility.",
      },
      {
        title: "Service lanes",
        value: proposal.serviceLanes.join(" • ") || "Proposal lanes",
        body: "Service tables are grouped by lane and service type for cleaner client review and PDF output.",
      },
    ];
  }, [proposal]);

  const pricingStats = useMemo(() => {
    if (!proposal) return [];

    const lineCount = proposal.sections.reduce((total, section) => total + section.lines.length, 0);

    return [
      { label: "Proposal sections", value: `${proposal.sections.length}` },
      { label: "Rate lines", value: `${lineCount}` },
      { label: "Published", value: proposal.publishedAt ? formatDateTime(proposal.publishedAt) : "Active link" },
    ];
  }, [proposal]);

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopyMessage("Share link copied");
    window.setTimeout(() => setCopyMessage(""), 2400);
  }

  async function handleDownloadPdf() {
    const filenameBase = proposal?.clientName?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || slug || "proposal";

    await generatePDF(() => document.getElementById("proposal-export-root"), {
      filename: `${filenameBase}-proposal.pdf`,
      resolution: Resolution.HIGH,
      page: {
        margin: Margin.SMALL,
        format: "letter",
        orientation: "portrait",
      },
      canvas: {
        mimeType: "image/png",
        qualityRatio: 1,
      },
      overrides: {
        canvas: {
          useCORS: true,
          scale: 2,
        },
        pdf: {
          compress: true,
        },
      },
    });
  }

  if (proposalQuery.isLoading) {
    return (
      <PageShell>
        <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-10 text-center text-slate-500 shadow-[0_18px_50px_rgba(15,42,78,0.08)]">
          Loading proposal…
        </div>
      </PageShell>
    );
  }

  if (!proposal) {
    return (
      <PageShell>
        <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-[0_18px_50px_rgba(15,42,78,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Proposal unavailable</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">This proposal link is not currently available.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            The proposal may still be in draft status, unpublished, or the share URL may be incorrect.
          </p>
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>Return to dashboard</Button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <section className="proposal-actions no-print flex flex-col gap-4 rounded-[28px] border border-white/80 bg-white/85 p-4 shadow-[0_18px_48px_rgba(16,42,78,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Client proposal presentation</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{proposal.clientName}</h1>
            <p className="mt-1 text-sm text-slate-600">Client-ready proposal presentation with downloadable PDF access.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleDownloadPdf} className="h-11 rounded-xl px-5 text-sm font-semibold">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleCopyLink} className="h-11 rounded-xl px-5 text-sm font-semibold">
              <Link2 className="mr-2 h-4 w-4" />
              Copy link
            </Button>
            <Button variant="outline" onClick={() => window.open(window.location.href, "_blank", "noopener,noreferrer")} className="h-11 rounded-xl px-5 text-sm font-semibold">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open clean view
            </Button>
          </div>
        </section>

        {copyMessage ? (
          <div className="no-print rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {copyMessage}
          </div>
        ) : null}

        <div id="proposal-export-root" className="proposal-export-root mx-auto w-full max-w-6xl space-y-8">
          <section className="overflow-hidden rounded-[36px] border border-white/80 bg-white shadow-[0_30px_90px_rgba(15,42,78,0.12)]">
            <div className="proposal-hero relative overflow-hidden px-6 py-7 sm:px-10 sm:py-10" style={{ background: `linear-gradient(135deg, ${proposal.accentColor} 0%, #0f2741 80%)` }}>
              <div className="absolute inset-y-0 right-0 hidden w-[32%] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_60%)] lg:block" />
              <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-4xl space-y-5 text-white">
                  <div className="flex items-center gap-4">
                    <div className="rounded-[24px] border border-white/15 bg-white/10 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur">
                      <img src={lmLogoUrl} alt="L&M Distribution and Logistics" className="h-16 w-auto sm:h-20" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">L&M Logistics renewal proposal</p>
                      <p className="mt-2 text-sm text-white/80">Prepared for {proposal.clientName}</p>
                    </div>
                  </div>

                  <div>
                    <h2 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">{proposal.proposalTitle}</h2>
                    <p className="mt-4 max-w-3xl text-lg text-white/84">{proposal.proposalSubtitle}</p>
                    <p className="mt-5 max-w-3xl text-sm leading-7 text-white/78">{proposal.introText}</p>
                  </div>
                </div>

                <div className="min-w-[260px] max-w-sm rounded-[28px] border border-white/12 bg-white/10 p-5 text-white shadow-[0_24px_40px_rgba(7,18,35,0.18)] backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Contract overview</p>
                  <div className="mt-5 space-y-4 text-sm">
                    <InfoRow label="Issue date" value={formatDate(proposal.issueDate)} />
                    <InfoRow label="Effective" value={formatDate(proposal.effectiveDate)} />
                    <InfoRow label="Expiration" value={formatDate(proposal.expirationDate)} />
                    <InfoRow label="Prepared by" value={proposal.preparedBy} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 border-t border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 sm:grid-cols-3 sm:px-10">
              {summaryCards.map(card => (
                <div key={card.title} className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_30px_rgba(15,42,78,0.06)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{card.title}</p>
                  <p className="mt-3 text-lg font-semibold tracking-tight text-slate-900">{card.value}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{card.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <InfoPanel
              title="Verified pricing context"
              accentColor={proposal.accentColor}
              icon={<ShieldCheck className="h-5 w-5" />}
              body={proposal.verificationNote}
            />
            <InfoPanel
              title="Presentation summary"
              accentColor={proposal.accentColor}
              body={proposal.publicSummary}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            {pricingStats.map(stat => (
              <div key={stat.label} className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_15px_35px_rgba(15,42,78,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{stat.label}</p>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
              </div>
            ))}
          </section>

          {proposal.sections.map((section, index) => (
            <section key={`${section.title}-${section.laneLabel}-${index}`} className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,42,78,0.08)]">
              <div className="flex flex-col gap-4 px-6 py-5 text-white sm:px-8" style={{ backgroundColor: proposal.accentColor }}>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/75">{section.laneLabel || "Service lane"}</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{section.title}</h3>
                  </div>
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                    {section.sectionType}
                  </span>
                </div>
                <p className="max-w-4xl text-sm leading-6 text-white/84">{section.note}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="proposal-rate-table min-w-full border-separate border-spacing-0 text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-4 font-semibold">Service</th>
                      <th className="px-4 py-4 font-semibold">Current</th>
                      <th className="px-4 py-4 font-semibold">Proposed</th>
                      <th className="px-4 py-4 font-semibold">2027</th>
                      <th className="px-4 py-4 font-semibold">2028</th>
                      <th className="px-4 py-4 font-semibold">2029</th>
                      <th className="px-4 py-4 font-semibold">2030</th>
                      <th className="px-4 py-4 font-semibold">Unit / note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.lines.map((line, lineIndex) => (
                      <tr key={`${section.title}-${line.serviceName}-${line.unitNote}-${lineIndex}`} className="border-t border-slate-100 align-top odd:bg-white even:bg-slate-50/35">
                        <td className="px-4 py-4 font-medium text-slate-900">{line.serviceName}</td>
                        <td className="px-4 py-4 text-slate-700">{displayRate(line.currentRate)}</td>
                        <td className="px-4 py-4 font-semibold text-emerald-700">{displayRate(line.proposedRate)}</td>
                        <td className="px-4 py-4 text-slate-700">{displayRate(line.rate2027)}</td>
                        <td className="px-4 py-4 text-slate-700">{displayRate(line.rate2028)}</td>
                        <td className="px-4 py-4 text-slate-700">{displayRate(line.rate2029)}</td>
                        <td className="px-4 py-4 text-slate-700">{displayRate(line.rate2030)}</td>
                        <td className="px-4 py-4 text-slate-500">
                          <div>{line.unitNote || "—"}</div>
                          {line.sourceLabel ? <div className="mt-1 text-xs text-slate-400">{line.sourceLabel}</div> : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          <section className="grid gap-4 lg:grid-cols-2">
            <InfoPanel title="Branding and layout direction" accentColor={proposal.accentColor} body={proposal.brandingNote} />
            <InfoPanel
              title="Renewal horizon"
              accentColor={proposal.accentColor}
              body={`This proposal covers ${proposal.clientName} for the term beginning ${formatDate(proposal.effectiveDate)} and ending ${formatDate(proposal.expirationDate)}. The displayed proposal view and downloaded PDF are structured from the same published data source to keep the client presentation consistent.`}
            />
          </section>
        </div>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#edf4fb_0%,#f7fbff_38%,#ffffff_100%)] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 print:bg-white print:px-0 print:py-0">
      {children}
    </div>
  );
}

function InfoPanel({
  title,
  body,
  accentColor,
  icon,
}: {
  title: string;
  body: string;
  accentColor: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,42,78,0.07)]">
      <div className="flex items-center gap-3 px-6 py-4 text-white" style={{ backgroundColor: accentColor }}>
        {icon ? <span className="text-white/90">{icon}</span> : null}
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="px-6 py-5">
        <p className="text-sm leading-7 text-slate-600">{body}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/12 pb-3 last:border-b-0 last:pb-0">
      <span className="text-white/68">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}

function formatDate(value: string | Date) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value: string | Date) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function displayRate(value: string) {
  if (!value || value.trim().length === 0) return "—";
  return value;
}
