const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });

export const formatPrice = (value: number) => currency.format(value);
export const formatCompactPrice = (value: number) => compact.format(value);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export type StockLevel = 'out' | 'low' | 'in';

/** Two or fewer units counts as "low" so buyers know to hurry. */
export function stockLevel(quantity: number): StockLevel {
  if (quantity <= 0) return 'out';
  if (quantity <= 2) return 'low';
  return 'in';
}

export function stockLabel(quantity: number): string {
  const level = stockLevel(quantity);
  if (level === 'out') return 'Sold out';
  if (level === 'low') return `Only ${quantity} left`;
  return `${quantity} in stock`;
}
