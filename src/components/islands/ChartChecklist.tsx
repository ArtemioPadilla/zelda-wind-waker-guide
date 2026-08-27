import { useStore } from '@nanostores/react';
import { chartsStore } from '@/stores/checklist';
import ProgressBar from './ProgressBar';
import ChecklistItem from './ChecklistItem';

interface ChartItem {
  id: string;
  name: string;
  detail: string;
}

interface Props {
  items: ChartItem[];
  progressLabel: string;
}

export default function ChartChecklist({ items, progressLabel }: Props) {
  const checked = useStore(chartsStore.$checked);
  const done = items.filter((i) => checked.has(i.id)).length;

  return (
    <div>
      <ProgressBar done={done} total={items.length} label={progressLabel} />
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <ChecklistItem key={item.id} checked={isChecked} onToggle={() => chartsStore.toggle(item.id)}>
              <span className="font-medium text-foreground">{item.name}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{item.detail}</span>
            </ChecklistItem>
          );
        })}
      </ul>
    </div>
  );
}
