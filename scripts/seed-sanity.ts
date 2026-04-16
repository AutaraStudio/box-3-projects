/*
 * Sanity Seed Script
 * ==================
 * Populates the Sanity dataset with default content for all
 * document types. Run once after initial setup.
 *
 * Usage: npm run seed
 *
 * Before running:
 * 1. Go to sanity.io/manage → your project → API → Tokens
 * 2. Create a new token with "Editor" permissions
 * 3. Add it to .env.local as SANITY_API_TOKEN=your-token-here
 * 4. Run: npm run seed
 *
 * The script is idempotent — safe to run multiple times.
 * Existing documents are never overwritten.
 */

import { createClient } from "@sanity/client";
import { config as loadEnv } from "dotenv";
import path from "node:path";

/* Load .env.local from project root */
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "Missing required env vars. Ensure NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_TOKEN are set in .env.local.",
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

/* --------------------------------------------------------------------------
   Seed documents
   -------------------------------------------------------------------------- */

type SeedDoc = { _id: string; _type: string } & Record<string, unknown>;

const documents: SeedDoc[] = [
  {
    _id: "siteNav",
    _type: "siteNav",
    primaryLinks: [
      { _key: "nav-about", label: "About", href: "/about" },
      { _key: "nav-services", label: "Services", href: "/services" },
      { _key: "nav-projects", label: "Projects", href: "/projects" },
      { _key: "nav-clients", label: "Clients", href: "/clients" },
    ],
    secondaryLinks: [
      {
        _key: "nav-culture",
        label: "Culture & Careers",
        href: "/culture-and-careers",
      },
      { _key: "nav-blog", label: "Blog", href: "/blog" },
      { _key: "nav-contact", label: "Contact", href: "/contact" },
    ],
    megaMenuCompanyLinks: [
      {
        _key: "mm-culture",
        label: "Culture & Careers",
        href: "/culture-and-careers",
      },
      { _key: "mm-blog", label: "Blog", href: "/blog" },
      { _key: "mm-contact", label: "Contact", href: "/contact" },
    ],
    phone: "+44 20 0000 0000",
    email: "hello@box3projects.co.uk",
    address: "London, UK",
    contactForm: {
      namePlaceholder: "Name",
      emailPlaceholder: "Email",
      messagePlaceholder: "Tell us about your project...",
      submitLabel: "Send message",
    },
  },
  {
    _id: "siteFooter",
    _type: "siteFooter",
    primaryLinks: [
      { _key: "f-about", label: "About", href: "/about" },
      { _key: "f-services", label: "Services", href: "/services" },
      { _key: "f-projects", label: "Projects", href: "/projects" },
      { _key: "f-clients", label: "Clients", href: "/clients" },
    ],
    secondaryLinks: [
      {
        _key: "f-culture",
        label: "Culture & Careers",
        href: "/culture-and-careers",
      },
      { _key: "f-blog", label: "Blog", href: "/blog" },
      { _key: "f-contact", label: "Contact", href: "/contact" },
    ],
    miscLinks: [{ _key: "f-faq", label: "FAQ", href: "/faq" }],
    socialLinks: [
      {
        _key: "f-instagram",
        label: "Instagram",
        href: "https://instagram.com",
      },
      { _key: "f-linkedin", label: "LinkedIn", href: "https://linkedin.com" },
    ],
    legalLinks: [
      {
        _key: "f-privacy",
        label: "Privacy Policy",
        href: "/privacy-policy",
      },
      {
        _key: "f-terms",
        label: "Terms & Conditions",
        href: "/terms-and-conditions",
      },
    ],
    phone: "+44 20 0000 0000",
    stayInTouchLabel: "Stay In Touch",
    newsletterPlaceholder: "Your email...",
    madeByLabel: "Made by Autara Studio",
    madeByUrl: "https://autarastudio.com",
    copyright: "© 2026. Box 3 Projects Ltd. All Rights Reserved.",
  },
  {
    _id: "homePage",
    _type: "homePage",
    heading: "Fit-Outs Done Differently",
    tagline: "London's trusted commercial fit-out partner.",
  },
  {
    _id: "partnersSection",
    _type: "partnersSection",
    heading: "Trusted By",
    sectionLabel: "Our Partners",
    /* Partner references are attached by the post-seed partner
       migration block below — it creates partner documents and
       rewrites this array as an ordered list of references. */
    partners: [],
  },
  {
    _id: "ourApproachSection",
    _type: "ourApproachSection",
    sectionLabel: "Our process",
    intro: {
      heading: "Built with rigour.\nFinished with craft.",
      text: "Every Box 3 fit-out follows a clear, refined process — bringing precision, transparency, and confidence from initial concept through to final handover.",
    },
    steps: [
      {
        _key: "step-discover",
        title: "1. Discover & design",
        heading: "Your vision,\nmade tangible.",
        text: "We start by understanding your brand, culture, and how your team works. Our design team translates that brief into spatial concepts, materials, and detailed drawings — balancing aesthetics with day-one practicality.",
        layout: "right",
      },
      {
        _key: "step-survey",
        title: "2. Survey & detail",
        heading: "Precision long before the first wall is built.",
        text: "Once the design is signed off, our project surveyors visit site to confirm every measurement, condition, and constraint. We resolve clashes on paper so installation runs without surprises.",
        layout: "left",
      },
      {
        _key: "step-build",
        title: "3. Procure & build",
        heading: "Quality crafted,\non time.",
        text: "Materials are procured from a vetted supplier network and trades are coordinated on a tight programme. Every joinery piece, finish, and service install is QA'd against the design — no shortcuts, no surprises.",
        layout: "right",
      },
    ],
    completion: {
      title: "4. Install & handover",
      heading: "Perfectly fitted,\nbeautifully finished.",
      text: "Our site team manages the install end-to-end, with daily snagging and a final walkthrough before handover. We don't leave until you're ready to move in.",
    },
  },
  {
    _id: "featuredProjectsSection",
    _type: "featuredProjectsSection",
    sectionLabel: "Selected work",
    ctaLabel: "Explore all projects",
    ctaHref: "/projects",
    /* Project references are added by the post-seed patch block
       below (it resolves project docs by title and populates the
       references array only if the section is otherwise empty). */
    projects: [],
  },
  {
    _id: "bannerShowroom",
    _type: "bannerShowroom",
    sectionLabel: "Showroom",
    heading: "A team where quality\nand ambition meet.",
    cursorLabel: "Play",
    /* Videos default to empty — the client pastes direct MP4 URLs
       once the films are hosted. */
    backgroundVideoUrl: "",
    modalVideoUrl: "",
  },
  {
    _id: "homeIntroSection",
    _type: "homeIntroSection",
    body:
      "Box 3 is a London-based commercial fit-out partner building interiors for ambitious businesses. For over a decade we have delivered category-leading workspaces, hospitality venues, and retail environments across the capital — quietly, on time, and to a standard of craft most of our clients say they've never seen before.",
    points: [
      {
        _key: "p-1",
        text:
          "We work as a genuine extension of your team — from first concept through to snag-free handover, with a dedicated project lead and transparent cost reporting from day one.",
      },
      {
        _key: "p-2",
        text:
          "Every project is underwritten by a vetted trade network we've refined over a decade, so the craft you see on site is the craft you signed off in the drawings.",
      },
    ],
  },
  {
    _id: "careersPage",
    _type: "careersPage",
    heading: "Join the Team",
    introduction:
      "At Box 3 Projects, we build spaces that change the way people work, live, and spend time. We are a close-knit team of designers, project managers, and site professionals who care deeply about craft, quality, and getting the details right. If you are looking for a place where your work genuinely matters and where you will be part of something from the very beginning, we would love to hear from you.",
    noVacanciesMessage:
      "We do not have any open roles right now, but we are always interested in hearing from talented people. Send your CV and a brief introduction to careers@box3projects.co.uk and we will be in touch if something comes up.",
  },
];

/* --------------------------------------------------------------------------
   Main
   -------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
   Collection seeders (multi-document types)
   -------------------------------------------------------------------------- */

