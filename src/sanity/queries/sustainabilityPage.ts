/**
 * Sustainability Page query
 * =========================
 * Pulls the singleton document that drives /sustainability.
 * Hero images keep their dimensions metadata so the strip-hero
 * can size them; legacy items dereference the linked project
 * to grab title, slug, year, and featured image — with an
 * optional per-item image override that takes precedence.
 */

import { groq } from "next-sanity";

const HERO_IMAGE_PROJECTION = /* groq */ `
  asset->{
    _id,
    url,
    metadata { dimensions { width, height, aspectRatio } }
  },
  alt
`;

export const SUSTAINABILITY_PAGE_QUERY = groq`
  *[_type == "sustainabilityPage"][0] {
    heroTitle,
    heroCtaLabel,
    heroCtaHref,
    heroImageLeft   { ${HERO_IMAGE_PROJECTION} },
    heroImageCentre { ${HERO_IMAGE_PROJECTION} },
    heroImageRight  { ${HERO_IMAGE_PROJECTION} },
    introHeading,
    introBody,
    statsLabel,
    statsHeading,
    statsItems[] {
      value,
      label,
      footnote
    },
    featureLabel,
    featureHeading,
    featureBody,
    featureImage { ${HERO_IMAGE_PROJECTION} },
    legacyLabel,
    legacyItems[] {
      yearLabel,
      "image": image { ${HERO_IMAGE_PROJECTION} },
      project->{
        _id,
        title,
        "slug": slug.current,
        year,
        location,
        featuredImage { ${HERO_IMAGE_PROJECTION} }
      }
    },
    commitmentLabel,
    commitmentHeading,
    commitmentItems[] {
      title,
      body
    },
    principlesLabel,
    principlesHeading,
    principlesIntro,
    principlesItems[] {
      title,
      body
    },
    certificationsLabel,
    certificationsItems
  }
`;

export interface SustainabilityImage {
  asset?: {
    _id: string;
    url: string;
    metadata?: {
      dimensions: { width: number; height: number; aspectRatio: number };
    };
  };
  alt?: string;
}

export interface SustainabilityLegacyItem {
  yearLabel?: string;
  image?: SustainabilityImage;
  project?: {
    _id: string;
    title: string;
    slug: string;
    year?: number;
    location?: string;
    featuredImage?: SustainabilityImage;
  };
}

export interface SustainabilityPillarItem {
  title: string;
  body: string;
}

export interface SustainabilityStatItem {
  value: string;
  label: string;
  footnote?: string;
}

export interface SustainabilityPageData {
  heroTitle: string;
  heroCtaLabel?: string;
  heroCtaHref?: string;
  heroImageLeft?: SustainabilityImage;
  heroImageCentre?: SustainabilityImage;
  heroImageRight?: SustainabilityImage;
  introHeading?: string;
  introBody?: string;
  statsLabel?: string;
  statsHeading?: string;
  statsItems?: SustainabilityStatItem[];
  featureLabel?: string;
  featureHeading?: string;
  featureBody?: string;
  featureImage?: SustainabilityImage;
  legacyLabel?: string;
  legacyItems?: SustainabilityLegacyItem[];
  commitmentLabel?: string;
  commitmentHeading?: string;
  commitmentItems?: SustainabilityPillarItem[];
  principlesLabel?: string;
  principlesHeading?: string;
  principlesIntro?: string;
  principlesItems?: SustainabilityPillarItem[];
  certificationsLabel?: string;
  certificationsItems?: string[];
}
