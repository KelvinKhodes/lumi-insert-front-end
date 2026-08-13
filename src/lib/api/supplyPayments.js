import { apiRequest } from './client.js';

/**
 * Supply Payments — 5/5 endpoints
 *   GET  /api/supplies/{supplyId}/payments         → getSupplyPayments
 *   POST /api/supplies/{supplyId}/payments         → createSupplyPayment
 *   POST /api/supplies/{supplyId}/payments/refund  → refundSupplyPayment
 *   GET  /api/supplies/{supplyId}/payments/{id}    → getSupplyPayment
 *   GET  /api/supplies/{supplyId}/payments/search  → searchSupplyPayments
 */

/**
 * @param {string} supplyId
 * @param {{ page?: number, size?: number, sortBy?: string, sortDirection?: 'ASC'|'DESC' }} [filters]
 */
export async function getSupplyPayments(supplyId, filters = {}) {
  return apiRequest(`/api/supplies/${supplyId}/payments`, { method: 'GET', params: filters });
}

/**
 * @param {string} supplyId
 * @param {{ paymentFrom: string, paymentTo: string, totalPayment: number, files: File[] }} payload
 *   Proof-of-payment images/documents.
 */
export async function createSupplyPayment(supplyId, payload) {
  return apiRequest(`/api/supplies/${supplyId}/payments`, {
    method: 'POST',
    bodyType: 'multipart',
    body: payload
  });
}

/**
 * @param {string} supplyId
 * @param {{ paymentFrom: string, paymentTo: string, totalPayment: number, files: File[] }} payload
 */
export async function refundSupplyPayment(supplyId, payload) {
  return apiRequest(`/api/supplies/${supplyId}/payments/refund`, {
    method: 'POST',
    bodyType: 'multipart',
    body: payload
  });
}

/**
 * @param {string} supplyId
 * @param {string} id payment UUID
 */
export async function getSupplyPayment(supplyId, id) {
  return apiRequest(`/api/supplies/${supplyId}/payments/${id}`, { method: 'GET' });
}

/**
 * @param {string} supplyId
 * @param {{ page?: number, size?: number, sortBy?: 'createdAt'|'updatedAt'|'totalPayment', sortDirection?: 'ASC'|'DESC',
 *   minTotalPayment?: number, maxTotalPayment?: number, minCreatedAt?: string, maxCreatedAt?: string }} [filters]
 */
export async function searchSupplyPayments(supplyId, filters = {}) {
  return apiRequest(`/api/supplies/${supplyId}/payments/search`, { method: 'GET', params: filters });
}
