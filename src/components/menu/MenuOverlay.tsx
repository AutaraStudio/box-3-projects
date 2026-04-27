/**
 * MenuOverlay
 * ===========
 * Full-viewport modal that animates open from the top-right corner
 * (where the Header trigger sits). Layout mirrors the editorial
 * reference: 12-column × 3-row grid that fills the modal height.
 *
 *   ┌───────────┬──────────────────────────┬───────────┐
 *   │   PAGES   │ ─ Featured #1            │  SOCIAL   │
 *   │  (3 × 2)  │ ─ Featured #2 (scrolls)  │  (2 × 2)  │
 *   ├───────────┤ ─ Featured #N            ├───────────┤
 *   │  CONTACT  │   ↓ scroll for more      │  LEGAL    │
 *   └───────────┴──────────────────────────┴───────────┘
 *
 * Vertical column dividers are rendered as absolutely positioned
 * lines on the overlay itself so they span the full menu height
 * (behind the corner Header squares) instead of being limited to
 * one grid cell. Horizontal dividers between projects are
 * border-bottom on each .menu-overlay__project.
 *
 * The middle column wraps up to 5 featured projects in a single
 * scroll-y container with a mask-image bottom fade as the
 * scrollable affordance (no visible scrollbar).
 *
 * Always rendered with `data-theme="dark"` so brown bg + pink text
 * apply regardless of the host page theme. Closes on Escape (handled
 * in MenuProvider) and when any internal nav link is clicked.
 */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import SplitText from "@/components/split-text/SplitText";
import TransitionLink from "@/components/transition/TransitionLink";
import Button from "@/components/ui/Button";
import { useMenu } from "./MenuProvider";
import "./MenuOverlay.css";

/* Open / close timing constants. Kept inline because they're
   specific to this single timeline; promote to tokens if a second
   modal lands. */
const CLIP_OPEN_DURATION = 1.0;
const CLIP_CLOSE_DURATION = 0.8;
/* Reveal hierarchy — each tier fades in (with a small lift) on
   the timeline at its own offset. Inside a tier with multiple
   elements, stagger spreads them out a touch. */
const REVEAL_DURATION = 0.55;
const REVEAL_LIFT = 12; /* px of subtle upward motion */
const TIER_ONE_AT = 0.5;
const TIER_TWO_AT = 0.7;
const TIER_THREE_AT = 0.9;
const PROJECT_STAGGER = 0.08;
const SIDEBAR_STAGGER = 0.06;
const LG_BREAKPOINT = 1024;
const MAX_FEATURED_PROJECTS = 5;

interface PageLink {
  label: string;
  href: string;
}

interface FeaturedProject {
  title: string;
  href: string;
  /** Optional category label, shown bottom-left of the project block. */
  category?: string;
}

interface ExternalLink {
  label: string;
  href: string;
}

interface MenuOverlayProps {
  pages: PageLink[];
  /** Up to 5 — middle column scrolls if more than fit. */
  featuredProjects: FeaturedProject[];
  contact: {
    addressLines: string[];
    email: string;
    phone: string;
    /** href value, e.g. "tel:02080507815" */
    phoneHref: string;
  };
  social: ExternalLink[];
  legal: PageLink[];
}

