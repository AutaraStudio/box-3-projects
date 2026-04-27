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

export const metadata: Metadata = {
  title: "About — Box 3 Projects",
  description:
    "Senior leads on every project, end-to-end accountability. Box 3 is a London-based design and build company.",
};

/* Revalidate hourly so new team members + reorders show up
   without a redeploy. Same cadence as /projects. */
export const revalidate = 3600;

/* ── Box 3 defaults ─────────────────────────────────────────── */

const DEFAULT_HERO_TITLE = "Run by people who do the work.";
const DEFAULT_HERO_CTA_LABEL = "Meet the team";
const DEFAULT_HERO_CTA_HREF = "#team";

const DEFAULT_INTRO_HEADING = "Founded on relationships, built by experienced hands.";
const DEFAULT_INTRO_BODY = `Box 3 was founded after eighteen years inside large corporate fit-out firms — the kind that polish the marquee projects and leave the smaller ones to whoever's free that month. We started Box 3 because the smaller projects deserve the same depth of attention as the big-budget ones.

We're a small team with senior leads on every project. The person who shaped the brief is usually the person walking the build with you, and most of our team has spent more than a decade in commercial fit-out before joining.`;

/* ── Page ───────────────────────────────────────────────────── */

export default async function AboutPage() {
  const teamRaw = await sanityFetch<TeamMember[] | null>({
    query: TEAM_MEMBERS_QUERY,
    revalidate: 3600,
  });

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

  return (
    <main className="about-page">
      <ImageStripHero
        title={DEFAULT_HERO_TITLE}
        ctaLabel={DEFAULT_HERO_CTA_LABEL}
        ctaHref={DEFAULT_HERO_CTA_HREF}
      />

      <AboutIntro
        heading={DEFAULT_INTRO_HEADING}
        body={DEFAULT_INTRO_BODY}
      />

      <AboutTeam
        label="Team"
        heading="Meet the team."
        intro="A small team of designers, project leads, and site managers — most have spent more than a decade in commercial fit-out before joining Box 3. Senior leads stay on every project, day to day."
        members={team}
      />

      {/* Closing image block — same EditorialImageBlock pattern
          used on the careers + sustainability + services pages.
          Reinforces the working-model differentiator after the
          team grid; falls back to a tinted placeholder until the
          editor supplies an image via Sanity. */}
      <EditorialImageBlock
        label="Continuity"
        heading="The team that starts a project is the team that finishes it."
        body={`We don't hand off mid-build. The person who shapes the brief is usually the one walking the site with you at completion.

Most of our clients come back. We've kept it that way on purpose.`}
        fallbackAlt="Box 3 team on a recent project hand-over"
        ctaLabel="Get in touch →"
        ctaHref="/contact"
        ctaPageName="Contact"
      />
    </main>
  );
}
