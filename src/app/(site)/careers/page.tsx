/**
 * Careers page
 * ============
 * Server component that loads the careersPage singleton from
 * Sanity and feeds it to the scroll-driven CareersHero. Future
 * sections (open roles list, culture imagery, perks, etc.) will
 * land beneath the hero on this same surface.
 */

import type { Metadata } from "next";

import ImageStripHero from "@/components/ui/ImageStripHero";
import EditorialImageBlock from "@/components/ui/EditorialImageBlock";
import CareersIntro from "@/components/careers/CareersIntro";
import CareersWhyWork from "@/components/careers/CareersWhyWork";
import CareersJobs from "@/components/careers/CareersJobs";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  CAREERS_PAGE_QUERY,
  type CareersPageData,
  type CareersWhyWorkItem,
} from "@/sanity/queries/careersPage";
import {
  VACANCIES_QUERY,
  type VacancyItem,
} from "@/sanity/queries/vacancies";

export const metadata: Metadata = {
  title: "Careers — Box 3 Projects",
  description:
    "Open roles + team culture at Box 3 Projects, a London-based design and build company.",
};

/* Box 3-flavoured defaults so the page reads in full before an
   editor has populated the careersPage singleton. Once the
   document is published, every field flows from Sanity. */
const DEFAULT_INTRO_HEADING = "We hire slowly. Most people stay.";
const DEFAULT_INTRO_BODY = `Box 3 is a London-based design and build company. We work end-to-end across hospitality, workplace, residential and retail — and we couldn't do it without the team behind every project.

We're shaped by the people who choose to work here. If our voice changes over time, it's because the people in the room change with it.`;

const DEFAULT_CULTURE_LABEL = "Culture";
const DEFAULT_CULTURE_HEADING = "We work side by side, start to finish.";
const DEFAULT_CULTURE_BODY = `Box 3 is one team under one roof — design, build, and project leads in the same room every day. Decisions get made in conversation, not in inboxes. The person who promised something is usually the person who builds it. Trades get treated as design partners.

People who thrive here care as much about how a thing gets made as the finished image.`;

const DEFAULT_WHY_HEADING = "Why work with us";

const DEFAULT_WHY_ITEMS: CareersWhyWorkItem[] = [
  {
    title: "Team culture",
    body: "Designers, builders, and project leads in the same room — caring about how the work gets made, not just the finished images.",
  },
  {
    title: "End-to-end ownership",
    body: "From the first sketch to the final hand-over, every project is led by the same team. No silos, no hand-offs to a sub-contractor halfway through. The person who promises something is usually the person who builds it.",
  },
  {
    title: "Health + wellbeing",
    body: "Flexible hours, four-day Fridays from June to August, and a wellbeing budget that covers gym, therapy, or whatever helps you do your best work.",
  },
  {
    title: "Growth",
    body: "Roles that scale with the company. We invest in formal training (RIBA, IIRSM, project-management certs), and pair every junior with a senior mentor for the first year. Annual reviews are honest and forward-looking.",
  },
];

export default async function CareersPage() {
  const [data, vacancies] = await Promise.all([
    sanityFetch<CareersPageData | null>({ query: CAREERS_PAGE_QUERY }),
    sanityFetch<VacancyItem[]>({ query: VACANCIES_QUERY }),
  ]);

  /* Hero defaults */
  const heroTitle = data?.heroTitle ?? "It's all about people";
  const ctaLabel = data?.heroCtaLabel ?? "See opportunities";
  const ctaHref = data?.heroCtaHref ?? "#jobs";

  /* Intro + Culture + Why-Work defaults — every field falls
     back to the Box 3 voice if the singleton hasn't been
     populated yet. */
  const introHeading = data?.introHeading ?? DEFAULT_INTRO_HEADING;
  const introBody = data?.introBody ?? DEFAULT_INTRO_BODY;
  const cultureLabel = data?.cultureLabel ?? DEFAULT_CULTURE_LABEL;
  const cultureHeading = data?.cultureHeading ?? DEFAULT_CULTURE_HEADING;
  const cultureBody = data?.cultureBody ?? DEFAULT_CULTURE_BODY;
  const whyWorkHeading = data?.whyWorkHeading ?? DEFAULT_WHY_HEADING;
  const whyWorkItems =
    data?.whyWorkItems && data.whyWorkItems.length > 0
      ? data.whyWorkItems
      : DEFAULT_WHY_ITEMS;

  return (
    <main className="careers-page">
      <ImageStripHero
        title={heroTitle}
        ctaLabel={ctaLabel}
        ctaHref={ctaHref}
        imageLeft={data?.heroImageLeft}
        imageCentre={data?.heroImageCentre}
        imageRight={data?.heroImageRight}
      />
      <CareersIntro heading={introHeading} body={introBody} />
      <EditorialImageBlock
        label={cultureLabel}
        heading={cultureHeading}
        body={cultureBody}
        image={data?.cultureImage}
        fallbackAlt="Box 3 team"
        ctaLabel="Meet the team →"
        ctaHref="/about"
        ctaPageName="About"
      />
      <CareersWhyWork
        heading={whyWorkHeading}
        items={whyWorkItems}
        ctaLabel="See open roles →"
        ctaHref="#jobs"
      />
      <CareersJobs vacancies={vacancies} />

      {/* Closing image block — invites speculative applications
          for roles we don't always post for. Same component +
          fallback placeholder pattern used elsewhere on the site. */}
      <EditorialImageBlock
        label="Speculative"
        heading="Send us a CV anyway."
        body={`If your role isn't on the list above but you've got commercial fit-out experience and want to be at Box 3, we'd still like to hear from you.

Send a CV and a paragraph about why. One of us will read it.`}
        fallbackAlt="Box 3 team scene"
        ctaLabel="Get in touch →"
        ctaHref="/contact"
        ctaPageName="Contact"
      />
    </main>
  );
}
