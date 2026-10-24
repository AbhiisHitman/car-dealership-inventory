import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterBar, type ViewOptions } from './FilterBar';

const options: ViewOptions = { inStockOnly: false, sort: 'featured' };

const setup = (filters = {}, opts = options) => {
  const props = { onFiltersChange: vi.fn(), onOptionsChange: vi.fn(), onReset: vi.fn() };
  render(<FilterBar filters={filters} options={opts} categories={['Sedan', 'SUV']} {...props} />);
  return props;
};

describe('FilterBar', () => {
  it('reports make and price changes', () => {
    const props = setup();

    fireEvent.change(screen.getByLabelText('Make'), { target: { value: 'Ford' } });
    fireEvent.change(screen.getByLabelText('Max price'), { target: { value: '40000' } });

    expect(props.onFiltersChange).toHaveBeenCalledWith({ make: 'Ford' });
    expect(props.onFiltersChange).toHaveBeenCalledWith({ maxPrice: '40000' });
  });

  it('selects a category from the chips and marks the active one', async () => {
    const props = setup({ category: 'Sedan' });

    expect(screen.getByRole('button', { name: 'Sedan' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'SUV' }));

    expect(props.onFiltersChange).toHaveBeenCalledWith({ category: 'SUV' });
  });

  it('toggles in-stock-only and changes the sort order', async () => {
    const props = setup();

    await userEvent.click(screen.getByLabelText('In stock only'));
    await userEvent.selectOptions(screen.getByLabelText('Sort'), 'price-desc');

    expect(props.onOptionsChange).toHaveBeenCalledWith({ inStockOnly: true, sort: 'featured' });
    expect(props.onOptionsChange).toHaveBeenCalledWith({ inStockOnly: false, sort: 'price-desc' });
  });

  it('only enables reset when something is filtered', () => {
    setup();
    expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();
  });

  it('resets when a filter is active', async () => {
    const props = setup({ make: 'Kia' });

    await userEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(props.onReset).toHaveBeenCalledOnce();
  });
});
