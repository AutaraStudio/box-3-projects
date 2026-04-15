/**
 * Vacancy Schema
 * ==============
 * A single open role shown on the careers page. Client can add,
 * edit, or toggle `isActive` off to hide without deleting.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "vacancy",
  title: "Vacancy",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Job title",
      description: "Job title e.g. Senior Project Manager",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "department",
      title: "Department",
      description: "Department this role sits in",
      type: "string",
      options: {
        list: [
          { title: "Design", value: "Design" },
          { title: "Construction", value: "Construction" },
          { title: "Project Management", value: "Project Management" },
          { title: "Business Development", value: "Business Development" },
          { title: "Operations", value: "Operations" },
          { title: "Finance", value: "Finance" },
          { title: "Marketing", value: "Marketing" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      description: "Where this role is based",
      type: "string",
      options: {
        list: [
          { title: "London Office", value: "London Office" },
          { title: "Site-Based", value: "Site-Based" },
          { title: "Hybrid", value: "Hybrid" },
          { title: "Remote", value: "Remote" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "type",
      title: "Employment type",
      description: "Employment type",
      type: "string",
      options: {
        list: [
          { title: "Full Time", value: "Full Time" },
          { title: "Part Time", value: "Part Time" },
          { title: "Contract", value: "Contract" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "salary",
      title: "Salary",
      description:
        "Salary range or indication e.g. £45,000 – £55,000 or Competitive. Leave blank to not display.",
      type: "string",
    }),
    defineField({
      name: "summary",
      title: "Summary",
      description:
        "Two or three sentence overview shown on the vacancy card in the listing. Keep it punchy and human.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "aboutTheRole",
      title: "About the role",
      description:
        "Fuller description of the day-to-day responsibilities and what the role involves.",
      type: "text",
      rows: 8,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "whatWereLookingFor",
      title: "What we're looking for",
      description:
        "The kind of person and experience we are looking for. Write in prose — not a bullet point list.",
      type: "text",
      rows: 6,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "whatWeOffer",
      title: "What we offer",
      description:
        "Benefits, culture, and what makes Box 3 a great place to work. Write in prose — warm and genuine.",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "applyEmail",
      title: "Application email",
      description: "Email address applications should be sent to",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "isActive",
      title: "Active",
      description: "Untick to hide this vacancy without deleting it",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "department" },
  },
});
