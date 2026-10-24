import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api';
import type { InventoryStats, SearchFilters, Vehicle } from '../lib/types';
import type { SortKey } from '../components/FilterBar';
import { useDebouncedValue } from './useDebouncedValue';

export const hasFilters = (filters: SearchFilters) => Object.values(filters).some(v => v !== undefined && String(v).trim() !== '');

/**
 * Loads vehicles from the API, using /vehicles/search whenever a filter is set.
 * Responses that arrive out of order are ignored, so fast typing never shows stale results.
 */
export function useInventory(filters: SearchFilters) {
  const debounced = useDebouncedValue(filters, 300);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const requestId = useRef(0);

  const load = useCallback(async (current: SearchFilters) => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const { vehicles } = hasFilters(current) ? await api.searchVehicles(current) : await api.listVehicles();
      if (id === requestId.current) setVehicles(vehicles);
    } catch (err) {
      if (id === requestId.current) setError(err);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  const loadStats = useCallback(() => {
    api
      .stats()
      .then(({ stats }) => setStats(stats))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    load(debounced);
  }, [debounced, load]);

  useEffect(loadStats, [loadStats]);

  const replace = useCallback(
    (vehicle: Vehicle) => {
      setVehicles(list => list.map(v => (v.id === vehicle.id ? vehicle : v)));
      loadStats();
    },
    [loadStats]
  );

  const remove = useCallback(
    (id: string) => {
      setVehicles(list => list.filter(v => v.id !== id));
      loadStats();
    },
    [loadStats]
  );

  const reload = useCallback(() => {
    load(debounced);
    loadStats();
  }, [debounced, load, loadStats]);

  return { vehicles, stats, loading, error, replace, remove, reload };
}

/** Client-side view options that do not need a round trip. */
export function useVisibleVehicles(vehicles: Vehicle[], inStockOnly: boolean, sort: SortKey) {
  return useMemo(() => {
    const list = inStockOnly ? vehicles.filter(v => v.quantity > 0) : [...vehicles];
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'name') list.sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
    // "featured": in-stock cars first, keeping the server's make/model order within each group.
    if (sort === 'featured') list.sort((a, b) => Number(b.quantity > 0) - Number(a.quantity > 0));
    return list;
  }, [vehicles, inStockOnly, sort]);
}
