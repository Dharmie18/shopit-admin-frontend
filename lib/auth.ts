import { User } from './types';

const TOKEN_KEY = 'shopit_admin_token';
const USER_KEY = 'shopit_admin_user';

export function saveAdminAuth(token: string, user: Partial<User>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getAdminToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function getAdminUser(): Partial<User> | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(USER_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function clearAdminAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminToken();
}
