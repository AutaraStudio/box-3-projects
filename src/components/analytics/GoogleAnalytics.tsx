/**
 * GoogleAnalytics
 * ===============
 * GA4 (gtag.js) tag, shared across the public site and the internal
 * guide so analytics is identical on every non-Sanity page. Mounted
 * once per root layout — NOT in the (studio) layout, since the Sanity
 * editor surface is excluded from tracking.
 *
 * Rendered as plain <script> tags (NOT next/script's afterInteractive)
 * so the loader is emitted directly into the server-rendered <head>.
 * This matters for Google Search Console's "Google Analytics"
 * site-ownership check, which fetches the raw HTML WITHOUT running
 * JavaScript — afterInteractive only leaves a <link rel="preload">
 * in the head and injects the real <script> on the client, which the
 * verifier can't see. React 19 hoists the async loader into <head>;
 * the inline init sits alongside it.
 */

const GA_MEASUREMENT_ID = "G-5VFLZ1919K";

export default function GoogleAnalytics() {
  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script
        id="gtag-init"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `,
        }}
      />
    </>
  );
}
