/**
 * Seed UI labels + per-page SEO fields
 * ====================================
 * One-shot patch that adds every new editable label / form field
 * / SEO override to its existing Sanity doc using `setIfMissing`,
 * so editor-authored values are never overwritten — only blank
 * fields receive their initial value.
 *
 * Usage (PowerShell):
 *   $env:SANITY_WRITE_TOKEN="<editor token>"
 *   node ./scripts/seed-ui-labels.mjs
 *
 * Safe to re-run any time.
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
   Site Settings — UI labels + brand SEO defaults
   ───────────────────────────────────────────────────────────────── */

const siteSettingsPatch = {
  headerLabels: {
    menuOpenLabel: "Menu",
    menuCloseLabel: "Close",
    menuOpenAriaLabel: "Open menu",
    menuCloseAriaLabel: "Close menu",
    contactAriaLabel: "Go to contact page",
  },

  menuLabels: {
    moreSectionTitle: "More",
    stayInTouchTitle: "Stay in touch",
    namePlaceholder: "Name",
    emailPlaceholder: "Email",
    messagePlaceholder: "Message",
    submitLabel: "Submit",
    submittedLabel: "Thanks — we'll be in touch",
    siteMenuAriaLabel: "Site menu",
    scrimAriaLabel: "Close menu",
  },

  footerLabels: {
    pages: "Pages",
    featuredProjects: "Featured Projects",
    contact: "Contact",
    social: "Social",
    legal: "Legal",
  },

  projectDetailLabels: {
    locationLabel: "Location",
    yearLabel: "Year",
    expertiseHeading: "Expertise",
    teamHeading: "Project team",
    briefHeading: "Brief",
    objectiveLabel: "Client objective",
    feedbackLabel: "Client feedback",
    objectiveAccordionLabel: "Objective",
    feedbackAccordionLabel: "Client feedback",
    exploreTitle: "Explore the project in pictures",
    viewGalleryLabel: "View gallery",
    exploreOpenLabel: "Explore in pictures",
    moreProjectsHeading: "More projects",
    lightboxPreviousLabel: "Previous image",
    lightboxNextLabel: "Next image",
    lightboxCloseLabel: "Close",
    lightboxCloseAriaLabel: "Close gallery",
  },

  legalPageLabels: {
    lastUpdatedLabel: "Last updated",
    tocAriaLabel: "Table of contents",
  },

  testimonialsLabels: {
    previousLabel: "Previous testimonial",
    nextLabel: "Next testimonial",
  },
};

/* ─────────────────────────────────────────────────────────────────
   Per-page SEO + new content fields
   ───────────────────────────────────────────────────────────────── */

