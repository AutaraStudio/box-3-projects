/**
 * Services page
 * =============
 * Marketing page for the studio's offer. Layout (top → bottom):
 *
 *   1. ImageStripHero      — same scroll-driven hero as /careers
 *                            and /sustainability, for cross-page
 *                            consistency
 *   2. ServicesIntro       — 5/1/6 grid statement (matches the
 *                            other section intros)
 *   3. ServicesList        — directional-hover registry of the
 *                            seven service categories
 *   4. EditorialImageBlock — image + heading + body; same
 *                            component the careers Culture
 *                            section uses (visual break)
 *   5. Track-record stats  — reuses SustainabilityStats; staircase
 *                            of trust signals (delivery rate,
 *                            repeat business, insurance ceiling)
 *   6. ProcessTimeline     — vertical timeline of the 5-step
 *                            Design & Build process; the page's
 *                            centrepiece
 *
 * Content currently lives as defaults in this file — Sanity wiring
 * can land later when the editor needs to manage the service
 * categories or process steps. The capability statement PDF in
 * /reference/ was the source of truth.
 */

import type { Metadata } from "next";

import ImageStripHero from "@/components/ui/ImageStripHero";
import EditorialImageBlock from "@/components/ui/EditorialImageBlock";
import ServicesIntro from "@/components/services/ServicesIntro";
import ServicesList, {
  type ServiceItem,
} from "@/components/services/ServicesList";
import ProcessTimeline, {
  type ProcessStep,
} from "@/components/services/ProcessTimeline";
import SustainabilityStats from "@/components/sustainability/SustainabilityStats";
import type { SustainabilityStatItem } from "@/sanity/queries/sustainabilityPage";

export const metadata: Metadata = {
  title: "Services — Box 3 Projects",
  description:
    "Commercial fit-out services across London — workplace, retail, hospitality, education. Design and build under one roof, end-to-end.",
};

/* ── Box 3 defaults ─────────────────────────────────────────── */

const DEFAULT_HERO_TITLE = "Built end-to-end. In London.";
const DEFAULT_HERO_CTA_LABEL = "How we work";
const DEFAULT_HERO_CTA_HREF = "#process";

const DEFAULT_INTRO_HEADING = "Specialist commercial fit-outs, up to £10m.";
const DEFAULT_INTRO_BODY = `Box 3 is a London-based design and build company working across workplace, retail, hospitality and education. We deliver end-to-end — design, build, and project leadership under one roof — with a small senior team that stays on every project from first sketch to final hand-over.

Most of our work comes from clients we've delivered for before. We've kept it that way on purpose: we'd rather build deeper relationships across fewer projects than chase volume.`;

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    title: "Office fit-out (Cat B)",
    description:
      "Integrating partitions, joinery, lighting, flooring and furniture into a complete workplace after the Cat A shell is in place.",
  },
  {
    title: "Office refurb (Cat A)",
    description:
      "Foundational landlord finish — the blank canvas. Tier 1 subcontractors and a tight schedule so tenants can occupy quickly.",
  },
  {
    title: "Design & Build",
    description:
      "Single-team delivery from brief to hand-over. One contract, one point of accountability, fewer hand-offs.",
  },
  {
    title: "Refurb in occupation",
    description:
      "Phased works inside live, occupied buildings — segregation, hoardings, and out-of-hours scheduling so the day job keeps running.",
  },
  {
    title: "Hybrid + small modifications",
    description:
      "Reconfigurations that defy categorisation: open layouts, hot-desking, conference + immersion rooms, breakout zones.",
  },
  {
    title: "Dilapidations",
    description:
      "End-of-lease exit costs handled efficiently — restoring the space to pre-let condition, on time, on budget.",
  },
  {
    title: "Education, fitness + retail",
    description:
      "Sector specialism beyond the office — schools, gyms, healthcare, and retail flagships across London and the South East.",
  },
];

const DEFAULT_TRACK_RECORD_ITEMS: SustainabilityStatItem[] = [
  {
    value: "100%",
    label: "of projects delivered on time and on budget",
    footnote: "across every brief to date",
  },
  {
    value: "90%",
    label: "of new work comes from clients we've delivered for before",
    footnote: "calendar year 2025",
  },
  {
    value: "180+",
    label: "years of combined fit-out experience across the senior team",
    footnote: "leadership + project leads",
  },
  {
    value: "£10m",
    label: "project ceiling, with PI / EL / PL insurance to match",
    footnote: "London + South East",
  },
];

const DEFAULT_PROCESS_STEPS: ProcessStep[] = [
  {
    title: "Meet",
    body: "We start with a conversation. The brief gets shaped in the room — what the space needs to do, what the building allows, what the budget really means. No prepared decks; we'd rather understand the problem first.",
  },
  {
    title: "Design",
    body: "A simple working model of the project — drawings, key materials, a clear spec. Enough detail to talk seriously with the supply chain, light enough to keep changing as the brief tightens.",
  },
  {
    title: "Estimate",
    body: "An honest cost and programme forecast. Tendered against vetted subcontractors, with the trade-offs called out where they matter. Contract signed before any work starts on site.",
  },
  {
    title: "Construction",
    body: "A senior project manager on site, every day. Quality controlled against the spec, programme tracked against the contract. Weekly updates so the client never has to chase for status.",
  },
  {
    title: "Close out",
    body: "Soft-landing handover — full documentation, warranties, snag-list cleared. We stay reachable for the first months of occupation; what gets logged on day one shapes how the space holds up at year five.",
  },
];

export default function ServicesPage() {
  return (
    <main className="services-page">
      <ImageStripHero
        title={DEFAULT_HERO_TITLE}
        ctaLabel={DEFAULT_HERO_CTA_LABEL}
        ctaHref={DEFAULT_HERO_CTA_HREF}
      />

      <ServicesIntro
        heading={DEFAULT_INTRO_HEADING}
        body={DEFAULT_INTRO_BODY}
      />

      <ServicesList
        items={DEFAULT_SERVICES}
        ctaLabel="View our work →"
        ctaHref="/projects"
        ctaPageName="Projects"
      />

      {/* Editorial image block — visual break between the text-
          heavy services list and the track-record stats. Same
          component the careers Culture section uses. Editor
          supplies the image via Sanity; component falls back to
          a tinted placeholder until then. */}
      <EditorialImageBlock
        label="On site"
        heading="A senior lead on every project, every day."
        body={`From first sketch to final hand-over, the same team carries the project. No silos, no hand-offs to a subcontractor halfway through — the person who shaped the brief is the one walking the build with you.

Weekly updates so progress is never something the client has to chase for.`}
        fallbackAlt="Box 3 site visit — senior team on site"
        ctaLabel="Meet the team →"
        ctaHref="/about"
        ctaPageName="About"
      />

      {/* Trust band — staircase of track-record stats. Reuses the
          SustainabilityStats component since the visual pattern is
          generic; the BEM prefix is the only place "sustainability"
          surfaces and that's purely an internal class name. */}
      <SustainabilityStats
        label="Track record"
        heading="Numbers we measure ourselves against."
        items={DEFAULT_TRACK_RECORD_ITEMS}
      />

      <section id="process">
        <ProcessTimeline
          label="Process"
          heading="How a project moves from conversation to keys."
          steps={DEFAULT_PROCESS_STEPS}
          theme="cream"
        />
      </section>

    </main>
  );
}
