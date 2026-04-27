/**
 * Vacancy
 * =======
 * A single open role at the studio. Listed on /careers in the
 * "Open positions" section. Fields are scoped tight on purpose —
 * the careers page treats each vacancy as a one-line listing
 * (role + meta), not a long-form job spec; deep details live on
 * the linked external posting URL.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "vacancy",
  title: "Vacancy",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Role title",
      description: "e.g. Senior Interior Designer, Project Manager",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "discipline",
      title: "Discipline",
      description:
        "Function the role sits under — used as a filter / chip on the careers page.",
      type: "string",
      options: {
        list: [
          { title: "Design", value: "Design" },
          { title: "Build", value: "Build" },
          { title: "Project Management", value: "Project Management" },
          { title: "Operations", value: "Operations" },
          { title: "Studio", value: "Studio" },
        ],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      description: "City + region. e.g. London, UK",
      type: "string",
      initialValue: "London, UK",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "employmentType",
      title: "Employment type",
      type: "string",
      options: {
        list: [
          { title: "Full-time", value: "Full-time" },
          { title: "Part-time", value: "Part-time" },
          { title: "Contract", value: "Contract" },
          { title: "Internship", value: "Internship" },
        ],
        layout: "radio",
      },
      initialValue: "Full-time",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "salaryMin",
      title: "Salary — minimum",
      description: "Lower bound of the salary band, in GBP.",
      type: "number",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "salaryMax",
      title: "Salary — maximum",
      description: "Upper bound of the salary band, in GBP.",
      type: "number",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      description:
        "One- or two-line role summary shown beneath the title in the listing.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "applyUrl",
      title: "Apply URL",
      description:
        "External application link (Workable, Greenhouse, mailto:, etc.). Leave empty to hide the apply button.",
      type: "url",
    }),
    defineField({
      name: "publishedAt",
      title: "Published date",
      description: "Used for ordering — newest roles surface first.",
      type: "date",
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "isOpen",
      title: "Open",
      description:
        "Toggle off to hide the role from /careers without deleting the document.",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      discipline: "discipline",
      location: "location",
      isOpen: "isOpen",
    },
    prepare: ({ title, discipline, location, isOpen }) => ({
      title,
      subtitle: [
        discipline,
        location,
        isOpen === false ? "(closed)" : null,
      ]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
