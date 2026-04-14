/**
 * PartnersSection
 * ===============
 * Grid of partner / brand logos. Fully prop-based — all content
 * from Sanity. Handles any number of partners (1 to unlimited)
 * without layout regressions.
 *
 * Server component — SVG content is fetched server-side so that
 * currentColor can be controlled via CSS. An <img> tag cannot
 * inherit CSS color, so the SVG must be inlined in the DOM.
 *
 * No GSAP / interaction logic in this file — structure + CSS only.
 * Animations are added in a follow-up task.
 */

import type { PartnerItem } from "@/sanity/queries/partnersSection";
import "./PartnersSection.css";

/* --------------------------------------------------------------------------
   SVG fetch helper
   -------------------------------------------------------------------------- */

/**
 * Fetches raw SVG markup from a Sanity CDN URL server-side,
 * then sanitises it so all fill and stroke values use currentColor.
 *
 * This is required because uploaded SVG files contain hardcoded
 * brand colours. Replacing them with currentColor allows CSS to
 * control the logo colour via the parent element's color property.
 *
 * Inlining SVG in the DOM is required for currentColor to work —
 * an <img> tag cannot inherit CSS color from the parent element.
 *
 * Results are revalidated hourly via Next.js fetch caching.
 * Returns an empty string on failure so the card renders
 * gracefully with no logo.
 */
async function fetchSvgContent(url: string): Promise<string> {
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
 * Sanitises SVG markup so all colour values use currentColor.
 *
 * Replaces:
 *   - fill="[any value]"         → fill="currentColor"
 *   - stroke="[any value]"       → stroke="currentColor"
 *   - fill:[value] in style=""   → fill:currentColor
 *   - stroke:[value] in style="" → stroke:currentColor
 *
 * Preserves:
 *   - fill="none"   — intentional transparent fills (keep as-is)
 *   - stroke="none" — intentional no-stroke (keep as-is)
 *   - fill="currentColor" — already correct (no change needed)
 */
function sanitiseSvg(svg: string): string {
  return svg
    /* Replace fill attributes — preserve fill="none" */
    .replace(/fill="(?!none|currentColor)[^"]*"/gi, 'fill="currentColor"')
    /* Replace stroke attributes — preserve stroke="none" */
    .replace(/stroke="(?!none|currentColor)[^"]*"/gi, 'stroke="currentColor"')
    /* Replace fill: in inline style attributes */
    .replace(/fill\s*:\s*(?!none|currentColor)[^;"]*/gi, "fill:currentColor")
    /* Replace stroke: in inline style attributes */
    .replace(
      /stroke\s*:\s*(?!none|currentColor)[^;"]*/gi,
      "stroke:currentColor",
    )
    /* Remove any stop-color values in gradients (replace with currentColor) */
    .replace(/stop-color\s*:\s*[^;"]*/gi, "stop-color:currentColor")
    .replace(
      /stop-color="(?!currentColor)[^"]*"/gi,
      'stop-color="currentColor"',
    );
}

/* --------------------------------------------------------------------------
   Checkerboard layout
   -------------------------------------------------------------------------- */

type PartnerWithSvg = {
  _key: string;
  name: string;
  svgContent: string;
};

/**
 * Builds a display grid array from a flat list of partners by
 * inserting null slots at alternating positions per row.
 *
 * Creates a checkerboard rhythm:
 *   Even rows: [logo, null, logo, logo, null, logo] — nulls at 1, 4
 *   Odd  rows: [null, logo, logo, null, logo, logo] — nulls at 0, 3
 *
 * Works for any number of partners. Remaining cells in the last
 * row are filled with nulls to complete the row.
 */
function buildCheckerboard(
  partners: PartnerWithSvg[],
  cols: number = 6,
): Array<PartnerWithSvg | null> {
  const result: Array<PartnerWithSvg | null> = [];
  let partnerIndex = 0;
  let row = 0;

  while (partnerIndex < partners.length) {
    /* Null positions alternate per row */
    const nullPositions = row % 2 === 0 ? [1, 4] : [0, 3];

    for (let col = 0; col < cols; col++) {
      if (nullPositions.includes(col)) {
        result.push(null);
      } else if (partnerIndex < partners.length) {
        result.push(partners[partnerIndex]);
        partnerIndex++;
      } else {
        /* Fill remainder of last row with nulls */
        result.push(null);
      }
    }
    row++;
  }

  return result;
}

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

interface PartnersProps {
  sectionLabel: string;
  partners: PartnerItem[];
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export default async function PartnersSection({
  sectionLabel,
  partners,
}: PartnersProps) {
  const partnersWithSvg = await Promise.all(
    partners.map(async (partner) => ({
      _key: partner._key,
      name: partner.name,
      svgContent: await fetchSvgContent(partner.logo?.asset?.url ?? ""),
    })),
  );

  const displayGrid = buildCheckerboard(partnersWithSvg);

  return (
    <section
      data-theme="brand"
      data-nav-theme="brand"
      className="py-section-lg bg-[var(--theme-bg)]"
    >
      <div className="container">
        {/* Section label */}
        <p className="font-primary text-text-xs uppercase tracking-caps font-medium mb-space-7 text-[var(--theme-text)]">
          {sectionLabel}
        </p>

        {/* Partners grid — checkerboard layout, any number of logos */}
        <div className="partners-grid">
          {displayGrid.map((item, index) =>
            item === null ? (
              /* Empty slot — cream background creates checkerboard rhythm */
              <div
                key={`slot-${index}`}
                className="brand-card-slot"
                aria-hidden="true"
              />
            ) : (
              /* Logo card */
              <div key={item._key} className="brand-card-wrap">
                <div
                  className="brand-card"
                  role="img"
                  aria-label={item.name}
                >
                  {item.svgContent ? (
                    /*
                     * dangerouslySetInnerHTML is intentional here.
                     * SVG must be inlined in the DOM for currentColor
                     * to inherit the parent CSS color value.
                     * An <img> tag cannot achieve this.
                     * SVG content comes from our own Sanity CDN only.
                     */
                    <div
                      className="brand-card-svg-wrap"
                      aria-hidden="true"
                      dangerouslySetInnerHTML={{ __html: item.svgContent }}
                    />
                  ) : (
                    <div className="brand-card-svg-wrap" aria-hidden="true" />
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
