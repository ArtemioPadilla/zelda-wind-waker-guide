// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const memory = new Map<string, unknown>();

vi.mock('idb-keyval', () => ({
  get: vi.fn((key: string) => Promise.resolve(memory.get(key))),
  set: vi.fn((key: string, value: unknown) => {
    memory.set(key, value);
    return Promise.resolve();
  }),
  del: vi.fn((key: string) => {
    memory.delete(key);
    return Promise.resolve();
  }),
}));

const islands = [
  { id: '1-1', number: '1-1', title: 'Isla Initial' },
  { id: '1-2', number: '1-2', title: 'Fortaleza Abandonada' },
];

const baseProps = {
  totalHeartPieces: 44,
  totalCharts: 16,
  islands,
  heartPiecesLabel: 'Heart Pieces',
  chartsLabel: 'Charts',
  islandLabel: 'Current island',
  resetLabel: 'Reset',
  resetConfirmMessage: 'Sure?',
};

describe('HomeProgress', () => {
  beforeEach(() => {
    memory.clear();
    vi.resetModules();
  });

  it('renders both progress bars starting at 0', async () => {
    const { default: HomeProgress } = await import('./HomeProgress');
    render(<HomeProgress {...baseProps} />);
    expect(screen.getByRole('progressbar', { name: 'Heart Pieces' })).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('progressbar', { name: 'Charts' })).toHaveAttribute('aria-valuenow', '0');
  });

  it('lists every island option in the select', async () => {
    const { default: HomeProgress } = await import('./HomeProgress');
    render(<HomeProgress {...baseProps} />);
    expect(screen.getByRole('option', { name: '1-1 — Isla Initial' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '1-2 — Fortaleza Abandonada' })).toBeInTheDocument();
  });

  it('changing the select sets the current island', async () => {
    const user = userEvent.setup();
    const { default: HomeProgress } = await import('./HomeProgress');
    const { $currentIsland } = await import('@/stores/checklist');
    render(<HomeProgress {...baseProps} />);

    await user.selectOptions(screen.getByLabelText('Current island'), '1-2');
    expect($currentIsland.get()).toBe('1-2');
  });

  it('clicking reset asks for confirmation and clears state when confirmed', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { default: HomeProgress } = await import('./HomeProgress');
    const { heartPiecesStore, $currentIsland } = await import('@/stores/checklist');

    heartPiecesStore.toggle('hp-01');
    render(<HomeProgress {...baseProps} />);

    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(confirmSpy).toHaveBeenCalledWith('Sure?');
    expect(heartPiecesStore.$checked.get().size).toBe(0);
    expect($currentIsland.get()).toBe(null);
    confirmSpy.mockRestore();
  });

  it('clicking reset does nothing when the confirmation is declined', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { default: HomeProgress } = await import('./HomeProgress');
    const { heartPiecesStore } = await import('@/stores/checklist');

    heartPiecesStore.toggle('hp-01');
    render(<HomeProgress {...baseProps} />);

    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(heartPiecesStore.$checked.get().size).toBe(1);
    confirmSpy.mockRestore();
  });
});
