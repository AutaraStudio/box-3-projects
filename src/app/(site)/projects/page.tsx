/**
 * /projects
 * =========
 * Projects index. Server component — pulls every project from
 * Sanity, plus the projectsPage singleton (hero label / heading /
 * sketch + photo images), then renders the hero (sketch → photo
 * image wipe) + a three-up parallax grid.
 *
 * Hero images flow from Sanity when present; the static
 * /reveal.webp + /sketch.webp in /public are kept as the launch
 * fallback so the page never renders empty placeholders.
 */

import type { Metadata } from "next";

import ProjectsHero from "@/components/projects/ProjectsHero";
import ProjectsGrid from "@/components/projects/ProjectsGrid";
import { sanityFetch } from "@/sanity/lib/fetch";
import { urlFor } from "@/sanity/lib/image";
import {
  PROJECTS_LIST_QUERY,
  type ProjectListItem,
} from "@/sanity/queries/projects";
import {
  PROJECTS_PAGE_QUERY,
  type ProjectsPageData,
} from "@/sanity/queries/projectsPage";

export const revalidate = 60;

const FALLBACK_SEO_TITLE = "Projects — Box 3 Projects";
const FALLBACK_SEO_DESCRIPTION =
  "Selected projects from Box 3 — London-based design and build across workplace, hospitality, residential and retail.";

export async function generateMetadata(): Promise<Metadata> {
  const hero = await sanityFetch<ProjectsPageData | null>({
    query: PROJECTS_PAGE_QUERY,
    revalidate: 60,
  });
  return {
    title: hero?.seoTitle ?? FALLBACK_SEO_TITLE,
    description: hero?.seoDescription ?? FALLBACK_SEO_DESCRIPTION,
  };
}

const FALLBACK = {
  label: "Selected projects",
  heading: "Designed, built, delivered.",
  baseImage: {
    src: "/reveal.webp",
    alt: "Completed fit-out — finished space",
  },
  overlayImage: {
    src: "/sketch.webp",
    alt: "Initial sketch — line drawing",
  },
};

export default async function ProjectsPage() {
  const [projects, hero] = await Promise.all([
    sanityFetch<ProjectListItem[]>({
      query: PROJECTS_LIST_QUERY,
      revalidate: 60,
    }),
    sanityFetch<ProjectsPageData | null>({
      query: PROJECTS_PAGE_QUERY,
      revalidate: 60,
    }),
  ]);

  const baseImage = hero?.baseImage?.asset?.url
    ? {
        src: urlFor(hero.baseImage).width(2000).quality(85).url(),
        alt: hero.baseImage.alt ?? FALLBACK.baseImage.alt,
      }
    : FALLBACK.baseImage;

  const overlayImage = hero?.overlayImage?.asset?.url
    ? {
        src: urlFor(hero.overlayImage).width(2000).quality(85).url(),
        alt: hero.overlayImage.alt ?? FALLBACK.overlayImage.alt,
      }
    : FALLBACK.overlayImage;

  return (
    <main className="projects-page">
      <ProjectsHero
        count={projects.length}
        label={hero?.label?.trim() || FALLBACK.label}
        heading={hero?.heading?.trim() || FALLBACK.heading}
        baseImage={baseImage}
        overlayImage={overlayImage}
      />
      <ProjectsGrid projects={projects} />
    </main>
  );
}
