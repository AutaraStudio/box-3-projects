"use client";

/**
 * SiteSettingsProvider
 * ====================
 * Makes the resolved siteSettings document available to any
 * client component anywhere in the tree via `useSiteSettings()`.
 *
 * Used so deep components (project-detail, lightbox controls,
 * legal page labels, testimonial controls) can pull editable
 * UI labels without prop-drilling them through every page +
 * intermediate component.
 *
 * The layout fetches siteSettings server-side and passes the
 * resolved object in once at the root.
 */

import { createContext, useContext, type ReactNode } from "react";

import type { SiteSettingsData } from "@/sanity/queries/siteSettings";

const SiteSettingsContext = createContext<SiteSettingsData | null>(null);

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: SiteSettingsData | null;
  children: ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsData | null {
  return useContext(SiteSettingsContext);
}
