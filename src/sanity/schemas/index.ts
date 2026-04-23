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
import careersPage from "./pages/careersPage";
import contactPage from "./pages/contactPage";

/* Sections */
import partnersSection from "./sections/partnersSection";
import bannerShowroom from "./sections/bannerShowroom";
import featuredProjectsSection from "./sections/featuredProjectsSection";
import testimonialsSection from "./sections/testimonialsSection";

/* Collections */
import project from "./collections/project";
import projectCategory from "./collections/projectCategory";
import expertise from "./collections/expertise";
import teamMember from "./collections/teamMember";
import vacancy from "./collections/vacancy";
import partner from "./collections/partner";
import testimonial from "./collections/testimonial";

/* Globals */
import siteNav from "./globals/siteNav";
import siteFooter from "./globals/siteFooter";

export const schemaTypes: SchemaTypeDefinition[] = [
  homePage,
  careersPage,
  contactPage,
  siteNav,
  siteFooter,
  partnersSection,
  bannerShowroom,
  featuredProjectsSection,
  testimonialsSection,
  projectCategory,
  expertise,
  teamMember,
  project,
  vacancy,
  partner,
  testimonial,
];
