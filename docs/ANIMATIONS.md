# Animation System

## Philosophy
- Smooth, modern, editorial — never bouncy or playful
- Confident entrances, clean exits, subtle moments of delight
- All animation values centralised — never hardcoded in components
- DOM targeting always via `data-*` attributes, never classes or IDs

## Two Layers

### CSS Transitions (reactive)
For: hover states, focus, colour changes, micro-interactions
Defined as CSS custom properties in `globals.css`
Used via `transition: var(--transition-*)` in components

### GSAP Animations (expressive)
For: scroll reveals, timelines, parallax, component-specific scrubs
(ProjectGallery explore, PartnersSection marquee, Nav ScrambleText).
All config in `/src/config/animations.config.ts`
Never hardcode ease strings or duration values in components

---

## CSS Animation Tokens

### Easing Curves

| Token                | Value                              | Use case                       |
|----------------------|------------------------------------|--------------------------------|
| `--ease-brand`       | `cubic-bezier(0.76, 0, 0.24, 1)`  | Site signature — smooth S-curve|
| `--ease-out`         | `cubic-bezier(0.16, 1, 0.3, 1)`   | Entrances                      |
| `--ease-in`          | `cubic-bezier(0.7, 0, 0.84, 0)`   | Exits                          |
| `--ease-in-out`      | `cubic-bezier(0.65, 0, 0.35, 1)`  | Bidirectional                  |
| `--ease-gentle`      | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Micro-interactions        |
| `--ease-expressive`  | `cubic-bezier(0.34, 1.28, 0.64, 1)` | Subtle overshoot             |
| `--ease-snappy`      | `cubic-bezier(0.4, 0, 0.2, 1)`    | UI feedback                    |
| `--ease-bounce`      | `linear(...)`                      | Refined bounce — use sparingly |
| `--ease-slide`      | `cubic-bezier(0.625, 0.05, 0, 1)` | Char slide reveals — smooth deceleration |

### Duration Scale

| Token                  | Value  |
|------------------------|--------|
| `--duration-instant`   | 0.1s   |
| `--duration-fast`      | 0.2s   |
| `--duration-normal`    | 0.4s   |
| `--duration-moderate`  | 0.6s   |
| `--duration-slow`      | 0.9s   |
| `--duration-slower`    | 1.2s   |
| `--duration-slowest`   | 1.8s   |

### Compound Tokens
Pre-paired duration + easing for consistent use across the site.

Available prefixes:
- `--animation-brand-*`
- `--animation-out-*`
- `--animation-in-*`
- `--animation-inout-*`
- `--animation-gentle-*`
- `--animation-snappy-*`
- `--animation-expressive-*`
- `--animation-bounce-*`

### Transition Presets

| Token                  | Properties covered                                    |
|------------------------|-------------------------------------------------------|
| `--transition-btn`     | color, background, border, shadow, transform          |
| `--transition-link`    | color, border, opacity                                |
| `--transition-card`    | transform, shadow, background                         |
| `--transition-image`   | transform, filter                                     |
| `--transition-icon`    | color, fill, transform                                |
| `--transition-nav`     | background, border, backdrop-filter                   |
| `--transition-overlay` | opacity, visibility                                   |

---

## GSAP Config (`/src/config/animations.config.ts`)

### Ease Map

| Key          | GSAP Ease String      |
|--------------|-----------------------|
| `brand`      | `power3.inOut`        |
| `entrance`   | `power3.out`          |
| `exit`       | `power3.in`           |
| `smooth`     | `expo.out`            |
| `cinematic`  | `expo.inOut`          |
| `gentle`     | `sine.inOut`          |
| `snap`       | `power1.out`          |
| `expressive` | `back.out(1.4)`       |
| `bounce`     | `elastic.out(1, 0.5)` |
| `splitText`  | `power4.out`          |
| `parallax`   | `none`                |
| `slide` | `power2.inOut` |

### Duration Map (seconds)

| Key        | Value |
|------------|-------|
| `instant`  | 0.1   |
| `fast`     | 0.2   |
| `normal`   | 0.4   |
| `moderate` | 0.6   |
| `slow`     | 0.9   |
| `slower`   | 1.2   |
| `slowest`  | 1.8   |

### Stagger Map (seconds)

