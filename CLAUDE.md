# box-3-projects — Project Briefing

## Project Overview
- Converting a Webflow website to Next.js 14 with App Router
- Client site: warm, feminine, modern, trustworthy brand
- Built to Silicon Valley frontend engineering standards
- Every section built as a senior UI/UX engineer would approach it

## Tech Stack
- Framework: Next.js 14 (App Router, TypeScript strict mode)
- Styling: Tailwind CSS v4 + CSS custom properties
- Animation: GSAP + ScrollTrigger + ScrambleText (nav only), Lenis smooth scroll, Framer Motion (UI transitions only)
- CMS: Sanity (next-sanity) — Project ID: uwutffn5
- Hosting: Netlify
- Version Control: GitHub

## Project Rules — Must Follow Always

## Converting External Resources

When building any component, section, or animation from an external 
source (Webflow HTML, reference CSS/JS, CodePen, design files, or 
any third-party code), the following conversion rules are absolute 
and non-negotiable. Every single value must be converted. No 
exceptions. If uncertain about how to convert something — ask before 
building.

### What Must Always Be Converted

**Colors**
- Every hex, rgb, rgba, hsl, or named color → nearest --theme-* token
- Transparent variants → color-mix(in srgb, var(--color-*) X%, transparent)
- Never rgba() with hardcoded values — ever
- If no exact token exists → ask which theme token is semantically correct

**Typography**
- Every font-family → var(--font-primary) or var(--font-secondary)
- Every font-size → nearest --font-size-* token (rem only)
- Every font-weight → nearest --font-weight-* token
- Every line-height → nearest --line-height-* token
- Every letter-spacing → nearest --letter-spacing-* token
- text-transform: uppercase → also add letter-spacing: var(--letter-spacing-caps)
- Never put typography in CSS classes — always Tailwind utility classes in JSX

**Spacing**
- Every px margin, padding, gap → nearest --space-*, --section-space-*, or --gap-* token
- Convert px → rem (÷16), then match nearest token
- Section vertical padding → --section-space-* tokens
- Never hardcode px values for layout or typography

**Borders**
- Every border-width → var(--border-width)
- Every border-color → nearest --theme-border* token
- Every border-radius → nearest --radius-* token

**Animation**
- Every easing string → nearest ease from animations.config.ts
- Every duration value → nearest duration from animations.config.ts
- Every stagger value → nearest stagger from animations.config.ts
- All DOM targeting → data-* attributes, never classes or IDs
- CSS transitions → var(--transition-*) or var(--animation-*) tokens

**Layout**
- All sizing in rem — never px for layout
- Grid/flex gaps → --gap-* tokens
- Container widths → .container system variants

### What Cannot Always Be Converted

Some values have no token equivalent and require custom CSS. When 
this happens:

1. Write the custom CSS in the component-level stylesheet (not globals.css 
   unless it is truly global)
2. Add an approval comment explaining why no token exists:
```css
   /* 29px at 1440 — no token equivalent, pixel-perfect logo size */
   height: 1.8125rem;
```
3. Use rem not px — the Osmo scaling system still applies
4. Reference the nearest brand aesthetic — colors from the primitive 
   palette via color-mix, spacing proportional to the token scale
5. Never copy foreign values verbatim — always convert to rem and 
   reference tokens wherever possible

### Rule of Thumb

If you are about to write a hardcoded value — stop.
Ask yourself: is there a token for this?
If yes → use the token.
If no → write custom CSS with an approval comment.
If unsure → ask before building.

The goal is zero foreign values in the codebase. A senior engineer 
reading any file should never encounter a mystery hex code, an 
arbitrary px value, or an unknown font string. Everything must 
trace back to the token system.

