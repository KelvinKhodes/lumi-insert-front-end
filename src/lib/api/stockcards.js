import { apiRequest } from './client.js';

/**
 * Stock Cards — 4/4 endpoints
 *   GET  /api/stockcards         → getStockCards
 *   POST /api/stockcards         → createStockCard
 *   GET  /api/stockcards/{id}    → getStockCard
 *   GET  /api/stockcards/search  → searchStockCards
 */

/**
 * @param {{ lastId?: string, page?: number, size?: number, sortBy?: string, sortDirection?: 'ASC'|'DESC' }} [filters]
 *   lastId enables cursor-based pagination.
 */
export async function getStockCards(filters = {}) {
  return apiRequest('/api/stockcards', { method: 'GET', params: filters });
}

/**
 * @param {{ referenceId: string, productId: number, quantity: number,
 *   type: 'CUSTOMER_IN'|'CUSTOMER_OUT'|'DEFECT'|'REPAIRED'|'SUPPLIER_IN'|'SUPPLIER_OUT', description?: string }} payload
 */
export async function createStockCard(payload) {
  return apiRequest('/api/stockcards', {
    method: 'POST',
    bodyType: 'form',
    body: payload
  });
}

/** @param {string} id stock card UUID */
export async function getStockCard(id) {
  return apiRequest(`/api/stockcards/${id}`, { method: 'GET' });
}

/**
 * @param {{ page?: number, size?: number, sortBy?: string, sortDirection?: 'ASC'|'DESC', lastId?: string,
 *   productId?: number, type?: string, minCreatedAt?: string, maxCreatedAt?: string }} [filters]
 */
export async function searchStockCards(filters = {}) {
  return apiRequest('/api/stockcards/search', { method: 'GET', params: filters });
}
