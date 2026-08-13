import { apiRequest } from './client.js';

/**
 * Memos — 6/6 endpoints
 *   GET   /api/memos             → getMemos
 *   POST  /api/memos             → createMemo
 *   GET   /api/memos/{id}        → getMemo
 *   PATCH /api/memos/{id}        → updateMemo
 *   POST  /api/memos/{id}/read   → markMemoAsRead
 *   POST  /api/memos/{id}/archive → archiveMemo
 */

/**
 * @param {{ updatedAt?: string }} [filters] ISO date-time; defaults to 1 month ago on the backend.
 */
export async function getMemos(filters = {}) {
  return apiRequest('/api/memos', { method: 'GET', params: filters });
}

/**
 * @param {{ title: string, body: string, images?: File[], role?: 'FINANCE'|'CASHIER'|'WAREHOUSE'|'OWNER' }} payload
 */
export async function createMemo(payload) {
  return apiRequest('/api/memos', {
    method: 'POST',
    bodyType: 'multipart',
    body: payload
  });
}

/** @param {number|string} id */
export async function getMemo(id) {
  return apiRequest(`/api/memos/${id}`, { method: 'GET' });
}

/**
 * @param {number|string} id
 * @param {{ title?: string, body?: string, role?: 'FINANCE'|'CASHIER'|'WAREHOUSE'|'OWNER' }} payload
 */
export async function updateMemo(id, payload) {
  return apiRequest(`/api/memos/${id}`, {
    method: 'PATCH',
    bodyType: 'form',
    body: payload
  });
}

/** @param {number|string} id */
export async function markMemoAsRead(id) {
  return apiRequest(`/api/memos/${id}/read`, { method: 'POST' });
}

/** @param {number|string} id */
export async function archiveMemo(id) {
  return apiRequest(`/api/memos/${id}/archive`, { method: 'POST' });
}
