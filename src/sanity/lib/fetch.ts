/**
 * sanityFetch
 * ===========
 * Thin wrapper around the Sanity client with sensible defaults for
 * Next.js App Router server components: typed return, optional
 * params, opt-in revalidate window. Defaults to fully cached fetches
 * — pass `revalidate: 0` for live data on a server component.
 */

import { client } from "./client";

interface SanityFetchOptions<T> {
  query: string;
  params?: Record<string, unknown>;
  /** Seconds. 0 = uncached, false = forever, n = ISR window. */
  revalidate?: number | false;
  tags?: string[];
  /** Cast to this type. */
  type?: T;
}

export async function sanityFetch<T>({
  query,
  params,
  revalidate,
  tags,
}: SanityFetchOptions<T>): Promise<T> {
  return client.fetch<T>(query, params ?? {}, {
    next: {
      revalidate: revalidate ?? 60,
      tags,
    },
  });
}
