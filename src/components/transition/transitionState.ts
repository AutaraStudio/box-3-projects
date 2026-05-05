/**
 * Page transition state
 * =====================
 * Shared signal for any reveal-on-mount/scroll observer that needs
 * to wait until visual coverage has cleared before starting its
 * animation. Without this, IntersectionObservers on a newly-mounted
 * page fire immediately (the elements ARE in the viewport
 * geometrically) and the reveal animation runs behind the still-
 * covering panel — so the user never sees it.
 *
 * Two sources of coverage are awaited together:
 *
 *   1. The page-transition panel — managed here. The
 *      PageTransitionOverlay calls beginTransition / endTransition
 *      around its leave-hold-enter sequence.
 *
 *   2. The home preloader — the one-shot pink intro that plays
 *      once per browser session. Awaited via the sibling
 *      `preloader/preloaderState` module so the same observers
 *      also defer their entrance until the cover has fully
 *      revealed the page underneath.
 *
 * Anything that needs to wait calls awaitTransitionEnd() — it
 * resolves once BOTH covers are clear. Resolves immediately if
 * neither is in flight (the common in-app navigation case once
 * the preloader has played).
 */

import { awaitPreloaderEnd } from "@/components/preloader/preloaderState";

const HTML_FLAG = "is-page-transitioning";
const BEGIN_EVENT = "pagetransition:begin";
const END_EVENT = "pagetransition:end";

export function beginTransition(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.add(HTML_FLAG);
  window.dispatchEvent(new Event(BEGIN_EVENT));
}

export function endTransition(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove(HTML_FLAG);
  window.dispatchEvent(new Event(END_EVENT));
}

export function isPageTransitioning(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains(HTML_FLAG);
}

/** Resolves once BOTH the home preloader and any in-flight page
 *  transition have finished — i.e. once visual coverage of the page
 *  is clear and a reveal animation underneath would actually be
 *  seen. Resolves immediately on the common in-app navigation case
 *  (no preloader, no transition). Safe to call from any client-
 *  only effect. */
export function awaitTransitionEnd(): Promise<void> {
  /* Preloader first (one-shot at session start), then any
     in-flight page transition. Sequencing them serially is fine
     because the preloader only ever plays once and resolves
     immediately on every subsequent call. */
  return awaitPreloaderEnd().then(
    () =>
      new Promise<void>((resolve) => {
        if (!isPageTransitioning()) {
          resolve();
          return;
        }
        const onEnd = () => {
          window.removeEventListener(END_EVENT, onEnd);
          resolve();
        };
        window.addEventListener(END_EVENT, onEnd);
      }),
  );
}
