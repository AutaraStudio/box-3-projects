/**
 * Site Settings singleton
 * =======================
 * Global content used everywhere on the site — header navigation,
 * footer columns, brand label, contact info, default SEO. One
 * document for the whole site (no list view, no duplicate /
 * delete in the studio).
 *
 * Field groups split the document into tabs in the studio so
 * editors don't have to scroll past unrelated fields when they're
 * just changing a phone number.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "brand", title: "Brand", default: true },
    { name: "header", title: "Header" },
    { name: "footer", title: "Footer" },
    { name: "contact", title: "Contact info" },
    { name: "seo", title: "SEO defaults" },
  ],
  fields: [
    /* ── Brand ──────────────────────────────────────────── */
    defineField({
      name: "brandName",
      title: "Brand name",
      description:
        "Used as the accessible name of the home logo, the " +
        "footer copyright, and the default site title.",
      type: "string",
      group: "brand",
      validation: (rule) => rule.required().max(60),
    }),

    /* ── Header navigation ─────────────────────────────── */
    defineField({
      name: "headerPrimaryLinks",
      title: "Primary nav links",
      description:
        "First column of nav links shown beside the logo. Visible " +
        "at the top of the viewport; collapse into the side menu " +
        "as the user scrolls.",
      type: "array",
      of: [{ type: "link" }],
      group: "header",
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: "headerSecondaryLinks",
      title: "Secondary nav links",
      description:
        "Second column of nav links — typically the supporting " +
        "links (Careers, Contact, etc.).",
      type: "array",
      of: [{ type: "link" }],
      group: "header",
      validation: (rule) => rule.max(4),
    }),

    /* ── Side menu ─────────────────────────────────────── */
    defineField({
      name: "menuPrimaryLinks",
      title: "Side menu — primary links",
      description:
        "Big editorial links shown at the top of the slide-in side " +
        "menu (e.g. Home, About, Projects).",
      type: "array",
      of: [{ type: "link" }],
      group: "header",
    }),
    defineField({
      name: "menuMoreLinks",
      title: 'Side menu — "More" links',
      description:
        'The smaller links shown beneath the primary list, under ' +
        'a "More" header in the side menu.',
      type: "array",
      of: [{ type: "link" }],
      group: "header",
    }),

    /* ── Footer ─────────────────────────────────────────── */
    defineField({
      name: "footerPages",
      title: "Footer — Pages column",
      description: 'Links shown under the "Pages" heading in the footer.',
      type: "array",
      of: [{ type: "link" }],
      group: "footer",
    }),
    defineField({
      name: "footerSocial",
      title: "Footer — Social column",
      description:
        'External links shown under the "Social" heading. Use full ' +
        "URLs (https://...).",
      type: "array",
      of: [{ type: "link" }],
      group: "footer",
    }),
    defineField({
      name: "footerLegal",
      title: "Footer — Legal column",
      description:
        "Privacy policy / Terms / Cookie pages — surfaced beneath " +
        "the main footer columns.",
      type: "array",
      of: [{ type: "link" }],
      group: "footer",
    }),

    /* ── Contact info (used in footer + side menu) ─────── */
    defineField({
      name: "addressLines",
      title: "Address",
      description:
        "Each line in the address — one entry per visual line. " +
        "Shown in the footer and the side menu.",
      type: "array",
      of: [{ type: "string" }],
      group: "contact",
    }),
    defineField({
      name: "email",
      title: "Email",
      description: "Public contact email.",
      type: "string",
      group: "contact",
      validation: (rule) =>
        rule.email().error("Use a valid email address (e.g. hello@example.com)."),
    }),
    defineField({
      name: "phone",
      title: "Phone (display)",
      description:
        'How the phone number reads on screen, e.g. "+44 (0)20 8050 7815".',
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "phoneHref",
      title: "Phone (tel: link)",
      description:
        'The dial-able version used when someone taps the phone ' +
        "number. Format: tel:02080507815 (no spaces, with tel: prefix).",
      type: "string",
      group: "contact",
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true;
          return (
            value.startsWith("tel:") || 'Phone link must start with "tel:".'
          );
        }),
    }),

    /* ── SEO defaults ──────────────────────────────────── */
    defineField({
      name: "seoTitle",
      title: "Default page title",
      description:
        "Shown in browser tabs and search results when a page " +
        "doesn't set its own title.",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "Default meta description",
      description:
        "Default 1–2 sentence summary used for search snippets and " +
        "social previews when a page doesn't set its own.",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: "seoOgImage",
      title: "Default share image",
      description:
        "Image used when the site URL is shared on social — " +
        "1200×630 recommended.",
      type: "image",
      options: { hotspot: true },
      group: "seo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
