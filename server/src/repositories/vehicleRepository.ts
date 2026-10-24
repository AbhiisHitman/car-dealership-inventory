import type { Database } from '../db/database.js';
import type { Vehicle, VehicleSearchFilters } from '../domain/vehicle.js';
import type { CreateVehicleInput, UpdateVehicleInput } from '../validation/schemas.js';

export interface VehicleRow {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number | string;
  quantity: number;
  year: number | null;
  color: string | null;
  description: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export const toVehicle = (row: VehicleRow): Vehicle => ({
  id: row.id,
  make: row.make,
  model: row.model,
  category: row.category,
  price: Number(row.price),
  quantity: row.quantity,
  year: row.year,
  color: row.color,
  description: row.description,
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString()
});

/** Columns a client may write, mapped to their SQL names. */
const WRITABLE_COLUMNS = ['make', 'model', 'category', 'price', 'quantity', 'year', 'color', 'description'] as const;

/** Escapes LIKE wildcards so user input such as "%" is matched literally. */
export const escapeLike = (value: string) => value.replace(/[\\%_]/g, match => `\\${match}`);

/**
 * Turns search filters into a parameterised WHERE clause.
 * Exported separately so the SQL building can be unit-tested without a database.
 */
export function buildSearchClause(filters: VehicleSearchFilters): { where: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];
  const add = (sql: (placeholder: string) => string, value: unknown) => {
    params.push(value);
    conditions.push(sql(`$${params.length}`));
  };

  if (filters.make) add(p => `make ILIKE ${p} ESCAPE '\\'`, `%${escapeLike(filters.make)}%`);
  if (filters.model) add(p => `model ILIKE ${p} ESCAPE '\\'`, `%${escapeLike(filters.model)}%`);
  if (filters.category) add(p => `lower(category) = lower(${p})`, filters.category);
  if (filters.minPrice !== undefined) add(p => `price >= ${p}`, filters.minPrice);
  if (filters.maxPrice !== undefined) add(p => `price <= ${p}`, filters.maxPrice);

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params };
}

export class VehicleRepository {
  constructor(private readonly db: Database) {}

  async create(input: CreateVehicleInput): Promise<Vehicle> {
    const values = WRITABLE_COLUMNS.map(column => input[column] ?? null);
    const placeholders = WRITABLE_COLUMNS.map((_, i) => `$${i + 1}`).join(', ');
    const [row] = await this.db.query<VehicleRow>(
      `INSERT INTO vehicles (${WRITABLE_COLUMNS.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return toVehicle(row);
  }

  async findAll(): Promise<Vehicle[]> {
    return this.search({});
  }

  async search(filters: VehicleSearchFilters): Promise<Vehicle[]> {
    const { where, params } = buildSearchClause(filters);
    const rows = await this.db.query<VehicleRow>(
      `SELECT * FROM vehicles ${where} ORDER BY make ASC, model ASC, created_at ASC`,
      params
    );
    return rows.map(toVehicle);
  }

  async findById(id: string): Promise<Vehicle | undefined> {
    const [row] = await this.db.query<VehicleRow>(`SELECT * FROM vehicles WHERE id = $1`, [id]);
    return row ? toVehicle(row) : undefined;
  }

  async update(id: string, changes: UpdateVehicleInput): Promise<Vehicle | undefined> {
    const columns = WRITABLE_COLUMNS.filter(column => changes[column] !== undefined);
    const assignments = columns.map((column, i) => `${column} = $${i + 2}`);
    const [row] = await this.db.query<VehicleRow>(
      `UPDATE vehicles SET ${[...assignments, 'updated_at = now()'].join(', ')} WHERE id = $1 RETURNING *`,
      [id, ...columns.map(column => changes[column])]
    );
    return row ? toVehicle(row) : undefined;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db.query(`DELETE FROM vehicles WHERE id = $1 RETURNING id`, [id]);
    return rows.length > 0;
  }

  async count(): Promise<number> {
    const [row] = await this.db.query<{ count: number | string }>(`SELECT count(*)::int AS count FROM vehicles`);
    return Number(row.count);
  }
}
