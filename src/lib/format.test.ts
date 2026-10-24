import { describe, expect, it } from 'vitest';
import { formatPrice, stockLabel, stockLevel } from './format';

describe('format helpers', () => {
  it('formats whole-dollar prices', () => {
    expect(formatPrice(131300)).toBe('$131,300');
  });

  it.each([
    [0, 'out', 'Sold out'],
    [1, 'low', 'Only 1 left'],
    [2, 'low', 'Only 2 left'],
    [3, 'in', '3 in stock']
  ] as const)('describes a stock of %i as %s', (quantity, level, label) => {
    expect(stockLevel(quantity)).toBe(level);
    expect(stockLabel(quantity)).toBe(label);
  });
});
