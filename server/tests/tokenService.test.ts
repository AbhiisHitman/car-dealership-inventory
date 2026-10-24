import { describe, expect, it } from 'vitest';
import { TokenService } from '../src/services/tokenService.js';
import { UnauthorizedError } from '../src/errors.js';

describe('TokenService', () => {
  const service = new TokenService('unit-test-secret-that-is-long-enough', '1h');

  it('round-trips the user id and role', () => {
    const token = service.sign({ id: 'user-1', role: 'admin' });

    expect(service.verify(token)).toEqual({ id: 'user-1', role: 'admin' });
  });

  it('rejects tokens signed with another secret', () => {
    const other = new TokenService('a-completely-different-secret-value', '1h');
    const token = other.sign({ id: 'user-1', role: 'user' });

    expect(() => service.verify(token)).toThrow(UnauthorizedError);
  });

  it('rejects expired tokens', () => {
    const expired = new TokenService('unit-test-secret-that-is-long-enough', '-1s');
    const token = expired.sign({ id: 'user-1', role: 'user' });

    expect(() => service.verify(token)).toThrow(UnauthorizedError);
  });
});
