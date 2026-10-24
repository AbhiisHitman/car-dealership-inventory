import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { api } from '../lib/api';
import { makeVehicle } from '../test/fixtures';
import { hasFilters, useInventory, useVisibleVehicles } from './useInventory';

const stats = { models: 0, unitsInStock: 0, outOfStock: 0, inventoryValue: 0, categories: [] };

describe('hasFilters', () => {
  it('ignores blank values', () => {
    expect(hasFilters({ make: '', model: '  ' })).toBe(false);
    expect(hasFilters({ minPrice: '0' })).toBe(true);
  });
});

describe('useInventory', () => {
  it('lists all vehicles when no filters are set', async () => {
    const list = vi.spyOn(api, 'listVehicles').mockResolvedValue({ vehicles: [makeVehicle()] });
    const search = vi.spyOn(api, 'searchVehicles');
    vi.spyOn(api, 'stats').mockResolvedValue({ stats });

    const { result } = renderHook(() => useInventory({ make: '' }));

    await waitFor(() => expect(result.current.vehicles).toHaveLength(1));
    expect(list).toHaveBeenCalled();
    expect(search).not.toHaveBeenCalled();
  });

  it('uses the search endpoint when a filter is set', async () => {
    vi.spyOn(api, 'listVehicles').mockResolvedValue({ vehicles: [] });
    const search = vi.spyOn(api, 'searchVehicles').mockResolvedValue({ vehicles: [makeVehicle({ make: 'Kia' })] });
    vi.spyOn(api, 'stats').mockResolvedValue({ stats });

    const { result } = renderHook(() => useInventory({ make: 'Kia' }));

    await waitFor(() => expect(result.current.vehicles[0]?.make).toBe('Kia'));
    expect(search).toHaveBeenCalledWith({ make: 'Kia' });
  });

  it('exposes load errors', async () => {
    vi.spyOn(api, 'listVehicles').mockRejectedValue(new Error('boom'));
    vi.spyOn(api, 'stats').mockResolvedValue({ stats });

    const { result } = renderHook(() => useInventory({}));

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.loading).toBe(false);
  });
});

describe('useVisibleVehicles', () => {
  const cheap = makeVehicle({ id: '1', make: 'Kia', price: 10000, quantity: 0 });
  const mid = makeVehicle({ id: '2', make: 'Audi', price: 30000, quantity: 2 });
  const pricey = makeVehicle({ id: '3', make: 'BMW', price: 90000, quantity: 5 });
  const all = [cheap, mid, pricey];
  const ids = (list: { id: string }[]) => list.map(v => v.id);

  it('hides sold-out cars when asked', () => {
    const { result } = renderHook(() => useVisibleVehicles(all, true, 'featured'));
    expect(ids(result.current)).toEqual(['2', '3']);
  });

  it('sorts by price in both directions and by name', () => {
    expect(ids(renderHook(() => useVisibleVehicles(all, false, 'price-asc')).result.current)).toEqual(['1', '2', '3']);
    expect(ids(renderHook(() => useVisibleVehicles(all, false, 'price-desc')).result.current)).toEqual(['3', '2', '1']);
    expect(ids(renderHook(() => useVisibleVehicles(all, false, 'name')).result.current)).toEqual(['2', '3', '1']);
  });

  it('puts in-stock cars first for the featured order', () => {
    const { result } = renderHook(() => useVisibleVehicles(all, false, 'featured'));
    expect(ids(result.current)).toEqual(['2', '3', '1']);
  });
});
