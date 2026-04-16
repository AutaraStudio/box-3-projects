/*
 * Seed testimonials for the client's own Partner documents
 * =========================================================
 * Creates one dummy testimonial per client-added partner, then:
 *   • Attaches one featured testimonial to the homePage singleton
 *   • Rotates 2–3 testimonials across each existing project
 *
 * Partners are matched by exact name — add/adjust entries in
 * CLIENT_TESTIMONIALS below to match the names shown in Studio.
 * Anything listed in the array whose partner name doesn't resolve
 * to a real Partner doc is skipped with a warning.
 *
 * Idempotent: re-running checks for an existing testimonial with
 * the same author before creating. Pass `--refresh-attachments` to
 * overwrite testimonialsSection on the home page and every project
 * with a fresh rotation drawn from the full testimonial pool — use
 * this after adding new partners so new quotes get picked up.
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

/* --------------------------------------------------------------------------
   Testimonial seed data — one per client partner
   --------------------------------------------------------------------------
   Quotes are editorially generic (craft, programme, partnership, trust)
   so they read naturally against a fit-out brand and can sit on any
   project. Authors + titles are fictional placeholders the client will
   replace with real attributions. */

type SeedTestimonial = {
  partnerName: string;     // must match an existing Partner doc name
  quote: string;
  author: string;
  title: string;
};

const CLIENT_TESTIMONIALS: SeedTestimonial[] = [
  {
    partnerName: "Hart Dixon",
    quote:
      "\u201CBox 3 brought a level of detail and ownership to this project that I rarely see on a commercial fit-out. Every junction, every finish, every programme decision was considered — and the team they put on site ran the job like it was their own business.\u201D",
    author: "Eleanor Hart",
    title: "Director",
  },
  {
    partnerName: "Layer Pm",
    quote:
      "\u201CWe have run dozens of fit-outs across London and Box 3 are in a category of their own. Transparent cost reporting every week, no surprises at the final account, and a programme that never slipped. Exactly the partner we want on every project.\u201D",
    author: "Daniel Okafor",
    title: "Senior Project Manager",
  },
  {
    partnerName: "Partners Capital",
    quote:
      "\u201COur brief was demanding — a front-of-house worthy of our clients, delivered around a live trading floor with zero disruption. Box 3 delivered on every count. Calm, considered, and the finished space genuinely lifts the room.\u201D",
    author: "Rachel Mortimer",
    title: "Head of Workplace",
  },
  {
    partnerName: "Warner Music",
    quote:
      "\u201CThe craftsmanship across every detail — the joinery, the acoustic treatments, the bespoke lighting — is the best I have seen on a project of this scale. Box 3 are the only contractor we will be using going forward.\u201D",
    author: "Priya Banerjee",
    title: "Director of Real Estate",
  },
  {
    partnerName: "Mastercard",
    quote:
      "\u201CA workspace that had to carry a global brand and feel unmistakably ours from the moment anyone walked in. Box 3 understood that from day one. The result is a space the team are genuinely proud to bring clients into.\u201D",
    author: "Jordan Ellis",
    title: "Head of Real Estate, EMEA",
  },
  {
    partnerName: "Meta",
    quote:
      "\u201CThe pace at which Box 3 moved without dropping quality was remarkable. They delivered a 25,000 sq ft workplace for us across two floors in under twelve weeks, and the handover was the cleanest I have ever been part of.\u201D",
    author: "Helena Strand",
    title: "Workplace Programme Lead",
  },
  {
    partnerName: "Nike",
    quote:
      "\u201CWe needed a retail environment that felt crafted rather than installed — every material, every detail, every transition considered. Box 3 delivered that end-to-end, and the store has outperformed every benchmark since opening.\u201D",
    author: "Marcus Liang",
    title: "Global Retail Concept Lead",
  },
  {
    partnerName: "Hugo Boss",
    quote:
      "\u201CWorking with Box 3 felt like an extension of our own team from day one. They held us to a higher standard on quality than we held ourselves — and delivered the store on time, on budget, and without a single snag we had to chase.\u201D",
    author: "Sofia Alvarez",
    title: "Head of Retail Projects",
  },
];

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

async function resolvePartnerIds(
  seeds: SeedTestimonial[],
): Promise<Map<string, string>> {
  const names = Array.from(new Set(seeds.map((s) => s.partnerName)));
  const docs = await client.fetch<Array<{ _id: string; name: string }>>(
    `*[_type == "partner" && name in $names]{ _id, name }`,
    { names },
  );
  const map = new Map<string, string>();
  for (const d of docs) map.set(d.name, d._id);
  return map;
}

