/**
 * Sanity Studio Structure
 * =======================
 * Custom desk structure for the Studio. Organises content into clear,
 * client-friendly sections with singletons opening directly (no
 * intermediate list views).
 *
 * Sections:
 *   PAGES      → Home Page, (future pages)
 *   SECTIONS   → Partners Section, (future reusable sections)
 *   GLOBAL     → Navigation, Footer (site-wide settings)
 */

import type { StructureResolver } from "sanity/structure";

/** Document types that should appear as singletons (one-per-site). */
const SINGLETONS = [
  "homePage",
  "careersPage",
  "partnersSection",
  "siteNav",
  "siteFooter",
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      /* ── Pages ────────────────────────────────────────────── */
      S.listItem()
        .title("Pages")
        .child(
          S.list()
            .title("Pages")
            .items([
              S.listItem()
                .title("Home Page")
                .id("homePage")
                .child(
                  S.document()
                    .schemaType("homePage")
                    .documentId("homePage")
                    .title("Home Page"),
                ),
              S.listItem()
                .title("Careers Page")
                .id("careersPage")
                .child(
                  S.document()
                    .schemaType("careersPage")
                    .documentId("careersPage")
                    .title("Careers Page"),
                ),
            ]),
        ),

      /* ── Reusable Sections ────────────────────────────────── */
      S.listItem()
        .title("Reusable Sections")
        .child(
          S.list()
            .title("Reusable Sections")
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

      /* ── Site-Wide Settings ───────────────────────────────── */
      S.listItem()
        .title("Site Settings")
        .child(
          S.list()
            .title("Site Settings")
            .items([
              S.listItem()
                .title("Navigation")
                .id("siteNav")
                .child(
                  S.document()
                    .schemaType("siteNav")
                    .documentId("siteNav")
                    .title("Navigation"),
                ),
              S.listItem()
                .title("Footer")
                .id("siteFooter")
                .child(
                  S.document()
                    .schemaType("siteFooter")
                    .documentId("siteFooter")
                    .title("Footer"),
                ),
            ]),
        ),

      /* ── Everything else (safety net for future types) ───── */
      ...S.documentTypeListItems().filter(
        (item) => !SINGLETONS.includes(item.getId() ?? ""),
      ),
    ]);
