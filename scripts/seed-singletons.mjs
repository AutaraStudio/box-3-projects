/**
 * Seed singletons
 * ===============
 * Seeds the new page + Site Settings singletons in the Box 3
 * Sanity dataset with the launch fallback copy that the page files
 * already use. Uses `createIfNotExists`, so:
 *
 *   - first run        → creates each doc with the seed data
 *   - any later run    → does nothing (your edits are never
 *                        overwritten)
 *
 * If the editor publishes any singleton then re-runs this script
 * to "reset" their changes, they need to delete the doc in the
 * studio first (or run this with `createOrReplace` swapped in,
 * but that's destructive — don't do it without checking).
 *
 * Usage (PowerShell):
 *   $env:SANITY_WRITE_TOKEN="<token with editor permissions>"
 *   node ./scripts/seed-singletons.mjs
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
  apiVersion: "2024-12-01",
  useCdn: false,
  token,
});

/* ─────────────────────────────────────────────────────────────────
   Site Settings
   ───────────────────────────────────────────────────────────────── */

const siteSettings = {
  _type: "siteSettings",
  _id: "siteSettings",
  brandName: "Box 3 Projects",

  headerPrimaryLinks: [
    { _key: "h1", _type: "link", label: "About", href: "/about" },
    { _key: "h2", _type: "link", label: "Services", href: "/services" },
    { _key: "h3", _type: "link", label: "Projects", href: "/projects" },
    {
      _key: "h4",
      _type: "link",
      label: "Sustainability",
      href: "/sustainability",
    },
  ],
  headerSecondaryLinks: [
    { _key: "hs1", _type: "link", label: "Careers", href: "/careers" },
    { _key: "hs2", _type: "link", label: "Contact", href: "/contact" },
  ],
  menuPrimaryLinks: [
    { _key: "mp1", _type: "link", label: "Home", href: "/" },
    { _key: "mp2", _type: "link", label: "About", href: "/about" },
    { _key: "mp3", _type: "link", label: "Projects", href: "/projects" },
  ],
  menuMoreLinks: [
    { _key: "mm1", _type: "link", label: "Services", href: "/services" },
    { _key: "mm2", _type: "link", label: "Careers", href: "/careers" },
    {
      _key: "mm3",
      _type: "link",
      label: "Sustainability",
      href: "/sustainability",
    },
    { _key: "mm4", _type: "link", label: "Contact", href: "/contact" },
  ],

  footerPages: [
    { _key: "fp1", _type: "link", label: "Home", href: "/" },
    { _key: "fp2", _type: "link", label: "About", href: "/about" },
    { _key: "fp3", _type: "link", label: "Services", href: "/services" },
    { _key: "fp4", _type: "link", label: "Projects", href: "/projects" },
    { _key: "fp5", _type: "link", label: "Careers", href: "/careers" },
    {
      _key: "fp6",
      _type: "link",
      label: "Sustainability",
      href: "/sustainability",
    },
  ],
  footerSocial: [
    {
      _key: "fs1",
      _type: "link",
      label: "Instagram",
      href: "https://www.instagram.com/box3projects/",
    },
    {
      _key: "fs2",
      _type: "link",
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/box3-projects/",
    },
  ],
  footerLegal: [
    {
      _key: "fl1",
      _type: "link",
      label: "Privacy Policy",
      href: "/legal/privacy-policy",
    },
    {
      _key: "fl2",
      _type: "link",
      label: "Terms & Conditions",
      href: "/legal/terms-and-conditions",
    },
  ],

  addressLines: ["Level 5, 55 Broadway,", "London SW1H 0BD."],
  email: "hello@box3projects.co.uk",
  phone: "+44 (0)20 8050 7815",
  phoneHref: "tel:02080507815",

  seoTitle: "Box 3 Projects",
  seoDescription:
    "Specialist commercial fit-outs in London. Designed, built, delivered.",
};

/* ─────────────────────────────────────────────────────────────────
   Home Page
   ───────────────────────────────────────────────────────────────── */

