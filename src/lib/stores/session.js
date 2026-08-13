import { writable } from 'svelte/store';

/**
 * Holds the current authenticated session.
 *
 * NOTE on refreshToken: the backend spec marks `refreshToken` as an
 * `in: cookie` parameter for /api/auth/refresh and /api/auth/logout, meaning
 * the browser is expected to send it automatically (the login endpoint most
 * likely sets it via a Set-Cookie header). We still keep a copy of the value
 * returned in the login response body as a fallback / for display purposes,
 * but every refresh/logout request relies on `credentials: 'include'` so the
 * cookie travels with the request rather than us re-attaching it manually.
 */

const STORAGE_KEY = 'lumi_insert_session';

/** @typedef {{ accessToken: string, refreshToken: string, employee: object, expiredAt: string } | null} Session */

/** @returns {Session} */
function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeToStorage(value) {
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable (private mode, SSR, etc.) — session simply
    // won't survive a reload; the app still works for the current tab.
  }
}

/** @type {import('svelte/store').Writable<Session>} */
export const session = writable(readFromStorage());

session.subscribe((value) => writeToStorage(value));

/** @param {Session} data */
export function setSession(data) {
  session.set(data);
}

export function clearSession() {
  session.set(null);
}

/** Convenience getter that doesn't require subscribing. */
export function getSession() {
  let current = null;
  session.subscribe((v) => (current = v))();
  return current;
}

/** True once a session with an access token exists. */
export function isAuthenticated() {
  return !!getSession()?.accessToken;
}
