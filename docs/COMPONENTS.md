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
- Every section wrapper needs data-theme AND data-nav-theme

## Completed Components

### Button — src/components/ui/Button.tsx
Global reusable button. Renders as `<a>` when `href` is provided,
`<button>` otherwise. Fully theme-aware — zero hardcoded colours,
all values flow from `--theme-btn-*` tokens via local `--btn-*`
variables set on the variant class.

**Props**

| Prop        | Type                                       | Default     | Notes                                             |
|-------------|--------------------------------------------|-------------|---------------------------------------------------|
| `variant`   | `"primary" \| "secondary"`                 | `"primary"` | Visual style                                      |
| `size`      | `"sm" \| "md" \| "lg" \| "xl"`             | `"md"`      | Scale                                             |
| `full`      | `boolean`                                  | `false`     | Stretches to container width                      |
| `href`      | `string`                                   | —           | When set, renders as `<a>`                        |
| `target`    | `"_blank" \| "_self"`                      | —           | `<a>` only                                        |
| `rel`       | `string`                                   | —           | `<a>` only — useful for external links            |
| `onClick`   | `MouseEventHandler<HTMLButtonElement>`     | —           | `<button>` only                                   |
| `type`      | `"button" \| "submit" \| "reset"`          | `"button"`  | `<button>` only                                   |
| `children`  | `ReactNode`                                | required    | Label text                                        |
| `className` | `string`                                   | —           | Merged onto root via `cn()`                       |
| `ariaLabel` | `string`                                   | —           | Accessible label override                         |
| `icon`      | `ReactNode`                                | —           | Trailing-edge icon slot                           |
| `disabled`  | `boolean`                                  | `false`     | Dim + non-interactive; sets `aria-disabled`       |

**Variants**
- `primary` — filled, high-emphasis — use for the primary call-to-action in any section (one per section ideally)
- `secondary` — outlined, lower-emphasis — use for supporting actions next to a primary button, or when a full-strength button would overwhelm the layout

**Sizes** (heights at 1440 = 1rem/16px base)

| Size | Height            | Padding-inline    | Label size            | Approx px    |
|------|-------------------|-------------------|-----------------------|--------------|
| `sm` | `var(--space-6)`  | `var(--space-4)`  | `--font-size-text-xs` | 32 × 12px    |
| `md` | `var(--space-7)`  | `var(--space-5)`  | `--font-size-text-sm` | 40 × 14px    |
| `lg` | `var(--space-8)`  | `var(--space-6)`  | `--font-size-text-sm` | 48 × 14px    |
| `xl` | `var(--space-9)`  | `var(--space-7)`  | `--font-size-text-md` | 64 × 16px    |

**Hover animation** — two-stage clip-path wipe, CSS only:
1. `.btn__panel` wipes up from the bottom (`--theme-btn-*-bg-panel`)
2. `.btn__hover` covers the panel after `--duration-fast` (`--theme-btn-*-bg-hover`)

Un-hover reverses the order so the exit mirrors the entrance. The
label colour and any provided icon transition via `--animation-gentle`.
The label is wrapped in a `<span data-char-hover="">` so it opts into
the global `CharHoverObserver` + CSS char slide-up on hover.

**Usage**

```tsx
// Link-style (renders as <a>)
<Button href="/projects">View Projects</Button>

// Action-style (renders as <button>)
<Button variant="secondary" size="lg" onClick={handleClick}>
  Learn More
</Button>

// External link, full-width
<Button href="https://example.com" target="_blank" rel="noopener" full>
  Get In Touch
</Button>

// With trailing icon at max scale
<Button variant="primary" size="xl" icon={<ArrowIcon />}>
  Explore
</Button>
```

- Component CSS: Button.css

### Nav — src/components/layout/Nav.tsx
- Client component (GSAP animations)
- Fixed position, full mega menu, ScrambleText on primary + secondary nav links
- Nav links share the exact same typography + spacing as footer links
  (same Tailwind class stack, same `gap: var(--space-1)`) — keep
  them in sync
- Logo block / MENU button / Contact chip are themed via
  `--theme-btn-primary-*` + `--theme-nav-icon-*`
- Scroll-hide behaviour via ScrollTrigger
- `NavThemeObserver` swaps `data-theme` automatically per section
- All GSAP values from `animations.config.ts`
- All content from Sanity via props (links, phone, email, contactForm)
- Mega menu company links + contact links use `<span data-char-hover="">`
  wrappers; the primary/secondary top-level nav links do NOT (ScrambleText
  rewrites their children, which would destroy the char-hover spans)
- Component CSS: Nav.css

### Footer — src/components/layout/Footer.tsx
- Server component
- Two-column layout: left (nav links in four groups — Index /
  Company / Social / Legal) / right (contact details)
- Every link wraps its label in `<span data-char-hover="">` for the
  global char slide-up
- `data-theme="dark"` — charcoal bg, pink text
- All content from Sanity via props
- Component CSS: Footer.css

### HomeHero — src/components/sections/HomeHero.tsx
- **Server component** — no client-side GSAP
- Full viewport, 12-column named-area grid
- Decorative vertical line scaleY reveals (CSS transform only,
  scoped inside HomeHero; no global line-reveal observer)
