/**
 * Site Settings Query
 * ===================
 * Fetches the single `siteSettings` document — header / footer /
 * brand / contact info / UI labels / SEO defaults — used across
 * every page. Returns null if the doc hasn't been authored yet
 * so the layout can fall back to sensible defaults.
 */

import { groq } from "next-sanity";

const LINK_PROJECTION = groq`
  label,
  "href": coalesce(internalPage, href),
  pageName
`;

export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0] {
    brandName,
    comingSoon,
    comingSoonHeading,
    comingSoonBody,
    partnersHeading,

    headerPrimaryLinks[] { ${LINK_PROJECTION} },
    headerSecondaryLinks[] { ${LINK_PROJECTION} },
    menuPrimaryLinks[] { ${LINK_PROJECTION} },
    menuMoreLinks[] { ${LINK_PROJECTION} },

    footerPages[] { ${LINK_PROJECTION} },
    footerSocial[] { ${LINK_PROJECTION} },
    footerLegal[] { ${LINK_PROJECTION} },

    addressLines,
    email,
    phone,
    phoneHref,

    headerLabels {
      menuOpenLabel,
      menuCloseLabel,
      menuOpenAriaLabel,
      menuCloseAriaLabel,
      contactAriaLabel
    },

    menuLabels {
      moreSectionTitle,
      stayInTouchTitle,
      namePlaceholder,
      emailPlaceholder,
      messagePlaceholder,
      submitLabel,
      submittedLabel,
      siteMenuAriaLabel,
      scrimAriaLabel
    },

    footerLabels {
      pages,
      featuredProjects,
      contact,
      social,
      legal
    },

    projectDetailLabels {
      locationLabel,
      yearLabel,
      expertiseHeading,
      teamHeading,
      briefHeading,
      objectiveLabel,
      feedbackLabel,
      objectiveAccordionLabel,
      feedbackAccordionLabel,
      exploreTitle,
      viewGalleryLabel,
      exploreOpenLabel,
      moreProjectsHeading,
      lightboxPreviousLabel,
      lightboxNextLabel,
      lightboxCloseLabel,
      lightboxCloseAriaLabel
    },

    legalPageLabels {
      lastUpdatedLabel,
      tocAriaLabel
    },

    testimonialsLabels {
      previousLabel,
      nextLabel
    },

    seoTitle,
    seoDescription,
    "seoOgImageUrl": seoOgImage.asset->url
  }
`;

export interface SiteSettingsLink {
  label: string;
  href: string;
  pageName?: string;
}

export interface HeaderLabels {
  menuOpenLabel?: string;
  menuCloseLabel?: string;
  menuOpenAriaLabel?: string;
  menuCloseAriaLabel?: string;
  contactAriaLabel?: string;
}

export interface MenuLabels {
  moreSectionTitle?: string;
  stayInTouchTitle?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  submittedLabel?: string;
  siteMenuAriaLabel?: string;
  scrimAriaLabel?: string;
}

export interface FooterLabels {
  pages?: string;
  featuredProjects?: string;
  contact?: string;
  social?: string;
  legal?: string;
}

export interface ProjectDetailLabels {
  locationLabel?: string;
  yearLabel?: string;
  expertiseHeading?: string;
  teamHeading?: string;
  briefHeading?: string;
  objectiveLabel?: string;
  feedbackLabel?: string;
  objectiveAccordionLabel?: string;
  feedbackAccordionLabel?: string;
  exploreTitle?: string;
  viewGalleryLabel?: string;
  exploreOpenLabel?: string;
  moreProjectsHeading?: string;
  lightboxPreviousLabel?: string;
  lightboxNextLabel?: string;
  lightboxCloseLabel?: string;
  lightboxCloseAriaLabel?: string;
}

export interface LegalPageLabels {
  lastUpdatedLabel?: string;
  tocAriaLabel?: string;
}

export interface TestimonialsLabels {
  previousLabel?: string;
  nextLabel?: string;
}

export interface SiteSettingsData {
  brandName?: string;
  comingSoon?: boolean;
  comingSoonHeading?: string;
  comingSoonBody?: string;
  partnersHeading?: string;
  headerPrimaryLinks?: SiteSettingsLink[];
  headerSecondaryLinks?: SiteSettingsLink[];
  menuPrimaryLinks?: SiteSettingsLink[];
  menuMoreLinks?: SiteSettingsLink[];
  footerPages?: SiteSettingsLink[];
  footerSocial?: SiteSettingsLink[];
  footerLegal?: SiteSettingsLink[];
  addressLines?: string[];
  email?: string;
  phone?: string;
  phoneHref?: string;
  headerLabels?: HeaderLabels;
  menuLabels?: MenuLabels;
  footerLabels?: FooterLabels;
  projectDetailLabels?: ProjectDetailLabels;
  legalPageLabels?: LegalPageLabels;
  testimonialsLabels?: TestimonialsLabels;
  seoTitle?: string;
  seoDescription?: string;
  seoOgImageUrl?: string;
}
