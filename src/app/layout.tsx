import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import localFont from "next/font/local";
import SmoothScroll from "@/components/scroll/SmoothScroll";
import { PageTransitionProvider } from "@/components/transition/PageTransitionProvider";
import PageTransitionOverlay from "@/components/transition/PageTransitionOverlay";
import "./globals.css";

/* Display serif — Newsreader has an optical-size axis (`opsz`) so the
   same font reads sharp at both 18px lede and 120px display sizes.
   Self-hosted via next/font, no external request. Exposes
   `--font-display` on the <html> element. */
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

/* Sans workhorse — Neue Montreal. Self-hosted woff2 from /public/fonts.
   Exposes `--font-sans` on the <html> element. Matches the brand
   carried over from the previous build. */
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
    <html
      lang="en"
      className={`${neueMontreal.variable} ${newsreader.variable}`}
    >
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
