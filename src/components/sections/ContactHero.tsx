/**
 * ContactHero
 * ===========
 * Full-width hero for the contact page. Dark theme with a centred
 * display heading. All content received via props.
 */

import "./ContactHero.css";

interface ContactHeroProps {
  /** Display heading text */
  heading: string;
}

export default function ContactHero({ heading }: ContactHeroProps) {
  return (
    <section
      className="contact-hero"
      data-theme="dark"
      data-nav-theme="dark"
    >
      <div className="container">
        <h1 className="font-primary font-medium leading-none tracking-tight text-center text-[length:var(--font-size-display)] text-[color:var(--theme-text)]">
          {heading}
        </h1>
      </div>
    </section>
  );
}
