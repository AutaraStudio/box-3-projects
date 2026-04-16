/**
 * Shared server-side SVG loader.
 *
 * Inlining SVG is required for `currentColor` to inherit from the
 * parent's `color` — an <img> tag cannot inherit CSS colour from
 * its parent. This module fetches markup from a Sanity CDN URL and
 * sanitises hardcoded fills/strokes so CSS can drive the logo colour.
 *
 * Used by both the Partners marquee and the Testimonials section
 * (both need inline-SVG logos).
 */

/**
 * Fetches raw SVG markup from a URL server-side. Results are
 * revalidated hourly via Next.js fetch caching.
 */
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
 * Replaces hardcoded fill/stroke colour values with currentColor
 * so CSS can control logo colour via the parent's color property.
 * Preserves `fill="none"` and `stroke="none"` intentional values.
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
