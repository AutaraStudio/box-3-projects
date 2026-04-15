/*
 * Populate Projects
 * =================
 * Wipes and rebuilds project content:
 *   - Deletes all project, projectCategory, expertise docs
 *   - Creates 4 fresh categories
 *   - Creates 6 fresh expertise items
 *   - Leaves existing teamMember docs untouched and assigns 2-4 of
 *     them to each project (round-robin over whatever the client has)
 *   - Creates 13 projects matching the existing Media tags, each with
 *     a featured image + up to 15 gallery images pulled by tag
 *
 * All docs are published. Safe to re-run — each run starts from a
 * clean slate for project content (team members remain untouched).
 *
 * Usage: npx tsx scripts/populate-projects.ts
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

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

function randomKey(length = 12): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function deleteAllOfType(type: string): Promise<number> {
  const ids = await client.fetch<string[]>(
    `*[_type == $type]._id`,
    { type },
  );
  if (ids.length === 0) return 0;
  const tx = client.transaction();
  for (const id of ids) tx.delete(id);
  await tx.commit();
  return ids.length;
}

async function assetIdsForTag(tagSlug: string): Promise<string[]> {
  return client.fetch<string[]>(
    `*[_type == "sanity.imageAsset" && references(*[_type == "media.tag" && name.current == $tag]._id)]._id`,
    { tag: tagSlug },
  );
}

function imageRef(assetId: string) {
  return {
    _type: "image" as const,
    _key: randomKey(),
    asset: { _type: "reference" as const, _ref: assetId },
  };
}

function tagRef(assetId: string, tagId: string) {
  return {
    _key: randomKey(),
    _type: "reference" as const,
    _ref: tagId,
    _weak: true,
  };
}

/* --------------------------------------------------------------------------
   Seed content
   -------------------------------------------------------------------------- */

const CATEGORIES = [
  { title: "Workplace" },
  { title: "Residential" },
  { title: "Hospitality" },
  { title: "Retail" },
] as const;

const EXPERTISE = [
  { title: "Interior Design" },
  { title: "Space Planning" },
  { title: "Project Management" },
  { title: "Furniture Specification" },
  { title: "Technical Drawings" },
  { title: "CAD Design" },
] as const;

type ProjectSeed = {
  title: string;
  tag: string;
  categoryTitle: (typeof CATEGORIES)[number]["title"];
  location: string;
  year: number;
  tags: string[];
  expertise: (typeof EXPERTISE)[number]["title"][];
  /** How many existing team members to assign (round-robin). */
  teamCount: number;
  shortDescription: string;
  clientObjective: string;
  clientFeedback: string;
  stats: { label: string; value: string }[];
};

