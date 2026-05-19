/**
 * LineScroll
 * ==========
 * Editorial section. Pairs a short anchor word ("we") with a
 * vertical list of statements. The anchor sits aligned to the
 * first line; the list reads down beside it.
 */

"use client";

import { useRef } from "react";

import "./LineScroll.css";

interface LineScrollProps {
  /** Short anchor word — defaults to "we". */
  label?: string;
  /** Lines that read down the right column. */
  lines: string[];
  /** Optional small heading on the left of the bottom row. */
  bottomHeading?: string;
  /** Optional paragraph on the right of the bottom row. */
  bottomBody?: string;
  /** Theme applied to the section wrapper. Defaults to "dark". */
  theme?: "dark" | "cream" | "pink";
}

export default function LineScroll({
  label = "we",
  lines,
  bottomHeading,
  bottomBody,
  theme = "dark",
}: LineScrollProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      className="line-scroll"
      data-theme={theme}
    >
      <div className="container">
        <div ref={topRef} className="line-scroll__top">
          <div className="line-scroll__anchor">
            <h2 className="line-scroll__anchor-text text-h2">{label}</h2>
          </div>

          <div className="line-scroll__lines-cell">
            <ul className="line-scroll__lines">
              {lines.map((line, i) => (
                <li
                  key={`${i}-${line}`}
                  className="line-scroll__line text-h2"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {bottomHeading || bottomBody ? (
          <div className="line-scroll__bottom">
            {bottomHeading ? (
              <div className="line-scroll__bottom-heading-cell">
                <h3 className="line-scroll__bottom-heading text-small text-caps">
                  {bottomHeading}
                </h3>
              </div>
            ) : null}
            {bottomBody ? (
              <div className="line-scroll__bottom-body-cell">
                <p className="line-scroll__bottom-body text-large">
                  {bottomBody}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
