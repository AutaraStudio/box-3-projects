"use client";

/**
 * Header
 * ======
 * Fixed editorial nav bar based on the Outsource Consultants
 * reference. Layout (desktop):
 *
 *   [ logo pill | primary links | secondary links | menu btn | contact btn ]
 *
 * Two states driven by scroll position:
 *
 *   data-scrolled="false" (at top)
 *     - primary + secondary text links visible
 *     - vertical column lines visible
 *     - Menu button hidden off-screen-right
 *
 *   data-scrolled="true" (scrolled past threshold)
 *     - text links wipe up out of their overflow:hidden parents
 *     - column lines collapse (scaleY 0)
 *     - Menu button slides in from the right
 *
 * The Contact button is always visible and shows a pen glyph
 * (no text), matching the reference. Menu open/close also forces
 * the scrolled state so the Menu button stays available regardless
 * of scroll position when the panel is on screen.
 *
 * Wordmark sits as static text — the reference's GSAP-Flip morph
 * into a logo-only square is intentionally skipped.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import TransitionLink from "@/components/transition/TransitionLink";
import SplitText from "@/components/split-text/SplitText";
import { useMenu } from "./MenuProvider";
import "./Header.css";

interface HeaderLink {
  label: string;
  href: string;
}

interface HeaderProps {
  primaryLinks: HeaderLink[];
  secondaryLinks: HeaderLink[];
  /** Brand label used as the home link's accessible name. */
  brand: string;
}

/* Pixel threshold past which the header swaps from "links visible"
   to "menu button visible". Matches the reference's roughly
   80–100px trigger. */
const SCROLL_THRESHOLD = 80;

