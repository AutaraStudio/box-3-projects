/**
 * Home Page singleton
 * ===================
 * Drives every editable surface on the home page. Field groups
 * tab the document by section so editors don't scroll past
 * unrelated fields when they're just changing a hero statement.
 *
 * Sections (in render order):
 *   1. Hero            — looping background video + statement + CTA
 *   2. About statement — section label + long-form heading + body + CTA
 *   3. Introducing     — editorial image block (label / heading /
 *                        body / image / CTA)
 *   4. Services        — section label + heading + items[] + CTA
 *   5. Featured projects — label + heading (cards pull from the
 *                          Project collection's `featured` flag)
 *   6. Stats           — label + heading + items[]
 *   7. Why Box 3       — second editorial image block
 *   8. Testimonials    — embeds the testimonialsSection (already
 *                        wired across the site)
 *   9. Final CTA       — heading + button
 */

import { defineField, defineType } from "sanity";

import { TESTIMONIALS_SECTION_PROJECTION } from "../../queries/testimonialsSection";

void TESTIMONIALS_SECTION_PROJECTION; /* keep import — used by query */

export default defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  groups: [
    { name: "comingSoon", title: "Coming soon", default: true },
    { name: "hero", title: "Hero" },
    { name: "statement", title: "About statement" },
    { name: "introducing", title: "Introducing" },
    { name: "services", title: "Services" },
    { name: "featured", title: "Featured projects" },
    { name: "stats", title: "Stats" },
    { name: "why", title: "Why Box 3" },
    { name: "testimonials", title: "Testimonials" },
    { name: "finalCta", title: "Final CTA" },
  ],
  fields: [
    /* ── 0. Coming Soon (holding page toggle) ───────────── */
    defineField({
      name: "comingSoon",
      title: "Show coming-soon page",
      description:
        "While ON, the home page renders only the holding " +
        "message below — every other section (Hero, About, " +
        "Services, etc.) is hidden. Turn OFF to publish the " +
        "full home page.",
      type: "boolean",
      group: "comingSoon",
      initialValue: false,
    }),
    defineField({
      name: "comingSoonHeading",
      title: "Holding heading",
      description:
        'The big editorial line, e.g. "Site updating." Defaults ' +
        "to that if left empty.",
      type: "string",
      group: "comingSoon",
    }),
    defineField({
      name: "comingSoonBody",
      title: "Holding message",
      description:
        "Supporting paragraph beneath the heading.",
      type: "text",
      rows: 3,
      group: "comingSoon",
    }),

    /* ── 1. Hero ─────────────────────────────────────────── */
    defineField({
      name: "heroMediaType",
      title: "Background media",
      description:
        "Choose whether the hero plays a looping video or shows " +
        "a still image. The matching field below appears once " +
        "you pick.",
      type: "string",
      group: "hero",
      initialValue: "video",
      options: {
        list: [
          { title: "Video", value: "video" },
          { title: "Image", value: "image" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "heroVideoUrl",
      title: "Hero video URL",
      description:
        "Full URL to the looping background video — typically a " +
        ".mp4 hosted on Bunny / Cloudinary / similar. Plays " +
        "muted on autoplay.",
      type: "url",
      group: "hero",
      hidden: ({ parent }) => parent?.heroMediaType !== "video",
      validation: (rule) =>
        rule.uri({ scheme: ["http", "https"], allowRelative: false }),
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      description:
        "Full-bleed background image for the hero. Used when " +
        '"Background media" above is set to "Image".',
      type: "image",
      options: { hotspot: true },
      group: "hero",
      hidden: ({ parent }) => parent?.heroMediaType !== "image",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          description:
            "What's in the photo, in plain English. Used by " +
            "screen readers + shown if the image fails to load.",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "heroStatement",
      title: "Hero statement",
      description:
        "The big editorial line at the bottom-left of the hero. " +
        'Default: "Specialist commercial fit-outs in London."',
      type: "text",
      rows: 2,
      group: "hero",
    }),
    defineField({
      name: "heroScrollLabel",
      title: "Scroll-down label",
      description:
        'Text for the small "(scroll down)" affordance at the ' +
        "bottom-right of the hero.",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroCta",
      title: "Hero CTA button",
      description:
        "Optional CTA shown beneath the hero statement. Leave " +
        "the label empty to hide it.",
      type: "link",
      group: "hero",
    }),

    /* ── 2. About statement ─────────────────────────────── */
    defineField({
      name: "statementLabel",
      title: "Section label",
      description:
        'Small caps label above the heading, e.g. "About".',
      type: "string",
      group: "statement",
    }),
    defineField({
      name: "statementHeading",
      title: "Heading (long-form)",
      description:
        "The big editorial paragraph that reads as the home page's " +
        "mission statement. Multi-line is fine — the layout treats " +
        "it as a single text block.",
      type: "text",
      rows: 5,
      group: "statement",
    }),
    defineField({
      name: "statementBody",
      title: "Supporting body",
      description:
        "Smaller paragraph beneath the heading.",
      type: "text",
      rows: 3,
      group: "statement",
    }),
    defineField({
      name: "statementCta",
      title: "CTA button",
      type: "link",
      group: "statement",
    }),

    /* ── 3. Introducing (editorial image block) ─────────── */
    defineField({
      name: "introducingLabel",
      title: "Section label",
      description: 'Small caps label, e.g. "Introducing".',
      type: "string",
      group: "introducing",
    }),
    defineField({
      name: "introducingHeading",
      title: "Heading",
      type: "string",
      group: "introducing",
    }),
    defineField({
      name: "introducingBody",
      title: "Body",
      description:
        "Two paragraphs read well. Use a blank line between them.",
      type: "text",
      rows: 6,
      group: "introducing",
    }),
    defineField({
      name: "introducingImage",
      title: "Image",
      description:
        "Editorial photo that anchors the section. Falls back to " +
        "the first featured project's image if left blank.",
      type: "image",
      options: { hotspot: true },
      group: "introducing",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          description:
            "What's in the photo, in plain English. Used by " +
            "screen readers + shown if the image fails to load.",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "introducingCta",
      title: "CTA button",
      type: "link",
      group: "introducing",
    }),

    /* ── 4. Services ─────────────────────────────────────── */
    defineField({
      name: "servicesLabel",
      title: "Section label",
      type: "string",
      group: "services",
    }),
    defineField({
      name: "servicesHeading",
      title: "Heading",
      type: "string",
      group: "services",
    }),
    defineField({
      name: "servicesItems",
      title: "Service items",
      description:
        "Each entry renders as one line in the editorial " +
        "list — title on the left, description beneath.",
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
              rows: 2,
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "description" },
          },
        },
      ],
    }),
    defineField({
      name: "servicesCta",
      title: "CTA button",
      type: "link",
      group: "services",
    }),

    /* ── 5. Featured projects ────────────────────────────── */
    defineField({
      name: "featuredLabel",
      title: "Section label",
      description: 'Small caps label, e.g. "Featured".',
      type: "string",
      group: "featured",
    }),
    defineField({
      name: "featuredHeading",
      title: "Heading",
      description:
        'Editorial heading e.g. "Recent work." Cards beneath are ' +
        "pulled automatically from any project marked as " +
        '"Featured" in the Projects collection.',
      type: "string",
      group: "featured",
    }),

    /* ── 6. Stats ───────────────────────────────────────── */
    defineField({
      name: "statsLabel",
      title: "Section label",
      type: "string",
      group: "stats",
    }),
    defineField({
      name: "statsHeading",
      title: "Heading",
      type: "string",
      group: "stats",
    }),
    defineField({
      name: "statsItems",
      title: "Stats",
      description:
        "Capped at 4 items by the layout — anything beyond the " +
        "fourth is ignored on render.",
      type: "array",
      group: "stats",
      validation: (rule) => rule.max(4),
      of: [
        {
          type: "object",
          name: "statItem",
          fields: [
            defineField({
              name: "value",
              title: "Big value",
              description: 'The headline figure, e.g. "90%" or "180+".',
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "label",
              title: "Label",
              description: "What the figure measures, in one short line.",
              type: "string",
            }),
            defineField({
              name: "footnote",
              title: "Footnote",
              description:
                "Small caps note beneath — context, time period, etc.",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "value", subtitle: "label" },
          },
        },
      ],
    }),

    /* ── 7. Why Box 3 (editorial image block #2) ────────── */
    defineField({
      name: "whyLabel",
      title: "Section label",
      type: "string",
      group: "why",
    }),
    defineField({
      name: "whyHeading",
      title: "Heading",
      type: "string",
      group: "why",
    }),
    defineField({
      name: "whyBody",
      title: "Body",
      type: "text",
      rows: 6,
      group: "why",
    }),
    defineField({
      name: "whyImage",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      group: "why",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "whyCta",
      title: "CTA button",
      type: "link",
      group: "why",
    }),

    /* ── 8. Testimonials ─────────────────────────────────── */
    defineField({
      name: "testimonialsSection",
      title: "Testimonials section",
      description:
        "The testimonials carousel. Pulls testimonial documents " +
        "from the Testimonials collection — author, role, quote, " +
        "and partner logo flow through.",
      type: "object",
      group: "testimonials",
      fields: [
        defineField({
          name: "sectionLabel",
          title: "Section label",
          description:
            'Heading shown top-left of the section, e.g. "Testimonials".',
          type: "string",
        }),
        defineField({
          name: "reference",
          title: "Reference code",
          description:
            'Editorial code shown top-right, e.g. "[BOX3.1]". Decorative.',
          type: "string",
        }),
        defineField({
          name: "testimonials",
          title: "Testimonials",
          description:
            "Pick the testimonial documents to feature. Each one " +
            "carries its own quote / author / role / partner.",
          type: "array",
          of: [{ type: "reference", to: [{ type: "testimonial" }] }],
        }),
      ],
    }),

    /* ── 9. Final CTA ─────────────────────────────────────── */
    defineField({
      name: "finalCtaHeading",
      title: "Heading",
      description: "Use a line break to split across two lines.",
      type: "text",
      rows: 2,
      group: "finalCta",
    }),
    defineField({
      name: "finalCtaButton",
      title: "Button",
      type: "link",
      group: "finalCta",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Home Page" }),
  },
});
