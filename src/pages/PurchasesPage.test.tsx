import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { api } from '../lib/api';
import { customer, renderWithProviders } from '../test/renderApp';
import { PurchasesPage } from './PurchasesPage';

describe('PurchasesPage', () => {
  it('lists purchases with totals', async () => {
    vi.spyOn(api, 'purchases').mockResolvedValue({
      purchases: [
        { id: 'p2', vehicleId: null, vehicleLabel: '2025 Mazda MX-5', quantity: 1, unitPrice: 38000, total: 38000, createdAt: '2026-03-02T10:00:00Z' },
        { id: 'p1', vehicleId: 'v1', vehicleLabel: '2024 Toyota Corolla', quantity: 2, unitPrice: 20000, total: 40000, createdAt: '2026-03-01T10:00:00Z' }
      ]
    });
    renderWithProviders(<PurchasesPage />, { user: customer });

    expect(await screen.findByText('2024 Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('$78,000')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/no longer listed/)).toBeInTheDocument();
  });

  it('invites the user to shop when the garage is empty', async () => {
    vi.spyOn(api, 'purchases').mockResolvedValue({ purchases: [] });
    renderWithProviders(<PurchasesPage />, { user: customer });

    expect(await screen.findByRole('link', { name: 'Browse the showroom' })).toHaveAttribute('href', '/inventory');
  });

  it('shows load errors', async () => {
    vi.spyOn(api, 'purchases').mockRejectedValue(new Error('Server unavailable'));
    renderWithProviders(<PurchasesPage />, { user: customer });

    expect(await screen.findByRole('alert')).toHaveTextContent('Server unavailable');
  });
});