/** Project categories — auto-ID documents, seeded once.
 *  If any projectCategory already exists, the seed is skipped so the
 *  client's own additions are never overwritten. */
const PROJECT_CATEGORIES: Array<{ title: string; slug: string }> = [
  { title: "Cat A", slug: "cat-a" },
  { title: "Cat B", slug: "cat-b" },
  { title: "Commercial", slug: "commercial" },
  { title: "Residential", slug: "residential" },
  { title: "Hospitality", slug: "hospitality" },
  { title: "Retail", slug: "retail" },
];

async function seedProjectCategories(): Promise<boolean> {
  try {
    const count = await client.fetch<number>(
      `count(*[_type == "projectCategory"])`,
    );

    if (count > 0) {
      console.log(
        `↷ projectCategory already exists (${count} docs) — skipping`,
      );
      return true;
    }

    await Promise.all(
      PROJECT_CATEGORIES.map((c) =>
        client.create({
          _type: "projectCategory",
          title: c.title,
          slug: { _type: "slug", current: c.slug },
        }),
      ),
    );
    console.log(
      `✔ created ${PROJECT_CATEGORIES.length} projectCategory doc(s)`,
    );
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✘ failed to seed projectCategory: ${message}`);
    return false;
  }
}

/* --------------------------------------------------------------------------
   Project seed data — 15 London commercial fit-out projects
   -------------------------------------------------------------------------- */

type Stat = { label: string; value: string };
type SeedProject = {
  title: string;
  slug: string;
  categorySlug: string;
  location: string;
  year: number;
  shortDescription: string;
  tags: string[];
  stats: Stat[];
  clientObjective: string;
  clientFeedback: string;
  expertise: string[];
  team: string[];
};

/* Expertise tags seeded before projects — each project references
   a subset of these titles under its `expertise` field. */
const EXPERTISE: string[] = [
  "Category A Fit-Out",
  "Category B Fit-Out",
  "Interior Design",
  "Space Planning",
  "Project Management",
  "Quantity Surveying",
  "MEP Coordination",
  "Furniture Procurement",
  "Acoustic Design",
  "Lighting Design",
  "Branding & Wayfinding",
  "Structural Works",
];

/* Team members seeded before projects — each project references 2-3
   by name. Image is not seeded — client uploads via Studio. */
const TEAM_MEMBERS: Array<{
  name: string;
  role: string;
  qualifications?: string;
  linkedinUrl?: string;
  order: number;
}> = [
  {
    name: "James Whitfield",
    role: "CEO & Founder",
    qualifications: "BSc (Hons) Construction Management, MCIOB",
    linkedinUrl: "https://www.linkedin.com/",
    order: 1,
  },
  {
    name: "Sarah Chen",
    role: "Head of Design",
    qualifications: "BA (Hons) Interior Architecture, ARB",
    linkedinUrl: "https://www.linkedin.com/",
    order: 2,
  },
  {
    name: "Marcus Reid",
    role: "Senior Project Manager",
    qualifications: "BSc Project Management, PMP, MAPM",
    linkedinUrl: "https://www.linkedin.com/",
    order: 3,
  },
  {
    name: "Priya Sharma",
    role: "Quantity Surveyor",
    qualifications: "BSc (Hons) Quantity Surveying, MRICS",
    linkedinUrl: "https://www.linkedin.com/",
    order: 4,
  },
];

/** Ensures a teamMember document exists for every entry in TEAM_MEMBERS.
 *  Returns a Map from name → document _id so projects can reference them. */
async function seedTeamMembers(): Promise<Map<string, string>> {
  const nameToId = new Map<string, string>();

  try {
    const existing = await client.fetch<Array<{ _id: string; name: string }>>(
      `*[_type == "teamMember"]{ _id, name }`,
    );
    for (const doc of existing) nameToId.set(doc.name, doc._id);

    /* Short-circuit if the dataset already has any teamMember docs —
       the client's own team is authoritative and the baseline
       TEAM_MEMBERS array is only a first-run fallback. Prevents this
       script from appending duplicates on top of the client's roster. */
    if (existing.length > 0) {
      console.log(
        `↷ teamMember already exists (${existing.length} docs) — skipping baseline seed`,
      );
      return nameToId;
    }

    let created = 0;
    for (const m of TEAM_MEMBERS) {
      if (nameToId.has(m.name)) continue;
      const doc = await client.create({
        _type: "teamMember",
        name: m.name,
        role: m.role,
        qualifications: m.qualifications,
        linkedinUrl: m.linkedinUrl,
        order: m.order,
      });
      nameToId.set(m.name, doc._id);
      created += 1;
    }

    if (created > 0) {
      console.log(`✔ created ${created} teamMember doc(s)`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✘ failed to seed teamMember: ${message}`);
  }

  return nameToId;
}

/** Ensures an expertise document exists for every title in EXPERTISE.
 *  Returns a Map from title → document _id so projects can reference them. */
