/**
 * Legal Page document type
 * ========================
 * Multi-document type used for the Privacy Policy, Terms &
 * Conditions, and any future legal page that needs the same
 * editorial layout. Each doc has its own slug and lives at
 * /legal/<slug> on the front-end.
 *
 *   - Header: page title, eyebrow label, last-updated date,
 *             optional intro paragraph.
 *   - Content: ordered list of sections. Each section has a
 *             heading (used as a TOC link), an anchor slug, and
 *             a portable-text body.
 *   - SEO: optional meta title + description override.
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
        'Heading for this section, e.g. "Information we collect". Also appears in the table of contents.',
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "anchorId",
      title: "Anchor link ID",
      description:
        "Used in the URL when someone clicks this section in the table of contents. Lowercase, hyphenated.",
      type: "slug",
      options: { source: "heading", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Section content",
      description:
        "Rich text — supports headings, paragraphs, bullet/numbered lists, links and bold/italic.",
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
                      "External (https://…), internal path (/about), email (mailto:…) or phone (tel:…).",
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
    defineField({
      name: "title",
      title: "Page title",
      description: 'Big heading at the top of the page, e.g. "Privacy Policy".',
      type: "string",
      group: "header",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Page URL",
      description:
        'URL path — appears after /legal/ in the address bar, e.g. "privacy-policy".',
      type: "slug",
      group: "header",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow label",
      description: 'Small caps label above the title, e.g. "Legal".',
      type: "string",
      group: "header",
    }),
    defineField({
      name: "lastUpdated",
      title: "Last updated date",
      description:
        "Shown beneath the title — update whenever you change the policy.",
      type: "date",
      group: "header",
      options: { dateFormat: "DD MMMM YYYY" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Introduction",
      description:
        "Short paragraph displayed above the table of contents.",
      type: "text",
      rows: 4,
      group: "header",
    }),
    defineField({
      name: "tocHeading",
      title: "Table of contents heading",
      description: 'Label above the table of contents — defaults to "Contents".',
      type: "string",
      group: "content",
      initialValue: "Contents",
    }),
    defineField({
      name: "sections",
      title: "Sections",
      description:
        "Ordered sections that make up the policy. Each heading appears in the table of contents.",
      type: "array",
      group: "content",
      of: [legalSection],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "metaTitle",
      title: "Browser tab title",
      description: "Title shown in browser tabs / search results.",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      description: "Short summary in search results — keep under 160 characters.",
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