const PROJECTS: ProjectSeed[] = [
  {
    title: "Carlton Gardens",
    tag: "carlton-gardens",
    categoryTitle: "Residential",
    location: "St James's, London",
    year: 2024,
    tags: ["Residential", "Heritage", "Luxury"],
    expertise: ["Interior Design", "Space Planning", "Furniture Specification"],
    teamCount: 2,
    shortDescription:
      "A considered refurbishment of a heritage residence in St James's, balancing contemporary calm with the building's historic fabric.",
    clientObjective:
      "Reimagine the ground and first-floor spaces as a family home while retaining the building's period detailing.",
    clientFeedback:
      "The team handled every stage with care and precision. The final result feels both contemporary and at home in the building's history.",
    stats: [
      { label: "Size", value: "6,200 sq ft" },
      { label: "Completed", value: "Spring 2024" },
      { label: "Scope", value: "Full refurbishment" },
    ],
  },
  {
    title: "CATA",
    tag: "cata",
    categoryTitle: "Hospitality",
    location: "Soho, London",
    year: 2023,
    tags: ["Hospitality", "Restaurant"],
    expertise: ["Interior Design", "Furniture Specification"],
    teamCount: 2,
    shortDescription:
      "An intimate dining room in Soho built around warm materials and a relaxed, convivial atmosphere.",
    clientObjective:
      "Create a neighbourhood restaurant that feels immediately familiar yet distinctive within a competitive Soho setting.",
    clientFeedback:
      "Guests regularly comment on how calm the space feels — a real achievement given how busy service can get.",
    stats: [
      { label: "Covers", value: "48" },
      { label: "Completed", value: "Autumn 2023" },
      { label: "Scope", value: "Interior fit-out" },
    ],
  },
  {
    title: "CD&R WC",
    tag: "cd-r-wc",
    categoryTitle: "Workplace",
    location: "Mayfair, London",
    year: 2024,
    tags: ["Workplace", "Private Equity"],
    expertise: ["Interior Design", "Space Planning", "Project Management"],
    teamCount: 2,
    shortDescription:
      "Bespoke workplace interiors for a global private equity firm, designed around quiet focus and high-touch client hosting.",
    clientObjective:
      "Deliver an elevated London workspace that supports both internal focus time and senior client engagement.",
    clientFeedback:
      "A beautifully considered space. The team understood the way our people actually work and designed around it.",
    stats: [
      { label: "Size", value: "9,500 sq ft" },
      { label: "Completed", value: "Summer 2024" },
      { label: "Scope", value: "Cat B fit-out" },
    ],
  },
  {
    title: "Cleveland House",
    tag: "cleveland-house",
    categoryTitle: "Residential",
    location: "St James's, London",
    year: 2023,
    tags: ["Residential", "Heritage"],
    expertise: ["Interior Design", "Space Planning", "Technical Drawings"],
    teamCount: 2,
    shortDescription:
      "A layered, material-rich residence in St James's where classical architecture meets a contemporary collector's sensibility.",
    clientObjective:
      "Develop a cohesive design language across every floor that feels timeless without being austere.",
    clientFeedback:
      "Every detail has been considered — from the joinery to the way light falls through the rooms in the afternoon.",
    stats: [
      { label: "Size", value: "12,000 sq ft" },
      { label: "Completed", value: "Winter 2023" },
      { label: "Scope", value: "Whole-house refurbishment" },
    ],
  },
  {
    title: "Farringdon",
    tag: "farringdon",
    categoryTitle: "Workplace",
    location: "Farringdon, London",
    year: 2024,
    tags: ["Workplace", "Office"],
    expertise: ["Interior Design", "Space Planning", "CAD Design"],
    teamCount: 3,
    shortDescription:
      "A flexible workplace spanning three floors in Farringdon, designed for hybrid teams and informal collaboration.",
    clientObjective:
      "Move the team into a space that supports varied working styles and draws people back into the office.",
    clientFeedback:
      "The new space feels genuinely like ours. Teams are choosing to come in — which is exactly what we hoped for.",
    stats: [
      { label: "Size", value: "18,400 sq ft" },
      { label: "Floors", value: "3" },
      { label: "Completed", value: "Spring 2024" },
    ],
  },
  {
    title: "Hugo Boss",
    tag: "hugo-boss",
    categoryTitle: "Retail",
    location: "Bond Street, London",
    year: 2023,
    tags: ["Retail", "Luxury", "Brand"],
    expertise: ["Interior Design", "Furniture Specification", "Project Management"],
    teamCount: 2,
    shortDescription:
      "A flagship retail environment in London's West End, designed to translate the brand's architectural language into a rich tactile experience.",
    clientObjective:
      "Roll out the brand's new global retail concept for a flagship London store while meeting heritage-listed constraints.",
    clientFeedback:
      "The team navigated a complex brief with real craft. The store performs beautifully for both staff and customers.",
    stats: [
      { label: "Size", value: "4,100 sq ft" },
      { label: "Completed", value: "Autumn 2023" },
      { label: "Scope", value: "Flagship fit-out" },
    ],
  },
  {
    title: "Kingsway Gym",
    tag: "kingsway-gym",
    categoryTitle: "Hospitality",
    location: "Holborn, London",
    year: 2024,
    tags: ["Wellness", "Fitness", "Hospitality"],
    expertise: ["Interior Design", "Space Planning"],
    teamCount: 2,
    shortDescription:
      "A boutique members' gym beneath the streets of Holborn, balancing performance-focused equipment zones with a calm hospitality experience.",
    clientObjective:
      "Create a members' club feel in a wellness setting — somewhere people want to stay beyond their workout.",
    clientFeedback:
      "Members regularly say it doesn't feel like a gym. That was the brief — and the team absolutely delivered.",
    stats: [
      { label: "Size", value: "7,800 sq ft" },
      { label: "Completed", value: "Spring 2024" },
      { label: "Scope", value: "Full interior fit-out" },
    ],
  },
  {
    title: "Manor Place",
    tag: "manor-place",
    categoryTitle: "Residential",
    location: "Walworth, London",
    year: 2023,
    tags: ["Residential", "New Build"],
    expertise: ["Interior Design", "Furniture Specification"],
    teamCount: 2,
    shortDescription:
      "A family home in South London where soft palettes and layered textures bring warmth to a clean contemporary shell.",
    clientObjective:
      "Furnish and finish a newly built family home that feels lived-in from day one without losing its architectural calm.",
    clientFeedback:
      "Moving in felt effortless. Everything we needed was there, and everything we didn't — wasn't.",
    stats: [
      { label: "Size", value: "3,600 sq ft" },
      { label: "Completed", value: "Summer 2023" },
      { label: "Scope", value: "Furniture, finishes, styling" },
    ],
  },
  {
    title: "Meta",
    tag: "meta",
    categoryTitle: "Workplace",
    location: "King's Cross, London",
    year: 2024,
    tags: ["Workplace", "Tech"],
    expertise: ["Interior Design", "Space Planning", "Project Management"],
    teamCount: 2,
    shortDescription:
      "A flexible meeting and collaboration floor for a global technology brand, focused on neighbourhood-scale teamwork and brand expression.",
    clientObjective:
      "Re-work one floor of the London HQ to support hybrid collaboration and signature client meetings.",
    clientFeedback:
      "A thoughtful partner from concept through delivery. The space has changed how teams use the floor.",
    stats: [
      { label: "Size", value: "11,200 sq ft" },
      { label: "Completed", value: "Summer 2024" },
      { label: "Scope", value: "Single-floor strip-out and refit" },
    ],
  },
  {
    title: "TKTS Booth",
    tag: "tkts-booth",
    categoryTitle: "Hospitality",
    location: "Leicester Square, London",
    year: 2024,
    tags: ["Public Realm", "Hospitality", "Cultural"],
    expertise: ["Interior Design", "Technical Drawings", "CAD Design"],
    teamCount: 2,
    shortDescription:
      "A reimagined ticket kiosk at the heart of Leicester Square, built to welcome both tourists and regulars with clarity and calm.",
    clientObjective:
      "Refresh the public face of an iconic London destination while keeping the ticketing workflow efficient.",
    clientFeedback:
      "It looks brilliant on the square and works beautifully for our team behind the glass. A hard brief, nailed.",
    stats: [
      { label: "Footprint", value: "420 sq ft" },
      { label: "Completed", value: "Summer 2024" },
      { label: "Scope", value: "Kiosk refurbishment" },
    ],
  },
  {
    title: "Tower 42",
    tag: "tower-42",
    categoryTitle: "Workplace",
    location: "City of London",
    year: 2023,
    tags: ["Workplace", "Office", "City"],
    expertise: ["Interior Design", "Space Planning", "Project Management"],
    teamCount: 3,
    shortDescription:
      "A calm, materially restrained workplace high above the City, designed around natural light and panoramic views.",
    clientObjective:
      "Take advantage of the tower's views while delivering a quiet, professional atmosphere for client-facing teams.",
    clientFeedback:
      "Balanced, restrained, very well resolved. Exactly the right tone for how we wanted to present ourselves.",
    stats: [
      { label: "Size", value: "14,600 sq ft" },
      { label: "Completed", value: "Autumn 2023" },
      { label: "Scope", value: "Cat B fit-out" },
    ],
  },
  {
    title: "Unison",
    tag: "unison",
    categoryTitle: "Workplace",
    location: "Euston, London",
    year: 2024,
    tags: ["Workplace", "Campus"],
    expertise: [
      "Interior Design",
      "Space Planning",
      "Project Management",
      "Furniture Specification",
    ],
    teamCount: 4,
    shortDescription:
      "A campus-scale workplace programme delivered across multiple floors, supporting a large union workforce with a modern, democratic office.",
    clientObjective:
      "Consolidate multiple teams into a single modernised HQ that reflects the organisation's values.",
    clientFeedback:
      "A huge programme handled with clarity and pace. Our teams feel proud of the space.",
    stats: [
      { label: "Size", value: "62,000 sq ft" },
      { label: "Floors", value: "5" },
      { label: "Completed", value: "Summer 2024" },
    ],
  },
  {
    title: "Unit 10",
    tag: "unit-10",
    categoryTitle: "Workplace",
    location: "Shoreditch, London",
    year: 2023,
    tags: ["Workplace", "Creative"],
    expertise: ["Interior Design", "Furniture Specification"],
    teamCount: 2,
    shortDescription:
      "A compact creative studio in Shoreditch, fitted out with a relaxed, hospitality-influenced palette to support a small close-knit team.",
    clientObjective:
      "Move the studio into a warm, grown-up space that steps away from the typical open-plan office.",
    clientFeedback:
      "Feels like a home for the studio. Clients love coming in and we love working here.",
    stats: [
      { label: "Size", value: "1,900 sq ft" },
      { label: "Completed", value: "Spring 2023" },
      { label: "Scope", value: "Interior fit-out" },
    ],
  },
];

