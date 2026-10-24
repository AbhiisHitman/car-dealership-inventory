import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  createTestContext,
  createUserWithToken,
  createVehicle,
  resetDatabase,
  sampleVehicle,
  type TestContext
} from './helpers.js';

describe('Vehicles API', () => {
  let ctx: TestContext;
  let admin: Record<string, string>;
  let customer: Record<string, string>;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  beforeEach(async () => {
    await resetDatabase(ctx.db);
    admin = (await createUserWithToken(ctx, 'admin')).auth;
    customer = (await createUserWithToken(ctx, 'user')).auth;
  });

  afterAll(async () => {
    await ctx.db.close();
  });

  describe('authentication', () => {
    it.each([
      ['get', '/api/vehicles'],
      ['get', '/api/vehicles/search'],
      ['post', '/api/vehicles'],
      ['put', '/api/vehicles/00000000-0000-4000-8000-000000000000'],
      ['delete', '/api/vehicles/00000000-0000-4000-8000-000000000000']
    ] as const)('%s %s requires a token', async (method, path) => {
      const res = await request(ctx.app)[method](path);

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/vehicles', () => {
    it('lets an admin add a vehicle with a generated id', async () => {
      const res = await request(ctx.app).post('/api/vehicles').set(admin).send(sampleVehicle);

      expect(res.status).toBe(201);
      expect(res.body.vehicle).toMatchObject(sampleVehicle);
      expect(res.body.vehicle.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('forbids regular users from adding vehicles', async () => {
      const res = await request(ctx.app).post('/api/vehicles').set(customer).send(sampleVehicle);

      expect(res.status).toBe(403);
    });

    it.each([
      ['a missing make', { ...sampleVehicle, make: undefined }],
      ['a negative price', { ...sampleVehicle, price: -1 }],
      ['a fractional quantity', { ...sampleVehicle, quantity: 1.5 }],
      ['a negative quantity', { ...sampleVehicle, quantity: -3 }],
      ['an empty category', { ...sampleVehicle, category: '  ' }]
    ])('returns 400 for %s', async (_label, body) => {
      const res = await request(ctx.app).post('/api/vehicles').set(admin).send(body);

      expect(res.status).toBe(400);
    });

    it('stores an optional photo with its credit', async () => {
      const photo = {
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Car.jpg/800px-Car.jpg',
        imageCredit: 'Jane Doe, CC BY-SA 4.0',
        imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Car.jpg'
      };
      const res = await request(ctx.app).post('/api/vehicles').set(admin).send({ ...sampleVehicle, ...photo });

      expect(res.status).toBe(201);
      expect(res.body.vehicle).toMatchObject(photo);
    });

    it('leaves the photo fields null when no photo is given', async () => {
      const res = await request(ctx.app).post('/api/vehicles').set(admin).send(sampleVehicle);

      expect(res.body.vehicle).toMatchObject({ imageUrl: null, imageCredit: null, imageSourceUrl: null });
    });

    it.each(['javascript:alert(1)', 'ftp://example.com/car.jpg', 'not a url'])('rejects the photo URL %s', async imageUrl => {
      const res = await request(ctx.app).post('/api/vehicles').set(admin).send({ ...sampleVehicle, imageUrl });

      expect(res.status).toBe(400);
    });

    it('defaults quantity to zero when omitted', async () => {
      const { quantity: _omit, ...withoutQuantity } = sampleVehicle;
      const res = await request(ctx.app).post('/api/vehicles').set(admin).send(withoutQuantity);

      expect(res.status).toBe(201);
      expect(res.body.vehicle.quantity).toBe(0);
    });
  });

  describe('GET /api/vehicles', () => {
    it('lists every vehicle for any signed-in user', async () => {
      await createVehicle(ctx, admin, { make: 'Honda', model: 'Civic' });
      await createVehicle(ctx, admin, { make: 'Tesla', model: 'Model 3', category: 'Electric', quantity: 0 });

      const res = await request(ctx.app).get('/api/vehicles').set(customer);

      expect(res.status).toBe(200);
      expect(res.body.vehicles).toHaveLength(2);
      expect(res.body.vehicles.map((v: { make: string }) => v.make).sort()).toEqual(['Honda', 'Tesla']);
    });

    it('returns an empty list when the lot is empty', async () => {
      const res = await request(ctx.app).get('/api/vehicles').set(customer);

      expect(res.body.vehicles).toEqual([]);
    });
  });

  describe('GET /api/vehicles/:id', () => {
    it('returns a single vehicle', async () => {
      const created = await createVehicle(ctx, admin);
      const res = await request(ctx.app).get(`/api/vehicles/${created.id}`).set(customer);

      expect(res.status).toBe(200);
      expect(res.body.vehicle.id).toBe(created.id);
    });

    it('returns 404 for malformed or unknown ids', async () => {
      const malformed = await request(ctx.app).get('/api/vehicles/not-a-uuid').set(customer);
      const unknown = await request(ctx.app).get('/api/vehicles/00000000-0000-4000-8000-000000000000').set(customer);

      expect(malformed.status).toBe(404);
      expect(unknown.status).toBe(404);
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('updates only the supplied fields', async () => {
      const created = await createVehicle(ctx, admin);
      const res = await request(ctx.app)
        .put(`/api/vehicles/${created.id}`)
        .set(admin)
        .send({ price: 19999, color: 'Midnight Blue' });

      expect(res.status).toBe(200);
      expect(res.body.vehicle).toMatchObject({ ...sampleVehicle, price: 19999, color: 'Midnight Blue' });
    });

    it('can remove a photo by setting it to null', async () => {
      const created = await createVehicle(ctx, admin, { imageUrl: 'https://example.com/car.jpg' });
      const res = await request(ctx.app).put(`/api/vehicles/${created.id}`).set(admin).send({ imageUrl: null });

      expect(res.status).toBe(200);
      expect(res.body.vehicle.imageUrl).toBeNull();
    });

    it('returns 400 for an empty update', async () => {
      const created = await createVehicle(ctx, admin);
      const res = await request(ctx.app).put(`/api/vehicles/${created.id}`).set(admin).send({});

      expect(res.status).toBe(400);
    });

    it('returns 404 for an unknown vehicle', async () => {
      const res = await request(ctx.app)
        .put('/api/vehicles/00000000-0000-4000-8000-000000000000')
        .set(admin)
        .send({ price: 1 });

      expect(res.status).toBe(404);
    });

    it('forbids regular users from editing vehicles', async () => {
      const created = await createVehicle(ctx, admin);
      const res = await request(ctx.app).put(`/api/vehicles/${created.id}`).set(customer).send({ price: 1 });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('lets an admin delete a vehicle', async () => {
      const created = await createVehicle(ctx, admin);
      const res = await request(ctx.app).delete(`/api/vehicles/${created.id}`).set(admin);
      const after = await request(ctx.app).get(`/api/vehicles/${created.id}`).set(admin);

      expect(res.status).toBe(204);
      expect(after.status).toBe(404);
    });

    it('forbids regular users from deleting', async () => {
      const created = await createVehicle(ctx, admin);
      const res = await request(ctx.app).delete(`/api/vehicles/${created.id}`).set(customer);

      expect(res.status).toBe(403);
    });

    it('returns 404 for an unknown vehicle', async () => {
      const res = await request(ctx.app).delete('/api/vehicles/00000000-0000-4000-8000-000000000000').set(admin);

      expect(res.status).toBe(404);
    });
  });
});
