/**
 * Home Page Query
 * ===============
 * GROQ query and TypeScript interface for the home page document.
 */

import { groq } from "next-sanity";

/** Fetches the first homePage document with hero fields. */
export const HOME_PAGE_QUERY = groq`
  *[_type == "homePage"][0] {
    heading,
    tagline,
    heroImage {
      asset,
      alt
    }
  }
`;

/** Shape of the data returned by HOME_PAGE_QUERY. */
export interface HomePageData {
  heading: string;
  tagline: string;
  heroImage: {
    asset: { _ref: string };
    alt: string;
  };
}
