# Contributing to WW Guía

This is a small fan-made companion guide for *The Legend of Zelda: The Wind
Waker HD*, not a formal project — no CLA, no heavy process. Corrections and
small improvements are welcome; please open an issue first for anything
bigger than a content fix or bug so we don't cross wires on scope.

## Running it locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run check    # astro check + tsc --noEmit + vitest + production build
```

Node 22+ (see `.nvmrc`). `npm run check` is the same gate CI runs — run it
before opening a PR.

## Content structure

All game data lives in `src/content/`, split by locale: `src/content/es/`
(Spanish, the source language) and `src/content/en/` (English), as mirrored
files — e.g. `heart-pieces.json` exists in both, and `islands/1-1.md` in
`es` has a matching `islands/1-1.md` in `en`. Collections are declared via
the `localizedJson()` factory in `src/content.config.ts`, which wires up the
`_es`/`_en` pair and Zod schema for each entity in one place.

Locales must stay structurally in sync: every entry needs a matching `id` in
both files, **in the same order** — `src/content/shape.test.ts` (run by
`npm test` / `npm run check`) asserts this, so a locale drift fails CI, not
just a visual review.

## Reporting a content correction

The fastest way is the **"Report an issue" chat bubble** in the bottom-right
corner of the live site — it pre-fills a GitHub issue with the page context
and any console/network diagnostics captured, so you don't have to type
that part by hand. It works for content errors too, not just bugs (pick
"Translation issue" or "Bug" as the type). Opening an issue directly works
just as well — GitHub Discussions isn't enabled on this repo, so issues
are the one channel for everything, including open-ended questions.

## What a good content-correction PR looks like

- **Cite a source.** A location, item, or Heart Piece count that's wrong
  should be checked against at least one public reference (Zelda Wiki,
  Zelda Dungeon Wiki, Thonky.com, Game8, Hyrule Blog are the ones this guide
  already leans on) — link it in the PR description.
- **Match the target version.** This guide targets the Wii U/Switch **HD**
  release, not the GameCube original — e.g. Triforce Shards are found
  directly, no Tingle Tuner content. Flag it in the PR if a correction is
  HD-specific vs. applies to both.
- **Keep `es` and `en` in sync.** Update both locale files together, same
  `id`, same order. A PR touching only one locale will fail the parity test.
- **Run `npm run check` before opening the PR.** It's fast and catches
  schema/type errors, parity failures, and build breaks in one shot.
- **Never push straight to `main`** — open a PR from a branch, even for a
  one-line fix.
