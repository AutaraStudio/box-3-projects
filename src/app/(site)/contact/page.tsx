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

import "./contact.css";

export const metadata: Metadata = {
  title: "Contact — Box 3 Projects",
  description:
    "Tell us about the brief. We read every enquiry and reply within two working days.",
};

export default function ContactPage() {
  return (
    <main className="contact-page">
      <section className="contact-page__hero">
        <div className="container">
          <Heading as="h1" className="contact-page__heading text-h1">
            Tell us about the brief.
          </Heading>
        </div>
      </section>

      <section className="contact-page__body">
        <div className="container contact-page__grid">
          <div className="contact-page__intro">
            <p className="contact-page__label text-small text-caps">Contact</p>
            <p className="contact-page__lede text-large">
              We read every enquiry. If it's a fit, you'll hear
              back from someone in the studio within two working
              days.
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