export default function Header({
  primaryLinks,
  secondaryLinks,
  brand,
}: HeaderProps) {
  const { isOpen, toggle } = useMenu();
  const headerRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  /* Theme of the section currently behind the header. Updates on
     scroll so the bar's colours match (and visually merge with)
     whatever section it's currently overlapping. */
  const [sectionTheme, setSectionTheme] = useState<string>("dark");
  /* Mirrors the page-transition state so the bar's pieces can lift
     off-screen while the wipe panel covers the page, then animate
     back in once the new route is committed. */
  const [transitioningOut, setTransitioningOut] = useState(false);
  /* Held imperatively so other effects (transition-end, route
     change) can re-trigger a probe without causing a re-build of
     the listener wiring. */
  const probeThemeRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Theme detection — pick the most specific [data-theme] element
     whose box currently covers a probe line a few pixels into the
     viewport from the top (where the header sits). Excludes the
     header's own subtree. Re-runs on scroll + resize so a section
     swap appears as a snappy theme flip. */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const PROBE_Y = 8; // px from viewport top — well under the bar

    const update = () => {
      const all = document.querySelectorAll<HTMLElement>("[data-theme]");
      const header = headerRef.current;
      let best: { theme: string; depth: number } | null = null;

      /* Pass 1 — bounding-rect probe: pick the deepest themed
         element whose box currently covers the probe line. This
         is the source of truth once the page is settled. */
      all.forEach((el) => {
        if (header?.contains(el)) return;
        if (el === document.body || el === document.documentElement) return;
        const r = el.getBoundingClientRect();
        if (r.top <= PROBE_Y && r.bottom > PROBE_Y) {
          let depth = 0;
          let p: HTMLElement | null = el.parentElement;
          while (p) {
            depth++;
            p = p.parentElement;
          }
          if (!best || depth > best.depth) {
            const t = el.dataset.theme;
            if (t) best = { theme: t, depth };
          }
        }
      });

      /* Pass 2 — first themed descendant of <main> in document
         order. ONLY used during a page transition, when <main> is
         translated ~12vh below its final position so its first
         section's top sits well under the probe Y. Outside of a
         transition we want pass 3 (body fallback) to win for the
         normal case of scrolling between/past themed sections. */
      if (
        !best &&
        document.documentElement.classList.contains("is-page-transitioning")
      ) {
        const main = document.querySelector<HTMLElement>("main");
        if (main) {
          const first = main.querySelector<HTMLElement>("[data-theme]");
          if (first && !header?.contains(first)) {
            const t = first.dataset.theme;
            if (t) best = { theme: t, depth: 1 };
          }
        }
      }

      /* Pass 3 — body / html fallback for normal scroll-between
         sections (and as a last resort). */
      if (!best) {
        const t = document.body.dataset.theme;
        if (t) best = { theme: t, depth: 0 };
      }

      if (best) {
        const next = (best as { theme: string }).theme;
        setSectionTheme((cur) => (cur === next ? cur : next));
      }
    };

    probeThemeRef.current = update;
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    /* DOM might not be fully laid out on first run (Sanity-fed
       sections, fonts loading, etc.), so re-probe shortly after. */
    const t = window.setTimeout(update, 200);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.clearTimeout(t);
    };
  }, []);

  /* Subscribe to the page-transition lifecycle so the bar can
     lift off as the wipe begins and drop back in once the new
     page is committed.

     Theme probe timing is tricky: `pagetransition:end` fires at
     the START of the enter timeline, when the new <main> is still
     translated ~12vh below its final position. Probing at that
     moment hits empty space at the top of the viewport and falls
     back to the body's theme. We instead probe across the enter
     window so the moment the new section settles to y=0 we read
     and apply its theme — without waiting for the user's first
     scroll. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onBegin = () => setTransitioningOut(true);
    const probeTimers: number[] = [];
    const onEnd = () => {
      setTransitioningOut(false);
      probeTimers.forEach((id) => window.clearTimeout(id));
      probeTimers.length = 0;
      /* Schedule probes through the entire enter animation
         (~700ms) so the latest one always catches the section
         once it lands at y=0. */
      [0, 100, 250, 450, 700, 1000].forEach((delay) => {
        probeTimers.push(
          window.setTimeout(() => probeThemeRef.current(), delay),
        );
      });
    };
    window.addEventListener("pagetransition:begin", onBegin);
    window.addEventListener("pagetransition:end", onEnd);
    return () => {
      window.removeEventListener("pagetransition:begin", onBegin);
      window.removeEventListener("pagetransition:end", onEnd);
      probeTimers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  /* Pathname changes commit before the enter timeline starts —
     re-probe theme there too so a slow enter never delays the
     correct colour. Two RAFs so the new page's wrappers are
     mounted + laid out before we read their bounding rects. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => probeThemeRef.current());
    });
    return () => {
      cancelAnimationFrame(id1);
      if (id2) cancelAnimationFrame(id2);
    };
  }, [pathname]);

  /* While the panel is open, force the scrolled state so the
     Menu button stays on screen even if the user opens it from
     the very top of the page. */
  const collapsed = scrolled || isOpen;

  /* GSAP drives the scroll-state transforms — CSS transitions
     were misbehaving on this combination of position/inset/transform
     elements in this stack, so we use GSAP for guaranteed control.
     Also handles the page-transition lift: when `transitioningOut`
     is true every piece sweeps off-screen up; when it flips back
     false the regular scroll-state values play in. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = headerRef.current;
    if (!root) return;
    const home = root.querySelector<HTMLElement>(".header__home");
    const lines = root.querySelectorAll<HTMLElement>(".header__line");
    const links = root.querySelectorAll<HTMLElement>(".header__link");
    const btn = root.querySelector<HTMLElement>(".header__menu-btn");
    const contact = root.querySelector<HTMLElement>(".header__contact-btn");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dur = reduceMotion ? 0 : 0.6;
    const ease = "expo.inOut";

    /* During the page transition the PageTransitionOverlay owns the
       header's lift / drop-back tweens. Bail out so we don't fight
       it by re-applying scroll-state positions. */
    if (transitioningOut) {
      void home;
      void contact;
      return;
    }

    if (lines.length) {
      gsap.to(lines, { scaleY: collapsed ? 0 : 1, duration: dur, ease });
    }
    if (links.length) {
      gsap.to(links, {
        yPercent: collapsed ? -110 : 0,
        duration: dur,
        ease,
      });
    }
    if (btn) {
      gsap.to(btn, {
        xPercent: collapsed ? 0 : 101,
        duration: dur,
        ease,
      });
    }
  }, [collapsed, transitioningOut]);

  /* Set initial GSAP state on mount so the first paint matches
     (avoids a flash of "everything visible" before the effect
     runs). */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = headerRef.current;
    if (!root) return;
    const btn = root.querySelector<HTMLElement>(".header__menu-btn");
    if (btn) gsap.set(btn, { xPercent: 101 });
  }, []);

  return (
    <header
      ref={headerRef}
      className="header"
      data-theme={sectionTheme}
      data-scrolled={collapsed ? "true" : "false"}
      data-menu-open={isOpen ? "true" : "false"}
    >
      <nav className="header__nav" aria-label="Main">
        {/* Logo — square brand mark, no wordmark. */}
        <div className="header__brand">
          <TransitionLink
            href="/"
            pageName="Home"
            className="header__home"
            aria-label={`${brand} home page`}
          >
            <svg
              className="header__home-logo"
              viewBox="0 0 110 110"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="110" height="110" className="header__home-logo-bg" />
              <path
                className="header__home-logo-mark"
                d="M27.815 87.365C30.615 88.31 31.84 90.06 31.84 92.755C31.84 97.935 28.305 100 19.45 100H17.56V94.54H19.45C23.79 94.54 25.12 94.015 25.12 92.335C25.12 90.655 23.79 90.13 19.45 90.13H17.56V84.67H19.45C23.475 84.67 24.7 84.145 24.7 82.465C24.7 80.785 23.475 80.26 19.45 80.26H17.56V74.8H19.45C27.99 74.8 31.42 76.865 31.42 82.045C31.42 84.635 30.3 86.35 27.815 87.365ZM10 100V74.8H16.72V100H10Z"
              />
              <path
                className="header__home-logo-mark"
                d="M47.7808 100C45.3308 100 43.1095 99.461 41.1168 98.383C39.1568 97.305 37.5888 95.8023 36.4128 93.875C35.2695 91.9477 34.6978 89.7427 34.6978 87.26C34.6978 84.7447 35.2695 82.5397 36.4128 80.645C37.5888 78.7177 39.1731 77.215 41.1658 76.137C43.1585 75.059 45.3635 74.52 47.7808 74.52C50.2308 74.52 52.4358 75.059 54.3958 76.137C56.3885 77.215 57.9565 78.7177 59.0998 80.645C60.2758 82.5397 60.8638 84.7447 60.8638 87.26C60.8638 89.7427 60.2758 91.9477 59.0998 93.875C57.9565 95.8023 56.3885 97.305 54.3958 98.383C52.4358 99.461 50.2308 100 47.7808 100ZM47.7808 94.071C48.8915 94.071 49.9041 93.826 50.8188 93.336C51.7335 92.8133 52.4521 92.0457 52.9748 91.033C53.5301 90.0203 53.8078 88.7627 53.8078 87.26C53.8078 85.7573 53.5301 84.4997 52.9748 83.487C52.4195 82.4744 51.6845 81.723 50.7698 81.233C49.8878 80.7104 48.9078 80.449 47.8298 80.449C46.7191 80.449 45.7065 80.7104 44.7918 81.233C43.8771 81.723 43.1421 82.4744 42.5868 83.487C42.0315 84.467 41.7538 85.7247 41.7538 87.26C41.7538 88.7627 42.0151 90.0203 42.5378 91.033C43.0931 92.0457 43.8281 92.8133 44.7428 93.336C45.6575 93.826 46.6701 94.071 47.7808 94.071Z"
              />
              <path
                className="header__home-logo-mark"
                d="M60.8638 98.824L69.8308 86.672L60.8638 74.52H68.2628L74.2408 82.752L80.1698 74.52H87.5198L78.5528 86.672L87.5198 98.824H80.1698L74.2408 90.592L68.2628 98.824H60.8638Z"
              />
              <path
                className="header__home-logo-mark"
                d="M95.0778 88.48C93.1178 88.48 91.5511 87.84 90.3778 86.56L92.0778 84.76C92.4378 85.1333 92.8444 85.4467 93.2978 85.7C93.7644 85.9533 94.3111 86.08 94.9378 86.08C95.4178 86.08 95.8311 86 96.1778 85.84C96.5378 85.6667 96.8111 85.4267 96.9978 85.12C97.1978 84.8 97.2978 84.4334 97.2978 84.02C97.2978 83.3267 97.0511 82.8 96.5578 82.44C96.0644 82.0667 95.3644 81.88 94.4578 81.88H93.2578V80.16L97.4978 75.8L97.6778 77.14H91.0978V74.8H99.6578V76.82L95.4178 81.18L95.0378 79.7C96.6644 79.7134 97.8978 80.0934 98.7378 80.84C99.5911 81.5734 100.018 82.6334 100.018 84.02C100.018 84.9133 99.8111 85.6933 99.3978 86.36C98.9844 87.0267 98.4044 87.5467 97.6578 87.92C96.9244 88.2933 96.0644 88.48 95.0778 88.48Z"
              />
            </svg>
          </TransitionLink>
        </div>

        {/* Primary nav column (desktop). */}
        <div className="header__col header__col--primary">
          <span className="header__line" aria-hidden="true" />
          <ul className="header__links" role="menu">
            {primaryLinks.map((l) => (
              <li key={l.href} className="header__link-item" role="none">
                <TransitionLink
                  href={l.href}
                  pageName={l.label}
                  className="header__link link"
                  role="menuitem"
                  tabIndex={collapsed ? -1 : 0}
                >
                  <SplitText asWords>{l.label}</SplitText>
                </TransitionLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Secondary nav column (desktop). */}
        <div className="header__col header__col--secondary">
          <span className="header__line" aria-hidden="true" />
          <ul className="header__links" role="menu">
            {secondaryLinks.map((l) => (
              <li key={l.href} className="header__link-item" role="none">
                <TransitionLink
                  href={l.href}
                  pageName={l.label}
                  className="header__link link"
                  role="menuitem"
                  tabIndex={collapsed ? -1 : 0}
                >
                  <SplitText asWords>{l.label}</SplitText>
                </TransitionLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Menu button (slides in when scrolled) + Contact icon button. */}
        <div className="header__actions">
          <div className="header__menu-slot">
            <button
              type="button"
              className="header__menu-btn"
              aria-expanded={isOpen}
              aria-controls="site-menu"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              onClick={toggle}
              tabIndex={collapsed ? 0 : -1}
            >
              <span className="header__menu-btn-label">
                {isOpen ? "Close" : "Menu"}
              </span>
            </button>
          </div>
          <TransitionLink
            href="/contact"
            pageName="Contact"
            className="header__contact-btn"
            aria-label="Go to contact page"
          >
            <svg
              className="header__contact-btn-icon"
              viewBox="0 0 20 27"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m14.02 7.314 2.598 1.5-4.516 7.822"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="11.117"
                y="3.611"
                width="4.8"
                height="16.675"
                rx="1"
                transform="rotate(30 11.117 3.61)"
                fill="currentColor"
              />
              <path
                fill="currentColor"
                d="m11.813 2.407 4.157 2.4 1.389-2.406L13.202 0zM1.303 20.609l.776 3.456L5.46 23.01l.782-1.354-4.158-2.4-.781 1.354Z"
              />
            </svg>
          </TransitionLink>
        </div>
      </nav>
    </header>
  );
}
