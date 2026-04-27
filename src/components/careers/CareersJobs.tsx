/**
 * CareersJobs
 * ===========
 * Open positions list. Each row is a one-line listing with an
 * "Apply now" button that opens a single shared <ApplyModal>
 * pre-filled with the role title.
 *
 * Anchor id="jobs" — matches the hero's CTA "See opportunities"
 * link target.
 *
 * Animations: each row reveals via RevealStack as the section
 * enters the viewport.
 */

"use client";

import { useState } from "react";

import Heading from "@/components/ui/Heading";
import RevealStack from "@/components/ui/RevealStack";
import Button from "@/components/ui/Button";
import type { VacancyItem } from "@/sanity/queries/vacancies";

import ApplyModal from "./ApplyModal";

import "./CareersJobs.css";

interface CareersJobsProps {
  heading?: string;
  vacancies: VacancyItem[];
}

export default function CareersJobs({
  heading = "Open positions",
  vacancies,
}: CareersJobsProps) {
  /* Single shared modal for the whole list — `applyingTo` holds
     the role being applied for (or null when the modal is
     closed). Cleaner than mounting one <ApplyModal> per row. */
  const [applyingTo, setApplyingTo] = useState<VacancyItem | null>(null);

  return (
    <>
      <section id="jobs" className="careers-jobs">
        <div className="container careers-jobs__inner">
          <header className="careers-jobs__head">
            <Heading
              as="h2"
              className="careers-jobs__heading text-h3"
            >
              {heading}
            </Heading>
            <p className="careers-jobs__count text-small text-caps">
              ({String(vacancies.length).padStart(2, "0")})
            </p>
          </header>

          {vacancies.length === 0 ? (
            <p className="careers-jobs__empty text-large">
              No open roles right now — check back soon, or drop us
              a note via the contact page if you'd like to introduce
              yourself anyway.
            </p>
          ) : (
            <RevealStack
              as="ul"
              childSelector=".careers-jobs__row"
              className="careers-jobs__list"
            >
              {vacancies.map((v) => (
                <VacancyRow
                  key={v._id}
                  vacancy={v}
                  onApply={() => setApplyingTo(v)}
                />
              ))}
            </RevealStack>
          )}
        </div>
      </section>

      <ApplyModal
        open={applyingTo !== null}
        onClose={() => setApplyingTo(null)}
        roleTitle={applyingTo?.title ?? ""}
      />
    </>
  );
}

/* --------------------------------------------------------------------------
   VacancyRow — one open role.
   -------------------------------------------------------------------------- */

function VacancyRow({
  vacancy,
  onApply,
}: {
  vacancy: VacancyItem;
  onApply: () => void;
}) {
  const meta = [
    vacancy.discipline,
    vacancy.location,
    vacancy.employmentType,
    formatSalary(vacancy.salaryMin, vacancy.salaryMax),
  ].filter(Boolean);

  return (
    <li className="careers-jobs__row">
      <div className="careers-jobs__row-main">
        <h3 className="careers-jobs__title text-h4">{vacancy.title}</h3>
        {vacancy.summary ? (
          <p className="careers-jobs__summary text-large">
            {vacancy.summary}
          </p>
        ) : null}
        <p className="careers-jobs__meta text-small text-caps">
          {meta.join(" · ")}
        </p>
      </div>

      <div className="careers-jobs__row-cta">
        <Button onClick={onApply} size="sm">
          Apply now →
        </Button>
      </div>
    </li>
  );
}

/* --------------------------------------------------------------------------
   formatSalary — "£55,000–£70,000" / "£60,000+" / null.
   -------------------------------------------------------------------------- */

function formatSalary(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `£${Math.round(n / 1000)}k` : `£${n.toLocaleString("en-GB")}`;
  if (min && max && min !== max) return `${fmt(min)}–${fmt(max)}`;
  if (min && !max) return `${fmt(min)}+`;
  if (!min && max) return `up to ${fmt(max)}`;
  return fmt(min!);
}
