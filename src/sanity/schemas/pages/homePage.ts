/**
 * Home Page Schema
 * ================
 * Singleton document for the home page. Content is organised by
 * on-page section — currently just the Hero. Future sections will
 * be added here as the home page grows.
 */

import { defineField, defineType } from "sanity";

import { TaggedMediaPicker } from "../../components/TaggedMediaPicker";

export default defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero Section", default: true },
    { name: "testimonials", title: "Testimonials" },
  ],
  fields: [
    defineField({
      name: "heading",
      title: "Hero heading",
      description: "The large display heading at the top of the page",
      type: "string",
      group: "hero",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Hero tagline",
      description: "The uppercase line of text beneath the heading",
      type: "string",
      group: "hero",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Hero background image",
      description:
        "The full-width background image behind the hero heading. Click 'Pick from library' to browse tagged images, or use the native upload / Select below.",
      type: "image",
      group: "hero",
      options: { hotspot: true },
      components: { input: TaggedMediaPicker },
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: "alt",
          title: "Image description (for accessibility)",
          description:
            "Short description of what's in the image — used by screen readers",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "testimonialsSection",
      title: "Testimonials",
      description:
        "Optional — choose one or more testimonials to show on the home page. Leave empty to hide the section.",
      type: "testimonialsSection",
      group: "testimonials",
    }),
  ],
  preview: {
    select: {
      title: "heading",
      media: "heroImage",
    },
    prepare: ({ title, media }) => ({
      title: "Home Page",
      subtitle: title,
      media,
    }),
  },
});
