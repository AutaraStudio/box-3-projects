/**
 * Contact Page singleton
 * ======================
 * Drives the editable copy on /contact — page heading + the
 * editorial intro paragraph. The contact form fields themselves
 * are component-internal (a fixed shape mirroring the studio's
 * intake process); the project-type dropdown pulls from the
 * Project Categories collection.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  groups: [{ name: "content", title: "Content", default: true }],
  fields: [
    defineField({
      name: "heroHeading",
      title: "Page heading",
      description:
        'The big heading at the top of the page, e.g. "Tell us about the brief."',
      type: "string",
      group: "content",
    }),
    defineField({
      name: "introLabel",
      title: "Section label",
      description: 'Small caps label, e.g. "Contact".',
      type: "string",
      group: "content",
    }),
    defineField({
      name: "introLede",
      title: "Intro paragraph",
      description:
        "Editorial copy shown beside the form — sets expectations " +
        "(reply window, who reads it, etc.).",
      type: "text",
      rows: 4,
      group: "content",
    }),
  ],
  preview: { prepare: () => ({ title: "Contact Page" }) },
});
