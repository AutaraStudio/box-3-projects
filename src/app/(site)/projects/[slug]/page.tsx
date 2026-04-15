/**
 * Project Detail Page
 * ===================
 * Dynamic route for individual project documents.
 *
 * Responsibilities:
 *   - Resolve slug → Project document (Sanity)
 *   - Pre-build every project at build time via generateStaticParams
 *   - Emit SEO metadata from the project's title and description
 *   - Mount the ProjectAnchors sticky nav plus placeholder section
 *     wrappers (#overview, #expertise, #gallery, #related) for the
 *     subsequent prompts to fill in.
 *
 * Image handling:
 *   - `heroImages`: featuredImage followed by any additionalImages —
 *     the upcoming hero gallery consumes this.
 *   - `allImages`: the same set, used by the media gallery section.
 *   Both are computed here so downstream components stay presentational.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProjectAnchors from "@/components/sections/project/ProjectAnchors";
import ProjectExpertise from "@/components/sections/project/ProjectExpertise";
import ProjectGallery from "@/components/sections/project/ProjectGallery";
import ProjectHero from "@/components/sections/project/ProjectHero";
import RelatedProjects from "@/components/sections/project/RelatedProjects";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  PROJECT_BY_SLUG_QUERY,
  type Project,
  type ProjectImage,
} from "@/sanity/queries/project";
import {
  RELATED_PROJECTS_QUERY,
  type RelatedProject,
} from "@/sanity/queries/projectDetail";

/* --------------------------------------------------------------------------
   Static params — pre-render every project at build time.
   -------------------------------------------------------------------------- */

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const projects = await sanityFetch<Pick<Project, "slug">[]>({
    query: /* groq */ `*[_type == "project" && defined(slug.current)]{ "slug": slug.current }`,
  });
  return projects.map((project) => ({ slug: project.slug }));
}

/* --------------------------------------------------------------------------
   Metadata
   -------------------------------------------------------------------------- */

interface ProjectPageProps {
  /** Next.js 15+ passes params as a Promise — must be awaited. */
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await sanityFetch<Project | null>({
    query: PROJECT_BY_SLUG_QUERY,
    params: { slug },
  });

  if (!project) {
    return { title: "Project not found" };
  }

  const locationSuffix = project.location ? ` — ${project.location}` : "";
  const description =
    project.shortDescription ??
    `Project case study for ${project.title}${locationSuffix}.`;

  return {
    title: `${project.title}${locationSuffix}`,
    description,
  };
}

/* --------------------------------------------------------------------------
   Section definitions for the sticky anchor bar.
   -------------------------------------------------------------------------- */

const ANCHOR_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "expertise", label: "Expertise" },
  { id: "gallery", label: "Gallery" },
  { id: "related", label: "Related" },
] as const;

/* --------------------------------------------------------------------------
   Page
   -------------------------------------------------------------------------- */

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await sanityFetch<Project | null>({
    query: PROJECT_BY_SLUG_QUERY,
    params: { slug },
  });

  if (!project) {
    notFound();
  }

  /* Image collections used by downstream sections. */
  const heroImages: ProjectImage[] = [
    ...(project.featuredImage ? [project.featuredImage] : []),
    ...(project.additionalImages ?? []),
  ];
  const allImages: ProjectImage[] = heroImages;

  /* Related projects — same category first, then newest. */
  const related: RelatedProject[] = project.category?._id
    ? await sanityFetch<RelatedProject[]>({
        query: RELATED_PROJECTS_QUERY,
        params: {
          slug,
          categoryId: project.category._id,
        },
      })
    : [];

  return (
    <>
      <ProjectAnchors
        sections={[...ANCHOR_SECTIONS]}
        projectTitle={project.title}
        projectLocation={project.location}
      />

      <main data-project-slug={project.slug}>
        {/* Overview — hero + intro copy. */}
        <section
          id="overview"
          data-scroll
          data-nav-theme="light"
          aria-label="Overview"
        >
          <ProjectHero
            title={project.title}
            category={project.category}
            heroImage={project.featuredImage}
            heroImages={heroImages}
            stats={project.stats ?? []}
            location={project.location}
            year={project.year}
            teamMembers={project.team ?? []}
          />
        </section>

        {/* Expertise — tags, stats, client objective / feedback. */}
        <section
          id="expertise"
          data-scroll
          data-nav-theme="light"
          aria-label="Expertise"
        >
          <ProjectExpertise expertise={project.expertise ?? []} />
        </section>

        {/* Gallery — full image set. */}
        <section
          id="gallery"
          data-scroll
          data-nav-theme="light"
          aria-label="Gallery"
          data-image-count={allImages.length}
        >
          <ProjectGallery images={allImages} />
        </section>

        {/* Related — other projects in the same category. */}
        <section
          id="related"
          data-scroll
          data-nav-theme="light"
          aria-label="Related projects"
        >
          <RelatedProjects projects={related} />
        </section>
      </main>
    </>
  );
}
