import { getSession, setSession, clearSession } from '../stores/session.js';

/**
 * ============================================================================
 * Lumi Insert — Core API Client
 * ============================================================================
 * Every one of the 80 backend endpoints is called through `apiRequest()` so
 * that auth headers, content-type serialization, the {data, errors,
 * requestId} envelope, and 401 → refresh → retry all live in exactly one
 * place.
 *
 * Response envelope contract (every JSON endpoint):
 *   { "data": <payload>, "errors": string | null, "requestId": string }
 * On success we resolve with `data` only. On failure we throw an ApiError.
 * ============================================================================
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://lumi-insert.com';

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, requestId?: string, raw?: unknown }} [info]
   */
  constructor(message, info = {}) {
    super(message || 'Something went wrong while talking to the server.');
    this.name = 'ApiError';
    this.status = info.status ?? 0;
    this.requestId = info.requestId ?? null;
    this.raw = info.raw ?? null;
  }
}

/** Thrown when the session could not be refreshed and the user must log in again. */
export class SessionExpiredError extends ApiError {
  constructor(info = {}) {
    super('Your session has expired. Please sign in again.', info);
    this.name = 'SessionExpiredError';
  }
}

// ----------------------------------------------------------------------------
// Query string helpers
// ----------------------------------------------------------------------------

/**
 * Flattens a plain filter/pagination object into a query string.
 * - Skips undefined/null/empty-string values so optional filters stay optional.
 * - Booleans are sent as "true"/"false".
 * - Arrays are sent as repeated keys (key=a&key=b), matching Spring's
 *   collection binding.
 * @param {Record<string, unknown>} [params]
 */
export function buildQueryString(params) {
  if (!params) return '';
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null || item === '') continue;
        search.append(key, String(item));
      }
      continue;
    }

    if (value instanceof Date) {
      search.append(key, value.toISOString());
      continue;
    }

    search.append(key, String(value));
  }

  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// ----------------------------------------------------------------------------
// Body serialization helpers
// ----------------------------------------------------------------------------

/** Converts a plain object into `application/x-www-form-urlencoded` body text. */
function toUrlEncoded(body) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(body ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, String(item));
      continue;
    }
    if (value instanceof Date) {
      search.append(key, value.toISOString());
      continue;
    }
    search.append(key, String(value));
  }
  return search.toString();
}

/**
 * Converts a plain object (values may be string/number/boolean/Date/File/
 * File[]) into FormData for `multipart/form-data` requests — used by every
 * file-upload endpoint (customer pictures, employee profile photo, memo
 * images, transaction/supply payment proof).
 */
function toFormData(body) {
  const form = new FormData();
  for (const [key, value] of Object.entries(body ?? {})) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      for (const item of value) form.append(key, item);
      continue;
    }

    if (value instanceof File || value instanceof Blob) {
      form.append(key, value);
      continue;
    }

    if (value instanceof Date) {
      form.append(key, value.toISOString());
      continue;
    }

    form.append(key, String(value));
  }
  return form;
}

// ----------------------------------------------------------------------------
// Token refresh (single-flight, so concurrent 401s only trigger one refresh)
// ----------------------------------------------------------------------------

let refreshInFlight = null;

/**
 * Calls POST /api/auth/refresh directly (bypassing apiRequest to avoid
 * recursion) and updates the session store with the new tokens.
 * @returns {Promise<string>} the new access token
 */
function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const response = await fetch(`/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include' // refreshToken travels as a cookie per the API spec
      });

      const payload = await safeParseJson(response);

      if (!response.ok || !payload?.data?.accessToken) {
        clearSession();
        throw new SessionExpiredError({ status: response.status, requestId: payload?.requestId, raw: payload });
      }

      setSession(payload.data);
      return payload.data.accessToken;
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function safeParseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// Core request function
// ----------------------------------------------------------------------------

/**
 * @typedef {Object} ApiRequestOptions
 * @property {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [method='GET']
 * @property {Record<string, unknown>} [params]           Query string params (flat object).
 * @property {Record<string, unknown>} [body]              Request body (plain object).
 * @property {'json'|'form'|'multipart'|'none'} [bodyType='json']
 * @property {boolean} [auth=true]                         Attach `Authorization: Bearer <token>`.
 * @property {boolean} [withCredentials=false]              Send the refreshToken cookie (login/refresh/logout).
 * @property {'json'|'blob'} [responseType='json']          'blob' for PDF/XLSX export endpoints.
 * @property {boolean} [_isRetry]                           Internal — prevents infinite refresh loops.
 */

/**
 * Calls one Lumi Insert backend endpoint.
 * @param {string} path e.g. '/api/products/1'
 * @param {ApiRequestOptions} [options]
 */
export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    params,
    body,
    bodyType = 'json',
    auth = true,
    withCredentials = false,
    responseType = 'json',
    _isRetry = false
  } = options;

  const headers = {};
  let requestBody;

  if (bodyType === 'json' && body !== undefined) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  } else if (bodyType === 'form' && body !== undefined) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    requestBody = toUrlEncoded(body);
  } else if (bodyType === 'multipart' && body !== undefined) {
    // Do NOT set Content-Type manually — the browser needs to add the
    // multipart boundary itself.
    requestBody = toFormData(body);
  }

  if (auth) {
    const token = getSession()?.accessToken;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${path}${buildQueryString(params)}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: requestBody,
      credentials: withCredentials ? 'include' : 'same-origin'
    });
  } catch (networkErr) {
    throw new ApiError('Could not reach the server. Check your connection and try again.', {
      status: 0,
      raw: networkErr
    });
  }

  // --- 401: try one silent refresh-and-retry, unless this already is a retry
  if (response.status === 401 && auth && !_isRetry) {
    try {
      await refreshSession();
      return apiRequest(path, { ...options, _isRetry: true });
    } catch (refreshErr) {
      throw refreshErr instanceof ApiError
        ? refreshErr
        : new SessionExpiredError({ status: 401 });
    }
  }

  // --- Binary responses (PDF invoice, XLSX export) skip the JSON envelope
  if (responseType === 'blob') {
    if (!response.ok) {
      const payload = await safeParseJson(response);
      throw new ApiError(payload?.errors || `Export failed (HTTP ${response.status}).`, {
        status: response.status,
        requestId: payload?.requestId,
        raw: payload
      });
    }
    return response.blob();
  }

  // --- Standard { data, errors, requestId } envelope
  const payload = await safeParseJson(response);

  if (!response.ok || payload?.errors) {
    throw new ApiError(payload?.errors || `Request failed (HTTP ${response.status}).`, {
      status: response.status,
      requestId: payload?.requestId,
      raw: payload
    });
  }

  return payload?.data;
}

/** Exposed so api/auth.js can offer a manual "refresh now" action reusing the same single-flight logic. */
export { refreshSession };
