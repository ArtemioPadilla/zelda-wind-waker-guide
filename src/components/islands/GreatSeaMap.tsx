import { GREAT_SEA_GRID_SIZE } from '@/lib/greatSeaGrid';

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
}

const GRID_LINES = Array.from({ length: GREAT_SEA_GRID_SIZE - 1 }, (_, i) => ((i + 1) / GREAT_SEA_GRID_SIZE) * 100);

/**
 * Stylized/schematic Great Sea map — NOT a game screenshot (none exist as
 * source assets for this project, and reusing captured game art would carry
 * copyright risk). A hand-authored nautical-chart backdrop (ocean wash +
 * faint 7x7 sector grid, echoing the in-game sea chart and the `atlas`
 * collection's own sector codes) with a decorative dot per atlas island for
 * orientation, and one pin button per Piece of Heart on top.
 *
 * Pins read AND WRITE the exact same `heartPiecesStore` the list checkboxes
 * use (via `checked` / `onToggle` props passed down from HeartPieceChecklist)
 * — there's no separate map-only state, so toggling a pin here is reflected
 * immediately in the list view and vice versa.
 */
export default function GreatSeaMap({ items, checked, onToggle, atlasDots, checkedLabel, uncheckedLabel, mapLabel }: Props) {
  return (
    <div
      role="group"
      aria-label={mapLabel}
      className="relative aspect-square w-full overflow-hidden rounded-lg border border-border"
      style={{
        backgroundImage:
          'radial-gradient(120% 90% at 20% 0%, color-mix(in oklch, var(--pill-shop) 18%, var(--card)), var(--card) 65%)',
      }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {GRID_LINES.map((p) => (
          <line key={`v-${p}`} x1={p} y1={0} x2={p} y2={100} stroke="var(--border)" strokeWidth="0.15" />
        ))}
        {GRID_LINES.map((p) => (
          <line key={`h-${p}`} x1={0} y1={p} x2={100} y2={p} stroke="var(--border)" strokeWidth="0.15" />
        ))}
        {atlasDots.map((d) => (
          <circle key={d.name} cx={d.x} cy={d.y} r="0.8" className="fill-muted-foreground/50" />
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
  );
}
