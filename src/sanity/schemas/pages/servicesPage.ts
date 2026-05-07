/**
 * Services Page singleton
 * =======================
 * Drives every editable surface on /services — hero / intro /
 * services list / editorial image block / track-record stats /
 * process timeline. Each section sits in its own field group
 * tab so editors can find what they need fast.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "servicesPage",
  title: "Services Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "intro", title: "Intro" },
    { name: "services", title: "Services list" },
    { name: "editorial", title: "Editorial block" },
    { name: "track", title: "Track record" },
    { name: "process", title: "Process timeline" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    /* Hero */
    defineField({
      name: "heroTitle",
      title: "Hero title",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroCta",
      title: "Hero CTA",
      description:
        'Optional CTA. Use a fragment href like #process to ' +
        "scroll to a section on the page.",
      type: "link",
      group: "hero",
    }),

    /* Intro */
    defineField({
      name: "introHeading",
      title: "Intro heading",
      type: "string",
      group: "intro",
    }),
    defineField({
      name: "introBody",
      title: "Intro body",
      description: "Multi-paragraph intro. Blank line between paragraphs.",
      type: "text",
      rows: 8,
      group: "intro",
    }),

    /* Services list */
    defineField({
      name: "servicesItems",
      title: "Services",
      description:
        "Each entry is one line in the editorial registry — title " +
        "on the left, description revealed beneath / on hover.",
      type: "array",
      group: "services",
      of: [
        {
          type: "object",
          name: "serviceItem",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 3,
            }),
          ],
          preview: { select: { title: "title", subtitle: "description" } },
        },
      ],
    }),
    defineField({
      name: "servicesCta",
      title: "CTA button",
      type: "link",
      group: "services",
    }),

    /* Editorial image block */
    defineField({
      name: "editorialLabel",
      title: "Section label",
      type: "string",
      group: "editorial",
    }),
    defineField({
      name: "editorialHeading",
      title: "Heading",
      type: "string",
      group: "editorial",
    }),
    defineField({
      name: "editorialBody",
      title: "Body",
      type: "text",
      rows: 6,
      group: "editorial",
    }),
    defineField({
      name: "editorialImage",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      group: "editorial",
      fields: [
        defineField({ name: "alt", title: "Alt text", type: "string" }),
      ],
    }),
    defineField({
      name: "editorialCta",
      title: "CTA button",
      type: "link",
      group: "editorial",
    }),

    /* Track-record stats */
    defineField({
      name: "trackLabel",
      title: "Section label",
      type: "string",
      group: "track",
    }),
    defineField({
      name: "trackHeading",
      title: "Heading",
      type: "string",
      group: "track",
    }),
    defineField({
      name: "trackItems",
      title: "Stats",
      description: "Capped at 4 by the layout.",
      type: "array",
      group: "track",
      validation: (rule) => rule.max(4),
      of: [
        {
          type: "object",
          name: "trackItem",
          fields: [
            defineField({
              name: "value",
              title: "Big value",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({
              name: "footnote",
              title: "Footnote",
              type: "string",
            }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
    }),

    /* Process timeline */
    defineField({
      name: "processLabel",
      title: "Section label",
      type: "string",
      group: "process",
    }),
    defineField({
      name: "processHeading",
      title: "Heading",
      type: "string",
      group: "process",
    }),
    defineField({
      name: "processSteps",
      title: "Steps",
      description: "Each step is one block in the vertical timeline.",
      type: "array",
      group: "process",
      of: [
        {
          type: "object",
          name: "processStep",
          fields: [
            defineField({
              name: "title",
              title: "Step title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "body",
              title: "Step body",
              type: "text",
              rows: 4,
            }),
          ],
          preview: { select: { title: "title", subtitle: "body" } },
        },
      ],
    }),
    defineField({
      name: "seoTitle",
      title: "Browser tab title",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      group: "seo",
    }),
  ],
  preview: { prepare: () => ({ title: "Services Page" }) },
});
