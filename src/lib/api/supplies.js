import { apiRequest } from './client.js';

/**
 * Supplies — 8/8 endpoints
 *   POST /api/supplies                 → createSupply
 *   POST /api/supplies/{id}/refund     → refundSupplyItem
 *   POST /api/supplies/{id}/cancel     → cancelSupply
 *   GET  /api/supplies/{id}            → getSupply
 *   PATCH /api/supplies/{id}           → updateSupply
 *   GET  /api/supplies/{id}/pdf        → exportSupplyPdf
 *   GET  /api/supplies/search          → getSupplies
 *   GET  /api/supplies/history/export  → exportSuppliesHistory
 *
 * Unlike Transactions, a supply order is submitted as ONE request with the
 * full item list — createSupply is the only endpoint in the whole API that
 * uses `application/json`, because `supplyItems` is a nested array that
 * doesn't serialize cleanly as x-www-form-urlencoded.
 */

/**
 * @param {{ supplierId: string, invoiceId: string,
 *   supplyItems: { productId: number, price: number, quantity: number, description?: string }[],
 *   description?: string, totalFee: number, totalDiscount: number }} payload
 */
export async function createSupply(payload) {
  return apiRequest('/api/supplies', {
    method: 'POST',
    bodyType: 'json',
    body: payload
  });
}

/**
 * Refunds a specific item quantity from a received supply order.
 * @param {string} id supply UUID
 * @param {{ productId: number, quantity: number, description?: string }} params
 */
export async function refundSupplyItem(id, params) {
  return apiRequest(`/api/supplies/${id}/refund`, {
    method: 'POST',
    params
  });
}

/** @param {string} id supply UUID */
export async function cancelSupply(id) {
  return apiRequest(`/api/supplies/${id}/cancel`, { method: 'POST' });
}

/** @param {string} id supply UUID */
export async function getSupply(id) {
  return apiRequest(`/api/supplies/${id}`, { method: 'GET' });
}

/**
 * @param {string} id supply UUID
 * @param {{ invoiceId?: string, description?: string, totalFee?: number, totalDiscount?: number }} payload
 */
export async function updateSupply(id, payload) {
  return apiRequest(`/api/supplies/${id}`, {
    method: 'PATCH',
    bodyType: 'form',
    body: payload
  });
}

/**
 * @param {string} id supply UUID
 * @returns {Promise<Blob>}
 */
export async function exportSupplyPdf(id) {
  return apiRequest(`/api/supplies/${id}/pdf`, { method: 'GET', responseType: 'blob' });
}

/**
 * @param {{ page?: number, size?: number, sortBy?: string, sortDirection?: 'ASC'|'DESC',
 *   minTotalItems?: number, maxTotalItems?: number, minGrandTotal?: number, maxGrandTotal?: number,
 *   minTotalUnpaid?: number, maxTotalUnpaid?: number, minTotalPaid?: number, maxTotalPaid?: number,
 *   status?: 'UNPAID'|'COMPLETE'|'CANCELLED', supplierId?: string, minCreatedAt?: string, maxCreatedAt?: string }} [filters]
 */
export async function getSupplies(filters = {}) {
  return apiRequest('/api/supplies/search', { method: 'GET', params: filters });
}

/**
 * Same filters as {@link getSupplies}, exported as an XLSX file.
 * @param {object} [filters]
 * @returns {Promise<Blob>}
 */
export async function exportSuppliesHistory(filters = {}) {
  return apiRequest('/api/supplies/history/export', {
    method: 'GET',
    params: filters,
    responseType: 'blob'
  });
}
