# box-3-projects — v2

Editorial rebuild of the Box 3 Projects website. The previous build
lives on the `master` branch as a frozen reference — `git show
master:<path>` to look something up, never check it out and copy
blindly. This branch (`v2`) is the source of truth.

## Stack

- **Next.js 16** — App Router, TypeScript strict, Turbopack dev
- **Plain CSS** — no Tailwind, no CSS-in-JS, no CSS Modules. One
  `.css` file per component, colocated next to the `.tsx`
- **GSAP** — animation, including the page transition
- **No Sanity yet** — wire when there's a real page to feed content to

## Project rules — must follow always

### Styling
- **Zero hardcoded colour values anywhere.** Every colour goes through
  `--theme-*` tokens (or via `color-mix()` of theme tokens).
- **Zero hardcoded `px` for typography or layout.** Use `rem` so the
  Osmo scaling system applies. Allowed `px`: 1px borders, SVG icon
  attributes, values inside `@media` queries.
- **Plain CSS, BEM-ish naming.** Component classes prefixed with the
  component name (`.page-transition__panel`, not `.panel`).
- No utility-first system on v2 — this site is editorial, layouts
  are bespoke. Custom CSS for everything.

### Theme system
- 3 themes: `dark` (brown bg, pink text), `cream` (cream bg, brown
  text), `pink` (pink bg, brown text). All defined in `globals.css`.
- Set per-section via `data-theme="dark|cream|pink"` on the section
  wrapper. Themes cascade — a section can swap the theme of its
  subtree.
- **Components reference `--theme-*` tokens, never primitive
  `--color-*` tokens.** Primitives (`--color-brown`, `--color-cream`,
  `--color-pink`) are for the theme blocks only.
- Derived tokens (`--theme-border`, `--theme-hover-bg`,
  `--theme-text-muted`, etc.) are auto-computed via `color-mix()` on
  any `[data-theme]` element. To re-tune the whole system, change the
  mix percentages in one place at the `:where([data-theme])` block.
- Adding a new theme = a 3-line block (`--theme-bg`, `--theme-text`,
  `--theme-accent`).

### Fluid scaling (Osmo)
- `--size-font` is applied to `html` and `body`. Every `rem` value
  scales with the viewport via the clamped `--size-container`.
- **Never use `clamp()` or `vw` for typography or spacing** — the
  Osmo system handles fluid sizing across breakpoints.
- 4 breakpoints: desktop (≥992px), tablet (768–991), mobile-landscape
  (480–767), mobile-portrait (320–479). Each has its own
  `--size-container-ideal` so scaling restarts at a sensible base per
  device class.

### Page transitions
- **Internal links use `<TransitionLink>`**, never `<Link>` from
  `next/link`. The link wrapper falls through to a normal navigation
  for external/modified/middle-clicks/target=_blank, so opening in a
  new tab still works.
- The transition is an Osmo-style vertical wipe — panel slides up from
  below, holds while the route swaps, continues up off the top to
  reveal the new page. Honours `prefers-reduced-motion`.
- The overlay panel colour is set by `--transition-bg` (defaults to
  brown). To change per page, set the variable on the page root.

### Smooth scroll (Lenis)
- Mounted once in the root layout via `<SmoothScroll>`. The active
  Lenis instance is exposed on `window.__lenis` so other code can
  pause/resume scrolling and jump-to-top through the same instance.
- Driven by GSAP's ticker, so any future ScrollTrigger work syncs
  automatically without extra setup.
- The page transition pauses Lenis during the wipe and resumes after
  the new page settles — don't call `window.scrollTo` directly during
  a transition; use `window.__lenis?.scrollTo(...)`.

### Fonts
- Two faces, both wired via `next/font`:
  - **Neue Montreal** — sans workhorse, self-hosted woff2 in
    `/public/fonts/`. Loaded as `--font-sans`. Body default.
  - **Newsreader** — variable display serif (Google Fonts), variable
    optical-size axis. Loaded as `--font-display`. Opt-in only.
- **Apply the serif via `.font-display`** on individual headings or
  ledes. Don't change `body { font-family }` — leave the workhorse
  default in place.
- New typefaces go through `next/font` too (no `<link>` to Google
  Fonts CDN, no raw `@font-face` blocks).

### Components
- Fully prop-based, fully typed. Anticipate reuse across pages.
- No hardcoded strings in components — content comes from props (and
  later, from Sanity via the page query).
- Colocated CSS: `Foo.tsx` + `Foo.css` in the same folder.

## Folder layout

```
src/
  app/
    globals.css          shared styles — imported once by layout
    layout.tsx           root layout — provider + overlay
    page.tsx             home
    [route]/page.tsx     other pages
  components/
    scroll/              SmoothScroll (Lenis boot)
    transition/          PageTransitionProvider, Overlay, TransitionLink
    [feature]/           future component groups
public/
  fonts/                 self-hosted woff2 (Neue Montreal)
```

## Active systems

- **Osmo fluid scaling** — `globals.css` SECTION 2
- **3-theme system** — `globals.css` THEME SYSTEM
- **Page transition** — `src/components/transition/`
- **Smooth scroll (Lenis)** — `src/components/scroll/SmoothScroll.tsx`,
  exposed on `window.__lenis`
- **Fonts** — `next/font` setup in `src/app/layout.tsx`. Neue Montreal
  → `--font-sans` (body default), Newsreader → `--font-display`
  (opt-in via `.font-display`)

## Intentionally NOT set up yet

- Sanity CMS — add when there's a page that needs CMS content
- Spacing / type scale tokens — build the first real page with raw
  rem values, then extract tokens from what was actually used. Avoids
  over-engineering tokens for designs that don't exist yet
- Layout primitives (`<Container>`, `<Stack>`) — extract from real
  pages, don't pre-build
- Animation observers (parallax, image-reveal) — per use case, not
  upfront

## Reference branch

`master` has the full previous build: nav, footer, providers, image
reveal, parallax, char-hover, hover-cursor, Sanity setup, media
pipeline, all the section components (HomeHero, BannerShowroom,
FeaturedProjects, Project pages, Testimonials, Partners, Accordion,
Button, LineScroll, etc.). Use `git show master:<path>` or
`git diff master -- <path>` to look at any of it. Don't copy whole
files across without rewriting to v2 conventions.

## When starting any task

1. Read this file
2. If you're touching colour, spacing, or typography — confirm the
   token exists, or add one with a comment explaining why no token
   fit
3. If you're adding a new internal link, use `<TransitionLink>`
4. If you're animating with GSAP, register plugins inside a
   `typeof window !== 'undefined'` guard so SSR doesn't crash
5. If uncertain about an editorial decision (font weight, exact
   line-height, measure constraint) — ask before guessing
