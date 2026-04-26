/**
 * Team Member
 * ===========
 * A single person on the Box 3 team. Referenced by projects under
 * the `team` field so each project can list the people who worked
 * on it.
 *
 * Note (v2): the master TaggedMediaPicker custom input has been
 * dropped for now — the image field uses the native Sanity image
 * input. The existing media-tagged assets can still be selected
 * via the asset browser; the picker can be reintroduced later if
 * the editor wants the tag-filtered shortcut back.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "teamMember",
  title: "Team Members",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Full Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role / Job Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "qualifications",
      title: "Qualifications",
      type: "string",
      description:
        "Professional qualifications displayed above the role. E.g. OAQ, OAA, AAA, AIBC",
    }),
    defineField({
      name: "linkedinUrl",
      title: "LinkedIn URL",
      type: "url",
      description:
        "Full LinkedIn profile URL. Leave blank if not applicable.",
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      description: "Professional headshot.",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description:
        "Controls the order team members appear on the site. Lower numbers appear first.",
    }),
  ],
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "image",
    },
  },
});
