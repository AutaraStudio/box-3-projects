# Stack

## Core
- Next.js 14, App Router, TypeScript strict mode
- Deployed on Netlify, version controlled on GitHub

## Styling
- Tailwind CSS v4 (utility-first) — uses @import "tailwindcss" and
  @config directives. Never use @tailwind base/components/utilities
  (v3 directives — will silently break the token system)
- CSS custom properties for all tokens (colors, animations, spacing, typography)
- No hardcoded values anywhere

## Animation
- GSAP + ScrollTrigger: scroll animations, timelines, parallax
- GSAP ScrambleText: nav primary/secondary link reveals only
- Lenis: smooth scroll, initialised globally at app level
- Framer Motion: page transitions and React-specific UI micro-interactions only
- All easings/durations centralised in /src/config/animations.config.ts
- Global observers live in `src/components/layout/*Observer.tsx` — see `docs/ANIMATIONS.md` for the full list.

## CMS
- Sanity with next-sanity
- All text and images served from Sanity
- Folder-based schema structure for client usability

## Key Libraries
- gsap + @gsap/react
- lenis
- framer-motion
- next-sanity
- @sanity/image-url
- @sanity/client

## Environment Variables
- NEXT_PUBLIC_SANITY_PROJECT_ID
- NEXT_PUBLIC_SANITY_DATASET
- NEXT_PUBLIC_SANITY_API_VERSION
