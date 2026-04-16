/**
 * Featured Projects Section Schema
 * ================================
 * Singleton document for the home-page "selected projects" band.
 * The client picks any number of projects (typically 3) from the
 * Projects collection; the component renders them in order, with
 * the first project showing image-right / text-left and each
 * subsequent project alternating.
 *
 * Each project's in-page detail (tag, title, stats, featured
 * image) is dereferenced client-side so the Studio UI only ever
 * holds references — editing a project in its own document
 * immediately reflects here without needing a duplicate edit.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "featuredProjectsSection",
  title: "Featured Projects Section",
  type: "document",
  groups: [
    { name: "label", title: "Section Label", default: true },
    { name: "projects", title: "Projects" },
    { name: "cta", title: "Call to Action" },
  ],
  fields: [
    /* ── Section label ────────────────────────────────────── */
    defineField({
      name: "sectionLabel",
      title: "Section label",
      description:
        'Small uppercase label shown at the top of the section, e.g. "Selected work".',
      type: "string",
      group: "label",
    }),

    /* ── Projects list ────────────────────────────────────── */
    defineField({
      name: "projects",
      title: "Featured projects",
      description:
        "Pick the projects you want to feature on the home page. Drag to reorder — the first project renders with the image on the right, and every project after that alternates sides. Typically three projects works best, but any number is supported.",
      type: "array",
      group: "projects",
      of: [
        {
          type: "reference",
          to: [{ type: "project" }],
        },
      ],
      validation: (rule) =>
        rule
          .min(1)
          .warning(
            "Add at least one project or the section won't render on the home page.",
          ),
    }),

    /* ── Bottom CTA ───────────────────────────────────────── */
    defineField({
      name: "ctaLabel",
      title: "Bottom button label",
      description:
        'Text on the full-width button beneath the list, e.g. "Explore all projects".',
      type: "string",
      group: "cta",
      initialValue: "Explore all projects",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "ctaHref",
      title: "Bottom button link",
      description:
        'Where the bottom button points — usually the projects listing page ("/projects") or a collection page.',
      type: "string",
      group: "cta",
      initialValue: "/projects",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "sectionLabel", projects: "projects" },
    prepare: ({ title, projects }) => ({
      title: "Featured Projects Section",
      subtitle:
        title ??
        (projects?.length
          ? `${projects.length} project${projects.length === 1 ? "" : "s"}`
          : "No projects selected"),
    }),
  },
});
