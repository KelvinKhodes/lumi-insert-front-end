import { apiRequest, refreshSession } from './client.js';
import { setSession, clearSession } from '../stores/session.js';

/**
 * Authentication — 3/3 endpoints
 *   POST   /api/auth/login    → login
 *   POST   /api/auth/refresh  → refreshAccessToken
 *   DELETE /api/auth/logout   → logout
 *
 * Auth note: the spec marks all three as requiring a Bearer token, which
 * can't be true for /login (there is no token yet). In practice:
 *   - login sends no Authorization header (auth: false) and asks the
 *     browser to accept the refreshToken cookie the backend sets.
 *   - refresh/logout rely on that same cookie (withCredentials: true) per
 *     the spec's `refreshToken: in cookie` parameter, rather than us
 *     re-sending it manually.
 */

/**
 * Logs an employee in and stores the resulting session
 * (accessToken, refreshToken, employee, expiredAt).
 * @param {{ username: string, password: string }} credentials
 * @returns {Promise<{accessToken:string, refreshToken:string, employee:object, expiredAt:string}>}
 */
export async function login({ username, password }) {
  const data = await apiRequest('/api/auth/login', {
    method: 'POST',
    bodyType: 'form',
    body: { username, password },
    auth: false,
    withCredentials: true
  });
  setSession(data);
  return data;
}

/**
 * Manually refreshes the access token (the client also does this
 * automatically on a 401 — call this directly only for things like an
 * idle-timeout warning banner with a "stay signed in" button).
 * @returns {Promise<string>} the new access token
 */
export async function refreshAccessToken() {
  return refreshSession();
}

/**
 * Logs the current employee out. The session is cleared locally even if the
 * server call fails, so the UI never gets stuck in a signed-in state the
 * backend no longer recognizes.
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    await apiRequest('/api/auth/logout', {
      method: 'DELETE',
      withCredentials: true
    });
  } finally {
    clearSession();
  }
}