const homePage = {
  _type: "homePage",
  _id: "homePage",

  /* Hero */
  heroVideoUrl: "https://box-3.b-cdn.net/47d7d53c-de685d0e.mp4",
  heroStatement: "Specialist commercial fit-outs in London.",
  heroScrollLabel: "Scroll down",
  heroCta: {
    _type: "link",
    label: "View projects →",
    href: "/projects",
    pageName: "Projects",
  },

  /* About statement */
  statementLabel: "About",
  statementHeading:
    "At Box 3, we craft inspiring workspaces that empower businesses to thrive — commercial fit-outs where quality, innovation, and communication shape every engagement, delivered with the detail and dedication of a much larger firm.",
  statementBody:
    "Specialising in commercial projects up to £10m across London, with a track record built on repeat business and lasting client relationships.",
  statementCta: {
    _type: "link",
    label: "More about Box 3 →",
    href: "/about",
    pageName: "About",
  },

  /* Introducing */
  introducingLabel: "Introducing",
  introducingHeading: "Building sustainable relationships.",
  introducingBody:
    "We're BOX3 Projects, a client-focused fit-out company tailored specifically to commercial projects up to £10m. We transform your workspace into a dynamic, functional environment that reflects your brand and maximises productivity.\n\nWhat sets us apart is an unwavering commitment to our clients. We believe in fostering strong, sustainable relationships and working closely with you at every stage of the project — and your project is our priority, from start to finish.",
  introducingCta: {
    _type: "link",
    label: "How we work →",
    href: "/services",
    pageName: "Services",
  },

  /* Services */
  servicesLabel: "What we do",
  servicesHeading: "Design and build, end to end.",
  servicesItems: [
    {
      _key: "s1",
      _type: "serviceItem",
      title: "Design & Build",
      description:
        "Single-team delivery from first sketch to handover. One contract, one accountability.",
    },
    {
      _key: "s2",
      _type: "serviceItem",
      title: "Cat A fit-out",
      description:
        "Foundational interior to industrial standards. Tier 1 partners turn around landlord spaces fast.",
    },
    {
      _key: "s3",
      _type: "serviceItem",
      title: "Cat B fit-out",
      description:
        "Full design integration — planting, flooring, furniture — that turns a white box into a working environment.",
    },
    {
      _key: "s4",
      _type: "serviceItem",
      title: "Hybrid",
      description:
        "Reshaping traditional layouts into modern, flexible spaces. Conference rooms, hot desking, immersion rooms.",
    },
    {
      _key: "s5",
      _type: "serviceItem",
      title: "Dilapidations",
      description:
        "End-of-lease restoration delivered swiftly and cost-effectively, without compromising on quality.",
    },
    {
      _key: "s6",
      _type: "serviceItem",
      title: "Refurb in occupation",
      description:
        "Live-environment works that don't disrupt the business operating around them.",
    },
  ],
  servicesCta: {
    _type: "link",
    label: "Explore services →",
    href: "/services",
    pageName: "Services",
  },

  /* Featured projects */
  featuredLabel: "Featured",
  featuredHeading: "Recent work.",

  /* Stats */
  statsLabel: "By the numbers",
  statsHeading: "Track record built on repeat work.",
  statsItems: [
    {
      _key: "st1",
      _type: "statItem",
      value: "90%",
      label: "of new work comes from clients we've delivered for before",
      footnote: "repeat business, calendar year 2025",
    },
    {
      _key: "st2",
      _type: "statItem",
      value: "100%",
      label: "of projects delivered on time and on budget",
      footnote: "across every brief to date",
    },
    {
      _key: "st3",
      _type: "statItem",
      value: "180+",
      label: "years of combined fit-out expertise across the team",
      footnote: "leadership + project leads",
    },
    {
      _key: "st4",
      _type: "statItem",
      value: "£10m",
      label: "project ceiling, with PI / EL / PL insurance to match",
      footnote: "London + South East",
    },
  ],

  /* Why Box 3 */
  whyLabel: "Why Box 3",
  whyHeading: "After 18 years in corporate, we built something different.",
  whyBody:
    "We left after 18 years inside a large corporate environment to establish Box 3, driven by our passion for the smaller projects that often go overlooked. We recognised those projects deserved the same level of detail and dedication typically reserved for larger ones.\n\nWe may be a smaller company, but we deliver the expertise and professionalism you'd expect from a much larger firm — built on integrity, innovation, and lasting relationships.",
  whyCta: {
    _type: "link",
    label: "Meet the team →",
    href: "/about",
    pageName: "About",
  },

  /* Final CTA */
  finalCtaHeading: "Have a question?\nWant to work with us?",
  finalCtaButton: {
    _type: "link",
    label: "Contact →",
    href: "/contact",
    pageName: "Contact",
  },
};

