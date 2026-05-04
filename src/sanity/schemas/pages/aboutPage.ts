/**
 * About Page singleton
 * ====================
 * Drives every editable surface on /about — hero / intro /
 * team section labelling / closing editorial block. Team
 * members themselves come from the Team Members collection;
 * this doc only owns the page-level copy.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "intro", title: "Intro" },
    { name: "team", title: "Team section" },
    { name: "closing", title: "Closing block" },
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
      group: "closing",
      fields: [
        defineField({ name: "alt", title: "Alt text", type: "string" }),
      ],
    }),
    defineField({
      name: "closingCta",
      title: "CTA button",
      type: "link",
      group: "closing",
    }),
  ],
  preview: { prepare: () => ({ title: "About Page" }) },
});
