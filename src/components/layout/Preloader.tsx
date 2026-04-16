/**
 * Preloader
 * =========
 * First-load preloader shell. Ports the pattern from the previous
 * site:
 *
 *   1. Add `.is-preloader` to `[data-preloader="target"]` — the
 *      nav's square logo link expands to fill the viewport with a
 *      flat pink wash.
 *   2. Wait ~2s so the initial page paint + first Sanity request
 *      settle.
 *   3. `Flip.getState(target)` captures the fullscreen state.
 *   4. Remove `.is-preloader` — target snaps back to its nav slot
 *      in markup.
 *   5. `Flip.from(state)` animates the visible morph from fullscreen
 *      down to the nav slot, 1.4s power4.inOut, absolute.
 *
 * Deliberately empty — no tagline, no cross, nothing layered on
 * top. The shell is the whole effect for now. Future content (a
 * tagline box, a wordmark, an animated mark) can be stacked on by
 * adding afterFlip tweens inside the Flip's `onComplete`.
 *
 * Gated by sessionStorage so it runs once per tab. On subsequent
 * navigations the component mounts briefly, sees the flag, and
 * exits without touching the DOM.
 */

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";

const SESSION_KEY = "box3-preloader-seen";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip);
}

export default function Preloader() {
  /* Strict Mode runs the effect twice in dev — ranRef short-circuits
     the second pass so the Flip morph doesn't play twice. */
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    /* Returning visitors skip entirely. */
    if (window.sessionStorage.getItem(SESSION_KEY) === "true") return;

    const target = document.querySelector<HTMLElement>(
      '[data-preloader="target"]',
    );
    if (!target) return;

    /* Nav UI that should stay hidden during the preloader + Flip
       morph and only reveal once the shell has landed in its nav
       slot — primary + secondary link lists, menu button wrap, and
       the contact (pencil) button. The Nav component's own useGSAP
       schedules some of these to fade in at ~0.4s, so we kill its
       pending tweens before setting opacity 0 ourselves. */
    const navItems = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".primary-nav-list, .secondary-nav-list, .menu-btn-wrap, .contact-link-btn",
      ),
    );

    function hideNavItems() {
      if (navItems.length === 0) return;
      gsap.killTweensOf(navItems);
      gsap.set(navItems, { opacity: 0 });
    }

    /* Hide immediately, then hide AGAIN on the next frame in case
       Nav's useGSAP fires after Preloader's useEffect and schedules
       its own fade-ins. This belt-and-braces override guarantees
       the nav stays invisible until we reveal it at Flip complete. */
    hideNavItems();
    const raf = requestAnimationFrame(hideNavItems);

    /* Stop Lenis while the preloader covers the viewport — user
       can't scroll the covered page. Resumed on Flip complete. */
    const lenis = (
      window as unknown as { lenis?: { stop: () => void; start: () => void } }
    ).lenis;
    lenis?.stop();

    /* Expand the target to fill the viewport. CSS for
       `.is-preloader` lives in globals.css. */
    target.classList.add("is-preloader");

    const tl = gsap.timeline({ delay: 2 });

    tl.add(() => {
      const state = Flip.getState(target);
      target.classList.remove("is-preloader");
      Flip.from(state, {
        duration: 1.4,
        ease: "power4.inOut",
        absolute: true,
        onComplete: () => {
          lenis?.start();
          window.sessionStorage.setItem(SESSION_KEY, "true");

          /* Reveal the nav UI — soft stagger so the reveal has a
             little rhythm rather than everything popping in at once. */
          if (navItems.length > 0) {
            gsap.to(navItems, {
              opacity: 1,
              duration: 0.5,
              ease: "power4.out",
              stagger: 0.08,
            });
          }
        },
      });
    });

    return () => {
      tl.kill();
      cancelAnimationFrame(raf);
      target.classList.remove("is-preloader");
      /* Unmounting mid-animation — restore the nav items so we
         don't leave the UI permanently hidden. */
      if (navItems.length > 0) {
        gsap.set(navItems, { opacity: 1 });
      }
    };
  }, []);

  return null;
}