/* --------------------------------------------------------------------------
   Seed
   -------------------------------------------------------------------------- */

async function seedTestimonialDocs(
  partnerIds: Map<string, string>,
): Promise<string[]> {
  const created: string[] = [];
  const existing = await client.fetch<Array<{ _id: string; author: string }>>(
    `*[_type == "testimonial"]{ _id, author }`,
  );
  const authorToId = new Map<string, string>();
  for (const doc of existing) authorToId.set(doc.author, doc._id);

  for (const t of CLIENT_TESTIMONIALS) {
    const partnerId = partnerIds.get(t.partnerName);
    if (!partnerId) {
      console.warn(
        `⚠ no Partner doc for "${t.partnerName}" — skipping "${t.author}"`,
      );
      continue;
    }

    const existingId = authorToId.get(t.author);
    if (existingId) {
      console.log(`↷ testimonial "${t.author}" already exists — skipping`);
      created.push(existingId);
      continue;
    }

    const doc = await client.create({
      _type: "testimonial",
      quote: t.quote,
      author: t.author,
      title: t.title,
      partner: { _type: "reference", _ref: partnerId },
    });
    created.push(doc._id);
    console.log(`✔ created testimonial "${t.author}" (${t.partnerName})`);
  }

  return created;
}

async function attachToHomePage(
  testimonialIds: string[],
  refresh: boolean,
): Promise<void> {
  if (testimonialIds.length === 0) return;
  const current = await client.fetch<{
    testimonialsSection?: { testimonials?: unknown[] } | null;
  } | null>('*[_id == "homePage"][0]{testimonialsSection}');

  if (
    !refresh &&
    current?.testimonialsSection?.testimonials &&
    current.testimonialsSection.testimonials.length > 0
  ) {
    console.log(`↷ homePage already has testimonials — leaving alone`);
    return;
  }

  /* Feature one testimonial on the home page — the last one in the
     seed array, which gives a high-end real-estate quote. */
  const featuredId = testimonialIds[testimonialIds.length - 1];

  await client
    .patch("homePage")
    .set({
      testimonialsSection: {
        sectionLabel: "Testimonials",
        reference: "[BOX3.1]",
        testimonials: [{ _key: "hp-t-0", _type: "reference", _ref: featuredId }],
      },
    })
    .commit();
  console.log(`✔ attached 1 testimonial to homePage`);
}

async function attachToProjects(
  testimonialIds: string[],
  refresh: boolean,
): Promise<void> {
  if (testimonialIds.length === 0) return;

  const projects = await client.fetch<
    Array<{
      _id: string;
      title: string;
      testimonialsSection?: { testimonials?: unknown[] } | null;
    }>
  >(
    `*[_type == "project"] | order(title asc){_id, title, testimonialsSection}`,
  );

  let patched = 0;
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const hasAny =
      p.testimonialsSection?.testimonials &&
      p.testimonialsSection.testimonials.length > 0;
    if (hasAny && !refresh) continue;

    const count = Math.min(testimonialIds.length, 2 + (i % 2));
    const refs = Array.from({ length: count }, (_, j) => {
      const id = testimonialIds[(i + j) % testimonialIds.length];
      return {
        _key: `pr-t-${j}`,
        _type: "reference" as const,
        _ref: id,
      };
    });

    const reference = `[BOX3.${String(i + 1).padStart(2, "0")}]`;

    await client
      .patch(p._id)
      .set({
        testimonialsSection: {
          sectionLabel: "Testimonials",
          reference,
          testimonials: refs,
        },
      })
      .commit();
    patched += 1;
  }

  if (patched > 0) {
    console.log(`✔ attached testimonials to ${patched} project(s)`);
  } else {
    console.log(`↷ all projects already have testimonials — skipping`);
  }
}

/* --------------------------------------------------------------------------
   Main
   -------------------------------------------------------------------------- */

async function main() {
  const refresh = process.argv.includes("--refresh-attachments");

  const partnerIds = await resolvePartnerIds(CLIENT_TESTIMONIALS);
  if (partnerIds.size === 0) {
    console.error(
      "✘ none of the partner names resolved — is the Partner collection populated?",
    );
    process.exit(1);
  }

  const ids = await seedTestimonialDocs(partnerIds);
  await attachToHomePage(ids, refresh);
  await attachToProjects(ids, refresh);

  console.log(
    refresh
      ? "\nDone (attachments refreshed across home + projects)."
      : "\nDone.",
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
