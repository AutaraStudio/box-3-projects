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
 *  or once endPreloader() has been broadcast, even if the cover is
 *  still finishing a tail beat (e.g. the step-7 morph onto the header
 *  logo). The cover staying painted during that tail is intentional:
 *  the reveal observers underneath have already started, so the morph
 *  reads as a focal moment instead of dead time. */
export function isPreloaderActive(): boolean {
  if (typeof document === "undefined") return false;
  if (released) return false;
  const v = document.documentElement.getAttribute("data-preloader");
  return v === "active" || v === "reveal";
}

/** Broadcasts "the preloader is no longer blocking reveals." Called
 *  from HomePreloader at the start of the step-7 hand-off so the
 *  hero text + header intro can animate IN PARALLEL with the morph
 *  rather than waiting for the whole timeline to end. The
 *  `data-preloader="skip"` attribute write (and unmount) happens
 *  separately at timeline completion. */
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
