/**
 * About page
 * ==========
 * Short and sweet. Layout (top → bottom):
 *
 *   1. ImageStripHero      — same scroll-driven hero as the
 *                            other content pages
 *   2. AboutIntro          — 5/1/6 grid statement (founding
 *                            story + positioning)
 *   3. AboutTeam           — sticky aside + grouped team grid.
 *                            Members are pulled from Sanity
 *                            (`teamMember` documents) and
 *                            bucketed by their `category`
 *   4. EditorialImageBlock — closing image + working-model
 *                            statement, same component used on
 *                            careers / sustainability / services
 *
 * Intro + closing copy live as defaults in this file — Sanity
 * wiring can land later when the editor needs to manage it.
 */

import type { Metadata } from "next";

import ImageStripHero from "@/components/ui/ImageStripHero";
import EditorialImageBlock from "@/components/ui/EditorialImageBlock";
import AboutIntro from "@/components/about/AboutIntro";
import AboutTeam, {
  type AboutTeamMember,
} from "@/components/about/AboutTeam";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";
import {
  TEAM_MEMBERS_QUERY,
  type TeamMember,
} from "@/sanity/queries/teamMembers";
import {
  ABOUT_PAGE_QUERY,
  type AboutPageData,
} from "@/sanity/queries/aboutPage";

export const metadata: Metadata = {
  title: "About — Box 3 Projects",
  description:
    "Senior leads on every project, end-to-end accountability. Box 3 is a London-based design and build company.",
};

/* Revalidate hourly so new team members + reorders show up
   without a redeploy. Same cadence as /projects. */
export const revalidate = 3600;

/* ── Box 3 defaults ─────────────────────────────────────────── */

const FALLBACK = {
  heroTitle: "Run by people who do the work.",
  heroCtaLabel: "Meet the team",
  heroCtaHref: "#team",
  introHeading: "Founded on relationships, built by experienced hands.",
  introBody: `Box 3 was founded after eighteen years inside large corporate fit-out firms — the kind that polish the marquee projects and leave the smaller ones to whoever's free that month. We started Box 3 because the smaller projects deserve the same depth of attention as the big-budget ones.

We're a small team with senior leads on every project. The person who shaped the brief is usually the person walking the build with you, and most of our team has spent more than a decade in commercial fit-out before joining.`,
  teamLabel: "Team",
  teamHeading: "Meet the team.",
  teamIntro:
    "A small team of designers, project leads, and site managers — most have spent more than a decade in commercial fit-out before joining Box 3. Senior leads stay on every project, day to day.",
  closingLabel: "Continuity",
  closingHeading: "The team that starts a project is the team that finishes it.",
  closingBody: `We don't hand off mid-build. The person who shapes the brief is usually the one walking the site with you at completion.

Most of our clients come back. We've kept it that way on purpose.`,
  closingFallbackAlt: "Box 3 team on a recent project hand-over",
  closingCtaLabel: "Get in touch →",
  closingCtaHref: "/contact",
  closingCtaPageName: "Contact",
} as const;

function firstFilled(...vs: Array<string | undefined>): string {
  for (const v of vs) if (v && v.trim().length > 0) return v;
  return "";
}

/* ── Page ───────────────────────────────────────────────────── */

export default async function AboutPage() {
  const [teamRaw, page] = await Promise.all([
    sanityFetch<TeamMember[] | null>({
      query: TEAM_MEMBERS_QUERY,
      revalidate: 3600,
    }),
    sanityFetch<AboutPageData | null>({
      query: ABOUT_PAGE_QUERY,
      revalidate: 3600,
    }),
  ]);

  /* Map Sanity team-member docs onto the AboutTeamMember shape
     the AboutTeam component expects. The image URL is built
     with `urlFor` at a reasonable render width (the component's
     `sizes` prop tells the browser to pull the right resolution
     from Next/Image's optimiser). Members without a photo fall
     through to the placeholder block in the tile. */
  const team: AboutTeamMember[] = (teamRaw ?? []).map((m) => ({
    name: m.name,
    role: m.role,
    qualifications: m.qualifications,
    linkedinUrl: m.linkedinUrl,
    category: m.category,
    imageUrl: m.image?.asset
      ? urlFor(m.image as { asset: { _id: string } })
          .width(800)
          .url()
      : undefined,
    imageAlt: m.image?.alt,
  }));

  /* Resolve the closing-block image: fall back to a project's
     featured image if the editor hasn't uploaded one yet. */
  const closingImage = page?.closingImage?.asset?.url
    ? page.closingImage
    : undefined;
  const closingImageProp = closingImage as never; /* shape-compatible */

  return (
    <main className="about-page">
      <ImageStripHero
        title={firstFilled(page?.heroTitle, FALLBACK.heroTitle)}
        ctaLabel={firstFilled(page?.heroCta?.label, FALLBACK.heroCtaLabel)}
        ctaHref={firstFilled(page?.heroCta?.href, FALLBACK.heroCtaHref)}
      />

      <AboutIntro
        heading={firstFilled(page?.introHeading, FALLBACK.introHeading)}
        body={firstFilled(page?.introBody, FALLBACK.introBody)}
      />

      <AboutTeam
        label={firstFilled(page?.teamLabel, FALLBACK.teamLabel)}
        heading={firstFilled(page?.teamHeading, FALLBACK.teamHeading)}
        intro={firstFilled(page?.teamIntro, FALLBACK.teamIntro)}
        members={team}
      />

      <EditorialImageBlock
        label={firstFilled(page?.closingLabel, FALLBACK.closingLabel)}
        heading={firstFilled(page?.closingHeading, FALLBACK.closingHeading)}
        body={firstFilled(page?.closingBody, FALLBACK.closingBody)}
        image={closingImageProp}
        fallbackAlt={firstFilled(
          page?.closingImage?.alt,
          FALLBACK.closingFallbackAlt,
        )}
        ctaLabel={firstFilled(
          page?.closingCta?.label,
          FALLBACK.closingCtaLabel,
        )}
        ctaHref={firstFilled(page?.closingCta?.href, FALLBACK.closingCtaHref)}
        ctaPageName={firstFilled(
          page?.closingCta?.pageName,
          page?.closingCta?.label,
          FALLBACK.closingCtaPageName,
        )}
      />
    </main>
  );
}
