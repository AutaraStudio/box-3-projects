/**
 * Careers Page Schema
 * ===================
 * Singleton document for the careers page. Holds the page-level
 * copy only — individual roles live in the `vacancy` collection
 * and are listed below the intro on the rendered page.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "careersPage",
  title: "Careers Page",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Page heading",
      description: "Main heading on the careers page e.g. Join the Team",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "introduction",
      title: "Introduction",
      description:
        "Opening paragraph shown above the vacancies list. Tell candidates what it is like to work here.",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "noVacanciesMessage",
      title: "No vacancies message",
      description:
        "Message shown when there are no open roles. Include an email address for speculative applications.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Careers Page" }),
  },
});
