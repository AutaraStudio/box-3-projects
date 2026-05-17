/**
 * robots.txt
 * ==========
 * Generated at build time by Next's MetadataRoute.Robots support.
 * Visible at /robots.txt.
 *
 * Allow everything except internal routes that shouldn't be indexed:
 *   - /studio       the embedded Sanity Studio (editor surface)
 *   - /content-guide editorial walkthrough for the Box 3 team only
 *
 * Belt-and-braces: the /content-guide page also writes its own
 * `noindex, nofollow` meta tag (see `(guide)/content-guide/page.tsx`)
 * so it stays out of search even if a crawler ignores robots.txt.
 */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/content-guide"],
      },
    ],
  };
}
