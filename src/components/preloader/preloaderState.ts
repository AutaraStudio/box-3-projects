/**
 * Preloader state
 * ===============
 * Shared signal mirroring `transitionState`, but for the home
 * preloader (the one-shot pink-cover intro that plays once per
 * browser session). Reveal-on-mount / reveal-on-scroll observers
 * call `awaitPreloaderEnd()` so they don't fire while the cover
 * is still painting over the page — otherwise the reveal plays
 * underneath the cover and the user never actually sees it.
 *
 * The preloader writes its own state to `<html data-preloader>`:
 *   - "active" | "reveal" → mid-flight
 *   - "skip"              → finished (or skipped on a return visit)
 *   - missing             → SSR pre-paint
 *
 * `endPreloader()` is called from HomePreloader's finish() and
 * fires the `preloader:end` event so any awaiter resolves.
 */

const END_EVENT = "preloader:end";

/* Module-scoped latch — flipped by endPreloader() so any consumer
   that mounts AFTER the broadcast still reads "done" and doesn't sit
   waiting for an event that already fired. Survives because this
   module is a singleton in the bundle. */
let released = false;

/** True while the preloader cover is still painting (active or in
 *  the brief letter-reveal phase). False once it's done or skipped —
 *  or once endPreloader() has been broadcast. The broadcast fires the
 *  instant the cover has finished shrinking onto the header logo (the
 *  page underneath is fully uncovered) — so reveal observers gated on
 *  this stay parked until the cover has cleared the page, then run,
 *  while the preloader's cosmetic tail finishes on the header logo. */
export function isPreloaderActive(): boolean {
  if (typeof document === "undefined") return false;
  if (released) return false;
  const v = document.documentElement.getAttribute("data-preloader");
  return v === "active" || v === "reveal";
}

/** Broadcasts "the preloader is no longer blocking reveals." In the
 *  animated path it's called from the cover-morph's onComplete — the
 *  instant the full-screen cover has cleared the page by landing on
 *  the header logo — so the hero text + header intro reveal cleanly
 *  AFTER the cover, with no wait for the recolour / glyph / hold tail
 *  that plays out on the header logo. Also called (idempotently) from
 *  settle() alongside the `data-preloader="skip"` write, which covers
 *  the skip + reduced-motion paths where the timeline never runs. */
export function endPreloader(): void {
  if (typeof document === "undefined") return;
  released = true;
  window.dispatchEvent(new Event(END_EVENT));
}

/** Resolves on the next `preloader:end`, or immediately if the
 *  preloader is already done (or was never going to play this
 *  session). Safe to call from any client-only effect. */
export function awaitPreloaderEnd(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!isPreloaderActive()) {
      resolve();
      return;
    }
    const onEnd = () => {
      window.removeEventListener(END_EVENT, onEnd);
      resolve();
    };
    window.addEventListener(END_EVENT, onEnd);
  });
}
