/**
 * ProjectInfo
 * ===========
 * Two paragraph blocks side-by-side on desktop:
 *
 *   Client objective  |  Client feedback
 *
 * Either side renders only if the project supplies the matching
 * text. If both are empty the section returns null.
 *
 * The shortDescription paragraph from the project document sits in
 * its own row above the two columns — it's the editorial intro that
 * reads under the stats grid before the brief / feedback split.
 */

import "./ProjectInfo.css";

interface ProjectInfoProps {
  shortDescription?: string;
  clientObjective?: string;
  clientFeedback?: string;
}

export default function ProjectInfo({
  shortDescription,
  clientObjective,
  clientFeedback,
}: ProjectInfoProps) {
  const hasIntro = Boolean(shortDescription);
  const hasObjective = Boolean(clientObjective);
  const hasFeedback = Boolean(clientFeedback);
  if (!hasIntro && !hasObjective && !hasFeedback) return null;

  return (
    <section className="project-info">
      <div className="container project-info__inner">
        {hasIntro ? (
          <p className="project-info__intro text-large">{shortDescription}</p>
        ) : null}

        {hasObjective || hasFeedback ? (
          <div className="project-info__split">
            {hasObjective ? (
              <article className="project-info__block">
                <p className="project-info__label text-small text-caps">
                  Client objective
                </p>
                <p className="project-info__body text-large">
                  {clientObjective}
                </p>
              </article>
            ) : null}
            {hasFeedback ? (
              <article className="project-info__block">
                <p className="project-info__label text-small text-caps">
                  Client feedback
                </p>
                <blockquote className="project-info__quote text-large">
                  {clientFeedback}
                </blockquote>
              </article>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
