/**
 * Sanity Studio Configuration
 * ===========================
 * Defines the embedded Sanity Studio config served at /studio.
 * Connects to the live Box 3 dataset (project ID uwutffn5,
 * dataset production).
 *
 * Plugins:
 *   - structureTool       — sidebar / list / detail UI driven by the
 *                           custom structure in lib/structure.ts
 *   - visionTool          — GROQ playground for query iteration
 *   - sanity-plugin-media — media library with tag-based organisation;
 *                           feeds the TaggedMediaPicker inputs and the
 *                           BulkTaggedUploaderTool
 *
 * Custom tools:
 *   - bulk-upload — pick/create a tag, drop a folder of images, every
 *                   uploaded asset is auto-tagged so the client never
 *                   has to select-all-and-tag after the fact.
 *
 * Singleton handling:
 *   - SINGLETON_TYPE_SET (from lib/structure.ts) lists doc types that
 *     should exist as one-per-site.
 *   - We strip "duplicate" / "delete" / "unpublish" actions on those
 *     types and hide them from "Create new" menus so a client can
 *     never accidentally remove a site-wide singleton.
 */

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { media } from "sanity-plugin-media";

import BulkTaggedUploaderTool from "../components/BulkTaggedUploaderTool";
import { schemaTypes } from "../schemas";
import { projectId, dataset, apiVersion } from "./client";
import { structure, SINGLETON_TYPE_SET } from "./structure";

export default defineConfig({
  name: "box-3-projects",
  title: "Box 3 Projects",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    media(),
  ],
  schema: {
    types: schemaTypes,
  },
  /* Custom Studio tools — appear in the top nav alongside Structure /
     Media / Vision. */
  tools: (prev) => [
    ...prev,
    {
      name: "bulk-upload",
      title: "Bulk Upload",
      component: BulkTaggedUploaderTool,
    },
  ],
  document: {
    /* Strip duplicate / delete / unpublish on singletons so the
       client can't accidentally remove site-wide content. */
    actions: (input, context) =>
      SINGLETON_TYPE_SET.has(context.schemaType)
        ? input.filter(
            ({ action }) =>
              action && !["duplicate", "delete", "unpublish"].includes(action),
          )
        : input,
    /* Hide singletons from "Create new" menus — they're created
       implicitly via S.document().documentId(...) in the structure. */
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter(
            (template) => !SINGLETON_TYPE_SET.has(template.templateId),
          )
        : prev,
  },
});
