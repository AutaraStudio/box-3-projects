/**
 * Migrate legacy vacancy docs to the current schema
 * =================================================
 * The /careers vacancy schema was rewritten — old docs still
 * carry the previous shape (department / type / salary / applyEmail
 * / isActive + a few rich-text blocks). This script:
 *
 *   - Maps every legacy field to its current equivalent
 *   - Fills the required new fields (publishedAt, etc.) where empty
 *   - Unsets the legacy fields so the studio stops flagging them
 *     with the "Unknown field" yellow warning box
 *
 * Idempotent — re-running a second time is a no-op because the new
 * fields are already populated and the old ones are gone.
 *
 * Usage (PowerShell):
 *   $env:SANITY_WRITE_TOKEN="<editor token>"
 *   node ./scripts/migrate-vacancies.mjs
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

/* ─── Field maps ───────────────────────────────────────────── */

/* Legacy department → current discipline (constrained to the
   schema's dropdown options). Anything that doesn't map cleanly
   falls back to "Studio" so non-matched roles still pass
   validation. */
const DEPARTMENT_TO_DISCIPLINE = {
  Design: "Design",
  Construction: "Build",
  "Project Management": "Project Management",
  Operations: "Operations",
  Marketing: "Studio",
  "Business Development": "Studio",
  Studio: "Studio",
};

const TYPE_TO_EMPLOYMENT_TYPE = {
  "Full Time": "Full-time",
  "Full-Time": "Full-time",
  "Full-time": "Full-time",
  "Part Time": "Part-time",
  "Part-Time": "Part-time",
  "Part-time": "Part-time",
  Contract: "Contract",
  Internship: "Internship",
};

/* Parse a salary string like "£35,000 – £45,000" into
   { min, max }. Returns nulls for anything we can't parse. */
function parseSalary(value) {
  if (typeof value !== "string") return { min: null, max: null };
  const matches = value.match(/(\d[\d,]*)/g);
  if (!matches || matches.length === 0) return { min: null, max: null };
  const nums = matches.map((m) => Number(m.replace(/,/g, ""))).filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return { min: null, max: null };
  if (nums.length === 1) return { min: nums[0], max: null };
  return { min: nums[0], max: nums[1] };
}

/* Pick the first non-empty rich-text block's plain text from a
   legacy field (e.g. aboutTheRole) so we have something for the
   new `summary` field. Falls back to whatever's already in
   `summary`. */
function deriveSummary(doc) {
  if (typeof doc.summary === "string" && doc.summary.trim()) return doc.summary;
  const candidates = [doc.aboutTheRole, doc.whatWereLookingFor, doc.whatWeOffer];
  for (const blocks of candidates) {
    if (!Array.isArray(blocks)) continue;
    for (const block of blocks) {
      const children = block?.children;
      if (!Array.isArray(children)) continue;
      const text = children
        .map((c) => (typeof c?.text === "string" ? c.text : ""))
        .join(" ")
        .trim();
      if (text) return text.slice(0, 240);
    }
  }
  return null;
}

const LEGACY_FIELDS = [
  "aboutTheRole",
  "applyEmail",
  "department",
  "isActive",
  "salary",
  "type",
  "whatWeOffer",
  "whatWereLookingFor",
];

/* ─── Migrate ──────────────────────────────────────────────── */

console.log("\nLoading vacancies…");
const docs = await client.fetch(
  '*[_type == "vacancy" && !(_id in path("drafts.**"))]',
);
console.log(`  found ${docs.length} document(s)`);

let migrated = 0;
let skipped = 0;
const today = new Date().toISOString().slice(0, 10);

for (const doc of docs) {
  const set = {};

  /* Map legacy → current. setIfMissing semantics: only fill if
     the new field is empty, never overwrite editor input. */
  if (!doc.discipline) {
    const mapped = DEPARTMENT_TO_DISCIPLINE[doc.department];
    set.discipline = mapped ?? "Studio";
  }
  if (!doc.employmentType) {
    const mapped = TYPE_TO_EMPLOYMENT_TYPE[doc.type];
    set.employmentType = mapped ?? "Full-time";
  }
  if (!doc.location) {
    set.location = "London, UK";
  }
  if (doc.salaryMin == null && doc.salaryMax == null) {
    const { min, max } = parseSalary(doc.salary);
    if (min != null) set.salaryMin = min;
    if (max != null) set.salaryMax = max;
  }
  if (!doc.applyUrl && typeof doc.applyEmail === "string" && doc.applyEmail.trim()) {
    set.applyUrl = `mailto:${doc.applyEmail.trim()}`;
  }
  if (typeof doc.isOpen !== "boolean") {
    set.isOpen = doc.isActive !== false;
  }
  if (!doc.publishedAt) {
    set.publishedAt = today;
  }
  if (!doc.summary) {
    const derived = deriveSummary(doc);
    if (derived) set.summary = derived;
  }

  /* Anything to do? */
  const orphans = LEGACY_FIELDS.filter((k) => k in doc);
  if (Object.keys(set).length === 0 && orphans.length === 0) {
    console.log(`  ↷ ${doc.title} (${doc._id}) — already current`);
    skipped += 1;
    continue;
  }

  let patch = client.patch(doc._id);
  if (Object.keys(set).length > 0) patch = patch.set(set);
  if (orphans.length > 0) patch = patch.unset(orphans);

  try {
    await patch.commit();
    const setSummary =
      Object.keys(set).length > 0 ? `set ${Object.keys(set).join(", ")}` : "";
    const unsetSummary =
      orphans.length > 0 ? `unset ${orphans.join(", ")}` : "";
    console.log(
      `  ✓ ${doc.title} (${doc._id}) — ${[setSummary, unsetSummary].filter(Boolean).join("; ")}`,
    );
    migrated += 1;
  } catch (err) {
    console.error(`  ✘ ${doc.title} (${doc._id}) failed: ${err.message}`);
  }
}

console.log(
  `\nDone — migrated ${migrated}, skipped ${skipped}. Re-running this script is safe.`,
);
