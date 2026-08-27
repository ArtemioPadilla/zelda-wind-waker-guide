import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Every content entity ships in both locales as sibling files under
// src/content/es/ and src/content/en/ (never a `locale` field per entry —
// the directory IS the locale). This factory keeps that pairing DRY.
// `schema` is typed via the same `z` re-exported by astro:content (not the
// top-level `zod` package) — Astro vendors its own zod instance, and a type
// pulled from a separate `zod` import structurally mismatches it.
function localizedJson<Schema extends z.ZodType>(name: string, schema: Schema) {
  return {
    [`${name}_es`]: defineCollection({ loader: file(`src/content/es/${name}.json`), schema }),
    [`${name}_en`]: defineCollection({ loader: file(`src/content/en/${name}.json`), schema }),
  };
}

const tipsSchema = z.object({
  title: z.string(),
  body: z.string(),
  order: z.number(),
});

const itemsSchema = z.object({
  name: z.string(),
  category: z.enum(['weapons', 'tools', 'sailing', 'upgrades']),
  location: z.string(),
  chapter: z.string().optional(),
  notes: z.string().optional(),
  essential: z.boolean().default(false),
  // Numeric before/after progression for the 3 Great-Fairy/Tingle capacity
  // upgrades (Quiver+, Bomb Bag+, Wallet+) — modeled as real numbers (not
  // left as a "30 → 60 → 99" string baked into `location`) so ItemsPage can
  // render a compact visual stage comparison instead of flat text. Optional:
  // only the 3 items with a genuine multi-stage progression set it.
  upgradeStages: z.array(z.number().nonnegative()).min(2).optional(),
  upgradeUnit: z.string().optional(),
});

// The primary completionist checklist — 44 Pieces of Heart grouped by island
// (analogous to RE4's 15 blue medallions, grouped by zone).
const heartPiecesSchema = z.object({
  number: z.number().min(1).max(44),
  island: z.string(),
  chapter: z.string(),
  location: z.string(),
  note: z.string().optional(),
  // Pin position on the Great-Sea map, as a percentage of the map's square
  // viewBox (0-100, same coordinate space for both axes — see
  // src/lib/greatSeaGrid.ts). Derived from the same 7x7 sector grid the
  // `atlas` collection already uses (island name -> atlas sector -> percent),
  // with a small deterministic jitter for islands that hold more than one
  // Piece of Heart so their pins don't fully overlap. Optional: 2 of the 44
  // entries (hp-08 "Any mailbox", hp-35 "Various islands") have no single
  // fixed location and are omitted from the map — they still appear in the
  // list view, which stays the always-available, non-map-only alternative.
  x: z.number().min(0).max(100).optional(),
  y: z.number().min(0).max(100).optional(),
});

// Discriminated by `kind`: a Triforce Chart always leads to a shard (and
// costs Tingle a flat fee to decipher); a Treasure Chart always leads to a
// sellable/keepable item. Mirrors the RE4 treasuresSchema's
// combinable/suelto split — different fields per kind, so a missing field
// is a schema error instead of a silently-undefined render.
const chartsSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('triforce'),
    name: z.string(),
    chartIsland: z.string(),
    shardIsland: z.string(),
    method: z.string(),
    note: z.string().optional(),
  }),
  z.object({
    kind: z.literal('treasure'),
    name: z.string(),
    island: z.string(),
    reward: z.string(),
    note: z.string().optional(),
  }),
]);

// Nintendo Gallery figurine lookup table (RE4's "gems" table equivalent —
// name / how-obtained / notes).
const figurinesSchema = z.object({
  name: z.string(),
  chapter: z.string(),
  location: z.string(),
});

const bossesSchema = z.object({
  name: z.string(),
  dungeon: z.string(),
  strategy: z.string(),
  drop: z.string().optional(),
  order: z.number(),
});

const sidequestsSchema = z.object({
  title: z.string(),
  items: z.array(z.string()),
  order: z.number(),
});

const postgameSchema = z.union([
  z.object({ kind: z.literal('unlock'), name: z.string(), how: z.string(), order: z.number() }),
  z.object({ kind: z.literal('route'), step: z.number(), title: z.string(), body: z.string() }),
]);

const islandsSchema = z.object({
  number: z.string(),
  title: z.string(),
  act: z.enum(['despertar', 'travesia', 'final']),
  order: z.number(),
  heartPieceCount: z.number().optional(),
  pills: z.array(z.object({ type: z.enum(['item', 'shop', 'boss', 'info']), label: z.string() })),
});

// Great Sea atlas — the "lighter collection" alternative CLAUDE.md's TODO
// floated for the full island roster gap: all 49 grid sectors of the sea
// chart (a Piece of Heart / Triforce Chart location plus a one-line note),
// not a standalone page per island like `islands`. Deliberately separate
// from `islandsSchema` so the curated 18-entry story collection (and the
// test asserting exactly 18 files) stays untouched.
const atlasSchema = z.object({
  sector: z.string(),
  name: z.string(),
  note: z.string(),
});

export const collections = {
  ...localizedJson('tips', tipsSchema),
  ...localizedJson('items', itemsSchema),
  ...localizedJson('heart-pieces', heartPiecesSchema),
  ...localizedJson('charts', chartsSchema),
  ...localizedJson('figurines', figurinesSchema),
  ...localizedJson('bosses', bossesSchema),
  ...localizedJson('sidequests', sidequestsSchema),
  ...localizedJson('postgame', postgameSchema),
  ...localizedJson('atlas', atlasSchema),
  islands_es: defineCollection({ loader: glob({ pattern: '*.md', base: 'src/content/es/islands' }), schema: islandsSchema }),
  islands_en: defineCollection({ loader: glob({ pattern: '*.md', base: 'src/content/en/islands' }), schema: islandsSchema }),
};
