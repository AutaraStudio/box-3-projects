/**
 * Site Settings singleton
 * =======================
 * Global content used everywhere on the site — header navigation,
 * footer columns, brand label, contact info, default SEO. One
 * document for the whole site (no list view, no duplicate /
 * delete in the studio).
 *
 * Field groups split the document into tabs in the studio so
 * editors don't have to scroll past unrelated fields when they're
 * just changing a phone number.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "brand", title: "Brand", default: true },
    { name: "header", title: "Header" },
    { name: "footer", title: "Footer" },
    { name: "contact", title: "Contact info" },
    { name: "uiLabels", title: "UI labels" },
    { name: "seo", title: "SEO defaults" },
  ],
  fields: [
    /* ── Brand ──────────────────────────────────────────── */
    defineField({
      name: "brandName",
      title: "Brand name",
      description:
        "Used as the accessible name of the home logo, the " +
        "footer copyright, and the default site title.",
      type: "string",
      group: "brand",
      validation: (rule) => rule.required().max(60),
    }),

    /* ── Header navigation ─────────────────────────────── */
    defineField({
      name: "headerPrimaryLinks",
      title: "Primary nav links",
      description:
        "First column of nav links shown beside the logo. Visible " +
        "at the top of the viewport; collapse into the side menu " +
        "as the user scrolls.",
      type: "array",
      of: [{ type: "link" }],
      group: "header",
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: "headerSecondaryLinks",
      title: "Secondary nav links",
      description:
        "Second column of nav links — typically the supporting " +
        "links (Careers, Contact, etc.).",
      type: "array",
      of: [{ type: "link" }],
      group: "header",
      validation: (rule) => rule.max(4),
    }),

    /* ── Side menu ─────────────────────────────────────── */
    defineField({
      name: "menuPrimaryLinks",
      title: "Side menu — primary links",
      description:
        "Big editorial links shown at the top of the slide-in side " +
        "menu (e.g. Home, About, Projects).",
      type: "array",
      of: [{ type: "link" }],
      group: "header",
    }),
    defineField({
      name: "menuMoreLinks",
      title: 'Side menu — "More" links',
      description:
        'The smaller links shown beneath the primary list, under ' +
        'a "More" header in the side menu.',
      type: "array",
      of: [{ type: "link" }],
      group: "header",
    }),

    /* ── Footer ─────────────────────────────────────────── */
    defineField({
      name: "footerPages",
      title: "Footer — Pages column",
      description: 'Links shown under the "Pages" heading in the footer.',
      type: "array",
      of: [{ type: "link" }],
      group: "footer",
    }),
    defineField({
      name: "footerSocial",
      title: "Footer — Social column",
      description:
        'External links shown under the "Social" heading. Use full ' +
        "URLs (https://...).",
      type: "array",
      of: [{ type: "link" }],
      group: "footer",
    }),
    defineField({
      name: "footerLegal",
      title: "Footer — Legal column",
      description:
        "Privacy policy / Terms / Cookie pages — surfaced beneath " +
        "the main footer columns.",
      type: "array",
      of: [{ type: "link" }],
      group: "footer",
    }),

    /* ── Contact info (used in footer + side menu) ─────── */
    defineField({
      name: "addressLines",
      title: "Address",
      description:
        "Each line in the address — one entry per visual line. " +
        "Shown in the footer and the side menu.",
      type: "array",
      of: [{ type: "string" }],
      group: "contact",
    }),
    defineField({
      name: "email",
      title: "Email",
      description: "Public contact email.",
      type: "string",
      group: "contact",
      validation: (rule) =>
        rule.email().error("Use a valid email address (e.g. hello@example.com)."),
    }),
    defineField({
      name: "phone",
      title: "Phone (display)",
      description:
        'How the phone number reads on screen, e.g. "+44 (0)20 8050 7815".',
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "phoneHref",
      title: "Phone (tel: link)",
      description:
        'The dial-able version used when someone taps the phone ' +
        "number. Format: tel:02080507815 (no spaces, with tel: prefix).",
      type: "string",
      group: "contact",
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true;
          return (
            value.startsWith("tel:") || 'Phone link must start with "tel:".'
          );
        }),
    }),

    /* ── UI labels ─────────────────────────────────────────
       Editable surface for every static label that lives in the
       chrome of the site (header buttons, footer column titles,
       side-menu sections, project-detail labels, etc.). Each
       group is its own object field so the studio renders a
       collapsible block per area. */
    defineField({
      name: "headerLabels",
      title: "Header — labels",
      description:
        "Text shown on the header's Menu button and the contact icon's accessible name.",
      type: "object",
      group: "uiLabels",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "menuOpenLabel",
          title: "Menu button (closed state)",
          description: 'Label when the side menu is closed, e.g. "Menu".',
          type: "string",
        }),
        defineField({
          name: "menuCloseLabel",
          title: "Menu button (open state)",
          description: 'Label when the side menu is open, e.g. "Close".',
          type: "string",
        }),
        defineField({
          name: "menuOpenAriaLabel",
          title: "Menu button — open description",
          description: "Accessible description used by screen readers when the menu is closed.",
          type: "string",
        }),
        defineField({
          name: "menuCloseAriaLabel",
          title: "Menu button — close description",
          description: "Accessible description used when the menu is open.",
          type: "string",
        }),
        defineField({
          name: "contactAriaLabel",
          title: "Contact icon — description",
          description: "Accessible label for the icon-only contact button next to the menu.",
          type: "string",
        }),
      ],
    }),

    defineField({
      name: "menuLabels",
      title: "Side menu — labels",
      description:
        'Section titles + the inline contact form copy in the slide-in menu.',
      type: "object",
      group: "uiLabels",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "moreSectionTitle",
          title: 'Secondary links section title',
          description: 'Heading above the smaller link list, e.g. "More".',
          type: "string",
        }),
        defineField({
          name: "stayInTouchTitle",
          title: "Contact section title",
          description: 'Heading above the contact line block, e.g. "Stay in touch".',
          type: "string",
        }),
        defineField({
          name: "namePlaceholder",
          title: "Form — Name field label",
          type: "string",
        }),
        defineField({
          name: "emailPlaceholder",
          title: "Form — Email field label",
          type: "string",
        }),
        defineField({
          name: "messagePlaceholder",
          title: "Form — Message field label",
          type: "string",
        }),
        defineField({
          name: "submitLabel",
          title: "Form — Submit button label",
          type: "string",
        }),
        defineField({
          name: "submittedLabel",
          title: "Form — sent confirmation",
          description: 'Replaces the submit button after sending, e.g. "Thanks — we\'ll be in touch".',
          type: "string",
        }),
        defineField({
          name: "siteMenuAriaLabel",
          title: "Menu wrapper description",
          description: "Accessible name for the slide-in menu dialog.",
          type: "string",
        }),
        defineField({
          name: "scrimAriaLabel",
          title: "Click-out scrim description",
          description: "Accessible label on the dim overlay used to close the menu.",
          type: "string",
        }),
      ],
    }),

    defineField({
      name: "footerLabels",
      title: "Footer — column titles",
      description:
        "Headings above each column of links in the footer.",
      type: "object",
      group: "uiLabels",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "pages", title: 'Pages column heading', type: "string" }),
        defineField({
          name: "featuredProjects",
          title: "Featured projects column heading",
          type: "string",
        }),
        defineField({ name: "contact", title: "Contact column heading", type: "string" }),
        defineField({ name: "social", title: "Social column heading", type: "string" }),
        defineField({ name: "legal", title: "Legal column heading", type: "string" }),
      ],
    }),

    defineField({
      name: "projectDetailLabels",
      title: "Project detail — labels",
      description:
        "Static labels used across every project page (stat row labels, section headings, gallery copy, related strip).",
      type: "object",
      group: "uiLabels",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "locationLabel", title: 'Location stat label', type: "string" }),
        defineField({ name: "yearLabel", title: 'Year stat label', type: "string" }),
        defineField({ name: "expertiseHeading", title: "Expertise list heading", type: "string" }),
        defineField({ name: "teamHeading", title: "Team grid heading", type: "string" }),
        defineField({ name: "briefHeading", title: "Brief block heading", type: "string" }),
        defineField({
          name: "objectiveLabel",
          title: 'Objective block label',
          description: 'e.g. "Client objective".',
          type: "string",
        }),
        defineField({
          name: "feedbackLabel",
          title: 'Client feedback label',
          description: 'e.g. "Client feedback".',
          type: "string",
        }),
        defineField({
          name: "objectiveAccordionLabel",
          title: "Objective accordion label",
          description: 'Shorter version used in the right-column accordion, e.g. "Objective".',
          type: "string",
        }),
        defineField({
          name: "feedbackAccordionLabel",
          title: "Client feedback accordion label",
          type: "string",
        }),
        defineField({
          name: "exploreTitle",
          title: 'Explore section heading',
          description: 'The big heading above the lightbox CTA, e.g. "Explore the project in pictures".',
          type: "string",
        }),
        defineField({
          name: "viewGalleryLabel",
          title: 'View gallery button label',
          type: "string",
        }),
        defineField({
          name: "exploreOpenLabel",
          title: "Lightbox open description",
          description: "Accessible label used by the full-cover transparent button on the hero media.",
          type: "string",
        }),
        defineField({
          name: "moreProjectsHeading",
          title: 'Related projects heading',
          description: 'e.g. "More projects".',
          type: "string",
        }),
        defineField({
          name: "lightboxPreviousLabel",
          title: "Lightbox — previous arrow description",
          type: "string",
        }),
        defineField({
          name: "lightboxNextLabel",
          title: "Lightbox — next arrow description",
          type: "string",
        }),
        defineField({
          name: "lightboxCloseLabel",
          title: 'Lightbox close button label',
          type: "string",
        }),
        defineField({
          name: "lightboxCloseAriaLabel",
          title: "Lightbox close — description",
          type: "string",
        }),
      ],
    }),

    defineField({
      name: "legalPageLabels",
      title: "Legal pages — labels",
      description: "Shared labels used on every legal page.",
      type: "object",
      group: "uiLabels",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "lastUpdatedLabel",
          title: '"Last updated" label',
          type: "string",
        }),
        defineField({
          name: "tocAriaLabel",
          title: "Table of contents description",
          type: "string",
        }),
      ],
    }),

    defineField({
      name: "testimonialsLabels",
      title: "Testimonials — accessibility labels",
      description: "Screen-reader text for the prev / next testimonial buttons.",
      type: "object",
      group: "uiLabels",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "previousLabel", title: "Previous testimonial label", type: "string" }),
        defineField({ name: "nextLabel", title: "Next testimonial label", type: "string" }),
      ],
    }),

    /* ── SEO defaults ──────────────────────────────────── */
    defineField({
      name: "seoTitle",
      title: "Default page title",
      description:
        "Shown in browser tabs and search results when a page " +
        "doesn't set its own title.",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "Default meta description",
      description:
        "Default 1–2 sentence summary used for search snippets and " +
        "social previews when a page doesn't set its own.",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: "seoOgImage",
      title: "Default share image",
      description:
        "Image used when the site URL is shared on social — " +
        "1200×630 recommended.",
      type: "image",
      options: { hotspot: true },
      group: "seo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
