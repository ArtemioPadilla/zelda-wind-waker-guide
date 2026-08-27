import { describe, expect, it, vi, beforeEach } from 'vitest';

const memory = new Map<string, unknown>();

vi.mock('idb-keyval', () => ({
  get: vi.fn((key: string) => Promise.resolve(memory.get(key))),
  set: vi.fn((key: string, value: unknown) => {
    memory.set(key, value);
    return Promise.resolve();
  }),
  del: vi.fn((key: string) => {
    memory.delete(key);
    return Promise.resolve();
  }),
}));

// `checklist.ts` only wires up onMount/persistence when `document` exists —
// this suite runs in vitest's default `node` environment (no document), so
// it exercises the pure in-memory toggle logic, which is what the atom's
// consumers (the React islands) actually depend on for correctness.
describe('checklist store', () => {
  beforeEach(() => {
    memory.clear();
    vi.resetModules();
  });

  it('toggle adds an id when absent and removes it when present', async () => {
    const { heartPiecesStore } = await import('./checklist');
    expect(heartPiecesStore.$checked.get().size).toBe(0);

    heartPiecesStore.toggle('hp-01');
    expect(heartPiecesStore.$checked.get().has('hp-01')).toBe(true);

    heartPiecesStore.toggle('hp-01');
    expect(heartPiecesStore.$checked.get().has('hp-01')).toBe(false);
  });

  it('toggle persists the current set to idb-keyval under its own key', async () => {
    const { get } = await import('idb-keyval');
    const { chartsStore } = await import('./checklist');

    chartsStore.toggle('triforce-1');
    chartsStore.toggle('triforce-2');

    const persisted = (await get('ww-charts-done')) as string[];
    expect(new Set(persisted)).toEqual(new Set(['triforce-1', 'triforce-2']));
  });

  it('heart-pieces and charts stores persist independently', async () => {
    const { heartPiecesStore, chartsStore } = await import('./checklist');

    heartPiecesStore.toggle('hp-01');
    expect(chartsStore.$checked.get().size).toBe(0);
    expect(heartPiecesStore.$checked.get().size).toBe(1);
  });

  it('reset clears the checked set and the persisted value', async () => {
    const { get } = await import('idb-keyval');
    const { heartPiecesStore } = await import('./checklist');

    heartPiecesStore.toggle('hp-01');
    heartPiecesStore.toggle('hp-02');
    heartPiecesStore.reset();

    expect(heartPiecesStore.$checked.get().size).toBe(0);
    expect(await get('ww-heart-pieces-done')).toEqual([]);
  });

  it('setCurrentIsland updates the store and persists the island id', async () => {
    const { get } = await import('idb-keyval');
    const { $currentIsland, setCurrentIsland } = await import('./checklist');

    setCurrentIsland('1-1');
    expect($currentIsland.get()).toBe('1-1');
    expect(await get('ww-current-island')).toBe('1-1');
  });
});
