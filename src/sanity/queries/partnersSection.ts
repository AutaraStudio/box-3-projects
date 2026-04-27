/**
 * Partners Section Query
 * ======================
 * Fetches the partnersSection singleton and dereferences each partner
 * document along with its logo file asset. The logo URL is then used
 * server-side to inline the raw SVG markup so currentColor can be
 * controlled via CSS.
 *
 * Because partners now live in their own collection, the `->`
 * traversal pulls `name` and `logo` from the partner doc rather than
 * from an inline object.
 */

import { groq } from "next-sanity";

/** Fragment reused by any query that needs a resolved partner +
 *  logo URL (partners section, testimonials section, etc.). */
export const PARTNER_PROJECTION = groq`
  _id,
  "name": name,
  "logoUrl": logo.asset->url
`;

export const PARTNERS_QUERY = groq`
  *[_type == "partnersSection"][0] {
    heading,
    sectionLabel,
    "partners": partners[]-> {
      ${PARTNER_PROJECTION}
    }
  }
`;

/** A single partner entry as returned by the projection above.
 *  logoUrl is optional — the client may not have uploaded an SVG yet.
 *  The component handles this gracefully. */
export interface PartnerItem {
  _id: string;
  name: string;
  logoUrl?: string;
}

/** Shape of the data returned by PARTNERS_QUERY. */
export interface PartnersData {
  heading: string;
  sectionLabel?: string;
  partners: PartnerItem[];
}

/** A partner with its logo URL resolved to inline SVG markup.
 *  Produced server-side before passing to the client-side
 *  PartnersSection marquee. Keeps the _key field on the consumer
 *  side — we synthesise it from _id so React list keys stay stable. */
export interface ResolvedPartner {
  _key: string;
  name: string;
  svgContent: string;
}
