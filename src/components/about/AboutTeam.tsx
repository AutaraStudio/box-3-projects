/**
 * AboutTeam
 * =========
 * Two-column team section on the about page.
 *
 *   ┌─ aside (sticky) ──┐ ┌─ groups (scrolls) ──────────────┐
 *   │ TEAM              │ │ Leadership                       │
 *   │ Meet the studio.  │ │ ┌──┐ ┌──┐ ┌──┐                  │
 *   │ Twenty-one        │ │ └──┘ └──┘ └──┘                  │
 *   │ people. Decades   │ │                                  │
 *   │ of fit-out        │ │ Project Management               │
 *   │ experience.       │ │ ┌──┐ ┌──┐ ┌──┐                  │
 *   │                   │ │ └──┘ └──┘ └──┘                  │
 *   │  (sticky on       │ │                                  │
 *   │   desktop —       │ │ Site Team                        │
 *   │   stays in view   │ │ ┌──┐ ┌──┐ ┌──┐                  │
 *   │   while groups    │ │ └──┘ └──┘ └──┘                  │
 *   │   scroll past)    │ │ ...                              │
 *   └───────────────────┘ └──────────────────────────────────┘
 *
 * Members are grouped by `category` (set in Sanity) and
 * rendered inside their group's titled section. Group order is
 * defined in `GROUP_ORDER` below — adjust there if the editorial
 * priority shifts. Members without a category fall into the
 * trailing "Team" bucket.
 *
 * Tile pattern + dimensions mirror `ProjectHero`'s team tile so
 * the studio reads as one editorial language across the site.
 *
 * Mobile: the layout collapses to a single column, the aside
 * unsticks, and the grids tighten to 2-up.
 */

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import RevealImage from "@/components/ui/RevealImage";
import RevealStack from "@/components/ui/RevealStack";
import { awaitTransitionEnd } from "@/components/transition/transitionState";

import "./AboutTeam.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* Per-tile parallax ranges — symmetric `+rem → -rem` so motion is
   visible the moment a tile enters the viewport, not back-loaded.
   The amplitude varies per slot so adjacent images in a row drift
   at different rates, which is what reads as parallax. Cycles
   across all media elements regardless of grouping. */
const PARALLAX_RANGES: Array<{ from: string; to: string }> = [
  { from: "1rem",    to: "-1rem"    },
  { from: "2rem",    to: "-2rem"    },
  { from: "0.75rem", to: "-0.75rem" },
  { from: "1.5rem",  to: "-1.5rem"  },
];

export interface AboutTeamMember {
  name: string;
  role?: string;
  qualifications?: string;
  /** Public-domain image URL (or Sanity-resolved URL). Tiles
   *  fall back to a tinted placeholder block when missing. */
  imageUrl?: string;
  /** Optional alt text — defaults to the member's name when
   *  unset. */
  imageAlt?: string;
  /** Optional external profile link. When supplied, the tile
   *  wraps in an <a> + a small LinkedIn icon overlays the photo. */
  linkedinUrl?: string;
  /** Group slug — see GROUP_ORDER below. Members without a
   *  category fall into a trailing "Team" bucket. */
  category?: string;
}

interface AboutTeamProps {
  label?: string;
  heading?: string;
  /** Optional supporting paragraph in the sticky aside. */
  intro?: string;
  members: AboutTeamMember[];
  /** Optional CTA below the intro, inside the sticky aside.
   *  Both must be set for the button to render — keeps existing
   *  call-sites unaffected. */
  ctaLabel?: string;
  ctaHref?: string;
  ctaPageName?: string;
}

/* Group definition — display order on the page goes top-to-bottom
   in this list. Slugs match the values in the teamMember Sanity
   schema. Add/remove or reorder here when the team's editorial
   priorities shift. */
const GROUP_ORDER: { value: string; title: string }[] = [
  { value: "leadership",            title: "Leadership" },
  { value: "project-management",    title: "Project Management" },
  { value: "commercial",            title: "Commercial" },
  { value: "technical",             title: "Technical" },
  { value: "site",                  title: "Site Team" },
  { value: "design",                title: "Design" },
  { value: "business-development",  title: "Business Development" },
  { value: "health-safety",         title: "Health & Safety" },
  { value: "bid-marketing",         title: "Bid + Marketing" },
];

/** Fallback heading for members whose `category` doesn't match
 *  any slug in GROUP_ORDER (or who have no category at all). */
const UNCATEGORISED_TITLE = "Team";

