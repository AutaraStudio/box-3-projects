/**
 * Seed 8 sample vacancies into the Box 3 Sanity dataset.
 *
 * Usage (PowerShell):
 *   $env:SANITY_WRITE_TOKEN="<your editor token>"
 *   node ./scripts/seed-vacancies.mjs
 *
 * Get a token at https://www.sanity.io/manage → Project (uwutffn5)
 *   → API → Tokens → Add API token → permissions: Editor.
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
  apiVersion: "2024-01-01",
  useCdn: false,
  token,
});

const today = new Date();
const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const VACANCIES = [
  {
    _type: "vacancy",
    _id: "vac-senior-interior-designer",
    title: "Senior Interior Designer",
    discipline: "Design",
    location: "London, UK",
    employmentType: "Full-time",
    salaryMin: 55000,
    salaryMax: 70000,
    summary:
      "Lead designer on a portfolio of hospitality + workplace fit-outs from concept to handover. RIBA Part 3 ideal but not required.",
    applyUrl:
      "mailto:hello@box3projects.co.uk?subject=Senior%20Interior%20Designer",
    publishedAt: daysAgo(2),
    isOpen: true,
  },
  {
    _type: "vacancy",
    _id: "vac-junior-designer",
    title: "Junior Interior Designer",
    discipline: "Design",
    location: "London, UK",
    employmentType: "Full-time",
    salaryMin: 30000,
    salaryMax: 38000,
    summary:
      "Joining the design team to support concept work, materials specification, and on-site detailing across active projects.",
    applyUrl: "mailto:hello@box3projects.co.uk?subject=Junior%20Designer",
    publishedAt: daysAgo(5),
    isOpen: true,
  },
  {
    _type: "vacancy",
    _id: "vac-project-manager",
    title: "Project Manager",
    discipline: "Project Management",
    location: "London, UK",
    employmentType: "Full-time",
    salaryMin: 60000,
    salaryMax: 80000,
    summary:
      "Owning programme + commercials end-to-end on workplace and hospitality fit-outs. CSCS / SMSTS required.",
    applyUrl: "mailto:hello@box3projects.co.uk?subject=Project%20Manager",
    publishedAt: daysAgo(7),
    isOpen: true,
  },
  {
    _type: "vacancy",
    _id: "vac-site-manager",
    title: "Site Manager",
    discipline: "Build",
    location: "London, UK",
    employmentType: "Full-time",
    salaryMin: 55000,
    salaryMax: 70000,
    summary:
      "On-site lead for live fit-out projects in central London. Coordinating trades, programme, H&S, and quality.",
    applyUrl: "mailto:hello@box3projects.co.uk?subject=Site%20Manager",
    publishedAt: daysAgo(10),
    isOpen: true,
  },
  {
    _type: "vacancy",
    _id: "vac-quantity-surveyor",
    title: "Quantity Surveyor",
    discipline: "Project Management",
    location: "London, UK",
    employmentType: "Full-time",
    salaryMin: 50000,
    salaryMax: 65000,
    summary:
      "Owning cost planning, valuations, and final accounts across a portfolio of fit-out projects between £500k–£5m.",
    applyUrl: "mailto:hello@box3projects.co.uk?subject=Quantity%20Surveyor",
    publishedAt: daysAgo(14),
    isOpen: true,
  },
  {
    _type: "vacancy",
    _id: "vac-design-intern",
    title: "Design Intern",
    discipline: "Design",
    location: "London, UK",
    employmentType: "Internship",
    salaryMin: 24000,
    summary:
      "12-week studio placement working alongside the design team on live projects. Open to penultimate-year + postgraduate students.",
    applyUrl: "mailto:hello@box3projects.co.uk?subject=Design%20Intern",
    publishedAt: daysAgo(18),
    isOpen: true,
  },
  {
    _type: "vacancy",
    _id: "vac-studio-coordinator",
    title: "Studio Coordinator",
    discipline: "Operations",
    location: "London, UK",
    employmentType: "Full-time",
    salaryMin: 32000,
    salaryMax: 38000,
    summary:
      "Keeping the studio running — diary, supplier coordination, sample library, and front-of-house for client visits.",
    applyUrl: "mailto:hello@box3projects.co.uk?subject=Studio%20Coordinator",
    publishedAt: daysAgo(21),
    isOpen: true,
  },
  {
    _type: "vacancy",
    _id: "vac-finance-business-partner",
    title: "Finance Business Partner",
    discipline: "Operations",
    location: "London, UK",
    employmentType: "Part-time",
    salaryMin: 60000,
    salaryMax: 75000,
    summary:
      "3 days/week role partnering the leadership team on monthly reporting, project P&L, and forecasting.",
    applyUrl:
      "mailto:hello@box3projects.co.uk?subject=Finance%20Business%20Partner",
    publishedAt: daysAgo(28),
    isOpen: true,
  },
];

console.log("Seeding", VACANCIES.length, "vacancies into Box 3…");
const tx = client.transaction();
for (const v of VACANCIES) tx.createOrReplace(v);
const result = await tx.commit();
console.log(`✓ Committed ${result.results.length} documents.`);
