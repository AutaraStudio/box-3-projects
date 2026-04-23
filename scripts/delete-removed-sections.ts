/*
 * Delete Removed Section Documents
 * ================================
 * One-off cleanup: removes every document whose `_type` is
 * `homeIntroSection`, `ourApproachSection`, or `approachHeaderSection`
 * (plus their drafts) from the dataset. These section types were
 * removed from the codebase and their orphaned singletons are no
 * longer reachable from the Studio.
 *
 * Safe to re-run — it only touches documents of those three types.
 *
 * Usage: npx tsx scripts/delete-removed-sections.ts
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

const TYPES = [
  "homeIntroSection",
  "ourApproachSection",
  "approachHeaderSection",
] as const;

async function run() {
  const ids = await client.fetch<string[]>(
    `*[_type in $types]._id`,
    { types: TYPES as unknown as string[] },
  );

  if (ids.length === 0) {
    console.log("No matching documents found. Nothing to delete.");
    return;
  }

  console.log(`Found ${ids.length} document(s). Deleting…`);
  for (const id of ids) console.log(`  - ${id}`);

  const transaction = client.transaction();
  for (const id of ids) {
    transaction.delete(id);
  }
  await transaction.commit();

  console.log(`Deleted ${ids.length} document(s).`);
}

run().catch((error) => {
  console.error("Delete failed:", error);
  process.exit(1);
});
