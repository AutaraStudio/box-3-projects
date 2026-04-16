/**
 * Testimonials Section Projection
 * ===============================
 * GROQ fragment for the embeddable `testimonialsSection` object.
 * Any document that embeds the section (home page, project, etc.)
 * can spread this projection into its own query to resolve the
 * testimonials + their linked partner logos in one trip.
 *
 * Each testimonial reference is dereferenced, and the nested
 * partner reference is dereferenced further so the logo URL is
 * available for server-side SVG inlining.
 */

import { groq } from "next-sanity";

import { PARTNER_PROJECTION } from "./partnersSection";

/** Projection fragment — spreadable into any parent query. */
export const TESTIMONIALS_SECTION_PROJECTION = groq`
  sectionLabel,
  reference,
  "testimonials": testimonials[]-> {
    _id,
    quote,
    author,
    title,
    partner-> {
      ${PARTNER_PROJECTION}
    }
  }
`;

/** Single testimonial as returned by the projection. */
export interface TestimonialItem {
  _id: string;
  quote: string;
  author: string;
  title: string;
  partner?: {
    _id: string;
    name: string;
    logoUrl?: string;
  };
}

/** Raw testimonials section data as returned from GROQ. */
export interface TestimonialsSectionData {
  sectionLabel?: string;
  reference?: string;
  testimonials: TestimonialItem[];
}

/** A testimonial where the partner's logo URL has been resolved
 *  to inline SVG markup. Produced server-side in `loadTestimonials`. */
export interface ResolvedTestimonial {
  _id: string;
  quote: string;
  author: string;
  title: string;
  partner?: {
    name: string;
    svgContent: string;
  };
}

/** Resolved section passed down to the client component. */
export interface ResolvedTestimonialsSection {
  sectionLabel?: string;
  reference?: string;
  testimonials: ResolvedTestimonial[];
}
