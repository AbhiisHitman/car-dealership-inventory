import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, onUnauthorized, tokenStore } from '../lib/api';
import type { User } from '../lib/types';

interface AuthState {
  user: User | null;
  /** True while a stored token is being checked on first load. */
  loading: boolean;
  isAdmin: boolean;
  login(email: string, password: string): Promise<User>;
  register(name: string, email: string, password: string): Promise<User>;
  logout(): void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
  }, []);

  useEffect(() => onUnauthorized(logout), [logout]);

  // Restore the session from a saved token.
  useEffect(() => {
    if (!tokenStore.get()) return;
    let active = true;
    api
      .me()
      .then(({ user }) => active && setUser(user))
      .catch(() => active && logout())
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [logout]);

  const accept = useCallback(({ user, token }: { user: User; token: string }) => {
    tokenStore.set(token);
    setUser(user);
    return user;
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login: (email, password) => api.login({ email, password }).then(accept),
      register: (name, email, password) => api.register({ name, email, password }).then(accept),
      logout
    }),
    [user, loading, accept, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
