import { apiRequest } from './client.js';

/**
 * Activity Logs — 2/2 endpoints
 *   GET /api/activitylogs/{id}    → getActivityLog
 *   GET /api/activitylogs/filter   → getActivityLogsByFilter
 */

/**
 * Retrieves a single activity log by its ID.
 * @param {number|string} id
 * @returns {Promise<{ id: string, entityName?: string, entityId?: string|number, action?: string, createdBy?: string, createdAt?: string, ipAddress?: string, details?: Record<string, unknown> }>} 
 */
export async function getActivityLog(id) {
  return apiRequest(`/api/activitylogs/${id}`, { method: 'GET' });
}

/**
 * Retrieves a paginated list of activity logs using server-side filtering.
 * @param {{
 *   page?: number,
 *   size?: number,
 *   sortBy?: string,
 *   sortDirection?: 'ASC'|'DESC',
 *   entityName?: string,
 *   entityId?: string|number,
 *   action?: 'LOGIN_SUCCESS'|'LOGIN_FAILURE'|'LOGOUT'|'PRODUCT_CREATED'|'PRODUCT_UPDATED'|'PRODUCT_DELETED'|'STOCK_ADJUSTMENT'|'CATEGORY_CREATED'|'CATEGORY_UPDATED'|'CATEGORY_DELETED'|'CUSTOMER_REGISTERED'|'CUSTOMER_UPDATED'|'CUSTOMER_DELETED'|'SUPPLIER_REGISTERED'|'SUPPLIER_UPDATED'|'SUPPLIER_DELETED'|'EMPLOYEE_REGISTERED'|'EMPLOYEE_UPDATED'|'EMPLOYEE_DELETED'|'SUPPLY_ORDER_PLACED'|'SUPPLY_ORDER_CANCELLED'|'SUPPLY_ORDER_UPDATED'|'SUPPLY_ITEM_REFUNDED'|'SUPPLY_PAYMENT_SETTLED'|'SUPPLY_REFUND_RECEIVED'|'TRANSACTION_CART_CREATED'|'TRANSACTION_ITEM_CARTED'|'TRANSACTION_ITEM_DELETED'|'TRANSACTION_ITEM_UPDATED'|'TRANSACTION_ORDER_PLACED'|'TRANSACTION_PAYMENT_RECEIVED'|'TRANSACTION_ORDER_COMPLETED'|'TRANSACTION_ORDER_CANCELLED'|'TRANSACTION_REFUND_SETTLED'|'MEMO_CREATED'|'MEMO_UPDATED'|'MEMO_DELETED'|'MEMO_READ'|'EXPORT_DATA',
 *   createdBy?: string,
 *   minCreatedAt?: string,
 *   maxCreatedAt?: string,
 *   ipAddress?: string
 * }} [filters]
 * @returns {Promise<{ content: Array<object>, number: number, size: number, first: boolean, last: boolean, empty: boolean, numberOfElements: number, pageable?: object, sort?: object }>} 
 */
export async function getActivityLogsByFilter(filters = {}) {
  return apiRequest('/api/activitylogs/filter', { method: 'GET', params: filters });
}
