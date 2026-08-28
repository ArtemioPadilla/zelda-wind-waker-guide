import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { heartPiecesStore } from '@/stores/checklist';
import ProgressBar from './ProgressBar';
import ChecklistItem from './ChecklistItem';
import GreatSeaMap, { type AtlasDot } from './GreatSeaMap';

interface HeartPieceItem {
  id: string;
  number: number;
  island: string;
  location: string;
  note?: string;
  x?: number;
  y?: number;
}

interface Props {
  items: HeartPieceItem[];
  progressLabel: string;
  atlasDots: AtlasDot[];
  viewListLabel: string;
  viewMapLabel: string;
  mapLabel: string;
  mapCheckedLabel: string;
  mapUncheckedLabel: string;
  mapMissingNote: string;
  mapCreditLabel: string;
}

export default function HeartPieceChecklist({
  items,
  progressLabel,
  atlasDots,
  viewListLabel,
  viewMapLabel,
  mapLabel,
  mapCheckedLabel,
  mapUncheckedLabel,
  mapMissingNote,
  mapCreditLabel,
}: Props) {
  const checked = useStore(heartPiecesStore.$checked);
  const done = items.filter((i) => checked.has(i.id)).length;
  const [view, setView] = useState<'list' | 'map'>('list');

  const islands = [...new Set(items.map((i) => i.island))];
  // Not every entry has a fixed island location (hp-08 "Any mailbox", hp-35
  // "Various islands" — see the heartPiecesSchema comment in
  // content.config.ts), so the map only ever gets a subset of `items`. The
  // list stays the complete, always-available view — the map is additive,
  // never a replacement.
  const pinnableItems = items.filter((i): i is HeartPieceItem & { x: number; y: number } => i.x !== undefined && i.y !== undefined);
  const hasUnpinned = pinnableItems.length < items.length;

  return (
    <div>
      <ProgressBar done={done} total={items.length} label={progressLabel} />

      <div role="tablist" aria-label={`${viewListLabel} / ${viewMapLabel}`} className="mb-4 inline-flex gap-1 rounded-md border border-border p-1">
        {(
          [
            ['list', viewListLabel],
            ['map', viewMapLabel],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={view === key}
            onClick={() => setView(key)}
            className={`rounded px-3 py-1 font-mono text-xs transition-colors ${
              view === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'list' ? (
        <div>
          {islands.map((island) => (
            <div key={island} className="mb-6">
              <h2 className="mb-2 font-display text-sm font-semibold tracking-wide text-muted-foreground">
                {island}
              </h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {items
                  .filter((i) => i.island === island)
                  .map((item) => {
                    const isChecked = checked.has(item.id);
                    return (
                      <ChecklistItem key={item.id} checked={isChecked} onToggle={() => heartPiecesStore.toggle(item.id)}>
                        <span className="mr-1.5 font-mono text-xs text-primary">#{item.number}</span>
                        {item.location}
                        {item.note ? <span className="mt-0.5 block text-xs text-muted-foreground">{item.note}</span> : null}
                      </ChecklistItem>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {hasUnpinned ? <p className="mb-3 text-xs text-muted-foreground">{mapMissingNote}</p> : null}
          <GreatSeaMap
            items={pinnableItems}
            checked={checked}
            onToggle={(id) => heartPiecesStore.toggle(id)}
            atlasDots={atlasDots}
            checkedLabel={mapCheckedLabel}
            uncheckedLabel={mapUncheckedLabel}
            mapLabel={mapLabel}
            creditLabel={mapCreditLabel}
          />
        </div>
      )}
    </div>
  );
}
