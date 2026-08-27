import { useStore } from '@nanostores/react';
import { $currentIsland, setCurrentIsland } from '@/stores/checklist';

interface Props {
  islandId: string;
  label: string;
  currentLabel: string;
}

export default function SetCurrentIslandButton({ islandId, label, currentLabel }: Props) {
  const current = useStore($currentIsland);
  const isCurrent = current === islandId;

  return (
    <button
      type="button"
      onClick={() => {
        if (!isCurrent) setCurrentIsland(islandId);
      }}
      // aria-disabled (not the `disabled` attribute): "current island" is
      // persistent state, not a momentarily-inert control, and `disabled`
      // removes the button from the tab order and drops keyboard focus to
      // <body> the instant it's set — right after the user just activated
      // it. aria-disabled keeps it focusable; the click handler no-ops instead.
      aria-disabled={isCurrent}
      className="rounded-md border border-primary/50 px-3 py-1.5 font-mono text-xs text-primary transition-colors hover:bg-primary/10 aria-disabled:cursor-default aria-disabled:bg-primary/10"
    >
      {isCurrent ? currentLabel : label}
    </button>
  );
}
