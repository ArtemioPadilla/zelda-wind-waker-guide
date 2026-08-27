import { useStore } from '@nanostores/react';
import { heartPiecesStore, chartsStore, $currentIsland, setCurrentIsland, resetCurrentIsland } from '@/stores/checklist';
import ProgressBar from './ProgressBar';

interface IslandOption {
  id: string;
  number: string;
  title: string;
}

interface Props {
  totalHeartPieces: number;
  totalCharts: number;
  islands: IslandOption[];
  heartPiecesLabel: string;
  chartsLabel: string;
  islandLabel: string;
  resetLabel: string;
  resetConfirmMessage: string;
}

export default function HomeProgress({
  totalHeartPieces,
  totalCharts,
  islands,
  heartPiecesLabel,
  chartsLabel,
  islandLabel,
  resetLabel,
  resetConfirmMessage,
}: Props) {
  const heartPiecesChecked = useStore(heartPiecesStore.$checked);
  const chartsChecked = useStore(chartsStore.$checked);
  const current = useStore($currentIsland);

  function handleReset() {
    if (!window.confirm(resetConfirmMessage)) return;
    heartPiecesStore.reset();
    chartsStore.reset();
    resetCurrentIsland();
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground">{heartPiecesLabel}</p>
          <ProgressBar done={heartPiecesChecked.size} total={totalHeartPieces} label={heartPiecesLabel} />
        </div>
        <div>
          <p className="mb-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground">{chartsLabel}</p>
          <ProgressBar done={chartsChecked.size} total={totalCharts} label={chartsLabel} />
        </div>
      </div>
      <div className="mt-1">
        <label htmlFor="current-island" className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
          {islandLabel}
        </label>
        <select
          id="current-island"
          value={current ?? ''}
          onChange={(e) => setCurrentIsland(e.target.value)}
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          <option value="" disabled>
            —
          </option>
          {islands.map((c) => (
            <option key={c.id} value={c.id}>
              {c.number} — {c.title}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={handleReset}
        className="mt-4 font-mono text-xs text-muted-foreground underline decoration-dotted transition-colors hover:text-destructive"
      >
        {resetLabel}
      </button>
    </div>
  );
}
