/**
 * Home Page Schema
 * ================
 * Singleton document for the home page content.
 * Controls the hero heading, tagline, and background image.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Hero Heading",
      type: "string",
      description: "The large display heading in the hero section",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Hero Tagline",
      type: "string",
      description: "The uppercase tagline text beneath the heading",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Hero Background Image",
      type: "image",
      description: "The background image for the hero section",
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: "alt",
          title: "Image description (for accessibility)",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "heading",
      media: "heroImage",
    },
  },
});
