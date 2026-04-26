/**
 * Project Category
 * ================
 * Standalone document that projects reference. Clients create
 * categories once and reuse them across projects — so changing
 * a category name updates every project that points to it.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "projectCategory",
  title: "Project Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Category name",
      description:
        "Category name e.g. Cat A, Cat B, Commercial, Residential",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description: "URL-friendly version of the title — auto-generated",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "title" },
  },
});
