import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { api } from '../lib/api';
import type { User } from '../lib/types';

export const customer: User = { id: 'u1', name: 'Ada Lovelace', email: 'ada@example.com', role: 'user' };
export const admin: User = { id: 'u2', name: 'Morgan Reyes', email: 'morgan@example.com', role: 'admin' };

/** Renders UI inside the real providers. Passing a user simulates a stored, valid session. */
export function renderWithProviders(ui: ReactElement, { route = '/', user }: { route?: string; user?: User } = {}) {
  if (user) {
    localStorage.setItem('dealership.token', 'test-token');
    vi.spyOn(api, 'me').mockResolvedValue({ user });
  }
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <ToastProvider>{ui}</ToastProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}
