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
  { id: 'hp-01', number: 1, island: 'Isla Initial', location: 'Junto al faro', x: 10, y: 10 },
  { id: 'hp-02', number: 2, island: 'Isla Initial', location: 'Tras la cascada', x: 12, y: 14 },
  { id: 'hp-03', number: 3, island: 'Isla Barlovento', location: 'Torre del reloj', note: 'requiere el gancho' },
];

const viewProps = {
  atlasDots: [{ x: 10, y: 10, name: 'Isla Initial' }],
  viewListLabel: 'Lista',
  viewMapLabel: 'Mapa',
  mapLabel: 'Mapa del Gran Mar',
  mapCheckedLabel: 'marcado',
  mapUncheckedLabel: 'sin marcar',
  mapMissingNote: 'Algunos trozos no aparecen en el mapa.',
  mapCreditLabel: 'Arte: carta de referencia comunitaria.',
};

describe('HeartPieceChecklist', () => {
  beforeEach(() => {
    memory.clear();
    vi.resetModules();
  });

  it('groups items by island under their own heading', async () => {
    const { default: HeartPieceChecklist } = await import('./HeartPieceChecklist');
    render(<HeartPieceChecklist items={items} progressLabel="Heart Pieces" {...viewProps} />);
    expect(screen.getByRole('heading', { name: 'Isla Initial' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Isla Barlovento' })).toBeInTheDocument();
  });

  it('shows the progress bar starting at 0 done', async () => {
    const { default: HeartPieceChecklist } = await import('./HeartPieceChecklist');
    render(<HeartPieceChecklist items={items} progressLabel="Heart Pieces" {...viewProps} />);
    expect(screen.getByRole('progressbar', { name: 'Heart Pieces' })).toHaveAttribute('aria-valuenow', '0');
  });

  it('checking an item updates its checkbox and the progress count', async () => {
    const user = userEvent.setup();
    const { default: HeartPieceChecklist } = await import('./HeartPieceChecklist');
    render(<HeartPieceChecklist items={items} progressLabel="Heart Pieces" {...viewProps} />);

    const checkbox = screen.getByRole('checkbox', { name: /Junto al faro/ });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByRole('progressbar', { name: 'Heart Pieces' })).toHaveAttribute('aria-valuenow', '1');
  });

  it('renders the optional note when present', async () => {
    const { default: HeartPieceChecklist } = await import('./HeartPieceChecklist');
    render(<HeartPieceChecklist items={items} progressLabel="Heart Pieces" {...viewProps} />);
    expect(screen.getByText('requiere el gancho')).toBeInTheDocument();
  });

  it('defaults to the list view, with the map view available but not shown', async () => {
    const { default: HeartPieceChecklist } = await import('./HeartPieceChecklist');
    render(<HeartPieceChecklist items={items} progressLabel="Heart Pieces" {...viewProps} />);
    expect(screen.getByRole('checkbox', { name: /Junto al faro/ })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: viewProps.mapLabel })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Lista' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Mapa' })).toHaveAttribute('aria-selected', 'false');
  });

  it('switching to the map view renders a pin per item that has coordinates', async () => {
    const user = userEvent.setup();
    const { default: HeartPieceChecklist } = await import('./HeartPieceChecklist');
    render(<HeartPieceChecklist items={items} progressLabel="Heart Pieces" {...viewProps} />);

    await user.click(screen.getByRole('tab', { name: 'Mapa' }));

    expect(screen.getByRole('group', { name: viewProps.mapLabel })).toBeInTheDocument();
    // hp-01 and hp-02 have x/y; hp-03 doesn't, so only 2 pins render.
    expect(screen.getByRole('button', { name: /Junto al faro/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tras la cascada/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Torre del reloj/ })).not.toBeInTheDocument();
    // The note about unpinnable items should be visible in map view.
    expect(screen.getByText(viewProps.mapMissingNote)).toBeInTheDocument();
  });

  it('a map pin toggles the same shared store the list checkbox reads, keeping both views in sync', async () => {
    const user = userEvent.setup();
    const { default: HeartPieceChecklist } = await import('./HeartPieceChecklist');
    render(<HeartPieceChecklist items={items} progressLabel="Heart Pieces" {...viewProps} />);

    await user.click(screen.getByRole('tab', { name: 'Mapa' }));
    const pin = screen.getByRole('button', { name: /Junto al faro/ });
    expect(pin).toHaveAttribute('aria-pressed', 'false');

    await user.click(pin);
    expect(pin).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('progressbar', { name: 'Heart Pieces' })).toHaveAttribute('aria-valuenow', '1');

    await user.click(screen.getByRole('tab', { name: 'Lista' }));
    expect(screen.getByRole('checkbox', { name: /Junto al faro/ })).toBeChecked();
  });
});
