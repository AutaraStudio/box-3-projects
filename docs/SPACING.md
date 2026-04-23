# Spacing System

## Philosophy

- All spacing values in **rem** — never px
- The Osmo fluid scaling system (`--size-font` on html + body) handles all responsive scaling automatically
- Never use `clamp()` or `vw` for spacing values
- One consistent scale used across the entire site — no arbitrary values
- Section spacing is separate from component spacing for clarity
- At the 1440px design width, **1rem = 16px**

## Base Scale

General-purpose spacing for margins, padding, and layout within components.
The mid-to-large rungs (4–12) were intentionally tightened ~20–30% from the original scale so the site reads as more refined and compact. Steps 1–3 were left untouched — the micro rungs already read correctly.

| Token        | rem     | px at 1440 | Tailwind class    |
|--------------|---------|------------|-------------------|
| `--space-1`  | 0.5rem  | 8px        | `p-space-1`, etc. |
| `--space-2`  | 0.75rem | 12px       | `p-space-2`, etc. |
| `--space-3`  | 1rem    | 16px       | `p-space-3`, etc. |
| `--space-4`  | 1.25rem | 20px       | `p-space-4`, etc. |
| `--space-5`  | 1.5rem  | 24px       | `p-space-5`, etc. |
| `--space-6`  | 2rem    | 32px       | `p-space-6`, etc. |
| `--space-7`  | 2.5rem  | 40px       | `p-space-7`, etc. |
| `--space-8`  | 3rem    | 48px       | `p-space-8`, etc. |
| `--space-9`  | 4rem    | 64px       | `p-space-9`, etc. |
| `--space-10` | 5rem    | 80px       | `p-space-10`, etc.|
| `--space-11` | 5.5rem  | 88px       | `p-space-11`, etc.|
| `--space-12` | 6.5rem  | 104px      | `p-space-12`, etc.|

Works with all Tailwind spacing utilities: `p-`, `m-`, `px-`, `py-`, `mt-`, `mb-`, `ml-`, `mr-`, etc.

## Section Spacing

Vertical padding for page sections. Tightened again in the refinement pass — `md` is now the **default** and every non-hero section should use it unless there's a documented reason to differ.

| Token                   | rem    | px at 1440 | Tailwind class    | When to use                                        |
|-------------------------|--------|------------|-------------------|----------------------------------------------------|
| `--section-space-none`  | 0rem   | 0px        | `py-section-none` | Removing spacing entirely                          |
| `--section-space-xs`    | 2rem   | 32px       | `py-section-xs`   | Tight sections, small gaps between related content |
| `--section-space-sm`    | 3rem   | 48px       | `py-section-sm`   | Standard tight section padding                     |
| `--section-space-md`    | 4.5rem | 72px       | `py-section-md`   | **Default section padding — use this**             |
| `--section-space-lg`    | 6rem   | 96px       | `py-section-lg`   | Spacious sections, feature areas                   |
| `--section-space-xl`    | 8rem   | 128px      | `py-section-xl`   | Page top padding (hero base)                       |

## Nav Clearance

Page-top heroes add `--nav-clearance` on top of `--section-space-xl` so the headline sits below the fixed nav. Change the token and every hero shifts uniformly.

```css
.page-hero {
  padding-top: calc(var(--section-space-xl) + var(--nav-clearance));
}
```

| Token             | rem  | px at 1440 |
|-------------------|------|------------|
| `--nav-clearance` | 6rem | 96px       |

## Gap Scale

For grid column gaps, flex gaps, and layout spacing between sibling elements. Mirrors the base scale 1–12 end-to-end — no gaps needed, no dropping into `--space-*` for large layouts.

| Token      | rem     | px at 1440 | Tailwind class    |
|------------|---------|------------|-------------------|
| `--gap-1`  | 0.5rem  | 8px        | `gap-gap-1`, etc. |
| `--gap-2`  | 0.75rem | 12px       | `gap-gap-2`, etc. |
| `--gap-3`  | 1rem    | 16px       | `gap-gap-3`, etc. |
| `--gap-4`  | 1.25rem | 20px       | `gap-gap-4`, etc. |
| `--gap-5`  | 1.5rem  | 24px       | `gap-gap-5`, etc. |
| `--gap-6`  | 2rem    | 32px       | `gap-gap-6`, etc. |
| `--gap-7`  | 2.5rem  | 40px       | `gap-gap-7`, etc. |
| `--gap-8`  | 3rem    | 48px       | `gap-gap-8`, etc. |
| `--gap-9`  | 4rem    | 64px       | `gap-gap-9`, etc. |
| `--gap-10` | 5rem    | 80px       | `gap-gap-10`, etc.|
| `--gap-11` | 5.5rem  | 88px       | `gap-gap-11`, etc.|
| `--gap-12` | 6.5rem  | 104px      | `gap-gap-12`, etc.|

