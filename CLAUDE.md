# box-3-projects — Project Briefing

## Project Overview
- Converting a Webflow website to Next.js 14 with App Router
- Client site: warm, feminine, modern, trustworthy brand
- Built to Silicon Valley frontend engineering standards
- Every section built as a senior UI/UX engineer would approach it

## Tech Stack
- Framework: Next.js 14 (App Router, TypeScript strict mode)
- Styling: Tailwind CSS + CSS custom properties
- Animation: GSAP + ScrollTrigger + SplitText, Lenis smooth scroll, Framer Motion (UI transitions only)
- CMS: Sanity (next-sanity)
- Hosting: Netlify
- Version Control: GitHub

## Project Rules — Must Follow Always

### Colors
- ZERO hardcoded color values anywhere in the codebase
- All colors reference CSS custom property tokens only
- Primitive palette lives in globals.css (--color-*)
- Semantic tokens live in globals.css (--theme-*)
- 8 themes available: light, dark, pink, cream, rose, mauve, sage, sand
- Themes applied via data-theme="[name]" on outer section wrapper only
- Never apply data-theme to individual child elements unless explicitly instructed

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

### Animations
- All DOM targeting uses data-* attributes, never classes or IDs
- Global animations (Lenis, GSAP ScrollTrigger, SplitText) initialised once at app level
- Component-specific animations scoped to that component
- All GSAP easings and durations imported from /src/config/animations.config.ts
- All CSS transitions use tokens from globals.css (--ease-*, --duration-*, --animation-*, --transition-*)
- Never hardcode animation values in components

### Components
- Every component is fully prop-based with TypeScript
- Props should anticipate future use across multiple contexts
- Global naming conventions — components are portable across the entire site
- No hardcoded strings — all text content comes from Sanity via props
- No hardcoded image paths — all images served from Sanity assets

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

```
src/
  app/                    # Next.js App Router pages
  components/
    ui/                   # Reusable primitive components
    sections/             # Page section components
    layout/               # Nav, footer, wrappers
  hooks/                  # Custom React hooks
  lib/                    # Utility functions and helpers
  types/                  # TypeScript type definitions
  config/                 # animations.config.ts and other config
  styles/                 # Additional global stylesheets
  sanity/
    schemas/              # Sanity schema definitions
    queries/              # GROQ queries
    lib/                  # Sanity client config

docs/                     # Project documentation (read these for full context)
  STACK.md
  COLORS.md
  ANIMATIONS.md
  TYPOGRAPHY.md
  SPACING.md
  COMPONENTS.md
  SANITY.md
```

## Reference Files
- `/src/config/animations.config.ts` — all GSAP easings, durations, stagger values, scroll trigger defaults, animation presets
- `/src/app/globals.css` — all CSS tokens, scaling system, color palette, animation tokens
- `/docs/*` — detailed documentation for each system area

## When Starting Any Task
1. Read this file first
2. Read the relevant `/docs` MD file for the system area you are working in
3. Follow all rules above without exception
4. If uncertain about structure or approach — ask before building
