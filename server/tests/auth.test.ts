import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestContext, resetDatabase, type TestContext } from './helpers.js';

describe('Auth API', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  beforeEach(async () => {
    await resetDatabase(ctx.db);
  });

  afterAll(async () => {
    await ctx.db.close();
  });

  const newUser = { name: 'Ada Lovelace', email: 'Ada@Example.com', password: 'SuperSecret1' };

  describe('POST /api/auth/register', () => {
    it('creates a user and returns a token without leaking the password hash', async () => {
      const res = await request(ctx.app).post('/api/auth/register').send(newUser);

      expect(res.status).toBe(201);
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body.user).toMatchObject({ name: 'Ada Lovelace', email: 'ada@example.com', role: 'user' });
      expect(res.body.user.id).toEqual(expect.any(String));
      expect(res.body.user).not.toHaveProperty('passwordHash');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('never lets a client register itself as an admin', async () => {
      const res = await request(ctx.app)
        .post('/api/auth/register')
        .send({ ...newUser, role: 'admin' });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('user');
    });

    it('rejects a duplicate email regardless of letter case', async () => {
      await request(ctx.app).post('/api/auth/register').send(newUser);
      const res = await request(ctx.app)
        .post('/api/auth/register')
        .send({ ...newUser, email: 'ADA@example.com' });

      expect(res.status).toBe(409);
      expect(res.body.error.message).toMatch(/already registered/i);
    });

    it.each([
      ['an invalid email', { ...newUser, email: 'not-an-email' }],
      ['a short password', { ...newUser, password: 'short' }],
      ['a missing name', { email: 'x@example.com', password: 'SuperSecret1' }]
    ])('returns 400 for %s', async (_label, body) => {
      const res = await request(ctx.app).post('/api/auth/register').send(body);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Validation failed');
      expect(res.body.error.details).toEqual(expect.any(Array));
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(ctx.app).post('/api/auth/register').send(newUser);
    });

    it('returns a token for valid credentials', async () => {
      const res = await request(ctx.app)
        .post('/api/auth/login')
        .send({ email: 'ada@example.com', password: 'SuperSecret1' });

      expect(res.status).toBe(200);
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body.user.email).toBe('ada@example.com');
    });

    it('rejects a wrong password with a generic message', async () => {
      const res = await request(ctx.app)
        .post('/api/auth/login')
        .send({ email: 'ada@example.com', password: 'WrongPassword1' });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('rejects an unknown email with the same generic message', async () => {
      const res = await request(ctx.app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'SuperSecret1' });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('returns 400 when fields are missing', async () => {
      const res = await request(ctx.app).post('/api/auth/login').send({ email: 'ada@example.com' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns the current user for a valid token', async () => {
      const { body } = await request(ctx.app).post('/api/auth/register').send(newUser);
      const res = await request(ctx.app).get('/api/auth/me').set('Authorization', `Bearer ${body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('ada@example.com');
    });

    it('returns 401 without a token', async () => {
      const res = await request(ctx.app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('returns 401 for a tampered token', async () => {
      const res = await request(ctx.app).get('/api/auth/me').set('Authorization', 'Bearer not.a.real-token');

      expect(res.status).toBe(401);
    });
  });

  describe('unknown routes', () => {
    it('returns a JSON 404', async () => {
      const res = await request(ctx.app).get('/api/does-not-exist');

      expect(res.status).toBe(404);
      expect(res.body.error.message).toMatch(/not found/i);
    });

    it('reports health without authentication', async () => {
      const res = await request(ctx.app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
