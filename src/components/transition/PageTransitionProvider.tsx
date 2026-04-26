/**
 * PageTransitionProvider
 * ======================
 * Holds the imperative API for the page transition: a single function
 * that the TransitionLink calls when the user clicks an internal link.
 * The PageTransitionOverlay registers the function on mount; until it
 * mounts, links fall back to a normal client-side navigation.
 *
 * Kept deliberately thin — no animation state lives here, just a ref
 * to "play the leave timeline, change the route, then play the enter
 * timeline." The overlay owns the actual GSAP work.
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react";

type TransitionFn = (href: string, pageName?: string) => Promise<void>;

interface PageTransitionApi {
  registerTransition: (fn: TransitionFn) => () => void;
  triggerTransition: TransitionFn;
}

const PageTransitionContext = createContext<PageTransitionApi | null>(null);

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const fnRef = useRef<TransitionFn | null>(null);

  const registerTransition = useCallback((fn: TransitionFn) => {
    fnRef.current = fn;
    return () => {
      if (fnRef.current === fn) fnRef.current = null;
    };
  }, []);

  const triggerTransition = useCallback<TransitionFn>(async (href, pageName) => {
    /* If the overlay isn't mounted yet (e.g. early SSR hydration), fall
       through to a normal navigation. */
    if (!fnRef.current) {
      window.location.href = href;
      return;
    }
    await fnRef.current(href, pageName);
  }, []);

  return (
    <PageTransitionContext.Provider
      value={{ registerTransition, triggerTransition }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) {
    throw new Error(
      "usePageTransition must be used inside <PageTransitionProvider>",
    );
  }
  return ctx;
}