export default function AboutTeam({
  label = "Team",
  heading = "Meet the team.",
  intro,
  members,
  ctaLabel,
  ctaHref,
  ctaPageName,
}: AboutTeamProps) {
  const sectionRef = useRef<HTMLElement>(null);

  /* Parallax for each `.about-team__media` element. Tablet+
     only — on mobile the grid collapses tighter and the drift
     reads as jitter rather than parallax. Reduced-motion users
     skip the animation entirely; the RevealImage clip-mask
     entrance still plays since that's a one-shot reveal, not
     ongoing motion. */
  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;

    let ctx: gsap.Context | null = null;
    let cancelled = false;

    awaitTransitionEnd().then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add(
          "(min-width: 48rem) and (prefers-reduced-motion: no-preference)",
          () => {
            const media = gsap.utils.toArray<HTMLElement>(
              ".about-team__media",
              sec,
            );
            media.forEach((el, i) => {
              const range = PARALLAX_RANGES[i % PARALLAX_RANGES.length];
              gsap.fromTo(
                el,
                { y: range.from },
                {
                  y: range.to,
                  ease: "none",
                  scrollTrigger: {
                    trigger: el,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                    invalidateOnRefresh: true,
                  },
                },
              );
            });
          },
        );
      }, sec);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [members]);

  if (members.length === 0) return null;

  /* Bucket members by category. Members preserve their incoming
     order within each bucket (Sanity's `order asc, name asc`
     query sort, then this map maintains insertion). Members
     whose category isn't in GROUP_ORDER land in `__uncat`. */
  const buckets = new Map<string, AboutTeamMember[]>();
  for (const m of members) {
    const key = GROUP_ORDER.some((g) => g.value === m.category)
      ? (m.category as string)
      : "__uncat";
    const arr = buckets.get(key) ?? [];
    arr.push(m);
    buckets.set(key, arr);
  }

  /* Build the render-list of groups in the defined order, then
     append the uncategorised bucket if it has anything. */
  const groups: { title: string; members: AboutTeamMember[] }[] = [];
  for (const { value, title } of GROUP_ORDER) {
    const ms = buckets.get(value);
    if (ms && ms.length > 0) groups.push({ title, members: ms });
  }
  const uncat = buckets.get("__uncat");
  if (uncat && uncat.length > 0) {
    groups.push({ title: UNCATEGORISED_TITLE, members: uncat });
  }

  return (
    <section
      ref={sectionRef}
      className="about-team"
      data-theme="cream"
      id="team"
    >
      <div className="container about-team__inner">
        {/* Sticky aside — heading + intro stay in view while
            the grouped right column scrolls past. */}
        <aside className="about-team__aside">
          <p className="about-team__label text-small text-caps">{label}</p>
          <Heading as="h2" className="about-team__heading text-h2">
            {heading}
          </Heading>
          {intro ? (
            <p className="about-team__intro text-large">{intro}</p>
          ) : null}
          {ctaLabel && ctaHref ? (
            <div className="about-team__cta">
              <Button href={ctaHref} pageName={ctaPageName} size="lg">
                {ctaLabel}
              </Button>
            </div>
          ) : null}
        </aside>

        {/* Right column — vertical stack of category-titled groups. */}
        <div className="about-team__groups">
          {groups.map((group) => (
            <div key={group.title} className="about-team__group">
              <h3 className="about-team__group-title text-h4">
                {group.title}
              </h3>
              <RevealStack as="ul" className="about-team__list">
                {group.members.map((member, i) => {
                  const hasLink = Boolean(member.linkedinUrl);
                  const altText = member.imageAlt ?? member.name;
                  const tile = (
                    <article
                      className={`about-team__tile${
                        hasLink ? " about-team__tile--link" : ""
                      }`}
                    >
                      {member.imageUrl ? (
                        <RevealImage className="about-team__media">
                          <Image
                            src={member.imageUrl}
                            alt={altText}
                            fill
                            sizes="(max-width: 47rem) 50vw, (max-width: 64rem) 33vw, 22vw"
                            className="about-team__image"
                          />
                        </RevealImage>
                      ) : (
                        <div
                          className="about-team__media about-team__media--placeholder"
                          aria-hidden="true"
                        />
                      )}
                      <div className="about-team__info">
                        <p className="about-team__name text-h6">
                          {member.name}
                        </p>
                        {member.qualifications ? (
                          <p className="about-team__qual text-small text-caps">
                            {member.qualifications}
                          </p>
                        ) : null}
                        {member.role ? (
                          <p className="about-team__role text-small text-caps">
                            {member.role}
                          </p>
                        ) : null}
                      </div>
                    </article>
                  );
                  return (
                    <li
                      key={`${member.name}-${i}`}
                      className="about-team__item"
                    >
                      {hasLink ? (
                        <a
                          className="about-team__link"
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} on LinkedIn`}
                        >
                          {tile}
                        </a>
                      ) : (
                        tile
                      )}
                    </li>
                  );
                })}
              </RevealStack>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
