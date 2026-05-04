/**
 * Contact Page Query
 * ==================
 * Pulls the editable copy for /contact. Returns null when the
 * doc isn't authored yet so the page falls back to its launch
 * copy.
 */

import { groq } from "next-sanity";

export const CONTACT_PAGE_QUERY = groq`
  *[_type == "contactPage"][0] {
    heroHeading,
    introLabel,
    introLede
  }
`;

export interface ContactPageData {
  heroHeading?: string;
  introLabel?: string;
  introLede?: string;
}
