/**
 * Seed partner orderRank
 * ======================
 * One-shot backfill — assigns an `orderRank` (the hidden field
 * managed by @sanity/orderable-document-list) to every existing
 * partner that doesn't already have one. Without this, the
 * drag-and-drop list view in the Studio shows unranked partners
 * in an undefined position and the frontend's `order(orderRank asc)`
 * has nothing to sort against.
 *
 * Initial order is name asc — alphabetical — so the first run
 * produces a sensible default that the editor can then drag into
 * the preferred order.
 *
 * Idempotent: partners that already have an `orderRank` are left
 * alone. Safe to re-run.
 *
 * Usage (PowerShell):
 *   $env:SANITY_WRITE_TOKEN="<editor token>"
 *   node ./scripts/seed-partner-order.mjs
 */

import { createClient } from "@sanity/client";
import { LexoRank } from "lexorank";

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  console.error(
    "Set SANITY_WRITE_TOKEN to a token with editor permissions and re-run.",
  );
  process.exit(1);
}

const client = createClient({
  projectId: "uwutffn5",
  dataset: "production",
  apiVersion: "2024-12-01",
  useCdn: false,
  token,
});

console.log("\nLoading partners…");

const partners = await client.fetch(
  `*[_type == "partner"] | order(name asc) {
     _id, name, orderRank
   }`,
);

console.log(`  ${partners.length} partner(s) found.`);

const unranked = partners.filter((p) => typeof p.orderRank !== "string");

if (unranked.length === 0) {
  console.log("\nEvery partner already has an orderRank — nothing to do.");
  process.exit(0);
}

let rank = LexoRank.middle();

console.log(
  `\nAssigning orderRank to ${unranked.length} unranked partner(s) (alphabetical)…\n`,
);

let patched = 0;
for (const p of unranked) {
  try {
    await client.patch(p._id).set({ orderRank: rank.toString() }).commit();
    console.log(`  ✓ ${p.name} → ${rank.toString()}`);
    rank = rank.genNext();
    patched += 1;
  } catch (err) {
    console.error(`  ✘ ${p.name} — failed: ${err.message}`);
  }
}

console.log(
  `\nDone — ranked ${patched} partner(s). Open the Studio at /studio ` +
    `→ Partners to drag rows into the order you want for the marquee.`,
);