Works with `gap-`, `gap-x-`, and `gap-y-` Tailwind utilities.

## Measure (content max-width)

Three canonical content widths for prose and headings. Replaces the scatter of 38rem / 40.625rem / 45rem / 55rem previously inlined across components. Pick based on the text's role, not its visual length.

| Token             | rem    | px at 1440 | When to use                                  |
|-------------------|--------|------------|----------------------------------------------|
| `--measure-tight` | 38rem  | 608px      | Short headlines, dense text, card titles     |
| `--measure-base`  | 45rem  | 720px      | Body paragraphs, standard prose              |
| `--measure-wide`  | 55rem  | 880px      | Long intros, gallery titles, hero copy       |

## Icon Size Scale

Canonical sizes for inline SVG / icon fixtures. Use these for every new icon. Odd-pixel legacy logo / arrow dimensions may stay as hardcoded rem with a comment — do not snap an asset whose pixel dimensions matter to a token.

| Token             | rem     | px at 1440 | When to use                            |
|-------------------|---------|------------|----------------------------------------|
| `--size-icon-xs`  | 1rem    | 16px       | Inline icons in body text              |
| `--size-icon-sm`  | 1.25rem | 20px       | Accordion toggles, chip icons          |
| `--size-icon-md`  | 1.5rem  | 24px       | Button / form icons (default)          |
| `--size-icon-lg`  | 2rem    | 32px       | Section labels, tooltip anchors        |
| `--size-icon-xl`  | 2.75rem | 44px       | Large decorative or primary action icons|

## Container Padding

| Token                | Desktop | Mobile Portrait |
|----------------------|---------|-----------------|
| `--container-padding`| 2rem    | 1rem            |

Horizontal padding applied to all `.container` elements. Automatically reduces to 1rem on mobile portrait (max-width: 479px).

## Usage Rules

1. **Always use a token** — never hardcode a spacing value in components
2. **Section padding** defaults to `--section-space-md` (`py-section-md`). Deviations must be documented.
3. **Page-top heroes** use `calc(var(--section-space-xl) + var(--nav-clearance))`.
4. **Component internal spacing** uses `--space-*` tokens (`p-space-4`, `mb-space-2`, etc.)
5. **Grid and flex gaps** use `--gap-*` tokens (`gap-gap-4`, `gap-x-gap-6`, etc.)
6. **Prose max-widths** use `--measure-*` tokens — no inline rem values.
7. **Icons** use `--size-icon-*` tokens unless the asset has fixed pixel dimensions that must be preserved (comment inline when making an exception).
8. **Prefer symmetric block padding** — `padding-block: var(--space-N)` unless asymmetry is intentional and documented.
9. All rem values **scale automatically** with the Osmo system across breakpoints
10. No `clamp()` or `vw` — Osmo handles all fluid behaviour

## Conversion Reference

To convert any Figma px value to a rem token:

```
rem = px / 16
```

| Figma px | rem     | Nearest token                                   |
|----------|---------|-------------------------------------------------|
| 8px      | 0.5rem  | `--space-1` / `--gap-1`                         |
| 12px     | 0.75rem | `--space-2` / `--gap-2`                         |
| 16px     | 1rem    | `--space-3` / `--gap-3` / `--size-icon-xs`      |
| 20px     | 1.25rem | `--space-4` / `--gap-4` / `--size-icon-sm`      |
| 24px     | 1.5rem  | `--space-5` / `--gap-5` / `--size-icon-md`      |
| 32px     | 2rem    | `--space-6` / `--gap-6` / `--section-space-xs` / `--size-icon-lg` |
| 40px     | 2.5rem  | `--space-7` / `--gap-7`                         |
| 44px     | 2.75rem | `--size-icon-xl`                                |
| 48px     | 3rem    | `--space-8` / `--gap-8` / `--section-space-sm`  |
| 64px     | 4rem    | `--space-9` / `--gap-9`                         |
| 72px     | 4.5rem  | `--section-space-md` (default)                  |
| 80px     | 5rem    | `--space-10` / `--gap-10`                       |
| 88px     | 5.5rem  | `--space-11` / `--gap-11`                       |
| 96px     | 6rem    | `--section-space-lg` / `--nav-clearance`        |
| 104px    | 6.5rem  | `--space-12` / `--gap-12`                       |
| 128px    | 8rem    | `--section-space-xl`                            |
