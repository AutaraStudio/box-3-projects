import type { Metadata } from "next";
import localFont from "next/font/local";
import SmoothScroll from "@/components/scroll/SmoothScroll";
import { PageTransitionProvider } from "@/components/transition/PageTransitionProvider";
import PageTransitionOverlay from "@/components/transition/PageTransitionOverlay";
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
            {children}
            <PageTransitionOverlay />
          </PageTransitionProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
