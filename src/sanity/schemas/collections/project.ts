/**
 * Project Schema
 * ==============
 * A single project / case study. Fields are organised into tabs
 * so the Studio UI stays clean for non-technical clients:
 *
 *   1. Overview       — title, slug, category, summary, location, year
 *   2. Images         — featured image + gallery
 *   3. Project Stats  — flexible label/value pairs (client, size, cost…)
 *   4. Client         — objective and feedback quote
 *
 * Images are NOT required so the seed script can create a
 * representative document without uploading any assets.
 */

import { defineField, defineType } from "sanity";

import { TaggedMediaArrayPicker } from "../../components/TaggedMediaArrayPicker";
import { TaggedMediaPicker } from "../../components/TaggedMediaPicker";

export default defineType({
  name: "project",
  title: "Project",
  type: "document",
  groups: [
    { name: "overview", title: "Overview", default: true },
    { name: "images", title: "Images" },
    { name: "stats", title: "Project Stats" },
    { name: "client", title: "Client" },
  ],
  fields: [
    /* ── Overview ─────────────────────────────────────────── */
    defineField({
      name: "title",
      title: "Project title",
      description: "The name of the project",
      type: "string",
      group: "overview",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      description:
        "URL path for this project — auto-generated from title",
      type: "slug",
      group: "overview",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      description:
        "Project category e.g. Commercial, Cat A, Residential",
      type: "reference",
      group: "overview",
      to: [{ type: "projectCategory" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      description:
        "One or two sentence summary shown in project listings",
      type: "text",
      rows: 3,
      group: "overview",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      description: "City or area e.g. London, Mayfair",
      type: "string",
      group: "overview",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "year",
      title: "Year completed",
      description: "Year the project was completed e.g. 2024",
      type: "number",
      group: "overview",
      validation: (rule) => rule.required().min(2000).max(2100),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      description:
        "Keywords for filtering e.g. Office, Hospitality, Luxury",
      type: "array",
      group: "overview",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),

    /* ── Images ───────────────────────────────────────────── */
    defineField({
      name: "featuredImage",
      title: "Featured image",
      description:
        "Main project image — shown in listings and at the top of the project page. Click 'Pick from library' to browse tagged images, or use the native upload / Select below.",
      type: "image",
      group: "images",
      options: { hotspot: true },
      components: { input: TaggedMediaPicker },
      fields: [
        defineField({
          name: "alt",
          title: "Image description (for accessibility)",
          description: "Describe the image for accessibility",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "additionalImages",
      title: "Additional images",
      description:
        "Project gallery images. Click 'Pick multiple from library' to select many tagged images at once. The native 'Add item' button still works for single picks or direct upload.",
      type: "array",
      group: "images",
      components: { input: TaggedMediaArrayPicker },
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Image description (for accessibility)",
              description:
                "Optional — a short description used by screen readers. Recommended for accessibility but not required at upload time.",
              type: "string",
            }),
          ],
        },
      ],
    }),

    /* ── Project Stats ────────────────────────────────────── */
    defineField({
      name: "expertise",
      title: "Expertise Provided",
      description:
        "Select from existing expertise tags or create new ones.",
      type: "array",
      group: "stats",
      of: [{ type: "reference", to: [{ type: "expertise" }] }],
    }),
    defineField({
      name: "team",
      title: "Team Members",
      description:
        "Select the team members who worked on this project.",
      type: "array",
      group: "stats",
      of: [{ type: "reference", to: [{ type: "teamMember" }] }],
    }),
    defineField({
      name: "stats",
      title: "Project stats",
      description:
        "Flexible project details shown as a stat grid. Add as many as needed — each has a label and a value.",
      type: "array",
      group: "stats",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              description:
                "Stat label e.g. Client, Size, Square Footage, Project Cost, Completed",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "value",
              title: "Value",
              description:
                "Stat value e.g. Hugo Boss, 5,000 sq ft, £2.4M, March 2024",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "value" },
          },
        },
      ],
    }),

    /* ── Client ───────────────────────────────────────────── */
    defineField({
      name: "clientObjective",
      title: "Client objective",
      description:
        "Brief from the client — what they wanted to achieve",
      type: "text",
      rows: 5,
      group: "client",
    }),
    defineField({
      name: "clientFeedback",
      title: "Client feedback",
      description:
        "Quote or testimonial from the client about the project",
      type: "text",
      rows: 5,
      group: "client",
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "featuredImage",
      subtitle: "category.title",
    },
  },
});
