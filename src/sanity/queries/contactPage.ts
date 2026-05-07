/**
 * Contact Page Query
 * ==================
 * Pulls the editable copy for /contact. Returns null when the
 * doc isn't authored yet so the page falls back to its launch
 * copy.
 */

import { groq } from "next-sanity";

const FORM_FIELD_PROJECTION = groq`{ label, placeholder }`;

export const CONTACT_PAGE_QUERY = groq`
  *[_type == "contactPage"][0] {
    heroHeading,
    introLabel,
    introLede,
    firstNameField ${FORM_FIELD_PROJECTION},
    lastNameField ${FORM_FIELD_PROJECTION},
    emailField ${FORM_FIELD_PROJECTION},
    organisationField ${FORM_FIELD_PROJECTION},
    projectTypeField ${FORM_FIELD_PROJECTION},
    subjectField ${FORM_FIELD_PROJECTION},
    messageField ${FORM_FIELD_PROJECTION},
    projectTypes,
    subjects,
    submitLabel,
    submittingLabel,
    sentHeading,
    sentBody,
    seoTitle,
    seoDescription
  }
`;

export interface ContactFormFieldCopy {
  label?: string;
  placeholder?: string;
}

export interface ContactPageData {
  heroHeading?: string;
  introLabel?: string;
  introLede?: string;
  firstNameField?: ContactFormFieldCopy;
  lastNameField?: ContactFormFieldCopy;
  emailField?: ContactFormFieldCopy;
  organisationField?: ContactFormFieldCopy;
  projectTypeField?: ContactFormFieldCopy;
  subjectField?: ContactFormFieldCopy;
  messageField?: ContactFormFieldCopy;
  projectTypes?: string[];
  subjects?: string[];
  submitLabel?: string;
  submittingLabel?: string;
  sentHeading?: string;
  sentBody?: string;
  seoTitle?: string;
  seoDescription?: string;
}
