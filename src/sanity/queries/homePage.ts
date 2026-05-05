/**
 * Home Page Query
 * ===============
 * Pulls the homePage singleton with every section's content, plus
 * the embedded testimonialsSection projection (resolves
 * testimonial references + their partner logo URLs in one trip).
 * Returns null when the doc hasn't been authored yet so the page
 * can fall back to its built-in copy.
 */

import { groq } from "next-sanity";

import { TESTIMONIALS_SECTION_PROJECTION } from "./testimonialsSection";
import type { TestimonialsSectionData } from "./testimonialsSection";

const LINK_PROJECTION = groq`label, href, pageName`;

const IMAGE_PROJECTION = groq`
  asset->{ _id, url, metadata { dimensions } },
  alt,
  hotspot,
  crop
`;

export const HOME_PAGE_QUERY = groq`
  *[_type == "homePage"][0] {
    comingSoon,
    comingSoonHeading,
    comingSoonBody,
    heroMediaType,
    heroVideoUrl,
    heroImage { ${IMAGE_PROJECTION} },
    heroStatement,
    heroScrollLabel,
    heroCta { ${LINK_PROJECTION} },
    statementLabel,
    statementHeading,
    statementBody,
    statementCta { ${LINK_PROJECTION} },
    introducingLabel,
    introducingHeading,
    introducingBody,
    introducingImage { ${IMAGE_PROJECTION} },
    introducingCta { ${LINK_PROJECTION} },
    servicesLabel,
    servicesHeading,
    servicesItems[] { title, description },
    servicesCta { ${LINK_PROJECTION} },
    featuredLabel,
    featuredHeading,
    statsLabel,
    statsHeading,
    statsItems[] { value, label, footnote },
    whyLabel,
    whyHeading,
    whyBody,
    whyImage { ${IMAGE_PROJECTION} },
    whyCta { ${LINK_PROJECTION} },
    testimonialsSection { ${TESTIMONIALS_SECTION_PROJECTION} },
    finalCtaHeading,
    finalCtaButton { ${LINK_PROJECTION} }
  }
`;

export interface HomeLink {
  label?: string;
  href?: string;
  pageName?: string;
}

export interface HomeImage {
  asset?: {
    _id: string;
    url: string;
    metadata?: { dimensions?: { width: number; height: number } };
  };
  alt?: string;
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

export interface HomeServiceItem {
  title?: string;
  description?: string;
}

export interface HomeStatItem {
  value?: string;
  label?: string;
  footnote?: string;
}

export interface HomePageData {
  comingSoon?: boolean;
  comingSoonHeading?: string;
  comingSoonBody?: string;
  heroMediaType?: "video" | "image";
  heroVideoUrl?: string;
  heroImage?: HomeImage;
  heroStatement?: string;
  heroScrollLabel?: string;
  heroCta?: HomeLink;

  statementLabel?: string;
  statementHeading?: string;
  statementBody?: string;
  statementCta?: HomeLink;

  introducingLabel?: string;
  introducingHeading?: string;
  introducingBody?: string;
  introducingImage?: HomeImage;
  introducingCta?: HomeLink;

  servicesLabel?: string;
  servicesHeading?: string;
  servicesItems?: HomeServiceItem[];
  servicesCta?: HomeLink;

  featuredLabel?: string;
  featuredHeading?: string;

  statsLabel?: string;
  statsHeading?: string;
  statsItems?: HomeStatItem[];

  whyLabel?: string;
  whyHeading?: string;
  whyBody?: string;
  whyImage?: HomeImage;
  whyCta?: HomeLink;

  testimonialsSection?: TestimonialsSectionData;

  finalCtaHeading?: string;
  finalCtaButton?: HomeLink;
}
