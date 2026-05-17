/**
 * Testimonials Section Projection
 * ===============================
 * GROQ fragment for the embeddable `testimonialsSection` object.
 * A parent document (home page, project, etc.) embeds the section
 * and spreads this projection into its own query so the
 * testimonials + their partner logos resolve in one trip.
 *
 * Each testimonial reference is dereferenced; the nested partner
 * reference is dereferenced further so the logo URL is available
 * for server-side SVG inlining.
 */

import { groq } from "next-sanity";

import { PARTNER_PROJECTION } from "./partners";

/** Spreadable projection. */
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

/** Standalone query — used when the testimonials section lives
 *  on its own singleton (e.g. the home page references the home
 *  page doc via HOME_TESTIMONIALS_QUERY). */
export const HOME_TESTIMONIALS_QUERY = groq`
  *[_type == "homePage"][0].testimonialsSection {
    ${TESTIMONIALS_SECTION_PROJECTION}
  }
`;

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

export interface TestimonialsSectionData {
  sectionLabel?: string;
  reference?: string;
  testimonials: TestimonialItem[];
}

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

export interface ResolvedTestimonialsSection {
  sectionLabel?: string;
  reference?: string;
  testimonials: ResolvedTestimonial[];
}
