/**
 * MenuProvider
 * ============
 * Holds the open/close state for the site menu modal so the trigger
 * (in the Header) and the modal itself (sibling component) can share
 * a single source of truth without prop-drilling.
 *
 * Also locks page scrolling while the menu is open by adding
 * `data-menu-open` to the <html> element — globals.css handles the
 * `overflow: hidden` so behaviour is centralised.
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface MenuApi {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MenuContext = createContext<MenuApi | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  /* Lock body scroll while open + close on Escape. Centralised here so
     consuming components stay focused on rendering / styling. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.menuOpen = isOpen ? "true" : "false";
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <MenuContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error("useMenu must be used inside <MenuProvider>");
  }
  return ctx;
}
