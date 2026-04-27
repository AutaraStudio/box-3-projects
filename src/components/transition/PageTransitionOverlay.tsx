/**
 * PageTransitionOverlay
 * =====================
 * The animated panel itself. Mounted once at the layout root.
 * Registers a transition function with PageTransitionProvider that
 * runs the leave timeline → swaps the route → runs the enter timeline.
 *
 * Sequence (mirrors the Osmo wipe — single panel, vertical wipe):
 *
 *   LEAVE (≈0.8s)
 *     panel: yPercent  0 → -100   (slides up from below to cover viewport)
 *     <main>: y         0 → -15vh (current page lifts slightly for depth)
 *     label:  fade in at +0.2s once panel is mid-cover
 *
 *   SWAP — at the end of leave, push the new route. Browser scroll
 *   resets to top inside an effect on the new page.
 *
 *   ENTER (≈1.0s)
 *     panel: yPercent -100 → -200 (continues up off the top of viewport)
 *     <main>: y       15vh →   0  (new page rises from below)
 *     label:  fade out
 *
 * Honours `prefers-reduced-motion`: instant swap, no animation.
 */

"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { usePageTransition } from "./PageTransitionProvider";
import { beginTransition, endTransition } from "./transitionState";
import "./PageTransitionOverlay.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const LEAVE_PANEL_DURATION = 0.6;
const ENTER_PANEL_DURATION = 0.7;
/* Minimum hold once the new route has committed — gives the
   browser two paint cycles to render the new page behind the
   panel before the enter timeline starts revealing it. */
const HOLD_AFTER_COMMIT = 0.2;
/* Hard ceiling on how long we wait for a route to commit before
   we give up and reveal anyway. Stops the panel hanging forever
   if a navigation stalls. */
const COMMIT_TIMEOUT = 4;
const PAGE_LIFT = "-12vh";
const PAGE_RISE = "12vh";
/* Subtle in-out cubic — even acceleration on both ends so neither
   the leave nor the enter feels punchy. Matches the "easeInOutCubic"
   curve commonly used for full-viewport editorial wipes. */
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

