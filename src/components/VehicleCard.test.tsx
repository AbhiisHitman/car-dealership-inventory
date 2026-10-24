import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { makeVehicle } from '../test/fixtures';
import { VehicleCard } from './VehicleCard';

const handlers = () => ({ onPurchase: vi.fn(), onEdit: vi.fn(), onRestock: vi.fn(), onDelete: vi.fn() });

describe('VehicleCard', () => {
  it('shows the vehicle details and price', () => {
    render(<VehicleCard vehicle={makeVehicle()} isAdmin={false} {...handlers()} />);

    expect(screen.getByRole('heading', { name: 'Corolla' })).toBeInTheDocument();
    expect(screen.getByText('$21,500')).toBeInTheDocument();
    expect(screen.getByText('4 in stock')).toBeInTheDocument();
  });

  it('calls onPurchase when the purchase button is clicked', async () => {
    const h = handlers();
    const vehicle = makeVehicle();
    render(<VehicleCard vehicle={vehicle} isAdmin={false} {...h} />);

    await userEvent.click(screen.getByRole('button', { name: 'Purchase Toyota Corolla' }));

    expect(h.onPurchase).toHaveBeenCalledWith(vehicle);
  });

  it('disables the purchase button when the quantity is zero', async () => {
    const h = handlers();
    render(<VehicleCard vehicle={makeVehicle({ quantity: 0 })} isAdmin={false} {...h} />);

    const button = screen.getByRole('button', { name: 'Toyota Corolla is sold out' });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(h.onPurchase).not.toHaveBeenCalled();
  });

  it('hides admin actions from regular users', () => {
    render(<VehicleCard vehicle={makeVehicle()} isAdmin={false} {...handlers()} />);

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('gives admins edit, restock and delete actions', async () => {
    const h = handlers();
    render(<VehicleCard vehicle={makeVehicle()} isAdmin {...h} />);

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    await userEvent.click(screen.getByRole('button', { name: /restock/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete Toyota Corolla' }));

    expect(h.onEdit).toHaveBeenCalledOnce();
    expect(h.onRestock).toHaveBeenCalledOnce();
    expect(h.onDelete).toHaveBeenCalledOnce();
  });
});
