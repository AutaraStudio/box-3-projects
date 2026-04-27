/**
 * SustainabilityCommitment
 * ========================
 * 3-column text-block band — the "what we do" pillars. Header
 * row on top (small caps label + display heading), pillars
 * underneath in a 3-col grid (1-col mobile).
 *
 *   ┌────────────────────────────────────────────────────┐
 *   │  OUR COMMITMENT                                    │
 *   │  Heading…                                          │
 *   │                                                    │
 *   │  ── 01 ──────  ── 02 ──────  ── 03 ──────          │
 *   │  Pillar one    Pillar two    Pillar three          │
 *   │  Body…         Body…         Body…                 │
 *   └────────────────────────────────────────────────────┘
 */

import Heading from "@/components/ui/Heading";
import RevealStack from "@/components/ui/RevealStack";
import type { SustainabilityPillarItem } from "@/sanity/queries/sustainabilityPage";

import "./SustainabilityCommitment.css";

interface SustainabilityCommitmentProps {
  label?: string;
  heading?: string;
  items: SustainabilityPillarItem[];
}

export default function SustainabilityCommitment({
  label = "Our commitment",
  heading,
  items,
}: SustainabilityCommitmentProps) {
  if (items.length === 0) return null;

  return (
    <section className="sustainability-commitment">
      <div className="container sustainability-commitment__inner">
        <header className="sustainability-commitment__head">
          <p className="sustainability-commitment__label text-small text-caps">
            {label}
          </p>
          {heading ? (
            <Heading
              as="h2"
              className="sustainability-commitment__heading text-h2"
            >
              {heading}
            </Heading>
          ) : null}
        </header>

        <RevealStack
          as="ul"
          childSelector=".sustainability-commitment__item"
          className="sustainability-commitment__list"
        >
          {items.map((item, index) => (
            <li key={item.title} className="sustainability-commitment__item">
              <p
                className="sustainability-commitment__index text-small text-caps"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </p>
              <Heading
                as="h3"
                className="sustainability-commitment__item-title text-h5"
              >
                {item.title}
              </Heading>
              <p className="sustainability-commitment__item-body text-large">
                {item.body}
              </p>
            </li>
          ))}
        </RevealStack>
      </div>
    </section>
  );
}
