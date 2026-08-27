import { describe, expect, it } from 'vitest';
import { sectorToPercent, GREAT_SEA_GRID_SIZE } from './greatSeaGrid';

describe('sectorToPercent', () => {
  it('places A1 at the northwest cell center', () => {
    const { x, y } = sectorToPercent('A1');
    expect(x).toBeCloseTo(100 / 14, 10);
    expect(y).toBeCloseTo(100 / 14, 10);
  });

  it('places G7 at the southeast cell center', () => {
    const { x, y } = sectorToPercent('G7');
    expect(x).toBeCloseTo((100 / 7) * 6.5, 5);
    expect(y).toBeCloseTo((100 / 7) * 6.5, 5);
  });

  it('drives x from the column number and y from the row letter independently', () => {
    // Same column (4), different rows -> same x, different y.
    const b4 = sectorToPercent('B4');
    const f4 = sectorToPercent('F4');
    expect(b4.x).toBe(f4.x);
    expect(b4.y).not.toBe(f4.y);
  });

  it('is case-insensitive on the row letter', () => {
    expect(sectorToPercent('d2')).toEqual(sectorToPercent('D2'));
  });

  it('covers the full grid within 0-100 on both axes', () => {
    for (let row = 1; row <= GREAT_SEA_GRID_SIZE; row++) {
      for (let col = 1; col <= GREAT_SEA_GRID_SIZE; col++) {
        const sector = `${String.fromCharCode(64 + row)}${col}`;
        const { x, y } = sectorToPercent(sector);
        expect(x).toBeGreaterThan(0);
        expect(x).toBeLessThan(100);
        expect(y).toBeGreaterThan(0);
        expect(y).toBeLessThan(100);
      }
    }
  });

  it('throws on a malformed sector code', () => {
    expect(() => sectorToPercent('')).toThrow();
    expect(() => sectorToPercent('1A')).toThrow();
    expect(() => sectorToPercent('AA')).toThrow();
  });

  it('throws when the row or column falls outside the 7x7 grid', () => {
    expect(() => sectorToPercent('H1')).toThrow();
    expect(() => sectorToPercent('A8')).toThrow();
  });
});
