# Typography System

## Fonts

| Role      | Font                    | Use cases                          |
|-----------|-------------------------|------------------------------------|
| Primary   | Satoshi Variable        | Headings, display text, UI elements|
| Secondary | Instrument Sans Variable| Body copy, captions, labels        |

- Both loaded as variable fonts via `@font-face` in `globals.css`
- `font-display: block` on both — no flash of unstyled text
- Weight axis: 300–900 (light through bold)
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
| `--font-primary`   | `'Satoshi', Arial, sans-serif`           |
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

| Token                    | rem     | px at 1440 | Tailwind class  |
|--------------------------|---------|------------|-----------------|
| `--font-size-display`    | 10rem   | 160px      | `text-display`  |
| `--font-size-h1`         | 8rem    | 128px      | `text-h1`       |
| `--font-size-h2`         | 6rem    | 96px       | `text-h2`       |
| `--font-size-h3`         | 4.5rem  | 72px       | `text-h3`       |
| `--font-size-h4`         | 3.75rem | 60px       | `text-h4`       |
| `--font-size-h5`         | 3rem    | 48px       | `text-h5`       |
| `--font-size-h6`         | 2.25rem | 36px       | `text-h6`       |
| `--font-size-text-lg`    | 1.875rem| 30px       | `text-text-lg`  |
| `--font-size-text-md`    | 1.125rem| 18px       | `text-text-md`  |
| `--font-size-text-sm`    | 1rem    | 16px       | `text-text-sm`  |
| `--font-size-text-xs`    | 0.875rem| 14px       | `text-text-xs`  |
| `--font-size-text-xxs`   | 0.75rem | 12px       | `text-text-xxs` |

## Line Heights

| Token                    | Value | Tailwind class    |
|--------------------------|-------|-------------------|
| `--line-height-none`     | 1     | `leading-none`    |
| `--line-height-tight`    | 1.05  | `leading-tight`   |
| `--line-height-snug`     | 1.15  | `leading-snug`    |
| `--line-height-normal`   | 1.3   | `leading-normal`  |
| `--line-height-relaxed`  | 1.55  | `leading-relaxed` |
| `--line-height-loose`    | 1.75  | `leading-loose`   |

## Letter Spacing

| Token                        | Value    | Tailwind class      |
|------------------------------|----------|---------------------|
| `--letter-spacing-display`   | -0.04em  | `tracking-display`  |
| `--letter-spacing-tight`     | -0.03em  | `tracking-tight`    |
| `--letter-spacing-snug`      | -0.015em | `tracking-snug`     |
| `--letter-spacing-normal`    | 0em      | `tracking-normal`   |
| `--letter-spacing-wide`      | 0.04em   | `tracking-wide`     |
| `--letter-spacing-wider`     | 0.08em   | `tracking-wider`    |

## Border Radius

| Token            | Value  | Tailwind class |
|------------------|--------|----------------|
| `--radius-sm`    | 0.5rem | `rounded-sm`   |
| `--radius-md`    | 1rem   | `rounded-md`   |
| `--radius-full`  | 100vw  | `rounded-full` |

## Border Width

| Token            | Value    | Tailwind class |
|------------------|----------|----------------|
| `--border-width` | 0.08rem  | `border-main`  |

## Global Base Styles

These are applied directly to semantic HTML elements in `globals.css`:

- **body** — `font-secondary`, regular weight, relaxed line height, theme text colour
- **h1–h6** — `font-primary`, bold weight, tight line height, tight letter spacing, each heading maps to its `--font-size-*` token
- **p** — `font-secondary`, text-md size, relaxed line height
- **.text-display** — `font-primary`, display size, bold, no line height, display letter spacing

## Usage Rules

1. Headings always use `--font-primary` (Satoshi)
2. Body copy always uses `--font-secondary` (Instrument Sans)
3. All values reference CSS tokens — never hardcode font values in components
4. All sizing in rem — never use px for typography
5. Never use `clamp()` on font sizes — Osmo handles all fluid scaling
6. Font weight transitions are supported via the variable font axis
7. Use Tailwind utility classes (`font-primary`, `text-h2`, `font-bold`, `leading-tight`, `tracking-tight`) in components — they all reference the same CSS tokens
