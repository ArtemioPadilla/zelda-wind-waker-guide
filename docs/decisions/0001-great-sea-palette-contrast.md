# 0001 — Adopt the Great Sea OKLCH palette, verified for WCAG AA contrast

## Status

`Accepted`

Date: 2026-08-26

## Context

The sibling RE4 guide uses a warm amber/leather palette (hue ~55-80) tied to
that game's Merchant/ledger motif. This project needs its own distinct visual
identity evocative of *The Wind Waker*'s cel-shaded ocean/sky/sail art
direction, not a reskin of RE4's palette — and every themed text/surface pair
must clear WCAG AA (4.5:1 for normal text, 3:1 for large text / UI) in both
light and dark mode, verified computationally rather than eyeballed.

There is no `culori`/contrast-checker dependency in this lean scaffold (and
none is worth adding just for a one-time palette check), so the ratios below
were computed with a standalone ~40-line Node script implementing Björn
Ottosson's OKLab reference conversion (OKLCH → OKLab → linear sRGB → gamma
sRGB) and the standard WCAG relative-luminance/contrast formulas.

## Decision

Adopt a cool-hued palette keyed on two hue families instead of RE4's single
warm-amber family:

- **Neutrals** (background/foreground/card/border/muted): hue ~200-250,
  "open water under a big sky" — pale sky-blue-cream in light mode, deep
  night-ocean navy-teal in dark mode.
- **Brand accent** (`--primary`): Triforce gold, hue ~88-92.
- **Semantic accents**: `--destructive` stays a warm red (Ganon) at hue ~25;
  `--pill-shop` is a deep sea-teal (hue ~220, Beedle's boat); `--pill-item`
  is a heart-green (hue ~130-140), a different hue family from gold so a
  Triforce-chart pill and a Heart-piece pill never read as the same color.

Light-mode `--primary` lightness is held at `oklch(0.5 0.16 88)` rather than a
more saturated-looking `0.55` — `0.55` measured 4.22:1 against
`--background` (fails AA-normal); `0.50` measures 5.22:1.

Verified pairs (light / dark), via the script above:

| Pair | Light | Dark |
|---|---|---|
| foreground / background | 14.30:1 | 15.41:1 |
| muted-foreground / background | 6.42:1 | 6.80:1 |
| primary (as text) / background | 5.22:1 | 10.33:1 |
| primary-foreground / primary | 5.83:1 | 9.68:1 |
| destructive (as text) / background | 5.80:1 | 5.68:1 |
| destructive-foreground / destructive | 6.48:1 | 5.84:1 |
| foreground / card | 16.01:1 | 14.17:1 |
| foreground / secondary | 12.30:1 | 11.90:1 |
| accent-foreground / accent | 9.51:1 | 10.15:1 |
| pill-shop / background | 6.90:1 | 8.65:1 |
| pill-item / background | 7.00:1 | 9.08:1 |

Every pair clears 4.5:1 (AA-normal) with margin.

Typography moved off RE4's Cinzel/Alegreya/Special Elite trio (carved-serif
"merchant's ledger") to Fredoka Variable (rounded display), Quicksand
Variable (rounded body), and Space Mono (nautical-chart labels) — a toon/
cel-shaded family matching Wind Waker's own title card and HUD, rather than
a "generic fantasy serif" treatment.

## Consequences

**Positive** — a palette and type system genuinely evocative of this game,
computationally verified for accessibility, easy to re-derive (the script is
disposable and the table above is the durable record).

**Negative** — the verification script isn't checked in as project tooling
(it was a one-off `/tmp` script); if the palette changes again, the ratios
need re-deriving by hand or the script needs recreating.

**Neutral** — chart-\*/sidebar-\* shadcn-scaffold tokens (present but unused
dead weight in the RE4 reference repo) were dropped entirely rather than
carried forward, since nothing in this codebase renders a sidebar or a chart.

## Supersedes

None.

## References

- `src/styles/global.css` — the tokens themselves
- Björn Ottosson, ["A perceptual color space for image processing"](https://bottosson.github.io/posts/oklab/) — the OKLab math the verification script implements
