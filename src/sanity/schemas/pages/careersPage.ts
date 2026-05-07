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
    { name: "vacancies", title: "Vacancies list" },
    { name: "speculative", title: "Speculative block" },
    { name: "applyModal", title: "Apply modal" },
    { name: "seo", title: "SEO" },
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
    defineField({
      name: "cultureCtaLabel",
      title: "CTA label",
      description: 'Button label beneath the body — e.g. "Meet the team →".',
      type: "string",
      group: "culture",
    }),
    defineField({
      name: "cultureCtaHref",
      title: "CTA link",
      description: "Where the CTA points (relative path or full URL).",
      type: "string",
      group: "culture",
    }),
    defineField({
      name: "cultureCtaPageName",
      title: "CTA destination label",
      description: "Used by the page-transition overlay — the page name shown briefly while navigating.",
      type: "string",
      group: "culture",
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
    defineField({
      name: "whyWorkCtaLabel",
      title: "Why-work-with-us CTA label",
      description: 'e.g. "See open roles →".',
      type: "string",
      group: "whyWorkWithUs",
    }),
    defineField({
      name: "whyWorkCtaHref",
      title: "Why-work-with-us CTA link",
      type: "string",
      group: "whyWorkWithUs",
    }),

    /* ── Vacancies list ─────────────────────────────────── */
    defineField({
      name: "vacanciesHeading",
      title: "Vacancies list heading",
      description: 'Heading above the list of jobs, e.g. "Open positions".',
      type: "string",
      group: "vacancies",
    }),
    defineField({
      name: "vacanciesEmptyMessage",
      title: "Empty-state message",
      description:
        "Shown when there are no vacancies in the dataset — set the tone for someone who clicked through and found nothing.",
      type: "text",
      rows: 3,
      group: "vacancies",
    }),
    defineField({
      name: "vacanciesApplyButtonLabel",
      title: "Apply button label",
      description: 'Label on each vacancy row\'s call-to-action button, e.g. "Apply now →".',
      type: "string",
      group: "vacancies",
    }),

    /* ── Speculative block ──────────────────────────────── */
    defineField({
      name: "speculativeLabel",
      title: 'Section label',
      description: 'Small caps label, e.g. "Speculative".',
      type: "string",
      group: "speculative",
    }),
    defineField({
      name: "speculativeHeading",
      title: "Heading",
      description:
        "Display heading for the speculative-application section at the foot of the careers page.",
      type: "string",
      group: "speculative",
    }),
    defineField({
      name: "speculativeBody",
      title: "Body",
      description:
        "Multi-paragraph copy beneath the heading. Use blank lines to break paragraphs.",
      type: "text",
      rows: 6,
      group: "speculative",
    }),
    defineField({
      name: "speculativeImage",
      title: "Image",
      description: "Editorial photograph beside / below the speculative block.",
      type: "image",
      group: "speculative",
      options: { hotspot: true },
      components: { input: TaggedMediaPicker },
      fields: HERO_IMAGE_FIELDS,
    }),
    defineField({
      name: "speculativeCtaLabel",
      title: "CTA label",
      description: 'e.g. "Get in touch →".',
      type: "string",
      group: "speculative",
    }),
    defineField({
      name: "speculativeCtaHref",
      title: "CTA link",
      type: "string",
      group: "speculative",
    }),
    defineField({
      name: "speculativeCtaPageName",
      title: "CTA destination label",
      description: "Page-transition label, e.g. \"Contact\".",
      type: "string",
      group: "speculative",
    }),

    /* ── Apply modal copy ───────────────────────────────── */
    defineField({
      name: "applyEyebrowLabel",
      title: 'Eyebrow label',
      description: 'Caption above the role title in the modal, e.g. "Apply for".',
      type: "string",
      group: "applyModal",
    }),
    defineField({
      name: "applyCloseLabel",
      title: "Close button label",
      type: "string",
      group: "applyModal",
    }),
    defineField({
      name: "applyCloseAriaLabel",
      title: "Close button — accessible description",
      type: "string",
      group: "applyModal",
    }),
    defineField({
      name: "applyFirstNameLabel",
      title: "First name field label",
      type: "string",
      group: "applyModal",
    }),
    defineField({
      name: "applyLastNameLabel",
      title: "Last name field label",
      type: "string",
      group: "applyModal",
    }),
    defineField({
      name: "applyEmailLabel",
      title: "Email field label",
      type: "string",
      group: "applyModal",
    }),
    defineField({
      name: "applyPhoneLabel",
      title: "Phone field label",
      type: "string",
      group: "applyModal",
    }),
    defineField({
      name: "applyLinkLabel",
      title: "LinkedIn / portfolio field label",
      type: "string",
      group: "applyModal",
    }),
    defineField({
      name: "applyExperienceLabel",
      title: "Experience field label",
      type: "string",
      group: "applyModal",
    }),
    defineField({
      name: "applyCvLabel",
      title: "CV upload field label",
      type: "string",
      group: "applyModal",
    }),
    defineField({
      name: "applyFilePickerLabel",
      title: "File picker placeholder",
      description: 'Shown before a file is chosen, e.g. "Choose a file (PDF or Word)".',
      type: "string",
      group: "applyModal",
    }),
    defineField({
      name: "applyFileClearLabel",
      title: "File clear button label",
      type: "string",
      group: "applyModal",
    }),
    defineField({
      name: "applySubmitLabel",
      title: "Submit button label",
      type: "string",
      group: "applyModal",
    }),
    defineField({
      name: "applySubmittingLabel",
      title: "Submitting button label",
      description: 'Shown while sending, e.g. "Submitting…".',
      type: "string",
      group: "applyModal",
    }),
    defineField({
      name: "applyLegalCopy",
      title: "Legal microcopy",
      description: "Small print under the submit button, e.g. consent / data-use note.",
      type: "text",
      rows: 3,
      group: "applyModal",
    }),
    defineField({
      name: "applySentHeading",
      title: "Sent heading",
      type: "string",
      group: "applyModal",
    }),
    defineField({
      name: "applySentBody",
      title: "Sent body",
      type: "text",
      rows: 3,
      group: "applyModal",
    }),
    defineField({
      name: "applySentCloseLabel",
      title: "Close button (sent state)",
      type: "string",
      group: "applyModal",
    }),

    /* ── SEO ────────────────────────────────────────────── */
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
  preview: {
    select: { title: "heroTitle" },
    prepare: ({ title }) => ({
      title: "Careers Page",
      subtitle: title || "—",
    }),
  },
});
