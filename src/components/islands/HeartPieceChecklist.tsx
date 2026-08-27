import { useStore } from '@nanostores/react';
import { heartPiecesStore } from '@/stores/checklist';
import ProgressBar from './ProgressBar';
import ChecklistItem from './ChecklistItem';

interface HeartPieceItem {
  id: string;
  number: number;
  island: string;
  location: string;
  note?: string;
}

interface Props {
  items: HeartPieceItem[];
  progressLabel: string;
}

export default function HeartPieceChecklist({ items, progressLabel }: Props) {
  const checked = useStore(heartPiecesStore.$checked);
  const done = items.filter((i) => checked.has(i.id)).length;

  const islands = [...new Set(items.map((i) => i.island))];

  return (
    <div>
      <ProgressBar done={done} total={items.length} label={progressLabel} />
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
  );
}
