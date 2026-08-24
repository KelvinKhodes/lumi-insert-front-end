import { apiRequest } from './client.js';

/**
 * Categories — 6/6 endpoints
 *   GET    /api/categories                  → getCategories
 *   POST   /api/categories                  → createCategory
 *   GET    /api/categories/{id}             → getCategory
 *   PUT    /api/categories/{id}             → updateCategory
 *   POST   /api/categories/{id}/activate    → activateCategory
 *   POST   /api/categories/{id}/deactivate  → deactivateCategory
 */

/**
 * @param {{ isArchieved?: boolean, page?: number, size?: number, sortBy?: string, sortDirection?: 'ASC'|'DESC' }} [filters]
 * @returns {Promise<{content: object[], number: number, size: number, first: boolean, last: boolean, empty: boolean, numberOfElements: number}>}
 */
export async function getCategories(filters = {}) {
  return apiRequest('/api/categories', { method: 'GET', params: filters });
}

/**
 * @param {{ name: string }} payload
 * @returns {Promise<{id:string, name:string, totalItems:number, isActive:boolean, createdAt:string, updatedAt:string}>}
 */
export async function createCategory({ name }) {
  return apiRequest('/api/categories', {
    method: 'POST',
    bodyType: 'form',
    body: { name }
  });
}

/**
 * @param {number|string} id
 */
export async function getCategory(id) {
  return apiRequest(`/api/categories/${id}`, { method: 'GET' });
}

/**
 * @param {number|string} id
 * @param {{ name: string }} payload
 */
export async function updateCategory(id, { name }) {
  return apiRequest(`/api/categories/${id}`, {
    method: 'PUT',
    bodyType: 'form',
    body: { id, name }
  });
}

/** @param {number|string} id */
export async function activateCategory(id) {
  return apiRequest(`/api/categories/${id}/activate`, { method: 'POST' });
}

/** @param {number|string} id */
export async function deactivateCategory(id) {
  return apiRequest(`/api/categories/${id}/deactivate`, { method: 'POST' });
}
