import { describe, expect, it, vi } from 'vitest';
import { ApiError, api, onUnauthorized, toQuery, tokenStore } from './api';

const respond = (status: number, body: unknown) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

describe('toQuery', () => {
  it('drops empty and whitespace-only filters', () => {
    expect(toQuery({ make: ' Kia ', model: '', category: '  ', minPrice: '1000' })).toBe('make=Kia&minPrice=1000');
  });
});

describe('request', () => {
  it('sends the stored token as a bearer header', async () => {
    tokenStore.set('abc.def.ghi');
    const fetchMock = respond(200, { vehicles: [] });

    await api.listVehicles();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/vehicles');
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer abc.def.ghi');
  });

  it('turns error responses into ApiError with validation details', async () => {
    respond(400, { error: { message: 'Validation failed', details: [{ field: 'price', message: 'Price cannot be negative' }] } });

    const error = await api.createVehicle({ make: 'A', model: 'B', category: 'C', price: -1, quantity: 0 }).catch(e => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.details[0].message).toBe('Price cannot be negative');
  });

  it('notifies listeners when a signed-in request is rejected with 401', async () => {
    tokenStore.set('expired');
    respond(401, { error: { message: 'Invalid or expired token' } });
    const listener = vi.fn();
    const unsubscribe = onUnauthorized(listener);

    await api.me().catch(() => undefined);
    unsubscribe();

    expect(listener).toHaveBeenCalledOnce();
  });

  it('reports network failures with a friendly message', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(api.stats()).rejects.toMatchObject({ status: 0, message: expect.stringMatching(/cannot reach/i) });
  });

  it('encodes search filters into the query string', async () => {
    const fetchMock = respond(200, { vehicles: [] });

    await api.searchVehicles({ category: 'SUV', maxPrice: '40000' });

    expect(fetchMock.mock.calls[0][0]).toBe('/api/vehicles/search?category=SUV&maxPrice=40000');
  });
});
