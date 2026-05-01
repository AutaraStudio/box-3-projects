"use client";

/**
 * MenuProvider
 * ============
 * Tiny context that owns the open/closed state of the site menu
 * overlay. Both the Header (Menu button) and the MenuOverlay (panel)
 * read/write through `useMenu()`.
 *
 * Side effects while open:
 *   - sets `data-menu-open="true"` on <html> so globals.css can lock
 *     the underlying body scroll
 *   - pauses Lenis (smooth scroll) so the page underneath cannot
 *     scroll, which would visually drift behind the panel
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

interface MenuContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  /* Auto-close on route change so the panel never lingers
     after the user picks a link. */
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  /* Mirror state onto <html> for the scroll-lock CSS, and
     pause/resume Lenis to match. */
  useEffect(() => {
    const root = document.documentElement;
    if (isOpen) {
      root.setAttribute("data-menu-open", "true");
      window.__lenis?.stop();
    } else {
      root.removeAttribute("data-menu-open");
      window.__lenis?.start();
    }
    return () => {
      root.removeAttribute("data-menu-open");
      window.__lenis?.start();
    };
  }, [isOpen]);

  /* ESC key closes the menu — standard a11y. */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const value = useMemo<MenuContextValue>(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error("useMenu must be used inside <MenuProvider>");
  }
  return ctx;
}
