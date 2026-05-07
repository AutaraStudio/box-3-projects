/**
 * Legal Page Query
 * ================
 * GROQ query and TypeScript types for the legalPage document type.
 * Fetches a single legal page by slug (privacy-policy, terms-and-
 * conditions, etc.).
 */

import { groq } from "next-sanity";
import type { PortableTextBlock } from "@portabletext/react";

export const LEGAL_PAGE_QUERY = groq`
  *[_type == "legalPage" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    eyebrow,
    lastUpdated,
    intro,
    tocHeading,
    sections[] {
      _key,
      heading,
      "anchorId": anchorId.current,
      body
    },
    metaTitle,
    metaDescription
  }
`;

export const LEGAL_PAGE_SLUGS_QUERY = groq`
  *[_type == "legalPage" && defined(slug.current)][].slug.current
`;

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

export interface LegalPageSection {
  _key: string;
  heading: string;
  anchorId: string;
  body: PortableTextBlock[];
}

export interface LegalPageData {
  _id: string;
  title: string;
  slug: string;
  eyebrow?: string;
  lastUpdated: string;
  intro?: string;
  tocHeading?: string;
  sections: LegalPageSection[];
  metaTitle?: string;
  metaDescription?: string;
}
