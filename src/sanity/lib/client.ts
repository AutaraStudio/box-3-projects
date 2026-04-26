/**
 * Sanity client
 * =============
 * Reuses the existing Box 3 Projects Sanity dataset (project ID
 * `uwutffn5`, dataset `production`) — same one master is wired to.
 * No re-import needed; v2 connects directly to the live data.
 *
 * `useCdn: false` so editor-side preview fetches always read the
 * latest published doc; flip to true for production reads if a
 * stale window is acceptable.
 */

import { createClient } from "next-sanity";

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "uwutffn5";
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-12-01";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});
