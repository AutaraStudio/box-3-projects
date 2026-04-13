import HomeHero from "@/components/sections/HomeHero";
import { sanityFetch } from "@/sanity/lib/fetch";
import { HOME_PAGE_QUERY, type HomePageData } from "@/sanity/queries/homePage";

export default async function Home() {
  const data = await sanityFetch<HomePageData | null>({
    query: HOME_PAGE_QUERY,
  });

  return (
    <main>
      <HomeHero
        heading={data?.heading ?? "Fit-Outs Done Differently"}
        tagline={data?.tagline ?? "London's trusted commercial fit-out partner."}
        image={data?.heroImage ?? null}
        imageAlt={data?.heroImage?.alt ?? "Hero background"}
      />
    </main>
  );
}