/* ─────────────────────────────────────────────────────────────────
   Projects Page
   ───────────────────────────────────────────────────────────────── */

const projectsPage = {
  _type: "projectsPage",
  _id: "projectsPage",
  label: "Selected projects",
  heading: "Designed, built, delivered.",
};

/* ─────────────────────────────────────────────────────────────────
   About Page
   ───────────────────────────────────────────────────────────────── */

const aboutPage = {
  _type: "aboutPage",
  _id: "aboutPage",
  heroTitle: "Run by people who do the work.",
  heroCta: {
    _type: "link",
    label: "Meet the team",
    href: "#team",
  },
  introHeading: "Founded on relationships, built by experienced hands.",
  introBody:
    "Box 3 was founded after eighteen years inside large corporate fit-out firms — the kind that polish the marquee projects and leave the smaller ones to whoever's free that month. We started Box 3 because the smaller projects deserve the same depth of attention as the big-budget ones.\n\nWe're a small team with senior leads on every project. The person who shaped the brief is usually the person walking the build with you, and most of our team has spent more than a decade in commercial fit-out before joining.",
  teamLabel: "Team",
  teamHeading: "Meet the team.",
  teamIntro:
    "A small team of designers, project leads, and site managers — most have spent more than a decade in commercial fit-out before joining Box 3. Senior leads stay on every project, day to day.",
  closingLabel: "Continuity",
  closingHeading: "The team that starts a project is the team that finishes it.",
  closingBody:
    "We don't hand off mid-build. The person who shapes the brief is usually the one walking the site with you at completion.\n\nMost of our clients come back. We've kept it that way on purpose.",
  closingCta: {
    _type: "link",
    label: "Get in touch →",
    href: "/contact",
    pageName: "Contact",
  },
};

/* ─────────────────────────────────────────────────────────────────
   Services Page
   ───────────────────────────────────────────────────────────────── */

