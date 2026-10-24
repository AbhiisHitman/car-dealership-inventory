import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';
import { buildSearchClause, escapeLike } from '../src/repositories/vehicleRepository.js';
import { ValidationError } from '../src/errors.js';
import { searchVehiclesSchema } from '../src/validation/schemas.js';
import { validate } from '../src/validation/validate.js';

describe('buildSearchClause', () => {
  it('returns no WHERE clause without filters', () => {
    expect(buildSearchClause({})).toEqual({ where: '', params: [] });
  });

  it('numbers placeholders in the order filters are applied', () => {
    const { where, params } = buildSearchClause({ make: 'Kia', category: 'SUV', maxPrice: 30000 });

    expect(where).toBe("WHERE make ILIKE $1 ESCAPE '\\' AND lower(category) = lower($2) AND price <= $3");
    expect(params).toEqual(['%Kia%', 'SUV', 30000]);
  });

  it('keeps a zero price bound instead of dropping it', () => {
    expect(buildSearchClause({ minPrice: 0 }).params).toEqual([0]);
  });
});

describe('escapeLike', () => {
  it('escapes %, _ and backslashes', () => {
    expect(escapeLike('50%_off\\')).toBe('50\\%\\_off\\\\');
  });
});

describe('validate', () => {
  it('returns parsed data and coerces query-string numbers', () => {
    expect(validate(searchVehiclesSchema, { minPrice: '100', make: ' bmw ' })).toEqual({ minPrice: 100, make: 'bmw' });
  });

  it('treats empty query values as absent filters', () => {
    expect(validate(searchVehiclesSchema, { make: '', minPrice: '' })).toEqual({});
  });

  it('throws a ValidationError with field details', () => {
    try {
      validate(searchVehiclesSchema, { maxPrice: 'abc' });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).details).toEqual([{ field: 'maxPrice', message: expect.any(String) }]);
    }
  });
});

describe('loadConfig', () => {
  it('uses development defaults', () => {
    const config = loadConfig({});

    expect(config.databaseUrl).toBeUndefined();
    expect(config.port).toBe(4000);
    expect(config.jwtSecret.length).toBeGreaterThan(20);
    expect(config.admin).toBeUndefined();
    expect(config.seedDemoData).toBe(true);
  });

  it('refuses to run in production without a JWT secret', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow(/JWT_SECRET/);
  });

  it('reads the admin seed and database settings', () => {
    const config = loadConfig({
      DATABASE_URL: 'postgres://db/app',
      JWT_SECRET: 's'.repeat(32),
      ADMIN_EMAIL: 'boss@example.com',
      ADMIN_PASSWORD: 'Password123',
      SEED_DEMO_DATA: 'false'
    });

    expect(config.databaseUrl).toBe('postgres://db/app');
    expect(config.admin).toEqual({ email: 'boss@example.com', password: 'Password123', name: 'Administrator' });
    expect(config.seedDemoData).toBe(false);
  });
});
