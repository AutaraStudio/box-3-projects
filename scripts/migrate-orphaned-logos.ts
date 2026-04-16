/*
 * Migrate orphaned SVG uploads to the right Partner docs
 * =======================================================
 * When partnersSection.partners was still inline, the client
 * uploaded logo SVGs onto each array item. After the refactor to
 * references those array items were dropped (see
 * fix-partners-section.ts), but the underlying file assets in
 * Sanity's asset store were retained.
 *
 * This script re-attaches each orphaned file asset to the matching
 * Partner document by name, so the logos appear correctly without
 * the client having to re-upload anything.
 *
 * Idempotent: only patches a Partner doc that currently has no
 * logo set. Names are matched case-insensitively; supply synonyms
 * in NAME_MAP where the legacy label doesn't match the current
 * Partner doc's name exactly.
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

/* Dropped inline entries captured from the fix-partners-section run.
   Each pair: { legacy label the client used, file asset _ref }. */
const ORPHANED: Array<{ name: string; assetRef: string }> = [
  {
    name: "Hugo Boss",
    assetRef: "file-4ec88365679b60dde9b2b2433bf1df2c0c2fc248-svg",
  },
  {
    name: "Meta",
    assetRef: "file-c8625fbe339042a10d1c8f430f38db9e2bedc06c-svg",
  },
  {
    name: "Warner Music Group",
    assetRef: "file-61b17c16b3363e020567fa6f0d78f2ac99a80564-svg",
  },
  {
    name: "Mastercard",
    assetRef: "file-7be62cd23b6560a60bcc61e4202395c274430382-svg",
  },
  {
    name: "Layer",
    assetRef: "file-c8126f6e8e3432ab172434912fe9f2e13cbf09c5-svg",
  },
  {
    name: "Hart Dixon",
    assetRef: "file-3c2146a95b29fde77f9e52bc647cf8072874f5cd-svg",
  },
  {
    name: "Partners Capital",
    assetRef: "file-53a74546e8f70afce2568bd2d5e5e5336357a41c-svg",
  },
];

/* Legacy label → current Partner doc name. Add entries here when
   the client's original upload label doesn't match the current
   partner name exactly. */
const NAME_MAP: Record<string, string> = {
  "Warner Music Group": "Warner Music",
  Layer: "Layer Pm",
};

function normalise(s: string): string {
  return s.trim().toLowerCase();
}

async function main() {
  const partners = await client.fetch<Array<{ _id: string; name: string; logo?: unknown }>>(
    `*[_type == "partner"]{ _id, name, logo }`,
  );
  const byName = new Map<string, { _id: string; hasLogo: boolean }>();
  for (const p of partners) {
    byName.set(normalise(p.name ?? ""), {
      _id: p._id,
      hasLogo: Boolean(p.logo),
    });
  }

  let attached = 0;
  let skippedHasLogo = 0;
  let skippedNoPartner = 0;

  for (const { name, assetRef } of ORPHANED) {
    const target = NAME_MAP[name] ?? name;
    const found = byName.get(normalise(target));
    if (!found) {
      console.warn(
        `⚠ no Partner doc named "${target}" — leaving ${assetRef} orphaned`,
      );
      skippedNoPartner += 1;
      continue;
    }
    if (found.hasLogo) {
      console.log(`↷ "${target}" already has a logo — skipping`);
      skippedHasLogo += 1;
      continue;
    }

    await client
      .patch(found._id)
      .set({
        logo: {
          _type: "file",
          asset: { _type: "reference", _ref: assetRef },
        },
      })
      .commit();

    console.log(`✔ attached logo to "${target}"`);
    attached += 1;
  }

  console.log(
    `\nDone — attached ${attached}, skipped ${skippedHasLogo} (already had logo), missed ${skippedNoPartner} (no matching partner).`,
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
