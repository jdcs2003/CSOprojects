# L&M Proposal System Integration Path

This document defines the concrete next step for folding the existing L&M proposal system into the broader CSO pricing dashboard work **without** splitting it into a separate application. The current proposal system should remain the source implementation, while the CSO dashboard absorbs its routes, data contracts, and public-share workflow in place.

## Main integration task

The main integration task is to **embed the proposal workflow as a proposal workspace inside the existing CSO pricing dashboard shell**, keeping one shared authentication layer, one database, and one navigation system. In practical terms, Alex should treat `/home/ubuntu/lm-proposal-presentation-system` as the reference implementation for proposal management and port its proposal-related modules into the target dashboard area rather than rebuilding the feature set.

## Target merge scope

| Area | Current source | Integration expectation |
| --- | --- | --- |
| Dashboard entry | `client/src/pages/Home.tsx` | Re-home proposal summary cards and proposal library into the broader dashboard landing layout. |
| Routing | `client/src/App.tsx` | Preserve the current proposal admin and public routes, but mount the admin views under the main CSO dashboard navigation. |
| Data model | `drizzle/schema.ts` | Reuse the proposal and proposal line tables directly in the shared CSO database schema. |
| Backend procedures | `server/routers.ts`, `server/db.ts` | Move proposal procedures and DB helpers into the dashboard backend so proposal CRUD, publish/unpublish, and public lookup remain unchanged. |
| Public client view | proposal public page implementation | Keep the public share page on `/proposal/:slug` as a dedicated no-login route. |
| Seed/reference data | `shared/proposalSeed.ts` | Use the Liquid Death seed and supporting data-shape conventions as the template for future customer proposals. |

## Recommended merge order

| Step | Action | Outcome |
| --- | --- | --- |
| 1 | Copy the proposal data schema and verify migrations in the destination dashboard project. | The shared database can persist proposals and line items without translation work. |
| 2 | Move proposal DB helpers and procedures into the destination backend. | The existing proposal CRUD and public lookup behavior stay stable. |
| 3 | Bring over the admin proposal pages and reuse the current dashboard-style cards/components inside the target layout. | Internal users can create, edit, duplicate, publish, and unpublish proposals from the same CSO workspace. |
| 4 | Preserve the public route pattern `/proposal/:slug` exactly. | Existing handoff/testing links and customer-facing share pages remain predictable. |
| 5 | Port the branded PDF/export behavior after the admin and public flows are stable. | Export output stays aligned with the final on-screen proposal layout. |
| 6 | Seed Liquid Death as the reference regression record and verify the live public page. | The destination dashboard has a known-good branded proposal for QA. |

## Files Alex should prioritize

| Priority | File or area | Why it matters |
| --- | --- | --- |
| 1 | `drizzle/schema.ts` | Establishes the proposal tables and line-item structure. |
| 2 | `server/db.ts` | Contains the proposal persistence helpers Alex can reuse directly. |
| 3 | `server/routers.ts` | Holds the publish, unpublish, duplicate, and public-by-slug behavior. |
| 4 | `client/src/App.tsx` | Shows the route contract, including the public proposal URL. |
| 5 | `shared/proposalSeed.ts` | Captures the approved Liquid Death reference content and cleanup baseline. |
| 6 | `server/proposals.publicBySlug.test.ts` and `server/proposalSeed.test.ts` | Lock in public-route and seed-cleanup behavior during the merge. |

## Non-negotiable integration rules

The proposal system must stay separate from **Peach Warehouse** work. All proposal integration steps belong under the **CSOprojects** repository and the L&M dashboard context only. Alex should not move this feature into a separate standalone app, and he should not rename the public route unless Jim explicitly requests a route change.

## Validation checklist for the integrated dashboard

| Check | Expected result |
| --- | --- |
| Admin dashboard loads proposal list | Existing proposal card appears and can be selected without query errors. |
| Publish/unpublish workflow | Toggling publish state does not overwrite approved wording. |
| Public route | `/proposal/liquid-death-renewal-2027-2030` opens successfully without login. |
| Proposal content | The outdated `Outside Carrier BOL` row does not appear in seeded or public output. |
| Branding | The page uses the approved L&M treatment rather than placeholder artwork. |
| Regression tests | Proposal public-by-slug tests and seed cleanup tests both pass. |

## Handoff note

If Alex needs a starting snapshot, he should use the refreshed CSOprojects branch snapshot that now includes the updated handoff notes, cleanup script, inspection script, and the current project todo history.
