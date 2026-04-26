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
      asset->{
        _id,
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          }
        }
      },
      alt
    }
  }
`;

/**
 * Category list with per-category project counts. Counts respect
 * the same `defined(featuredImage)` filter the listing uses so the
 * tabs reflect what's actually rendered.
 */
export const PROJECT_CATEGORIES_QUERY = groq`
  *[_type == "projectCategory"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    "count": count(*[
      _type == "project" &&
      references(^._id) &&
      defined(featuredImage)
    ])
  }
`;

export interface ProjectCategoryItem {
  _id: string;
  title: string;
  slug: string;
  count: number;
}

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
      _id: string;
      url: string;
      metadata: {
        dimensions: {
          width: number;
          height: number;
          aspectRatio: number;
        };
      };
    };
    alt?: string;
  };
}
