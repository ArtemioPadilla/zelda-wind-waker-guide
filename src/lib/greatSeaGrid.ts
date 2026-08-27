/**
 * The Great Sea is laid out as a 7x7 grid of lettered/numbered sectors
 * (A1 in the northwest corner through G7 in the southeast) — this is the
 * game's own in-fiction sea-chart system, and it's already the `sector`
 * field on the `atlas` collection (see content.config.ts). This module is
 * the single place that turns a sector code into a position on the
 * interactive Great Sea map, so the map's decorative atlas dots and the
 * heart-piece pins (whose x/y percentages in heart-pieces.json were
 * generated from this same math) agree on one coordinate system.
 *
 * The map component treats its container as a square with a 0-100 x 0-100
 * coordinate space (both the CSS percentage positioning of the HTML pin
 * buttons and the background SVG's viewBox), so "percent across the grid"
 * and "SVG viewBox unit" are the same number — no separate scale factor to
 * keep in sync.
 */
export const GREAT_SEA_GRID_SIZE = 7;

/**
 * Converts a sector code like "A1" or "g7" into a { x, y } percentage pair
 * (0-100 each), centered on that sector's cell. Row letter drives `y`
 * (A = north edge), column number drives `x` (1 = west edge).
 *
 * Throws on malformed input rather than silently returning NaN — every
 * caller passes a `sector` sourced from the `atlas` content collection,
 * which Zod already constrains to exist, so a bad value here means a real
 * data bug worth surfacing loudly instead of drawing a dot at (NaN, NaN).
 */
export function sectorToPercent(sector: string): { x: number; y: number } {
  const match = /^([A-Za-z])([1-9]\d*)$/.exec(sector.trim());
  if (!match) throw new Error(`Invalid Great Sea sector: "${sector}"`);
  const row = match[1].toUpperCase().charCodeAt(0) - 64; // A -> 1
  const col = Number(match[2]);
  if (row < 1 || row > GREAT_SEA_GRID_SIZE || col < 1 || col > GREAT_SEA_GRID_SIZE) {
    throw new Error(`Sector "${sector}" is outside the ${GREAT_SEA_GRID_SIZE}x${GREAT_SEA_GRID_SIZE} grid`);
  }
  return {
    x: ((col - 0.5) / GREAT_SEA_GRID_SIZE) * 100,
    y: ((row - 0.5) / GREAT_SEA_GRID_SIZE) * 100,
  };
}
