/**
 * Projects Page singleton
 * =======================
 * Drives the editable surface on /projects — the editorial label
 * + heading at the top of the hero, plus the two scroll-revealed
 * images (sketch overlay + photo beneath).
 *
 * The actual project cards beneath the hero pull automatically
 * from the Projects collection, so this doc only owns the hero.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "projectsPage",
  title: "Projects Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "label",
      title: "Section label",
      description:
        'Small caps label above the heading, e.g. "Selected projects".',
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      description:
        "The big editorial heading — keep it short. Defaults to " +
        '"Designed, built, delivered." when empty.',
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "baseImage",
      title: "Photograph (revealed)",
      description:
        "The photo that's revealed beneath the sketch as the user " +
        "scrolls. Wide landscape image, ~16:9 reads well.",
      type: "image",
      options: { hotspot: true },
      group: "hero",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          description: "What's in the photo, in plain English.",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "overlayImage",
      title: "Sketch overlay",
      description:
        "The sketch / line drawing that sits on top of the " +
        "photograph and wipes away on scroll. Transparent " +
        "background reads well — a solid theme bg sits behind " +
        "automatically.",
      type: "image",
      options: { hotspot: true },
      group: "hero",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          description: "Describe the sketch, e.g. 'Initial sketch — line drawing'.",
          type: "string",
        }),
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
  preview: {
    prepare: () => ({ title: "Projects Page" }),
  },
});
