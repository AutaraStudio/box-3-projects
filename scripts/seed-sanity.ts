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
    sectionLabel: "Our Partners",
    partners: [
      { _key: "p-nike", name: "Nike" },
      { _key: "p-hugo", name: "Hugo Boss" },
      { _key: "p-meta", name: "Meta" },
      { _key: "p-warner", name: "Warner Music Group" },
      { _key: "p-master", name: "Mastercard" },
      { _key: "p-meta2", name: "Meta" },
    ],
  },
];

/* --------------------------------------------------------------------------
   Main
   -------------------------------------------------------------------------- */

async function seed() {
  let succeeded = 0;
  const total = documents.length;

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

  console.log(`\nSeeded ${succeeded}/${total} documents successfully`);
}

seed().catch((err) => {
  console.error("Fatal error during seed:", err);
  process.exit(1);
});
