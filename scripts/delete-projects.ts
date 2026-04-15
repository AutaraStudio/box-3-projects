/*
 * Delete All Projects
 * ===================
 * One-off helper: removes every `project` document from the dataset,
 * including drafts. Safe to re-run — it only touches documents whose
 * _type is "project".
 *
 * Usage: npx tsx scripts/delete-projects.ts
 */

import { createClient } from "@sanity/client";
import { config as loadEnv } from "dotenv";
import path from "node:path";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env vars. Need NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

async function run() {
  const ids = await client.fetch<string[]>(`*[_type == "project"]._id`);
  if (ids.length === 0) {
    console.log("No project documents found. Nothing to delete.");
    return;
  }

  console.log(`Found ${ids.length} project documents. Deleting…`);

  const transaction = client.transaction();
  for (const id of ids) {
    transaction.delete(id);
  }
  await transaction.commit();

  console.log(`Deleted ${ids.length} project documents.`);
}

run().catch((error) => {
  console.error("Delete failed:", error);
  process.exit(1);
});
