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
import { useRouter } from "next/navigation";
import { gsap } from "gsap";

import { usePageTransition } from "./PageTransitionProvider";
import "./PageTransitionOverlay.css";

const LEAVE_PANEL_DURATION = 0.8;
const ENTER_PANEL_DURATION = 1.0;
const PAGE_LIFT = "-15vh";
const PAGE_RISE = "15vh";
/* Editorial cubic-bezier — long pull-out, soft settle. Matches the
   "0.625, 0.05, 0, 1" feel from the Osmo reference. */
const EASE = "cubic-bezier(0.625, 0.05, 0, 1)";

export default function PageTransitionOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);

  const router = useRouter();
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

      /* Push the new route — Next.js mounts the new page behind the
         panel. Wait two frames so the new <main> is in the DOM and
         scrollY can be reset before we animate it in. */
      router.push(href);
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));
      /* Jump to top through Lenis when present, otherwise native. Lenis's
         own scroll position needs to be reset alongside the document so
         the next wheel event doesn't snap back to the previous page's
         scroll. */
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }

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
        <span ref={labelRef} className="page-transition__label">
          <span ref={labelTextRef} />
        </span>
      </div>
    </div>
  );
}
