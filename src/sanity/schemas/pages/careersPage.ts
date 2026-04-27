/**
 * Careers Page
 * ============
 * Singleton driving the /careers landing page.
 *
 * The hero is a scroll-driven panel: a centred title + CTA above a
 * three-image strip. As the user scrolls, the centre image expands
 * from ~50% of the viewport width to full-bleed while the title
 * fades out — so the editor uploads three images that frame that
 * journey: a left and right context shot, and a hero centre image
 * that becomes the takeover.
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
  name: "careersPage",
  title: "Careers Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "intro", title: "Intro" },
    { name: "whyWorkWithUs", title: "Why work with us" },
    { name: "culture", title: "Culture" },
  ],
  fields: [
    /* ── Hero ─────────────────────────────────────────────── */
    defineField({
      name: "heroTitle",
      title: "Hero title",
      description:
        "Display heading at the top of the page. Render is split on line breaks for the line-mask reveal.",
      type: "string",
      group: "hero",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroCtaLabel",
      title: "CTA label",
      description: "Text on the call-to-action button beneath the heading.",
      type: "string",
      group: "hero",
      initialValue: "See opportunities",
    }),
    defineField({
      name: "heroCtaHref",
      title: "CTA link",
      description:
        "Where the CTA points. Use an in-page anchor (e.g. #jobs) or a relative path (e.g. /contact).",
      type: "string",
      group: "hero",
      initialValue: "#jobs",
    }),
    defineField({
      name: "heroImageLeft",
      title: "Hero image — left",
      type: "image",
      group: "hero",
      options: { hotspot: true },
      components: { input: TaggedMediaPicker },
      fields: HERO_IMAGE_FIELDS,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroImageCentre",
      title: "Hero image — centre (expanding)",
      description:
        "The image that grows from ~50% width to full-bleed as the user scrolls.",
      type: "image",
      group: "hero",
      options: { hotspot: true },
      components: { input: TaggedMediaPicker },
      fields: HERO_IMAGE_FIELDS,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroImageRight",
      title: "Hero image — right",
      type: "image",
      group: "hero",
      options: { hotspot: true },
      components: { input: TaggedMediaPicker },
      fields: HERO_IMAGE_FIELDS,
      validation: (rule) => rule.required(),
    }),

    /* ── Intro section — sits beneath the hero ────────────── */
    defineField({
      name: "introHeading",
      title: "Intro heading",
      description:
        "Display heading directly beneath the hero image strip.",
      type: "string",
      group: "intro",
    }),
    defineField({
      name: "introBody",
      title: "Intro body",
      description:
        "Supporting paragraph beneath the intro heading. Plain text — line breaks become paragraphs.",
      type: "text",
      rows: 5,
      group: "intro",
    }),

    /* ── Culture — large image + heading + body ──────────── */
    defineField({
      name: "cultureLabel",
      title: "Section label",
      description:
        "Small caps label above the heading (e.g. \"Culture\").",
      type: "string",
      group: "culture",
      initialValue: "Culture",
    }),
    defineField({
      name: "cultureHeading",
      title: "Heading",
      description: "Large display headline for the culture section.",
      type: "string",
      group: "culture",
    }),
    defineField({
      name: "cultureBody",
      title: "Body",
      description:
        "Supporting paragraph beneath the heading (or beside it on desktop).",
      type: "text",
      rows: 5,
      group: "culture",
    }),
    defineField({
      name: "cultureImage",
      title: "Image",
      description:
        "A team / studio photograph. Renders as a large editorial image with a clip-path reveal on scroll.",
      type: "image",
      group: "culture",
      options: { hotspot: true },
      components: { input: TaggedMediaPicker },
      fields: HERO_IMAGE_FIELDS,
    }),

    /* ── Why work with us — 4 items, heading + body each ──── */
    defineField({
      name: "whyWorkHeading",
      title: "Section heading",
      description:
        "Small caps label above the why-work-with-us list (e.g. \"Why work with us\").",
      type: "string",
      group: "whyWorkWithUs",
    }),
    defineField({
      name: "whyWorkItems",
      title: "Items",
      description:
        "Each item is a heading + body paragraph. Reveals one-by-one as the user scrolls into the section.",
      type: "array",
      group: "whyWorkWithUs",
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
  ],
  preview: {
    select: { title: "heroTitle" },
    prepare: ({ title }) => ({
      title: "Careers Page",
      subtitle: title || "—",
    }),
  },
});
