# Project Scope Notes

This repository contains the **CSO Dashboard implementation for L&M Logistics proposal and pricing work**.

## Identity and separation

| Topic | Guidance |
| --- | --- |
| Organization | This feature set belongs to **L&M Logistics** within the CSO Pricing Projects project context. |
| Not included | Do **not** treat this implementation as Peach Warehouse work, reuse, or branding unless Jim explicitly asks for that crossover. |
| Current responsibility | The repository currently contains the pricing proposal dashboard, public proposal page, publishing controls, and PDF export flow for L&M. |

## Working rule for follow-up tasks

Future work should preserve the following assumptions unless Jim explicitly changes them:

1. The pricing dashboard remains the parent application.
2. Public proposal presentation stays nested inside this project.
3. L&M branding must come from the CSO shared project files or newly approved L&M assets.
4. Any request involving Peach Warehouse or another organization should be confirmed separately before changes are made.

## Key implementation anchors

| File | Purpose |
| --- | --- |
| `client/src/pages/Home.tsx` | Internal L&M proposal admin dashboard surface |
| `client/src/pages/ProposalPublicPage.tsx` | Public client-facing proposal presentation and PDF export entry |
| `server/routers.ts` | Proposal procedures including publish controls and public-by-slug access |
| `docs/branding-findings.txt` | Recorded L&M asset selection notes |
| `docs/final-validation.md` | Validation summary tying the implementation back to CSO and L&M scope |
