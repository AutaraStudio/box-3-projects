/*
 * Cleanup Imageless
 * =================
 * Deletes every `project` document with no `featuredImage` AND no
 * populated `additionalImages`, and every `teamMember` document
 * with no `image`. Before deleting, detaches any incoming
 * references so Sanity doesn't reject the mutation.
 *
 * Detach strategy:
 *   - Imageless project: remove its entry from
 *     `featuredProjectsSection.projects[]` before delete. If any
 *     other doc references it, swap to a patchable replacement or
 *     log and skip.
 *   - Imageless team member: remove its entry from every
 *     `project.team[]` array that references it.
 *
 * Destructive — re-running is safe: once all imageless docs are
 * gone, the queries return empty and nothing happens.
 *
 * Usage:
 *   npx tsx scripts/cleanup-imageless.ts
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
  console.error("Missing env vars in .env.local.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

interface Orphan {
  _id: string;
  title?: string;
  name?: string;
}

async function main() {
  /* ── 1. Imageless projects ─────────────────────────────────── */

  const imagelessProjects = await client.fetch<Orphan[]>(
    `*[_type == "project"
        && !defined(featuredImage.asset)
        && (!defined(additionalImages) || count(additionalImages[defined(asset)]) == 0)
      ]{_id, title}`,
  );

  console.log(`Found ${imagelessProjects.length} imageless project(s).`);

  for (const p of imagelessProjects) {
    /* Detach from featuredProjectsSection.projects[] */
    try {
      await client
        .patch("featuredProjectsSection")
        .unset([`projects[_ref=="${p._id}"]`])
        .commit();
    } catch {
      /* ignore if the singleton doesn't exist or didn't reference it */
    }

    /* Attempt delete — if something else still references it,
       Sanity will reject and we log + continue. */
    try {
      await client.delete(p._id);
      console.log(`✔ deleted project: ${p.title ?? p._id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(
        `⚠ skip project "${p.title ?? p._id}" — ${msg.slice(0, 140)}`,
      );
    }
  }

  /* ── 2. Imageless team members ─────────────────────────────── */

  const imagelessTeam = await client.fetch<Orphan[]>(
    `*[_type == "teamMember" && !defined(image.asset)]{_id, name}`,
  );

  console.log(
    `\nFound ${imagelessTeam.length} imageless team member(s).`,
  );

  for (const t of imagelessTeam) {
    /* Detach from every project.team[] that references this member. */
    const parents = await client.fetch<{ _id: string }[]>(
      `*[_type == "project" && references($id)]{_id}`,
      { id: t._id },
    );
    for (const parent of parents) {
      try {
        await client
          .patch(parent._id)
          .unset([`team[_ref=="${t._id}"]`])
          .commit();
      } catch {
        /* non-fatal */
      }
    }

    try {
      await client.delete(t._id);
      console.log(`✔ deleted team member: ${t.name ?? t._id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(
        `⚠ skip team member "${t.name ?? t._id}" — ${msg.slice(0, 140)}`,
      );
    }
  }

  /* ── 3. Re-seed featuredProjectsSection if it lost a ref ───── */

  const section = await client.fetch<{ projects?: unknown[] } | null>(
    '*[_id == "featuredProjectsSection"][0]{projects}',
  );
  const currentCount = section?.projects?.length ?? 0;
  if (currentCount < 3) {
    /* Top up to three featured projects with image-having ones. */
    const picks = await client.fetch<Array<{ _id: string }>>(
      `*[_type == "project" && defined(featuredImage.asset)] | order(year desc, title asc)[0...3]{_id}`,
    );
    if (picks.length > 0) {
      await client
        .patch("featuredProjectsSection")
        .set({
          projects: picks.map((p, i) => ({
            _key: `fp-${i}`,
            _type: "reference",
            _ref: p._id,
          })),
        })
        .commit();
      console.log(
        `\n✔ topped up featuredProjectsSection — now ${picks.length} project ref(s)`,
      );
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
