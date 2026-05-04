/**
 * Site Settings Query
 * ===================
 * Fetches the single `siteSettings` document — header / footer /
 * brand / contact info / SEO defaults — used across every page.
 * Returns null if the doc hasn't been authored yet so the layout
 * can fall back to sensible defaults.
 */

import { groq } from "next-sanity";

const LINK_PROJECTION = groq`
  label,
  href,
  pageName
`;

export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0] {
    brandName,

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

export interface SiteSettingsData {
  brandName?: string;
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
  seoTitle?: string;
  seoDescription?: string;
  seoOgImageUrl?: string;
}
