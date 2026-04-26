/**
 * Testimonials Section (embeddable object)
 * =========================================
 * Reusable section schema — not a document. Embedded as a field on
 * any parent document that wants to show testimonials (project,
 * future home page, etc.).
 *
 * Stores a section label, a reference code (e.g. "[BOX3.1]" — shown
 * top-right), and an ordered list of references to Testimonial docs.
 * Content is authored once in the Testimonials collection and reused
 * here via references.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "testimonialsSection",
  title: "Testimonials Section",
  type: "object",
  fields: [
    defineField({
      name: "sectionLabel",
      title: "Section label",
      description: "Small label shown top-left e.g. Testimonials",
      type: "string",
      initialValue: "Testimonials",
    }),
    defineField({
      name: "reference",
      title: "Reference code",
      description:
        "Small monospace code shown top-right e.g. [BOX3.1]. Purely editorial — leave blank to hide.",
      type: "string",
    }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      description:
        "Choose which testimonials to show, in order. Add new testimonials from the Testimonials collection in the sidebar.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "testimonial" }] }],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { count: "testimonials.length" },
    prepare: ({ count }) => ({
      title: "Testimonials Section",
      subtitle: count
        ? `${count} testimonial${count === 1 ? "" : "s"}`
        : "(empty)",
    }),
  },
});
