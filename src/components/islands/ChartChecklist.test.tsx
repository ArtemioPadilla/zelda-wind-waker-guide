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
  { id: 'chart-triforce-1', name: 'Carta del Triforce #1', detail: 'Islote de Acero → Isla Barlovento' },
  { id: 'chart-treasure-1', name: 'Carta del Tesoro #1', detail: 'Isla Initial → Rupia Roja' },
];

describe('ChartChecklist', () => {
  beforeEach(() => {
    memory.clear();
    vi.resetModules();
  });

  it('shows the progress bar starting at 0 done', async () => {
    const { default: ChartChecklist } = await import('./ChartChecklist');
    render(<ChartChecklist items={items} progressLabel="Charts" />);
    expect(screen.getByRole('progressbar', { name: 'Charts' })).toHaveAttribute('aria-valuenow', '0');
  });

  it('checking an item updates its checkbox and the progress count', async () => {
    const user = userEvent.setup();
    const { default: ChartChecklist } = await import('./ChartChecklist');
    render(<ChartChecklist items={items} progressLabel="Charts" />);

    const checkbox = screen.getByRole('checkbox', { name: /Carta del Triforce #1/ });
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByRole('progressbar', { name: 'Charts' })).toHaveAttribute('aria-valuenow', '1');
  });

  it('renders every item name', async () => {
    const { default: ChartChecklist } = await import('./ChartChecklist');
    render(<ChartChecklist items={items} progressLabel="Charts" />);
    expect(screen.getByText('Carta del Triforce #1')).toBeInTheDocument();
    expect(screen.getByText('Carta del Tesoro #1')).toBeInTheDocument();
  });
});
