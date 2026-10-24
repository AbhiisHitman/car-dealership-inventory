import { mkdirSync } from 'node:fs';
import type { PGlite } from '@electric-sql/pglite';

/**
 * The minimal database contract the repositories depend on.
 * Both the embedded PGlite engine (local dev and tests) and a real Postgres server
 * (production) satisfy it, so repositories never know which one they talk to.
 */
export interface Database {
  /** Runs a single parameterised statement and returns its rows. */
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
  /** Runs one or more statements without parameters (migrations, truncation). */
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}

/**
 * Embedded Postgres compiled to WebAssembly. With a data directory it persists to disk;
 * without one it is an isolated in-memory instance, which is what the test suite uses.
 */
export async function createPgliteDatabase(dataDir?: string): Promise<Database> {
  const { PGlite } = await import('@electric-sql/pglite');
  if (dataDir) mkdirSync(dataDir, { recursive: true });
  const client: PGlite = dataDir ? new PGlite(dataDir) : new PGlite();
  await client.waitReady;
  return {
    async query<T>(text: string, params: unknown[] = []) {
      const result = await client.query<T>(text, params);
      return result.rows;
    },
    async exec(sql: string) {
      await client.exec(sql);
    },
    async close() {
      await client.close();
    }
  };
}

/** A pooled connection to a real Postgres server such as Neon. */
export async function createPostgresDatabase(connectionString: string): Promise<Database> {
  const { default: pg } = await import('pg');
  // Return NUMERIC columns as JS numbers; prices fit comfortably in a double.
  pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value: string) => Number(value));
  const needsSsl = !/localhost|127\.0\.0\.1/.test(connectionString);
  const pool = new pg.Pool({
    connectionString,
    max: 5,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined
  });
  return {
    async query<T>(text: string, params: unknown[] = []) {
      const result = await pool.query(text, params);
      return result.rows as T[];
    },
    async exec(sql: string) {
      await pool.query(sql);
    },
    async close() {
      await pool.end();
    }
  };
}
