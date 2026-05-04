/**
 * Link object
 * ===========
 * Reusable link primitive — used by every button, nav item, footer
 * link, and CTA on the site. Same shape everywhere so the editor
 * always sees the same two fields ("Label" + "Link") with consistent
 * help text.
 *
 * The `href` value can be:
 *   - an internal path:  /about, /projects, /contact
 *   - an external URL:   https://instagram.com/...
 *   - a mailto / tel:    mailto:hello@example.com, tel:+44...
 *
 * `pageName` is optional — if left empty we use `label` as the
 * page-transition wipe label.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      description: "The visible text on the link / button.",
      type: "string",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "href",
      title: "Link",
      description:
        "Where the link goes. Use a slash for internal pages " +
        "(e.g. /about, /projects), a full URL for external sites, " +
        "or mailto: / tel: for email + phone shortcuts.",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .custom((value) => {
            if (!value) return true;
            const ok = /^(\/|https?:\/\/|mailto:|tel:|#)/i.test(value);
            return (
              ok ||
              "Use /something for internal pages, https:// for external, mailto: or tel: for email/phone."
            );
          }),
    }),
    defineField({
      name: "pageName",
      title: "Transition label (optional)",
      description:
        "Shown briefly during the page transition wipe when this " +
        "link is clicked. Leave empty to fall back to the link " +
        "label above.",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "label",
      subtitle: "href",
    },
  },
});
