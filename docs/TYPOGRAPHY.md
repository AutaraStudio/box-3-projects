# Typography System

## Fonts

| Role      | Font                    | Use cases                           |
|-----------|-------------------------|-------------------------------------|
| Primary   | Neue Montreal           | Headings, display text, UI elements |
| Secondary | Instrument Sans Variable| Body copy, captions, labels         |

- Neue Montreal loaded via individual @font-face declarations per weight (300, 400, 400 italic, 500, 700)
- NOT a variable font — weight axis is not available
- Instrument Sans loaded as a variable font via `@font-face` in `globals.css`
- `font-display: block` on both — no flash of unstyled text
- Font files live in `/public/fonts/`

## Scaling

- All font sizes defined in **rem**
- Never use `clamp()` or `vw` for font sizes
- The Osmo fluid scaling system (`--size-font` on body) handles all responsive scaling automatically
- At the 1440px design width, **1rem = 16px**
- All rem values scale proportionally across breakpoints via the body `font-size`

## Font Families

| Token              | Value                                    |
|--------------------|------------------------------------------|
| `--font-primary`   | `'Neue Montreal', Arial, sans-serif`     |
| `--font-secondary` | `'Instrument Sans', Arial, sans-serif`   |

Tailwind classes: `font-primary`, `font-secondary`

## Font Weights

| Token                     | Value | Tailwind class    |
|---------------------------|-------|-------------------|
| `--font-weight-light`     | 300   | `font-light`      |
| `--font-weight-regular`   | 400   | `font-regular`    |
| `--font-weight-medium`    | 500   | `font-medium`     |
| `--font-weight-semibold`  | 600   | `font-semibold`   |
| `--font-weight-bold`      | 700   | `font-bold`       |

## Font Size Scale

Display is unchanged at 144px; h1–h6 tightened in the refinement
pass so mid-scale headings read as measured rather than billboard.

| Token                    | rem      | px at 1440 | Tailwind class   |
|--------------------------|----------|------------|------------------|
| `--font-size-display`    | 9rem     | 144px      | `text-display`   |
| `--font-size-h1`         | 5.5rem   | 88px       | `text-h1`        |
| `--font-size-h2`         | 4rem     | 64px       | `text-h2`        |
| `--font-size-h3`         | 2.75rem  | 44px       | `text-h3`        |
| `--font-size-h4`         | 2rem     | 32px       | `text-h4`        |
| `--font-size-h5`         | 1.5rem   | 24px       | `text-h5`        |
| `--font-size-h6`         | 1.125rem | 18px       | `text-h6`        |
| `--font-size-text-lg`    | 1.5rem   | 24px       | `text-text-lg`   |
| `--font-size-text-lede`  | 1.25rem  | 20px       | `text-text-lede` |
| `--font-size-text-md`    | 1rem     | 16px       | `text-text-md`   |
| `--font-size-text-sm`    | 0.875rem | 14px       | `text-text-sm`   |
| `--font-size-text-xs`    | 0.75rem  | 12px       | `text-text-xs`   |
| `--font-size-text-xxs`   | 0.625rem | 10px       | `text-text-xxs`  |

## Line Heights

| Token                    | Value | Tailwind class    |
|--------------------------|-------|-------------------|
| `--line-height-none`     | 1     | `leading-none`    |
| `--line-height-tight`    | 1.05  | `leading-tight`   |
| `--line-height-snug`     | 1.15  | `leading-snug`    |
| `--line-height-normal`   | 1.25  | `leading-normal`  |
| `--line-height-relaxed`  | 1.55  | `leading-relaxed` |
| `--line-height-loose`    | 1.75  | `leading-loose`   |

## Letter Spacing

| Token                        | Value    | Tailwind class      |
|------------------------------|----------|---------------------|
| `--letter-spacing-display`   | -0.04em  | `tracking-display`  | Display text                |
| `--letter-spacing-tight`     | -0.03em  | `tracking-tight`    | h1, h2                      |
| `--letter-spacing-snug`      | -0.02em  | `tracking-snug`     | h3, h4                      |
| `--letter-spacing-normal`    |  0em     | `tracking-normal`   | body, h5, h6                |
| `--letter-spacing-caps`      |  0.06em  | `tracking-caps`     | All uppercase small text    |
| `--letter-spacing-wide`      |  0.08em  | `tracking-wide`     | Labels, tags                |
| `--letter-spacing-wider`     |  0.12em  | `tracking-wider`    | Very spaced caps            |

