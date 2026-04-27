/**
 * Page transition state
 * =====================
 * Shared signal for any reveal-on-mount/scroll observer that needs
 * to wait until the page-transition panel has slid off before
 * starting its animation. Without this, IntersectionObservers on a
 * newly-mounted page fire immediately (the elements ARE in the
 * viewport geometrically) and the reveal animation runs behind the
 * still-covering panel — so the user never sees it.
 *
 * The PageTransitionOverlay calls beginTransition / endTransition
 * around its leave-hold-enter sequence. Anything that needs to
 * wait calls awaitTransitionEnd() — it resolves immediately if no
 * transition is in flight, otherwise on the next end event.
 */

const HTML_FLAG = "is-page-transitioning";
const END_EVENT = "pagetransition:end";

export function beginTransition(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.add(HTML_FLAG);
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

/** Resolves on the next `pagetransition:end`, or immediately if no
 *  transition is currently in flight. Safe to call from any
 *  client-only effect. */
export function awaitTransitionEnd(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!isPageTransitioning()) {
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
