import { withBase } from '@/lib/href';

export interface MapPinItem {
  id: string;
  number: number;
  island: string;
  location: string;
  note?: string;
  x: number;
  y: number;
}

export interface AtlasDot {
  x: number;
  y: number;
  name: string;
}

interface Props {
  items: MapPinItem[];
  checked: Set<string>;
  onToggle: (id: string) => void;
  atlasDots: AtlasDot[];
  checkedLabel: string;
  uncheckedLabel: string;
  mapLabel: string;
  creditLabel: string;
}

/**
 * Real Great Sea Chart map — `public/images/great-sea-chart.png`, a 712x712
 * crop (the bare 7x7 grid, letter/number label strips cropped off) of the
 * community-authored "Zelda wind waker sea chart" reference chart (Chrimp,
 * 2003), sourced via the Zelda Wiki/Fandom file
 * https://zelda.fandom.com/wiki/File:Zelda_wind_waker_sea_chart.gif — used
 * under the same fair-use/fan-reference basis as the rest of this
 * completionist guide's researched content. Visible attribution renders
 * below the map (`creditLabel`).
 *
 * The crop's pixel bounds were picked to exactly match the grid lines in the
 * source image (verified by sampling border pixels), so the existing 0-100
 * percentage coordinate space already used by every pin's x/y (see
 * heartPiecesSchema in content.config.ts, generated from the `atlas`
 * collection's 7x7 sector grid) lines up with this image with no additional
 * scale/offset math — sector math and image pixels share one coordinate
 * system. The image's own hand-drawn island doodle in a given cell doesn't
 * necessarily depict the same island our (independently, Game8-sourced)
 * `atlas` sector data assigns to that cell — the two "real" fan sources
 * disagree on several sector assignments (spot-checked against a second
 * source: Dragon Roost Island's F2 matches Zelda Wiki / StrategyWiki and the
 * `atlas` collection, not this image's own B6 label) — so the image is used
 * purely as a real, accurately-gridded backdrop texture; pin/dot placement
 * always follows this repo's own already-verified `atlas` sector data, never
 * the picture's per-cell illustration.
 *
 * Pins read AND WRITE the exact same `heartPiecesStore` the list checkboxes
 * use (via `checked` / `onToggle` props passed down from HeartPieceChecklist)
 * — there's no separate map-only state, so toggling a pin here is reflected
 * immediately in the list view and vice versa.
 */
export default function GreatSeaMap({ items, checked, onToggle, atlasDots, checkedLabel, uncheckedLabel, mapLabel, creditLabel }: Props) {
  return (
    <figure className="m-0">
      <div
        role="group"
        aria-label={mapLabel}
        className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-card bg-cover bg-center"
        style={{ backgroundImage: `url(${withBase('/images/great-sea-chart.png')})` }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {atlasDots.map((d) => (
            <circle key={d.name} cx={d.x} cy={d.y} r="0.8" className="fill-primary/60 stroke-card" strokeWidth="0.2" />
          ))}
        </svg>
        {items.map((item) => {
          const isChecked = checked.has(item.id);
          const state = isChecked ? checkedLabel : uncheckedLabel;
          const label = `#${item.number} ${item.island}: ${item.location}${item.note ? ` — ${item.note}` : ''} — ${state}`;
          return (
            <button
              key={item.id}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={isChecked}
              onClick={() => onToggle(item.id)}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              className={`absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-[9px] font-bold leading-none shadow-sm transition-transform hover:z-10 hover:scale-150 focus-visible:z-10 focus-visible:scale-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring ${
                isChecked
                  ? 'border-muted-foreground/50 bg-muted text-muted-foreground'
                  : 'border-primary bg-primary text-primary-foreground'
              }`}
            >
              {item.number}
            </button>
          );
        })}
      </div>
      <figcaption className="mt-1.5 text-[11px] text-muted-foreground">{creditLabel}</figcaption>
    </figure>
  );
}
