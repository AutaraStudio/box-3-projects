/**
 * Site Navigation Query
 * =====================
 * GROQ query and TypeScript interfaces for the navigation document.
 */

import { groq } from "next-sanity";

/** Fetches the first siteNav document with all navigation fields. */
export const NAV_QUERY = groq`
  *[_type == "siteNav"][0] {
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
    megaMenuCompanyLinks[] {
      _key,
      label,
      href
    },
    phone,
    email,
    address,
    contactForm {
      namePlaceholder,
      emailPlaceholder,
      messagePlaceholder,
      submitLabel
    }
  }
`;

/** Shape of a single navigation link. */
export interface NavLink {
  label: string;
  href: string;
  _key: string;
}

/** Shape of the contact form labels. */
export interface ContactForm {
  namePlaceholder: string;
  emailPlaceholder: string;
  messagePlaceholder: string;
  submitLabel: string;
}

/** Shape of the data returned by NAV_QUERY. */
export interface SiteNavData {
  primaryLinks: NavLink[];
  secondaryLinks: NavLink[];
  megaMenuCompanyLinks: NavLink[];
  phone: string;
  email: string;
  address: string;
  contactForm: ContactForm;
}