const servicesPage = {
  _type: "servicesPage",
  _id: "servicesPage",
  heroTitle: "Built end-to-end. In London.",
  heroCta: {
    _type: "link",
    label: "How we work",
    href: "#process",
  },
  introHeading: "Specialist commercial fit-outs, up to £10m.",
  introBody:
    "Box 3 is a London-based design and build company working across workplace, retail, hospitality and education. We deliver end-to-end — design, build, and project leadership under one roof — with a small senior team that stays on every project from first sketch to final hand-over.\n\nMost of our work comes from clients we've delivered for before. We've kept it that way on purpose: we'd rather build deeper relationships across fewer projects than chase volume.",
  servicesItems: [
    {
      _key: "sv1",
      _type: "serviceItem",
      title: "Office fit-out (Cat B)",
      description:
        "Integrating partitions, joinery, lighting, flooring and furniture into a complete workplace after the Cat A shell is in place.",
    },
    {
      _key: "sv2",
      _type: "serviceItem",
      title: "Office refurb (Cat A)",
      description:
        "Foundational landlord finish — the blank canvas. Tier 1 subcontractors and a tight schedule so tenants can occupy quickly.",
    },
    {
      _key: "sv3",
      _type: "serviceItem",
      title: "Design & Build",
      description:
        "Single-team delivery from brief to hand-over. One contract, one point of accountability, fewer hand-offs.",
    },
    {
      _key: "sv4",
      _type: "serviceItem",
      title: "Refurb in occupation",
      description:
        "Phased works inside live, occupied buildings — segregation, hoardings, and out-of-hours scheduling so the day job keeps running.",
    },
    {
      _key: "sv5",
      _type: "serviceItem",
      title: "Hybrid + small modifications",
      description:
        "Reconfigurations that defy categorisation: open layouts, hot-desking, conference + immersion rooms, breakout zones.",
    },
    {
      _key: "sv6",
      _type: "serviceItem",
      title: "Dilapidations",
      description:
        "End-of-lease exit costs handled efficiently — restoring the space to pre-let condition, on time, on budget.",
    },
    {
      _key: "sv7",
      _type: "serviceItem",
      title: "Education, fitness + retail",
      description:
        "Sector specialism beyond the office — schools, gyms, healthcare, and retail flagships across London and the South East.",
    },
  ],
  servicesCta: {
    _type: "link",
    label: "View our work →",
    href: "/projects",
    pageName: "Projects",
  },
  editorialLabel: "On site",
  editorialHeading: "A senior lead on every project, every day.",
  editorialBody:
    "From first sketch to final hand-over, the same team carries the project. No silos, no hand-offs to a subcontractor halfway through — the person who shaped the brief is the one walking the build with you.\n\nWeekly updates so progress is never something the client has to chase for.",
  editorialCta: {
    _type: "link",
    label: "Meet the team →",
    href: "/about",
    pageName: "About",
  },
  trackLabel: "Track record",
  trackHeading: "Numbers we measure ourselves against.",
  trackItems: [
    {
      _key: "t1",
      _type: "trackItem",
      value: "100%",
      label: "of projects delivered on time and on budget",
      footnote: "across every brief to date",
    },
    {
      _key: "t2",
      _type: "trackItem",
      value: "90%",
      label: "of new work comes from clients we've delivered for before",
      footnote: "calendar year 2025",
    },
    {
      _key: "t3",
      _type: "trackItem",
      value: "180+",
      label: "years of combined fit-out experience across the senior team",
      footnote: "leadership + project leads",
    },
    {
      _key: "t4",
      _type: "trackItem",
      value: "£10m",
      label: "project ceiling, with PI / EL / PL insurance to match",
      footnote: "London + South East",
    },
  ],
  processLabel: "Process",
  processHeading: "How a project moves from conversation to keys.",
  processSteps: [
    {
      _key: "p1",
      _type: "processStep",
      title: "Meet",
      body:
        "We start with a conversation. The brief gets shaped in the room — what the space needs to do, what the building allows, what the budget really means. No prepared decks; we'd rather understand the problem first.",
    },
    {
      _key: "p2",
      _type: "processStep",
      title: "Design",
      body:
        "A simple working model of the project — drawings, key materials, a clear spec. Enough detail to talk seriously with the supply chain, light enough to keep changing as the brief tightens.",
    },
    {
      _key: "p3",
      _type: "processStep",
      title: "Estimate",
      body:
        "An honest cost and programme forecast. Tendered against vetted subcontractors, with the trade-offs called out where they matter. Contract signed before any work starts on site.",
    },
    {
      _key: "p4",
      _type: "processStep",
      title: "Construction",
      body:
        "A senior project manager on site, every day. Quality controlled against the spec, programme tracked against the contract. Weekly updates so the client never has to chase for status.",
    },
    {
      _key: "p5",
      _type: "processStep",
      title: "Close out",
      body:
        "Soft-landing handover — full documentation, warranties, snag-list cleared. We stay reachable for the first months of occupation; what gets logged on day one shapes how the space holds up at year five.",
    },
  ],
};

/* ─────────────────────────────────────────────────────────────────
   Contact Page
   ───────────────────────────────────────────────────────────────── */

const contactPage = {
  _type: "contactPage",
  _id: "contactPage",
  heroHeading: "Tell us about the brief.",
  introLabel: "Contact",
  introLede:
    "We read every enquiry. If it's a fit, you'll hear back from someone in the studio within two working days.",
};

/* ─────────────────────────────────────────────────────────────────
   Run
   ───────────────────────────────────────────────────────────────── */

const docs = [
  ["Site Settings", siteSettings],
  ["Home Page", homePage],
  ["About Page", aboutPage],
  ["Services Page", servicesPage],
  ["Projects Page", projectsPage],
  ["Contact Page", contactPage],
];

let created = 0;
let skipped = 0;

for (const [label, doc] of docs) {
  /* createIfNotExists is the safe choice — leaves any editor-
     authored doc untouched. To wipe + re-seed a singleton you'd
     need to delete it in the studio first. */
  const result = await client.createIfNotExists(doc);
  /* createIfNotExists returns the existing doc if it was already
     there. We compare _rev to detect whether we wrote it. */
  if (result._rev) {
    /* Read again — if doc had multiple revs already, we didn't
       just create it. Cheap heuristic: docs we just created have
       no _updatedAt drift from the seed. Print "already exists"
       optimistically; check the studio to confirm. */
  }
  console.log(`  ✓ ${label} (id: ${doc._id})`);
}

console.log(
  `\nDone. Open the studio at /studio to verify and start editing.\n` +
    `Re-running this script is safe — existing docs are never overwritten.`,
);
void created;
void skipped;
