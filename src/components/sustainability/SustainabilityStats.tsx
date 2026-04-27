/**
 * SustainabilityStats
 * ===================
 * Editorial impact band — staircase of square benefit cards on
 * desktop, alternating left/right rows on mobile. Adapted from
 * the AnucHome `blockBenefits` pattern.
 *
 *   Desktop (4 cols × 4 rows):
 *
 *   ┌──┬──┬──┬──┐
 *   │ 1│  │  │  │  ← card 1 sticks first
 *   ├──┼──┼──┼──┤
 *   │  │ 2│  │  │  ← card 2 sticks once it reaches top
 *   ├──┼──┼──┼──┤
 *   │  │  │ 3│  │
 *   ├──┼──┼──┼──┤
 *   │  │  │  │ 4│  ← card 4 (last to stick)
 *   └──┴──┴──┴──┘
 *
 * Each card is `position: sticky; top: var(--space-3)`. As the
 * user scrolls, each card pins to viewport top in sequence; the
 * three hairlines between columns animate `scaleY(0) → 1` from the
 * top, scrubbed to scroll progress.
 *
 * Mobile collapses to a single stack with cards alternating
 * between col-1 and col-2 of a 2-col grid (left, right, left,
 * right) — preserves the editorial off-axis rhythm without the
 * sticky narrative (which doesn't read on a single scrolling
 * column).
 *
 * Limited to 4 items for visual integrity — extra items are
 * sliced. Renders nothing if no items are passed.
 */

import { type CSSProperties } from "react";

import Heading from "@/components/ui/Heading";
import type { SustainabilityStatItem } from "@/sanity/queries/sustainabilityPage";

import "./SustainabilityStats.css";

const MAX_CARDS = 4;

interface SustainabilityStatsProps {
  label?: string;
  heading?: string;
  items: SustainabilityStatItem[];
  /** Theme override — the section reads as a tonal break from the
   *  rest of the page, so it defaults to the dark theme. */
  theme?: "dark" | "cream" | "pink";
}

export default function SustainabilityStats({
  label = "Impact",
  heading,
  items,
  theme = "dark",
}: SustainabilityStatsProps) {
  const cards = items.slice(0, MAX_CARDS);
  const cols = cards.length;

  if (cards.length === 0) return null;

  return (
    <section className="sustainability-stats" data-theme={theme}>
      <div className="container sustainability-stats__inner">
        {(label || heading) && (
          <header className="sustainability-stats__head">
            {label && (
              <p className="sustainability-stats__head-label text-small text-caps">
                {label}
              </p>
            )}
            {heading && (
              <Heading
                as="h2"
                className="sustainability-stats__heading text-h2"
              >
                {heading}
              </Heading>
            )}
          </header>
        )}

        <div
          className="sustainability-stats__staircase"
          style={{ "--cols": cols } as CSSProperties}
        >
          {/* Animated vertical dividers — N-1 lines between N
              columns. Position via inline `left: %` so the count
              can flex with content. */}
          <div className="sustainability-stats__dividers" aria-hidden="true">
            {Array.from({ length: cols - 1 }).map((_, i) => (
              <span
                key={i}
                className="sustainability-stats__divider"
                style={{ left: `${((i + 1) / cols) * 100}%` }}
              />
            ))}
          </div>

          {/* Desktop staircase — N columns × N rows, card on the
              diagonal. Empty cells flank each card to push it to
              the right row position. */}
          <div className="sustainability-stats__grid sustainability-stats__grid--desktop">
            {cards.map((item, i) => (
              <div key={i} className="sustainability-stats__col">
                {Array.from({ length: cols }).map((_, j) =>
                  j === i ? (
                    <StatCard key={j} item={item} />
                  ) : (
                    <div
                      key={j}
                      className="sustainability-stats__cell"
                      aria-hidden="true"
                    />
                  ),
                )}
              </div>
            ))}
          </div>

          {/* Mobile — stacked rows alternating left/right inside
              a 2-col grid. */}
          <div className="sustainability-stats__grid sustainability-stats__grid--mobile">
            {cards.map((item, i) => (
              <div
                key={i}
                className="sustainability-stats__mobile-row"
                data-position={i % 2 === 0 ? "left" : "right"}
              >
                <StatCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   StatCard — the individual sticky benefit tile. Top: descriptive
   label. Bottom: oversized value + small caps footnote. Same shape
   on both desktop (sticky) and mobile (in-flow).
   -------------------------------------------------------------------------- */

function StatCard({ item }: { item: SustainabilityStatItem }) {
  return (
    <article className="sustainability-stats__card">
      <p className="sustainability-stats__card-value text-display">
        {item.value}
      </p>
      {item.label && (
        <p className="sustainability-stats__card-label text-large">
          {item.label}
        </p>
      )}
      {item.footnote && (
        <p className="sustainability-stats__card-footnote text-small text-caps">
          {item.footnote}
        </p>
      )}
    </article>
  );
}
