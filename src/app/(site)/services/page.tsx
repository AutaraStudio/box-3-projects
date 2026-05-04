/**
 * Services page
 * =============
 * Server component. Pulls the servicesPage Sanity singleton and
 * renders each section using the doc value || launch fallback,
 * so the editor can populate one section at a time without the
 * rest of the page going blank.
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
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  SERVICES_PAGE_QUERY,
  type ServicesPageData,
} from "@/sanity/queries/servicesPage";
import type { SustainabilityStatItem } from "@/sanity/queries/sustainabilityPage";

export const metadata: Metadata = {
  title: "Services — Box 3 Projects",
  description:
    "Commercial fit-out services across London — workplace, retail, hospitality, education. Design and build under one roof, end-to-end.",
};

export const revalidate = 3600;

const FALLBACK = {
  heroTitle: "Built end-to-end. In London.",
  heroCtaLabel: "How we work",
  heroCtaHref: "#process",
  introHeading: "Specialist commercial fit-outs, up to £10m.",
  introBody: `Box 3 is a London-based design and build company working across workplace, retail, hospitality and education. We deliver end-to-end — design, build, and project leadership under one roof — with a small senior team that stays on every project from first sketch to final hand-over.

Most of our work comes from clients we've delivered for before. We've kept it that way on purpose: we'd rather build deeper relationships across fewer projects than chase volume.`,
  servicesItems: [
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
  ] as ServiceItem[],
  servicesCtaLabel: "View our work →",
  servicesCtaHref: "/projects",
  servicesCtaPageName: "Projects",
  editorialLabel: "On site",
  editorialHeading: "A senior lead on every project, every day.",
  editorialBody: `From first sketch to final hand-over, the same team carries the project. No silos, no hand-offs to a subcontractor halfway through — the person who shaped the brief is the one walking the build with you.

Weekly updates so progress is never something the client has to chase for.`,
  editorialFallbackAlt: "Box 3 site visit — senior team on site",
  editorialCtaLabel: "Meet the team →",
  editorialCtaHref: "/about",
  editorialCtaPageName: "About",
  trackLabel: "Track record",
  trackHeading: "Numbers we measure ourselves against.",
  trackItems: [
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
      label:
        "years of combined fit-out experience across the senior team",
      footnote: "leadership + project leads",
    },
    {
      value: "£10m",
      label: "project ceiling, with PI / EL / PL insurance to match",
      footnote: "London + South East",
    },
  ] as SustainabilityStatItem[],
  processLabel: "Process",
  processHeading: "How a project moves from conversation to keys.",
  processSteps: [
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
  ] as ProcessStep[],
};

function firstFilled(...vs: Array<string | undefined>): string {
  for (const v of vs) if (v && v.trim().length > 0) return v;
  return "";
}

export default async function ServicesPage() {
  const page = await sanityFetch<ServicesPageData | null>({
    query: SERVICES_PAGE_QUERY,
    revalidate: 3600,
  });

  /* Service items — fall back to launch list when CMS is empty
     OR all items lack required title. */
  const cmsServices: ServiceItem[] = (page?.servicesItems ?? [])
    .filter((s) => s?.title)
    .map((s) => ({
      title: s.title ?? "",
      description: s.description ?? "",
    }));
  const services = cmsServices.length > 0 ? cmsServices : FALLBACK.servicesItems;

  const cmsTrack: SustainabilityStatItem[] = (page?.trackItems ?? [])
    .filter((s) => s?.value)
    .map((s) => ({
      value: s.value ?? "",
      label: s.label ?? "",
      footnote: s.footnote,
    }));
  const trackItems = cmsTrack.length > 0 ? cmsTrack : FALLBACK.trackItems;

  const cmsProcess: ProcessStep[] = (page?.processSteps ?? [])
    .filter((s) => s?.title)
    .map((s) => ({ title: s.title ?? "", body: s.body ?? "" }));
  const processSteps =
    cmsProcess.length > 0 ? cmsProcess : FALLBACK.processSteps;

  const editorialImage = page?.editorialImage?.asset?.url
    ? page.editorialImage
    : undefined;
  const editorialImageProp = editorialImage as never;

  return (
    <main className="services-page">
      <ImageStripHero
        title={firstFilled(page?.heroTitle, FALLBACK.heroTitle)}
        ctaLabel={firstFilled(page?.heroCta?.label, FALLBACK.heroCtaLabel)}
        ctaHref={firstFilled(page?.heroCta?.href, FALLBACK.heroCtaHref)}
      />

      <ServicesIntro
        heading={firstFilled(page?.introHeading, FALLBACK.introHeading)}
        body={firstFilled(page?.introBody, FALLBACK.introBody)}
      />

      <ServicesList
        items={services}
        ctaLabel={firstFilled(
          page?.servicesCta?.label,
          FALLBACK.servicesCtaLabel,
        )}
        ctaHref={firstFilled(page?.servicesCta?.href, FALLBACK.servicesCtaHref)}
        ctaPageName={firstFilled(
          page?.servicesCta?.pageName,
          page?.servicesCta?.label,
          FALLBACK.servicesCtaPageName,
        )}
      />

      <EditorialImageBlock
        label={firstFilled(page?.editorialLabel, FALLBACK.editorialLabel)}
        heading={firstFilled(
          page?.editorialHeading,
          FALLBACK.editorialHeading,
        )}
        body={firstFilled(page?.editorialBody, FALLBACK.editorialBody)}
        image={editorialImageProp}
        fallbackAlt={firstFilled(
          page?.editorialImage?.alt,
          FALLBACK.editorialFallbackAlt,
        )}
        ctaLabel={firstFilled(
          page?.editorialCta?.label,
          FALLBACK.editorialCtaLabel,
        )}
        ctaHref={firstFilled(
          page?.editorialCta?.href,
          FALLBACK.editorialCtaHref,
        )}
        ctaPageName={firstFilled(
          page?.editorialCta?.pageName,
          page?.editorialCta?.label,
          FALLBACK.editorialCtaPageName,
        )}
      />

      <SustainabilityStats
        label={firstFilled(page?.trackLabel, FALLBACK.trackLabel)}
        heading={firstFilled(page?.trackHeading, FALLBACK.trackHeading)}
        items={trackItems}
      />

      <section id="process">
        <ProcessTimeline
          label={firstFilled(page?.processLabel, FALLBACK.processLabel)}
          heading={firstFilled(page?.processHeading, FALLBACK.processHeading)}
          steps={processSteps}
          theme="cream"
        />
      </section>
    </main>
  );
}
