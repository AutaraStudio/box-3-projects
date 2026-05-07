import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LegalPage from "@/components/sections/LegalPage";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  LEGAL_PAGE_QUERY,
  LEGAL_PAGE_SLUGS_QUERY,
  type LegalPageData,
} from "@/sanity/queries/legalPage";

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await sanityFetch<string[]>({ query: LEGAL_PAGE_SLUGS_QUERY });
  return (slugs ?? []).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await sanityFetch<LegalPageData | null>({
    query: LEGAL_PAGE_QUERY,
    params: { slug },
  });
  if (!data) return { title: "Legal — Box 3 Projects" };
  return {
    title: data.metaTitle ?? `${data.title} — Box 3 Projects`,
    description: data.metaDescription ?? data.intro,
  };
}

export default async function LegalRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await sanityFetch<LegalPageData | null>({
    query: LEGAL_PAGE_QUERY,
    params: { slug },
  });

  if (!data) notFound();

  return (
    <main>
      <LegalPage
        title={data.title}
        eyebrow={data.eyebrow}
        lastUpdated={data.lastUpdated}
        intro={data.intro}
        tocHeading={data.tocHeading}
        sections={data.sections}
      />
    </main>
  );
}
