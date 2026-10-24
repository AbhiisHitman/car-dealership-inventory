import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { ApiError, api } from '../lib/api';
import { LoginPage } from './LoginPage';

// WebGL is not available in jsdom, so the decorative ball is replaced with an empty box.
vi.mock('../components/reactbits/CrystalizedBall', () => ({ default: () => <div data-testid="ball" /> }));

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/inventory" element={<p>Showroom page</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

describe('LoginPage', () => {
  it('signs in, stores the token and goes to the showroom', async () => {
    const login = vi.spyOn(api, 'login').mockResolvedValue({
      token: 'jwt-token',
      user: { id: '1', name: 'Ada', email: 'ada@example.com', role: 'user' }
    });
    renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'SuperSecret1');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Showroom page')).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'SuperSecret1' });
    expect(localStorage.getItem('dealership.token')).toBe('jwt-token');
  });

  it('shows the server error when credentials are wrong', async () => {
    vi.spyOn(api, 'login').mockRejectedValue(new ApiError('Invalid email or password', 401));
    renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'nope');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });
});
