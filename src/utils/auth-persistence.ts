import type { AdminUser } from "@services/auth.service";

const AUTH_STORAGE_KEY = "auth-storage";

// We keep this interface for fallback compatibility, but actual
// user state will be handled by Zustand persist.
interface StoredAuth {
  user: AdminUser;
  accessToken: string;
  isAuthenticated: true;
}

/**
 * Helper to set a cookie string.
 */
function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax";
}

/**
 * Helper to delete a cookie.
 */
function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

/**
 * Helper to get a cookie value.
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function saveAuthToStorage(user: AdminUser, accessToken: string): void {
  try {
    const data: StoredAuth = { user, accessToken, isAuthenticated: true };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* localStorage unavailable */
  }
  // Store token in cookies for Middleware
  setCookie('authToken', accessToken, 7);
}

export function loadAuthFromStorage(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function clearAuthFromStorage(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Remove old token key if exists
    localStorage.removeItem("authToken");
  } catch {
    /* localStorage unavailable */
  }
  // Clear the cookie for middleware
  deleteCookie('authToken');
}
