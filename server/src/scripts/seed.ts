import { bootstrap } from '../bootstrap.js';
import { loadConfig } from '../config.js';
import { createPgliteDatabase, createPostgresDatabase } from '../db/database.js';

/** `npm run seed`: applies the schema, demo catalogue and admin account, then exits. */
const config = loadConfig();
const db = config.databaseUrl ? await createPostgresDatabase(config.databaseUrl) : await createPgliteDatabase(config.dataDir);
const container = await bootstrap(db, config);
const stats = await container.inventoryService.stats();
console.log(`Database ready: ${stats.models} vehicles, ${stats.unitsInStock} units in stock.`);
await db.close();
