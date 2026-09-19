import { getAdminToken, clearAdminAuth } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/ecommerce-api';

export async function apiRequest<T = any>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  overrideToken?: string
): Promise<T> {
  const token = overrideToken || getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const res = await fetch(BASE_URL + endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMessage = data.error || ('HTTP ' + res.status + ': Request failed');
    if (res.status === 401 || res.status === 403 || /invalid or expired token|unauthorized/i.test(errorMessage)) {
      clearAdminAuth();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shopit_admin_unauthorized'));
      }
    }
    throw new Error(errorMessage);
  }

  return data as T;
}
