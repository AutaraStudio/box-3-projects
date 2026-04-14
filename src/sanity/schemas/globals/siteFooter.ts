/**
 * Site Footer Schema
 * ==================
 * Global document for the site footer.
 * Controls navigation links, social links, legal links,
 * contact details, newsletter, and copyright.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteFooter",
  title: "Footer",
  type: "document",
  fields: [
    defineField({
      name: "primaryLinks",
      title: "Primary Links",
      description: "Main navigation links (e.g. About, Services, Projects, Clients)",
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
      title: "Secondary Links",
      description: "Secondary navigation links (e.g. Culture, Blog, Contact)",
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
      name: "miscLinks",
      title: "Miscellaneous Links",
      description: "Additional links (e.g. FAQ)",
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
              title: "URL path e.g. /faq",
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
      name: "socialLinks",
      title: "Social Links",
      description: "Social media links (open in new tab)",
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
              title: "Full URL e.g. https://instagram.com/...",
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
      name: "legalLinks",
      title: "Legal Links",
      description: "Legal page links (e.g. Privacy Policy, Terms)",
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
              title: "URL path e.g. /privacy-policy",
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
      name: "newsletterPlaceholder",
      title: "Newsletter input placeholder",
      type: "string",
    }),
    defineField({
      name: "madeByLabel",
      title: "Made by label",
      description: "Credit line e.g. Made by Autara Studio",
      type: "string",
    }),
    defineField({
      name: "madeByUrl",
      title: "Made by URL",
      type: "string",
    }),
    defineField({
      name: "copyright",
      title: "Copyright text",
      type: "string",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Footer" }),
  },
});
