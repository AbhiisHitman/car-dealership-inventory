import type { AppConfig } from './config.js';
import { buildContainer, type Container } from './container.js';
import type { Database } from './db/database.js';
import { migrate } from './db/migrate.js';
import { demoVehicles } from './seed/demoVehicles.js';

const DEMO_SEED_KEY = 'demo_vehicles_seeded';

/**
 * Prepares a database for use: schema, optional demo catalogue and the admin account.
 * Safe to call on every start. The demo seed is recorded in app_meta so emptying the
 * catalogue on purpose does not make it reappear on the next cold start.
 */
export async function bootstrap(db: Database, config: AppConfig): Promise<Container> {
  await migrate(db);
  const container = buildContainer(db, config);

  if (config.seedDemoData) {
    const claimed = await db.query(
      `INSERT INTO app_meta (key, value) VALUES ($1, now()::text) ON CONFLICT (key) DO NOTHING RETURNING key`,
      [DEMO_SEED_KEY]
    );
    if (claimed.length > 0 && (await container.vehicles.count()) === 0) {
      for (const vehicle of demoVehicles) await container.vehicles.create(vehicle);
    }
  }

  if (config.admin) {
    await container.authService.ensureAdmin(config.admin);
  }
  return container;
}
