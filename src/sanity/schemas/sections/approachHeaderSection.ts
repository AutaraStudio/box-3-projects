/**
 * Approach Header Section Schema
 * ===============================
 * Singleton for the editorial "approach" header that sits after the
 * OurApproach horizontal scroll on the home page. A large heading
 * with a sticky scroll-driven image wipe: image 2 clips away on
 * scroll, revealing image 1 beneath. Both images are uploaded via
 * the media library.
 */

import { defineField, defineType } from "sanity";

import { TaggedMediaPicker } from "../../components/TaggedMediaPicker";

export default defineType({
  name: "approachHeaderSection",
  title: "Approach Header Section",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "images", title: "Images" },
  ],
  fields: [
    defineField({
      name: "label",
      title: "Section label",
      description:
        "Small monospace label shown above the heading e.g. Our approach",
      type: "string",
      group: "content",
      initialValue: "Our approach",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      description:
        "Large display heading. Use real line breaks (Shift + Enter) to control wrapping on desktop.",
      type: "text",
      rows: 3,
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image1",
      title: "Base image (revealed)",
      description:
        "The image that appears AFTER the wipe — this is what the viewer sees when scrolling is complete. Click 'Pick from library' to browse tagged images.",
      type: "image",
      group: "images",
      options: { hotspot: true },
      components: { input: TaggedMediaPicker },
      fields: [
        defineField({
          name: "alt",
          title: "Image description (for accessibility)",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "image2",
      title: "Overlay image (wiped away)",
      description:
        "The image shown initially — it clips away on scroll to reveal the base image underneath. Click 'Pick from library' to browse tagged images.",
      type: "image",
      group: "images",
      options: { hotspot: true },
      components: { input: TaggedMediaPicker },
      fields: [
        defineField({
          name: "alt",
          title: "Image description (for accessibility)",
          type: "string",
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({
      title: "Approach Header",
      subtitle: title ? title.slice(0, 60) : "(empty)",
    }),
  },
});
