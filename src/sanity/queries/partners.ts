/**
 * Partners Queries
 * ================
 * The Partners collection is the single source of truth for the
 * marquee — every partner doc is rendered in drag order. The
 * heading shown above the marquee lives on Site Settings (one
 * field, not a whole singleton).
 *
 * Dereferenced shape is reused by testimonials too, so the
 * projection lives here rather than on a section schema.
 */

import { groq } from "next-sanity";

/** Fragment reused by any query that needs a resolved partner +
 *  logo URL (marquee, testimonials, etc.). */
export const PARTNER_PROJECTION = groq`
  _id,
  "name": name,
  "logoUrl": logo.asset->url
`;

/** All partner documents in drag order — drives the marquee. */
export const PARTNERS_QUERY = groq`
  *[_type == "partner" && defined(logo.asset)]
    | order(orderRank asc, name asc) {
      ${PARTNER_PROJECTION}
    }
`;

export interface PartnerItem {
  _id: string;
  name: string;
  logoUrl?: string;
}

/** A partner with its logo URL resolved to inline SVG markup.
 *  Produced server-side before passing to the client-side
 *  PartnersSection marquee. _key synthesised from _id so React
 *  list keys stay stable. */
export interface ResolvedPartner {
  _key: string;
  name: string;
  svgContent: string;
}
