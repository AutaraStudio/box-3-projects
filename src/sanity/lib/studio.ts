/**
 * Sanity Studio Configuration
 * ===========================
 * Defines the embedded Sanity Studio config served at /studio.
 * Connects to the live Box 3 dataset (project ID uwutffn5,
 * dataset production).
 *
 * Plugins:
 *   - structureTool — the default sidebar / list / detail UI
 *   - visionTool    — GROQ playground for query iteration (dev aid)
 */

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { schemaTypes } from "../schemas";
import { projectId, dataset, apiVersion } from "./client";

export default defineConfig({
  name: "box-3-projects",
  title: "Box 3 Projects",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool(), visionTool({ defaultApiVersion: apiVersion })],
  schema: {
    types: schemaTypes,
  },
});
