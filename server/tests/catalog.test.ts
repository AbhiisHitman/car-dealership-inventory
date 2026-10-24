import { afterEach, describe, expect, it } from 'vitest';
import { createPgliteDatabase, type Database } from '../src/db/database.js';
import { migrate } from '../src/db/migrate.js';
import { buildContainer } from '../src/container.js';
import { refreshDemoCatalog } from '../src/seed/catalog.js';
import { testConfig } from './helpers.js';

const legacy = [{ make: 'Toyota', model: 'Corolla Hybrid' }];
const current = [
  { make: 'Toyota', model: 'Corolla LE', category: 'Sedan', price: 23125, quantity: 5, year: 2026 },
  { make: 'Honda', model: 'Accord LX', category: 'Sedan', price: 28395, quantity: 3, year: 2026 }
];

describe('refreshDemoCatalog', () => {
  let db: Database | undefined;

  afterEach(async () => {
    await db?.close();
    db = undefined;
  });

  const setup = async () => {
    db = await createPgliteDatabase();
    await migrate(db);
    return buildContainer(db, testConfig);
  };

  it('replaces legacy demo cars with the current catalogue and keeps admin-added cars', async () => {
    const c = await setup();
    await c.vehicles.create({ make: 'Toyota', model: 'Corolla Hybrid', category: 'Sedan', price: 1, quantity: 1 });
    await c.vehicles.create({ make: 'Lotus', model: 'Emira', category: 'Coupe', price: 99000, quantity: 1 });

    const result = await refreshDemoCatalog(db!, c.vehicles, legacy, current);
    const models = (await c.vehicleService.list()).map(v => v.model).sort();

    expect(result).toEqual({ removed: 1, added: 2, updated: 0 });
    expect(models).toEqual(['Accord LX', 'Corolla LE', 'Emira']);
  });

  it('updates catalogue cars that already exist instead of duplicating them, keeping their stock', async () => {
    const c = await setup();
    const existing = await c.vehicles.create({ make: 'Honda', model: 'Accord LX', category: 'Sedan', price: 1, quantity: 9 });

    const result = await refreshDemoCatalog(db!, c.vehicles, legacy, current);
    const accord = await c.vehicleService.get(existing.id);

    expect(result).toEqual({ removed: 0, added: 1, updated: 1 });
    expect(accord).toMatchObject({ price: 28395, year: 2026, quantity: 9 });
  });

  it('keeps purchase history when a legacy car is removed', async () => {
    const c = await setup();
    const old = await c.vehicles.create({ make: 'Toyota', model: 'Corolla Hybrid', category: 'Sedan', price: 100, quantity: 2 });
    const { user } = await c.authService.register({ name: 'Buyer', email: 'buyer@example.com', password: 'Password123!' });
    await c.inventoryService.purchase(old.id, user.id, 1);

    await refreshDemoCatalog(db!, c.vehicles, legacy, current);

    const history = await c.inventoryService.purchasesFor(user.id);
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ vehicleId: null, vehicleLabel: 'Toyota Corolla Hybrid' });
  });
});
