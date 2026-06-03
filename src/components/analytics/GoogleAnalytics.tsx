/**
 * GoogleAnalytics
 * ===============
 * GA4 (gtag.js) tag, shared across the public site and the internal
 * guide so analytics is identical on every non-Sanity page. Mounted
 * once per root layout — NOT in the (studio) layout, since the Sanity
 * editor surface is excluded from tracking.
 *
 * Loaded with next/script `afterInteractive` so it injects into the
 * document without blocking first paint. Centralising the tag id here
 * means the two layouts can never drift apart.
 */

import Script from "next/script";

const GA_MEASUREMENT_ID = "G-5VFLZ1919K";

export default function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
