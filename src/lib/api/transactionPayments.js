import { apiRequest } from './client.js';

/**
 * Transaction Payments — 5/5 endpoints
 *   GET  /api/transactions/{transactionId}/payments         → getTransactionPayments
 *   POST /api/transactions/{transactionId}/payments         → createTransactionPayment
 *   POST /api/transactions/{transactionId}/payments/refund  → refundTransactionPayment
 *   GET  /api/transactions/{transactionId}/payments/{id}    → getTransactionPayment
 *   GET  /api/transactions/{transactionId}/payments/filter  → searchTransactionPayments
 */

/**
 * @param {string} transactionId
 * @param {{ page?: number, size?: number, sortBy?: string, sortDirection?: 'ASC'|'DESC' }} [filters]
 */
export async function getTransactionPayments(transactionId, filters = {}) {
  return apiRequest(`/api/transactions/${transactionId}/payments`, { method: 'GET', params: filters });
}

/**
 * @param {string} transactionId
 * @param {{ paymentFrom: string, paymentTo: string, totalPayment: number, files: File[] }} payload
 */
export async function createTransactionPayment(transactionId, payload) {
  return apiRequest(`/api/transactions/${transactionId}/payments`, {
    method: 'POST',
    bodyType: 'multipart',
    body: payload
  });
}

/**
 * @param {string} transactionId
 * @param {{ paymentFrom: string, paymentTo: string, totalPayment: number, files: File[] }} payload
 */
export async function refundTransactionPayment(transactionId, payload) {
  return apiRequest(`/api/transactions/${transactionId}/payments/refund`, {
    method: 'POST',
    bodyType: 'multipart',
    body: payload
  });
}

/**
 * @param {string} transactionId
 * @param {string} id payment UUID
 */
export async function getTransactionPayment(transactionId, id) {
  return apiRequest(`/api/transactions/${transactionId}/payments/${id}`, { method: 'GET' });
}

/**
 * @param {string} transactionId
 * @param {{ page?: number, size?: number, sortBy?: 'createdAt'|'updatedAt'|'totalPayment', sortDirection?: 'ASC'|'DESC',
 *   minTotalPayment?: number, maxTotalPayment?: number, minCreatedAt?: string, maxCreatedAt?: string }} [filters]
 */
export async function searchTransactionPayments(transactionId, filters = {}) {
  return apiRequest(`/api/transactions/${transactionId}/payments/filter`, { method: 'GET', params: filters });
}

/** 
 * @param {{ page?: number, size?: number, sortBy?: 'createdAt'|'updatedAt'|'totalPayment', sortDirection?: 'ASC'|'DESC',
 *   minTotalPayment?: number, maxTotalPayment?: number, minCreatedAt?: string, maxCreatedAt?: string }} [filters]
 */
export async function searchGlobalTransactionsPayments(filters = {}) {
  return apiRequest(`/api/transactions/payments/filter`, { method: 'GET', params: filters });
}
