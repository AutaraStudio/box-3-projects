/**
 * Migrate links to the Internal page dropdown
 * ===========================================
 * Walks every link field on every singleton, and for each link
 * whose `href` matches a known internal page (e.g. "/about"),
 * moves the value into the new `internalPage` dropdown field and
 * clears `href`. Links that point at external URLs / mailto: /
 * tel: / in-page anchors are left untouched.
 *
 * Run once after deploying the new `link` schema. Safe to re-run —
 * idempotent: links already on the dropdown are skipped.
 *
 * Both published docs AND their drafts are migrated, so the editor
 * sees a consistent view in the Studio.
 *
 * Usage (PowerShell):
 *   $env:SANITY_WRITE_TOKEN="<editor token>"
 *   node ./scripts/migrate-links-to-dropdown.mjs
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

/* The set of internal hrefs that should move into internalPage.
   Mirrors INTERNAL_PAGES in src/sanity/schemas/objects/link.ts. */
const INTERNAL_HREFS = new Set([
  "/",
  "/about",
  "/services",
  "/projects",
  "/careers",
  "/sustainability",
  "/contact",
]);

/* Every doc + field we need to walk. The shape is:
   { id, links: [...object link field names], arrays: [...array link field names] } */
const TARGETS = [
  {
    id: "siteSettings",
    links: [],
    arrays: [
      "headerPrimaryLinks",
      "headerSecondaryLinks",
      "menuPrimaryLinks",
      "menuMoreLinks",
      "footerPages",
      "footerSocial",
      "footerLegal",
    ],
  },
  {
    id: "homePage",
    links: [
      "heroCta",
      "statementCta",
      "introducingCta",
      "servicesCta",
      "whyCta",
      "finalCtaButton",
    ],
    arrays: [],
  },
  {
    id: "aboutPage",
    links: ["heroCta", "closingCta"],
    arrays: [],
  },
  {
    id: "servicesPage",
    links: ["heroCta", "servicesCta", "editorialCta"],
    arrays: [],
  },
];

/* Returns a transformed copy of a single link object — or null if
   nothing needed to change. */
function transformLink(link) {
  if (!link || typeof link !== "object") return null;
  /* Already on the dropdown — nothing to do. */
  if (link.internalPage) return null;
  const href = typeof link.href === "string" ? link.href.trim() : "";
  if (!href || !INTERNAL_HREFS.has(href)) return null;
  const next = { ...link, internalPage: href };
  delete next.href;
  return next;
}

let totalChanged = 0;
let totalDocs = 0;

/* Walk a single doc (published or draft). Mutates the in-memory
   copy and returns true if anything changed. */
function walkDoc(doc, target) {
  let changed = false;

  for (const fieldName of target.links) {
    const transformed = transformLink(doc[fieldName]);
    if (transformed) {
      doc[fieldName] = transformed;
      changed = true;
    }
  }

  for (const arrayName of target.arrays) {
    const arr = doc[arrayName];
    if (!Array.isArray(arr)) continue;
    const nextArr = arr.map((item) => transformLink(item) ?? item);
    /* Only count as changed if at least one entry transformed. */
    const arrChanged = nextArr.some((item, i) => item !== arr[i]);
    if (arrChanged) {
      doc[arrayName] = nextArr;
      changed = true;
    }
  }

  return changed;
}

console.log("\nMigrating internal-page links to the dropdown…\n");

for (const target of TARGETS) {
  const ids = [target.id, `drafts.${target.id}`];
  const docs = await client.fetch(`*[_id in $ids]`, { ids });
  if (!docs.length) {
    console.log(`  ↷ ${target.id} — no doc, nothing to migrate`);
    continue;
  }

  for (const doc of docs) {
    totalDocs += 1;
    const variant = doc._id.startsWith("drafts.") ? "draft" : "published";
    const changed = walkDoc(doc, target);
    if (!changed) {
      console.log(`  ↷ ${doc._id} (${variant}) — no internal hrefs to convert`);
      continue;
    }

    try {
      await client.createOrReplace(doc);
      totalChanged += 1;
      console.log(`  ✓ ${doc._id} (${variant}) — links migrated`);
    } catch (err) {
      console.error(`  ✘ ${doc._id} (${variant}) — failed: ${err.message}`);
    }
  }
}

console.log(
  `\nDone — scanned ${totalDocs} doc(s), migrated ${totalChanged}.`,
);
