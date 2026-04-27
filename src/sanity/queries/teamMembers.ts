/**
 * Team members query
 * ==================
 * Pulls every `teamMember` document from Sanity, ordered by the
 * `order` field (lower first, then by name as a tiebreaker so
 * unsorted entries land alphabetically).
 *
 * Used by the about page to render the studio team grid. The
 * existing `projects.ts` query also dereferences team members
 * inline per-project; this file is the standalone full-list
 * fetch.
 */

import { groq } from "next-sanity";

export const TEAM_MEMBERS_QUERY = groq`
  *[_type == "teamMember"] | order(order asc, name asc) {
    _id,
    name,
    role,
    qualifications,
    linkedinUrl,
    category,
    order,
    image {
      asset->{ _id, url, metadata { dimensions { width, height, aspectRatio } } },
      alt
    }
  }
`;

export interface TeamMemberImage {
  asset?: {
    _id: string;
    url: string;
    metadata?: {
      dimensions: { width: number; height: number; aspectRatio: number };
    };
  };
  alt?: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  qualifications?: string;
  linkedinUrl?: string;
  /** Category slug — keys into the GROUP_ORDER list in the
   *  AboutTeam component to bucket members under their group's
   *  display title. */
  category?: string;
  order?: number;
  image?: TeamMemberImage;
}
