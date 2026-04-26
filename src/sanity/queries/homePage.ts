/**
 * Home Page Query
 * ===============
 * GROQ query and TypeScript interface for the home page document.
 */

import { groq } from "next-sanity";

import {
  TESTIMONIALS_SECTION_PROJECTION,
  type TestimonialsSectionData,
} from "./testimonialsSection";

/** Fetches the first homePage document. */
export const HOME_PAGE_QUERY = groq`
  *[_type == "homePage"][0] {
    testimonialsSection {
      ${TESTIMONIALS_SECTION_PROJECTION}
    }
  }
`;

/** Shape of the data returned by HOME_PAGE_QUERY. */
export interface HomePageData {
  testimonialsSection?: TestimonialsSectionData;
}
