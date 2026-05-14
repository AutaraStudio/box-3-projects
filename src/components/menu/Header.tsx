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
 * The home link is a pink square carrying the b·o·x·3 mark. The
 * home preloader's cover morphs onto these exact bounds and hands
 * off to this logo, so the two render identical geometry from the
 * shared logoPaths source.
 */

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import TransitionLink from "@/components/transition/TransitionLink";
import SplitText from "@/components/split-text/SplitText";
import { LOGO_VIEWBOX, LOGO_GLYPHS } from "@/components/brand/logoPaths";
import { awaitTransitionEnd } from "@/components/transition/transitionState";
import { useSiteSettings } from "@/components/settings/SiteSettingsProvider";
import { useMenu } from "./MenuProvider";
import "./Header.css";

const FALLBACK_LABELS = {
  menuOpenLabel: "Menu",
  menuCloseLabel: "Close",
  menuOpenAriaLabel: "Open menu",
  menuCloseAriaLabel: "Close menu",
  contactAriaLabel: "Go to contact page",
} as const;

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
  const settings = useSiteSettings();
  const labels = {
    menuOpenLabel:
      settings?.headerLabels?.menuOpenLabel ?? FALLBACK_LABELS.menuOpenLabel,
    menuCloseLabel:
      settings?.headerLabels?.menuCloseLabel ?? FALLBACK_LABELS.menuCloseLabel,
    menuOpenAriaLabel:
      settings?.headerLabels?.menuOpenAriaLabel ??
      FALLBACK_LABELS.menuOpenAriaLabel,
    menuCloseAriaLabel:
      settings?.headerLabels?.menuCloseAriaLabel ??
      FALLBACK_LABELS.menuCloseAriaLabel,
    contactAriaLabel:
      settings?.headerLabels?.contactAriaLabel ??
      FALLBACK_LABELS.contactAriaLabel,
  };
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
  /* Gates the regular scroll-state effect so it doesn't re-paint
     the bar in its "natural" position before the intro entrance
     has played. Flipped true once the on-mount intro timeline
     completes (or immediately on prefers-reduced-motion). */
  const [introReady, setIntroReady] = useState(false);
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
     false the regular scroll-state values play in.

     Gated on `introReady` — until the on-mount intro timeline
     completes, the bar's positions are owned by the intro effect
     below; we mustn't compete by snapping to scroll-state values
     mid-flight. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!introReady) return;
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
  }, [collapsed, transitioningOut, introReady]);

  /* On-mount intro entrance.
     Sets the bar's pieces to a hidden start state synchronously,
     then waits for the home preloader (and any in-flight page
     transition) to clear before staggering them in. After the
     timeline completes, `introReady` flips and the regular
     scroll-state effect above takes over.
     The hidden initial-state is applied immediately so there's
     no flash of "everything visible" while the preloader is
     still painting on top. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = headerRef.current;
    if (!root) return;
    const lines = root.querySelectorAll<HTMLElement>(".header__line");
    const links = root.querySelectorAll<HTMLElement>(".header__link");
    const btn = root.querySelector<HTMLElement>(".header__menu-btn");
    const contact = root.querySelector<HTMLElement>(".header__contact-btn");

    /* Hidden start state. Lines collapse from the top edge
       (transform-origin: 50% 0%); links + contact ride up out of
       view; menu button parks off-screen-right per the always-
       hidden-at-top rule. */
    if (lines.length) gsap.set(lines, { scaleY: 0 });
    if (links.length) gsap.set(links, { yPercent: -110 });
    if (btn) gsap.set(btn, { xPercent: 101 });
    if (contact) gsap.set(contact, { yPercent: -120, opacity: 0 });

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let cancelled = false;
    awaitTransitionEnd().then(() => {
      if (cancelled) return;

      if (reduceMotion) {
        if (lines.length) gsap.set(lines, { scaleY: 1 });
        if (links.length) gsap.set(links, { yPercent: 0 });
        if (contact) gsap.set(contact, { yPercent: 0, opacity: 1 });
        setIntroReady(true);
        return;
      }

      const dur = 0.75;
      const ease = "expo.out";

      const tl = gsap.timeline({
        onComplete: () => setIntroReady(true),
      });

      if (lines.length) {
        tl.to(lines, { scaleY: 1, duration: dur, ease }, 0);
      }
      if (links.length) {
        tl.to(
          links,
          { yPercent: 0, duration: dur, ease, stagger: 0.05 },
          0.12,
        );
      }
      if (contact) {
        tl.to(
          contact,
          { yPercent: 0, opacity: 1, duration: dur, ease },
          0.28,
        );
      }
    });

    return () => {
      cancelled = true;
    };
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
        {/* Home — a pink square carrying the b·o·x·3 mark. The
            preloader's pink cover morphs onto these exact bounds and
            hands off to this (identical) logo, so the geometry here
            mirrors the preloader: shared logoPaths, same viewBox,
            brown glyphs with the "o" counter punched in pink. */}
        <div className="header__brand">
          <TransitionLink
            href="/"
            pageName="Home"
            className="header__home"
            aria-label={`${brand} home page`}
          >
            <svg
              className="header__home-mark"
              viewBox={LOGO_VIEWBOX}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {LOGO_GLYPHS.map((glyph) => (
                <g key={glyph.id}>
                  {glyph.paths.map((p, i) => (
                    <path
                      key={i}
                      className="header__home-glyph"
                      fillRule={p.evenOdd ? "evenodd" : undefined}
                      d={p.d}
                    />
                  ))}
                </g>
              ))}
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
              aria-label={isOpen ? labels.menuCloseAriaLabel : labels.menuOpenAriaLabel}
              onClick={toggle}
              tabIndex={collapsed ? 0 : -1}
            >
              <span className="header__menu-btn-label">
                {isOpen ? labels.menuCloseLabel : labels.menuOpenLabel}
              </span>
            </button>
          </div>
          <TransitionLink
            href="/contact"
            pageName="Contact"
            className="header__contact-btn"
            aria-label={labels.contactAriaLabel}
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