export default function MenuOverlay({
  pages,
  featuredProjects,
  contact,
  social,
  legal,
}: MenuOverlayProps) {
  const { isOpen, close } = useMenu();
  const projects = featuredProjects.slice(0, MAX_FEATURED_PROJECTS);
  const overlayRef = useRef<HTMLElement>(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    const trigger = document.querySelector<HTMLElement>(
      "button.header__square",
    );
    const isLg = window.innerWidth >= LG_BREAKPOINT;
    const triggerW = trigger?.offsetWidth ?? 0;
    const triggerH = trigger?.offsetHeight ?? 0;
    const rightPct =
      100 - (isLg && trigger ? (triggerW / window.innerWidth) * 100 : 0);
    const bottomPct =
      100 - (isLg && trigger ? (triggerH / window.innerHeight) * 100 : 0);
    const closedClip = `inset(0% ${rightPct}% ${bottomPct}% 0%)`;
    const openClip = "inset(0% 0% 0% 0%)";

    /* Reveal hierarchy — three tiers. Each tier fades in with a
       small upward lift; inside a tier with multiple elements,
       members stagger so the whole menu unfolds in reading order
       without any per-character motion. */
    const tierOne = overlay.querySelector<HTMLElement>(".menu-overlay__pages");
    const tierTwo =
      overlay.querySelectorAll<HTMLElement>(".menu-overlay__project");
    const tierThree = overlay.querySelectorAll<HTMLElement>(
      ".menu-overlay__contact, .menu-overlay__social, .menu-overlay__legal",
    );
    const allReveal = [tierOne, ...tierTwo, ...tierThree].filter(
      (el): el is HTMLElement => Boolean(el),
    );

    let tl: gsap.core.Timeline;

    if (isOpen) {
      tl = gsap
        .timeline()
        .set(allReveal, { autoAlpha: 0, y: REVEAL_LIFT })
        .set(overlay, {
          opacity: 1,
          pointerEvents: "none",
          clipPath: closedClip,
        })
        .to(overlay, {
          clipPath: openClip,
          duration: CLIP_OPEN_DURATION,
          ease: "power4.out",
        })
        .to(
          tierOne,
          {
            autoAlpha: 1,
            y: 0,
            duration: REVEAL_DURATION,
            ease: "power2.out",
          },
          TIER_ONE_AT,
        )
        .to(
          tierTwo,
          {
            autoAlpha: 1,
            y: 0,
            duration: REVEAL_DURATION,
            stagger: PROJECT_STAGGER,
            ease: "power2.out",
          },
          TIER_TWO_AT,
        )
        .to(
          tierThree,
          {
            autoAlpha: 1,
            y: 0,
            duration: REVEAL_DURATION,
            stagger: SIDEBAR_STAGGER,
            ease: "power2.out",
          },
          TIER_THREE_AT,
        )
        .set(overlay, { pointerEvents: "auto" }, CLIP_OPEN_DURATION);
    } else {
      tl = gsap
        .timeline()
        .set(overlay, { pointerEvents: "none" })
        .to(overlay, {
          clipPath: closedClip,
          duration: CLIP_CLOSE_DURATION,
          ease: "power4.out",
        })
        .set(overlay, { opacity: 0 });
    }

    return () => {
      tl.kill();
    };
  }, [isOpen]);

  return (
    <aside
      id="site-menu"
      ref={overlayRef}
      className="menu-overlay"
      data-theme="dark"
      data-open={isOpen}
      aria-hidden={!isOpen}
    >
      {/* Full-height vertical dividers — absolutely positioned so
          they extend behind the Header squares to the very top. */}
      <span
        className="menu-overlay__divider menu-overlay__divider--left"
        aria-hidden="true"
      />
      <span
        className="menu-overlay__divider menu-overlay__divider--right"
        aria-hidden="true"
      />

      {/* Close button — absolute top-right, sized to match the
          Header trigger square. The menu sits above the Header so
          the trigger is hidden; this provides the close affordance
          in its place. */}
      <button
        type="button"
        className="menu-overlay__close link text-h6 text-caps"
        onClick={close}
        aria-label="Close menu"
      >
        <SplitText>Close</SplitText>
      </button>

      <div className="menu-overlay__grid">
        {/* ── Pages — left col, spans 3×2 ───────────────────────── */}
        <nav className="menu-overlay__pages" aria-label="Pages">
          <p className="menu-overlay__label text-small text-caps">Pages</p>
          <ul className="menu-overlay__page-list">
            {pages.map((page) => (
              <li key={page.href}>
                <TransitionLink
                  href={page.href}
                  pageName={page.label}
                  className="menu-overlay__page-link link text-h3"
                  onClick={close}
                >
                  <SplitText>{page.label}</SplitText>
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Featured projects — middle col, spans all rows,
              scrollable container with bottom mask fade.
              `data-lenis-prevent` opts this subtree out of Lenis's
              wheel capture so native scroll works inside the
              container while the rest of the page stays smooth. */}
        <div className="menu-overlay__projects-wrap">
          <div
            className="menu-overlay__projects-scroll"
            data-lenis-prevent
          >
            {projects.map((project) => (
              <FeaturedProjectBlock
                key={project.href}
                project={project}
                onLinkClick={close}
              />
            ))}
          </div>
        </div>

        {/* ── Social — right col, spans 2×2 ────────────────────── */}
        <section className="menu-overlay__social" aria-label="Social">
          <p className="menu-overlay__label text-small text-caps">Social</p>
          <ul className="menu-overlay__simple-list">
            {social.map((item) => (
              <li key={item.href}>
                <a
                  className="menu-overlay__plain-link link text-large"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SplitText>{item.label}</SplitText>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Contact — left col, row 3 ────────────────────────── */}
        <section className="menu-overlay__contact" aria-label="Contact us">
          <p className="menu-overlay__label text-small text-caps">Contact us</p>
          <address className="menu-overlay__address text-small">
            {contact.addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          <a
            className="menu-overlay__contact-link link text-small"
            href={`mailto:${contact.email}`}
          >
            <SplitText asWords>{contact.email}</SplitText>
          </a>
          <a
            className="menu-overlay__contact-link link text-small"
            href={contact.phoneHref}
          >
            <SplitText asWords>{contact.phone}</SplitText>
          </a>
        </section>

        {/* ── Legal — right col, row 3 ─────────────────────────── */}
        <section className="menu-overlay__legal" aria-label="Legal">
          <p className="menu-overlay__label text-small text-caps">Legal</p>
          <ul className="menu-overlay__simple-list">
            {legal.map((item) => (
              <li key={item.href}>
                <TransitionLink
                  href={item.href}
                  pageName={item.label}
                  className="menu-overlay__plain-link link text-small"
                  onClick={close}
                >
                  <SplitText asWords>{item.label}</SplitText>
                </TransitionLink>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}

/* --------------------------------------------------------------------------
   FeaturedProjectBlock
   --------------------------------------------------------------------------
   One row of the middle column. Top: small label + project title.
   Bottom (anchored): View Project link + 2-col label/value details.
   Sits inside the scrollable middle-column container; horizontal
   border-bottom separates it from the next block. */

function FeaturedProjectBlock({
  project,
  onLinkClick,
}: {
  project: FeaturedProject;
  onLinkClick: () => void;
}) {
  return (
    <article className="menu-overlay__project">
      <div className="menu-overlay__project-inner">
        {/* Title — top-left */}
        <header className="menu-overlay__project-head">
          <p className="menu-overlay__label text-small text-caps">
            Featured Project
          </p>
          <h3 className="menu-overlay__project-title text-h4">
            <TransitionLink
              href={project.href}
              pageName={project.title}
              onClick={onLinkClick}
              className="menu-overlay__plain-link link"
            >
              <SplitText>{project.title}</SplitText>
            </TransitionLink>
          </h3>
        </header>

        {/* Foot — category bottom-left, View Project button bottom-right. */}
        <div className="menu-overlay__project-foot">
          {project.category ? (
            <p className="menu-overlay__project-category text-small text-caps">
              {project.category}
            </p>
          ) : (
            <span aria-hidden="true" />
          )}
          <Button
            href={project.href}
            pageName={project.title}
            size="sm"
            className="menu-overlay__view-link"
            onClick={onLinkClick}
          >
            View Project →
          </Button>
        </div>
      </div>
    </article>
  );
}
