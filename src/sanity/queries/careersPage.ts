/**
 * Careers Page query
 * ==================
 * Pulls the singleton document that drives /careers. Each hero
 * image keeps its native dimensions metadata so the page can
 * size them without a second round-trip.
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

export const CAREERS_PAGE_QUERY = groq`
  *[_type == "careersPage"][0] {
    heroTitle,
    heroCtaLabel,
    heroCtaHref,
    heroImageLeft { ${HERO_IMAGE_PROJECTION} },
    heroImageCentre { ${HERO_IMAGE_PROJECTION} },
    heroImageRight { ${HERO_IMAGE_PROJECTION} },
    introHeading,
    introBody,
    cultureLabel,
    cultureHeading,
    cultureBody,
    cultureImage { ${HERO_IMAGE_PROJECTION} },
    whyWorkHeading,
    whyWorkItems[] {
      title,
      body
    }
  }
`;

export interface CareersHeroImage {
  asset?: {
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

export interface CareersWhyWorkItem {
  title: string;
  body: string;
}

export interface CareersPageData {
  heroTitle: string;
  heroCtaLabel?: string;
  heroCtaHref?: string;
  heroImageLeft?: CareersHeroImage;
  heroImageCentre?: CareersHeroImage;
  heroImageRight?: CareersHeroImage;
  introHeading?: string;
  introBody?: string;
  cultureLabel?: string;
  cultureHeading?: string;
  cultureBody?: string;
  cultureImage?: CareersHeroImage;
  whyWorkHeading?: string;
  whyWorkItems?: CareersWhyWorkItem[];
}
