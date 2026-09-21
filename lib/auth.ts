import { User } from './types';

const TOKEN_KEY = 'shopit_admin_token';
const USER_KEY = 'shopit_admin_user';

export function saveAdminAuth(token: string, user: Partial<User>) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    // Also remove any legacy localStorage entries
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function getAdminToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function getAdminUser(): Partial<User> | null {
  if (typeof window !== 'undefined') {
    const data = sessionStorage.getItem(USER_KEY);
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
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminToken();
}

