/**
 * Expertise
 * =========
 * Standalone tag-style document referenced by projects to describe
 * which disciplines Box 3 provided on a given project. Clients
 * create expertise tags once and reuse them across the catalogue.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "expertise",
  title: "Expertise",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: "Expertise name e.g. Category A Fit-Out, Lighting Design",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "title" },
  },
});
