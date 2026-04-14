# box-3-projects — Project Briefing

## Project Overview
- Converting a Webflow website to Next.js 14 with App Router
- Client site: warm, feminine, modern, trustworthy brand
- Built to Silicon Valley frontend engineering standards
- Every section built as a senior UI/UX engineer would approach it

## Tech Stack
- Framework: Next.js 14 (App Router, TypeScript strict mode)
- Styling: Tailwind CSS v4 + CSS custom properties
- Animation: GSAP + ScrollTrigger + SplitText, Lenis smooth scroll, Framer Motion (UI transitions only)
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
- 8 themes available: light, dark, pink, cream, rose, mauve, sage, sand
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
- All DOM targeting uses data-* attributes, never classes or IDs
- Global animations (Lenis, GSAP ScrollTrigger, SplitText) initialised once at app level
- Component-specific animations scoped to that component
- All GSAP easings and durations imported from /src/config/animations.config.ts
- All CSS transitions use tokens from globals.css (--ease-*, --duration-*, --animation-*, --transition-*)
- Never hardcode animation values in components
- Smooth, modern, editorial — never bouncy or gratuitous

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
    schemas/
      pages/                       # Page documents (homePage, etc.)
      sections/                    # Reusable section schemas
      collections/                 # Repeatable content types
      globals/                     # Nav, footer, site settings
      components/                  # Shared component schemas
    queries/                       # GROQ queries — one file per page/type
    lib/                           # Sanity client, image builder, fetch helper

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

### Animation Providers (initialised in root layout)
- SmoothScroll.tsx — Lenis smooth scroll + GSAP ScrollTrigger integration
- AnimationProvider.tsx — global data-animate observer
- SplitTextObserver.tsx — global data-split-text observer
- LineRevealObserver.tsx — data-line-reveal and data-line-reveal-hero observer
- Providers.tsx — single wrapper, imported in (site)/layout.tsx

### Data Attribute Animations — Ready To Use
Add these to any element and animations trigger automatically:
- data-animate="fade-up"
- data-animate="fade-in"
- data-animate="fade-down"
- data-animate="clip-reveal"
- data-animate="scale-reveal"
- data-animate-delay="0.2" (optional delay in seconds)
- data-animate-stagger="0.1" (on parent, staggers children)
- data-split-text="lines"
- data-split-text="words"
- data-split-text="chars"
- data-split-delay="0.2" (optional delay)
- data-line-reveal-hero="top|bottom" — line scales in on page load
- data-line-reveal="top|bottom" — line scales in on scroll
- data-line-duration="0.8" — optional per-element duration override
- data-line-delay="0.2" — optional per-element delay override
- data-hero-scroll-fade — fades out on hero scroll
- data-hero-scroll-fade-scale — fades and scales down on hero scroll
- data-nav-theme="dark|light|[theme]" — tells NavThemeObserver what
  theme the nav should use when this section is in view. Add to every
  page section that needs to change the nav appearance.

### Theming — Ready To Use
- Add data-theme="[name]" to any outer section wrapper
- Available: light, dark, pink, cream, rose, mauve, sage, sand
- Default theme: light (set on body in (site)/layout.tsx)

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
- Dither engine reads image URL from data-src attribute on img elements

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
- Footer component — pending ⏳
- All other pages/sections — pending ⏳

## Upcoming Next Steps
1. Component library (Button, Link, Tag)
2. Nav component
3. Footer component
4. Remaining page sections
5. Sanity schemas per section

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

### Nav Theme Observer
- Every page section needs data-nav-theme="[theme]" for the nav to
  respond correctly as the user scrolls
- The nav header element has data-nav="" — NavThemeObserver targets this
- Nav vertical lines use data-line-reveal-hero="top" — fires immediately
  on load, not on scroll
- Mega menu overflow requires is-open class on mega-menu-container

## When Starting Any Task
1. Read this file first
2. Read the relevant /docs MD file for the system area you are working in
3. Read reference/ref.html, ref.css, ref.js if they exist
4. Follow all rules above without exception
5. If uncertain about structure or approach — ask before building