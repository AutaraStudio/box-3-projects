"use client";

/**
 * ContentGuide
 * ============
 * Editorial /content-guide page — the .docx editing guide turned
 * into a navigable, video-rich web page. Each section is a short
 * explanation + a "Watch the walkthrough" button that opens the
 * video in a full-viewport modal.
 *
 * Client component because we hold the "which video is open" state
 * here. The page-level metadata noindex lives on the server
 * component that imports this (`page.tsx`).
 *
 * Adding a new video later? Append an entry to SECTIONS — the
 * component renders whatever's in the array, in order.
 */

import { useState } from "react";

import VideoOverlay from "./VideoOverlay";
import "./ContentGuide.css";

interface Section {
  /** Anchor slug used for in-page links. */
  id: string;
  /** Small caps label above the heading. */
  eyebrow: string;
  heading: string;
  /** One or more paragraphs of plain text — split on `\n\n` at render. */
  body: string;
  /** Optional URL to a walkthrough video. When set, a "Watch"
   *  button is rendered that opens the overlay. */
  videoUrl?: string;
  /** Title shown in the overlay header. */
  videoTitle?: string;
}

const STUDIO_URL = "https://box-3-staging.netlify.app/studio";

const SECTIONS: Section[] = [
  {
    id: "studio-tour",
    eyebrow: "01 — General overview",
    heading: "A tour of the Sanity Studio.",
    body:
      "The Sanity Studio is where every word, image, link and project on the live site is edited. The sidebar groups everything into four areas: Site Settings, Pages, Collections, and the in-built Media tool.\n\nThe walkthrough covers the basics — signing in, finding what you want, the publish flow, undoing a mistake. If you only watch one video, watch this one.",
    videoUrl: "https://box-3.b-cdn.net/general-overview.mp4",
    videoTitle: "General overview — orientation + the publish flow",
  },
  {
    id: "site-settings",
    eyebrow: "02 — Site Settings",
    heading: "Editing site-wide settings.",
    body:
      "Header nav, footer columns, contact info, default SEO, the partner-marquee heading, and every UI label across the site. Also the site-wide Coming Soon kill switch — turn it on to replace every page with a holding message, off to bring the full site back.\n\nYou won't touch most of this often, but it's all editable in one place.",
    videoUrl: "https://box-3.b-cdn.net/site-settings.mp4",
    videoTitle: "Site Settings — every editable surface",
  },
  {
    id: "media",
    eyebrow: "03 — Bulk media",
    heading: "Uploading and organising images.",
    body:
      "Doing this in the right order saves a huge amount of time. Open the Bulk Upload tool in the top nav, create or pick a tag (the project name for project images, e.g. carlton-gardens), drop all the images in. Then anywhere on the site that uses an image, click \"Pick from library\" and the list is already filtered to just those photos.\n\nUploading inside an individual document still works, but it attaches the image to that document only — pick-from-library means an image you upload once can be reused everywhere.",
    videoUrl: "https://box-3.b-cdn.net/media-management-upload.mp4",
    videoTitle: "Bulk media — upload, tag, pick from library",
  },
  {
    id: "pages",
    eyebrow: "04 — Pages",
    heading: "Editing a page and publishing it.",
    body:
      "Every change is saved to a draft automatically — the live site doesn't update until you click the green Publish button. So you can edit freely and only publish when you're happy.\n\nThe video walks through editing a heading, swapping an image, and publishing the change, then shows the new content appearing on the live site within seconds.",
    videoUrl: "https://box-3.b-cdn.net/page-editing.mp4",
    videoTitle: "Pages — your first edit, end to end",
  },
  {
    id: "projects",
    eyebrow: "05 — Projects",
    heading: "Adding, editing, and ordering projects.",
    body:
      "The Projects list in the sidebar is drag-and-drop — the order set there is the order projects appear on the /projects archive, the Featured Projects strip on the home page (top 6), and the Featured Projects column in the footer (top 5). One control, three places updated.\n\nEach project has tabs for Overview, Images, Stats, Client, and Testimonials so you don't have to scroll past unrelated fields.",
    videoUrl: "https://box-3.b-cdn.net/projects.mp4",
    videoTitle: "Projects — adding, editing, and ordering",
  },
  {
    id: "partners",
    eyebrow: "06 — Partners",
    heading: "Adding partner logos.",
    body:
      "Partners are the brand logos in the marquee at the foot of every page. Upload a logo, name the partner, and it appears in the marquee in the order set by the drag-and-drop list (same flow as Projects).\n\nThe marquee heading above the logos (e.g. \"Trusted By\") lives in Site Settings → Partners marquee.",
    videoUrl: "https://box-3.b-cdn.net/partners.mp4",
    videoTitle: "Partners — adding logos + ordering the marquee",
  },
  {
    id: "testimonials",
    eyebrow: "07 — Testimonials",
    heading: "Adding and reusing testimonials.",
    body:
      "Testimonial documents are reusable — one quote can appear in the home page testimonials slider, on a project's detail page, and anywhere else a testimonial section is embedded. Link a testimonial to a Partner document and the partner's logo appears beside the quote automatically.",
    videoUrl: "https://box-3.b-cdn.net/testimonials.mp4",
    videoTitle: "Testimonials — write once, reuse across the site",
  },
  {
    id: "vacancies",
    eyebrow: "08 — Vacancies + Careers",
    heading: "Adding an open role.",
    body:
      "Open roles live in the Vacancies collection and appear on /careers under \"Open positions\". Each vacancy has a title, discipline (used as a filter chip), location, employment type, optional salary band, a short summary, and an Apply URL (an external ATS link, mailto:, etc.).\n\nToggle the Open switch off to hide a role without deleting it. The Careers page itself — hero, culture block, Why work with us, the speculative-application block — is edited via Pages → Careers Page.",
    videoUrl: "https://box-3.b-cdn.net/vacancies-careers.mp4",
    videoTitle: "Vacancies + Careers page",
  },
  {
    id: "team",
    eyebrow: "09 — Team Members",
    heading: "Adding and managing team members.",
    body:
      "Each team member has a name, role, optional qualifications, a portrait, optional LinkedIn URL, and a Category that decides which group they show under on the About page. The Display Order field controls the order within their group.\n\nOnce a person's in the collection, link them to any project from the project's Team field — same person, no re-uploading the photo.",
    videoUrl: "https://box-3.b-cdn.net/Team%20Members.mp4",
    videoTitle: "Team Members — the About page grid + project teams",
  },
];

