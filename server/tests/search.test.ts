import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestContext, createUserWithToken, createVehicle, type TestContext } from './helpers.js';

describe('GET /api/vehicles/search', () => {
  let ctx: TestContext;
  let auth: Record<string, string>;

  beforeAll(async () => {
    ctx = await createTestContext();
    const admin = (await createUserWithToken(ctx, 'admin')).auth;
    auth = (await createUserWithToken(ctx, 'user')).auth;
    await createVehicle(ctx, admin, { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 21500 });
    await createVehicle(ctx, admin, { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 31000 });
    await createVehicle(ctx, admin, { make: 'Ford', model: 'F-150', category: 'Truck', price: 38900 });
    await createVehicle(ctx, admin, { make: 'Tesla', model: 'Model Y', category: 'SUV', price: 44990 });
    await createVehicle(ctx, admin, { make: 'Porsche', model: '911 Carrera', category: 'Coupe', price: 114400 });
  });

  afterAll(async () => {
    await ctx.db.close();
  });

  const search = async (query: Record<string, string | number>) => {
    const res = await request(ctx.app).get('/api/vehicles/search').query(query).set(auth);
    return { status: res.status, body: res.body, models: (res.body.vehicles ?? []).map((v: { model: string }) => v.model) };
  };

  it('matches make case-insensitively', async () => {
    const { status, models } = await search({ make: 'toyota' });

    expect(status).toBe(200);
    expect(models.sort()).toEqual(['Corolla', 'RAV4']);
  });

  it('matches partial model names', async () => {
    const { models } = await search({ model: 'model' });

    expect(models).toEqual(['Model Y']);
  });

  it('filters by exact category, ignoring case', async () => {
    const { models } = await search({ category: 'suv' });

    expect(models.sort()).toEqual(['Model Y', 'RAV4']);
  });

  it('filters by an inclusive price range', async () => {
    const { models } = await search({ minPrice: 31000, maxPrice: 44990 });

    expect(models.sort()).toEqual(['F-150', 'Model Y', 'RAV4']);
  });

  it('supports only a lower or only an upper bound', async () => {
    expect((await search({ minPrice: 100000 })).models).toEqual(['911 Carrera']);
    expect((await search({ maxPrice: 22000 })).models).toEqual(['Corolla']);
  });

  it('combines filters with AND', async () => {
    const { models } = await search({ make: 'Toyota', category: 'SUV', maxPrice: 40000 });

    expect(models).toEqual(['RAV4']);
  });

  it('returns everything when no filters are given', async () => {
    const { models } = await search({});

    expect(models).toHaveLength(5);
  });

  it('treats SQL wildcard characters literally', async () => {
    const { models } = await search({ make: '%' });

    expect(models).toEqual([]);
  });

  it('returns 400 for a non-numeric price', async () => {
    const { status } = await search({ minPrice: 'cheap' });

    expect(status).toBe(400);
  });

  it('returns 400 when minPrice is greater than maxPrice', async () => {
    const { status, body } = await search({ minPrice: 50000, maxPrice: 1000 });

    expect(status).toBe(400);
    expect(body.error.details[0].message).toMatch(/minPrice/);
  });
});
