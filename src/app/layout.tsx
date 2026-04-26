import type { Metadata } from "next";
import localFont from "next/font/local";
import SmoothScroll from "@/components/scroll/SmoothScroll";
import { PageTransitionProvider } from "@/components/transition/PageTransitionProvider";
import PageTransitionOverlay from "@/components/transition/PageTransitionOverlay";
import { MenuProvider } from "@/components/menu/MenuProvider";
import Header from "@/components/menu/Header";
import MenuOverlay from "@/components/menu/MenuOverlay";
import "./globals.css";

/* The site uses a single typeface — Neue Montreal — across body and
   headings. Hierarchy is built from size + weight (regular vs medium),
   not from a serif/sans pairing. Self-hosted woff2 from /public/fonts.
   Exposed as --font-sans on the <html> element. */
const neueMontreal = localFont({
  src: [
    { path: "../../public/fonts/NeueMontreal-Light.woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/NeueMontreal-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/NeueMontreal-Italic.woff2", weight: "400", style: "italic" },
    { path: "../../public/fonts/NeueMontreal-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/NeueMontreal-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Box 3 Projects",
  description: "Coming soon.",
};

/* Site menu content. Placeholder featured projects until the projects
   page lands and can supply real refs; everything else is the live
   contact / social / legal copy from the brief. */
const MENU_CONTENT = {
  pages: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Projects", href: "/projects" },
    { label: "Careers", href: "/careers" },
    { label: "Sustainability", href: "/sustainability" },
  ],
  featuredProjects: [
    {
      title: "Tower 42",
      href: "/projects/tower-42",
      details: [
        { label: "Client", value: "Confidential" },
        { label: "Sector", value: "Workplace" },
        { label: "Location", value: "City of London" },
        { label: "Completion", value: "Spring 2024" },
      ],
    },
    {
      title: "Meta King's Cross",
      href: "/projects/meta-kings-cross",
      details: [
        { label: "Client", value: "Meta" },
        { label: "Sector", value: "Workplace" },
        { label: "Location", value: "King's Cross" },
        { label: "Completion", value: "Summer 2024" },
      ],
    },
    {
      title: "Carlton Gardens",
      href: "/projects/carlton-gardens",
      details: [
        { label: "Client", value: "Confidential" },
        { label: "Sector", value: "Hospitality" },
        { label: "Location", value: "St James's" },
        { label: "Completion", value: "Autumn 2023" },
      ],
    },
    {
      title: "Saatchi & Saatchi",
      href: "/projects/saatchi-and-saatchi",
      details: [
        { label: "Client", value: "Saatchi & Saatchi" },
        { label: "Sector", value: "Workplace" },
        { label: "Location", value: "Charlotte Street" },
        { label: "Completion", value: "Spring 2023" },
      ],
    },
    {
      title: "Soho House",
      href: "/projects/soho-house",
      details: [
        { label: "Client", value: "Soho House" },
        { label: "Sector", value: "Hospitality" },
        { label: "Location", value: "Shoreditch" },
        { label: "Completion", value: "Winter 2022" },
      ],
    },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={neueMontreal.variable}>
      <body data-theme="cream">
        <SmoothScroll>
          <PageTransitionProvider>
            <MenuProvider>
              <Header />
              {children}
              <MenuOverlay {...MENU_CONTENT} />
              <PageTransitionOverlay />
            </MenuProvider>
          </PageTransitionProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
