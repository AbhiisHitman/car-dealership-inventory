import { afterEach, describe, expect, it } from 'vitest';
import { createPgliteDatabase, type Database } from '../src/db/database.js';
import { bootstrap } from '../src/bootstrap.js';
import { demoVehicles } from '../src/seed/demoVehicles.js';
import { testConfig } from './helpers.js';

describe('bootstrap', () => {
  let db: Database | undefined;

  afterEach(async () => {
    await db?.close();
    db = undefined;
  });

  const config = {
    ...testConfig,
    seedDemoData: true,
    admin: { email: 'Owner@Example.com', password: 'Password123!', name: 'Owner' }
  };

  it('migrates, seeds demo vehicles and creates the admin account', async () => {
    db = await createPgliteDatabase();
    const container = await bootstrap(db, config);

    const vehicles = await container.vehicleService.list();
    const login = await container.authService.login({ email: 'owner@example.com', password: 'Password123!' });

    expect(vehicles).toHaveLength(demoVehicles.length);
    expect(login.user.role).toBe('admin');
  });

  it('is idempotent and does not re-seed after the catalogue is emptied', async () => {
    db = await createPgliteDatabase();
    const container = await bootstrap(db, config);
    for (const vehicle of await container.vehicleService.list()) await container.vehicleService.remove(vehicle.id);

    const again = await bootstrap(db, config);

    expect(await again.vehicleService.list()).toEqual([]);
  });

  it('skips demo data when seeding is disabled', async () => {
    db = await createPgliteDatabase();
    const container = await bootstrap(db, { ...config, seedDemoData: false, admin: undefined });

    expect(await container.vehicleService.list()).toEqual([]);
  });
});
