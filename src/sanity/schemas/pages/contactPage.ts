/**
 * Contact Page Schema
 * ===================
 * Singleton document for the contact page. Holds hero copy,
 * form configuration (tabs, labels, placeholders), and the
 * sidebar info column (heading, address, phone, email).
 */

import { defineField, defineType } from "sanity";

import { TaggedMediaPicker } from "../../components/TaggedMediaPicker";

/* ── Reusable link object ─────────────────────────────────── */
const formTab = {
  name: "formTab",
  title: "Form Tab",
  type: "object" as const,
  fields: [
    defineField({
      name: "label",
      title: "Tab label",
      description: "Display text for this tab e.g. Question, Proposal",
      type: "string",
      validation: (rule: any) => rule.required(),
    }),
    defineField({
      name: "key",
      title: "Tab key",
      description:
        "Internal identifier used in code — lowercase, no spaces e.g. question, proposal",
      type: "string",
      validation: (rule: any) => rule.required(),
    }),
  ],
};

const formField = {
  name: "formField",
  title: "Form Field",
  type: "object" as const,
  fields: [
    defineField({
      name: "label",
      title: "Field label",
      description: "Label shown above the input e.g. First Name",
      type: "string",
      validation: (rule: any) => rule.required(),
    }),
    defineField({
      name: "name",
      title: "Field name",
      description:
        "HTML field name — lowercase, no spaces e.g. firstName, email",
      type: "string",
      validation: (rule: any) => rule.required(),
    }),
    defineField({
      name: "placeholder",
      title: "Placeholder",
      description: "Placeholder text shown when the field is empty",
      type: "string",
    }),
    defineField({
      name: "type",
      title: "Input type",
      description: "HTML input type — text, email, tel, or textarea",
      type: "string",
      options: {
        list: [
          { title: "Text", value: "text" },
          { title: "Email", value: "email" },
          { title: "Phone", value: "tel" },
          { title: "Textarea", value: "textarea" },
        ],
      },
      initialValue: "text",
    }),
    defineField({
      name: "halfWidth",
      title: "Half width",
      description:
        "Show this field side-by-side with the next field on desktop",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "name" },
  },
};

export default defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "form", title: "Form" },
    { name: "info", title: "Info Sidebar" },
    { name: "testimonials", title: "Testimonials" },
  ],
  fields: [
    /* ── Hero ────────────────────────────────────────────── */
    defineField({
      name: "heading",
      title: "Page heading",
      description:
        "The large display heading in the hero section e.g. Let's Connect",
      type: "string",
      group: "hero",
      validation: (rule) => rule.required(),
    }),

    /* ── Form ────────────────────────────────────────────── */
    defineField({
      name: "sectionLabel",
      title: "Section label",
      description:
        "Small mono label at the top of the content section e.g. Contact us",
      type: "string",
      group: "form",
    }),
    defineField({
      name: "sectionReference",
      title: "Section reference code",
      description:
        "Editorial reference code shown opposite the label e.g. [BOX3.1]",
      type: "string",
      group: "form",
    }),
    defineField({
      name: "tabs",
      title: "Form tabs",
      description:
        "The category tabs above the form — the first tab is selected by default",
      type: "array",
      of: [formTab],
      group: "form",
    }),
    defineField({
      name: "formFields",
      title: "Form fields",
      description:
        "The input fields shown in the contact form. Mark pairs as 'Half width' to show them side-by-side on desktop.",
      type: "array",
      of: [formField],
      group: "form",
    }),
    defineField({
      name: "submitLabel",
      title: "Submit button label",
      description: "Text on the form submit button e.g. Submit",
      type: "string",
      group: "form",
    }),

    /* ── Info sidebar ────────────────────────────────────── */
    defineField({
      name: "infoHeading",
      title: "Info heading",
      description:
        "Heading text in the sidebar e.g. Let's connect on your next building project.",
      type: "string",
      group: "info",
    }),
    defineField({
      name: "address",
      title: "Office address",
      description: "Street address shown in the info column — line breaks preserved",
      type: "text",
      rows: 3,
      group: "info",
    }),
    defineField({
      name: "phone",
      title: "Phone number",
      description: "Phone number shown as a clickable link",
      type: "string",
      group: "info",
    }),
    defineField({
      name: "email",
      title: "Email address",
      description: "Email address shown as a clickable mailto link",
      type: "string",
      group: "info",
    }),
    defineField({
      name: "infoImage",
      title: "Sidebar image",
      description:
        "Optional image shown below the contact details in the sidebar. Upload via Studio.",
      type: "image",
      group: "info",
      options: { hotspot: true },
      components: { input: TaggedMediaPicker },
      fields: [
        defineField({
          name: "alt",
          title: "Image description (for accessibility)",
          description: "Short description of what's in the image",
          type: "string",
        }),
      ],
    }),

    /* ── Testimonials ────────────────────────────────────── */
    defineField({
      name: "testimonialsSection",
      title: "Testimonials",
      description:
        "Optional — choose one or more testimonials to show on the contact page. Leave empty to hide the section.",
      type: "testimonialsSection",
      group: "testimonials",
    }),
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({
      title: "Contact Page",
      subtitle: title,
    }),
  },
});
