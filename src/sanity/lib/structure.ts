/**
 * Sanity Studio Structure
 * =======================
 * Custom desk structure for the Studio. Organises content into
 * client-friendly groups so the sidebar reads as a site map rather
 * than a flat list of document types.
 *
 * Sections currently surfaced (extend as more schemas land):
 *   SECTIONS    → Partners Section (singleton)
 *   COLLECTIONS → Projects, Project Categories, Expertise, Team
 *                 Members, Partners, Testimonials
 *
 * Singletons open directly (no intermediate list view) and are
 * created on demand via S.document().documentId(...). The studio.ts
 * config strips "duplicate" / "delete" / "unpublish" actions and
 * hides them from "Create new" menus so a client can never
 * accidentally remove a site-wide singleton.
 */

import type { StructureResolver } from "sanity/structure";

/** Document types that should appear as singletons (one-per-site). */
export const SINGLETON_TYPES = [
  "partnersSection",
  "careersPage",
  "sustainabilityPage",
] as const;
export const SINGLETON_TYPE_SET = new Set<string>(SINGLETON_TYPES);

/** Repeatable document types — grouped under "Collections" sidebar
 *  entries. Each opens a standard list view. */
const COLLECTIONS = [
  "project",
  "projectCategory",
  "expertise",
  "teamMember",
  "partner",
  "testimonial",
  "vacancy",
] as const;

/** Doc types hidden from the generic "everything else" Studio list —
 *  singletons + collections are already surfaced in their own
 *  groupings, so they shouldn't double up there. */
const HIDDEN_FROM_GENERIC = new Set<string>([
  ...SINGLETON_TYPES,
  ...COLLECTIONS,
]);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      /* ── Pages ────────────────────────────────────────────────
         Singleton documents that drive a top-level page. Each
         opens straight into its document — no list view. */
      S.listItem()
        .title("Pages")
        .child(
          S.list()
            .title("Pages")
            .items([
              S.listItem()
                .title("Careers Page")
                .id("careersPage")
                .child(
                  S.document()
                    .schemaType("careersPage")
                    .documentId("careersPage")
                    .title("Careers Page"),
                ),
              S.listItem()
                .title("Sustainability Page")
                .id("sustainabilityPage")
                .child(
                  S.document()
                    .schemaType("sustainabilityPage")
                    .documentId("sustainabilityPage")
                    .title("Sustainability Page"),
                ),
            ]),
        ),

      /* ── Sections ─────────────────────────────────────────────
         Singleton documents that drive a reusable section. */
      S.listItem()
        .title("Sections")
        .child(
          S.list()
            .title("Sections")
            .items([
              S.listItem()
                .title("Partners Section")
                .id("partnersSection")
                .child(
                  S.document()
                    .schemaType("partnersSection")
                    .documentId("partnersSection")
                    .title("Partners Section"),
                ),
            ]),
        ),

      S.divider(),

      /* ── Collections ──────────────────────────────────────────
         Repeatable content — each lands in a list view. */
      S.listItem()
        .title("Projects")
        .schemaType("project")
        .child(S.documentTypeList("project").title("Projects")),
      S.listItem()
        .title("Project Categories")
        .schemaType("projectCategory")
        .child(
          S.documentTypeList("projectCategory").title("Project Categories"),
        ),
      S.listItem()
        .title("Expertise")
        .schemaType("expertise")
        .child(S.documentTypeList("expertise").title("Expertise")),
      S.listItem()
        .title("Team Members")
        .schemaType("teamMember")
        .child(S.documentTypeList("teamMember").title("Team Members")),
      S.listItem()
        .title("Partners")
        .schemaType("partner")
        .child(S.documentTypeList("partner").title("Partners")),
      S.listItem()
        .title("Testimonials")
        .schemaType("testimonial")
        .child(S.documentTypeList("testimonial").title("Testimonials")),
      S.listItem()
        .title("Vacancies")
        .schemaType("vacancy")
        .child(S.documentTypeList("vacancy").title("Vacancies")),

      S.divider(),

      /* Anything that lands in the dataset that isn't an explicit
         entry above shows up in this fallback list — but only types
         we haven't already surfaced. Keeps stray future schemas
         visible without having to ship a Studio update. */
      ...S.documentTypeListItems().filter(
        (item) => !HIDDEN_FROM_GENERIC.has(item.getId() ?? ""),
      ),
    ]);
