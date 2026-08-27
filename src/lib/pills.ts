import type { CollectionEntry } from 'astro:content';

// The pill `type` union content.config.ts already enforces — reused here so
// PILL_STYLE can't silently miss a case (a typo'd key used to fall through
// to `undefined` in the class list with no compile error).
export type PillType = CollectionEntry<'islands_es'>['data']['pills'][number]['type'];

// Theme-aware pill colors (see the --pill-shop/--pill-item tokens and their
// contrast rationale in global.css). boss/info reuse existing semantic
// tokens; shop/item get dedicated tokens tuned for this use.
export const PILL_STYLE: Record<PillType, string> = {
  boss: 'text-destructive border-destructive/40',
  shop: 'text-pill-shop border-pill-shop/40',
  item: 'text-pill-item border-pill-item/40',
  info: 'text-muted-foreground border-border',
};
