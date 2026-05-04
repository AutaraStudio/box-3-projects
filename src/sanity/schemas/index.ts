/**
 * Sanity Schema Registry
 * ======================
 * Every schema type used by the embedded Studio is registered here.
 * v2 starts with the minimum needed to surface the existing Project
 * content in the live Sanity dataset (uwutffn5/production):
 *
 *   Collections — project, projectCategory, teamMember, expertise,
 *                 testimonial, partner
 *   Sections    — testimonialsSection (object, embedded on project)
 *
 * Add page / global schemas (homePage, siteNav, etc.) here as v2
 * builds out the surfaces that need them.
 */

import type { SchemaTypeDefinition } from "sanity";

import project from "./collections/project";
import projectCategory from "./collections/projectCategory";
import teamMember from "./collections/teamMember";
import expertise from "./collections/expertise";
import testimonial from "./collections/testimonial";
import partner from "./collections/partner";
import vacancy from "./collections/vacancy";

import testimonialsSection from "./sections/testimonialsSection";
import partnersSection from "./sections/partnersSection";
import careersPage from "./pages/careersPage";
import sustainabilityPage from "./pages/sustainabilityPage";
import homePage from "./pages/homePage";
import projectsPage from "./pages/projectsPage";
import aboutPage from "./pages/aboutPage";
import servicesPage from "./pages/servicesPage";
import contactPage from "./pages/contactPage";

import link from "./objects/link";
import siteSettings from "./singletons/siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  /* Reusable objects */
  link,
  /* Singletons (one-per-site) */
  siteSettings,
  /* Pages (one-per-route) */
  homePage,
  aboutPage,
  servicesPage,
  projectsPage,
  careersPage,
  sustainabilityPage,
  contactPage,
  /* Reusable sections */
  testimonialsSection,
  partnersSection,
  /* Collections */
  project,
  projectCategory,
  teamMember,
  expertise,
  testimonial,
  partner,
  vacancy,
];
