/**
 * About Page Query
 * ================
 * Pulls every editable surface for /about. Returns null when the
 * doc isn't authored yet so the page falls back to its built-in
 * launch copy.
 */

import { groq } from "next-sanity";

const LINK_PROJECTION = groq`label, href, pageName`;
const IMAGE_PROJECTION = groq`
  asset->{ _id, url, metadata { dimensions } },
  alt,
  hotspot,
  crop
`;

export const ABOUT_PAGE_QUERY = groq`
  *[_type == "aboutPage"][0] {
    heroTitle,
    heroCta { ${LINK_PROJECTION} },
    introHeading,
    introBody,
    teamLabel,
    teamHeading,
    teamIntro,
    closingLabel,
    closingHeading,
    closingBody,
    closingImage { ${IMAGE_PROJECTION} },
    closingCta { ${LINK_PROJECTION} }
  }
`;

export interface AboutPageImage {
  asset?: { _id: string; url: string };
  alt?: string;
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

export interface AboutPageLink {
  label?: string;
  href?: string;
  pageName?: string;
}

export interface AboutPageData {
  heroTitle?: string;
  heroCta?: AboutPageLink;
  introHeading?: string;
  introBody?: string;
  teamLabel?: string;
  teamHeading?: string;
  teamIntro?: string;
  closingLabel?: string;
  closingHeading?: string;
  closingBody?: string;
  closingImage?: AboutPageImage;
  closingCta?: AboutPageLink;
}
