/**
 * Discard stale singleton drafts
 * ==============================
 * The seed scripts write the page + Site Settings singletons as
 * *published* documents. But stale, near-empty *drafts* left over
 * from earlier Studio poking can sit on top — and the Studio always
 * shows the draft when one exists, so the seeded content looks
 * "missing" even though it's there in the published doc.
 *
 * This deletes those draft versions so the Studio shows the seeded
 * published docs. It prints a gist of each draft before deleting,
 * so you can see exactly what's being discarded. Docs with no draft
 * are skipped — safe to run any time.
 *
 * Run this AFTER the seed scripts.
 *
 * Usage (PowerShell):
 *   $env:SANITY_WRITE_TOKEN="<editor token>"
 *   node ./scripts/discard-drafts.mjs
 */

import { createClient } from "@sanity/client";

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

/* The singletons the seed scripts populate. */
const ids = [
  "siteSettings",
  "homePage",
  "aboutPage",
  "servicesPage",
  "projectsPage",
  "contactPage",
  "careersPage",
  "sustainabilityPage",
];

let discarded = 0;

console.log("\nChecking for stale singleton drafts…\n");

for (const id of ids) {
  const draftId = `drafts.${id}`;
  try {
    const draft = await client.fetch("*[_id == $id][0]", { id: draftId });

    if (!draft) {
      console.log(`  ↷ ${id} — no draft, nothing to discard`);
      continue;
    }

    /* A quick gist of what's in the draft so it's clear what's
       being thrown away — different doc types title themselves
       differently, so fall through a few likely fields. */
    const gist =
      draft.heroTitle ??
      draft.heroHeading ??
      draft.heroStatement ??
      draft.heading ??
      draft.brandName ??
      "(no title-ish field)";

    await client.delete(draftId);
    console.log(`  ✓ ${id} — discarded draft (was: "${gist}")`);
    discarded += 1;
  } catch (err) {
    console.error(`  ✘ ${id} — failed: ${err.message}`);
  }
}

console.log(
  `\nDone — discarded ${discarded} stale draft(s). Refresh /studio: the ` +
    `pages now show their seeded published content.`,
);
