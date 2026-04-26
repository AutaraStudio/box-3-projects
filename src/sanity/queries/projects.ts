/**
 * Projects query
 * ==============
 * Lists every project with the bits the listing page needs:
 * title, slug, year, location, category (with title for filtering),
 * and the featured image. Ordered newest year first, then title.
 */

import { groq } from "next-sanity";

export const PROJECTS_LIST_QUERY = groq`
  *[_type == "project" && defined(featuredImage)] | order(year desc, title asc) {
    _id,
    title,
    "slug": slug.current,
    year,
    location,
    category->{
      _id,
      title,
      "slug": slug.current
    },
    featuredImage {
      asset,
      alt
    }
  }
`;

export interface ProjectListItem {
  _id: string;
  title: string;
  slug: string;
  year: number;
  location: string;
  category: {
    _id: string;
    title: string;
    slug: string;
  } | null;
  featuredImage: {
    asset: {
      _ref: string;
    };
    alt?: string;
  };
}
