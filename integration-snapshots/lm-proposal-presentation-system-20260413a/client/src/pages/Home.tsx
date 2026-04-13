import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import type { ProposalSeedSection } from "../../../shared/proposalSeed";
import { useEffect, useMemo, useState } from "react";

const publicBasePath = "/proposal";

type ProposalRecord = {
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
  updatedAt: Date;
};

function cloneSections(sections: ProposalSeedSection[]) {
  return sections.map(section => ({
    ...section,
    lines: section.lines.map(line => ({ ...line })),
  }));
}

export default function Home() {
  const utils = trpc.useUtils();
  const proposalsQuery = trpc.proposals.list.useQuery();
  const createProposal = trpc.proposals.create.useMutation({
    onSuccess: async proposal => {
      await utils.proposals.list.invalidate();
      setSelectedProposalId(proposal.id);
    },
  });
  const duplicateProposal = trpc.proposals.duplicate.useMutation({
    onSuccess: async proposal => {
      await utils.proposals.list.invalidate();
      setSelectedProposalId(proposal.id);
    },
  });
  const updateProposal = trpc.proposals.update.useMutation({
    onSuccess: async proposal => {
      await utils.proposals.list.invalidate();
      if (proposal) {
        setDraftProposal(toDraft(proposal as ProposalRecord));
      }
    },
  });
  const publishProposal = trpc.proposals.publishState.useMutation({
    onSuccess: async proposal => {
      await utils.proposals.list.invalidate();
      if (proposal) {
        setDraftProposal(toDraft(proposal as ProposalRecord));
      }
    },
  });

  const [selectedProposalId, setSelectedProposalId] = useState<number | null>(null);
  const [draftProposal, setDraftProposal] = useState<ProposalRecord | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>("");

  const proposals = (proposalsQuery.data ?? []) as ProposalRecord[];

  useEffect(() => {
    if (!selectedProposalId && proposals.length > 0) {
      setSelectedProposalId(proposals[0].id);
    }
  }, [proposals, selectedProposalId]);

  const selectedProposal = useMemo(
    () => proposals.find(proposal => proposal.id === selectedProposalId) ?? null,
    [proposals, selectedProposalId],
  );

  const hasUnsavedChanges = useMemo(() => {
    if (!draftProposal || !selectedProposal) {
      return false;
    }

    return !areProposalsEquivalent(draftProposal, selectedProposal);
  }, [draftProposal, selectedProposal]);

  useEffect(() => {
    if (selectedProposal) {
      setDraftProposal(toDraft(selectedProposal));
      setSaveMessage("");
    }
  }, [selectedProposal]);

  const isBusy =
    proposalsQuery.isLoading ||
    createProposal.isPending ||
    duplicateProposal.isPending ||
    updateProposal.isPending ||
    publishProposal.isPending;

  async function persistDraftProposal() {
    if (!draftProposal) return null;

    return updateProposal.mutateAsync({
      id: draftProposal.id,
      proposalName: draftProposal.proposalName,
      clientName: draftProposal.clientName,
      proposalTitle: draftProposal.proposalTitle,
      proposalSubtitle: draftProposal.proposalSubtitle,
      preparedBy: draftProposal.preparedBy,
      issueDate: draftProposal.issueDate,
      effectiveDate: draftProposal.effectiveDate,
      expirationDate: draftProposal.expirationDate,
      introText: draftProposal.introText,
      verificationNote: draftProposal.verificationNote,
      brandingNote: draftProposal.brandingNote,
      publicSummary: draftProposal.publicSummary,
      logoMode: draftProposal.logoMode,
      accentColor: draftProposal.accentColor,
      accentSoftColor: draftProposal.accentSoftColor,
      publicSlug: draftProposal.publicSlug,
      sections: draftProposal.sections,
    });
  }

  async function handleSave() {
    const response = await persistDraftProposal();

    if (response) {
      setDraftProposal(toDraft(response as ProposalRecord));
      setSaveMessage(`Saved ${new Date().toLocaleTimeString()}`);
    }
  }

  async function handlePublishToggle() {
    if (!draftProposal) return;

    let workingProposal = draftProposal;

    if (hasUnsavedChanges) {
      const savedProposal = await persistDraftProposal();
      if (!savedProposal) return;
      workingProposal = toDraft(savedProposal as ProposalRecord);
      setDraftProposal(workingProposal);
    }

    const nextStatus = workingProposal.status === "published" ? "draft" : "published";
    const response = await publishProposal.mutateAsync({
      id: workingProposal.id,
      status: nextStatus,
    });

    if (response) {
      setDraftProposal(toDraft(response as ProposalRecord));
      setSaveMessage(
        nextStatus === "published"
          ? hasUnsavedChanges
            ? "Saved changes and published proposal"
            : "Proposal published"
          : hasUnsavedChanges
            ? "Saved changes and unpublished proposal"
            : "Proposal unpublished",
      );
    }
  }

  function updateField<K extends keyof ProposalRecord>(field: K, value: ProposalRecord[K]) {
    setDraftProposal(current => (current ? { ...current, [field]: value } : current));
  }

  function updateSectionField(sectionIndex: number, field: keyof ProposalSeedSection, value: string) {
    setDraftProposal(current => {
      if (!current) return current;
      const nextSections = cloneSections(current.sections);
      const nextSection = nextSections[sectionIndex];
      if (!nextSection) return current;
      if (field === "title" || field === "laneLabel" || field === "note") {
        nextSection[field] = value;
      }
      return { ...current, sections: nextSections };
    });
  }

  function updateLineField(
    sectionIndex: number,
    lineIndex: number,
    field: keyof ProposalSeedSection["lines"][number],
    value: string,
  ) {
    setDraftProposal(current => {
      if (!current) return current;
      const nextSections = cloneSections(current.sections);
      const nextLine = nextSections[sectionIndex]?.lines[lineIndex];
      if (!nextLine) return current;
      nextLine[field] = value;
      return { ...current, sections: nextSections };
    });
  }

  async function copyPublicLink() {
    if (!draftProposal) return;
    const link = `${window.location.origin}${publicBasePath}/${draftProposal.publicSlug}`;
    await navigator.clipboard.writeText(link);
    setSaveMessage("Public proposal link copied");
  }

  function openPublicProposal() {
    if (!draftProposal) return;
    window.open(`${publicBasePath}/${draftProposal.publicSlug}`, "_blank", "noopener,noreferrer");
  }

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-2rem)] rounded-[28px] bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fa_48%,#ffffff_100%)] p-4 shadow-[0_24px_80px_rgba(15,42,78,0.08)] sm:p-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <section className="grid gap-4 rounded-[24px] border border-white/80 bg-white/90 p-6 shadow-[0_12px_40px_rgba(18,63,115,0.08)] lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-4 rounded-full border border-slate-200 bg-white/80 px-4 py-3 shadow-[0_8px_24px_rgba(15,42,78,0.06)]">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/93927875/J5uRcJfEoMsHGQmkwYye4i/lm-distribution-logistics_256ab6e3.png"
                  alt="L&M Logistics"
                  className="h-10 w-auto object-contain"
                />
                <span className="h-8 w-px bg-slate-200" aria-hidden="true" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">CSO dashboard workspace</p>
                  <p className="text-sm font-medium text-slate-700">L&amp;M pricing proposals</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">L&amp;M Logistics proposal system</p>
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Elegant proposal publishing for pricing renewals and client-ready presentations.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Manage branded pricing proposals, publish a no-login presentation page, and give clients a clean PDF export that mirrors the on-screen layout.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <StatCard label="Total proposals" value={`${proposals.length}`} detail="Draft and published records" />
              <StatCard label="Published" value={`${proposals.filter(item => item.status === "published").length}`} detail="Visible on share links" />
              <StatCard label="Service lanes" value={`${draftProposal?.serviceLanes.length ?? 0}`} detail="Grouped from active proposal" />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
            <aside className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,42,78,0.06)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Proposal library</h2>
                  <p className="text-sm text-slate-500">Select, duplicate, or create a new client proposal.</p>
                </div>
                <Button onClick={() => createProposal.mutate()} disabled={isBusy}>New</Button>
              </div>

              <div className="space-y-3">
                {proposals.map(proposal => {
                  const isActive = proposal.id === selectedProposalId;
                  return (
                    <button
                      key={proposal.id}
                      onClick={() => setSelectedProposalId(proposal.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? "border-slate-900 bg-slate-900 text-white shadow-[0_16px_34px_rgba(15,42,78,0.22)]"
                          : "border-slate-200 bg-slate-50/70 text-slate-900 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold">{proposal.clientName}</p>
                          <p className={`mt-1 text-sm ${isActive ? "text-white/75" : "text-slate-500"}`}>{proposal.proposalName}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${proposal.status === "published" ? "bg-emerald-500/15 text-emerald-600" : isActive ? "bg-white/15 text-white" : "bg-slate-200 text-slate-600"}`}>
                          {proposal.status}
                        </span>
                      </div>
                      <div className={`mt-4 flex items-center justify-between text-xs ${isActive ? "text-white/70" : "text-slate-500"}`}>
                        <span>{proposal.publicSlug}</span>
                        <span>{proposal.updatedAt ? new Date(proposal.updatedAt).toLocaleDateString() : ""}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="space-y-6">
              {!draftProposal ? (
                <section className="rounded-[24px] border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500">
                  {proposalsQuery.isLoading ? "Loading proposals…" : "Select a proposal to begin editing."}
                </section>
              ) : (
                <>
                  <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,42,78,0.06)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Selected proposal</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{draftProposal.proposalTitle}</h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{draftProposal.publicSummary}</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={() => duplicateProposal.mutate({ id: draftProposal.id })} disabled={isBusy}>Duplicate</Button>
                        <Button variant="outline" onClick={copyPublicLink} disabled={isBusy}>Copy link</Button>
                        <Button variant="outline" onClick={openPublicProposal}>Open public page</Button>
                        <Button onClick={handlePublishToggle} disabled={isBusy}>{draftProposal.status === "published" ? "Unpublish" : "Publish"}</Button>
                      </div>
                    </div>
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span>Share URL: <span className="font-medium text-slate-900">{window.location.origin}{publicBasePath}/{draftProposal.publicSlug}</span></span>
                        {hasUnsavedChanges ? <span className="font-medium text-amber-700">Unsaved changes will be saved automatically when you publish or unpublish.</span> : null}
                        <span>{saveMessage}</span>
                      </div>

                  </section>

                  <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                    <div className="space-y-6">
                      <EditorCard title="Proposal settings" description="Update client details, proposal titles, dates, and public URL information.">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Proposal name" value={draftProposal.proposalName} onChange={value => updateField("proposalName", value)} />
                          <Field label="Client name" value={draftProposal.clientName} onChange={value => updateField("clientName", value)} />
                          <Field label="Proposal title" value={draftProposal.proposalTitle} onChange={value => updateField("proposalTitle", value)} />
                          <Field label="Proposal subtitle" value={draftProposal.proposalSubtitle} onChange={value => updateField("proposalSubtitle", value)} />
                          <Field label="Prepared by" value={draftProposal.preparedBy} onChange={value => updateField("preparedBy", value)} />
                          <Field label="Public slug" value={draftProposal.publicSlug} onChange={value => updateField("publicSlug", value)} />
                          <Field label="Issue date" type="date" value={draftProposal.issueDate} onChange={value => updateField("issueDate", value)} />
                          <Field label="Effective date" type="date" value={draftProposal.effectiveDate} onChange={value => updateField("effectiveDate", value)} />
                          <Field label="Expiration date" type="date" value={draftProposal.expirationDate} onChange={value => updateField("expirationDate", value)} />
                          <Field label="Accent color" type="color" value={draftProposal.accentColor} onChange={value => updateField("accentColor", value)} />
                          <Field label="Soft accent" type="color" value={draftProposal.accentSoftColor} onChange={value => updateField("accentSoftColor", value)} />
                          <label className="grid gap-2 text-sm font-medium text-slate-700">
                            Logo mode
                            <select
                              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-slate-400"
                              value={draftProposal.logoMode}
                              onChange={event => updateField("logoMode", event.target.value as ProposalRecord["logoMode"])}
                            >
                              <option value="wordmark">Wordmark</option>
                              <option value="monogram">Monogram</option>
                            </select>
                          </label>
                        </div>
                        <div className="mt-4 grid gap-4">
                          <TextAreaField label="Introduction" value={draftProposal.introText} onChange={value => updateField("introText", value)} rows={4} />
                          <TextAreaField label="Verification note" value={draftProposal.verificationNote} onChange={value => updateField("verificationNote", value)} rows={3} />
                          <TextAreaField label="Branding note" value={draftProposal.brandingNote} onChange={value => updateField("brandingNote", value)} rows={3} />
                          <TextAreaField label="Public summary" value={draftProposal.publicSummary} onChange={value => updateField("publicSummary", value)} rows={3} />
                        </div>
                        <div className="mt-5 flex justify-end">
                          <Button onClick={handleSave} disabled={isBusy}>Save proposal</Button>
                        </div>
                      </EditorCard>

                      <EditorCard title="Rate sections" description="Adjust section labels and update the pricing lines shown on the public proposal page and exported PDF.">
                        <div className="space-y-6">
                          {draftProposal.sections.map((section, sectionIndex) => (
                            <div key={`${section.title}-${sectionIndex}`} className="rounded-2xl border border-slate-200 p-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Section title" value={section.title} onChange={value => updateSectionField(sectionIndex, "title", value)} />
                                <Field label="Lane label" value={section.laneLabel} onChange={value => updateSectionField(sectionIndex, "laneLabel", value)} />
                              </div>
                              <div className="mt-4">
                                <TextAreaField label="Section note" value={section.note} onChange={value => updateSectionField(sectionIndex, "note", value)} rows={2} />
                              </div>
                              <div className="mt-4 overflow-x-auto">
                                <table className="min-w-[980px] text-sm">
                                  <thead>
                                    <tr className="bg-slate-100 text-left text-slate-600">
                                      {[
                                        "Service",
                                        "Current",
                                        "Proposed",
                                        "2027",
                                        "2028",
                                        "2029",
                                        "2030",
                                        "Unit / Note",
                                      ].map(label => (
                                        <th key={label} className="px-3 py-3 font-medium">{label}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {section.lines.map((line, lineIndex) => (
                                      <tr key={`${line.serviceName}-${lineIndex}`} className="border-b border-slate-100 align-top">
                                        <td className="px-3 py-3"><MiniInput value={line.serviceName} onChange={value => updateLineField(sectionIndex, lineIndex, "serviceName", value)} /></td>
                                        <td className="px-3 py-3"><MiniInput value={line.currentRate} onChange={value => updateLineField(sectionIndex, lineIndex, "currentRate", value)} /></td>
                                        <td className="px-3 py-3"><MiniInput value={line.proposedRate} onChange={value => updateLineField(sectionIndex, lineIndex, "proposedRate", value)} /></td>
                                        <td className="px-3 py-3"><MiniInput value={line.rate2027} onChange={value => updateLineField(sectionIndex, lineIndex, "rate2027", value)} /></td>
                                        <td className="px-3 py-3"><MiniInput value={line.rate2028} onChange={value => updateLineField(sectionIndex, lineIndex, "rate2028", value)} /></td>
                                        <td className="px-3 py-3"><MiniInput value={line.rate2029} onChange={value => updateLineField(sectionIndex, lineIndex, "rate2029", value)} /></td>
                                        <td className="px-3 py-3"><MiniInput value={line.rate2030} onChange={value => updateLineField(sectionIndex, lineIndex, "rate2030", value)} /></td>
                                        <td className="px-3 py-3"><MiniInput value={line.unitNote} onChange={value => updateLineField(sectionIndex, lineIndex, "unitNote", value)} /></td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-5 flex justify-end">
                          <Button onClick={handleSave} disabled={isBusy}>Save pricing tables</Button>
                        </div>
                      </EditorCard>
                    </div>

                    <div className="space-y-6">
                      <EditorCard title="Public proposal preview" description="A simplified presentation preview so the admin team can review the client-facing structure before publishing.">
                        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_42px_rgba(15,42,78,0.08)]">
                          <div className="border-b border-slate-200 px-6 py-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Client-facing view</p>
                                <h3 className="mt-2 text-2xl font-semibold text-slate-900">{draftProposal.proposalTitle}</h3>
                                <p className="mt-2 text-sm text-slate-500">{draftProposal.proposalSubtitle}</p>
                              </div>
                              <div className="rounded-2xl px-4 py-2 text-right" style={{ backgroundColor: draftProposal.accentSoftColor }}>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</p>
                                <p className="mt-1 text-sm font-semibold" style={{ color: draftProposal.accentColor }}>{draftProposal.status}</p>
                              </div>
                            </div>
                            <p className="mt-4 text-sm leading-6 text-slate-600">{draftProposal.introText}</p>
                          </div>
                          <div className="space-y-5 p-6">
                            {draftProposal.sections.slice(0, 2).map(section => (
                              <div key={section.title} className="overflow-hidden rounded-2xl border border-slate-200">
                                <div className="px-4 py-3 text-sm font-semibold text-white" style={{ backgroundColor: draftProposal.accentColor }}>{section.title}</div>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 text-left text-slate-500">
                                      <tr>
                                        <th className="px-4 py-3 font-medium">Service</th>
                                        <th className="px-4 py-3 font-medium">Current</th>
                                        <th className="px-4 py-3 font-medium">2027</th>
                                        <th className="px-4 py-3 font-medium">2030</th>
                                        <th className="px-4 py-3 font-medium">Unit</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {section.lines.slice(0, 6).map(line => (
                                        <tr key={line.serviceName} className="border-t border-slate-100">
                                          <td className="px-4 py-3 font-medium text-slate-900">{line.serviceName}</td>
                                          <td className="px-4 py-3 text-slate-600">{line.currentRate || "—"}</td>
                                          <td className="px-4 py-3 font-semibold text-emerald-700">{line.rate2027 || line.proposedRate || "—"}</td>
                                          <td className="px-4 py-3 text-slate-600">{line.rate2030 || "—"}</td>
                                          <td className="px-4 py-3 text-slate-500">{line.unitNote}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </EditorCard>
                    </div>
                  </section>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function toDraft(proposal: ProposalRecord): ProposalRecord {
  return {
    ...proposal,
    sections: cloneSections(proposal.sections),
    serviceLanes: [...proposal.serviceLanes],
  };
}

function areProposalsEquivalent(left: ProposalRecord, right: ProposalRecord) {
  return JSON.stringify(toComparableProposal(left)) === JSON.stringify(toComparableProposal(right));
}

function toComparableProposal(proposal: ProposalRecord) {
  return {
    id: proposal.id,
    proposalName: proposal.proposalName,
    clientName: proposal.clientName,
    proposalTitle: proposal.proposalTitle,
    proposalSubtitle: proposal.proposalSubtitle,
    preparedBy: proposal.preparedBy,
    issueDate: proposal.issueDate,
    effectiveDate: proposal.effectiveDate,
    expirationDate: proposal.expirationDate,
    introText: proposal.introText,
    verificationNote: proposal.verificationNote,
    brandingNote: proposal.brandingNote,
    publicSummary: proposal.publicSummary,
    logoMode: proposal.logoMode,
    accentColor: proposal.accentColor,
    accentSoftColor: proposal.accentSoftColor,
    status: proposal.status,
    publicSlug: proposal.publicSlug,
    sections: proposal.sections,
    serviceLanes: proposal.serviceLanes,
  };
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50/90 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

function EditorCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,42,78,0.06)]">
      <div className="mb-5">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-slate-400"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <textarea
        rows={rows}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-slate-400"
      />
    </label>
  );
}

function MiniInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      value={value}
      onChange={event => onChange(event.target.value)}
      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
    />
  );
}
