/**
 * Sanity Studio Route
 * ===================
 * Embeds the Sanity Studio as a Next.js page at /studio.
 * Marked as a client component because NextStudio uses React context.
 * Metadata is exported from the layout instead.
 */

"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity/lib/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