export default function PageTransitionOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  /* Mirror pathname into a ref so the imperative transition function
     (stored on the provider's ref, not closed over from this render)
     can read the live value without becoming a dependency of the
     registration effect. */
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);
  const { registerTransition } = usePageTransition();

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /* The animated <main> — singular per Next.js convention. We animate
       it directly so the current/incoming page rises and falls. */
    const getMain = () =>
      document.querySelector<HTMLElement>("main") || document.body;

    const transition = async (href: string, pageName?: string) => {
      const overlay = overlayRef.current;
      const panel = panelRef.current;
      const label = labelRef.current;
      const labelText = labelTextRef.current;
      if (!overlay || !panel || !label) {
        router.push(href);
        return;
      }

      if (reducedMotion) {
        router.push(href);
        return;
      }

      if (labelText) labelText.textContent = pageName ?? "";

      const main = getMain();
      const lenis = window.__lenis;

      /* Pause smooth scroll during the wipe so the user's wheel/touch
         can't shift the underlying page while the panel covers it. */
      lenis?.stop();

      /* Mark the document as mid-transition so any reveal-on-mount /
         reveal-on-scroll observers on the new page can defer their
         animation until the panel has fully slid off. */
      beginTransition();

      /* Force the panel's pre-leave state in one pass so neither
         the GPU layer nor the visibility flips on a stale frame.
         Without this, click-to-leave can occasionally show the
         panel for a frame at its previous yPercent before the
         tween catches up. */
      gsap.set(panel, {
        yPercent: 0,
        autoAlpha: 0,
        willChange: "transform, opacity",
      });

      /* Leave timeline — panel up, page lifts, label fades in. */
      const leave = gsap.timeline();
      leave.set(panel, { autoAlpha: 1 }, 0);
      leave.fromTo(
        panel,
        { yPercent: 0 },
        { yPercent: -100, duration: LEAVE_PANEL_DURATION, ease: EASE },
        0,
      );
      leave.fromTo(
        main,
        { y: 0 },
        { y: PAGE_LIFT, duration: LEAVE_PANEL_DURATION, ease: EASE },
        0,
      );
      if (pageName) {
        leave.fromTo(
          label,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.3, ease: "none" },
          "<+=0.2",
        );
      }

      await leave.then();

      /* Push the new route. Next.js fetches + renders behind the
         panel; we then *wait for the React tree to actually commit
         the new pathname* before revealing it. Without this, async
         server components (which take a network round-trip) leave
         the OLD <main> in the DOM during enter — the user sees the
         old page peeking out from behind the panel. */
      const targetPath = new URL(href, window.location.origin).pathname;
      router.push(href);

      await new Promise<void>((resolve) => {
        if (pathnameRef.current === targetPath) {
          resolve();
          return;
        }
        const start = performance.now();
        const tick = () => {
          if (pathnameRef.current === targetPath) {
            resolve();
            return;
          }
          if (performance.now() - start > COMMIT_TIMEOUT * 1000) {
            /* Stalled — give up and reveal anyway. */
            resolve();
            return;
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });

      /* Two paint cycles after the commit so first-paint flicker
         (image decode, font swap) doesn't peek out from behind
         the panel as it slides off. */
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));

      /* Reset scroll to the top of the new page. Three writes,
         one belt-and-braces: the window/document are reset
         immediately (some browsers persist scroll on history
         navigation), and Lenis is told to jump to 0 immediately —
         while stopped, Lenis won't tick on its own, so we also
         poke its internal scroll value via scrollTo+immediate
         which writes synchronously regardless of stopped state.
         Without this, navigating to a long page (e.g. /projects)
         can leave the user landed mid-page with the sticky filter
         bar already past its trigger. */
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      lenis?.scrollTo(0, { immediate: true, force: true });

      /* Short held beat once we know the new page has rendered. */
      await new Promise((r) => setTimeout(r, HOLD_AFTER_COMMIT * 1000));

      /* Enter timeline — panel continues up off the top, new page rises. */
      const newMain = getMain();
      const enter = gsap.timeline();
      enter.fromTo(
        panel,
        { yPercent: -100 },
        {
          yPercent: -200,
          duration: ENTER_PANEL_DURATION,
          ease: EASE,
          immediateRender: false,
        },
        0,
      );
      if (pageName) {
        enter.fromTo(
          label,
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: 0.3, ease: "none" },
          0.1,
        );
      }
      enter.fromTo(
        newMain,
        { y: PAGE_RISE },
        { y: 0, duration: ENTER_PANEL_DURATION, ease: EASE },
        0,
      );

      /* Release the transition flag mid-enter so the new page's
         reveal observers (Heading, RevealStack, RevealImage) can
         start animating *in parallel* with the panel sliding off,
         rather than waiting until the panel is fully gone. The
         user sees content appearing as the panel uncovers it,
         which feels continuous instead of staggered.

         Refreshing ScrollTrigger up front (still safe — newMain's
         enter transform is small and uniform across the whole
         body, so trigger positions resolve correctly) means any
         scroll-driven animations on the new page also rebuild
         in time. */
      ScrollTrigger.refresh();
      endTransition();

      await enter.then();

      /* Reset for next run. */
      gsap.set(panel, { autoAlpha: 0, yPercent: 0 });
      gsap.set(label, { autoAlpha: 0 });
      gsap.set(newMain, { clearProps: "transform" });
      lenis?.start();
    };

    return registerTransition(transition);
  }, [registerTransition, router]);

  return (
    <div ref={overlayRef} className="page-transition" aria-hidden="true">
      <div ref={panelRef} className="page-transition__panel">
        <span ref={labelRef} className="page-transition__label text-h2">
          <span ref={labelTextRef} />
        </span>
      </div>
    </div>
  );
}
