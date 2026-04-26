/**
 * /studio
 * =======
 * Mounts the embedded Sanity Studio at /studio. Catch-all route so
 * Sanity can resolve its own internal screens (/studio/desk,
 * /studio/vision, /studio/structure/...).
 *
 * Marked "use client" because Sanity's UI library uses React
 * createContext at module scope, which fails in server components.
 * Metadata + viewport exports live in the (studio)/layout.tsx
 * server component.
 */

"use client";

import { NextStudio } from "next-sanity/studio";

import config from "@/sanity/lib/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
