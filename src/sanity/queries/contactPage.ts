/**
 * Contact Page Query
 * ==================
 * GROQ query and TypeScript interface for the contact page document.
 */

import { groq } from "next-sanity";

import {
  TESTIMONIALS_SECTION_PROJECTION,
  type TestimonialsSectionData,
} from "./testimonialsSection";

/** Fetches the contactPage singleton with all fields. */
export const CONTACT_PAGE_QUERY = groq`
  *[_type == "contactPage"][0] {
    heading,
    sectionLabel,
    sectionReference,
    tabs[] {
      _key,
      label,
      key
    },
    formFields[] {
      _key,
      label,
      name,
      placeholder,
      type,
      halfWidth
    },
    submitLabel,
    infoHeading,
    address,
    phone,
    email,
    infoImage {
      asset,
      alt
    },
    testimonialsSection {
      ${TESTIMONIALS_SECTION_PROJECTION}
    }
  }
`;

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

export interface ContactFormTab {
  _key: string;
  label: string;
  key: string;
}

export interface ContactFormField {
  _key: string;
  label: string;
  name: string;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "textarea";
  halfWidth?: boolean;
}

export interface ContactPageData {
  heading: string;
  sectionLabel?: string;
  sectionReference?: string;
  tabs?: ContactFormTab[];
  formFields?: ContactFormField[];
  submitLabel?: string;
  infoHeading?: string;
  address?: string;
  phone?: string;
  email?: string;
  infoImage?: {
    asset: { _ref: string };
    alt?: string;
  } | null;
  testimonialsSection?: TestimonialsSectionData;
}
