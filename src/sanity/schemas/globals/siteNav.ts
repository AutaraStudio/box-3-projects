/**
 * Site Navigation Schema
 * ======================
 * Singleton document for the top-of-page navigation bar and its
 * mega menu. Organised into tabs for clarity:
 *   1. Links           — the clickable navigation items
 *   2. Contact Details — phone, email, address shown in the mega menu
 *   3. Contact Form    — placeholder and button labels for the form
 */

import { defineField, defineType } from "sanity";

/** Reusable link object — a label plus a URL path. */
const navLink = {
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Link text",
      description: "The text the visitor sees e.g. About",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "href",
      title: "Link destination",
      description: "The page this link opens e.g. /about",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
};

export default defineType({
  name: "siteNav",
  title: "Navigation",
  type: "document",
  groups: [
    { name: "links", title: "Links", default: true },
    { name: "contact", title: "Contact Details" },
    { name: "form", title: "Contact Form" },
  ],
  fields: [
    /* ── Links ─────────────────────────────────────────────── */
    defineField({
      name: "primaryLinks",
      title: "Main Nav Links",
      description:
        "The main row of links in the header (e.g. About, Services, Projects, Clients)",
      type: "array",
      group: "links",
      of: [navLink],
    }),
    defineField({
      name: "secondaryLinks",
      title: "Secondary Nav Links",
      description:
        "Smaller links in the header (e.g. Culture & Careers, Blog, Contact)",
      type: "array",
      group: "links",
      of: [navLink],
    }),
    defineField({
      name: "megaMenuCompanyLinks",
      title: "Mega Menu — Company Links",
      description:
        "Links shown inside the mega menu overlay when a visitor opens it",
      type: "array",
      group: "links",
      of: [navLink],
    }),

    /* ── Contact Details ───────────────────────────────────── */
    defineField({
      name: "phone",
      title: "Phone number",
      description: "Shown in the mega menu — e.g. +44 20 0000 0000",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "email",
      title: "Email address",
      description: "Shown in the mega menu — e.g. hello@box3projects.co.uk",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "address",
      title: "Office address",
      description: "Shown in the mega menu — e.g. London, UK",
      type: "text",
      group: "contact",
    }),

    /* ── Contact Form ──────────────────────────────────────── */
    defineField({
      name: "contactForm",
      title: "Contact Form Labels",
      description:
        "Placeholder text and button label for the contact form inside the mega menu",
      type: "object",
      group: "form",
      fields: [
        defineField({
          name: "namePlaceholder",
          title: "Name field placeholder",
          description: "Shown inside the empty Name input",
          type: "string",
        }),
        defineField({
          name: "emailPlaceholder",
          title: "Email field placeholder",
          description: "Shown inside the empty Email input",
          type: "string",
        }),
        defineField({
          name: "messagePlaceholder",
          title: "Message field placeholder",
          description: "Shown inside the empty Message textarea",
          type: "string",
        }),
        defineField({
          name: "submitLabel",
          title: "Submit button label",
          description: "The text on the send button e.g. Send message",
          type: "string",
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Navigation" }),
  },
});
