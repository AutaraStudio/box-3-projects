/**
 * Featured Projects Section Query
 * ===============================
 * Fetches the singleton featuredProjectsSection document and
 * dereferences each referenced project with just the fields the
 * home-page row layout needs (title, slug, category, location,
 * year, stats, featured image).
 */

import { groq } from "next-sanity";
import type {
  ProjectCategoryRef,
  ProjectImage,
  ProjectStat,
} from "./project";

export const FEATURED_PROJECTS_QUERY = groq`
  *[_type == "featuredProjectsSection"][0] {
    sectionLabel,
    ctaLabel,
    ctaHref,
    "projects": projects[]->{
      _id,
      title,
      "slug": slug.current,
      location,
      year,
      category->{ _id, title, "slug": slug.current },
      stats[] {
        _key,
        label,
        value
      },
      featuredImage {
        asset->{ _id, url },
        alt,
        hotspot,
        crop
      }
    }
  }
`;

export interface FeaturedProject {
  _id: string;
  title: string;
  slug: string;
  location: string;
  year: number;
  category?: ProjectCategoryRef;
  stats?: ProjectStat[];
  featuredImage?: ProjectImage;
}

export interface FeaturedProjectsData {
  sectionLabel?: string;
  ctaLabel: string;
  ctaHref: string;
  projects: FeaturedProject[];
}
