import { apiRequest } from './client.js';

/**
 * Transaction Items — 7/7 endpoints
 *   POST   /api/transactions/{id}/items                              → addTransactionItem
 *   GET    /api/transactions/{transactionId}/items                   → getTransactionItems
 *   GET    /api/transactions/{transactionId}/items/{id}               → getTransactionItem
 *   DELETE /api/transactions/{transactionId}/items/{id}               → deleteTransactionItem
 *   POST   /api/transactions/{transactionId}/items/{id}/quantity      → updateTransactionItemQuantity
 *   POST   /api/transactions/{transactionId}/items/{id}/refund        → refundTransactionItem
 *   GET    /api/transactions/{transactionId}/items/product/{productId} → getTransactionItemByProduct
 *
 * These are the building blocks of the Transactions cart-builder flow: a
 * transaction starts empty (see transactions.js → createTransaction) and
 * items are added one call at a time via addTransactionItem.
 */

/**
 * Adds one product line to a (still-open) transaction.
 * @param {string} transactionId
 * @param {{ productId: number, quantity: number }} payload
 */
export async function addTransactionItem(transactionId, payload) {
  return apiRequest(`/api/transactions/${transactionId}/items`, {
    method: 'POST',
    bodyType: 'form',
    body: payload
  });
}

/**
 * @param {string} transactionId
 * @param {{ page?: number, size?: number, sortBy?: string, sortDirection?: 'ASC'|'DESC' }} [filters]
 */
export async function getTransactionItems(transactionId, filters = {}) {
  return apiRequest(`/api/transactions/${transactionId}/items`, { method: 'GET', params: filters });
}

/**
 * @param {string} transactionId
 * @param {string} id transaction item UUID
 */
export async function getTransactionItem(transactionId, id) {
  return apiRequest(`/api/transactions/${transactionId}/items/${id}`, { method: 'GET' });
}

/**
 * @param {string} transactionId
 * @param {string} id transaction item UUID
 * @returns {Promise<{id:string, transactionId:string, productId:number, deleted:boolean, updatedAt:string}>}
 */
export async function deleteTransactionItem(transactionId, id) {
  return apiRequest(`/api/transactions/${transactionId}/items/${id}`, { method: 'DELETE' });
}

/**
 * @param {string} transactionId
 * @param {string} id transaction item UUID
 * @param {number} quantity new quantity
 */
export async function updateTransactionItemQuantity(transactionId, id, quantity) {
  return apiRequest(`/api/transactions/${transactionId}/items/${id}/quantity`, {
    method: 'POST',
    bodyType: 'form',
    body: { quantity }
  });
}

/**
 * @param {string} transactionId
 * @param {string} id transaction item UUID
 * @param {{ productId: number, quantity: number, description?: string }} payload
 */
export async function refundTransactionItem(transactionId, id, payload) {
  return apiRequest(`/api/transactions/${transactionId}/items/${id}/refund`, {
    method: 'POST',
    bodyType: 'form',
    body: payload
  });
}

/**
 * @param {string} transactionId
 * @param {number|string} productId
 */
export async function getTransactionItemByProduct(transactionId, productId) {
  return apiRequest(`/api/transactions/${transactionId}/items/product/${productId}`, { method: 'GET' });
}
