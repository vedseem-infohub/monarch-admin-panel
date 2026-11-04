// Utilities for managing admin session cookies and local storage synchronously
export const ADMIN_TOKEN_KEY = 'monarch_admin_token';
export const ADMIN_USER_KEY = 'monarch_admin_user';

export function setAdminSession(token: string, user: any, rememberMe: boolean = true) {
  if (typeof window === 'undefined') return;

  const maxAge = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // 7 days or 1 day
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';

  // Write cookie so Next.js server middleware can read it immediately
  document.cookie = `${ADMIN_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;

  // Store in localStorage for client-side API clients and contexts
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  } catch {
    // ignore quota/private browsing errors
  }
}

export function clearAdminSession() {
  if (typeof window === 'undefined') return;

  // Clear cookies with expired date and path=/
  document.cookie = `${ADMIN_TOKEN_KEY}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  document.cookie = `token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;

  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    localStorage.removeItem('monarch_auth_token');
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
  } catch {
    // ignore
  }
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const fromLocal = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (fromLocal) return fromLocal;
  } catch {
    // continue to cookie
  }

  // Parse cookie
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + ADMIN_TOKEN_KEY + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function getStoredAdminUser(): any | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY) || sessionStorage.getItem(ADMIN_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    return null;
  }
  return null;
}

