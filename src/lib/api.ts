import type { InventoryStats, Purchase, SearchFilters, User, Vehicle, VehicleInput } from './types';

const TOKEN_KEY = 'dealership.token';

export interface FieldIssue {
  field?: string;
  message: string;
}

/** An error response from the API, with the HTTP status and any validation details. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details: FieldIssue[] = []
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string | null) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Storage can be unavailable (private mode); the session then lasts until reload.
    }
  }
};

type Listener = () => void;
const unauthorizedListeners = new Set<Listener>();

/** Lets the auth layer log out when any request comes back 401. */
export function onUnauthorized(listener: Listener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = tokenStore.get();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body) headers.set('Content-Type', 'application/json');

  let response: Response;
  try {
    response = await fetch(`/api${path}`, { ...init, headers });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) unauthorizedListeners.forEach(listener => listener());
    throw new ApiError(body?.error?.message ?? `Request failed (${response.status})`, response.status, body?.error?.details);
  }
  return body as T;
}

const json = (method: string, data?: unknown): RequestInit => ({
  method,
  body: data === undefined ? undefined : JSON.stringify(data)
});

/** Drops empty filters so they never reach the query string. */
export function toQuery(filters: SearchFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && String(value).trim() !== '') params.set(key, String(value).trim());
  });
  return params.toString();
}

export const api = {
  register: (data: { name: string; email: string; password: string }) =>
    request<{ user: User; token: string }>('/auth/register', json('POST', data)),
  login: (data: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/auth/login', json('POST', data)),
  me: () => request<{ user: User }>('/auth/me'),

  listVehicles: () => request<{ vehicles: Vehicle[] }>('/vehicles'),
  searchVehicles: (filters: SearchFilters) => request<{ vehicles: Vehicle[] }>(`/vehicles/search?${toQuery(filters)}`),
  stats: () => request<{ stats: InventoryStats }>('/vehicles/stats'),
  createVehicle: (data: VehicleInput) => request<{ vehicle: Vehicle }>('/vehicles', json('POST', data)),
  updateVehicle: (id: string, data: Partial<VehicleInput>) =>
    request<{ vehicle: Vehicle }>(`/vehicles/${id}`, json('PUT', data)),
  deleteVehicle: (id: string) => request<void>(`/vehicles/${id}`, { method: 'DELETE' }),
  purchase: (id: string, quantity: number) =>
    request<{ vehicle: Vehicle; purchase: Purchase }>(`/vehicles/${id}/purchase`, json('POST', { quantity })),
  restock: (id: string, quantity: number) =>
    request<{ vehicle: Vehicle }>(`/vehicles/${id}/restock`, json('POST', { quantity })),
  purchases: () => request<{ purchases: Purchase[] }>('/purchases')
};
