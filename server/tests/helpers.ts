import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../src/app.js';
import { createPgliteDatabase, type Database } from '../src/db/database.js';
import { migrate } from '../src/db/migrate.js';
import { buildContainer, type Container } from '../src/container.js';
import type { AppConfig } from '../src/config.js';
import type { Role } from '../src/domain/user.js';

export const testConfig: AppConfig = {
  databaseUrl: undefined,
  dataDir: undefined,
  jwtSecret: 'test-secret-that-is-long-enough-for-hs256',
  jwtExpiresIn: '1h',
  port: 0,
  corsOrigin: undefined,
  admin: undefined,
  seedDemoData: false
};

export interface TestContext {
  app: Express;
  db: Database;
  container: Container;
}

/** Builds a fresh app backed by an isolated in-memory Postgres (PGlite) instance. */
export async function createTestContext(): Promise<TestContext> {
  const db = await createPgliteDatabase();
  await migrate(db);
  const container = buildContainer(db, testConfig);
  return { app: createApp(container, testConfig), db, container };
}

/** Removes every row so each test starts from a clean slate without paying the DB boot cost again. */
export async function resetDatabase(db: Database): Promise<void> {
  await db.exec('TRUNCATE purchases, vehicles, users RESTART IDENTITY CASCADE');
}

let userCounter = 0;

/** Registers a user directly through the service layer and returns a bearer token for it. */
export async function createUserWithToken(ctx: TestContext, role: Role = 'user') {
  userCounter += 1;
  const { user, token } = await ctx.container.authService.register(
    { name: `Test ${role} ${userCounter}`, email: `${role}${userCounter}@example.com`, password: 'Password123!' },
    role
  );
  return { user, token, auth: { Authorization: `Bearer ${token}` } };
}

export const sampleVehicle = {
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  price: 21500,
  quantity: 4,
  year: 2024
};

/** Creates a vehicle through the API as an admin and returns the response body. */
export async function createVehicle(ctx: TestContext, adminAuth: Record<string, string>, overrides: Record<string, unknown> = {}) {
  const res = await request(ctx.app).post('/api/vehicles').set(adminAuth).send({ ...sampleVehicle, ...overrides });
  if (res.status !== 201) throw new Error(`Vehicle creation failed: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.vehicle;
}
