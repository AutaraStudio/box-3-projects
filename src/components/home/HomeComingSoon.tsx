/**
 * HomeComingSoon
 * ==============
 * Full-viewport editorial holding page used when the home page's
 * "Coming soon" toggle is on in Sanity. Renders only the heading
 * + supporting copy, centred. The site-wide header and footer
 * still surround it via the layout.
 *
 * Copy is editor-driven via Sanity (Home Page → Coming Soon
 * tab) with sensible launch defaults if the fields are empty.
 */

import "./HomeComingSoon.css";

interface HomeComingSoonProps {
  heading?: string;
  body?: string;
}

export default function HomeComingSoon({
  heading = "Site updating.",
  body = "We're refreshing things behind the scenes. Please check back shortly.",
}: HomeComingSoonProps) {
  return (
    <section className="home-coming-soon" data-theme="dark">
      <div className="container home-coming-soon__inner">
        <h1 className="home-coming-soon__heading text-h1">{heading}</h1>
        <p className="home-coming-soon__body text-large">{body}</p>
      </div>
    </section>
  );
}
