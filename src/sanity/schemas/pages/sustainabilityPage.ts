/**
 * Sustainability Page
 * ===================
 * Singleton driving /sustainability. Mirrors the Populous reference:
 * scroll-driven hero, three-column legacy projects strip, three-
 * pillar commitment section, principles list.
 */

import { defineField, defineType } from "sanity";

import { TaggedMediaPicker } from "../../components/TaggedMediaPicker";

const HERO_IMAGE_FIELDS = [
  defineField({
    name: "alt",
    title: "Image description (for accessibility)",
    type: "string",
  }),
];

export default defineType({
  name: "sustainabilityPage",
  title: "Sustainability Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "intro", title: "Intro" },
    { name: "stats", title: "Stats" },
    { name: "feature", title: "Feature image" },
    { name: "legacy", title: "Legacy projects" },
    { name: "commitment", title: "Commitment" },
    { name: "principles", title: "Principles" },
    { name: "certifications", title: "Certifications" },
  ],
  fields: [
    /* ── Hero ─────────────────────────────────────────────── */
    defineField({
      name: "heroTitle",
      title: "Hero title",
      type: "string",
      group: "hero",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroCtaLabel",
      title: "CTA label",
      type: "string",
      group: "hero",
      initialValue: "Our principles",
    }),
    defineField({
      name: "heroCtaHref",
      title: "CTA link",
      description:
        "In-page anchor (e.g. #principles) or path. Defaults to #principles.",
      type: "string",
      group: "hero",
      initialValue: "#principles",
    }),
    defineField({
      name: "heroImageLeft",
      title: "Hero image — left",
      type: "image",
      group: "hero",
      options: { hotspot: true },
      components: { input: TaggedMediaPicker },
      fields: HERO_IMAGE_FIELDS,
    }),
    defineField({
      name: "heroImageCentre",
      title: "Hero image — centre (expanding)",
      type: "image",
      group: "hero",
      options: { hotspot: true },
      components: { input: TaggedMediaPicker },
      fields: HERO_IMAGE_FIELDS,
    }),
    defineField({
      name: "heroImageRight",
      title: "Hero image — right",
      type: "image",
      group: "hero",
      options: { hotspot: true },
      components: { input: TaggedMediaPicker },
      fields: HERO_IMAGE_FIELDS,
    }),

    /* ── Intro ─────────────────────────────────────────────── */
    defineField({
      name: "introHeading",
      title: "Intro heading",
      type: "string",
      group: "intro",
    }),
    defineField({
      name: "introBody",
      title: "Intro body",
      description: "Supporting paragraph(s). Blank lines split.",
      type: "text",
      rows: 5,
      group: "intro",
    }),

    /* ── Stats — large editorial impact numbers ──────────── */
    defineField({
      name: "statsLabel",
      title: "Section label",
      type: "string",
      group: "stats",
      initialValue: "Impact",
    }),
    defineField({
      name: "statsHeading",
      title: "Heading",
      description: "Statement above the stats grid.",
      type: "string",
      group: "stats",
    }),
    defineField({
      name: "statsItems",
      title: "Stats",
      description:
        "Each stat is a value (\"78%\", \"12 tonnes\", \"£1.2m\"), a label, and an optional footnote.",
      type: "array",
      group: "stats",
      validation: (rule) => rule.max(6),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "value",
              title: "Value",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "footnote",
              title: "Footnote (optional)",
              description:
                "Caveat or context shown beneath the label, in muted small caps.",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "value", subtitle: "label" },
          },
        },
      ],
    }),

    /* ── Feature — large editorial image + body ─────────── */
    defineField({
      name: "featureLabel",
      title: "Section label",
      type: "string",
      group: "feature",
      initialValue: "On site",
    }),
    defineField({
      name: "featureHeading",
      title: "Heading",
      description: "Large display headline for the feature section.",
      type: "string",
      group: "feature",
    }),
    defineField({
      name: "featureBody",
      title: "Body",
      description: "Supporting paragraph(s). Blank lines split.",
      type: "text",
      rows: 5,
      group: "feature",
    }),
    defineField({
      name: "featureImage",
      title: "Image",
      description:
        "A large editorial photograph — site, materials, or completed work.",
      type: "image",
      group: "feature",
      options: { hotspot: true },
      components: { input: TaggedMediaPicker },
      fields: HERO_IMAGE_FIELDS,
    }),

    /* ── Legacy — three example projects ──────────────────── */
    defineField({
      name: "legacyLabel",
      title: "Section label",
      type: "string",
      group: "legacy",
      initialValue: "Recent work",
    }),
    defineField({
      name: "legacyItems",
      title: "Items",
      description:
        "Three projects shown as image + project name + year. Linked to a project document on the site.",
      type: "array",
      group: "legacy",
      validation: (rule) => rule.max(6),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "project",
              title: "Project",
              type: "reference",
              to: [{ type: "project" }],
            }),
            defineField({
              name: "image",
              title: "Image override (optional)",
              description:
                "Use a specific image; otherwise the project's featured image is shown.",
              type: "image",
              options: { hotspot: true },
              components: { input: TaggedMediaPicker },
              fields: HERO_IMAGE_FIELDS,
            }),
            defineField({
              name: "yearLabel",
              title: "Year label override",
              description:
                "Free-text override (e.g. \"2024\", \"In progress\"). Falls back to the project's year if empty.",
              type: "string",
            }),
          ],
          preview: {
            select: {
              title: "project.title",
              year: "yearLabel",
              media: "image",
            },
          },
        },
      ],
    }),

    /* ── Commitment — three-column text blocks ───────────── */
    defineField({
      name: "commitmentLabel",
      title: "Section label",
      type: "string",
      group: "commitment",
      initialValue: "Our commitment",
    }),
    defineField({
      name: "commitmentHeading",
      title: "Heading",
      type: "string",
      group: "commitment",
    }),
    defineField({
      name: "commitmentItems",
      title: "Pillars",
      description: "Three short text blocks with a heading + body.",
      type: "array",
      group: "commitment",
      validation: (rule) => rule.max(6),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "body",
              title: "Body",
              type: "text",
              rows: 4,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "body" },
          },
        },
      ],
    }),

    /* ── Principles — numbered list ──────────────────────── */
    defineField({
      name: "principlesLabel",
      title: "Section label",
      type: "string",
      group: "principles",
      initialValue: "Principles",
    }),
    defineField({
      name: "principlesHeading",
      title: "Heading",
      type: "string",
      group: "principles",
    }),
    defineField({
      name: "principlesIntro",
      title: "Intro paragraph",
      description: "Optional supporting paragraph beneath the heading.",
      type: "text",
      rows: 4,
      group: "principles",
    }),
    defineField({
      name: "principlesItems",
      title: "Items",
      type: "array",
      group: "principles",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "body",
              title: "Body",
              type: "text",
              rows: 4,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "body" },
          },
        },
      ],
    }),

    /* ── Certifications — bottom band, frameworks we follow ── */
    defineField({
      name: "certificationsLabel",
      title: "Section label",
      type: "string",
      group: "certifications",
      initialValue: "Frameworks we follow",
    }),
    defineField({
      name: "certificationsItems",
      title: "Items",
      description:
        "Standards / frameworks shown as a wrapping list — e.g. BREEAM, NABERS UK, RICS Whole Life Carbon.",
      type: "array",
      group: "certifications",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
  ],
  preview: {
    select: { title: "heroTitle" },
    prepare: ({ title }) => ({
      title: "Sustainability Page",
      subtitle: title || "—",
    }),
  },
});
