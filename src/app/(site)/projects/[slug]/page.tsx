/**
 * Project Detail Page
 * ===================
 * Dynamic route for individual project documents.
 *
 * Flow:
 *   1. generateStaticParams pre-builds a route per project slug.
 *   2. generateMetadata emits SEO title + description from Sanity.
 *   3. Main render fetches the project and its related peers,
 *      computes image collections, and mounts the five section
 *      components in order.
 *
 * Image collections:
 *   - `allImages`: featuredImage followed by additionalImages — the
 *     master pool that downstream sections slice from.
 *   - `heroImages`: first 5 — consumed by ProjectHero's right-col
 *     gallery.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PartnersSection from "@/components/sections/PartnersSection";
import ProjectExpertise from "@/components/sections/project/ProjectExpertise";
import ProjectGallery from "@/components/sections/project/ProjectGallery";
import ProjectHero from "@/components/sections/project/ProjectHero";
import RelatedProjects from "@/components/sections/project/RelatedProjects";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import { loadPartners } from "@/lib/fetchPartners";
import { resolveTestimonialsSection } from "@/lib/fetchTestimonials";
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
   Static params
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

  const allImages: ProjectImage[] = [
    ...(project.featuredImage ? [project.featuredImage] : []),
    ...(project.additionalImages ?? []),
  ];
  const heroImages: ProjectImage[] = allImages.slice(0, 5);

  const [related, partners, testimonials] = await Promise.all([
    project.category?._id
      ? sanityFetch<RelatedProject[]>({
          query: RELATED_PROJECTS_QUERY,
          params: {
            slug,
            categoryId: project.category._id,
          },
        })
      : Promise.resolve<RelatedProject[]>([]),
    loadPartners(),
    resolveTestimonialsSection(project.testimonialsSection),
  ]);

  return (
    <>
      <main data-project-slug={project.slug}>
        {/* Overview */}
        <section
          id="overview"
          data-scroll
          data-theme="dark"
          data-nav-theme="dark"
          aria-label="Overview"
        >
          <ProjectHero
            title={project.title}
            category={project.category}
            heroImages={heroImages}
            stats={project.stats ?? []}
            location={project.location}
            year={project.year}
            teamMembers={project.team ?? []}
            clientObjective={project.clientObjective}
            clientFeedback={project.clientFeedback}
          />
        </section>

        {/* Expertise */}
        <section
          id="expertise"
          data-scroll
          data-theme="cream"
          data-nav-theme="cream"
          aria-label="Expertise"
        >
          <ProjectExpertise expertise={project.expertise ?? []} />
        </section>

        {/* Testimonials — optional, only renders if the project has them.
            The component carries its own data-theme + data-nav-theme
            (brand) so it drives the nav observer directly. */}
        {testimonials ? (
          <TestimonialsSection
            sectionLabel={testimonials.sectionLabel}
            reference={testimonials.reference}
            testimonials={testimonials.testimonials}
          />
        ) : null}

        {/* Gallery */}
        <section
          id="gallery"
          data-scroll
          data-theme="light"
          data-nav-theme="light"
          aria-label="Gallery"
          data-image-count={allImages.length}
        >
          <ProjectGallery
            images={allImages}
            galleryId={`gallery-${project.slug}`}
          />
        </section>

        {/* Related */}
        <section
          id="related"
          data-scroll
          data-theme="light"
          data-nav-theme="light"
          aria-label="Related projects"
        >
          <RelatedProjects projects={related} />
        </section>

        {/* Partners marquee — PartnersSection renders its own <section>
             with data-theme="dark" and padding tokens. */}
        <PartnersSection
          heading={partners.heading}
          sectionLabel={partners.sectionLabel}
          partners={partners.partners}
        />
      </main>
    </>
  );
}
