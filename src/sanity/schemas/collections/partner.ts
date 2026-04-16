/**
 * Partner Schema
 * ==============
 * A single client / partner brand. Holds the name and an SVG logo.
 * Referenced from:
 *   • Partners Section  (the marquee on the home page)
 *   • Testimonial docs  (so the quote can show the company's logo)
 *
 * Keeping partners as their own documents means a logo is uploaded
 * and named once, then reused everywhere it appears. If the client
 * updates a logo later, every surface that references it updates
 * automatically.
 *
 * The logo field accepts an SVG file — SVGs should use `currentColor`
 * for fill and stroke so CSS can control the colour per context.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "partner",
  title: "Partner",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Partner name",
      description: "Brand or company name e.g. Hugo Boss, Meta, Nike",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description:
        "URL-friendly version of the name — auto-generated. Used internally only.",
      type: "slug",
      options: { source: "name", maxLength: 96 },
    }),
    defineField({
      name: "logo",
      title: "Partner logo (SVG)",
      description:
        "Upload an SVG file. The logo will display in the current theme colour and invert on hover. Make sure the SVG uses currentColor for fill and stroke so its colour can be controlled.",
      type: "file",
      options: { accept: ".svg,image/svg+xml" },
    }),
  ],
  preview: {
    select: { title: "name" },
  },
});
