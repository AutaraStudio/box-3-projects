/**
 * Sanity Studio Configuration
 * ===========================
 * Defines the embedded Sanity Studio configuration for Next.js.
 * The Studio is served at /studio via the catch-all route.
 */

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes } from "../schemas";
import { projectId, dataset } from "./client";

export default defineConfig({
  name: "box-3-projects",
  title: "box-3-projects",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