async function seedExpertise(): Promise<Map<string, string>> {
  const titleToId = new Map<string, string>();

  try {
    /* Load anything already in the dataset — lets re-runs be idempotent
       and preserves any client-added tags. */
    const existing = await client.fetch<Array<{ _id: string; title: string }>>(
      `*[_type == "expertise"]{ _id, title }`,
    );
    for (const doc of existing) titleToId.set(doc.title, doc._id);

    let created = 0;
    for (const title of EXPERTISE) {
      if (titleToId.has(title)) continue;
      const doc = await client.create({ _type: "expertise", title });
      titleToId.set(title, doc._id);
      created += 1;
    }

    if (created > 0) {
      console.log(`✔ created ${created} expertise doc(s)`);
    } else {
      console.log(
        `↷ expertise already exists (${titleToId.size} docs) — skipping`,
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✘ failed to seed expertise: ${message}`);
  }

  return titleToId;
}

const PROJECTS: SeedProject[] = [
  {
    title: "The Workspace, Mayfair",
    slug: "the-workspace-mayfair",
    categorySlug: "commercial",
    location: "Mayfair, London",
    year: 2024,
    shortDescription:
      "A complete Cat A fit-out for a premium Mayfair office building delivering 12,000 sq ft of contemporary workspace across four floors.",
    tags: ["Office", "Cat A", "Fit-Out", "Luxury", "Mayfair"],
    stats: [
      { label: "Client", value: "Confidential" },
      { label: "Location", value: "Mayfair, London" },
      { label: "Size", value: "12,000 sq ft" },
      { label: "Completed", value: "March 2024" },
      { label: "Project Cost", value: "£2.4M" },
      { label: "Project Type", value: "Cat A Fit-Out" },
      { label: "Floors", value: "4" },
    ],
    clientObjective:
      "Create a best-in-class workspace that attracts premium tenants and reflects the building's Mayfair location. The brief called for generous ceiling heights, high-specification finishes, and flexible floorplates.",
    clientFeedback:
      "Box 3 delivered exactly what we envisioned — a space that sets a new benchmark for commercial fit-out in this part of London.",
    expertise: [
      "Category A Fit-Out",
      "Project Management",
      "MEP Coordination",
      "Space Planning",
    ],
    team: [
      "James Whitfield",
      "Sarah Chen",
      "Marcus Reid",
    ],
  },
  {
    title: "Canary Wharf Trading Floor",
    slug: "canary-wharf-trading-floor",
    categorySlug: "cat-a",
    location: "Canary Wharf, London",
    year: 2023,
    shortDescription:
      "High-spec Cat A trading floor fit-out for a major financial institution, covering 25,000 sq ft across two interconnected floors.",
    tags: ["Trading Floor", "Cat A", "Finance", "Large Scale"],
    stats: [
      { label: "Client", value: "Confidential" },
      { label: "Location", value: "Canary Wharf, London" },
      { label: "Size", value: "25,000 sq ft" },
      { label: "Completed", value: "September 2023" },
      { label: "Project Cost", value: "£4.2M" },
      { label: "Project Type", value: "Cat A Trading Floor" },
      { label: "Floors", value: "2" },
      { label: "Workstations", value: "450" },
    ],
    clientObjective:
      "Deliver a resilient, high-performance trading environment capable of supporting 450 workstations with full redundancy, raised flooring, and a 24/7 operational brief.",
    clientFeedback:
      "Delivered on an incredibly tight programme without a single day of delay. The quality of the finished floor exceeded our expectations.",
    expertise: [
      "Category A Fit-Out",
      "Project Management",
      "MEP Coordination",
      "Structural Works",
    ],
    team: [
      "James Whitfield",
      "Marcus Reid",
      "Priya Sharma",
    ],
  },
  {
    title: "Shoreditch Creative Hub",
    slug: "shoreditch-creative-hub",
    categorySlug: "cat-b",
    location: "Shoreditch, London",
    year: 2024,
    shortDescription:
      "A full Cat B fit-out for a fast-growing tech startup, transforming a raw shell into a vibrant 3,500 sq ft creative workspace.",
    tags: ["Cat B", "Tech", "Creative", "Shoreditch"],
    stats: [
      { label: "Client", value: "Tech Startup (Confidential)" },
      { label: "Location", value: "Shoreditch, London" },
      { label: "Size", value: "3,500 sq ft" },
      { label: "Completed", value: "January 2024" },
      { label: "Project Cost", value: "£520k" },
      { label: "Project Type", value: "Cat B Fit-Out" },
      { label: "Workstations", value: "60" },
      { label: "Meeting Rooms", value: "4" },
      { label: "Breakout Spaces", value: "2" },
    ],
    clientObjective:
      "Transform a blank canvas into a workspace that reflects our brand identity, supports hybrid working, and creates genuine excitement for the team every time they come in.",
    clientFeedback:
      "Our team absolutely loves the space. Box 3 understood the brief from day one and delivered something beyond what we imagined.",
    expertise: [
      "Category B Fit-Out",
      "Interior Design",
      "Space Planning",
      "Furniture Procurement",
    ],
    team: [
      "Sarah Chen",
      "Priya Sharma",
    ],
  },
  {
    title: "Chelsea Private Residence",
    slug: "chelsea-private-residence",
    categorySlug: "residential",
    location: "Chelsea, London",
    year: 2022,
    shortDescription:
      "A full interior fit-out of a five-storey Chelsea townhouse, combining period features with a refined contemporary aesthetic across 6,800 sq ft.",
    tags: ["Residential", "Luxury", "Chelsea", "Townhouse"],
    stats: [
      { label: "Client", value: "Private" },
      { label: "Location", value: "Chelsea, London" },
      { label: "Size", value: "6,800 sq ft" },
      { label: "Completed", value: "June 2022" },
      { label: "Project Cost", value: "£1.8M" },
      { label: "Project Type", value: "Residential Fit-Out" },
      { label: "Floors", value: "5" },
      { label: "Timeline", value: "14 months" },
    ],
    clientObjective:
      "Restore and refurbish a Grade II listed Chelsea townhouse while introducing a thoroughly modern interior that respects the building's heritage and suits a young family.",
    clientFeedback:
      "An exceptional team — meticulous, communicative, and genuinely invested in getting every detail right.",
    expertise: [
      "Interior Design",
      "Project Management",
      "Lighting Design",
      "Furniture Procurement",
    ],
    team: [
      "Sarah Chen",
      "Marcus Reid",
    ],
  },
  {
    title: "The Clerkenwell Members Club",
    slug: "the-clerkenwell-members-club",
    categorySlug: "hospitality",
    location: "Clerkenwell, London",
    year: 2023,
    shortDescription:
      "End-to-end fit-out of a premium members club spanning bar, restaurant, private dining, and co-working areas across 8,200 sq ft.",
    tags: ["Hospitality", "Members Club", "Restaurant", "Bar"],
    stats: [
      { label: "Client", value: "Private Members Club" },
      { label: "Location", value: "Clerkenwell, London" },
      { label: "Size", value: "8,200 sq ft" },
      { label: "Completed", value: "November 2023" },
      { label: "Project Cost", value: "£2.1M" },
      { label: "Project Type", value: "Hospitality Fit-Out" },
      { label: "Covers", value: "120" },
      { label: "Private Dining Rooms", value: "3" },
      { label: "Timeline", value: "11 months" },
    ],
    clientObjective:
      "Create an atmosphere that feels exclusive yet welcoming — somewhere members genuinely want to spend time, whether working, dining, or socialising.",
    clientFeedback:
      "The space has become a genuine destination for our members. Box 3 captured exactly the feeling we were after — warm, considered, and completely distinctive.",
    expertise: [
      "Interior Design",
      "Space Planning",
      "Lighting Design",
      "Acoustic Design",
    ],
    team: [
      "Sarah Chen",
      "Marcus Reid",
      "Priya Sharma",
    ],
  },
  {
    title: "Knightsbridge Flagship Retail",
    slug: "knightsbridge-flagship-retail",
    categorySlug: "retail",
    location: "Knightsbridge, London",
    year: 2022,
    shortDescription:
      "Luxury retail fit-out for an international fashion house on Brompton Road, creating an immersive 4,200 sq ft brand environment.",
    tags: ["Retail", "Luxury", "Fashion", "Knightsbridge"],
    stats: [
      { label: "Client", value: "International Fashion House" },
      { label: "Location", value: "Knightsbridge, London" },
      { label: "Size", value: "4,200 sq ft" },
      { label: "Completed", value: "February 2022" },
      { label: "Project Cost", value: "£1.3M" },
      { label: "Project Type", value: "Retail Fit-Out" },
      { label: "Fitting Rooms", value: "12" },
      { label: "Timeline", value: "8 months" },
    ],
    clientObjective:
      "Deliver a retail environment that embodies the brand's heritage while creating a modern, immersive shopping experience for a discerning Knightsbridge clientele.",
    clientFeedback:
      "A flawless execution of a complex brief. The attention to detail in every finish was exactly what our brand demands.",
    expertise: [
      "Interior Design",
      "Branding & Wayfinding",
      "Lighting Design",
      "Furniture Procurement",
    ],
    team: [
      "Sarah Chen",
      "Priya Sharma",
    ],
  },
  {
    title: "Victoria Government Offices",
    slug: "victoria-government-offices",
    categorySlug: "cat-a",
    location: "Victoria, London",
    year: 2021,
    shortDescription:
      "Large-scale Cat A office fit-out for a government department, delivering modern open-plan workspace for over 600 staff across 18,000 sq ft.",
    tags: ["Cat A", "Government", "Office", "Large Scale"],
    stats: [
      { label: "Client", value: "Government Department" },
      { label: "Location", value: "Victoria, London" },
      { label: "Size", value: "18,000 sq ft" },
      { label: "Completed", value: "August 2021" },
      { label: "Project Cost", value: "£2.9M" },
      { label: "Project Type", value: "Cat A Office Fit-Out" },
      { label: "Workstations", value: "620" },
      { label: "Floors", value: "3" },
      { label: "Building Grade", value: "Grade A" },
    ],
    clientObjective:
      "Modernise a dated government estate to meet new hybrid working standards, improve staff wellbeing, and achieve a BREEAM Excellent rating.",
    clientFeedback:
      "Delivered to programme and within budget — exactly what you need on a public sector project of this scale.",
    expertise: [
      "Category A Fit-Out",
      "Project Management",
      "MEP Coordination",
      "Quantity Surveying",
    ],
    team: [
      "James Whitfield",
      "Marcus Reid",
      "Priya Sharma",
    ],
  },
  {
    title: "Soho Film Production Studio",
    slug: "soho-film-production-studio",
    categorySlug: "commercial",
    location: "Soho, London",
    year: 2023,
    shortDescription:
      "Specialist fit-out of a multi-suite film post-production facility in the heart of Soho, covering 2,800 sq ft with bespoke acoustic requirements.",
    tags: ["Commercial", "Studio", "Film", "Soho", "Acoustic"],
    stats: [
      { label: "Client", value: "Post-Production Company" },
      { label: "Location", value: "Soho, London" },
      { label: "Size", value: "2,800 sq ft" },
      { label: "Completed", value: "April 2023" },
      { label: "Project Cost", value: "£680k" },
      { label: "Project Type", value: "Specialist Commercial Fit-Out" },
      { label: "Suites", value: "6" },
      { label: "Timeline", value: "7 months" },
    ],
    clientObjective:
      "Convert a conventional office floor into a world-class post-production facility with six acoustically isolated suites, a colour grade room, and a communal creative lounge.",
    clientFeedback:
      "The acoustic performance is outstanding. Box 3 worked closely with our acoustic consultant throughout and the result is genuinely impressive.",
    expertise: [
      "Acoustic Design",
      "MEP Coordination",
      "Project Management",
      "Interior Design",
    ],
    team: [
      "Sarah Chen",
      "Marcus Reid",
    ],
  },
  {
    title: "Kings Cross Tech Campus",
    slug: "kings-cross-tech-campus",
    categorySlug: "cat-b",
    location: "Kings Cross, London",
    year: 2024,
    shortDescription:
      "Cat B fit-out across two floors of a landmark Kings Cross development for a global technology company, totalling 14,500 sq ft.",
    tags: ["Cat B", "Tech", "Office", "Kings Cross", "Large Scale"],
    stats: [
      { label: "Client", value: "Global Technology Company" },
      { label: "Location", value: "Kings Cross, London" },
      { label: "Size", value: "14,500 sq ft" },
      { label: "Completed", value: "May 2024" },
      { label: "Project Cost", value: "£2.2M" },
      { label: "Project Type", value: "Cat B Office Fit-Out" },
      { label: "Workstations", value: "280" },
      { label: "Meeting Rooms", value: "12" },
      { label: "Breakout Spaces", value: "6" },
      { label: "Floors", value: "2" },
    ],
    clientObjective:
      "Create a flagship London office that reflects our global brand standards while giving local teams a space that encourages collaboration and in-person connection.",
    clientFeedback:
      "The team managed the complexity of a live programme exceptionally well. The finished space is everything we wanted our London home to be.",
    expertise: [
      "Category B Fit-Out",
      "Interior Design",
      "Space Planning",
      "Furniture Procurement",
    ],
    team: [
      "James Whitfield",
      "Sarah Chen",
      "Marcus Reid",
    ],
  },
  {
    title: "Fitzrovia Boutique Hotel Rooms",
    slug: "fitzrovia-boutique-hotel-rooms",
    categorySlug: "hospitality",
    location: "Fitzrovia, London",
    year: 2022,
    shortDescription:
      "Full fit-out of 42 boutique hotel rooms and suites for an independent hotel group, with bespoke joinery and FF&E throughout.",
    tags: ["Hospitality", "Hotel", "Boutique", "Fitzrovia"],
    stats: [
      { label: "Client", value: "Independent Hotel Group" },
      { label: "Location", value: "Fitzrovia, London" },
      { label: "Rooms", value: "42" },
      { label: "Completed", value: "October 2022" },
      { label: "Project Cost", value: "£1.6M" },
      { label: "Project Type", value: "Hotel Fit-Out" },
      { label: "Timeline", value: "10 months" },
      { label: "Suites", value: "6" },
    ],
    clientObjective:
      "Deliver individually finished rooms that feel genuinely boutique — each space considered and crafted, not formulaic. The guest must feel the quality the moment they open the door.",
    clientFeedback:
      "Our guests consistently comment on the quality of the rooms. Box 3 brought real craft to the project.",
    expertise: [
      "Interior Design",
      "Lighting Design",
      "Furniture Procurement",
      "Project Management",
    ],
    team: [
      "Sarah Chen",
      "Marcus Reid",
    ],
  },
  {
    title: "Islington Residential Conversion",
    slug: "islington-residential-conversion",
    categorySlug: "residential",
    location: "Islington, London",
    year: 2023,
    shortDescription:
      "Conversion of a former Victorian warehouse into four high-specification residential apartments across 5,600 sq ft in Islington.",
    tags: ["Residential", "Conversion", "Islington", "Victorian"],
    stats: [
      { label: "Client", value: "Private Developer" },
      { label: "Location", value: "Islington, London" },
      { label: "Size", value: "5,600 sq ft" },
      { label: "Completed", value: "July 2023" },
      { label: "Project Cost", value: "£1.1M" },
      { label: "Project Type", value: "Residential Conversion" },
      { label: "Units", value: "4" },
      { label: "Timeline", value: "12 months" },
    ],
    clientObjective:
      "Sensitively convert a Victorian warehouse into four premium apartments that celebrate the industrial heritage of the building while delivering a luxury residential product.",
    clientFeedback:
      "All four units sold off-plan before completion. The quality of the fit-out was a key part of that story.",
    expertise: [
      "Structural Works",
      "Interior Design",
      "Project Management",
      "MEP Coordination",
    ],
    team: [
      "Marcus Reid",
      "Priya Sharma",
    ],
  },
  {
    title: "Greenwich Waterfront Restaurant",
    slug: "greenwich-waterfront-restaurant",
    categorySlug: "hospitality",
    location: "Greenwich, London",
    year: 2021,
    shortDescription:
      "Full fit-out of a 120-cover waterfront restaurant in Greenwich, incorporating an open kitchen, private dining room, and riverside terrace.",
    tags: ["Hospitality", "Restaurant", "Greenwich", "Waterfront"],
    stats: [
      { label: "Client", value: "Restaurant Group" },
      { label: "Location", value: "Greenwich, London" },
      { label: "Covers", value: "120" },
      { label: "Completed", value: "December 2021" },
      { label: "Project Cost", value: "£890k" },
      { label: "Project Type", value: "Restaurant Fit-Out" },
      { label: "Private Dining", value: "Yes" },
      { label: "Timeline", value: "9 months" },
    ],
    clientObjective:
      "Create a destination restaurant that makes the most of the extraordinary riverside setting — every seat should feel connected to the view and the water.",
    clientFeedback:
      "Box 3 understood immediately that the setting was the star of the show and designed every element around it.",
    expertise: [
      "Interior Design",
      "Lighting Design",
      "Acoustic Design",
      "MEP Coordination",
    ],
    team: [
      "Sarah Chen",
      "Priya Sharma",
    ],
  },
  {
    title: "City of London Law Firm",
    slug: "city-of-london-law-firm",
    categorySlug: "cat-b",
    location: "The City, London",
    year: 2024,
    shortDescription:
      "Cat B fit-out for a leading international law firm, creating a sophisticated 9,800 sq ft working environment with formal client-facing spaces.",
    tags: ["Cat B", "Legal", "Professional Services", "City"],
    stats: [
      { label: "Client", value: "International Law Firm" },
      { label: "Location", value: "The City, London" },
      { label: "Size", value: "9,800 sq ft" },
      { label: "Completed", value: "February 2024" },
      { label: "Project Cost", value: "£1.75M" },
      { label: "Project Type", value: "Cat B Office Fit-Out" },
      { label: "Meeting Rooms", value: "8" },
      { label: "Partner Offices", value: "12" },
      { label: "Reception Area", value: "Yes" },
    ],
    clientObjective:
      "Create a workspace that projects authority and confidence to clients while providing partners and associates with a genuinely comfortable and productive environment.",
    clientFeedback:
      "The partner offices and client suite have transformed how we present ourselves. An outstanding result.",
    expertise: [
      "Category B Fit-Out",
      "Interior Design",
      "Project Management",
      "Furniture Procurement",
    ],
    team: [
      "James Whitfield",
      "Marcus Reid",
    ],
  },
  {
    title: "Shoreditch Coworking Space",
    slug: "shoreditch-coworking-space",
    categorySlug: "commercial",
    location: "Shoreditch, London",
    year: 2022,
    shortDescription:
      "A 7,400 sq ft coworking and flexible office development in Shoreditch, designed for a property developer entering the flex-space market.",
    tags: ["Coworking", "Flex Space", "Commercial", "Shoreditch"],
    stats: [
      { label: "Client", value: "Property Developer" },
      { label: "Location", value: "Shoreditch, London" },
      { label: "Size", value: "7,400 sq ft" },
      { label: "Completed", value: "May 2022" },
      { label: "Project Cost", value: "£980k" },
      { label: "Project Type", value: "Coworking Fit-Out" },
      { label: "Workstations", value: "140" },
      { label: "Private Offices", value: "8" },
      { label: "Meeting Rooms", value: "6" },
      { label: "Occupancy", value: "95%" },
    ],
    clientObjective:
      "Develop a flexible workspace product that competes with the best coworking operators in the market — a space that members are proud to bring clients to.",
    clientFeedback:
      "We were at 95% occupancy within six weeks of opening. The quality of the fit-out made all the difference.",
    expertise: [
      "Category B Fit-Out",
      "Interior Design",
      "Space Planning",
      "Branding & Wayfinding",
    ],
    team: [
      "Sarah Chen",
      "Marcus Reid",
    ],
  },
  {
    title: "Mayfair Private Members Gym",
    slug: "mayfair-private-members-gym",
    categorySlug: "hospitality",
    location: "Mayfair, London",
    year: 2023,
    shortDescription:
      "Luxury private gym fit-out in Mayfair for an ultra-high-net-worth members club, covering 2,200 sq ft with bespoke treatment rooms and recovery facilities.",
    tags: ["Hospitality", "Gym", "Wellness", "Luxury", "Mayfair"],
    stats: [
      { label: "Client", value: "Private Members Club" },
      { label: "Location", value: "Mayfair, London" },
      { label: "Size", value: "2,200 sq ft" },
      { label: "Completed", value: "August 2023" },
      { label: "Project Cost", value: "£760k" },
      { label: "Project Type", value: "Wellness Fit-Out" },
      { label: "Treatment Rooms", value: "4" },
      { label: "Members", value: "80" },
      { label: "Timeline", value: "6 months" },
    ],
    clientObjective:
      "Create the most refined private gym experience in London — a space where every material, every detail, and every finish reinforces the exclusivity of the membership.",
    clientFeedback:
      "Our members describe it as the best private gym they have ever used. Box 3 delivered exactly the atmosphere we were looking for.",
    expertise: [
      "Interior Design",
      "Lighting Design",
      "MEP Coordination",
      "Acoustic Design",
    ],
    team: [
      "Sarah Chen",
      "Priya Sharma",
    ],
  },
];

async function seedProjects(
  expertiseMap: Map<string, string>,
  teamMap: Map<string, string>,
): Promise<{ created: number; total: number }> {
  const total = PROJECTS.length;

  /* Helper: build the expertise reference array for a given project. */
  const buildExpertiseRefs = (titles: string[]) =>
    titles
      .map((t, i) => {
        const id = expertiseMap.get(t);
        if (!id) return null;
        return {
          _key: `exp-${i + 1}`,
          _type: "reference" as const,
          _ref: id,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

  /* Helper: build the team reference array for a given project. */
  const buildTeamRefs = (names: string[]) =>
    names
      .map((n, i) => {
        const id = teamMap.get(n);
        if (!id) return null;
        return {
          _key: `team-${i + 1}`,
          _type: "reference" as const,
          _ref: id,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

  try {
    const existingCount = await client.fetch<number>(
      `count(*[_type == "project"])`,
    );

    /* Short-circuit if the dataset already has projects — the client
       is authoritative. The baseline PROJECTS array is a first-run
       fallback only, and running it later appends duplicates on top
       of the client's real projects. */
    if (existingCount > 0) {
      console.log(
        `↷ project already exists (${existingCount} docs) — skipping baseline seed`,
      );
      return { created: 0, total: PROJECTS.length };
    }

    /* Resolve all category _ids up-front. */
    const cats = await client.fetch<
      Array<{ _id: string; slug: { current: string } }>
    >(`*[_type == "projectCategory"] { _id, slug }`);
    const catId = (slug: string) =>
      cats.find((c) => c.slug.current === slug)?._id;

    let created = 0;
    let patched = 0;

    for (const p of PROJECTS) {
      try {
        /* Skip create but still patch expertise/team if a project exists. */
        const existing = await client.fetch<
          {
            _id: string;
            expertise?: unknown[];
            team?: unknown[];
          } | null
        >(
          `*[_type == "project" && slug.current == $slug][0]{_id, expertise, team}`,
          { slug: p.slug },
        );

        if (existing) {
          const patchSet: Record<string, unknown> = {};

          if (!existing.expertise || existing.expertise.length === 0) {
            const refs = buildExpertiseRefs(p.expertise);
            if (refs.length > 0) patchSet.expertise = refs;
          }

          if (!existing.team || existing.team.length === 0) {
            const refs = buildTeamRefs(p.team);
            if (refs.length > 0) patchSet.team = refs;
          }

          if (Object.keys(patchSet).length > 0) {
            await client.patch(existing._id).set(patchSet).commit();
            console.log(
              `✔ patched ${Object.keys(patchSet).join(" + ")} on "${p.title}"`,
            );
            patched += 1;
          } else {
            console.log(`↷ project "${p.title}" already exists — skipping`);
          }
          continue;
        }

        const ref = catId(p.categorySlug);
        if (!ref) {
          console.warn(
            `⚠ category "${p.categorySlug}" not found — skipping ${p.title}`,
          );
          continue;
        }

        await client.create({
          _type: "project",
          title: p.title,
          slug: { _type: "slug", current: p.slug },
          category: { _type: "reference", _ref: ref },
          shortDescription: p.shortDescription,
          location: p.location,
          year: p.year,
          tags: p.tags,
          expertise: buildExpertiseRefs(p.expertise),
          team: buildTeamRefs(p.team),
          stats: p.stats.map((s, i) => ({
            _key: `s${i + 1}`,
            label: s.label,
            value: s.value,
          })),
          clientObjective: p.clientObjective,
          clientFeedback: p.clientFeedback,
        });

        console.log(`✔ created project "${p.title}"`);
        created += 1;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`✘ failed to seed project "${p.title}": ${message}`);
      }
    }

    console.log(
      `\nProjects: ${created}/${total} created, ${patched} patched (of ${existingCount} pre-existing)`,
    );
    return { created, total };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✘ failed to seed projects: ${message}`);
    return { created: 0, total };
  }
}

/* --------------------------------------------------------------------------
   Vacancies — 7 open roles
   -------------------------------------------------------------------------- */

type SeedVacancy = {
  title: string;
  department: string;
  location: string;
  type: string;
  salary?: string;
  summary: string;
  aboutTheRole: string;
  whatWereLookingFor: string;
  whatWeOffer: string;
  applyEmail: string;
  isActive: boolean;
};

const VACANCIES: SeedVacancy[] = [
  {
    title: "Senior Project Manager",
    department: "Project Management",
    location: "Hybrid",
    type: "Full Time",
    salary: "£55,000 – £70,000",
    summary:
      "We are looking for an experienced Senior Project Manager to lead high-value commercial fit-out projects from inception to handover. You will be the key point of contact for our clients and the glue that holds the project team together on site.",
    aboutTheRole:
      "As Senior Project Manager you will take full ownership of projects typically ranging from £500k to £3M, managing programme, budget, and client relationships throughout. You will work closely with our design team in the early stages, appoint and manage subcontractors, chair regular progress meetings, and ensure every project is delivered on time and to the quality our clients expect. A typical week will see you splitting time between our Fitzrovia studio, client meetings, and site visits across London.",
    whatWereLookingFor:
      "You will have at least five years of project management experience in commercial fit-out or a closely related field, with a track record of delivering projects above £500k. You are confident in client-facing situations, comfortable reading and interpreting contract documents, and you naturally bring calm and clarity to complex situations. Experience with JCT contracts and familiarity with BREEAM requirements would be a bonus.",
    whatWeOffer:
      "A competitive salary, 28 days holiday, flexible hybrid working, and genuine opportunity to grow with a business that is scaling quickly. You will work directly with the founding team and have real influence over how we develop our project management approach. We invest in our people — training, professional development, and the tools you need to do your best work.",
    applyEmail: "careers@box3projects.co.uk",
    isActive: true,
  },
  {
    title: "Interior Designer",
    department: "Design",
    location: "Hybrid",
    type: "Full Time",
    salary: "£35,000 – £45,000",
    summary:
      "We are after a talented Interior Designer with a passion for commercial spaces to join our growing design team. You will work on projects ranging from boutique hospitality venues to large-scale office fit-outs across London.",
    aboutTheRole:
      "Working within our design team you will be involved in projects from initial concept through to technical design and site delivery. You will develop space plans, mood boards, material palettes, and detailed drawings using AutoCAD and the Adobe suite. You will present concepts directly to clients, respond to feedback, and work closely with our project managers to ensure design intent is realised on site. No two weeks look the same — you might be pitching a hospitality concept on Monday and reviewing joinery shop drawings on Thursday.",
    whatWereLookingFor:
      "You will have two to four years of experience in commercial interior design, a strong portfolio demonstrating design thinking across different typologies, and confident technical drawing skills. You care about the details — finishes, junctions, and specifications — as much as the big concept. Experience in hospitality or workplace design is particularly welcome.",
    whatWeOffer:
      "A creative and supportive team environment, genuine variety in the projects you work on, and the chance to see your designs built and delivered. We offer flexible working, a dedicated training budget, and regular studio away days. You will have a real voice in how our design practice develops.",
    applyEmail: "careers@box3projects.co.uk",
    isActive: true,
  },
  {
    title: "Site Manager",
    department: "Construction",
    location: "Site-Based",
    type: "Full Time",
    salary: "£45,000 – £58,000",
    summary:
      "We are looking for a skilled and organised Site Manager to oversee the day-to-day running of our fit-out projects across London. You will be the Box 3 presence on site — ensuring quality, safety, and programme are all on track.",
    aboutTheRole:
      "As Site Manager you will be responsible for the day-to-day management of fit-out projects from strip-out through to final snagging. You will coordinate subcontractors, manage deliveries, conduct daily briefings, maintain the site diary, and produce weekly progress reports. You will work closely with our Project Managers to flag risks early and keep the programme on track. You will be the person our clients see most on site, so professionalism and clear communication are as important as your technical knowledge.",
    whatWereLookingFor:
      "You will have a minimum of three years experience managing fit-out or refurbishment projects on site, hold a valid SMSTS certificate and First Aid qualification, and have a thorough understanding of current health and safety legislation. You are methodical, self-sufficient, and take genuine pride in delivering a clean, safe, and well-run site.",
    whatWeOffer:
      "A stable pipeline of interesting projects, a competitive salary with regular reviews, van and fuel card, 28 days holiday, and a team that respects the work you do on the ground. We are a business that promotes from within — several of our senior team started in site management roles.",
    applyEmail: "careers@box3projects.co.uk",
    isActive: true,
  },
  {
    title: "Business Development Manager",
    department: "Business Development",
    location: "Hybrid",
    type: "Full Time",
    salary: "£50,000 – £65,000 + commission",
    summary:
      "A rare opportunity to join Box 3 at an exciting point in our growth and take ownership of new business development across commercial, hospitality, and residential sectors. You will be building genuine long-term relationships, not chasing cold leads.",
    aboutTheRole:
      "You will identify, develop, and convert new client relationships across our target sectors, working closely with the founding team to define and execute our BD strategy. This is not a traditional sales role — it is about building trust with architects, developers, agents, and end occupiers over time. You will attend industry events, manage our pipeline in the CRM, lead on tender submissions, and contribute to how we position the business in the market. You will have genuine autonomy and direct access to the directors.",
    whatWereLookingFor:
      "You will have experience in business development within the built environment — ideally fit-out, construction, or a related professional services firm. You understand how decisions are made in commercial property and you are comfortable operating at senior levels. You are a natural relationship builder who plays a long game, and you can point to tangible new business you have won.",
    whatWeOffer:
      "A competitive base salary with an uncapped commission structure, genuine influence over the direction of the business, flexible hybrid working, and the energy of a growing company where your contribution is immediately visible. We offer 28 days holiday, a personal development budget, and regular team events.",
    applyEmail: "careers@box3projects.co.uk",
    isActive: true,
  },
  {
    title: "Junior Designer",
    department: "Design",
    location: "Hybrid",
    type: "Full Time",
    salary: "£26,000 – £32,000",
    summary:
      "We are looking for a creative and motivated Junior Designer to support our design team across a range of exciting commercial fit-out projects. This is a brilliant opportunity to develop your career in a hands-on, supportive environment.",
    aboutTheRole:
      "As a Junior Designer you will support the wider design team with concept development, material research, presentation preparation, and technical drawing. You will learn by doing — working on live projects from your first week and getting regular feedback from senior designers. You will develop skills across AutoCAD, Adobe Creative Suite, and SketchUp, and you will have the opportunity to attend site visits and client meetings as you grow in confidence.",
    whatWereLookingFor:
      "You will have a degree in interior design, architecture, or a related discipline, and a portfolio that demonstrates strong visual thinking and attention to detail. You do not need years of experience — we are looking for curiosity, a genuine passion for interiors, and a willingness to get stuck in. Some working knowledge of AutoCAD or a similar CAD tool is helpful.",
    whatWeOffer:
      "Structured mentorship from senior designers, a genuine career path within our growing design team, and exposure to a diverse range of project types from your very first month. We offer flexible hybrid working, 25 days holiday, a training budget, and a studio culture that takes creativity seriously.",
    applyEmail: "careers@box3projects.co.uk",
    isActive: true,
  },
  {
    title: "Quantity Surveyor",
    department: "Operations",
    location: "Hybrid",
    type: "Full Time",
    salary: "£45,000 – £60,000",
    summary:
      "We are seeking an experienced Quantity Surveyor to join our operations team and take ownership of commercial management across a portfolio of fit-out projects. You will play a central role in protecting margin and ensuring our projects are commercially sound from tender through to final account.",
    aboutTheRole:
      "You will be responsible for preparing and reviewing tender packages, negotiating with subcontractors, managing valuations and variations, and agreeing final accounts. You will work closely with our Project Managers to provide accurate cost reporting throughout the project lifecycle and flag commercial risks early. You will also contribute to our estimating process, helping us price new opportunities accurately and competitively.",
    whatWereLookingFor:
      "You will have at least three years of QS experience within fit-out or construction, a strong understanding of JCT contract forms, and the confidence to negotiate effectively with subcontractors and clients. You are highly organised, commercially astute, and you produce clear and accurate cost reports that project managers and directors can rely on.",
    whatWeOffer:
      "A competitive salary, 28 days holiday, flexible hybrid working, and the chance to work across a genuinely varied and interesting project portfolio. We are a close team where the QS function has a real voice, and we invest in the professional development of everyone who joins us.",
    applyEmail: "careers@box3projects.co.uk",
    isActive: true,
  },
  {
    title: "Marketing Coordinator",
    department: "Marketing",
    location: "Hybrid",
    type: "Full Time",
    salary: "£28,000 – £36,000",
    summary:
      "We are looking for a creative and organised Marketing Coordinator to help us tell the Box 3 story. You will work across our digital presence, project photography, award submissions, and social content to build a brand that reflects the quality of our work.",
    aboutTheRole:
      "You will manage our social media channels, write copy for the website and case studies, coordinate project photography and video shoots, and support award and press submissions. You will work closely with the directors and design team to ensure our marketing output genuinely reflects the quality and character of what we build. You will also help plan and coordinate industry events and client entertainment. This is a varied, hands-on role with real creative scope.",
    whatWereLookingFor:
      "You will have one to three years of marketing experience, ideally within the built environment, architecture, or a design-led business. You write clearly and with personality, you have a good eye for visual content, and you are comfortable managing multiple workstreams at once. Experience with social media management, basic graphic design tools, and CMS platforms is essential.",
    whatWeOffer:
      "A creative role with genuine variety, the chance to shape the brand of a fast-growing business, 25 days holiday, a flexible hybrid working pattern, and a training budget you can actually use. You will be part of a small, ambitious team where good ideas get acted on quickly.",
    applyEmail: "careers@box3projects.co.uk",
    isActive: true,
  },
];

async function seedVacancies(): Promise<{ created: number; total: number }> {
  const total = VACANCIES.length;

  try {
    const existingCount = await client.fetch<number>(
      `count(*[_type == "vacancy"])`,
    );

    if (existingCount >= total) {
      console.log(
        `↷ vacancies already seeded (${existingCount} docs) — skipping`,
      );
      return { created: 0, total };
    }

    let created = 0;

    for (const v of VACANCIES) {
      try {
        /* Skip if a vacancy with this title already exists. */
        const existingId = await client.fetch<string | null>(
          `*[_type == "vacancy" && title == $title][0]._id`,
          { title: v.title },
        );
        if (existingId) {
          console.log(`↷ vacancy "${v.title}" already exists — skipping`);
          continue;
        }

        await client.create({
          _type: "vacancy",
          title: v.title,
          department: v.department,
          location: v.location,
          type: v.type,
          salary: v.salary,
          summary: v.summary,
          aboutTheRole: v.aboutTheRole,
          whatWereLookingFor: v.whatWereLookingFor,
          whatWeOffer: v.whatWeOffer,
          applyEmail: v.applyEmail,
          isActive: v.isActive,
        });

        console.log(`✔ created vacancy "${v.title}"`);
        created += 1;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`✘ failed to seed vacancy "${v.title}": ${message}`);
      }
    }

    console.log(`\nVacancies seeded: ${created}/${total}`);
    return { created, total };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✘ failed to seed vacancies: ${message}`);
    return { created: 0, total };
  }
}

/* --------------------------------------------------------------------------
   Partners — seed partner documents and wire the partnersSection
   singleton to reference them.
   -------------------------------------------------------------------------- */

const PARTNER_NAMES: string[] = [
  "Nike",
  "Hugo Boss",
  "Meta",
  "Warner Music Group",
  "Mastercard",
  "Gensler",
  "Skanska",
  "Walmart",
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

async function seedPartners(): Promise<Map<string, string>> {
  const nameToId = new Map<string, string>();
  try {
    const existing = await client.fetch<Array<{ _id: string; name: string }>>(
      `*[_type == "partner"]{ _id, name }`,
    );
    for (const doc of existing) nameToId.set(doc.name, doc._id);

    /* Short-circuit if the dataset already has partner docs — the
       client's partners are authoritative. PARTNER_NAMES is only a
       first-run fallback. */
    if (existing.length > 0) {
      console.log(
        `↷ partner already exists (${existing.length} docs) — skipping baseline seed`,
      );
      return nameToId;
    }

    let created = 0;
    for (const name of PARTNER_NAMES) {
      if (nameToId.has(name)) continue;
      const doc = await client.create({
        _type: "partner",
        name,
        slug: { _type: "slug", current: slugify(name) },
      });
      nameToId.set(name, doc._id);
      created += 1;
    }

    if (created > 0) {
      console.log(`✔ created ${created} partner doc(s)`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✘ failed to seed partners: ${message}`);
  }
  return nameToId;
}

