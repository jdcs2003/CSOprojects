# L&M Proposal System Specification

This implementation extends the existing L&M Logistics proposal website inside the **CSO Pricing Projects** workspace rather than replacing the current site. The new work adds an authenticated internal proposal workspace and a separate public presentation route that reads published proposal data without exposing internal controls.

## Workflow Overview

The proposal system will support a repeatable authoring-to-publishing workflow. Internal users will create or edit a proposal record, enter client and contract details, manage rate lines tied to the renewal model, preview the customer presentation, and then publish or unpublish the proposal. Publishing will keep the editing surface protected while exposing a unique public URL for the customer-facing page. The same proposal record will also drive PDF generation so the downloaded document matches the layout and content presented on screen.

| Layer | Purpose | Access | Notes |
|---|---|---|---|
| Admin dashboard | Create, edit, save, publish, unpublish, and duplicate proposals | Login required | Uses the existing authenticated site shell and shared branding tokens |
| Proposal storage | Persist proposal metadata, rate groups, presentation copy, and publish state | Server/database only | Supports multiple clients without overwriting prior live proposals |
| Public proposal page | Branded customer-facing proposal presentation | No login required | Resolved by a unique slug and only displays published records |
| PDF export | Download a branded proof-style PDF mirroring the public proposal layout | No login required from the public page | Uses the same proposal data source and layout logic |

## Data Model

The core entity will be a proposal record that stores client identity, contract timing, branding choices, lane structure, and publication state. Each proposal will have one or more grouped rate sections so the public page can organize pricing by lane or service type while still preserving a proof-style table for verified current rates and modeled renewal pricing.

| Entity | Key fields | Purpose |
|---|---|---|
| `proposals` | proposal name, client name, slug, status, prepared by, issue date, effective date, expiration date, intro text, verification note, logo URL, accent colors | Stores the top-level presentation metadata and publishing state |
| `proposal_sections` | proposal id, section title, section type, display order, lane label, note | Organizes tables such as headline proposal rates, additional verified rates, and renewal tier groups |
| `proposal_rate_lines` | section id, service name, current rate, 2027 rate, 2028 rate, 2029 rate, 2030 rate, proposed display rate, unit note, source tab, source label, sort order | Preserves the current proof rows and renewal-model values in a normalized structure |
| `proposal_audit_events` | proposal id, event type, actor id, event note, timestamp | Records publish and unpublish actions for traceability |

## Route Plan

The internal tool will be nested inside the existing application rather than split into a different project. Authenticated pages will live under dashboard-style routes, while the client-facing experience will use a clean public route.

| Route | Audience | Function |
|---|---|---|
| `/` | Internal users | Dashboard landing page with proposal overview |
| `/proposals/:proposalId` | Internal users | Editor for branding, client metadata, sections, and rate lines |
| `/proposal/:slug` | Public users | Client-facing proposal presentation page |
| `/proposal/:slug/pdf` | Public users | Branded printable view used for download/export |

## Presentation Logic

The public proposal page will follow the visual logic of the approved Liquid Death proof while remaining elegant and aligned with the existing L&M site. The header will show the L&M Logistics mark, proposal title, subtitle, client context, and prepared-by language. Below the header, the page will present verification and branding summary cards, a polished proposal pricing table, and a secondary verification section for broader current-rate review. The PDF view will reuse the same structured content so exported pages remain visually consistent with the display page.

## Initial Liquid Death Data Requirements

The first seeded proposal should support the verified proof rows already provided for Liquid Death. The headline table will show the verified current column and a presentation column that can either display the approved renewal/proposed value or remain intentionally blank where the source should stay open. Renewal-year storage for 2027 through 2030 will remain available in the editor and database even when the public proof view emphasizes only the current-versus-proposed presentation.

## Implementation Notes

The admin interface should favor a refined dashboard treatment with careful spacing, subdued color, and strong table legibility. The public route should be lighter and more presentation-oriented, with no internal controls visible. Both surfaces should use the same L&M Logistics identity system so the new proposal workflow feels native to the current website rather than bolted on.
