/**
 * Partner
 * =======
 * A single client / partner brand. Holds the name and an SVG logo.
 * Referenced from `testimonial` (so the quote can show the company
 * logo) and drives the site-wide partners marquee at the foot of
 * every page.
 *
 * Display order on the marquee comes from the drag-and-drop list
 * view in Studio (managed by sanity-plugin-orderable-document-list,
 * hidden orderRank field). The heading above the marquee lives on
 * the Site Settings → Partners marquee tab.
 *
 * The logo field accepts an SVG file — SVGs should use `currentColor`
 * for fill and stroke so CSS can control the colour per context.
 */

import { defineField, defineType } from "sanity";
import { orderRankField } from "@sanity/orderable-document-list";

export default defineType({
  name: "partner",
  title: "Partner",
  type: "document",
  fields: [
    /* Hidden — managed by the drag-and-drop list view. Sets the
       order partners appear in the marquee. */
    orderRankField({ type: "partner" }),
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
        "Upload an SVG file. The logo will display in the current theme colour. Make sure the SVG uses currentColor for fill and stroke.",
      type: "file",
      options: { accept: ".svg,image/svg+xml" },
    }),
  ],
  preview: {
    select: { title: "name" },
  },
});
