/**
 * Site origin
 * ===========
 * Single source of truth for the public site URL. Used by
 * `metadataBase`, the sitemap, robots.txt and Open Graph absolute
 * URLs. Reads `NEXT_PUBLIC_SITE_URL` (set in `.env.local` / the host
 * env) and falls back to the live domain so builds never produce
 * `localhost` or relative-only metadata even if the var is missing.
 *
 * No trailing slash — callers append paths directly.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://box3projects.co.uk"
).replace(/\/$/, "");
