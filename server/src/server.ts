import type { Express } from 'express';
import { createApp } from './app.js';
import { bootstrap } from './bootstrap.js';
import { loadConfig } from './config.js';
import { createPgliteDatabase, createPostgresDatabase } from './db/database.js';

let appPromise: Promise<Express> | undefined;

/**
 * Lazily builds one app per process. Serverless runtimes reuse warm instances,
 * so the database pool and migrations are only set up on a cold start.
 */
export function getApp(): Promise<Express> {
  appPromise ??= (async () => {
    const config = loadConfig();
    const db = config.databaseUrl
      ? await createPostgresDatabase(config.databaseUrl)
      : await createPgliteDatabase(config.dataDir);
    const container = await bootstrap(db, config);
    return createApp(container, config);
  })().catch(error => {
    appPromise = undefined;
    throw error;
  });
  return appPromise;
}
