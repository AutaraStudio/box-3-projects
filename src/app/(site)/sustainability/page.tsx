/**
 * Sustainability page
 * ===================
 * Server component that loads the sustainabilityPage singleton
 * and assembles the section components. Layout (top → bottom):
 *
 *   1. ImageStripHero        — same scroll-driven hero as /careers
 *   2. SustainabilityIntro   — 2-col statement
 *   3. SustainabilityLegacy  — 3-up grid of recent sustainable projects
 *   4. SustainabilityCommitment — 3-pillar text band
 *   5. SustainabilityPrinciples — numbered principles list (anchor #principles)
 *
 * Every field falls back to a Box 3-flavoured default so the page
 * reads in full before an editor populates the singleton.
 */

import type { Metadata } from "next";

import ImageStripHero from "@/components/ui/ImageStripHero";
import EditorialImageBlock from "@/components/ui/EditorialImageBlock";
import SustainabilityIntro from "@/components/sustainability/SustainabilityIntro";
import SustainabilityStats from "@/components/sustainability/SustainabilityStats";
import SustainabilityLegacy from "@/components/sustainability/SustainabilityLegacy";
import SustainabilityCommitment from "@/components/sustainability/SustainabilityCommitment";
import SustainabilityPrinciples from "@/components/sustainability/SustainabilityPrinciples";
import SustainabilityCertifications from "@/components/sustainability/SustainabilityCertifications";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  SUSTAINABILITY_PAGE_QUERY,
  type SustainabilityPageData,
  type SustainabilityPillarItem,
  type SustainabilityStatItem,
} from "@/sanity/queries/sustainabilityPage";

export const metadata: Metadata = {
  title: "Sustainability — Box 3 Projects",
  description:
    "How Box 3 thinks about materials, carbon, and the long life of every fit-out we deliver.",
};

/* ── Box 3 defaults ─────────────────────────────────────────── */

const DEFAULT_HERO_TITLE = "Designed to last, built to be re-used.";
const DEFAULT_CTA_LABEL = "Our principles";
const DEFAULT_CTA_HREF = "#principles";

const DEFAULT_INTRO_HEADING = "Sustainability is in the spec, not the brochure.";
const DEFAULT_INTRO_BODY = `Commercial fit-out is one of the highest-carbon construction activities pound-for-pound — short cycles, long supply chains, and a habit of stripping out and starting over every five years. We don't think that has to be the answer.

Box 3 is a design and build company working across hospitality, workplace, residential and retail. We've spent the last decade pushing for fit-outs that hold their value: better materials, less waste, and design choices that survive the next tenant.`;

const DEFAULT_STATS_LABEL = "Impact";
const DEFAULT_STATS_HEADING = "What we measure.";

const DEFAULT_STATS_ITEMS: SustainabilityStatItem[] = [
  {
    value: "78%",
    label: "average embodied carbon reduction",
    footnote: "vs RIBA 2030 baseline",
  },
  {
    value: "12 t",
    label: "of furniture diverted from landfill",
    footnote: "across 2025 projects",
  },
  {
    value: "45%",
    label: "of fit-outs reusing existing partitions or joinery",
    footnote: "calendar year 2025",
  },
  {
    value: "£1.2m",
    label: "of asset value restored, not replaced",
    footnote: "tracked since 2023",
  },
];

const DEFAULT_FEATURE_LABEL = "On site";
const DEFAULT_FEATURE_HEADING =
  "Most of the work happens before anything ships in.";
const DEFAULT_FEATURE_BODY = `Every project starts with a survey of what's already there. We catalogue partitions, joinery, lighting, flooring, and furniture — what condition it's in, what's worth keeping, what could be re-used elsewhere.

The image of a "fresh start" sells well, but it's also where most of the embodied carbon gets locked in. Our job is to push the brief in the opposite direction: spec less new, refurbish more, and design around what already works.`;

const DEFAULT_COMMITMENT_LABEL = "Our commitment";
const DEFAULT_COMMITMENT_HEADING =
  "We measure, source, and design for the next decade.";

const DEFAULT_COMMITMENT_ITEMS: SustainabilityPillarItem[] = [
  {
    title: "Material provenance",
    body: "FSC and PEFC-certified timber as standard. Low-VOC paints and adhesives across every spec. Recycled-content panels, fabrics, and acoustic products where the performance brief allows it.",
  },
  {
    title: "Embodied carbon",
    body: "Whole-life carbon captured for every project against the RICS framework. Reductions are tracked against a baseline so claims can be evidenced, not estimated.",
  },
  {
    title: "Designed to disassemble",
    body: "Mechanical fixings over adhesives. Modular partition systems. Standardised dimensions so the next fit-out inherits ours rather than skipping it. The most sustainable fit-out is the one that's still in use.",
  },
];

const DEFAULT_PRINCIPLES_LABEL = "Principles";
const DEFAULT_PRINCIPLES_HEADING = "How we work, in practice.";
const DEFAULT_PRINCIPLES_INTRO =
  "Three commitments we hold ourselves to on every project — design, build, and post-handover.";

const DEFAULT_CERTIFICATIONS_LABEL = "Frameworks we follow";
const DEFAULT_CERTIFICATIONS_ITEMS = [
  "BREEAM",
  "NABERS UK",
  "RICS Whole Life Carbon",
  "FSC",
  "PEFC",
  "WELL",
  "LEED",
  "ISO 14001",
];

