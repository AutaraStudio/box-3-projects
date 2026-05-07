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
    cultureCtaLabel,
    cultureCtaHref,
    cultureCtaPageName,
    whyWorkHeading,
    whyWorkItems[] {
      title,
      body
    },
    whyWorkCtaLabel,
    whyWorkCtaHref,
    vacanciesHeading,
    vacanciesEmptyMessage,
    vacanciesApplyButtonLabel,
    speculativeLabel,
    speculativeHeading,
    speculativeBody,
    speculativeImage { ${HERO_IMAGE_PROJECTION} },
    speculativeCtaLabel,
    speculativeCtaHref,
    speculativeCtaPageName,
    applyEyebrowLabel,
    applyCloseLabel,
    applyCloseAriaLabel,
    applyFirstNameLabel,
    applyLastNameLabel,
    applyEmailLabel,
    applyPhoneLabel,
    applyLinkLabel,
    applyExperienceLabel,
    applyCvLabel,
    applyFilePickerLabel,
    applyFileClearLabel,
    applySubmitLabel,
    applySubmittingLabel,
    applyLegalCopy,
    applySentHeading,
    applySentBody,
    applySentCloseLabel,
    seoTitle,
    seoDescription
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
  cultureCtaLabel?: string;
  cultureCtaHref?: string;
  cultureCtaPageName?: string;
  whyWorkHeading?: string;
  whyWorkItems?: CareersWhyWorkItem[];
  whyWorkCtaLabel?: string;
  whyWorkCtaHref?: string;
  vacanciesHeading?: string;
  vacanciesEmptyMessage?: string;
  vacanciesApplyButtonLabel?: string;
  speculativeLabel?: string;
  speculativeHeading?: string;
  speculativeBody?: string;
  speculativeImage?: CareersHeroImage;
  speculativeCtaLabel?: string;
  speculativeCtaHref?: string;
  speculativeCtaPageName?: string;
  applyEyebrowLabel?: string;
  applyCloseLabel?: string;
  applyCloseAriaLabel?: string;
  applyFirstNameLabel?: string;
  applyLastNameLabel?: string;
  applyEmailLabel?: string;
  applyPhoneLabel?: string;
  applyLinkLabel?: string;
  applyExperienceLabel?: string;
  applyCvLabel?: string;
  applyFilePickerLabel?: string;
  applyFileClearLabel?: string;
  applySubmitLabel?: string;
  applySubmittingLabel?: string;
  applyLegalCopy?: string;
  applySentHeading?: string;
  applySentBody?: string;
  applySentCloseLabel?: string;
  seoTitle?: string;
  seoDescription?: string;
}
