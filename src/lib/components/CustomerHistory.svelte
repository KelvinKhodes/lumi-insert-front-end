<script> 

  import { onMount } from 'svelte';
  import { 
    LoaderCircle,
    TriangleAlert, 
    ChevronLeft,
    ChevronRight,
    Funnel,
    FileDown

  } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js'; 
  import { useAsyncAction } from '../api/useAsyncAction.js'; 
  import { getTransactions, exportTransactionsHistory } from '../api/transactions.js';
  import TransactionFilterModal from './TransactionFilterModal.svelte';
  import { navigate } from 'svelte-routing';
  import { downloadBlob } from '../utils.js';

  pageTitle.set('transactions');

  const transactions = useAsyncAction(getTransactions);
  const exportHistory = useAsyncAction(exportTransactionsHistory);
  let {
    customerId = null
  } = $props();

  const size = 10; 
  let filters = $state({
    page: 0,
    status: '',
    minCreatedAt: '',
    maxCreatedAt: '',
    minTotalItems: '',
    maxTotalItems: '',
    minGrandTotal: '',
    maxGrandTotal: '',
    minTotalUnpaid: '',
    maxTotalUnpaid: '',
    minTotalPaid: '',
    maxTotalPaid: ''
  });
  let showFilters = $state(false);
   
  const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  function normalizeDateTime(value) {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 19);
  }

  function numberOrUndefined(value) {
    return value === '' || value == null ? undefined : Number(value);
  }

  function load() {
    transactions.run({
      page: filters.page,
      size,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      customerId: customerId || undefined,
      status: filters.status || undefined,
      minCreatedAt: normalizeDateTime(filters.minCreatedAt),
      maxCreatedAt: normalizeDateTime(filters.maxCreatedAt),
      minTotalItems: numberOrUndefined(filters.minTotalItems),
      maxTotalItems: numberOrUndefined(filters.maxTotalItems),
      minGrandTotal: numberOrUndefined(filters.minGrandTotal),
      maxGrandTotal: numberOrUndefined(filters.maxGrandTotal),
      minTotalUnpaid: numberOrUndefined(filters.minTotalUnpaid),
      maxTotalUnpaid: numberOrUndefined(filters.maxTotalUnpaid),
      minTotalPaid: numberOrUndefined(filters.minTotalPaid),
      maxTotalPaid: numberOrUndefined(filters.maxTotalPaid)
    });

  }
 
  function goToPage(delta) {
    filters.page = Math.max(0, filters.page + delta);
    load();
  }

  function applyFilters() {
    filters.page = 0;
    load();
    showFilters = false;
  }

  function resetFilters() {
    filters = { page: 0, status: '', minCreatedAt: '', maxCreatedAt: '', minTotalItems: '', maxTotalItems: '', minGrandTotal: '', maxGrandTotal: '', minTotalUnpaid: '', maxTotalUnpaid: '', minTotalPaid: '', maxTotalPaid: '' };
    load();
    showFilters = false;
  }

  async function exportXLSX() {
    const blob = await exportHistory.run({
      size,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      customerId: customerId || undefined,
      status: filters.status || undefined,
      minCreatedAt: normalizeDateTime(filters.minCreatedAt),
      maxCreatedAt: normalizeDateTime(filters.maxCreatedAt),
      minTotalItems: numberOrUndefined(filters.minTotalItems),
      maxTotalItems: numberOrUndefined(filters.maxTotalItems),
      minGrandTotal: numberOrUndefined(filters.minGrandTotal),
      maxGrandTotal: numberOrUndefined(filters.maxGrandTotal),
      minTotalUnpaid: numberOrUndefined(filters.minTotalUnpaid),
      maxTotalUnpaid: numberOrUndefined(filters.maxTotalUnpaid),
      minTotalPaid: numberOrUndefined(filters.minTotalPaid),
      maxTotalPaid: numberOrUndefined(filters.maxTotalPaid)
    });
    downloadBlob(blob, `customer-transactions-${new Date().toISOString()}.xlsx`);
  }
  
  onMount(() => { 
    load();
  });

</script>



<TransactionFilterModal
  open={showFilters}
  {filters}
  title="Filter customer transactions"
  onClose={() => (showFilters = false)}
  onApply={applyFilters}
  onReset={resetFilters}
/>

{#if $transactions.loading}
    <div class="flex rounded-tl-none justify-center py-16"><LoaderCircle size={22} class="animate-spin text-ink-tertiary" /></div>
  {:else if $transactions.error}
    <div class="flex items-center rounded-tl-none gap-2 rounded-control bg-danger-soft px-4 py-3 text-[13px] text-danger">
      <TriangleAlert size={15} />{$transactions.error.message}
    </div>
  {:else if !$transactions.data?.content?.length}
    <div class="sf-card rounded-tl-none flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p class="text-[13.5px] text-ink-secondary">No transactions found.</p>
    </div>
  {:else}
    <!-- desktop table -->
    <div class="sf-card rounded-tl-none overflow-hidden overflow-x-auto md:block">
      <table class="w-full text-left text-[13px]">
        <thead>
          <tr class="border-b border-hairline text-[11.5px] uppercase tracking-wide text-ink-secondary">
            <th class="px-4 py-2.5 font-medium">Invoice ID</th>
            <th class="px-4 py-2.5 font-medium">Total Items</th>
            <th class="px-4 py-2.5 font-medium">Fee</th>
            <th class="px-4 py-2.5 font-medium">Discount</th>
            <th class="px-4 py-2.5 font-medium">Subtotal</th>
            <th class="px-4 py-2.5 font-medium">Grandtotal</th>

            <th class="px-4 py-2.5 font-medium">Status</th>
            <th class="px-4 py-2.5">
              <button type="button" aria-label="Export customer transactions as XLSX" class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05]" onclick={exportXLSX} disabled={$exportHistory.loading}>
                <FileDown size={14} aria-hidden="true" />
              </button>
              <button type="button" aria-label="Toggle transaction filters" class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05]" onclick={() => (showFilters = !showFilters)}>
                  <Funnel size={14} aria-hidden="true" />
                </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {#each $transactions.data.content as transaction (transaction.id)}  
            <tr role="button" onclick={() => navigate('/transactions/' + transaction.id)} class="border-b border-hairline last:border-0 hover:bg-black/[0.015]" >
              <td class="px-4 py-2.5 font-medium text-ink">{transaction.invoiceId}</td>
              <td class="px-4 py-2.5 font-medium text-ink">{transaction.totalItems}</td>
              <td class="px-4 py-2.5 font-medium text-ink">{currency.format(transaction.totalFee)}</td>
              <td class="px-4 py-2.5 font-medium text-ink">{currency.format(transaction.totalDiscount)}</td>
              <td class="px-4 py-2.5 font-medium text-ink">{currency.format(transaction.subTotal)}</td>
              <td class="px-4 py-2.5 font-medium text-ink">{currency.format(transaction.grandTotal)}</td>
              <td class="px-4 py-2.5 font-medium text-ink">{transaction.status}</td>
            </tr> 
          {/each}
        </tbody>
      </table>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <span class="text-[12px] text-ink-secondary">Page {filters.page + 1}</span>
      <div class="flex gap-2">
        <button class="sf-btn-secondary !px-2.5" onclick={() => goToPage(-1)} disabled={$transactions.data.first}>
          <ChevronLeft size={14} />
        </button>
        <button class="sf-btn-secondary !px-2.5" onclick={() => goToPage(1)} disabled={$transactions.data.last}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  {/if}