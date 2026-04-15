# Color System

## Philosophy
- Zero hardcoded color values anywhere in the codebase
- Two-layer system: Primitive Palette → Semantic Tokens
- Components only ever reference semantic tokens (--theme-*)
- Primitive palette (--color-*) is never referenced in components directly

## Layer 1 — Primitive Palette
Prefix: `--color-`
Scales 100–900 for each color family.

| Family   | Notes                                          |
|----------|------------------------------------------------|
| Pink     | Brand primary — pink-500 is `#fdcdcd`          |
| White    |                                                |
| Cream    |                                                |
| Charcoal | Base text color                                |
| Grey     |                                                |
| Black    |                                                |
| Brown    |                                                |
| Rose     |                                                |
| Dusty    |                                                |
| Mauve    |                                                |
| Sage     | Warm muted green — feminine and organic        |
| Sand     | Warm tan — earthy and grounding                |

## Layer 2 — Semantic Tokens
Prefix: `--theme-`
Applied via `data-theme="[name]"` on the outer section wrapper only.
Never applied to individual child elements.

### Token Categories

#### Backgrounds
- `--theme-bg`
- `--theme-bg-2`
- `--theme-bg-3`
- `--theme-bg-4`
- `--theme-bg-card`
- `--theme-bg-card-hover`

#### Text
- `--theme-text`
- `--theme-text-muted`
- `--theme-text-subtle`
- `--theme-text-inverse`
- `--theme-text-accent`

#### Borders
- `--theme-border`
- `--theme-border-strong`
- `--theme-border-subtle`

#### Accent
- `--theme-accent`
- `--theme-accent-hover`
- `--theme-accent-subtle`

#### SVG
- `--theme-svg`
- `--theme-svg-hover`
- `--theme-svg-muted`

#### Selection
- `--theme-selection-bg`
- `--theme-selection-text`

#### Tags
- `--theme-tag-bg`
- `--theme-tag-border`
- `--theme-tag-text`

#### Button — Primary
- `--theme-btn-primary-text`
- `--theme-btn-primary-bg`
- `--theme-btn-primary-border`
- `--theme-btn-primary-text-hover`
- `--theme-btn-primary-bg-hover`
- `--theme-btn-primary-border-hover`

#### Button — Secondary
- `--theme-btn-secondary-text`
- `--theme-btn-secondary-bg`
- `--theme-btn-secondary-border`
- `--theme-btn-secondary-text-hover`
- `--theme-btn-secondary-bg-hover`
- `--theme-btn-secondary-border-hover`

#### Links
- `--theme-link-text`
- `--theme-link-border`
- `--theme-link-text-hover`
- `--theme-link-border-hover`

#### Inputs
- `--theme-input-bg`
- `--theme-input-border`
- `--theme-input-border-focus`
- `--theme-input-text`
- `--theme-input-placeholder`

#### Misc
- `--theme-overlay`
- `--theme-shadow`
- `--theme-focus`
- `--theme-dither-ink`
- `--theme-dither-bg`

#### Nav
- `--theme-nav-bg`
- `--theme-nav-text`
- `--theme-nav-border`
- `--theme-nav-accent`
- `--theme-nav-icon-bg`
- `--theme-nav-icon-text`

#### Partner Cards
- `--theme-partner-card-bg`
- `--theme-partner-card-svg`
- `--theme-partner-card-svg-hover`

#### Extended Palette
- `--theme-bg-card-2` — second card background variant
- `--theme-bg-surface` — raised surface / panel tone
- `--theme-accent-2` — second accent for visual variety
- `--theme-accent-3` — tertiary accent, subtle tint
- `--theme-text-on-accent` — text colour on accent backgrounds
- `--theme-border-accent` — accent-coloured border
- `--theme-svg-accent` — secondary SVG colour
- `--theme-highlight` — wash colour for hovers and selections
- `--theme-highlight-text` — text colour when on highlight

### Available Themes

| Theme  | Base          | Character                          |
|--------|---------------|------------------------------------|
| light  | Warm white    | Default — clean and open           |
| dark   | Deep charcoal | Charcoal base, pink as hero colour |
| brand  | Blush pink    | Brand-forward, feminine            |
| cream  | Warm cream    | Soft and editorial                 |
| rose   | Muted rose    | Intimate and warm                  |
| mauve  | Mauve         | Gentle contrast                    |
| sage   | Soft sage     | Fresh and organic                  |
| sand   | Warm sand     | Earthy and calm                    |

## color-mix() Usage
Used for transparent variants — borders, overlays, muted SVGs.

```css
/* Correct */
color-mix(in srgb, var(--color-grey-200) 50%, transparent)

/* Never */
rgba(0, 0, 0, 0.1)
```

Never use `rgba()` with hardcoded values.

## Brand Colors
- Primary brand: `pink-500` (`#fdcdcd`) — used in logo, never change
- Dark accent: `rose-500` (`#8b4f4d`)
- Text base: `charcoal-500` (`#2c2524`)
