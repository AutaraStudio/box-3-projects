/**
 * Partners Section Schema
 * =======================
 * Singleton that drives the partners marquee. Now references Partner
 * collection documents rather than storing inline objects — the same
 * partner docs are reused by testimonials (for the company logo), so
 * uploading a logo once updates it everywhere.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "partnersSection",
  title: "Partners Section",
  type: "document",
  groups: [{ name: "content", title: "Content", default: true }],
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      description:
        "Top-left heading shown above the marquee e.g. Trusted By",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sectionLabel",
      title: "Section label",
      description:
        "Short label kept for legacy use — not currently rendered.",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "partners",
      title: "Partners",
      description:
        "Select which partners appear in the marquee. To add a new partner (or change a logo), open the Partners collection in the sidebar.",
      type: "array",
      group: "content",
      of: [{ type: "reference", to: [{ type: "partner" }] }],
    }),
  ],
  preview: {
    select: { title: "sectionLabel" },
    prepare: ({ title }) => ({
      title: "Partners Section",
      subtitle: title,
    }),
  },
});
