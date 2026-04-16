/**
 * Our Approach Section Schema
 * ===========================
 * Singleton document for the horizontally-scrolling "Our Process"
 * section. The section is a 700svh sticky scroller whose horizontal
 * track is composed of, in order:
 *
 *   1. Intro panel        — heading + supporting paragraph
 *   2. Lead image (step 1) → Slide 1 (Step 1 detail + 2 images)
 *   3. Lead image (step 2) → Slide 2 (Step 2 detail + 2 images)
 *   4. Lead image (step 3) → Slide 3 (Step 3 detail + 2 images)
 *   5. Completion panel   — heading + 7-image strip + closing text
 *
 * The schema mirrors that flow: intro / steps[] / completion. Each
 * step bundles the full-bleed lead asset with its two-column slide
 * so the client doesn't have to coordinate parallel arrays.
 */

import { defineField, defineType } from "sanity";

import { TaggedMediaArrayPicker } from "../../components/TaggedMediaArrayPicker";
import { TaggedMediaPicker } from "../../components/TaggedMediaPicker";

const altField = [
  defineField({
    name: "alt",
    title: "Image description (for accessibility)",
    description:
      "Optional — a short description used by screen readers. Recommended but not required at upload time.",
    type: "string",
  }),
];

export default defineType({
  name: "ourApproachSection",
  title: "Our Approach Section",
  type: "document",
  groups: [
    { name: "label", title: "Section Label", default: true },
    { name: "intro", title: "Intro" },
    { name: "steps", title: "Process Steps" },
    { name: "completion", title: "Completion" },
  ],
  fields: [
    /* ── Section label ────────────────────────────────────── */
    defineField({
      name: "sectionLabel",
      title: "Section label",
      description:
        'Tiny uppercase label pinned top-left of the section, e.g. "Our process".',
      type: "string",
      group: "label",
      validation: (rule) => rule.required(),
    }),

    /* ── Intro panel ──────────────────────────────────────── */
    defineField({
      name: "intro",
      title: "Intro panel",
      description:
        "First panel of the horizontal scroller — sets up the rest of the journey.",
      type: "object",
      group: "intro",
      fields: [
        defineField({
          name: "heading",
          title: "Intro headline",
          description:
            "Large two-line headline. Use a real line break (Shift + Enter) to control where the line wraps.",
          type: "text",
          rows: 2,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "text",
          title: "Intro paragraph",
          description:
            "Supporting paragraph beneath the headline. One or two short sentences reads best.",
          type: "text",
          rows: 4,
          validation: (rule) => rule.required(),
        }),
      ],
    }),

    /* ── Process steps ────────────────────────────────────── */
    defineField({
      name: "steps",
      title: "Process steps",
      description:
        "Three numbered process steps. Each step renders a full-bleed lead image followed by a two-column slide. Drag to reorder.",
      type: "array",
      group: "steps",
      of: [
        {
          type: "object",
          name: "approachStep",
          fields: [
            defineField({
              name: "title",
              title: "Step label",
              description:
                'Short numbered label, e.g. "1. Discover & design".',
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "heading",
              title: "Step headline",
              description:
                "Larger two- or three-line headline. Use real line breaks (Shift + Enter) to control wrapping.",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "text",
              title: "Step description",
              description:
                "Supporting paragraph beneath the headline. Keep it concise — readers will scroll past quickly.",
              type: "text",
              rows: 4,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "layout",
              title: "Image-column position",
              description:
                'Where the image column sits relative to the text column on the slide. "Right" places imagery on the right, "Left" on the left.',
              type: "string",
              options: {
                list: [
                  { title: "Right (image on the right)", value: "right" },
                  { title: "Left (image on the left)", value: "left" },
                ],
                layout: "radio",
              },
              initialValue: "right",
            }),
            defineField({
              name: "leadImage",
              title: "Lead image",
              description:
                "Full-bleed image shown immediately BEFORE this step. Plays a slow horizontal parallax as it scrolls past. Click 'Pick from library' to browse tagged images.",
              type: "image",
              components: { input: TaggedMediaPicker },
              options: { hotspot: true },
              fields: altField,
            }),
            defineField({
              name: "slideImages",
              title: "Slide images",
              description:
                "Two images for the slide layout — the first is the larger background image, the second is the smaller foreground image that overlaps the corner.",
              type: "array",
              components: { input: TaggedMediaArrayPicker },
              of: [
                {
                  type: "image",
                  options: { hotspot: true },
                  fields: altField,
                },
              ],
              validation: (rule) =>
                rule
                  .max(2)
                  .warning(
                    "Two images works best — extras will be ignored by the layout.",
                  ),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "heading" },
          },
        },
      ],
      validation: (rule) =>
        rule
          .min(1)
          .warning("Add at least one step so the section has content."),
    }),

    /* ── Completion panel ─────────────────────────────────── */
    defineField({
      name: "completion",
      title: "Completion panel",
      description:
        "Final panel of the horizontal scroller — closes the journey with an image strip and a summary line.",
      type: "object",
      group: "completion",
      fields: [
        defineField({
          name: "title",
          title: "Step label",
          description:
            'Short numbered label, e.g. "4. Install & handover".',
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "heading",
          title: "Closing headline",
          description:
            "Two-line headline shown above the image strip. Use a real line break (Shift + Enter).",
          type: "text",
          rows: 2,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "text",
          title: "Closing paragraph",
          description: "Final paragraph beneath the image strip.",
          type: "text",
          rows: 4,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "images",
          title: "Image strip",
          description:
            "Up to seven images. Odd-numbered images render landscape (16:9), even-numbered images render portrait (11:16). They fade in with a stagger as the panel scrolls into view.",
          type: "array",
          components: { input: TaggedMediaArrayPicker },
          of: [
            {
              type: "image",
              options: { hotspot: true },
              fields: altField,
            },
          ],
          validation: (rule) =>
            rule
              .max(7)
              .warning(
                "Seven images is the design's natural limit — extras will overflow the row.",
              ),
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "sectionLabel" },
    prepare: ({ title }) => ({
      title: "Our Approach Section",
      subtitle: title,
    }),
  },
});
