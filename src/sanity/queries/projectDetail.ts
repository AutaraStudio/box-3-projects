/**
 * Project Detail — Related Projects Query
 * =======================================
 * Fetches up to 5 projects to show in the "More Projects" section
 * at the bottom of a project detail page.
 *
 * Ordering strategy:
 *   1. Projects in the same category first (category._ref == $categoryId).
 *   2. Then by year descending.
 *   3. The current project (by slug) is always excluded.
 *
 * The featuredImage's asset is dereferenced here so the UI can render
 * directly via `asset.url` without invoking the image URL builder.
 */

import { groq } from "next-sanity";

/*
 * GROQ note: `order()` in Sanity requires field paths, not boolean
 * expressions — `order(expr desc)` is rejected. We use `select(...)`
 * to produce a small integer sort key (0 for same-category, 1
 * otherwise) and sort ascending on that first, then by year descending.
 */
export const RELATED_PROJECTS_QUERY = groq`
  *[_type == "project" && slug.current != $slug]
    | order(select(category._ref == $categoryId => 0, 1) asc, year desc)
    [0...5] {
      _id,
      title,
      "slug": slug.current,
      shortDescription,
      location,
      year,
      category->{ title },
      featuredImage {
        asset->{ url },
        alt
      }
    }
`;

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

export interface RelatedProject {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  location: string;
  year: number;
  category?: { title: string };
  featuredImage?: {
    asset?: { url: string };
    alt?: string;
  };
}
