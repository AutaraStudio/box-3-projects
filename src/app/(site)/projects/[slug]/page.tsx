/**
 * Project Detail Page
 * ===================
 * Dynamic route for individual project documents.
 *
 * Flow:
 *   1. generateStaticParams pre-builds a route per project slug.
 *   2. generateMetadata emits SEO title + description from Sanity.
 *   3. The page itself fires the project + related-peers queries
 *      in parallel and mounts the section components in order:
 *        Hero → Stats → Info → Gallery → Related.
 *      The site-wide footer (with partners marquee) appears
 *      automatically below via (site)/layout.tsx.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProjectHero from "@/components/project-detail/ProjectHero";
import ProjectGallery from "@/components/project-detail/ProjectGallery";
import RelatedProjects from "@/components/project-detail/RelatedProjects";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  PROJECT_BY_SLUG_QUERY,
  RELATED_PROJECTS_QUERY,
  type ProjectDetail,
  type RelatedProject,
} from "@/sanity/queries/projects";

import "./project-detail.css";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

/* ── Static params ─────────────────────────────────────────────── */

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const projects = await sanityFetch<Array<{ slug: string }>>({
    query: /* groq */ `*[_type == "project" && defined(slug.current)]{ "slug": slug.current }`,
  });
  return projects;
}

/* ── Metadata ──────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await sanityFetch<ProjectDetail | null>({
    query: PROJECT_BY_SLUG_QUERY,
    params: { slug },
  });

  if (!project) return { title: "Project not found" };

  const locationSuffix = project.location ? ` — ${project.location}` : "";
  const description =
    project.shortDescription ??
    `Project case study for ${project.title}${locationSuffix}.`;

  return {
    title: `${project.title}${locationSuffix}`,
    description,
  };
}

/* ── Page ──────────────────────────────────────────────────────── */

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  /* Fetch the project first because the related-projects query
     depends on its category id. If the slug doesn't resolve we 404
     before issuing the second query. */
  const project = await sanityFetch<ProjectDetail | null>({
    query: PROJECT_BY_SLUG_QUERY,
    params: { slug },
  });

  if (!project) notFound();

  const related = project.category?._id
    ? await sanityFetch<RelatedProject[]>({
        query: RELATED_PROJECTS_QUERY,
        params: { slug, categoryId: project.category._id },
      })
    : [];

  /* Gallery sees the full set: featured image first, then every
     additional. The Explore stage uses the featured as the scaling
     hero, the lightbox carousel runs through the full sequence. */
  const galleryImages = [
    ...(project.featuredImage ? [project.featuredImage] : []),
    ...(project.additionalImages ?? []),
  ];

  return (
    <main className="project-detail-page" data-project-slug={project.slug}>
      <ProjectHero project={project} />
      {/* Hero carries the stats ledger (left column) + the Brief /
          Team / Expertise blocks (right column). The Explore stage
          + lightbox below shows the full image set with a scroll-
          driven hero scale and a fullscreen Swiper modal. */}
      <ProjectGallery
        images={galleryImages}
        heroImage={project.featuredImage}
        projectTitle={project.title}
        galleryId={`gallery-${project.slug}`}
      />
      <RelatedProjects projects={related} />
    </main>
  );
}