## Border Radius

Refined scale — barely-there softening, never obvious rounding.

| Token            | Value    | px at 1440 | Tailwind class |
|------------------|----------|------------|----------------|
| `--radius-sm`    | 0.25rem  | 4px        | `rounded-sm`   |
| `--radius-md`    | 0.5rem   | 8px        | `rounded-md`   |
| `--radius-full`  | 100vw    | —          | `rounded-full` |

## Border Width

| Token            | Value    | Tailwind class |
|------------------|----------|----------------|
| `--border-width` | 0.08rem  | `border-main`  |

## Global Base Styles

These are applied directly to semantic HTML elements in `globals.css`:

- **body** — `font-secondary`, regular weight, relaxed line height, theme text colour
- **h1–h6** — `font-primary`, **medium** (500) weight, tight/snug/normal line height by tier, tight/snug/normal letter spacing by tier, each heading maps to its `--font-size-*` token
- **p** — `font-secondary`, text-md size, relaxed line height
- **.text-display** — `font-primary`, display size, medium weight, tight line height, display letter spacing

Headings default to **medium (500)** weight — never bold. `--font-weight-bold` (700) is reserved for rare emphasis within running text.

## Usage Rules

1. Headings always use `--font-primary` (Neue Montreal)
2. Body copy always uses `--font-secondary` (Instrument Sans)
3. All values reference CSS tokens — never hardcode font values in components
4. All sizing in rem — never use px for typography
5. Never use `clamp()` on font sizes — Osmo handles all fluid scaling
6. Use Tailwind utility classes (`font-primary`, `text-h2`, `font-bold`, `leading-tight`, `tracking-tight`) in components — they all reference the same CSS tokens

## Site Typography Hierarchy

These rules define exactly which token to use in each context.
Follow them without exception across every component.

| Context                          | Token             | Size     |
|----------------------------------|-------------------|----------|
| Hero display heading             | `text-display`    | 9rem     |
| Page primary heading             | `text-h1`         | 5.5rem   |
| Page secondary heading           | `text-h2`         | 4rem     |
| Section heading                  | `text-h3`         | 2.75rem  |
| Card / feature heading           | `text-h4`         | 2rem     |
| Sub-heading / list title         | `text-h5`         | 1.5rem   |
| Small heading / label heading    | `text-h6`         | 1.125rem |
| Mega menu primary links          | `text-h5`         | 1.5rem   |
| Mega menu secondary links        | `text-text-md`    | 1rem     |
| Mega menu contact links          | `text-text-md`    | 1rem     |
| Body copy / paragraphs           | `text-text-md`    | 1rem     |
| Large body / intro copy          | `text-text-lg`    | 1.5rem   |
| Stat values / callout numbers    | `text-text-lede`  | 1.25rem  |
| Nav links / footer links / UI    | `text-text-sm`    | 0.875rem |
| Section labels / tags / captions | `text-text-xs`    | 0.75rem  |
| Micro labels / legal text        | `text-text-xxs`   | 0.625rem |

### Rules
- Never use a heading token (h1–h6) on body copy or UI elements
- Never use body tokens (text-md, text-sm) on section headings
- All uppercase text must also have tracking-caps (0.06em)
- Nav links, footer links, and all UI labels use text-text-sm
- Section labels (COMPANY, STAY IN TOUCH) use text-text-xs + tracking-caps
- Mega menu primary links use text-h5 — never larger
- text-display is reserved for the hero only
- text-text-lg is reserved for intro/lead paragraphs and taglines

## Typography Rules

- Display and h1/h2: tight tracking (-0.03 to -0.04em), tight leading (1.05)
- h3/h4: snug tracking (-0.02em), snug leading (1.15)
- h5/h6: normal tracking (0em), normal leading (1.25)
- All uppercase small text: use tracking-caps (0.06em) — nav, footer, labels
- Body copy: font-secondary, text-md, leading-relaxed, text-wrap: pretty
- Phone numbers and prices: add u-nums class for tabular figures
- Headings: text-wrap: balance applied globally via CSS
- Never mix font-primary on body or font-secondary on headings
