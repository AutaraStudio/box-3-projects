/**
 * sanityImageLoader
 * =================
 * Global `next/image` loader (wired via `images.loaderFile` in
 * next.config). It hands the browser Sanity CDN URLs directly so
 * Sanity does the ONLY resize + encode — the built-in Next optimiser
 * is bypassed entirely. Before this, a Sanity-optimised image
 * (auto=format, q80) was being fetched and *re-encoded* a second time
 * by Next at q75, compounding artifacts; and because Next can only
 * upscale from the width it fetched, any image displayed larger than
 * its baked `w=` (e.g. the ImageStripHero centre at full-viewport)
 * came out soft. With this loader the browser requests each srcSet
 * candidate width straight from Sanity, single-encoded and sharp.
 *
 * The loader overrides `w`, `q` and `auto` on whatever Sanity URL it
 * receives (preserving crop/`rect` params from `urlFor`). Anything
 * that isn't a cdn.sanity.io URL is passed through untouched so
 * non-Sanity sources still render.
 */

const SANITY_CDN_HOST = "cdn.sanity.io";

/* Single place the render quality is decided — mirrors the q80 the
   urlFor helper has always intended, now applied just once. */
const IMAGE_QUALITY = 80;

interface SanityLoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

export default function sanityImageLoader({
  src,
  width,
  quality,
}: SanityLoaderArgs): string {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    /* Relative / data URLs (no Sanity host) — leave as-is. */
    return src;
  }

  if (url.hostname !== SANITY_CDN_HOST) return src;

  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? IMAGE_QUALITY));
  url.searchParams.set("auto", "format");
  /* Never let Sanity upscale past the original — when the requested
     width exceeds the source, it returns the original instead. */
  url.searchParams.set("fit", "max");

  return url.toString();
}
