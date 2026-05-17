/**
 * Content guide page
 * ==================
 * Behind-the-scenes walkthrough of the Sanity Studio for the Box 3
 * editorial team. Lives at /content-guide.
 *
 * Hidden from search engines:
 *   - `robots: { index: false, follow: false }` writes the noindex
 *     meta tag (covers Google + Bing + most others).
 *   - The robots.txt rule (see `src/app/robots.ts`) keeps well-behaved
 *     crawlers out of the path entirely as a second layer.
 */

import type { Metadata } from "next";

import ContentGuide from "@/components/content-guide/ContentGuide";

export const metadata: Metadata = {
  title: "Content guide — Box 3 Projects",
  description: "Editorial walkthrough of the Box 3 Sanity Studio.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function ContentGuidePage() {
  return <ContentGuide />;
}
