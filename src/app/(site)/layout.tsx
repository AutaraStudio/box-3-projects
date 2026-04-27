import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import SmoothScroll from "@/components/scroll/SmoothScroll";
import { PageTransitionProvider } from "@/components/transition/PageTransitionProvider";
import PageTransitionOverlay from "@/components/transition/PageTransitionOverlay";
import { MenuProvider } from "@/components/menu/MenuProvider";
import Header from "@/components/menu/Header";
import MenuOverlay from "@/components/menu/MenuOverlay";
import Footer from "@/components/footer/Footer";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  FEATURED_PROJECTS_QUERY,
  type FeaturedProjectItem,
} from "@/sanity/queries/projects";
import "../globals.css";

/* The site uses a single typeface — Neue Montreal — across body and
   headings. Hierarchy is built from size + weight (regular vs medium),
   not from a serif/sans pairing. Self-hosted woff2 from /public/fonts.
   Exposed as --font-sans on the <html> element. */
const neueMontreal = localFont({
  src: [
    { path: "../../../public/fonts/NeueMontreal-Light.woff2", weight: "300", style: "normal" },
    { path: "../../../public/fonts/NeueMontreal-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../../public/fonts/NeueMontreal-Italic.woff2", weight: "400", style: "italic" },
    { path: "../../../public/fonts/NeueMontreal-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../../public/fonts/NeueMontreal-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Box 3 Projects",
  description: "Coming soon.",
};

/* Static menu content — pages, contact, social, legal stay
   hardcoded for now; only featuredProjects flows from Sanity. */
const STATIC_MENU = {
  pages: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Projects", href: "/projects" },
    { label: "Careers", href: "/careers" },
    { label: "Sustainability", href: "/sustainability" },
  ],
  contact: {
    addressLines: ["Level 5, 55 Broadway,", "London SW1H 0BD."],
    email: "hello@box3projects.co.uk",
    phone: "+44 (0)20 8050 7815",
    phoneHref: "tel:02080507815",
  },
  social: [
    { label: "Instagram", href: "https://www.instagram.com/box3projects/" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/box3-projects/",
    },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* Pull the projects flagged `featured == true` from Sanity. The
     site-wide menu and the footer's "Featured Projects" column
     both consume this list; toggling the field on a project
     document adds or removes it from both surfaces. */
  const featuredFromCms = await sanityFetch<FeaturedProjectItem[]>({
    query: FEATURED_PROJECTS_QUERY,
  });
  const featuredProjects = featuredFromCms.map((p) => ({
    title: p.title,
    href: `/projects/${p.slug}`,
    category: p.categoryTitle,
  }));

  return (
    <html
      lang="en"
      className={neueMontreal.variable}
      suppressHydrationWarning
    >
      {/* Google Analytics (GA4) — loaded with `afterInteractive`
          so it doesn't block first paint. Mounted on the (site)
          group layout, not the (studio) one, so the CMS admin
          isn't tracked. */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-5VFLZ1919K"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-5VFLZ1919K');
        `}
      </Script>
      <body data-theme="cream">
        <SmoothScroll>
          <PageTransitionProvider>
            <MenuProvider>
              <Header />
              {children}
              <Footer
                pages={STATIC_MENU.pages}
                featuredProjects={featuredProjects}
                contact={STATIC_MENU.contact}
                social={STATIC_MENU.social}
                legal={STATIC_MENU.legal}
              />
              <MenuOverlay
                pages={STATIC_MENU.pages}
                featuredProjects={featuredProjects}
                contact={STATIC_MENU.contact}
                social={STATIC_MENU.social}
                legal={STATIC_MENU.legal}
              />
              <PageTransitionOverlay />
            </MenuProvider>
          </PageTransitionProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
