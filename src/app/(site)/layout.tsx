import type { Metadata } from "next";
import Providers from "@/components/layout/Providers";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { sanityFetch } from "@/sanity/lib/fetch";
import { NAV_QUERY, type SiteNavData } from "@/sanity/queries/siteNav";
import { FOOTER_QUERY, type SiteFooterData } from "@/sanity/queries/siteFooter";
import "../globals.css";

export const metadata: Metadata = {
  title: "Box 3 Projects — Commercial Fit-Outs Done Differently",
  description:
    "London's trusted commercial fit-out partner. Delivering exceptional spaces for forward-thinking businesses.",
};

/** Fallback footer data when Sanity hasn't been populated yet. */
const DEFAULT_FOOTER: SiteFooterData = {
  primaryLinks: [
    { label: "About", href: "/about", _key: "f-about" },
    { label: "Services", href: "/services", _key: "f-services" },
    { label: "Projects", href: "/projects", _key: "f-projects" },
    { label: "Clients", href: "/clients", _key: "f-clients" },
  ],
  secondaryLinks: [
    { label: "Culture & Careers", href: "/culture-and-careers", _key: "f-culture" },
    { label: "Blog", href: "/blog", _key: "f-blog" },
    { label: "Contact", href: "/contact", _key: "f-contact" },
  ],
  miscLinks: [
    { label: "FAQ", href: "/faq", _key: "f-faq" },
  ],
  socialLinks: [
    { label: "Instagram", href: "https://instagram.com", _key: "f-instagram" },
    { label: "LinkedIn", href: "https://linkedin.com", _key: "f-linkedin" },
  ],
  legalLinks: [
    { label: "Privacy Policy", href: "/privacy-policy", _key: "f-privacy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions", _key: "f-terms" },
  ],
  phone: "+44 20 0000 0000",
  email: "hello@box3projects.co.uk",
  address: "Studio 4, 12 Fitzroy Square\nLondon\nW1T 6EQ",
  stayInTouchLabel: "Stay In Touch",
  newsletterPlaceholder: "Your email...",
  contactHeading: "Find Us",
  madeByLabel: "Made by Autara Studio",
  madeByUrl: "#",
  copyright: "\u00A9 2026. Box 3 Projects Ltd. All Rights Reserved.",
};

/** Fallback nav data when Sanity hasn't been populated yet. */
const DEFAULT_NAV: SiteNavData = {
  primaryLinks: [
    { label: "About", href: "/about", _key: "about" },
    { label: "Services", href: "/services", _key: "services" },
    { label: "Projects", href: "/projects", _key: "projects" },
    { label: "Clients", href: "/clients", _key: "clients" },
  ],
  secondaryLinks: [
    { label: "Culture & Careers", href: "/culture-and-careers", _key: "culture" },
    { label: "Blog", href: "/blog", _key: "blog" },
    { label: "Contact", href: "/contact", _key: "contact" },
  ],
  megaMenuCompanyLinks: [
    { label: "Culture & Careers", href: "/culture-and-careers", _key: "mc-culture" },
    { label: "Blog", href: "/blog", _key: "mc-blog" },
    { label: "Contact", href: "/contact", _key: "mc-contact" },
  ],
  phone: "+44 20 0000 0000",
  email: "hello@box3projects.co.uk",
  address: "London, UK",
  contactForm: {
    namePlaceholder: "Name",
    emailPlaceholder: "Email",
    messagePlaceholder: "Message",
    submitLabel: "Send message",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navData, footerData] = await Promise.all([
    sanityFetch<SiteNavData | null>({ query: NAV_QUERY }),
    sanityFetch<SiteFooterData | null>({ query: FOOTER_QUERY }),
  ]);
  const nav = navData ?? DEFAULT_NAV;
  const footer = footerData ?? DEFAULT_FOOTER;

  return (
    <html lang="en">
      <body data-theme="light">
        <Nav
          primaryLinks={nav.primaryLinks}
          secondaryLinks={nav.secondaryLinks}
          megaMenuCompanyLinks={nav.megaMenuCompanyLinks}
          phone={nav.phone}
          email={nav.email}
          address={nav.address}
          contactForm={nav.contactForm}
        />
        <Providers>{children}</Providers>
        <Footer
          primaryLinks={footer.primaryLinks}
          secondaryLinks={footer.secondaryLinks}
          miscLinks={footer.miscLinks}
          socialLinks={footer.socialLinks}
          legalLinks={footer.legalLinks}
          phone={footer.phone}
          email={footer.email}
          address={footer.address}
          stayInTouchLabel={footer.stayInTouchLabel}
          newsletterPlaceholder={footer.newsletterPlaceholder}
          contactHeading={footer.contactHeading}
          madeByLabel={footer.madeByLabel}
          madeByUrl={footer.madeByUrl}
          copyright={footer.copyright}
        />
      </body>
    </html>
  );
}
