const PERMISSIONS = {
  OWNER:     ['*'],
  WAREHOUSE: ['products.write', 'categories.write', 'suppliers.write', 'supplies.write'],
  CASHIER:   ['transactions.write', 'transaction-payments.write', 'customers.write'],
  FINANCE:   ['supply-payments.write', 'transaction-payments.write', 'customers.write', 'suppliers.write']
};

export const action = Object.freeze({
    ProductsWrite: 'products.write',
    CategoriesWrite: 'categories.write',
    SuppliersWrite: 'suppliers.write',
    SuppliesWrite: 'supplies.write',
    TransactionsWrite: 'transactions.write',
    CustomersWrite: 'customers.write',
    SupplyPaymentsWrite: 'supply-payments.write', 
    TransactionPaymentsWrite: 'transaction-payments.write',
    EmployeesWrite: 'employees.write',
    MemosArchieve: 'memos.archieve' 
})

export function allowed(role, action) {
  console.log(role, action)
  const allowed = PERMISSIONS[role] ?? [];
  return allowed.includes('*') || allowed.includes(action);
}