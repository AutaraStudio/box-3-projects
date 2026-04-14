/**
 * Site Footer Query
 * =================
 * GROQ query and TypeScript interfaces for the footer document.
 */

import { groq } from "next-sanity";

/** Fetches the first siteFooter document with all footer fields. */
export const FOOTER_QUERY = groq`
  *[_type == "siteFooter"][0] {
    primaryLinks[] {
      _key,
      label,
      href
    },
    secondaryLinks[] {
      _key,
      label,
      href
    },
    miscLinks[] {
      _key,
      label,
      href
    },
    socialLinks[] {
      _key,
      label,
      href
    },
    legalLinks[] {
      _key,
      label,
      href
    },
    phone,
    stayInTouchLabel,
    newsletterPlaceholder,
    madeByLabel,
    madeByUrl,
    copyright
  }
`;

/** Shape of a single footer link. */
export interface FooterLink {
  label: string;
  href: string;
  _key: string;
}

/** Shape of the data returned by FOOTER_QUERY. */
export interface SiteFooterData {
  primaryLinks: FooterLink[];
  secondaryLinks: FooterLink[];
  miscLinks: FooterLink[];
  socialLinks: FooterLink[];
  legalLinks: FooterLink[];
  phone: string;
  stayInTouchLabel: string;
  newsletterPlaceholder: string;
  madeByLabel: string;
  madeByUrl: string;
  copyright: string;
}
