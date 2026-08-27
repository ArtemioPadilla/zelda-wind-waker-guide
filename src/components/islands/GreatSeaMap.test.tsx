// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GreatSeaMap from './GreatSeaMap';

const items = [
  { id: 'hp-01', number: 1, island: 'Outset Island', location: 'Hit Orca 500 times', x: 91.3, y: 19.8 },
  { id: 'hp-02', number: 2, island: 'Windfall Island', location: 'Win the auction', note: 'Multiple nights', x: 16.6, y: 46.8 },
];

const atlasDots = [{ x: 91.3, y: 19.8, name: 'Outset Island' }];

describe('GreatSeaMap', () => {
  it('renders one pin per item, positioned at its x/y percentage', () => {
    render(
      <GreatSeaMap
        items={items}
        checked={new Set()}
        onToggle={vi.fn()}
        atlasDots={atlasDots}
        checkedLabel="checked"
        uncheckedLabel="not checked"
        mapLabel="Great Sea map"
      />,
    );
    const pins = screen.getAllByRole('button');
    expect(pins).toHaveLength(2);
    expect(pins[0]).toHaveStyle({ left: '91.3%', top: '19.8%' });
  });

  it('gives every pin an aria-label combining the location text and checked state', () => {
    render(
      <GreatSeaMap
        items={items}
        checked={new Set(['hp-01'])}
        onToggle={vi.fn()}
        atlasDots={atlasDots}
        checkedLabel="checked"
        uncheckedLabel="not checked"
        mapLabel="Great Sea map"
      />,
    );
    expect(screen.getByRole('button', { name: /Hit Orca 500 times.*checked/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Win the auction.*Multiple nights.*not checked/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('clicking a pin calls onToggle with that item id', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <GreatSeaMap
        items={items}
        checked={new Set()}
        onToggle={onToggle}
        atlasDots={atlasDots}
        checkedLabel="checked"
        uncheckedLabel="not checked"
        mapLabel="Great Sea map"
      />,
    );
    await user.click(screen.getByRole('button', { name: /Hit Orca 500 times/ }));
    expect(onToggle).toHaveBeenCalledWith('hp-01');
  });

  it('exposes the map as a labeled group for assistive tech', () => {
    render(
      <GreatSeaMap
        items={items}
        checked={new Set()}
        onToggle={vi.fn()}
        atlasDots={atlasDots}
        checkedLabel="checked"
        uncheckedLabel="not checked"
        mapLabel="Great Sea map"
      />,
    );
    expect(screen.getByRole('group', { name: 'Great Sea map' })).toBeInTheDocument();
  });
});
