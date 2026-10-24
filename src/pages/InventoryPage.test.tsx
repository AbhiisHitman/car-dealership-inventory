import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../lib/api';
import { makeVehicle } from '../test/fixtures';
import { admin, customer, renderWithProviders } from '../test/renderApp';
import { InventoryPage } from './InventoryPage';

vi.mock('../components/reactbits/FlyingButton', async () => ({ default: (await import('../test/reactbitsMocks')).FlyingButtonMock }));

const corolla = makeVehicle({ id: 'v1', make: 'Toyota', model: 'Corolla', quantity: 3, price: 20000 });
const miata = makeVehicle({ id: 'v2', make: 'Mazda', model: 'MX-5', category: 'Convertible', quantity: 0, price: 38000 });
const stats = { models: 2, unitsInStock: 3, outOfStock: 1, inventoryValue: 60000, categories: ['Convertible', 'Sedan'] };

beforeEach(() => {
  vi.spyOn(api, 'listVehicles').mockResolvedValue({ vehicles: [corolla, miata] });
  vi.spyOn(api, 'stats').mockResolvedValue({ stats });
});

const card = (name: string) => screen.getByRole('article', { name });

describe('InventoryPage for customers', () => {
  it('lists vehicles with stats and disables purchase for sold-out cars', async () => {
    renderWithProviders(<InventoryPage />, { user: customer });

    expect(await screen.findByRole('article', { name: 'Toyota Corolla' })).toBeInTheDocument();
    expect(screen.getByText('2 vehicles')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mazda MX-5 is sold out' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /add vehicle/i })).not.toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('buys a car and updates its stock in place', async () => {
    const purchase = vi.spyOn(api, 'purchase').mockResolvedValue({
      vehicle: { ...corolla, quantity: 1 },
      purchase: { id: 'p1', vehicleId: 'v1', vehicleLabel: '2024 Toyota Corolla', quantity: 2, unitPrice: 20000, total: 40000, createdAt: '2026-01-01T00:00:00Z' }
    });
    renderWithProviders(<InventoryPage />, { user: customer });

    await userEvent.click(await screen.findByRole('button', { name: 'Purchase Toyota Corolla' }));
    const dialog = screen.getByRole('dialog', { name: 'Confirm purchase' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Increase quantity' }));
    await userEvent.click(within(dialog).getByRole('button', { name: /confirm · \$40,000/i }));

    expect(purchase).toHaveBeenCalledWith('v1', 2);
    expect(await screen.findByRole('dialog', { name: 'It is yours.' })).toBeInTheDocument();
    expect(screen.getByText(/purchased 2 × 2024 toyota corolla/i)).toBeInTheDocument();
    expect(within(card('Toyota Corolla')).getByText('Only 1 left')).toBeInTheDocument();
  });

  it('shows the server message when a purchase fails', async () => {
    const { ApiError } = await import('../lib/api');
    vi.spyOn(api, 'purchase').mockRejectedValue(new ApiError('Only 1 Toyota Corolla left in stock', 409));
    renderWithProviders(<InventoryPage />, { user: customer });

    await userEvent.click(await screen.findByRole('button', { name: 'Purchase Toyota Corolla' }));
    await userEvent.click(screen.getByRole('button', { name: /confirm ·/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Only 1 Toyota Corolla left in stock');
  });

  it('switches to the search endpoint when filtering', async () => {
    const search = vi.spyOn(api, 'searchVehicles').mockResolvedValue({ vehicles: [miata] });
    renderWithProviders(<InventoryPage />, { user: customer });

    await userEvent.click(await screen.findByRole('button', { name: 'Convertible' }));

    await waitFor(() => expect(search).toHaveBeenCalledWith(expect.objectContaining({ category: 'Convertible' })));
    await waitFor(() => expect(screen.queryByRole('article', { name: 'Toyota Corolla' })).not.toBeInTheDocument());
  });

  it('shows an empty state when nothing matches', async () => {
    vi.spyOn(api, 'listVehicles').mockResolvedValue({ vehicles: [] });
    renderWithProviders(<InventoryPage />, { user: customer });

    expect(await screen.findByText('No cars match those filters')).toBeInTheDocument();
  });

  it('offers a retry when loading fails', async () => {
    vi.spyOn(api, 'listVehicles').mockRejectedValueOnce(new Error('Network down')).mockResolvedValue({ vehicles: [corolla] });
    renderWithProviders(<InventoryPage />, { user: customer });

    await userEvent.click(await screen.findByRole('button', { name: /try again/i }));

    expect(await screen.findByRole('article', { name: 'Toyota Corolla' })).toBeInTheDocument();
  });
});

describe('InventoryPage for admins', () => {
  it('adds a vehicle through the form', async () => {
    const create = vi.spyOn(api, 'createVehicle').mockResolvedValue({ vehicle: makeVehicle({ id: 'v3', make: 'Kia', model: 'EV9' }) });
    renderWithProviders(<InventoryPage />, { user: admin });

    await userEvent.click(await screen.findByRole('button', { name: /add vehicle/i }));
    const dialog = screen.getByRole('dialog', { name: 'Add a vehicle' });
    await userEvent.type(within(dialog).getByLabelText('Make *'), 'Kia');
    await userEvent.type(within(dialog).getByLabelText('Model *'), 'EV9');
    await userEvent.type(within(dialog).getByLabelText('Category *'), 'Electric');
    await userEvent.type(within(dialog).getByLabelText('Price (USD) *'), '73900');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Add vehicle' }));

    expect(create).toHaveBeenCalledWith(expect.objectContaining({ make: 'Kia', model: 'EV9', category: 'Electric', price: 73900, quantity: 1 }));
    expect(await screen.findByText('Kia EV9 added to the lot')).toBeInTheDocument();
    expect(screen.getByText('Stock value')).toBeInTheDocument();
  });

  it('shows validation errors from the API in the form', async () => {
    const { ApiError } = await import('../lib/api');
    vi.spyOn(api, 'createVehicle').mockRejectedValue(new ApiError('Validation failed', 400, [{ field: 'make', message: 'Make is required' }]));
    renderWithProviders(<InventoryPage />, { user: admin });

    await userEvent.click(await screen.findByRole('button', { name: /add vehicle/i }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Add vehicle' }));

    expect(await screen.findByText('Make is required')).toBeInTheDocument();
  });

  it('edits a vehicle and updates the card', async () => {
    const update = vi.spyOn(api, 'updateVehicle').mockResolvedValue({ vehicle: { ...corolla, price: 19500 } });
    renderWithProviders(<InventoryPage />, { user: admin });

    await userEvent.click(within(await screen.findByRole('article', { name: 'Toyota Corolla' })).getByRole('button', { name: /edit/i }));
    const price = within(screen.getByRole('dialog', { name: 'Edit vehicle' })).getByLabelText('Price (USD) *');
    await userEvent.clear(price);
    await userEvent.type(price, '19500');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(update).toHaveBeenCalledWith('v1', expect.objectContaining({ price: 19500 }));
    expect(await within(card('Toyota Corolla')).findByText('$19,500')).toBeInTheDocument();
  });

  it('restocks a sold-out vehicle', async () => {
    const restock = vi.spyOn(api, 'restock').mockResolvedValue({ vehicle: { ...miata, quantity: 10 } });
    renderWithProviders(<InventoryPage />, { user: admin });

    await userEvent.click(within(await screen.findByRole('article', { name: 'Mazda MX-5' })).getByRole('button', { name: /restock/i }));
    await userEvent.click(screen.getByRole('button', { name: '+10' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add 10 units' }));

    expect(restock).toHaveBeenCalledWith('v2', 10);
    expect(await within(card('Mazda MX-5')).findByRole('button', { name: 'Purchase Mazda MX-5' })).toBeEnabled();
  });

  it('deletes a vehicle after confirmation', async () => {
    const remove = vi.spyOn(api, 'deleteVehicle').mockResolvedValue(undefined);
    renderWithProviders(<InventoryPage />, { user: admin });

    await userEvent.click(await screen.findByRole('button', { name: 'Delete Toyota Corolla' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete vehicle' }));

    expect(remove).toHaveBeenCalledWith('v1');
    await waitFor(() => expect(screen.queryByRole('article', { name: 'Toyota Corolla' })).not.toBeInTheDocument());
  });

  it('keeps the confirmation open when deleting fails', async () => {
    vi.spyOn(api, 'deleteVehicle').mockRejectedValue(new Error('Vehicle not found'));
    renderWithProviders(<InventoryPage />, { user: admin });

    await userEvent.click(await screen.findByRole('button', { name: 'Delete Toyota Corolla' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete vehicle' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Vehicle not found');
    await userEvent.click(screen.getByRole('button', { name: 'Keep it' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
