/**
 * Server-side SVG loader
 * ======================
 * Inlining SVG markup is the only way to make `currentColor` inherit
 * from the parent's CSS `color` — an `<img>` tag can't pick up
 * surrounding theme colours. So we fetch the SVG text from the
 * Sanity CDN on the server, sanitise hardcoded fills/strokes back
 * to `currentColor`, and pass the resulting string down to the
 * client component which renders it via `dangerouslySetInnerHTML`.
 *
 * Used by the Partners marquee. Will also feed the testimonial
 * partner-logo render once that surface ships.
 *
 * Caching: results are revalidated hourly via Next's fetch cache.
 * If a partner uploads a new logo, the client sees it within an
 * hour without a deploy.
 */

/** Fetches raw SVG markup from a URL server-side. */
export async function fetchSvgContent(url: string): Promise<string> {
  if (!url) return "";
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return "";
    const text = await res.text();
    if (!text.includes("<svg")) return "";
    return sanitiseSvg(text);
  } catch {
    return "";
  }
}

/**
 * Replaces hardcoded fill / stroke colour values with `currentColor`
 * so CSS can drive logo colour through the parent's `color`
 * property. Preserves `fill="none"` / `stroke="none"` (those are
 * intentional shape choices, not colour values).
 */
export function sanitiseSvg(svg: string): string {
  return svg
    .replace(/fill="(?!none|currentColor)[^"]*"/gi, 'fill="currentColor"')
    .replace(/stroke="(?!none|currentColor)[^"]*"/gi, 'stroke="currentColor"')
    .replace(/fill\s*:\s*(?!none|currentColor)[^;"]*/gi, "fill:currentColor")
    .replace(
      /stroke\s*:\s*(?!none|currentColor)[^;"]*/gi,
      "stroke:currentColor",
    )
    .replace(/stop-color\s*:\s*[^;"]*/gi, "stop-color:currentColor")
    .replace(
      /stop-color="(?!currentColor)[^"]*"/gi,
      'stop-color="currentColor"',
    );
}