### Colors
- ZERO hardcoded color values anywhere in the codebase
- All colors reference CSS custom property tokens only
- Primitive palette lives in globals.css (--color-*)
- Semantic tokens live in globals.css (--theme-*)
- 9 themes available: light, dark, night, brand, cream, rose, mauve, sage, sand
- Themes applied via data-theme="[name]" on outer section wrapper only
- Never apply data-theme to individual child elements unless explicitly instructed
- color-mix(in srgb, ...) for transparent variants — never rgba() with hardcoded values

### Styling
- Tailwind utility classes handle 95% of styling
- Custom CSS only when Tailwind cannot achieve the result
- Custom CSS goes in either a component-level stylesheet or globals.css — use judgment
- All sizing in rem units to work with the fluid scaling system
- No hardcoded px values for layout or typography
- No hardcoded color values ever

### Fluid Scaling
- Based on Osmo Supply scaling system
- body font-size is driven by --size-font
- All sizing uses rem so it scales fluidly with the viewport
- Container variants: .container, .container.is--m, .container.is--sm, .container.is--s
- 4 breakpoints: Desktop (1440), Tablet (850), Mobile Landscape (390), Mobile Portrait (390)
- Conversion: rem = px / 16

### Animations
- Global providers (wrapped once in `Providers.tsx`):
  - **SmoothScroll** — Lenis + GSAP ScrollTrigger integration
  - **HoverCursor** — `data-cursor-label` pink cursor chip
  - **ParallaxObserver** — `data-parallax="trigger"` scrub parallax
  - **ImageRevealObserver** — `data-image-reveal` overlay fade
  - **CharHoverObserver** — `data-char-hover` link/button char slide-up
  - **NavThemeObserver** — swaps nav theme by section
