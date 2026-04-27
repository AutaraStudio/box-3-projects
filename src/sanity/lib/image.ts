/**
 * urlFor
 * ======
 * Image URL builder for Sanity image references. Pre-applies
 * `auto("format")` (best format per browser — avif / webp) and a
 * sensible default quality. Callers can chain `.width()`,
 * `.height()`, `.quality()` etc. to override.
 */

import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

import { client } from "./client";

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto("format").quality(80);
}
