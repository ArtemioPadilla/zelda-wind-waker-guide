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

const items = [
  { id: 'hp-01', number: 1, island: 'Isla Initial', location: 'Junto al faro' },
  { id: 'hp-02', number: 2, island: 'Isla Initial', location: 'Tras la cascada' },
  { id: 'hp-03', number: 3, island: 'Isla Barlovento', location: 'Torre del reloj', note: 'requiere el gancho' },
];

describe('HeartPieceChecklist', () => {
  beforeEach(() => {
    memory.clear();
    vi.resetModules();
  });

  it('groups items by island under their own heading', async () => {
    const { default: HeartPieceChecklist } = await import('./HeartPieceChecklist');
    render(<HeartPieceChecklist items={items} progressLabel="Heart Pieces" />);
    expect(screen.getByRole('heading', { name: 'Isla Initial' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Isla Barlovento' })).toBeInTheDocument();
  });

  it('shows the progress bar starting at 0 done', async () => {
    const { default: HeartPieceChecklist } = await import('./HeartPieceChecklist');
    render(<HeartPieceChecklist items={items} progressLabel="Heart Pieces" />);
    expect(screen.getByRole('progressbar', { name: 'Heart Pieces' })).toHaveAttribute('aria-valuenow', '0');
  });

  it('checking an item updates its checkbox and the progress count', async () => {
    const user = userEvent.setup();
    const { default: HeartPieceChecklist } = await import('./HeartPieceChecklist');
    render(<HeartPieceChecklist items={items} progressLabel="Heart Pieces" />);

    const checkbox = screen.getByRole('checkbox', { name: /Junto al faro/ });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByRole('progressbar', { name: 'Heart Pieces' })).toHaveAttribute('aria-valuenow', '1');
  });

  it('renders the optional note when present', async () => {
    const { default: HeartPieceChecklist } = await import('./HeartPieceChecklist');
    render(<HeartPieceChecklist items={items} progressLabel="Heart Pieces" />);
    expect(screen.getByText('requiere el gancho')).toBeInTheDocument();
  });
});
