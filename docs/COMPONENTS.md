# Component Conventions

## Philosophy
- Every component is fully prop-based with strict TypeScript
- Props anticipate future reuse across multiple contexts
- No hardcoded strings — all text from Sanity via props
- No hardcoded image paths — all images from Sanity
- All colours via --theme-* tokens — zero hardcoded values
- All sizing in rem — scales with the Osmo fluid system
- data-* attributes for all animation and JS targeting
- Semantic HTML — correct element for every job
- Accessible — aria labels on all interactive elements
- Every section wrapper needs data-nav-theme

## Completed Components

### Nav — src/components/layout/Nav.tsx
- Client component (GSAP animations)
- Fixed position, full mega menu, ScrambleText on menu button
- 12-column grid layout — desktop only nav links
- Scroll-hide behaviour via ScrollTrigger
- NavThemeObserver swaps data-theme automatically per section
- All GSAP values from animations.config.ts
- All content from Sanity via props (links, phone, email, contactForm)
- Component CSS: Nav.css

### Footer — src/components/layout/Footer.tsx
- Server component
- Two-column layout: left (nav links) / right (contact details)
- CharHoverObserver handles char animation on all links
- data-theme="dark" — charcoal bg, pink text
- All content from Sanity via props
- Component CSS: Footer.css

### HomeHero — src/components/sections/HomeHero.tsx
- Client component (GSAP scroll scrub)
- Full viewport, 12-column named-area grid
- Decorative line system via data-line-reveal-hero
- DitherEngine canvas wired via HeroDitherProvider
- data-theme="dark", data-nav-theme="dark"
- Heading and tagline temporarily commented out
- All content from Sanity via props

### PartnersSection — src/components/sections/PartnersSection.tsx
- Client component (GSAP infinite marquee)
- 2-row checkerboard marquee, scroll-direction aware
- SVGs inlined server-side in page.tsx for currentColor support
- data-theme="dark", data-nav-theme="dark"
- All content from Sanity via props

## Naming Conventions
- Section components: PascalCase, descriptive — HomeHero, PartnersSection
- UI primitives: PascalCase, generic — Button, Tag, Link
- Layout components: PascalCase — Nav, Footer, Providers
- Component CSS: same name as component — Nav.css, Footer.css
- CSS classes: BEM-adjacent kebab-case — .footer-root, .menu-primary-link

## Rules
- Custom CSS in component-level stylesheet, not globals.css
  (unless truly global)
- Tailwind handles 95% of styling — custom CSS for grid
  template areas, absolute positioning, and complex layout only
- All animation DOM targeting uses data-* attributes — never
  classes or IDs
- Component-specific GSAP animations scoped with useGSAP + scope ref
- Global animations (fade-up, split-text, line-reveal, char-hover)
  are handled by providers — never re-implement in components
