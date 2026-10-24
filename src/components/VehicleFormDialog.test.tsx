import { describe, expect, it } from 'vitest';
import { toPayload } from './VehicleFormDialog';

describe('toPayload', () => {
  const base = { make: ' Kia ', model: 'EV9', category: 'Electric', price: '73900', quantity: '4', year: '', color: '  ', description: '' };

  it('trims text and converts numbers', () => {
    expect(toPayload(base)).toEqual({
      make: 'Kia',
      model: 'EV9',
      category: 'Electric',
      price: 73900,
      quantity: 4,
      year: null,
      color: null,
      description: null
    });
  });

  it('sends a blank price as null so the API rejects it instead of saving $0', () => {
    const body = JSON.parse(JSON.stringify(toPayload({ ...base, price: '' })));
    expect(body.price).toBeNull();
  });
});
