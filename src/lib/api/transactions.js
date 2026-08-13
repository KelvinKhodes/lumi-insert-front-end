import { apiRequest } from './client.js';

/**
 * Transactions — 8/8 endpoints
 *   POST /api/transactions                → createTransaction
 *   POST /api/transactions/{id}/refresh   → refreshTransaction
 *   POST /api/transactions/{id}/process   → processTransaction
 *   POST /api/transactions/{id}/cancel    → cancelTransaction
 *   GET  /api/transactions/{id}           → getTransaction
 *   GET  /api/transactions/{id}/pdf       → exportTransactionPdf
 *   GET  /api/transactions/history/export → exportTransactionsHistory
 *   GET  /api/transactions/filter         → getTransactions
 *
 * Cart-builder flow: createTransaction only takes a customerId and returns
 * an empty transaction "shell". Add line items one at a time with
 * transactionItems.js → addTransactionItem, then call processTransaction to
 * finalize it (or cancelTransaction to abandon it).
 */

/**
 * Starts a new (empty) transaction for a customer.
 * @param {string} customerId
 */
export async function createTransaction(customerId) {
  return apiRequest('/api/transactions', {
    method: 'POST',
    bodyType: 'form',
    body: { customerId }
  });
}

/** Recomputes totals for a transaction (e.g. after items changed). @param {string} id */
export async function refreshTransaction(id) {
  return apiRequest(`/api/transactions/${id}/refresh`, { method: 'POST' });
}

/** Finalizes a transaction, moving it out of the cart-builder stage. @param {string} id */
export async function processTransaction(id) {
  return apiRequest(`/api/transactions/${id}/process`, { method: 'POST' });
}

/** @param {string} id */
export async function cancelTransaction(id) {
  return apiRequest(`/api/transactions/${id}/cancel`, { method: 'POST' });
}

/** @param {string} id */
export async function getTransaction(id) {
  return apiRequest(`/api/transactions/${id}`, { method: 'GET' });
}

/**
 * @param {string} id
 * @returns {Promise<Blob>}
 */
export async function exportTransactionPdf(id) {
  return apiRequest(`/api/transactions/${id}/pdf`, { method: 'GET', responseType: 'blob' });
}

/**
 * @param {{ page?: number, size?: number, sortBy?: string, sortDirection?: 'ASC'|'DESC',
 *   minTotalItems?: number, maxTotalItems?: number, minGrandTotal?: number, maxGrandTotal?: number,
 *   minTotalUnpaid?: number, maxTotalUnpaid?: number, minTotalPaid?: number, maxTotalPaid?: number,
 *   status?: 'PENDING'|'PROCESS'|'COMPLETE'|'CANCELLED', customerId?: string,
 *   minCreatedAt?: string, maxCreatedAt?: string }} [filters]
 * @returns {Promise<Blob>}
 */
export async function exportTransactionsHistory(filters = {}) {
  return apiRequest('/api/transactions/history/export', {
    method: 'GET',
    params: filters,
    responseType: 'blob'
  });
}

/**
 * Same filter shape as {@link exportTransactionsHistory}, returned as a page of results.
 * @param {object} [filters]
 */
export async function getTransactions(filters = {}) {
  return apiRequest('/api/transactions/filter', { method: 'GET', params: filters });
}
