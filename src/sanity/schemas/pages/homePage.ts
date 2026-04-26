/**
 * Home Page Schema
 * ================
 * Singleton document for the home page. Currently holds the
 * optional Testimonials section reference; other content lives in
 * its own reusable section documents.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "testimonialsSection",
      title: "Testimonials",
      description:
        "Optional — choose one or more testimonials to show on the home page. Leave empty to hide the section.",
      type: "testimonialsSection",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Home Page" }),
  },
});
