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

| Size | Height            | Padding-inline    | Label size          | Approx px    |
|------|-------------------|-------------------|---------------------|--------------|
| `sm` | `var(--space-6)`  | `var(--space-4)`  | `--font-size-text-xs` | 40 × 12px  |
| `md` | `var(--space-7)`  | `var(--space-5)`  | `--font-size-text-sm` | 48 × 14px  |
| `lg` | `var(--space-8)`  | `var(--space-6)`  | `--font-size-text-sm` | 64 × 14px  |
| `xl` | `var(--space-9)`  | `var(--space-7)`  | `--font-size-text-md` | 80 × 16px  |

**Hover animation** — two-stage clip-path wipe, CSS only:
1. `.btn__panel` wipes up from the bottom (`--theme-btn-*-bg-panel`)
2. `.btn__hover` covers the panel after `--duration-fast` (`--theme-btn-*-bg-hover`)

Un-hover reverses the order so the exit mirrors the entrance. The
label colour and any provided icon transition via `--animation-gentle`.
Char slide-up on the label is handled globally by CharHoverObserver
and CSS rules in `globals.css` — the Button contributes the
`data-char-hover=""` span automatically.

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
