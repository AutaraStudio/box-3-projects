import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import SmoothScroll from "@/components/scroll/SmoothScroll";
import ScrollResetOnRoute from "@/components/scroll/ScrollResetOnRoute";
import { SiteSettingsProvider } from "@/components/settings/SiteSettingsProvider";
import { PageTransitionProvider } from "@/components/transition/PageTransitionProvider";
import PageTransitionOverlay from "@/components/transition/PageTransitionOverlay";
import { MenuProvider } from "@/components/menu/MenuProvider";
import Header from "@/components/menu/Header";
import MenuOverlay from "@/components/menu/MenuOverlay";
import Footer from "@/components/footer/Footer";
import HomePreloader from "@/components/preloader/HomePreloader";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  FEATURED_PROJECTS_QUERY,
  type FeaturedProjectItem,
} from "@/sanity/queries/projects";
import {
  SITE_SETTINGS_QUERY,
  type SiteSettingsData,
  type SiteSettingsLink,
} from "@/sanity/queries/siteSettings";
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

/* ─────────────────────────────────────────────────────────────────
   Fallback content
   ─────────────────────────────────────────────────────────────────
   Sensible defaults used when the Site Settings document hasn't
   been authored / published yet. Once the editor populates the
   singleton in Sanity, the live values take over automatically. */

const FALLBACK = {
  brandName: "Box 3 Projects",
  headerPrimary: [
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Projects", href: "/projects" },
    { label: "Sustainability", href: "/sustainability" },
  ],
  headerSecondary: [
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  menuPrimary: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
  ],
  menuMore: [
    { label: "Services", href: "/services" },
    { label: "Careers", href: "/careers" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Contact", href: "/contact" },
  ],
  footerPages: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Projects", href: "/projects" },
    { label: "Careers", href: "/careers" },
    { label: "Sustainability", href: "/sustainability" },
  ],
  social: [
    { label: "Instagram", href: "https://www.instagram.com/box3projects/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/box3-projects/" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/legal/privacy-policy" },
    { label: "Terms & Conditions", href: "/legal/terms-and-conditions" },
  ],
  addressLines: ["Level 5, 55 Broadway,", "London SW1H 0BD."],
  email: "hello@box3projects.co.uk",
  phone: "+44 (0)20 8050 7815",
  phoneHref: "tel:02080507815",
} as const;

/* generateMetadata so the root <title> + <meta description> can
   pull from siteSettings.seoTitle / seoDescription instead of
   being hardcoded. Per-page generateMetadata still overrides
   these where it's defined. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch<SiteSettingsData | null>({
    query: SITE_SETTINGS_QUERY,
  });
  return {
    title: settings?.seoTitle?.trim() || FALLBACK.brandName,
    description: settings?.seoDescription?.trim() || "Coming soon.",
  };
}

/* Coerce a Sanity link array (which may be null / undefined / partial)
   into a non-empty list of `{ label, href }`. Drops malformed entries
   (no label or href) so a half-authored doc can't break the nav. */
function coerceLinks(
  fromCms: SiteSettingsLink[] | undefined,
  fallback: ReadonlyArray<{ label: string; href: string }>,
): Array<{ label: string; href: string }> {
  const cleaned = (fromCms ?? [])
    .filter((l): l is SiteSettingsLink => !!l && !!l.label && !!l.href)
    .map(({ label, href }) => ({ label, href }));
  return cleaned.length > 0 ? cleaned : Array.from(fallback);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [featuredFromCms, settings] = await Promise.all([
    sanityFetch<FeaturedProjectItem[]>({
      query: FEATURED_PROJECTS_QUERY,
    }),
    sanityFetch<SiteSettingsData | null>({
      query: SITE_SETTINGS_QUERY,
    }),
  ]);

  const featuredProjects = featuredFromCms.map((p) => ({
    title: p.title,
    href: `/projects/${p.slug}`,
  }));

  /* Resolve every editable surface — fall back to the FALLBACK
     defaults whenever the Sanity field is empty so the site keeps
     rendering during initial setup. */
  const brand = settings?.brandName?.trim() || FALLBACK.brandName;
  const headerPrimary = coerceLinks(
    settings?.headerPrimaryLinks,
    FALLBACK.headerPrimary,
  );
  const headerSecondary = coerceLinks(
    settings?.headerSecondaryLinks,
    FALLBACK.headerSecondary,
  );
  const menuPrimary = coerceLinks(
    settings?.menuPrimaryLinks,
    FALLBACK.menuPrimary,
  );
  const menuMore = coerceLinks(settings?.menuMoreLinks, FALLBACK.menuMore);
  const footerPages = coerceLinks(settings?.footerPages, FALLBACK.footerPages);
  const footerSocial = coerceLinks(settings?.footerSocial, FALLBACK.social);
  const footerLegal = coerceLinks(settings?.footerLegal, FALLBACK.legal);

  const contact = {
    addressLines:
      settings?.addressLines && settings.addressLines.length > 0
        ? settings.addressLines
        : Array.from(FALLBACK.addressLines),
    email: settings?.email || FALLBACK.email,
    phone: settings?.phone || FALLBACK.phone,
    phoneHref: settings?.phoneHref || FALLBACK.phoneHref,
  };

  return (
    <html
      lang="en"
      className={neueMontreal.variable}
      suppressHydrationWarning
    >
      {/* Google Analytics (GA4) — loaded with `afterInteractive`
          so it doesn't block first paint. */}
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
        {/* Synchronous flag for the home preloader — must run
            before any paint so the dark cover (rendered in SSR
            below) is either visible from the very first frame OR
            never paints at all. Sets <html data-preloader> based
            on sessionStorage; the CSS gate in HomePreloader.css
            uses that attribute to decide whether to show the
            cover. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k="box3:preloader-played";var played=sessionStorage.getItem(k)==="1";document.documentElement.setAttribute("data-preloader",played?"skip":"active");}catch(e){document.documentElement.setAttribute("data-preloader","active");}})();`,
          }}
        />
        <SmoothScroll>
          <ScrollResetOnRoute />
          <SiteSettingsProvider value={settings}>
          <PageTransitionProvider>
            <MenuProvider>
              {/* Plays once per session: a dark cover holds a
                  beat, then morphs to the header logo's bounds.
                  Header logo glyphs are hidden via CSS while
                  data-preloader=active is set on <html>. */}
              <HomePreloader />
              <Header
                brand={brand}
                primaryLinks={headerPrimary}
                secondaryLinks={headerSecondary}
              />
              {children}
              <Footer
                pages={footerPages}
                featuredProjects={featuredProjects}
                contact={contact}
                social={footerSocial}
                legal={footerLegal}
                brand={brand}
                columnLabels={settings?.footerLabels}
              />
              <MenuOverlay
                primaryLinks={menuPrimary}
                moreLinks={menuMore}
                contact={contact}
              />
              <PageTransitionOverlay />
            </MenuProvider>
          </PageTransitionProvider>
          </SiteSettingsProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
