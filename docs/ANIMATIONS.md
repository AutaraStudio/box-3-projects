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
For: scroll reveals, timelines, SplitText, parallax, page transitions
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

| Preset        | Description                    |
|---------------|--------------------------------|
| `fadeUp`      | Fade in from below             |
| `fadeUpSubtle`| Soft fade up, minimal distance |
| `fadeIn`      | Opacity only                   |
| `fadeDown`    | Fade in from above             |
| `slideLeft`   | Slide in from right            |
| `slideRight`  | Slide in from left             |
| `scaleReveal` | Scale up from slightly smaller |
| `clipReveal`  | Clip-path wipe reveal          |
| `splitLine`   | SplitText — per line           |
| `splitWord`   | SplitText — per word           |
| `splitChar`   | SplitText — per character      |

---

## Global Animations (initialised once at app level)
- Lenis smooth scroll
- GSAP ScrollTrigger integration with Lenis
- SplitText global `data-*` attribute observer
- Scroll-triggered fade/reveal observer

---

## Data Attribute Conventions

| Attribute                              | Behaviour                                        |
|----------------------------------------|--------------------------------------------------|
| `data-animate="fade-up"`               | Fade in from below on scroll                     |
| `data-animate="fade-in"`              | Opacity only reveal on scroll                    |
| `data-animate="fade-down"`            | Fade in from above on scroll                     |
| `data-animate="clip-reveal"`          | Clip-path wipe reveal on scroll                  |
| `data-animate="scale-reveal"`         | Scale up from slightly smaller on scroll         |
| `data-animate-delay="0.2"`            | Optional delay in seconds                        |
| `data-animate-stagger="0.1"`          | On parent — staggers direct children             |
| `data-split-text="lines"`             | SplitText — animate by line on scroll            |
| `data-split-text="words"`             | SplitText — animate by word on scroll            |
| `data-split-text="chars"`             | SplitText — animate by character on scroll       |
| `data-split-delay="0.2"`             | Optional delay on split-text elements            |
| `data-line-reveal-hero="top\|bottom"` | Line scaleY reveal on page load                  |
| `data-line-reveal="top\|bottom"`      | Line scaleY reveal on scroll                     |
| `data-line-duration="0.8"`            | Per-element duration override                    |
| `data-line-delay="0.2"`              | Per-element delay override                       |
| `data-hero-scroll-fade`               | Fades out as hero scrolls away (scrub)           |
| `data-hero-scroll-fade-scale`         | Fades and scales down on hero scroll (scrub)     |
| `data-char-hover=""`                  | Splits text into spans for char slide-up hover   |
| `data-char-hover-trigger`             | Designates a hover trigger for char animation    |
| `data-parallax="[speed]"`             | Parallax — speed is a float multiplier           |
| `data-lenis-prevent`                  | Prevents Lenis smooth scroll inside element      |
| `data-nav-theme="dark\|light\|[name]"`| Nav theme to apply when section is in view       |
