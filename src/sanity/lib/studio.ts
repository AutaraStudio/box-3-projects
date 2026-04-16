/**
 * Sanity Studio Configuration
 * ===========================
 * Defines the embedded Sanity Studio configuration for Next.js.
 * The Studio is served at /studio via the catch-all route.
 */

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { media } from "sanity-plugin-media";

import BulkTaggedUploaderTool from "../components/BulkTaggedUploaderTool";
import { schemaTypes } from "../schemas";
import { projectId, dataset } from "./client";
import { structure } from "./structure";

/** Document types that are singletons — hide "Create new" and delete actions. */
const SINGLETON_TYPES = new Set([
  "homePage",
  "careersPage",
  "contactPage",
  "partnersSection",
  "ourApproachSection",
  "bannerShowroom",
  "featuredProjectsSection",
  "siteNav",
  "siteFooter",
]);

export default defineConfig({
  name: "box-3-projects",
  title: "box-3-projects",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool({ structure }), media()],
  schema: {
    types: schemaTypes,
  },
  /* Custom Studio tools — appear in the top nav alongside Structure / Media. */
  tools: (prev) => [
    ...prev,
    {
      name: "bulk-upload",
      title: "Bulk Upload",
      component: BulkTaggedUploaderTool,
    },
  ],
  document: {
    /* Remove "duplicate" and "delete" actions on singletons. */
    actions: (input, context) =>
      SINGLETON_TYPES.has(context.schemaType)
        ? input.filter(
            ({ action }) =>
              action && !["duplicate", "delete", "unpublish"].includes(action),
          )
        : input,
    /* Hide singletons from "Create new" menus. */
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter((template) => !SINGLETON_TYPES.has(template.templateId))
        : prev,
  },
});
