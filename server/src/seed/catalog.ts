import type { Database } from '../db/database.js';
import type { VehicleRepository } from '../repositories/vehicleRepository.js';
import type { CreateVehicleInput } from '../validation/schemas.js';

export interface CatalogRefreshResult {
  removed: number;
  added: number;
  updated: number;
}

/**
 * Brings an existing database in line with the current demo catalogue:
 * - legacy demo cars that are no longer in the catalogue are deleted (purchase history keeps their label),
 * - catalogue cars that already exist are updated in place, keeping their current stock,
 * - missing catalogue cars are added.
 * Vehicles an admin added that are not part of either list are never touched.
 */
export async function refreshDemoCatalog(
  db: Database,
  vehicles: VehicleRepository,
  legacy: { make: string; model: string }[],
  current: CreateVehicleInput[]
): Promise<CatalogRefreshResult> {
  const key = (v: { make: string; model: string }) => `${v.make}|${v.model}`.toLowerCase();
  const keep = new Set(current.map(key));
  const result: CatalogRefreshResult = { removed: 0, added: 0, updated: 0 };

  for (const old of legacy.filter(v => !keep.has(key(v)))) {
    const rows = await db.query(`DELETE FROM vehicles WHERE lower(make) = lower($1) AND lower(model) = lower($2) RETURNING id`, [
      old.make,
      old.model
    ]);
    result.removed += rows.length;
  }

  for (const vehicle of current) {
    const existing = await vehicles.findByMakeModel(vehicle.make, vehicle.model);
    if (existing) {
      const { quantity: _stockStaysAsIs, ...details } = vehicle;
      await vehicles.update(existing.id, details);
      result.updated += 1;
    } else {
      await vehicles.create(vehicle);
      result.added += 1;
    }
  }
  return result;
}
