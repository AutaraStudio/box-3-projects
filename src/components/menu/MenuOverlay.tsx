/**
 * MenuOverlay
 * ===========
 * Full-viewport modal that animates open from the top-right corner
 * (where the Header trigger sits). Layout mirrors the editorial
 * reference: 12-column × 3-row grid that fills the modal height.
 *
 *   ┌───────────┬──────────────────────────┬───────────┐
 *   │   PAGES   │ ─ row 1 ─ Featured #1    │  SOCIAL   │
 *   │  (3 × 2)  │                          │  (2 × 2)  │
 *   │           │ ─ row 2 ─ Featured #2    │           │
 *   ├───────────┼──────────────────────────┼───────────┤
 *   │  CONTACT  │ ─ row 3 ─ Featured #3    │  LEGAL    │
 *   └───────────┴──────────────────────────┴───────────┘
 *
 * Each featured-project cell carries left + right border lines and
 * has its content anchored top (label + title) and bottom (View
 * Project + details table) so the typography pulls towards the
 * column lines.
 *
 * Always rendered with `data-theme="dark"` so brown bg + pink text
 * apply regardless of the host page theme. Closes on Escape (handled
 * in MenuProvider) and when any internal nav link is clicked. Every
 * link/button text runs through SplitText so the editorial char
 * roll-over hover applies site-wide.
 */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import SplitText from "@/components/split-text/SplitText";
import TransitionLink from "@/components/transition/TransitionLink";
import { useMenu } from "./MenuProvider";
import "./MenuOverlay.css";

/* Open / close timing constants. Kept inline because they're
   specific to this single timeline; promote to tokens if a second
   modal lands. */
const CLIP_OPEN_DURATION = 1.0;
const CLIP_CLOSE_DURATION = 0.8;
const CHAR_DURATION = 0.8;
const CHAR_STAGGER = 0.0044;
const WORD_DURATION = 1.2;
const WORD_STAGGER = 0.001;
const LG_BREAKPOINT = 1024;

interface PageLink {
  label: string;
  href: string;
}

interface ProjectDetail {
  label: string;
  value: string;
}

interface FeaturedProject {
  title: string;
  href: string;
  /** Up to 4 label/value rows shown beneath the project title. */
  details: ProjectDetail[];
}

interface ExternalLink {
  label: string;
  href: string;
}

interface MenuOverlayProps {
  pages: PageLink[];
  /** Up to 3 — fills one row each in the middle column. */
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
  const projects = featuredProjects.slice(0, 3);
  const overlayRef = useRef<HTMLElement>(null);
  /* Skip animating on the very first render — the menu is closed by
     default and there's no transition to play. After that, every
     isOpen flip drives a GSAP timeline. */
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    /* Trigger square's footprint — used to size the closed clip-path
       so the menu visually grows out of (and shrinks back into) the
       trigger button. On mobile the menu fills full-bleed instead so
       the corner clip becomes a 100%-by-0% strip. */
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

    const chars = overlay.querySelectorAll<HTMLElement>(".split .char");
    const words = overlay.querySelectorAll<HTMLElement>(".split .word");

    let tl: gsap.core.Timeline;

    if (isOpen) {
      tl = gsap
        .timeline()
        /* Park chars below the line so they can roll in once the
           clip-path has reached the content area. */
        .set(chars, { yPercent: 100 })
        .set(words, { yPercent: 100 })
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
          chars,
          {
            yPercent: 0,
            duration: CHAR_DURATION,
            stagger: CHAR_STAGGER,
            ease: "circ.out",
          },
          0.4,
        )
        .to(
          words,
          {
            yPercent: 0,
            duration: WORD_DURATION,
            stagger: WORD_STAGGER,
            ease: "circ.out",
          },
          0.4,
        )
        /* Re-enable interaction the moment the menu has fully covered
           the viewport — don't wait for the char cascade to finish. */
        .set(overlay, { pointerEvents: "auto" }, CLIP_OPEN_DURATION)
        /* Hand the chars back to CSS so the per-link hover roll-over
           takes over again once they're settled. */
        .set(chars, { clearProps: "transform" })
        .set(words, { clearProps: "transform" });
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

        {/* ── Featured project 1 — middle, row 1 ───────────────── */}
        {projects[0] && (
          <FeaturedProjectBlock project={projects[0]} onLinkClick={close} />
        )}

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

        {/* ── Featured project 2 — middle, row 2 ───────────────── */}
        {projects[1] && (
          <FeaturedProjectBlock project={projects[1]} onLinkClick={close} />
        )}

        {/* ── Contact — left col, row 3 ────────────────────────── */}
        <section className="menu-overlay__contact" aria-label="Contact us">
          <p className="menu-overlay__label text-small text-caps">Contact us</p>
          <address className="menu-overlay__address text-large">
            {contact.addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          <a
            className="menu-overlay__contact-link link text-large"
            href={`mailto:${contact.email}`}
          >
            <SplitText asWords>{contact.email}</SplitText>
          </a>
          <a
            className="menu-overlay__contact-link link text-large"
            href={contact.phoneHref}
          >
            <SplitText asWords>{contact.phone}</SplitText>
          </a>
        </section>

        {/* ── Featured project 3 — middle, row 3 ───────────────── */}
        {projects[2] && (
          <FeaturedProjectBlock project={projects[2]} onLinkClick={close} />
        )}

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
   The cell carries left + right border lines so the column reads as
   a continuous editorial spine. */

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
        <header className="menu-overlay__project-head">
          <p className="menu-overlay__label text-small text-caps">
            Featured Project
          </p>
          <h3 className="menu-overlay__project-title text-h3">
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

        <div className="menu-overlay__project-foot">
          <TransitionLink
            href={project.href}
            pageName={project.title}
            className="menu-overlay__view-link link text-large"
            onClick={onLinkClick}
          >
            <SplitText asWords>View Project →</SplitText>
          </TransitionLink>

          <dl className="menu-overlay__details">
            {project.details.slice(0, 4).map((detail) => (
              <div key={detail.label} className="menu-overlay__detail-row">
                <dt className="text-small text-caps">{detail.label}</dt>
                <dd className="text-small">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </article>
  );
}
