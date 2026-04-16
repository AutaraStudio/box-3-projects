/**
 * PageTransition
 * ==============
 * Smooth fade between routes. Intercepts internal `<a>` clicks,
 * fades a fixed overlay IN (~250ms), triggers `router.push`, then
 * fades the overlay OUT (~350ms) once the new route has painted.
 *
 * Click-interception rules:
 *   - Primary-click only (left mouse button, no modifier keys)
 *   - Internal links only (href starts with "/")
 *   - Skips: hash links, external links, target="_blank",
 *     download links, and same-pathname clicks
 *
 * The overlay renders above the Nav (z-index 200) so the whole UI
 * wipes as one. First-load mount just sets the overlay to opacity 0
 * without animating — the Preloader owns the initial-paint moment.
 *
 * Lenis is not touched: the overlay sits on top with
 * `pointer-events: none`, so scroll continues beneath during the
 * fade without any explicit pause/resume.
 */

"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";

import "./PageTransition.css";

/* Local durations — kept here rather than in animations.config so the
   transition can be tuned without touching global motion tokens. */
const FADE_IN_MS = 250;
const FADE_OUT_MS = 350;

export default function PageTransition() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  /* Set to the href the user just clicked. The pathname-change
     effect uses this flag to distinguish a real navigation (fade
     out) from the initial mount (set hidden, don't animate). */
  const pendingHrefRef = useRef<string | null>(null);

  /* ── Intercept internal link clicks ───────────────────────────
     Registered in the CAPTURE phase so we run before Next's
     `<Link>` handler (which fires at the target phase and calls
     preventDefault, which would make a bubble-phase listener see
     `defaultPrevented: true` and bail). We bail early for any
     click we don't want to handle — that lets Next's own handler
     take over as normal. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#")) return;
      if (!href.startsWith("/")) return;
      if (anchor.getAttribute("target") === "_blank") return;
      if (anchor.hasAttribute("download")) return;

      /* Strip query/hash for the same-pathname check. */
      const hrefPath = href.split("?")[0].split("#")[0];
      if (hrefPath === pathname) return;

      /* Take over: prevent browser navigation AND stop Next's Link
         handler from running (otherwise it would also call
         router.push and we'd race with our fade). */
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      pendingHrefRef.current = href;

      const overlay = overlayRef.current;
      if (!overlay) {
        router.push(href);
        return;
      }

      overlay.style.pointerEvents = "auto";
      gsap.killTweensOf(overlay);
      gsap.to(overlay, {
        opacity: 1,
        duration: FADE_IN_MS / 1000,
        ease: "power2.out",
        onComplete: () => {
          router.push(href);
        },
      });
    };

    document.addEventListener("click", onClick, { capture: true });
    return () =>
      document.removeEventListener("click", onClick, { capture: true });
  }, [pathname, router]);

  /* ── Fade overlay out when the new route has mounted ────────── */
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    /* Initial mount — no click-initiated transition pending. */
    if (pendingHrefRef.current === null) {
      gsap.set(overlay, { opacity: 0, pointerEvents: "none" });
      return;
    }

    /* Reset scroll to the top while the overlay still covers the
       viewport — the user never sees the jump. We call Lenis's
       `scrollTo(0, { immediate: true })` if the instance is live
       (SmoothScroll exposes it as `window.__lenis`), and always run
       `window.scrollTo` too so ScrollTrigger re-measures from 0
       regardless of whether Lenis was present. */
    const lenis = (
      window as unknown as {
        __lenis?: {
          scrollTo?: (t: number, opts?: { immediate?: boolean }) => void;
        };
      }
    ).__lenis;
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo(0, 0);

    /* Wait one paint so the new page has rendered under the
       overlay before we reveal it. */
    const raf = requestAnimationFrame(() => {
      gsap.killTweensOf(overlay);
      gsap.to(overlay, {
        opacity: 0,
        duration: FADE_OUT_MS / 1000,
        ease: "power2.inOut",
        onComplete: () => {
          overlay.style.pointerEvents = "none";
          pendingHrefRef.current = null;
        },
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <div ref={overlayRef} className="page-transition" aria-hidden="true" />
  );
}
