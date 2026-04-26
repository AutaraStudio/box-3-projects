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

import testimonialsSection from "./sections/testimonialsSection";

export const schemaTypes: SchemaTypeDefinition[] = [
  project,
  projectCategory,
  teamMember,
  expertise,
  testimonial,
  partner,
  testimonialsSection,
];