const TIPS: Array<{ title: string; body: string }> = [
  {
    title: "Yellow \"Unknown field\" warning",
    body: "Usually means a field was renamed or removed in a site update and the old value is still on the doc. Safe to ignore, or click the field's three-dot menu → Remove field.",
  },
  {
    title: "Publish button is greyed out",
    body: "There's a required field somewhere that's empty. Look for the red strip at the top of the document — it lists which fields are missing. Fill them in and Publish lights up again.",
  },
  {
    title: "Slugs",
    body: "The URL-friendly part — what appears in the address bar after the page name. Lowercase, hyphens for spaces, no special characters. Most slug fields have a Generate button that derives the slug from the title automatically.",
  },
  {
    title: "Drafts left around",
    body: "If you start an edit and don't publish, the change stays as a draft. You'll see a yellow Draft badge next time you open the doc. Either publish it or click the three dots → Discard changes.",
  },
  {
    title: "Re-ordering lists",
    body: "Most lists in the studio (services, partners, projects, etc.) are drag-and-drop. Grab the handle on the left of a row and drag it up or down. Order saves immediately.",
  },
  {
    title: "Image cropping (hotspots)",
    body: "When the same image is shown at different aspect ratios across the site, Sanity's hotspot tool decides which part of the image stays in frame. Click the image → Edit → drag the round target to the most important part of the photo.",
  },
  {
    title: "Restoring an older version",
    body: "Every published version is stored. Open the document, click the clock icon top-right, find a previous version, click Restore. You can always get back to where you were.",
  },
];

export default function ContentGuide() {
  const [openVideo, setOpenVideo] = useState<{
    url: string;
    title: string;
  } | null>(null);

  return (
    <main className="content-guide">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="content-guide__header">
        <div className="container content-guide__header-inner">
          <p className="content-guide__eyebrow text-small text-caps">
            For the Box 3 editorial team
          </p>
          <h1 className="content-guide__title text-display">
            How to edit the site.
          </h1>
          <p className="content-guide__intro text-large">
            A short walkthrough of every part of the Sanity Studio.
            Each section has a video — click <strong>Watch</strong> to
            open a focused player.
          </p>
          <div className="content-guide__cta-row">
            <a
              href={STUDIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="content-guide__cta"
            >
              Open the studio →
            </a>
          </div>
        </div>
      </header>

      {/* ── Sections ──────────────────────────────────────── */}
      <div className="container content-guide__sections">
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="content-guide__section"
          >
            <p className="content-guide__section-eyebrow text-small text-caps">
              {section.eyebrow}
            </p>
            <h2 className="content-guide__section-heading text-h2">
              {section.heading}
            </h2>
            <div className="content-guide__section-body">
              {section.body.split("\n\n").map((paragraph, i) => (
                <p key={i} className="content-guide__section-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
            {section.videoUrl && section.videoTitle ? (
              <button
                type="button"
                className="content-guide__watch"
                onClick={() =>
                  setOpenVideo({
                    url: section.videoUrl!,
                    title: section.videoTitle!,
                  })
                }
              >
                <span className="content-guide__watch-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="content-guide__watch-label">
                  Watch the walkthrough
                </span>
              </button>
            ) : null}
          </section>
        ))}
      </div>

      {/* ── Tips & gotchas ────────────────────────────────── */}
      <section className="content-guide__tips" id="tips">
        <div className="container">
          <p className="content-guide__section-eyebrow text-small text-caps">
            10 — Tips &amp; gotchas
          </p>
          <h2 className="content-guide__section-heading text-h2">
            The small stuff that surprises people.
          </h2>
          <div className="content-guide__tips-grid">
            {TIPS.map((tip) => (
              <div key={tip.title} className="content-guide__tip">
                <h3 className="content-guide__tip-title text-h5">
                  {tip.title}
                </h3>
                <p className="content-guide__tip-body">{tip.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Help ──────────────────────────────────────────── */}
      <section className="content-guide__help">
        <div className="container content-guide__help-inner">
          <h2 className="content-guide__help-heading text-h3">
            Stuck? Get in touch.
          </h2>
          <p className="content-guide__help-body">
            If you can&rsquo;t find a field, can&rsquo;t publish, or
            something on the live site looks wrong even after publishing,
            send a note to Autara Studio and we&rsquo;ll take a look.
          </p>
        </div>
      </section>

      {/* ── Video overlay ─────────────────────────────────── */}
      {openVideo ? (
        <VideoOverlay
          src={openVideo.url}
          title={openVideo.title}
          onClose={() => setOpenVideo(null)}
        />
      ) : null}
    </main>
  );
}