const DEFAULT_PRINCIPLES_ITEMS: SustainabilityPillarItem[] = [
  {
    title: "Reuse before refit",
    body: "Every project starts with a survey of what's already on site that's worth keeping. The most sustainable spec is the one that doesn't ship in a new product. We've kept everything from joinery to lighting circuits to entire ceilings — the rule is condition, not novelty.",
  },
  {
    title: "Repair before replace",
    body: "Our build team is trained to refinish, recover, and re-skin existing assets. Furniture, joinery, and lighting are all candidates for restoration rather than replacement. We work with a vetted network of UK-based restorers + reupholsterers to keep that work in-house when we can.",
  },
  {
    title: "Honest about trade-offs",
    body: "When a low-impact spec doesn't perform — acoustic, durability, fire — we say so, and design around it. Every claim we make on a project is one we can evidence on a spreadsheet.",
  },
  {
    title: "End-of-life is part of the brief",
    body: "We tell clients what happens to their fit-out at the end of its life on day one — what can be lifted and re-used, what can be recycled, what can't. Stripping out gracefully is part of the work, not someone else's problem.",
  },
];

export default async function SustainabilityPage() {
  const data = await sanityFetch<SustainabilityPageData | null>({
    query: SUSTAINABILITY_PAGE_QUERY,
  });

  /* Hero defaults */
  const heroTitle = data?.heroTitle ?? DEFAULT_HERO_TITLE;
  const ctaLabel = data?.heroCtaLabel ?? DEFAULT_CTA_LABEL;
  const ctaHref = data?.heroCtaHref ?? DEFAULT_CTA_HREF;

  /* Intro defaults */
  const introHeading = data?.introHeading ?? DEFAULT_INTRO_HEADING;
  const introBody = data?.introBody ?? DEFAULT_INTRO_BODY;

  /* Stats defaults */
  const statsLabel = data?.statsLabel ?? DEFAULT_STATS_LABEL;
  const statsHeading = data?.statsHeading ?? DEFAULT_STATS_HEADING;
  const statsItems =
    data?.statsItems && data.statsItems.length > 0
      ? data.statsItems
      : DEFAULT_STATS_ITEMS;

  /* Feature defaults */
  const featureLabel = data?.featureLabel ?? DEFAULT_FEATURE_LABEL;
  const featureHeading = data?.featureHeading ?? DEFAULT_FEATURE_HEADING;
  const featureBody = data?.featureBody ?? DEFAULT_FEATURE_BODY;

  /* Legacy defaults — only renders if the editor has supplied
     items; we don't auto-fabricate project references. */
  const legacyLabel = data?.legacyLabel ?? "Recent work";
  const legacyItems = data?.legacyItems ?? [];

  /* Commitment defaults */
  const commitmentLabel = data?.commitmentLabel ?? DEFAULT_COMMITMENT_LABEL;
  const commitmentHeading =
    data?.commitmentHeading ?? DEFAULT_COMMITMENT_HEADING;
  const commitmentItems =
    data?.commitmentItems && data.commitmentItems.length > 0
      ? data.commitmentItems
      : DEFAULT_COMMITMENT_ITEMS;

  /* Principles defaults */
  const principlesLabel = data?.principlesLabel ?? DEFAULT_PRINCIPLES_LABEL;
  const principlesHeading =
    data?.principlesHeading ?? DEFAULT_PRINCIPLES_HEADING;
  const principlesIntro = data?.principlesIntro ?? DEFAULT_PRINCIPLES_INTRO;
  const principlesItems =
    data?.principlesItems && data.principlesItems.length > 0
      ? data.principlesItems
      : DEFAULT_PRINCIPLES_ITEMS;

  /* Certifications defaults */
  const certificationsLabel =
    data?.certificationsLabel ?? DEFAULT_CERTIFICATIONS_LABEL;
  const certificationsItems =
    data?.certificationsItems && data.certificationsItems.length > 0
      ? data.certificationsItems
      : DEFAULT_CERTIFICATIONS_ITEMS;

  return (
    <main className="sustainability-page">
      <ImageStripHero
        title={heroTitle}
        ctaLabel={ctaLabel}
        ctaHref={ctaHref}
        imageLeft={data?.heroImageLeft}
        imageCentre={data?.heroImageCentre}
        imageRight={data?.heroImageRight}
      />
      <SustainabilityIntro heading={introHeading} body={introBody} />
      <SustainabilityStats
        label={statsLabel}
        heading={statsHeading}
        items={statsItems}
      />
      <EditorialImageBlock
        label={featureLabel}
        heading={featureHeading}
        body={featureBody}
        image={data?.featureImage}
        fallbackAlt="Box 3 site visit — sustainability in practice"
        ctaLabel="How we work →"
        ctaHref="/services"
        ctaPageName="Services"
      />
      <SustainabilityLegacy label={legacyLabel} items={legacyItems} />
      <SustainabilityCommitment
        label={commitmentLabel}
        heading={commitmentHeading}
        items={commitmentItems}
      />
      <SustainabilityPrinciples
        label={principlesLabel}
        heading={principlesHeading}
        intro={principlesIntro}
        items={principlesItems}
      />
      <SustainabilityCertifications
        label={certificationsLabel}
        items={certificationsItems}
      />
    </main>
  );
}
