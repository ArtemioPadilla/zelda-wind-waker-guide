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
});

// The primary completionist checklist — 44 Pieces of Heart grouped by island
// (analogous to RE4's 15 blue medallions, grouped by zone).
const heartPiecesSchema = z.object({
  number: z.number().min(1).max(44),
  island: z.string(),
  chapter: z.string(),
  location: z.string(),
  note: z.string().optional(),
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

export const collections = {
  ...localizedJson('tips', tipsSchema),
  ...localizedJson('items', itemsSchema),
  ...localizedJson('heart-pieces', heartPiecesSchema),
  ...localizedJson('charts', chartsSchema),
  ...localizedJson('figurines', figurinesSchema),
  ...localizedJson('bosses', bossesSchema),
  ...localizedJson('sidequests', sidequestsSchema),
  ...localizedJson('postgame', postgameSchema),
  islands_es: defineCollection({ loader: glob({ pattern: '*.md', base: 'src/content/es/islands' }), schema: islandsSchema }),
  islands_en: defineCollection({ loader: glob({ pattern: '*.md', base: 'src/content/en/islands' }), schema: islandsSchema }),
};
