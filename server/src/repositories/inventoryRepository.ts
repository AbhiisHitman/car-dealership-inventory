import type { Database } from '../db/database.js';
import type { InventoryStats, Purchase } from '../domain/purchase.js';
import type { Vehicle } from '../domain/vehicle.js';
import { toVehicle, type VehicleRow } from './vehicleRepository.js';

interface PurchaseRow {
  id: string;
  vehicle_id: string | null;
  vehicle_label: string;
  quantity: number;
  unit_price: number | string;
  created_at: Date | string;
}

/** A vehicle row joined with the purchase it was just sold in. */
interface SaleRow extends VehicleRow {
  purchase_id: string;
  purchase_label: string;
  purchase_quantity: number;
  purchase_unit_price: number | string;
  purchase_created_at: Date | string;
}

const toPurchase = (row: PurchaseRow): Purchase => {
  const unitPrice = Number(row.unit_price);
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    vehicleLabel: row.vehicle_label,
    quantity: row.quantity,
    unitPrice,
    total: unitPrice * row.quantity,
    createdAt: new Date(row.created_at).toISOString()
  };
};

/** Stock movements and the purchase ledger. */
export class InventoryRepository {
  constructor(private readonly db: Database) {}

  /**
   * Decrements stock and records the sale in ONE statement. The "quantity >= $2" guard is
   * re-evaluated under the row lock, so two buyers can never both take the last car.
   * Returns undefined when there was not enough stock (or the vehicle does not exist).
   */
  async purchase(vehicleId: string, userId: string, quantity: number): Promise<{ vehicle: Vehicle; purchase: Purchase } | undefined> {
    const [row] = await this.db.query<SaleRow>(
      `WITH updated AS (
         UPDATE vehicles SET quantity = quantity - $2, updated_at = now()
         WHERE id = $1 AND quantity >= $2
         RETURNING *
       ), recorded AS (
         INSERT INTO purchases (user_id, vehicle_id, vehicle_label, quantity, unit_price)
         SELECT $3, id, concat_ws(' ', year, make, model), $2, price FROM updated
         RETURNING id, vehicle_id, vehicle_label, quantity, unit_price, created_at
       )
       SELECT updated.*,
              recorded.id AS purchase_id,
              recorded.vehicle_label AS purchase_label,
              recorded.quantity AS purchase_quantity,
              recorded.unit_price AS purchase_unit_price,
              recorded.created_at AS purchase_created_at
       FROM updated, recorded`,
      [vehicleId, quantity, userId]
    );
    if (!row) return undefined;
    return {
      vehicle: toVehicle(row),
      purchase: toPurchase({
        id: row.purchase_id,
        vehicle_id: row.id,
        vehicle_label: row.purchase_label,
        quantity: row.purchase_quantity,
        unit_price: row.purchase_unit_price,
        created_at: row.purchase_created_at
      })
    };
  }

  async restock(vehicleId: string, quantity: number): Promise<Vehicle | undefined> {
    const [row] = await this.db.query<VehicleRow>(
      `UPDATE vehicles SET quantity = quantity + $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [vehicleId, quantity]
    );
    return row ? toVehicle(row) : undefined;
  }

  async purchasesForUser(userId: string): Promise<Purchase[]> {
    const rows = await this.db.query<PurchaseRow>(
      `SELECT * FROM purchases WHERE user_id = $1 ORDER BY created_at DESC, id DESC`,
      [userId]
    );
    return rows.map(toPurchase);
  }

  async stats(): Promise<InventoryStats> {
    const [totals] = await this.db.query<Record<string, number | string>>(
      `SELECT count(*)::int AS models,
              coalesce(sum(quantity), 0)::int AS units,
              count(*) FILTER (WHERE quantity = 0)::int AS out_of_stock,
              coalesce(sum(price * quantity), 0) AS value
       FROM vehicles`
    );
    const categories = await this.db.query<{ category: string }>(`SELECT DISTINCT category FROM vehicles`);
    return {
      models: Number(totals.models),
      unitsInStock: Number(totals.units),
      outOfStock: Number(totals.out_of_stock),
      inventoryValue: Number(totals.value),
      categories: categories
        .map(row => row.category)
        .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
    };
  }
}