const pagePatches = {
  homePage: {
    seoTitle: "Box 3 Projects — Commercial Fit-Outs Done Differently",
    seoDescription:
      "Specialist commercial fit-outs in London. Designed, built, delivered.",
  },

  aboutPage: {
    seoTitle: "About — Box 3 Projects",
    seoDescription:
      "Run by people who do the work — meet the studio behind every Box 3 project.",
    teamUncategorisedTitle: "Team",
    teamCategories: [
      { _key: "tc1", _type: "object", slug: "leadership", title: "Leadership" },
      {
        _key: "tc2",
        _type: "object",
        slug: "project-management",
        title: "Project Management",
      },
      { _key: "tc3", _type: "object", slug: "commercial", title: "Commercial" },
      { _key: "tc4", _type: "object", slug: "technical", title: "Technical" },
      { _key: "tc5", _type: "object", slug: "site-team", title: "Site Team" },
      { _key: "tc6", _type: "object", slug: "design", title: "Design" },
      {
        _key: "tc7",
        _type: "object",
        slug: "business-development",
        title: "Business Development",
      },
      {
        _key: "tc8",
        _type: "object",
        slug: "health-safety",
        title: "Health & Safety",
      },
      {
        _key: "tc9",
        _type: "object",
        slug: "bid-marketing",
        title: "Bid + Marketing",
      },
    ],
  },

  servicesPage: {
    seoTitle: "Services — Box 3 Projects",
    seoDescription:
      "Built end-to-end. In London. The full Box 3 service set, from feasibility to handover.",
  },

  projectsPage: {
    seoTitle: "Projects — Box 3 Projects",
    seoDescription:
      "A selection of Box 3's recent commercial fit-outs across London.",
  },

  careersPage: {
    seoTitle: "Careers — Box 3 Projects",
    seoDescription:
      "It's all about people. Open roles, culture and what it's like to work at Box 3.",
    cultureCtaLabel: "Meet the team →",
    cultureCtaHref: "/about",
    cultureCtaPageName: "About",
    whyWorkCtaLabel: "See open roles →",
    whyWorkCtaHref: "#jobs",
    vacanciesHeading: "Open positions",
    vacanciesEmptyMessage:
      "No open roles right now — check back soon, or drop us a note via the contact page if you'd like to introduce yourself anyway.",
    vacanciesApplyButtonLabel: "Apply now →",
    speculativeLabel: "Speculative",
    speculativeHeading: "Send us a CV anyway.",
    speculativeBody:
      "We're always interested in hearing from talented people, even when there isn't a posted role.\n\nIf you think you'd be a good fit at Box 3, send a short note about what you do and what you're looking for, with a CV attached. We'll keep it on file and reach out if something opens up that matches.",
    speculativeCtaLabel: "Get in touch →",
    speculativeCtaHref: "/contact",
    speculativeCtaPageName: "Contact",

    /* Apply modal */
    applyEyebrowLabel: "Apply for",
    applyCloseLabel: "Close",
    applyCloseAriaLabel: "Close application form",
    applyFirstNameLabel: "First name",
    applyLastNameLabel: "Last name",
    applyEmailLabel: "Email",
    applyPhoneLabel: "Phone",
    applyLinkLabel: "LinkedIn / portfolio URL",
    applyExperienceLabel: "Work experience + why this role",
    applyCvLabel: "Upload CV",
    applyFilePickerLabel: "Choose a file (PDF or Word)",
    applyFileClearLabel: "Clear",
    applySubmitLabel: "Submit application →",
    applySubmittingLabel: "Submitting…",
    applyLegalCopy:
      "By submitting, you agree to Box 3 Projects retaining your details for the purpose of evaluating this application.",
    applySentHeading: "Thanks — application received.",
    applySentBody:
      "We've received your application and will respond from hello@box3projects.co.uk within five working days.",
    applySentCloseLabel: "Close",
  },

  sustainabilityPage: {
    seoTitle: "Sustainability — Box 3 Projects",
    seoDescription:
      "How we approach sustainability across every Box 3 project — frameworks, principles, and outcomes.",
    featureCtaLabel: "How we work →",
    featureCtaHref: "/services",
    featureCtaPageName: "Services",
  },

  contactPage: {
    seoTitle: "Contact — Box 3 Projects",
    seoDescription:
      "Have a question or a project to discuss? Get in touch with the studio.",

    firstNameField: { label: "First name" },
    lastNameField: { label: "Last name" },
    emailField: { label: "Email" },
    organisationField: { label: "Organisation" },
    projectTypeField: { label: "Project type", placeholder: "Select a project type" },
    subjectField: { label: "Subject", placeholder: "Select a subject" },
    messageField: { label: "Message" },

    projectTypes: [
      "Workplace",
      "Hospitality",
      "Residential",
      "Retail",
      "Other",
    ],
    subjects: [
      "Business development",
      "Careers",
      "Media",
      "General",
    ],

    submitLabel: "Send message →",
    submittingLabel: "Sending…",
    sentHeading: "Thanks — we'll be in touch.",
    sentBody:
      "We've received your note and will respond from hello@box3projects.co.uk within two working days.",
  },
};

/* ─────────────────────────────────────────────────────────────────
   Run
   ───────────────────────────────────────────────────────────────── */

let patched = 0;

console.log("\nPatching Site Settings…");
try {
  await client
    .patch("siteSettings")
    .setIfMissing(siteSettingsPatch)
    .commit();
  console.log("  ✓ Site Settings — UI labels added (existing values preserved)");
  patched += 1;
} catch (err) {
  console.error("  ✘ Site Settings patch failed:", err.message);
}

console.log("\nPatching pages…");
for (const [id, body] of Object.entries(pagePatches)) {
  try {
    /* createIfNotExists first so a missing doc gets stubbed
       with the new content. Existing docs are untouched. */
    await client.createIfNotExists({ _id: id, _type: id });
    await client.patch(id).setIfMissing(body).commit();
    console.log(`  ✓ ${id}`);
    patched += 1;
  } catch (err) {
    console.error(`  ✘ ${id} patch failed: ${err.message}`);
  }
}

console.log(
  `\nDone — patched ${patched} doc(s). Existing editor-authored values were never overwritten.`,
);
