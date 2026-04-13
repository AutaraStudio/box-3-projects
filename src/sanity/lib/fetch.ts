/**
 * Sanity Fetch Helper
 * ===================
 * Typed, reusable wrapper around the Sanity client's fetch method.
 * All page-level data fetching should use this helper to ensure
 * consistent error handling and type safety across the application.
 *
 * Usage:
 *   const data = await sanityFetch<HomePage>({ query: HOME_PAGE_QUERY });
 */

import { client } from "./client";

interface SanityFetchParams {
  query: string;
  params?: Record<string, unknown>;
}

export async function sanityFetch<T = unknown>({
  query,
  params = {},
}: SanityFetchParams): Promise<T> {
  try {
    return await client.fetch<T>(query, params);
  } catch (error) {
    console.error("[sanityFetch] Failed to fetch data:", error);
    throw error;
  }
}
