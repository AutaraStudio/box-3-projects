# Stack

## Core
- Next.js 14, App Router, TypeScript strict mode
- Deployed on Netlify, version controlled on GitHub

## Styling
- Tailwind CSS (utility-first)
- CSS custom properties for all tokens (colors, animations, spacing, typography)
- No hardcoded values anywhere

## Animation
- GSAP + ScrollTrigger + SplitText: scroll animations, timelines, text reveals
- Lenis: smooth scroll, initialised globally at app level
- Framer Motion: page transitions and React-specific UI micro-interactions only
- All easings/durations centralised in /src/config/animations.config.ts

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
