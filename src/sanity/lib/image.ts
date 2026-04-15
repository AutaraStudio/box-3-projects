/**
 * Sanity Image URL Builder
 * ========================
 * Generates optimised image URLs from Sanity asset references.
 *
 * Defaults applied to every call:
 *   - auto("format") — serves AVIF/WebP where supported, falls back to JPEG
 *   - quality(80)    — high-quality compression; visually indistinguishable
 *                      from the original at ~1/4 the file size
 *
 * Callers can override either default by chaining .quality(N) or
 * .auto("none") on the returned builder.
 *
 * Usage:
 *   urlFor(image).width(1600).url()              // 1600px wide, auto format, q=80
 *   urlFor(image).width(800).quality(95).url()   // override quality
 */

import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

import { client } from "./client";

const builder = createImageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto("format").quality(80);
}
