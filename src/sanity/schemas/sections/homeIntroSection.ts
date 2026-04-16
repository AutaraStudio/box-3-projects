/**
 * Home Intro Section Schema
 * =========================
 * Singleton document for the dark-themed intro that sits immediately
 * below the home page hero. Introduces Box 3 — who we are, what we
 * do, how we work — before the site moves into Our Approach and the
 * featured projects.
 *
 * Structure:
 *   - Body        — one large body paragraph (left column)
 *   - Points      — 2–3 short monospace lines (right column, 2-col grid)
 *
 * The staircase animation at the bottom is purely presentational
 * and has no schema representation — it reacts to scroll position
 * from the component.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "homeIntroSection",
  title: "Home Intro Section",
  type: "document",
  groups: [{ name: "content", title: "Content", default: true }],
  fields: [
    defineField({
      name: "body",
      title: "Intro paragraph",
      description:
        "The large body paragraph that fills this section. This is the first real introduction visitors get to Box 3, so lead with who you are and what you do.",
      type: "text",
      rows: 6,
      group: "content",
      validation: (rule) => rule.required().min(60),
    }),
    defineField({
      name: "points",
      title: "Supporting paragraphs",
      description:
        "Exactly two short paragraphs shown beneath the main intro — a good place to expand on how you work or what sets Box 3 apart.",
      type: "array",
      group: "content",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "text",
              title: "Text",
              description:
                "One short paragraph. Keep it to a couple of sentences.",
              type: "text",
              rows: 4,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "text" } },
        },
      ],
      validation: (rule) => rule.max(2),
    }),
  ],
  preview: {
    select: { body: "body" },
    prepare: ({ body }) => ({
      title: "Home Intro Section",
      subtitle: body ? body.slice(0, 80) : "(empty)",
    }),
  },
});
