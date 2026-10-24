import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createTestContext, type TestContext } from './helpers.js';

describe('error handling', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  afterAll(async () => {
    await ctx.db.close();
  });

  it('rejects malformed JSON with a 400', async () => {
    const res = await request(ctx.app).post('/api/auth/login').set('Content-Type', 'application/json').send('{"email":');

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Malformed JSON body');
  });

  it('hides unexpected errors behind a generic 500', async () => {
    const login = vi.spyOn(ctx.container.authService, 'login').mockRejectedValue(new Error('db exploded'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const res = await request(ctx.app).post('/api/auth/login').send({ email: 'a@example.com', password: 'x' });

    expect(res.status).toBe(500);
    expect(res.body.error.message).toBe('Something went wrong on our side');
    expect(JSON.stringify(res.body)).not.toContain('db exploded');
    log.mockRestore();
    login.mockRestore();
  });

  it('rejects a token whose account was deleted', async () => {
    const token = ctx.container.tokenService.sign({ id: '00000000-0000-4000-8000-000000000000', role: 'user' });
    const res = await request(ctx.app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
  });

  it('sends security headers', async () => {
    const res = await request(ctx.app).get('/api/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
