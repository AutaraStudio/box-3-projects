/*
 * Sanitize partnersSection.partners
 * =================================
 * Over the course of the partners-to-collection refactor, some array
 * items in `partnersSection.partners` ended up carrying both a `_ref`
 * (reference shape) AND stray `logo`/`name` fields (inline shape).
 * Sanity rejects that on save with:
 *
 *   Mutation failed: Key "logo" not allowed in ref
 *
 * This script reads the current array, strips every entry down to
 * its pure reference shape (`_key`, `_type: "reference"`, `_ref`),
 * drops entries whose `_ref` no longer resolves to a Partner doc,
 * and writes the cleaned array back.
 *
 * Usage: npx tsx scripts/fix-partners-section.ts
 */

import { createClient } from "@sanity/client";
import { config as loadEnv } from "dotenv";
import path from "node:path";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

interface PartnerEntry {
  _key?: string;
  _type?: string;
  _ref?: string;
  [key: string]: unknown;
}

async function processDoc(id: string, label: string): Promise<void> {
  const doc = await client.fetch<{ partners?: PartnerEntry[] } | null>(
    `*[_id == $id][0]{partners}`,
    { id },
  );

  if (!doc?.partners || doc.partners.length === 0) {
    console.log(`↷ ${label}: no partners array — skipping`);
    return;
  }

  /* Resolve which partner IDs still exist so we can drop dangling refs. */
  const existingIds = new Set(
    await client.fetch<string[]>(`*[_type == "partner"]._id`),
  );

  const cleaned: Array<{ _key: string; _type: "reference"; _ref: string }> = [];
  const dropped: PartnerEntry[] = [];

  for (let i = 0; i < doc.partners.length; i++) {
    const entry = doc.partners[i];
    const ref = typeof entry._ref === "string" ? entry._ref : undefined;
    if (!ref) {
      /* Inline object (no _ref) — we're past the inline era. Drop it. */
      dropped.push(entry);
      continue;
    }
    if (!existingIds.has(ref)) {
      /* Reference points at a deleted partner — drop it. */
      dropped.push(entry);
      continue;
    }
    cleaned.push({
      _key: entry._key ?? `p-${i}`,
      _type: "reference",
      _ref: ref,
    });
  }

  await client.patch(id).set({ partners: cleaned }).commit();

  console.log(
    `✔ ${label}: rewrote partners (${cleaned.length} kept, ${dropped.length} dropped)`,
  );
  if (dropped.length > 0) {
    for (const d of dropped) {
      console.log(`   · dropped: ${JSON.stringify(d)}`);
    }
  }
}

async function main() {
  /* Patch both the published doc and any draft the Studio has open
     — otherwise the error resurfaces as soon as the client saves. */
  await processDoc("partnersSection", "partnersSection (published)");
  await processDoc("drafts.partnersSection", "partnersSection (draft)");
  console.log("\nDone. Reload Studio to pick up the cleaned array.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
