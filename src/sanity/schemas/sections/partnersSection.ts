/**
 * Partners Section Schema
 * =======================
 * Reusable section for a grid of partner / brand logos.
 * Each partner has a name and an SVG logo. SVGs should use
 * currentColor so the colour can be controlled via CSS.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "partnersSection",
  title: "Partners Section",
  type: "document",
  groups: [{ name: "content", title: "Content", default: true }],
  fields: [
    defineField({
      name: "sectionLabel",
      title: "Section label",
      description: "The label shown above the logo grid e.g. Our Partners",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "partners",
      title: "Partners",
      description: "Add one entry per partner — drag to reorder",
      type: "array",
      group: "content",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Partner name",
              description: "Brand or company name (shown below the logo card)",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "logo",
              title: "Partner logo (SVG)",
              description:
                "Upload an SVG file. The logo will display in the brand pink colour by default and change on hover. Make sure the SVG uses currentColor for fill and stroke so its colour can be controlled.",
              type: "file",
              options: { accept: ".svg,image/svg+xml" },
            }),
          ],
          preview: { select: { title: "name" } },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "sectionLabel" },
    prepare: ({ title }) => ({
      title: "Partners Section",
      subtitle: title,
    }),
  },
});
