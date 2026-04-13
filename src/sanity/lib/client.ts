/**
 * Sanity Client Configuration
 * ===========================
 * Central Sanity client instance used across the entire application.
 * All data fetching flows through this client.
 *
 * Environment variables:
 * - NEXT_PUBLIC_SANITY_PROJECT_ID — Sanity project identifier
 * - NEXT_PUBLIC_SANITY_DATASET — Target dataset (e.g. "production")
 * - NEXT_PUBLIC_SANITY_API_VERSION — API version date string
 */

import { createClient } from "next-sanity";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION!;

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production",
  perspective: "published",
});