async function patchPartnersSectionRefs(
  partnerMap: Map<string, string>,
): Promise<void> {
  try {
    const current = await client.fetch<{ partners?: unknown[] } | null>(
      '*[_id == "partnersSection"][0]{partners}',
    );
    if (current?.partners && current.partners.length > 0) {
      console.log(
        `↷ partnersSection already has ${current.partners.length} partner ref(s) — leaving alone`,
      );
      return;
    }

    const refs = PARTNER_NAMES
      .map((name, i) => {
        const id = partnerMap.get(name);
        if (!id) return null;
        return {
          _key: `p-${i}`,
          _type: "reference" as const,
          _ref: id,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (refs.length === 0) return;

    await client.patch("partnersSection").set({ partners: refs }).commit();
    console.log(`✔ patched partnersSection with ${refs.length} partner refs`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✘ failed to patch partnersSection partners: ${message}`);
  }
}

/* --------------------------------------------------------------------------
   Testimonials — seed testimonial documents and attach them to the
   home page (1 quote) and every project (2–3 quotes each).
   -------------------------------------------------------------------------- */

type SeedTestimonial = {
  key: string;             // stable internal key for this seed row
  quote: string;
  author: string;
  title: string;
  partnerName: string;     // must match a PARTNER_NAMES entry
};

const TESTIMONIALS: SeedTestimonial[] = [
  {
    key: "t-gensler-meticulous",
    quote:
      "\u201CBox 3 brought a level of detail and ownership to this project that I rarely see on a commercial fit-out. Every junction, every finish, every programme decision was considered. The team they put on site ran the job like it was their own business.\u201D",
    author: "Alex Hanks",
    title: "Design Director",
    partnerName: "Gensler",
  },
  {
    key: "t-hugo-quality",
    quote:
      "\u201CWorking with Box 3 felt like an extension of our own team from day one. They held us to a higher standard on quality than we held ourselves — and delivered the store on time, on budget, and without a single snag we had to chase.\u201D",
    author: "Rachel Mortimer",
    title: "Head of Retail Projects",
    partnerName: "Hugo Boss",
  },
  {
    key: "t-meta-pace",
    quote:
      "\u201CThe pace at which Box 3 moved without dropping quality was remarkable. They delivered a 25,000 sq ft workplace for us across two floors in under twelve weeks, and the handover was the cleanest I have ever been part of.\u201D",
    author: "Jordan Ellis",
    title: "Workplace Programme Lead",
    partnerName: "Meta",
  },
  {
    key: "t-warner-craft",
    quote:
      "\u201CThe craftsmanship across every detail — the joinery, the acoustic treatments, the bespoke lighting — is genuinely the best I have seen on a project of this scale. Box 3 are the only contractor we will be using going forward.\u201D",
    author: "Priya Banerjee",
    title: "Director of Real Estate",
    partnerName: "Warner Music Group",
  },
  {
    key: "t-mastercard-transparency",
    quote:
      "\u201CBox 3 are refreshingly transparent. Honest cost reporting every week, no surprises at the final account, and a programme that never slipped. That is the exact partnership model we have been looking for.\u201D",
    author: "Daniel Okafor",
    title: "Senior Procurement Manager",
    partnerName: "Mastercard",
  },
  {
    key: "t-skanska-collab",
    quote:
      "\u201CFrom pre-construction through to handover the collaboration was seamless. Box 3 challenged the design team where it mattered, protected the client's budget, and kept everyone aligned. A genuinely rare team.\u201D",
    author: "Helena Strand",
    title: "Operations Director",
    partnerName: "Skanska",
  },
];

async function seedTestimonials(
  partnerMap: Map<string, string>,
): Promise<Map<string, string>> {
  const keyToId = new Map<string, string>();
  try {
    const existing = await client.fetch<
      Array<{ _id: string; author: string; partner: { _ref?: string } | null }>
    >(
      `*[_type == "testimonial"]{ _id, author, partner }`,
    );

    /* Map existing docs by author to stay idempotent. */
    const authorToId = new Map<string, string>();
    for (const doc of existing) authorToId.set(doc.author, doc._id);

    let created = 0;
    for (const t of TESTIMONIALS) {
      const partnerId = partnerMap.get(t.partnerName);
      const matchedId = authorToId.get(t.author);
      if (matchedId) {
        keyToId.set(t.key, matchedId);
        continue;
      }

      const doc = await client.create({
        _type: "testimonial",
        quote: t.quote,
        author: t.author,
        title: t.title,
        partner: partnerId
          ? { _type: "reference", _ref: partnerId }
          : undefined,
      });
      keyToId.set(t.key, doc._id);
      created += 1;
    }

    if (created > 0) {
      console.log(`✔ created ${created} testimonial doc(s)`);
    } else {
      console.log(
        `↷ testimonial already exists (${keyToId.size} docs) — skipping`,
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✘ failed to seed testimonials: ${message}`);
  }
  return keyToId;
}

/** Attach a testimonials section to the home page (single featured
 *  quote). Idempotent — only patches if empty. */
async function attachTestimonialsToHomePage(
  testimonialMap: Map<string, string>,
): Promise<void> {
  try {
    const current = await client.fetch<{
      testimonialsSection?: { testimonials?: unknown[] } | null;
    } | null>(
      '*[_id == "homePage"][0]{testimonialsSection}',
    );
    if (
      current?.testimonialsSection?.testimonials &&
      current.testimonialsSection.testimonials.length > 0
    ) {
      console.log(
        `↷ homePage already has testimonials — leaving alone`,
      );
      return;
    }

    const featuredKey = "t-warner-craft";
    const id = testimonialMap.get(featuredKey);
    if (!id) return;

    await client
      .patch("homePage")
      .set({
        testimonialsSection: {
          sectionLabel: "Testimonials",
          reference: "[BOX3.1]",
          testimonials: [
            { _key: "hp-t-0", _type: "reference", _ref: id },
          ],
        },
      })
      .commit();
    console.log(`✔ attached 1 testimonial to homePage`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✘ failed to attach testimonials to homePage: ${message}`);
  }
}

/** Round-robin 2–3 testimonials onto every project that doesn't
 *  already have a testimonialsSection. */
async function attachTestimonialsToProjects(
  testimonialMap: Map<string, string>,
): Promise<void> {
  try {
    const projects = await client.fetch<
      Array<{
        _id: string;
        title: string;
        testimonialsSection?: { testimonials?: unknown[] } | null;
      }>
    >(
      `*[_type == "project"] | order(title asc){_id, title, testimonialsSection}`,
    );

    const keys = Array.from(testimonialMap.keys());
    if (keys.length === 0) return;

    let patched = 0;
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      const hasAny =
        p.testimonialsSection?.testimonials &&
        p.testimonialsSection.testimonials.length > 0;
      if (hasAny) continue;

      /* Pick 2 or 3 testimonials, rotating through the pool so every
         project gets a different slice. */
      const count = 2 + (i % 2); /* alternates 2, 3, 2, 3 … */
      const refs: Array<{ _key: string; _type: "reference"; _ref: string }> = [];
      for (let j = 0; j < count; j++) {
        const key = keys[(i + j) % keys.length];
        const id = testimonialMap.get(key);
        if (!id) continue;
        refs.push({
          _key: `pr-t-${j}`,
          _type: "reference" as const,
          _ref: id,
        });
      }
      if (refs.length === 0) continue;

      /* Project reference code — something editorial per project. */
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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✘ failed to attach testimonials to projects: ${message}`);
  }
}

async function seed() {
  let succeeded = 0;
  const total = documents.length + 1; /* +1 for projectCategory seeder */

  for (const doc of documents) {
    const { _type, _id } = doc;
    try {
      /* Clean up legacy auto-ID duplicates of this singleton type. */
      const legacyIds = await client.fetch<string[]>(
        `*[_type == $type && _id != $id && _id != $draftId]._id`,
        { type: _type, id: _id, draftId: `drafts.${_id}` },
      );

      if (legacyIds.length > 0) {
        await Promise.all(legacyIds.map((id) => client.delete(id)));
        console.log(
          `⚠ removed ${legacyIds.length} legacy ${_type} doc(s): ${legacyIds.join(", ")}`,
        );
      }

      /* Idempotent create — only creates if the fixed ID doesn't exist. */
      const existing = await client.fetch<{ _id: string } | null>(
        `*[_id == $id][0]{_id}`,
        { id: _id },
      );

      if (existing) {
        console.log(`↷ ${_type} (${_id}) already exists — skipping`);
        succeeded += 1;
        continue;
      }

      const created = await client.create(doc);
      console.log(`✔ created ${_type} (${created._id})`);
      succeeded += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`✘ failed to seed ${_type}: ${message}`);
    }
  }

  /* Backfill homeIntroSection.points on pre-existing docs that were
     created before the field was reintroduced (idempotent — only
     writes when the array is missing or empty so a client edit is
     never overwritten). */
  try {
    const current = await client.fetch<
      { points?: unknown[] } | null
    >('*[_id == "homeIntroSection"][0]{points}');
    if (!current?.points || current.points.length === 0) {
      await client
        .patch("homeIntroSection")
        .set({
          points: [
            {
              _key: "p-1",
              text:
                "We work as a genuine extension of your team — from first concept through to snag-free handover, with a dedicated project lead and transparent cost reporting from day one.",
            },
            {
              _key: "p-2",
              text:
                "Every project is underwritten by a vetted trade network we've refined over a decade, so the craft you see on site is the craft you signed off in the drawings.",
            },
          ],
        })
        .commit();
      console.log(`✔ backfilled homeIntroSection.points`);
    } else {
      console.log(
        `↷ homeIntroSection.points already populated — leaving alone`,
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✘ failed to backfill homeIntroSection.points: ${message}`);
  }

  /* Patch partnersSection with newly-added heading (idempotent). */
  try {
    await client
      .patch("partnersSection")
      .setIfMissing({ heading: "Trusted By" })
      .commit();
    console.log(`✔ patched partnersSection with heading`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✘ failed to patch partnersSection: ${message}`);
  }

  /* bannerShowroom — update copy to the new "team" headline and
     strip the now-removed address / CTA fields from the document. */
  try {
    await client
      .patch("bannerShowroom")
      .set({ heading: "A team where quality\nand ambition meet." })
      .unset(["addressTitle", "addressText", "ctaLabel", "ctaHref"])
      .commit();
    console.log(
      `✔ patched bannerShowroom heading + unset removed fields`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✘ failed to patch bannerShowroom: ${message}`);
  }

  /* Seed featuredProjectsSection.projects if it's still empty —
     picks the first three projects from the dataset by year desc.
     Re-runs don't overwrite the client's selection because we only
     patch when the array is empty. */
  try {
    const existing = await client.fetch<{ projects?: unknown[] } | null>(
      '*[_id == "featuredProjectsSection"][0]{projects}',
    );
    if (!existing?.projects || existing.projects.length === 0) {
      const picks = await client.fetch<Array<{ _id: string }>>(
        '*[_type == "project"] | order(year desc, title asc)[0...3]{_id}',
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
          `✔ patched featuredProjectsSection with ${picks.length} project refs`,
        );
      }
    } else {
      console.log(
        `↷ featuredProjectsSection already has ${existing.projects.length} project ref(s) — leaving alone`,
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✘ failed to patch featuredProjectsSection: ${message}`);
  }

  /* Patch siteFooter with newly-added fields (idempotent). */
  try {
    await client
      .patch({ query: '*[_type == "siteFooter"][0]' })
      .setIfMissing({
        email: "hello@box3projects.co.uk",
        address: "Studio 4, 12 Fitzroy Square\nLondon\nW1T 6EQ",
        callbackHeading: "Request a Callback",
        callbackNamePlaceholder: "Your name",
        callbackPhonePlaceholder: "Your phone number",
        callbackSubmitLabel: "Request Callback",
        contactHeading: "Find Us",
      })
      .commit();
    console.log(`✔ patched siteFooter with new contact/callback fields`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✘ failed to patch siteFooter: ${message}`);
  }

  /* Collection seeders — run after singletons. */
  if (await seedProjectCategories()) succeeded += 1;
  const expertiseMap = await seedExpertise();
  const teamMap = await seedTeamMembers();
  await seedProjects(expertiseMap, teamMap); /* logs its own summary */
  await seedVacancies();                     /* logs its own summary */

  /* Partners — migrate any legacy inline partners to documents, then
     seed partner docs and wire refs into the partnersSection singleton. */
  try {
    const legacy = await client.fetch<{ partners?: Array<{ _type?: string }> } | null>(
      '*[_id == "partnersSection"][0]{partners}',
    );
    const hasLegacyInline = (legacy?.partners ?? []).some(
      (p) => !!p && p._type !== "reference",
    );
    if (hasLegacyInline) {
      await client.patch("partnersSection").unset(["partners"]).commit();
      console.log(`⚠ cleared legacy inline partners on partnersSection`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`✘ failed to inspect legacy partners: ${message}`);
  }

  const partnerMap = await seedPartners();
  await patchPartnersSectionRefs(partnerMap);

  /* Testimonials — seed docs then attach to home + projects. */
  const testimonialMap = await seedTestimonials(partnerMap);
  await attachTestimonialsToHomePage(testimonialMap);
  await attachTestimonialsToProjects(testimonialMap);

  console.log(`\nSeeded ${succeeded}/${total} singletons + category set`);
}

seed().catch((err) => {
  console.error("Fatal error during seed:", err);
  process.exit(1);
});
