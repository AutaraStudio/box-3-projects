/**
 * Line Scroll Section
 * ===================
 * Two-row editorial section. Top row pairs a single short word
 * (e.g. "we") with a vertical list of value statements; the word
 * scroll-parallaxes alongside the list. Bottom row is a small
 * heading paired with a paragraph of body copy.
 *
 * Singleton — the content is shared anywhere the component is
 * placed on the site.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "lineScrollSection",
  title: "Line Scroll Section",
  type: "document",
  groups: [
    { name: "top", title: "Top Row", default: true },
    { name: "bottom", title: "Bottom Row" },
  ],
  fields: [
    defineField({
      name: "label",
      title: "Anchor word",
      description:
        "The short word that sits to the left and scroll-parallaxes alongside the lines (e.g. 'we').",
      type: "string",
      group: "top",
      validation: (rule) => rule.required().max(20),
    }),
    defineField({
      name: "lines",
      title: "Lines",
      description:
        "Each line of the right-hand list. Add one line per value or short statement (e.g. 'stay curious, always.').",
      type: "array",
      of: [{ type: "string" }],
      group: "top",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "bottomHeading",
      title: "Bottom heading",
      description:
        "Small label that sits to the left of the description paragraph (e.g. 'services').",
      type: "string",
      group: "bottom",
    }),
    defineField({
      name: "bottomBody",
      title: "Bottom description",
      description:
        "Paragraph that sits next to the bottom heading. Plain text — keep it short.",
      type: "text",
      rows: 4,
      group: "bottom",
    }),
  ],
  preview: {
    select: {
      label: "label",
      first: "lines.0",
    },
    prepare: ({ label, first }) => ({
      title: "Line Scroll Section",
      subtitle: [label, first].filter(Boolean).join(" — "),
    }),
  },
});
