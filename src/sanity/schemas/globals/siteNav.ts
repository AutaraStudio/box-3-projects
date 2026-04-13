/**
 * Site Navigation Schema
 * ======================
 * Global document for the site navigation.
 * Controls primary/secondary nav links, mega menu content,
 * contact details, and contact form labels.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteNav",
  title: "Navigation",
  type: "document",
  fields: [
    defineField({
      name: "primaryLinks",
      title: "Primary Nav Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Link text",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "URL path e.g. /about",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "href" },
          },
        },
      ],
    }),
    defineField({
      name: "secondaryLinks",
      title: "Secondary Nav Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Link text",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "URL path e.g. /contact",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "href" },
          },
        },
      ],
    }),
    defineField({
      name: "megaMenuCompanyLinks",
      title: "Mega Menu Company Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Link text",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "URL path",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "href" },
          },
        },
      ],
    }),
    defineField({
      name: "phone",
      title: "Phone number",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email address",
      type: "string",
    }),
    defineField({
      name: "address",
      title: "Office address",
      type: "text",
    }),
    defineField({
      name: "contactForm",
      title: "Contact Form Labels",
      type: "object",
      fields: [
        defineField({
          name: "namePlaceholder",
          title: "Name field placeholder",
          type: "string",
        }),
        defineField({
          name: "emailPlaceholder",
          title: "Email field placeholder",
          type: "string",
        }),
        defineField({
          name: "messagePlaceholder",
          title: "Message field placeholder",
          type: "string",
        }),
        defineField({
          name: "submitLabel",
          title: "Submit button label",
          type: "string",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "primaryLinks.0.label",
    },
  },
});
