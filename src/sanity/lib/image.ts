/**
 * Sanity Image URL Builder
 * ========================
 * Generates optimised image URLs from Sanity asset references.
 * Supports all Sanity image transformations (width, height, crop, etc.).
 *
 * Usage:
 *   urlFor(image).width(800).height(600).url()
 */

import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { client } from "./client";

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
