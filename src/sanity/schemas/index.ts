/**
 * Sanity Schema Registry
 * ======================
 * Central export of all schema types for the Sanity Studio.
 * Import individual schemas from their respective folders and
 * add them to the schemaTypes array below.
 *
 * Folder structure:
 *   /pages       — Individual page documents (home, about, services, contact, etc.)
 *   /sections    — Reusable section schemas (hero, cta, testimonials, etc.)
 *   /collections — Repeatable content types (blog posts, projects, case studies, etc.)
 *   /globals     — Site-wide content (navigation, footer, site settings, SEO defaults)
 *   /components  — Shared component schemas (buttons, links, images, etc.)
 */

import type { SchemaTypeDefinition } from "sanity";

/* Pages */
import homePage from "./pages/homePage";

/* Sections */
import partnersSection from "./sections/partnersSection";

/* Globals */
import siteNav from "./globals/siteNav";
import siteFooter from "./globals/siteFooter";

export const schemaTypes: SchemaTypeDefinition[] = [
  homePage,
  partnersSection,
  siteNav,
  siteFooter,
];
