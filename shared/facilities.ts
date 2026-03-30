/**
 * Shared facility definitions used by both the Calculator and Pipeline.
 * Single source of truth for facility codes and names.
 */
export const FACILITIES = [
  { id: "pa-510", label: "PA-510", fullName: "PA-510 (Bensalem)" },
  { id: "pa-1151", label: "PA-1151", fullName: "PA-1151 (Bristol)" },
  { id: "pa-13200", label: "PA-13200", fullName: "PA-13200 (Townsend)" },
  { id: "nj-2279", label: "NJ-2279", fullName: "NJ-2279 (Logan Township)" },
  { id: "sc-577", label: "SC-577", fullName: "SC-577 (Rock Hill)" },
] as const;

export type FacilityId = typeof FACILITIES[number]["id"];
