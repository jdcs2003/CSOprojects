# L&M Proposal System Integration Snapshot

This directory is a direct snapshot of `/home/ubuntu/lm-proposal-presentation-system` prepared for Alex to integrate into the main `jdcs2003/CSOprojects` codebase.

| Item | Value |
| --- | --- |
| Source sandbox project | `lm-proposal-presentation-system` |
| Snapshot date | `2026-04-13` |
| GitHub repository | `jdcs2003/CSOprojects` |
| Working branch | `alex/lm-proposal-system-snapshot-20260413` |
| Latest base snapshot commit before this refresh | `0b4b7c1ffcca2b342bf48efa05814fc152611118` |
| Intended use | Reference and cherry-pick source for integration work, not a final merged state |

## What changed in this refreshed snapshot

This refresh preserves the publish and unpublish edit-loss fix, keeps the client-facing proposal language in final presentation form rather than proof language, and removes the outdated **Outside Carrier BOL** line from the Liquid Death proposal content because that fee was rolled into **Order Processing (blended)**.

The public proposal route to test is the singular path below, not the plural variant:

`/proposal/liquid-death-renewal-2027-2030`

## Login and access path for Alex

Use the Manus OAuth login already wired into the main CSO application. After authentication, go to the internal proposal dashboard in the L&M proposal system area and open the Liquid Death proposal record.

| Step | Action |
| --- | --- |
| 1 | Check out branch `alex/lm-proposal-system-snapshot-20260413`. |
| 2 | Install dependencies and run the app in the normal CSOprojects development flow. |
| 3 | Sign in through the existing Manus OAuth flow. |
| 4 | Open the internal proposal dashboard and select the Liquid Death proposal. |
| 5 | Use the publish and unpublish controls, then verify text edits remain intact after status changes. |
| 6 | Open the public proposal page at `/proposal/liquid-death-renewal-2027-2030`. |
| 7 | Use **Download PDF** and compare the exported layout with the approved branded presentation direction. |

## What Alex is integrating into the main app

Alex should treat this folder as a source snapshot for merging the proposal system into the main CSO root structure. The relevant folders already match the target repository layout:

| Snapshot path | Main repository target |
| --- | --- |
| `client/` | `client/` |
| `server/` | `server/` |
| `drizzle/` | `drizzle/` |
| `shared/` | `shared/` |
| `scripts/` | optional utilities for data cleanup and verification |

This is intended to be merged into the repository root structure rather than mounted as a sub-application.

## Required validation points

Alex should validate the items below before beginning broader UI integration work.

| Requirement | Expected result |
| --- | --- |
| Public proposal page | Loads without login on `/proposal/:slug`. |
| PDF button | Generates a branded export from the public proposal page. |
| Publish/unpublish workflow | Toggling status does **not** overwrite edited proposal content. |
| Proof wording | No default proof placeholder wording remains in the client-facing proposal. |
| BOL fee | **Outside Carrier BOL** does not appear in Liquid Death proposal content. |
| Rolled-up pricing | Order-processing row remains present as the approved rolled-up presentation line. |
| Logo treatment | Uses the approved L&M branded logo treatment, not a proof/example placeholder. |

## Files worth reviewing first

| File | Why it matters |
| --- | --- |
| `client/src/pages/Home.tsx` | Internal authoring dashboard, publish controls, public-link controls. |
| `client/src/pages/ProposalPublicPage.tsx` | Public presentation route and PDF download action. |
| `server/db.ts` | Proposal persistence, update flow, publish state handling. |
| `server/routers.ts` | Public and protected proposal procedures. |
| `shared/proposalSeed.ts` | Seeded Liquid Death proposal content and presentation defaults. |
| `scripts/update-liquid-death-wording.mjs` | Cleanup script used to normalize final proposal wording and remove the outdated BOL row. |

## Quick testing note

If Alex sees a 404 on the public link, the first thing to check is whether he is using `/proposal/...` instead of `/proposals/...`.
