/**
 * sitemap.xml
 * ===========
 * Generated at build time by Next's MetadataRoute.Sitemap support.
 * Visible at /sitemap.xml and referenced from robots.txt.
 *
 * Covers every public, indexable route:
 *   - the static editorial pages (home, about, services, projects,
 *     careers, contact, sustainability)
 *   - one entry per project slug   (/projects/[slug])
 *   - one entry per legal slug      (/legal/[slug])
 *
 * Deliberately excludes /studio and /content-guide — both are blocked
 * in robots.txt and the content-guide also carries a noindex meta tag.
 *
 * Slugs + last-modified come from Sanity so the map stays in step with
 * published content on each rebuild.
 */

import type { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/lib/fetch";
import { SITE_URL } from "@/lib/site";

interface SitemapDoc {
  slug: string;
  updatedAt: string;
}

const PROJECT_SITEMAP_QUERY = /* groq */ `
  *[_type == "project" && defined(slug.current)] | order(_updatedAt desc) {
    "slug": slug.current,
    "updatedAt": _updatedAt
  }
`;

const LEGAL_SITEMAP_QUERY = /* groq */ `
  *[_type == "legalPage" && defined(slug.current)] | order(_updatedAt desc) {
    "slug": slug.current,
    "updatedAt": _updatedAt
  }
`;

/* Static editorial routes and how heavily to weight them. The home
   page leads; section landing pages sit just below. */
const STATIC_ROUTES: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/services", priority: 0.8 },
  { path: "/projects", priority: 0.8 },
  { path: "/sustainability", priority: 0.7 },
  { path: "/careers", priority: 0.7 },
  { path: "/contact", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, legal] = await Promise.all([
    sanityFetch<SitemapDoc[]>({ query: PROJECT_SITEMAP_QUERY }),
    sanityFetch<SitemapDoc[]>({ query: LEGAL_SITEMAP_QUERY }),
  ]);

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority,
    }),
  );

  const projectEntries: MetadataRoute.Sitemap = (projects ?? []).map((p) => ({
    url: `${SITE_URL}/projects/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const legalEntries: MetadataRoute.Sitemap = (legal ?? []).map((l) => ({
    url: `${SITE_URL}/legal/${l.slug}`,
    lastModified: l.updatedAt ? new Date(l.updatedAt) : now,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...staticEntries, ...projectEntries, ...legalEntries];
}