| Key        | Value |
|------------|-------|
| `tight`    | 0.04  |
| `normal`   | 0.08  |
| `moderate` | 0.12  |
| `relaxed`  | 0.18  |
| `slow`     | 0.25  |

### ScrollTrigger Defaults

| Key          | Config                        |
|--------------|-------------------------------|
| `default`    | start `"top 88%"`             |
| `eager`      | start `"top 95%"`             |
| `scrub`      | scrub `1.2`                   |
| `scrubPanel` | scrub `1.8`                   |
| `pin`        | pinned section                |

### Animation Presets

The `fromPresets` export in `animations.config.ts` still ships
these starting-state objects so any component that writes its own
`gsap.from(...)` call has consistent entrance values. There is no
global observer wired to them — they're opt-in per component.

| Preset        | Description                                         |
|---------------|-----------------------------------------------------|
| `fadeUp`      | Opacity 0 + y 40 — standard entrance                |
| `fadeUpSubtle`| Opacity 0 + y 20 — quieter entrance                 |
| `fadeIn`      | Opacity only                                        |
| `fadeDown`    | Opacity 0 + y -30                                   |
| `slideLeft`   | Opacity 0 + x -60                                   |
| `slideRight`  | Opacity 0 + x 60                                    |
| `scaleReveal` | Opacity 0 + scale 0.94                              |
| `clipReveal`  | `clip-path: inset(0 100% 0 0)` → right-to-left wipe |
| `splitLine`   | Opacity 0 + y 110% — for manual SplitText lines     |
| `splitWord`   | Opacity 0 + y 30 — for manual SplitText words       |
| `splitChar`   | Opacity 0 + y 20 + rotateX 20 — manual chars        |

The `splitLine` / `splitWord` / `splitChar` presets are useful if
you import GSAP's SplitText plugin in a one-off component, but
there is no global SplitText observer — see the warning below.

---

## Global Animations (initialised once at app level)
- Lenis smooth scroll
- GSAP ScrollTrigger integration with Lenis
- `ParallaxObserver` — scrub parallax on any `[data-parallax="trigger"]`
- `ImageRevealObserver` — fades an overlay off any `[data-image-reveal]` when its top crosses the viewport centre
- `CharHoverObserver` — splits `[data-char-hover]` text into character spans for the global link/button slide-up hover
- `HoverCursor` — pink cursor chip that appears with custom text on any `[data-cursor-label="…"]`
- `NavThemeObserver` — swaps nav `data-theme` to match the section in view

There is currently NO global split-text, fade-up, or line-reveal
system. Those were intentionally removed — do not reintroduce
them without explicit instruction.

---

## Data Attribute Conventions

| Attribute                              | Behaviour                                                  |
|----------------------------------------|------------------------------------------------------------|
| `data-image-reveal`                    | Pink (theme-aware) overlay that fades off on viewport-centre crossing |
| `data-image-reveal-delay="0.2"`        | Optional per-element delay in seconds                      |
| `data-parallax="trigger"`              | REQUIRED to register an element with `ParallaxObserver`   |
| `data-parallax="target"`               | Child of a trigger — animated instead of the trigger itself |
| `data-parallax-direction`              | `vertical` (default) or `horizontal`                       |
| `data-parallax-start` / `-end`         | Start/end in %. Defaults `20` / `-20`                      |
| `data-parallax-scroll-start` / `-end`  | ScrollTrigger positions, wrapped in `clamp()`. Defaults `top bottom` / `bottom top` |
| `data-parallax-scrub`                  | `true` (default, Lenis-friendly) or seconds of lag         |
| `data-parallax-disable`                | `mobile` · `mobileLandscape` · `tablet` (matchMedia)       |
| `data-char-hover=""`                   | Splits text into character spans for slide-up hover         |
| `data-char-hover-trigger`              | Designates the hover target when it isn't the nearest `a` / `button` |
| `data-cursor-label="Play"`             | Shows the global pink HoverCursor chip with this text on hover |
| `data-lenis-prevent`                   | Prevents Lenis smooth scroll inside element                |
| `data-nav-theme="dark\|light\|[name]"` | Nav theme to apply when section is in view                 |
| `data-theme="[name]"`                  | Applies a semantic theme scope to a section                |
| `data-overlay="dark\|medium\|light"`   | Tinted overlay utility (not an animation)                  |
