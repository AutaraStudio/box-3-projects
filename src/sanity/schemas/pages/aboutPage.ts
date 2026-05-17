/**
 * About Page singleton
 * ====================
 * Drives every editable surface on /about — hero / intro /
 * team section labelling / closing editorial block. Team
 * members themselves come from the Team Members collection;
 * this doc only owns the page-level copy.
 */

import { defineField, defineType } from "sanity";

import { TaggedMediaPicker } from "../../components/TaggedMediaPicker";

export default defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "intro", title: "Intro" },
    { name: "team", title: "Team section" },
    { name: "teamCategories", title: "Team categories" },
    { name: "closing", title: "Closing block" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    /* Hero */
    defineField({
      name: "heroTitle",
      title: "Hero title",
      description: "Big editorial heading at the top of the page.",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroCta",
      title: "Hero CTA",
      description:
        'Optional CTA pinned beside the title (e.g. "Meet the team" → #team).',
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
      description:
        "Multi-paragraph intro statement. Leave a blank line " +
        "between paragraphs.",
      type: "text",
      rows: 8,
      group: "intro",
    }),

    /* Team section */
    defineField({
      name: "teamLabel",
      title: "Section label",
      description: 'Small caps label, e.g. "Team".',
      type: "string",
      group: "team",
    }),
    defineField({
      name: "teamHeading",
      title: "Section heading",
      type: "string",
      group: "team",
    }),
    defineField({
      name: "teamIntro",
      title: "Section intro",
      description: "One-paragraph intro shown above the team grid.",
      type: "text",
      rows: 3,
      group: "team",
    }),

    /* ── Team categories ──────────────────────────────────
       Team members are grouped by category on the page. Each
       category here maps a category slug used on a teamMember
       document to the heading shown above its group. Re-order
       this array to re-order the groups; items not listed here
       fall back to a "Team" catch-all bucket. */
    defineField({
      name: "teamCategories",
      title: "Category groups",
      description:
        "Order + display title for each team category. The slug must match the category set on each Team Member document.",
      type: "array",
      group: "teamCategories",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "slug",
              title: "Category slug",
              description:
                'Lowercase + hyphenated identifier — must match the category set on team-member documents (e.g. "leadership", "site-team").',
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "title",
              title: "Display title",
              description: 'Heading shown above the group, e.g. "Leadership".',
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "title", subtitle: "slug" } },
        },
      ],
    }),
    defineField({
      name: "teamUncategorisedTitle",
      title: "Uncategorised group title",
      description:
        'Fallback heading for team members whose category isn\'t listed above (e.g. "Team").',
      type: "string",
      group: "teamCategories",
    }),

    /* Closing block */
    defineField({
      name: "closingLabel",
      title: "Section label",
      type: "string",
      group: "closing",
    }),
    defineField({
      name: "closingHeading",
      title: "Heading",
      type: "string",
      group: "closing",
    }),
    defineField({
      name: "closingBody",
      title: "Body",
      type: "text",
      rows: 6,
      group: "closing",
    }),
    defineField({
      name: "closingImage",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      components: { input: TaggedMediaPicker },
      group: "closing",
    }),
    defineField({
      name: "closingCta",
      title: "CTA button",
      type: "link",
      group: "closing",
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
  preview: { prepare: () => ({ title: "About Page" }) },
});
