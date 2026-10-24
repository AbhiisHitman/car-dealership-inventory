import { bootstrap } from '../bootstrap.js';
import { loadConfig } from '../config.js';
import { createPgliteDatabase, createPostgresDatabase } from '../db/database.js';
import { refreshDemoCatalog } from '../seed/catalog.js';
import { demoVehicles, legacyDemoVehicles } from '../seed/demoVehicles.js';

/**
 * `npm run catalog:refresh`: replaces the old demo cars with the current catalogue in an
 * already-seeded database (local PGlite, or Postgres when DATABASE_URL is set).
 */
const config = loadConfig();
const db = config.databaseUrl ? await createPostgresDatabase(config.databaseUrl) : await createPgliteDatabase(config.dataDir);
const container = await bootstrap(db, config);
const result = await refreshDemoCatalog(db, container.vehicles, legacyDemoVehicles, demoVehicles);
console.log(`Catalogue refreshed: ${result.removed} removed, ${result.added} added, ${result.updated} updated.`);
await db.close();
