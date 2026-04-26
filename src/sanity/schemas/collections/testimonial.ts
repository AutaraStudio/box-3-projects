/**
 * Testimonial
 * ===========
 * A single client quote. Designed to be reused — one testimonial
 * can appear on the home page, on a project detail page, or
 * anywhere else a `testimonialsSection` is embedded.
 *
 * The `partner` field is a reference to the Partner collection,
 * which provides the company logo shown next to the quote. Reusing
 * partner docs means logos only need uploading once.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      description:
        "The client's words, in full. Line-breaks are handled automatically — write naturally.",
      type: "text",
      rows: 6,
      validation: (rule) => rule.required().min(20),
    }),
    defineField({
      name: "author",
      title: "Author",
      description: "Person who gave the quote e.g. Jane Doe",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Job title",
      description:
        "Author's role e.g. Head of Workplace, CEO, Director",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "partner",
      title: "Partner (company)",
      description:
        "Link this quote to a Partner — the partner's logo will appear next to the testimonial.",
      type: "reference",
      to: [{ type: "partner" }],
    }),
  ],
  preview: {
    select: {
      title: "author",
      subtitle: "title",
    },
    prepare: ({ title, subtitle }) => ({
      title: title ?? "Testimonial",
      subtitle,
    }),
  },
});
