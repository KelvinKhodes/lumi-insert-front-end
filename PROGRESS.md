# Lumi Insert — Build Progress

Tracks the 2-stage build (API service layer → UI components) across 80
backend endpoints / 13 domains. Update this file whenever a module is
finished so the build can resume cleanly in a new turn/session.

## Stage 0 — Project scaffold ✅
- [x] package.json, vite.config.js, tailwind.config.js, postcss.config.js
- [x] index.html, src/app.css (Apple/macOS/SwiftUI design tokens)
- [x] src/lib/stores/session.js (auth session store)
- [x] src/lib/api/client.js (core fetch wrapper: auth header, json/form/
      multipart body, query strings, 401→refresh→retry, blob export)
- [x] src/lib/api/useAsyncAction.js (loading/error/success helper for every UI call)

## Stage A — API service layer (fetcher functions, one file per domain)
- [x] `api/auth.js` — Authentication (3/3): login, refreshAccessToken, logout
- [x] `api/categories.js` — Categories (6/6): getCategories, createCategory, getCategory, updateCategory, activateCategory, deactivateCategory
- [x] `api/customers.js` — Customers (6/6): getCustomers, createCustomer, getCustomer, updateCustomer, uploadCustomerPictures, searchCustomerNames
- [x] `api/employees.js` — Employees (7/7): getEmployees, createEmployee, getEmployee, updateEmployee, resetEmployeePassword, uploadEmployeeProfile, isUsernameTaken
- [x] `api/memos.js` — Memos (6/6): getMemos, createMemo, getMemo, updateMemo, markMemoAsRead, archiveMemo
- [x] `api/products.js` — Products (10/10): getProducts, createProduct, getProduct, updateProduct, activateProduct, deactivateProduct, getProductStock, getProductsByFilter, searchProductNames, exportProductsStatistics
- [x] `api/stockcards.js` — Stock Cards (4/4): getStockCards, createStockCard, getStockCard, searchStockCards
- [x] `api/suppliers.js` — Suppliers (5/5): getSuppliers, createSupplier, getSupplier, updateSupplier, searchSupplierNames
- [x] `api/supplies.js` — Supplies (8/8): createSupply, refundSupplyItem, cancelSupply, getSupply, updateSupply, exportSupplyPdf, getSupplies, exportSuppliesHistory
- [x] `api/supplyPayments.js` — Supply Payments (5/5): getSupplyPayments, createSupplyPayment, refundSupplyPayment, getSupplyPayment, searchSupplyPayments
- [x] `api/transactions.js` — Transactions (8/8): createTransaction, refreshTransaction, processTransaction, cancelTransaction, getTransaction, exportTransactionPdf, exportTransactionsHistory, getTransactions
- [x] `api/transactionItems.js` — Transaction Items (7/7): addTransactionItem, getTransactionItems, getTransactionItem, deleteTransactionItem, updateTransactionItemQuantity, refundTransactionItem, getTransactionItemByProduct
- [x] `api/transactionPayments.js` — Transaction Payments (5/5): getTransactionPayments, createTransactionPayment, refundTransactionPayment, getTransactionPayment, searchTransactionPayments

**Stage A: COMPLETE — 80/80 endpoints wired.** ✅

## Stage B — UI components
- [x] App shell: macOS-style sidebar + "floating window" layout (`App.svelte`, `AppShell.svelte`, `Sidebar.svelte`) — responsive: fixed sidebar on desktop, slide-over drawer on mobile
- [x] Login screen (`Login.svelte`) — wired to `api/auth.js`
- [x] Dashboard (`Dashboard.svelte`) — low-stock list, recent transactions, recent memos, all wired to live endpoints
- [x] Products (`Products.svelte` + `ProductFormModal.svelte`) — filter by name/category, table (desktop) / cards (mobile), pagination, create/edit modal, activate/deactivate
- [x] Categories (`Categories.svelte` + `CategoryFormModal.svelte`) — grid, pagination, create/edit modal, activate/deactivate
- [x] Customers (`Customers.svelte` + `CustomerFormModal.svelte`) — search by name/status, click-through detail (fetches full CustomerDetailResponse: shippingAddress, isActive, totals), create/edit, picture upload. Note: the API has no endpoint to list previously-uploaded pictures, so the upload panel only confirms success — it can't display existing photos.
- [x] Employees (`Employees.svelte` + `EmployeeFormModal.svelte`) — list with role badge, pagination, create/edit, reset password, upload profile photo, username-availability check on create
- [x] Suppliers (`Suppliers.svelte` + `SupplierFormModal.svelte`) — list with transaction/unpaid stats inline (list endpoint returns full detail), search by name/status, create/edit
- [x] Supplies (`Supplies.svelte` list + `SupplyCreate.svelte` item-builder + `SupplyDetail.svelte`) — filter by status, multi-item builder with running total (submits full `supplyItems[]` as JSON per the API's design), detail view with item refund, payment recording, cancel, export PDF
- [x] Transactions (`Transactions.svelte` list + `TransactionCreate.svelte` + `TransactionDetail.svelte`) — filter by status, create picks a customer then opens an empty cart, detail view is the cart-builder itself: add/update-quantity/delete items one call at a time while PENDING, process/cancel, payments, item refund once COMPLETE, export PDF

## Stage B: COMPLETE — 12/12 screens built.** ✅ Every one of the 80 endpoints is now wired into a UI.
- [x] Stock cards (`StockCards.svelte` + `StockCardFormModal.svelte`) — movement history with type badges, manual adjustment form (defect/repaired/etc.) via `ProductPicker`
- [x] Memos (`Memos.svelte` + `MemoFormModal.svelte`) — list with unread dot + role badge, tap-to-expand + auto mark-as-read, archive, create with optional image attachments and role targeting

All other routes are stubbed with `ComingSoon.svelte` so the shell is fully
navigable/testable while the remaining screens get built one by one.

## Stage B requirement — responsive
- App must be fully responsive across devices (desktop / tablet / mobile).
  Plan: sidebar collapses to a bottom tab bar or slide-over on small screens,
  product/customer grids drop to 1–2 columns, tables become stacked cards
  below `sm`. Apply Tailwind responsive prefixes throughout — this isn't a
  separate pass, bake it into every component as it's built.

## Shared components
- `Modal.svelte` — generic macOS-sheet dialog (backdrop + centered card + esc-to-close), reused by every create/edit form modal from here on.
- `ProductPicker.svelte` — debounced product-name search + dropdown (uses `searchProductNames`). Built for Stock Cards, but this is exactly what the Supplies/Transactions item builders will need next — reuse it there instead of rebuilding.
- `SupplierPicker.svelte` — same pattern as ProductPicker, for `searchSupplierNames`.
- `CustomerPicker.svelte` — same pattern, for `searchCustomerNames`.
- Supplies is the first module with sub-routes (`/supplies`, `/supplies/new`, `/supplies/:id`) since a full item-builder + detail view doesn't fit in a modal. Transactions will follow the same pattern.
- `src/lib/utils.js` → `downloadBlob(blob, filename)` for PDF/XLSX export downloads.

## Key architectural notes (see chat for full detail)
- Transaction flow is incremental: create empty transaction (customerId only)
  → add items one by one via `POST /transactions/{id}/items` → `/process`
  or `/cancel`. UI must be a multi-step cart builder, not a single form.
- Supply flow submits the whole `supplyItems[]` array in one JSON request.
- File uploads (customer pictures, employee profile, memo images, payment
  proofs) use `multipart/form-data` via `bodyType: 'multipart'` in
  `apiRequest`.
- PDF/XLSX exports use `responseType: 'blob'` in `apiRequest`.
