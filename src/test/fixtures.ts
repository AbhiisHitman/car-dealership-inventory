import type { Vehicle } from '../lib/types';

export const makeVehicle = (overrides: Partial<Vehicle> = {}): Vehicle => ({
  id: 'b3d1c6c2-1d7a-4c55-9a51-6f1c1a1e0001',
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  price: 21500,
  quantity: 4,
  year: 2024,
  color: 'Celestite Grey',
  description: 'Reliable daily driver.',
  imageUrl: null,
  imageCredit: null,
  imageSourceUrl: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides
});
