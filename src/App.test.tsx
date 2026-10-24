import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { api } from './lib/api';
import { admin, customer, renderWithProviders } from './test/renderApp';

vi.mock('./components/reactbits/FlyingButton', async () => ({ default: (await import('./test/reactbitsMocks')).FlyingButtonMock }));
vi.mock('./components/reactbits/CrystalizedBall', async () => ({ default: (await import('./test/reactbitsMocks')).DecorMock }));
vi.mock('./components/reactbits/PatternWaves', async () => ({ default: (await import('./test/reactbitsMocks')).DecorMock }));

const emptyInventory = () => {
  vi.spyOn(api, 'listVehicles').mockResolvedValue({ vehicles: [] });
  vi.spyOn(api, 'stats').mockResolvedValue({ stats: { models: 0, unitsInStock: 0, outOfStock: 0, inventoryValue: 0, categories: [] } });
};

describe('App routing', () => {
  it('shows the landing page to visitors', () => {
    renderWithProviders(<App />);

    expect(screen.getByRole('heading', { name: /see your next car/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Get the keys' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /create account/i }).length).toBeGreaterThan(0);
  });

  it('sends visitors to the login page when they open the showroom', async () => {
    renderWithProviders(<App />, { route: '/inventory' });

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });

  it('sends signed-in users from login to the showroom', async () => {
    emptyInventory();
    renderWithProviders(<App />, { route: '/login', user: customer });

    expect(await screen.findByRole('heading', { name: 'The showroom' })).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('marks admins in the navigation', async () => {
    emptyInventory();
    renderWithProviders(<App />, { route: '/inventory', user: admin });

    expect(await screen.findByText('Admin')).toBeInTheDocument();
  });

  it('signs out and returns to the login page', async () => {
    emptyInventory();
    renderWithProviders(<App />, { route: '/inventory', user: customer });

    await userEvent.click(await screen.findByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(localStorage.getItem('dealership.token')).toBeNull();
  });

  it('drops an invalid stored session', async () => {
    localStorage.setItem('dealership.token', 'expired');
    vi.spyOn(api, 'me').mockRejectedValue(new Error('Invalid or expired token'));
    renderWithProviders(<App />, { route: '/garage' });

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });

  it('renders a friendly 404', () => {
    renderWithProviders(<App />, { route: '/nowhere' });

    expect(screen.getByRole('heading', { name: 'Wrong turn' })).toBeInTheDocument();
  });
});
