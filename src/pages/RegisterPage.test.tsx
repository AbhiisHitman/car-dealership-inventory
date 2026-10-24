import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { ApiError, api } from '../lib/api';
import { renderWithProviders } from '../test/renderApp';
import { RegisterPage } from './RegisterPage';

vi.mock('../components/reactbits/CrystalizedBall', async () => ({ default: (await import('../test/reactbitsMocks')).DecorMock }));

const renderRegister = () =>
  renderWithProviders(
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/inventory" element={<p>Showroom page</p>} />
    </Routes>,
    { route: '/register' }
  );

const fill = async () => {
  await userEvent.type(screen.getByLabelText('Full name'), 'Grace Hopper');
  await userEvent.type(screen.getByLabelText('Email'), 'grace@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'Compiler1952');
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
};

describe('RegisterPage', () => {
  it('creates the account and opens the showroom', async () => {
    const register = vi.spyOn(api, 'register').mockResolvedValue({
      token: 't',
      user: { id: '9', name: 'Grace Hopper', email: 'grace@example.com', role: 'user' }
    });
    renderRegister();

    await fill();

    expect(register).toHaveBeenCalledWith({ name: 'Grace Hopper', email: 'grace@example.com', password: 'Compiler1952' });
    expect(await screen.findByText('Showroom page')).toBeInTheDocument();
  });

  it('shows why registration failed', async () => {
    vi.spyOn(api, 'register').mockRejectedValue(new ApiError('That email is already registered', 409));
    renderRegister();

    await fill();

    expect(await screen.findByRole('alert')).toHaveTextContent('That email is already registered');
  });
});
