import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestContext, createUserWithToken, createVehicle, resetDatabase, type TestContext } from './helpers.js';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

describe('Inventory API', () => {
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

  describe('POST /api/vehicles/:id/purchase', () => {
    it('decreases the quantity by one by default', async () => {
      const vehicle = await createVehicle(ctx, admin, { quantity: 3 });
      const res = await request(ctx.app).post(`/api/vehicles/${vehicle.id}/purchase`).set(customer);

      expect(res.status).toBe(200);
      expect(res.body.vehicle.quantity).toBe(2);
      expect(res.body.purchase).toMatchObject({ quantity: 1, unitPrice: vehicle.price, total: vehicle.price });
    });

    it('supports buying several units at once', async () => {
      const vehicle = await createVehicle(ctx, admin, { quantity: 5, price: 10000 });
      const res = await request(ctx.app).post(`/api/vehicles/${vehicle.id}/purchase`).set(customer).send({ quantity: 3 });

      expect(res.status).toBe(200);
      expect(res.body.vehicle.quantity).toBe(2);
      expect(res.body.purchase.total).toBe(30000);
    });

    it('returns 409 when the vehicle is out of stock', async () => {
      const vehicle = await createVehicle(ctx, admin, { quantity: 0 });
      const res = await request(ctx.app).post(`/api/vehicles/${vehicle.id}/purchase`).set(customer);

      expect(res.status).toBe(409);
      expect(res.body.error.message).toMatch(/out of stock/i);
    });

    it('returns 409 and leaves stock untouched when asking for more than is available', async () => {
      const vehicle = await createVehicle(ctx, admin, { quantity: 2 });
      const res = await request(ctx.app).post(`/api/vehicles/${vehicle.id}/purchase`).set(customer).send({ quantity: 3 });
      const after = await request(ctx.app).get(`/api/vehicles/${vehicle.id}`).set(customer);

      expect(res.status).toBe(409);
      expect(res.body.error.message).toMatch(/only 2/i);
      expect(after.body.vehicle.quantity).toBe(2);
    });

    it('never oversells under concurrent purchases', async () => {
      const vehicle = await createVehicle(ctx, admin, { quantity: 3 });
      const attempts = await Promise.all(
        Array.from({ length: 6 }, () => request(ctx.app).post(`/api/vehicles/${vehicle.id}/purchase`).set(customer))
      );
      const after = await request(ctx.app).get(`/api/vehicles/${vehicle.id}`).set(customer);

      expect(attempts.filter(r => r.status === 200)).toHaveLength(3);
      expect(attempts.filter(r => r.status === 409)).toHaveLength(3);
      expect(after.body.vehicle.quantity).toBe(0);
    });

    it('returns 404 for an unknown vehicle', async () => {
      const res = await request(ctx.app).post(`/api/vehicles/${UNKNOWN_ID}/purchase`).set(customer);

      expect(res.status).toBe(404);
    });

    it('returns 400 for an invalid quantity', async () => {
      const vehicle = await createVehicle(ctx, admin, { quantity: 2 });
      const res = await request(ctx.app).post(`/api/vehicles/${vehicle.id}/purchase`).set(customer).send({ quantity: 0 });

      expect(res.status).toBe(400);
    });

    it('requires authentication', async () => {
      const vehicle = await createVehicle(ctx, admin);
      const res = await request(ctx.app).post(`/api/vehicles/${vehicle.id}/purchase`);

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/vehicles/:id/restock', () => {
    it('lets an admin increase the quantity', async () => {
      const vehicle = await createVehicle(ctx, admin, { quantity: 1 });
      const res = await request(ctx.app).post(`/api/vehicles/${vehicle.id}/restock`).set(admin).send({ quantity: 4 });

      expect(res.status).toBe(200);
      expect(res.body.vehicle.quantity).toBe(5);
    });

    it('forbids regular users from restocking', async () => {
      const vehicle = await createVehicle(ctx, admin, { quantity: 1 });
      const res = await request(ctx.app).post(`/api/vehicles/${vehicle.id}/restock`).set(customer).send({ quantity: 4 });

      expect(res.status).toBe(403);
    });

    it.each([[0], [-2], [2.5], ['ten']])('returns 400 for quantity %s', async quantity => {
      const vehicle = await createVehicle(ctx, admin);
      const res = await request(ctx.app).post(`/api/vehicles/${vehicle.id}/restock`).set(admin).send({ quantity });

      expect(res.status).toBe(400);
    });

    it('requires a quantity', async () => {
      const vehicle = await createVehicle(ctx, admin);
      const res = await request(ctx.app).post(`/api/vehicles/${vehicle.id}/restock`).set(admin).send({});

      expect(res.status).toBe(400);
    });

    it('returns 404 for an unknown vehicle', async () => {
      const res = await request(ctx.app).post(`/api/vehicles/${UNKNOWN_ID}/restock`).set(admin).send({ quantity: 1 });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/purchases', () => {
    it("returns only the signed-in user's purchases, newest first", async () => {
      const first = await createVehicle(ctx, admin, { model: 'Corolla', quantity: 5 });
      const second = await createVehicle(ctx, admin, { model: 'Camry', quantity: 5 });
      const other = await createUserWithToken(ctx, 'user');
      await request(ctx.app).post(`/api/vehicles/${first.id}/purchase`).set(customer);
      await request(ctx.app).post(`/api/vehicles/${second.id}/purchase`).set(customer).send({ quantity: 2 });
      await request(ctx.app).post(`/api/vehicles/${first.id}/purchase`).set(other.auth);

      const res = await request(ctx.app).get('/api/purchases').set(customer);

      expect(res.status).toBe(200);
      expect(res.body.purchases).toHaveLength(2);
      expect(res.body.purchases[0]).toMatchObject({ vehicleLabel: '2024 Toyota Camry', quantity: 2 });
      expect(res.body.purchases[1]).toMatchObject({ vehicleLabel: '2024 Toyota Corolla', quantity: 1 });
    });

    it('keeps purchase history after the vehicle is deleted', async () => {
      const vehicle = await createVehicle(ctx, admin, { quantity: 2 });
      await request(ctx.app).post(`/api/vehicles/${vehicle.id}/purchase`).set(customer);
      await request(ctx.app).delete(`/api/vehicles/${vehicle.id}`).set(admin);

      const res = await request(ctx.app).get('/api/purchases').set(customer);

      expect(res.body.purchases).toHaveLength(1);
      expect(res.body.purchases[0].vehicleId).toBeNull();
    });
  });

  describe('GET /api/vehicles/stats', () => {
    it('summarises the inventory for the dashboard', async () => {
      await createVehicle(ctx, admin, { category: 'Sedan', quantity: 2, price: 20000 });
      await createVehicle(ctx, admin, { category: 'SUV', quantity: 0, price: 30000 });
      await createVehicle(ctx, admin, { category: 'SUV', quantity: 3, price: 40000 });

      const res = await request(ctx.app).get('/api/vehicles/stats').set(customer);

      expect(res.status).toBe(200);
      expect(res.body.stats).toEqual({
        models: 3,
        unitsInStock: 5,
        outOfStock: 1,
        inventoryValue: 160000,
        categories: ['Sedan', 'SUV']
      });
    });
  });
});
