/*
 * List Media Tags
 * ===============
 * Prints every `media.tag` document currently in the dataset along
 * with the number of image assets that reference it.
 *
 * Usage: npx tsx scripts/list-tags.ts
 */

import { createClient } from "@sanity/client";
import { config as loadEnv } from "dotenv";
import path from "node:path";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01",
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
});

type TagRow = { _id: string; name: string; count: number };

async function run() {
  const tags = await client.fetch<TagRow[]>(
    `*[_type == "media.tag"]{
      _id,
      "name": name.current,
      "count": count(*[_type == "sanity.imageAsset" && references(^._id)])
    } | order(name asc)`,
  );

  if (tags.length === 0) {
    console.log("No media tags found.");
    return;
  }

  for (const tag of tags) {
    console.log(`${tag.name.padEnd(40)}  ${tag.count} image(s)`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