- Full-bleed Sanity background image with a `data-overlay="medium"`
  tinted overlay on top
- Heading is split at the first space into a two-line
  `<h1>` (e.g. "Fit-Outs" / "Done Differently") constrained with a
  `max-width: 18ch` on `.hero-title__h1`
- `data-theme="night"` + `data-nav-theme="night"` — white text,
  pink logo / MENU / contact chip
- All content from Sanity via props (`heading`, `tagline`, `image`,
  `imageAlt`)

### PartnersSection — src/components/sections/PartnersSection.tsx
- Client component (GSAP infinite marquee)
- 2-row checkerboard marquee, scroll-direction aware
- SVGs fetched + sanitised server-side in page-level loaders and
  passed as resolved `svgContent` strings so `currentColor` works
- Heading ("Trusted By") rendered top-left with a full-width divider
- `data-theme="dark"`, `data-nav-theme="dark"`
- All content from Sanity via props

## Project Detail Components

These components make up the /projects/[slug] page. They live
together in `src/components/sections/project/` and are only mounted
by the dynamic project route. All content flows in through props —
each is fully portable and theme-aware.

### ProjectHero — src/components/sections/project/ProjectHero.tsx
- Server component
- Two-column layout — left column sticks to the viewport on desktop
  while the right column scrolls independently
- Left column: category tag, title, ruled stats table (`<dt>`/`<dd>`
  pairs for Location / Year / stats from Sanity); stats are anchored
  to the bottom of the sticky column
- Right column:
  - Gallery stack (first 5 images) — each image is a
    `[data-image-reveal]` mask that also acts as a
    `[data-parallax="trigger"]`, wrapping the `<Image>` in an inner
    `[data-parallax="target"]` div with `height: 130%` + `top: -15%`
    so the mask stays covered through a `yPercent: 12 → -12` scroll
    drift
  - Project team grid (inline tiles — team cards rendered directly,
    no sub-component). Media uses `data-image-reveal` only; no
    parallax on the team thumbnails.
- `data-theme="dark"` + `data-nav-theme="dark"`
- Gallery has `padding-top: 70svh` on desktop so the first image
  lands ~20% below the vertical viewport centre at page load
- **Props**: `title`, `category`, `heroImages`, `stats`, `location`,
  `year`, `teamMembers`
- Component CSS: ProjectHero.css

### ProjectExpertise — src/components/sections/project/ProjectExpertise.tsx
- Server component
- Ruled list of expertise tags — one row per tag, enclosing top/bottom
  borders
- Returns `null` when the expertise array is empty
- `data-theme="cream"` + `data-nav-theme="cream"`
- **Props**: `expertise: { _id, title }[]`, optional `heading`
- Component CSS: ProjectExpertise.css

### ProjectGallery — src/components/sections/project/ProjectGallery.tsx
- Client component (GSAP ScrollTrigger scrub + Swiper)
- 300svh scroll-driven Explore section — the hero media scales from
  its idle reference width (37.5% on desktop, 87.5% on tablet) up to
  a cover-fit scale while the heading + duplicate translate vertically
  so the words emerge from behind the image frame
- Sticky CTA slot below the explore section — full-width Button that
  opens the lightbox
- Lightbox (inline, not a separate component) — Swiper-driven fixed
  overlay with loop, fraction pagination, keyboard nav
  (Escape / ← / →), clip-path open/close animation, and
  `data-lenis-prevent` to block smooth-scroll interference
- `data-theme="light"` + `data-nav-theme="light"` on the section,
  `data-theme="dark"` on the lightbox modal (dark chrome reads better
  around full-screen imagery)
- **Props**: `images: ProjectImage[]`, optional `galleryId`, `title`,
  `openLabel`, `projectTitle`
- Component CSS: ProjectGallery.css

### RelatedProjects — src/components/sections/project/RelatedProjects.tsx
- Server component
- Full-bleed tiled list of project cards — 16-column grid per tile on
  desktop (media 1–4, info 5–16), stacks to single column on mobile
- Fed by `RELATED_PROJECTS_QUERY` which ranks same-category projects
  first, filled to max 5 with newest-by-year
- Returns `null` when the projects array is empty
- Tiles are transparent at rest; hovering fades in a `--theme-accent`
  wash behind the tile (`.related-projects__hover` opacity 0 → 1,
  transition on `--duration-slow` + `--ease-brand`)
- Tile copy stays at `--theme-text` at rest AND on hover — the
  previous "invert on hover" has been removed; only the "View more"
  label slides into view on hover
- Trailing-right "View All Projects" Button (primary, lg) links to
  `/projects`
- `data-theme="light"` + `data-nav-theme="light"`
- **Props**: `projects: RelatedProject[]`, optional `heading`,
  `ctaLabel`, `ctaHref`
- Component CSS: RelatedProjects.css

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
- Component-specific GSAP animations scoped with `useGSAP` + scope ref
- Global animations (parallax, image-reveal, char-hover, nav-theme)
  are handled by providers — never re-implement in components
- There is NO global split-text, fade-up, or line-reveal observer.
  If a section needs text-by-line or fade-up entry, write a
  component-local GSAP timeline with `useGSAP`.
