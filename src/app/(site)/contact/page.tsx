/**
 * Contact page
 * ============
 * Editorial replica of the Populous contact layout, adapted to the
 * Box 3 v2 token system.
 *
 *   ┌──────────────────────────────────────────────────────────┐
 *   │  Have a question? Want to work with us?                  │
 *   ├──────────────────────────────────────────────────────────┤
 *   │  CONTACT                          ┌──────────────────┐   │
 *   │  Send us a note to get the        │ first / last     │   │
 *   │  conversation started.            │ email            │   │
 *   │                                   │ organisation     │   │
 *   │                                   │ project type     │   │
 *   │                                   │ subject          │   │
 *   │                                   │ message          │   │
 *   │                                   │ [submit button]  │   │
 *   │                                   └──────────────────┘   │
 *   └──────────────────────────────────────────────────────────┘
 *
 * The Populous original has a "Region" dropdown — replaced here with
 * a "Project type" dropdown sourced from Box 3's actual project
 * categories so the field has real meaning for the studio.
 */

import type { Metadata } from "next";

import ContactForm from "@/components/contact/ContactForm";
import Heading from "@/components/ui/Heading";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  CONTACT_PAGE_QUERY,
  type ContactPageData,
} from "@/sanity/queries/contactPage";

import "./contact.css";

export const metadata: Metadata = {
  title: "Contact — Box 3 Projects",
  description:
    "Tell us about the brief. We read every enquiry and reply within two working days.",
};

export const revalidate = 3600;

const FALLBACK = {
  heroHeading: "Tell us about the brief.",
  introLabel: "Contact",
  introLede:
    "We read every enquiry. If it's a fit, you'll hear back from someone in the studio within two working days.",
};

function firstFilled(...vs: Array<string | undefined>): string {
  for (const v of vs) if (v && v.trim().length > 0) return v;
  return "";
}

export default async function ContactPage() {
  const page = await sanityFetch<ContactPageData | null>({
    query: CONTACT_PAGE_QUERY,
    revalidate: 3600,
  });

  return (
    <main className="contact-page">
      <section className="contact-page__hero">
        <div className="container">
          <Heading as="h1" className="contact-page__heading text-h1">
            {firstFilled(page?.heroHeading, FALLBACK.heroHeading)}
          </Heading>
        </div>
      </section>

      <section className="contact-page__body">
        <div className="container contact-page__grid">
          <div className="contact-page__intro">
            <p className="contact-page__label text-small text-caps">
              {firstFilled(page?.introLabel, FALLBACK.introLabel)}
            </p>
            <p className="contact-page__lede text-large">
              {firstFilled(page?.introLede, FALLBACK.introLede)}
            </p>
          </div>

          <div className="contact-page__form-wrap">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