/* --------------------------------------------------------------------------
   Run
   -------------------------------------------------------------------------- */

async function run() {
  console.log("Wiping existing project-related content (team members untouched)…");
  const deletedProjects = await deleteAllOfType("project");
  const deletedCategories = await deleteAllOfType("projectCategory");
  const deletedExpertise = await deleteAllOfType("expertise");
  console.log(
    `Deleted: ${deletedProjects} projects, ${deletedCategories} categories, ${deletedExpertise} expertise.`,
  );

  /* ── Categories ─────────────────────────────────────────── */
  console.log("Creating categories…");
  const categoryByTitle = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const doc = await client.create({
      _type: "projectCategory",
      title: cat.title,
      slug: { _type: "slug", current: slugify(cat.title) },
    });
    categoryByTitle.set(cat.title, doc._id);
  }

  /* ── Expertise ──────────────────────────────────────────── */
  console.log("Creating expertise…");
  const expertiseByTitle = new Map<string, string>();
  for (const item of EXPERTISE) {
    const doc = await client.create({
      _type: "expertise",
      title: item.title,
      slug: { _type: "slug", current: slugify(item.title) },
    });
    expertiseByTitle.set(item.title, doc._id);
  }

  /* ── Existing team members (fetched, not created) ──────── */
  const existingTeamIds = await client.fetch<string[]>(
    `*[_type == "teamMember"] | order(coalesce(order, 999) asc, name asc)._id`,
  );
  console.log(
    `Found ${existingTeamIds.length} existing team member(s) to assign from.`,
  );

  /* ── Projects ───────────────────────────────────────────── */
  console.log("Creating projects…");
  let createdCount = 0;
  let withImagesCount = 0;

  /* Round-robin cursor so team members are spread across projects
     rather than every project reaching for the same first few. */
  let teamCursor = 0;

  for (const seed of PROJECTS) {
    const categoryId = categoryByTitle.get(seed.categoryTitle);
    if (!categoryId) {
      console.warn(`Skipping ${seed.title}: unknown category.`);
      continue;
    }

    const assetIds = await assetIdsForTag(seed.tag);
    const hasImages = assetIds.length > 0;

    const featuredImage = hasImages
      ? {
          _type: "image" as const,
          asset: { _type: "reference" as const, _ref: assetIds[0] },
          alt: seed.title,
        }
      : undefined;

    const galleryAssetIds = assetIds.slice(1, 1 + 15);
    const additionalImages = galleryAssetIds.map((id) => ({
      ...imageRef(id),
      alt: seed.title,
    }));

    const expertiseRefs = seed.expertise
      .map((title) => expertiseByTitle.get(title))
      .filter((id): id is string => Boolean(id))
      .map((id) => ({
        _key: randomKey(),
        _type: "reference" as const,
        _ref: id,
      }));

    /* Pick `teamCount` members from existing team roster, round-robin.
       If the roster has fewer people than requested, just use what's
       there — duplicates are avoided within a single project. */
    const teamRefs: { _key: string; _type: "reference"; _ref: string }[] = [];
    if (existingTeamIds.length > 0) {
      const wanted = Math.min(seed.teamCount, existingTeamIds.length);
      const picked = new Set<string>();
      while (picked.size < wanted) {
        const id = existingTeamIds[teamCursor % existingTeamIds.length];
        teamCursor += 1;
        if (!picked.has(id)) picked.add(id);
      }
      for (const id of picked) {
        teamRefs.push({
          _key: randomKey(),
          _type: "reference",
          _ref: id,
        });
      }
    }

    const statsItems = seed.stats.map((stat) => ({
      _key: randomKey(),
      _type: "object" as const,
      label: stat.label,
      value: stat.value,
    }));

    await client.create({
      _type: "project",
      title: seed.title,
      slug: { _type: "slug", current: slugify(seed.title) },
      category: { _type: "reference", _ref: categoryId },
      shortDescription: seed.shortDescription,
      location: seed.location,
      year: seed.year,
      tags: seed.tags,
      ...(featuredImage ? { featuredImage } : {}),
      ...(additionalImages.length > 0 ? { additionalImages } : {}),
      expertise: expertiseRefs,
      team: teamRefs,
      stats: statsItems,
      clientObjective: seed.clientObjective,
      clientFeedback: seed.clientFeedback,
    });

    createdCount += 1;
    if (hasImages) withImagesCount += 1;
    console.log(
      `  ✓ ${seed.title} (${hasImages ? `${assetIds.length} image(s)` : "no images"})`,
    );
  }

  console.log(
    `\nDone. Created ${createdCount} projects (${withImagesCount} with images).`,
  );
}

run().catch((error) => {
  console.error("Populate failed:", error);
  process.exit(1);
});
