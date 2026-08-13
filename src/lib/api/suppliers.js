import { apiRequest } from './client.js';

/**
 * Suppliers — 5/5 endpoints
 *   GET   /api/suppliers             → getSuppliers
 *   POST  /api/suppliers             → createSupplier
 *   GET   /api/suppliers/{id}        → getSupplier
 *   PATCH /api/suppliers/{id}        → updateSupplier
 *   GET   /api/suppliers/searchName  → searchSupplierNames
 */

/**
 * @param {{ page?: number, size?: number, sortBy?: 'createdAt'|'updatedAt'|'totalTransaction'|'totalUnpaid'|'totalPaid'|'name',
 *   sortDirection?: 'ASC'|'DESC', name?: string, email?: string, contact?: string, isActive?: boolean,
 *   minTotalTransaction?: number, maxTotalTransaction?: number, minTotalUnpaid?: number, maxTotalUnpaid?: number,
 *   minTotalPaid?: number, maxTotalPaid?: number }} [filters]
 */
export async function getSuppliers(filters = {}) {
  return apiRequest('/api/suppliers', { method: 'GET', params: filters });
}

/**
 * @param {{ name: string, email?: string, contact: string }} payload
 */
export async function createSupplier(payload) {
  return apiRequest('/api/suppliers', {
    method: 'POST',
    bodyType: 'form',
    body: payload
  });
}

/** @param {string} id supplier UUID */
export async function getSupplier(id) {
  return apiRequest(`/api/suppliers/${id}`, { method: 'GET' });
}

/**
 * @param {string} id supplier UUID
 * @param {{ name?: string, email?: string, contact?: string, isActive?: boolean }} payload
 */
export async function updateSupplier(id, payload) {
  return apiRequest(`/api/suppliers/${id}`, {
    method: 'PATCH',
    bodyType: 'form',
    body: payload
  });
}

/**
 * @param {{ name: string, page?: number, size?: number, sortBy?: string, sortDirection?: 'ASC'|'DESC', lastId?: string }} params
 * @returns {Promise<{content: {id:string, name:string}[], first: boolean, last: boolean, empty: boolean, lastId: string|null}>}
 */
export async function searchSupplierNames(params) {
  return apiRequest('/api/suppliers/searchName', { method: 'GET', params });
}
