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
 * Featured projects — drives the site-wide menu and footer columns.
 * Only projects with `featured == true` flow through, ordered by
 * year desc so the newest signature work leads. Returns just the
 * fields the menu / footer render: title, slug, category title.
 */
export const FEATURED_PROJECTS_QUERY = groq`
  *[_type == "project"
    && featured == true
    && defined(slug.current)]
    | order(year desc, title asc) {
      _id,
      title,
      "slug": slug.current,
      "categoryTitle": category->title
    }
`;

/**
 * Home featured projects — same `featured == true` filter as the
 * menu query, but returns the full ProjectListItem shape (image,
 * year, location, category) and caps at 4 so the home page section
 * doesn't grow unbounded as the editor adds more featured work.
 */
export const HOME_FEATURED_PROJECTS_QUERY = groq`
  *[_type == "project"
    && featured == true
    && defined(featuredImage)
    && defined(slug.current)]
    | order(year desc, title asc) [0...4] {
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

export interface FeaturedProjectItem {
  _id: string;
  title: string;
  slug: string;
  categoryTitle?: string;
}

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

/* --------------------------------------------------------------------------
   Single-project queries (detail page)
   --------------------------------------------------------------------------
   PROJECT_BY_SLUG_QUERY pulls every field the detail page renders;
   RELATED_PROJECTS_QUERY pulls up to 5 peers, same-category-first
   then by year-desc, with the current project excluded. The two are
   issued in parallel from the page's Promise.all. */

const PROJECT_DETAIL_PROJECTION = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  location,
  year,
  tags,
  featuredImage {
    asset->{ _id, url, metadata { dimensions { width, height, aspectRatio } } },
    alt
  },
  additionalImages[] {
    asset->{ _id, url, metadata { dimensions { width, height, aspectRatio } } },
    alt
  },
  category->{ _id, title, "slug": slug.current },
  expertise[]->{ _id, title },
  team[]->{
    _id,
    name,
    role,
    qualifications,
    linkedinUrl,
    image {
      asset->{ _id, url, metadata { dimensions { width, height, aspectRatio } } },
      alt
    }
  },
  stats[] {
    _key,
    label,
    value
  },
  clientObjective,
  clientFeedback
`;

export const PROJECT_BY_SLUG_QUERY = groq`
  *[_type == "project" && slug.current == $slug][0] {
    ${PROJECT_DETAIL_PROJECTION}
  }
`;

/* `order(...)` requires field paths, not boolean expressions, so we
   coerce same-category-or-not into a 0/1 sort key via select(...).
   Sorting that ascending puts same-category peers first, then we
   secondary-sort by year desc. */
export const RELATED_PROJECTS_QUERY = groq`
  *[_type == "project"
    && slug.current != $slug
    && defined(featuredImage)]
    | order(select(category._ref == $categoryId => 0, 1) asc, year desc)
    [0...5] {
      _id,
      title,
      "slug": slug.current,
      year,
      location,
      category->{ _id, title, "slug": slug.current },
      featuredImage {
        asset->{
          _id,
          url,
          metadata { dimensions { width, height, aspectRatio } }
        },
        alt
      }
    }
`;

export interface ProjectImage {
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
}

export interface ProjectStat {
  _key: string;
  label: string;
  value: string;
}

export interface ProjectTeamMember {
  _id: string;
  name: string;
  role: string;
  qualifications?: string;
  linkedinUrl?: string;
  image?: ProjectImage;
}

export interface ProjectExpertiseRef {
  _id: string;
  title: string;
}

export interface ProjectDetail {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  location: string;
  year: number;
  tags?: string[];
  featuredImage?: ProjectImage;
  additionalImages?: ProjectImage[];
  category?: {
    _id: string;
    title: string;
    slug: string;
  };
  expertise?: ProjectExpertiseRef[];
  team?: ProjectTeamMember[];
  stats?: ProjectStat[];
  clientObjective?: string;
  clientFeedback?: string;
}

export type RelatedProject = ProjectListItem;