- All DOM targeting uses data-* attributes, never classes or IDs
- All GSAP easings and durations imported from /src/config/animations.config.ts
- All CSS transitions use tokens from globals.css (--ease-*, --duration-*, --animation-*, --transition-*)
- Never hardcode animation values in components (image-reveal's 2.4s curve is an intentional exception, documented inline)
- Smooth, modern, editorial — never bouncy or gratuitous
- There is currently NO global split-text, fade-up, or line-reveal system. Do not reintroduce one without explicit instruction.

### Image Reveal (opt-in)

Any media container can opt into the site-wide reveal overlay:

```tsx
<div data-image-reveal>
  <Image ... />
</div>
```

- Overlay colour defaults to `--color-pink-500`; dark + night themes override via `--theme-image-reveal-bg` to match the partner-card surface tone.
- Fires when the element's top crosses the vertical viewport centre (IntersectionObserver with `rootMargin: "0px 0px -50% 0px"`).
- Transition: 2.4s `cubic-bezier(0.22, 1, 0.36, 1)` opacity fade.
- Optional `data-image-reveal-delay="0.2"` for a seconds-based offset.

### Parallax (opt-in)

Scrub parallax system — add `data-parallax="trigger"` to any
element and it will animate its `yPercent` (or `xPercent`) as it
passes through the viewport.

```tsx
<div data-parallax="trigger" data-parallax-start="0" data-parallax-end="40">
  <img src="…" />
</div>
```

Image-in-a-frame mask pattern:

```tsx
<div class="mask" data-parallax="trigger"
     style={{ overflow: "hidden", position: "relative" }}>
  <div data-parallax="target"
       style={{ position: "absolute", inset: 0, height: "120%" }}>
    <img … />
  </div>
</div>
```

All attributes (all optional, all live on the trigger):

| Attribute                        | Default        | Purpose                                    |
|----------------------------------|----------------|--------------------------------------------|
| `data-parallax="trigger"`        | —              | REQUIRED. Also the animated element unless a child has `data-parallax="target"`. |
| `data-parallax="target"`         | —              | Child element to animate instead of the trigger itself. |
| `data-parallax-direction`        | `vertical`     | `vertical` → yPercent · `horizontal` → xPercent |
| `data-parallax-start`            | `20`           | Start position in % (of element size).     |
| `data-parallax-end`              | `-20`          | End position in %.                         |
| `data-parallax-scroll-start`     | `top bottom`   | ScrollTrigger `start` (wrapped in `clamp()`). |
| `data-parallax-scroll-end`       | `bottom top`   | ScrollTrigger `end` (wrapped in `clamp()`). |
| `data-parallax-scrub`            | `true`         | `true` for tight Lenis feel, or a number (seconds of lag). |
| `data-parallax-disable`          | —              | `mobile` · `mobileLandscape` · `tablet` (matchMedia-scoped). |

Breakpoints used by `data-parallax-disable`:
- `mobile` — max-width: 479px
- `mobileLandscape` — max-width: 767px
- `tablet` — max-width: 991px

### Hover Cursor (opt-in, reusable label chip)

Global custom cursor that appears as a pink chip with custom text
over any element carrying `data-cursor-label="…"`. One chip is
rendered at provider level and follows the pointer with a lerp
smooth-follow; the native cursor is hidden only inside opt-in
subtrees.

```tsx
<button data-cursor-label="Play" onClick={openPlayer}>
  {/* …background video, image, anything clickable… */}
</button>
```

- Skipped on touch / coarse-pointer devices automatically.
- The label text is read from the attribute — change it per
  instance without touching the component.
- Nested elements inherit the label from their nearest
  `[data-cursor-label]` ancestor (click through a `<video>` inside
  a wrapper without losing the chip).
- Pair with a click handler — the wrapper is typically a `<button>`
  so the action is keyboard-accessible. The chip itself has
  `pointer-events: none`.

### Char Hover (opt-in, for links + buttons)

Global hover effect — each character slides up 1.3em and a shadow
copy below fills the slot. Used on `Button` labels, footer links,
and mega-menu links:

```tsx
<a href="/about">
  <span data-char-hover="">About</span>
</a>
```

- The span MUST wrap the text; the anchor/button is the hover target.
- `data-char-hover-trigger` on a different ancestor lets you move the
  hover target off the anchor (rarely needed).
- The observer splits text into character spans once on mount. Do
  NOT wrap text that mutates at runtime (e.g. GSAP ScrambleText
  targets like the primary/secondary nav links).
- Stagger is a 0.015s per-character `transition-delay` written
  inline by the observer; duration + ease come from
  `--duration-moderate` + `--ease-slide` in globals.css.

### Components
- Every component is fully prop-based with TypeScript
- Props should anticipate future use across multiple contexts
- Global naming conventions — components are portable across the entire site
- No hardcoded strings — all text content comes from Sanity via props
- No hardcoded image paths — all images served from Sanity assets
- When converting external HTML/CSS/JS:
  - Fully convert ALL colors to --theme-* tokens
  - Fully convert ALL fonts to --font-* tokens
  - Fully convert ALL spacing to --space-* or --section-space-* tokens
  - Fully convert ALL animations to data attributes + GSAP config
  - No foreign values from the original source ever

### Sanity CMS
- Every piece of text on the site comes from Sanity
- All images stored in Sanity
- Schema is folder-based and intuitive for non-technical clients
- Field names and descriptions written in plain English
- If schema structure is ambiguous — ask before building

### Media & Images

The site's entire image pipeline is tag-based. See `/docs/SANITY.md`
"Media & Images" for the full spec. The rules that matter during
implementation:

- **Library**: `sanity-plugin-media` is installed and registered in
  `src/sanity/lib/studio.ts`. Assets live as native `sanity.imageAsset`
  docs; organisation is by `media.tag` references at `opt.media.tags`.
- **Tag convention**: kebab-case slugs (`carlton-gardens`,
  `team-members`). Matches the tag slugs the client has already
  populated. Any new uploader must slugify with the same rules.
- **Bulk Upload tool**: `src/sanity/components/BulkTaggedUploaderTool.tsx`,
  registered as a Studio top-nav tool. Pre-selects a tag, then
  uploads files through a bounded-concurrency pool of **4** (anything
  higher stalls silently at Sanity's asset-endpoint throttle).
- **Pickers on image fields**:
    - `TaggedMediaPicker` for single-value image fields
    - `TaggedMediaArrayPicker` for image array fields
  Both sit **above** the native input as an opt-in "Pick from library"
  button — native upload / Select still works underneath as a fallback.
  Every new image field on any schema must wire one of these via
  `components: { input: ... }`.
- **Never upload inside a consumer document** (project, teamMember,
  homePage, etc.). Uploads flow through the Bulk Upload tool or the
  Media browser. Consumer fields hold references only.
- **Don't change the `opt.media.tags` patch shape.** It must stay
  compatible with `sanity-plugin-media`'s writer.
- **`urlFor()`** pre-applies `.auto("format").quality(80)`. Callers
  don't need to repeat these; they can override if needed.

Operational scripts live in `/scripts` and run via `npx tsx`:
- `delete-projects.ts` — wipe all `project` docs
- `list-tags.ts` — list `media.tag` names with asset counts
- `populate-projects.ts` — destructive rebuild of project /
  projectCategory / expertise content; preserves `teamMember` docs
  and round-robins them across projects; matches tag slugs to
  project titles and pulls 1 featured + up to 15 gallery images.

### Sanity — Production Readiness Rule

Every time a Sanity schema is created or modified, the following
must happen in the same task — never deferred to later:

1. Schema is registered in `src/sanity/schemas/index.ts`
2. Schema uses field **groups** so the Studio UI is tabbed and
   readable — never a single flat list of fields
3. All field titles and descriptions are plain English, client-facing,
   and action-oriented (no dev jargon)
4. Singleton document types are added to the `SINGLETONS` list in
   `src/sanity/lib/structure.ts` AND to the `SINGLETON_TYPES` set
   in `src/sanity/lib/studio.ts`, then added to the custom desk
   structure so they open directly (no intermediate list view)
5. `scripts/seed-sanity.ts` is updated with default content for
   the new or modified document type — singletons use a fixed
   `_id` matching the schema type name (e.g. `_id: "siteNav"`)
6. `npm run seed` is executed to write the document to the dataset
7. The client can log into `/studio` immediately and see a clean,
   tabbed, labelled document ready to edit

This is non-negotiable. Sanity Studio must never show
"No documents of this type" or a raw document list after a build
task is complete.

Rules for schema authoring:
- Every schema declares `groups` when it has more than ~4 fields,
  grouped by real-world category (e.g. Links, Contact, Credits)
- Every field has a client-facing `description` explaining where
  the value is used on the site
- Reusable object shapes (e.g. link = {label, href}) are defined
  once at the top of the schema file and reused via spread or const
- Image and file fields use `options.accept` where applicable and
  carry a description telling the client to upload via Studio
- `validation: (rule) => rule.required()` is NOT added to image
  or file fields — documents must be creatable without assets so
  the seed can run

Rules for seed content:
- All singleton documents use a fixed `_id` equal to the schema
  type name (e.g. `_id: "homePage"`)
- All text fields get sensible real-world placeholder values
- All link fields get correct href paths
- All array fields get at least 2–3 items so the UI is representative
- `image` and `file` fields are NOT seeded — client uploads via Studio
- The seed script is idempotent — it checks for an existing document
  at the fixed `_id` before creating, and cleans up any legacy
  auto-ID duplicates of that type in the same pass
- `SANITY_API_TOKEN` must be an Editor token set in `.env.local`

When modifying an existing schema (adding or renaming fields):
- Patch the existing singleton document by fixed `_id` using
  `client.patch(_id).setIfMissing({...}).commit()` — do not
  create a duplicate
- Only patch fields that are new — leave existing content untouched

### Code Quality Standard
- Written as a senior frontend engineer at a top-tier tech company would write it
- Clean, semantic HTML
- Fully typed TypeScript throughout
- No shortcuts, no hacks
- If something can be more performant, accessible, or elegant — make it so
- The bar is: would a senior engineer at Apple be proud to ship this?

## Folder Structure

src/
  app/
    globals.css                    # shared CSS — imported by site layout only
    (site)/
      layout.tsx                   # root layout — Providers, globals.css, data-theme="light"
      page.tsx                     # home page
    (studio)/
      layout.tsx                   # isolated layout — no styles, no providers
      studio/[[...tool]]/
        page.tsx                   # Sanity Studio
  components/
    ui/                            # Reusable primitive components
    sections/                      # Page section components
    layout/                        # Nav, footer, wrappers
  hooks/                           # Custom React hooks
  lib/                             # Utility functions and helpers
  types/                           # TypeScript type definitions
  config/                          # animations.config.ts and other config
  styles/                          # Additional global stylesheets
  sanity/
    components/                    # Studio input components (TaggedMediaPicker, TaggedMediaArrayPicker, BulkTaggedUploaderTool)
    schemas/
      pages/                       # Page documents (homePage, etc.)
      sections/                    # Reusable section schemas
      collections/                 # Collections: project, projectCategory, vacancy, expertise, teamMember
      globals/                     # Nav, footer, site settings
      components/                  # Shared component schemas
    queries/                       # GROQ queries — one file per page/type
    lib/                           # Sanity client, image builder, fetch helper, studio config, structure

scripts/
  seed-sanity.ts                   # Idempotent singletons + baseline content
  delete-projects.ts               # Wipe all project docs
  list-tags.ts                     # List media.tag names + asset counts
  populate-projects.ts             # Destructive rebuild of project content

docs/                              # Project documentation (read these for full context)
  STACK.md
  COLORS.md
  ANIMATIONS.md
  TYPOGRAPHY.md
  SPACING.md
  COMPONENTS.md
  SANITY.md

reference/                         # Original Webflow source — read for intent only
  ref.html                         # Replace per section, delete after build
  ref.css
  ref.js


## Global Systems — Completed & Active

### Animation Providers (wrapped once in `src/components/layout/Providers.tsx`)

In composition order — SmoothScroll must be outermost so its Lenis
proxy is in place before any ScrollTrigger-driven provider fires:

- **SmoothScroll.tsx** — Lenis smooth scroll + GSAP ScrollTrigger sync
- **ParallaxObserver.tsx** — scrub parallax on `[data-parallax="trigger"]`
- **ImageRevealObserver.tsx** — overlay fade on `[data-image-reveal]`
- **CharHoverObserver.tsx** — splits `[data-char-hover]` text into
  character spans for the global link/button slide-up hover
- **NavThemeObserver.tsx** — swaps the nav's `data-theme` based on
  which section is currently crossing the nav's vertical midpoint

There is NO global split-text, fade-up, line-reveal, or dither
system. Those were intentionally removed; do not reintroduce them
without explicit instruction.

### Data Attribute Conventions — Ready To Use

Animation attributes (see the sections above for full behaviour):

- `data-parallax="trigger"` — register a parallax scrub tween (also
  accepts `-direction`, `-start`, `-end`, `-scroll-start`,
  `-scroll-end`, `-scrub`, `-disable`)
- `data-parallax="target"` — child to animate instead of the trigger
- `data-image-reveal` — overlay fade reveal (+ optional
  `data-image-reveal-delay`)
- `data-char-hover=""` — wrap link/button label for char slide-up
  (+ `data-char-hover-trigger` to relocate the hover target)

Structural / utility attributes:

- `data-theme="[name]"` — semantic theme scope on a section wrapper
- `data-nav-theme="[name]"` — tells NavThemeObserver which theme the
  nav should adopt while this section is in view
- `data-overlay="dark|medium|light"` — tinted overlay utility
- `data-lenis-prevent` — excludes a subtree from Lenis smooth scroll
- `data-nav=""` — marks the nav header element (NavThemeObserver target)

### Theming — Ready To Use
- Add `data-theme="[name]"` to any outer section wrapper
- Available: light, dark, night, brand, cream, rose, mauve, sage, sand
- `night` = charcoal background with pure white text + pink accents
  (use for sections with a photograph/background image)
- `dark` = charcoal background with pink text (use for solid dark
  sections without imagery)
- Default theme: `light` (set on body in `(site)/layout.tsx`)

### Utility
- cn() helper available at @/lib/utils for conditional classNames

### Reference Files Workflow
- Drop original Webflow HTML/CSS/JS into /reference/ before each build
- Claude Code reads these for structural intent only — never copies values
- Delete reference files after each section is built

## Sanity Setup
- Project ID: uwutffn5
- Studio at: /studio (isolated route group — no global styles)
- Schemas live in: src/sanity/schemas/pages/, /sections/, /collections/, /globals/, /components/
- Queries live in: src/sanity/queries/
- All queries use sanityFetch helper from src/sanity/lib/fetch.ts
- Image URLs resolved via urlFor() from src/sanity/lib/image.ts

## Current Build Status
- Project scaffolded ✅
- Dependencies installed ✅
- Folder structure created ✅
- CLAUDE.md + all /docs files complete ✅
- animations.config.ts complete ✅
- globals.css complete ✅
- tailwind.config.ts complete ✅
- Sanity client + Studio route complete ✅
- Studio isolated from global styles via route groups ✅
- Global animation providers complete ✅
- Root layout updated ✅
- Typography system complete ✅
- Spacing system complete ✅
- Hero section complete ✅
  - HomeHero.tsx — fully prop-based, Sanity wired
  - HomeHero.css — 12-column named-area grid
  - homePage schema — src/sanity/schemas/pages/homePage.ts
  - HOME_PAGE_QUERY — src/sanity/queries/homePage.ts
- Component library — pending ⏳
- Nav component — complete ✅
  - Nav.tsx — full mega menu, ScrambleText, scroll-hide behaviour
  - Nav.css — 12-column grid, mega menu layout, button hover effects
  - NavThemeObserver.tsx — swaps nav data-theme on scroll per section
  - siteNav schema — src/sanity/schemas/globals/siteNav.ts
  - NAV_QUERY — src/sanity/queries/siteNav.ts
- Footer component — complete ✅
  - Footer.tsx — editorial two-column layout, contact details
  - Footer.css — 12-column grid, sub-column dividers
  - siteFooter schema — src/sanity/schemas/globals/siteFooter.ts
  - FOOTER_QUERY — src/sanity/queries/siteFooter.ts
- Media pipeline — complete ✅
  - sanity-plugin-media registered in src/sanity/lib/studio.ts
  - BulkTaggedUploaderTool — top-nav Studio tool for pre-tagged bulk upload
  - TaggedMediaPicker / TaggedMediaArrayPicker — tag-filtered pickers on
    every image field (homePage.heroImage, project.featuredImage,
    project.additionalImages, teamMember.image)
  - urlFor() applies auto("format") + quality(80) defaults
  - Operational scripts: delete-projects, list-tags, populate-projects
- Button component — complete ✅
  - Button.tsx + Button.css — global reusable button, fully theme-aware
  - Primary + secondary variants, sm/md/lg/xl sizes
  - Two-stage clip-path wipe on hover, CharHoverObserver label animation
- Project detail page — complete ✅
  - /projects/[slug] — dynamic route with generateStaticParams
  - ProjectHero.tsx + .css — sticky left col (stats + team), gallery
    right col (parallax images + inline team tiles); dark theme
  - ProjectExpertise.tsx + .css — ruled expertise list, cream theme
  - ProjectGallery.tsx + .css — 300svh scroll-scrub Explore + inline
    Swiper lightbox; light theme at rest, dark lightbox modal
  - RelatedProjects.tsx + .css — same-category-first 5-tile grid with
    permanent accent wash behind each tile
  - PartnersSection marquee appended below Related (dark theme)
  - src/sanity/queries/projectDetail.ts — RELATED_PROJECTS_QUERY
- Studio Collections group — complete ✅
  - Projects, Expertise, Team Members, Vacancies, Project Categories
    grouped under a single sidebar item in src/sanity/lib/structure.ts
- All other pages/sections — pending ⏳

## Upcoming Next Steps
1. Component library expansion (Tag, Link primitives)
2. Projects listing page (/projects)
3. About page
4. Services page
5. Contact page
6. Remaining Sanity schemas per new page

## Key Reference Files
- /src/config/animations.config.ts — all GSAP easings, durations, stagger values, scroll trigger defaults, animation presets
- /src/app/globals.css — all CSS tokens, scaling system, color palette, animation tokens
- /docs/* — detailed documentation for each system area

## Known Gotchas

### Osmo Fluid Scaling
- --size-font must be applied to html, not just body
- rem units are relative to html font-size, not body
- Both html and body must have font-size: var(--size-font)
- If scaling stops working, check html element first

### Tailwind v4
- Project runs Tailwind CSS v4 — NOT v3
- Use @import "tailwindcss" and @config "../../tailwind.config.ts" in globals.css
- Never use @tailwind base/components/utilities — these are v3 directives and will
  silently break the entire token system
- tailwind.config.ts is still used and must be loaded via @config directive

### Sanity Seeding
- Every time a new schema type is added, scripts/seed-sanity.ts
  must be updated with default content for that type
- Run npm run seed after adding new schemas
- The script is idempotent — existing documents are never
  overwritten or duplicated
- logo/image fields cannot be seeded programmatically —
  clients upload these via Studio
- SANITY_API_TOKEN must be an Editor token (not Viewer)
- After seeding, the client can log in to /studio and edit
  all content immediately

### Char Hover Animation
- Add `data-char-hover=""` to the text element (span, not the link)
- The link or button is the hover trigger — CSS selects
  `a:hover [data-char-hover] span`
- `CharHoverObserver` splits the text into spans on mount
- Do NOT add `data-char-hover` to elements whose text changes
  dynamically after mount — splits happen once at mount time
- The menu button "Menu"/"Close" text uses ScrambleText
  click animation — do not add `data-char-hover` to that element
- `overflow: hidden` on `[data-char-hover]` is set globally in
  `globals.css` — do not add it again in component CSS

### Nav Theme Observer
- Every page section needs data-nav-theme="[theme]" for the nav to
  respond correctly as the user scrolls
- The nav header element has data-nav="" — NavThemeObserver targets this
- Mega menu overflow requires is-open class on mega-menu-container

### Image Reveal vs Parallax on the same element
- `data-image-reveal` and `data-parallax="trigger"` can coexist on
  the same mask — ImageReveal's `::after` overlay sits at z-index 2
  above the parallax target
- When using both, the parallax target must be a child wrapper
  (`data-parallax="target"`); the image-reveal attr stays on the
  outer mask
- See `ProjectHero` gallery items for a wired example

## When Starting Any Task
1. Read this file first
2. Read the relevant /docs MD file for the system area you are working in
3. Read reference/ref.html, ref.css, ref.js if they exist
4. Follow all rules above without exception
5. If uncertain about structure or approach — ask before building

## When Completing Any Task That Touches Sanity
1. Confirm the schema is registered in `src/sanity/schemas/index.ts`
2. Confirm the schema uses `groups` and every field has a
   client-facing description
3. If the schema is a singleton — confirm it's listed in both
   `src/sanity/lib/structure.ts` and `src/sanity/lib/studio.ts`
   and opens directly from the Studio sidebar
4. Confirm `scripts/seed-sanity.ts` has been updated — singletons
   use fixed `_id` equal to the type name
5. Run `npm run seed`
6. Confirm the document appears in `/studio` with a clean,
   tabbed UI before marking the task complete
7. If the seed fails — fix it before finishing. Do not leave
   Studio in a broken state.