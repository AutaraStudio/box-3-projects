/**
 * Sanity Studio Route
 * ===================
 * Embeds the Sanity Studio as a Next.js page at /studio.
 * Uses dynamic rendering to prevent static generation issues.
 */

import { NextStudio } from "next-sanity/studio";

import config from "@/sanity/lib/studio";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sanity Studio",
};

export default function StudioPage() {
  return <NextStudio config={config} />;
}
