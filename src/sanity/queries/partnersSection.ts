/**
 * Partners Section Query
 * ======================
 * Fetches the singleton partnersSection document with all partners
 * and dereferences each partner's logo file asset to get a direct
 * CDN URL. The URL is used server-side to inline the raw SVG markup
 * so that currentColor can be controlled via CSS.
 */

import { groq } from "next-sanity";

export const PARTNERS_QUERY = groq`
  *[_type == "partnersSection"][0] {
    sectionLabel,
    partners[] {
      _key,
      name,
      logo {
        asset-> {
          url
        }
      }
    }
  }
`;

/** A single partner entry. logo is optional — the client may not
 *  have uploaded an SVG yet. The component handles this gracefully. */
export interface PartnerItem {
  _key: string;
  name: string;
  logo?: {
    asset?: {
      url: string;
    };
  };
}

/** Shape of the data returned by PARTNERS_QUERY. */
export interface PartnersData {
  sectionLabel: string;
  partners: PartnerItem[];
}
