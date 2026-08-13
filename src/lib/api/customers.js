import { apiRequest } from './client.js';

/**
 * Customers — 6/6 endpoints
 *   GET    /api/customers               → getCustomers
 *   POST   /api/customers               → createCustomer
 *   GET    /api/customers/{id}          → getCustomer
 *   PATCH  /api/customers/{id}          → updateCustomer
 *   POST   /api/customers/{id}/pictures → uploadCustomerPictures
 *   GET    /api/customers/searchName    → searchCustomerNames
 *
 * Note on uploadCustomerPictures: the OpenAPI spec documents `files` as an
 * `in: query` binary array, which isn't actually possible over HTTP (binary
 * data can't ride in a query string) — this is a known artifact of how
 * Spring's `@RequestParam MultipartFile[]` shows up in generated specs. We
 * send it the way the backend controller actually expects it: as
 * `multipart/form-data`.
 */

/**
 * @param {{ page?: number, size?: number, sortBy?: 'createdAt'|'updatedAt'|'totalTransaction'|'totalUnpaid'|'totalPaid'|'name',
 *   sortDirection?: 'ASC'|'DESC', name?: string, email?: string, contact?: string, isActive?: boolean,
 *   minTotalTransaction?: number, maxTotalTransaction?: number, minTotalUnpaid?: number, maxTotalUnpaid?: number,
 *   minTotalPaid?: number, maxTotalPaid?: number }} [filters]
 */
export async function getCustomers(filters = {}) {
  return apiRequest('/api/customers', { method: 'GET', params: filters });
}

/**
 * @param {{ name: string, email?: string, contact: string, shippingAddress: string }} payload
 */
export async function createCustomer(payload) {
  return apiRequest('/api/customers', {
    method: 'POST',
    bodyType: 'form',
    body: payload
  });
}

/** @param {string} id customer UUID */
export async function getCustomer(id) {
  return apiRequest(`/api/customers/${id}`, { method: 'GET' });
}

/**
 * @param {string} id customer UUID
 * @param {{ name?: string, email?: string, contact?: string, shippingAddress?: string,
 *   isActive?: boolean, latitude?: number, longitude?: number }} payload
 */
export async function updateCustomer(id, payload) {
  return apiRequest(`/api/customers/${id}`, {
    method: 'PATCH',
    bodyType: 'form',
    body: payload
  });
}

/**
 * @param {string} id customer UUID
 * @param {File[]} files
 * @returns {Promise<boolean>}
 */
export async function uploadCustomerPictures(id, files) {
  return apiRequest(`/api/customers/${id}/pictures`, {
    method: 'POST',
    bodyType: 'multipart',
    body: { files }
  });
}

/**
 * @param {{ name: string, page?: number, size?: number, sortBy?: string, sortDirection?: 'ASC'|'DESC', lastId?: string }} params
 * @returns {Promise<{content: {id:string, name:string}[], first: boolean, last: boolean, empty: boolean, lastId: string|null}>}
 */
export async function searchCustomerNames(params) {
  return apiRequest('/api/customers/searchName', { method: 'GET', params });
}
