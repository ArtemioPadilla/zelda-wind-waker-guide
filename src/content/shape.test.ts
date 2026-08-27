import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as yaml from 'js-yaml';

// Plain Node/fs checks against the raw content files — deliberately NOT going
// through astro:content (that requires the full Astro Vite pipeline). This
// still catches the failure modes that matter for a locale-mirrored content
// tree: missing translations, id drift between es/en, and structural counts
// the guide's copy asserts (e.g. "44 Pieces of Heart").

const CONTENT_DIR = join(dirname(fileURLToPath(import.meta.url)));
const JSON_ENTITIES = ['tips', 'items', 'heart-pieces', 'charts', 'figurines', 'bosses', 'sidequests', 'postgame', 'atlas'];

function loadJson<T extends { id: string }>(locale: 'es' | 'en', name: string): T[] {
  return JSON.parse(readFileSync(join(CONTENT_DIR, locale, `${name}.json`), 'utf8')) as T[];
}

function hasLocale(locale: 'es' | 'en', name: string): boolean {
  return existsSync(join(CONTENT_DIR, locale, `${name}.json`));
}

function islandFiles(locale: 'es' | 'en'): string[] {
  const dir = join(CONTENT_DIR, locale, 'islands');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
}

describe('content: es/en parity', () => {
  for (const name of JSON_ENTITIES) {
    it(`${name}.json has matching ids in es and en, same order`, () => {
      if (!hasLocale('en', name)) return;
      const es = loadJson('es', name);
      const en = loadJson('en', name);
      expect(en.map((e) => e.id)).toEqual(es.map((e) => e.id));
    });

    it(`${name}.json has no duplicate ids`, () => {
      const es = loadJson('es', name);
      const ids = es.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  }

  it('islands: es and en have the same 18 filenames', () => {
    const es = islandFiles('es');
    expect(es).toHaveLength(18);
    const en = islandFiles('en');
    expect(en).toEqual(es);
  });

  it.each(['es', 'en'] as const)('%s: every island has valid act/order/pills frontmatter', (locale) => {
    const files = islandFiles(locale);
    const dir = join(CONTENT_DIR, locale, 'islands');
    const orders = new Set<number>();
    for (const file of files) {
      const raw = readFileSync(join(dir, file), 'utf8');
      const match = raw.match(/^---\n([\s\S]*?)\n---/);
      expect(match, `${file} must start with a frontmatter block`).toBeTruthy();
      const fm = yaml.load(match![1]) as { act: string; order: number; pills: { type: string; label: string }[] };
      expect(['despertar', 'travesia', 'final']).toContain(fm.act);
      orders.add(fm.order);
      for (const pill of fm.pills) {
        expect(['item', 'shop', 'boss', 'info']).toContain(pill.type);
        expect(typeof pill.label).toBe('string');
      }
    }
    expect(orders.size).toBe(files.length);
  });
});

describe('content: heart pieces', () => {
  it('has exactly 44 entries numbered 1-44 with no gaps or duplicates', () => {
    const heartPieces = loadJson<{ id: string; number: number }>('es', 'heart-pieces');
    expect(heartPieces).toHaveLength(44);
    const numbers = heartPieces.map((h) => h.number).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 44 }, (_, i) => i + 1));
  });

  it('every entry with map coordinates has both x and y within 0-100, and es/en agree on them', () => {
    type HP = { id: string; x?: number; y?: number };
    const es = loadJson<HP>('es', 'heart-pieces');
    const en = loadJson<HP>('en', 'heart-pieces');
    for (const h of es) {
      const hasX = h.x !== undefined;
      const hasY = h.y !== undefined;
      expect(hasX, `${h.id}: x and y must both be set or both be absent`).toBe(hasY);
      if (hasX && hasY) {
        expect(h.x).toBeGreaterThanOrEqual(0);
        expect(h.x).toBeLessThanOrEqual(100);
        expect(h.y).toBeGreaterThanOrEqual(0);
        expect(h.y).toBeLessThanOrEqual(100);
      }
    }
    const byId = new Map(en.map((h) => [h.id, h]));
    for (const h of es) {
      expect(byId.get(h.id)?.x).toBe(h.x);
      expect(byId.get(h.id)?.y).toBe(h.y);
    }
  });

  it('only the 2 entries without a single fixed island (hp-08, hp-35) lack map coordinates', () => {
    const es = loadJson<{ id: string; x?: number }>('es', 'heart-pieces');
    const missing = es.filter((h) => h.x === undefined).map((h) => h.id);
    expect(missing.sort()).toEqual(['hp-08', 'hp-35']);
  });
});

describe('content: charts', () => {
  it('has exactly 8 Triforce Charts', () => {
    const charts = loadJson<{ id: string; kind: string }>('es', 'charts');
    const triforce = charts.filter((c) => c.kind === 'triforce');
    expect(triforce).toHaveLength(8);
  });

  it('every treasure chart has a reward', () => {
    const charts = loadJson<{ id: string; kind: string; reward?: string }>('es', 'charts');
    const treasure = charts.filter((c) => c.kind === 'treasure');
    expect(treasure.length).toBeGreaterThan(0);
    for (const c of treasure) expect(c.reward).toBeTruthy();
  });
});

describe('content: items', () => {
  const VALID_CATEGORIES = new Set(['weapons', 'tools', 'sailing', 'upgrades']);
  it('every item has a valid category', () => {
    const items = loadJson<{ id: string; category: string }>('es', 'items');
    for (const i of items) expect(VALID_CATEGORIES.has(i.category)).toBe(true);
  });

  it('every upgradeStages progression has at least 2 strictly increasing values', () => {
    const items = loadJson<{ id: string; upgradeStages?: number[] }>('es', 'items');
    const withStages = items.filter((i) => i.upgradeStages);
    expect(withStages.length).toBeGreaterThan(0);
    for (const i of withStages) {
      const stages = i.upgradeStages!;
      expect(stages.length).toBeGreaterThanOrEqual(2);
      for (let k = 1; k < stages.length; k++) expect(stages[k]).toBeGreaterThan(stages[k - 1]);
    }
  });
});

describe('content: atlas', () => {
  it('covers all 49 grid sectors of the Great Sea with no duplicates', () => {
    const atlas = loadJson<{ id: string; sector: string }>('es', 'atlas');
    expect(atlas).toHaveLength(49);
    expect(new Set(atlas.map((a) => a.sector)).size).toBe(49);
  });
});
