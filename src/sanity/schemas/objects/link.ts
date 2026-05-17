/**
 * Link object
 * ===========
 * Reusable link primitive — used by every button, nav item, footer
 * link, and CTA on the site. Same shape everywhere so the editor
 * always sees the same fields with consistent help text.
 *
 * Two ways to set the destination:
 *
 *   1. Internal page (dropdown) — quickest for the standard set
 *      of site pages (Home, About, Services, Projects, Careers,
 *      Sustainability, Contact). Editor picks from a list, no
 *      typing required.
 *
 *   2. Custom link (free-text) — for everything else: external
 *      URLs (https://…), email (mailto:…), phone (tel:…), or
 *      in-page anchors (#process).
 *
 * If both are set, the dropdown wins — the GROQ projection in the
 * page queries coalesces internalPage → href so the front-end
 * always sees a single resolved `href`.
 *
 * Existing data with a plain `href` continues to work — no
 * migration needed. The dropdown is purely additive.
 *
 * `pageName` is optional — if left empty, the front-end uses
 * `label` as the page-transition wipe label.
 */

import { defineField, defineType } from "sanity";

/* Keep this list in sync with the site's top-level routes. Adding
   a route? Drop it in here and editors get a dropdown entry for it
   without touching anything else. Exported so the ad-hoc CTA fields
   on careersPage / sustainabilityPage can reuse the same list. */
export const INTERNAL_PAGES = [
  { title: "Home (/)", value: "/" },
  { title: "About (/about)", value: "/about" },
  { title: "Services (/services)", value: "/services" },
  { title: "Projects (/projects)", value: "/projects" },
  { title: "Careers (/careers)", value: "/careers" },
  { title: "Sustainability (/sustainability)", value: "/sustainability" },
  { title: "Contact (/contact)", value: "/contact" },
];

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
      name: "internalPage",
      title: "Internal page",
      description:
        "Pick a site page from the list. Quicker than typing the " +
        "slug. Leave blank if you're linking somewhere else (use " +
        "the Custom link field below).",
      type: "string",
      options: { list: INTERNAL_PAGES, layout: "dropdown" },
    }),
    defineField({
      name: "href",
      title: "Custom link",
      description:
        "Use this for anything that isn't in the Internal page " +
        "dropdown above — external sites (https://…), email " +
        "(mailto:…), phone (tel:…), or in-page anchors (#process). " +
        "If both this and Internal page are set, Internal page " +
        "wins.",
      type: "string",
      validation: (rule) =>
        rule.custom((value, context) => {
          /* Doc-level rule: at least one of internalPage or href
             must be set, otherwise the link goes nowhere. */
          const parent = context.parent as
            | { internalPage?: string; href?: string }
            | undefined;
          const hasInternal = parent?.internalPage?.trim();
          const hasCustom = value?.trim();
          if (!hasInternal && !hasCustom) {
            return "Pick an internal page or enter a custom link.";
          }
          if (!hasCustom) return true;
          const ok = /^(\/|https?:\/\/|mailto:|tel:|#)/i.test(hasCustom);
          return (
            ok ||
            "Use /something for internal pages, https:// for external, mailto: / tel: for email / phone, # for in-page anchors."
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
      internalPage: "internalPage",
      href: "href",
    },
    prepare: ({ title, internalPage, href }) => ({
      title: title ?? "(no label)",
      subtitle: internalPage ?? href ?? "(no destination)",
    }),
  },
});
