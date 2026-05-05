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

/** True while the preloader cover is still painting (active or in
 *  the brief letter-reveal phase). False once it's done or skipped. */
export function isPreloaderActive(): boolean {
  if (typeof document === "undefined") return false;
  const v = document.documentElement.getAttribute("data-preloader");
  return v === "active" || v === "reveal";
}

/** Called from the preloader's finish() — broadcasts the end event
 *  to any awaiter. The `data-preloader="skip"` attribute write is
 *  done by the caller. */
export function endPreloader(): void {
  if (typeof document === "undefined") return;
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
