import { apiUrl, apiConfigHint, getApiBase } from './base';

export type UserRole = 'PATIENT' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const AUTH_TOKEN_KEY = 'medivoice_auth_token';

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = apiUrl(path);
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new Error(`Cannot reach backend at ${url || '(same origin)'}. ${apiConfigHint()}`);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        `API not found (404) at ${url}. ${apiConfigHint()}`
      );
    }
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function registerUser(body: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserRole;
  inviteCode?: string;
}): Promise<AuthResponse> {
  return authFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return authFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
  const data = await authFetch<{ user: AuthUser }>('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.user;
}

export async function fetchAdminStats(token: string) {
  return authFetch<{ doctors: number; specialties: number; appointments: number; patients: number }>(
    '/api/admin/stats',
    { headers: { Authorization: `Bearer ${token}` } },
  );
}

export function getStoredToken(): string | null {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) return token;
  const legacy = localStorage.getItem('medivoice_patient_token')
    || localStorage.getItem('medivoice_admin_token');
  if (legacy) {
    localStorage.setItem(AUTH_TOKEN_KEY, legacy);
    localStorage.removeItem('medivoice_patient_token');
    localStorage.removeItem('medivoice_admin_token');
    return legacy;
  }
  return null;
}

export function storeToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem('medivoice_patient_token');
  localStorage.removeItem('medivoice_admin_token');
}

export function postLoginScreen(role: UserRole): 'admin' | 'language' {
  return role === 'ADMIN' ? 'admin' : 'language';
}

export { getApiBase };
