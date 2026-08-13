import { apiRequest } from './client.js';

/**
 * Employees — 7/7 endpoints
 *   GET    /api/employees            → getEmployees
 *   POST   /api/employees            → createEmployee
 *   GET    /api/employees/{id}       → getEmployee
 *   PATCH  /api/employees/{id}       → updateEmployee
 *   POST   /api/employees/{id}/reset → resetEmployeePassword
 *   POST   /api/employees/{id}/profile → uploadEmployeeProfile
 *   GET    /api/employees/exists     → isUsernameTaken
 */

/**
 * @param {{ page?: number, size?: number, sortBy?: string, sortDirection?: 'ASC'|'DESC' }} [filters]
 */
export async function getEmployees(filters = {}) {
  return apiRequest('/api/employees', { method: 'GET', params: filters });
}

/**
 * @param {{ username: string, fullname: string, password: string, joinDate: string }} payload
 *   username: 5-30 alphanumeric chars. password: min 5 chars incl. 1 special char.
 *   joinDate: ISO date-time string, e.g. "2024-12-31T23:59:59".
 */
export async function createEmployee(payload) {
  return apiRequest('/api/employees', {
    method: 'POST',
    bodyType: 'form',
    body: payload
  });
}

/** @param {string} id employee UUID */
export async function getEmployee(id) {
  return apiRequest(`/api/employees/${id}`, { method: 'GET' });
}

/**
 * @param {string} id employee UUID
 * @param {{ username?: string, fullname?: string, isActive?: boolean, role?: 'FINANCE'|'CASHIER'|'WAREHOUSE' }} payload
 */
export async function updateEmployee(id, payload) {
  return apiRequest(`/api/employees/${id}`, {
    method: 'PATCH',
    bodyType: 'form',
    body: payload
  });
}

/**
 * @param {string} id employee UUID
 * @param {string} password new password (min 5 chars incl. 1 special char)
 */
export async function resetEmployeePassword(id, password) {
  return apiRequest(`/api/employees/${id}/reset`, {
    method: 'POST',
    bodyType: 'form',
    body: { password }
  });
}

/**
 * @param {string} id employee UUID
 * @param {File} file profile photo
 * @returns {Promise<boolean>}
 */
export async function uploadEmployeeProfile(id, file) {
  return apiRequest(`/api/employees/${id}/profile`, {
    method: 'POST',
    bodyType: 'multipart',
    body: { files: file }
  });
}

/**
 * @param {string} username
 * @returns {Promise<boolean>} true if the username is already taken
 */
export async function isUsernameTaken(username) {
  return apiRequest('/api/employees/exists', { method: 'GET', params: { username } });
}
