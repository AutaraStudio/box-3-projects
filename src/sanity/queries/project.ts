/**
 * Project Queries
 * ===============
 * GROQ queries + TypeScript interfaces for the project collection.
 * Expertise references are dereferenced so the UI can render tag
 * labels without a second round-trip.
 */

import { groq } from "next-sanity";

/** Shared projection — every field the UI needs for a single project. */
const PROJECT_PROJECTION = groq`
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  location,
  year,
  tags,
  featuredImage {
    asset->{ _id, url },
    alt,
    hotspot,
    crop
  },
  additionalImages[] {
    asset->{ _id, url },
    alt,
    hotspot,
    crop
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
      asset->{ _id, url },
      alt,
      hotspot,
      crop
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

/** Fetch all projects, newest first. */
export const PROJECTS_QUERY = groq`
  *[_type == "project"] | order(year desc, title asc) {
    ${PROJECT_PROJECTION}
  }
`;

/** Fetch a single project by slug. */
export const PROJECT_BY_SLUG_QUERY = groq`
  *[_type == "project" && slug.current == $slug][0] {
    ${PROJECT_PROJECTION}
  }
`;

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

export interface ProjectImage {
  asset?: { _id: string; url: string };
  alt?: string;
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

export interface ProjectStat {
  _key: string;
  label: string;
  value: string;
}

export interface ProjectCategoryRef {
  _id: string;
  title: string;
  slug: string;
}

export interface ExpertiseRef {
  _id: string;
  title: string;
}

export interface TeamMemberRef {
  _id: string;
  name: string;
  role: string;
  qualifications?: string;
  linkedinUrl?: string;
  image?: ProjectImage;
}

export interface Project {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  location: string;
  year: number;
  tags?: string[];
  featuredImage?: ProjectImage;
  additionalImages?: ProjectImage[];
  category?: ProjectCategoryRef;
  expertise?: Array<{ _id: string; title: string }>;
  team?: TeamMemberRef[];
  stats?: ProjectStat[];
  clientObjective?: string;
  clientFeedback?: string;
}
