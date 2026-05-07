/**
 * Projects Page Query
 * ===================
 * Fetches the projectsPage singleton — hero label / heading / two
 * images. Returns null when the doc hasn't been authored yet so
 * the page can fall back to its built-in copy + the static images
 * in /public.
 */

import { groq } from "next-sanity";

export const PROJECTS_PAGE_QUERY = groq`
  *[_type == "projectsPage"][0] {
    label,
    heading,
    baseImage {
      asset->{ _id, url, metadata { dimensions } },
      alt,
      hotspot,
      crop
    },
    overlayImage {
      asset->{ _id, url, metadata { dimensions } },
      alt,
      hotspot,
      crop
    },
    seoTitle,
    seoDescription
  }
`;

export interface ProjectsPageImage {
  asset?: {
    _id: string;
    url: string;
    metadata?: { dimensions?: { width: number; height: number } };
  };
  alt?: string;
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

export interface ProjectsPageData {
  label?: string;
  heading?: string;
  baseImage?: ProjectsPageImage;
  overlayImage?: ProjectsPageImage;
  seoTitle?: string;
  seoDescription?: string;
}
