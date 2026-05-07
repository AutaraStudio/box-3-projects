/**
 * Legal Page Schema
 * =================
 * Document type for legal pages — Privacy Policy and Terms &
 * Conditions. Each page has a title, slug, "last updated" date,
 * a short intro, and an ordered list of sections. Each section
 * has a heading (used to build the table of contents on the
 * front-end) and a rich-text body.
 */

import { defineField, defineType } from "sanity";

const legalSection = {
  name: "legalSection",
  title: "Section",
  type: "object" as const,
  fields: [
    defineField({
      name: "heading",
      title: "Section heading",
      description:
        "Heading shown above this section and in the table of contents e.g. Information we collect",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "anchorId",
      title: "Anchor link ID",
      description:
        "Used to link directly to this section from the table of contents. Lowercase, hyphenated, no spaces e.g. information-we-collect",
      type: "slug",
      options: {
        source: "heading",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Section content",
      description:
        "The rich-text content of this section. Supports headings, paragraphs, bullet/numbered lists, links and bold/italic text.",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Paragraph", value: "normal" },
            { title: "Sub-heading", value: "h3" },
            { title: "Small sub-heading", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Underline", value: "underline" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    description:
                      "External URLs (https://…), internal paths (/about), email (mailto:hello@…) or phone (tel:+44…)",
                    type: "url",
                    validation: (rule) =>
                      rule.uri({
                        allowRelative: true,
                        scheme: ["http", "https", "mailto", "tel"],
                      }),
                  }),
                ],
              },
            ],
          },
        },
      ],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "anchorId.current" },
    prepare: ({ title, subtitle }: { title?: string; subtitle?: string }) => ({
      title: title ?? "Untitled section",
      subtitle: subtitle ? `#${subtitle}` : undefined,
    }),
  },
};

export default defineType({
  name: "legalPage",
  title: "Legal Page",
  type: "document",
  groups: [
    { name: "header", title: "Header", default: true },
    { name: "content", title: "Content" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    /* ── Header ──────────────────────────────────────────── */
    defineField({
      name: "title",
      title: "Page title",
      description:
        "The large display heading at the top of the page e.g. Privacy Policy",
      type: "string",
      group: "header",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Page URL",
      description:
        "The URL path for this page — appears after /legal/ in the address bar e.g. privacy-policy",
      type: "slug",
      group: "header",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow label",
      description:
        "Small mono label shown above the page title e.g. Legal",
      type: "string",
      group: "header",
    }),
    defineField({
      name: "lastUpdated",
      title: "Last updated date",
      description:
        "Shown beneath the title — update this whenever you change the policy",
      type: "date",
      group: "header",
      options: { dateFormat: "DD MMMM YYYY" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Introduction",
      description:
        "Short introductory paragraph displayed above the table of contents",
      type: "text",
      rows: 4,
      group: "header",
    }),

    /* ── Content ─────────────────────────────────────────── */
    defineField({
      name: "tocHeading",
      title: "Table of contents heading",
      description:
        "Label shown above the table of contents e.g. Contents",
      type: "string",
      group: "content",
      initialValue: "Contents",
    }),
    defineField({
      name: "sections",
      title: "Sections",
      description:
        "The ordered list of sections that make up this policy. Each section's heading appears in the table of contents.",
      type: "array",
      group: "content",
      of: [legalSection],
      validation: (rule) => rule.min(1),
    }),

    /* ── SEO ─────────────────────────────────────────────── */
    defineField({
      name: "metaTitle",
      title: "Browser tab title",
      description:
        "The title shown in search engines and browser tabs. Defaults to the page title if left blank.",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      description:
        "The short summary shown beneath the title in search results — keep it under 160 characters.",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (rule) => rule.max(200),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
    prepare: ({ title, subtitle }) => ({
      title: title ?? "Legal Page",
      subtitle: subtitle ? `/legal/${subtitle}` : undefined,
    }),
  },
});
