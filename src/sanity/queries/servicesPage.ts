/**
 * Services Page Query
 * ===================
 * Pulls every editable surface for /services. Returns null when
 * the doc isn't authored yet so the page falls back to its
 * built-in launch copy.
 */

import { groq } from "next-sanity";

const LINK_PROJECTION = groq`label, href, pageName`;
const IMAGE_PROJECTION = groq`
  asset->{ _id, url, metadata { dimensions } },
  alt,
  hotspot,
  crop
`;

export const SERVICES_PAGE_QUERY = groq`
  *[_type == "servicesPage"][0] {
    heroTitle,
    heroCta { ${LINK_PROJECTION} },
    introHeading,
    introBody,
    servicesItems[] { title, description },
    servicesCta { ${LINK_PROJECTION} },
    editorialLabel,
    editorialHeading,
    editorialBody,
    editorialImage { ${IMAGE_PROJECTION} },
    editorialCta { ${LINK_PROJECTION} },
    trackLabel,
    trackHeading,
    trackItems[] { value, label, footnote },
    processLabel,
    processHeading,
    processSteps[] { title, body },
    seoTitle,
    seoDescription
  }
`;

export interface ServicesPageImage {
  asset?: { _id: string; url: string };
  alt?: string;
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

export interface ServicesPageLink {
  label?: string;
  href?: string;
  pageName?: string;
}

export interface ServicesPageData {
  heroTitle?: string;
  heroCta?: ServicesPageLink;
  introHeading?: string;
  introBody?: string;
  servicesItems?: Array<{ title?: string; description?: string }>;
  servicesCta?: ServicesPageLink;
  editorialLabel?: string;
  editorialHeading?: string;
  editorialBody?: string;
  editorialImage?: ServicesPageImage;
  editorialCta?: ServicesPageLink;
  trackLabel?: string;
  trackHeading?: string;
  trackItems?: Array<{ value?: string; label?: string; footnote?: string }>;
  processLabel?: string;
  processHeading?: string;
  processSteps?: Array<{ title?: string; body?: string }>;
  seoTitle?: string;
  seoDescription?: string;
}
