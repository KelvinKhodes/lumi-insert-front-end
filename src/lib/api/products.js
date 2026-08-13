import { apiRequest } from './client.js';

/**
 * Products — 10/10 endpoints
 *   GET  /api/products                    → getProducts
 *   POST /api/products                    → createProduct
 *   GET  /api/products/{id}               → getProduct
 *   PUT  /api/products/{id}               → updateProduct
 *   POST /api/products/{id}/activate      → activateProduct
 *   POST /api/products/{id}/deactivate    → deactivateProduct
 *   GET  /api/products/{id}/stocks        → getProductStock
 *   GET  /api/products/filter             → getProductsByFilter
 *   GET  /api/products/searchName         → searchProductNames
 *   GET  /api/products/statistics/export  → exportProductsStatistics
 */

/**
 * @param {{ page?: number, size?: number, sortBy?: string, sortDirection?: 'ASC'|'DESC' }} [filters]
 */
export async function getProducts(filters = {}) {
  return apiRequest('/api/products', { method: 'GET', params: filters });
}

/**
 * @param {{ name: string, basePrice: number, sellPrice: number, stockQuantity: number,
 *   stockMinimum?: number, categoryId?: number }} payload
 */
export async function createProduct(payload) {
  return apiRequest('/api/products', {
    method: 'POST',
    bodyType: 'form',
    body: payload
  });
}

/** @param {number|string} id */
export async function getProduct(id) {
  return apiRequest(`/api/products/${id}`, { method: 'GET' });
}

/**
 * @param {number|string} id
 * @param {{ name?: string, basePrice?: number, sellPrice?: number, stockMinimum?: number, categoryId?: number }} payload
 */
export async function updateProduct(id, payload) {
  return apiRequest(`/api/products/${id}`, {
    method: 'PUT',
    bodyType: 'form',
    body: { id, ...payload }
  });
}

/** @param {number|string} id */
export async function activateProduct(id) {
  return apiRequest(`/api/products/${id}/activate`, { method: 'POST' });
}

/** @param {number|string} id */
export async function deactivateProduct(id) {
  return apiRequest(`/api/products/${id}/deactivate`, { method: 'POST' });
}

/**
 * @param {number|string} id
 * @returns {Promise<{id:string, stockQuantity:number}>}
 */
export async function getProductStock(id) {
  return apiRequest(`/api/products/${id}/stocks`, { method: 'GET' });
}

/**
 * @param {{ page?: number, size?: number, sortBy?: 'createdAt'|'updatedAt'|'sellPrice'|'basePrice'|'stockQuantity',
 *   sortDirection?: 'ASC'|'DESC', name?: string, minPrice?: number, maxPrice?: number, categoryId?: number }} [filters]
 */
export async function getProductsByFilter(filters = {}) {
  return apiRequest('/api/products/filter', { method: 'GET', params: filters });
}

/**
 * @param {{ name: string, page?: number, size?: number, sortBy?: string, sortDirection?: 'ASC'|'DESC', lastId?: number }} params
 * @returns {Promise<{content: {id:number, name:string}[], first: boolean, last: boolean, empty: boolean, lastId: number|null}>}
 */
export async function searchProductNames(params) {
  return apiRequest('/api/products/searchName', { method: 'GET', params });
}

/**
 * Exports product statistics as a PDF or XLSX file.
 * @param {{ startDate: string, endDate: string, type: 'pdf'|'xlsx' }} params ISO date-time strings.
 * @returns {Promise<Blob>}
 */
export async function exportProductsStatistics(params) {
  return apiRequest('/api/products/statistics/export', {
    method: 'GET',
    params,
    responseType: 'blob'
  });
}
