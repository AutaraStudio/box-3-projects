# Spacing System

## Philosophy

- All spacing values in **rem** — never px
- The Osmo fluid scaling system (`--size-font` on body) handles all responsive scaling automatically
- Never use `clamp()` or `vw` for spacing values
- One consistent scale used across the entire site — no arbitrary values
- Section spacing is separate from component spacing for clarity
- At the 1440px design width, **1rem = 16px**

## Base Scale

General-purpose spacing for margins, padding, and layout within components.

| Token        | rem     | px at 1440 | Tailwind class     |
|--------------|---------|------------|--------------------|
| `--space-1`  | 0.5rem  | 8px        | `p-space-1`, etc.  |
| `--space-2`  | 0.75rem | 12px       | `p-space-2`, etc.  |
| `--space-3`  | 1rem    | 16px       | `p-space-3`, etc.  |
| `--space-4`  | 1.5rem  | 24px       | `p-space-4`, etc.  |
| `--space-5`  | 2rem    | 32px       | `p-space-5`, etc.  |
| `--space-6`  | 2.5rem  | 40px       | `p-space-6`, etc.  |
| `--space-7`  | 3rem    | 48px       | `p-space-7`, etc.  |
| `--space-8`  | 4rem    | 64px       | `p-space-8`, etc.  |
| `--space-9`  | 5rem    | 80px       | `p-space-9`, etc.  |
| `--space-10` | 6rem    | 96px       | `p-space-10`, etc. |
| `--space-11` | 7rem    | 112px      | `p-space-11`, etc. |
| `--space-12` | 8rem    | 128px      | `p-space-12`, etc. |

Works with all Tailwind spacing utilities: `p-`, `m-`, `px-`, `py-`, `mt-`, `mb-`, `ml-`, `mr-`, etc.

## Section Spacing

Vertical padding for page sections. Applied as `py-section-*` on section wrappers.

| Token                   | rem   | px at 1440 | Tailwind class      | When to use                                     |
|-------------------------|-------|------------|---------------------|-------------------------------------------------|
| `--section-space-none`  | 0rem  | 0px        | `py-section-none`   | Removing spacing entirely                       |
| `--section-space-xs`    | 3rem  | 48px       | `py-section-xs`     | Tight sections, small gaps between related content |
| `--section-space-sm`    | 5rem  | 80px       | `py-section-sm`     | Standard tight section padding                  |
| `--section-space-md`    | 7rem  | 112px      | `py-section-md`     | Standard section padding — most common          |
| `--section-space-lg`    | 10rem | 160px      | `py-section-lg`     | Spacious sections, feature areas                |
| `--section-space-xl`    | 14rem | 224px      | `py-section-xl`     | Page top padding (accounts for nav height)      |

## Gap Scale

For grid column gaps, flex gaps, and layout spacing between sibling elements.

| Token     | rem     | px at 1440 | Tailwind class       |
|-----------|---------|------------|----------------------|
| `--gap-1` | 0.5rem  | 8px        | `gap-gap-1`, etc.    |
| `--gap-2` | 0.75rem | 12px       | `gap-gap-2`, etc.    |
| `--gap-3` | 1rem    | 16px       | `gap-gap-3`, etc.    |
| `--gap-4` | 1.5rem  | 24px       | `gap-gap-4`, etc.    |
| `--gap-5` | 2rem    | 32px       | `gap-gap-5`, etc.    |
| `--gap-6` | 2.5rem  | 40px       | `gap-gap-6`, etc.    |
| `--gap-7` | 3rem    | 48px       | `gap-gap-7`, etc.    |
| `--gap-8` | 4rem    | 64px       | `gap-gap-8`, etc.    |

Works with `gap-`, `gap-x-`, and `gap-y-` Tailwind utilities.

## Container Padding

| Token                | Desktop | Mobile Portrait |
|----------------------|---------|-----------------|
| `--container-padding`| 2rem    | 1rem            |

Horizontal padding applied to all `.container` elements. Automatically reduces to 1rem on mobile portrait (max-width: 479px).

## Usage Rules

1. **Always use a token** — never hardcode a spacing value in components
2. **Section padding** uses `--section-space-*` tokens (`py-section-md`, etc.)
3. **Component internal spacing** uses `--space-*` tokens (`p-space-4`, `mb-space-2`, etc.)
4. **Grid and flex gaps** use `--gap-*` tokens (`gap-gap-4`, `gap-x-gap-6`, etc.)
5. All rem values **scale automatically** with the Osmo system across breakpoints
6. No `clamp()` or `vw` — Osmo handles all fluid behaviour

## Conversion Reference

To convert any Figma px value to a rem token:

```
rem = px / 16
```

| Figma px | rem     | Nearest token |
|----------|---------|---------------|
| 8px      | 0.5rem  | `--space-1`   |
| 12px     | 0.75rem | `--space-2`   |
| 16px     | 1rem    | `--space-3`   |
| 24px     | 1.5rem  | `--space-4`   |
| 32px     | 2rem    | `--space-5`   |
| 40px     | 2.5rem  | `--space-6`   |
| 48px     | 3rem    | `--space-7`   |
| 64px     | 4rem    | `--space-8`   |
| 80px     | 5rem    | `--space-9`   |
| 96px     | 6rem    | `--space-10`  |
| 112px    | 7rem    | `--space-11`  |
| 128px    | 8rem    | `--space-12`  |
