/*
 * Cleanup — duplicates created by an accidental full seed run
 * =============================================================
 * Deletes the exact team members and projects that `npm run seed`
 * created on top of the user's own content. Target lists are
 * frozen here so this script is safe to re-run; it fetches by
 * name/slug, logs what it finds, and deletes only those matches.
 *
 * Usage: npx tsx scripts/cleanup-seed-dupes.ts
 */

import { createClient } from "@sanity/client";
import { config as loadEnv } from "dotenv";
import path from "node:path";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "Missing env vars (NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET / SANITY_API_TOKEN).",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const TEAM_NAMES = [
  "James Whitfield",
  "Sarah Chen",
  "Marcus Reid",
  "Priya Sharma",
];

const PROJECT_TITLES = [
  "Chelsea Private Residence",
  "The Clerkenwell Members Club",
  "Knightsbridge Flagship Retail",
  "Fitzrovia Boutique Hotel Rooms",
  "Islington Residential Conversion",
  "Greenwich Waterfront Restaurant",
  "Mayfair Private Members Gym",
];

const PARTNER_NAMES = [
  "Nike",
  "Hugo Boss",
  "Meta",
  "Warner Music Group",
  "Mastercard",
  "Gensler",
  "Skanska",
  "Walmart",
];

const TESTIMONIAL_AUTHORS = [
  "Alex Hanks",
  "Rachel Mortimer",
  "Jordan Ellis",
  "Priya Banerjee",
  "Daniel Okafor",
  "Helena Strand",
];

async function main(): Promise<void> {
  /* ── Team members ─────────────────────────────────────────── */
  const teamDocs = await client.fetch<Array<{ _id: string; name: string }>>(
    `*[_type == "teamMember" && name in $names]{ _id, name }`,
    { names: TEAM_NAMES },
  );

  if (teamDocs.length === 0) {
    console.log("↷ no matching teamMember docs — skipping");
  } else {
    console.log(
      `Deleting ${teamDocs.length} teamMember doc(s): ${teamDocs.map((d) => d.name).join(", ")}`,
    );
    for (const doc of teamDocs) {
      try {
        await client.delete(doc._id);
        console.log(`✔ deleted teamMember "${doc.name}" (${doc._id})`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`✘ failed to delete "${doc.name}": ${message}`);
      }
    }
  }

  /* ── Projects ─────────────────────────────────────────────── */
  const projectDocs = await client.fetch<
    Array<{ _id: string; title: string; slug?: { current?: string } }>
  >(
    `*[_type == "project" && title in $titles]{ _id, title, slug }`,
    { titles: PROJECT_TITLES },
  );

  if (projectDocs.length === 0) {
    console.log("↷ no matching project docs — skipping");
  } else {
    console.log(
      `\nDeleting ${projectDocs.length} project doc(s): ${projectDocs.map((d) => d.title).join(", ")}`,
    );
  }

  for (const doc of projectDocs) {
    try {
      await client.delete(doc._id);
      console.log(`✔ deleted project "${doc.title}" (${doc._id})`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("referenced by")) {
        /* featuredProjectsSection or similar may still reference the
           doc. Unset inbound references then retry. */
        console.warn(
          `⚠ "${doc.title}" is referenced — clearing references then retrying…`,
        );
        try {
          await client
            .patch({ query: '*[references($id)]', params: { id: doc._id } })
            .unset(["projects[_ref==$id]"])
            .commit({ autoGenerateArrayKeys: true });
          await client.delete(doc._id);
          console.log(`✔ deleted project "${doc.title}" after unlinking`);
        } catch (err2) {
          const msg = err2 instanceof Error ? err2.message : String(err2);
          console.error(`✘ still could not delete "${doc.title}": ${msg}`);
        }
      } else {
        console.error(`✘ failed to delete "${doc.title}": ${message}`);
      }
    }
  }

  /* ── Testimonials ─────────────────────────────────────────── */
  const testimonialDocs = await client.fetch<
    Array<{ _id: string; author: string }>
  >(
    `*[_type == "testimonial" && author in $authors]{ _id, author }`,
    { authors: TESTIMONIAL_AUTHORS },
  );

  if (testimonialDocs.length === 0) {
    console.log("\n↷ no matching testimonial docs — skipping");
  } else {
    const testimonialIds = testimonialDocs.map((d) => d._id);

    /* Any parent doc (home page, project, etc.) that embeds a
       testimonialsSection referencing these testimonials must be
       cleared before we can delete them. Cleanest and safest pass:
       unset testimonialsSection on every homePage / project that
       mentions any of the ids. */
    try {
      const parents = await client.fetch<
        Array<{ _id: string; _type: string }>
      >(
        `*[
          (_type == "homePage" || _type == "project") &&
          count(testimonialsSection.testimonials[_ref in $ids]) > 0
        ]{_id, _type}`,
        { ids: testimonialIds },
      );
      for (const p of parents) {
        await client.patch(p._id).unset(["testimonialsSection"]).commit();
      }
      if (parents.length > 0) {
        console.log(
          `\n✔ unset testimonialsSection on ${parents.length} parent doc(s)`,
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `✘ failed to unset parent testimonialsSection fields: ${message}`,
      );
    }

    console.log(
      `\nDeleting ${testimonialDocs.length} testimonial doc(s): ${testimonialDocs
        .map((d) => d.author)
        .join(", ")}`,
    );
    for (const doc of testimonialDocs) {
      try {
        await client.delete(doc._id);
        console.log(`✔ deleted testimonial "${doc.author}" (${doc._id})`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(
          `✘ failed to delete testimonial "${doc.author}": ${message}`,
        );
      }
    }
  }

  /* ── Partners ─────────────────────────────────────────────── */
  const partnerDocs = await client.fetch<Array<{ _id: string; name: string }>>(
    `*[_type == "partner" && name in $names]{ _id, name }`,
    { names: PARTNER_NAMES },
  );

  if (partnerDocs.length === 0) {
    console.log("\n↷ no matching partner docs — skipping");
  } else {
    const partnerIds = partnerDocs.map((d) => d._id);

    /* Clear partnersSection.partners — otherwise the array will hold
       dead references after we delete the docs. Safe because the
       client is rebuilding the list from their own partner docs via
       Studio. */
    try {
      await client
        .patch("partnersSection")
        .set({ partners: [] })
        .commit();
      console.log(`\n✔ cleared partnersSection.partners before partner deletion`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`✘ failed to clear partnersSection.partners: ${message}`);
    }

    /* Unset testimonial.partner fields that point at any of the docs
       being deleted — avoids "referenced by" errors and dangling refs. */
    try {
      const referencingTestimonials = await client.fetch<
        Array<{ _id: string }>
      >(`*[_type == "testimonial" && partner._ref in $ids]{ _id }`, {
        ids: partnerIds,
      });
      for (const t of referencingTestimonials) {
        await client.patch(t._id).unset(["partner"]).commit();
      }
      if (referencingTestimonials.length > 0) {
        console.log(
          `✔ unset partner on ${referencingTestimonials.length} testimonial(s) that referenced deleted partners`,
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`✘ failed to unset testimonial.partner refs: ${message}`);
    }

    console.log(
      `\nDeleting ${partnerDocs.length} partner doc(s): ${partnerDocs.map((d) => d.name).join(", ")}`,
    );
    for (const doc of partnerDocs) {
      try {
        await client.delete(doc._id);
        console.log(`✔ deleted partner "${doc.name}" (${doc._id})`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`✘ failed to delete partner "${doc.name}": ${message}`);
      }
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
