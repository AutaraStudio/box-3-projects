/**
 * Contact Page singleton
 * ======================
 * Drives every editable surface on /contact: hero copy, the
 * intro lede, every form field label + placeholder, the
 * project-type and subject dropdown options, the submit /
 * sending button labels, and the success-state copy after
 * the form sends.
 */

import { defineField, defineType } from "sanity";

const formField = {
  name: "contactFormField",
  title: "Form field",
  type: "object" as const,
  fields: [
    defineField({
      name: "label",
      title: "Visible label",
      type: "string",
    }),
    defineField({
      name: "placeholder",
      title: "Placeholder text",
      description: "Optional — only shown if the field has one in the design (dropdowns).",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "placeholder" },
  },
};

export default defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "form", title: "Form" },
    { name: "sent", title: "Sent state" },
    { name: "seo", title: "SEO" },
  ],
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

    /* ── Form labels ───────────────────────────────────── */
    defineField({
      name: "firstNameField",
      title: "First name field",
      type: "object",
      group: "form",
      fields: formField.fields,
    }),
    defineField({
      name: "lastNameField",
      title: "Last name field",
      type: "object",
      group: "form",
      fields: formField.fields,
    }),
    defineField({
      name: "emailField",
      title: "Email field",
      type: "object",
      group: "form",
      fields: formField.fields,
    }),
    defineField({
      name: "organisationField",
      title: "Organisation field",
      type: "object",
      group: "form",
      fields: formField.fields,
    }),
    defineField({
      name: "projectTypeField",
      title: "Project type field",
      type: "object",
      group: "form",
      fields: formField.fields,
    }),
    defineField({
      name: "subjectField",
      title: "Subject field",
      type: "object",
      group: "form",
      fields: formField.fields,
    }),
    defineField({
      name: "messageField",
      title: "Message field",
      type: "object",
      group: "form",
      fields: formField.fields,
    }),
    defineField({
      name: "projectTypes",
      title: "Project type options",
      description:
        'Dropdown options for the "Project type" field. Editors can add / remove / re-order — first item becomes the default placeholder hint.',
      type: "array",
      of: [{ type: "string" }],
      group: "form",
    }),
    defineField({
      name: "subjects",
      title: "Subject options",
      description: 'Dropdown options for the "Subject" field.',
      type: "array",
      of: [{ type: "string" }],
      group: "form",
    }),
    defineField({
      name: "submitLabel",
      title: "Submit button label",
      type: "string",
      group: "form",
    }),
    defineField({
      name: "submittingLabel",
      title: "Submitting button label",
      description: 'Shown while the form is sending, e.g. "Sending…".',
      type: "string",
      group: "form",
    }),

    /* ── Sent state ────────────────────────────────────── */
    defineField({
      name: "sentHeading",
      title: "Sent heading",
      description: 'The line shown after the form has been sent.',
      type: "string",
      group: "sent",
    }),
    defineField({
      name: "sentBody",
      title: "Sent body",
      description: "Supporting copy under the sent heading.",
      type: "text",
      rows: 3,
      group: "sent",
    }),

    /* ── SEO ──────────────────────────────────────────── */
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
  preview: { prepare: () => ({ title: "Contact Page" }) },
});
