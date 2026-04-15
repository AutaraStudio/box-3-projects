/**
 * Site Footer Schema
 * ==================
 * Singleton document for the site footer. Organised into tabs
 * for clarity:
 *   1. Links       — the navigation columns at the top of the footer
 *   2. Social      — social media icons row
 *   3. Legal       — privacy / terms / legal links
 *   4. Contact     — phone number and newsletter signup
 *   5. Credits     — copyright and "Made by" credit line
 */

import { defineField, defineType } from "sanity";

/** Reusable link object — a label plus a URL path or full URL. */
const footerLink = {
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Link text",
      description: "The text the visitor sees",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "href",
      title: "Link destination",
      description:
        "Where this link goes — a page path e.g. /about or a full URL e.g. https://instagram.com/...",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
};

export default defineType({
  name: "siteFooter",
  title: "Footer",
  type: "document",
  groups: [
    { name: "links", title: "Links", default: true },
    { name: "social", title: "Social" },
    { name: "legal", title: "Legal" },
    { name: "contact", title: "Contact" },
    { name: "credits", title: "Credits" },
  ],
  fields: [
    /* ── Links ─────────────────────────────────────────────── */
    defineField({
      name: "primaryLinks",
      title: "Main Links",
      description:
        "The first column of footer links (e.g. About, Services, Projects, Clients)",
      type: "array",
      group: "links",
      of: [footerLink],
    }),
    defineField({
      name: "secondaryLinks",
      title: "Secondary Links",
      description:
        "The second column of footer links (e.g. Culture & Careers, Blog, Contact)",
      type: "array",
      group: "links",
      of: [footerLink],
    }),
    defineField({
      name: "miscLinks",
      title: "Additional Links",
      description: "Any extra links (e.g. FAQ)",
      type: "array",
      group: "links",
      of: [footerLink],
    }),

    /* ── Social ────────────────────────────────────────────── */
    defineField({
      name: "socialLinks",
      title: "Social Media Links",
      description:
        "Social channels — these open in a new tab. Use the full URL e.g. https://instagram.com/...",
      type: "array",
      group: "social",
      of: [footerLink],
    }),

    /* ── Legal ─────────────────────────────────────────────── */
    defineField({
      name: "legalLinks",
      title: "Legal Links",
      description: "Legal pages (e.g. Privacy Policy, Terms & Conditions)",
      type: "array",
      group: "legal",
      of: [footerLink],
    }),

    /* ── Contact ───────────────────────────────────────────── */
    defineField({
      name: "stayInTouchLabel",
      title: '"Stay In Touch" label',
      description: "The label shown before the phone number",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "phone",
      title: "Phone number",
      description: "Shown in the footer contact row",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "email",
      title: "Email address",
      description: "Contact email shown in the footer",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "address",
      title: "Office address",
      description: "Full office address shown in the footer",
      type: "text",
      rows: 3,
      group: "contact",
    }),
    defineField({
      name: "contactHeading",
      title: "Contact details heading",
      description: "Heading above the contact details e.g. Find Us",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "newsletterPlaceholder",
      title: "Newsletter input placeholder",
      description:
        "The hint text inside the newsletter email input e.g. Your email...",
      type: "string",
      group: "contact",
    }),

    /* ── Credits ───────────────────────────────────────────── */
    defineField({
      name: "madeByLabel",
      title: '"Made by" credit line',
      description: "Credit line shown at the bottom e.g. Made by Autara Studio",
      type: "string",
      group: "credits",
    }),
    defineField({
      name: "madeByUrl",
      title: '"Made by" link',
      description: "Where the credit line links to (full URL)",
      type: "string",
      group: "credits",
    }),
    defineField({
      name: "copyright",
      title: "Copyright line",
      description:
        "The copyright text at the very bottom e.g. © 2026. Box 3 Projects Ltd. All Rights Reserved.",
      type: "string",
      group: "credits",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Footer" }),
  },
});
