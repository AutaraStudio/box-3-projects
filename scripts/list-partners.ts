/*
 * List all partner documents with their _id, name, and slug.
 * Used for one-off introspection when we need the client's own
 * partner list before generating matching testimonials.
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

async function main() {
  const partners = await client.fetch<
    Array<{ _id: string; name: string; slug?: { current?: string } }>
  >(`*[_type == "partner"] | order(name asc){ _id, name, slug }`);

  console.log(`Found ${partners.length} partner doc(s):\n`);
  for (const p of partners) {
    const name = (p.name ?? "(no name)").padEnd(28);
    const slug = (p.slug?.current ?? "—").padEnd(28);
    console.log(`  • ${name}  ${slug}  ${p._id}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
