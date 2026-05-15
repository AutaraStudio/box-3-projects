/**
 * Seed project orderRank
 * ======================
 * One-shot backfill — assigns an `orderRank` (the hidden field
 * managed by @sanity/orderable-document-list) to every existing
 * project that doesn't already have one. Without this, the
 * drag-and-drop list view in the Studio shows unranked projects in
 * an undefined position and the frontend's `order(orderRank asc)`
 * has nothing to sort against.
 *
 * Initial order matches what the site used before the switch:
 * year desc, then title asc — so the first run produces zero
 * visible reshuffle. After this, the editor takes over by dragging
 * rows in Studio → Projects.
 *
 * Idempotent: projects that already have an `orderRank` are left
 * alone. Safe to re-run.
 *
 * Usage (PowerShell):
 *   $env:SANITY_WRITE_TOKEN="<editor token>"
 *   node ./scripts/seed-project-order.mjs
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

console.log("\nLoading projects…");

const projects = await client.fetch(
  `*[_type == "project"] | order(year desc, title asc) {
     _id, title, year, orderRank
   }`,
);

console.log(`  ${projects.length} project(s) found.`);

const unranked = projects.filter((p) => typeof p.orderRank !== "string");

if (unranked.length === 0) {
  console.log("\nEvery project already has an orderRank — nothing to do.");
  process.exit(0);
}

/* Walk LexoRank.middle() → genNext() → genNext() … so the first
   project (year desc top) gets the smallest rank and sorts first
   under `order(orderRank asc)`. Plenty of headroom either side
   for the editor to drag later. */
let rank = LexoRank.middle();

console.log(
  `\nAssigning orderRank to ${unranked.length} unranked project(s) ` +
    `(year desc, title asc)…\n`,
);

let patched = 0;
for (const p of unranked) {
  try {
    await client.patch(p._id).set({ orderRank: rank.toString() }).commit();
    console.log(`  ✓ ${p.title} (${p.year}) → ${rank.toString()}`);
    rank = rank.genNext();
    patched += 1;
  } catch (err) {
    console.error(`  ✘ ${p.title} — failed: ${err.message}`);
  }
}

console.log(
  `\nDone — ranked ${patched} project(s). Open the Studio at /studio ` +
    `→ Projects to drag rows into the order you want.`,
);
