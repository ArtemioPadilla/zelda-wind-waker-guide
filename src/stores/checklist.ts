import { atom, onMount } from 'nanostores';
import { get, set } from 'idb-keyval';

/**
 * Generic persisted checklist store (which ids are "done"). Used for the
 * heart-piece and Triforce-chart trackers — offline-first, per-device only,
 * no backend. Follows the same onMount-hydrate / listen-to-persist pattern
 * as `src/stores/theme.ts`.
 */
function createChecklistStore(idbKey: string) {
  const $checked = atom<Set<string>>(new Set());
  // Set the instant a toggle happens, even before IDB hydration resolves.
  // Without this, a click made right after page load (checkbox flips
  // visually, IDB write kicks off) gets silently reverted when the slower
  // hydration `get()` promise resolves afterward and overwrites the atom
  // with the pre-click snapshot — the write already landed in IDB, but the
  // in-memory state (and the UI) regresses out of sync with it.
  let dirty = false;

  if (typeof document !== 'undefined') {
    onMount($checked, () => {
      let cancelled = false;
      get(idbKey)
        .then((stored) => {
          if (!cancelled && !dirty && Array.isArray(stored)) $checked.set(new Set(stored));
        })
        .catch(() => {
          // IndexedDB unavailable (private mode, etc.) — start empty.
        });
      return () => {
        cancelled = true;
      };
    });
  }

  function toggle(id: string) {
    dirty = true;
    const next = new Set($checked.get());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    $checked.set(next);
    set(idbKey, [...next]).catch(() => {});
  }

  function reset() {
    dirty = true;
    $checked.set(new Set());
    set(idbKey, []).catch(() => {});
  }

  return { $checked, toggle, reset };
}

export const heartPiecesStore = createChecklistStore('ww-heart-pieces-done');
export const chartsStore = createChecklistStore('ww-charts-done');

/** Currently-playing island, for the home-page progress summary. */
export const $currentIsland = atom<string | null>(null);
const CURRENT_ISLAND_KEY = 'ww-current-island';
let currentIslandDirty = false;

if (typeof document !== 'undefined') {
  onMount($currentIsland, () => {
    let cancelled = false;
    get(CURRENT_ISLAND_KEY)
      .then((stored) => {
        if (!cancelled && !currentIslandDirty && typeof stored === 'string') $currentIsland.set(stored);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  });
}

export function setCurrentIsland(id: string): void {
  currentIslandDirty = true;
  $currentIsland.set(id);
  set(CURRENT_ISLAND_KEY, id).catch(() => {});
}

export function resetCurrentIsland(): void {
  currentIslandDirty = true;
  $currentIsland.set(null);
  set(CURRENT_ISLAND_KEY, null).catch(() => {});
}
